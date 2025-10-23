import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { t } from '../modules/i18n';

type DetailOptionProps = {
  label: string;
  onPress: () => void;
  isSelected?: boolean;
};

const DetailOption = React.memo(({ label, onPress, isSelected }: DetailOptionProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        isSelected && styles.optionButtonSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.optionButtonText,
        isSelected && styles.optionButtonTextSelected,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

type DetailOptionsProps = {
  onInfoPress: () => void;
  onAudioPress: () => void;
  onLocationPress: () => void;
  selectedOption: 'info' | 'audio' | 'location';
};

function DetailOptionsComponent({ 
  onInfoPress, 
  onAudioPress, 
  onLocationPress,
  selectedOption
}: DetailOptionsProps) {
  return (
    <View style={styles.container}>
      <DetailOption
        label={t('detail_options.info')}
        onPress={onInfoPress}
        isSelected={selectedOption === 'info'}
      />
      <DetailOption
        label={t('detail_options.audio')}
        onPress={onAudioPress}
        isSelected={selectedOption === 'audio'}
      />
      <DetailOption
        label={t('detail_options.location')}
        onPress={onLocationPress}
        isSelected={selectedOption === 'location'}
      />
    </View>
  );
}

const DetailOptions = React.memo(DetailOptionsComponent);
export default DetailOptions;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  optionButton: {
    flex: 1,
    height: 40,
    paddingHorizontal: 16,
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
  optionButtonSelected: {
    backgroundColor: '#1B1B1B',
  },
  optionButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1B1B1B',
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
});
