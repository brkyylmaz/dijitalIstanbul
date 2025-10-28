import React from 'react';
import {
    ActionSheetIOS,
  Alert,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import i18n, { change_lang, lang_list, t } from '../modules/i18n';

interface HeaderComponentProps {
  showLogo?: boolean;
  rightButtons?: 'notifications' | 'favorites' | 'favorites-active' | 'none';
  showLanguageSelector?: boolean;
  onFavoritePress?: () => void;
  accessibilityLabels?: {
    notifications?: string;
    favorites?: string;
    languageSelection?: string;
  };
}

const headerStyles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 36,
  },
  logo: {
    width: 36,
    height: 36,
    tintColor: '#121417',
  },
  textLogo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    overflow: "hidden",
    
  },
  languageIcon: {
    height: 36,
    width: 60,
    justifyContent: "flex-start"
  },
});

export const HeaderLeft: React.FC<{ showLogo?: boolean }> = ({ showLogo = true }) => {
  if (!showLogo) return null;
  
  return (
    <View style={headerStyles.logoContainer}>
      <Image
        resizeMode="contain"
        source={require('../assets/images/dijitalIstanbulLogo.png')}
        style={headerStyles.logo}
      />
      <Image
        resizeMode="contain"
        source={require('../assets/images/DijitalIstanbul.png')}
        style={headerStyles.textLogo}
      />
    </View>
  );
};

export const HeaderRight: React.FC<HeaderComponentProps> = ({
  rightButtons = 'none',
  showLanguageSelector = true,
  accessibilityLabels,
  onFavoritePress,
}) => {
  // TODO: Implement these handlers
  const handleLanguageChange = (code: string) => {
    change_lang(code)
  }

  const openLangSelector = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...lang_list.map(lang => lang.display_name), 'Cancel'],
          cancelButtonIndex: lang_list.length,
          title: t('navigation.language_selection'),
          userInterfaceStyle: 'light',
        },
        buttonIndex => {
          if (buttonIndex !== undefined && buttonIndex < lang_list.length) {
            const chosen = lang_list[buttonIndex];
            handleLanguageChange(chosen.code);
          }
        },
      );
    } else {
      Alert.alert(
        t('navigation.language_selection'),
        undefined,
        [
          ...lang_list.map(lang => ({
            text: lang.display_name,
            onPress: () => handleLanguageChange(lang.code),
          })),
          { text: t('navigation.cancel'), style: 'cancel' },
        ],
        { cancelable: true },
      );
    }
  }

  const onLanguagePress = () => {
    openLangSelector();
  }
  const selectedLanguageFlag = lang_list.find(lang => lang.code === i18n.language)?.flag ?? '';

  const renderActionButton = () => {
    switch (rightButtons) {
      case 'notifications':
        return (
          <>
          {/* <TouchableOpacity
            style={headerStyles.iconButton}
            accessibilityLabel={accessibilityLabels?.notifications}
            activeOpacity={0.7}
            onPress={onNotificationPress}
          >
            <Image
              resizeMode="contain"
              source={require('../assets/images/ringIcon.png')}
              style={headerStyles.notificationIcon}
            />
          </TouchableOpacity> */}
          </>
        );
      case 'favorites':
      case 'favorites-active':
        return (
          <>
          <TouchableOpacity
            style={[
                headerStyles.iconButton,
                rightButtons == 'favorites-active' && {backgroundColor: headerStyles.favoriteIcon.tintColor},
            ]}
            accessibilityLabel={accessibilityLabels?.favorites}
            activeOpacity={0.7}
            onPress={onFavoritePress}
          >
            <Image
              resizeMode="contain"
              source={require('../assets/images/favoriteIcon.png')}
              style={[
                headerStyles.favoriteIcon,
                rightButtons == 'favorites-active' && {tintColor: headerStyles.iconButton.backgroundColor},
              ]}
            />
          </TouchableOpacity>
          
          </>
        );
      default:
        return null;
    }
  };

  const renderLanguageSelector = () => {
    if (!showLanguageSelector) return null;

    return (
      <TouchableOpacity
        style={[
          headerStyles.iconButton, 
          headerStyles.languageButton,
          i18n.language == "en" && {paddingLeft: 8},
          i18n.language == "tr" && {paddingLeft: 12},
        ]}
        accessibilityLabel={accessibilityLabels?.languageSelection}
        activeOpacity={0.7}
        onPress={onLanguagePress}
      >
        <Image
          resizeMode="cover"
          source={
            selectedLanguageFlag 
              ? { uri: selectedLanguageFlag }
              : require('../assets/images/flag.png')
          }
          style={headerStyles.languageIcon}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={headerStyles.rightActions}>
      {renderActionButton()}
      {renderLanguageSelector()}
    </View>
  );
};
