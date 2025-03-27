import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface MotionData {
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  x?: number;
  y?: number;
  z?: number;
  type?: string;
  timestamp?: number;
}

interface ThreeDVisualizerProps {
  motionData?: MotionData;
}

const ThreeDVisualizer: React.FC<ThreeDVisualizerProps> = ({ motionData }) => {
  const [deviceOrientation, setDeviceOrientation] = useState({ x: 0, y: 0, z: 0 });
  const webViewRef = useRef(null);
  const [subscription, setSubscription] = useState(null);
  
  // HTML content with Three.js for the WebView
  const htmlContent = `
    <!DOCTYPE html>
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
        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x222222);
        document.body.appendChild(renderer.domElement);

        // Create a cube
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshNormalMaterial();
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // Position camera
        camera.position.z = 5;

        // Handle window resize
        window.addEventListener('resize', () => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        });

        // Animation loop
        function animate() {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        }
        animate();

        // Function to update cube rotation based on device orientation
        function updateCubeOrientation(x, y, z) {
          cube.rotation.x = x;
          cube.rotation.y = y;
          cube.rotation.z = z;
        }

        // Listen for messages from React Native
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
    </html>
  `;

  // Start device orientation tracking
  const startTracking = () => {
    const subscription = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      // Scale values for visualization
      const scaleFactor = 0.3;
      setDeviceOrientation({
        x: y * scaleFactor, // Map to appropriate rotation axis
        y: x * scaleFactor,
        z: z * scaleFactor
      });
    });

    Accelerometer.setUpdateInterval(100); // Update every 100ms
    setSubscription(subscription);
  };

  // Stop tracking
  const stopTracking = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    startTracking();
    
    return () => {
      stopTracking();
    };
  }, []);

  // Send orientation data to WebView
  useEffect(() => {
    if (webViewRef.current) {
      const message = JSON.stringify({
        type: 'orientation',
        ...deviceOrientation
      });
      webViewRef.current.postMessage(message);
    }
  }, [deviceOrientation]);

  // Handle incoming motion data if provided as prop
  useEffect(() => {
    if (motionData && webViewRef.current) {
      // Process motion data and update visualization
      // This would be used for playback of recorded data
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

