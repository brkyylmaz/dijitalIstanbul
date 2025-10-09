import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';

type ItemBoxProps = {
  title: string;
  thumbnailUrl: string;
  year?: string;
  location?: string;
  onPress?: () => void;
};

function ItemBoxComponent({ title, thumbnailUrl, year = '360 - 537', location = 'Fatih, İstanbul', onPress }: ItemBoxProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = React.useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = React.useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#1B4C84" />
          </View>
        )}
        <Image 
          source={{ uri: thumbnailUrl }} 
          style={[styles.thumbnail, imageLoading && styles.hiddenImage]}
          resizeMode="cover"
          fadeDuration={200}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadStart={() => setImageLoading(true)}
        />
        {imageError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>📷</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Yapım</Text>
            <Text style={styles.infoValue}>{year}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Konum</Text>
            <Text style={styles.infoValue}>{location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const ItemBox = React.memo(ItemBoxComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1B1B1B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#E2E6EB',
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  hiddenImage: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  errorText: {
    fontSize: 24,
    opacity: 0.5,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C8B9E',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2933',
  },
});

export default ItemBox;

