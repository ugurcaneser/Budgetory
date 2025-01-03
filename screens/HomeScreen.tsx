import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated, Dimensions, Platform } from 'react-native';
import SummaryCard from '../components/SummaryCard';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Animation values
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 6,
    }).start();
    
    setIsExpanded(!isExpanded);
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
    <SafeAreaView className='flex-1 bg-gray-50'>
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
        <View className='p-4 mt-4 mb-32'>
          <Text className='text-xl font-bold text-gray-800 mb-4'>
            Recent Transactions
          </Text>
          {/* Transaction list will be added here */}
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View className='absolute bottom-8 left-0 right-0 items-center'>
        {/* Income Button */}
        <Animated.View style={[incomeStyle]} className='absolute'>
          <TouchableOpacity 
            className='bg-green-500 w-14 h-14 rounded-full items-center justify-center shadow-lg'
            onPress={() => {/* TODO: Add income */}}
          >
            <Ionicons name="arrow-up" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Expense Button */}
        <Animated.View style={[expenseStyle]} className='absolute'>
          <TouchableOpacity 
            className='bg-red-500 w-14 h-14 rounded-full items-center justify-center shadow-lg'
            onPress={() => {/* TODO: Add expense */}}
          >
            <Ionicons name="arrow-down" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Main Action Button */}
        <TouchableOpacity 
          className='bg-blue-500 w-16 h-16 rounded-full items-center justify-center shadow-lg'
          onPress={toggleMenu}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="add" size={32} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}