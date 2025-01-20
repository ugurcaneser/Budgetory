import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function AboutScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Made with ❤️</Text>
      </View>
    </SafeAreaView>
  );
} 