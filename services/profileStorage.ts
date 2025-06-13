import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateNutritionTips } from './geminiService';
import { refreshNutritionTips } from './nutritionTipsStorage';

const PROFILE_KEY = 'user_profile_data';

export interface ProfileData {
  // Demographics
  age: string;
  gender: string;
  height: string;
  currentWeight: string;
  targetWeight: string;
  
  // Activity & Goals
  activityLevel: string;
  primaryGoals: string[];
  
  // Allergies & Intolerances
  allergies: string[];
  intolerances: string[];
  
  // Dietary Preferences
  dietaryRestrictions: string[];
  meatPreferences: string[];
  seafoodPreferences: string[];
  dislikedFoods: string[];
  
  // Eating Habits
  cookingHabits: string;
  mealFrequency: string;
  hydrationPrefs: string[];
  dailyWaterIntake: string;
  
  // Health & Medical
  healthConditions: string[];
  medications: string[];
  eatingBehaviors: string[];
  
  // Lifestyle
  budget: string;
  timeConstraints: string;
  culturalPrefs: string[];
  specialConsiderations: string[];
  
  // Metadata
  completedAt: number;
  isComplete: boolean;
}

export async function saveProfileData(profileData: ProfileData): Promise<void> {
  try {
    // Check if profile has essential data to be considered complete
    const isProfileComplete = checkProfileCompleteness(profileData);
    
    const dataToSave = {
      ...profileData,
      completedAt: Date.now(),
      isComplete: isProfileComplete,
    };
    
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(dataToSave));
    
    // If profile is complete, generate nutrition tips
    if (isProfileComplete) {
      try {
        console.log('Profile completed, generating nutrition tips...');
        await refreshNutritionTips();
      } catch (error) {
        console.error('Error generating nutrition tips after profile completion:', error);
        // Don't throw here as profile save was successful
      }
    }
  } catch (error) {
    console.error('Error saving profile data:', error);
    throw error;
  }
}

export async function getProfileData(): Promise<ProfileData | null> {
  try {
    const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
    return profileJson ? JSON.parse(profileJson) : null;
  } catch (error) {
    console.error('Error getting profile data:', error);
    return null;
  }
}

export async function clearProfileData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing profile data:', error);
  }
}

export async function isProfileComplete(): Promise<boolean> {
  try {
    const profile = await getProfileData();
    if (!profile) return false;
    
    return checkProfileCompleteness(profile);
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
}

// Helper function to check if profile has essential data
function checkProfileCompleteness(profile: ProfileData): boolean {
  // Check essential fields that must be filled
  const essentialFields = [
    profile.age,
    profile.gender,
    profile.height,
    profile.currentWeight,
    profile.activityLevel,
    profile.cookingHabits,
    profile.mealFrequency,
    profile.dailyWaterIntake,
    profile.budget,
    profile.timeConstraints
  ];

  // All essential fields must be filled
  const hasEssentialData = essentialFields.every(field => field && field.trim() !== '');
  
  // At least one goal should be selected
  const hasGoals = profile.primaryGoals && profile.primaryGoals.length > 0;
  
  return hasEssentialData && hasGoals;
}

// Helper function to get profile summary for dashboard
export function getProfileSummary(profile: ProfileData): {
  demographics: string;
  goals: string;
  dietary: string;
  health: string;
} {
  const demographics = `${profile.age} • ${profile.gender} • ${profile.height} • ${profile.currentWeight}`;
  
  const goals = profile.primaryGoals.length > 0 
    ? profile.primaryGoals.slice(0, 2).join(', ') + (profile.primaryGoals.length > 2 ? '...' : '')
    : 'No goals specified';
    
  const dietary = profile.dietaryRestrictions.length > 0
    ? profile.dietaryRestrictions.slice(0, 2).join(', ') + (profile.dietaryRestrictions.length > 2 ? '...' : '')
    : 'No restrictions';
    
  const health = profile.allergies.length > 0 || profile.healthConditions.length > 0
    ? [...profile.allergies, ...profile.healthConditions].slice(0, 2).join(', ') + 
      ([...profile.allergies, ...profile.healthConditions].length > 2 ? '...' : '')
    : 'No conditions reported';
    
  return { demographics, goals, dietary, health };
}