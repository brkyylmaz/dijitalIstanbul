import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Video from 'react-native-video';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DetailOptions from '../components/detailOptions';
import KeyValueItem from '../components/KeyValueItem';

const PAGE_LIST_API = 'https://cuzdan.basaranamortisor.com/api/page-list';

// Dummy Ek Bilgiler - API'den gelecek
const DUMMY_ADDITIONAL_INFO = {
  changes: {
    label: "Yapımından Sonraki Değişiklikler:",
    values: [
      "Ayasofya, aynı yerde üç kez inşa edilmiştir.",
      'İlk Ayasofya yapısı, "Büyük Kilise" olarak bilinir ve II. Konstantin döneminde, 360 yılında ibadete açılmıştır ancak 404 yılında çıkan bir isyan sırasında meydana gelen yangında neredeyse tamamen yok olmuş ve bu ilk yapıya dair hiçbir kalıntı günümüze ulaşmamıştır.',
      "Ayasofya'nın ikinci yapısı, ilk yapının kalıntıları üzerine II. Theodosius tarafından inşa edilmiş ve 415 yılında ibadete açılmıştır. Bu yapı da bazilika planında tasarlanmış ve ahşap bir çatıyla örtülmüştür. Ancak, 532 yılında İmparator I. Justinianus'a karşı gerçekleştirilen Nika Ayaklanması sırasında bu yapı da yakılarak tahrip edilmiştir.",
      "537 yılında patriklik katedrali olarak bazilika planında tamamlanan yapı, 1453'te İstanbul'un Fethi'nin ardından Osmanlı Padişahı Fatih Sultan Mehmed tarafından camiye dönüştürülmüştür.",
      "Osmanlı döneminde, kilise formundan camiye dönüştürülen yapıya minareler, mihrap, minber ve hünkar mahfili gibi unsurlar eklenmiştir.",
      "1935 yılında cami statüsü kaldırılmış ve müze haline getirilmiştir.",
      "2020 yılında ise Ayasofya yeniden cami olarak kullanılmaya başlanmıştır."
    ]
  },
  features: {
    label: "Öne Çıkan Özellikleri:",
    values: [
      "Doğu Roma ve Osmanlı mimarisinin birleştiği en önemli eserlerden biridir.",
      "Ayasofya, mimari açıdan dünya tarihinin en önemli yapılarından biridir. En dikkat çekici özelliği, 31 metre çapındaki devasa kubbesiyle sanki havada asılı gibi durmasıdır; bu, Erken Bizans mimarisinde bir devrim olarak kabul edilir. Kubbe, 40 pencereyle çevrilidir ve içeriye mistik bir ışık sağlar.",
      'İç mekanındaki mozaikler, özellikle "Deesis Mozaiği" ve "Meryem Ana ile Çocuk İsa" tasvirleri, Bizans sanatının zirvesini yansıtır. Dört minaresi, Osmanlı döneminde eklenmiştir ve yapının siluetine eşsiz bir karakter katar.',
      "İçerisindeki renkli mermer döşemeler, çeşitli bölgelerden getirilen taşlarla kaplı sütunlar ve geniş hacimli naos (ana ibadet alanı), yapının ihtişamını artırır. Ayasofya'nın akustiği de dikkat çekicidir; kubbenin altında yayılan ses, yapının büyüklüğüne rağmen yankılanarak eşsiz bir deneyim sunar."
    ]
  }
};

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
    accessibilityLabel={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
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
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const videoRef = useRef<any>(null);
  
  // Dummy ek bilgileri kullan - Gerçek implementasyonda API'den gelecek
  const [additionalInfo] = useState(DUMMY_ADDITIONAL_INFO);

  const toggleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
  }, [isFavorite]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <FavoriteHeader 
          isFavorite={isFavorite} 
          onToggle={toggleFavorite} 
        />
      ),
    });
  }, [navigation, isFavorite, toggleFavorite]);

  useEffect(() => {
    if (!mosqueData && sourceUrl) {
      const fetchDetail = async () => {
        try {
          const encodedUrl = encodeURIComponent(sourceUrl);
          
          // 1. ADIM: Önce resolve-qr'den ID'yi al (düz metin olarak geliyor)
          const resolveResponse = await fetch(
            `https://cuzdan.basaranamortisor.com/api/resolve-qr?url=${encodedUrl}`,
          );

          if (!resolveResponse.ok) {
            throw new Error('QR kodu çözümlenemedi');
          }

          const resolvedMosqueId = await resolveResponse.text(); // ID düz metin olarak geliyor
          
          if (!resolvedMosqueId || resolvedMosqueId.trim() === '') {
            throw new Error('Geçersiz QR kodu');
          }

          // 2. ADIM: Bu ID ile page-data'dan detaylı veriyi al
          const dataResponse = await fetch(
            `https://cuzdan.basaranamortisor.com/api/page-data?id=${resolvedMosqueId.trim()}`,
          );

          if (!dataResponse.ok) {
            throw new Error('Cami detayları bulunamadı');
          }

          const data = await dataResponse.json();
          setDetail(data);
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : 'Beklenmeyen hata');
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

    // Pozisyon bazlı algoritma - her dilde aynı yapı
    const extractInfoByPosition = (data: any) => {
      try {
        const mainSection = data[1]?.elements[0]?.elements[0]; // Ana yapı
        
        if (!mainSection) {
          return {};
        }
        
        // Sol column - Yapım yılı ve konum
        const leftColumn = mainSection?.elements[0];
        const buildYear = leftColumn?.elements[1]?.settings?.title;
        const location = leftColumn?.elements[3]?.settings?.title;
        
        // Sağ column - Kim yaptırdı ve mimarı  
        const rightColumn = mainSection?.elements[2];
        const patron = rightColumn?.elements[1]?.settings?.title;
        const architect = rightColumn?.elements[3]?.settings?.title;
        
        return { 
          buildYear: buildYear?.trim(), 
          location: location?.trim(), 
          patron: patron?.trim(), 
          architect: architect?.trim() 
        };
      } catch (error) {
        console.warn('Pozisyon bazlı çıkarma hatası:', error);
        return {};
      }
    };

    // Pozisyon bazlı çıkarma yap
    const extractedInfo = extractInfoByPosition(detail);
    
    // Eğer pozisyon bazlı çıkarma başarısız olursa fallback olarak eski yöntemi kullan
    if (!extractedInfo.buildYear && !extractedInfo.location && !extractedInfo.patron && !extractedInfo.architect) {
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

          if (subtitle.includes('yapım yılı') || subtitle.includes('year') || subtitle.includes('سنة البناء')) {
            info.buildYear = titleText;
          } else if (subtitle.includes('konumu') || subtitle.includes('location') || subtitle.includes('موقع')) {
            info.location = titleText;
          } else if (subtitle.includes('kim yaptırdı') || subtitle.includes('patron') || subtitle.includes('الذي أمر ببنائه')) {
            info.patron = titleText;
          } else if (subtitle.includes('mimarı') || subtitle.includes('architect') || subtitle.includes('معمار')) {
            info.architect = titleText;
          }
        }

        if (Array.isArray(node.elements)) {
          node.elements.forEach((child: any) => walk(child));
        }
      };

      walk(detail);
    } else {
      // Pozisyon bazlı çıkarma başarılıysa onu kullan
      Object.assign(info, extractedInfo);
    }

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

  const toggleAudio = () => {
    if (!mosqueId) {
      Alert.alert('Hata', 'Ses dosyası bulunamadı');
      return;
    }

    if (audioError) {
      Alert.alert('Hata', 'Ses dosyası yüklenemedi');
      return;
    }

    setIsPlayingAudio(!isPlayingAudio);
  };

  const onAudioLoad = (data: any) => {
    setAudioDuration(data.duration);
    setAudioLoaded(true);
    setAudioError(null);
  };

  const onAudioProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  const onAudioError = (error: any) => {
    console.error('Audio error:', error);
    setAudioError('Ses dosyası yüklenemedi');
    setIsPlayingAudio(false);
  };

  const onAudioEnd = () => {
    setIsPlayingAudio(false);
    setCurrentTime(0);
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const seekBackward = () => {
    if (videoRef.current && audioLoaded) {
      const newTime = Math.max(0, currentTime - 10);
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  const seekForward = () => {
    if (videoRef.current && audioLoaded) {
      const newTime = Math.min(audioDuration, currentTime + 10);
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
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
            
            {/* Ek Bilgiler - Dummy data'dan geliyor */}
            <View style={styles.keyValueSection}>
              <KeyValueItem 
                label={additionalInfo.changes.label}
                value={additionalInfo.changes.values}
              />
              
              <KeyValueItem 
                label={additionalInfo.features.label}
                value={additionalInfo.features.values}
              />
            </View>
          </View>
        ) : selectedOption === 'audio' ? (
          <View style={styles.audioContainer}>
            {/* Modern Glassmorphism Audio Player */}
            <View style={styles.modernAudioCard}>
              {mosqueId && (
                <>
                  <Video
                    ref={videoRef}
                    source={{ uri: `https://dijitalistanbul.org/dijitalistanbulaudio/${mosqueId}.mp3` }}
                    paused={!isPlayingAudio}
                    onLoad={onAudioLoad}
                    onProgress={onAudioProgress}
                    onError={onAudioError}
                    onEnd={onAudioEnd}
                    playInBackground={true}
                    playWhenInactive={false}
                    style={styles.audioPlayer}
                  />
                  
                  {/* Floating Track Info Card */}
                  <View style={styles.modernTrackInfo}>
                    <View style={styles.trackIconContainer}>
                      <Text style={styles.trackIcon}>🎵</Text>
                    </View>
                    <View style={styles.trackTextContainer}>
                      <Text style={styles.modernTrackTitle} numberOfLines={1}>
                        {highlight.title || 'Ses Dosyası'}
                      </Text>
                      <Text style={styles.modernTrackSubtitle} numberOfLines={1}>
                        Dijital İstanbul
                      </Text>
                    </View>
                  </View>
                  
                  {/* Modern Progress Section */}
                  {audioLoaded && (
                    <View style={styles.modernProgressSection}>
                      <View style={styles.modernProgressBar}>
                        <View 
                          style={[
                            styles.modernProgressFill, 
                            { width: audioDuration > 0 ? `${(currentTime / audioDuration) * 100}%` : '0%' }
                          ]} 
                        />
                        <View style={styles.modernProgressGlow} />
                      </View>
                      <View style={styles.modernTimeContainer}>
                        <Text style={styles.modernTimeText}>{formatTime(currentTime)}</Text>
                        <Text style={styles.modernTimeText}>{formatTime(audioDuration)}</Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Premium Control Buttons */}
                  <View style={styles.modernPlayerControls}>
                    <TouchableOpacity 
                      style={[styles.modernControlButton, !audioLoaded && styles.disabledButton]}
                      onPress={seekBackward}
                      activeOpacity={0.8}
                      disabled={!audioLoaded}
                    >
                      <View style={styles.controlIconContainer}>
                        <Text style={styles.modernControlIcon}>⏪</Text>
                      </View>
                      <Text style={styles.modernControlLabel}>10s</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.modernMainPlayButton, isPlayingAudio && styles.pauseButton]}
                      onPress={toggleAudio}
                      activeOpacity={0.8}
                      disabled={!audioLoaded && !audioError}
                    >
                      <View style={styles.mainPlayIconContainer}>
                        <Text style={styles.modernMainPlayText}>
                          {!audioLoaded && !audioError ? '⏳' :
                           audioError ? '❌' :
                           isPlayingAudio ? '⏸' : '▶'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.modernControlButton, !audioLoaded && styles.disabledButton]}
                      onPress={seekForward}
                      activeOpacity={0.8}
                      disabled={!audioLoaded}
                    >
                      <View style={styles.controlIconContainer}>
                        <Text style={styles.modernControlIcon}>⏩</Text>
                      </View>
                      <Text style={styles.modernControlLabel}>10s</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {!audioLoaded && !audioError && (
                    <View style={styles.modernLoadingContainer}>
                      <Text style={styles.modernLoadingIcon}>🎧</Text>
                      <Text style={styles.modernLoadingText}>Yükleniyor...</Text>
                    </View>
                  )}
                  
                  {audioError && (
                    <View style={styles.modernErrorContainer}>
                      <Text style={styles.modernErrorIcon}>⚠️</Text>
                      <Text style={styles.modernErrorText}>Ses dosyası yüklenemedi</Text>
                    </View>
                  )}
                </>
              )}
              
              {!mosqueId && (
                <View style={styles.modernErrorContainer}>
                  <Text style={styles.modernErrorIcon}>🔇</Text>
                  <Text style={styles.modernErrorText}>Ses dosyası bulunamadı</Text>
                </View>
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
  audioContainer: {
    marginBottom: 24,
  },
  modernAudioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  audioPlayer: {
    width: 0,
    height: 0,
  },
  modernTrackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 76, 132, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  trackIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(27, 76, 132, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  trackIcon: {
    fontSize: 24,
  },
  trackTextContainer: {
    flex: 1,
  },
  modernTrackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 4,
  },
  modernTrackSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  modernProgressSection: {
    width: '100%',
    marginBottom: 28,
  },
  modernProgressBar: {
    height: 6,
    backgroundColor: 'rgba(27, 76, 132, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  modernProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
    position: 'relative',
  },
  modernProgressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 3,
  },
  modernTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modernTimeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  modernPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 8,
  },
  modernControlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(27, 76, 132, 0.08)',
    minWidth: 64,
  },
  disabledButton: {
    opacity: 0.4,
  },
  controlIconContainer: {
    marginBottom: 4,
  },
  modernControlIcon: {
    fontSize: 20,
    color: '#1B4C84',
  },
  modernControlLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  modernMainPlayButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1B4C84',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B4C84',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ scale: 1 }],
  },
  pauseButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  mainPlayIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernMainPlayText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modernLoadingContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 16,
    marginTop: 8,
  },
  modernLoadingIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  modernLoadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modernErrorContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 16,
    marginTop: 8,
  },
  modernErrorIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  modernErrorText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
    textAlign: 'center',
  },
  });

export default MosqueDetailScreen;


