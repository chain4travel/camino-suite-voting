import Header from '@/components/Header';
import Paragraph from '@/components/Paragraph';
import TextEditor from '@/components/TextEditor';
import { BN } from '@c4tplatform/caminojs/dist';
import {
  AddressState,
  PlatformVMAPI,
} from '@c4tplatform/caminojs/dist/apis/platformvm';
import { InfoRounded } from '@mui/icons-material';
import { FormHelperText, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import FormSection from './FormSection';
import Information from './Information';
import { useNetworkStore } from '@/store/network';

export const excludeMemberFormSchema = (platformVMAPI?: PlatformVMAPI) => ({
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
      .refine(async addr => {
        let isValid = false;
        try {
          const BN_ONE = new BN(1);
          const states = await platformVMAPI?.getAddressStates(addr);
          isValid = !states?.and(BN_ONE.shln(AddressState.CONSORTIUM)).isZero();
        } catch (error) {
          // do nothing
        }
        return isValid;
      }, 'not a consortium member'),
    description: z
      .string()
      .nonempty()
      .refine(d => d?.replaceAll(/(<p>|<\/p>|<br>)/g, '') !== '', 'requied'),
  },
  refine: (fields: { [x: string]: any }) => {
    const diffDays = fields.endDate.diff(fields.startDate, ['days']).days;
    return diffDays >= 7 && diffDays <= 30;
  },
  error: {
    path: ['endDate'],
    message: 'end date must be between 7 and 30 days after start date',
  },
  endDateRestriction: { minDays: 7, maxDays: 30, fixed: false },
});
const ExcludeMemberForm = () => {
  const activeNetwork = useNetworkStore(state => state.activeNetwork);
  const { control } = useFormContext();
  return (
    <>
      <FormSection spacing="md" divider>
        <Typography
          fontSize={16}
          fontWeight={600}
          lineHeight={'24px'}
          sx={{ mb: '8px' }}
        >
          Wallet address
        </Typography>
        <Typography variant="caption">
          Please enter the P-Chain wallet address of the member you want to
          exclude from the consortium
        </Typography>
        <Controller
          name="targetAddress"
          control={control}
          defaultValue={''}
          render={({ field, fieldState: { error } }) => (
            <TextField
              sx={{
                '& .MuiInputBase-root': {
                  height: '40px',
                },
                '& input': {
                  fontSize: '14px',
                  height: '100%',
                  padding: '8px 14px',
                },
              }}
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
      <FormSection spacing="sm" sx={{ marginBottom: '16px !important' }}>
        <Information>
          <Stack direction="row" spacing={1.5}>
            <InfoRounded sx={{ color: 'grey.300', width: 28, height: 28 }} />
            <Stack>
              <Header headline="Information" variant="h6" />
              <Paragraph spacing="md">
                <Typography variant="body2" color="text.secondary">
                  Once you submit a voting proposal to exclude a consortium
                  member, other members may vote on your proposal.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If more than 50% of all consortium members vote "yes," the
                  specified member will be excluded from the consortium. As a
                  result, they will lose their voting privileges, be removed
                  from the validators list, and no longer be able to earn
                  validator rewards. However, they will retain any previously
                  earned validation rewards.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If fewer than 50% of consortium members vote "yes," or if less
                  than 50% of members participate within the voting period, the
                  specified member will remain in the consortium.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Any consortium member who has been excluded may reapply to
                  join the consortium.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`Please note that ${
                    activeNetwork?.name.toLocaleLowerCase() === 'camino'
                      ? '1000 CAM'
                      : '100 CAM'
                  } will be bonded from your funds as part of this proposal to prevent spam. 
  Once the voting concludes, the funds will be returned to your wallet.`}
                </Typography>
              </Paragraph>
            </Stack>
          </Stack>
        </Information>
      </FormSection>
    </>
  );
};
export default React.memo(ExcludeMemberForm);
