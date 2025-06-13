import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, Award, Tag, Clock, Zap, Beef, Wheat, Droplets } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FoodResultProps {
  result: {
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
  };
  onClose: () => void;
}

export function FoodResult({ result, onClose }: FoodResultProps) {
  const confidencePercentage = Math.round(result.confidence * 100);
  const confidenceColor = confidencePercentage >= 80 ? '#10B981' : 
                         confidencePercentage >= 60 ? '#F59E0B' : '#EF4444';

  const NutritionItem = ({ 
    icon: Icon, 
    label, 
    value, 
    color 
  }: { 
    icon: any; 
    label: string; 
    value: string; 
    color: string; 
  }) => (
    <View style={styles.nutritionItem}>
      <View style={[styles.nutritionIcon, { backgroundColor: `${color}20` }]}>
        <Icon size={16} color={color} />
      </View>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={styles.nutritionValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.categoryBadge, { backgroundColor: `${confidenceColor}20` }]}>
              <Tag size={14} color={confidenceColor} />
              <Text style={[styles.categoryText, { color: confidenceColor }]}>
                {result.category}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleSection}>
            <Text style={styles.foodName}>{result.name}</Text>
            <View style={styles.confidenceContainer}>
              <Award size={20} color={confidenceColor} />
              <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                {confidencePercentage}% confident
              </Text>
            </View>
          </View>

          <View style={styles.timestampContainer}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.timestampText}>
              Identified {new Date(result.timestamp).toLocaleString()}
            </Text>
          </View>

          {result.nutritionalInfo && (
            <View style={styles.nutritionSection}>
              <Text style={styles.sectionTitle}>Nutritional Information</Text>
              <View style={styles.nutritionGrid}>
                <NutritionItem
                  icon={Zap}
                  label="Calories"
                  value={result.nutritionalInfo.calories || 'N/A'}
                  color="#F59E0B"
                />
                <NutritionItem
                  icon={Beef}
                  label="Protein"
                  value={result.nutritionalInfo.protein || 'N/A'}
                  color="#EF4444"
                />
                <NutritionItem
                  icon={Wheat}
                  label="Carbs"
                  value={result.nutritionalInfo.carbs || 'N/A'}
                  color="#8B5CF6"
                />
                <NutritionItem
                  icon={Droplets}
                  label="Fat"
                  value={result.nutritionalInfo.fat || 'N/A'}
                  color="#06B6D4"
                />
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Powered by Google Vision AI
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleSection: {
    marginBottom: 16,
  },
  foodName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timestampText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 8,
  },
  nutritionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  nutritionGrid: {
    gap: 12,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  nutritionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nutritionLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  nutritionValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});