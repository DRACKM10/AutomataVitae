import puppeteer from 'puppeteer';
import { GenerateCvPdfDto, GenerateAnalysisReportDto } from '../types/pdf.types';

export class PdfGeneratorService {

    /**
     * Genera el HTML del CV y lo convierte a PDF con Puppeteer
     */
    async generateCvPdf(dto: GenerateCvPdfDto): Promise<Buffer> {
        const html = this.buildCvHtml(dto);
        return this.htmlToBuffer(html);
    }

    /**
     * Genera el HTML del reporte de análisis IA y lo convierte a PDF
     */
    async generateAnalysisReportPdf(dto: GenerateAnalysisReportDto): Promise<Buffer> {
        const html = this.buildAnalysisReportHtml(dto);
        return this.htmlToBuffer(html);
    }

    // ─── Puppeteer core ───────────────────────────────────────────────────────

    private async htmlToBuffer(html: string): Promise<Buffer> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
            });
            return Buffer.from(pdfBuffer);
        } finally {
            await browser.close();
        }
    }

    // ─── Templates HTML ───────────────────────────────────────────────────────

    private buildCvHtml(dto: GenerateCvPdfDto): string {
        const { resumeData } = dto;
        const { personalInfo, experience, education, skills } = resumeData;

        const formatDate = (dateStr: string) => {
            if (!dateStr) return '';
            const [year, month] = dateStr.split('-');
            const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
            return `${months[parseInt(month, 10) - 1]} ${year}`;
        };

        const experienceHtml = experience.map(exp => `
            <div class="entry">
                <div class="entry-header">
                    <div>
                        <h4 class="entry-title">${exp.position}</h4>
                        <p class="entry-subtitle">${exp.company}</p>
                    </div>
                    <span class="entry-date">
                        ${formatDate(exp.startDate)} — ${exp.current ? 'Presente' : formatDate(exp.endDate)}
                    </span>
                </div>
                <p class="entry-description">${exp.description || ''}</p>
            </div>
        `).join('');

        const educationHtml = education.map(edu => `
            <div class="entry">
                <div class="entry-header">
                    <div>
                        <h4 class="entry-title">${edu.degree}</h4>
                        <p class="entry-subtitle">${edu.institution}${edu.field ? ` · ${edu.field}` : ''}</p>
                    </div>
                    <span class="entry-date">
                        ${formatDate(edu.startDate)} — ${edu.current ? 'Presente' : formatDate(edu.endDate)}
                    </span>
                </div>
            </div>
        `).join('');

        const skillsHtml = skills.map(s => `<span class="skill-tag">${s}</span>`).join('');

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${personalInfo.fullName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 11pt; line-height: 1.5; }

        .header { border-bottom: 4px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 26pt; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .header h2 { font-size: 14pt; font-weight: 500; color: #1d4ed8; margin-bottom: 12px; }
        .contact-row { display: flex; gap: 20px; font-size: 9pt; color: #475569; flex-wrap: wrap; }
        .contact-item { display: flex; align-items: center; gap: 4px; }

        .section { margin-bottom: 22px; }
        .section-title {
            font-size: 10pt; font-weight: 700; text-transform: uppercase;
            letter-spacing: 1.5px; color: #0f172a;
            border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 14px;
        }
        .summary { color: #334155; text-align: justify; font-size: 10pt; }

        .entry { margin-bottom: 14px; padding-left: 14px; border-left: 3px solid #1d4ed8; }
        .entry-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
        .entry-title { font-size: 11pt; font-weight: 600; color: #0f172a; }
        .entry-subtitle { font-size: 10pt; color: #1d4ed8; font-weight: 500; }
        .entry-date { font-size: 9pt; color: #64748b; white-space: nowrap; margin-left: 8px; }
        .entry-description { font-size: 9.5pt; color: #475569; margin-top: 4px; white-space: pre-line; }

        .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag {
            background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;
            border-radius: 20px; padding: 3px 12px; font-size: 9pt; font-weight: 500;
        }

        .footer {
            margin-top: 30px; text-align: center; font-size: 8pt; color: #94a3b8;
            border-top: 1px solid #e2e8f0; padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${personalInfo.fullName || 'Sin nombre'}</h1>
        <h2>${personalInfo.title || ''}</h2>
        <div class="contact-row">
            ${personalInfo.email ? `<span class="contact-item">✉ ${personalInfo.email}</span>` : ''}
            ${personalInfo.phone ? `<span class="contact-item">✆ ${personalInfo.phone}</span>` : ''}
            ${personalInfo.location ? `<span class="contact-item">⊙ ${personalInfo.location}</span>` : ''}
        </div>
    </div>

    ${personalInfo.summary ? `
    <div class="section">
        <h3 class="section-title">Resumen Profesional</h3>
        <p class="summary">${personalInfo.summary}</p>
    </div>` : ''}

    ${experience.length > 0 ? `
    <div class="section">
        <h3 class="section-title">Experiencia Laboral</h3>
        ${experienceHtml}
    </div>` : ''}

    ${education.length > 0 ? `
    <div class="section">
        <h3 class="section-title">Educación</h3>
        ${educationHtml}
    </div>` : ''}

    ${skills.length > 0 ? `
    <div class="section">
        <h3 class="section-title">Habilidades</h3>
        <div class="skills-container">${skillsHtml}</div>
    </div>` : ''}

    <div class="footer">Generado con AutomataVitae · ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
</body>
</html>`;
    }

    private buildAnalysisReportHtml(dto: GenerateAnalysisReportDto): string {
        const { analysisData } = dto;
        const scoreColor = analysisData.score >= 75 ? '#16a34a' : analysisData.score >= 50 ? '#d97706' : '#dc2626';

        const strengthsHtml = analysisData.strengths.map(s => `<li class="list-item strength">✓ ${s}</li>`).join('');
        const improvementsHtml = analysisData.improvements.map(i => `<li class="list-item improvement">⚠ ${i}</li>`).join('');
        const keywordsHtml = analysisData.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('');

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Análisis de CV - AutomataVitae</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 11pt; line-height: 1.6; }

        .report-header {
            background: linear-gradient(135deg, #1e3a8a, #3730a3);
            color: white; padding: 30px; margin-bottom: 28px; border-radius: 0 0 12px 12px;
        }
        .report-header h1 { font-size: 22pt; font-weight: 700; margin-bottom: 6px; }
        .report-header p { font-size: 10pt; opacity: 0.8; }

        .score-card {
            background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px;
            padding: 20px; text-align: center; margin-bottom: 28px;
        }
        .score-value { font-size: 52pt; font-weight: 800; color: ${scoreColor}; line-height: 1; }
        .score-label { font-size: 10pt; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }

        .section { margin-bottom: 24px; }
        .section-title {
            font-size: 11pt; font-weight: 700; text-transform: uppercase;
            letter-spacing: 1px; color: #0f172a;
            border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; margin-bottom: 14px;
        }
        .summary-text { color: #334155; text-align: justify; background: #f1f5f9; padding: 14px; border-radius: 8px; }

        .list-item { padding: 6px 0; font-size: 10pt; border-bottom: 1px solid #f1f5f9; }
        .strength { color: #166534; }
        .improvement { color: #92400e; }

        .keywords-container { display: flex; flex-wrap: wrap; gap: 8px; }
        .keyword-tag {
            background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;
            border-radius: 20px; padding: 3px 12px; font-size: 9pt; font-weight: 500;
        }

        .footer {
            margin-top: 30px; text-align: center; font-size: 8pt; color: #94a3b8;
            border-top: 1px solid #e2e8f0; padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>📊 Reporte de Análisis de CV</h1>
        <p>Generado por AutomataVitae IA · ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="score-card">
        <div class="score-value">${analysisData.score}</div>
        <div class="score-label">Puntuación del CV / 100</div>
    </div>

    <div class="section">
        <h3 class="section-title">Resumen del Análisis</h3>
        <p class="summary-text">${analysisData.summary}</p>
    </div>

    <div class="section">
        <h3 class="section-title">Fortalezas</h3>
        <ul style="list-style: none;">${strengthsHtml}</ul>
    </div>

    <div class="section">
        <h3 class="section-title">Áreas de Mejora</h3>
        <ul style="list-style: none;">${improvementsHtml}</ul>
    </div>

    ${analysisData.keywords.length > 0 ? `
    <div class="section">
        <h3 class="section-title">Palabras Clave Detectadas</h3>
        <div class="keywords-container">${keywordsHtml}</div>
    </div>` : ''}

    <div class="footer">AutomataVitae · Análisis generado con Inteligencia Artificial</div>
</body>
</html>`;
    }
}
