import React, { ReactNode, forwardRef } from 'react';
import QuillEditor from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Box from '@mui/material/Box';
import { Typography, styled } from '@mui/material';
import { FieldError } from 'react-hook-form';
import Header from './Header';

interface StyledEditorProps {
  children: ReactNode;
  error?: boolean;
}
const StyledEditor = styled(
  ({ children, error: _error, ...props }: StyledEditorProps) => (
    <div {...props}>{children}</div>
  )
)(({ theme, ...props }) => ({
  '.quill': {
    margin: '12px 0',
  },
  '.ql-toolbar, .ql-container': {
    borderColor: props.error
      ? theme.palette.error.main
      : theme.palette.grey[600],
  },
  '.ql-toolbar': {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,

    '& .ql-picker': {
      color: theme.palette.text.secondary,
    },
    '& .ql-stroke': {
      stroke: theme.palette.text.secondary,
    },
    '& .ql-fill': {
      fill: theme.palette.text.secondary,
    },
  },
  '.ql-container': {
    minHeight: '250px',
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
}));
interface TextEditorProps {
  title?: string;
  description?: string;
  value?: string;
  error?: FieldError;
  onChange: (value: string) => void;
}
const TextEditor = forwardRef(
  ({ title, description, value, error, onChange }: TextEditorProps, ref) => {
    const modules = {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        ['blockquote', 'code-block'],

        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
        [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ align: [] }],

        ['clean'], // remove formatting button
      ],
    };

    return (
      <Box>
        {title && <Header headline={title} variant="h6" />}
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        <StyledEditor error={!!error}>
          <QuillEditor
            ref={ref}
            theme="snow"
            modules={modules}
            value={value}
            onChange={onChange}
          />
        </StyledEditor>
      </Box>
    );
  }
);
export default TextEditor;
