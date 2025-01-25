import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Transaction } from '../utils/storage';
import { useCurrency } from '../context/CurrencyContext';
import { loadTransactions } from '../utils/storage';
import BottomNavBar from '../components/BottomNavBar';
import TimeRangeSelector, { TimeRange } from '../components/TimeRangeSelector';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Chart: undefined;
  About: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

type TransactionType = 'income' | 'expense';

export default function ChartScreen() {
  const navigation = useNavigation<NavigationProp>();
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
    const interval = Math.max(1, Math.floor(days / 6));

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

    const gradientColor = selectedType === 'income' 
      ? ['rgba(46, 204, 113, 0.2)', 'rgba(46, 204, 113, 0)']
      : ['rgba(231, 76, 60, 0.2)', 'rgba(231, 76, 60, 0)'];

    return {
      labels: dates.map(d => getDateLabel(d, selectedRange)),
      datasets: [
        {
          data,
          color: (opacity = 1) => selectedType === 'income' 
            ? `rgba(46, 204, 113, ${opacity})`
            : `rgba(231, 76, 60, ${opacity})`,
          strokeWidth: 3,
          withDots: true,
          withShadow: true,
          gradient: {
            colors: gradientColor,
            locations: [0, 1]
          }
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

    // Kategorileri tutara göre sırala (büyükten küçüğe)
    const sortedCategories = Object.entries(transactionsByCategory)
      .sort(([, a], [, b]) => b - a);

    const colors = [
      '#2ECC71', // Yeşil
      '#3498DB', // Mavi
      '#9B59B6', // Mor
      '#E74C3C', // Kırmızı
      '#F1C40F', // Sarı
      '#E67E22', // Turuncu
      '#1ABC9C', // Turkuaz
      '#34495E', // Lacivert
      '#7F8C8D', // Gri
      '#95A5A6'  // Açık gri
    ];

    return sortedCategories.map(([category, amount], index) => ({
      name: category,
      amount,
      color: colors[index % colors.length],
      legendFontColor: '#2D3748',
      legendFontSize: 14
    }));
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => selectedType === 'income'
      ? `rgba(46, 204, 113, ${opacity})`
      : `rgba(231, 76, 60, ${opacity})`,
    strokeWidth: 3,
    decimalPlaces: 0,
    formatYLabel: (value: string) => `${selectedCurrency.symbol}${Number(value).toLocaleString()}`,
    propsForLabels: {
      fontSize: 12,
      fontWeight: '600'
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#fff'
    }
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

      <ScrollView className="flex-1">
        <View className="p-4 bg-white mt-2 rounded-xl mx-2 shadow-sm">
          <Text className="text-xl font-bold mb-4 text-gray-800">
            {selectedType === 'income' ? 'Income' : 'Expense'} Trend ({selectedCurrency.symbol})
          </Text>
          <LineChart
            data={getChartData()}
            width={screenWidth - 48}
            height={240}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withInnerLines={false}
            yAxisInterval={4}
          />
        </View>

        <View className="p-4 bg-white mt-4 rounded-xl mx-2 mb-4 shadow-sm">
          <Text className="text-xl font-bold mb-4 text-gray-800">
            {selectedType === 'income' ? 'Income' : 'Expense'} Distribution ({selectedCurrency.symbol})
          </Text>
          <PieChart
            data={categoryData()}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="0"
            absolute
            hasLegend={false}
            center={[screenWidth / 4, 0]}
          />
          <View className="mt-6 border-t border-gray-100 pt-4">
            {categoryData().map((item, index) => (
              <View key={index} className="flex-row justify-between items-center py-2.5">
                <View className="flex-row items-center flex-1">
                  <View 
                    style={{ 
                      width: 14, 
                      height: 14, 
                      backgroundColor: item.color, 
                      borderRadius: 7,
                      marginRight: 10,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1,
                      elevation: 2
                    }} 
                  />
                  <Text className="text-gray-800 font-medium text-base flex-1">{item.name}</Text>
                  <Text className="text-gray-900 font-semibold text-base ml-4">
                    {selectedCurrency.symbol}{item.amount.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <BottomNavBar onTransactionAdded={() => {
        // İşlem eklendiğinde grafikleri güncelle
        const fetchTransactions = async () => {
          const savedTransactions = await loadTransactions();
          setTransactions(savedTransactions);
        };
        fetchTransactions();
      }} />
    </SafeAreaView>
  );
}
