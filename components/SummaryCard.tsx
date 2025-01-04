import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchExchangeRates, convertAmount } from '../utils/currency';
import { useCurrency } from '../context/CurrencyContext';

interface SummaryCardProps {
  totalIncome: number;
  totalExpense: number;
}

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'TRY', symbol: '₺' },
];

export default function SummaryCard({ totalIncome, totalExpense }: SummaryCardProps) {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const balance = totalIncome - totalExpense;

  useEffect(() => {
    loadExchangeRates();
  }, [selectedCurrency.code]);

  const loadExchangeRates = async () => {
    setIsLoading(true);
    try {
      const rates = await fetchExchangeRates(selectedCurrency.code);
      setExchangeRates(rates);
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrencyChange = (currency: typeof currencies[0]) => {
    setSelectedCurrency(currency);
    setShowCurrencyModal(false);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  // Convert from USD to selected currency
  const convertedBalance = convertAmount(balance, 'USD', selectedCurrency.code, exchangeRates);
  const convertedIncome = convertAmount(totalIncome, 'USD', selectedCurrency.code, exchangeRates);
  const convertedExpense = convertAmount(totalExpense, 'USD', selectedCurrency.code, exchangeRates);

  return (
    <View className='p-6 rounded-3xl w-full'>
      {/* Total Balance */}
      <View className='items-center mb-4'>
        <Text className='text-black text-sm opacity-90'>Total Balance</Text>
        <View className='flex-row items-center'>
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className='text-black text-3xl font-bold'>
              {selectedCurrency.symbol}{formatAmount(convertedBalance)}
            </Text>
          )}
          <TouchableOpacity 
            onPress={() => setShowCurrencyModal(true)}
            className='ml-2 p-2'
          >
            <Ionicons name="chevron-down" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Income and Expense Summary */}
      <View className='flex-row justify-between mt-2'>
        {/* Income */}
        <View className='items-center bg-white/20 rounded-2xl p-3 flex-1 mr-2'>
          <Text className='text-black text-sm'>Income</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className='text-black text-lg font-semibold'>
              {selectedCurrency.symbol}{formatAmount(convertedIncome)}
            </Text>
          )}
        </View>

        {/* Expense */}
        <View className='items-center bg-white/20 rounded-2xl p-3 flex-1 ml-2'>
          <Text className='text-black text-sm'>Expense</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className='text-black text-lg font-semibold'>
              {selectedCurrency.symbol}{formatAmount(convertedExpense)}
            </Text>
          )}
        </View>
      </View>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View className='flex-1 justify-end'>
          <View className='bg-white rounded-t-3xl'>
            <View className='p-4 border-b border-gray-200'>
              <Text className='text-xl font-bold text-center'>Select Currency</Text>
            </View>
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                className='p-4 border-b border-gray-100'
                onPress={() => handleCurrencyChange(currency)}
              >
                <Text className='text-lg text-center'>
                  {currency.code} ({currency.symbol})
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              className='p-4'
              onPress={() => setShowCurrencyModal(false)}
            >
              <Text className='text-lg text-center text-red-500'>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}