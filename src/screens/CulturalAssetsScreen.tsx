import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getHeaderExtension, HORIZONTAL_SCREEN_PADDING, HEADER_ICON_BUTTON_HEIGHT, HEADER_TO_SEARCH_GAP } from '../theme/layout';
import SearchInput from '../components/searchInput';
import Filter from '../components/filter';
import ItemBox from '../components/itemBox';
import { RootStackParamList } from '../navigation/AppNavigator';

type PageItem = {
  id: number;
  title: string;
  thumbnail_url: string;
  page_type: string;
};

const API_URL = 'https://cuzdan.basaranamortisor.com/api/page-list';


type TabParamList = {
  CulturalAssets: { filter?: string };
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const CulturalAssetsScreen = React.memo(function CulturalAssetsScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<TabParamList, 'CulturalAssets'>>();
  
  const headerBaseHeight = useMemo(() => getHeaderExtension(height), [height]);
  const headerTotalHeight = useMemo(() => headerBaseHeight + insets.top * 1.5, [headerBaseHeight, insets.top]);
  const searchInputTopOffset = useMemo(() => insets.top + HEADER_ICON_BUTTON_HEIGHT + HEADER_TO_SEARCH_GAP, [insets.top]);
  
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('mosque');
  const [items, setItems] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilterChange = useCallback((filterId: string) => {
    setSelectedFilter(filterId);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
  }, []);

  const filteredItems = useMemo(() => {
    // Önce page_type'a göre filtrele
    let filtered = items.filter(item => item.page_type === selectedFilter);
    
    // Sonra search'e göre filtrele (eğer 3+ karakter varsa)
    if (searchText.length >= 3) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [items, searchText, selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      console.log('🎯 CulturalAssetsScreen FOCUSED');
      
      // Route parametresinden filtre değerini al ve set et
      if (route.params?.filter) {
        setSelectedFilter(route.params.filter);
      }
      
      return () => {
        console.log('👋 CulturalAssetsScreen BLURRED');
      };
    }, [route.params?.filter])
  );

  useEffect(() => {
    console.log('🚀 CulturalAssetsScreen MOUNTED - Data fetching started');
    const fetchItems = async () => {
      try {
        console.log('📡 API Request started...');
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Data not found');
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          console.log('✅ API Response received:', data.length, 'items');
          InteractionManager.runAfterInteractions(() => {
            setItems(data.filter(item => item.title && item.thumbnail_url && item.page_type));
            setIsLoading(false);
            console.log('🎉 Data set in state, loading finished');
          });
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  const keyExtractor = useCallback((item: PageItem) => item.id.toString(), []);

  const handleItemPress = useCallback(async (item: PageItem) => {
    try {
      // Cami detaylarını API'den çek
      const response = await fetch(
        `https://cuzdan.basaranamortisor.com/api/page-data?id=${item.id}`
      );

      if (!response.ok) {
        throw new Error('Cami detayları yüklenemedi');
      }

      const mosqueData = await response.json();

      navigation.navigate('MosqueDetail', {
        mosqueId: item.id.toString(),
        mosqueData,
        sourceUrl: `https://qr.dijitalistanbul.org/u/${item.id}`
      });
    } catch (error) {
      console.error('Cami detayları yüklenirken hata:', error);
      // Hata durumunda da navigasyonu yap ama data olmadan
      navigation.navigate('MosqueDetail', {
        mosqueId: item.id.toString(),
        mosqueData: null,
        sourceUrl: `https://qr.dijitalistanbul.org/u/${item.id}`
      });
    }
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: PageItem }) => (
    <ItemBox
      title={item.title}
      thumbnailUrl={item.thumbnail_url}
      year="1471-72"
      location="Üsküdar, İstanbul"
      onPress={() => handleItemPress(item)}
    />
  ), [handleItemPress]);

  if (isLoading) {
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
        <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="#1B4C84" />
        </View>
      </View>
    );
  }

  if (errorMessage) {
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
        <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      </View>
    );
  }

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
        />
        <Filter selectedFilter={selectedFilter} onFilterChange={handleFilterChange} />
      </View>
      <FlatList
        style={[styles.flatListStyle, { marginTop: headerTotalHeight + 16 }]}
        contentContainerStyle={styles.listContent}
        data={filteredItems}
        keyExtractor={keyExtractor}
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
                "{searchText}" found no results
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
    backgroundColor: 'transparent',
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

