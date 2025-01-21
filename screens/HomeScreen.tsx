import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated, Platform, Image, Alert, TextInput, Modal } from 'react-native';
import { GestureHandlerRootView, DrawerLayout } from 'react-native-gesture-handler';
import SummaryCard from '../components/SummaryCard';
import { Ionicons } from '@expo/vector-icons';
import TransactionModal from '../components/TransactionModal';
import { Transaction, saveTransactions, saveTotals, loadTransactions, loadTotals } from '../utils/storage';
import { fetchExchangeRates, convertAmount } from '../utils/currency';
import { useCurrency } from '../context/CurrencyContext';
import { incomeCategories, expenseCategories } from '../utils/categories';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Category } from '../types';

type RootStackParamList = {
  Home: undefined;
  Transactions: { transactions: Transaction[] };
  About: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({});
  const { selectedCurrency } = useCurrency();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const drawerRef = useRef<DrawerLayout>(null);

  // Animation values
  const animation = useRef(new Animated.Value(0)).current;

  // Add new state for custom categories
  const [customIncomeCategories, setCustomIncomeCategories] = useState<typeof incomeCategories>([]);
  const [customExpenseCategories, setCustomExpenseCategories] = useState<typeof expenseCategories>([]);
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

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

  const handleLongPress = (transaction: Transaction) => {
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
          onPress: () => handleDeleteTransaction(transaction.id),
        },
      ],
      { cancelable: true }
    );
  };

  const getCategoryDetails = (transaction: Transaction) => {
    const defaultCategories = transaction.type === 'income' ? incomeCategories : expenseCategories;
    const customCategories = transaction.type === 'income' ? customIncomeCategories : customExpenseCategories;
    const allCategories = [...defaultCategories, ...customCategories];
    return allCategories.find(cat => cat.id === transaction.categoryId) || defaultCategories[0];
  };

  const openModal = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setModalVisible(true);
    toggleMenu(); // Close the FAB menu
  };

  const incomeStyle = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
    ],
    opacity: animation,
  };

  const expenseStyle = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 80],
        }),
      },
    ],
    opacity: animation,
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

  const renderDrawerContent = () => {
    return (
      <View className="flex-1 bg-white pt-12 px-4">
        <TouchableOpacity 
          className="flex-row items-center p-4"
          onPress={() => {
            drawerRef.current?.closeDrawer();
            navigation.navigate('About');
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color="#374151" />
          <Text className="ml-3 text-gray-800 text-lg">About</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Add function to handle adding custom categories
  const handleAddCustomCategory = (type: 'income' | 'expense', category: Category) => {
    if (type === 'income') {
      setCustomIncomeCategories(prev => [...prev, category]);
    } else {
      setCustomExpenseCategories(prev => [...prev, category]);
    }
  };

  const handleAddCategoryPress = () => {
    setIsAddCategoryModalVisible(true);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: `custom-${Date.now()}`,
        name: newCategoryName.trim(),
        type: transactionType as 'income' | 'expense',
        image: null,
        icon: transactionType === 'income' ? 'add-circle-outline' : 'remove-circle-outline',
      };
      handleAddCustomCategory(transactionType as 'income' | 'expense', newCategory);
      setNewCategoryName('');
      setIsAddCategoryModalVisible(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DrawerLayout
          ref={drawerRef}
          drawerWidth={250}
          drawerPosition="left"
          renderNavigationView={renderDrawerContent}
        >
          <View className='px-4 py-2'>
            {!isSearchVisible ? (
              <View className='flex-row justify-between items-center'>
                <TouchableOpacity
                  className='p-2'
                  onPress={() => drawerRef.current?.openDrawer()}
                >
                  <Ionicons name="menu" size={24} color="#374151" />
                </TouchableOpacity>

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
                    onLongPress={() => handleLongPress(transaction)}
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
                  onPress={() => navigation.navigate('Transactions', { transactions })}
                >
                  <Text className='text-center text-gray-600 font-medium'>
                    Show More
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {isExpanded && (
            <TouchableOpacity
              className="absolute inset-0"
              onPress={toggleMenu}
              activeOpacity={1}
            />
          )}

          <View className='absolute bottom-8 left-0 right-0 items-center'>
            <Animated.View style={[incomeStyle]} className='absolute'>
              <TouchableOpacity 
                className='bg-green-500 w-14 h-14 rounded-full items-center justify-center shadow-lg'
                onPress={() => openModal('income')}
              >
                <Ionicons name="arrow-up" size={24} color="white" />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[expenseStyle]} className='absolute'>
              <TouchableOpacity 
                className='bg-red-500 w-14 h-14 rounded-full items-center justify-center shadow-lg'
                onPress={() => openModal('expense')}
              >
                <Ionicons name="arrow-down" size={24} color="white" />
              </TouchableOpacity>
            </Animated.View>

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

          <TransactionModal
            isVisible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSubmit={handleAddTransaction}
            type={transactionType}
            customCategories={transactionType === 'income' ? customIncomeCategories : customExpenseCategories}
            onAddCustomCategory={(category: Category) => handleAddCustomCategory(transactionType as 'income' | 'expense', category)}
            onAddCategoryPress={handleAddCategoryPress}
          />

          <Modal
            animationType="slide"
            transparent={true}
            visible={isAddCategoryModalVisible}
            onRequestClose={() => setIsAddCategoryModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white p-6 rounded-lg w-4/5">
                <Text className="text-lg font-semibold mb-4">Add New Category</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2 mb-4"
                  placeholder="Category Name"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
                <View className="flex-row justify-end">
                  <TouchableOpacity
                    className="px-4 py-2 mr-2"
                    onPress={() => {
                      setNewCategoryName('');
                      setIsAddCategoryModalVisible(false);
                    }}
                  >
                    <Text className="text-gray-600">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                    onPress={handleAddCategory}
                  >
                    <Text className="text-white">Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </DrawerLayout>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}