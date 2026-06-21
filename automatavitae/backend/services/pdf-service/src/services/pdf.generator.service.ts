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
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
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
        const { template } = dto;

        switch (template) {
            case 'modern_glass':
                return this.buildModernGlassHtml(dto);
            case 'executive_split':
                return this.buildExecutiveSplitHtml(dto);
            case 'creative_studio':
                return this.buildCreativeStudioHtml(dto);
            case 'automata_standard':
            default:
                return this.buildStandardCvHtml(dto);
        }
    }

    private formatDate(dateStr: string) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 2) return dateStr;
        const [year, month] = parts;
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const monthIdx = parseInt(month, 10) - 1;
        const monthName = months[monthIdx] || month;
        return `${monthName} ${year}`;
    }

    // 1. Standard Template
    private buildStandardCvHtml(dto: GenerateCvPdfDto): string {
        const { personalInfo, experience, education, skills } = dto.resumeData;
        const formatDate = this.formatDate;

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
        .section-title { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 14px; }
        .summary { color: #334155; text-align: justify; font-size: 10pt; }
        .entry { margin-bottom: 14px; padding-left: 14px; border-left: 3px solid #1d4ed8; }
        .entry-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
        .entry-title { font-size: 11pt; font-weight: 600; color: #0f172a; }
        .entry-subtitle { font-size: 10pt; color: #1d4ed8; font-weight: 500; }
        .entry-date { font-size: 9pt; color: #64748b; white-space: nowrap; margin-left: 8px; }
        .entry-description { font-size: 9.5pt; color: #475569; margin-top: 4px; white-space: pre-line; }
        .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 20px; padding: 3px 12px; font-size: 9pt; font-weight: 500; }
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
</body>
</html>`;
    }

    // 2. Modern Glass
    private buildModernGlassHtml(dto: GenerateCvPdfDto): string {
        const { personalInfo, experience, education, skills } = dto.resumeData;
        const formatDate = this.formatDate;

        const experienceHtml = experience.map(exp => `
            <div class="entry">
                <h4 class="entry-title">${exp.position}</h4>
                <div class="entry-meta">
                    <span class="company">${exp.company}</span>
                    <span class="dot">•</span>
                    <span class="date">${formatDate(exp.startDate)} - ${exp.current ? 'Presente' : formatDate(exp.endDate)}</span>
                </div>
                <p class="entry-desc">${exp.description || ''}</p>
            </div>
        `).join('');

        const educationHtml = education.map(edu => `
            <div class="edu-card">
                <h4 class="entry-title">${edu.degree}</h4>
                <p class="edu-inst">${edu.institution} ${edu.field ? `— ${edu.field}` : ''}</p>
                <p class="date mt-1">${formatDate(edu.startDate)} - ${edu.current ? 'Presente' : formatDate(edu.endDate)}</p>
            </div>
        `).join('');

        const skillsHtml = skills.map(s => `<span class="skill-tag">${s}</span>`).join('');

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>CV - ${personalInfo.fullName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; font-size: 11pt; line-height: 1.6; }
        .container { padding: 0 10px; }
        .header { border-bottom: 1px solid rgba(59, 130, 246, 0.3); padding-bottom: 20px; margin-bottom: 24px; }
        .header h1 { font-size: 28pt; font-weight: 900; color: #ffffff; margin-bottom: 4px; letter-spacing: -0.5px; }
        .header h2 { font-size: 14pt; font-weight: 600; color: #60a5fa; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .contact-row { display: flex; gap: 20px; font-size: 9pt; color: #94a3b8; }
        .contact-item { display: flex; align-items: center; gap: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #3b82f6; margin-bottom: 14px; }
        .summary { color: #cbd5e1; font-weight: 300; text-align: justify; }
        .entry { margin-bottom: 16px; padding-left: 14px; border-left: 2px solid rgba(59, 130, 246, 0.3); position: relative; }
        .entry::before { content: ""; position: absolute; left: -5.5px; top: 6px; width: 9px; height: 9px; border-radius: 50%; background: #3b82f6; box-shadow: 0 0 6px #3b82f6; }
        .entry-title { font-size: 12pt; font-weight: 700; color: #ffffff; }
        .entry-meta { display: flex; gap: 8px; align-items: center; font-size: 10pt; margin-bottom: 4px; }
        .company { color: #93c5fd; font-weight: 500; }
        .dot { color: #475569; }
        .date { color: #64748b; font-family: monospace; font-size: 9pt; }
        .entry-desc { color: #94a3b8; font-weight: 300; white-space: pre-line; }
        .edu-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 10px; }
        .edu-inst { color: #93c5fd; font-size: 10pt; margin-top: 2px; }
        .mt-1 { margin-top: 4px; }
        .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { background: rgba(59, 130, 246, 0.1); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 6px; padding: 4px 12px; font-size: 9pt; font-weight: 500; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${personalInfo.fullName || 'Sin nombre'}</h1>
            <h2>${personalInfo.title || ''}</h2>
            <div class="contact-row">
                ${personalInfo.email ? `<span class="contact-item">✉ ${personalInfo.email}</span>` : ''}
                ${personalInfo.phone ? `<span class="contact-item">✆ ${personalInfo.phone}</span>` : ''}
                ${personalInfo.location ? `<span class="contact-item">⊙ ${personalInfo.location}</span>` : ''}
            </div>
        </div>
        ${personalInfo.summary ? `<div class="section"><h3 class="section-title">Resumen</h3><p class="summary">${personalInfo.summary}</p></div>` : ''}
        ${experience.length > 0 ? `<div class="section"><h3 class="section-title">Experiencia</h3><div class="space-y-4">${experienceHtml}</div></div>` : ''}
        ${education.length > 0 ? `<div class="section"><h3 class="section-title">Educación</h3><div class="space-y-4">${educationHtml}</div></div>` : ''}
        ${skills.length > 0 ? `<div class="section"><h3 class="section-title">Habilidades</h3><div class="skills-container">${skillsHtml}</div></div>` : ''}
    </div>
</body>
</html>`;
    }

    // 3. Executive Split
    private buildExecutiveSplitHtml(dto: GenerateCvPdfDto): string {
        const { personalInfo, experience, education, skills } = dto.resumeData;
        const formatDate = this.formatDate;

        const experienceHtml = experience.map(exp => `
            <div class="entry">
                <div class="entry-header">
                    <h4 class="entry-title">${exp.position}</h4>
                    <span class="date-badge">${formatDate(exp.startDate)} - ${exp.current ? 'Presente' : formatDate(exp.endDate)}</span>
                </div>
                <p class="company">${exp.company}</p>
                <p class="entry-desc">${exp.description || ''}</p>
            </div>
        `).join('');

        const educationHtml = education.map(edu => `
            <div class="entry">
                <h4 class="entry-title">${edu.degree}</h4>
                <p class="company">${edu.institution} ${edu.field ? `· ${edu.field}` : ''}</p>
                <p class="date-text">${formatDate(edu.startDate)} - ${edu.current ? 'Presente' : formatDate(edu.endDate)}</p>
            </div>
        `).join('');

        const skillsHtml = skills.map(s => `<li class="skill-item">${s}</li>`).join('');

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; font-size: 10pt; line-height: 1.5; display: flex; height: 100vh; }
        .left-col { width: 33.33%; background: #1e293b; color: #f8fafc; padding: 30px 20px; height: 100vh; }
        .right-col { width: 66.66%; background: #ffffff; padding: 30px; height: 100vh; }
        .name { font-size: 20pt; font-weight: 700; margin-bottom: 8px; line-height: 1.1; }
        .title { font-size: 11pt; color: #93c5fd; font-weight: 500; margin-bottom: 30px; }
        .contact-list { margin-bottom: 40px; border-bottom: 1px solid #334155; padding-bottom: 30px; }
        .contact-item { font-size: 9pt; margin-bottom: 10px; color: #cbd5e1; display: flex; align-items: center; gap: 6px; word-break: break-all; }
        .section-title-left { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 16px; }
        .skill-list { list-style: none; }
        .skill-item { font-size: 9.5pt; margin-bottom: 8px; border-left: 2px solid #3b82f6; padding-left: 8px; color: #f1f5f9; }
        
        .section-right { margin-bottom: 24px; }
        .section-title-right { font-size: 12pt; font-weight: 700; color: #1f2937; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 16px; }
        .summary { color: #4b5563; text-align: justify; font-size: 9.5pt; }
        
        .entry { margin-bottom: 18px; }
        .entry-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
        .entry-title { font-size: 11pt; font-weight: 700; color: #111827; }
        .date-badge { font-size: 8pt; color: #6b7280; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
        .date-text { font-size: 8pt; color: #6b7280; margin-top: 2px; }
        .company { color: #1d4ed8; font-weight: 600; font-size: 9.5pt; margin-bottom: 6px; }
        .entry-desc { color: #4b5563; font-size: 9.5pt; white-space: pre-line; }
    </style>
</head>
<body>
    <div class="left-col">
        <h1 class="name">${personalInfo.fullName || 'Sin nombre'}</h1>
        <h2 class="title">${personalInfo.title || ''}</h2>
        <div class="contact-list">
            ${personalInfo.email ? `<div class="contact-item">✉ ${personalInfo.email}</div>` : ''}
            ${personalInfo.phone ? `<div class="contact-item">✆ ${personalInfo.phone}</div>` : ''}
            ${personalInfo.location ? `<div class="contact-item">⊙ ${personalInfo.location}</div>` : ''}
        </div>
        ${skills.length > 0 ? `<div><h3 class="section-title-left">Habilidades</h3><ul class="skill-list">${skillsHtml}</ul></div>` : ''}
    </div>
    <div class="right-col">
        ${personalInfo.summary ? `<div class="section-right"><h3 class="section-title-right">Perfil</h3><p class="summary">${personalInfo.summary}</p></div>` : ''}
        ${experience.length > 0 ? `<div class="section-right"><h3 class="section-title-right">Experiencia</h3>${experienceHtml}</div>` : ''}
        ${education.length > 0 ? `<div class="section-right"><h3 class="section-title-right">Educación</h3>${educationHtml}</div>` : ''}
    </div>
</body>
</html>`;
    }

    // 4. Creative Studio
    private buildCreativeStudioHtml(dto: GenerateCvPdfDto): string {
        const { personalInfo, experience, education, skills } = dto.resumeData;
        const formatDate = this.formatDate;

        const experienceHtml = experience.map(exp => `
            <div class="entry">
                <p class="date">${formatDate(exp.startDate)} — ${exp.current ? 'Presente' : formatDate(exp.endDate)}</p>
                <h4 class="entry-title">${exp.position}</h4>
                <p class="company">${exp.company}</p>
                <p class="entry-desc">${exp.description || ''}</p>
            </div>
        `).join('');

        const educationHtml = education.map(edu => `
            <div class="entry">
                <p class="date">${formatDate(edu.startDate)} — ${edu.current ? 'Presente' : formatDate(edu.endDate)}</p>
                <h4 class="entry-title">${edu.degree}</h4>
                <p class="company">${edu.institution}</p>
            </div>
        `).join('');

        const skillsHtml = skills.map(s => `<span class="skill-tag">${s}</span>`).join('');

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; color: #1f2937; font-size: 10pt; line-height: 1.6; background: #fafafa; padding: 40px; }
        
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 28pt; font-weight: 900; color: #000; margin-bottom: 8px; letter-spacing: -1px; }
        .header h2 { font-size: 12pt; color: #6b7280; font-style: italic; margin-bottom: 12px; }
        .contact { display: flex; justify-content: center; gap: 12px; font-size: 8pt; font-family: 'Arial', sans-serif; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; }
        
        .summary { margin-bottom: 40px; text-align: center; font-style: italic; color: #4b5563; padding: 0 40px; }
        
        .grid { display: flex; gap: 40px; }
        .col { flex: 1; }
        
        .section { margin-bottom: 30px; }
        .section-title { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #000; border-top: 2px solid #000; padding-top: 8px; margin-bottom: 20px; font-family: 'Arial', sans-serif; }
        
        .entry { margin-bottom: 20px; }
        .date { font-size: 8pt; font-family: 'Arial', sans-serif; color: #9ca3af; margin-bottom: 4px; }
        .entry-title { font-size: 11pt; font-weight: 700; color: #111827; }
        .company { font-size: 10pt; font-weight: 500; color: #374151; margin-bottom: 6px; }
        .entry-desc { font-size: 9.5pt; color: #4b5563; white-space: pre-line; }
        
        .skills-container { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { border: 1px solid #d1d5db; color: #4b5563; padding: 2px 8px; border-radius: 2px; font-size: 8.5pt; font-family: 'Arial', sans-serif; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${personalInfo.fullName || 'Sin nombre'}</h1>
        <h2>${personalInfo.title || ''}</h2>
        <div class="contact">
            ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
            ${personalInfo.phone ? `<span>• ${personalInfo.phone}</span>` : ''}
            ${personalInfo.location ? `<span>• ${personalInfo.location}</span>` : ''}
        </div>
    </div>
    
    ${personalInfo.summary ? `<div class="summary"><p>"${personalInfo.summary}"</p></div>` : ''}
    
    <div class="grid">
        <div class="col">
            ${experience.length > 0 ? `<div class="section"><h3 class="section-title">Experiencia</h3>${experienceHtml}</div>` : ''}
        </div>
        <div class="col">
            ${education.length > 0 ? `<div class="section"><h3 class="section-title">Educación</h3>${educationHtml}</div>` : ''}
            ${skills.length > 0 ? `<div class="section"><h3 class="section-title">Habilidades</h3><div class="skills-container">${skillsHtml}</div></div>` : ''}
        </div>
    </div>
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
        .report-header { background: linear-gradient(135deg, #1e3a8a, #3730a3); color: white; padding: 30px; margin-bottom: 28px; border-radius: 0 0 12px 12px; }
        .report-header h1 { font-size: 22pt; font-weight: 700; margin-bottom: 6px; }
        .report-header p { font-size: 10pt; opacity: 0.8; }
        .score-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px; }
        .score-value { font-size: 52pt; font-weight: 800; color: ${scoreColor}; line-height: 1; }
        .score-label { font-size: 10pt; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .section { margin-bottom: 24px; padding: 0 30px; }
        .section-title { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; margin-bottom: 14px; }
        .summary-text { color: #334155; text-align: justify; background: #f1f5f9; padding: 14px; border-radius: 8px; }
        .list-item { padding: 6px 0; font-size: 10pt; border-bottom: 1px solid #f1f5f9; }
        .strength { color: #166534; }
        .improvement { color: #92400e; }
        .keywords-container { display: flex; flex-wrap: wrap; gap: 8px; }
        .keyword-tag { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 20px; padding: 3px 12px; font-size: 9pt; font-weight: 500; }
        .footer { margin-top: 30px; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
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
