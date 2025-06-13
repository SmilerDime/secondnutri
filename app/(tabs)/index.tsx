import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, TrendingUp, Target, Award, Clock, Zap, Star, ChevronRight, Plus, ChartBar as BarChart3, Calendar, Flame, Apple, Coffee, Utensils, Settings, User, History, RefreshCw, Beef, Droplets, Activity, ChevronDown, ChevronUp, Heart, Waves, Moon, Smile, BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import { getHistory } from '@/services/storage';
import { getProfileData, isProfileComplete, ProfileData } from '@/services/profileStorage';
import { ProfileSummary } from '@/components/ProfileSummary';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentNutritionTip, getNextNutritionTip } from '@/services/nutritionTipsStorage';
import { getWellnessData } from '@/services/wellnessStorage';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [recentHistory, setRecentHistory] = useState([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [currentNutritionTip, setCurrentNutritionTip] = useState<any>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [showExpandedStats, setShowExpandedStats] = useState(false);
  const [todayStats, setTodayStats] = useState({
    scanned: 8,
    caloriesConsumed: 1247,
    caloriesTarget: 2200,
    proteinConsumed: 45,
    proteinTarget: 120,
    fatConsumed: 38,
    fatTarget: 75,
    stepsConsumed: 6847,
    stepsTarget: 10000,
    streak: 12,
    // Additional metrics for expanded view
    waterConsumed: 1.2,
    waterTarget: 2.5,
    sleepHours: 7.5,
    sleepTarget: 8,
    workoutsCompleted: 1,
    workoutsTarget: 1,
    moodScore: 8,
    energyLevel: 7
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    // Animate dashboard entrance
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

  const loadData = async () => {
    try {
      // Load recent history
      const history = await getHistory();
      setRecentHistory(history.slice(0, 3));
      
      // Load profile data
      const profile = await getProfileData();
      const complete = await isProfileComplete();
      
      setProfileData(profile);
      setProfileComplete(complete);

      // Load nutrition tip if profile is complete
      if (complete) {
        loadNutritionTip();
      }

      // Load today's wellness data
      const todayWellness = await getWellnessData();
      if (todayWellness) {
        setTodayStats(prev => ({
          ...prev,
          moodScore: todayWellness.moodScore,
          energyLevel: todayWellness.energyLevel,
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadNutritionTip = async () => {
    try {
      const tip = await getCurrentNutritionTip();
      setCurrentNutritionTip(tip);
    } catch (error) {
      console.error('Error loading nutrition tip:', error);
    }
  };

  const handleNextTip = async () => {
    if (isLoadingTip) return;
    
    try {
      setIsLoadingTip(true);
      const nextTip = await getNextNutritionTip();
      setCurrentNutritionTip(nextTip);
    } catch (error) {
      console.error('Error getting next tip:', error);
    } finally {
      setIsLoadingTip(false);
    }
  };

  const handleScanFood = () => {
    // Navigate to camera tab
    router.push('/(tabs)/camera');
  };

  const handleEditProfile = () => {
    router.push('/(tabs)/profile');
  };

  const toggleExpandedStats = () => {
    setShowExpandedStats(!showExpandedStats);
    Animated.timing(expandAnim, {
      toValue: showExpandedStats ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const QuickStatCard = ({ 
    icon: Icon, 
    value, 
    target,
    label, 
    color, 
    unit = '',
    showProgress = false,
    size = 'normal'
  }: { 
    icon: any; 
    value: string | number; 
    target?: string | number;
    label: string; 
    color: string; 
    unit?: string;
    showProgress?: boolean;
    size?: 'normal' | 'small';
  }) => {
    const progressPercentage = showProgress && target ? 
      Math.min((Number(value) / Number(target)) * 100, 100) : 0;
    
    return (
      <View style={[
        styles.statCard, 
        { borderLeftColor: color },
        size === 'small' && styles.statCardSmall
      ]}>
        <View style={styles.statHeader}>
          <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
            <Icon size={size === 'small' ? 16 : 18} color={color} />
          </View>
        </View>
        <View style={styles.statValues}>
          <Text style={[styles.statValue, size === 'small' && styles.statValueSmall]}>
            {value}{unit}
            {target && <Text style={styles.statTarget}>/{target}{unit}</Text>}
          </Text>
        </View>
        {showProgress && target && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: color 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color }]}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
        )}
        <Text style={[styles.statLabel, size === 'small' && styles.statLabelSmall]}>
          {label}
        </Text>
      </View>
    );
  };

  const RecentScanItem = ({ item, index }: { item: any; index: number }) => {
    const confidenceColor = item.confidence >= 0.8 ? '#10B981' : 
                           item.confidence >= 0.6 ? '#F59E0B' : '#EF4444';
    
    return (
      <TouchableOpacity style={styles.recentItem} activeOpacity={0.7}>
        <View style={styles.recentItemLeft}>
          <View style={[styles.recentIcon, { backgroundColor: `${confidenceColor}15` }]}>
            <Utensils size={16} color={confidenceColor} />
          </View>
          <View style={styles.recentInfo}>
            <Text style={styles.recentName}>{item.name}</Text>
            <Text style={styles.recentTime}>
              {new Date(item.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>
        <View style={styles.recentRight}>
          <Text style={[styles.confidenceText, { color: confidenceColor }]}>
            {Math.round(item.confidence * 100)}%
          </Text>
          <ChevronRight size={14} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  const ActionCard = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    color, 
    onPress 
  }: {
    icon: any;
    title: string;
    subtitle: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.actionCard, { backgroundColor: `${color}08` }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Icon size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.headerTitle}>Ready to scan some food?</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/account')}
          >
            <Image
              source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Main Scan Button */}
        <Animated.View 
          style={[
            styles.scanSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.mainScanButton}
            onPress={handleScanFood}
            activeOpacity={0.9}
          >
            <View style={styles.scanButtonContent}>
              <View style={styles.scanIconContainer}>
                <Camera size={32} color="#FFFFFF" />
              </View>
              <View style={styles.scanTextContainer}>
                <Text style={styles.scanButtonTitle}>Scan Food</Text>
                <Text style={styles.scanButtonSubtitle}>Point camera at any food item</Text>
              </View>
              <ChevronRight size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Completion Prompt */}
        {!profileComplete && (
          <Animated.View 
            style={[
              styles.profilePromptSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.profilePromptCard}>
              <View style={styles.profilePromptHeader}>
                <View style={styles.profilePromptIcon}>
                  <Target size={20} color="#F59E0B" />
                </View>
                <Text style={styles.profilePromptTitle}>Complete Your Profile</Text>
              </View>
              <Text style={styles.profilePromptText}>
                Get personalized food recommendations by completing your profile questionnaire.
              </Text>
              <TouchableOpacity 
                style={styles.profilePromptButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Text style={styles.profilePromptButtonText}>Complete Profile</Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Today's Nutrition Targets */}
        <Animated.View 
          style={[
            styles.statsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Nutrition</Text>
            <TouchableOpacity onPress={toggleExpandedStats}>
              <View style={styles.viewAllContainer}>
                <Text style={styles.seeAllText}>
                  {showExpandedStats ? 'Show Less' : 'View All'}
                </Text>
                {showExpandedStats ? (
                  <ChevronUp size={16} color="#10B981" />
                ) : (
                  <ChevronDown size={16} color="#10B981" />
                )}
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsGrid}>
            <QuickStatCard
              icon={Flame}
              value={todayStats.caloriesConsumed}
              target={todayStats.caloriesTarget}
              label="Calories"
              color="#EF4444"
              showProgress={true}
            />
            <QuickStatCard
              icon={Beef}
              value={todayStats.proteinConsumed}
              target={todayStats.proteinTarget}
              label="Protein"
              color="#10B981"
              unit="g"
              showProgress={true}
            />
            <QuickStatCard
              icon={Droplets}
              value={todayStats.fatConsumed}
              target={todayStats.fatTarget}
              label="Fat"
              color="#F59E0B"
              unit="g"
              showProgress={true}
            />
            <QuickStatCard
              icon={Activity}
              value={todayStats.stepsConsumed.toLocaleString()}
              target={todayStats.stepsTarget.toLocaleString()}
              label="Steps"
              color="#8B5CF6"
              showProgress={true}
            />
          </View>

          {/* Expanded Stats */}
          <Animated.View 
            style={[
              styles.expandedStatsContainer,
              {
                height: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 280], // Increased height to accommodate all cards
                }),
                opacity: expandAnim,
              }
            ]}
          >
            <View style={styles.expandedStatsGrid}>
              <QuickStatCard
                icon={Waves}
                value={todayStats.waterConsumed}
                target={todayStats.waterTarget}
                label="Water Intake"
                color="#06B6D4"
                unit="L"
                showProgress={true}
                size="small"
              />
              <QuickStatCard
                icon={Moon}
                value={todayStats.sleepHours}
                target={todayStats.sleepTarget}
                label="Sleep"
                color="#6366F1"
                unit="h"
                showProgress={true}
                size="small"
              />
              <QuickStatCard
                icon={Zap}
                value={todayStats.workoutsCompleted}
                target={todayStats.workoutsTarget}
                label="Workouts"
                color="#EC4899"
                showProgress={true}
                size="small"
              />
              <QuickStatCard
                icon={Smile}
                value={todayStats.moodScore}
                label="Mood Score"
                color="#84CC16"
                unit="/10"
                size="small"
              />
              <QuickStatCard
                icon={Heart}
                value={todayStats.energyLevel}
                label="Energy Level"
                color="#F97316"
                unit="/10"
                size="small"
              />
              <QuickStatCard
                icon={Target}
                value={`${todayStats.streak} days`}
                label="Scan Streak"
                color="#8B5CF6"
                size="small"
              />
            </View>
          </Animated.View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          style={[
            styles.actionsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              icon={BarChart3}
              title="History"
              subtitle="View scan history"
              color="#6366F1"
              onPress={() => router.push('/(tabs)/history')}
            />
            <ActionCard
              icon={Heart}
              title="Wellness"
              subtitle="Track mood & energy"
              color="#EC4899"
              onPress={() => router.push('/(tabs)/wellness')}
            />
            <ActionCard
              icon={User}
              title="Profile"
              subtitle="Manage your profile"
              color="#10B981"
              onPress={() => router.push('/(tabs)/profile')}
            />
            <ActionCard
              icon={Settings}
              title="Settings"
              subtitle="App preferences"
              color="#F59E0B"
              onPress={() => router.push('/(tabs)/settings')}
            />
            <ActionCard
              icon={BookOpen}
              title="Recipes Discovered"
              subtitle="Your AI recipes"
              color="#EF4444"
              onPress={() => router.push('/(tabs)/recipes-discovered')}
            />
            <ActionCard
              icon={Coffee}
              title="Nutrition"
              subtitle="Learn about nutrition"
              color="#8B5CF6"
              onPress={() => {}}
            />
          </View>
        </Animated.View>

        {/* Recent Scans */}
        {recentHistory.length > 0 && (
          <Animated.View 
            style={[
              styles.recentSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Scans</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.recentList}>
              {recentHistory.map((item, index) => (
                <RecentScanItem key={`${item.timestamp}-${index}`} item={item} index={index} />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Profile Summary */}
        {profileComplete && profileData && (
          <Animated.View 
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <ProfileSummary 
              profile={profileData} 
              onEdit={handleEditProfile}
            />
          </Animated.View>
        )}

        {/* Nutrition Insights */}
        <Animated.View 
          style={[
            styles.insightsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={styles.insightIconContainer}>
                <Apple size={20} color="#10B981" />
              </View>
              <Text style={styles.insightTitle}>
                {profileComplete ? 'Personalized Nutrition Tip' : 'Nutrition Tip'}
              </Text>
              {profileComplete && currentNutritionTip && (
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={handleNextTip}
                  disabled={isLoadingTip}
                >
                  <RefreshCw 
                    size={16} 
                    color={isLoadingTip ? "#9CA3AF" : "#10B981"} 
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.insightText}>
              {profileComplete && currentNutritionTip
                ? currentNutritionTip.tip
                : "Complete your profile to get personalized nutrition tips and food recommendations tailored to your goals."
              }
            </Text>
            {profileComplete && currentNutritionTip && (
              <View style={styles.tipMetadata}>
                <View style={[styles.tipCategory, { backgroundColor: getCategoryColor(currentNutritionTip.category) }]}>
                  <Text style={styles.tipCategoryText}>
                    {currentNutritionTip.category.replace('-', ' ')}
                  </Text>
                </View>
                <View style={[styles.tipPriority, { backgroundColor: getPriorityColor(currentNutritionTip.priority) }]}>
                  <Text style={styles.tipPriorityText}>
                    {currentNutritionTip.priority} priority
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.insightButton}>
              <Text style={styles.insightButtonText}>Learn More</Text>
              <ChevronRight size={14} color="#10B981" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions for tip styling
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'hydration': '#06B6D4',
    'meal-planning': '#8B5CF6',
    'nutrients': '#10B981',
    'portion-control': '#F59E0B',
    'timing': '#EF4444',
    'supplements': '#EC4899',
    'cooking': '#F97316',
    'snacks': '#84CC16',
    'goals': '#6366F1',
    'health': '#DC2626',
  };
  return colors[category] || '#6B7280';
}

function getPriorityColor(priority: string): string {
  const colors: { [key: string]: string } = {
    'high': '#EF4444',
    'medium': '#F59E0B',
    'low': '#10B981',
  };
  return colors[priority] || '#6B7280';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  profileButton: {
    marginLeft: 16,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  scanSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  mainScanButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanButtonTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scanButtonSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profilePromptSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profilePromptCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FEF3C7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profilePromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePromptIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profilePromptTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
  },
  profilePromptText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  profilePromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  profilePromptButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginRight: 4,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  viewAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginRight: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardSmall: {
    minWidth: (width - 64) / 3,
    padding: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValues: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  statValueSmall: {
    fontSize: 16,
  },
  statTarget: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  statLabelSmall: {
    fontSize: 11,
  },
  expandedStatsContainer: {
    overflow: 'hidden',
    marginTop: 16,
  },
  expandedStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 16,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: (width - 64) / 3,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  recentList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  recentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 2,
  },
  recentTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  recentRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  tipMetadata: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tipCategory: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipCategoryText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  tipPriority: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipPriorityText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  insightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  insightButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginRight: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});