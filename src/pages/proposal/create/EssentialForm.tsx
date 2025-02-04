import Button from '@/components/Button';
import Header from '@/components/Header';
import Paragraph from '@/components/Paragraph';
import { getTxExplorerUrl } from '@/helpers/string';
import { useAddProposal } from '@/hooks/useProposals';
import useToast from '@/hooks/useToast';
import { useNetworkStore } from '@/store/network';
import { ProposalTypes } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormHelperText, InputLabel, Stack, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import React, { ReactNode, useEffect, useMemo } from 'react';
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import FormContainer from './FormContainer';
import FormSection from './FormSection';
import CaminoDatePicker from '@/components/DatePicker';
import { usePendingMultisigAddProposalTxs } from '@/hooks/useMultisig';
import useWallet from '@/hooks/useWallet';

const MINUTES_IN_FUTURE = 15;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_IN_60_DAYS = 60 * MS_PER_DAY;
const MAX_FUTURE_HOURS = 336;

export const essentialSchema = (isAdminProposal: boolean) =>
  z.object({
    startDate: z
      .custom<DateTime>()
      .refine(
        (d: DateTime) => d.isValid && d.diffNow(['days', 'hours']).days >= 0,
        'invalid start date'
      )
      .refine((d: DateTime) => {
        const diffHours = d.diffNow().as('hours');
        return diffHours <= MAX_FUTURE_HOURS;
      }, 'start date cannot be more than 14 days in the future'),
    endDate: z.custom<DateTime>().refine((d: DateTime) => {
      if (isAdminProposal) return true;
      else return d.isValid && d.diffNow(['days']).days > 0;
    }, 'invalid end date'),
    forumLink: z.preprocess(url => {
      if (!url || typeof url !== 'string') return undefined;
      return url === '' ? undefined : url;
    }, z.string().url().optional()),
  });

interface EssentialFormProps {
  proposalType: number | string;
  children?: ReactNode;
  formSchema?: {
    schema: z.ZodRawShape;
    refine?: (fields: { [x: string]: any }) => void;
    error?: { path: string[]; message: string };
    endDateRestriction?: { minDays: number; maxDays: number; fixed: any };
  };
  onCancel?: () => void;
}

const EssentialForm = ({
  proposalType,
  children,
  formSchema = { schema: {} },
  onCancel,
}: EssentialFormProps) => {
  const isAdminProposal = useMemo(() => {
    const proposalIds = Object.values(ProposalTypes);
    return (
      proposalIds.indexOf(ProposalTypes.AdminNewMember) === proposalType ||
      proposalIds.indexOf(ProposalTypes.AdminExcludeMember) === proposalType
    );
  }, [proposalType]);

  const endDateRestriction = useMemo(() => {
    const proposalIds = Object.values(ProposalTypes);
    // Default restriction if no specific case matches

    const defaultRestriction = {
      minDays: formSchema.endDateRestriction?.minDays ?? 1,
      maxDays: formSchema.endDateRestriction?.maxDays ?? 30,
      fixed: formSchema.endDateRestriction?.fixed ?? false,
    };

    if (
      proposalIds.indexOf(ProposalTypes.NewMember) === proposalType ||
      proposalIds.indexOf(ProposalTypes.AdminNewMember) === proposalType
    ) {
      return {
        minDays: 60,
        maxDays: 60,
        fixed: true,
      };
    } else if (
      proposalIds.indexOf(ProposalTypes.ExcludeMember) === proposalType ||
      proposalIds.indexOf(ProposalTypes.AdminExcludeMember) === proposalType
    ) {
      return {
        minDays: 7,
        maxDays: 30,
        fixed: false,
      };
    } else if (proposalIds.indexOf(ProposalTypes.General) === proposalType) {
      return {
        minDays: 1,
        maxDays: 30,
        fixed: false,
      };
    }
    return defaultRestriction;
  }, [proposalType, formSchema.endDateRestriction]);

  const calculateEndDate = (startDate: DateTime): DateTime => {
    if (!startDate.isValid) return startDate;
    const proposalIds = Object.values(ProposalTypes);
    const utcStart = startDate.toUTC().startOf('minute');
    if (
      isAdminProposal ||
      proposalIds.indexOf(ProposalTypes.NewMember) === proposalType
    ) {
      const endMillis = utcStart.toMillis() + 60 * 24 * 60 * 60 * 1000;
      return DateTime.fromMillis(endMillis).toLocal();
    }

    return startDate.plus({ days: endDateRestriction.minDays });
  };

  const essentialRefinement = (fields: { [x: string]: any }) => {
    if (!fields.startDate?.isValid || !fields.endDate?.isValid) return false;

    const startMs = fields.startDate.startOf('minute').toMillis();
    const endMs = fields.endDate.startOf('minute').toMillis();
    const durationMs = endMs - startMs;

    if (isAdminProposal) {
      return Math.abs(durationMs - MS_IN_60_DAYS) < 60000;
    }

    const durationDays = durationMs / MS_PER_DAY;

    if (endDateRestriction.fixed) {
      return Math.abs(durationDays - endDateRestriction.minDays) < 0.1;
    }

    return (
      durationDays >= endDateRestriction.minDays &&
      durationDays <= endDateRestriction.maxDays
    );
  };

  const essentialRefinementError = {
    path: ['endDate'],
    message: isAdminProposal
      ? 'end date must be exactly 60 days after start date'
      : endDateRestriction.fixed
      ? `end date must be exactly ${endDateRestriction.minDays} days after start date`
      : `end date must be between ${endDateRestriction.minDays} and ${endDateRestriction.maxDays} days after start date`,
  };

  const schema = essentialSchema(isAdminProposal)
    .extend(formSchema.schema)
    .refine(
      formSchema.refine ?? essentialRefinement,
      formSchema.error ?? essentialRefinementError
    );

  type CreateProposalSchema = z.infer<typeof schema>;

  const methods = useForm<CreateProposalSchema>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const { handleSubmit, control, formState, watch, setValue } = methods;
  const watchStartDate = watch('startDate', DateTime.now());
  const watchEndDate = watch('endDate');

  useEffect(() => {
    if (watchStartDate?.isValid) {
      const newEndDate = calculateEndDate(watchStartDate);
      setValue('endDate', newEndDate, { shouldValidate: true });
    }
  }, [watchStartDate]);

  // Effect to initialize dates
  useEffect(() => {
    const startDate = DateTime.now()
      .plus({ minutes: MINUTES_IN_FUTURE })
      .startOf('minute');

    setValue('startDate', startDate, { shouldValidate: true });
    setValue('endDate', calculateEndDate(startDate), { shouldValidate: true });
  }, [isAdminProposal, proposalType]);

  const navigate = useNavigate();
  const toast = useToast();
  const activeNetwork = useNetworkStore(state => state.activeNetwork);
  const { refetch } = usePendingMultisigAddProposalTxs();
  const { multisigWallet, pchainAPI } = useWallet();
  const [txID, setTxID] = React.useState<string | null>(null);
  const addProposal = useAddProposal(proposalType, {
    onSuccess: data => {
      if (multisigWallet) {
        refetch();
        navigate('/dac/creating');
      }
      toast.success(
        'AddProposalTx sent successfully',
        data,
        data && (
          <Button
            href={getTxExplorerUrl(activeNetwork?.name, 'p', data)}
            target="_blank"
            variant="outlined"
            color="inherit"
          >
            View on explorer
          </Button>
        )
      );
      if (!multisigWallet) {
        setTxID(data);
      }
    },
  });

  async function waitTxConfirmation(txID: string) {
    const status = await pchainAPI?.getTxStatus(txID);
    if (status === 'Unknown' || status === 'Processing') {
      setTimeout(() => waitTxConfirmation(txID), 500);
    } else {
      setTxID(null);
      setTimeout(() => navigate('/dac/upcoming'), 500);
    }
  }
  useEffect(() => {
    if (txID) {
      waitTxConfirmation(txID);
    }
  }, [txID]);

  const onFormSubmit: SubmitHandler<CreateProposalSchema> = async data => {
    try {
      const startDate = data.startDate.startOf('minute');
      const endDate = data.endDate.startOf('minute');

      addProposal({
        ...data,
        startDate,
        endDate,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to submit proposal:', error);
        toast.error(`Cannot create proposal: ${error.message}`);
      }
    }
  };

  const diff = useMemo(() => {
    if (
      watchStartDate &&
      watchEndDate &&
      watchStartDate.isValid &&
      watchEndDate.isValid
    ) {
      const startUtc = watchStartDate.toUTC();
      const endUtc = watchEndDate.toUTC();

      const diffDays = Math.floor(endUtc.diff(startUtc).as('days'));

      return {
        days: diffDays,
        formatted: {
          start: watchStartDate.toLocaleString(DateTime.DATETIME_FULL),
          end: watchEndDate.toLocaleString(DateTime.DATETIME_FULL),
        },
      };
    }
    return null;
  }, [watchStartDate, watchEndDate]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <FormContainer sx={{ mb: '0px !important', pb: '0px !important' }}>
          <Paragraph spacing="lg">
            {!isAdminProposal && (
              <FormSection spacing="md" divider>
                <Paragraph>
                  <Typography
                    fontSize={16}
                    fontWeight={600}
                    lineHeight={'24px'}
                    sx={{ mb: '8px' }}
                  >
                    Please select a voting period
                  </Typography>
                  {diff && (
                    <Typography variant="caption">
                      The voting period will be{' '}
                      <Typography
                        variant="body2"
                        component="span"
                        fontWeight={700}
                      >
                        {diff.days} days
                      </Typography>
                      . It will start on{' '}
                      <Typography
                        variant="caption"
                        component="span"
                        fontWeight={700}
                      >
                        {diff.formatted.start}
                      </Typography>{' '}
                      and end on{' '}
                      <Typography
                        variant="caption"
                        component="span"
                        fontWeight={700}
                      >
                        {diff.formatted.end}
                      </Typography>
                    </Typography>
                  )}
                </Paragraph>
                <Stack direction="row" spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InputLabel sx={{ color: 'text.secondary' }}>
                      <Typography variant="caption">From</Typography>
                    </InputLabel>
                    <Controller
                      name="startDate"
                      control={control}
                      defaultValue={DateTime.now().plus({
                        minutes: MINUTES_IN_FUTURE,
                      })}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <CaminoDatePicker
                            {...field}
                            slotProps={{
                              textField: {
                                size: 'small',
                              },
                              day: {
                                sx: {
                                  '&.Mui-selected': {
                                    color: '#FFFFFF !important',
                                    backgroundColor: '#2196F3 !important',
                                    borderColor: '#2196F3 !important',
                                    ':hover': {
                                      color: '#FFFFFF !important',
                                      backgroundColor: '#1976D2 !important',
                                      borderColor: '#1976D2 !important',
                                    },
                                  },
                                  '&.MuiPickersDay-today': {
                                    borderColor: '#2196F3 !important',
                                  },
                                  '&:hover': {
                                    backgroundColor:
                                      'rgba(33, 150, 243, 0.04) !important',
                                  },
                                },
                              },
                            }}
                            disablePast
                            onChange={value => field.onChange(value)}
                            minDate={DateTime.now().plus({
                              minutes: MINUTES_IN_FUTURE,
                            })}
                            maxDate={DateTime.now().plus({
                              hours: MAX_FUTURE_HOURS,
                            })}
                            sx={{
                              '& .MuiInputBase-root': {
                                paddingLeft: '0px !important',
                              },
                            }}
                          />
                          {error && (
                            <FormHelperText error>
                              {error.message}
                            </FormHelperText>
                          )}
                        </>
                      )}
                    />
                  </Stack>
                  {!isAdminProposal && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <InputLabel sx={{ color: 'text.secondary' }}>
                        <Typography variant="caption">To</Typography>
                      </InputLabel>
                      <Controller
                        name="endDate"
                        control={control}
                        defaultValue={watchStartDate.plus({
                          days: endDateRestriction.minDays,
                        })}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <CaminoDatePicker
                              {...field}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                },
                                day: {
                                  sx: {
                                    '&.Mui-selected': {
                                      color: '#FFFFFF !important',
                                      backgroundColor: '#2196F3 !important',
                                      borderColor: '#2196F3 !important',
                                      ':hover': {
                                        color: '#FFFFFF !important',
                                        backgroundColor: '#1976D2 !important',
                                        borderColor: '#1976D2 !important',
                                      },
                                    },
                                    '&.MuiPickersDay-today': {
                                      borderColor: '#2196F3 !important',
                                    },
                                    '&:hover': {
                                      backgroundColor:
                                        'rgba(33, 150, 243, 0.04) !important',
                                    },
                                  },
                                },
                              }}
                              disablePast
                              disabled={endDateRestriction.fixed}
                              onChange={value => field.onChange(value)}
                              minDate={watchStartDate.plus({
                                days: endDateRestriction.minDays,
                              })}
                              maxDate={watchStartDate.plus({
                                days: endDateRestriction.maxDays,
                              })}
                              sx={{
                                '& .MuiInputBase-root': {
                                  paddingLeft: '0px !important',
                                },
                              }}
                            />
                            {error && (
                              <FormHelperText error>
                                {error.message}
                              </FormHelperText>
                            )}
                          </>
                        )}
                      />
                    </Stack>
                  )}
                </Stack>
              </FormSection>
            )}
            {children}
          </Paragraph>
        </FormContainer>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              methods.reset();
              onCancel && onCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            loading={formState.isSubmitting}
          >
            Create
          </Button>
        </Stack>
        {formState.isDirty && !formState.isValid && (
          <FormHelperText error>
            please resolve the issue of the fields above
          </FormHelperText>
        )}
      </form>
    </FormProvider>
  );
};

export default React.memo(EssentialForm);
