import DistributionBar, {
  VOTE_DISTRIBUTION_COLORS,
} from '@/components/DistributionBar';
import Paragraph from '@/components/Paragraph';
import TextEditor from '@/components/TextEditor';
import { VotingOption } from '@/types';
import { AddCircle, Circle, DeleteForever } from '@mui/icons-material';
import {
  Button,
  FormHelperText,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { isArray, sumBy } from 'lodash';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import FormSection from './FormSection';

const MAX_OPTIONS = 3;
export const feeDistributionFormSchema = {
  schema: {
    description: z.string(),
    votingOptions: z
      .array(
        z
          .custom<VotingOption>()
          .refine(
            d => {
              const values = d.value as number[];
              return isArray(values) && values.length > 0;
            },
            { message: 'invalid value numbers' }
          )
          .refine(
            d => {
              const values = d.value as number[];
              const sum = sumBy(values, v => Number(v));
              return sum === 100;
            },
            {
              message:
                'The numbers you have entered do not equal 100. Please make sure the numbers will add up to 100',
            }
          )
      )
      .min(1),
  },
};
const schema = z.object(feeDistributionFormSchema.schema);
type FeeDistributionFormSchema = z.infer<typeof schema>;

const FeeDistributionForm = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<FeeDistributionFormSchema>();
  // Form fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'votingOptions',
  });

  const { dispatchNotification } = useNotificationStore();

  const handleAppendOption = () => {
    if (fields.length === MAX_OPTIONS) {
      dispatchNotification({
        type: 'error',
        message: `You can't add more than ${MAX_OPTIONS} options`,
      });
    } else {
      append({
        option: fields.length + 1,
        value: [30, 50, 20],
        label: ['Validator', 'TAKEOFF Camino Grant Program', 'Burn'],
      });
    }
  };

  return (
    <>
      <FormSection divider spacing="md">
        <Paragraph>
          <Typography variant="body2" color="text.secondary">
            Please select the distribution you would like to propose. Make sure
            it ends up to 100%.
          </Typography>
        </Paragraph>
        {fields.map((item, index) => {
          const values = item.value as number[];
          const labels = item.label as string[];
          return (
            <Paragraph key={item.id} spacing="sm">
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{`Distribution #${item.option}`}</Typography>
                <IconButton onClick={() => remove(index)}>
                  <DeleteForever color="error" fontSize="large" />
                </IconButton>
              </Stack>
              <Paragraph spacing="md" width="50%">
                <DistributionBar
                  data={values.map(v => ({ percent: v }))}
                  variant="vote"
                />
                <Paragraph spacing="sm">
                  {labels.map((label, distIdx) => (
                    <Controller
                      key={`distribution-${label}`}
                      name={`votingOptions.${index}.value.${distIdx}`}
                      control={control}
                      render={({ field }) => (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Circle
                              sx={{ color: VOTE_DISTRIBUTION_COLORS[distIdx] }}
                              fontSize="small"
                            />
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              width="100%"
                            >
                              <Typography color="text.secondary">
                                {label}
                              </Typography>
                            </Stack>
                          </Stack>
                          <OutlinedInput
                            {...field}
                            type="number"
                            inputProps={{ min: 0, max: 100 }}
                            error={!!errors.votingOptions?.[index]}
                            endAdornment={
                              <InputAdornment position="end">%</InputAdornment>
                            }
                            size="small"
                          />
                        </Stack>
                      )}
                    />
                  ))}
                </Paragraph>
              </Paragraph>
              {errors.votingOptions?.[index] && (
                <FormHelperText error>
                  {errors.votingOptions?.[index]?.message}
                </FormHelperText>
              )}
            </Paragraph>
          );
        })}
        <Button
          variant="text"
          startIcon={<AddCircle />}
          onClick={handleAppendOption}
          fullWidth
          sx={{ justifyContent: 'flex-start' }}
        >
          Add Option
        </Button>
      </FormSection>
      <FormSection>
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <TextEditor
                {...field}
                title="Describe the Distribution"
                description="Additionally, please provide a detailed description of the chosen distribution"
                onChange={value => field.onChange(value)}
                error={error}
              />
              {error && <FormHelperText error>{error.message}</FormHelperText>}
            </>
          )}
        />
      </FormSection>
    </>
  );
};
export default React.memo(FeeDistributionForm);
