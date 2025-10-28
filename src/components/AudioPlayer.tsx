import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import { t, isRtl } from '../modules/i18n';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  imageUrl?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  title = t('audio_player.default_title'),
  imageUrl
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const videoRef = useRef<any>(null);
  const isRTL = isRtl();
  
  // Sound wave animation
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const wave4 = useRef(new Animated.Value(0)).current;
  const wave5 = useRef(new Animated.Value(0)).current;
  const wave6 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlayingAudio) {
      const createAnimation = (wave: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(wave, {
              toValue: 1,
              duration: 400,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(wave, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animations = Animated.parallel([
        createAnimation(wave1, 0),
        createAnimation(wave2, 100),
        createAnimation(wave3, 200),
        createAnimation(wave4, 300),
        createAnimation(wave5, 200),
        createAnimation(wave6, 100),
      ]);

      animations.start();

      return () => {
        animations.stop();
      };
    }
  }, [isPlayingAudio, wave1, wave2, wave3, wave4, wave5, wave6]);

  const toggleAudio = () => {
    if (audioError) {
      Alert.alert(t('audio_player.error_title'), t('audio_player.error_message'));
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
    setAudioError(t('audio_player.error_load_failed'));
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

  return (
    <View style={styles.audioContainer}>
      {/* Modern Glassmorphism Audio Player */}
      <View style={styles.modernAudioCard}>
        <Video
          ref={videoRef}
          source={{ uri: audioUrl }}
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
        <View style={[styles.modernTrackInfo, isRTL && styles.modernTrackInfoRTL]}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }}
              style={[styles.trackImage, isRTL && styles.trackImageRTL]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.trackIconContainer, isRTL && styles.trackIconContainerRTL]}>
              <Text style={styles.trackIcon}>🎵</Text>
            </View>
          )}
          <View style={styles.trackTextContainer}>
            <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
              <Text style={[styles.modernTrackTitle, isRTL && styles.modernTrackTitleRTL]} numberOfLines={1}>
                {title}
              </Text>
              {isPlayingAudio && (
                <View style={[styles.waveContainer, isRTL && styles.waveContainerRTL]}>
              <Animated.View style={[styles.waveDot, { 
                transform: [{ 
                  scaleY: wave1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1.2]
                  })
                }] 
              }]} />
              <Animated.View style={[styles.waveDot, { 
                transform: [{ 
                  scaleY: wave2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1.4]
                  })
                }] 
              }]} />
              <Animated.View style={[styles.waveDot, styles.waveDotTall, { 
                transform: [{ 
                  scaleY: wave3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1.8]
                  })
                }] 
              }]} />
              <Animated.View style={[styles.waveDot, styles.waveDotTallest, { 
                transform: [{ 
                  scaleY: wave4.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 2]
                  })
                }] 
              }]} />
              <Animated.View style={[styles.waveDot, styles.waveDotTall, { 
                transform: [{ 
                  scaleY: wave5.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1.5]
                  })
                }] 
              }]} />
              <Animated.View style={[styles.waveDot, { 
                transform: [{ 
                  scaleY: wave6.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1]
                  })
                }] 
              }]} />
                </View>
              )}
            </View>
            {audioLoaded && (
              <Text style={[styles.trackDuration, isRTL && styles.trackDurationRTL]}>{formatTime(audioDuration)} dk</Text>
            )}
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
            <Image 
              source={require('../assets/images/back.png')}
              style={styles.controlButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modernMainPlayButton, isPlayingAudio && styles.pauseButton]}
            onPress={toggleAudio}
            activeOpacity={0.8}
            disabled={!audioLoaded && !audioError}
          >
            {!audioLoaded && !audioError ? (
              <Text style={styles.modernMainPlayText}>⏳</Text>
            ) : audioError ? (
              <Text style={styles.modernMainPlayText}>❌</Text>
            ) : isPlayingAudio ? (
              <View style={styles.pauseIcon}>
                <View style={styles.pauseLine} />
                <View style={styles.pauseLine} />
              </View>
            ) : (
              <Image 
                source={require('../assets/images/play.png')}
                style={styles.playButtonImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modernControlButton, !audioLoaded && styles.disabledButton]}
            onPress={seekForward}
            activeOpacity={0.8}
            disabled={!audioLoaded}
          >
            <Image 
              source={require('../assets/images/front.png')}
              style={styles.controlButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  audioContainer: {
    marginBottom: 24,
  },
  modernAudioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingVertical: 18,
    height: 230,
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
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: '100%',
  },
  modernTrackInfoRTL: {
    flexDirection: 'row-reverse',
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 12,
  },
  trackImageRTL: {
    marginRight: 0,
    marginLeft: 12,
  },
  trackIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: 'rgba(27, 76, 132, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trackIconContainerRTL: {
    marginRight: 0,
    marginLeft: 12,
  },
  trackIcon: {
    fontSize: 24,
  },
  trackTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRowRTL: {
    flexDirection: 'row-reverse',
  },
  modernTrackTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1F2933',
    flex: 1,
  },
  modernTrackTitleRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  trackDuration: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  trackDurationRTL: {
    textAlign: 'right',
  },
  modernTrackSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  modernProgressSection: {
    width: '100%',
    marginTop: 30,
    marginBottom: 10,
  },
  modernProgressBar: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 0.25,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  modernProgressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 0.25,
    position: 'relative',
  },
  modernProgressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 0.25,
  },
  modernTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modernTimeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  modernPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  modernControlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  disabledButton: {
    opacity: 0.4,
  },
  controlButtonImage: {
    width: 28,
    height: 28,
  },
  modernMainPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDEFF2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pauseButton: {
    backgroundColor: '#EDEFF2',
    shadowColor: '#000000',
  },
  playButtonImage: {
    width: 36,
    height: 36,
  },
  pauseIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pauseLine: {
    width: 5,
    height: 26,
    backgroundColor: '#000000',
    borderRadius: 2.5,
  },
  modernMainPlayText: {
    fontSize: 32,
    color: '#1F2933',
    fontWeight: '600',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    marginLeft: 6,
  },
  waveContainerRTL: {
    marginLeft: 0,
    marginRight: 6,
  },
  waveDot: {
    width: 2,
    height: 8,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
  waveDotTall: {
    height: 12,
  },
  waveDotTallest: {
    height: 16,
  },
});

export default AudioPlayer;
