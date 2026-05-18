import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ParticleBackground } from '../components/ParticleBackground';
import { useAppTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { AIAssistant } from '../components/AIAssistant';

export default function CreateScreen() {
  const { isDark } = useAppTheme();
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Form states
  const [personal, setPersonal] = useState({ name: '', title: '', email: '', phone: '' });
  const [experience, setExperience] = useState({ company: '', role: '', duration: '', description: '' });
  const [education, setEducation] = useState({ institution: '', degree: '', year: '' });
  const [skills, setSkills] = useState('');

  const steps = [
    { title: 'Datos Personales', icon: 'person-outline' },
    { title: 'Experiencia', icon: 'briefcase-outline' },
    { title: 'Educación', icon: 'school-outline' },
    { title: 'Habilidades', icon: 'star-outline' },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      // Simulate final creation
      alert('¡CV Creado con éxito!');
      router.replace('/');
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const getStepKey = () => {
    switch (step) {
      case 0: return 'personal';
      case 1: return 'experience';
      case 2: return 'education';
      case 3: return 'skills';
      default: return 'personal';
    }
  };

  const getContextForStep = () => {
    switch (step) {
      case 0: return JSON.stringify(personal);
      case 1: return JSON.stringify(experience);
      case 2: return JSON.stringify(education);
      case 3: return JSON.stringify({ skills });
      default: return '{}';
    }
  };

  const renderInput = (label: string, value: string, onChange: (t: string) => void, multiline = false) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: isDark ? '#9ca3af' : '#4b5563' }]}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d1d5db',
            color: isDark ? '#ffffff' : '#111827'
          },
          multiline && { height: 100, textAlignVertical: 'top' }
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={`Escribe tu ${label.toLowerCase()}...`}
        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
        multiline={multiline}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f9fafb' }]}>
      <ParticleBackground />
      <SafeAreaView style={styles.content}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* Header Tracker */}
            <View style={styles.header}>
              <View style={styles.stepTracker}>
                {steps.map((s, i) => (
                  <View key={i} style={styles.trackerNodeContainer}>
                    <View style={[
                      styles.trackerNode, 
                      { backgroundColor: i <= step ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb') }
                    ]}>
                      <Ionicons name={s.icon as any} size={16} color={i <= step ? '#fff' : '#9ca3af'} />
                    </View>
                    {i < steps.length - 1 && <View style={[styles.trackerLine, { backgroundColor: i < step ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb') }]} />}
                  </View>
                ))}
              </View>
              <Text style={[styles.title, { color: isDark ? '#ffffff' : '#111827' }]}>{steps[step].title}</Text>
              <Text style={[styles.subtitle, { color: isDark ? '#9ca3af' : '#4b5563' }]}>Completa la información para generar tu perfil con IA.</Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              {step === 0 && (
                <>
                  {renderInput('Nombre Completo', personal.name, (t) => setPersonal({...personal, name: t}))}
                  {renderInput('Puesto Profesional', personal.title, (t) => setPersonal({...personal, title: t}))}
                  {renderInput('Correo Electrónico', personal.email, (t) => setPersonal({...personal, email: t}))}
                  {renderInput('Teléfono', personal.phone, (t) => setPersonal({...personal, phone: t}))}
                </>
              )}

              {step === 1 && (
                <>
                  {renderInput('Empresa', experience.company, (t) => setExperience({...experience, company: t}))}
                  {renderInput('Cargo', experience.role, (t) => setExperience({...experience, role: t}))}
                  {renderInput('Duración (ej. 2020 - 2023)', experience.duration, (t) => setExperience({...experience, duration: t}))}
                  {renderInput('Descripción de Logros', experience.description, (t) => setExperience({...experience, description: t}), true)}
                </>
              )}

              {step === 2 && (
                <>
                  {renderInput('Institución', education.institution, (t) => setEducation({...education, institution: t}))}
                  {renderInput('Título', education.degree, (t) => setEducation({...education, degree: t}))}
                  {renderInput('Año de Graduación', education.year, (t) => setEducation({...education, year: t}))}
                </>
              )}

              {step === 3 && (
                <>
                  {renderInput('Habilidades (separadas por coma)', skills, setSkills, true)}
                </>
              )}

              <AIAssistant step={getStepKey()} context={getContextForStep()} />
            </View>

            <View style={styles.buttonRow}>
              {step > 0 ? (
                <TouchableOpacity style={[styles.navButton, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]} onPress={handlePrev}>
                  <Text style={[styles.navButtonText, { color: isDark ? '#ffffff' : '#111827' }]}>Anterior</Text>
                </TouchableOpacity>
              ) : <View style={{flex: 1}} />}
              
              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.primaryButtonText}>{step === steps.length - 1 ? 'Generar CV' : 'Siguiente'}</Text>
                <Ionicons name={step === steps.length - 1 ? "checkmark-circle" : "arrow-forward"} size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  stepTracker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, width: '100%' },
  trackerNodeContainer: { flexDirection: 'row', alignItems: 'center' },
  trackerNode: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  trackerLine: { width: 30, height: 2, marginHorizontal: 4 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  formContainer: { marginBottom: 32 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  aiHint: { flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', gap: 12, marginTop: 8 },
  aiHintText: { flex: 1, fontSize: 13, lineHeight: 18 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  navButton: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navButtonText: { fontSize: 16, fontWeight: '600' },
  primaryButton: { flex: 2, backgroundColor: '#3b82f6', flexDirection: 'row', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
