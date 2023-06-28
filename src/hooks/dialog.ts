import { SyntheticEvent } from 'react';

import { useDialogStore } from '@/store';
import type { DialogConfig } from '@/types';

const useDialog = () => {
  const { option, setOption } = useDialogStore();

  const show = (config: Partial<DialogConfig>) =>
    setOption({ isOpen: true, ...config });
  const hide = () => setOption({ isOpen: false });
  const onClose = (_event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOption({ isOpen: false });
  };

  return {
    show,
    hide,
    onClose,
    ...option,
  };
};
export default useDialog;
