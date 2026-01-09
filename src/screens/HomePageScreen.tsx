import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 750 || W < 360;
const IS_TINY = H < 690 || W < 350;
const IS_VERY_TINY = H < 640 || W < 330;

const BG = require('../assets/background1.png');
const LOGO = require('../assets/logo.png');
const FISH = require('../assets/fish.png');

function useHomeEnter() {
  const screenIn = useRef(new Animated.Value(0)).current;
  const logoIn = useRef(new Animated.Value(0)).current;
  const b1 = useRef(new Animated.Value(0)).current;
  const b2 = useRef(new Animated.Value(0)).current;
  const b3 = useRef(new Animated.Value(0)).current;
  const b4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    screenIn.setValue(0);
    logoIn.setValue(0);
    b1.setValue(0);
    b2.setValue(0);
    b3.setValue(0);
    b4.setValue(0);

    Animated.sequence([
      Animated.timing(screenIn, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(logoIn, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.stagger(110, [
        Animated.timing(b1, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(b2, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(b3, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(b4, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, [screenIn, logoIn, b1, b2, b3, b4]);

  return { screenIn, logoIn, b1, b2, b3, b4 };
}

function AnimatedMenuButton({
  title,
  onPress,
  anim,
  fishSize,
  fishInset,
  fontSize,
  height,
}: {
  title: string;
  onPress: () => void;
  anim: Animated.Value;
  fishSize: number;
  fishInset: number;
  fontSize: number;
  height: number;
}) {
  const opacity = anim;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] });

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      <Pressable 
        style={[styles.btn, { height }]} 
        onPress={onPress}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
      >
        <Image
          source={FISH}
          resizeMode="contain"
          style={[
            styles.fish,
            {
              left: fishInset,
              width: fishSize,
              height: fishSize,
            },
          ]}
        />

        <Text style={[styles.btnText, { fontSize }]} numberOfLines={1}>
          {title}
        </Text>

        <Image
          source={FISH}
          resizeMode="contain"
          style={[
            styles.fish,
            {
              right: fishInset,
              width: fishSize,
              height: fishSize,
              transform: [{ scaleX: -1 }],
            },
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

export default function HomePageScreen({ navigation }: Props) {
  const { screenIn, logoIn, b1, b2, b3, b4 } = useHomeEnter();

  const logoSize = useMemo(() => (IS_VERY_TINY ? 185 : IS_TINY ? 210 : IS_SMALL ? 230 : 250), []);
  const topPad = useMemo(() => (IS_VERY_TINY ? 34 : IS_TINY ? 42 : IS_SMALL ? 50 : 56), []);
  const menuW = useMemo(() => (IS_VERY_TINY ? '92%' : IS_TINY ? '90%' : '86%'), []);
  const btnH = useMemo(() => (IS_VERY_TINY ? 56 : IS_TINY ? 58 : 62), []);
  const btnFont = useMemo(() => (IS_VERY_TINY ? 26 : IS_TINY ? 28 : 30), []);
  const fishSize = useMemo(() => (IS_VERY_TINY ? 22 : IS_TINY ? 24 : 26), []);
  const fishInset = useMemo(() => 12, []);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <Animated.View style={[styles.wrap, { paddingTop: topPad, opacity: screenIn, transform: [{ translateY: 70 }] }]}>
        <Animated.View style={{ opacity: logoIn }}>
          <Image source={LOGO} style={[styles.logo, { width: logoSize, height: logoSize, borderRadius: 50 }]} resizeMode="cover" />
        </Animated.View>

        <View style={[styles.menu, { width: menuW }]}>
          <AnimatedMenuButton title="Ice Trials" onPress={() => navigation.navigate('Levels')} anim={b1} fishSize={fishSize} fishInset={fishInset} fontSize={btnFont} height={btnH} />
          <AnimatedMenuButton title="Crownfish" onPress={() => navigation.navigate('Crownfish')} anim={b2} fishSize={fishSize} fishInset={fishInset} fontSize={btnFont} height={btnH} />
          <AnimatedMenuButton title="Fish Facts" onPress={() => navigation.navigate('FishFacts')} anim={b3} fishSize={fishSize} fishInset={fishInset} fontSize={btnFont} height={btnH} />
          <AnimatedMenuButton title="Favorites" onPress={() => navigation.navigate('Favorites')} anim={b4} fishSize={fishSize} fishInset={fishInset} fontSize={btnFont} height={btnH} />
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  wrap: { flex: 1, alignItems: 'center' },
  logo: { backgroundColor: 'transparent' },
  menu: { marginTop: 22, gap: 14 },

  btn: {
    borderRadius: 18,
    backgroundColor: '#12376E', 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  btnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    includeFontPadding: false, 
    textAlignVertical: 'center',
  },

  fish: {
    position: 'absolute',
    opacity: 1,
    backgroundColor: 'transparent',
  },
});