import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Recipe {
  id: string;
  name: string;
  rating: number; // 1-5 stars
  imageUrl?: string;
  dateAdded: number; // timestamp
}

const RECIPES_STORAGE_KEY = 'discovered_recipes';

export const saveRecipe = async (recipe: Recipe): Promise<void> => {
  try {
    const existingRecipes = await getRecipes();
    const updatedRecipes = [recipe, ...existingRecipes];
    await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
};

export const getRecipes = async (): Promise<Recipe[]> => {
  try {
    const recipesJson = await AsyncStorage.getItem(RECIPES_STORAGE_KEY);
    if (!recipesJson) return [];
    
    const recipes = JSON.parse(recipesJson);
    // Sort by date added (newest first)
    return recipes.sort((a: Recipe, b: Recipe) => b.dateAdded - a.dateAdded);
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
};

export const deleteRecipe = async (recipeId: string): Promise<void> => {
  try {
    const existingRecipes = await getRecipes();
    const updatedRecipes = existingRecipes.filter(recipe => recipe.id !== recipeId);
    await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

export const updateRecipe = async (updatedRecipe: Recipe): Promise<void> => {
  try {
    const existingRecipes = await getRecipes();
    const updatedRecipes = existingRecipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    );
    await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

export const getRecipeById = async (recipeId: string): Promise<Recipe | null> => {
  try {
    const recipes = await getRecipes();
    return recipes.find(recipe => recipe.id === recipeId) || null;
  } catch (error) {
    console.error('Error getting recipe by ID:', error);
    return null;
  }
};

export const getRecipesByRating = async (minRating: number): Promise<Recipe[]> => {
  try {
    const recipes = await getRecipes();
    return recipes.filter(recipe => recipe.rating >= minRating);
  } catch (error) {
    console.error('Error getting recipes by rating:', error);
    return [];
  }
};

export const clearAllRecipes = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(RECIPES_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recipes:', error);
    throw error;
  }
};