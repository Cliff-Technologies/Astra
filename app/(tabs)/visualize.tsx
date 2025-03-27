import React, { useEffect, useState } from 'react';
import { StyleSheet, Button } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ThreeDVisualizer from '@/components/ThreeDVisualizer';
import { useMotionStore } from '@/stores/motionStore';

export default function VisualizeScreen() {
  const { recordedData, currentDataIndex, nextDataPoint, previousDataPoint } = useMotionStore();
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Auto-advance frames during playback
  useEffect(() => {
    let playbackInterval: NodeJS.Timeout | null = null;
    
    if (isPlaying && recordedData.length > 0) {
      playbackInterval = setInterval(() => {
        nextDataPoint();
      }, 100); // Update every 100ms
    }
    
    return () => {
      if (playbackInterval) {
        clearInterval(playbackInterval);
      }
    };
  }, [isPlaying, recordedData.length]);

  const currentMotionData = recordedData.length > 0 ? 
    recordedData[currentDataIndex % recordedData.length] : null;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.statusContainer}>
        <ThemedText style={styles.title}>Motion Visualization</ThemedText>
        <ThemedText style={styles.statusText}>
          Recorded Frames: {recordedData.length}
        </ThemedText>
        {recordedData.length > 0 && (
          <ThemedText style={styles.statusText}>
            Current Frame: {currentDataIndex + 1} / {recordedData.length}
          </ThemedText>
        )}
      </ThemedView>

      {recordedData.length > 0 ? (
        <ThemedView style={styles.content}>
          <ThreeDVisualizer motionData={currentMotionData} />
          <ThemedView style={styles.controls}>
            <Button
              title="Previous"
              onPress={previousDataPoint}
              disabled={currentDataIndex === 0}
            />
            <Button
              title={isPlaying ? "Pause" : "Play"}
              onPress={() => setIsPlaying(!isPlaying)}
            />
            <Button
              title="Next"
              onPress={nextDataPoint}
              disabled={currentDataIndex === recordedData.length - 1}
            />
          </ThemedView>
        </ThemedView>
      ) : (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>
            No motion data recorded yet. Go to the Record tab to capture motion data.
          </ThemedText>
        </ThemedView>
      )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    marginVertical: 4,
  },
  content: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
