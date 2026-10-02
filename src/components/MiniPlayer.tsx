import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../context/MusicContext';

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    togglePlayPause,
    setPlayerModalVisible,
    likedTracks,
    toggleLike,
  } = useMusic();

  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(0.4);
    }
  }, [isPlaying]);

  if (!currentTrack) return null;

  const isLiked = likedTracks.some((t) => t.id === currentTrack.id);
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.pill}
        onPress={() => setPlayerModalVisible(true)}
      >
        <Image source={{ uri: currentTrack.album_image }} style={styles.thumb} />
        
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            {isPlaying && (
              <Animated.View style={[styles.playingDot, { opacity: pulseAnim }]} />
            )}
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.name}
            </Text>
          </View>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist_name}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => toggleLike(currentTrack)}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            style={styles.actionBtn}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? '#1DB954' : '#8E8E93'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            style={styles.actionBtn}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={26}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Spotify Bottom Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 72, // Clears the bottom navigation bar without overlapping
    left: 8,
    right: 8,
    backgroundColor: '#242424',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 90,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#1C1C1E',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1DB954',
    marginRight: 6,
  },
  title: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  artist: {
    color: '#B3B3B3',
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  progressTrack: {
    height: 2,
    backgroundColor: '#383838',
    width: '100%',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#1DB954',
  },
});