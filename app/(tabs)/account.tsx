import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, Shield, CreditCard, CircleHelp as HelpCircle, FileText, LogOut, ChevronRight, CreditCard as Edit3, Crown, Star, Download, Share2, Moon, Globe, Camera, Lock, Trash2, Mail, Phone, MapPin, Calendar } from 'lucide-react-native';

export default function AccountScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Mock user data - in a real app, this would come from your auth system
  const userData = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: 'March 2024',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    isPremium: true,
    scanCount: 1247,
    favoriteCount: 89,
  };

  const showComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature will be available in a future update.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: showComingSoon },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: showComingSoon },
      ]
    );
  };

  const AccountSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const AccountItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange,
    showChevron = true,
    iconColor = '#10B981',
    textColor = '#111827',
    isDestructive = false
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    showChevron?: boolean;
    iconColor?: string;
    textColor?: string;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.accountItem} 
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.accountItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Icon size={20} color={isDestructive ? '#EF4444' : iconColor} />
        </View>
        <View style={styles.accountItemText}>
          <Text style={[styles.accountItemTitle, { color: isDestructive ? '#EF4444' : textColor }]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.accountItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#E5E7EB', true: '#10B98180' }}
          thumbColor={switchValue ? '#10B981' : '#9CA3AF'}
        />
      )}
      {onPress && !showSwitch && showChevron && (
        <ChevronRight size={16} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  const StatCard = ({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
          <TouchableOpacity style={styles.editButton} onPress={showComingSoon}>
            <Edit3 size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: userData.avatar }} style={styles.profileImage} />
            <TouchableOpacity style={styles.cameraButton} onPress={showComingSoon}>
              <Camera size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.profileName}>{userData.name}</Text>
              {userData.isPremium && (
                <View style={styles.premiumBadge}>
                  <Crown size={14} color="#F59E0B" />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
            <Text style={styles.profileEmail}>{userData.email}</Text>
            <Text style={styles.joinDate}>Member since {userData.joinDate}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <StatCard 
            icon={Camera} 
            value={userData.scanCount.toLocaleString()} 
            label="Foods Scanned" 
            color="#10B981" 
          />
          <StatCard 
            icon={Star} 
            value={userData.favoriteCount.toString()} 
            label="Favorites" 
            color="#F59E0B" 
          />
          <StatCard 
            icon={Calendar} 
            value="24" 
            label="Days Active" 
            color="#8B5CF6" 
          />
        </View>

        {/* Account Information */}
        <AccountSection title="Account Information">
          <AccountItem
            icon={Mail}
            title="Email Address"
            subtitle={userData.email}
            onPress={showComingSoon}
          />
          <AccountItem
            icon={Phone}
            title="Phone Number"
            subtitle={userData.phone}
            onPress={showComingSoon}
          />
          <AccountItem
            icon={MapPin}
            title="Location"
            subtitle={userData.location}
            onPress={showComingSoon}
          />
          <AccountItem
            icon={Lock}
            title="Change Password"
            subtitle="Update your password"
            onPress={showComingSoon}
          />
        </AccountSection>

        {/* Subscription & Billing */}
        <AccountSection title="Subscription & Billing">
          <AccountItem
            icon={Crown}
            title="Premium Subscription"
            subtitle="Active • Renews March 15, 2025"
            onPress={showComingSoon}
            iconColor="#F59E0B"
          />
          <AccountItem
            icon={CreditCard}
            title="Payment Methods"
            subtitle="Manage your payment options"
            onPress={showComingSoon}
          />
          <AccountItem
            icon={FileText}
            title="Billing History"
            subtitle="View past invoices"
            onPress={showComingSoon}
          />
        </AccountSection>

        {/* App Preferences */}
        <AccountSection title="App Preferences">
          <AccountItem
            icon={Bell}
            title="Push Notifications"
            subtitle="Get notified about new features"
            showSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
            showChevron={false}
          />
          <AccountItem
            icon={Moon}
            title="Dark Mode"
            subtitle="Switch to dark theme"
            showSwitch
            switchValue={darkModeEnabled}
            onSwitchChange={setDarkModeEnabled}
            showChevron={false}
          />
          <AccountItem
            icon={Download}
            title="Auto Backup"
            subtitle="Automatically backup your data"
            showSwitch
            switchValue={autoBackupEnabled}
            onSwitchChange={setAutoBackupEnabled}
            showChevron={false}
          />
          <AccountItem
            icon={MapPin}
            title="Location Services"
            subtitle="Enable location-based features"
            showSwitch
            switchValue={locationEnabled}
            onSwitchChange={setLocationEnabled}
            showChevron={false}
          />
          <AccountItem
            icon={Globe}
            title="Language & Region"
            subtitle="English (US)"
            onPress={showComingSoon}
          />
        </AccountSection>

        {/* Data & Privacy */}
        <AccountSection title="Data & Privacy">
          <AccountItem
            icon={Download}
            title="Export Data"
            subtitle="Download your account data"
            onPress={showComingSoon}
          />
          <AccountItem
            icon={Shield}
            title="Privacy Settings"
            subtitle="Manage your privacy preferences"
            onPress={showComingSoon}
          />
          <AccountItem
            icon={FileText}
            title="Data Usage"
            subtitle="See how your data is used"
            onPress={showComingSoon}
          />
        </AccountSection>

        {/* Support & Legal */}
        <AccountSection title="Support & Legal">
          <AccountItem
            icon={HelpCircle}
            title="Help Center"
            subtitle="Get help and support"
            onPress={showComingSoon}
          />
          <AccountItem
            icon={Mail}
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={showComingSoon}
          />
          <AccountItem
            icon={Share2}
            title="Share App"
            subtitle="Tell friends about Portion"
            onPress={showComingSoon}
          />
          <AccountItem
            icon={Star}
            title="Rate App"
            subtitle="Rate us on the App Store"
            onPress={showComingSoon}
          />
          <AccountItem
            icon={FileText}
            title="Terms of Service"
            subtitle="Read our terms"
            onPress={showComingSoon}
          />
          <AccountItem
            icon={Shield}
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={showComingSoon}
          />
        </AccountSection>

        {/* Account Actions */}
        <AccountSection title="Account Actions">
          <AccountItem
            icon={LogOut}
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            showChevron={false}
            iconColor="#EF4444"
          />
          <AccountItem
            icon={Trash2}
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            showChevron={false}
            iconColor="#EF4444"
            isDestructive
          />
        </AccountSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Portion v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for healthy living</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginRight: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  profileEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountItemText: {
    flex: 1,
  },
  accountItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  accountItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 4,
  },
});