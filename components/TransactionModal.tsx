import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { incomeCategories, expenseCategories, Category } from '../utils/categories';
import { useCurrency } from '../context/CurrencyContext';

interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  image?: any;
}

interface TransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string, currency: string, categoryId: string) => void;
  type: 'income' | 'expense';
  customCategories: CustomCategory[];
  onAddCustomCategory: (category: Category) => void;
  onAddCategoryPress: () => void;
}

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'TRY', symbol: '₺' },
];

export default function TransactionModal({ 
  isVisible, 
  onClose, 
  onSubmit, 
  type,
  customCategories,
  onAddCustomCategory,
  onAddCategoryPress
}: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const { selectedCurrency: contextCurrency } = useCurrency();

  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const allCategories = [...categories, ...customCategories];

  const handleSubmit = () => {
    if (!amount || !selectedCategory) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      // TODO: Add error handling
      return;
    }

    onSubmit(
      numAmount,
      description,
      selectedCurrency.code,
      selectedCategory
    );

    // Reset form
    setAmount('');
    setDescription('');
    setSelectedCategory('');
    onClose();
  };

  const handleAddCustomCategory = (categoryName: string) => {
    const newCategory: Category = {
      id: `custom-${Date.now()}`,
      name: categoryName,
      type: type,
      image: null,
      icon: type === 'income' ? 'add-circle' : 'remove-circle'
    };
    onAddCustomCategory(newCategory);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        <View className="bg-white rounded-t-3xl p-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">
              Add {type === 'income' ? 'Income' : 'Expense'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <Text className="text-gray-600 mb-2">Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {allCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`mr-4 items-center justify-center p-2 rounded-xl ${
                  selectedCategory === category.id 
                    ? type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    : 'bg-gray-50'
                }`}
              >
                {category.image ? (
                  <Image 
                    source={category.image}
                    className="w-10 h-10 mb-1"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="w-10 h-10 mb-1 items-center justify-center">
                    <Ionicons 
                      name={category.icon as any} 
                      size={24} 
                      color={selectedCategory === category.id 
                        ? type === 'income' ? '#22c55e' : '#ef4444'
                        : '#666'} 
                    />
                  </View>
                )}
                <Text className="text-sm text-center">{category.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowNewCategoryInput(true)}
              className={`mr-4 items-center justify-center p-2 rounded-xl bg-gray-50`}
            >
              <View className="w-10 h-10 mb-1 items-center justify-center">
                <Ionicons 
                  name="add-circle-outline"
                  size={24}
                  color={type === 'income' ? '#22c55e' : '#ef4444'}
                />
              </View>
              <Text className="text-sm text-center">Add New</Text>
            </TouchableOpacity>
          </ScrollView>

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
                className="flex-1 h-12 px-4 bg-gray-100 rounded-xl"
                keyboardType="numeric"
                placeholder="0.00"
                value={amount}
                onChangeText={(text) => {
                  // Only allow numbers and a single decimal point
                  const numericText = text.replace(/[^0-9.]/g, '');
                  // Prevent multiple decimal points
                  const parts = numericText.split('.');
                  if (parts.length > 2) return;
                  setAmount(numericText);
                }}
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
              !selectedCategory || !amount
                ? 'bg-gray-300'
                : type === 'income' 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
            }`}
            onPress={handleSubmit}
            disabled={!selectedCategory || !amount}
          >
            <Text className="text-white text-lg font-semibold text-center">
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
              <Text className="text-xl font-bold">Select Currency</Text>
            </View>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                className="p-4 border-b border-gray-100"
                onPress={() => {
                  setSelectedCurrency(currency);
                  setShowCurrencyModal(false);
                }}
              >
                <Text className="text-lg">
                  {currency.code} ({currency.symbol})
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              className="p-4"
              onPress={() => setShowCurrencyModal(false)}
            >
              <Text className="text-lg text-red-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* New Category Modal */}
      <Modal
        visible={showNewCategoryInput}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewCategoryInput(false)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-xl font-bold">Add New Category</Text>
            </View>
            <View className="p-4">
              <TextInput
                className="p-4 bg-gray-50 rounded-xl mb-4"
                placeholder="Enter category name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                onPress={() => handleAddCustomCategory(newCategoryName)}
                className={`p-4 rounded-xl mb-2 ${type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}
                disabled={!newCategoryName.trim()}
              >
                <Text className="text-white text-lg font-semibold text-center">Add Category</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowNewCategoryInput(false);
                  setNewCategoryName('');
                }}
                className="p-4"
              >
                <Text className="text-lg text-red-500 text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
