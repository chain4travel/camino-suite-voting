import {
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import Header from '@/components/Header';
import TextEditor from '@/components/TextEditor';
import FormSection from './FormSection';
import InputField from '@/components/InputField';

const COMPANY_STAGES = [
  { label: 'MVP', value: 0 },
  { label: 'Idea Validation', value: 1 },
  { label: 'Market Launch', value: 2 },
  { label: 'Paying Customers', value: 3 },
];
export const grantProgramFormSchema = {
  schema: {
    companyName: z.string().nonempty('company name is required'),
    companyWebsite: z
      .string({ required_error: 'company website is required' })
      .url(),
    applicantName: z.string().nonempty('applicant name is required'),
    applicantEmail: z.string().email(),
    applicantPchainAddress: z
      .string({ required_error: 'applicant p-chain address is required' })
      .refine(addr => addr.startsWith('P-camino'), 'invalid P-address'),
    companyIndustry: z.string().nonempty('company industry is required'),
    companyDescription: z.string().nonempty('company description is required'),
    companyStage: z.number().nonnegative(),
    milestones: z.string().nonempty('milestones is required'),
    numberOfFunds: z
      .preprocess(val => Number(val), z.number())
      .refine(n => n > 0, 'must be positive number'),
    useOfFunds: z.string().nonempty('use of funds is required'),
    pitchDeck: z
      .string({ required_error: 'pitch deck is required' })
      .url()
      .nonempty(),
    description: z
      .string()
      .optional()
      .refine(d => d?.replaceAll(/(<p>|<\/p>|<br>)/g, '') !== '', 'requied'),
  },
};
const GrantProgramForm = () => {
  const { control } = useFormContext();
  return (
    <>
      <FormSection spacing="md" divider>
        <Header headline="Applicant details" variant="h6" />
        <Typography variant="body2" color="text.secondary">
          Please enter the following information about the applicant
        </Typography>
        <Controller
          name="companyName"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...field}
              label="Company Name"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="companyWebsite"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...field}
              label="Company Website"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="applicantName"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...field}
              label="Applicant Name"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="applicantEmail"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...field}
              label="Applicant Email"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="applicantPchainAddress"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...field}
              label="Applicant P-chain Address"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="companyIndustry"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...field}
              label="Company Industry"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="companyDescription"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...field}
              label="Company Description"
              multiline
              rows={3}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="companyStage"
          control={control}
          defaultValue={0}
          render={({ field, fieldState: { error } }) => (
            <Stack direction="row" alignItems="center" spacing={2}>
              <InputLabel color="secondary" sx={{ minWidth: 220 }}>
                Company Stage
              </InputLabel>
              <Select
                {...field}
                renderValue={selected => {
                  const selectedStage = COMPANY_STAGES.find(
                    stage => stage.value === selected
                  );
                  return (selectedStage ?? COMPANY_STAGES[0]).label;
                }}
                size="small"
                sx={{ marginTop: 2, minWidth: 300 }}
                error={!!error}
              >
                {COMPANY_STAGES.map(stage => (
                  <MenuItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          )}
        />
        <Controller
          name="milestones"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...field}
              label="Milestones"
              multiline
              rows={3}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="numberOfFunds"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...field}
              type="number"
              label="Number of Funds"
              endAdornment="CAM"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="useOfFunds"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...field}
              label="Use of Funds"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="pitchDeck"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...field}
              label="Pitch Deck"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      </FormSection>
      <FormSection>
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Stack>
              <TextEditor
                {...field}
                title="Describe the application"
                description="Please provide a detailed explanation of your motivation for joining the Camino Consortium and highlight the specific values, skills, or expertise you would bring to the network"
                onChange={value => field.onChange(value)}
                error={error}
              />
              {error && <FormHelperText error>{error.message}</FormHelperText>}
            </Stack>
          )}
        />
      </FormSection>
    </>
  );
};
export default GrantProgramForm;
