import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ResumeContent, Template } from "@shared/schema";
import { Phone, Mail, MapPin, Globe, Linkedin, Github } from "lucide-react";

interface ResumePreviewProps {
  content: ResumeContent;
  template?: Template;
}

export default function ResumePreview({ content, template }: ResumePreviewProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, languages } = content;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "short" 
      });
    } catch {
      return dateString;
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (!personalInfo.firstName && !personalInfo.lastName && !personalInfo.email) {
    return (
      <div className="resume-preview">
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-lg font-medium mb-2">Resume Preview</p>
            <p className="text-sm">Start filling out your information to see a preview</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-preview custom-scrollbar">
      {/* Header Section */}
      <div className="resume-header">
        <h1 className="resume-name">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        
        <div className="resume-contact space-y-1">
          <div className="flex items-center justify-center space-x-4 text-sm">
            {personalInfo.email && (
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{formatPhoneNumber(personalInfo.phone)}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{personalInfo.location}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm">
            {personalInfo.website && (
              <div className="flex items-center space-x-1">
                <Globe className="h-3 w-3" />
                <span>{personalInfo.website}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center space-x-1">
                <Linkedin className="h-3 w-3" />
                <span>{personalInfo.linkedin}</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center space-x-1">
                <Github className="h-3 w-3" />
                <span>{personalInfo.github}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="resume-section">
          <h2 className="resume-section-title">Professional Summary</h2>
          <div 
            className="text-sm leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: summary }}
          />
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="resume-section">
          <h2 className="resume-section-title">Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="resume-item">
              <div className="resume-item-header">
                <div>
                  <h3 className="resume-item-title">{exp.position}</h3>
                  <p className="resume-item-company">{exp.company}</p>
                  {exp.location && (
                    <p className="text-xs text-muted-foreground">{exp.location}</p>
                  )}
                </div>
                <div className="resume-item-date">
                  {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate || "")}
                </div>
              </div>
              {exp.description && (
                <div 
                  className="resume-item-description text-sm mt-2"
                  dangerouslySetInnerHTML={{ __html: exp.description }}
                />
              )}
              {exp.achievements.length > 0 && (
                <ul className="list-disc ml-4 mt-2 text-sm text-muted-foreground space-y-1">
                  {exp.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="resume-section">
          <h2 className="resume-section-title">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="resume-item">
              <div className="resume-item-header">
                <div>
                  <h3 className="resume-item-title">{edu.degree} in {edu.field}</h3>
                  <p className="resume-item-company">{edu.institution}</p>
                  {edu.gpa && (
                    <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>
                  )}
                </div>
                <div className="resume-item-date">
                  {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate || "")}
                </div>
              </div>
              {edu.achievements.length > 0 && (
                <ul className="list-disc ml-4 mt-2 text-sm text-muted-foreground space-y-1">
                  {edu.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="resume-section">
          <h2 className="resume-section-title">Skills</h2>
          <div className="skills-grid">
            {skills.map((skill) => (
              <div key={skill.id} className="skill-item">
                {skill.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="resume-section">
          <h2 className="resume-section-title">Projects</h2>
          {projects.map((project) => (
            <div key={project.id} className="resume-item">
              <div className="resume-item-header">
                <div>
                  <h3 className="resume-item-title">{project.name}</h3>
                  {project.link && (
                    <p className="text-xs text-primary">{project.link}</p>
                  )}
                </div>
                <div className="resume-item-date">
                  {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : "Present"}
                </div>
              </div>
              <p className="resume-item-description text-sm mt-1">{project.description}</p>
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="resume-section">
          <h2 className="resume-section-title">Certifications</h2>
          {certifications.map((cert) => (
            <div key={cert.id} className="resume-item">
              <div className="resume-item-header">
                <div>
                  <h3 className="resume-item-title">{cert.name}</h3>
                  <p className="resume-item-company">{cert.issuer}</p>
                  {cert.credentialId && (
                    <p className="text-xs text-muted-foreground">ID: {cert.credentialId}</p>
                  )}
                </div>
                <div className="resume-item-date">
                  {formatDate(cert.date)}
                  {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="resume-section">
          <h2 className="resume-section-title">Languages</h2>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((language) => (
              <div key={language.id} className="flex justify-between items-center">
                <span className="text-sm font-medium">{language.name}</span>
                <Badge variant="outline" className="text-xs">
                  {language.proficiency}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
