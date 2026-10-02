import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusic, Track } from '../context/MusicContext';
import TrackItem from '../components/TrackItem';
import MiniPlayer from '../components/MiniPlayer';
import FullPlayerModal from '../components/FullPlayerModal';

export interface GenreCategory {
  id: string;
  label: string;
  query: string;
}

const SPOTIFY_GENRES: GenreCategory[] = [
  { id: 'trending_global', label: '🔥 Top 50 Global', query: 'Trending Global' },
  { id: 'viral_hindi', label: '⚡ Trending Bollywood', query: 'Bollywood Hits' },
  { id: 'trending_punjabi', label: '🌾 Punjabi Hot 20', query: 'Punjabi Top Hits' },
  { id: 'hindi_romantic', label: '💖 Hindi Romantic', query: 'Hindi Romantic Love' },
  { id: 'bhangra_groove', label: '🥁 Bhangra & Dhol', query: 'Bhangra' },
  { id: 'urdu_poetry', label: '📜 Urdu Ghazal', query: 'Urdu Ghazal' },
  { id: 'sufi_mystic', label: '✨ Sufi & Qawwali', query: 'Sufi' },
  { id: 'lofi_chill', label: '🌙 Midnight Lo-Fi', query: 'Lo-Fi Chill Beats' },
  { id: 'desi_hiphop', label: '🎤 Desi Hip-Hop', query: 'Desi Hip Hop' },
];

const AUDIUS_NODES = [
  'https://discoveryprovider.audius.co',
  'https://discoveryprovider2.audius.co',
  'https://audius-discovery-1.cultur3stake.com',
  'https://audius-discovery-2.cultur3stake.com',
  'https://discoveryprovider.mikitcreator.com',
  'https://dn1.monophonic.digital',
  'https://audius-dp.kamino.finance',
];

const getFastestAudiusNode = async (): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://api.audius.co', { signal: controller.signal });
    clearTimeout(timeout);
    const json = await res.json();
    if (json?.data?.length > 0) return json.data[Math.floor(Math.random() * json.data.length)];
  } catch {}
  return AUDIUS_NODES[Math.floor(Math.random() * AUDIUS_NODES.length)];
};

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'home' | 'library'>('home');
  const [libraryFilter, setLibraryFilter] = useState<'liked' | 'downloaded'>('liked');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GenreCategory>(SPOTIFY_GENRES[0]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { playTrack, likedTracks, downloadedTracks, currentTrack } = useMusic();

  const fetchMusic = async (term: string) => {
    setLoading(true);
    let resolvedList: Track[] = [];
    const attempts = [await getFastestAudiusNode(), ...AUDIUS_NODES.slice(0, 3)];

    for (const node of attempts) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4500);

        const url =
          term === 'Trending Global'
            ? `${node}/v1/tracks/trending?app_name=ZafifyApp&limit=40`
            : `${node}/v1/tracks/search?query=${encodeURIComponent(term)}&app_name=ZafifyApp&limit=40`;

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) continue;

        const json = await res.json();
        const items = json?.data || [];

        if (Array.isArray(items) && items.length > 0) {
          resolvedList = items
            .filter((t: any) => t.id && t.title)
            .map((item: any) => ({
              id: String(item.id),
              name: item.title,
              artist_name: item.user?.name || 'Artist',
              album_image:
                item.artwork?.['480x480'] ||
                item.artwork?.['150x150'] ||
                'https://picsum.photos/400/400',
              audio: `${node}/v1/tracks/${item.id}/stream?app_name=ZafifyApp`,
              duration: item.duration || 180,
            }));

          if (resolvedList.length > 0) break;
        }
      } catch {}
    }

    if (resolvedList.length > 0) setTracks(resolvedList);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (activeTab === 'home') {
      fetchMusic(selectedCategory.query);
    }
  }, [selectedCategory, activeTab]);

  const displayedList =
    activeTab === 'library'
      ? libraryFilter === 'liked'
        ? likedTracks
        : downloadedTracks
      : tracks;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandTitle}>
            {activeTab === 'home' ? 'Zafify' : 'Your Library'}
          </Text>
          <Text style={styles.tagline}>
            {activeTab === 'home'
              ? 'SPOTIFY EXPERIENCE • AD-FREE'
              : libraryFilter === 'liked'
              ? `${likedTracks.length} FAVORITE TRACKS`
              : `${downloadedTracks.length} DOWNLOADED OFFLINE`}
          </Text>
        </View>
        <View style={styles.profileBadge}>
          <Text style={styles.profileBadgeText}>Z</Text>
        </View>
      </View>

      {/* Library Filter Pills */}
      {activeTab === 'library' && (
        <View style={styles.libraryFilterContainer}>
          <TouchableOpacity
            style={[
              styles.libraryTab,
              libraryFilter === 'liked' && styles.libraryTabActive,
            ]}
            onPress={() => setLibraryFilter('liked')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={libraryFilter === 'liked' ? 'heart' : 'heart-outline'}
              size={18}
              color={libraryFilter === 'liked' ? '#000' : '#FFF'}
            />
            <Text
              style={[
                styles.libraryTabText,
                libraryFilter === 'liked' && styles.libraryTabTextActive,
              ]}
            >
              Liked Songs ({likedTracks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.libraryTab,
              libraryFilter === 'downloaded' && styles.libraryTabActive,
            ]}
            onPress={() => setLibraryFilter('downloaded')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={libraryFilter === 'downloaded' ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
              size={18}
              color={libraryFilter === 'downloaded' ? '#000' : '#FFF'}
            />
            <Text
              style={[
                styles.libraryTabText,
                libraryFilter === 'downloaded' && styles.libraryTabTextActive,
              ]}
            >
              Downloaded ({downloadedTracks.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Home Feed: Search & Categories */}
      {activeTab === 'home' && (
        <>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Hindi, Punjabi, Artists, Vibes..."
              placeholderTextColor="#636366"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => searchQuery.trim() && fetchMusic(searchQuery)}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  fetchMusic(selectedCategory.query);
                }}
              >
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.categoriesWrapper}>
            <FlatList
              horizontal
              data={SPOTIFY_GENRES}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => {
                const isActive = selectedCategory.id === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => {
                      setSelectedCategory(item);
                      setSearchQuery('');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </>
      )}

      {/* Track List Feed */}
      {loading && activeTab === 'home' ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color="#1DB954" size="large" />
          <Text style={styles.loaderText}>Connecting to {selectedCategory.label}...</Text>
        </View>
      ) : displayedList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={
              activeTab === 'library'
                ? libraryFilter === 'liked'
                  ? 'heart-dislike-outline'
                  : 'cloud-offline-outline'
                : 'musical-notes-outline'
            }
            size={56}
            color="#333"
          />
          <Text style={styles.emptyText}>
            {activeTab === 'library'
              ? libraryFilter === 'liked'
                ? 'No liked songs yet. Tap the heart on any song to save it here!'
                : 'No downloaded songs. Tap the download icon next to any song to listen completely offline!'
              : `No tracks found for "${searchQuery || selectedCategory.label}".`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TrackItem track={item} onSelectTrack={() => playTrack(item, displayedList)} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: currentTrack ? 145 : 85 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            activeTab === 'home' ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchMusic(searchQuery || selectedCategory.query)}
                tintColor="#1DB954"
                colors={['#1DB954']}
              />
            ) : undefined
          }
          ListHeaderComponent={
            <Text style={styles.sectionHeader}>
              {activeTab === 'library'
                ? libraryFilter === 'liked'
                  ? 'Favorite Songs'
                  : 'Offline Downloads'
                : searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory.label}{' '}
              ({displayedList.length})
            </Text>
          }
        />
      )}

      {/* Mini Player */}
      <MiniPlayer />

      {/* Polished Spotify Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={26}
            color={activeTab === 'home' ? '#FFF' : '#8E8E93'}
          />
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('library')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'library' ? 'library' : 'library-outline'}
            size={26}
            color={activeTab === 'library' ? '#FFF' : '#8E8E93'}
          />
          <Text style={[styles.navText, activeTab === 'library' && styles.navTextActive]}>
            Your Library
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Modal */}
      <FullPlayerModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1DB954',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  profileBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBadgeText: {
    color: '#1DB954',
    fontWeight: '800',
    fontSize: 16,
  },
  libraryFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  libraryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2C2C30',
  },
  libraryTabActive: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  libraryTabText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  libraryTabTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    marginLeft: 10,
  },
  categoriesWrapper: {
    marginBottom: 6,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  chip: {
    backgroundColor: '#1E1E22',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2C2C30',
  },
  chipActive: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  chipText: {
    color: '#A0A0A5',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    paddingHorizontal: 16,
    marginVertical: 12,
    letterSpacing: -0.2,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 140,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#121214',
    borderTopWidth: 1,
    borderTopColor: '#202024',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'android' ? 6 : 14,
    zIndex: 99,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  navText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  navTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
});