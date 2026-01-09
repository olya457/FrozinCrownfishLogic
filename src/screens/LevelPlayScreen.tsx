import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelPlay'>;

const { width: W, height: H } = Dimensions.get('window');

const IS_SMALL_H = H < 750;
const IS_TINY_W = W < 370;

const STORAGE_UNLOCKED = 'ice_trials_unlocked_v1';
const STORAGE_RESUME_LEVEL = 'ice_trials_resume_level';
const PROGRESS_TASK_PREFIX = 'ice_trials_task_';
const PROGRESS_STAGE_PREFIX = 'ice_trials_stage_';

const BG_TASK1 = require('../assets/Task1.png');
const BG_TASK2 = require('../assets/Task2.png');
const BG_TASK3 = require('../assets/Task3.png');
const FISH_CROWN = require('../assets/fish_crown.png');
const BACK_IMG = require('../assets/back.png'); 

function levelIdFromNumber(n: number) { return `lvl_${String(n).padStart(2, '0')}`; }

async function loadLevelProgress(levelNumber: number) {
  const [tRaw, sRaw] = await AsyncStorage.multiGet([`${PROGRESS_TASK_PREFIX}${levelNumber}`, `${PROGRESS_STAGE_PREFIX}${levelNumber}`]);
  const t = Number(tRaw?.[1]);
  const s = Number(sRaw?.[1]);
  return { taskIndex: isFinite(t) ? t : 0, stage: (isFinite(s) ? s : 0) as 0 | 1 | 2 };
}
async function saveLevelProgress(levelNumber: number, taskIndex: number, stage: number) {
  await AsyncStorage.multiSet([[`${PROGRESS_TASK_PREFIX}${levelNumber}`, String(taskIndex)], [`${PROGRESS_STAGE_PREFIX}${levelNumber}`, String(stage)]]);
}
async function clearLevelProgress(levelNumber: number) {
  await AsyncStorage.multiRemove([`${PROGRESS_TASK_PREFIX}${levelNumber}`, `${PROGRESS_STAGE_PREFIX}${levelNumber}`]);
}

const LEVELS_DATA: Record<number, { levelTitle: string; tasks: any[] }> = {
  1: { levelTitle: 'Frozen Patterns', tasks: [
    { grid: ['2   4   8', '3   6   12', '5   10   ?'], answer: '20', prompt: 'Give the correct answer' },
    { grid: ['1   3   5', '2   6   10', '3   9   ?'], answer: '15', prompt: 'Give the correct answer' },
    { grid: ['4   8   12', '6   12   18', '8   16   ?'], answer: '24', prompt: 'Give the correct answer' },
  ]},
  2: { levelTitle: 'Deeper Logic', tasks: [
    { grid: ['3   6   9', '4   8   12', '7   14   ?'], answer: '21', prompt: 'Give the correct answer' },
    { grid: ['5   7   9', '6   9   12', '7   11   ?'], answer: '15', prompt: 'Give the correct answer' },
    { grid: ['2   5   8', '3   7   11', '4   9   ?'], answer: '14', prompt: 'Give the correct answer' },
  ]},
  3: { levelTitle: 'Sub-Zero Squares', tasks: [
    { grid: ['1   4   9', '16   25   36', '49   64   ?'], answer: '81', prompt: 'Complete the square sequence' },
    { grid: ['2   4   16', '3   9   81', '4   16   ?'], answer: '256', prompt: 'Find the power logic' },
    { grid: ['10   100', '12   144', '15   ?'], answer: '225', prompt: 'Square the number' },
  ]},
  4: { levelTitle: 'Ice Breaker', tasks: [
    { grid: ['12 + 13 = 25', '24 + 11 = 35', '32 + 17 = ?'], answer: '49', prompt: 'Sum the numbers' },
    { grid: ['5 * 5 = 25', '6 * 6 = 36', '12 * 12 = ?'], answer: '144', prompt: 'Solve the multiplication' },
    { grid: ['81 / 9 = 9', '49 / 7 = 7', '121 / 11 = ?'], answer: '11', prompt: 'Solve the division' },
  ]},
  5: { levelTitle: 'Crystal Math', tasks: [
    { grid: ['2   6   18', '3   9   27', '4   12   ?'], answer: '36', prompt: 'Multiply by 3' },
    { grid: ['100   50   25', '80   40   20', '60   30   ?'], answer: '15', prompt: 'Divide by 2' },
    { grid: ['7   14   21', '8   16   24', '11   22   ?'], answer: '33', prompt: 'Add the first number' },
  ]},
  6: { levelTitle: 'Glacier Gaps', tasks: [
    { grid: ['1   1   2   3   5', '8   13   21   ?'], answer: '34', prompt: 'Fibonacci sequence' },
    { grid: ['2   3   5   7   11', '13   17   ?'], answer: '19', prompt: 'Next prime number' },
    { grid: ['100   91   82', '73   64   ?'], answer: '55', prompt: 'Subtract 9 each time' },
  ]},
  7: { levelTitle: 'Abyssal Sums', tasks: [
    { grid: ['(2+3)*2 = 10', '(4+5)*2 = 18', '(6+7)*2 = ?'], answer: '26', prompt: 'Follow the formula' },
    { grid: ['15   30   45', '20   40   60', '25   50   ?'], answer: '75', prompt: 'Find the multiple' },
    { grid: ['9   3', '16   4', '100   ?'], answer: '10', prompt: 'Find the square root' },
  ]},
  8: { levelTitle: 'Arctic Algebra', tasks: [
    { grid: ['X + 5 = 12', 'Y - 3 = 10', 'X + Y = ?'], answer: '20', prompt: 'Solve for X and Y' },
    { grid: ['2X = 10', '3Y = 21', 'X * Y = ?'], answer: '35', prompt: 'Find X * Y' },
    { grid: ['A=1, B=2, C=3', 'A + B + C = 6', 'F + G = ?'], answer: '13', prompt: 'Alphabet positions' },
  ]},
  9: { levelTitle: 'Frosty Formulas', tasks: [
    { grid: ['1   8   27', '64   125   ?'], answer: '216', prompt: 'Cube sequence' },
    { grid: ['10   11   13   16', '20   25   ?'], answer: '31', prompt: 'Increasing gaps' },
    { grid: ['5   25   125', '2   4   8', '3   9   ?'], answer: '27', prompt: 'Powers of 3' },
  ]},
  10: { levelTitle: 'The Crown Trial', tasks: [
    { grid: ['123 = 6', '456 = 15', '789 = ?'], answer: '24', prompt: 'Sum of digits' },
    { grid: ['2   4   12   48', '3   9   36   ?'], answer: '180', prompt: 'Multiply by x3, x4, x5...' },
    { grid: ['FISH = 4', 'CROWN = 5', 'LOGIC = ?'], answer: '5', prompt: 'Count the letters' },
  ]},
  11: { levelTitle: 'Snowflake Logic', tasks: [
    { grid: ['2   5   11', '23   47   ?'], answer: '95', prompt: 'Pattern: x2 + 1' },
    { grid: ['144   72   36', '18   9   ?'], answer: '4', prompt: 'Half each time' },
    { grid: ['1   2   6   24', '120   ?'], answer: '720', prompt: 'Factorial' },
  ]},
  12: { levelTitle: 'Deep Blue Equations', tasks: [
    { grid: ['10 (40) 4', '5 (30) 6', '8 (?) 7'], answer: '56', prompt: 'Multiply outer numbers' },
    { grid: ['12 [6] 2', '20 [5] 4', '50 [?] 5'], answer: '10', prompt: 'Divide first by last' },
    { grid: ['7   49   343', '2   4   8', '6   36   ?'], answer: '216', prompt: 'Cube the base number' },
  ]},
  13: { levelTitle: 'Tundra Twins', tasks: [
    { grid: ['11 * 11 = 121', '12 * 12 = 144', '13 * 13 = ?'], answer: '169', prompt: 'Square of 13' },
    { grid: ['2   6   12   20', '30   ?'], answer: '42', prompt: 'Add +4, +6, +8...' },
    { grid: ['99   88   77', '66   55   ?'], answer: '44', prompt: 'Subtract 11' },
  ]},
  14: { levelTitle: 'Oceanic Mirror', tasks: [
    { grid: ['12 | 21', '34 | 43', '56 | ?'], answer: '65', prompt: 'Reverse the digits' },
    { grid: ['111 = 3', '222 = 6', '555 = ?'], answer: '15', prompt: 'Sum all digits' },
    { grid: ['8   4   2', '1000   500   ?'], answer: '250', prompt: 'Half of the previous' },
  ]},
  15: { levelTitle: 'The Ice King', tasks: [
    { grid: ['7   15   31', '63   127   ?'], answer: '255', prompt: 'Formula: (n * 2) + 1' },
    { grid: ['1   4   13   40', '121   ?'], answer: '364', prompt: 'Formula: (n * 3) + 1' },
    { grid: ['3   1   4   1   5', '9   ?'], answer: '2', prompt: 'Digits of Pi' },
  ]},
};

const KEYS = [
  { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }, { label: '5', value: '5' },
  { label: '6', value: '6' }, { label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' }, { label: 'C', value: 'C' },
  { label: '0', value: '0' }, { label: '⌫', value: 'BK' },
];

export default function LevelPlayScreen({ navigation, route }: Props) {
  const { levelNumber } = route.params;
  const levelData = LEVELS_DATA[levelNumber] ?? LEVELS_DATA[1];

  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'none' | 'win'>('none');

  const animIn = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const dimIn = useRef(new Animated.Value(0)).current;
  const panelIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    const init = async () => {
      animIn.setValue(0);
      Animated.timing(animIn, { toValue: 1, duration: 420, useNativeDriver: true }).start();
      setResult('none');
      setAnswer('');
      const saved = await loadLevelProgress(levelNumber);
      if (alive) {
        setTaskIndex(saved.taskIndex);
        setStage(saved.stage);
      }
    };
    init();
    return () => { alive = false; };
  }, [levelNumber]);

  const onKeyPress = (v: string) => {
    if (result !== 'none') return;
    if (v === 'C') { setAnswer(''); return; }
    if (v === 'BK') { setAnswer((p) => p.slice(0, -1)); return; }
    if (answer.length < 4) setAnswer(p => p + v);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const onCheck = async () => {
    const task = levelData.tasks[taskIndex];
    if (answer.trim() !== task.answer) {
      triggerShake();
      return;
    }

    if (taskIndex < 2) {
      const next = taskIndex + 1;
      setTaskIndex(next);
      setStage(next as 0 | 1 | 2);
      setAnswer('');
      await saveLevelProgress(levelNumber, next, next);
    } else {
      const v = await AsyncStorage.getItem(STORAGE_UNLOCKED);
      const current = v ? Number(v) : 1;
      await AsyncStorage.setItem(STORAGE_UNLOCKED, String(Math.max(current, levelNumber + 1)));
      await AsyncStorage.setItem(STORAGE_RESUME_LEVEL, String(levelNumber + 1));
      await clearLevelProgress(levelNumber);
      setResult('win');
      Animated.parallel([
        Animated.timing(dimIn, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(panelIn, { toValue: 1, useNativeDriver: true, bounciness: 8 }),
      ]).start();
    }
  };

  return (
    <ImageBackground 
        source={stage === 0 ? BG_TASK1 : stage === 1 ? BG_TASK2 : BG_TASK3} 
        style={styles.bg}
    >
      <View style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtnWrap}>
            <Image source={BACK_IMG} style={styles.backImg} resizeMode="contain" />
          </Pressable>
          <Text style={[styles.headerTitle, { fontSize: IS_TINY_W ? 18 : 22 }]}>
            {levelData.levelTitle}
          </Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          centerContent={true}
        >
          <Animated.View style={{ 
              opacity: animIn, 
              transform: [{ translateX: shakeX }],
              alignItems: 'center',
              width: '100%'
          }}>
            <View style={styles.card}>
              <Text style={styles.taskTitle}>Task {taskIndex + 1}</Text>
              <View style={styles.gridWrap}>
                {levelData.tasks[taskIndex].grid.map((line: string, i: number) => (
                  <Text key={i} style={styles.gridText}>{line}</Text>
                ))}
              </View>
            </View>

            <Text style={styles.prompt}>{levelData.tasks[taskIndex].prompt}</Text>

            <View style={styles.answerSection}>
               <View style={styles.answerBox}>
                 <Text style={styles.answerText}>{answer || '?'}</Text>
               </View>
               <Pressable style={styles.checkBtn} onPress={onCheck}>
                 <Text style={styles.checkText}>Check</Text>
               </Pressable>
            </View>

            <View style={styles.keyboardContainer}>
                {KEYS.map((k) => (
                    <Pressable 
                        key={k.value} 
                        onPress={() => onKeyPress(k.value)}
                        style={[styles.key, (k.value === 'C' || k.value === 'BK') && styles.keyAction]}
                    >
                        <Text style={styles.keyText}>{k.label}</Text>
                    </Pressable>
                ))}
            </View>
          </Animated.View>
        </ScrollView>
      </View>

      {result === 'win' && (
        <>
          <Animated.View style={[styles.dim, { opacity: dimIn }]} />
          <Animated.View style={[styles.winPanel, { opacity: panelIn, transform: [{ scale: panelIn }] }]}>
            <Text style={styles.winTitle}>Complete!</Text>
            <Image source={FISH_CROWN} style={styles.fishImg} resizeMode="contain" />
            <View style={styles.winBtns}>
                {levelNumber < 15 && (
                  <Pressable 
                    style={styles.winBtn} 
                    onPress={() => navigation.replace('LevelPlay', { 
                        levelNumber: levelNumber + 1,
                        levelId: levelIdFromNumber(levelNumber + 1)
                    })}
                  >
                      <Text style={styles.winBtnText}>Next Level</Text>
                  </Pressable>
                )}
                <Pressable style={styles.winBtnAlt} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.winBtnText}>Menu</Text>
                </Pressable>
            </View>
          </Animated.View>
        </>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safeArea: { flex: 1, paddingTop: H * 0.05 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60 },

  backBtnWrap: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  backImg: { width: '100%', height: '100%' },

  headerTitle: { color: '#fff', fontWeight: '900', textShadowColor: '#000', textShadowRadius: 4, includeFontPadding: false },
  
  scrollContent: { 
    paddingBottom: 40, 
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center' 
  },
  
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    padding: IS_SMALL_H ? 15 : 25,
    width: W * 0.9,
    elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10,
  },
  taskTitle: { textAlign: 'center', color: '#888', fontWeight: 'bold', marginBottom: 10, fontSize: 12, textTransform: 'uppercase' },
  gridWrap: { gap: 8 },
  gridText: { textAlign: 'center', fontWeight: '900', color: '#1B2B55', fontSize: IS_TINY_W ? 18 : 22, letterSpacing: 1.5, includeFontPadding: false },
  
  prompt: { color: '#fff', marginTop: 15, fontWeight: '800', fontSize: IS_TINY_W ? 15 : 18, textAlign: 'center', paddingHorizontal: 20, textShadowColor: '#000', textShadowRadius: 2 },
  
  answerSection: { alignItems: 'center', marginTop: IS_SMALL_H ? 10 : 20, width: '100%' },
  answerBox: { 
    width: 140, height: IS_SMALL_H ? 50 : 60, 
    backgroundColor: '#fff', borderRadius: 15, 
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#395B9B' 
  },
  answerText: { fontSize: 28, fontWeight: '900', color: '#1B2B55', includeFontPadding: false },
  
  checkBtn: { marginTop: 15, backgroundColor: '#395B9B', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 30, elevation: 5 },
  checkText: { color: '#fff', fontWeight: 'bold', fontSize: 18, includeFontPadding: false },

  keyboardContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: IS_TINY_W ? 6 : 10, 
    marginTop: IS_SMALL_H ? 15 : 30, 
    paddingHorizontal: 15 
  },
  key: { 
    width: (W - 80) / 3, 
    height: IS_SMALL_H ? 50 : 60, 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 3 
  },
  keyAction: { backgroundColor: '#B4CDF5' },
  keyText: { fontSize: 22, fontWeight: '900', color: '#1B2B55', includeFontPadding: false },

  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  winPanel: { position: 'absolute', top: '20%', left: '10%', right: '10%', backgroundColor: '#fff', borderRadius: 30, padding: 30, alignItems: 'center', elevation: 20 },
  winTitle: { fontSize: 32, fontWeight: '900', color: '#395B9B', includeFontPadding: false },
  fishImg: { width: 120, height: 120, marginVertical: 15 },
  winBtns: { width: '100%', gap: 10 },
  winBtn: { backgroundColor: '#395B9B', padding: 15, borderRadius: 20, alignItems: 'center' },
  winBtnAlt: { backgroundColor: '#777', padding: 15, borderRadius: 20, alignItems: 'center' },
  winBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, includeFontPadding: false }
});