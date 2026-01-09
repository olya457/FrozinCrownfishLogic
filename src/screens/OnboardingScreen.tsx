import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 750 || W < 360;
const IS_TINY = H < 690 || W < 350;
const IS_VERY_TINY = H < 640 || W < 330;

const BG_COLOR = '#8CB2E7';

const ONBOARD_1 = require('../assets/onboard1.png');
const ONBOARD_2 = require('../assets/onboard2.png');
const ONBOARD_3 = require('../assets/onboard3.png');
const ONBOARD_4 = require('../assets/onboard4.png');

type Page = {
  key: string;
  image: any;
  title: string;
  text: string;
  button: string;
};

export default function OnboardingScreen({ navigation }: Props) {
  const pages: Page[] = useMemo(
    () => [
      {
        key: '1',
        image: ONBOARD_1,
        title: 'Think. Break the ice.',
        text: 'Solve logic puzzles hidden beneath\nthe frozen lake.',
        button: 'Next',
      },
      {
        key: '2',
        image: ONBOARD_2,
        title: 'Solve 3 Logic Puzzles',
        text: 'Each correct answer cracks\nthe ice and brings you closer to the fish.',
        button: 'Next',
      },
      {
        key: '3',
        image: ONBOARD_3,
        title: 'Earn Crownfish',
        text: 'Complete all puzzles to unlock\na crowned fish for your collection.',
        button: 'Next',
      },
      {
        key: '4',
        image: ONBOARD_4,
        title: 'Learn & Save Facts',
        text: 'Discover interesting fish facts\nand save your favorites.',
        button: 'Play Now',
      },
    ],
    []
  );

  const listRef = useRef<FlatList<Page>>(null);
  const [index, setIndex] = useState(0);
  const imageH = Math.round(H * (IS_VERY_TINY ? 0.64 : IS_TINY ? 0.66 : IS_SMALL ? 0.67 : 0.68));
  const titleSize = IS_VERY_TINY ? 21 : IS_TINY ? 23 : IS_SMALL ? 25 : 26;
  const textSize = IS_VERY_TINY ? 12.5 : IS_TINY ? 13.5 : IS_SMALL ? 14 : 14.5;

  const btnH = IS_VERY_TINY ? 40 : 42;
  const btnMinW = IS_VERY_TINY ? 130 : 140;
  const bottomPadX = IS_VERY_TINY ? 18 : 22;
  const bottomTop = (IS_VERY_TINY ? 18 : 14) + 30; 
  const btnTop = IS_VERY_TINY ? 12 : 16;

  const imgIn = useRef(new Animated.Value(0)).current;
  const contentIn = useRef(new Animated.Value(0)).current;
  const btnIn = useRef(new Animated.Value(0)).current;

  const runEnter = () => {
    imgIn.setValue(0);
    contentIn.setValue(0);
    btnIn.setValue(0);

    Animated.sequence([
      Animated.timing(imgIn, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentIn, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(btnIn, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    runEnter();
  }, [index]);

  const goNext = () => {
    if (index >= pages.length - 1) {
      navigation.replace('Home');
      return;
    }
    const next = index + 1;
    setIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  return (
    <View style={[styles.root, { backgroundColor: BG_COLOR }]}>
      <FlatList
        ref={listRef}
        data={pages}
        keyExtractor={(it) => it.key}
        horizontal
        pagingEnabled
        scrollEnabled={false} 
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const imgOpacity = imgIn;
          const imgTranslate = imgIn.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

          const contentOpacity = contentIn;
          const contentTranslate = contentIn.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

          const btnOpacity = btnIn;
          const btnScale = btnIn.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });

          return (
            <View style={{ width: W, flex: 1 }}>
              <Animated.View
                style={[
                  styles.top,
                  { height: imageH, opacity: imgOpacity, transform: [{ translateY: imgTranslate }] },
                ]}
              >
                <Image source={item.image} style={styles.topImg} resizeMode="cover" />
              </Animated.View>
              <Animated.View
                style={[
                  styles.bottom,
                  {
                    paddingHorizontal: bottomPadX,
                    paddingTop: bottomTop,
                    opacity: contentOpacity,
                    transform: [{ translateY: contentTranslate }],
                  },
                ]}
              >
                <Text style={[styles.title, { fontSize: titleSize }]}>{item.title}</Text>

                <Text style={[styles.text, { fontSize: textSize }]}>{item.text}</Text>

                <Animated.View style={{ marginTop: btnTop, opacity: btnOpacity, transform: [{ scale: btnScale }] }}>
                  <Pressable style={[styles.btn, { height: btnH, minWidth: btnMinW }]} onPress={goNext}>
                    <Text style={styles.btnText}>{item.button}</Text>
                  </Pressable>
                </Animated.View>
              </Animated.View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  top: {
    width: '100%',
    overflow: 'hidden',
  },
  topImg: {
    width: '100%',
    height: '100%',
  },

  bottom: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    textAlign: 'center',
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },

  text: {
    marginTop: 10,
    textAlign: 'center',
    color: 'rgba(0,0,0,0.70)',
    fontWeight: '700',
    lineHeight: 18,
  },

  btn: {
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
