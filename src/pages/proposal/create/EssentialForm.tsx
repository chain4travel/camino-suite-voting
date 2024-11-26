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
    endDateRestriction?: { minDays: number; maxDays: number };
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
  const essentialRefinement = (fields: { [x: string]: any }) => {
    if (isAdminProposal) return true;
    const diffDays = fields.endDate
      .endOf('day')
      .diff(fields.startDate.startOf('day'), ['days']).days;
    return diffDays > 1 && diffDays <= 30;
  };
  const essentialRefinementError = {
    path: ['endDate'],
    message: 'end date must after start date and maximum in 30 days',
  };
  const endDateRestriction = formSchema.endDateRestriction ?? {
    minDays: 1,
    maxDays: 30,
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
  });
  const { handleSubmit, control, reset, formState, watch } = methods;
  const watchStartDate = watch(
    'startDate',
    DateTime.now().plus({ day: 1 }).startOf('day')
  );
  const watchEndDate = watch('endDate');
  useEffect(() => {
    reset({
      startDate: isAdminProposal
        ? DateTime.now()
        : DateTime.now().plus({ day: 1 }).startOf('day'),
    });
  }, [isAdminProposal]);
  const navigate = useNavigate();
  const toast = useToast();
  const activeNetwork = useNetworkStore(state => state.activeNetwork);
  const addProposal = useAddProposal(proposalType, {
    onSuccess: data => {
      reset({});
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
      // navigate('/dac/upcoming'); .. TODO
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
      const diff = watchStartDate.diff(watchEndDate, [
        'days',
        'hours',
        'minutes',
      ]);
      return diff;
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
                  {/* <Typography variant="body2" color="text.secondary">
                  Please note that additional{' '}
                  <Typography variant="body2" component="span" fontWeight={700}>
                    {'<threshold -1>'}
                  </Typography>{' '}
                  members of your Multisignature Group must sign this voting
                  proposal before the start datetime of the vote
                </Typography> */}
                </Paragraph>
                <Stack direction="row" spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InputLabel sx={{ color: 'text.secondary' }}>
                      <Typography variant="caption">From</Typography>
                    </InputLabel>
                    <Controller
                      name="startDate"
                      control={control}
                      defaultValue={
                        isAdminProposal
                          ? DateTime.now()
                          : DateTime.now().plus({ day: 1 }).startOf('day')
                      }
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <CaminoDatePicker
                            {...field}
                            disablePast
                            onChange={value => field.onChange(value)}
                            minDate={
                              isAdminProposal
                                ? DateTime.now()
                                : DateTime.now().plus({ day: 1 }).startOf('day')
                            }
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
            {/* <FormSection spacing="md" divider sx={{ paddingX: 3 }}>
              <Header headline="Add link of forum of discussion" variant="h6" />
              <Controller
                name="forumLink"
                control={control}
                defaultValue={''}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    variant="filled"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </FormSection> */}
            {children}
          </Paragraph>
        </FormContainer>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              reset();
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
