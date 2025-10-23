import React, { useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import { t } from '../modules/i18n';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  subtitle?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  title = t('audio_player.default_title'),
  subtitle = t('app.subtitle')
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const videoRef = useRef<any>(null);

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
        <View style={styles.modernTrackInfo}>
          <View style={styles.trackIconContainer}>
            <Text style={styles.trackIcon}>🎵</Text>
          </View>
          <View style={styles.trackTextContainer}>
            <Text style={styles.modernTrackTitle} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.modernTrackSubtitle} numberOfLines={1}>
              {subtitle}
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
            <Text style={styles.modernLoadingText}>{t('audio_player.loading')}</Text>
          </View>
        )}
        
        {audioError && (
          <View style={styles.modernErrorContainer}>
            <Text style={styles.modernErrorIcon}>⚠️</Text>
            <Text style={styles.modernErrorText}>{t('audio_player.error_load_failed')}</Text>
          </View>
        )}
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

export default AudioPlayer;
