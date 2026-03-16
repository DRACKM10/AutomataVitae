const pdf = require('pdf-parse');

// Interfaz para el resultado del parseo
interface ParsedCV {
  text: string;
  pageCount: number;
  metadata: {
    title?: string;
    author?: string;
    creator?: string;
  };
}

export class CVParserService {
  /**
   * Extrae texto de un PDF
   * @param buffer - Buffer del archivo PDF
   * @returns Objeto con texto extraído y metadata
   */
  async extractText(buffer: Buffer): Promise<ParsedCV> {
    try {
      // Parsear el PDF
      const data = await pdf(buffer);

      // Validar que se extrajo texto
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('No se pudo extraer texto del PDF. Puede estar vacío o ser una imagen.');
      }

      // Retornar datos estructurados
      return {
        text: data.text.trim(),
        pageCount: data.numpages,
        metadata: {
          title: data.info?.Title,
          author: data.info?.Author,
          creator: data.info?.Creator,
        }
      };
    } catch (error: any) {
      console.error('❌ Error al parsear PDF:', error.message);
      throw new Error('Error al procesar el archivo PDF: ' + error.message);
    }
  }
}