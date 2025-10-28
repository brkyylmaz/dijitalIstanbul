import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isRtl } from '../modules/i18n';

interface KeyValueItemProps {
  label: string;
  value: string | string[];
  valueStyle?: 'normal' | 'bold';
}

const KeyValueItem: React.FC<KeyValueItemProps> = ({ 
  label, 
  value, 
  valueStyle = 'normal' 
}) => {
  const isArray = Array.isArray(value);
  const rtl = isRtl();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, rtl && styles.labelRtl]}>{label}</Text>
      {isArray ? (
        <View style={styles.listContainer}>
          {value.map((item, index) => (
            <View key={index} style={[styles.listItem, rtl && styles.listItemRtl]}>
              <Text style={[styles.bullet, rtl && styles.bulletRtl]}>•</Text>
              <Text style={[
                styles.value, 
                valueStyle === 'bold' && styles.valueBold,
                rtl && styles.valueRtl
              ]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[
          styles.value, 
          valueStyle === 'bold' && styles.valueBold,
          rtl && styles.valueRtl
        ]}>
          {value}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#52606D',
    marginBottom: 8,
  },
  labelRtl: {
    textAlign: 'right',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    lineHeight: 22,
  },
  valueRtl: {
    textAlign: 'right',
  },
  valueBold: {
    fontWeight: '700',
  },
  listContainer: {
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  listItemRtl: {
    flexDirection: 'row-reverse',
  },
  bullet: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2933',
    marginRight: 8,
    marginTop: 2,
  },
  bulletRtl: {
    marginRight: 0,
    marginLeft: 8,
  },
});

export default KeyValueItem;

