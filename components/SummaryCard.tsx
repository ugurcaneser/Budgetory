import React from 'react';
import { View, Text } from 'react-native';

interface SummaryCardProps {
  totalIncome: number;
  totalExpense: number;
}

export default function SummaryCard({ totalIncome, totalExpense }: SummaryCardProps) {
  const balance = totalIncome - totalExpense;

  return (
    <View className='p-6 rounded-3xl w-full'>
      {/* Total Balance */}
      <View className='items-center mb-4'>
        <Text className='text-black text-sm opacity-90'>Total Balance</Text>
        <Text className='text-black text-3xl font-bold'>
          ${balance.toLocaleString()}
        </Text>
      </View>

      {/* Income and Expense Summary */}
      <View className='flex-row justify-between mt-2'>
        {/* Income */}
        <View className='items-center bg-white/20 rounded-2xl p-3 flex-1 mr-2'>
          <Text className='text-black text-sm'>Income</Text>
          <Text className='text-black text-lg font-semibold'>
            ${totalIncome.toLocaleString()}
          </Text>
        </View>

        {/* Expense */}
        <View className='items-center bg-white/20 rounded-2xl p-3 flex-1 ml-2'>
          <Text className='text-black text-sm'>Expense</Text>
          <Text className='text-black text-lg font-semibold'>
            ${totalExpense.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}