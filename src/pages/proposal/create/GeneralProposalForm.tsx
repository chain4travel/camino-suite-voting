import Paragraph from '@/components/Paragraph';
import TextEditor from '@/components/TextEditor';
import useToast from '@/hooks/useToast';
import { VotingOption } from '@/types';
import { AddCircle, DeleteForever } from '@mui/icons-material';
import {
  Box,
  Button,
  FormHelperText,
  IconButton,
  InputLabel,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import FormSection from './FormSection';

const MAX_OPTIONS = 3;
export const generalFormSchema = {
  schema: {},
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
        <Typography
          fontSize={16}
          fontWeight={600}
          lineHeight={'24px'}
          sx={{ mb: '8px' }}
        >
          Please select the criteria for the approval of this proposal
        </Typography>
        <Typography variant="caption">Majority : slected Value</Typography>
        <Slider
          aria-label="Temperature"
          defaultValue={30}
          getAriaValueText={() => {
            return 'dsds';
          }}
          valueLabelDisplay="auto"
          shiftStep={30}
          step={10}
          marks
          min={10}
          max={100}
        />
        <Typography variant="overline">
          if &quot;Any&quot; a relative majority wins, that is the option with
          the most vote. Otherwise, a qualified majority between 50% + 1 and
          100% of votes is needed.
        </Typography>
        <Typography variant="caption">Quorum : slected Value</Typography>
        <Slider
          aria-label="Temperature"
          defaultValue={30}
          getAriaValueText={() => {
            return 'dsds';
          }}
          valueLabelDisplay="auto"
          shiftStep={30}
          step={10}
          marks
          min={10}
          max={100}
        />
        <Typography variant="overline">
          these many votes are necessary for a proposal to be deemed valid.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Typography
            fontSize={16}
            fontWeight={600}
            lineHeight={'24px'}
            sx={{ mb: '8px' }}
          >
            Early exit:
          </Typography>
          <Switch defaultChecked />
        </Box>
        <Typography variant="overline">
          the voting process can be closed as soon as a winning option has been
          found given th criteria above, or it can run until the end of the
          period anyway as final percentages matter, depending on the nature of
          the propsal.
        </Typography>
        {fields.map((item, index) => (
          <Paragraph key={item.id} spacing="sm">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                fontSize={16}
                fontWeight={600}
                lineHeight={'24px'}
                sx={{ mb: '8px' }}
              >
                Option {index + 1}
              </Typography>
              <IconButton onClick={() => remove(index)}>
                <DeleteForever color="error" fontSize="small" />
              </IconButton>
            </Stack>
            <Controller
              key={`opt-desc-${item.id}`}
              name={`votingOptions.${index}.value`}
              control={control}
              render={({ field }) => {
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption">
                      Option Description
                    </Typography>
                    <TextField
                      {...field}
                      sx={{
                        flex: '1',
                        '& .MuiInputBase-root': {
                          height: '40px',
                        },
                        '& input': {
                          fontSize: '14px',
                          height: '100%',
                          padding: '8px 14px',
                        },
                      }}
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
export default React.memo(GeneralProposalForm);
