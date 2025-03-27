import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Accelerometer } from 'expo-sensors';
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

interface ThreeDVisualizerProps {
  motionData?: MotionData | null;
}

interface DeviceOrientation {
  x: number;
  y: number;
  z: number;
}

const ThreeDVisualizer: React.FC<ThreeDVisualizerProps> = ({ motionData }) => {
  const [deviceOrientation, setDeviceOrientation] = useState<DeviceOrientation>({ x: 0, y: 0, z: 0 });
  const webViewRef = useRef<WebView | null>(null);
  const [subscription, setSubscription] = useState<Accelerometer.Subscription | null>(null);

  // HTML content with Three.js for the WebView
  const htmlContent = `<!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script>
    </head>
    <body>
      <script>
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x222222);
        document.body.appendChild(renderer.domElement);

        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshNormalMaterial();
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        camera.position.z = 5;

        window.addEventListener('resize', () => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        });

        function animate() {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        }
        animate();

        function updateCubeOrientation(x, y, z) {
          cube.rotation.x = x;
          cube.rotation.y = y;
          cube.rotation.z = z;
        }

        window.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'orientation') {
              updateCubeOrientation(data.x, data.y, data.z);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
      </script>
    </body>
    </html>`;

  const startTracking = () => {
    const subscription = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      const scaleFactor = 0.3;
      setDeviceOrientation({
        x: y * scaleFactor,
        y: x * scaleFactor,
        z: z * scaleFactor
      });
    });

    Accelerometer.setUpdateInterval(100);
    setSubscription(subscription);
  };

  const stopTracking = () => {
    subscription?.remove();
    setSubscription(null);
  };

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    if (webViewRef.current) {
      const message = JSON.stringify({
        type: 'orientation',
        ...deviceOrientation
      });
      webViewRef.current.postMessage(message);
    }
  }, [deviceOrientation]);

  useEffect(() => {
    if (motionData && webViewRef.current) {
      const message = JSON.stringify({
        type: 'orientation',
        x: motionData.rotationX || 0,
        y: motionData.rotationY || 0,
        z: motionData.rotationZ || 0
      });
      webViewRef.current.postMessage(message);
    }
  }, [motionData]);

  return (
    <ThemedView style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        bounces={false}
        scrollEnabled={false}
        onError={(error) => console.error('WebView error:', error)}
      />
      <ThemedView style={styles.overlay}>
        <ThemedText style={styles.text}>
          Orientation: X: {deviceOrientation.x.toFixed(2)}, 
          Y: {deviceOrientation.y.toFixed(2)}, 
          Z: {deviceOrientation.z.toFixed(2)}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: '#fff',
    fontSize: 12,
  }
});

export default ThreeDVisualizer;
