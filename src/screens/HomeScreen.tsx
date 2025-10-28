import React from 'react';
import { StyleSheet, View, useWindowDimensions, Text, ScrollView, Pressable, Image, Linking, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SearchInput, { SEARCH_INPUT_HEIGHT } from '../components/searchInput';
import { getHeaderExtension, HORIZONTAL_SCREEN_PADDING } from '../theme/layout';
import Slider from '../components/slider';
import HomeBox from '../components/homeBoxes';
import HomepageSearchBox from '../components/homepageSearchBox';
import { RootStackParamList } from '../navigation/AppNavigator';
import { t, isRtl } from '../modules/i18n';

type TabParamList = {
  Home: undefined;
  QR: undefined;
  CulturalAssets: { filter?: string };
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;



const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = React.useState('');
  const [isSearchResultsVisible, setIsSearchResultsVisible] = React.useState(false);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const headerBaseHeight = getHeaderExtension(height);
  const isRTL = isRtl();

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (text.length >= 3) {
      setIsSearchResultsVisible(true);
    } else {
      setIsSearchResultsVisible(false);
    }
  };

  const handleCloseSearchResults = () => {
    setIsSearchResultsVisible(false);
  };

  const handleCamilerPress = () => {
    navigation.navigate('CulturalAssets', { filter: 'mosque' });
  };

  const handleTurbelerPress = () => {
    navigation.navigate('CulturalAssets', { filter: 'mausoleum' });
  };

  const handleValiPress = () => {
    Linking.openURL('http://www.istanbul.gov.tr/');
  };

  const handleZiraatPress = () => {
    Linking.openURL('https://www.ziraatkatilim.com.tr/kart-kampanyalari/troy-gaziantep-ulasim-kampanyasi');
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.headerBackground,
          {
            height: headerBaseHeight,
            paddingTop: insets.top,
          },
        ]}
      />
      
      <View style={[styles.staticContent, { paddingTop: headerBaseHeight }]}>
        <Text style={[
          styles.greetingTitle, 
          isRTL && styles.greetingTitleRTL,
          { marginTop: -headerBaseHeight/2, fontSize: headerBaseHeight/7.6  }
        ]}>
          {t('home.greeting')}
        </Text>
        <View style={[styles.searchRow, { position: 'absolute', top: headerBaseHeight - (SEARCH_INPUT_HEIGHT/2), }]}>
          <SearchInput 
            onClear={() => {
              setSearchText('');
              setIsSearchResultsVisible(false);
            }} 
            onChangeText={handleSearchTextChange} 
            value={searchText} 
          />
        </View>
        {searchText.length >= 3 && isSearchResultsVisible && (
          <>
            {/* Overlay to close search results when clicking outside - MUST be before HomepageSearchBox */}
            <Pressable 
              style={styles.overlay}
              onPress={handleCloseSearchResults}
            />
            <HomepageSearchBox 
              searchTerm={searchText} 
              navigation={navigation}
              onItemPress={handleCloseSearchResults}
            />
          </>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100, marginTop: 55 }]}
        showsVerticalScrollIndicator={false}
      >
          <View style={{ marginTop: 0 }}>
            <Slider />
          </View>
        <View style={styles.boxesRow}>
          <View style={styles.boxWrapper}>
            <HomeBox
              icon={require('../assets/images/camiiBlack.png')}
              title={t('home.categories.mosques')}
              height={125}
              onPress={handleCamilerPress}
            />
          </View>
          <View style={styles.boxWrapper}>
            <HomeBox
              icon={require('../assets/images/turbe.png')}
              title={t('home.categories.mausoleums')}
              height={125}
              onPress={handleTurbelerPress}
            />
          </View>
        </View>
        {/* <View style={styles.boxesRow}>
          <View style={styles.boxWrapper}>
            <HomeBox
              icon={require('../assets/images/camiiBlack.png')}
              title="Kiliseler"
              height={160}
              onPress={handleKiliselerPress}
            />
          </View>
          <View style={styles.boxWrapper}>
            <HomeBox
              icon={require('../assets/images/turbe.png')}
              title="Okullar"
              height={150}
              onPress={handleOkullarPress}
            />
          </View>
        </View> */}
        <View style={styles.sponsorsRow}>
          <Pressable onPress={handleValiPress} style={styles.sponsorButton}>
            <Image
              source={require('../assets/images/vali.png')}
              style={styles.sponsorImage}
              resizeMode="contain"
            />
          </Pressable>
          <Pressable onPress={handleZiraatPress} style={styles.sponsorButton}>
            <Image
              source={require('../assets/images/ziraat.png')}
              style={styles.sponsorImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E2E6EB',
    zIndex: 0,
  },
  staticContent: {
    zIndex: 1,
    paddingHorizontal: HORIZONTAL_SCREEN_PADDING,
    paddingTop: 24,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: HORIZONTAL_SCREEN_PADDING,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  icon: {
    width: 48,
    height: 48,
    tintColor: '#1B4C84',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B4C84',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 0,
    zIndex: 10,
    position: 'relative',
    width: Dimensions.get('window').width,
    paddingHorizontal: HORIZONTAL_SCREEN_PADDING,

  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'left',
  },
  greetingTitleRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1F2933',
  },
  boxesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  boxWrapper: {
    flex: 1,
  },
  sponsorsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 55,
  },
  sponsorButton: {
    flex: 1,
  },
  sponsorImage: {
    width: '100%',
    height: 80,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    elevation: 50,
    backgroundColor: 'transparent',
  },
});

export default HomeScreen;


