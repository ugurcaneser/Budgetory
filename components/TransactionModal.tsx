import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string, currency: string) => void;
  type: 'income' | 'expense';
}

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'TRY', symbol: '₺' },
];

export default function TransactionModal({ isVisible, onClose, onSubmit, type }: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      // TODO: Add error handling
      return;
    }
    onSubmit(numAmount, description, selectedCurrency.code);
    setAmount('');
    setDescription('');
    onClose();
  };

  const handleCurrencySelect = (currency: typeof currencies[0]) => {
    setSelectedCurrency(currency);
    setShowCurrencyModal(false);
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
              <TouchableOpacity 
                onPress={() => setShowCurrencyModal(true)}
                className="flex-row items-center bg-gray-100 px-3 py-2 rounded-xl mr-2"
              >
                <Text className="text-lg mr-1">{selectedCurrency.symbol}</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
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

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-center">Select Currency</Text>
            </View>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                className="p-4 border-b border-gray-100"
                onPress={() => handleCurrencySelect(currency)}
              >
                <Text className="text-lg text-center">
                  {currency.code} ({currency.symbol})
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              className="p-4"
              onPress={() => setShowCurrencyModal(false)}
            >
              <Text className="text-lg text-center text-red-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
