import React from 'react';
import {
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { HORIZONTAL_SCREEN_PADDING } from '../theme/layout';

const FEATURED_MOSQUES = [
  {
    id: 'suleymaniye',
    numericId: null, // Bu ID'ler API'den dinamik olarak çekilecek
    title: 'Süleymaniye Camii',
    image: 'https://dijitalistanbul.org/wp-content/uploads/2024/11/suleymaniye_camii.png',
  },
  {
    id: 'sultanahmet',
    numericId: null,
    title: 'Sultanahmet Camii',
    image: 'https://dijitalistanbul.org/wp-content/uploads/2024/08/924d05ffde.jpg',
  },
  {
    id: 'eyupsultan',
    numericId: null,
    title: 'Eyüp Sultan Camii',
    image: 'https://dijitalistanbul.org/wp-content/uploads/2024/08/eyupcamii-1.jpg',
  },
  {
    id: 'nuruosmaniye',
    numericId: null,
    title: 'Nuruosmaniye Camii',
    image: 'https://dijitalistanbul.org/wp-content/uploads/2024/11/nuruosmaniye_camii.jpg',
  },
  {
    id: 'fatih',
    numericId: null,
    title: 'Fatih Camii',
    image: 'https://dijitalistanbul.org/wp-content/uploads/2024/08/fatihcamii2.jpg',
  },
];

const SLIDE_HEIGHT = 300;
const DOT_SIZE = 10;
const DOT_GAP = 8;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Slider = () => {
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const slideWidth = Math.max(0, width - HORIZONTAL_SCREEN_PADDING * 2);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [mosqueIds, setMosqueIds] = React.useState<{[key: string]: number}>({});
  const flatListRef = React.useRef<FlatList>(null);

  // Cami ID'lerini API'den çek
  React.useEffect(() => {
    const fetchMosqueIds = async () => {
      try {
        const response = await fetch('https://cuzdan.basaranamortisor.com/api/page-list');
        if (response.ok) {
          const mosques = await response.json();
          const idMapping: {[key: string]: number} = {};
          
          FEATURED_MOSQUES.forEach(featuredMosque => {
            const match = mosques.find((mosque: any) => 
              mosque.title && featuredMosque.title &&
              mosque.title.toLowerCase().includes(featuredMosque.title.toLowerCase().replace(' Camii', ''))
            );
            if (match) {
              idMapping[featuredMosque.id] = match.id;
            }
          });
          
          setMosqueIds(idMapping);
        }
      } catch (error) {
        console.warn('Cami ID\'leri alınamadı:', error);
      }
    };

    fetchMosqueIds();
  }, []);

  const handleMosquePress = React.useCallback(async (mosque: typeof FEATURED_MOSQUES[number]) => {
    const numericId = mosqueIds[mosque.id];
    
    if (!numericId) {
      console.warn('Cami ID\'si bulunamadı:', mosque.id);
      return;
    }

    try {
      // Cami detaylarını API'den çek
      const response = await fetch(
        `https://cuzdan.basaranamortisor.com/api/page-data?id=${numericId}`
      );

      if (!response.ok) {
        throw new Error('Cami detayları yüklenemedi');
      }

      const mosqueData = await response.json();

      navigation.navigate('MosqueDetail', {
        mosqueId: numericId.toString(),
        mosqueData,
        sourceUrl: `https://qr.dijitalistanbul.org/u/${numericId}`
      });
    } catch (error) {
      console.error('Cami detayları yüklenirken hata:', error);
      // Hata durumunda da navigasyonu yap ama data olmadan
      navigation.navigate('MosqueDetail', {
        mosqueId: numericId.toString(),
        mosqueData: null,
        sourceUrl: `https://qr.dijitalistanbul.org/u/${numericId}`
      });
    }
  }, [mosqueIds, navigation]);

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / slideWidth);
      if (!Number.isNaN(index) && index !== activeIndex && index >= 0 && index < FEATURED_MOSQUES.length) {
        setActiveIndex(index);
      }
    },
    [activeIndex, slideWidth],
  );

  const scrollToIndex = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < FEATURED_MOSQUES.length && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true });
        setActiveIndex(index);
      }
    },
    [],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: (typeof FEATURED_MOSQUES)[number] }) => (
      <View style={[styles.slideItem, { width: slideWidth }]}>
        <TouchableOpacity 
          style={styles.slideTouch}
          onPress={() => handleMosquePress(item)}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={{ uri: item.image }}
            style={styles.slideImage}
          >
            <View style={styles.overlay} />
            <View style={styles.slideContent}>
              <Text numberOfLines={2} style={styles.slideTitle}>
                {item.title}
              </Text>
              <View
                style={styles.dotsContainer}
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel={`Slider göstergesi, ${FEATURED_MOSQUES.length} öğe`}
                accessibilityHint="Aktif camiyi gösterir"
              >
                {FEATURED_MOSQUES.map((mosque, dotIndex) => {
                  const isActive = dotIndex === activeIndex;
                  return (
                    <Pressable
                      key={mosque.id}
                      onPress={() => scrollToIndex(dotIndex)}
                      style={[styles.dot, isActive && styles.activeDot]}
                      accessibilityRole="button"
                      accessibilityLabel={`${mosque.title} slaytına git`}
                      accessibilityState={{ selected: isActive }}
                    />
                  );
                })}
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    ),
    [activeIndex, slideWidth, scrollToIndex, handleMosquePress],
  );

  const keyExtractor = React.useCallback((item: (typeof FEATURED_MOSQUES)[number]) => item.id, []);

  return (
    <View style={styles.sliderShell}>
      <View style={[styles.slideFrame, { width: slideWidth, height: SLIDE_HEIGHT }]}>
        <FlatList
          ref={flatListRef}
          data={FEATURED_MOSQUES}
          horizontal
          pagingEnabled
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          decelerationRate="fast"
          snapToInterval={slideWidth}
          snapToAlignment="start"
          disableIntervalMomentum
          bounces={false}
          scrollEventThrottle={16}
          style={styles.flatList}
          getItemLayout={(_, index) => ({
            length: slideWidth,
            offset: slideWidth * index,
            index,
          })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderShell: {
    marginTop: 0,
    marginBottom: 20,
    alignItems: 'center',
  },
  slideFrame: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  flatList: {
    flex: 1,
  },
  slideItem: {
    height: SLIDE_HEIGHT,
  },
  slideTouch: {
    flex: 1,
  },
  slideImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  slideContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: DOT_GAP,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: DOT_SIZE * 2.4,
  },
});

export default Slider;
