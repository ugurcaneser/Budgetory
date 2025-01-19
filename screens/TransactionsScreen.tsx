import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../utils/storage';
import { incomeCategories, expenseCategories } from '../utils/categories';
import { useCurrency } from '../context/CurrencyContext';
import { convertAmount } from '../utils/currency';

type TransactionsScreenProps = {
  route: { params: { transactions: Transaction[] } };
  navigation: any;
};

export default function TransactionsScreen({ route, navigation }: TransactionsScreenProps) {
  const { transactions } = route.params;
  const { selectedCurrency } = useCurrency();

  const getCategoryDetails = (transaction: Transaction) => {
    const categories = transaction.type === 'income' ? incomeCategories : expenseCategories;
    return categories.find(cat => cat.id === transaction.categoryId) || categories[0];
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${selectedCurrency.symbol}${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      {/* Header */}
      <View className='flex-row items-center justify-between px-4 py-2 border-b border-gray-100'>
        <View className='flex-row items-center'>
          <TouchableOpacity
            className='p-2'
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className='text-xl font-bold text-gray-800 ml-2'>
            All Transactions
          </Text>
        </View>
        <TouchableOpacity
          className='p-2'
          onPress={() => Alert.alert('Filter', 'Filter functionality will be added soon')}
        >
          <Ionicons name="filter" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView className='flex-1'>
        <View className='px-6'>
          {transactions.map((transaction, index) => {
            const category = getCategoryDetails(transaction);
            return (
              <View key={transaction.id} className='py-3'>
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
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 