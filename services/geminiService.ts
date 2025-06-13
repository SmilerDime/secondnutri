interface NutritionTip {
  id: string;
  tip: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
}

interface NutritionTipsResponse {
  tips: NutritionTip[];
  generatedAt: number;
  profileHash: string;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function generateNutritionTips(profileData: any): Promise<NutritionTip[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('Gemini API key not configured, returning mock tips');
    return getMockNutritionTips(profileData);
  }

  try {
    // Create a comprehensive profile summary for Gemini
    const profileSummary = createProfileSummary(profileData);
    
    const prompt = `Based on the following user profile, provide exactly 10 personalized nutrition tips. Each tip should be practical, specific, and tailored to this user's needs, goals, and restrictions.

User Profile:
${profileSummary}

Please provide 10 nutrition tips in the following JSON format:
{
  "tips": [
    {
      "tip": "Specific, actionable nutrition advice",
      "category": "one of: hydration, meal-planning, nutrients, portion-control, timing, supplements, cooking, snacks, goals, health",
      "priority": "high, medium, or low based on importance for this user"
    }
  ]
}

Make sure each tip is:
- Specific to their goals, dietary restrictions, and health conditions
- Actionable and practical
- Considers their cooking habits, time constraints, and budget
- Addresses their activity level and lifestyle
- Takes into account any allergies or intolerances
- Relevant to their cultural preferences if specified

Focus on tips that will have the most impact for this specific user profile.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    // Parse the JSON response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    // Add IDs and timestamps to tips
    const tipsWithIds = parsedResponse.tips.map((tip: any, index: number) => ({
      ...tip,
      id: `tip_${Date.now()}_${index}`,
      createdAt: Date.now(),
    }));

    return tipsWithIds;
  } catch (error) {
    console.error('Error generating nutrition tips with Gemini:', error);
    // Fallback to mock tips if API fails
    return getMockNutritionTips(profileData);
  }
}

function createProfileSummary(profileData: any): string {
  const summary = [];
  
  // Demographics
  summary.push(`Demographics: ${profileData.age} years old, ${profileData.gender}, ${profileData.height}, current weight ${profileData.currentWeight}, target weight ${profileData.targetWeight}`);
  
  // Activity and Goals
  summary.push(`Activity Level: ${profileData.activityLevel}`);
  if (profileData.primaryGoals?.length > 0) {
    summary.push(`Primary Goals: ${profileData.primaryGoals.join(', ')}`);
  }
  
  // Health and Allergies
  if (profileData.allergies?.length > 0 && !profileData.allergies.includes('None')) {
    summary.push(`Food Allergies: ${profileData.allergies.join(', ')}`);
  }
  if (profileData.intolerances?.length > 0 && !profileData.intolerances.includes('None')) {
    summary.push(`Food Intolerances: ${profileData.intolerances.join(', ')}`);
  }
  if (profileData.healthConditions?.length > 0 && !profileData.healthConditions.includes('None')) {
    summary.push(`Health Conditions: ${profileData.healthConditions.join(', ')}`);
  }
  
  // Dietary Preferences
  if (profileData.dietaryRestrictions?.length > 0 && !profileData.dietaryRestrictions.includes('No restrictions')) {
    summary.push(`Dietary Restrictions: ${profileData.dietaryRestrictions.join(', ')}`);
  }
  if (profileData.meatPreferences?.length > 0) {
    summary.push(`Meat Preferences: ${profileData.meatPreferences.join(', ')}`);
  }
  if (profileData.dislikedFoods?.length > 0 && !profileData.dislikedFoods.includes('None of the above')) {
    summary.push(`Dislikes: ${profileData.dislikedFoods.join(', ')}`);
  }
  
  // Eating Habits
  summary.push(`Cooking Habits: ${profileData.cookingHabits}`);
  summary.push(`Meal Frequency: ${profileData.mealFrequency}`);
  summary.push(`Daily Water Intake: ${profileData.dailyWaterIntake}`);
  if (profileData.eatingBehaviors?.length > 0 && !profileData.eatingBehaviors.includes('None of the above')) {
    summary.push(`Eating Behaviors: ${profileData.eatingBehaviors.join(', ')}`);
  }
  
  // Lifestyle
  summary.push(`Budget: ${profileData.budget}`);
  summary.push(`Time Constraints: ${profileData.timeConstraints}`);
  if (profileData.culturalPrefs?.length > 0 && !profileData.culturalPrefs.includes('No specific preference')) {
    summary.push(`Cultural Preferences: ${profileData.culturalPrefs.join(', ')}`);
  }
  if (profileData.specialConsiderations?.length > 0 && !profileData.specialConsiderations.includes('None')) {
    summary.push(`Special Considerations: ${profileData.specialConsiderations.join(', ')}`);
  }
  
  return summary.join('\n');
}

function getMockNutritionTips(profileData: any): NutritionTip[] {
  // Generate contextual mock tips based on profile data
  const tips: NutritionTip[] = [];
  
  // Base tips that apply to most users
  tips.push({
    id: `tip_${Date.now()}_1`,
    tip: "Start your day with a protein-rich breakfast to maintain stable blood sugar levels and reduce cravings throughout the day.",
    category: "meal-planning",
    priority: "high",
    createdAt: Date.now(),
  });

  // Activity-based tips
  if (profileData.activityLevel?.includes('Sedentary')) {
    tips.push({
      id: `tip_${Date.now()}_2`,
      tip: "Focus on smaller, more frequent meals to boost metabolism and maintain energy levels during desk work.",
      category: "timing",
      priority: "high",
      createdAt: Date.now(),
    });
  } else if (profileData.activityLevel?.includes('Very active') || profileData.activityLevel?.includes('Extremely active')) {
    tips.push({
      id: `tip_${Date.now()}_2`,
      tip: "Consume a combination of carbs and protein within 30 minutes after intense workouts to optimize recovery.",
      category: "timing",
      priority: "high",
      createdAt: Date.now(),
    });
  }

  // Goal-based tips
  if (profileData.primaryGoals?.includes('Weight loss')) {
    tips.push({
      id: `tip_${Date.now()}_3`,
      tip: "Fill half your plate with non-starchy vegetables to increase fiber intake and promote satiety while managing calories.",
      category: "portion-control",
      priority: "high",
      createdAt: Date.now(),
    });
  } else if (profileData.primaryGoals?.includes('Weight gain/muscle building')) {
    tips.push({
      id: `tip_${Date.now()}_3`,
      tip: "Add healthy calorie-dense foods like nuts, avocados, and olive oil to increase your daily caloric intake.",
      category: "nutrients",
      priority: "high",
      createdAt: Date.now(),
    });
  }

  // Water intake tips
  if (profileData.dailyWaterIntake === 'Less than 1L') {
    tips.push({
      id: `tip_${Date.now()}_4`,
      tip: "Gradually increase your water intake by drinking a glass of water before each meal and snack.",
      category: "hydration",
      priority: "high",
      createdAt: Date.now(),
    });
  }

  // Cooking habit tips
  if (profileData.cookingHabits?.includes("I don't cook") || profileData.cookingHabits?.includes("I rarely cook")) {
    tips.push({
      id: `tip_${Date.now()}_5`,
      tip: "Start with simple no-cook meals like Greek yogurt with berries, or pre-made salads with added protein.",
      category: "cooking",
      priority: "medium",
      createdAt: Date.now(),
    });
  }

  // Budget-conscious tips
  if (profileData.budget?.includes('Very limited')) {
    tips.push({
      id: `tip_${Date.now()}_6`,
      tip: "Buy dried beans, lentils, and whole grains in bulk - they're nutritious, filling, and cost-effective protein sources.",
      category: "meal-planning",
      priority: "medium",
      createdAt: Date.now(),
    });
  }

  // Time constraint tips
  if (profileData.timeConstraints?.includes('Less than 15 minutes')) {
    tips.push({
      id: `tip_${Date.now()}_7`,
      tip: "Prepare overnight oats or chia puddings for quick, nutritious breakfasts that require no morning prep time.",
      category: "meal-planning",
      priority: "medium",
      createdAt: Date.now(),
    });
  }

  // Health condition tips
  if (profileData.healthConditions?.includes('Diabetes')) {
    tips.push({
      id: `tip_${Date.now()}_8`,
      tip: "Pair carbohydrates with protein or healthy fats to slow glucose absorption and maintain stable blood sugar.",
      category: "health",
      priority: "high",
      createdAt: Date.now(),
    });
  }

  // Fill remaining slots with general tips
  const generalTips = [
    {
      tip: "Include a variety of colorful fruits and vegetables to ensure you're getting a wide range of vitamins and antioxidants.",
      category: "nutrients",
      priority: "medium",
    },
    {
      tip: "Practice mindful eating by chewing slowly and paying attention to hunger and fullness cues.",
      category: "goals",
      priority: "medium",
    },
    {
      tip: "Plan your meals and snacks in advance to avoid impulsive food choices and ensure balanced nutrition.",
      category: "meal-planning",
      priority: "medium",
    },
  ];

  generalTips.forEach((tip, index) => {
    if (tips.length < 10) {
      tips.push({
        id: `tip_${Date.now()}_${tips.length + 1}`,
        tip: tip.tip,
        category: tip.category,
        priority: tip.priority as 'high' | 'medium' | 'low',
        createdAt: Date.now(),
      });
    }
  });

  return tips.slice(0, 10);
}

// Helper function to create a hash of profile data to detect changes
export function createProfileHash(profileData: any): string {
  const relevantData = {
    age: profileData.age,
    gender: profileData.gender,
    activityLevel: profileData.activityLevel,
    primaryGoals: profileData.primaryGoals,
    allergies: profileData.allergies,
    healthConditions: profileData.healthConditions,
    dietaryRestrictions: profileData.dietaryRestrictions,
    cookingHabits: profileData.cookingHabits,
    budget: profileData.budget,
    timeConstraints: profileData.timeConstraints,
  };
  
  return btoa(JSON.stringify(relevantData));
}