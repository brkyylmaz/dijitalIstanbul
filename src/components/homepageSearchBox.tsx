import { PageListItem } from "../types/listElem";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, FlatList } from "react-native";
import ItemBox from "./itemBox";
import { SEARCH_INPUT_HEIGHT } from "./searchInput";
import { HORIZONTAL_SCREEN_PADDING, getHeaderExtension } from "../theme/layout";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSnapshot } from "valtio";
import { store } from "../store+client/store";

const HomepageSearchBox = ({searchTerm, navigation}: {searchTerm: string, navigation: any}) => {
  const { height } = useWindowDimensions();
  const headerBaseHeight = getHeaderExtension(height);
  const snap = useSnapshot(store);
  
  // Calculate position to float just below the search box
  const searchBoxTopPosition = headerBaseHeight - (SEARCH_INPUT_HEIGHT / 2);
  const floatingBoxTop = searchBoxTopPosition + SEARCH_INPUT_HEIGHT + 8;

  const results = snap.pageList.filter(x => x.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleItemPress = (item: PageListItem) => {
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

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={[styles.itemContainer, index < results.length - 1 && styles.itemBorder]}>
      <ItemBox
        title={item.title}
        thumbnailUrl={item.thumbnail_url}
        year={item.built_at}
        location={item.location_str}
        onPress={() => handleItemPress(item)}
      />
    </View>
  );

  // Calculate height for exactly 3 items (3 * item height + borders + padding)
  const itemHeight = 120 + 24; // ItemBox height + padding
  const flatListHeight = itemHeight * Math.min(results.length, 3);

  return (
    <View style={[styles.container, { top: floatingBoxTop }]}>
      <View style={styles.resultsContainer}>
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={{ height: flatListHeight }}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: HORIZONTAL_SCREEN_PADDING,
    right: HORIZONTAL_SCREEN_PADDING,
    zIndex: 100,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  itemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E6EB',
  },
});

export default HomepageSearchBox;