import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import TransactionModal from './TransactionModal';
import { Transaction, saveTransactions, saveTotals, loadTransactions, loadTotals } from '../utils/storage';

type RootStackParamList = {
  Home: undefined;
  Chart: undefined;
  About: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  onTransactionAdded?: () => void;
}

type MenuItem = {
  name: string;
  icon: string;
  route?: keyof RootStackParamList;
  color?: string;
  onPress?: () => void;
};

export default function BottomNavBar({ onTransactionAdded }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');

  const handleAddTransaction = async (amount: number, description: string, currency: string, categoryId: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount,
      description,
      currency,
      categoryId,
      type: transactionType,
      date: new Date().toISOString(),
    };

    try {
      const existingTransactions = await loadTransactions();
      const transactions = [newTransaction, ...existingTransactions];
      await saveTransactions(transactions);

      const totals = await loadTotals();
      const newTotalIncome = transactionType === 'income' ? 
        (totals.totalIncome || 0) + amount : 
        (totals.totalIncome || 0);
      const newTotalExpense = transactionType === 'expense' ? 
        (totals.totalExpense || 0) + amount : 
        (totals.totalExpense || 0);
      
      await saveTotals(newTotalIncome, newTotalExpense);

      setModalVisible(false);
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const menuItems: MenuItem[] = [
    { 
      name: 'Home', 
      icon: 'home-outline',
      route: 'Home'
    },
    { 
      name: 'Income', 
      icon: 'add-circle',
      color: '#4CAF50',
      onPress: () => {
        setTransactionType('income');
        setModalVisible(true);
      }
    },
    { 
      name: 'Expense', 
      icon: 'remove-circle',
      color: '#F44336',
      onPress: () => {
        setTransactionType('expense');
        setModalVisible(true);
      }
    },
    { 
      name: 'Chart', 
      icon: 'bar-chart-outline',
      route: 'Chart'
    }
  ];

  const renderMenuItem = (item: MenuItem) => {
    const isActive = item.route && route.name === item.route;
    return (
      <TouchableOpacity
        key={item.name}
        onPress={() => {
          if (item.route) {
            navigation.navigate(item.route);
          } else if (item.onPress) {
            item.onPress();
          }
        }}
        className={`items-center px-4 py-2 flex-1`}
      >
        <Ionicons
          name={item.icon as any}
          size={24}
          color={
            item.color ? item.color :
            isActive ? '#2196F3' : '#9CA3AF'
          }
        />
        <Text
          className={`text-xs mt-1 ${
            item.color ? 
              item.color === '#4CAF50' ? 'text-green-500' : 'text-red-500' :
              isActive ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-white border-t border-gray-200 pt-2">
      <View className="flex-row justify-between items-center">
        {menuItems.map(renderMenuItem)}
      </View>

      <TransactionModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddTransaction}
        type={transactionType}
      />
    </View>
  );
}
