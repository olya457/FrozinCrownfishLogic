import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

const BG = require('../assets/background3.png');
const BACK_ICON = require('../assets/back.png');
const STAR_FILLED = require('../assets/star_filled.png');
const IMG_00 = require('../assets/fish_00.png');
const IMG_02 = require('../assets/fish_02.png');
const IMG_03 = require('../assets/fish_03.png');
const IMG_04 = require('../assets/fish_04.png');
const IMG_05 = require('../assets/fish_05.png');
const IMG_06 = require('../assets/fish_06.png');
const IMG_07 = require('../assets/fish_07.png');
const IMG_08 = require('../assets/fish_08.png');
const IMG_09 = require('../assets/fish_09.png');
const IMG_10 = require('../assets/fish_10.png');

const STORAGE_FAVORITES = 'fish_facts_favorites_v1';
const { width: W, height: H } = Dimensions.get('window');

const IS_VERY_TINY = H < 640 || W < 330;

type FishFact = {
  id: string;
  title: string;
  text: string;
  image: any;
};

const FACTS: FishFact[] = [
  { id: 'icefish', title: 'Icefish', text: 'Some icefish have antifreeze proteins in their blood that stop them from freezing.', image: IMG_00 },
  { id: 'pike', title: 'Pike', text: 'A pike can stay completely still for minutes before striking with perfect accuracy.', image: IMG_02 },
  { id: 'carp', title: 'Carp', text: 'Carp can recognize human faces and remember them for a long time.', image: IMG_03 },
  { id: 'perch', title: 'Perch', text: 'Perch communicate by changing their swimming patterns and body position.', image: IMG_04 },
  { id: 'salmon', title: 'Salmon', text: 'Salmon can return to the exact river where they were born, using smell alone.', image: IMG_05 },
  { id: 'goldfish', title: 'Goldfish', text: 'Goldfish can remember things for months, not just a few seconds.', image: IMG_06 },
  { id: 'deepsea', title: 'Deep-Sea Fish', text: 'Some deep-sea fish produce their own light to survive in complete darkness.', image: IMG_07 },
  { id: 'clownfish', title: 'Clownfish', text: 'Clownfish can change sex — the dominant fish becomes female if needed.', image: IMG_08 },
  { id: 'electric_eel', title: 'Electric Eel', text: 'An electric eel can generate powerful shocks to defend itself and to hunt prey.', image: IMG_09 },
  { id: 'seahorse', title: 'Seahorse', text: 'Male seahorses carry the babies — they keep eggs in a pouch until they hatch.', image: IMG_10 },
];

async function readFavorites(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STORAGE_FAVORITES);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

async function writeFavorites(ids: string[]) {
  await AsyncStorage.setItem(STORAGE_FAVORITES, JSON.stringify(ids));
}

export default function FavoritesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [favIds, setFavIds] = useState<string[]>([]);
  const screenIn = useRef(new Animated.Value(0)).current;
  const listIn = useRef(new Animated.Value(0)).current;
  const topPad = Math.max(insets.top + 10, 56);
  const cardW = useMemo(() => Math.min(W * 0.92, 460), []);

  const load = useCallback(async () => {
    const ids = await readFavorites();
    setFavIds(ids);
    screenIn.setValue(0);
    listIn.setValue(0);
    Animated.sequence([
      Animated.timing(screenIn, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(listIn, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const favorites = useMemo(() => {
    const set = new Set(favIds);
    return FACTS.filter((f) => set.has(f.id));
  }, [favIds]);

  const remove = async (id: string) => {
    const next = favIds.filter((x) => x !== id);
    setFavIds(next);
    await writeFavorites(next);
  };

  const share = async (f: FishFact) => {
    try { await Share.share({ message: `${f.title}\n\n${f.text}` }); } catch {}
  };

  const renderItem = ({ item }: { item: FishFact }) => {
    return (
      <Animated.View style={{ opacity: listIn }}>
        <View style={[styles.factCard, { width: cardW }]}>
          <Text style={styles.factLabel}>Fact</Text>

          <Pressable onPress={() => remove(item.id)} style={styles.starBtn} hitSlop={15}>
            <Image source={STAR_FILLED} style={styles.starIcon} resizeMode="contain" />
          </Pressable>

          <View style={styles.photoWrap}>
            <Image source={item.image} style={styles.photo} resizeMode="cover" />
          </View>

          <Text style={styles.factText}>{item.text}</Text>

          <View style={styles.actionsRow}>
            <Pressable style={styles.smallBtn} onPress={() => share(item)}>
              <Text style={styles.smallBtnText}>Share</Text>
            </Pressable>

            <Pressable style={[styles.smallBtn, styles.smallBtnGhost]} onPress={() => remove(item.id)}>
              <Text style={[styles.smallBtnText, { color: '#13306F' }]}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <ImageBackground source={BG} style={styles.bg}>
      <Animated.View style={[styles.wrap, { paddingTop: topPad, opacity: screenIn }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image source={BACK_ICON} style={styles.backImg} />
          </Pressable>
          <Text style={styles.title}>Favorites</Text>
          <View style={{ width: 44 }} />
        </View>

        {favorites.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>You don’t have any saved facts yet</Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(x) => x.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
            ListFooterComponent={() => (
              <View>
                <Pressable onPress={() => navigation.navigate('FishFacts')} style={styles.addBtn}>
                  <Text style={styles.addBtnText}>Add more facts</Text>
                </Pressable>
                <View style={{ height: 30 }} />
              </View>
            )}
          />
        )}
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: 18 },
  topBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 20,
    backgroundColor: 'transparent' 
  },
  
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backImg: { width: 44, height: 44 },
  
  title: { 
    flex: 1, 
    textAlign: 'center', 
    color: '#fff', 
    fontWeight: '900', 
    fontSize: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  factCard: {
    alignSelf: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 30,
    padding: 20,
    marginBottom: 20,
  },
  factLabel: { textAlign: 'center', color: '#13306F', fontWeight: '900', fontSize: 18, marginBottom: 15 },
  
  starBtn: { position: 'absolute', right: 15, top: 15, zIndex: 10 },
  starIcon: { width: 35, height: 35 },

  photoWrap: { width: '100%', height: 160, borderRadius: 20, overflow: 'hidden', marginBottom: 15 },
  photo: { width: '100%', height: '100%' },
  factText: { textAlign: 'center', color: '#13306F', fontWeight: '700', fontSize: 16, lineHeight: 22 },

  actionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 20 },
  
  smallBtn: {
    flex: 1,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#87AAFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallBtnGhost: {
    backgroundColor: '#D1DEEE',
  },
  smallBtnText: { 
    color: '#fff', 
    fontWeight: '900', 
    fontSize: 15,
    includeFontPadding: false, 
    textAlignVertical: 'center' 
  },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#fff', fontWeight: '700', fontSize: 18 },

  addBtn: {
    width: '100%',
    height: 55,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  addBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 }
});