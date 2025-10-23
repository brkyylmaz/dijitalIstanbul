import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const imageSize = Math.max(width, height);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/splash.png')}
        style={[
          styles.image,
          {
            width: imageSize,
            height: imageSize,
          },
        ]}
        resizeMode="cover"
      />
      <ActivityIndicator size="large" color="#000" style={styles.activityIndicator}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  activityIndicator: {
    position: "absolute",
    bottom: width * 0.25,
  }
});

export default SplashScreen;
