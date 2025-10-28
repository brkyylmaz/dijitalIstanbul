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
import { resolveQr } from '../store+client/resolve-qr';
import { store } from '../store+client/store';
import { t } from '../modules/i18n';

function QRScannerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFocused, setIsFocused] = useState(true);
  const [hasError, setHasError] = useState(false);
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
      setIsFocused(true);
      setIsProcessing(false);
      setHasError(false);
      
      return () => {
        // Cleanup: ekrandan çıkarken kamerayı kapat
        setIsFocused(false);
      };
    }, [])
  );

  const handleBarCodeScanned = async (code: string) => {
    if (isProcessing || hasError) {
      return;
    }

    setIsProcessing(true);

    try {
      const trid = await resolveQr(code);
      const pageIdx = store.pageList.findIndex(x => x.trid == trid);

      switch (store.pageList[pageIdx].page_type) {
        case "mosque":
        case "mausoleum-single":
          navigation.navigate('MosqueDetail', { postID: store.pageList[pageIdx].id });
          break;
        case "mausoleum-multi":
          navigation.navigate('MultipleTombDetail', { postID: store.pageList[pageIdx].id });
          break;
      }

    } catch (error) {
      setHasError(true);
      Alert.alert(
        t('qr_scanner.scan_error_title'),
        error instanceof Error ? error.message : t('qr_scanner.unexpected_error'),
        [
          {
            text: 'OK',
            onPress: () => {
              setHasError(false);
              setIsProcessing(false);
            }
          }
        ]
      );
      return;
    }
    
    setIsProcessing(false);
  }

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value && !isProcessing && !hasError) {
        handleBarCodeScanned(codes[0].value);
      }
    },
  });

  if (hasPermission === null) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1B4C84" />
        <Text style={styles.infoText}>{t('qr_scanner.checking_permission')}</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.infoText}>
          {t('qr_scanner.permission_denied')}
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => {
            Linking.openSettings().catch(() => {
              Alert.alert(t('qr_scanner.settings_not_opened'), t('qr_scanner.grant_camera_access'));
            });
          }}
        >
          <Text style={styles.permissionButtonText}>{t('qr_scanner.open_settings')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1B4C84" />
        <Text style={styles.infoText}>{t('qr_scanner.camera_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && !isProcessing && !hasError}
        codeScanner={codeScanner}
      />
      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <Text style={styles.helperText}>{t('qr_scanner.scan_qr_instruction')}</Text>
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
            {t('qr_scanner.redirect_message')}
          </Text>
        </View>
      </View>
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.processingText}>{t('qr_scanner.processing')}</Text>
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
