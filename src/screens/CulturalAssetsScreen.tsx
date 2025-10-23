import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  InteractionManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute, RouteProp, useIsFocused } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getHeaderExtension, HORIZONTAL_SCREEN_PADDING, HEADER_ICON_BUTTON_HEIGHT, HEADER_TO_SEARCH_GAP, uiScaleFactor } from '../theme/layout';
import SearchInput, { SEARCH_INPUT_HEIGHT } from '../components/searchInput';
import Filter, { FILTER_HEIGHT } from '../components/filter';
import ItemBox from '../components/itemBox';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSnapshot } from 'valtio';
import { store } from '../store+client/store';
import { PageListItem } from "../types/listElem";
import { t } from '../modules/i18n';
import { HeaderRight } from '../components/HeaderComponent';
import { favoritesStore } from '../store+client/favorites';

type TabParamList = {
  CulturalAssets: { filter?: string };
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const filters = {
  mosque: ["mosque"],
  mausoleum: ["mausoleum-single", "mausoleum-multi"],
  church: [],
  school: []
}

const CulturalAssetsScreen = React.memo(function CulturalAssetsScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<TabParamList, 'CulturalAssets'>>();
  
  const headerTotalHeight = getHeaderExtension(height);
  const searchInputTopOffset = useMemo(() => insets.top + HEADER_ICON_BUTTON_HEIGHT + HEADER_TO_SEARCH_GAP, [insets.top]);
  
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState("mosque");
  const f = useIsFocused();
  const [favActive, setFavActive] = useState(false);
  const favSnap = useSnapshot(favoritesStore)

  useEffect(()=>{
    if (!f){return}

    const filter = route?.params?.filter;
    if (filter){
      setSelectedFilter(filter);
    }    
  }, [f]);

  // Control HeaderRight component props
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight 
          rightButtons={favActive ? 'favorites-active' : 'favorites'}
          showLanguageSelector={true}
          accessibilityLabels={{
            favorites: t('navigation.favorites'),
            languageSelection: t('navigation.language_selection_label')
          }}
          onFavoritePress={()=>{
            console.log("onFavoriteasdasdPress");
            setFavActive(x => !x);
          }}
        />
      ),
    });
  }, [navigation, favActive]);

  const snap = useSnapshot(store);

  const handleFilterChange = useCallback((filterId: string) => {
    setSelectedFilter(filterId);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
  }, []);

  const handleItemPress = (item: PageListItem)=>{
    switch (item.page_type) {
      case "mosque":
      case "mausoleum-single":
        navigation.navigate('MosqueDetail', {
          postID: item.id
        })
        break;

      case "mausoleum-multi":
        navigation.navigate('MultipleTombDetail', {
          postID: item.id
        })
        break;

    }
  }

  const renderItem = ({item}: {item: PageListItem}) => <ItemBox
    title={item.title}
    thumbnailUrl={item.thumbnail_url}
    year={item.built_at}
    location={item.location_str}
    onPress={() => handleItemPress(item)}
  />;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerBackground,
          {
            height: headerTotalHeight,
            paddingTop: insets.top,
            
          },
        ]}
      />
      <View style={[styles.staticContent, { paddingTop: searchInputTopOffset }]}>
        <SearchInput 
          onChangeText={handleSearchChange} 
          value={searchText} 
          onClear={handleClearSearch}
          placeholder={favActive ? t('search.favorites') : t('search.placeholder')}
          style={{minHeight: SEARCH_INPUT_HEIGHT*uiScaleFactor}}
        />
        <Filter selectedFilter={selectedFilter} onFilterChange={handleFilterChange} buttonStyle={{height: FILTER_HEIGHT*uiScaleFactor}} />
      </View>
      <FlatList
        style={[styles.flatListStyle, { marginTop: headerTotalHeight }]}
        contentContainerStyle={styles.listContent}
        data={snap.pageList.filter(x => 
          filters[selectedFilter].includes(x.page_type) 
          && x.title.toLowerCase().includes(searchText.toLowerCase())
          && (favActive ? favSnap.favorites.includes(x.id) : true)
        )}
        keyExtractor={(x: PageListItem) => x.id.toString()}
        renderItem={renderItem}
        removeClippedSubviews={false}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        initialNumToRender={6}
        windowSize={3}
        getItemLayout={(data, index) => ({
          length: 136, // card height + gap
          offset: 136 * index,
          index,
        })}
        ListEmptyComponent={
          searchText.length >= 3 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t('search.no_results', { searchTerm: searchText })}
              </Text>
            </View>
          ) : null
        }
        disableIntervalMomentum={true}
        scrollEventThrottle={16}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingHorizontal: HORIZONTAL_SCREEN_PADDING,
    backgroundColor: '',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 140,
    gap: 16,
    paddingTop: 16
  },
  flatListStyle: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#D9534F',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B6F76',
    textAlign: 'center',
  },
});

export default CulturalAssetsScreen;

