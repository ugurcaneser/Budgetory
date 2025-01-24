import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function BottomNavBar() {
  const navigation = useNavigation();
  const route = useRoute();

  const menuItems = [
    { name: 'Home', icon: 'home-outline', route: 'Home' },
    { name: 'Charts', icon: 'bar-chart-outline', route: 'Chart' },
    { name: 'About', icon: 'information-circle-outline', route: 'About' },
  ];

  return (
    <View className="flex-row justify-around items-center bg-white border-t border-gray-200 py-2 px-4">
      {menuItems.map((item) => {
        const isActive = route.name === item.route;
        return (
          <TouchableOpacity
            key={item.name}
            onPress={() => navigation.navigate(item.route as never)}
            className="items-center px-4"
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={isActive ? '#2196F3' : '#666'}
            />
            <Text
              className={`text-xs mt-1 ${
                isActive ? 'text-blue-500' : 'text-gray-600'
              }`}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
