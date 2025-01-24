import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-6">
        <Text className="text-lg text-gray-700 mb-6">
          Welcome to Budgetory, your personal finance companion designed to make money management simple and effective.
        </Text>

        <Text className="text-base text-gray-600 mb-4">
          Budgetory helps you take control of your financial life by providing powerful tools to track expenses, set budgets, and achieve your financial goals. Whether you're saving for a dream vacation, planning for retirement, or simply wanting to understand your spending habits better, we're here to help.
        </Text>

        <Text className="text-base text-gray-600 mb-4">
          Key Features:
        </Text>

        <View className="mb-6">
          <Text className="text-base text-gray-600 mb-2">• Simple & Clean User Interface</Text>
          <Text className="text-base text-gray-600 mb-2">• Expense Tracking</Text>
          <Text className="text-base text-gray-600 mb-2">• Budget Planning</Text>
          <Text className="text-base text-gray-600">• Secure Data Storage</Text>
        </View>

        <Text className="text-base text-gray-600 mb-6">
          Our mission is to empower individuals with the tools and insights they need to make informed financial decisions and build a secure financial future.
        </Text>

        <Text className="text-sm text-gray-500 italic">
          App Version v1.0.1
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}