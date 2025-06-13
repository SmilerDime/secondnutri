import { Tabs } from 'expo-router';
import { Platform, View, Image } from 'react-native';
import { Chrome as Home, Heart, BookOpen } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 10,
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingLeft: 20,
            paddingRight: 140, // Make room for logo
          },
          tabBarLabelStyle: {
            fontFamily: 'Inter-Medium',
            fontSize: 12,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="wellness"
          options={{
            title: 'Wellness',
            tabBarIcon: ({ size, color }) => (
              <Heart size={size} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="recipes-discovered"
          options={{
            title: 'Recipes',
            tabBarIcon: ({ size, color }) => (
              <BookOpen size={size} color={color} />
            ),
          }}
        />
        
        {/* Hidden screens - accessible via navigation but not shown in tab bar */}
        <Tabs.Screen
          name="camera"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      </Tabs>
      
      {/* Logo positioned as overlay in its own compartment */}
      <View style={{
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 20 : 10,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Image
          source={require('@/assets/images/Portion Logo clear background.png')}
          style={{ 
            width: 96, // 4.5x larger than original 24px
            height: 96,
          }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}