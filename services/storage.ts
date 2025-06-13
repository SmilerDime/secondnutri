import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'food_history';

interface FoodHistoryItem {
  name: string;
  confidence: number;
  category: string;
  timestamp: number;
  nutritionalInfo?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
}

export async function saveToHistory(foodData: FoodHistoryItem): Promise<void> {
  try {
    const existingHistory = await getHistory();
    const newHistory = [foodData, ...existingHistory].slice(0, 50); // Keep only last 50 items
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

export async function getHistory(): Promise<FoodHistoryItem[]> {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

export async function removeFromHistory(timestamp: number): Promise<void> {
  try {
    const existingHistory = await getHistory();
    const newHistory = existingHistory.filter(item => item.timestamp !== timestamp);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error removing from history:', error);
  }
}