import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import LoaderScreen from '../screens/LoaderScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomePageScreen from '../screens/HomePageScreen';

import LevelsScreen from '../screens/LevelsScreen';
import LevelPlayScreen from '../screens/LevelPlayScreen';

import CrownfishScreen from '../screens/CrownfishScreen';
import FishFactsScreen from '../screens/FishFactsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Loader"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Loader" component={LoaderScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomePageScreen} />
        <Stack.Screen name="Levels" component={LevelsScreen} />
        <Stack.Screen name="LevelPlay" component={LevelPlayScreen} />
        <Stack.Screen name="Crownfish" component={CrownfishScreen} />
        <Stack.Screen name="FishFacts" component={FishFactsScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
