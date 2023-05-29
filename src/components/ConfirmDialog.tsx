import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  alpha,
  styled,
} from '@mui/material';
import Button from './Button';
import useDialog from '@/hooks/dialog';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '.MuiDialog-paper': {
    padding: '80px',
    textAlign: 'center',
    borderRadius: '64px',
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[24],
  },

  '.MuiDialogTitle-root': {
    ...theme.typography.h2,
  },

  '.MuiDialogContent-root': {
    color: theme.palette.text.secondary,
  },

  '.MuiDialogActions-root': {
    justifyContent: 'center',
  },
}));

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}
const ConfirmDialog = ({ isOpen, title, message }: ConfirmDialogProps) => {
  const { hide, onCancel, onConfirm } = useDialog();
  const handleOnCancel = () => {
    onCancel && onCancel();
    hide();
  };
  const handleOnConfirm = () => {
    onConfirm && onConfirm();
    hide();
  };
  return (
    <StyledDialog open={isOpen}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleOnCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleOnConfirm}>
          Accept
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};
export default ConfirmDialog;
