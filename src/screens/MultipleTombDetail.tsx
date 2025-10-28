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
import AccordionItem from '../components/AccordionItem';
import AudioPlayer from '../components/AudioPlayer';
import { useIsFocused } from '@react-navigation/native';
import { SERV_ADDRESS } from '../store+client/consts';
import { PageFullInfo } from '../types/fullPage';
import { t, isRtl } from '../modules/i18n';
import { addToFavorites, favoritesStore, removeFromFavorites } from '../store+client/favorites';
import { useSnapshot } from 'valtio';


type Props = NativeStackScreenProps<RootStackParamList, 'MultipleTombDetail'>;

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

function MultipleTombDetailScreen({ navigation, route }: Props) {
  const { postID } = route.params;
  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'info' | 'audio' | 'location'>('info');
  const [pageData, setPageData] = useState<PageFullInfo | null>(null);
  const f = useIsFocused();
  const favSnap = useSnapshot(favoritesStore);
  const rtl = isRtl();

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
          <Text style={[styles.titleNew, rtl && styles.titleNewRtl]}>{pageData?.title}</Text>
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
            {/* Türbedeki Kişiler - Accordion */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, rtl && styles.sectionTitleRtl]}>{t('detail.people_in_tomb')}</Text>
              
              {pageData?.contains?.map((person, index) => (
                <AccordionItem key={index} title={person.name} isInitiallyOpen={false}>
                  <KeyValueItem 
                    label={t('detail.person_life_years')}
                    value={person.life_years}
                  />
                  <KeyValueItem 
                    label={t('detail.person_title')}
                    value={person.title}
                  />
                  <KeyValueItem 
                    label={t('detail.person_about')}
                    value={person.about}
                  />
                </AccordionItem>
              ))}
            </View>

            {/* Türbe Hakkında */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, rtl && styles.sectionTitleRtl]}>{t('detail.tomb_about')}</Text>
              
              <View style={styles.tombInfoCards}>
                {/* Konumu */}
                <View style={styles.infoCardFull}>
                  <Text style={[styles.infoCardLabel, rtl && styles.infoTextRtl]}>{t('detail.mosque.location')}</Text>
                  <Text style={[styles.infoCardValue, rtl && styles.infoTextRtl]}>{pageData?.location_str}</Text>
                </View>

                <View style={[styles.infoRow, rtl && styles.infoRowRtl]}>
                  <View style={styles.infoCard}>
                    <Text style={[styles.infoCardLabel, rtl && styles.infoTextRtl]}>{t('detail.mausoleum.built_year')}</Text>
                    <Text style={[styles.infoCardValue, rtl && styles.infoTextRtl]}>{pageData?.built_at}</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={[styles.infoCardLabel, rtl && styles.infoTextRtl]}>{t('detail.mausoleum.built_by')}</Text>
                    <Text style={[styles.infoCardValue, rtl && styles.infoTextRtl]}>{pageData?.built_by}</Text>
                  </View>
                </View>

                <View style={styles.infoCardFull}>
                  <Text style={[styles.infoCardLabel, rtl && styles.infoTextRtl]}>{t('detail.mausoleum.architect')}</Text>
                  <Text style={[styles.infoCardValue, rtl && styles.infoTextRtl]}>{pageData?.architect}</Text>
                </View>

                <KeyValueItem 
                  label={t('detail.prominent_features')}
                  value={pageData?.properties || []}
                />
              </View>
            </View>
          </View>
        ) : selectedOption === 'audio' ? (
          <AudioPlayer 
            audioUrl={`https://dijitalistanbul.org/dijitalistanbulaudio/${postID}.mp3`}
            title={pageData?.title}
            imageUrl={pageData?.thumbnail_url}
          />
        ) : selectedOption === 'location' ? (
          <View style={styles.infoBlock}>
            <Text style={styles.placeholderText}>{t('detail.map_coming_soon')}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
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
  titleNewRtl: {
    textAlign: 'right',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  contentCompact: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    marginBottom: 24,
  },
  tombInfoCards: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoRowRtl: {
    flexDirection: 'row-reverse',
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
  infoTextRtl: {
    textAlign: 'right',
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 12,
    paddingLeft: 4,
  },
  sectionTitleRtl: {
    textAlign: 'right',
    paddingLeft: 0,
    paddingRight: 4,
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
  placeholderText: {
    fontSize: 16,
    color: '#52606D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MultipleTombDetailScreen;

