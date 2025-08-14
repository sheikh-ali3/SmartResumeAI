import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Resume templates table
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  previewImage: text("preview_image"),
  htmlTemplate: text("html_template").notNull(),
  cssStyles: text("css_styles"),
  isActive: boolean("is_active").default(true),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Resumes table
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: integer("template_id").references(() => templates.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: jsonb("content").notNull(), // Stores all resume data
  isPublic: boolean("is_public").default(false),
  shareToken: varchar("share_token", { length: 100 }).unique(),
  atsScore: integer("ats_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job descriptions table for analysis
export const jobDescriptions = pgTable("job_descriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  resumeId: integer("resume_id").references(() => resumes.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  extractedKeywords: jsonb("extracted_keywords"),
  requiredSkills: jsonb("required_skills"),
  matchScore: integer("match_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Resume sections for individual editing
export const resumeSections = pgTable("resume_sections", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  sectionType: varchar("section_type", { length: 50 }).notNull(), // personal, summary, experience, education, skills, etc.
  title: varchar("title", { length: 255 }),
  content: jsonb("content").notNull(),
  order: integer("order").notNull().default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI suggestions for resume improvement
export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  sectionId: integer("section_id").references(() => resumeSections.id, { onDelete: "cascade" }),
  suggestionType: varchar("suggestion_type", { length: 50 }).notNull(), // content, keyword, format, etc.
  originalText: text("original_text"),
  suggestedText: text("suggested_text"),
  explanation: text("explanation"),
  isApplied: boolean("is_applied").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
  jobDescriptions: many(jobDescriptions),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
  template: one(templates, {
    fields: [resumes.templateId],
    references: [templates.id],
  }),
  sections: many(resumeSections),
  jobDescriptions: many(jobDescriptions),
  aiSuggestions: many(aiSuggestions),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  resumes: many(resumes),
}));

export const resumeSectionsRelations = relations(resumeSections, ({ one, many }) => ({
  resume: one(resumes, {
    fields: [resumeSections.resumeId],
    references: [resumes.id],
  }),
  aiSuggestions: many(aiSuggestions),
}));

export const jobDescriptionsRelations = relations(jobDescriptions, ({ one }) => ({
  user: one(users, {
    fields: [jobDescriptions.userId],
    references: [users.id],
  }),
  resume: one(resumes, {
    fields: [jobDescriptions.resumeId],
    references: [resumes.id],
  }),
}));

export const aiSuggestionsRelations = relations(aiSuggestions, ({ one }) => ({
  resume: one(resumes, {
    fields: [aiSuggestions.resumeId],
    references: [resumes.id],
  }),
  section: one(resumeSections, {
    fields: [aiSuggestions.sectionId],
    references: [resumeSections.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobDescriptionSchema = createInsertSchema(jobDescriptions).omit({
  id: true,
  createdAt: true,
});

export const insertResumeSectionSchema = createInsertSchema(resumeSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertJobDescription = z.infer<typeof insertJobDescriptionSchema>;
export type JobDescription = typeof jobDescriptions.$inferSelect;
export type InsertResumeSection = z.infer<typeof insertResumeSectionSchema>;
export type ResumeSection = typeof resumeSections.$inferSelect;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;

// Resume content type definitions
export type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
};

export type Experience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  location: string;
  description: string;
  achievements: string[];
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  achievements: string[];
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: number; // 1-5
};

export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  startDate: string;
  endDate?: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  link?: string;
};

export type Language = {
  id: string;
  name: string;
  proficiency: string; // Native, Fluent, Professional, Conversational, Basic
};

export type ResumeContent = {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  customSections: Array<{
    id: string;
    title: string;
    content: string;
  }>;
};
