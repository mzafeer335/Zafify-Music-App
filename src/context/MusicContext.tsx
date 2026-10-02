import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import from legacy submodule as required by modern Expo SDK
import * as FileSystem from 'expo-file-system/legacy';

export interface Track {
  id: string;
  name: string;
  artist_name: string;
  album_image: string;
  audio: string;
  duration: number;
  localUri?: string;
}

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Track[];
  likedTracks: Track[];
  downloadedTracks: Track[];
  isDownloadingId: string | null;
  isShuffle: boolean;
  repeatMode: 'off' | 'track' | 'queue';
  isPlayerModalVisible: boolean;
  setPlayerModalVisible: (visible: boolean) => void;
  playTrack: (track: Track, newQueue?: Track[], autoOpenModal?: boolean) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (millis: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  toggleLike: (track: Track) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  downloadTrack: (track: Track) => Promise<void>;
  removeDownload: (trackId: string) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1);
  const [queue, setQueue] = useState<Track[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'track' | 'queue'>('off');
  const [isPlayerModalVisible, setPlayerModalVisible] = useState<boolean>(false);

  const playerRef = useRef<AudioPlayer | null>(null);
  const statusSubRef = useRef<any>(null);
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: 'doNotMix',
    } as any).catch(console.error);

    AsyncStorage.getItem('@zafify_liked_tracks').then((res) => {
      if (res) setLikedTracks(JSON.parse(res));
    });

    AsyncStorage.getItem('@zafify_downloaded_tracks').then((res) => {
      if (res) setDownloadedTracks(JSON.parse(res));
    });

    return () => {
      if (statusSubRef.current) statusSubRef.current.remove?.();
      if (playerRef.current) {
        try { playerRef.current.pause(); } catch {}
      }
    };
  }, []);

  const playTrack = async (track: Track, newQueue?: Track[], autoOpenModal: boolean = true) => {
    try {
      if (newQueue && newQueue.length > 0) setQueue(newQueue);
      setCurrentTrack(track);

      if (autoOpenModal) setPlayerModalVisible(true);

      if (statusSubRef.current) {
        statusSubRef.current.remove?.();
        statusSubRef.current = null;
      }

      if (playerRef.current) {
        try { playerRef.current.pause(); } catch {}
      }

      // Prioritize local offline URI if available
      const playbackUri = track.localUri || track.audio;
      const player = createAudioPlayer({ uri: playbackUri });
      playerRef.current = player;

      statusSubRef.current = player.addListener('playbackStatusUpdate', (status: any) => {
        setIsPlaying(Boolean(status?.playing));
        if (status?.currentTime !== undefined) setPosition(status.currentTime * 1000);
        if (status?.duration) setDuration(status.duration * 1000);

        if (status?.duration > 0 && status?.currentTime >= status?.duration) {
          if (repeatModeRef.current === 'track') {
            player.seekTo(0);
            player.play();
          } else {
            playNext();
          }
        }
      });

      player.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  const togglePlayPause = async () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = async (millis: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(millis / 1000);
      setPosition(millis);
    }
  };

  const playNext = async () => {
    if (!currentTrack || queue.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      await playTrack(queue[randomIndex], undefined, false);
      return;
    }
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      await playTrack(queue[currentIndex + 1], undefined, false);
    } else if (repeatMode === 'queue') {
      await playTrack(queue[0], undefined, false);
    }
  };

  const playPrevious = async () => {
    if (!currentTrack || queue.length === 0) return;
    if (position > 3000) {
      await seekTo(0);
      return;
    }
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      await playTrack(queue[currentIndex - 1], undefined, false);
    }
  };

  const toggleLike = async (track: Track) => {
    const isLiked = likedTracks.some((t) => t.id === track.id);
    let updated: Track[];
    if (isLiked) {
      updated = likedTracks.filter((t) => t.id !== track.id);
    } else {
      updated = [track, ...likedTracks];
    }
    setLikedTracks(updated);
    await AsyncStorage.setItem('@zafify_liked_tracks', JSON.stringify(updated));
  };

  const downloadTrack = async (track: Track) => {
    try {
      setIsDownloadingId(track.id);
      const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
      const cleanId = track.id.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `zafify_${cleanId}.mp3`;
      const localUri = `${baseDir}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(track.audio, localUri);

      if (downloadResult && downloadResult.status === 200) {
        const savedTrack: Track = { ...track, localUri: downloadResult.uri };
        const updated = [savedTrack, ...downloadedTracks.filter((t) => t.id !== track.id)];
        setDownloadedTracks(updated);
        await AsyncStorage.setItem('@zafify_downloaded_tracks', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setIsDownloadingId(null);
    }
  };

  const removeDownload = async (trackId: string) => {
    try {
      const track = downloadedTracks.find((t) => t.id === trackId);
      if (track?.localUri) {
        await FileSystem.deleteAsync(track.localUri, { idempotent: true });
      }
      const updated = downloadedTracks.filter((t) => t.id !== trackId);
      setDownloadedTracks(updated);
      await AsyncStorage.setItem('@zafify_downloaded_tracks', JSON.stringify(updated));
    } catch (e) {
      console.error('Remove download failed:', e);
    }
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'queue';
      if (prev === 'queue') return 'track';
      return 'off';
    });
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        position,
        duration,
        queue,
        likedTracks,
        downloadedTracks,
        isDownloadingId,
        isShuffle,
        repeatMode,
        isPlayerModalVisible,
        setPlayerModalVisible,
        playTrack,
        togglePlayPause,
        seekTo,
        playNext,
        playPrevious,
        toggleLike,
        toggleShuffle,
        toggleRepeat,
        downloadTrack,
        removeDownload,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
};