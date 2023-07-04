import React, { ReactNode } from 'react';
import {
  useForm,
  SubmitHandler,
  Controller,
  FormProvider,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Paragraph from '@/components/Paragraph';
import Header from '@/components/Header';
import {
  FormHelperText,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import Button from '@/components/Button';
import useToast from '@/hooks/useToast';
import FormContainer from './FormContainer';
import FormSection from './FormSection';

export const essentialSchema = z.object({
  startDate: z
    .custom<DateTime>()
    .refine(
      d => d.isValid && d.diffNow(['days', 'hours']).days >= 0,
      'invalid start date'
    ),
  endDate: z
    .custom<DateTime>()
    .refine(d => d.isValid && d.diffNow(['days']).days > 0, 'invalid end date'),
  forumLink: z.preprocess(url => {
    if (!url || typeof url !== 'string') return undefined;
    return url === '' ? undefined : url;
  }, z.string().url().optional()),
});

interface EssentialFormProps {
  children?: ReactNode;
  formSchema?: z.ZodRawShape;
}
const EssentialForm = ({ children, formSchema = {} }: EssentialFormProps) => {
  const schema = essentialSchema.extend(formSchema).refine(
    fields => {
      const diffDays = fields.endDate
        .endOf('day')
        .diff(fields.startDate, ['days', 'hours']).days;
      return diffDays > 0 && diffDays <= 30;
    },
    {
      path: ['endDate'],
      message: 'end date must after start date and maximum in 30 days',
    }
  );
  type CreateProposalSchema = z.infer<typeof schema>;
  const methods = useForm<CreateProposalSchema>({
    resolver: zodResolver(schema),
  });
  const { handleSubmit, control, getValues } = methods;
  const toast = useToast();

  const onSubmit: SubmitHandler<CreateProposalSchema> = async data => {
    try {
      // TODO: call API
      console.log('data: ', data);
    } catch (error) {
      if (error instanceof Error) {
        console.error('failed to submit to create proposal: ', error);
        toast.error(`cannot create proposal: ${error.message}`);
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormContainer>
          <Paragraph spacing="lg">
            <FormSection spacing="md" divider>
              <Paragraph>
                <Header headline="Please select a voting period" variant="h6" />
                <Typography variant="body2" color="text.secondary">
                  The voting period will be{' '}
                  <Typography variant="body2" component="span" fontWeight={700}>
                    {'<number of entered days>'}
                  </Typography>
                  . It will start on{' '}
                  <Typography variant="body2" component="span" fontWeight={700}>
                    {'<start datetime>'}
                  </Typography>{' '}
                  and end on{' '}
                  <Typography variant="body2" component="span" fontWeight={700}>
                    {'<end datetime>'}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please note that additional{' '}
                  <Typography variant="body2" component="span" fontWeight={700}>
                    {'<threshold -1>'}
                  </Typography>{' '}
                  members of your Multisignature Group must sign this voting
                  proposal before the start datetime of the vote
                </Typography>
              </Paragraph>
              <Stack direction="row" spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <InputLabel sx={{ color: 'text.secondary' }}>From</InputLabel>
                  <Controller
                    name="startDate"
                    control={control}
                    defaultValue={DateTime.now()}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <DatePicker
                          {...field}
                          disablePast
                          onChange={value => field.onChange(value!)}
                          minDate={DateTime.now().startOf('day')}
                        />
                        {error && (
                          <FormHelperText error>{error.message}</FormHelperText>
                        )}
                      </>
                    )}
                  />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <InputLabel sx={{ color: 'text.secondary' }}>To</InputLabel>
                  <Controller
                    name="endDate"
                    control={control}
                    defaultValue={DateTime.now().plus({ days: 1 })}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <DatePicker
                          {...field}
                          disablePast
                          onChange={value => field.onChange(value!)}
                          minDate={getValues('startDate')?.plus({ days: 1 })}
                          maxDate={getValues('startDate')?.plus({ days: 30 })}
                        />
                        {error && (
                          <FormHelperText error>{error.message}</FormHelperText>
                        )}
                      </>
                    )}
                  />
                </Stack>
              </Stack>
            </FormSection>
            <FormSection spacing="md" divider sx={{ paddingX: 3 }}>
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
            </FormSection>
            {children}
          </Paragraph>
        </FormContainer>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" sx={{ py: 1.5 }} color="inherit" fullWidth>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ py: 1.5 }}
            color="primary"
            fullWidth
          >
            Create new voting
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
};
export default EssentialForm;
