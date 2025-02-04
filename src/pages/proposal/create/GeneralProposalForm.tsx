import React from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Slider,
  Stack,
  Switch as MuiSwitch,
  TextField,
  Typography,
  FormControl,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { AddCircle, DeleteForever } from '@mui/icons-material';
import FormSection from './FormSection';
import Paragraph from '@/components/Paragraph';
import TextEditor from '@/components/TextEditor';
import useToast from '@/hooks/useToast';
import { z } from 'zod';
import { uniqBy } from 'lodash';
import MajoritySelection from './MajoritySelection';

// Custom styled switch with color transitions
const StyledSwitch = styled(MuiSwitch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      color: '#2196f3',
      '& + .MuiSwitch-track': {
        backgroundColor: '#90caf9',
        opacity: 0.7,
      },
    },
    '&.Mui-unchecked': {
      '& + .MuiSwitch-track': {
        backgroundColor: '#grey.400',
        opacity: 0.3,
      },
    },
  },
  '& .MuiSwitch-track': {
    transition: 'background-color 0.2s',
  },
}));

const MAX_OPTIONS = 3;
export const generalFormSchema = {
  schema: {
    description: z.string().optional(),
    votingOptions: z
      .array(z.string().trim().min(1, 'Voting option must not be empty'))
      .min(1, 'You must add at least one voting option')
      .refine(
        options => {
          const uniques = uniqBy(options, option => option);
          return uniques.length === options.length;
        },
        { message: 'Each voting option must be unique' }
      ),
    majorityType: z.enum(['relative', 'qualified', 'unanimous']),
    majorityValue: z.number().min(0).max(100),
    quorum: z.number().max(100, 'Quorum cannot exceed 100%'),
    earlyFinish: z.boolean(),
    proposalSubject: z
      .string()
      .min(1, 'Proposal subject is required')
      .max(256, 'Proposal subject cannot exceed 256 characters'),
  },
  refine: (fields: { [x: string]: any }) => {
    const diffDays = fields.endDate
      .startOf('day')
      .diff(fields.startDate.startOf('day'), ['days']).days;
    return diffDays >= 1 && diffDays <= 30;
  },
  error: {
    path: ['endDate'],
    message: 'end date must be between 1 and 30 days after start date',
  },
  endDateRestriction: { minDays: 1, maxDays: 30, fixed: false },
};

const schema = z.object(generalFormSchema.schema);
type GeneralFormSchema = z.infer<typeof schema>;

const GeneralProposalForm = () => {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<GeneralFormSchema>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'votingOptions',
  });

  React.useEffect(() => {
    setValue('proposalSubject', '');
    setValue('votingOptions', []);
  }, []);
  const toast = useToast();

  const handleAppendOption = () => {
    if (fields.length === MAX_OPTIONS) {
      toast.error(`You can't add more than ${MAX_OPTIONS} options`);
    } else {
      append('');
    }
  };
  const handleMajorityChange = (type, value) => {
    setValue('majorityType', type);
    setValue('majorityValue', value);
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

        {/* Majority Section */}
        <MajoritySelection
          value={watch('majorityValue')}
          type={watch('majorityType')}
          onChange={handleMajorityChange}
        />

        <Divider sx={{ my: 2 }} />

        {/* Quorum Section */}
        <Controller
          name="quorum"
          control={control}
          defaultValue={0}
          render={({ field }) => (
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption">Quorum: {field.value}%</Typography>
              <Slider
                {...field}
                value={field.value}
                onChange={(_, value) => field.onChange(value)}
                aria-label="Quorum"
                step={10}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                sx={{
                  '& .MuiSlider-thumb': {
                    color: '#1976d2',
                  },
                  '& .MuiSlider-track': {
                    color: '#1976d2',
                  },
                  '& .MuiSlider-rail': {
                    color: '#ccc',
                  },
                }}
              />
              <FormHelperText error={!!errors.quorum}>
                {errors.quorum?.message}
              </FormHelperText>
              <Typography variant="overline">
                These many votes are necessary for a proposal to be deemed
                valid.
              </Typography>
            </Box>
          )}
        />

        <Divider sx={{ my: 2 }} />

        {/* Early Exit Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Typography fontSize={16} fontWeight={600} lineHeight="24px">
              Early Exit:
            </Typography>
            <Controller
              name="earlyFinish"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <StyledSwitch
                      {...field}
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                  }
                  label=""
                />
              )}
            />
          </Box>
          <FormHelperText error={!!errors.earlyFinish}>
            {errors.earlyFinish?.message}
          </FormHelperText>
          <Typography variant="overline">
            The voting process can be closed as soon as a winning option has
            been found given the criteria above, or it can run until the end of
            the period anyway as final percentages matter, depending on the
            nature of the proposal.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Proposal Subject Section */}
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

        {/* Voting Options Section */}
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

        {/* Add Option Button */}
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

      {/* Description Section */}
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
