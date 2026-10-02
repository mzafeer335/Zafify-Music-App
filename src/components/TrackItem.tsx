import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusic, Track } from '../context/MusicContext';

interface TrackItemProps {
  track: Track;
  onSelectTrack: () => void;
}

export default function TrackItem({ track, onSelectTrack }: TrackItemProps) {
  const {
    currentTrack,
    isPlaying,
    likedTracks,
    toggleLike,
    downloadedTracks,
    downloadTrack,
    removeDownload,
    isDownloadingId,
  } = useMusic();

  const isCurrent = currentTrack?.id === track.id;
  const isLiked = likedTracks.some((t) => t.id === track.id);
  const isDownloaded = downloadedTracks.some((t) => t.id === track.id);
  const isDownloading = isDownloadingId === track.id;

  const handleDownloadPress = () => {
    if (isDownloaded) {
      removeDownload(track.id);
    } else {
      downloadTrack(track);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onSelectTrack} activeOpacity={0.7}>
      <Image source={{ uri: track.album_image }} style={styles.albumArt} />

      <View style={styles.trackDetails}>
        <Text
          style={[styles.trackName, isCurrent && styles.trackNameActive]}
          numberOfLines={1}
        >
          {track.name}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {track.artist_name}
        </Text>
      </View>

      {/* Action Buttons: Download + Like */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={handleDownloadPress}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          style={styles.actionBtn}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#1DB954" />
          ) : (
            <Ionicons
              name={isDownloaded ? 'checkmark-circle' : 'arrow-down-circle-outline'}
              size={20}
              color={isDownloaded ? '#1DB954' : '#68686C'}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleLike(track)}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          style={styles.actionBtn}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? '#1DB954' : '#68686C'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#1E1E22',
  },
  trackDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  trackName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  trackNameActive: {
    color: '#1DB954',
  },
  artistName: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    padding: 4,
  },
});