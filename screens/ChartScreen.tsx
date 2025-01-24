import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Transaction } from '../utils/storage';
import { useCurrency } from '../context/CurrencyContext';
import { loadTransactions } from '../utils/storage';
import BottomNavBar from '../components/BottomNavBar';
import TimeRangeSelector, { TimeRange } from '../components/TimeRangeSelector';

type TransactionType = 'income' | 'expense';

export default function ChartScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7D');
  const { selectedCurrency } = useCurrency();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchTransactions = async () => {
      const savedTransactions = await loadTransactions();
      setTransactions(savedTransactions);
    };

    fetchTransactions();
  }, []);

  const getDateRangeStart = (range: TimeRange): Date => {
    const now = new Date();
    switch (range) {
      case '1D':
        return new Date(now.setDate(now.getDate() - 1));
      case '7D':
        return new Date(now.setDate(now.getDate() - 7));
      case '30D':
        return new Date(now.setDate(now.getDate() - 30));
      case '3M':
        return new Date(now.setMonth(now.getMonth() - 3));
      case '6M':
        return new Date(now.setMonth(now.getMonth() - 6));
      case '1Y':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      case 'ALL':
        return new Date(0); // Beginning of time
      default:
        return new Date(now.setDate(now.getDate() - 7));
    }
  };

  const getDaysInRange = (range: TimeRange): number => {
    switch (range) {
      case '1D': return 1;
      case '7D': return 7;
      case '30D': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      case 'ALL':
        if (transactions.length === 0) return 365;
        const oldest = new Date(Math.min(...transactions.map(t => new Date(t.date).getTime())));
        const now = new Date();
        return Math.ceil((now.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24));
      default:
        return 7;
    }
  };

  const getDateLabel = (date: Date, range: TimeRange): string => {
    switch (range) {
      case '1D':
        return date.toLocaleTimeString([], { hour: '2-digit', hour12: false });
      case '7D':
        return date.toLocaleDateString([], { day: 'numeric' });
      case '30D':
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
      case '3M':
      case '6M':
        return date.toLocaleDateString([], { month: 'short' });
      case '1Y':
      case 'ALL':
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString([], { day: 'numeric' });
    }
  };

  const getChartData = () => {
    const days = getDaysInRange(selectedRange);
    const rangeStart = getDateRangeStart(selectedRange);
    const interval = Math.max(1, Math.floor(days / 6)); // Max 6 points on the chart

    const dates = Array.from({ length: Math.ceil(days / interval) }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (i * interval));
      return d;
    }).reverse();

    const data = dates.map(date => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === selectedType && 
                 tDate >= startOfDay && 
                 tDate <= endOfDay;
        })
        .reduce((sum, t) => sum + t.amount, 0);
    });

    return {
      labels: dates.map(d => getDateLabel(d, selectedRange)),
      datasets: [
        {
          data,
          color: (opacity = 1) => selectedType === 'income' 
            ? `rgba(46, 204, 113, ${opacity})`
            : `rgba(231, 76, 60, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  const categoryData = () => {
    const rangeStart = getDateRangeStart(selectedRange);
    const transactionsByCategory = transactions
      .filter(t => t.type === selectedType && new Date(t.date) >= rangeStart)
      .reduce((acc, t) => {
        acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#2ECC71', '#E74C3C', '#3498DB', '#F1C40F'
    ];

    return Object.entries(transactionsByCategory).map(([category, amount], index) => ({
      name: category,
      amount,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row justify-evenly space-x-2 p-4">
        <TouchableOpacity
            onPress={() => setSelectedType('income')}
            className={`px-6 py-2 rounded-lg border ${
              selectedType === 'income' 
                ? 'bg-white border-green-500' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <Text className={`${
              selectedType === 'income' ? 'text-green-500' : 'text-gray-600'
            } font-medium`}>
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedType('expense')}
            className={`px-6 py-2 rounded-lg border ${
              selectedType === 'expense' 
                ? 'bg-white border-red-500' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <Text className={`${
              selectedType === 'expense' ? 'text-red-500' : 'text-gray-600'
            } font-medium`}>
              Expenses
            </Text>
          </TouchableOpacity>
          
        </View>

        <TimeRangeSelector
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
        />
      </View>

      <ScrollView>
        <View className="p-4 bg-white mt-2 rounded-lg mx-2">
          <Text className="text-lg font-semibold mb-4 text-gray-800">
            {selectedType === 'income' ? 'Income' : 'Expense'} Chart
          </Text>
          <LineChart
            data={getChartData()}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              ...chartConfig,
              propsForLabels: {
                fontSize: 12,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>

        <View className="p-4 bg-white mt-2 rounded-lg mx-2 mb-4">
          <Text className="text-lg font-semibold mb-4 text-gray-800">
            {selectedType === 'income' ? 'Income' : 'Expense'} by Category
          </Text>
          <PieChart
            data={categoryData()}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
}
