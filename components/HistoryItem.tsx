import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Award, Clock, Tag } from 'lucide-react-native';

interface HistoryItemProps {
  item: {
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
  index: number;
}

export function HistoryItem({ item, index }: HistoryItemProps) {
  const confidencePercentage = Math.round(item.confidence * 100);
  const confidenceColor = confidencePercentage >= 80 ? '#10B981' : 
                         confidencePercentage >= 60 ? '#F59E0B' : '#EF4444';

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <TouchableOpacity style={[styles.container, { marginBottom: index === 0 ? 16 : 12 }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.foodName}>{item.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: `${confidenceColor}20` }]}>
            <Tag size={12} color={confidenceColor} />
            <Text style={[styles.categoryText, { color: confidenceColor }]}>
              {item.category}
            </Text>
          </View>
        </View>
        <View style={styles.confidenceContainer}>
          <Award size={16} color={confidenceColor} />
          <Text style={[styles.confidenceText, { color: confidenceColor }]}>
            {confidencePercentage}%
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.timestampContainer}>
          <Clock size={14} color="#9CA3AF" />
          <Text style={styles.timestampText}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        
        {item.nutritionalInfo?.calories && (
          <Text style={styles.caloriesText}>
            {item.nutritionalInfo.calories}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  caloriesText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
  },
});