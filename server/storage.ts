import {
  users,
  resumes,
  templates,
  jobDescriptions,
  resumeSections,
  aiSuggestions,
  analysisResults,
  resumeUploads,
  type User,
  type UpsertUser,
  type Resume,
  type InsertResume,
  type Template,
  type InsertTemplate,
  type JobDescription,
  type InsertJobDescription,
  type ResumeSection,
  type InsertResumeSection,
  type AiSuggestion,
  type InsertAiSuggestion,
  type AnalysisResult,
  type InsertAnalysisResult,
  type ResumeUpload,
  type InsertResumeUpload,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Resume operations
  createResume(resume: InsertResume): Promise<Resume>;
  getResume(id: number): Promise<Resume | undefined>;
  getUserResumes(userId: string): Promise<Resume[]>;
  updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume>;
  deleteResume(id: number): Promise<void>;
  getResumeWithSections(id: number): Promise<(Resume & { sections: ResumeSection[] }) | undefined>;
  
  // Template operations
  getAllTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  // Resume sections operations
  createResumeSection(section: InsertResumeSection): Promise<ResumeSection>;
  getResumeSections(resumeId: number): Promise<ResumeSection[]>;
  updateResumeSection(id: number, section: Partial<InsertResumeSection>): Promise<ResumeSection>;
  deleteResumeSection(id: number): Promise<void>;
  
  // Job description operations
  createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription>;
  getUserJobDescriptions(userId: string): Promise<JobDescription[]>;
  getJobDescription(id: number): Promise<JobDescription | undefined>;
  
  // AI suggestions operations
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  getResumeSuggestions(resumeId: number): Promise<AiSuggestion[]>;
  updateAiSuggestion(id: number, suggestion: Partial<InsertAiSuggestion>): Promise<AiSuggestion>;

  // Analysis operations
  createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult>;
  getUserAnalyses(userId: string): Promise<AnalysisResult[]>;
  getAnalysisResult(id: number): Promise<AnalysisResult | undefined>;
  deleteAnalysisResult(id: number): Promise<void>;

  // Resume upload operations
  createResumeUpload(upload: InsertResumeUpload): Promise<ResumeUpload>;
  getUserResumeUploads(userId: string): Promise<ResumeUpload[]>;
  getResumeUpload(id: number): Promise<ResumeUpload | undefined>;
  deleteResumeUpload(id: number): Promise<void>;

  // JWT user operations
  getUserByEmail(email: string): Promise<User | undefined>;
  createJwtUser(userData: { id: string; email: string; password: string; firstName: string; lastName: string; role: string }): Promise<User>;

  // Statistics
  getUserStats(userId: string): Promise<{
    totalResumes: number;
    totalAnalyses: number;
    averageScore: number;
    recentAnalyses: AnalysisResult[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Resume operations
  async createResume(resume: InsertResume): Promise<Resume> {
    const [newResume] = await db
      .insert(resumes)
      .values(resume)
      .returning();
    return newResume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, id));
    return resume;
  }

  async getUserResumes(userId: string): Promise<Resume[]> {
    return await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.updatedAt));
  }

  async updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume> {
    const [updatedResume] = await db
      .update(resumes)
      .set({ ...resume, updatedAt: new Date() })
      .where(eq(resumes.id, id))
      .returning();
    return updatedResume;
  }

  async deleteResume(id: number): Promise<void> {
    await db.delete(resumes).where(eq(resumes.id, id));
  }

  async getResumeWithSections(id: number): Promise<(Resume & { sections: ResumeSection[] }) | undefined> {
    const resume = await this.getResume(id);
    if (!resume) return undefined;
    
    const sections = await this.getResumeSections(id);
    return { ...resume, sections };
  }

  // Template operations
  async getAllTemplates(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isActive, true))
      .orderBy(templates.name);
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id));
    return template;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values(template)
      .returning();
    return newTemplate;
  }

  // Resume sections operations
  async createResumeSection(section: InsertResumeSection): Promise<ResumeSection> {
    const [newSection] = await db
      .insert(resumeSections)
      .values(section)
      .returning();
    return newSection;
  }

  async getResumeSections(resumeId: number): Promise<ResumeSection[]> {
    return await db
      .select()
      .from(resumeSections)
      .where(eq(resumeSections.resumeId, resumeId))
      .orderBy(resumeSections.order);
  }

  async updateResumeSection(id: number, section: Partial<InsertResumeSection>): Promise<ResumeSection> {
    const [updatedSection] = await db
      .update(resumeSections)
      .set({ ...section, updatedAt: new Date() })
      .where(eq(resumeSections.id, id))
      .returning();
    return updatedSection;
  }

  async deleteResumeSection(id: number): Promise<void> {
    await db.delete(resumeSections).where(eq(resumeSections.id, id));
  }

  // Job description operations
  async createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription> {
    const [newJobDescription] = await db
      .insert(jobDescriptions)
      .values(jobDescription)
      .returning();
    return newJobDescription;
  }

  async getUserJobDescriptions(userId: string): Promise<JobDescription[]> {
    return await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.userId, userId))
      .orderBy(desc(jobDescriptions.createdAt));
  }

  async getJobDescription(id: number): Promise<JobDescription | undefined> {
    const [jobDescription] = await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.id, id));
    return jobDescription;
  }

  // AI suggestions operations
  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const [newSuggestion] = await db
      .insert(aiSuggestions)
      .values(suggestion)
      .returning();
    return newSuggestion;
  }

  async getResumeSuggestions(resumeId: number): Promise<AiSuggestion[]> {
    return await db
      .select()
      .from(aiSuggestions)
      .where(eq(aiSuggestions.resumeId, resumeId))
      .orderBy(desc(aiSuggestions.createdAt));
  }

  async updateAiSuggestion(id: number, suggestion: Partial<InsertAiSuggestion>): Promise<AiSuggestion> {
    const [updatedSuggestion] = await db
      .update(aiSuggestions)
      .set(suggestion)
      .where(eq(aiSuggestions.id, id))
      .returning();
    return updatedSuggestion;
  }

  // Analysis operations
  async createAnalysisResult(analysis: InsertAnalysisResult): Promise<AnalysisResult> {
    const [newAnalysis] = await db
      .insert(analysisResults)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  async getUserAnalyses(userId: string): Promise<AnalysisResult[]> {
    return await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.userId, userId))
      .orderBy(desc(analysisResults.createdAt));
  }

  async getAnalysisResult(id: number): Promise<AnalysisResult | undefined> {
    const [analysis] = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.id, id));
    return analysis;
  }

  async deleteAnalysisResult(id: number): Promise<void> {
    await db.delete(analysisResults).where(eq(analysisResults.id, id));
  }

  // Resume upload operations
  async createResumeUpload(upload: InsertResumeUpload): Promise<ResumeUpload> {
    const [newUpload] = await db
      .insert(resumeUploads)
      .values(upload)
      .returning();
    return newUpload;
  }

  async getUserResumeUploads(userId: string): Promise<ResumeUpload[]> {
    return await db
      .select()
      .from(resumeUploads)
      .where(eq(resumeUploads.userId, userId))
      .orderBy(desc(resumeUploads.createdAt));
  }

  async getResumeUpload(id: number): Promise<ResumeUpload | undefined> {
    const [upload] = await db
      .select()
      .from(resumeUploads)
      .where(eq(resumeUploads.id, id));
    return upload;
  }

  async deleteResumeUpload(id: number): Promise<void> {
    await db.delete(resumeUploads).where(eq(resumeUploads.id, id));
  }

  // JWT user operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createJwtUser(userData: { id: string; email: string; password: string; firstName: string; lastName: string; role: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        authType: 'jwt',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    totalResumes: number;
    totalAnalyses: number;
    averageScore: number;
    recentAnalyses: AnalysisResult[];
  }> {
    const userResumes = await this.getUserResumes(userId);
    const userAnalyses = await this.getUserAnalyses(userId);
    
    const averageScore = userAnalyses.length > 0 
      ? Math.round(userAnalyses.reduce((sum, analysis) => sum + analysis.overallScore, 0) / userAnalyses.length)
      : 0;

    return {
      totalResumes: userResumes.length,
      totalAnalyses: userAnalyses.length,
      averageScore,
      recentAnalyses: userAnalyses.slice(0, 5),
    };
  }
}

export const storage = new DatabaseStorage();
