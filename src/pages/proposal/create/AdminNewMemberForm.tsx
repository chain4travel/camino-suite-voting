import { FormHelperText, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import {
  AddressState,
  PlatformVMAPI,
} from '@c4tplatform/caminojs/dist/apis/platformvm';
import { BN } from '@c4tplatform/caminojs/dist';
import Header from '@/components/Header';
import TextEditor from '@/components/TextEditor';
import FormSection from './FormSection';

export const adminNewMemberFormSchema = (platformVMAPI?: PlatformVMAPI) => ({
  schema: {
    targetAddress: z
      .string()
      .refine(addr => {
        let isValid = false;
        try {
          isValid = platformVMAPI?.parseAddress(addr) !== undefined;
        } catch {
          // do nothing
        }
        return isValid;
      }, 'invalid P-address')
      .superRefine(async (addr, ctx) => {
        try {
          const BN_ONE = new BN(1);
          const states = await platformVMAPI?.getAddressStates(addr);
          const isKycVerified = !states
            ?.and(BN_ONE.shln(AddressState.KYC_VERIFIED))
            .isZero();
          if (!isKycVerified) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'not KYC-verified',
            });
          }
          const isNotConsortiumMember = states
            ?.and(BN_ONE.shln(AddressState.CONSORTIUM))
            .isZero();
          if (!isNotConsortiumMember) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'already a consortium member',
            });
          }
        } catch (error) {
          // do nothing
        }
      }),
    description: z
      .string()
      .nonempty()
      .refine(d => d?.replaceAll(/(<p>|<\/p>|<br>)/g, '') !== '', 'requied'),
  },
  endDateRestriction: { minDays: 60, maxDays: 60 },
});
const AdminNewMemberForm = () => {
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
          name="targetAddress"
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
export default AdminNewMemberForm;
