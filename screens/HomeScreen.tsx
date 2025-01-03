import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated, Platform } from 'react-native';
import SummaryCard from '../components/SummaryCard';
import { Ionicons } from '@expo/vector-icons';
import TransactionModal from '../components/TransactionModal';
import { Transaction, saveTransactions, saveTotals, loadTransactions, loadTotals } from '../utils/storage';

export default function HomeScreen() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');

  // Animation values
  const animation = useRef(new Animated.Value(0)).current;

  // Load saved data when component mounts
  useEffect(() => {
    const loadSavedData = async () => {
      const savedTransactions = await loadTransactions();
      const savedTotals = await loadTotals();
      
      setTransactions(savedTransactions);
      setTotalIncome(savedTotals.totalIncome);
      setTotalExpense(savedTotals.totalExpense);
    };

    loadSavedData();
  }, []);

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 6,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const handleAddTransaction = async (amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionType,
      amount,
      description,
      date: new Date().toISOString(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);

    let newTotalIncome = totalIncome;
    let newTotalExpense = totalExpense;

    if (transactionType === 'income') {
      newTotalIncome += amount;
      setTotalIncome(newTotalIncome);
    } else {
      newTotalExpense += amount;
      setTotalExpense(newTotalExpense);
    }

    // Save updated data
    await Promise.all([
      saveTransactions(updatedTransactions),
      saveTotals(newTotalIncome, newTotalExpense),
    ]);
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
    <SafeAreaView className='flex-1 bg-gray-50'>
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
        <View className='p-4 mt-4 mb-32'>
          <Text className='text-xl font-bold text-gray-800 mb-4'>
            Recent Transactions
          </Text>
          {transactions.map(transaction => (
            <View 
              key={transaction.id}
              className={`flex-row justify-between items-center p-4 mb-2 rounded-xl ${
                transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <View>
                <Text className='font-semibold text-gray-800'>{transaction.description}</Text>
                <Text className='text-sm text-gray-500'>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
              <Text 
                className={`text-lg font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

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
          className='bg-blue-500 w-16 h-16 rounded-full items-center justify-center shadow-lg'
          onPress={toggleMenu}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="add" size={32} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Transaction Modal */}
      <TransactionModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddTransaction}
        type={transactionType}
      />
    </SafeAreaView>
  );
}