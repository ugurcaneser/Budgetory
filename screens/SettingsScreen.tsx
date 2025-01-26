import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export default function SettingsScreen() {
  const { selectedCurrency, setSelectedCurrency, defaultCurrency, setDefaultCurrency } = useCurrency();
  const navigation = useNavigation<NavigationProp>();

  const handleSetDefault = (currency: typeof currencies[0]) => {
    if (defaultCurrency?.code === currency.code) {
      Alert.alert(
        "Remove Default Currency",
        `Do you want to remove ${currency.code} as default currency?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => setDefaultCurrency(null)
          }
        ]
      );
    } else {
      Alert.alert(
        "Set as Default",
        `Do you want to set ${currency.code} as default? It will be used as the initial currency when the app starts.`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Set as Default",
            onPress: () => setDefaultCurrency(currency)
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">Settings</Text>
            <View className="w-10" />
          </View>

          <View className="mb-8">
            <Text className="text-base font-semibold text-gray-700 mb-4">Currency</Text>
            <View className="bg-gray-50 rounded-xl overflow-hidden">
              {currencies.map((currency, index) => (
                <View
                  key={currency.code}
                  className={`flex-row items-center justify-between p-4 ${
                    index < currencies.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedCurrency(currency)}
                    className="flex-1 flex-row items-center"
                  >
                    <View className="flex-1 flex-row items-center">
                      <Text className="text-lg font-medium text-gray-800">
                        {currency.symbol} {currency.code}
                      </Text>
                      <Text className="text-gray-500 ml-2">{currency.name}</Text>
                    </View>
                    {selectedCurrency.code === currency.code && (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleSetDefault(currency)}
                    className="ml-4 p-2"
                  >
                    <Ionicons 
                      name={defaultCurrency?.code === currency.code ? "star" : "star-outline"} 
                      size={24} 
                      color={defaultCurrency?.code === currency.code ? "#F59E0B" : "#9CA3AF"} 
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-base font-semibold text-gray-700 mb-4">About App</Text>
            <View className="bg-gray-50 rounded-xl overflow-hidden">
              <View className="p-4 border-b border-gray-200">
                <Text className="text-gray-800 font-medium">Version</Text>
                <Text className="text-gray-500">1.0.0</Text>
              </View>
              <View className="p-4">
                <Text className="text-gray-800 font-medium">Developer</Text>
                <Text className="text-gray-500">Uğurcan Eser</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
