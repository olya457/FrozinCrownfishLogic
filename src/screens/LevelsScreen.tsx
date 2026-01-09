import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { LEVELS } from '../data/levels';

type Props = NativeStackScreenProps<RootStackParamList, 'Levels'>;

const BG = require('../assets/background3.png');
const BACK_IMG = require('../assets/back.png');

const STORAGE_UNLOCKED = 'ice_trials_unlocked_v1';
const STORAGE_RESUME_LEVEL = 'ice_trials_resume_level';
const STORAGE_RESUME_TASK = 'ice_trials_resume_task';
const STORAGE_RESUME_STAGE = 'ice_trials_resume_stage';

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 750 || W < 360;
const IS_TINY = H < 690 || W < 350;
const IS_VERY_TINY = H < 640 || W < 330;

type LevelItem = { id: string; title: string };

const EXTRA_LEVELS: LevelItem[] = [
  { id: 'lvl_06', title: 'Glacier Sequence' },
  { id: 'lvl_07', title: 'Frostbitten Order' },
  { id: 'lvl_08', title: 'Polar Grid' },
  { id: 'lvl_09', title: 'Crystal Pathways' },
  { id: 'lvl_10', title: 'Snowdrift Logic' },
  { id: 'lvl_11', title: 'Icebound Riddles' },
  { id: 'lvl_12', title: 'Frozen Symmetry' },
  { id: 'lvl_13', title: 'Aurora Patterns' },
  { id: 'lvl_14', title: 'Permafrost Combinations' },
  { id: 'lvl_15', title: 'Blizzard Matrix' },
];

function levelIdFromNumber(n: number) {
  return `lvl_${String(n).padStart(2, '0')}`;
}

async function loadProgress() {
  const [[, u], [, r]] = await AsyncStorage.multiGet([
    STORAGE_UNLOCKED,
    STORAGE_RESUME_LEVEL,
  ]);

  const unlocked = Number(u);
  const resume = Number(r);

  return {
    unlocked: Number.isFinite(unlocked) && unlocked >= 1 ? unlocked : 1,
    resume: Number.isFinite(resume) && resume >= 1 ? resume : 1,
  };
}

async function resetProgressToLevel(level: number) {
  await AsyncStorage.multiSet([
    [STORAGE_UNLOCKED, String(level)],
    [STORAGE_RESUME_LEVEL, String(level)],
    [STORAGE_RESUME_TASK, '0'],
    [STORAGE_RESUME_STAGE, '0'],
  ]);
}

function useEnterAnim() {
  const screenIn = useRef(new Animated.Value(0)).current;
  const listIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    screenIn.setValue(0);
    listIn.setValue(0);

    Animated.sequence([
      Animated.timing(screenIn, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(listIn, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [screenIn, listIn]);

  return { screenIn, listIn };
}

export default function LevelsScreen({ navigation }: Props) {
  const [unlockedCount, setUnlockedCount] = useState(1);
  const [resumeLevel, setResumeLevel] = useState(1);

  const { screenIn, listIn } = useEnterAnim();

  useFocusEffect(
    React.useCallback(() => {
      let alive = true;

      const load = async () => {
        const p = await loadProgress();
        if (!alive) return;
        setUnlockedCount(p.unlocked);
        setResumeLevel(p.resume);
      };

      load();
      return () => {
        alive = false;
      };
    }, [])
  );

  const ALL_LEVELS: LevelItem[] = useMemo(() => {
    const base: LevelItem[] = (LEVELS ?? []) as LevelItem[];
    if (base.length >= 15) return base;

    const existing = new Set(base.map((x) => x.id));
    const extra = EXTRA_LEVELS.filter((x) => !existing.has(x.id));
    return [...base, ...extra].slice(0, 15);
  }, []);

  const maxUnlocked = Math.min(unlockedCount, ALL_LEVELS.length);
  const progressTop = Math.max(unlockedCount, resumeLevel);

  const onPressLevel = async (item: LevelItem, index: number) => {
    const levelNumber = index + 1;
    if (levelNumber > maxUnlocked) return;

    if (levelNumber < progressTop) {
      await resetProgressToLevel(levelNumber);
      setUnlockedCount(levelNumber);
      setResumeLevel(levelNumber);
    }

    navigation.navigate('LevelPlay', {
      levelId: levelIdFromNumber(levelNumber),
      levelNumber,
    });
  };

  const topPad = IS_VERY_TINY ? 66 : IS_TINY ? 70 : IS_SMALL ? 74 : 78;
  const titleSize = IS_VERY_TINY ? 20 : IS_TINY ? 21 : 22;
  const subSize = IS_VERY_TINY ? 14 : 16;

  const renderItem = ({ item, index }: { item: LevelItem; index: number }) => {
    const levelIndex = index + 1;
    const isUnlocked = levelIndex <= maxUnlocked;

    const rowOpacity = listIn;
    const rowTranslateY = listIn.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 0],
    });

    return (
      <Animated.View style={{ opacity: rowOpacity, transform: [{ translateY: rowTranslateY }] }}>
        <Pressable
          style={[styles.row, !isUnlocked && styles.rowLocked]}
          onPress={() => onPressLevel(item, index)}
        >
          <View style={[styles.badge, isUnlocked ? styles.badgeOn : styles.badgeOff]}>
            <Text style={styles.badgeText}>{levelIndex}</Text>
          </View>

          <Text style={styles.rowText} numberOfLines={1}>
            {item.title}
          </Text>

          {!isUnlocked && <Text style={styles.lock}>LOCKED</Text>}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <Animated.View
        style={[
          styles.wrap,
          {
            paddingTop: topPad,
            opacity: screenIn,
            transform: [
              {
                translateY: screenIn.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image source={BACK_IMG} style={styles.backImg} resizeMode="contain" />
          </Pressable>

          <Text style={[styles.title, { fontSize: titleSize }]}>Ice Trials</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={[styles.subtitle, { fontSize: subSize }]}>Levels:</Text>

        <FlatList
          data={ALL_LEVELS}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  wrap: { flex: 1, paddingHorizontal: 18 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backImg: { width: '100%', height: '100%' },

  title: { flex: 1, textAlign: 'center', color: '#fff', fontWeight: '900', includeFontPadding: false },

  subtitle: {
    marginTop: 16,
    marginBottom: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '800',
    includeFontPadding: false,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  rowLocked: { opacity: 0.45 },

  badge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeOn: { backgroundColor: 'rgba(160,220,255,0.55)' },
  badgeOff: { backgroundColor: 'rgba(140,170,200,0.35)' },
  badgeText: { color: '#fff', fontWeight: '900', includeFontPadding: false },

  rowText: { flex: 1, color: '#fff', fontWeight: '900', includeFontPadding: false },
  lock: { color: 'rgba(255,255,255,0.7)', fontWeight: '900', includeFontPadding: false },
});