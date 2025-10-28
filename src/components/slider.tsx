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
import { t, isRtl } from '../modules/i18n';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { HORIZONTAL_SCREEN_PADDING } from '../theme/layout';
import { PageListItem, store } from '../store+client/store';
import { useSnapshot } from 'valtio';

const SLIDE_HEIGHT = 300;
const DOT_SIZE = 10;
const DOT_GAP = 8;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Slider = () => {
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const slideWidth = Math.max(0, width - HORIZONTAL_SCREEN_PADDING * 2);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const flatListRef = React.useRef<FlatList>(null);
  const isRTL = isRtl();
  const snap = useSnapshot(store);

  // Her uygulama açılışında rastgele cami ve türbeler seç
  const featuredMosques = React.useMemo(() => {
    // Cami ve türbeleri filtrele
    const culturalAssets = snap.pageList.filter((item: PageListItem) => 
      item.page_type === 'mosque' || 
      item.page_type === 'mausoleum-single' || 
      item.page_type === 'mausoleum-multi'
    );

    // Rastgele karıştır (Fisher-Yates shuffle algoritması)
    const shuffled = [...culturalAssets];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // İlk 5 tanesini al (veya daha az varsa hepsini)
    return shuffled.slice(0, Math.min(5, shuffled.length));
  }, [snap.pageList])

  const handleMosquePress = React.useCallback((item: PageListItem)=>{
    // Cami ve türbeleri ilgili detay sayfasına yönlendir
    switch (item.page_type) {
      case "mosque":
      case "mausoleum-single":
        navigation.navigate('MosqueDetail', {
          postID: item.id
        });
        break;

      case "mausoleum-multi":
        navigation.navigate('MultipleTombDetail', {
          postID: item.id
        });
        break;
    }
  }, [navigation]);

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / slideWidth);
      if (!Number.isNaN(index) && index !== activeIndex && index >= 0 && index < featuredMosques.length) {
        setActiveIndex(index);
      }
    },
    [activeIndex, slideWidth, featuredMosques.length],
  );

  const scrollToIndex = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < featuredMosques.length && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true });
        setActiveIndex(index);
      }
    },
    [featuredMosques.length],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: PageListItem }) => (
      <View style={[styles.slideItem, { width: slideWidth }]}>
        <TouchableOpacity 
          style={styles.slideTouch}
          onPress={() => handleMosquePress(item)}
          activeOpacity={0.9}
        >
          <ImageBackground
            source={{ uri: item.thumbnail_url }}
            style={styles.slideImage}
          >
            <View style={styles.overlay} />
            <View style={[styles.slideContent, isRTL && styles.slideContentRTL]}>
              <Text numberOfLines={2} style={[styles.slideTitle, isRTL && styles.slideTitleRTL]}>
                {item.title}
              </Text>
              <View
                style={[styles.dotsContainer, isRTL && styles.dotsContainerRTL]}
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel={`Slider göstergesi, ${featuredMosques.length} öğe`}
                accessibilityHint={t('components.slider.active_mosque_hint')}
              >
                {featuredMosques.map((mosque, dotIndex) => {
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
    [activeIndex, slideWidth, scrollToIndex, handleMosquePress, isRTL, featuredMosques],
  );

  return (
    <View style={styles.sliderShell}>
      <View style={[styles.slideFrame, { width: slideWidth, height: SLIDE_HEIGHT }]}>
        <FlatList
          ref={flatListRef}
          data={featuredMosques}
          horizontal
          pagingEnabled
          keyExtractor={(item: PageListItem) => item.id.toString()}
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
  
  // RTL (Arapça) Stilleri
  slideContentRTL: {
    flexDirection: 'row-reverse',
  },
  slideTitleRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  dotsContainerRTL: {
    justifyContent: 'flex-start',
  },
});

export default Slider;
