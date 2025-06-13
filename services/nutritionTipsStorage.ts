import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateNutritionTips, createProfileHash } from './geminiService';
import { getProfileData } from './profileStorage';

const NUTRITION_TIPS_KEY = 'nutrition_tips_data';
const TIPS_REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface NutritionTip {
  id: string;
  tip: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
}

interface StoredNutritionTips {
  tips: NutritionTip[];
  generatedAt: number;
  profileHash: string;
  lastShownIndex: number;
}

export async function getNutritionTips(): Promise<NutritionTip[]> {
  try {
    const stored = await getStoredTips();
    const profile = await getProfileData();
    
    if (!profile || !profile.isComplete) {
      return [];
    }

    const currentProfileHash = createProfileHash(profile);
    const now = Date.now();
    
    // Check if we need to refresh tips
    const needsRefresh = !stored || 
                        stored.profileHash !== currentProfileHash ||
                        (now - stored.generatedAt) > TIPS_REFRESH_INTERVAL ||
                        stored.tips.length === 0;

    if (needsRefresh) {
      console.log('Generating new nutrition tips...');
      const newTips = await generateNutritionTips(profile);
      
      const newStoredTips: StoredNutritionTips = {
        tips: newTips,
        generatedAt: now,
        profileHash: currentProfileHash,
        lastShownIndex: 0,
      };
      
      await AsyncStorage.setItem(NUTRITION_TIPS_KEY, JSON.stringify(newStoredTips));
      return newTips;
    }

    return stored.tips;
  } catch (error) {
    console.error('Error getting nutrition tips:', error);
    return [];
  }
}

export async function getCurrentNutritionTip(): Promise<NutritionTip | null> {
  try {
    const stored = await getStoredTips();
    if (!stored || stored.tips.length === 0) {
      const tips = await getNutritionTips();
      if (tips.length === 0) return null;
      
      // Get the updated stored tips after generation
      const updatedStored = await getStoredTips();
      if (!updatedStored) return tips[0];
      
      return updatedStored.tips[0];
    }

    // Return the current tip based on lastShownIndex
    const currentIndex = stored.lastShownIndex % stored.tips.length;
    return stored.tips[currentIndex];
  } catch (error) {
    console.error('Error getting current nutrition tip:', error);
    return null;
  }
}

export async function getNextNutritionTip(): Promise<NutritionTip | null> {
  try {
    const stored = await getStoredTips();
    if (!stored || stored.tips.length === 0) {
      return await getCurrentNutritionTip();
    }

    // Move to next tip
    const nextIndex = (stored.lastShownIndex + 1) % stored.tips.length;
    
    const updatedStored: StoredNutritionTips = {
      ...stored,
      lastShownIndex: nextIndex,
    };
    
    await AsyncStorage.setItem(NUTRITION_TIPS_KEY, JSON.stringify(updatedStored));
    
    return stored.tips[nextIndex];
  } catch (error) {
    console.error('Error getting next nutrition tip:', error);
    return null;
  }
}

export async function refreshNutritionTips(): Promise<NutritionTip[]> {
  try {
    const profile = await getProfileData();
    if (!profile || !profile.isComplete) {
      return [];
    }

    console.log('Force refreshing nutrition tips...');
    const newTips = await generateNutritionTips(profile);
    const currentProfileHash = createProfileHash(profile);
    
    const newStoredTips: StoredNutritionTips = {
      tips: newTips,
      generatedAt: Date.now(),
      profileHash: currentProfileHash,
      lastShownIndex: 0,
    };
    
    await AsyncStorage.setItem(NUTRITION_TIPS_KEY, JSON.stringify(newStoredTips));
    return newTips;
  } catch (error) {
    console.error('Error refreshing nutrition tips:', error);
    return [];
  }
}

export async function clearNutritionTips(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NUTRITION_TIPS_KEY);
  } catch (error) {
    console.error('Error clearing nutrition tips:', error);
  }
}

async function getStoredTips(): Promise<StoredNutritionTips | null> {
  try {
    const stored = await AsyncStorage.getItem(NUTRITION_TIPS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting stored tips:', error);
    return null;
  }
}

// Helper function to get tips by category
export async function getTipsByCategory(category: string): Promise<NutritionTip[]> {
  try {
    const allTips = await getNutritionTips();
    return allTips.filter(tip => tip.category === category);
  } catch (error) {
    console.error('Error getting tips by category:', error);
    return [];
  }
}

// Helper function to get tips by priority
export async function getTipsByPriority(priority: 'high' | 'medium' | 'low'): Promise<NutritionTip[]> {
  try {
    const allTips = await getNutritionTips();
    return allTips.filter(tip => tip.priority === priority);
  } catch (error) {
    console.error('Error getting tips by priority:', error);
    return [];
  }
}