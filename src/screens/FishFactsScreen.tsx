import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'FishFacts'>;

const BG = require('../assets/background6.png');
const BACK_ICON = require('../assets/back.png');

const STAR_OUTLINE = require('../assets/star_outline.png');
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
const STORAGE_FACT_INDEX = 'fish_facts_index_v1';

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 750 || W < 360;
const IS_TINY = H < 690 || W < 350;
const IS_VERY_TINY = H < 640 || W < 330;

type FishFact = {
  id: string;
  title: string;
  text: string;
  image: any;
};

const FACTS: FishFact[] = [
  {
    id: 'icefish',
    title: 'Icefish (Antarctic)',
    text: 'Some icefish have antifreeze proteins in their blood that stop them from freezing.',
    image: IMG_00,
  },
  {
    id: 'pike',
    title: 'Pike',
    text: 'A pike can stay completely still for minutes before striking with perfect accuracy.',
    image: IMG_02,
  },
  {
    id: 'carp',
    title: 'Carp',
    text: 'Carp can recognize human faces and remember them for a long time.',
    image: IMG_03,
  },
  {
    id: 'perch',
    title: 'Perch',
    text: 'Perch communicate by changing their swimming patterns and body position.',
    image: IMG_04,
  },
  {
    id: 'salmon',
    title: 'Salmon',
    text: 'Salmon can return to the exact river where they were born, using smell alone.',
    image: IMG_05,
  },
  {
    id: 'goldfish',
    title: 'Goldfish',
    text: 'Goldfish can remember things for months, not just a few seconds.',
    image: IMG_06,
  },
  {
    id: 'deepsea',
    title: 'Deep-Sea Fish',
    text: 'Some deep-sea fish produce their own light to survive in complete darkness.',
    image: IMG_07,
  },
  {
    id: 'clownfish',
    title: 'Clownfish',
    text: 'Clownfish can change sex — the dominant fish becomes female if needed.',
    image: IMG_08,
  },
  {
    id: 'electric_eel',
    title: 'Electric Eel',
    text: 'An electric eel can generate powerful shocks to defend itself and to hunt prey.',
    image: IMG_09,
  },
  {
    id: 'seahorse',
    title: 'Seahorse',
    text: 'Male seahorses carry the babies — they keep eggs in a pouch until they hatch.',
    image: IMG_10,
  },
];

async function readFavorites(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STORAGE_FAVORITES);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.filter((x) => typeof x === 'string');
    return [];
  } catch {
    return [];
  }
}

async function writeFavorites(ids: string[]) {
  await AsyncStorage.setItem(STORAGE_FAVORITES, JSON.stringify(ids));
}

function clampIndex(i: number, len: number) {
  if (!Number.isFinite(i)) return 0;
  if (len <= 0) return 0;
  return Math.max(0, Math.min(len - 1, i));
}

export default function FishFactsScreen({ navigation }: Props) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [index, setIndex] = useState<number>(0);

  const screenIn = useRef(new Animated.Value(0)).current;
  const cardIn = useRef(new Animated.Value(0)).current;
  const btnsIn = useRef(new Animated.Value(0)).current;

  const safeIndex = clampIndex(index, FACTS.length);
  const fact = FACTS[safeIndex];

  const isFav = useMemo(() => favorites.includes(fact.id), [favorites, fact.id]);

  const topPad = IS_VERY_TINY ? 44 : IS_TINY ? 48 : IS_SMALL ? 52 : 56;
  const titleSize = IS_VERY_TINY ? 28 : IS_TINY ? 30 : 32;

  const SHIFT_DOWN = 80;

  const cardW = useMemo(() => {
    const max = Math.min(W * 0.92, 460);
    if (IS_VERY_TINY) return Math.min(max, 360);
    if (IS_TINY) return Math.min(max, 392);
    if (IS_SMALL) return Math.min(max, 430);
    return max;
  }, []);

  const cardRadius = IS_VERY_TINY ? 26 : 30;

  const photoW = Math.min(cardW * 0.84, 380);
  const photoH = IS_VERY_TINY ? 118 : IS_TINY ? 132 : IS_SMALL ? 150 : 168;

  const factTextSize = IS_VERY_TINY ? 14 : IS_TINY ? 15 : 16;
  const factLine = IS_VERY_TINY ? 18 : IS_TINY ? 20 : 22;

  const btnW = Math.min(W * 0.78, 330);
  const btnH = IS_VERY_TINY ? 46 : 50;

  const runEnter = useCallback(async () => {
    const fav = await readFavorites();
    const storedIndexRaw = await AsyncStorage.getItem(STORAGE_FACT_INDEX);
    const storedIndex = Number(storedIndexRaw);

    setFavorites(fav);
    setIndex(clampIndex(storedIndex, FACTS.length));

    screenIn.setValue(0);
    cardIn.setValue(0);
    btnsIn.setValue(0);

    Animated.sequence([
      Animated.timing(screenIn, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(cardIn, {
        toValue: 1,
        useNativeDriver: true,
        damping: 16,
        stiffness: 140,
        mass: 0.9,
      }),
      Animated.timing(btnsIn, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [btnsIn, cardIn, screenIn]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!alive) return;
        await runEnter();
      })();
      return () => {
        alive = false;
      };
    }, [runEnter])
  );

  const persistIndex = async (next: number) => {
    setIndex(next);
    await AsyncStorage.setItem(STORAGE_FACT_INDEX, String(next));
  };

  const toggleFavorite = async () => {
    const id = fact.id;
    const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(next);
    await writeFavorites(next);
  };

  const onNext = async () => {
    const next = (safeIndex + 1) % FACTS.length;

    cardIn.setValue(0.94);
    Animated.spring(cardIn, {
      toValue: 1,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
      mass: 0.9,
    }).start();

    await persistIndex(next);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `${fact.title}\n\n${fact.text}\n\n#Crownfish`,
      });
    } catch {}
  };

  const screenOpacity = screenIn;
  const screenTranslateY = screenIn.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  const cardOpacity = cardIn.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const cardTranslateY = cardIn.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const cardScale = cardIn.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] });

  const btnOpacity = btnsIn;
  const btnTranslateY = btnsIn.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <Animated.View
        style={[
          styles.wrap,
          { paddingTop: topPad, opacity: screenOpacity, transform: [{ translateY: screenTranslateY }] },
        ]}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
            <Image source={BACK_ICON} style={styles.backImg} resizeMode="contain" />
          </Pressable>

          <Text style={[styles.title, { fontSize: titleSize }]} numberOfLines={1}>
            Crownfish
          </Text>

          <View style={{ width: 44 }} />
        </View>

        <View style={{ marginTop: SHIFT_DOWN }}>
          <Animated.View
            style={[
              styles.card,
              {
                width: cardW,
                borderRadius: cardRadius,
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
                paddingTop: IS_VERY_TINY ? 18 : 20,
                paddingBottom: IS_VERY_TINY ? 18 : 20,
              },
            ]}
          >
            <Text style={styles.cardTitle}>Fact</Text>

            <Pressable onPress={toggleFavorite} style={styles.starBtnBare} hitSlop={10}>
              <Image source={isFav ? STAR_FILLED : STAR_OUTLINE} style={styles.starIcon} resizeMode="contain" />
            </Pressable>

            <View style={[styles.photoWrap, { width: photoW, height: photoH, borderRadius: 18 }]}>
              <Image source={fact.image} style={styles.photo} resizeMode="cover" />
            </View>

            <Text style={[styles.factText, { fontSize: factTextSize, lineHeight: factLine }]}>
              {fact.text}
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              marginTop: IS_VERY_TINY ? 16 : 20,
              opacity: btnOpacity,
              transform: [{ translateY: btnTranslateY }],
            }}
          >
            <Pressable style={[styles.btn, { width: btnW, height: btnH }]} onPress={onNext}>
              <Text style={styles.btnText}>Next</Text>
            </Pressable>

            <Pressable style={[styles.btn, { width: btnW, height: btnH, marginTop: 14 }]} onPress={onShare}>
              <Text style={styles.btnText}>Share</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: 18 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backImg: { width: 44, height: 44 },

  title: {
    flex: 1,
    textAlign: 'center',
    color: '#D9ECFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },

  card: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.90)',
    paddingHorizontal: IS_VERY_TINY ? 16 : 18,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },

  cardTitle: {
    textAlign: 'center',
    color: 'rgba(18, 34, 86, 0.85)',
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 12,
  },

  starBtnBare: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: { width: 30, height: 30 },

  photoWrap: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    marginBottom: 14,
  },
  photo: { width: '100%', height: '100%' },

  factText: {
    textAlign: 'center',
    color: 'rgba(24, 52, 120, 0.85)',
    fontWeight: '800',
    paddingHorizontal: 8,
  },

  btn: {
    alignSelf: 'center',
    borderRadius: 26,
    backgroundColor: 'rgba(125, 170, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  btnText: { color: '#EAF4FF', fontWeight: '900', fontSize: 18 },
});
