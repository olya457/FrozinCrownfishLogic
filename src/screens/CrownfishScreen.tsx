import React, { useMemo, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Crownfish'>;

const BG = require('../assets/background3.png');
const ICON_LOCK = require('../assets/lock.png');
const FISH_1 = require('../assets/fish_1.png');
const FISH_2 = require('../assets/fish_2.png');
const FISH_3 = require('../assets/fish_3.png');
const FISH_4 = require('../assets/fish_4.png');
const FISH_5 = require('../assets/fish_5.png');
const BACK_ICON = require('../assets/back.png');
const STORAGE_UNLOCKED = 'ice_trials_unlocked_v1';

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 750 || W < 360;
const IS_TINY = H < 690 || W < 350;
const IS_VERY_TINY = H < 640 || W < 330;

type CollectionItem = {
  id: string;
  title: string;
  fishIndex: 0 | 1 | 2 | 3 | 4;
};

const FISH_ICONS = [FISH_1, FISH_2, FISH_3, FISH_4, FISH_5] as const;

const COLLECTIONS: CollectionItem[] = [
  { id: 'c01', title: 'Ice Minnow', fishIndex: 0 },
  { id: 'c02', title: 'Frost Carp', fishIndex: 1 },
  { id: 'c03', title: 'Glacier Pike', fishIndex: 2 },
  { id: 'c04', title: 'Crystal Perch', fishIndex: 3 },
  { id: 'c05', title: 'Crownfish Prime', fishIndex: 4 },

  { id: 'c06', title: 'Snowfin Drifter', fishIndex: 0 },
  { id: 'c07', title: 'Aurora Guppy', fishIndex: 1 },
  { id: 'c08', title: 'Icicle Roach', fishIndex: 2 },
  { id: 'c09', title: 'Polar Dace', fishIndex: 3 },
  { id: 'c10', title: 'Rime Trout', fishIndex: 4 },

  { id: 'c11', title: 'Blizzard Herring', fishIndex: 0 },
  { id: 'c12', title: 'Permafrost Bream', fishIndex: 1 },
  { id: 'c13', title: 'Glint Salmon', fishIndex: 2 },
  { id: 'c14', title: 'Iceveil Char', fishIndex: 3 },
  { id: 'c15', title: 'Frozen Crownkeeper', fishIndex: 4 },
];

async function getUnlockedCount(): Promise<number> {
  const v = await AsyncStorage.getItem(STORAGE_UNLOCKED);
  const n = Number(v);
  if (!v || !Number.isFinite(n) || n < 1) return 1;
  return n;
}

function collectionsUnlockedFromUnlockedCount(unlockedCount: number) {
  return Math.max(0, unlockedCount - 1);
}

export default function CrownfishScreen({ navigation }: Props) {
  const [unlockedCount, setUnlockedCount] = React.useState<number>(1);
  const screenIn = useRef(new Animated.Value(0)).current;
  const cardsIn = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      let alive = true;

      const load = async () => {
        const u = await getUnlockedCount();
        if (!alive) return;

        setUnlockedCount(u);

        screenIn.setValue(0);
        cardsIn.setValue(0);

        Animated.sequence([
          Animated.timing(screenIn, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(cardsIn, {
            toValue: 1,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      };

      load();
      return () => {
        alive = false;
      };
    }, [cardsIn, screenIn])
  );

  const unlockedCollections = useMemo(() => {
    const c = collectionsUnlockedFromUnlockedCount(unlockedCount);
    return Math.min(c, COLLECTIONS.length);
  }, [unlockedCount]);

  const topPad = IS_VERY_TINY ? 48 : IS_TINY ? 52 : IS_SMALL ? 56 : 60;
  const titleSize = IS_VERY_TINY ? 26 : IS_TINY ? 28 : 30;

  const cardSize = useMemo(() => {
    const sidePad = 18;
    const gap = IS_VERY_TINY ? 16 : 18;
    const available = W - sidePad * 2 - gap;
    const base = Math.floor(available / 2);
    const clampMin = IS_VERY_TINY ? 138 : IS_TINY ? 148 : 156;
    const clampMax = IS_VERY_TINY ? 170 : IS_TINY ? 182 : 196;
    return Math.max(clampMin, Math.min(clampMax, base));
  }, []);

  const cardGap = IS_VERY_TINY ? 16 : 18;

  const lockIconSize = IS_VERY_TINY ? 34 : IS_TINY ? 36 : IS_SMALL ? 38 : 40;
  const fishIconSize = lockIconSize + 90;
  const labelSize = IS_VERY_TINY ? 18 : IS_TINY ? 19 : 20;

  const screenOpacity = screenIn;
  const screenTranslateY = screenIn.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  const data = COLLECTIONS;
  const isOdd = data.length % 2 === 1;

  const showLockedMessage = (index: number) => {
    const distance = Math.max(0, index - (unlockedCollections - 1));
    const message =
      distance <= 1
        ? 'This card unlocks after you complete the next level.'
        : 'This card unlocks only by progressing through the game. Keep playing to reveal it.';
    Alert.alert('Locked', message, [{ text: 'OK' }]);
  };

  const renderItem = ({ item, index }: { item: CollectionItem; index: number }) => {
    const isUnlocked = index < unlockedCollections;

    const appearOpacity = cardsIn.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const appearTranslateY = cardsIn.interpolate({
      inputRange: [0, 1],
      outputRange: [14 + Math.min(index, 6) * 2, 0],
    });
    const appearScale = cardsIn.interpolate({
      inputRange: [0, 1],
      outputRange: [0.98, 1],
    });

    const isLastSingle = isOdd && index === data.length - 1;
    const fishSource = FISH_ICONS[item.fishIndex];

    return (
      <Animated.View
        style={[
          styles.itemWrap,
          {
            width: cardSize,
            marginBottom: IS_VERY_TINY ? 22 : 26,
            opacity: appearOpacity,
            transform: [{ translateY: appearTranslateY }, { scale: appearScale }],
          },
          isLastSingle && { marginLeft: (cardSize + cardGap) / 2 },
        ]}
      >
        <Pressable
          onPress={() => {
            if (!isUnlocked) {
              showLockedMessage(index);
              return;
            }
          }}
          style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.985 : 1 }] }]}
        >
          <View style={[styles.cardShell, { width: cardSize, height: cardSize }]}>
            <View style={styles.cardInner}>
              <Image
                source={isUnlocked ? fishSource : ICON_LOCK}
                style={{
                  width: isUnlocked ? fishIconSize : lockIconSize,
                  height: isUnlocked ? fishIconSize : lockIconSize,
                  opacity: isUnlocked ? 1 : 0.95,
                }}
                resizeMode="contain"
              />
            </View>
          </View>
        </Pressable>

        <Text style={[styles.itemTitle, { fontSize: labelSize }]} numberOfLines={1}>
          {item.title}
        </Text>
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
            opacity: screenOpacity,
            transform: [{ translateY: screenTranslateY }],
          },
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

        <FlatList
          data={data}
          keyExtractor={(x) => x.id}
          renderItem={renderItem}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{
            paddingTop: IS_VERY_TINY ? 18 : 24,
            paddingBottom: 40,
          }}
        />
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  wrap: {
    flex: 1,
    paddingHorizontal: 18,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backImg: {
    width: 44,
    height: 44,
  },

  title: {
    color: '#D9ECFF',
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
    flex: 1,
  },

  itemWrap: {
    alignItems: 'center',
  },

  cardShell: {
    borderRadius: 26,
    backgroundColor: 'rgba(210, 230, 255, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
    overflow: 'hidden',
  },

  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemTitle: {
    marginTop: 12,
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.28)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
