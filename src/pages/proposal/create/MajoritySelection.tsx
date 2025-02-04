import React from 'react';
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Typography,
  useTheme,
} from '@mui/material';

const MajoritySelection = ({ type, value, onChange }) => {
  React.useEffect(() => {
    if (!type) {
      onChange('relative', 0);
    }
  }, []);
  const theme = useTheme();

  const handleTypeChange = event => {
    const newType = event.target.value;
    const newValue =
      newType === 'relative' ? 0 : newType === 'unanimous' ? 100 : 50;
    onChange(newType, newValue);
  };

  const handleSliderChange = (_, newValue) => {
    onChange('qualified', newValue);
  };

  return (
    <Box
      sx={{
        '& .MuiRadio-root': {
          paddingLeft: '0px !important',
        },
      }}
    >
      <RadioGroup value={type || 'relative'} onChange={handleTypeChange}>
        <Box
          sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <FormControlLabel
            sx={{
              '& .Mui-checked ': {
                color: `${theme.palette.text.primary} !important`,
              },
              marginLeft: '0px !important',
            }}
            value="relative"
            control={<Radio color="primary" />}
            label={
              <Typography fontSize={16} fontWeight={500}>
                Relative majority
              </Typography>
            }
          />
          <Typography variant="overline">
            The option which has the most votes wins
          </Typography>
        </Box>

        <Box
          sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <FormControlLabel
            sx={{
              '& .Mui-checked ': {
                color: `${theme.palette.text.primary} !important`,
              },
              marginLeft: '0px !important',
            }}
            value="qualified"
            control={<Radio color="primary" />}
            label={
              <Typography fontSize={16} fontWeight={500}>
                Qualified majority
              </Typography>
            }
          />
          {type === 'qualified' && (
            <>
              <Slider
                value={value}
                onChange={handleSliderChange}
                min={50}
                max={90}
                step={5}
                sx={{
                  marginLeft: '9px !important',
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
              <Typography variant="body2" color="text.secondary">
                {value}% required
              </Typography>
            </>
          )}
          <Typography variant="overline">
            In order to win an option must not only have the majority but also a
            minimum percentage of votes.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <FormControlLabel
            sx={{
              '& .Mui-checked ': {
                color: `${theme.palette.text.primary} !important`,
              },
              marginLeft: '0px !important',
            }}
            value="unanimous"
            control={<Radio color="primary" />}
            label={
              <Typography fontSize={16} fontWeight={500}>
                Unanimous majority
              </Typography>
            }
          />
          <Typography variant="overline">
            In order to win exactly one option must be picked by everyone
            eligible to vote
          </Typography>
        </Box>
      </RadioGroup>
    </Box>
  );
};

export default MajoritySelection;
