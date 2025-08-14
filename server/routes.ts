import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { openaiService } from "./services/openai";
import { pdfGenerator } from "./services/pdfGenerator";
import { insertResumeSchema, insertJobDescriptionSchema, insertResumeSectionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Resume routes
  app.get("/api/resumes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resumes = await storage.getUserResumes(userId);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.get("/api/resumes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const resume = await storage.getResumeWithSections(id);
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      // Check if user owns the resume
      if (resume.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  app.post("/api/resumes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.patch("/api/resumes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

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

  app.delete("/api/resumes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

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
  app.post("/api/ai/suggest", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/ai/analyze-job", isAuthenticated, async (req: any, res) => {
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

  app.post("/api/ai/match-resume", isAuthenticated, async (req: any, res) => {
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
  app.post("/api/resumes/:id/export/pdf", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

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
  app.post("/api/job-descriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get("/api/job-descriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobDescriptions = await storage.getUserJobDescriptions(userId);
      res.json(jobDescriptions);
    } catch (error) {
      console.error("Error fetching job descriptions:", error);
      res.status(500).json({ message: "Failed to fetch job descriptions" });
    }
  });

  // Resume sections routes
  app.post("/api/resumes/:resumeId/sections", isAuthenticated, async (req: any, res) => {
    try {
      const resumeId = parseInt(req.params.resumeId);
      const userId = req.user.claims.sub;

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

  app.get("/api/resumes/:resumeId/sections", isAuthenticated, async (req: any, res) => {
    try {
      const resumeId = parseInt(req.params.resumeId);
      const userId = req.user.claims.sub;

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

  const httpServer = createServer(app);
  return httpServer;
}
