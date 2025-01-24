import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { incomeCategories, expenseCategories, Category } from '../utils/categories';
import { useCurrency } from '../context/CurrencyContext';
import { currencies } from '../context/CurrencyContext';

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
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCurrency, setSelectedCurrency } = useCurrency();

  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const allCategories = [...categories, ...customCategories];

  const handleSubmit = () => {
    if (!amount || !selectedCategory) {
      // Show error or alert
      return;
    }

    onSubmit(
      parseFloat(amount),
      description,
      selectedCurrency.code,
      selectedCategory
    );

    // Reset form
    setAmount('');
    setDescription('');
    setSelectedCategory('');
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        icon: 'add-circle-outline',
        type: type,
        image: null
      };
      onAddCustomCategory(newCategory);
      setSelectedCategory(newCategory.id);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    }
  };

  // Filter currencies based on search query
  const filteredCurrencies = currencies.filter(currency => 
    currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        <View className="bg-white rounded-t-3xl">
          <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-red-500 text-lg">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-xl font-semibold">
              {type === 'income' ? 'Add Income' : 'Add Expense'}
            </Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text className="text-blue-500 text-lg">Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-[600px]">
            {/* Amount Input */}
            <View className="p-4">
              <Text className="text-gray-600 mb-2">Amount</Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setShowCurrencyModal(true)}
                  className="bg-gray-100 px-3 py-2 rounded-l-lg flex-row items-center"
                >
                  <Text className="text-lg mr-1">{selectedCurrency.symbol}</Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
                <TextInput
                  className="flex-1 bg-gray-100 px-3 py-2 rounded-r-lg text-lg"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                />
              </View>
            </View>

            {/* Description Input */}
            <View className="px-4 mb-4">
              <Text className="text-gray-600 mb-2">Description (Optional)</Text>
              <TextInput
                className="bg-gray-100 px-3 py-2 rounded-lg"
                value={description}
                onChangeText={setDescription}
                placeholder="Add a note"
              />
            </View>

            {/* Categories */}
            <View className="px-4 mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Category</Text>
                <TouchableOpacity onPress={onAddCategoryPress}>
                  <Text className="text-blue-500">Add New</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {allCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setSelectedCategory(category.id)}
                      className={`items-center mr-4 p-2 rounded-lg ${
                        selectedCategory === category.id ? 'bg-blue-100' : ''
                      }`}
                    >
                      {category.image ? (
                        <Image source={category.image} className="w-8 h-8" />
                      ) : (
                        <Ionicons 
                          name={category.icon as any} 
                          size={24} 
                          color={selectedCategory === category.id ? '#2196F3' : '#666'} 
                        />
                      )}
                      <Text className={`text-sm mt-1 ${
                        selectedCategory === category.id ? 'text-blue-500' : 'text-gray-600'
                      }`}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCurrencyModal(false);
          setSearchQuery('');
        }}
      >
        <View className='flex-1 justify-end'>
          <View className='bg-white rounded-t-3xl max-h-[70%]'>
            <View className='p-4 border-b border-gray-200'>
              <Text className='text-xl font-bold text-center mb-2'>Select Currency</Text>
              <View className='flex-row items-center bg-gray-100 rounded-lg px-3 py-2'>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                  className='flex-1 ml-2 text-base'
                  placeholder="Search currency..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <ScrollView className='max-h-[500px]'>
              {filteredCurrencies.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  className={`p-4 border-b border-gray-100 flex-row justify-between items-center ${
                    selectedCurrency.code === currency.code ? 'bg-blue-50' : ''
                  }`}
                  onPress={() => {
                    setSelectedCurrency(currency);
                    setShowCurrencyModal(false);
                    setSearchQuery('');
                  }}
                >
                  <View className='flex-row items-center'>
                    <Text className='text-lg'>{currency.symbol}</Text>
                    <View className='ml-3'>
                      <Text className='text-lg font-medium'>{currency.code}</Text>
                      <Text className='text-sm text-gray-500'>{currency.name}</Text>
                    </View>
                  </View>
                  {selectedCurrency.code === currency.code && (
                    <Ionicons name="checkmark" size={24} color="#2196F3" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              className='p-4 border-t border-gray-200'
              onPress={() => {
                setShowCurrencyModal(false);
                setSearchQuery('');
              }}
            >
              <Text className='text-lg text-center text-red-500'>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
