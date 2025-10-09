import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type FilterOption = {
  id: string;
  label: string;
};

type FilterButtonProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

const FilterButton = React.memo(({ label, isSelected, onPress }: FilterButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isSelected && styles.filterButtonSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterButtonText,
          isSelected && styles.filterButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

type FilterProps = {
  selectedFilter: string;
  onFilterChange: (filterId: string) => void;
};

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'camii', label: 'Camii' },
  { id: 'turbe', label: 'Türbe' },
];

export const FILTER_HEIGHT = 40;

function FilterComponent({ selectedFilter, onFilterChange }: FilterProps) {
  const handlePress = React.useCallback((optionId: string) => {
    return () => onFilterChange(optionId);
  }, [onFilterChange]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_OPTIONS.map((option) => (
          <FilterButton
            key={option.id}
            label={option.label}
            isSelected={selectedFilter === option.id}
            onPress={handlePress(option.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const Filter = React.memo(FilterComponent);
export default Filter;

const styles = StyleSheet.create({
  container: {
    height: FILTER_HEIGHT,
    marginTop: 12,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  filterButton: {
    height: 40,
    paddingHorizontal: 28,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonSelected: {
    backgroundColor: '#1B1B1B',
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1B1B1B',
  },
  filterButtonTextSelected: {
    color: '#FFFFFF',
  },
});
