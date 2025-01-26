import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, TextInput, ScrollView, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import TransactionModal from './TransactionModal';
import { Transaction, saveTransactions, saveTotals, loadTransactions, loadTotals } from '../utils/storage';
import { incomeCategories, expenseCategories } from '../utils/categories';
import { useCurrency } from '../context/CurrencyContext';

type RootStackParamList = {
  Home: undefined;
  Chart: undefined;
  Settings: undefined;
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
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const { selectedCurrency } = useCurrency();

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredTransactions([]);
      return;
    }

    try {
      const allTransactions = await loadTransactions();
      const searchText = text.toLowerCase();
      const filtered = allTransactions.filter(transaction => {
        const category = getCategoryDetails(transaction);
        return (
          category.name.toLowerCase().includes(searchText) ||
          transaction.description?.toLowerCase().includes(searchText)
        );
      });
      setFilteredTransactions(filtered);
    } catch (error) {
      console.error('Error searching transactions:', error);
    }
  };

  const getCategoryDetails = (transaction: Transaction) => {
    const defaultCategories = transaction.type === 'income' ? incomeCategories : expenseCategories;
    return defaultCategories.find(cat => cat.id === transaction.categoryId) || defaultCategories[0];
  };

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
      name: 'Search', 
      icon: 'search-outline',
      onPress: () => setSearchModalVisible(true)
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
    },
    {
      name: 'Settings',
      icon: 'settings-outline',
      route: 'Settings'
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
    <>
      <View className="bg-white border-t border-gray-200 pt-2">
        <View className="flex-row justify-between items-center">
          {menuItems.map(renderMenuItem)}
        </View>
      </View>

      <TransactionModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddTransaction}
        type={transactionType}
      />

      <Modal
        visible={searchModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setSearchModalVisible(false);
          setSearchQuery('');
          setFilteredTransactions([]);
        }}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-4 py-10 mt-2 border-b border-gray-200">
            <View className="flex-row items-center bg-gray-100 rounded-lg px-2">
              <TouchableOpacity
                className="p-2"
                onPress={() => {
                  setSearchModalVisible(false);
                  setSearchQuery('');
                  setFilteredTransactions([]);
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
              <TextInput
                className="flex-1 py-2 px-3"
                placeholder="Search transactions..."
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  className="p-2"
                  onPress={() => {
                    setSearchQuery('');
                    setFilteredTransactions([]);
                  }}
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ 
              paddingBottom: Platform.OS === 'ios' ? 20 : 0 
            }}
          >
            {filteredTransactions.map((transaction) => {
              const category = getCategoryDetails(transaction);
              return (
                <View
                  key={transaction.id}
                  className="flex-row items-center justify-between p-4 border-b border-gray-100"
                >
                  <View className="flex-row items-center flex-1">
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
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-base font-medium text-gray-800">{category.name}</Text>
                        <Text className="text-sm text-gray-400 ml-2">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                      {transaction.description && (
                        <Text className="text-sm text-gray-400" numberOfLines={1}>
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
                </View>
              );
            })}
            {searchQuery && filteredTransactions.length === 0 && (
              <View className="p-4">
                <Text className="text-center text-gray-500">
                  No transactions found
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
