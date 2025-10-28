import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, type ImageSourcePropType } from 'react-native';
import { isRtl } from '../modules/i18n';

type HomeBoxProps = {
  icon: ImageSourcePropType;
  title: string;
  height: number;
  onPress: () => void;
};

const HomeBox = ({ icon, title, height, onPress }: HomeBoxProps) => {
  const isRTL = isRtl();
  
  return (
    <TouchableOpacity
      style={[styles.container, { height }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Image source={icon} style={[styles.icon, isRTL && styles.iconRTL]} resizeMode="contain" />
      <Text style={[styles.title, isRTL && styles.titleRTL]} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    width: 40,
    height: 40,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    alignSelf: 'flex-start',
    textAlign: 'left',
  },
  
  // RTL (Arapça) Stilleri
  iconRTL: {
    alignSelf: 'flex-end',
  },
  titleRTL: {
    alignSelf: 'flex-end',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

export default HomeBox;

