import Anthropic from '@anthropic-ai/sdk';

// Verificar que existe la API key
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error(' ANTHROPIC_API_KEY no está configurada en el archivo .env');
}

// Inicializar cliente de Anthropic
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configuración del modelo
export const MODEL = 'claude-sonnet-4-20250514';
export const MAX_TOKENS = 4096;