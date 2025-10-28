import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, Pressable, StyleSheet, View, Vibration, Platform } from 'react-native';

type TabItem = {
  name: string;
  route: string;
  icon: any;
};

const tabs: TabItem[] = [
  {
    name: 'Home',
    route: 'Home',
    icon: require('../assets/images/homeIconWhite.png'),
  },
  {
    name: 'QR',
    route: 'QR',
    icon: require('../assets/images/qrIconWhite.png'),
  },
  {
    name: 'CulturalAssets',
    route: 'CulturalAssets',
    icon: require('../assets/images/dijitalwhite.png'),
  },
];

const inactiveTabs = {
  CulturalAssets: require('../assets/images/dijitalgray.png'),
};

const CustomTabBarComponent = React.memo(function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const handleTabPress = React.useCallback((routeName: string, index: number) => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      // iOS'ta hafif titreşim
    } else {
      Vibration.vibrate(10);
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: state.routes[index].key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      // Navigation'ı hızlandırmak için setTimeout kullan
      requestAnimationFrame(() => {
        navigation.navigate(routeName);
      });
    }
  }, [navigation, state.routes]);

  const getTabIcon = React.useCallback((routeName: string, isFocused: boolean) => {
    const tab = tabs.find((t) => t.name === routeName);
    if (!tab) return tabs[0];
    
    // CulturalAssets için aktif/pasif durumuna göre farklı ikon
    if (routeName === 'CulturalAssets' && !isFocused) {
      return {
        ...tab,
        icon: inactiveTabs.CulturalAssets,
      };
    }
    
    return tab;
  }, []);

  const getIconTintColor = React.useCallback((isFocused: boolean, routeName: string) => {
    // CulturalAssets için tintColor kullanmayız çünkü ikon değiştiriyoruz
    if (routeName === 'CulturalAssets') {
      return undefined;
    }
    return isFocused ? '#FFFFFF' : '#A8A8A8';
  }, []);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = getTabIcon(route.name, isFocused);
          const isQR = route.name === 'QR';
          const isCulturalAssets = route.name === 'CulturalAssets';
          const tintColor = getIconTintColor(isFocused, route.name);

          return (
            <Pressable
              key={route.key}
              onPress={() => handleTabPress(route.name, index)}
              style={({ pressed }) => [
                styles.tabItem,
                isQR && styles.qrTabItem,
                pressed && styles.tabItemPressed,
              ]}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
            >
              <Image
                resizeMode="contain"
                source={tab.icon}
                style={[
                  isQR ? styles.iconQr : isCulturalAssets ? styles.iconCulturalAssets : styles.iconSmall,
                  tintColor && { tintColor }
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

export { CustomTabBarComponent as CustomTabBar };
export default CustomTabBarComponent;

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    paddingHorizontal: 48,
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(40, 40, 40, 0.92)',
    borderWidth: 1,
    borderColor: '#FFFFFF30',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 72,
  },
  qrTabItem: {
    // QR için ekstra stil gerekirse
  },
  tabItemPressed: {
    opacity: 0.7,
  },
  iconSmall: {
    width: 28,
    height: 28,
  },
  iconCulturalAssets: {
    width: 36,
    height: 36,
  },
  iconQr: {
    width: 48,
    height: 48,
  },
});

