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
import { t } from '../modules/i18n';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { HORIZONTAL_SCREEN_PADDING } from '../theme/layout';
import { PageListItem, store } from '../store+client/store';

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

  const featuredMosques = (()=>{
    const ids: Record<number, number> = {};
    let cnt = 0;

    for (let i=0; i<store.pageList.length && cnt < store.appAttributes.highlighted.length; i++){
      if (store.appAttributes.highlighted.includes(store.pageList[i].trid)){
        ids[store.pageList[i].trid] = i;
        cnt++
      }
    }

    return store.appAttributes.highlighted.map(trid => store.pageList[ids[trid]]);
  })()

  const handleMosquePress = (item: PageListItem)=>{
    navigation.navigate('MosqueDetail', {
      postID: item.id
    });
  }

  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / slideWidth);
      if (!Number.isNaN(index) && index !== activeIndex && index >= 0 && index < featuredMosques.length) {
        setActiveIndex(index);
      }
    },
    [activeIndex, slideWidth],
  );

  const scrollToIndex = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < featuredMosques.length && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true });
        setActiveIndex(index);
      }
    },
    [],
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
            <View style={styles.slideContent}>
              <Text numberOfLines={2} style={styles.slideTitle}>
                {item.title}
              </Text>
              <View
                style={styles.dotsContainer}
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
    [activeIndex, slideWidth, scrollToIndex, handleMosquePress],
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
});

export default Slider;
