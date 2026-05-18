-- Schema para MicroServicioIA (Análisis de CV y Entrevista Chatbot)

-- ==============================================================================
-- 1. Tabla de Análisis de CV
-- Almacena la extracción y el análisis que la IA hace sobre el CV del usuario.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS cv_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Referencia al ID del usuario en user-service
    raw_text TEXT NOT NULL, -- Texto crudo del CV (contexto para el bot)
    skills_extracted JSONB DEFAULT '[]'::jsonb, -- Habilidades identificadas
    strengths TEXT, -- Puntos fuertes
    weaknesses TEXT, -- Áreas de mejora
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. Tabla de Sesiones de Entrevista (Chatbot)
-- Representa una sesión de entrevista interactiva con el bot de IA.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    cv_analysis_id UUID REFERENCES cv_analysis(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. Tabla de Mensajes de Entrevista
-- Almacena el historial de chat entre el usuario y la IA dentro de una sesión.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS interview_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    sender_role VARCHAR(50) NOT NULL CHECK (sender_role IN ('user', 'ai', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Índices para optimizar las consultas
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_cv_analysis_user_id ON cv_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_cv_analysis_id ON interview_sessions(cv_analysis_id);
CREATE INDEX IF NOT EXISTS idx_interview_messages_session_id ON interview_messages(session_id);
