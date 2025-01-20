import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { incomeCategories, expenseCategories } from '../utils/categories';

type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    category: string;
    searchText: string;
  };
  setFilters: (filters: any) => void;
  onApply: () => void;
};

export default function FilterModal({ visible, onClose, filters, setFilters, onApply }: FilterModalProps) {
  const allCategories = [...incomeCategories, ...expenseCategories];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-xl font-bold mb-4">Filter</Text>
          
          <View className="mb-4">
            <Text className="font-medium mb-2">Start Date</Text>
            <DateTimePicker
              value={filters.startDate || new Date()}
              mode="date"
              onChange={(event, date) => setFilters({ ...filters, startDate: date })}
            />
          </View>

          <View className="mb-4">
            <Text className="font-medium mb-2">End Date</Text>
            <DateTimePicker
              value={filters.endDate || new Date()}
              mode="date"
              onChange={(event, date) => setFilters({ ...filters, endDate: date })}
            />
          </View>

          <View className="mb-4">
            <Text className="font-medium mb-2">Category</Text>
            <Picker
              selectedValue={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <Picker.Item label="All Categories" value="" />
              {allCategories.map(cat => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>

          <View className="mb-4">
            <Text className="font-medium mb-2">Search Description</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-2"
              value={filters.searchText}
              onChangeText={(text) => setFilters({ ...filters, searchText: text })}
              placeholder="Enter description..."
            />
          </View>

          <View className="flex-row justify-end space-x-4">
            <TouchableOpacity
              className="px-4 py-2"
              onPress={onClose}
            >
              <Text className="text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-500 px-4 py-2 rounded-lg"
              onPress={() => {
                onApply();
                onClose();
              }}
            >
              <Text className="text-white font-medium">Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 