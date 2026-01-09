import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  useWindowDimensions,
  AppState,
  AppStateStatus,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

const BG = require('../assets/background.png');
const LOGO = require('../assets/logo.png');

type Phase = 'web' | 'logo';

export default function LoaderScreen({ navigation }: Props) {
  const { width: W, height: H } = useWindowDimensions();

  const IS_SMALL = H < 750 || W < 360;
  const IS_TINY = H < 690 || W < 350;
  const IS_VERY_TINY = H < 640 || W < 330;

  const webSize = IS_VERY_TINY ? 190 : IS_TINY ? 215 : IS_SMALL ? 240 : 260;
  const logoSize = IS_VERY_TINY ? 185 : IS_TINY ? 205 : IS_SMALL ? 225 : 240;
  const centerOffsetY = IS_VERY_TINY ? -10 : IS_TINY ? -8 : 0;

  const [phase, setPhase] = useState<Phase>('web');
  const [webFailed, setWebFailed] = useState(false);

  const didNavigateRef = useRef(false);

  const goNext = useCallback(() => {
    if (didNavigateRef.current) return;
    didNavigateRef.current = true;
    navigation.replace('Onboarding');
  }, [navigation]);

  const html = useMemo(
    () => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
<style>
html,body{margin:0;padding:0;background:transparent;width:100%;height:100%;overflow:hidden}
:root{--c:rgb(71,195,248)}
.wrap{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:140px;height:140px}
.snow{position:relative;width:100%;height:100%;animation:spin 1.35s linear infinite;filter:drop-shadow(0 0 14px var(--c))}
.pulse{position:absolute;inset:0;animation:pulse 1.2s ease-in-out infinite}
.bar{position:absolute;left:50%;top:50%;width:12px;height:56px;background:var(--c);border-radius:14px;transform-origin:center;transform:translate(-50%,-50%)}
.r0{transform:translate(-50%,-50%) rotate(0deg)} .r22{transform:translate(-50%,-50%) rotate(22.5deg)}
.r45{transform:translate(-50%,-50%) rotate(45deg)} .r67{transform:translate(-50%,-50%) rotate(67.5deg)}
.r90{transform:translate(-50%,-50%) rotate(90deg)} .r112{transform:translate(-50%,-50%) rotate(112.5deg)}
.r135{transform:translate(-50%,-50%) rotate(135deg)} .r157{transform:translate(-50%,-50%) rotate(157.5deg)}
.cap{position:absolute;left:50%;top:50%;width:10px;height:10px;background:var(--c);border-radius:999px;transform:translate(-50%,-50%);box-shadow:0 0 10px rgba(71,195,248,.55)}
.c0{transform:translate(-50%,-50%) translateY(-36px)}
.c22{transform:translate(-50%,-50%) rotate(22.5deg) translateY(-36px)}
.c45{transform:translate(-50%,-50%) rotate(45deg) translateY(-36px)}
.c67{transform:translate(-50%,-50%) rotate(67.5deg) translateY(-36px)}
.c90{transform:translate(-50%,-50%) rotate(90deg) translateY(-36px)}
.c112{transform:translate(-50%,-50%) rotate(112.5deg) translateY(-36px)}
.c135{transform:translate(-50%,-50%) rotate(135deg) translateY(-36px)}
.c157{transform:translate(-50%,-50%) rotate(157.5deg) translateY(-36px)}
@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
@keyframes pulse{0%{transform:scale(.96);opacity:.85}50%{transform:scale(1.04);opacity:1}100%{transform:scale(.96);opacity:.85}}
</style></head><body>
<div class="wrap"><div class="snow"><div class="pulse">
<span class="bar r0"></span><span class="bar r22"></span><span class="bar r45"></span><span class="bar r67"></span>
<span class="bar r90"></span><span class="bar r112"></span><span class="bar r135"></span><span class="bar r157"></span>
<span class="cap c0"></span><span class="cap c22"></span><span class="cap c45"></span><span class="cap c67"></span>
<span class="cap c90"></span><span class="cap c112"></span><span class="cap c135"></span><span class="cap c157"></span>
</div></div></div></body></html>`,
    []
  );

  useEffect(() => {
    didNavigateRef.current = false;
    const tLogo = setTimeout(() => setPhase('logo'), 3000);
    const tNext = setTimeout(goNext, 6000);
    const tHard = setTimeout(goNext, 8500);

    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (s === 'active') {
        setTimeout(goNext, 350);
      }
    });

    return () => {
      clearTimeout(tLogo);
      clearTimeout(tNext);
      clearTimeout(tHard);
      sub.remove();
    };
  }, [goNext]);

  const showWeb = phase === 'web' && !webFailed;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.center, { transform: [{ translateY: centerOffsetY }] }]}>
        {showWeb ? (
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            style={[styles.web, { width: webSize, height: webSize }]}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            javaScriptEnabled
            domStorageEnabled
            onError={() => {
              setWebFailed(true);
              setPhase('logo');
            }}
            onHttpError={() => {
              setWebFailed(true);
              setPhase('logo');
            }}
            onContentProcessDidTerminate={() => {
              setWebFailed(true);
              setPhase('logo');
            }}
            androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
          />
        ) : (
          <Image
            source={LOGO}
            style={{ width: logoSize, height: logoSize, borderRadius: 50 }}
            resizeMode="cover"
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  web: { backgroundColor: 'transparent' },
});
