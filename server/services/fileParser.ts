import fs from 'fs';
import path from 'path';
import { nlpService, type ResumeAnalysis } from './nlp';

export interface ParsedResume extends ResumeAnalysis {
  rawText: string;
}

class FileParserService {
  async parseResumeFile(filePath: string, mimeType: string): Promise<ParsedResume> {
    let rawText = '';

    try {
      switch (mimeType) {
        case 'text/plain':
          rawText = await this.parsePlainText(filePath);
          break;
        case 'application/pdf':
          rawText = await this.parsePDF(filePath);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          rawText = await this.parseDOCX(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }

      // Use NLP service to analyze the text
      const analysis = nlpService.analyzeResumeText(rawText);

      return {
        rawText,
        ...analysis,
      };
    } catch (error) {
      console.error('Error parsing resume file:', error);
      throw new Error('Failed to parse resume file');
    }
  }

  private async parsePlainText(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf-8');
  }

  private async parsePDF(filePath: string): Promise<string> {
    // For now, return a placeholder. In a real app, you'd use a PDF parsing library like pdf-parse
    // This would require installing pdf-parse: npm install pdf-parse @types/pdf-parse
    return 'PDF parsing not implemented - would require pdf-parse library';
  }

  private async parseDOCX(filePath: string): Promise<string> {
    // For now, return a placeholder. In a real app, you'd use a DOCX parsing library like mammoth
    // This would require installing mammoth: npm install mammoth
    return 'DOCX parsing not implemented - would require mammoth library';
  }

  // Utility method to validate file types
  isValidFileType(mimeType: string): boolean {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(mimeType);
  }

  // Utility method to get file extension from mime type
  getFileExtension(mimeType: string): string {
    const extensions: { [key: string]: string } = {
      'text/plain': '.txt',
      'application/pdf': '.pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
    };
    return extensions[mimeType] || '';
  }
}

export const fileParserService = new FileParserService();