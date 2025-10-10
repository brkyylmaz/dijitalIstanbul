import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { RootStackParamList } from '../navigation/AppNavigator';

function QRScannerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const device = useCameraDevice('back');

  useEffect(() => {
    const checkPermission = async () => {
      const status = await Camera.getCameraPermissionStatus();
      
      if (status === 'granted') {
        setHasPermission(true);
        return;
      }

      if (status === 'not-determined') {
        const newStatus = await Camera.requestCameraPermission();
        setHasPermission(newStatus === 'granted');
        return;
      }

      setHasPermission(false);
    };

    checkPermission();
  }, []);

  // Ekran her focus olduğunda state'i sıfırla
  useFocusEffect(
    React.useCallback(() => {
      setIsProcessing(false);
      
      return () => {
        // Cleanup: ekrandan çıkarken
      };
    }, [])
  );


  const handleBarCodeScanned = async (code: string) => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const sourceUrl = code.trim();
      const encodedUrl = encodeURIComponent(sourceUrl);
      
      // 1. ADIM: Önce resolve-qr'den ID'yi al (düz metin olarak geliyor)
      const resolveResponse = await fetch(
        `https://cuzdan.basaranamortisor.com/api/resolve-qr?url=${encodedUrl}`,
      );

      if (!resolveResponse.ok) {
        throw new Error('QR kodu çözümlenemedi');
      }

      const mosqueId = await resolveResponse.text(); // ID düz metin olarak geliyor
      
      if (!mosqueId || mosqueId.trim() === '') {
        throw new Error('Geçersiz QR kodu');
      }

      // 2. ADIM: Bu ID ile page-data'dan detaylı veriyi al
      const dataResponse = await fetch(
        `https://cuzdan.basaranamortisor.com/api/page-data?id=${mosqueId.trim()}`,
      );

      if (!dataResponse.ok) {
        throw new Error('Cami detayları bulunamadı');
      }

      const mosqueData = await dataResponse.json();

      navigation.navigate('MosqueDetail', {
        mosqueId: mosqueId.trim(),
        sourceUrl,
        mosqueData,
      });
    } catch (error) {
      Alert.alert(
        'Tarama Hatası',
        error instanceof Error ? error.message : 'Beklenmeyen hata',
      );
      setTimeout(() => setIsProcessing(false), 2000);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value && !isProcessing) {
        handleBarCodeScanned(codes[0].value);
      }
    },
  });

  if (hasPermission === null) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1B4C84" />
        <Text style={styles.infoText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.infoText}>
          Camera permission not granted. You need to grant camera access in settings to scan QR codes.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => {
            Linking.openSettings().catch(() => {
              Alert.alert('Settings not opened', 'Please grant camera access in settings to scan QR codes.');
            });
          }}
        >
          <Text style={styles.permissionButtonText}>Ayarları Aç</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1B4C84" />
        <Text style={styles.infoText}>Kamera yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!isProcessing}
        codeScanner={codeScanner}
      />
      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <Text style={styles.helperText}>Lütfen QR kodunu taratın</Text>
        </View>
        <View style={styles.middleContainer}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles.helperText}>
            You will be redirected to the relevant mosque details after scanning.
          </Text>
        </View>
      </View>
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.processingText}>İşleniyor...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  middleContainer: {
    flexDirection: 'row',
    height: 300,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: 300,
    height: 300,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#1B4C84',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  helperText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
    fontWeight: '500',
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  permissionButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1B4C84',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
});

export default QRScannerScreen;
