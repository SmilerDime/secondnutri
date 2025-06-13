import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, ChevronRight, ChevronLeft, Check, Activity, Target, TriangleAlert as AlertTriangle, Heart, Utensils, Clock, DollarSign, Globe, Settings, ChevronDown, ToggleLeft, ToggleRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { saveProfileData, ProfileData, getProfileData } from '@/services/profileStorage';

const { width } = Dimensions.get('window');

const STEPS = [
  { id: 'demographics', title: 'Basic Info', icon: User },
  { id: 'activity', title: 'Activity & Goals', icon: Activity },
  { id: 'allergies', title: 'Allergies & Health', icon: AlertTriangle },
  { id: 'preferences', title: 'Food Preferences', icon: Utensils },
  { id: 'habits', title: 'Eating Habits', icon: Clock },
  { id: 'lifestyle', title: 'Lifestyle', icon: Globe },
];

// Generate height options based on unit preference
const generateHeightOptions = (useMetric: boolean) => {
  const options = [];
  
  if (useMetric) {
    // Metric (cm) - from 140cm to 220cm
    for (let cm = 140; cm <= 220; cm++) {
      options.push({ label: `${cm} cm`, value: `${cm} cm` });
    }
  } else {
    // Imperial (ft/in) - from 4'7" to 7'2"
    for (let feet = 4; feet <= 7; feet++) {
      const maxInches = feet === 7 ? 2 : 11;
      for (let inches = 0; inches <= maxInches; inches++) {
        if (feet === 4 && inches < 7) continue; // Start from 4'7"
        options.push({ label: `${feet}'${inches}"`, value: `${feet}'${inches}"` });
      }
    }
  }
  
  return options;
};

// Generate weight options based on unit preference
const generateWeightOptions = (useMetric: boolean) => {
  const options = [];
  
  if (useMetric) {
    // Metric (kg) - from 30kg to 200kg
    for (let kg = 30; kg <= 200; kg++) {
      options.push({ label: `${kg} kg`, value: `${kg} kg` });
    }
  } else {
    // Imperial (lbs) - from 66lbs to 440lbs
    for (let lbs = 66; lbs <= 440; lbs++) {
      options.push({ label: `${lbs} lbs`, value: `${lbs} lbs` });
    }
  }
  
  return options;
};

export default function ProfileScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showHeightModal, setShowHeightModal] = useState(false);
  const [showCurrentWeightModal, setShowCurrentWeightModal] = useState(false);
  const [showTargetWeightModal, setShowTargetWeightModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Unit preferences
  const [useMetricHeight, setUseMetricHeight] = useState(true);
  const [useMetricWeight, setUseMetricWeight] = useState(true);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    age: '',
    gender: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    activityLevel: '',
    primaryGoals: [],
    allergies: [],
    intolerances: [],
    dietaryRestrictions: [],
    meatPreferences: [],
    seafoodPreferences: [],
    dislikedFoods: [],
    cookingHabits: '',
    mealFrequency: '',
    hydrationPrefs: [],
    dailyWaterIntake: '',
    healthConditions: [],
    medications: [],
    eatingBehaviors: [],
    budget: '',
    timeConstraints: '',
    culturalPrefs: [],
    specialConsiderations: [],
    completedAt: 0,
    isComplete: false,
  });

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Load existing profile data on component mount
  useEffect(() => {
    loadExistingProfile();
  }, []);

  // Update progress bar when currentStep changes - FIXED
  useEffect(() => {
    const progressValue = (currentStep + 1) / STEPS.length;
    Animated.timing(progressAnim, {
      toValue: progressValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const loadExistingProfile = async () => {
    try {
      const existingProfile = await getProfileData();
      if (existingProfile) {
        setProfileData(existingProfile);
      }
    } catch (error) {
      console.error('Error loading existing profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const animateStep = (direction: 'next' | 'prev') => {
    const slideValue = direction === 'next' ? -width : width;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: slideValue,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const newStep = direction === 'next' ? currentStep + 1 : currentStep - 1;
      setCurrentStep(newStep);
      
      // Scroll to top when moving to next step
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      
      slideAnim.setValue(direction === 'next' ? width : -width);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      animateStep('next');
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      animateStep('prev');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await saveProfileData(profileData);
      
      Alert.alert(
        'Profile Complete!',
        'Your profile has been saved successfully. We\'ll use this information to provide personalized food recommendations.',
        [
          { 
            text: 'View Dashboard', 
            onPress: () => {
              // Navigate to dashboard and refresh
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(
        'Error',
        'Failed to save your profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof ProfileData, item: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(item)
        ? (prev[field] as string[]).filter(i => i !== item)
        : [...(prev[field] as string[]), item]
    }));
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isScrollable = contentSize.height > layoutMeasurement.height;
    const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
    
    if (isScrollable && !isNearBottom) {
      if (!showScrollIndicator) {
        setShowScrollIndicator(true);
        Animated.timing(scrollIndicatorAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } else {
      if (showScrollIndicator) {
        Animated.timing(scrollIndicatorAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowScrollIndicator(false));
      }
    }
  };

  // Clear height/weight values when switching units
  const toggleHeightUnit = () => {
    setUseMetricHeight(!useMetricHeight);
    updateProfileData('height', ''); // Clear current selection
  };

  const toggleWeightUnit = () => {
    setUseMetricWeight(!useMetricWeight);
    updateProfileData('currentWeight', ''); // Clear current selections
    updateProfileData('targetWeight', '');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ProgressBar = () => (
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
        {currentStep + 1} of {STEPS.length}
      </Text>
    </View>
  );

  const StepHeader = () => {
    const step = STEPS[currentStep];
    const Icon = step.icon;
    
    return (
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Icon size={24} color="#10B981" />
        </View>
        <Text style={styles.stepTitle}>{step.title}</Text>
      </View>
    );
  };

  const ScrollIndicator = () => (
    showScrollIndicator && (
      <Animated.View 
        style={[
          styles.scrollIndicator,
          {
            opacity: scrollIndicatorAnim,
            transform: [{
              translateY: scrollIndicatorAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              })
            }]
          }
        ]}
      >
        <Text style={styles.scrollIndicatorText}>Scroll down for more options</Text>
        <ChevronDown size={16} color="#10B981" />
      </Animated.View>
    )
  );

  const SelectionButton = ({ 
    title, 
    selected, 
    onPress, 
    multiSelect = false 
  }: {
    title: string;
    selected: boolean;
    onPress: () => void;
    multiSelect?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.selectionButton, selected && styles.selectionButtonSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.selectionButtonText, selected && styles.selectionButtonTextSelected]}>
        {title}
      </Text>
      {selected && <Check size={16} color="#FFFFFF" />}
    </TouchableOpacity>
  );

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = 'default' 
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric';
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  const DropdownSelector = ({ 
    label, 
    value, 
    placeholder, 
    onPress,
    showUnitToggle = false,
    unitLabel = '',
    isMetric = true,
    onUnitToggle
  }: {
    label: string;
    value: string;
    placeholder: string;
    onPress: () => void;
    showUnitToggle?: boolean;
    unitLabel?: string;
    isMetric?: boolean;
    onUnitToggle?: () => void;
  }) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.inputLabel}>{label}</Text>
        {showUnitToggle && (
          <TouchableOpacity 
            style={styles.unitToggle} 
            onPress={onUnitToggle}
            activeOpacity={0.7}
          >
            <Text style={[styles.unitText, !isMetric && styles.unitTextActive]}>
              {label.includes('Height') ? 'ft/in' : 'lbs'}
            </Text>
            {isMetric ? (
              <ToggleLeft size={20} color="#10B981" />
            ) : (
              <ToggleRight size={20} color="#10B981" />
            )}
            <Text style={[styles.unitText, isMetric && styles.unitTextActive]}>
              {label.includes('Height') ? 'cm' : 'kg'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.dropdownButton} onPress={onPress}>
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value || placeholder}
        </Text>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  const OptionModal = ({ 
    visible, 
    onClose, 
    options, 
    selectedValue, 
    onSelect, 
    title 
  }: {
    visible: boolean;
    onClose: () => void;
    options: { label: string; value: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
    title: string;
  }) => (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            style={styles.optionsList}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedValue === item.value && styles.optionItemSelected
                ]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <Text style={[
                  styles.optionText,
                  selectedValue === item.value && styles.optionTextSelected
                ]}>
                  {item.label}
                </Text>
                {selectedValue === item.value && (
                  <Check size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Demographics
        return (
          <ScrollView 
            ref={scrollViewRef} 
            style={styles.stepContent} 
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Age Range</Text>
            </View>
            <View style={styles.ageGrid}>
              <View style={styles.ageRow}>
                {['13-17', '18-25', '26-35'].map(age => (
                  <SelectionButton
                    key={age}
                    title={age}
                    selected={profileData.age === age}
                    onPress={() => updateProfileData('age', age)}
                  />
                ))}
              </View>
              <View style={styles.ageRow}>
                {['36-45', '46-55', '56-65', '66+'].map(age => (
                  <SelectionButton
                    key={age}
                    title={age}
                    selected={profileData.age === age}
                    onPress={() => updateProfileData('age', age)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Gender</Text>
            </View>
            <View style={styles.selectionGrid}>
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(gender => (
                <SelectionButton
                  key={gender}
                  title={gender}
                  selected={profileData.gender === gender}
                  onPress={() => updateProfileData('gender', gender)}
                />
              ))}
            </View>

            <DropdownSelector
              label="Height"
              value={profileData.height}
              placeholder={`Select your height in ${useMetricHeight ? 'cm' : 'ft/in'}`}
              onPress={() => setShowHeightModal(true)}
              showUnitToggle={true}
              isMetric={useMetricHeight}
              onUnitToggle={toggleHeightUnit}
            />

            <View style={styles.inputRow}>
              <View style={styles.halfInput}>
                <DropdownSelector
                  label="Current Weight"
                  value={profileData.currentWeight}
                  placeholder={`Select in ${useMetricWeight ? 'kg' : 'lbs'}`}
                  onPress={() => setShowCurrentWeightModal(true)}
                  showUnitToggle={true}
                  isMetric={useMetricWeight}
                  onUnitToggle={toggleWeightUnit}
                />
              </View>
              <View style={styles.halfInput}>
                <DropdownSelector
                  label="Target Weight"
                  value={profileData.targetWeight}
                  placeholder={`Select in ${useMetricWeight ? 'kg' : 'lbs'}`}
                  onPress={() => setShowTargetWeightModal(true)}
                />
              </View>
            </View>

            {/* Height Modal */}
            <OptionModal
              visible={showHeightModal}
              onClose={() => setShowHeightModal(false)}
              options={generateHeightOptions(useMetricHeight)}
              selectedValue={profileData.height}
              onSelect={(value) => updateProfileData('height', value)}
              title={`Select Height (${useMetricHeight ? 'cm' : 'ft/in'})`}
            />

            {/* Current Weight Modal */}
            <OptionModal
              visible={showCurrentWeightModal}
              onClose={() => setShowCurrentWeightModal(false)}
              options={generateWeightOptions(useMetricWeight)}
              selectedValue={profileData.currentWeight}
              onSelect={(value) => updateProfileData('currentWeight', value)}
              title={`Select Current Weight (${useMetricWeight ? 'kg' : 'lbs'})`}
            />

            {/* Target Weight Modal */}
            <OptionModal
              visible={showTargetWeightModal}
              onClose={() => setShowTargetWeightModal(false)}
              options={generateWeightOptions(useMetricWeight)}
              selectedValue={profileData.targetWeight}
              onSelect={(value) => updateProfileData('targetWeight', value)}
              title={`Select Target Weight (${useMetricWeight ? 'kg' : 'lbs'})`}
            />
          </ScrollView>
        );

      case 1: // Activity & Goals
        return (
          <ScrollView 
            ref={scrollViewRef} 
            style={styles.stepContent} 
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Activity Level</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Sedentary (desk job, minimal exercise)',
                'Lightly active (light exercise 1-3 days/week)',
                'Moderately active (moderate exercise 3-5 days/week)',
                'Very active (hard exercise 6-7 days/week)',
                'Extremely active (very hard exercise, physical job)'
              ].map(level => (
                <SelectionButton
                  key={level}
                  title={level}
                  selected={profileData.activityLevel === level}
                  onPress={() => updateProfileData('activityLevel', level)}
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Primary Goals (Select all that apply)</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Weight loss',
                'Weight gain/muscle building',
                'Maintain current weight',
                'Improve athletic performance',
                'General health improvement',
                'Medical condition management'
              ].map(goal => (
                <SelectionButton
                  key={goal}
                  title={goal}
                  selected={profileData.primaryGoals.includes(goal)}
                  onPress={() => toggleArrayItem('primaryGoals', goal)}
                  multiSelect
                />
              ))}
            </View>
          </ScrollView>
        );

      case 2: // Allergies & Health
        return (
          <ScrollView 
            ref={scrollViewRef} 
            style={styles.stepContent} 
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Food Allergies (Select all that apply)</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Peanuts', 'Tree nuts', 'Shellfish', 'Fish', 'Eggs', 'Milk/Dairy',
                'Soy', 'Wheat/Gluten', 'Sesame', 'Corn', 'Sulfites', 'Coconut',
                'Mustard', 'Lupin', 'None'
              ].map(allergy => (
                <SelectionButton
                  key={allergy}
                  title={allergy}
                  selected={profileData.allergies.includes(allergy)}
                  onPress={() => toggleArrayItem('allergies', allergy)}
                  multiSelect
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Food Intolerances (Select all that apply)</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Lactose intolerance', 'Gluten sensitivity', 'Fructose intolerance',
                'Histamine intolerance', 'FODMAP sensitivity', 'Caffeine sensitivity', 'None'
              ].map(intolerance => (
                <SelectionButton
                  key={intolerance}
                  title={intolerance}
                  selected={profileData.intolerances.includes(intolerance)}
                  onPress={() => toggleArrayItem('intolerances', intolerance)}
                  multiSelect
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Health Conditions (Select all that apply)</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Diabetes (Type 1)', 'Diabetes (Type 2)', 'Pre-diabetes', 'High blood pressure',
                'High cholesterol', 'Heart disease', 'Thyroid disorders', 'PCOS',
                'Celiac disease', 'IBS', 'GERD', 'Depression/anxiety', 'None'
              ].map(condition => (
                <SelectionButton
                  key={condition}
                  title={condition}
                  selected={profileData.healthConditions.includes(condition)}
                  onPress={() => toggleArrayItem('healthConditions', condition)}
                  multiSelect
                />
              ))}
            </View>
          </ScrollView>
        );

      case 3: // Food Preferences
        return (
          <ScrollView 
            ref={scrollViewRef} 
            style={styles.stepContent} 
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Dietary Preferences/Restrictions</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'No restrictions', 'Vegetarian', 'Vegan', 'Pescatarian', 'Flexitarian',
                'Keto/Low-carb', 'Paleo', 'Mediterranean', 'Intermittent fasting',
                'Halal', 'Kosher', 'Raw food', 'Whole30'
              ].map(diet => (
                <SelectionButton
                  key={diet}
                  title={diet}
                  selected={profileData.dietaryRestrictions.includes(diet)}
                  onPress={() => toggleArrayItem('dietaryRestrictions', diet)}
                  multiSelect
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Meat Preferences (Select all you eat)</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Red Meat (beef, lamb, pork)', 'Poultry (chicken, turkey)', 
                'Processed Meats (bacon, sausages)', 'Game Meat (rabbit, venison)',
                'Organ Meat (liver, kidney)', 'None - I don\'t eat meat'
              ].map(meat => (
                <SelectionButton
                  key={meat}
                  title={meat}
                  selected={profileData.meatPreferences.includes(meat)}
                  onPress={() => toggleArrayItem('meatPreferences', meat)}
                  multiSelect
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Seafood Preferences (Select all you eat)</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Fish (salmon, tuna, cod)', 'Shellfish (shrimp, crab, lobster)',
                'Other Seafood (squid, octopus)', 'None - I don\'t eat seafood'
              ].map(seafood => (
                <SelectionButton
                  key={seafood}
                  title={seafood}
                  selected={profileData.seafoodPreferences.includes(seafood)}
                  onPress={() => toggleArrayItem('seafoodPreferences', seafood)}
                  multiSelect
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Foods You Strongly Dislike</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Blue cheese', 'Liver/organ meats', 'Oysters', 'Anchovies', 'Olives',
                'Mushrooms', 'Brussels sprouts', 'Broccoli', 'Spinach', 'Avocado',
                'Spicy foods', 'Very sweet foods', 'Garlic', 'Onions', 'Cilantro',
                'Raw fish/sushi', 'Tofu', 'None of the above'
              ].map(food => (
                <SelectionButton
                  key={food}
                  title={food}
                  selected={profileData.dislikedFoods.includes(food)}
                  onPress={() => toggleArrayItem('dislikedFoods', food)}
                  multiSelect
                />
              ))}
            </View>
          </ScrollView>
        );

      case 4: // Eating Habits
        return (
          <ScrollView 
            ref={scrollViewRef} 
            style={styles.stepContent} 
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Cooking Habits</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'I cook most meals from scratch',
                'I cook some meals, use some convenience foods',
                'I mainly use convenience/pre-prepared foods',
                'I rarely cook',
                'I don\'t cook at all'
              ].map(habit => (
                <SelectionButton
                  key={habit}
                  title={habit}
                  selected={profileData.cookingHabits === habit}
                  onPress={() => updateProfileData('cookingHabits', habit)}
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Meal Frequency</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                '1-2 meals per day',
                '3 meals per day',
                '4-5 small meals per day',
                '6+ small meals/snacks per day',
                'Irregular eating pattern'
              ].map(frequency => (
                <SelectionButton
                  key={frequency}
                  title={frequency}
                  selected={profileData.mealFrequency === frequency}
                  onPress={() => updateProfileData('mealFrequency', frequency)}
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Daily Water Intake</Text>
            </View>
            <View style={styles.selectionGrid}>
              {['Less than 1L', '1-2L', '2-3L', '3L+'].map(intake => (
                <SelectionButton
                  key={intake}
                  title={intake}
                  selected={profileData.dailyWaterIntake === intake}
                  onPress={() => updateProfileData('dailyWaterIntake', intake)}
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Eating Behaviors (Select all that apply)</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'I eat when stressed', 'I eat when bored', 'I skip meals regularly',
                'I eat late at night', 'I eat very quickly', 'I eat while distracted',
                'I have regular meal times', 'I practice mindful eating', 'None of the above'
              ].map(behavior => (
                <SelectionButton
                  key={behavior}
                  title={behavior}
                  selected={profileData.eatingBehaviors.includes(behavior)}
                  onPress={() => toggleArrayItem('eatingBehaviors', behavior)}
                  multiSelect
                />
              ))}
            </View>
          </ScrollView>
        );

      case 5: // Lifestyle
        return (
          <ScrollView 
            ref={scrollViewRef} 
            style={styles.stepContent} 
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Budget Considerations</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Very limited food budget (less than £40 per week)',
                'Moderate food budget (£40-£70 per week)',
                'Flexible food budget (£71-£120 per week)',
                'Premium/no budget constraints (£120+ per week)'
              ].map(budget => (
                <SelectionButton
                  key={budget}
                  title={budget}
                  selected={profileData.budget === budget}
                  onPress={() => updateProfileData('budget', budget)}
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Time Constraints</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Less than 15 minutes for meal prep',
                '15-30 minutes for meal prep',
                '30-60 minutes for meal prep',
                '60+ minutes available for meal prep',
                'Time varies day to day'
              ].map(time => (
                <SelectionButton
                  key={time}
                  title={time}
                  selected={profileData.timeConstraints === time}
                  onPress={() => updateProfileData('timeConstraints', time)}
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Cultural/Regional Food Preferences</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Mediterranean', 'Asian (Chinese, Japanese, Thai)', 'Indian/South Asian',
                'Mexican/Latin American', 'Middle Eastern', 'African', 'European',
                'American/Western', 'No specific preference'
              ].map(culture => (
                <SelectionButton
                  key={culture}
                  title={culture}
                  selected={profileData.culturalPrefs.includes(culture)}
                  onPress={() => toggleArrayItem('culturalPrefs', culture)}
                  multiSelect
                />
              ))}
            </View>

            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Special Considerations (Select all that apply)</Text>
            </View>
            <View style={styles.selectionGrid}>
              {[
                'Pregnancy', 'Breastfeeding', 'Vegetarian household', 'Feeding family/children',
                'Shift work schedule', 'Frequent travel', 'Limited kitchen access',
                'Student lifestyle', 'Senior-specific needs', 'None'
              ].map(consideration => (
                <SelectionButton
                  key={consideration}
                  title={consideration}
                  selected={profileData.specialConsiderations.includes(consideration)}
                  onPress={() => toggleArrayItem('specialConsiderations', consideration)}
                  multiSelect
                />
              ))}
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
        <Text style={styles.headerSubtitle}>
          Help us personalize your food recommendations
        </Text>
      </View>

      <ProgressBar />
      <StepHeader />

      <View style={styles.contentWrapper}>
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {renderStepContent()}
        </Animated.View>
        
        <ScrollIndicator />
      </View>

      <View style={styles.navigationContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <ChevronLeft size={20} color="#6B7280" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, isLoading && styles.nextButtonDisabled]} 
          onPress={nextStep}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>
            {isLoading ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Complete Profile' : 'Continue'}
          </Text>
          {currentStep < STEPS.length - 1 && !isLoading && <ChevronRight size={20} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollIndicatorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
    marginRight: 4,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  selectionGrid: {
    gap: 8,
    marginBottom: 24,
  },
  ageGrid: {
    marginBottom: 24,
  },
  ageRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 4,
    flex: 1,
  },
  selectionButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  selectionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  selectionButtonTextSelected: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unitText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  unitTextActive: {
    color: '#10B981',
    fontFamily: 'Inter-SemiBold',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  modalCloseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    flex: 1,
  },
  optionTextSelected: {
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 4,
  },
});