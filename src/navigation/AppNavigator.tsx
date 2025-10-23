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
  TouchableOpacity,
} from 'react-native';
import { CustomTabBar } from '../components/CustomTabBar';
import { HeaderLeft, HeaderRight } from '../components/HeaderComponent';
import CulturalAssetsScreen from '../screens/CulturalAssetsScreen';
import HomeScreen from '../screens/HomeScreen';
import MosqueDetailScreen from '../screens/MosqueDetailScreen';
import MultipleTombDetailScreen from '../screens/MultipleTombDetail';
import QRScannerScreen from '../screens/QRScannerScreen';
import i18n, { lang_list, t } from '../modules/i18n';

export type RootStackParamList = {
  MainTabs: undefined;
  MosqueDetail: {
    postID: number;
  };
  MultipleTombDetail: {
    postID: number;
  };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: 'transparent',
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
  favoriteIcon: {
    width: 20,
    height: 20,
    tintColor: '#1A1E24',
  },
});

function MainTabs() {
  const selectedLanguageLabel = lang_list.find(lang => lang.code === i18n.language)?.display_name ?? '';

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
          headerLeft: () => <HeaderLeft />,
          headerRight: () => (
            <HeaderRight
              rightButtons="notifications"
              accessibilityLabels={{
                notifications: t('navigation.notifications'),
                languageSelection: `${t('navigation.language_selection_label')}: ${selectedLanguageLabel}`,
              }}
            />
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
          headerLeft: () => <HeaderLeft />,
          headerRight: () => (
            <HeaderRight
              rightButtons="favorites"
              accessibilityLabels={{
                favorites: t('navigation.favorites'),
                languageSelection: `${t('navigation.language_selection_label')}: ${selectedLanguageLabel}`,
              }}
            />
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
          options={({ navigation }) => {
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
                  accessibilityLabel={t('navigation.back')}
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
        <Stack.Screen
          component={MultipleTombDetailScreen}
          name="MultipleTombDetail"
          options={({ navigation }) => {
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
                  accessibilityLabel={t('navigation.back')}
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


