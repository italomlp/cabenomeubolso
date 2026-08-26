import { AppButton, AppColumn, AppSheet, AppText } from '@/components/ui';

type FinalizeConfirmationProps = {
  cancelLabel: string; cancelHint: string; confirmLabel: string; confirmHint: string;
  message: string; title: string; visible: boolean; onCancel: () => void; onConfirm: () => void;
};

export function FinalizeConfirmation({ cancelLabel, cancelHint, confirmLabel, confirmHint, message, title, visible, onCancel, onConfirm }: FinalizeConfirmationProps) {
  return (
    <AppSheet onClose={onCancel} title={title} visible={visible}>
      <AppColumn>
        <AppText>{message}</AppText>
        <AppButton accessibilityHint={confirmHint} label={confirmLabel} onPress={onConfirm} testID="finalize-confirm" />
        <AppButton accessibilityHint={cancelHint} label={cancelLabel} onPress={onCancel} testID="finalize-cancel" variant="secondary" />
      </AppColumn>
    </AppSheet>
  );
}
