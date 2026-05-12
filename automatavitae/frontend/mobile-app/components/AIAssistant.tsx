import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../constants/Api';

interface Suggestion {
  id: string;
  text: string;
  type: 'improvement' | 'tip' | 'warning';
}

interface AIAssistantProps {
  step: string;
  context?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ step, context }) => {
  const { isDark } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/suggest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step, context })
        });
        
        if (!response.ok) throw new Error('Error de red');
        const data = await response.json();
        
        if (isMounted) {
          if (data.success && Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
          } else {
            setSuggestions([]);
          }
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        if (isMounted) setSuggestions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSuggestions();

    return () => { isMounted = false; };
  }, [step, context]);

  const getIconColor = (type: string) => {
    switch (type) {
      case 'improvement': return '#2563eb';
      case 'tip': return '#16a34a';
      case 'warning': return '#d97706';
      default: return '#4b5563';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#334155' : '#e5e7eb' }]}>
      <TouchableOpacity 
        style={[styles.header, { backgroundColor: '#2563eb' }]}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={20} color="#ffffff" />
          <Text style={styles.headerTitle}>Asistente Inteligente</Text>
        </View>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#ffffff" />
      </TouchableOpacity>

      {isExpanded && (
        <View style={[styles.content, { backgroundColor: isDark ? '#0f172a' : '#ffffff' }]}>
          {loading ? (
            <ActivityIndicator color="#2563eb" style={{ marginVertical: 20 }} />
          ) : suggestions.length === 0 ? (
            <Text style={[styles.emptyText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>No hay sugerencias por el momento.</Text>
          ) : (
            suggestions.map((suggestion, index) => (
              <View key={suggestion.id || index.toString()} style={[styles.suggestionItem, { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                <Ionicons name="sparkles" size={16} color={getIconColor(suggestion.type)} style={{ marginTop: 2 }} />
                <Text style={[styles.suggestionText, { color: isDark ? '#cbd5e1' : '#334155' }]}>{suggestion.text}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  suggestionItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
