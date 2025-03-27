import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import MotionTracker from '@/components/MotionTracker';
import { useMotionStore } from '@/stores/motionStore';

export default function RecordScreen() {
  const {
    isRecording,
    recordedData,
    startRecording,
    stopRecording,
    addDataPoint,
  } = useMotionStore();

  const lastDataPoint = recordedData[recordedData.length - 1];

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.title}>Motion Recording</ThemedText>
          <ThemedText style={styles.subtitle}>
            Status: {isRecording ? 'Recording' : 'Ready'}
          </ThemedText>
          <ThemedText style={styles.dataCount}>
            Recorded Data Points: {recordedData.length}
          </ThemedText>
          {lastDataPoint && (
            <ThemedView style={styles.lastDataContainer}>
              <ThemedText style={styles.subtitle}>Last Data Point:</ThemedText>
              <ThemedText style={styles.dataText}>
                Type: {lastDataPoint.type}
              </ThemedText>
              <ThemedText style={styles.dataText}>
                X: {lastDataPoint.x.toFixed(3)}
              </ThemedText>
              <ThemedText style={styles.dataText}>
                Y: {lastDataPoint.y.toFixed(3)}
              </ThemedText>
              <ThemedText style={styles.dataText}>
                Z: {lastDataPoint.z.toFixed(3)}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
        
        <MotionTracker
          isRecording={isRecording}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onDataPoint={addDataPoint}
          recordedDataCount={recordedData.length}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  infoContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  dataCount: {
    fontSize: 16,
    marginVertical: 8,
  },
  lastDataContainer: {
    marginTop: 12,
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  dataText: {
    fontSize: 14,
    marginVertical: 2,
  },
});
