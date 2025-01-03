import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string) => void;
  type: 'income' | 'expense';
}

export default function TransactionModal({ isVisible, onClose, onSubmit, type }: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      // TODO: Add error handling
      return;
    }
    onSubmit(numAmount, description);
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        <View className="bg-white rounded-t-3xl p-6 h-96">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">
              Add {type === 'income' ? 'Income' : 'Expense'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Amount</Text>
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">$</Text>
              <TextInput
                className="flex-1 h-12 px-4 bg-gray-100 rounded-xl text-lg"
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Description Input */}
          <View className="mb-6">
            <Text className="text-gray-600 mb-2">Description</Text>
            <TextInput
              className="h-12 px-4 bg-gray-100 rounded-xl"
              placeholder="Enter description"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl ${
              type === 'income' ? 'bg-green-500' : 'bg-red-500'
            }`}
            onPress={handleSubmit}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Add {type === 'income' ? 'Income' : 'Expense'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
