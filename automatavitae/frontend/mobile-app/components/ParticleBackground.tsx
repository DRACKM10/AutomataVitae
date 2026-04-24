import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Canvas, Points, vec } from '@shopify/react-native-skia';
import { useSharedValue, useFrameCallback, useDerivedValue } from 'react-native-reanimated';
import { useAppTheme } from '../context/ThemeContext';

const COLORS = [
  '#3b82f6', // blue
  '#f87171', // red
  '#facc15', // yellow
  '#a855f7', // purple
  '#4ade80', // green
  '#f472b6'  // pink
];

interface ParticleData {
  initialAngle: number;
  distance: number;
  speed: number;
}

const ParticleGroup = ({ color, particles, width, height, time }: { color: string, particles: ParticleData[], width: number, height: number, time: any }) => {
  const points = useDerivedValue(() => {
    const t = time.value;
    const centerX = width / 2;
    const centerY = height / 2;
    
    return particles.map(p => {
      const currentAngle = p.initialAngle + (p.speed * t);
      const x = centerX + Math.cos(currentAngle) * p.distance;
      const y = centerY + Math.sin(currentAngle) * p.distance;
      return vec(x, y);
    });
  }, [time, width, height]);

  return <Points points={points} color={color} style="fill" strokeWidth={3} />;
};

export function ParticleBackground() {
  const { width, height } = useWindowDimensions();
  const { isDark } = useAppTheme();
  
  const time = useSharedValue(0);
  
  useFrameCallback((frameInfo) => {
    if (frameInfo.timeSincePreviousFrame) {
      time.value += frameInfo.timeSincePreviousFrame;
    }
  });

  const particlesByColor = useMemo(() => {
    const particleCount = Math.min(Math.floor(width / 2.5), 150);
    const groups: Record<string, ParticleData[]> = {};
    COLORS.forEach(c => groups[c] = []);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (Math.max(width, height) * 0.6);
      const speed = (Math.random() * 0.0001) + 0.00005; 
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      groups[color].push({ initialAngle: angle, distance, speed });
    }
    
    return groups;
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[
        styles.glow, 
        { 
          top: height / 2 - 200, 
          left: width / 2 - 200,
          backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)' 
        }
      ]} />

      <Canvas style={StyleSheet.absoluteFill}>
        {COLORS.map(color => {
          const particles = particlesByColor[color];
          if (particles.length === 0) return null;
          
          return (
            <ParticleGroup 
              key={color}
              color={color}
              particles={particles}
              width={width}
              height={height}
              time={time}
            />
          );
        })}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  }
});
