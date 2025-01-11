import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated, Platform, Image } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import SummaryCard from '../components/SummaryCard';
import { Ionicons } from '@expo/vector-icons';
import TransactionModal from '../components/TransactionModal';
import { Transaction, saveTransactions, saveTotals, loadTransactions, loadTotals } from '../utils/storage';
import { fetchExchangeRates, convertAmount } from '../utils/currency';
import { useCurrency } from '../context/CurrencyContext';
import { incomeCategories, expenseCategories } from '../utils/categories';

export default function HomeScreen() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({});
  const { selectedCurrency } = useCurrency();

  // Animation values
  const animation = useRef(new Animated.Value(0)).current;

  // Load saved data and exchange rates when component mounts or currency changes
  useEffect(() => {
    const loadSavedData = async () => {
      const savedTransactions = await loadTransactions();
      const savedTotals = await loadTotals();
      const rates = await fetchExchangeRates(selectedCurrency.code);
      
      setTransactions(savedTransactions);
      setTotalIncome(savedTotals.totalIncome);
      setTotalExpense(savedTotals.totalExpense);
      setExchangeRates(rates);
    };

    loadSavedData();
  }, [selectedCurrency.code]);

  const formatAmount = (amount: number, currency: string) => {
    if (!exchangeRates[currency]) return `${selectedCurrency.symbol}${amount.toFixed(2)}`;
    
    const convertedAmount = currency === selectedCurrency.code
      ? amount
      : convertAmount(amount, currency, selectedCurrency.code, exchangeRates);
    
    return `${selectedCurrency.symbol}${convertedAmount.toFixed(2)}`;
  };

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 6,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const handleAddTransaction = async (amount: number, description: string, currency: string, categoryId: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      amount,
      currency,
      description,
      date: new Date().toISOString(),
      categoryId,
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);

    // Convert amount to USD before updating totals
    const rates = await fetchExchangeRates('USD');
    const amountInUSD = currency === 'USD' ? amount : convertAmount(amount, currency, 'USD', rates);

    let newTotalIncome = totalIncome;
    let newTotalExpense = totalExpense;

    if (transactionType === 'income') {
      newTotalIncome += amountInUSD;
      setTotalIncome(newTotalIncome);
    } else {
      newTotalExpense += amountInUSD;
      setTotalExpense(newTotalExpense);
    }

    // Save updated data
    await Promise.all([
      saveTransactions(updatedTransactions),
      saveTotals(newTotalIncome, newTotalExpense),
    ]);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const transactionToDelete = transactions.find(t => t.id === transactionId);
    if (!transactionToDelete) return;

    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);

    // Convert amount to USD before updating totals
    const rates = await fetchExchangeRates('USD');
    const amountInUSD = transactionToDelete.currency === 'USD' 
      ? transactionToDelete.amount 
      : convertAmount(transactionToDelete.amount, transactionToDelete.currency, 'USD', rates);

    // Update totals
    if (transactionToDelete.type === 'income') {
      const newTotalIncome = totalIncome - amountInUSD;
      setTotalIncome(newTotalIncome);
    } else {
      const newTotalExpense = totalExpense - amountInUSD;
      setTotalExpense(newTotalExpense);
    }

    // Save updated data
    await Promise.all([
      saveTransactions(updatedTransactions),
      saveTotals(
        transactionToDelete.type === 'income' ? totalIncome - amountInUSD : totalIncome,
        transactionToDelete.type === 'expense' ? totalExpense - amountInUSD : totalExpense
      ),
    ]);
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, onDelete: () => void) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [64, 0],
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.3, 1],
    });

    return (
      <Animated.View 
        className="bg-red-500 justify-center items-center rounded-lg mr-2"
        style={{
          width: 64,
          height: 64,
          transform: [{ translateX: trans }],
          opacity,
        }}
      >
        <TouchableOpacity 
          onPress={onDelete}
          className="w-full h-full justify-center items-center"
        >
          <Animated.View>
            <Ionicons name="trash-outline" size={24} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const getCategoryDetails = (transaction: Transaction) => {
    const categories = transaction.type === 'income' ? incomeCategories : expenseCategories;
    return categories.find(cat => cat.id === transaction.categoryId) || categories[0];
  };

  const openModal = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setModalVisible(true);
    toggleMenu(); // Close the FAB menu
  };

  const incomeStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -120],
        }),
      },
    ],
    opacity: animation,
  };

  const expenseStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -60],
        }),
      },
    ],
    opacity: animation,
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView 
          className='flex-1'
          contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 25 : 0 }}
        >
          {/* Header with Summary Card */}
          <View className='px-4'>
            <SummaryCard 
              totalIncome={totalIncome}
              totalExpense={totalExpense}
            />
          </View>

          {/* Recent Transactions */}
          <View className='px-6 mt-4 mb-32'>
            <Text className='text-xl font-bold text-gray-800 mb-2'>
              Recent Transactions
            </Text>
            {transactions.map((transaction, index) => {
              const category = getCategoryDetails(transaction);
              return (
                <Swipeable
                  key={transaction.id}
                  renderRightActions={(progress, dragX) => 
                    renderRightActions(progress, dragX, () => handleDeleteTransaction(transaction.id))
                  }
                  rightThreshold={40}
                >
                  <View className='py-3'>
                    <View className='flex-row justify-between items-center'>
                      <View className='flex-row items-center flex-1 mr-3'>
                        <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${
                          transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          {category.image ? (
                            <Image 
                              source={category.image}
                              className='w-5 h-5'
                              resizeMode='contain'
                            />
                          ) : (
                            <Ionicons 
                              name={category.icon as any} 
                              size={16} 
                              color={transaction.type === 'income' ? '#22c55e' : '#ef4444'} 
                            />
                          )}
                        </View>
                        <View className='flex-1'>
                          <View className='flex-row items-center'>
                            <Text className='text-sm font-medium text-gray-800'>{category.name}</Text>
                            {transaction.description && (
                              <Text className='text-xs text-gray-400 ml-2' numberOfLines={1}>
                                • {transaction.description}
                              </Text>
                            )}
                          </View>
                          <Text className='text-xs text-gray-400'>
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>
                      <Text 
                        className={`text-sm font-medium ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'} {selectedCurrency.symbol}{transaction.amount.toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                    {index < transactions.length - 1 && (
                      <View className='h-[0.5px] bg-gray-100 mt-3' />
                    )}
                  </View>
                </Swipeable>
              );
            })}
          </View>
        </ScrollView>

        {/* Overlay for closing FAB menu */}
        {isExpanded && (
          <TouchableOpacity
            className="absolute inset-0"
            onPress={toggleMenu}
            activeOpacity={1}
          />
        )}

        {/* Floating Action Buttons */}
        <View className='absolute bottom-8 left-0 right-0 items-center'>
          {/* Income Button */}
          <Animated.View style={[incomeStyle]} className='absolute'>
            <TouchableOpacity 
              className='bg-green-500 w-14 h-14 rounded-full items-center justify-center shadow-lg'
              onPress={() => openModal('income')}
            >
              <Ionicons name="arrow-up" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>

          {/* Expense Button */}
          <Animated.View style={[expenseStyle]} className='absolute'>
            <TouchableOpacity 
              className='bg-red-500 w-14 h-14 rounded-full items-center justify-center shadow-lg'
              onPress={() => openModal('expense')}
            >
              <Ionicons name="arrow-down" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>

          {/* Main Action Button */}
          <TouchableOpacity 
            className='w-16 h-16 items-center justify-center'
            onPress={toggleMenu}
          >
            <View>
              <Image 
                source={require('../assets/mainFAB.png')} 
                className='w-16 h-16'
                resizeMode='contain'
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Transaction Modal */}
        <TransactionModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleAddTransaction}
          type={transactionType}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}