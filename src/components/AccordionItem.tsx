import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { isRtl } from '../modules/i18n';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isInitiallyOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ 
  title, 
  children, 
  isInitiallyOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  const rtl = isRtl();

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.header, rtl && styles.headerRtl]} 
        onPress={toggleAccordion}
        activeOpacity={0.7}
      >
        <Text style={[styles.headerText, rtl && styles.headerTextRtl]}>{title}</Text>
        <Text style={[styles.icon, rtl && styles.iconRtl]}>{isOpen ? '−' : '+'}</Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.content}>
          {children}
        </View>
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
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerRtl: {
    flexDirection: 'row-reverse',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2933',
    flex: 1,
  },
  headerTextRtl: {
    textAlign: 'right',
  },
  icon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2933',
    marginLeft: 12,
  },
  iconRtl: {
    marginLeft: 0,
    marginRight: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E4E7EB',
    gap: 8,
  },
});

export default AccordionItem;

