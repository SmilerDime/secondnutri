import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { User, Target, Utensils, Heart, ChevronRight, CreditCard as Edit3 } from 'lucide-react-native';
import { ProfileData, getProfileSummary } from '@/services/profileStorage';

interface ProfileSummaryProps {
  profile: ProfileData;
  onEdit?: () => void;
}

export function ProfileSummary({ profile, onEdit }: ProfileSummaryProps) {
  const summary = getProfileSummary(profile);

  const InfoRow = ({ 
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
    <View style={styles.infoRow}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Icon size={16} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <User size={20} color="#10B981" />
          </View>
          <View>
            <Text style={styles.title}>Your Profile</Text>
            <Text style={styles.subtitle}>
              Completed {new Date(profile.completedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {onEdit && (
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Edit3 size={16} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <InfoRow
          icon={User}
          label="Demographics"
          value={summary.demographics}
          color="#6366F1"
        />
        
        <InfoRow
          icon={Target}
          label="Primary Goals"
          value={summary.goals}
          color="#10B981"
        />
        
        <InfoRow
          icon={Utensils}
          label="Dietary Preferences"
          value={summary.dietary}
          color="#F59E0B"
        />
        
        <InfoRow
          icon={Heart}
          label="Health & Allergies"
          value={summary.health}
          color="#EF4444"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          We use this information to provide personalized food recommendations
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});