import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Platform, Image, Alert, TextInput } from 'react-native';
import SummaryCard from '../components/SummaryCard';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, loadTransactions, loadTotals, saveTransactions } from '../utils/storage';
import { fetchExchangeRates, convertAmount } from '../utils/currency';
import { useCurrency } from '../context/CurrencyContext';
import { incomeCategories, expenseCategories } from '../utils/categories';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BottomNavBar from '../components/BottomNavBar';

type RootStackParamList = {
  Home: undefined;
  Chart: undefined;
  About: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({});
  const { selectedCurrency } = useCurrency();
  const navigation = useNavigation<NavigationProp>();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadSavedData();
  }, [selectedCurrency]);

  const loadSavedData = async () => {
    try {
      const savedTransactions = await loadTransactions();
      const savedTotals = await loadTotals();
      const rates = await fetchExchangeRates(selectedCurrency.code);
      
      setTransactions(savedTransactions);
      setTotalIncome(savedTotals.totalIncome || 0);
      setTotalExpense(savedTotals.totalExpense || 0);
      setExchangeRates(rates);
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (!exchangeRates[currency]) return `${selectedCurrency.symbol}${amount.toFixed(2)}`;
    
    const convertedAmount = currency === selectedCurrency.code
      ? amount
      : convertAmount(amount, currency, selectedCurrency.code, exchangeRates);
    
    return `${selectedCurrency.symbol}${convertedAmount.toFixed(2)}`;
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery('');
      setFilteredTransactions([]);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredTransactions([]);
      return;
    }

    const searchText = text.toLowerCase();
    const filtered = transactions.filter(transaction => {
      const category = getCategoryDetails(transaction);
      return (
        category.name.toLowerCase().includes(searchText) ||
        transaction.description?.toLowerCase().includes(searchText)
      );
    });
    setFilteredTransactions(filtered);
  };

  const getCategoryDetails = (transaction: Transaction) => {
    const defaultCategories = transaction.type === 'income' ? incomeCategories : expenseCategories;
    return defaultCategories.find(cat => cat.id === transaction.categoryId) || defaultCategories[0];
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='px-4 py-2'>
        {!isSearchVisible ? (
          <View className='flex-row justify-end items-center'>
            <TouchableOpacity
              className='p-2'
              onPress={toggleSearch}
            >
              <Ionicons name="search" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className='flex-row items-center bg-gray-100 rounded-lg px-2'>
            <TouchableOpacity
              className='p-2'
              onPress={toggleSearch}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <TextInput
              className='flex-1 py-2 px-3'
              placeholder="Search transactions..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                className='p-2'
                onPress={() => {
                  setSearchQuery('');
                  setFilteredTransactions([]);
                }}
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <ScrollView 
        className='flex-1'
        contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 0 : 0 }}
      >
        {!isSearchVisible && (
          <View className='px-4'>
            <SummaryCard 
              totalIncome={totalIncome}
              totalExpense={totalExpense}
            />
          </View>
        )}

        <View className='px-6 mt-4 mb-32'>
          <Text className='text-xl font-bold text-gray-800 mb-2'>
            {searchQuery ? 'Search Results' : 'Recent Transactions'}
          </Text>
          
          {(searchQuery ? filteredTransactions : transactions.slice(0, 5)).map((transaction, index) => {
            const category = getCategoryDetails(transaction);
            return (
              <TouchableOpacity
                key={transaction.id}
                onLongPress={() => {
                  Alert.alert(
                    'Delete Transaction',
                    'Are you sure you want to delete this transaction?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          const updatedTransactions = transactions.filter(t => t.id !== transaction.id);
                          setTransactions(updatedTransactions);
                          await saveTransactions(updatedTransactions);
                          loadSavedData();
                        },
                      },
                    ],
                    { cancelable: true }
                  );
                }}
                delayLongPress={300}
              >
                <View className='py-3'>
                  <View className='flex-row justify-between items-center'>
                    <View className='flex-row items-center flex-1 mr-3'>
                      {category.image ? (
                        <Image 
                          source={category.image}
                          className='w-8 h-8 mr-3'
                          resizeMode='contain'
                        />
                      ) : (
                        <View className="mr-3">
                          <Ionicons 
                            name={category.icon as any} 
                            size={24} 
                            color={transaction.type === 'income' ? '#22c55e' : '#ef4444'} 
                          />
                        </View>
                      )}
                      <View className='flex-1'>
                        <View className='flex-row items-center'>
                          <Text className='text-base font-medium text-gray-800'>{category.name}</Text>
                          <Text className='text-sm text-gray-400 ml-2'>
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Text>
                        </View>
                        {transaction.description && (
                          <Text className='text-sm text-gray-400' numberOfLines={1}>
                            {transaction.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text 
                      className={`text-base font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'} {formatAmount(transaction.amount, transaction.currency)}
                    </Text>
                  </View>
                  {index < transactions.length - 1 && (
                    <View className='h-[0.5px] bg-gray-100 mt-3' />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {!searchQuery && transactions.length > 5 && (
            <TouchableOpacity 
              className='mt-4 py-3 bg-gray-50 rounded-lg'
              onPress={() => navigation.navigate('Chart')}
            >
              <Text className='text-center text-gray-600 font-medium'>
                Show More
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <BottomNavBar onTransactionAdded={loadSavedData} />
    </SafeAreaView>
  );
}