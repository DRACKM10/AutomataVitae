// Tipos del dominio PDF

export type PdfType = 'cv' | 'analysis_report';

export interface PdfRecord {
    id: string;
    user_id: string;
    type: PdfType;
    template: string | null;
    filename: string | null;
    storage_url: string | null;
    metadata: Record<string, any> | null;
    created_at: Date;
}

export interface CreatePdfRecordDto {
    userId: string;
    type: PdfType;
    template?: string;
    filename?: string;
    storageUrl?: string;
    metadata?: Record<string, any>;
}

// Payload que recibe el endpoint de generación de CV
export interface GenerateCvPdfDto {
    userId: string;
    resumeData: {
        personalInfo: {
            fullName: string;
            title: string;
            email: string;
            phone?: string;
            location?: string;
            summary?: string;
        };
        experience: Array<{
            id: string;
            position: string;
            company: string;
            startDate: string;
            endDate: string;
            current: boolean;
            description: string;
        }>;
        education: Array<{
            id: string;
            degree: string;
            institution: string;
            field?: string;
            startDate: string;
            endDate: string;
            current: boolean;
        }>;
        skills: string[];
    };
    template?: string;
}

// Payload para reporte de análisis IA
export interface GenerateAnalysisReportDto {
    userId: string;
    analysisData: {
        score: number;
        strengths: string[];
        improvements: string[];
        keywords: string[];
        summary: string;
    };
}

// Respuesta estándar de la API
export interface PdfApiResponse {
    success: boolean;
    message: string;
    data?: any;
}
