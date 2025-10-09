import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CustomTabBar } from '../components/CustomTabBar';
import CulturalAssetsScreen from '../screens/CulturalAssetsScreen';
import HomeScreen from '../screens/HomeScreen';
import MosqueDetailScreen from '../screens/MosqueDetailScreen';
import QRScannerScreen from '../screens/QRScannerScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  MosqueDetail: {
    mosqueId?: string;
    sourceUrl?: string;
    mosqueData?: unknown;
    isFavorite?: boolean;
  };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const LANGUAGE_OPTIONS = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ar', label: 'العربية' },
];

const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: 'transparent',
  },
  logoContainer: {
    padding: 4,
  },
  logo: {
    width: 36,
    height: 36,
    tintColor: '#121417',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationIcon: {
    width: 20,
    height: 20,
    tintColor: '#1A1E24',
  },
  favoriteIcon: {
    width: 20,
    height: 20,
    tintColor: '#1A1E24',
  },
  languageButton: {
    backgroundColor: '#FF4B55',
  },
  languageIcon: {
    width: 20,
    height: 20,
  },
});

function MainTabs() {
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>(LANGUAGE_OPTIONS[0].code);

  const selectedLanguageLabel = React.useMemo(() => {
    return LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage)?.label ?? '';
  }, [selectedLanguage]);

  const handleLanguageChange = React.useCallback((languageCode: string, languageLabel: string) => {
    setSelectedLanguage(languageCode);
    console.log(`Dil seçildi: ${languageLabel} (${languageCode})`);
  }, []);

  const openLanguageSelector = React.useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...LANGUAGE_OPTIONS.map(lang => lang.label), 'Cancel'],
          cancelButtonIndex: LANGUAGE_OPTIONS.length,
          title: 'Language Selection',
          userInterfaceStyle: 'light',
        },
        buttonIndex => {
          if (buttonIndex !== undefined && buttonIndex < LANGUAGE_OPTIONS.length) {
            const chosen = LANGUAGE_OPTIONS[buttonIndex];
            handleLanguageChange(chosen.code, chosen.label);
          }
        },
      );
    } else {
      Alert.alert(
        'Language Selection',
        undefined,
        [
          ...LANGUAGE_OPTIONS.map(lang => ({
            text: lang.label,
            onPress: () => handleLanguageChange(lang.code, lang.label),
          })),
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true },
      );
    }
  }, [handleLanguageChange]);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        component={HomeScreen}
        name="Home"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: headerStyles.header,
          headerLeftContainerStyle: {
            paddingLeft: 16,
          },
          headerRightContainerStyle: {
            paddingRight: 16,
          },
          headerLeft: () => (
            <View style={headerStyles.logoContainer}>
              <Image
                resizeMode="contain"
                source={require('../assets/images/dijitalIstanbulLogo.png')}
                style={headerStyles.logo}
              />
            </View>
          ),
          headerRight: () => (
            <View style={headerStyles.rightActions}>
              <TouchableOpacity
                style={headerStyles.iconButton}
                accessibilityLabel="Bildirimler"
                activeOpacity={0.7}
                onPress={() => {}}
              >
                <Image
                  resizeMode="contain"
                  source={require('../assets/images/ringIcon.png')}
                  style={headerStyles.notificationIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[headerStyles.iconButton, headerStyles.languageButton]}
                accessibilityLabel={`Dil Seçimi: ${selectedLanguageLabel}`}
                activeOpacity={0.7}
                onPress={openLanguageSelector}
              >
                <Image
                  resizeMode="contain"
                  source={require('../assets/images/flag.png')}
                  style={headerStyles.languageIcon}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tab.Screen component={QRScannerScreen} name="QR" />
      <Tab.Screen 
        component={CulturalAssetsScreen} 
        name="CulturalAssets"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: headerStyles.header,
          headerLeftContainerStyle: {
            paddingLeft: 16,
          },
          headerRightContainerStyle: {
            paddingRight: 16,
          },
          headerLeft: () => (
            <View style={headerStyles.logoContainer}>
              <Image
                resizeMode="contain"
                source={require('../assets/images/dijitalIstanbulLogo.png')}
                style={headerStyles.logo}
              />
            </View>
          ),
          headerRight: () => (
            <View style={headerStyles.rightActions}>
              <TouchableOpacity
                style={headerStyles.iconButton}
                accessibilityLabel="Favoriler"
                activeOpacity={0.7}
                onPress={() => {}}
              >
                <Image
                  resizeMode="contain"
                  source={require('../assets/images/favoriteIcon.png')}
                  style={headerStyles.favoriteIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[headerStyles.iconButton, headerStyles.languageButton]}
                accessibilityLabel={`Dil Seçimi: ${selectedLanguageLabel}`}
                activeOpacity={0.7}
                onPress={openLanguageSelector}
              >
                <Image
                  resizeMode="contain"
                  source={require('../assets/images/flag.png')}
                  style={headerStyles.languageIcon}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          component={MainTabs}
          name="MainTabs"
          options={{ headerShown: false }}

        />
        <Stack.Screen
          component={MosqueDetailScreen}
          name="MosqueDetail"
          options={({ navigation, route }) => {
            return {
              headerShown: true,
              headerTransparent: true,
              headerTitle: '',
              headerShadowVisible: false,
              headerStyle: headerStyles.header,
              headerLeftContainerStyle: {
                paddingLeft: 16,
              },
              headerRightContainerStyle: {
                paddingRight: 16,
              },
              headerLeft: () => (
                <TouchableOpacity
                  style={headerStyles.iconButton}
                  accessibilityLabel="Geri"
                  activeOpacity={0.7}
                  onPress={() => navigation.goBack()}
                >
                  <Image
                    resizeMode="contain"
                    source={require('../assets/images/backIcon.png')}
                    style={headerStyles.favoriteIcon}
                  />
                </TouchableOpacity>
              ),
            };
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;


