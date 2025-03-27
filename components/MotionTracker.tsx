import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, Alert } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface MotionData {
  type: 'accelerometer' | 'gyroscope';
  timestamp: number;
  x: number;
  y: number;
  z: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
}

interface MotionTrackerProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDataPoint: (dataPoint: MotionData) => void;
  recordedDataCount: number;
}

export default function MotionTracker({ 
  isRecording, 
  onStartRecording, 
  onStopRecording, 
  onDataPoint,
  recordedDataCount 
}: MotionTrackerProps) {
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const [accelerometerSubscription, setAccelerometerSubscription] = useState<any>(null);
  const [gyroscopeSubscription, setGyroscopeSubscription] = useState<any>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  // Animated values for motion visualization
  const motionX = useSharedValue(0);
  const motionY = useSharedValue(0);
  const motionZ = useSharedValue(0);

  const startSensors = async () => {
    const hasPermissions = await checkPermissions();
    if (!hasPermissions) return;

    console.log('Starting sensors...');
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);

    const accelSub = Accelerometer.addListener(data => {
      setAccelerometerData(data);
      motionX.value = withSpring(data.x);
      motionY.value = withSpring(data.y);
      motionZ.value = withSpring(data.z);

      if (isRecording) {
        const timestamp = Date.now();
        const dataPoint: MotionData = {
          type: 'accelerometer',
          timestamp,
          x: data.x,
          y: data.y,
          z: data.z,
          rotationX: data.y,
          rotationY: data.x,
          rotationZ: data.z
        };
        onDataPoint(dataPoint);
      }
    });

    const gyroSub = Gyroscope.addListener(data => {
      setGyroscopeData(data);
      if (isRecording) {
        const timestamp = Date.now();
        const dataPoint: MotionData = {
          type: 'gyroscope',
          timestamp,
          x: data.x,
          y: data.y,
          z: data.z,
          rotationX: data.x,
          rotationY: data.y,
          rotationZ: data.z
        };
        onDataPoint(dataPoint);
      }
    });

    setAccelerometerSubscription(accelSub);
    setGyroscopeSubscription(gyroSub);
  };

  const stopSensors = () => {
    if (accelerometerSubscription) {
      accelerometerSubscription.remove();
      setAccelerometerSubscription(null);
    }
    if (gyroscopeSubscription) {
      gyroscopeSubscription.remove();
      setGyroscopeSubscription(null);
    }
  };

  const checkPermissions = async () => {
    try {
      const accelResult = await Accelerometer.requestPermissionsAsync();
      const gyroResult = await Gyroscope.requestPermissionsAsync();

      console.log('Permission results:', {
        accelerometer: accelResult.status,
        gyroscope: gyroResult.status
      });

      if (accelResult.status === 'granted' && gyroResult.status === 'granted') {
        const accelAvailable = await Accelerometer.isAvailableAsync();
        const gyroAvailable = await Gyroscope.isAvailableAsync();

        if (accelAvailable && gyroAvailable) {
          setHasPermissions(true);
          return true;
        }
      }
      Alert.alert('Error', 'Required sensors are not available or permissions not granted');
      return false;
    } catch (error) {
      console.error('Error checking permissions:', error);
      Alert.alert('Error', 'Failed to initialize sensors');
      return false;
    }
  };

  useEffect(() => {
    startSensors();
    return () => {
      stopSensors();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: motionX.value * 50 },
      { translateY: motionY.value * 50 },
      { scale: 1 + Math.abs(motionZ.value) * 0.2 }
    ],
  }));

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.statusContainer}>
        <ThemedText style={styles.statusText}>
          Accelerometer: X: {accelerometerData.x.toFixed(2)}, Y: {accelerometerData.y.toFixed(2)}, Z: {accelerometerData.z.toFixed(2)}
        </ThemedText>
        <ThemedText style={styles.statusText}>
          Gyroscope: X: {gyroscopeData.x.toFixed(2)}, Y: {gyroscopeData.y.toFixed(2)}, Z: {gyroscopeData.z.toFixed(2)}
        </ThemedText>
        <ThemedText style={styles.statusText}>
          Recording: {isRecording ? 'Active' : 'Inactive'}
        </ThemedText>
        <ThemedText style={styles.statusText}>
          Data Points: {recordedDataCount}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.visualizer}>
        <Animated.View style={[styles.motionIndicator, animatedStyle]} />
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <Button
          title={isRecording ? "Stop Recording" : "Start Recording"}
          onPress={isRecording ? onStopRecording : onStartRecording}
          disabled={!hasPermissions}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statusContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusText: {
    fontSize: 14,
    marginVertical: 4,
  },
  visualizer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
    marginBottom: 16,
  },
  motionIndicator: {
    width: 20,
    height: 20,
    backgroundColor: '#ff0000',
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
