import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Zap, ChevronRight, Smile, Sun, Wind, MessageCircle, BookOpen, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { saveWellnessData, shouldShowWellnessCheck } from '@/services/wellnessStorage';

const { width, height } = Dimensions.get('window');

const MOOD_LABELS = [
  { value: 1, label: 'Terrible', emoji: '😢', color: '#DC2626' },
  { value: 2, label: 'Bad', emoji: '😞', color: '#EA580C' },
  { value: 3, label: 'Poor', emoji: '😕', color: '#D97706' },
  { value: 4, label: 'Below Average', emoji: '😐', color: '#CA8A04' },
  { value: 5, label: 'Okay', emoji: '😊', color: '#65A30D' },
  { value: 6, label: 'Good', emoji: '😌', color: '#16A34A' },
  { value: 7, label: 'Great', emoji: '😄', color: '#059669' },
  { value: 8, label: 'Very Good', emoji: '😁', color: '#0891B2' },
  { value: 9, label: 'Excellent', emoji: '🤩', color: '#7C3AED' },
  { value: 10, label: 'Amazing', emoji: '🥳', color: '#C026D3' },
];

const ENERGY_LABELS = [
  { value: 1, label: 'Exhausted', emoji: '😴', color: '#DC2626' },
  { value: 2, label: 'Drained', emoji: '😪', color: '#EA580C' },
  { value: 3, label: 'Tired', emoji: '😫', color: '#D97706' },
  { value: 4, label: 'Low', emoji: '😔', color: '#CA8A04' },
  { value: 5, label: 'Moderate', emoji: '😐', color: '#65A30D' },
  { value: 6, label: 'Decent', emoji: '🙂', color: '#16A34A' },
  { value: 7, label: 'Good', emoji: '😊', color: '#059669' },
  { value: 8, label: 'High', emoji: '😃', color: '#0891B2' },
  { value: 9, label: 'Very High', emoji: '⚡', color: '#7C3AED' },
  { value: 10, label: 'Energized', emoji: '🔥', color: '#C026D3' },
];

const SUPPORT_OPTIONS = [
  { id: 'breathing', title: 'Breathing Exercise', icon: Wind, color: '#06B6D4' },
  { id: 'meditation', title: 'Quick Meditation', icon: Heart, color: '#8B5CF6' },
  { id: 'resources', title: 'Wellness Resources', icon: BookOpen, color: '#EC4899' },
];

export default function WellnessQuestionnaireScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [moodScore, setMoodScore] = useState<number>(0);
  const [energyLevel, setEnergyLevel] = useState<number>(0);
  const [selectedSupport, setSelectedSupport] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Update progress - now only 2 steps max
    const totalSteps = (moodScore < 5 || energyLevel < 5) && (moodScore > 0 && energyLevel > 0) ? 2 : 1;
    Animated.timing(progressAnim, {
      toValue: currentStep / (totalSteps - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, moodScore, energyLevel]);

  const animateToNextStep = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(currentStep + 1);
      slideAnim.setValue(50);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleContinue = () => {
    if (moodScore === 0 || energyLevel === 0) return;
    
    // Check if user needs support (mood or energy < 5)
    if ((moodScore < 5 || energyLevel < 5) && currentStep === 0) {
      animateToNextStep();
    } else {
      handleSubmit();
    }
  };

  const handleSupportSelect = (supportId: string) => {
    setSelectedSupport(supportId);
  };

  const handleSubmit = async (skipSupport = false) => {
    try {
      setIsSubmitting(true);
      
      const wellnessData = {
        moodScore,
        energyLevel,
        timestamp: Date.now(),
        supportOption: skipSupport ? null : selectedSupport,
      };

      await saveWellnessData(wellnessData);
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving wellness data:', error);
      // Still navigate to main app even if save fails
      router.replace('/(tabs)');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingScale = ({ 
    title, 
    labels, 
    selectedValue, 
    onSelect, 
    icon: Icon,
    color
  }: {
    title: string;
    labels: typeof MOOD_LABELS;
    selectedValue: number;
    onSelect: (value: number) => void;
    icon: any;
    color: string;
  }) => (
    <View style={styles.ratingSection}>
      <View style={styles.ratingSectionHeader}>
        <View style={[styles.ratingIcon, { backgroundColor: `${color}15` }]}>
          <Icon size={24} color={color} />
        </View>
        <Text style={styles.ratingTitle}>{title}</Text>
      </View>

      <View style={styles.ratingGrid}>
        {labels.map((item) => {
          const isSelected = selectedValue === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.ratingButton,
                isSelected && styles.ratingButtonSelected,
                { borderColor: isSelected ? item.color : '#E5E7EB' }
              ]}
              onPress={() => onSelect(item.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.ratingEmoji,
                isSelected && { transform: [{ scale: 1.1 }] }
              ]}>
                {item.emoji}
              </Text>
              <Text style={[
                styles.ratingNumber,
                isSelected && { color: item.color }
              ]}>
                {item.value}
              </Text>
              <Text style={[
                styles.ratingLabel,
                isSelected && { color: item.color, fontFamily: 'Inter-SemiBold' }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const CombinedRatings = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Heart size={32} color="#10B981" />
        </View>
        <Text style={styles.stepTitle}>How are you feeling today?</Text>
        <Text style={styles.stepSubtitle}>
          Rate your current mood and energy levels from 1-10
        </Text>
      </View>

      <View style={styles.ratingsContainer}>
        <RatingScale
          title="Mood"
          labels={MOOD_LABELS}
          selectedValue={moodScore}
          onSelect={setMoodScore}
          icon={Smile}
          color="#84CC16"
        />

        <View style={styles.ratingDivider} />

        <RatingScale
          title="Energy"
          labels={ENERGY_LABELS}
          selectedValue={energyLevel}
          onSelect={setEnergyLevel}
          icon={Zap}
          color="#F97316"
        />
      </View>

      <TouchableOpacity 
        style={[
          styles.continueButton,
          (moodScore === 0 || energyLevel === 0) && styles.continueButtonDisabled
        ]} 
        onPress={handleContinue}
        disabled={moodScore === 0 || energyLevel === 0}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
        <ChevronRight size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );

  const SupportOptions = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <View style={styles.stepHeader}>
        <View style={styles.iconContainer}>
          <Heart size={32} color="#EC4899" />
        </View>
        <Text style={styles.stepTitle}>We're Here to Help</Text>
        <Text style={styles.stepSubtitle}>
          Your wellbeing matters. Would you like some support today?
        </Text>
      </View>

      <View style={styles.supportContainer}>
        {SUPPORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedSupport === option.id;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.supportOption,
                isSelected && styles.supportOptionSelected,
                { borderColor: isSelected ? option.color : '#E5E7EB' }
              ]}
              onPress={() => handleSupportSelect(option.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.supportIcon, { backgroundColor: `${option.color}15` }]}>
                <Icon size={24} color={option.color} />
              </View>
              <Text style={[
                styles.supportTitle,
                isSelected && { color: option.color }
              ]}>
                {option.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.supportActions}>
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={() => handleSubmit(true)}
          disabled={isSubmitting}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedSupport && styles.continueButtonDisabled
          ]} 
          onPress={() => handleSubmit()}
          disabled={!selectedSupport || isSubmitting}
        >
          <Text style={styles.continueButtonText}>
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Text>
          {!isSubmitting && <ArrowRight size={16} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <CombinedRatings />;
      case 1:
        return <SupportOptions />;
      default:
        return null;
    }
  };

  const getTotalSteps = () => {
    return (moodScore < 5 || energyLevel < 5) && (moodScore > 0 && energyLevel > 0) ? 2 : 1;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                })
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {getTotalSteps()}
        </Text>
      </View>

      {/* Background Decoration */}
      <View style={styles.backgroundDecoration}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Skip Button for first step */}
      {currentStep === 0 && (
        <View style={styles.skipContainer}>
          <TouchableOpacity 
            style={styles.skipAllButton} 
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.skipAllText}>Skip wellness check</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: '#10B98108',
  },
  circle1: {
    width: 200,
    height: 200,
    top: height * 0.1,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: height * 0.3,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.4,
    left: width * 0.1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  ratingsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ratingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#374151',
  },
  ratingDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
    marginHorizontal: 40,
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 400,
    alignSelf: 'center',
  },
  ratingButton: {
    width: (width - 80) / 5 - 6,
    minWidth: 56,
    maxWidth: 64,
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ratingButtonSelected: {
    borderWidth: 2,
    backgroundColor: '#F8FAFC',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  ratingNumber: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginBottom: 1,
  },
  ratingLabel: {
    fontSize: 6,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 200,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  supportContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  supportOptionSelected: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    flex: 1,
  },
  supportActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  skipContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  skipAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
});