import React from 'react';
import { Modal, Text, View, TouchableOpacity } from 'react-native';

// Built-in Modal: react-native-modal 13 calls BackHandler.removeEventListener, which React Native removed.
const ConfirmationModal = ({ isVisible, message, onConfirm, onCancel }) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center px-5" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="bg-white p-8 rounded-lg">
          <Text className="text-md font-medium">{message}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity className="px-4 py-2" onPress={onCancel}>
              <Text className="text-md font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#00B8C0] px-4 py-2 rounded-md" onPress={onConfirm}>
              <Text className="text-white text-md font-medium">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
