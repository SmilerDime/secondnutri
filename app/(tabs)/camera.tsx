import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, FlipHorizontal, Loader as Loader2, CircleCheck as CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { identifyFood } from '@/services/googleVision';
import { FoodResult } from '@/components/FoodResult';
import { saveToHistory } from '@/services/storage';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync();
    }
  };

  const animateCapture = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showResultWithAnimation = () => {
    setShowResult(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideResult = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowResult(false);
      setResult(null);
    });
  };

  const takePicture = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    try {
      triggerHapticFeedback();
      animateCapture();
      setIsAnalyzing(true);

      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (picture?.base64) {
        const foodData = await identifyFood(picture.base64);
        
        if (foodData) {
          setResult(foodData);
          await saveToHistory(foodData);
          showResultWithAnimation();
        } else {
          Alert.alert('No Food Detected', 'Please try again with a clearer image of food.');
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleCameraFacing = () => {
    triggerHapticFeedback();
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Loader2 size={32} color="#10B981" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Camera size={64} color="#10B981" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to identify food items for you
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
        ratio="16:9"
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Food Identifier</Text>
            <TouchableOpacity 
              style={styles.flipButton} 
              onPress={toggleCameraFacing}
            >
              <FlipHorizontal size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.centerContainer}>
            <View style={styles.scanFrame} />
            <Text style={styles.instruction}>
              Point camera at food and tap capture
            </Text>
          </View>

          <View style={styles.bottomContainer}>
            <Animated.View style={[styles.captureButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
              <TouchableOpacity 
                style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 size={32} color="#FFFFFF" />
                ) : (
                  <Camera size={32} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {showResult && result && (
          <Animated.View style={[styles.resultOverlay, { opacity: fadeAnim }]}>
            <FoodResult 
              result={result} 
              onClose={hideResult}
            />
          </Animated.View>
        )}
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
  },
  bottomContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  captureButtonContainer: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButton: {
    backgroundColor: '#10B981',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  captureButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});