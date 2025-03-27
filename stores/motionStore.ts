import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MotionData {
  type: 'accelerometer' | 'gyroscope';  // Make the type more specific
  timestamp: number;
  x: number;
  y: number;
  z: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
}

interface MotionState {
  isRecording: boolean;
  recordedData: MotionData[];
  currentDataIndex: number;
  startRecording: () => void;
  stopRecording: () => void;
  addDataPoint: (dataPoint: MotionData) => void;
  clearRecordedData: () => void;
  nextDataPoint: () => void;
  previousDataPoint: () => void;
}

export const useMotionStore = create<MotionState>()(
  persist(
    (set, get) => ({
      isRecording: false,
      recordedData: [],
      currentDataIndex: 0,

      startRecording: () => {
        console.log('[MotionStore] Starting recording');
        set({
          isRecording: true,
          recordedData: [], // Clear existing data when starting new recording
          currentDataIndex: 0
        });
      },

      stopRecording: () => {
        console.log('[MotionStore] Stopping recording');
        const { recordedData } = get();
        console.log(`[MotionStore] Recorded ${recordedData.length} data points`);
        set({ isRecording: false });
      },

      addDataPoint: (dataPoint: MotionData) => {
        const { isRecording, recordedData } = get();
        if (!isRecording) return;

        console.log('[MotionStore] Adding data point:', {
          type: dataPoint.type,
          timestamp: dataPoint.timestamp,
          values: {
            x: dataPoint.x.toFixed(3),
            y: dataPoint.y.toFixed(3),
            z: dataPoint.z.toFixed(3)
          }
        });

        set({
          recordedData: [...recordedData, dataPoint],
          currentDataIndex: recordedData.length
        });
      },

      clearRecordedData: () => {
        console.log('[MotionStore] Clearing recorded data');
        set({
          recordedData: [],
          currentDataIndex: 0,
          isRecording: false
        });
      },

      nextDataPoint: () => set((state) => {
        const newIndex = Math.min(
          state.currentDataIndex + 1,
          Math.max(0, state.recordedData.length - 1)
        );
        console.log(`[MotionStore] Moving to next data point: ${newIndex + 1}/${state.recordedData.length}`);
        return { currentDataIndex: newIndex };
      }),

      previousDataPoint: () => set((state) => {
        const newIndex = Math.max(0, state.currentDataIndex - 1);
        console.log(`[MotionStore] Moving to previous data point: ${newIndex + 1}/${state.recordedData.length}`);
        return { currentDataIndex: newIndex };
      })
    }),
    {
      name: 'motion-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

