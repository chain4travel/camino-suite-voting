import React from 'react';
import {
  Button,
  FormHelperText,
  IconButton,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AddCircle, DeleteForever } from '@mui/icons-material';
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import Big from 'big.js';
import { useBaseFee } from '@/hooks/useRpc';
import useToast from '@/hooks/useToast';
import TextEditor from '@/components/TextEditor';
import Header from '@/components/Header';
import Paragraph from '@/components/Paragraph';
import { VotingOption } from '@/types';
import FormSection from './FormSection';
import { filter, includes, uniqBy } from 'lodash';

const MAX_OPTIONS = 3;
export const baseFeeFormSchema = {
  description: z.string().optional(),
  votingOptions: z
    .array(
      z.custom<VotingOption>().refine(
        d => {
          const value = Number(d.value);
          return typeof value === 'number' && value > 0;
        },
        { message: 'invalid base fee' }
      )
    )
    .min(1, 'you must add at least one option')
    .refine(
      options => {
        const uniques = uniqBy(options, 'value');
        return uniques.length === options.length;
      },
      {
        message: 'each option should be different value',
      }
    ),
};
const schema = z.object(baseFeeFormSchema);
type BaseFeeFormSchema = z.infer<typeof schema>;

const BaseFeeForm = () => {
  const { baseFee } = useBaseFee();
  const {
    control,
    formState: { errors },
  } = useFormContext<BaseFeeFormSchema>();
  // Form fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'votingOptions',
  });

  const toast = useToast();

  const handleAppendOption = () => {
    if (fields.length === MAX_OPTIONS) {
      toast.error(`You can't add more than ${MAX_OPTIONS} options`);
    } else {
      append({ option: fields.length + 1, value: baseFee });
    }
  };

  return (
    <>
      <FormSection divider spacing="md">
        <Paragraph>
          <Header headline={`Current Base Fee ${baseFee} nCAM`} variant="h6" />
          <Typography variant="body2" color="text.secondary">
            Please fill the following changes of the base fee. Once selecting
            the number, it will automatically be calculated and adjusted to the
            outcomes.
          </Typography>
        </Paragraph>
        {fields.map((item, index) => (
          <Controller
            key={item.id}
            name={`votingOptions.${index}.value`}
            control={control}
            render={({ field }) => {
              const absoluteChange = new Big(Number(field.value) || 0).minus(
                baseFee
              );
              const percentageChange =
                Number(baseFee) > 0
                  ? absoluteChange.times(100).div(baseFee).toFixed(2)
                  : 0;
              return (
                <Paragraph key={item.id} spacing="sm">
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6">{`${field.value} nCAM`}</Typography>
                    <IconButton onClick={() => remove(index)}>
                      <DeleteForever color="error" fontSize="large" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InputLabel>Select Base Fee</InputLabel>
                    <TextField
                      {...field}
                      type="number"
                      variant="outlined"
                      inputProps={{ min: 0 }}
                      error={!!errors.votingOptions?.[index]}
                      helperText={
                        errors.votingOptions?.[index] && (
                          <FormHelperText error>
                            {errors.votingOptions?.[index]?.message}
                          </FormHelperText>
                        )
                      }
                    />
                    <Typography>nCAM</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Future Base Fee</Typography>
                    <Typography>{field.value} nCAM</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Percentage Change</Typography>
                    <Typography>{Number(percentageChange)}%</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Absolute Change</Typography>
                    <Typography>{absoluteChange.toString()} nCAM</Typography>
                  </Stack>
                </Paragraph>
              );
            }}
          />
        ))}
        {fields.length < 3 && (
          <Button
            variant="text"
            startIcon={<AddCircle />}
            onClick={handleAppendOption}
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            Add Option
          </Button>
        )}
        {errors.votingOptions?.message && (
          <FormHelperText error>{errors.votingOptions?.message}</FormHelperText>
        )}
      </FormSection>
      <FormSection>
        <Controller
          name="description"
          control={control}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <>
              <TextEditor
                {...field}
                title="Describe the voting"
                description="Additionally, please provide a detailed description of this voting"
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
export default BaseFeeForm;
