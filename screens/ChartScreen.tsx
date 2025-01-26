import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { loadTransactions, Transaction } from '../utils/storage';
import { useCurrency } from '../context/CurrencyContext';
import { Category, incomeCategories, expenseCategories } from '../utils/categories';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Chart: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(82, 82, 82, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  propsForDots: {
    r: '3',
    strokeWidth: '1',
    stroke: '#525252'
  },
  propsForLabels: {
    fontSize: 10,
    fontFamily: 'System',
  },
  decimalPlaces: 0,
};

export default function ChartScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { selectedCurrency } = useCurrency();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadTransactions().then(setTransactions);
  }, []);

  // İstatistiksel verileri hesapla
  const stats = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        mostUsedCategory: 'N/A',
        highestTransaction: {
          amount: 0,
          category: 'N/A'
        }
      };
    }

    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.currency === selectedCurrency.code)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense' && t.currency === selectedCurrency.code)
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    const allCategories = [...incomeCategories, ...expenseCategories];
    const mostUsedCategory = Object.entries(
      transactions
        .filter(t => t.currency === selectedCurrency.code)
        .reduce((acc, t) => {
          const category = allCategories.find(c => c.id === t.categoryId)?.name || 'Other';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
    ).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    const highestTransaction = transactions
      .filter(t => t.currency === selectedCurrency.code)
      .reduce((max, t) => t.amount > max.amount ? t : max, 
        { amount: 0, categoryId: '' }
      );

    const highestCategory = allCategories.find(c => c.id === highestTransaction.categoryId)?.name || 'N/A';

    return {
      totalIncome,
      totalExpense,
      balance,
      mostUsedCategory,
      highestTransaction: {
        amount: highestTransaction.amount,
        category: highestCategory
      }
    };
  }, [transactions, selectedCurrency.code]);

  // Son 7 günlük işlemleri grupla
  const last7DaysData = useMemo(() => {
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return date;
    });

    const dailyData = dates.reduce((acc, date) => {
      acc[date.toISOString().split('T')[0]] = { income: 0, expense: 0 };
      return acc;
    }, {} as { [key: string]: { income: number; expense: number } });

    if (transactions && transactions.length > 0) {
      transactions
        .filter(t => t.currency === selectedCurrency.code)
        .forEach(transaction => {
          const date = new Date(transaction.date).toISOString().split('T')[0];
          if (dailyData[date]) {
            if (transaction.type === 'income') {
              dailyData[date].income += transaction.amount;
            } else {
              dailyData[date].expense += transaction.amount;
            }
          }
        });
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      labels: dates.map(date => dayNames[date.getDay()]),
      datasets: [
        {
          data: Object.values(dailyData).map(d => d.income || 0),
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: Object.values(dailyData).map(d => d.expense || 0),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  }, [transactions, selectedCurrency.code]);

  // Kategori dağılımını hesapla
  const categoryData = useMemo(() => {
    const allCategories = [...incomeCategories, ...expenseCategories];
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense' && t.currency === selectedCurrency.code)
      .reduce((acc, t) => {
        const category = allCategories.find(c => c.id === t.categoryId)?.name || 'Other';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    const total = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([name, amount]) => ({
        name,
        amount,
        color: allCategories.find(c => c.name === name)?.color || '#525252',
        legendFontColor: '#525252',
        legendFontSize: 12,
        percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0'
      }));
  }, [transactions, selectedCurrency.code]);

  // Gelir/Gider dağılımı
  const incomeExpenseData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [
        {
          name: 'Income',
          amount: 0,
          color: '#22C55E',
          legendFontColor: '#525252',
          legendFontSize: 12,
          percentage: '0.0'
        },
        {
          name: 'Expense',
          amount: 0,
          color: '#EF4444',
          legendFontColor: '#525252',
          legendFontSize: 12,
          percentage: '0.0'
        }
      ];
    }

    const total = stats.totalIncome + stats.totalExpense;
    return [
      {
        name: 'Income',
        amount: stats.totalIncome,
        color: '#22C55E',
        legendFontColor: '#525252',
        legendFontSize: 12,
        percentage: total > 0 ? ((stats.totalIncome / total) * 100).toFixed(1) : '0.0'
      },
      {
        name: 'Expense',
        amount: stats.totalExpense,
        color: '#EF4444',
        legendFontColor: '#525252',
        legendFontSize: 12,
        percentage: total > 0 ? ((stats.totalExpense / total) * 100).toFixed(1) : '0.0'
      }
    ];
  }, [stats.totalIncome, stats.totalExpense]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 py-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Ionicons name="arrow-back" size={24} color="#525252" />
            </TouchableOpacity>
            <Text className="text-xl font-medium text-gray-800">Financial Overview</Text>
            <View className="w-10" />
          </View>

          {/* Summary Cards */}
          <View className="flex-row justify-between mb-6">
            <View className="flex-1 bg-gray-50 rounded-lg p-3 mr-2">
              <Text className="text-xs text-gray-500">Income</Text>
              <Text className="text-sm font-medium text-green-500" numberOfLines={1}>
                {selectedCurrency.symbol}{stats.totalIncome.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-lg p-3 mx-2">
              <Text className="text-xs text-gray-500">Expenses</Text>
              <Text className="text-sm font-medium text-red-500" numberOfLines={1}>
                {selectedCurrency.symbol}{stats.totalExpense.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-lg p-3 ml-2">
              <Text className="text-xs text-gray-500">Balance</Text>
              <Text className={`text-sm font-medium ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`} numberOfLines={1}>
                {selectedCurrency.symbol}{stats.balance.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Weekly Trend */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-800 mb-3">Weekly Trend</Text>
            <View className="bg-gray-50 rounded-lg p-3">
              <LineChart
                data={last7DaysData}
                width={screenWidth - 40}
                height={180}
                chartConfig={{
                  ...chartConfig,
                  formatYLabel: (value) => Number(value).toLocaleString(),
                }}
                bezier
                style={{
                  marginVertical: 4,
                  borderRadius: 12
                }}
                yAxisLabel={selectedCurrency.symbol}
                yAxisInterval={1}
                withDots={true}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                segments={4}
                fromZero
              />
              <View className="flex-row justify-evenly mt-2 space-x-4">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                  <Text className="text-xs text-gray-600">Income</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                  <Text className="text-xs text-gray-600">Expense</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Income/Expense Distribution */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-800 mb-3">Income vs Expense</Text>
            <View className="bg-gray-50 rounded-lg p-3">
              <PieChart
                data={incomeExpenseData}
                width={screenWidth - 40}
                height={160}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute={false}
                hasLegend={false}
                center={[screenWidth / 4, 0]}
              />
              <View className="mt-2 space-y-2">
                {incomeExpenseData.map((item, index) => (
                  <View key={index} className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View 
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: item.color }} 
                      />
                      <Text className="text-xs text-gray-600 flex-1">{item.name}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-xs text-gray-800 mr-1" numberOfLines={1}>
                        {selectedCurrency.symbol}{item.amount.toLocaleString()}
                      </Text>
                      <Text className="text-xs text-gray-500">({item.percentage}%)</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          
          {/* Additional Stats */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-800 mb-3">Quick Stats</Text>
            <View className="bg-gray-50 rounded-lg p-3 space-y-3">
              <View>
                <Text className="text-xs text-gray-500">Most Used Category</Text>
                <Text className="text-sm text-gray-800" numberOfLines={1}>{stats.mostUsedCategory}</Text>
              </View>
              <View>
                <Text className="text-xs text-gray-500">Highest Transaction</Text>
                <Text className="text-sm text-gray-800" numberOfLines={1}>
                  {selectedCurrency.symbol}{stats.highestTransaction.amount.toLocaleString()} ({stats.highestTransaction.category})
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
