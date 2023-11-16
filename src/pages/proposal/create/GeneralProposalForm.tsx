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
import useToast from '@/hooks/useToast';
import TextEditor from '@/components/TextEditor';
import Paragraph from '@/components/Paragraph';
import { VotingOption } from '@/types';
import FormSection from './FormSection';

const MAX_OPTIONS = 3;
export const generalFormSchema = {
  schema: {
    title: z.string(),
    description: z.string(),
    votingOptions: z.array(
      z
        .custom<VotingOption>()
        .refine(d => d.label && d.value, { message: 'required field' })
    ),
  },
};
const schema = z.object(generalFormSchema.schema);
type GeneralFormSchema = z.infer<typeof schema>;

const GeneralProposalForm = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<GeneralFormSchema>();
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
      append({ option: fields.length + 1, value: '' });
    }
  };

  return (
    <>
      <FormSection divider spacing="md">
        {fields.map((item, index) => (
          <Paragraph key={item.id} spacing="sm">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">Option {index + 1}</Typography>
              <IconButton onClick={() => remove(index)}>
                <DeleteForever color="error" fontSize="large" />
              </IconButton>
            </Stack>
            <Controller
              key={`opt-label-${item.id}`}
              name={`votingOptions.${index}.label`}
              control={control}
              render={({ field }) => {
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InputLabel>Option Title</InputLabel>
                    <TextField
                      {...field}
                      variant="outlined"
                      error={!!errors.votingOptions?.[index]}
                      helperText={
                        errors.votingOptions?.[index] && (
                          <FormHelperText error>
                            {errors.votingOptions?.[index]?.message}
                          </FormHelperText>
                        )
                      }
                    />
                  </Stack>
                );
              }}
            />
            <Controller
              key={`opt-desc-${item.id}`}
              name={`votingOptions.${index}.value`}
              control={control}
              render={({ field }) => {
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InputLabel>Option Description</InputLabel>
                    <TextField
                      {...field}
                      variant="outlined"
                      error={!!errors.votingOptions?.[index]}
                      helperText={
                        errors.votingOptions?.[index] && (
                          <FormHelperText error>
                            {errors.votingOptions?.[index]?.message}
                          </FormHelperText>
                        )
                      }
                    />
                  </Stack>
                );
              }}
            />
          </Paragraph>
        ))}
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
export default GeneralProposalForm;
