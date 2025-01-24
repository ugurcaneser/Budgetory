import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export type TimeRange = '1D' | '7D' | '30D' | '3M' | '6M' | '1Y' | 'ALL';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

export default function TimeRangeSelector({ selectedRange, onRangeChange }: TimeRangeSelectorProps) {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: '1D', label: '1 Day' },
    { value: '7D', label: '7 Days' },
    { value: '30D', label: '30 Days' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: 'ALL', label: 'All Time' },
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="py-2"
    >
      <View className="flex-row px-4 space-x-4">
        {ranges.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            onPress={() => onRangeChange(value)}
            className={`px-4 py-2 rounded-lg border ${
              selectedRange === value 
                ? 'bg-white border-blue-500' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <Text
              className={`${
                selectedRange === value ? 'text-blue-500' : 'text-gray-600'
              } font-medium`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
