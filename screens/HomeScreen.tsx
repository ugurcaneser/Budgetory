import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated, Platform, Image, Dimensions } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
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

  const handleDeleteTransaction = async (transactionId: string) => {
    const transactionToDelete = transactions.find(t => t.id === transactionId);
    if (!transactionToDelete) return;

    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);

    // Update totals
    if (transactionToDelete.type === 'income') {
      const newTotalIncome = totalIncome - transactionToDelete.amount;
      setTotalIncome(newTotalIncome);
    } else {
      const newTotalExpense = totalExpense - transactionToDelete.amount;
      setTotalExpense(newTotalExpense);
    }

    // Save updated data
    await Promise.all([
      saveTransactions(updatedTransactions),
      saveTotals(
        transactionToDelete.type === 'income' ? totalIncome - transactionToDelete.amount : totalIncome,
        transactionToDelete.type === 'expense' ? totalExpense - transactionToDelete.amount : totalExpense
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
          <View className='p-6 mt-4 mb-32'>
            <Text className='text-xl font-bold text-gray-800 mb-4'>
              Recent Transactions
            </Text>
            {transactions.map(transaction => (
              <Swipeable
                key={transaction.id}
                renderRightActions={(progress, dragX) => 
                  renderRightActions(progress, dragX, () => handleDeleteTransaction(transaction.id))
                }
                rightThreshold={40}
              >
                <View 
                  className={`flex-row justify-between items-center p-4 mb-2 rounded-xl ${
                    transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <View>
                    <Text className='font-semibold text-gray-800'>{transaction.description}</Text>
                    <Text className='text-sm text-gray-500'>
                      {new Date(transaction.date).toLocaleDateString('en-US', { 
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
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
              </Swipeable>
            ))}
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