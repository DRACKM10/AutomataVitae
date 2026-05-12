import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { ParticleBackground } from '../components/ParticleBackground';
import { useAppTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../constants/Api';

export default function AnalyzeScreen() {
  const { isDark } = useAppTheme();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
        setResult(null);
      }
    } catch (err) {
      console.log('Error picking document:', err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('cv', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf',
      } as any);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data.analysis);
      } else {
        Alert.alert('Error', data.error?.message || 'Error al analizar el CV');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

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
            <Ionicons name={file ? "document" : "cloud-upload-outline"} size={64} color={isDark ? '#6b7280' : '#94a3b8'} style={styles.uploadIcon} />
            <Text style={[styles.uploadTitle, { color: isDark ? '#ffffff' : '#1e293b' }]}>
              {file ? file.name : 'Sube tu archivo PDF'}
            </Text>
            <Text style={[styles.uploadSubtitle, { color: isDark ? '#6b7280' : '#64748b' }]}>
              {file ? `${(file.size! / 1024 / 1024).toFixed(2)} MB` : 'Tamaño máximo: 5MB'}
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.selectFileButton} onPress={pickDocument}>
                <Text style={styles.selectFileText}>{file ? 'Cambiar' : 'Seleccionar Archivo'}</Text>
              </TouchableOpacity>
              
              {file && (
                <TouchableOpacity 
                  style={[styles.selectFileButton, { backgroundColor: '#3b82f6', opacity: loading ? 0.7 : 1 }]} 
                  onPress={handleUpload}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.selectFileText}>Analizar</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {result && (
            <View style={[styles.resultContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }]}>
              <Text style={[styles.resultTitle, { color: isDark ? '#fff' : '#111827' }]}>Puntuación: {result.score}/100</Text>
              <Text style={[styles.resultSubtitle, { color: isDark ? '#d1d5db' : '#4b5563' }]}>{result.summary}</Text>
              
              <Text style={[styles.sectionTitle, { color: '#4ade80' }]}>Fortalezas</Text>
              {result.strengths?.map((str: string, i: number) => (
                <Text key={i} style={[styles.listItem, { color: isDark ? '#d1d5db' : '#4b5563' }]}>• {str}</Text>
              ))}

              <Text style={[styles.sectionTitle, { color: '#facc15', marginTop: 10 }]}>Sugerencias</Text>
              {result.suggestions?.map((sug: string, i: number) => (
                <Text key={i} style={[styles.listItem, { color: isDark ? '#d1d5db' : '#4b5563' }]}>• {sug}</Text>
              ))}
            </View>
          )}

          {!result && (
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
          )}
          
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
    textAlign: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
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
  resultContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 15,
    marginBottom: 16,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
});
