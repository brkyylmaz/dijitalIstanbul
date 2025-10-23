import React from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { t } from '../modules/i18n';

type SearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
};

export const SEARCH_INPUT_HEIGHT = 56;
const SEARCH_INPUT_RADIUS = 20;

function SearchInput({ value, onChangeText, onClear, placeholder = t('search.placeholder'), style}: SearchInputProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Image
          resizeMode="contain"
          source={require('../assets/images/searchIcon.png')}
          style={styles.iconImage}  // IconImage yerine iconImage kullanıyoruz      
        />
      </View>
      <TextInput
        accessibilityLabel={t('search.placeholder')}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6B6F76"
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClear}
          accessibilityLabel={t('components.search.clear_search')}
        >
          <View style={styles.clearIcon}>
            <View style={[styles.clearLine, styles.clearLine1]} />
            <View style={[styles.clearLine, styles.clearLine2]} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: SEARCH_INPUT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: SEARCH_INPUT_RADIUS,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconImage: {
    width: 18,
    height: 18,
    tintColor: '#121417',
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: '#121417',
  },
  clearButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearLine: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: '#6B6F76',
    borderRadius: 1,
  },
  clearLine1: {
    transform: [{ rotate: '45deg' }],
  },
  clearLine2: {
    transform: [{ rotate: '-45deg' }],
  },
});

export default SearchInput;

