interface VisionApiResponse {
  responses: Array<{
    labelAnnotations?: Array<{
      description: string;
      score: number;
      topicality: number;
    }>;
    textAnnotations?: Array<{
      description: string;
    }>;
  }>;
}

interface FoodData {
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

const FOOD_KEYWORDS = [
  'food', 'dish', 'meal', 'cuisine', 'ingredient', 'vegetable', 'fruit', 
  'meat', 'bread', 'pasta', 'rice', 'chicken', 'beef', 'fish', 'seafood',
  'pizza', 'burger', 'sandwich', 'salad', 'soup', 'dessert', 'cake',
  'cookie', 'pastry', 'breakfast', 'lunch', 'dinner', 'snack', 'beverage',
  'drink', 'coffee', 'tea', 'juice', 'dairy', 'cheese', 'egg', 'nut',
  'seed', 'grain', 'cereal', 'sauce', 'spice', 'herb', 'oil', 'butter'
];

const NUTRITIONAL_DATA: { [key: string]: any } = {
  'apple': { calories: '52 per 100g', protein: '0.3g', carbs: '14g', fat: '0.2g' },
  'banana': { calories: '89 per 100g', protein: '1.1g', carbs: '23g', fat: '0.3g' },
  'orange': { calories: '47 per 100g', protein: '0.9g', carbs: '12g', fat: '0.1g' },
  'bread': { calories: '265 per 100g', protein: '9g', carbs: '49g', fat: '3.2g' },
  'rice': { calories: '130 per 100g', protein: '2.7g', carbs: '28g', fat: '0.3g' },
  'chicken': { calories: '239 per 100g', protein: '27g', carbs: '0g', fat: '14g' },
  'beef': { calories: '250 per 100g', protein: '26g', carbs: '0g', fat: '15g' },
  'fish': { calories: '206 per 100g', protein: '22g', carbs: '0g', fat: '12g' },
  'pasta': { calories: '131 per 100g', protein: '5g', carbs: '25g', fat: '1.1g' },
  'pizza': { calories: '266 per 100g', protein: '11g', carbs: '33g', fat: '10g' },
  'salad': { calories: '20 per 100g', protein: '1.4g', carbs: '4g', fat: '0.2g' },
  'egg': { calories: '155 per 100g', protein: '13g', carbs: '1.1g', fat: '11g' },
  'cheese': { calories: '402 per 100g', protein: '25g', carbs: '1.3g', fat: '33g' },
};

function isFoodRelated(labels: Array<{ description: string; score: number }>): boolean {
  return labels.some(label => {
    const description = label.description.toLowerCase();
    return FOOD_KEYWORDS.some(keyword => description.includes(keyword)) && label.score > 0.5;
  });
}

function getBestFoodLabel(labels: Array<{ description: string; score: number }>): { description: string; score: number } | null {
  const foodLabels = labels.filter(label => {
    const description = label.description.toLowerCase();
    return FOOD_KEYWORDS.some(keyword => description.includes(keyword));
  });

  if (foodLabels.length === 0) return null;

  return foodLabels.reduce((best, current) => 
    current.score > best.score ? current : best
  );
}

function categorizeFood(foodName: string): string {
  const name = foodName.toLowerCase();
  
  if (['apple', 'banana', 'orange', 'grape', 'berry', 'fruit'].some(f => name.includes(f))) {
    return 'Fruit';
  }
  if (['vegetable', 'carrot', 'broccoli', 'lettuce', 'tomato', 'salad'].some(v => name.includes(v))) {
    return 'Vegetable';
  }
  if (['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood'].some(m => name.includes(m))) {
    return 'Protein';
  }
  if (['bread', 'pasta', 'rice', 'grain', 'cereal'].some(g => name.includes(g))) {
    return 'Grain';
  }
  if (['cake', 'cookie', 'dessert', 'pastry', 'sweet'].some(d => name.includes(d))) {
    return 'Dessert';
  }
  if (['drink', 'beverage', 'juice', 'coffee', 'tea'].some(b => name.includes(b))) {
    return 'Beverage';
  }
  
  return 'Food';
}

function getNutritionalInfo(foodName: string): any {
  const name = foodName.toLowerCase();
  
  for (const [key, value] of Object.entries(NUTRITIONAL_DATA)) {
    if (name.includes(key)) {
      return value;
    }
  }
  
  return {
    calories: 'N/A',
    protein: 'N/A',
    carbs: 'N/A',
    fat: 'N/A'
  };
}

export async function identifyFood(base64Image: string): Promise<FoodData | null> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY;
  
  if (!apiKey || apiKey === 'your_google_vision_api_key_here') {
    console.warn('Google Vision API key not configured');
    // Return mock data for demo purposes
    return {
      name: 'Demo Food Item',
      confidence: 0.95,
      category: 'Food',
      timestamp: Date.now(),
      nutritionalInfo: {
        calories: '150 per serving',
        protein: '5g',
        carbs: '25g',
        fat: '3g'
      }
    };
  }

  try {
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 20,
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: VisionApiResponse = await response.json();
    const labels = data.responses[0]?.labelAnnotations || [];

    if (!isFoodRelated(labels)) {
      return null;
    }

    const bestFoodLabel = getBestFoodLabel(labels);
    if (!bestFoodLabel) {
      return null;
    }

    const foodData: FoodData = {
      name: bestFoodLabel.description,
      confidence: Math.round(bestFoodLabel.score * 100) / 100,
      category: categorizeFood(bestFoodLabel.description),
      timestamp: Date.now(),
      nutritionalInfo: getNutritionalInfo(bestFoodLabel.description),
    };

    return foodData;
  } catch (error) {
    console.error('Error calling Google Vision API:', error);
    throw error;
  }
}