import React, { useCallback, useLayoutEffect, useState } from 'react';
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

// Dummy Türbe Verisi
// Gerçek implementasyonda bu veriler API'den çekilecek:
// const PAGE_LIST_API = 'https://cuzdan.basaranamortisor.com/api/page-list';
const DUMMY_TOMB_DATA = {
  id: 'laleli-turbe',
  title: 'III. Mustafa Türbesi',
  thumbnail_url: 'https://dijitalistanbul.org/wp-content/uploads/2024/08/turbe.png',
  location: 'Fatih, İstanbul',
  buildYear: '1774',
  patron: 'III. Mustafa',
  architect: 'Mehmed Tahir Ağa',
  people: [
    {
      name: 'III. Mustafa',
      birth_death: '1717 - 1774',
      title: '26. Osmanlı Padişahı',
      about: 'Sultan III. Mustafa, Sultan III. Ahmed\'in oğludur. Uzun yıllar kafeste yaşadıktan sonra 1757\'de tahta çıkmıştır. Sadrazam Koca Ragıp Paşa ile iş birliği içinde reform girişimlerinde bulunmuş, özellikle mali alanda tasarruf politikaları ve yolsuzlukla mücadeleye girişmiştir. Orduyu güçlendirmek için Baron de Tott\'a sürat topçuları birliği kurdurmuş, yeni bir donanma ve askeri okul inşasına öncülük etmiştir. Saltanatının son dönemine 1768–1774 Osmanlı-Rus Savaşı damga vurmuş, bu savaş sürerken vefat etmiştir. Kendi yaptırdığı Laleli Külliyesi\'ndeki türbeye defnedilmiştir.'
    },
    {
      name: 'III. Selim',
      birth_death: '1761 - 1808',
      title: '28. Osmanlı Padişahı',
      about: 'III. Mustafa\'nın oğlu olan III. Selim, tahta çıktıktan sonra Batı\'yı yakından izleyerek Nizâm-ı Cedîd adlı kapsamlı askerî ve idarî reform programını başlattı; Avrupa tarzı talimli yeni birlikler kurdu, uluslararası elçilikleri daimi temsilciliklere dönüştürdü, Mühendishâne-i Berrî-i Hümâyun\'u açarak modern subay yetiştirdi. Mali yapıyı güçlendirmek için \'îrâd-ı cedîd\' hazinesini tesis etti; iç ve dış borçları denetlemeye çalıştı. Fransız Devrimi sonrasında Akka savunmasıyla Napolyon\'u durdurdu, Avusturya ve Rusya ile iki cepheli savaşları Yaş Antlaşması (1792) ve 1807 ateşkesi ile sonlandırdı. Yenilikleri yeniçeri ve ulemâ muhalefetiyle karşılaşınca Kabakçı Mustafa İsyanı patlak verdi; 29 Mayıs 1807\'de tahttan indirildi, Alemdar Mustafa Paşa\'nın girişimine rağmen saray darbesi sırasında öldürülerek babası III. Mustafa\'nın türbesine gömüldü. III. Selim, klasik mûsikiye kazandırdığı besteler, diplomasi ağı ve Nizâm-ı Cedîd\'le Osmanlı modernleşmesinin öncüsü olarak anılır.'
    }
  ],
  features: [
    'Türbe, Laleli Külliyesi\'nin güneybatısında, cami ile han yapısı arasında yer alır.',
    'Mermer kaplı, ongen planlı ve tek kubbelidir. Barok etkili Osmanlı mimarisi; Batı etkilerinin görüldüğü ikinci sultan türbesidir (ilki Nuruosmaniye Türbesi).',
    'Girişte üç gözlü revak bulunur. Giriş kapısında ve avlu girişinde Mehmet Vasfi Efendi\'nin yazdığı Fecr, Ankebut ve Haşr sûrelerinden ayetler celi-sülüs hatla yer alır. İç mekânda XVI. yüzyıldan kalma, mercan kırmızısı, mavi ve beyaz İznik çinileri pencere aralarına yerleştirilmiştir. Zümer, Saffat ve Zümer sûrelerinden ayetler çini kuşak halinde duvarları dolanmaktadır.',
    'Güney cephede üç adet basık kemerli pencere bulunur; pencere köşelikleri mermer kabartma çiçek ve yaprak motifleriyle bezelidir.',
    'Türbede Sultan III. Mustafa ve oğlu Sultan III. Selim\'in sandukaları sedef kakmalı ahşap korkuluklarla çevrilidir.'
  ]
};

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

function MultipleTombDetailScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  
  // Dummy data'yı kullan
  const [tombInfo] = useState(DUMMY_TOMB_DATA);
  const [imageUrl] = useState<string | undefined>(DUMMY_TOMB_DATA.thumbnail_url);
  const [tombTitle] = useState<string>(DUMMY_TOMB_DATA.title);
  const [isLoading] = useState(false);
  const [errorMessage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<'info' | 'audio' | 'location'>('info');

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

  // Dummy data kullanıldığı için API çağrısı yok
  // Gerçek implementasyonda burası API'den veri çekecek

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
            <Text style={styles.titleNew}>{tombTitle}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>{tombTitle}</Text>
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
            {/* Türbedeki Kişiler - Accordion */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Türbedeki Kişiler</Text>
              
              {tombInfo.people.map((person, index) => (
                <AccordionItem key={index} title={person.name} isInitiallyOpen={false}>
                  <KeyValueItem 
                    label="Doğumu/Ölümü:"
                    value={person.birth_death}
                  />
                  <KeyValueItem 
                    label="Ünvanı:"
                    value={person.title}
                  />
                  <KeyValueItem 
                    label="Hakkında:"
                    value={person.about}
                  />
                </AccordionItem>
              ))}
            </View>

            {/* Türbe Hakkında */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Türbe Hakkında</Text>
              
              <View style={styles.tombInfoCards}>
                {/* Konumu */}
                <View style={styles.infoCardFull}>
                  <Text style={styles.infoCardLabel}>Konumu</Text>
                  <Text style={styles.infoCardValue}>{tombInfo.location}</Text>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoCardLabel}>Yapım Yılı</Text>
                    <Text style={styles.infoCardValue}>{tombInfo.buildYear}</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Text style={styles.infoCardLabel}>Kim Yaptırdı</Text>
                    <Text style={styles.infoCardValue}>{tombInfo.patron}</Text>
                  </View>
                </View>

                <View style={styles.infoCardFull}>
                  <Text style={styles.infoCardLabel}>Mimarı</Text>
                  <Text style={styles.infoCardValue}>{tombInfo.architect}</Text>
                </View>

                <KeyValueItem 
                  label="Öne Çıkan Özellikleri:"
                  value={tombInfo.features}
                />
              </View>
            </View>
          </View>
        ) : selectedOption === 'audio' ? (
          <View style={styles.infoBlock}>
            <Text style={styles.placeholderText}>Ses rehberi yakında eklenecek</Text>
          </View>
        ) : selectedOption === 'location' ? (
          <View style={styles.infoBlock}>
            <Text style={styles.placeholderText}>Harita özellikleri yakında eklenecek</Text>
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

