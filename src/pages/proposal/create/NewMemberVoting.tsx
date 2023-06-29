import { FormHelperText, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import Header from '@/components/Header';
import Paragraph from '@/components/Paragraph';
import TextEditor from '@/components/TextEditor';
import FormSection from './FormSection';

export const newMemberFormSchema = {
  pAddress: z
    .string()
    .refine(addr => addr.startsWith('P-camino'), 'invalid P-address'),
  description: z
    .string()
    .nonempty()
    .refine(d => d?.replaceAll(/(<p>|<\/p>|<br>)/g, '') !== '', 'requied'),
};
const NewMemberVoting = () => {
  const { control } = useFormContext();
  return (
    <>
      <FormSection spacing="md" divider>
        <Header headline="Wallet address" variant="h6" />
        <Typography variant="body2" color="text.secondary">
          Please enter the wallet address you want to apply to become a member
          of the consortium
        </Typography>
        <Controller
          name="pAddress"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <TextField {...field} error={!!error} helperText={error?.message} />
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
export default NewMemberVoting;
