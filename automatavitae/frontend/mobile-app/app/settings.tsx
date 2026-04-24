import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { ParticleBackground } from '../components/ParticleBackground';

export default function SettingsScreen() {
  const { isDark, setTheme, theme } = useAppTheme();
  const [language, setLanguage] = useState<'ES' | 'EN'>('ES');
  const [notifications, setNotifications] = useState(true);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };
  
  const toggleLanguage = () => setLanguage(prev => prev === 'ES' ? 'EN' : 'ES');
  const toggleNotifications = () => setNotifications(!notifications);

  const isDarkTheme = isDark; 

  return (
    <View style={[styles.container, { backgroundColor: isDarkTheme ? '#000000' : '#f9fafb' }]}>
      <ParticleBackground />

      <SafeAreaView style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkTheme ? '#3b82f6' : '#2563eb' }]}>
              {language === 'ES' ? 'Apariencia' : 'Appearance'}
            </Text>
            
            <View style={[styles.settingRow, { backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
              <View style={styles.settingInfo}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={24} color={isDarkTheme ? '#fff' : '#000'} />
                <Text style={[styles.settingText, { color: isDarkTheme ? '#fff' : '#000' }]}>
                  {language === 'ES' ? 'Modo Oscuro' : 'Dark Mode'}
                </Text>
              </View>
              <Switch
                value={isDarkTheme}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: '#3b82f6' }}
                thumbColor={'#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkTheme ? '#3b82f6' : '#2563eb' }]}>
              {language === 'ES' ? 'Idioma' : 'Language'}
            </Text>
            
            <TouchableOpacity 
              style={[styles.settingRow, { backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#ffffff' }]} 
              onPress={toggleLanguage}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="language-outline" size={24} color={isDarkTheme ? '#fff' : '#000'} />
                <Text style={[styles.settingText, { color: isDarkTheme ? '#fff' : '#000' }]}>
                  {language === 'ES' ? 'Cambiar a Inglés' : 'Switch to Spanish'}
                </Text>
              </View>
              <Text style={[styles.badge, { color: isDarkTheme ? '#9ca3af' : '#6b7280' }]}>{language}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkTheme ? '#3b82f6' : '#2563eb' }]}>
              {language === 'ES' ? 'Ajustes Generales' : 'General Settings'}
            </Text>

            <View style={[styles.settingRow, { backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#ffffff', borderBottomWidth: 1, borderBottomColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={24} color={isDarkTheme ? '#fff' : '#000'} />
                <Text style={[styles.settingText, { color: isDarkTheme ? '#fff' : '#000' }]}>
                  {language === 'ES' ? 'Notificaciones' : 'Notifications'}
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#767577', true: '#3b82f6' }}
                thumbColor={'#f4f3f4'}
              />
            </View>

            <TouchableOpacity style={[styles.settingRow, { backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="shield-checkmark-outline" size={24} color={isDarkTheme ? '#fff' : '#000'} />
                <Text style={[styles.settingText, { color: isDarkTheme ? '#fff' : '#000' }]}>
                  {language === 'ES' ? 'Privacidad y Seguridad' : 'Privacy & Security'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDarkTheme ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingRow, { backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : '#ffffff', marginTop: 1 }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="information-circle-outline" size={24} color={isDarkTheme ? '#fff' : '#000'} />
                <Text style={[styles.settingText, { color: isDarkTheme ? '#fff' : '#000' }]}>
                  {language === 'ES' ? 'Acerca de AutomataVitae' : 'About AutomataVitae'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDarkTheme ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton}>
              <Text style={styles.logoutText}>
                {language === 'ES' ? 'Cerrar Sesión' : 'Log Out'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>v1.0.0</Text>
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
    paddingTop: 10,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 16,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    color: '#9ca3af',
    fontSize: 12,
  }
});
