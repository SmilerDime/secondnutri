import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Modal,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  BookOpen, 
  Plus, 
  Star, 
  Calendar, 
  Camera, 
  X, 
  ChevronLeft,
  Upload,
  Check,
  Clock,
  ChefHat
} from 'lucide-react-native';
import { saveRecipe, getRecipes, Recipe } from '@/services/recipesStorage';

const { width } = Dimensions.get('window');

export default function RecipesDiscoveredScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [recipeName, setRecipeName] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRecipes();
    
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadRecipes = async () => {
    try {
      const savedRecipes = await getRecipes();
      setRecipes(savedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecipe = () => {
    setShowAddModal(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowAddModal(false);
      // Reset form
      setRecipeName('');
      setRating(0);
      setSelectedImage(null);
    });
  };

  const handleImageUpload = () => {
    // In a real app, this would open image picker
    // For demo purposes, we'll use a placeholder image
    const placeholderImages = [
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400',
    ];
    
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    setSelectedImage(randomImage);
  };

  const handleSubmitRecipe = async () => {
    if (!recipeName.trim() || rating === 0) {
      Alert.alert('Missing Information', 'Please enter a recipe name and rating.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        name: recipeName.trim(),
        rating,
        imageUrl: selectedImage,
        dateAdded: Date.now(),
      };

      await saveRecipe(newRecipe);
      await loadRecipes(); // Reload recipes
      handleCloseModal();
      
      Alert.alert('Success', 'Recipe added successfully!');
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    size = 24, 
    interactive = false 
  }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: number;
    interactive?: boolean;
  }) => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => interactive && onRatingChange?.(star)}
          disabled={!interactive}
          activeOpacity={interactive ? 0.7 : 1}
        >
          <Star
            size={size}
            color={star <= rating ? '#F59E0B' : '#E5E7EB'}
            fill={star <= rating ? '#F59E0B' : 'transparent'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Animated.View 
      style={[
        styles.recipeCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.recipeImageContainer}>
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <ChefHat size={32} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.ratingOverlay}>
          <StarRating rating={recipe.rating} size={16} />
        </View>
      </View>
      
      <View style={styles.recipeContent}>
        <Text style={styles.recipeName}>{recipe.name}</Text>
        
        <View style={styles.recipeMetadata}>
          <View style={styles.metadataItem}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.metadataText}>{formatDate(recipe.dateAdded)}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.metadataText}>{formatTime(recipe.dateAdded)}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const EmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.emptyIcon}>
        <BookOpen size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No Recipes Discovered Yet</Text>
      <Text style={styles.emptyText}>
        Start adding your favorite AI-generated recipes and rate them to build your personal collection
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddRecipe}>
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Add Your First Recipe</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Recipes Discovered</Text>
          <Text style={styles.headerSubtitle}>{recipes.length} recipes saved</Text>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          recipes.length === 0 && styles.emptyScrollContent
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) : recipes.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={styles.recipesGrid}>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Recipe Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                opacity: modalAnim,
                transform: [{
                  scale: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  })
                }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Recipe</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Recipe Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recipe Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={recipeName}
                  onChangeText={setRecipeName}
                  placeholder="Enter recipe name..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Rating */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Rating</Text>
                <View style={styles.ratingContainer}>
                  <StarRating 
                    rating={rating} 
                    onRatingChange={setRating} 
                    size={32} 
                    interactive 
                  />
                  <Text style={styles.ratingText}>
                    {rating > 0 ? `${rating}/5 stars` : 'Tap to rate'}
                  </Text>
                </View>
              </View>

              {/* Image Upload */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recipe Image (Optional)</Text>
                {selectedImage ? (
                  <View style={styles.selectedImageContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => setSelectedImage(null)}
                    >
                      <X size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                    <Upload size={24} color="#6B7280" />
                    <Text style={styles.uploadText}>Upload Image</Text>
                    <Text style={styles.uploadSubtext}>
                      {Platform.OS === 'web' ? 'Click to select' : 'Tap to select from gallery'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCloseModal}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  (!recipeName.trim() || rating === 0 || isSubmitting) && styles.saveButtonDisabled
                ]} 
                onPress={handleSubmitRecipe}
                disabled={!recipeName.trim() || rating === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <Text style={styles.saveButtonText}>Saving...</Text>
                ) : (
                  <>
                    <Check size={16} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Recipe</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyScrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  recipeCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  recipeImageContainer: {
    position: 'relative',
    height: 120,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipeContent: {
    padding: 12,
  },
  recipeName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 18,
  },
  recipeMetadata: {
    gap: 4,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  ratingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  uploadButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  uploadSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  selectedImageContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#10B981',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});