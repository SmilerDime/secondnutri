import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  RefreshControl,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Activity, Smile, Zap, Droplets, Target, TrendingUp, TrendingDown, MapPin, Clock, Award, ChevronRight, Wind, MessageCircle, Sparkles, Moon, Sun, Calendar, ChartBar as BarChart3, CircleAlert as AlertCircle, CircleCheck as CheckCircle, ArrowUp, ArrowDown, Minus, Star, Settings, Plus, X, User, Apple, Bell } from 'lucide-react-native';
import { saveWellnessData, getWellnessData, WellnessData } from '@/services/wellnessStorage';
import { 
  getReminderSettings, 
  toggleReminders, 
  addUserReminder, 
  removeUserReminder, 
  toggleUserReminder,
  checkDueReminders,
  AVAILABLE_REMINDERS,
  ReminderSettings,
  UserReminder 
} from '@/services/remindersStorage';
import { NotificationBanner } from '@/components/NotificationBanner';

const { width } = Dimensions.get('window');

interface HealthMetric {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  target?: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  color: string;
  icon: any;
  status: 'good' | 'warning' | 'poor';
}

interface ChallengeSuggestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  icon: any;
  color: string;
  completed?: boolean;
}

const iconMap: { [key: string]: any } = {
  'Droplets': Droplets,
  'Activity': Activity,
  'Zap': Zap,
  'Heart': Heart,
  'User': User,
  'Apple': Apple,
  'Moon': Moon,
  'Pill': Bell,
};

export default function WellnessScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [showAffirmations, setShowAffirmations] = useState(false);
  const [currentWellnessData, setCurrentWellnessData] = useState<WellnessData | null>(null);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({ enabled: false, userReminders: [] });
  const [selectedReminders, setSelectedReminders] = useState<Set<string>>(new Set());
  const [reminderTimes, setReminderTimes] = useState<{ [key: string]: string }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // Mock health data - in a real app, this would come from health APIs
  const [healthMetrics] = useState<HealthMetric[]>([
    {
      id: 'hrv',
      title: 'Heart Rate Variability',
      value: 42,
      unit: 'ms',
      target: 50,
      trend: 'down',
      trendValue: '-3ms',
      color: '#EF4444',
      icon: Heart,
      status: 'warning'
    },
    {
      id: 'steps',
      title: 'Steps Today',
      value: '8,247',
      target: 10000,
      trend: 'up',
      trendValue: '+12%',
      color: '#10B981',
      icon: Activity,
      status: 'good'
    },
    {
      id: 'sleep',
      title: 'Sleep Quality',
      value: 7.2,
      unit: 'hrs',
      target: 8,
      trend: 'stable',
      trendValue: '±0.1hr',
      color: '#6366F1',
      icon: Moon,
      status: 'good'
    },
    {
      id: 'hydration',
      title: 'Water Intake',
      value: 1.8,
      unit: 'L',
      target: 2.5,
      trend: 'down',
      trendValue: '-0.3L',
      color: '#06B6D4',
      icon: Droplets,
      status: 'warning'
    }
  ]);

  const [challenges, setChallenges] = useState<ChallengeSuggestion[]>([
    {
      id: '1',
      title: '5-Minute Morning Stretch',
      description: 'Start your day with gentle stretching',
      difficulty: 'easy',
      duration: '5 min',
      icon: Sun,
      color: '#F59E0B',
      completed: false
    },
    {
      id: '2',
      title: 'Mindful Walking',
      description: 'Take a 10-minute mindful walk outside',
      difficulty: 'easy',
      duration: '10 min',
      icon: Activity,
      color: '#10B981',
      completed: false
    },
    {
      id: '3',
      title: 'Hydration Challenge',
      description: 'Drink a glass of water every hour',
      difficulty: 'medium',
      duration: 'All day',
      icon: Droplets,
      color: '#06B6D4',
      completed: false
    }
  ]);

  const weeklyMoodData = [
    { day: 'Mon', mood: 7, energy: 6, sleep: 7.5 },
    { day: 'Tue', mood: 8, energy: 8, sleep: 8.2 },
    { day: 'Wed', mood: 6, energy: 5, sleep: 6.8 },
    { day: 'Thu', mood: 9, energy: 9, sleep: 8.5 },
    { day: 'Fri', mood: 7, energy: 7, sleep: 7.2 },
    { day: 'Sat', mood: 8, energy: 8, sleep: 8.0 },
    { day: 'Sun', mood: 6, energy: 4, sleep: 6.5 }
  ];

  useEffect(() => {
    loadWellnessData();
    loadReminderSettings();
    
    // Check for due reminders every minute
    const reminderInterval = setInterval(checkDueReminders, 60000);
    
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

    return () => clearInterval(reminderInterval);
  }, []);

  const loadWellnessData = async () => {
    try {
      const data = await getWellnessData();
      setCurrentWellnessData(data);
    } catch (error) {
      console.error('Error loading wellness data:', error);
    }
  };

  const loadReminderSettings = async () => {
    try {
      const settings = await getReminderSettings();
      setReminderSettings(settings);
      
      // Initialize selected reminders and times
      const selected = new Set(settings.userReminders.map(r => r.reminderId));
      setSelectedReminders(selected);
      
      const times: { [key: string]: string } = {};
      settings.userReminders.forEach(reminder => {
        times[reminder.reminderId] = reminder.time;
      });
      // Fill in default times for non-selected reminders
      AVAILABLE_REMINDERS.forEach(reminder => {
        if (!times[reminder.id]) {
          times[reminder.id] = reminder.defaultTime;
        }
      });
      setReminderTimes(times);
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadWellnessData();
    await loadReminderSettings();
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleBreathingExercise = () => {
    setShowBreathingExercise(true);
    // In a real app, this would navigate to a breathing exercise screen
    setTimeout(() => {
      setShowBreathingExercise(false);
    }, 3000);
  };

  const handleAffirmations = () => {
    setShowAffirmations(true);
    // In a real app, this would show positive affirmations
    setTimeout(() => {
      setShowAffirmations(false);
    }, 3000);
  };

  const handleChallengePress = (challengeId: string) => {
    setChallenges(prevChallenges => 
      prevChallenges.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, completed: !challenge.completed }
          : challenge
      )
    );
  };

  const handleRemindersToggle = async (enabled: boolean) => {
    try {
      await toggleReminders(enabled);
      await loadReminderSettings();
    } catch (error) {
      console.error('Error toggling reminders:', error);
      Alert.alert('Error', 'Failed to update reminder settings');
    }
  };

  const handleOpenRemindersModal = () => {
    setShowRemindersModal(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseRemindersModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowRemindersModal(false);
    });
  };

  const handleReminderSelection = (reminderId: string) => {
    const newSelected = new Set(selectedReminders);
    if (newSelected.has(reminderId)) {
      newSelected.delete(reminderId);
    } else {
      newSelected.add(reminderId);
    }
    setSelectedReminders(newSelected);
  };

  const handleTimeChange = (reminderId: string, time: string) => {
    setReminderTimes(prev => ({
      ...prev,
      [reminderId]: time
    }));
  };

  const handleSaveReminders = async () => {
    try {
      // Remove all existing reminders
      for (const reminder of reminderSettings.userReminders) {
        await removeUserReminder(reminder.reminderId);
      }
      
      // Add selected reminders with their times
      for (const reminderId of selectedReminders) {
        const time = reminderTimes[reminderId];
        if (time) {
          await addUserReminder(reminderId, time);
        }
      }
      
      await loadReminderSettings();
      handleCloseRemindersModal();
      Alert.alert('Success', 'Reminder settings saved successfully!');
    } catch (error) {
      console.error('Error saving reminders:', error);
      Alert.alert('Error', 'Failed to save reminder settings');
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowUp;
      case 'down': return ArrowDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string, status: string) => {
    if (status === 'good') return '#10B981';
    if (status === 'warning') return '#F59E0B';
    return '#EF4444';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health': return '#10B981';
      case 'nutrition': return '#F59E0B';
      case 'wellness': return '#8B5CF6';
      case 'activity': return '#06B6D4';
      default: return '#6B7280';
    }
  };

  const MetricCard = ({ metric }: { metric: HealthMetric }) => {
    const Icon = metric.icon;
    const TrendIcon = getTrendIcon(metric.trend);
    const StatusIcon = getStatusIcon(metric.status);
    const trendColor = getTrendColor(metric.trend, metric.status);

    return (
      <Animated.View 
        style={[
          styles.metricCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, { backgroundColor: `${metric.color}15` }]}>
            <Icon size={14} color={metric.color} />
          </View>
          <View style={[styles.statusIcon, { backgroundColor: `${trendColor}15` }]}>
            <StatusIcon size={10} color={trendColor} />
          </View>
        </View>

        <Text style={styles.metricTitle}>{metric.title}</Text>
        
        <View style={styles.metricValueContainer}>
          <Text style={styles.metricValue}>
            {metric.value}{metric.unit && <Text style={styles.metricUnit}>{metric.unit}</Text>}
          </Text>
          {metric.target && (
            <Text style={styles.metricTarget}>/ {metric.target}{metric.unit}</Text>
          )}
        </View>

        <View style={styles.metricTrend}>
          <TrendIcon size={8} color={trendColor} />
          <Text style={[styles.metricTrendText, { color: trendColor }]}>
            {metric.trendValue}
          </Text>
        </View>

        {metric.target && (
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((Number(metric.value.toString().replace(',', '')) / metric.target) * 100, 100)}%`,
                  backgroundColor: metric.color 
                }
              ]} 
            />
          </View>
        )}
      </Animated.View>
    );
  };

  const MoodChart = () => (
    <Animated.View 
      style={[
        styles.chartContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleContainer}>
          <BarChart3 size={20} color="#8B5CF6" />
          <Text style={styles.chartTitle}>Weekly Mood & Energy</Text>
        </View>
      </View>

      <View style={styles.chartContent}>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#84CC16' }]} />
            <Text style={styles.legendText}>Mood</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
            <Text style={styles.legendText}>Energy</Text>
          </View>
        </View>

        <View style={styles.chartBars}>
          {weeklyMoodData.map((data, index) => (
            <View key={data.day} style={styles.chartDay}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: (data.mood / 10) * 60,
                      backgroundColor: '#84CC16'
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: (data.energy / 10) * 60,
                      backgroundColor: '#F97316'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.dayLabel}>{data.day}</Text>
            </View>
          ))}
        </View>

        {/* Timeframe Selector moved below the chart */}
        <View style={styles.timeframeSelector}>
          {(['today', 'week', 'month'] as const).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonActive
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text style={[
                styles.timeframeText,
                selectedTimeframe === timeframe && styles.timeframeTextActive
              ]}>
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const ChallengeCard = ({ challenge }: { challenge: ChallengeSuggestion }) => {
    const Icon = challenge.icon;
    
    return (
      <TouchableOpacity 
        style={[
          styles.challengeCard,
          challenge.completed && styles.challengeCardCompleted
        ]} 
        activeOpacity={0.7}
        onPress={() => handleChallengePress(challenge.id)}
      >
        <View style={[styles.challengeIcon, { backgroundColor: `${challenge.color}15` }]}>
          <Icon size={20} color={challenge.color} />
        </View>
        
        <View style={styles.challengeContent}>
          <Text style={[
            styles.challengeTitle,
            challenge.completed && styles.challengeTitleCompleted
          ]}>
            {challenge.title}
          </Text>
          <Text style={[
            styles.challengeDescription,
            challenge.completed && styles.challengeDescriptionCompleted
          ]}>
            {challenge.description}
          </Text>
          
          <View style={styles.challengeMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
              <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
            </View>
            <Text style={[
              styles.durationText,
              challenge.completed && styles.durationTextCompleted
            ]}>
              {challenge.duration}
            </Text>
          </View>
        </View>
        
        <View style={styles.challengeActions}>
          <TouchableOpacity 
            style={[
              styles.starButton,
              challenge.completed && styles.starButtonCompleted
            ]}
            onPress={() => handleChallengePress(challenge.id)}
          >
            <Star 
              size={20} 
              color={challenge.completed ? '#F59E0B' : '#D1D5DB'} 
              fill={challenge.completed ? '#F59E0B' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B98120';
      case 'medium': return '#F59E0B20';
      case 'hard': return '#EF444420';
      default: return '#9CA3AF20';
    }
  };

  const WellnessInsight = () => {
    const needsSupport = currentWellnessData && 
      (currentWellnessData.moodScore < 5 || currentWellnessData.energyLevel < 5);

    if (!needsSupport) return null;

    return (
      <Animated.View 
        style={[
          styles.insightContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.insightHeader}>
          <Sparkles size={20} color="#EC4899" />
          <Text style={styles.insightTitle}>Wellness Support</Text>
        </View>
        
        <Text style={styles.insightText}>
          Your {currentWellnessData?.moodScore && currentWellnessData.moodScore < 5 ? 'mood' : 'energy'} could use a boost. 
          Would you like some support?
        </Text>

        <View style={styles.supportOptions}>
          <TouchableOpacity 
            style={[styles.supportButton, showBreathingExercise && styles.supportButtonActive]}
            onPress={handleBreathingExercise}
            disabled={showBreathingExercise}
          >
            <Wind size={16} color={showBreathingExercise ? '#FFFFFF' : '#06B6D4'} />
            <Text style={[
              styles.supportButtonText,
              showBreathingExercise && styles.supportButtonTextActive
            ]}>
              {showBreathingExercise ? 'Starting...' : 'Breathing Exercise'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.supportButton, showAffirmations && styles.supportButtonActive]}
            onPress={handleAffirmations}
            disabled={showAffirmations}
          >
            <MessageCircle size={16} color={showAffirmations ? '#FFFFFF' : '#84CC16'} />
            <Text style={[
              styles.supportButtonText,
              showAffirmations && styles.supportButtonTextActive
            ]}>
              {showAffirmations ? 'Loading...' : 'Positive Affirmation'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const LocationSuggestions = () => (
    <Animated.View 
      style={[
        styles.locationContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.locationHeader}>
        <MapPin size={20} color="#10B981" />
        <Text style={styles.locationTitle}>Nearby Wellness</Text>
      </View>

      <View style={styles.locationSuggestions}>
        <TouchableOpacity style={styles.locationItem}>
          <Text style={styles.locationName}>🥗 Green Garden Café</Text>
          <Text style={styles.locationDistance}>0.3 mi • Healthy food</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.locationItem}>
          <Text style={styles.locationName}>🌲 Riverside Trail</Text>
          <Text style={styles.locationDistance}>0.5 mi • Walking path</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.locationItem}>
          <Text style={styles.locationName}>🧘 Zen Yoga Studio</Text>
          <Text style={styles.locationDistance}>0.8 mi • Meditation</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const SmartReminders = () => (
    <Animated.View 
      style={[
        styles.remindersSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Clock size={20} color="#F59E0B" />
        <Text style={styles.sectionTitle}>Smart Reminders</Text>
        <TouchableOpacity onPress={handleOpenRemindersModal}>
          <Settings size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.reminderToggleContainer}>
        <View style={styles.reminderToggleContent}>
          <Text style={styles.reminderToggleTitle}>Enable Reminders</Text>
          <Text style={styles.reminderToggleSubtitle}>
            Get personalized wellness notifications
          </Text>
        </View>
        <Switch
          value={reminderSettings.enabled}
          onValueChange={handleRemindersToggle}
          trackColor={{ false: '#E5E7EB', true: '#10B98180' }}
          thumbColor={reminderSettings.enabled ? '#10B981' : '#9CA3AF'}
        />
      </View>

      {reminderSettings.enabled && reminderSettings.userReminders.length > 0 && (
        <View style={styles.activeRemindersList}>
          <Text style={styles.activeRemindersTitle}>Active Reminders</Text>
          {reminderSettings.userReminders.map((userReminder) => {
            const reminderType = AVAILABLE_REMINDERS.find(r => r.id === userReminder.reminderId);
            if (!reminderType) return null;
            
            const IconComponent = iconMap[reminderType.icon] || Bell;
            
            return (
              <View key={userReminder.id} style={styles.activeReminderItem}>
                <View style={[styles.activeReminderIcon, { backgroundColor: getCategoryColor(reminderType.category) + '20' }]}>
                  <IconComponent size={16} color={getCategoryColor(reminderType.category)} />
                </View>
                <View style={styles.activeReminderContent}>
                  <Text style={styles.activeReminderTitle}>{reminderType.title}</Text>
                  <Text style={styles.activeReminderTime}>{userReminder.time}</Text>
                </View>
                <Switch
                  value={userReminder.enabled}
                  onValueChange={(enabled) => toggleUserReminder(userReminder.reminderId, enabled)}
                  trackColor={{ false: '#E5E7EB', true: '#10B98180' }}
                  thumbColor={userReminder.enabled ? '#10B981' : '#9CA3AF'}
                  style={styles.reminderSwitch}
                />
              </View>
            );
          })}
        </View>
      )}

      {reminderSettings.enabled && reminderSettings.userReminders.length === 0 && (
        <TouchableOpacity style={styles.setupRemindersButton} onPress={handleOpenRemindersModal}>
          <Plus size={16} color="#10B981" />
          <Text style={styles.setupRemindersText}>Set up your first reminder</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <NotificationBanner />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
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
          <Text style={styles.title}>Wellness Dashboard</Text>
          <Text style={styles.subtitle}>
            Track your health metrics and get personalized insights
          </Text>
        </Animated.View>

        {/* Health Metrics Grid - 2x2 Layout */}
        <View style={styles.metricsGrid}>
          {healthMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </View>

        {/* Mood & Energy Chart */}
        <MoodChart />

        {/* Wellness Support */}
        <WellnessInsight />

        {/* Daily Challenges */}
        <Animated.View 
          style={[
            styles.challengesSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Target size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Today's Challenges</Text>
          </View>
          
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </Animated.View>

        {/* Location-based Suggestions */}
        <LocationSuggestions />

        {/* Smart Reminders */}
        <SmartReminders />
      </ScrollView>

      {/* Reminders Setup Modal */}
      <Modal
        visible={showRemindersModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseRemindersModal}
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
              <Text style={styles.modalTitle}>Setup Reminders</Text>
              <TouchableOpacity onPress={handleCloseRemindersModal}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>
                Select the reminders you'd like to receive and set their times
              </Text>

              {AVAILABLE_REMINDERS.map((reminder) => {
                const IconComponent = iconMap[reminder.icon] || Bell;
                const isSelected = selectedReminders.has(reminder.id);
                
                return (
                  <View key={reminder.id} style={styles.reminderOption}>
                    <TouchableOpacity 
                      style={styles.reminderOptionHeader}
                      onPress={() => handleReminderSelection(reminder.id)}
                    >
                      <View style={styles.reminderOptionLeft}>
                        <View style={[
                          styles.reminderOptionIcon, 
                          { backgroundColor: getCategoryColor(reminder.category) + '20' }
                        ]}>
                          <IconComponent size={16} color={getCategoryColor(reminder.category)} />
                        </View>
                        <View style={styles.reminderOptionText}>
                          <Text style={styles.reminderOptionTitle}>{reminder.title}</Text>
                          <Text style={styles.reminderOptionDescription}>{reminder.description}</Text>
                        </View>
                      </View>
                      <View style={[
                        styles.reminderCheckbox,
                        isSelected && styles.reminderCheckboxSelected
                      ]}>
                        {isSelected && <CheckCircle size={16} color="#10B981" />}
                      </View>
                    </TouchableOpacity>

                    {isSelected && (
                      <View style={styles.timePickerContainer}>
                        <Text style={styles.timePickerLabel}>Reminder Time:</Text>
                        <View style={styles.timePicker}>
                          <Text style={styles.timeDisplay}>{reminderTimes[reminder.id] || reminder.defaultTime}</Text>
                          <TouchableOpacity 
                            style={styles.timeChangeButton}
                            onPress={() => {
                              // In a real app, this would open a time picker
                              // For demo, we'll cycle through some preset times
                              const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
                              const currentIndex = times.indexOf(reminderTimes[reminder.id] || reminder.defaultTime);
                              const nextIndex = (currentIndex + 1) % times.length;
                              handleTimeChange(reminder.id, times[nextIndex]);
                            }}
                          >
                            <Text style={styles.timeChangeText}>Change</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseRemindersModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveReminders}>
                <Text style={styles.saveButtonText}>Save Reminders</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  metricCard: {
    width: (width - 52) / 2, // 2 cards per row with proper spacing
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 12,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  metricUnit: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  metricTarget: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricTrendText: {
    fontSize: 9,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 3,
  },
  progressBar: {
    height: 2,
    backgroundColor: '#E2E8F0',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginLeft: 8,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
    marginTop: 16,
    justifyContent: 'center',
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeframeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  timeframeTextActive: {
    color: '#0F172A',
    fontFamily: 'Inter-SemiBold',
  },
  chartContent: {
    gap: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  chartDay: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: 8,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  insightContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FEF3C7',
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
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  supportButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  supportButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginLeft: 6,
  },
  supportButtonTextActive: {
    color: '#FFFFFF',
  },
  challengesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginLeft: 8,
    flex: 1,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  challengeCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 4,
  },
  challengeTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#10B981',
  },
  challengeDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
  },
  challengeDescriptionCompleted: {
    color: '#059669',
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    textTransform: 'capitalize',
  },
  durationText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  durationTextCompleted: {
    color: '#059669',
  },
  challengeActions: {
    marginLeft: 12,
  },
  starButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  starButtonCompleted: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  locationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginLeft: 8,
  },
  locationSuggestions: {
    gap: 12,
  },
  locationItem: {
    paddingVertical: 8,
  },
  locationName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 2,
  },
  locationDistance: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  remindersSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reminderToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  reminderToggleContent: {
    flex: 1,
  },
  reminderToggleTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 2,
  },
  reminderToggleSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  activeRemindersList: {
    gap: 12,
  },
  activeRemindersTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  activeReminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  activeReminderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeReminderContent: {
    flex: 1,
  },
  activeReminderTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  activeReminderTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  reminderSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  setupRemindersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    borderStyle: 'dashed',
  },
  setupRemindersText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginLeft: 8,
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
  modalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  reminderOption: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  reminderOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  reminderOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderOptionText: {
    flex: 1,
  },
  reminderOptionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  reminderOptionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  reminderCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderCheckboxSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  timePickerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  timePickerLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeDisplay: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  timeChangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  timeChangeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});