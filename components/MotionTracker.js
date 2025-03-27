import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, ScrollView, Platform } from 'react-native';
import { Accelerometer, Gyroscope, AccelerometerMeasurement, GyroscopeMeasurement } from 'expo-sensors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const SENSOR_UPDATE_INTERVAL = 100; // ms

// Define interfaces for our component
interface SensorData {
  x: number;
  y: number;
  z: number;
}

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
  onDataPoint?: (dataPoint: MotionData) => void;
  recordedDataCount: number;
}

async function checkAndRequestSensorPermissions() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    const { status } = await Accelerometer.requestPermissionsAsync();
    console.log('Accelerometer permission status:', status);
    return status === 'granted';
  }
  return true;
}

export default function MotionTracker({ 
  isRecording, 
  onStartRecording, 
  onStopRecording, 
  onDataPoint,
  recordedDataCount 
}: MotionTrackerProps) {
  // Sensor data state
  const [accelerometerData, setAccelerometerData] = useState<SensorData>({ x: 0, y: 0, z: 0 });
  const [gyroscopeData, setGyroscopeData] = useState<SensorData>({ x: 0, y: 0, z: 0 });
  
  // Local state for tracking data
  const [localRecordedData, setLocalRecordedData] = useState<MotionData[]>([]);
  
  // Subscription objects for cleanup
  const [accelerometerSubscription, setAccelerometerSubscription] = useState<Accelerometer.Subscription | null>(null);
  const [gyroscopeSubscription, setGyroscopeSubscription] = useState<Gyroscope.Subscription | null>(null);
  
  // Animated values for visual feedback
  const motionX = useSharedValue(0);
  const motionY = useSharedValue(0);
  const motionZ = useSharedValue(0);
  
  // Check permissions and sensor availability
  useEffect(() => {
    async function setupSensors() {
      console.log('Setting up sensors...');
      const hasPermission = await checkAndRequestSensorPermissions();
      console.log('Has sensor permission:', hasPermission);
      
      if (hasPermission) {
        const isAccelerometerAvailable = await Accelerometer.isAvailableAsync();
        console.log('Accelerometer available:', isAccelerometerAvailable);
        
        if (isAccelerometerAvailable) {
          startSensors();
        } else {
          console.error('Accelerometer not available on this device');
        }
      } else {
        console.error('Sensor permissions not granted');
      }
    }
    
    setupSensors();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up sensors...');
      stopSensors();
    };
  }, []);
  
  // Start sensor tracking
  const startSensors = (): void => {
    // Configure sensor interval
    Accelerometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL);
    Gyroscope.setUpdateInterval(SENSOR_UPDATE_INTERVAL);
    
    // Subscribe to accelerometer updates
    const accelerometerSub = Accelerometer.addListener((accelData: AccelerometerMeasurement) => {
      setAccelerometerData(accelData);
      
      // Update animated values
      motionX.value = withSpring(accelData.x);
      motionY.value = withSpring(accelData.y);
      motionZ.value = withSpring(accelData.z);
      
      // Add to recorded data if recording
      if (isRecording) {
        const timestamp = new Date().getTime();
        const dataPoint: MotionData = { 
          type: 'accelerometer', 
          timestamp, 
          rotationX: motionY.value, 
          rotationY: motionX.value, 
          rotationZ: motionZ.value,
          ...accelData 
        };
        
        // Send data point to parent component
        onDataPoint && onDataPoint(dataPoint);
      }
    });
    
    // Subscribe to gyroscope updates
    const gyroscopeSub = Gyroscope.addListener((gyroData: GyroscopeMeasurement) => {
      setGyroscopeData(gyroData);
      
      // Add to recorded data if recording
      if (isRecording) {
        const timestamp = new Date().getTime();
        const dataPoint: MotionData = { 
          type: 'gyroscope', 
          timestamp,
          ...gyroData 
        };
        
        // We don't need to send gyroscope data as the accelerometer
        // is being used for the visualization already
      }
    });
    
    // Store subscription objects for cleanup
    setAccelerometerSubscription(accelerometerSub);
    setGyroscopeSubscription(gyroscopeSub);
  };
  
  // Stop sensor tracking
  const stopSensors = (): void => {
    // Unsubscribe from sensors
    accelerometerSubscription && accelerometerSubscription.remove();
    gyroscopeSubscription && gyroscopeSubscription.remove();
    
    // Clear subscription objects
    setAccelerometerSubscription(null);
    setGyroscopeSubscription(null);
  };
  
  // Start recording motion data
  const startRecording = (): void => {
    // Make sure sensors are active
    if (!accelerometerSubscription || !gyroscopeSubscription) {
      startSensors();
    }
    onStartRecording && onStartRecording();
  };
  
  // Stop recording motion data
  const stopRecording = (): void => {
    onStopRecording && onStopRecording();
  };

  // Export recorded data (placeholder function)
  const exportData = (): void => {
    alert(`${recordedDataCount} data points recorded. Switch to 3D Visualization tab to view.`);
  };
  
  // Cleanup on component unmount - REPLACED BY PERMISSION CHECK USEEFFECT
  
  // Animated styles for visual feedback
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: motionX.value * 50 },
        { translateY: motionY.value * 50 },
        { scale: 1 + Math.abs(motionZ.value) / 5 }
      ],
    };
  });
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Motion Tracker</ThemedText>
      
      <ThemedView style={styles.sensorContainer}>
        <ThemedText style={styles.sensorTitle}>Accelerometer:</ThemedText>
        <ThemedText style={styles.sensorValue}>
          x: {accelerometerData.x.toFixed(3)}, 
          y: {accelerometerData.y.toFixed(3)}, 
          z: {accelerometerData.z.toFixed(3)}
        </ThemedText>
        
        <ThemedText style={styles.sensorTitle}>Gyroscope:</ThemedText>
        <ThemedText style={styles.sensorValue}>
          x: {gyroscopeData.x.toFixed(3)}, 
          y: {gyroscopeData.y.toFixed(3)}, 
          z: {gyroscopeData.z.toFixed(3)}
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.visualContainer}>
        <Animated.View style={[styles.motionIndicator, animatedStyle]} />
      </ThemedView>
      
      <ThemedView style={styles.controlsContainer}>
        {isRecording ? (
          <Button 
            title="Stop Recording" 
            onPress={stopRecording} 
            color="#e74c3c"
          />
        ) : (
          <Button 
            title="Start Recording" 
            onPress={startRecording} 
            color="#2ecc71"
          />
        )}
        
        <Button 
          title="Export Data" 
          onPress={exportData} 
          disabled={recordedDataCount === 0}
          color="#3498db"
        />
      </ThemedView>
      
      <ThemedView style={styles.statsContainer}>
        <ThemedText style={styles.statsText}>
          Recording: {isRecording ? 'Active' : 'Inactive'}
        </ThemedText>
        <ThemedText style={styles.statsText}>
          Data Points: {recordedDataCount || 0}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sensorContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  sensorValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginVertical: 5,
  },
  visualContainer: {
    height: 200,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  motionIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsText: {
    fontSize: 14,
    marginVertical: 3,
  },
});

