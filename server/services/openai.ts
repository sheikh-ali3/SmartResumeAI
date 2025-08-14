import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export class OpenAIService {
  
  async generateContentSuggestion(text: string, type: string, context?: any): Promise<{
    suggestions: string[];
    explanation: string;
  }> {
    try {
      const prompt = this.buildContentSuggestionPrompt(text, type, context);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional resume writer and career expert. Provide helpful, actionable suggestions to improve resume content. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        suggestions: result.suggestions || [],
        explanation: result.explanation || "No explanation provided"
      };
    } catch (error) {
      console.error("Error generating content suggestion:", error);
      throw new Error("Failed to generate content suggestion");
    }
  }

  async analyzeJobDescription(jobDescription: string): Promise<{
    keywords: string[];
    requiredSkills: string[];
    softSkills: string[];
    jobTitle: string;
    experienceLevel: string;
    summary: string;
  }> {
    try {
      const prompt = `Analyze the following job description and extract key information. Respond with JSON containing keywords, required skills, soft skills, job title, experience level, and a brief summary.

Job Description:
${jobDescription}

Please respond in this JSON format:
{
  "keywords": ["keyword1", "keyword2"],
  "requiredSkills": ["skill1", "skill2"],
  "softSkills": ["soft skill1", "soft skill2"],
  "jobTitle": "extracted job title",
  "experienceLevel": "entry/mid/senior level",
  "summary": "brief summary of the role"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing job descriptions and extracting key requirements and keywords. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        keywords: result.keywords || [],
        requiredSkills: result.requiredSkills || [],
        softSkills: result.softSkills || [],
        jobTitle: result.jobTitle || "",
        experienceLevel: result.experienceLevel || "",
        summary: result.summary || ""
      };
    } catch (error) {
      console.error("Error analyzing job description:", error);
      throw new Error("Failed to analyze job description");
    }
  }

  async calculateResumeJobMatch(resumeContent: any, jobDescription: string): Promise<{
    matchScore: number;
    missingSkills: string[];
    recommendations: string[];
    strengths: string[];
  }> {
    try {
      const prompt = `Compare this resume content with the job description and provide a match analysis. Respond with JSON containing a match score (0-100), missing skills, recommendations for improvement, and identified strengths.

Resume Content:
${JSON.stringify(resumeContent, null, 2)}

Job Description:
${jobDescription}

Please respond in this JSON format:
{
  "matchScore": 85,
  "missingSkills": ["skill1", "skill2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "strengths": ["strength1", "strength2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert resume analyst and ATS specialist. Provide accurate match scores and actionable recommendations. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        matchScore: Math.max(0, Math.min(100, result.matchScore || 0)),
        missingSkills: result.missingSkills || [],
        recommendations: result.recommendations || [],
        strengths: result.strengths || []
      };
    } catch (error) {
      console.error("Error calculating resume match:", error);
      throw new Error("Failed to calculate resume match");
    }
  }

  async generateProfessionalSummary(personalInfo: any, experience: any[], targetRole?: string): Promise<{
    summary: string;
    alternatives: string[];
  }> {
    try {
      const prompt = `Generate a professional summary for a resume based on the following information. Create one main summary and 2-3 alternative versions.

Personal Info: ${JSON.stringify(personalInfo)}
Experience: ${JSON.stringify(experience)}
Target Role: ${targetRole || 'Not specified'}

Please respond in this JSON format:
{
  "summary": "main professional summary",
  "alternatives": ["alternative1", "alternative2", "alternative3"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional resume writer specializing in creating compelling professional summaries. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 600,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        summary: result.summary || "",
        alternatives: result.alternatives || []
      };
    } catch (error) {
      console.error("Error generating professional summary:", error);
      throw new Error("Failed to generate professional summary");
    }
  }

  private buildContentSuggestionPrompt(text: string, type: string, context?: any): string {
    const basePrompt = `Improve the following ${type} for a resume. Provide 3-5 specific suggestions and an explanation of the improvements.`;
    
    let prompt = `${basePrompt}

Current ${type}:
${text}`;

    if (context) {
      prompt += `\n\nContext: ${JSON.stringify(context)}`;
    }

    prompt += `\n\nPlease respond in this JSON format:
{
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "explanation": "explanation of why these improvements help"
}`;

    return prompt;
  }
}

export const openaiService = new OpenAIService();
