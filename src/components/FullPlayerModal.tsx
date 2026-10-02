import React, { useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useMusic } from '../context/MusicContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const formatTime = (millis: number) => {
  const totalSeconds = Math.max(0, Math.floor(millis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function FullPlayerModal() {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    isShuffle,
    repeatMode,
    isPlayerModalVisible,
    setPlayerModalVisible,
    togglePlayPause,
    seekTo,
    playNext,
    playPrevious,
    toggleShuffle,
    toggleRepeat,
    likedTracks,
    toggleLike,
    downloadedTracks,
    downloadTrack,
    removeDownload,
    isDownloadingId,
  } = useMusic();

  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) panY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > SCREEN_HEIGHT * 0.25 || gesture.vy > 0.8) {
          Animated.timing(panY, {
            toValue: SCREEN_HEIGHT,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            setPlayerModalVisible(false);
            panY.setValue(0);
          });
        } else {
          Animated.spring(panY, {
            toValue: 0,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!currentTrack) return null;

  const isLiked = likedTracks.some((t) => t.id === currentTrack.id);
  const isDownloaded = downloadedTracks.some((t) => t.id === currentTrack.id);
  const isDownloading = isDownloadingId === currentTrack.id;

  const handleDownloadToggle = () => {
    if (isDownloaded) {
      removeDownload(currentTrack.id);
    } else {
      downloadTrack(currentTrack);
    }
  };

  return (
    <Modal
      visible={isPlayerModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setPlayerModalVisible(false)}
    >
      <View style={styles.modalBackground}>
        <StatusBar barStyle="light-content" backgroundColor="#121214" />

        <Animated.View
          style={[styles.container, { transform: [{ translateY: panY }] }]}
        >
          {/* Swipe handle & Header */}
          <View {...panResponder.panHandlers} style={styles.dragArea}>
            <View style={styles.dragBar} />
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => setPlayerModalVisible(false)}
                style={styles.collapseBtn}
              >
                <Ionicons name="chevron-down" size={28} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Text style={styles.headerSubtitle}>PLAYING FROM SEARCH</Text>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {currentTrack.artist_name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleLike(currentTrack)}
                style={styles.collapseBtn}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isLiked ? '#1DB954' : '#FFF'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Large Album Artwork */}
          <View style={styles.artworkContainer}>
            <Image
              source={{ uri: currentTrack.album_image }}
              style={styles.artwork}
            />
          </View>

          {/* Track Meta, Like & Download */}
          <View style={styles.metaRow}>
            <View style={styles.titleWrapper}>
              <Text style={styles.title} numberOfLines={1}>
                {currentTrack.name}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {currentTrack.artist_name}
              </Text>
            </View>
            <View style={styles.actionButtonsRow}>
              {/* Offline Download Button */}
              <TouchableOpacity
                onPress={handleDownloadToggle}
                activeOpacity={0.7}
                style={styles.actionIcon}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#1DB954" />
                ) : (
                  <Ionicons
                    name={isDownloaded ? 'checkmark-circle' : 'arrow-down-circle-outline'}
                    size={28}
                    color={isDownloaded ? '#1DB954' : '#B3B3B3'}
                  />
                )}
              </TouchableOpacity>

              {/* Like Button */}
              <TouchableOpacity
                onPress={() => toggleLike(currentTrack)}
                activeOpacity={0.7}
                style={styles.actionIcon}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={28}
                  color={isLiked ? '#1DB954' : '#B3B3B3'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrubber Progress Bar */}
          <View style={styles.scrubberContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration > 0 ? duration : 1}
              value={position}
              onSlidingComplete={seekTo}
              minimumTrackTintColor="#1DB954"
              maximumTrackTintColor="#3E3E42"
              thumbTintColor="#FFF"
            />
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls Row: Shuffle | Prev | Play/Pause | Next | Repeat */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={toggleShuffle} activeOpacity={0.7}>
              <Ionicons
                name="shuffle"
                size={24}
                color={isShuffle ? '#1DB954' : '#B3B3B3'}
              />
              {isShuffle && <View style={styles.activeDot} />}
            </TouchableOpacity>

            <TouchableOpacity onPress={playPrevious} activeOpacity={0.7}>
              <Ionicons name="play-skip-back" size={32} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.playPauseBtn}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={34}
                color="#000"
                style={{ marginLeft: isPlaying ? 0 : 3 }}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={playNext} activeOpacity={0.7}>
              <Ionicons name="play-skip-forward" size={32} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleRepeat} activeOpacity={0.7}>
              <Ionicons
                name="repeat"
                size={24}
                color={repeatMode !== 'off' ? '#1DB954' : '#B3B3B3'}
              />
              {repeatMode === 'track' && (
                <View style={styles.repeatBadge}>
                  <Text style={styles.repeatBadgeText}>1</Text>
                </View>
              )}
              {repeatMode === 'queue' && <View style={styles.activeDot} />}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: '#121214',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 40,
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  dragArea: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  dragBar: {
    width: 38,
    height: 4,
    backgroundColor: '#383838',
    borderRadius: 2,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  collapseBtn: {
    padding: 6,
  },
  headerCenter: {
    alignItems: 'center',
    maxWidth: '70%',
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  artworkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  artwork: {
    width: Dimensions.get('window').width - 64,
    height: Dimensions.get('window').width - 64,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  artist: {
    color: '#B3B3B3',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    padding: 4,
  },
  scrubberContainer: {
    width: '100%',
    marginVertical: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  playPauseBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1DB954',
    alignSelf: 'center',
    marginTop: 3,
  },
  repeatBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#1DB954',
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatBadgeText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
  },
});