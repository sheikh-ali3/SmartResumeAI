import natural from 'natural';
import type { AnalysisResult } from '@shared/schema';

export interface ResumeAnalysis {
  skills: string[];
  experience: string[];
  education: string[];
  certifications: string[];
}

export interface CompatibilityAnalysis {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  missingSkills: string[];
  recommendations: string[];
  detailedAnalysis: {
    skillsMatched: string[];
    skillsMissing: string[];
    experienceLevel: string;
    educationMatch: boolean;
    strengths: string[];
    improvements: string[];
  };
}

class NLPService {
  private tfidf = new natural.TfIdf();
  
  // Common skills database for better matching
  private commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java',
    'Spring', 'Django', 'Flask', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'REST', 'GraphQL',
    'HTML', 'CSS', 'SASS', 'Redux', 'Express', 'Jest', 'Cypress', 'Webpack', 'Vite',
    'Next.js', 'Nuxt.js', 'Vue.js', 'React Native', 'Flutter', 'Swift', 'Kotlin',
    'C++', 'C#', '.NET', 'Ruby', 'Rails', 'PHP', 'Laravel', 'Go', 'Rust', 'Scala',
    'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
    'Agile', 'Scrum', 'DevOps', 'Microservices', 'API Design', 'Database Design',
    'UI/UX', 'Figma', 'Adobe Creative Suite', 'Project Management', 'Leadership',
  ];

  analyzeResumeText(text: string): ResumeAnalysis {
    const normalizedText = text.toLowerCase();
    
    const skills = this.extractSkills(normalizedText);
    const experience = this.extractExperience(normalizedText);
    const education = this.extractEducation(normalizedText);
    const certifications = this.extractCertifications(normalizedText);

    return {
      skills,
      experience,
      education,
      certifications,
    };
  }

  calculateCompatibility(resumeText: string, jobDescription: string): CompatibilityAnalysis {
    const resumeAnalysis = this.analyzeResumeText(resumeText);
    const jobRequirements = this.extractJobRequirements(jobDescription);

    // Calculate individual scores
    const skillsScore = this.calculateSkillsMatch(resumeAnalysis.skills, jobRequirements.skills);
    const experienceScore = this.calculateExperienceMatch(resumeAnalysis.experience, jobRequirements.experience);
    const educationScore = this.calculateEducationMatch(resumeAnalysis.education, jobRequirements.education);

    // Calculate overall score (weighted)
    const overallScore = Math.round(
      skillsScore * 0.5 + 
      experienceScore * 0.3 + 
      educationScore * 0.2
    );

    // Find missing skills
    const missingSkills = jobRequirements.skills.filter(skill => 
      !resumeAnalysis.skills.some(resumeSkill => 
        this.isSkillMatch(resumeSkill, skill)
      )
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      resumeAnalysis, 
      jobRequirements, 
      missingSkills
    );

    // Detailed analysis
    const skillsMatched = resumeAnalysis.skills.filter(skill =>
      jobRequirements.skills.some(jobSkill => this.isSkillMatch(skill, jobSkill))
    );

    const detailedAnalysis = {
      skillsMatched,
      skillsMissing: missingSkills,
      experienceLevel: this.determineExperienceLevel(resumeAnalysis.experience),
      educationMatch: educationScore > 70,
      strengths: this.identifyStrengths(resumeAnalysis, jobRequirements),
      improvements: this.identifyImprovements(resumeAnalysis, jobRequirements),
    };

    return {
      overallScore,
      skillsScore,
      experienceScore,
      educationScore,
      missingSkills,
      recommendations,
      detailedAnalysis,
    };
  }

  private extractSkills(text: string): string[] {
    const foundSkills: string[] = [];
    
    for (const skill of this.commonSkills) {
      if (text.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }

    // Extract additional skills using pattern matching
    const skillPatterns = [
      /(?:proficient in|experienced with|skilled in|knowledge of)\s+([^.]+)/gi,
      /(?:technologies|tools|languages):\s*([^.]+)/gi,
    ];

    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const skills = match.split(/[,;&]/).map(s => s.trim());
          foundSkills.push(...skills);
        });
      }
    });

    return Array.from(new Set(foundSkills)).filter(skill => skill.length > 2);
  }

  private extractExperience(text: string): string[] {
    const experiences: string[] = [];
    
    // Pattern for years of experience
    const yearPatterns = [
      /(\d+)\+?\s*years?\s+(?:of\s+)?experience/gi,
      /(\d+)\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?(?:work\s+)?experience/gi,
    ];

    yearPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        experiences.push(...matches);
      }
    });

    // Extract job titles and positions
    const titlePatterns = [
      /(?:worked as|position as|role as|served as)\s+([^.]+)/gi,
      /(?:senior|junior|lead|principal)\s+([a-z\s]+)/gi,
    ];

    titlePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        experiences.push(...matches);
      }
    });

    return experiences;
  }

  private extractEducation(text: string): string[] {
    const education: string[] = [];
    
    const educationPatterns = [
      /(?:bachelor|master|phd|doctorate|degree|diploma|certificate)\s+(?:of\s+)?(?:science|arts|engineering|business|computer science)/gi,
      /(?:bs|ba|ms|ma|mba|phd)\s+in\s+([^.]+)/gi,
      /(?:university|college|institute)\s+of\s+([^.]+)/gi,
    ];

    educationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        education.push(...matches);
      }
    });

    return education;
  }

  private extractCertifications(text: string): string[] {
    const certifications: string[] = [];
    
    const certPatterns = [
      /(?:certified|certification)\s+in\s+([^.]+)/gi,
      /(?:aws|azure|google cloud|cisco|microsoft|oracle)\s+(?:certified|certification)/gi,
      /(?:pmp|cissp|cisa|cism|comptia)/gi,
    ];

    certPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        certifications.push(...matches);
      }
    });

    return certifications;
  }

  private extractJobRequirements(jobDescription: string) {
    const normalizedText = jobDescription.toLowerCase();
    
    return {
      skills: this.extractSkills(normalizedText),
      experience: this.extractExperience(normalizedText),
      education: this.extractEducation(normalizedText),
    };
  }

  private calculateSkillsMatch(resumeSkills: string[], jobSkills: string[]): number {
    if (jobSkills.length === 0) return 100;
    
    const matchedSkills = resumeSkills.filter(resumeSkill =>
      jobSkills.some(jobSkill => this.isSkillMatch(resumeSkill, jobSkill))
    );

    return Math.round((matchedSkills.length / jobSkills.length) * 100);
  }

  private calculateExperienceMatch(resumeExp: string[], jobExp: string[]): number {
    // This is a simplified calculation - in a real app you'd want more sophisticated logic
    if (jobExp.length === 0) return 100;
    
    const hasExperience = resumeExp.length > 0;
    return hasExperience ? 80 : 20;
  }

  private calculateEducationMatch(resumeEdu: string[], jobEdu: string[]): number {
    if (jobEdu.length === 0) return 100;
    
    const hasEducation = resumeEdu.length > 0;
    return hasEducation ? 90 : 30;
  }

  private isSkillMatch(skill1: string, skill2: string): boolean {
    const s1 = skill1.toLowerCase().trim();
    const s2 = skill2.toLowerCase().trim();
    
    if (s1 === s2) return true;
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    // Check for common variations
    const variations: { [key: string]: string[] } = {
      'javascript': ['js', 'ecmascript'],
      'typescript': ['ts'],
      'react': ['reactjs', 'react.js'],
      'vue': ['vuejs', 'vue.js'],
      'node.js': ['nodejs', 'node'],
    };

    for (const [main, alts] of Object.entries(variations)) {
      if ((s1 === main && alts.includes(s2)) || (s2 === main && alts.includes(s1))) {
        return true;
      }
    }

    return false;
  }

  private generateRecommendations(
    resume: ResumeAnalysis, 
    job: any, 
    missingSkills: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (missingSkills.length > 0) {
      recommendations.push(`Consider learning these missing skills: ${missingSkills.slice(0, 3).join(', ')}`);
    }

    if (resume.experience.length === 0) {
      recommendations.push('Add more details about your work experience and projects');
    }

    if (resume.education.length === 0) {
      recommendations.push('Include your educational background');
    }

    if (resume.certifications.length === 0) {
      recommendations.push('Consider obtaining relevant certifications for your field');
    }

    return recommendations;
  }

  private determineExperienceLevel(experience: string[]): string {
    const yearMatches = experience.join(' ').match(/(\d+)/g);
    if (yearMatches) {
      const maxYears = Math.max(...yearMatches.map(Number));
      if (maxYears >= 7) return 'Senior';
      if (maxYears >= 3) return 'Mid-level';
      return 'Junior';
    }
    return 'Entry-level';
  }

  private identifyStrengths(resume: ResumeAnalysis, job: any): string[] {
    const strengths: string[] = [];
    
    if (resume.skills.length > 10) {
      strengths.push('Diverse skill set');
    }
    
    if (resume.experience.length > 0) {
      strengths.push('Relevant work experience');
    }
    
    if (resume.education.length > 0) {
      strengths.push('Strong educational background');
    }

    return strengths;
  }

  private identifyImprovements(resume: ResumeAnalysis, job: any): string[] {
    const improvements: string[] = [];
    
    if (resume.skills.length < 5) {
      improvements.push('Expand technical skill set');
    }
    
    if (resume.certifications.length === 0) {
      improvements.push('Obtain relevant industry certifications');
    }

    return improvements;
  }
}

export const nlpService = new NLPService();