import React, { useState, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  SafeAreaView, 
  StyleSheet, 
  Platform, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions,
  Button
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import MotionTracker from './components/MotionTracker';
import ThreeDVisualizer from './components/ThreeDVisualizer';

export default function App() {
  // State for tab navigation
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'record', title: 'Record Motion' },
    { key: 'visualize', title: '3D Visualization' },
  ]);

  // State for recorded motion data
  const [recordedData, setRecordedData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const playbackIntervalRef = useRef(null);
  
  // Clear the playback interval when component unmounts
  const clearPlaybackInterval = () => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  };

  // Start recording motion data
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedData([]);
  };

  // Stop recording motion data
  const handleStopRecording = () => {
    setIsRecording(false);
  };

  // Save motion data point
  const handleDataPoint = (dataPoint) => {
    if (isRecording) {
      setRecordedData(prevData => [...prevData, dataPoint]);
    }
  };

  // Start playback of recorded motion
  const handleStartPlayback = () => {
    if (recordedData.length === 0) return;
    
    setIsPlaying(true);
    setCurrentFrameIndex(0);
    
    clearPlaybackInterval();
    
    // Create interval for playback
    playbackIntervalRef.current = setInterval(() => {
      setCurrentFrameIndex(prevIndex => {
        if (prevIndex >= recordedData.length - 1) {
          clearPlaybackInterval();
          setIsPlaying(false);
          return 0;
        }
        return prevIndex + 1;
      });
    }, 100); // 100ms interval
  };

  // Stop playback
  const handleStopPlayback = () => {
    setIsPlaying(false);
    clearPlaybackInterval();
  };

  // Get current motion data frame for playback
  const getCurrentMotionData = () => {
    if (recordedData.length === 0 || !isPlaying) return null;
    return recordedData[currentFrameIndex];
  };

  // Scene components for TabView
  const RecordRoute = () => (
    <View style={styles.tabContent}>
      <MotionTracker 
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onDataPoint={handleDataPoint}
        recordedDataCount={recordedData.length}
      />
    </View>
  );

  const VisualizeRoute = () => (
    <View style={styles.tabContent}>
      <ThreeDVisualizer motionData={getCurrentMotionData()} />
      <View style={styles.playbackControls}>
        <Text style={styles.playbackStats}>
          {recordedData.length > 0 
            ? `Recorded frames: ${recordedData.length} | Current frame: ${currentFrameIndex + 1}` 
            : 'No recorded data yet. Switch to Record tab to capture motion.'}
        </Text>
        <View style={styles.playbackButtons}>
          {isPlaying ? (
            <Button
              title="Stop Playback"
              onPress={handleStopPlayback}
              color="#e74c3c"
              disabled={recordedData.length === 0}
            />
          ) : (
            <Button
              title="Play Motion"
              onPress={handleStartPlayback}
              color="#2ecc71"
              disabled={recordedData.length === 0}
            />
          )}
        </View>
      </View>
    </View>
  );

  const renderScene = SceneMap({
    record: RecordRoute,
    visualize: VisualizeRoute,
  });

  // Clean up interval on unmount
  React.useEffect(() => {
    return () => clearPlaybackInterval();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.appTitle}>Motion Visualizer</Text>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={props => (
          <TabBar
            {...props}
            style={styles.tabBar}
            labelStyle={styles.tabLabel}
            indicatorStyle={styles.tabIndicator}
            activeColor="#3498db"
            inactiveColor="#95a5a6"
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    color: '#2c3e50',
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: 14,
  },
  tabIndicator: {
    backgroundColor: '#3498db',
    height: 3,
  },
  tabContent: {
    flex: 1,
  },
  playbackControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playbackStats: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    color: '#34495e',
  },
  playbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

