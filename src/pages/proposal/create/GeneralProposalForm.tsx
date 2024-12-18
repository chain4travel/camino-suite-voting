import Paragraph from '@/components/Paragraph';
import TextEditor from '@/components/TextEditor';
import useToast from '@/hooks/useToast';
import { VotingOption } from '@/types';
import { AddCircle, DeleteForever } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  Slider,
  Stack,
  Switch as MuiSwitch,
  TextField,
  Typography,
  FormControl,
  Divider,
} from '@mui/material';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import FormSection from './FormSection';
import { uniqBy } from 'lodash';

const MAX_OPTIONS = 3;
export const generalFormSchema = {
  schema: {
    description: z.string().optional(),
    votingOptions: z
      .array(
        z
          .string()
          .transform(value => value.trim())
          .refine(value => value.length > 0, {
            message: 'Voting option must not be empty',
          })
      )
      .min(1, 'You must add at least one voting option')
      .refine(
        options => {
          const uniques = uniqBy(options, option => option);
          return uniques.length === options.length;
        },
        { message: 'Each voting option must be unique' }
      ),
    majority: z.number().max(100, 'Majority cannot exceed 100%'),
    quorum: z.number().max(100, 'Quorum cannot exceed 100%'),
    earlyFinish: z.boolean(),
    proposalSubject: z
      .string()
      .min(1, 'Proposal subject is required')
      .max(256, 'Proposal subject cannot exceed 256 characters'),
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
      append('');
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
        <Controller
          name="majority"
          control={control}
          render={({ field }) => (
            <>
              <Typography variant="caption">
                Majority: {field.value || 0}%
              </Typography>
              <Slider
                {...field}
                value={field.value || 0}
                onChange={(_, value) => field.onChange(value)}
                aria-label="Majority"
                step={10}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
              <FormHelperText error={!!errors.majority}>
                {errors.majority?.message}
              </FormHelperText>
            </>
          )}
        />
        <Typography variant="overline">
          if &quot;Any&quot; a relative majority wins, that is the option with
          the most vote. Otherwise, a qualified majority between 50% + 1 and
          100% of votes is needed.
        </Typography>
        <Controller
          name="quorum"
          control={control}
          render={({ field }) => (
            <>
              <Typography variant="caption">
                Quorum: {field.value || 0}%
              </Typography>
              <Slider
                {...field}
                value={field.value || 0}
                onChange={(_, value) => field.onChange(value)}
                aria-label="Quorum"
                step={10}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
              <FormHelperText error={!!errors.quorum}>
                {errors.quorum?.message}
              </FormHelperText>
            </>
          )}
        />
        <Typography variant="overline">
          these many votes are necessary for a proposal to be deemed valid.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Typography fontSize={16} fontWeight={600} lineHeight="24px">
            Early Exit:
          </Typography>
          <Controller
            name="earlyFinish"
            control={control}
            defaultValue={false} // Default value
            render={({ field }) => (
              <>
                <FormControlLabel
                  control={
                    <MuiSwitch
                      {...field} // Spread field to connect to form state
                      checked={field.value} // Ensures the switch reflects form state
                      onChange={e => field.onChange(e.target.checked)} // Updates form state on toggle
                    />
                  }
                  label=""
                />
                {errors.earlyFinish && (
                  <FormHelperText error>
                    {errors.earlyFinish?.message}
                  </FormHelperText>
                )}
              </>
            )}
          />
        </Box>
        <FormHelperText error={!!errors.earlyFinish}>
          {errors.earlyFinish?.message}
        </FormHelperText>

        <Typography variant="overline">
          the voting process can be closed as soon as a winning option has been
          found given th criteria above, or it can run until the end of the
          period anyway as final percentages matter, depending on the nature of
          the propsal.
        </Typography>
        <Divider />
        <Typography fontSize={16} fontWeight={600} lineHeight="24px">
          Describe the voting
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FormSection>
            <Typography
              fontSize={16}
              fontWeight={600}
              lineHeight={'24px'}
              sx={{ mb: '8px' }}
            >
              subject: keep it clear and concise
            </Typography>
            <Controller
              name="proposalSubject"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <TextField
                    {...field}
                    variant="outlined"
                    fullWidth
                    error={!!error}
                    helperText={error ? error.message : ''}
                    inputProps={{
                      maxLength: 256,
                    }}
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
                  />
                </>
              )}
            />
          </FormSection>
        </Box>
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
              name={`votingOptions.${index}`}
              control={control}
              render={({ field }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Typography variant="caption">Option Description</Typography>
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
                </Box>
              )}
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
