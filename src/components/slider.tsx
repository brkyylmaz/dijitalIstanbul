import React from 'react';
import {
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { HORIZONTAL_SCREEN_PADDING } from '../theme/layout';

const FEATURED_MOSQUES = [
  {
    id: 'suleymaniye',
    title: 'Süleymaniye Camii',
    image: 'https://dijitalistanbul.org/wp-content/uploads/2024/11/suleymaniye_camii.png',
  },
  {
    id: 'sultanahmet',
    title: 'Sultanahmet Camii',
    image: 'https://dijitalistanbul.org/wp-content/uploads/2024/08/924d05ffde.jpg',
  },
  {
    id: 'eyupsultan',
    title: 'Eyüp Sultan Camii',
    image: 'https://dijitalistanbul.org/wp-content/uploads/2024/08/eyupcamii-1.jpg',
  },
  {
    id: 'nuruosmaniye',
    title: 'Nuruosmaniye Camii',
    image: 'https://dijitalistanbul.org/wp-content/uploads/2024/11/nuruosmaniye_camii.jpg',
  },
  {
    id: 'fatih',
    title: 'Fatih Camii',
    image: 'https://dijitalistanbul.org/wp-content/uploads/2024/08/fatihcamii2.jpg',
  },
];

const SLIDE_HEIGHT = 300;
const DOT_SIZE = 10;
const DOT_GAP = 8;

const Slider = () => {
  const { width } = useWindowDimensions();
  const slideWidth = Math.max(0, width - HORIZONTAL_SCREEN_PADDING * 2);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const flatListRef = React.useRef<FlatList>(null);

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
      </View>
    ),
    [activeIndex, slideWidth, scrollToIndex],
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
