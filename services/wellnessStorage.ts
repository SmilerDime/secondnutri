import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WellnessData {
  moodScore: number;
  energyLevel: number;
  timestamp: number;
  supportOption?: string | null;
}

const WELLNESS_STORAGE_KEY = 'wellness_data';
const LAST_CHECK_KEY = 'last_wellness_check';

export const saveWellnessData = async (data: WellnessData): Promise<void> => {
  try {
    await AsyncStorage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving wellness data:', error);
    throw error;
  }
};

export const getWellnessData = async (): Promise<WellnessData | null> => {
  try {
    const data = await AsyncStorage.getItem(WELLNESS_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting wellness data:', error);
    return null;
  }
};

export const getTodaysWellness = async (): Promise<WellnessData | null> => {
  try {
    const data = await getWellnessData();
    if (!data) return null;

    const today = new Date();
    const dataDate = new Date(data.timestamp);
    
    // Check if the data is from today
    const isToday = today.toDateString() === dataDate.toDateString();
    
    return isToday ? data : null;
  } catch (error) {
    console.error('Error getting today\'s wellness data:', error);
    return null;
  }
};

export const shouldShowWellnessCheck = async (): Promise<boolean> => {
  try {
    const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
    if (!lastCheck) {
      return true; // First time, show wellness check
    }

    const lastCheckTime = parseInt(lastCheck, 10);
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    // Show wellness check if it's been more than 24 hours
    return (now - lastCheckTime) > oneDayInMs;
  } catch (error) {
    console.error('Error checking wellness status:', error);
    return true; // Default to showing wellness check on error
  }
};

export const clearWellnessData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(WELLNESS_STORAGE_KEY);
    await AsyncStorage.removeItem(LAST_CHECK_KEY);
  } catch (error) {
    console.error('Error clearing wellness data:', error);
    throw error;
  }
};