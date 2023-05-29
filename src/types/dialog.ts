export type DialogConfig = {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};
export type DialogState = {
  option: DialogConfig;
  setOption: (option: DialogConfig) => void;
};
