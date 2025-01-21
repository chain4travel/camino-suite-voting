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
import { DatePicker } from '@mui/x-date-pickers';
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
export const essentialSchema = (isAdminProposal: boolean) =>
  z.object({
    startDate: z
      .custom<DateTime>()
      .refine(
        (d: DateTime) => d.isValid && d.diffNow(['days', 'hours']).days >= 0,
        'invalid start date'
      ),
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

  const essentialRefinement = (fields: { [x: string]: any }) => {
    if (isAdminProposal) return true;
    const diffDays = fields.endDate
      .endOf('day')
      .diff(fields.startDate.startOf('day'), ['days']).days;
    if (endDateRestriction.fixed) {
      return diffDays === endDateRestriction.minDays;
    }
    return (
      diffDays >= endDateRestriction.minDays &&
      diffDays <= endDateRestriction.maxDays
    );
  };

  const essentialRefinementError = {
    path: ['endDate'],
    message: endDateRestriction.fixed
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

  // Effect to handle start date changes
  useEffect(() => {
    if (watchStartDate) {
      const newEndDate = watchStartDate.plus({
        days: endDateRestriction.minDays,
      });
      if (endDateRestriction.fixed || !watchEndDate) {
        setValue('endDate', newEndDate, { shouldValidate: true });
      }
    }
  }, [watchStartDate, endDateRestriction.fixed, endDateRestriction.minDays]);

  // Effect to initialize dates
  useEffect(() => {
    const now = DateTime.now();
    setValue('startDate', now, { shouldValidate: true });
    if (!isAdminProposal) {
      setValue('endDate', now.plus({ days: endDateRestriction.minDays }), {
        shouldValidate: true,
      });
    }
  }, [isAdminProposal, proposalType]);

  const navigate = useNavigate();
  const toast = useToast();
  const activeNetwork = useNetworkStore(state => state.activeNetwork);
  const { refetch } = usePendingMultisigAddProposalTxs();
  const { multisigWallet } = useWallet();
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
      if (!multisigWallet) navigate('/dac/upcoming');
    },
  });

  const onFormSubmit: SubmitHandler<CreateProposalSchema> = async data => {
    try {
      addProposal(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error('failed to submit to create proposal: ', error);
        toast.error(`cannot create proposal: ${error.message}`);
      }
    }
  };

  const diff = useMemo(() => {
    if (watchStartDate && watchEndDate) {
      return watchEndDate.diff(watchStartDate, ['days', 'hours', 'minutes']);
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
                        {Math.abs(diff.days)} days
                      </Typography>
                      . It will start on{' '}
                      <Typography
                        variant="caption"
                        component="span"
                        fontWeight={700}
                      >
                        {watchStartDate
                          ?.setZone('local')
                          .toLocaleString('yyyy-MM-dd HH:mm ZZZZ')}
                      </Typography>{' '}
                      and end on{' '}
                      <Typography
                        variant="caption"
                        component="span"
                        fontWeight={700}
                      >
                        {watchEndDate
                          ?.setZone('local')
                          .toLocaleString('yyyy-MM-dd HH:mm ZZZZ')}
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
                      defaultValue={DateTime.now()}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <CaminoDatePicker
                            {...field}
                            disablePast
                            onChange={value => field.onChange(value)}
                            minDate={DateTime.now()}
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
