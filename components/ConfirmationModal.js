import React from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import Text from './ui/Text';

// Built-in Modal: react-native-modal 13 calls BackHandler.removeEventListener, which React Native removed.
const ConfirmationModal = ({ isVisible, message, onConfirm, onCancel }) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View className="flex-1 justify-center bg-black/60 px-4">
        <View className="rounded-2xl border border-border bg-surface p-6 dark:border-border-dark dark:bg-surface-dark">
          <Text className="text-base font-semibold">{message}</Text>
          <View className="mt-6 flex-row justify-end gap-3">
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.7}
              className="min-h-11 items-center justify-center rounded-xl px-4"
              onPress={onCancel}
            >
              <Text className="font-semibold text-muted dark:text-muted-dark">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.85}
              className="min-h-11 items-center justify-center rounded-xl bg-brand px-5"
              onPress={onConfirm}
            >
              <Text className="font-bold text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
