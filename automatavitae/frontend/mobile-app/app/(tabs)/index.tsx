import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ParticleBackground } from '../../components/ParticleBackground';
import { useAppTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f9fafb' }]}>
      {/* Dynamic Skia Particle Background */}
      <ParticleBackground />
      
      {/* Foreground Content */}
      <SafeAreaView style={styles.content}>
        
        {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={28} color={isDark ? '#ffffff' : '#000000'} />
          </TouchableOpacity>
          <View style={styles.navRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={24} color={isDark ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="person-circle-outline" size={28} color={isDark ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#ffffff' : '#111827' }]}>
              Automata<Text style={styles.titleHighlight}>Vitae</Text>
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#9ca3af' : '#4b5563' }]}>El Futuro de tu Carrera Profesional</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              activeOpacity={0.8}
              onPress={() => router.push('/create')}
            >
              <Ionicons name="rocket-outline" size={20} color="#ffffff" style={styles.btnIcon} />
              <Text style={styles.primaryButtonText}>Crear CV con IA</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.secondaryButton, 
                { 
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb'
                }
              ]} 
              activeOpacity={0.8}
              onPress={() => router.push('/analyze')}
            >
              <Ionicons name="cloud-upload-outline" size={20} color={isDark ? '#ffffff' : '#111827'} style={styles.btnIcon} />
              <Text style={[styles.secondaryButtonText, { color: isDark ? '#ffffff' : '#111827' }]}>Analizar CV</Text>
            </TouchableOpacity>
          </View>

          {/* Informative Cards (Letreros) */}
          <View style={styles.cardsContainer}>
            <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }]}>
              <Ionicons name="flash-outline" size={28} color="#3b82f6" style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>Rapidez Total</Text>
              <Text style={[styles.cardText, { color: isDark ? '#9ca3af' : '#4b5563' }]}>Sube tu PDF en segundos para obtener un feedback inteligente e inmediato.</Text>
            </View>

            <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }]}>
              <Ionicons name="sparkles-outline" size={28} color="#a855f7" style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>Feedback IA Directo</Text>
              <Text style={[styles.cardText, { color: isDark ? '#9ca3af' : '#4b5563' }]}>Nuestra IA identifica debilidades en tu redacción y resalta fortalezas clave.</Text>
            </View>

            <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb' }]}>
              <Ionicons name="checkmark-circle-outline" size={28} color="#4ade80" style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#111827' }]}>Scores Precisos</Text>
              <Text style={[styles.cardText, { color: isDark ? '#9ca3af' : '#4b5563' }]}>Recibe una calificación global sobre 10 con advertencias de palabras clave ausentes.</Text>
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
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  titleHighlight: {
    color: '#3b82f6',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  btnIcon: {
    marginRight: 8,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
