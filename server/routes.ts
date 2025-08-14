import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { authenticateUser, generateToken, type AuthRequest } from "./middleware/unifiedAuth";
import { openaiService } from "./services/openai";
import { pdfGenerator } from "./services/pdfGenerator";
import { fileParserService } from "./services/fileParser";
import { nlpService } from "./services/nlp";
import { 
  insertResumeSchema, 
  insertJobDescriptionSchema, 
  insertResumeSectionSchema,
  insertAnalysisResultSchema,
  insertResumeUploadSchema,
  jwtLoginSchema,
  jwtSignupSchema,
} from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // Auth middleware
  await setupAuth(app);

  // JWT Auth routes
  app.post("/api/auth/jwt/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = jwtSignupSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = nanoid();
      
      const user = await storage.createJwtUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      });

      const token = generateToken(userId);
      res.json({
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role 
        },
        token
      });
    } catch (error) {
      console.error("JWT signup error:", error);
      res.status(400).json({ message: "Invalid input data" });
    }
  });

  app.post("/api/auth/jwt/login", async (req, res) => {
    try {
      const { email, password } = jwtLoginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.authType !== 'jwt' || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id);
      res.json({
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role 
        },
        token
      });
    } catch (error) {
      console.error("JWT login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Unified auth routes
  app.get('/api/auth/user', authenticateUser, async (req: AuthRequest, res) => {
    try {
      res.json({
        user: req.user
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Resume routes
  app.get("/api/resumes", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const resumes = await storage.getUserResumes(userId);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.get("/api/resumes/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const resume = await storage.getResumeWithSections(id);
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      // Check if user owns the resume
      if (resume.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  app.post("/api/resumes", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const resumeData = insertResumeSchema.parse({
        ...req.body,
        userId,
      });

      const resume = await storage.createResume(resumeData);
      res.status(201).json(resume);
    } catch (error) {
      console.error("Error creating resume:", error);
      res.status(500).json({ message: "Failed to create resume" });
    }
  });

  app.patch("/api/resumes/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if resume exists and user owns it
      const existingResume = await storage.getResume(id);
      if (!existingResume || existingResume.userId !== userId) {
        return res.status(404).json({ message: "Resume not found" });
      }

      const updatedResume = await storage.updateResume(id, req.body);
      res.json(updatedResume);
    } catch (error) {
      console.error("Error updating resume:", error);
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  app.delete("/api/resumes/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if resume exists and user owns it
      const existingResume = await storage.getResume(id);
      if (!existingResume || existingResume.userId !== userId) {
        return res.status(404).json({ message: "Resume not found" });
      }

      await storage.deleteResume(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting resume:", error);
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  // Template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // AI suggestion routes
  app.post("/api/ai/suggest", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { text, type, context } = req.body;

      if (!text || !type) {
        return res.status(400).json({ message: "Text and type are required" });
      }

      const suggestion = await openaiService.generateContentSuggestion(text, type, context);
      res.json(suggestion);
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      res.status(500).json({ message: "Failed to generate suggestion" });
    }
  });

  app.post("/api/ai/analyze-job", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { jobDescription } = req.body;

      if (!jobDescription) {
        return res.status(400).json({ message: "Job description is required" });
      }

      const analysis = await openaiService.analyzeJobDescription(jobDescription);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing job description:", error);
      res.status(500).json({ message: "Failed to analyze job description" });
    }
  });

  app.post("/api/ai/match-resume", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { resumeContent, jobDescription } = req.body;

      if (!resumeContent || !jobDescription) {
        return res.status(400).json({ message: "Resume content and job description are required" });
      }

      const matchResult = await openaiService.calculateResumeJobMatch(resumeContent, jobDescription);
      res.json(matchResult);
    } catch (error) {
      console.error("Error calculating resume match:", error);
      res.status(500).json({ message: "Failed to calculate resume match" });
    }
  });

  // PDF export route
  app.post("/api/resumes/:id/export/pdf", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;

      const resume = await storage.getResumeWithSections(id);
      if (!resume || resume.userId !== userId) {
        return res.status(404).json({ message: "Resume not found" });
      }

      const template = resume.templateId ? await storage.getTemplate(resume.templateId) : null;
      
      const pdfBuffer = await pdfGenerator.generateResumePDF(resume, template);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.title}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Job description routes
  app.post("/api/job-descriptions", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const jobDescriptionData = insertJobDescriptionSchema.parse({
        ...req.body,
        userId,
      });

      const jobDescription = await storage.createJobDescription(jobDescriptionData);
      res.status(201).json(jobDescription);
    } catch (error) {
      console.error("Error creating job description:", error);
      res.status(500).json({ message: "Failed to create job description" });
    }
  });

  app.get("/api/job-descriptions", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const jobDescriptions = await storage.getUserJobDescriptions(userId);
      res.json(jobDescriptions);
    } catch (error) {
      console.error("Error fetching job descriptions:", error);
      res.status(500).json({ message: "Failed to fetch job descriptions" });
    }
  });

  // Resume sections routes
  app.post("/api/resumes/:resumeId/sections", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const resumeId = parseInt(req.params.resumeId);
      const userId = req.user!.id;

      // Verify user owns the resume
      const resume = await storage.getResume(resumeId);
      if (!resume || resume.userId !== userId) {
        return res.status(404).json({ message: "Resume not found" });
      }

      const sectionData = insertResumeSectionSchema.parse({
        ...req.body,
        resumeId,
      });

      const section = await storage.createResumeSection(sectionData);
      res.status(201).json(section);
    } catch (error) {
      console.error("Error creating resume section:", error);
      res.status(500).json({ message: "Failed to create resume section" });
    }
  });

  app.get("/api/resumes/:resumeId/sections", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const resumeId = parseInt(req.params.resumeId);
      const userId = req.user!.id;

      // Verify user owns the resume
      const resume = await storage.getResume(resumeId);
      if (!resume || resume.userId !== userId) {
        return res.status(404).json({ message: "Resume not found" });
      }

      const sections = await storage.getResumeSections(resumeId);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching resume sections:", error);
      res.status(500).json({ message: "Failed to fetch resume sections" });
    }
  });

  // Resume upload and analysis routes (from CompatibilityMatchmaker)
  app.post("/api/resume/upload", authenticateUser, upload.single('resume'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const parsedResume = await fileParserService.parseResumeFile(req.file.path, req.file.mimetype);

      const resumeUpload = await storage.createResumeUpload({
        userId: req.user!.id,
        filename: `${Date.now()}_${req.file.originalname}`,
        originalFilename: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        rawText: parsedResume.rawText,
        extractedSkills: parsedResume.skills,
        extractedExperience: parsedResume.experience,
        extractedEducation: parsedResume.education,
        extractedCertifications: parsedResume.certifications,
      });

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json(resumeUpload);
    } catch (error) {
      console.error('Resume upload error:', error);
      res.status(500).json({ message: "Failed to process resume" });
    }
  });

  app.get("/api/resume-uploads", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const resumeUploads = await storage.getUserResumeUploads(req.user!.id);
      res.json(resumeUploads);
    } catch (error) {
      console.error("Error fetching resume uploads:", error);
      res.status(500).json({ message: "Failed to fetch resume uploads" });
    }
  });

  app.delete("/api/resume-uploads/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const upload = await storage.getResumeUpload(id);
      
      if (!upload || upload.userId !== req.user!.id) {
        return res.status(404).json({ message: "Resume upload not found" });
      }

      // Delete file from filesystem if it exists
      if (fs.existsSync(upload.filePath)) {
        fs.unlinkSync(upload.filePath);
      }

      await storage.deleteResumeUpload(id);
      res.json({ message: "Resume upload deleted successfully" });
    } catch (error) {
      console.error("Error deleting resume upload:", error);
      res.status(500).json({ message: "Failed to delete resume upload" });
    }
  });

  // Analysis routes
  app.post("/api/analysis/create", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const { resumeText, jobDescription, resumeId, jobDescriptionId } = req.body;

      if (!resumeText || !jobDescription) {
        return res.status(400).json({ message: "Resume text and job description are required" });
      }

      // Perform NLP analysis
      const compatibilityAnalysis = nlpService.calculateCompatibility(resumeText, jobDescription);

      // Store analysis result
      const analysisResult = await storage.createAnalysisResult({
        userId: req.user!.id,
        resumeId: resumeId || null,
        jobDescriptionId: jobDescriptionId || null,
        overallScore: compatibilityAnalysis.overallScore,
        skillsScore: compatibilityAnalysis.skillsScore,
        experienceScore: compatibilityAnalysis.experienceScore,
        educationScore: compatibilityAnalysis.educationScore,
        missingSkills: compatibilityAnalysis.missingSkills,
        recommendations: compatibilityAnalysis.recommendations,
        detailedAnalysis: compatibilityAnalysis.detailedAnalysis,
      });

      res.json({
        ...analysisResult,
        analysis: compatibilityAnalysis,
      });
    } catch (error) {
      console.error("Error creating analysis:", error);
      res.status(500).json({ message: "Failed to create analysis" });
    }
  });

  app.get("/api/analyses", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const analyses = await storage.getUserAnalyses(req.user!.id);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ message: "Failed to fetch analyses" });
    }
  });

  app.get("/api/analysis/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const analysisId = parseInt(req.params.id);
      const analysis = await storage.getAnalysisResult(analysisId);
      
      if (!analysis || analysis.userId !== req.user!.id) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ message: "Failed to fetch analysis" });
    }
  });

  app.delete("/api/analysis/:id", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const analysisId = parseInt(req.params.id);
      const analysis = await storage.getAnalysisResult(analysisId);
      
      if (!analysis || analysis.userId !== req.user!.id) {
        return res.status(404).json({ message: "Analysis not found" });
      }

      await storage.deleteAnalysisResult(analysisId);
      res.json({ message: "Analysis deleted successfully" });
    } catch (error) {
      console.error("Error deleting analysis:", error);
      res.status(500).json({ message: "Failed to delete analysis" });
    }
  });

  // Statistics route
  app.get("/api/stats", authenticateUser, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getUserStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
