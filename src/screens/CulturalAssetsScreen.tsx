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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getHeaderExtension, HORIZONTAL_SCREEN_PADDING, HEADER_ICON_BUTTON_HEIGHT, HEADER_TO_SEARCH_GAP } from '../theme/layout';
import SearchInput from '../components/searchInput';
import Filter, { FILTER_HEIGHT } from '../components/filter';
import ItemBox from '../components/itemBox';
import { RootStackParamList } from '../navigation/AppNavigator';

type PageItem = {
  id: number;
  title: string;
  thumbnail_url: string;
};

const API_URL = 'https://cuzdan.basaranamortisor.com/api/page-list';

// Sabit API verisi - tasarım için geçici kullanım
const STATIC_MOSQUE_DATA = [{"id":"47fd3c9","elType":"container","settings":{"flex_direction":"column"},"elements":[{"id":"e023d89","elType":"widget","settings":{"module_type_layout":"on_left","title":"","subtitle":"Sesli Anlatım","heading_color":"#000000","subtitle_color":"#616161","subtitle_typography_typography":"custom","subtitle_typography_text_transform":"uppercase","title_highlighted":"highlighted","_margin":{"unit":"px","top":"0","right":"5","bottom":"0","left":"0","isLinked":false}},"elements":[],"widgetType":"ohio_heading"},{"id":"32eae32","elType":"widget","settings":{"shortcode":"[dijitalistanbul_audio]"},"elements":[],"widgetType":"shortcode"}],"isInner":false},{"id":"3271d6a","elType":"section","settings":{"stretch_section":"section-stretched","gap":"no","background_background":"classic","background_color":"#FFFFFF","css_classes":"clb__dark_section"},"elements":[{"id":"6915773","elType":"column","settings":{"_column_size":100,"_inline_size":100},"elements":[{"id":"6023647","elType":"section","settings":{"gap":"wide","structure":"40"},"elements":[{"id":"62e0ead","elType":"column","settings":{"_column_size":25,"_inline_size":42.564},"elements":[{"id":"e44431c","elType":"widget","settings":{"space":{"unit":"vh","size":5,"sizes":[]},"space_mobile":{"unit":"vh","size":6,"sizes":[]}},"elements":[],"widgetType":"spacer"},{"id":"1d53813","elType":"widget","settings":{"module_type_layout":"on_left","title":"1471-72","subtitle":"Yapım Yılı","heading_color":"#000000","subtitle_color":"#616161","subtitle_typography_typography":"custom","subtitle_typography_text_transform":"uppercase","title_highlighted":"highlighted","_background_background":"classic","_margin_mobile":{"unit":"px","top":"0","right":"0","bottom":"10","left":"0","isLinked":false}},"elements":[],"widgetType":"ohio_heading"},{"id":"b293c69","elType":"widget","settings":{"space":{"unit":"vh","size":4,"sizes":[]},"space_mobile":{"unit":"vh","size":1,"sizes":[]},"hide_mobile":"hidden-phone"},"elements":[],"widgetType":"spacer"},{"id":"aa6ce00","elType":"widget","settings":{"module_type_layout":"on_left","title":"Üsküdar, İstanbul","subtitle":"Konumu","heading_color":"#000000","subtitle_color":"#616161","subtitle_typography_typography":"custom","subtitle_typography_text_transform":"uppercase","title_highlighted":"highlighted","heading_tag":"h4","_element_width":"initial","_element_custom_width":{"unit":"%","size":103.782},"_flex_size":"none","_margin_mobile":{"unit":"px","top":"0","right":"0","bottom":"0","left":"0","isLinked":false}},"elements":[],"widgetType":"ohio_heading"},{"id":"14343e1","elType":"widget","settings":{"space":{"unit":"vh","size":5,"sizes":[]},"space_mobile":{"unit":"vh","size":1,"sizes":[]},"hide_mobile":"hidden-phone"},"elements":[],"widgetType":"spacer"}],"isInner":true},{"id":"e9a6eca","elType":"column","settings":{"_column_size":25,"_inline_size":2},"elements":[],"isInner":true},{"id":"1d3119c","elType":"column","settings":{"_column_size":25,"_inline_size":48.345},"elements":[{"id":"b7a17c8","elType":"widget","settings":{"space":{"unit":"vh","size":5,"sizes":[]},"space_tablet":{"unit":"vh","size":"","sizes":[]},"space_mobile":{"unit":"vh","size":5,"sizes":[]},"_margin_mobile":{"unit":"px","top":"0","right":"0","bottom":"-22","left":"0","isLinked":false}},"elements":[],"widgetType":"spacer"},{"id":"38e4112","elType":"widget","settings":{"module_type_layout":"on_left","title":"Rum Mehmed Paşa (Osmanlı sadrazamı)","subtitle":"Kim Yaptırdı","heading_color":"#000000","subtitle_color":"#616161","subtitle_typography_typography":"custom","subtitle_typography_text_transform":"uppercase","title_highlighted":"highlighted","heading_tag":"h4","_margin_mobile":{"unit":"px","top":"0","right":"0","bottom":"10","left":"0","isLinked":false}},"elements":[],"widgetType":"ohio_heading"},{"id":"0e1c390","elType":"widget","settings":{"space":{"unit":"vh","size":4,"sizes":[]},"space_mobile":{"unit":"vh","size":1,"sizes":[]},"hide_mobile":"hidden-phone"},"elements":[],"widgetType":"spacer"},{"id":"37fd100","elType":"widget","settings":{"module_type_layout":"on_left","title":"Mimar Sinan","subtitle":"Mimarı","heading_color":"#000000","subtitle_color":"#616161","subtitle_typography_typography":"custom","subtitle_typography_text_transform":"uppercase","title_highlighted":"highlighted","heading_tag":"h4"},"elements":[],"widgetType":"ohio_heading"}],"isInner":true},{"id":"573e98d","elType":"column","settings":{"_column_size":25,"_inline_size":7.091},"elements":[],"isInner":true}],"isInner":true},{"id":"f1c0cf2","elType":"section","settings":{"gap":"wide"},"elements":[{"id":"c721e8c","elType":"column","settings":{"_column_size":100,"_inline_size":null},"elements":[{"id":"0c24f27","elType":"widget","settings":[],"elements":[],"widgetType":"spacer"},{"id":"d2c88e3","elType":"widget","settings":{"title":"- Yapımından sonraki değişiklikler","header_size":"h5","title_color":"#000000"},"elements":[],"widgetType":"heading"},{"id":"c2457c3","elType":"widget","settings":{"editor":"<ul>\n<li><span style=\"color: #000000;\">1950 yılında gerçekleştirilen restorasyonda, son cemaat yeri ahşap çatı ile örtülmüştür. </span></li>\n<li><span style=\"color: #000000;\">1953 restorasyonunda ise beş kubbeli son cemaat yeri yeniden düzenlenmiş; minare, cephe ve kubbede dalgalı saçak görünümleri eklenmiştir. </span></li>\n<li><span style=\"color: #000000;\">Ahşap taklidi betonarme gergiler ilave edilmiştir. Külliyenin diğer yapıları olan medrese, hamam ve imaret günümüze ulaşamamış; sadece cami ve türbe ayakta kalmıştır.</span></li>\n</ul>","text_color":"#000000"},"elements":[],"widgetType":"text-editor"},{"id":"6511d4e","elType":"widget","settings":[],"elements":[],"widgetType":"spacer"},{"id":"a614180","elType":"widget","settings":{"title":"- Öne çıkan özellikleri","header_size":"h5","title_color":"#000000"},"elements":[],"widgetType":"heading"},{"id":"4538f30","elType":"widget","settings":{"editor":"  <ul>\n  <li><span style=\"color: #000000;\">Ters T planlı ve tabhaneli (fakirlere ve medrese talebesine sıcak yiyecek dağıtmak amacıyla kurulmuş hayır müessesesi) bir cami; merkezi kubbe, mihrap yönünde yarım kubbe ile desteklenmiştir. Osmanlı ve Bizans esintileri taşıyan özgün bir tasarıma sahiptir.</span></li>\n  <li><span style=\"color: #000000;\">Taş ve tuğla almaşık örgü; pandantiflerle kubbeye geçiş sağlanmıştır.</span></li>\n  <li><span style=\"color: #000000;\">Şerefe altı ve küp bölümü mukarnaslı (sarkıt) bezemeli, silindirik ve kalın gövdeli.</span></li>\n  <li><span style=\"color: #000000;\">Barok dönem kalem işleri; tromplarda ve mihrapta mukarnaslı detaylar.</span></li>\n  <li><span style=\"color: #000000;\">Caminin güneybatısında bulunan sekizgen planlı türbede Rum Mehmed Paşa'nın medfun olduğu kabul edilir.</span></li>\n  <li><span style=\"color: #000000;\">Bu cami, Üsküdar'ın erken dönem Osmanlı mimarisinin nadide örneklerinden biridir.</span></li>\n</ul>","text_color":"#000000"},"elements":[],"widgetType":"text-editor"},{"id":"3eb65bb","elType":"widget","settings":[],"elements":[],"widgetType":"spacer"}],"isInner":true}],"isInner":true}],"isInner":false}],"isInner":false}];

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<{ CulturalAssets: undefined }>,
  NativeStackNavigationProp<RootStackParamList>
>;

const CulturalAssetsScreen = React.memo(function CulturalAssetsScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const navigation = useNavigation<NavigationProp>();
  
  const headerBaseHeight = useMemo(() => getHeaderExtension(height), [height]);
  const headerTotalHeight = useMemo(() => headerBaseHeight + insets.top * 1.5, [headerBaseHeight, insets.top]);
  const searchInputTopOffset = useMemo(() => insets.top + HEADER_ICON_BUTTON_HEIGHT + HEADER_TO_SEARCH_GAP, [insets.top]);
  
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('camii');
  const [items, setItems] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

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
    if (searchText.length < 3) {
      return items;
    }

    const searchLower = searchText.toLowerCase().trim();
    return items.filter(item => 
      item.title.toLowerCase().includes(searchLower)
    );
  }, [items, searchText]);

  useFocusEffect(
    useCallback(() => {
      console.log('🎯 CulturalAssetsScreen FOCUSED');
      setIsMounted(true);
      return () => {
        console.log('👋 CulturalAssetsScreen BLURRED');
        setIsMounted(false);
      };
    }, [])
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
            setItems(data.filter(item => item.title && item.thumbnail_url));
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

  const handleItemPress = useCallback((item: PageItem) => {
    navigation.navigate('MosqueDetail', {
      mosqueId: item.id.toString(),
      mosqueData: STATIC_MOSQUE_DATA,
      sourceUrl: 'https://qr.dijitalistanbul.org/u/1hJmhiFP'
    });
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

