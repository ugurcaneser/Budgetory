import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Platform, Image, Alert } from 'react-native';
import SummaryCard from '../components/SummaryCard';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, loadTransactions, loadTotals, saveTransactions, saveTotals } from '../utils/storage';
import { fetchExchangeRates, convertAmount } from '../utils/currency';
import { useCurrency } from '../context/CurrencyContext';
import { incomeCategories, expenseCategories } from '../utils/categories';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BottomNavBar from '../components/BottomNavBar';

type RootStackParamList = {
  Home: undefined;
  Chart: undefined;
  Settings: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({});
  const { selectedCurrency } = useCurrency();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadSavedData();
  }, [selectedCurrency]);

  const loadSavedData = async () => {
    try {
      const savedTransactions = await loadTransactions();
      const rates = await fetchExchangeRates(selectedCurrency.code);
      
      // Transaction'lara göre totalleri hesapla
      const newTotalIncome = savedTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const newTotalExpense = savedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // State'leri güncelle
      setTransactions(savedTransactions);
      setTotalIncome(newTotalIncome);
      setTotalExpense(newTotalExpense);
      setExchangeRates(rates);

      // Totalleri kaydet
      await saveTotals(newTotalIncome, newTotalExpense);
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const getCategoryDetails = (transaction: Transaction) => {
    const defaultCategories = transaction.type === 'income' ? incomeCategories : expenseCategories;
    return defaultCategories.find(cat => cat.id === transaction.categoryId) || defaultCategories[0];
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView 
        className='flex-1'
        contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 0 : 0 }}
      >
        <View className='px-4'>
          <SummaryCard 
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />
        </View>

        <View className='px-6 mt-4 mb-32'>
          <Text className='text-xl font-bold text-gray-800 mb-2'>
            Recent Transactions
          </Text>
          
          {transactions.slice(0, 5).map((transaction, index) => {
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
                          await saveTransactions(updatedTransactions);
                          
                          // Update totals
                          if (transaction.type === 'income') {
                            const newTotalIncome = totalIncome - transaction.amount;
                            setTotalIncome(newTotalIncome);
                            await saveTotals(newTotalIncome, totalExpense);
                          } else {
                            const newTotalExpense = totalExpense - transaction.amount;
                            setTotalExpense(newTotalExpense);
                            await saveTotals(totalIncome, newTotalExpense);
                          }
                          
                          setTransactions(updatedTransactions);
                        },
                      },
                    ]
                  );
                }}
                className={`flex-row items-center justify-between p-4 mb-2 rounded-xl ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <View className='flex-row items-center flex-1'>
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
                    transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {selectedCurrency.symbol}
                  {transaction.amount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            );
          })}

          {transactions.length > 5 && (
            <TouchableOpacity
              className='bg-gray-50 py-3 px-4 rounded-xl mt-2'
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