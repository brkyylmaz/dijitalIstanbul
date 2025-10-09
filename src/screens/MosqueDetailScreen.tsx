import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
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

const PAGE_LIST_API = 'https://cuzdan.basaranamortisor.com/api/page-list';

type Props = NativeStackScreenProps<RootStackParamList, 'MosqueDetail'>;

type HighlightInfo = {
  title?: string;
  buildYear?: string;
  location?: string;
  patron?: string;
  architect?: string;
};

type PageListItem = {
  id: number;
  title: string;
  thumbnail_url: string;
};

function MosqueDetailScreen({ route, navigation }: Props) {
  const { mosqueId, mosqueData, sourceUrl } = route.params;
  const { width } = useWindowDimensions();
  const [detail, setDetail] = useState(route.params.mosqueData);
  const [highlight, setHighlight] = useState<HighlightInfo>({});
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(!route.params.mosqueData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<'info' | 'audio' | 'location'>('info');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: '#D9DDE08C' }
          ]}
          accessibilityLabel={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          activeOpacity={0.7}
          onPress={() => {
            setIsFavorite(!isFavorite);
          }}
        >
          <Text style={{
            fontSize: 24,
            color: isFavorite ? '#000000' : '#FFFFFF',
            textAlign: 'center',
          }}>
            ★
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isFavorite]);

  useEffect(() => {
    if (!mosqueData && sourceUrl) {
      const fetchDetail = async () => {
        try {
          const encodedUrl = encodeURIComponent(sourceUrl);
          const response = await fetch(
            `https://cuzdan.basaranamortisor.com/api/resolve_qr?url=${encodedUrl}`,
          );

          if (!response.ok) {
            throw new Error('Detail not found');
          }

          const data = await response.json();
          setDetail(data);
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetail();
    } else {
      setIsLoading(false);
    }
  }, [mosqueData, sourceUrl]);

  useEffect(() => {
    const fetchImage = async () => {
      if (!mosqueId) {
        return;
      }

      try {
        const response = await fetch(PAGE_LIST_API);
        if (!response.ok) {
          throw new Error('Image not found');
        }

        const pages: PageListItem[] = await response.json();
        const match = pages.find(page => page.id.toString() === mosqueId);
        if (match?.thumbnail_url) {
          setImageUrl(match.thumbnail_url);
        }
        if (match?.title) {
          setHighlight(prev => ({
            ...prev,
            title: match.title,
          }));
        }
      } catch (error) {
        // Görsel alınamazsa veya başlık bulunamazsa sessizce devam et
      }
    };

    fetchImage();
  }, [mosqueId]);

  useEffect(() => {
    if (!detail) {
      return;
    }

    const info: HighlightInfo = {};

    const walk = (node: any) => {
      if (!node) {
        return;
      }

      if (Array.isArray(node)) {
        node.forEach(child => walk(child));
        return;
      }

      if (typeof node !== 'object') {
        return;
      }

      if (node.settings?.subtitle && node.settings?.title) {
        const subtitle = String(node.settings.subtitle).toLowerCase();
        const titleText = String(node.settings.title).trim();

        if (subtitle.includes('yapım yılı')) {
          info.buildYear = titleText;
        } else if (subtitle.includes('konumu')) {
          info.location = titleText;
        } else if (subtitle.includes('kim yaptırdı')) {
          info.patron = titleText;
        } else if (subtitle.includes('mimarı')) {
          info.architect = titleText;
        }
      }

      if (Array.isArray(node.elements)) {
        node.elements.forEach((child: any) => walk(child));
      }
    };

    walk(detail);

    const slugTitle = () => {
      if (!sourceUrl) {
        return undefined;
      }
      const match = sourceUrl.match(/\/([^/]+)\/?$/);
      if (match && match[1]) {
        return decodeURIComponent(match[1].replace(/-/g, ' '));
      }
      return undefined;
    };

    setHighlight(prev => ({
      title: prev.title ?? info.title ?? slugTitle(),
      buildYear: info.buildYear ?? prev.buildYear,
      location: info.location ?? prev.location,
      patron: info.patron ?? prev.patron,
      architect: info.architect ?? prev.architect,
    }));
  }, [detail, sourceUrl]);

  const playAudio = async () => {
    if (!mosqueId) {
      Alert.alert('Hata', 'Ses dosyası bulunamadı');
      return;
    }

    try {
      const audioUrl = `https://dijitalistanbul.org/dijitalistanbulaudio/${mosqueId}.mp3`;
      console.log('🎵 Opening audio URL:', audioUrl);
      
      // Ses dosyasını cihazın varsayılan oynatıcısında aç
      const supported = await Linking.canOpenURL(audioUrl);
      if (supported) {
        setIsPlayingAudio(true);
        await Linking.openURL(audioUrl);
        // 2 saniye sonra durumu sıfırla
        setTimeout(() => setIsPlayingAudio(false), 2000);
      } else {
        Alert.alert('Hata', 'Ses dosyası açılamadı');
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      Alert.alert('Hata', 'Ses dosyası oynatılırken bir hata oluştu');
      setIsPlayingAudio(false);
    }
  };

  // const payloadPreview = !detail 
  //   ? 'Veri bulunamadı' 
  //   : JSON.stringify(detail, null, 2);

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1B4C84" />
        <Text style={styles.helperText}>Detaylar yükleniyor...</Text>
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
      {imageUrl ? (
        <View style={[styles.imageContainer, { height: Math.max(460, width * 0.6) }]}>
          <Image resizeMode="cover" source={{ uri: imageUrl }} style={styles.coverImageNew} />
          <View style={styles.titleOverlay}>
            <Text style={styles.titleNew}>{highlight.title ?? 'Cami Detayı'}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>{highlight.title ?? 'Cami Detayı'}</Text>
        </View>
      )}

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
              {highlight.buildYear ? (
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardLabel}>Yapım</Text>
                  <Text style={styles.infoCardValue}>{highlight.buildYear}</Text>
                </View>
              ) : null}
              {highlight.location ? (
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardLabel}>Konumu</Text>
                  <Text style={styles.infoCardValue}>{highlight.location}</Text>
                </View>
              ) : null}
            </View>
            
            {/* Alt satırlar: Kim Yaptırdı ve Mimarı tek tek */}
            {highlight.patron ? (
              <View style={styles.infoCardFull}>
                <Text style={styles.infoCardLabel}>Kim Yaptırdı</Text>
                <Text style={styles.infoCardValue}>{highlight.patron}</Text>
              </View>
            ) : null}
            {highlight.architect ? (
              <View style={styles.infoCardFull}>
                <Text style={styles.infoCardLabel}>Mimarı</Text>
                <Text style={styles.infoCardValue}>{highlight.architect}</Text>
              </View>
            ) : null}
          </View>
        ) : selectedOption === 'audio' ? (
          <View style={styles.audioContainer}>
            <View style={styles.audioCard}>
              <Text style={styles.audioTitle}>Sesli Anlatım</Text>
              <Text style={styles.audioDescription}>
                {highlight.title ? `${highlight.title} hakkında sesli anlatım` : 'Cami hakkında sesli anlatım'}
              </Text>
              
              <TouchableOpacity 
                style={styles.playButton}
                onPress={playAudio}
                activeOpacity={0.7}
                disabled={isPlayingAudio}
              >
                <Text style={styles.playButtonText}>
                  {isPlayingAudio ? '🎵 Açılıyor...' : '▶️ Sesli Anlatımı Başlat'}
                </Text>
              </TouchableOpacity>
              
              {mosqueId && (
                <Text style={styles.audioNote}>
                  Ses dosyası cihazınızın varsayılan oynatıcısında açılacak
                </Text>
              )}
            </View>
          </View>
        ) : selectedOption === 'location' ? (
          <View style={styles.infoBlock}>
            <Text style={styles.placeholderText}>Harita özellikleri yakında eklenecek</Text>
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
  audioContainer: {
    marginBottom: 24,
  },
  audioCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 20,
    alignItems: 'center',
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 8,
    textAlign: 'center',
  },
  audioDescription: {
    fontSize: 14,
    color: '#52606D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  playButton: {
    backgroundColor: '#1B1B1B',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 12,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  audioNote: {
    fontSize: 12,
    color: '#52606D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  });

export default MosqueDetailScreen;


