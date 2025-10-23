import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DetailOptions from '../components/detailOptions';
import KeyValueItem from '../components/KeyValueItem';
import AudioPlayer from '../components/AudioPlayer';
import { useIsFocused } from '@react-navigation/native';
import { SERV_ADDRESS } from '../store+client/consts';
import { PageFullInfo } from '../types/fullPage';
import { t } from '../modules/i18n';
import { addToFavorites, favoritesStore, removeFromFavorites } from '../store+client/favorites';
import { useSnapshot } from 'valtio';

type Props = NativeStackScreenProps<RootStackParamList, 'MosqueDetail'>;

type FavoriteHeaderProps = {
  isFavorite: boolean;
  onToggle: () => void;
};

const FavoriteHeader: React.FC<FavoriteHeaderProps> = ({ isFavorite, onToggle }) => (
  <TouchableOpacity
    style={[
      styles.iconButton,
      { backgroundColor: '#D9DDE08C' }
    ]}
    accessibilityLabel={isFavorite ? t('detail.favorite_remove') : t('detail.favorite_add')}
    activeOpacity={0.7}
    onPress={onToggle}
  >
    <Text style={{
      fontSize: 24,
      color: isFavorite ? '#000000' : '#FFFFFF',
      textAlign: 'center',
    }}>
      ★
    </Text>
  </TouchableOpacity>
);

function MosqueDetailScreen({ route, navigation }: Props) {
  const { postID } = route.params;
  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'info' | 'audio' | 'location'>('info');
  const [pageData, setPageData] = useState<PageFullInfo | null>(null);
  const f = useIsFocused();
  const favSnap = useSnapshot(favoritesStore);

  useEffect(()=>{
    if (!f){return}

    (async ()=>{

      await fetch(SERV_ADDRESS+"/pages/"+postID)
        .then(x => x.json())
        .then(setPageData)
        .catch(err => setErrorMessage(err.toString()));

      setIsLoading(false);
    })()


  }, [f]);

  const toggleFavorite = ()=>{
    if (favSnap.favorites.includes(postID)){
      removeFromFavorites(postID);
    } else {
      addToFavorites(postID);
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <FavoriteHeader 
          isFavorite={favSnap.favorites.includes(postID)} 
          onToggle={toggleFavorite} 
        />
      ),
    });
  }, [navigation, favSnap.favorites.includes(postID), toggleFavorite]);


  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1B4C84" />
        <Text style={styles.helperText}>{t('detail.loading')}</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContentNew} 
      style={styles.container}
    >
      <View style={[styles.imageContainer, { height: Math.max(460, width * 0.6) }]}>
        <Image resizeMode="cover" source={{ uri: pageData?.thumbnail_url }} style={styles.coverImageNew} />
        <View style={styles.titleOverlay}>
          <Text style={styles.titleNew}>{pageData?.title}</Text>
        </View>
      </View>

      <View style={styles.contentCompact}>
        <DetailOptions
          selectedOption={selectedOption}
          onInfoPress={() => setSelectedOption('info')}
          onAudioPress={() => setSelectedOption('audio')}
          onLocationPress={() => setSelectedOption('location')}
        />
      </View>

      <View style={styles.contentCompact}>
        {selectedOption === 'info' ? (
          <View style={styles.infoContainer}>
            {/* Üst satır: Yapım ve Konum yan yana */}
            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardLabel}>{pageData?.page_type == "mosque" ? t('detail.mosque.built_year') : t('detail.mausoleum.person_in_tomb')}</Text>
                <Text style={styles.infoCardValue}>{pageData?.page_type == "mosque" ? pageData.built_at : pageData?.contains[0].name}</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardLabel}>{t('detail.mosque.location')}</Text>
                <Text style={styles.infoCardValue}>{pageData?.location_str}</Text>
              </View>
            </View>
            
            {/* Alt satırlar: Kim Yaptırdı ve Mimarı tek tek */}
            <View style={styles.infoCardFull}>
              <Text style={styles.infoCardLabel}>{pageData?.page_type == "mosque" ? t('detail.mosque.built_by') : t('detail.mausoleum.title')}</Text>
              <Text style={styles.infoCardValue}>{pageData?.page_type == "mosque" ? pageData.built_by : pageData?.contains[0].title}</Text>
            </View>
            <View style={styles.infoCardFull}>
              <Text style={styles.infoCardLabel}>{pageData?.page_type == "mosque" ? t('detail.mosque.architect') : t('detail.mausoleum.birth_death')}</Text>
              <Text style={styles.infoCardValue}>{pageData?.page_type == "mosque" ? pageData.architect : pageData?.contains[0].life_years}</Text>
            </View>
            
            {/* Ek Bilgiler - Dummy data'dan geliyor */}
            <View style={styles.keyValueSection}>
              <KeyValueItem 
                label={pageData?.page_type == "mosque" ? t('detail.mosque.changes_after_construction') : t('detail.mausoleum.about_person')}
                value={pageData?.page_type == "mosque" ? pageData.changes : pageData?.contains[0].about}
              />

              {pageData?.page_type != "mosque" && <>
                <KeyValueItem 
                  label={t('detail.mausoleum.built_year')}
                  value={pageData?.built_at}
                />
                <KeyValueItem 
                  label={t('detail.mausoleum.built_by')}
                  value={pageData?.built_by}
                />
                <KeyValueItem 
                  label={t('detail.mausoleum.architect')}
                  value={pageData?.architect}
                />
              </>}

              <KeyValueItem 
                label={t('detail.prominent_features')}
                value={pageData?.properties}
              />
            </View>
          </View>
        ) : selectedOption === 'audio' ? (
          <AudioPlayer 
            audioUrl={`https://dijitalistanbul.org/dijitalistanbulaudio/${postID}.mp3`}
            title={pageData?.title}
            subtitle={t('app.subtitle')}
          />
        ) : selectedOption === 'location' ? (
          <View style={styles.infoBlock}>
            <Text style={styles.placeholderText}>{t('detail.map_coming_soon')}</Text>
          </View>
        ) : null}
      </View>
{/* 
      <View style={styles.content}>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Ham API Cevabı</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeText} selectable>
            {payloadPreview}
          </Text>
        </View>
      </View> */}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  coverImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 16,
  },
  infoBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    marginBottom: 24,
  },
  infoContainer: {
    gap: 12,
    marginBottom: 24,
  },
  keyValueSection: {
    backgroundColor: 'transparent',
    marginTop: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 16,
  },
  infoCardFull: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 16,
  },
  infoCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#52606D',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#D8DEE6',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 8,
  },
  codeContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E7EB',
  },
  codeText: {
    fontFamily: 'Menlo',
    fontSize: 12,
    color: '#334054',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F6FA',
  },
  helperText: {
    marginTop: 12,
    fontSize: 16,
    color: '#3E4C59',
  },
  errorText: {
    fontSize: 16,
    color: '#D9534F',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  favoriteIcon: {
    width: 20,
    height: 20,
    tintColor: '#1A1E24',
  },
  // Yeni styles
  scrollContentNew: {
    paddingBottom: 48,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 460,
    overflow: 'hidden',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  coverImageNew: {
    width: '100%',
    height: '100%',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 34,
    left: 34,
    right: 34,
  },
  titleNew: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  contentCompact: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#52606D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  });

export default MosqueDetailScreen;


