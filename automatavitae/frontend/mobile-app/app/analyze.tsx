import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParticleBackground } from '../components/ParticleBackground';
import { useAppTheme } from '../context/ThemeContext';

export default function AnalyzeScreen() {
  const { isDark } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f9fafb' }]}>
      <ParticleBackground />
      <SafeAreaView style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons name="document-text" size={48} color="#a855f7" />
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#111827' }]}>Analizar CV</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#9ca3af' : '#4b5563' }]}>Sube tu currículum en formato PDF y deja que nuestra IA lo evalúe al instante.</Text>
          </View>

          <View style={[styles.uploadArea, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1' }]}>
            <Ionicons name="cloud-upload-outline" size={64} color={isDark ? '#6b7280' : '#94a3b8'} style={styles.uploadIcon} />
            <Text style={[styles.uploadTitle, { color: isDark ? '#ffffff' : '#1e293b' }]}>Sube tu archivo PDF</Text>
            <Text style={[styles.uploadSubtitle, { color: isDark ? '#6b7280' : '#64748b' }]}>Tamaño máximo: 5MB</Text>
            
            <TouchableOpacity style={styles.selectFileButton}>
              <Text style={styles.selectFileText}>Seleccionar Archivo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCards}>
            <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff', borderWidth: isDark ? 0 : 1, borderColor: '#e2e8f0' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#4ade80" />
              <Text style={[styles.infoText, { color: isDark ? '#d1d5db' : '#475569' }]}>Privacidad garantizada. No compartimos tus datos con terceros.</Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff', borderWidth: isDark ? 0 : 1, borderColor: '#e2e8f0' }]}>
              <Ionicons name="speedometer" size={24} color="#facc15" />
              <Text style={[styles.infoText, { color: isDark ? '#d1d5db' : '#475569' }]}>Resultados en menos de 10 segundos.</Text>
            </View>
          </View>
          
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  uploadIcon: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  selectFileButton: {
    backgroundColor: '#a855f7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  selectFileText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCards: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
