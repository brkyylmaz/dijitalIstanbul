import React from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { t, isRtl } from '../modules/i18n';

type FilterOption = {
  id: string;
  label: string;
};

type FilterButtonProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  buttonStyle?: StyleProp<ViewStyle>;
};

const FilterButton = React.memo(({ label, isSelected, onPress, buttonStyle }: FilterButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isSelected && styles.filterButtonSelected,
        buttonStyle,
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
  buttonStyle?: StyleProp<ViewStyle>;
};

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'mosque', label: "filters.mosque" },
  { id: 'mausoleum', label: "filters.mausoleum" },
  // { id: 'church', label: t('filters.church') },
  // { id: 'school', label: t('filters.school') },
];

export const FILTER_HEIGHT = 40;

function FilterComponent({ selectedFilter, onFilterChange, buttonStyle = {} }: FilterProps) {
  const handlePress = React.useCallback((optionId: string) => {
    return () => onFilterChange(optionId);
  }, [onFilterChange]);

  const rtl = isRtl();

  return (
    <View style={[styles.container, rtl && styles.containerRtl]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          rtl && styles.scrollContentRtl
        ]}
      >
        {FILTER_OPTIONS.map((option) => (
          <FilterButton
            key={option.id}
            label={t(option.label)}
            isSelected={selectedFilter === option.id}
            onPress={handlePress(option.id)}
            buttonStyle={buttonStyle}
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
  containerRtl: {
    alignItems: 'flex-end',
  },
  scrollContent: {
    gap: 12,
    paddingRight: 16,
    flexDirection: 'row',
  },
  scrollContentRtl: {
    flexDirection: 'row-reverse',
    paddingRight: 0,
    paddingLeft: 16,
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
