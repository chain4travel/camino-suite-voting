import React from 'react';
import { FormHelperText, Stack, TextField, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import Header from '@/components/Header';
import Paragraph from '@/components/Paragraph';
import TextEditor from '@/components/TextEditor';
import FormSection from './FormSection';
import Information from './Information';
import { InfoRounded } from '@mui/icons-material';

export const excludeMemberFormSchema = {
  pAddress: z
    .string()
    .refine(addr => addr.startsWith('P-camino'), 'invalid P-address'),
  description: z
    .string()
    .nonempty()
    .refine(d => d?.replaceAll(/(<p>|<\/p>|<br>)/g, '') !== '', 'requied'),
};
const ExcludeMemberForm = () => {
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
            <TextField
              {...field}
              placeholder="Enter p-chain address ..."
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      </FormSection>
      <FormSection divider>
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <TextEditor
                {...field}
                title="Describe the reason"
                description="Please explain in detail why you want to propose an exclusion of that particular member from the consortium"
                placeholder="Enter a detailed explanation ..."
                onChange={value => field.onChange(value)}
                error={error}
              />
              {error && <FormHelperText error>{error.message}</FormHelperText>}
            </>
          )}
        />
      </FormSection>
      <FormSection spacing="sm">
        <Information>
          <Stack direction="row" spacing={1.5}>
            <InfoRounded sx={{ color: 'grey.300', width: 28, height: 28 }} />
            <Stack>
              <Header headline="Information" variant="h6" />
              <Paragraph spacing="md">
                <Typography variant="body2" color="text.secondary">
                  Once you submit the voting proposal to exclude a member of the
                  consortium, other members of the consortium may vote on your
                  proposal.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If more than 50% of all consortium members vote
                  &quot;yes&quot;, the member you stated will be excluded from
                  the consortium. He will therefore lose his voting privileges,
                  will be removed from the validators list and will no longer be
                  able to earn validator rewards, but will keep his already
                  earned validation rewards.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If less than 50% of the members of the consortium voted for
                  &quot;yes&quot; or if less than 50% of the members voted at
                  all within the voting period, the member you stated will
                  remain in the consortium.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Any consortium member who was once excluded from the
                  consortium may re-apply to join the consortium again.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`Please note that < X CAM (from chain configuration) > from your funds will be bonded within this proposal to prevent spam. Once the voting has been concluded, the funds will be returned to your wallet.`}
                </Typography>
              </Paragraph>
            </Stack>
          </Stack>
        </Information>
      </FormSection>
    </>
  );
};
export default ExcludeMemberForm;
