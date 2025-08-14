import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { 
  Plus, 
  Trash2, 
  Brain, 
  GripVertical, 
  Calendar,
  Globe,
  Linkedin,
  Github
} from "lucide-react";
import type { 
  ResumeContent, 
  PersonalInfo, 
  Experience, 
  Education, 
  Skill, 
  Project, 
  Certification, 
  Language 
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface SectionEditorProps {
  section: keyof ResumeContent;
  content: ResumeContent;
  onUpdate: (section: keyof ResumeContent, data: any) => void;
  onAISuggestion: (text: string, type: string, context?: any) => Promise<any>;
  isLoading: boolean;
}

export default function SectionEditor({ 
  section, 
  content, 
  onUpdate, 
  onAISuggestion, 
  isLoading 
}: SectionEditorProps) {
  const { toast } = useToast();
  const [loadingSection, setLoadingSection] = useState<string>("");

  const handleAISuggestion = async (text: string, type: string, context?: any, callback?: (suggestion: string) => void) => {
    if (!text.trim()) {
      toast({
        title: "No content to improve",
        description: "Please enter some text first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingSection(type);
      const result = await onAISuggestion(text, type, context);
      
      if (result.suggestions && result.suggestions.length > 0) {
        const suggestion = result.suggestions[0];
        if (callback) {
          callback(suggestion);
        }
        toast({
          title: "AI Suggestion Generated",
          description: result.explanation || "Here's an improved version of your content",
        });
      }
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoadingSection("");
    }
  };

  // Personal Information Section
  if (section === "personalInfo") {
    const personalInfo = content.personalInfo;

    const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
      onUpdate("personalInfo", {
        ...personalInfo,
        [field]: value,
      });
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={personalInfo.firstName}
                onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={personalInfo.lastName}
                onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
                placeholder="Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                placeholder="john.doe@email.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
                placeholder="New York, NY"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Online Presence</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website" className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </Label>
              <Input
                id="website"
                value={personalInfo.website || ""}
                onChange={(e) => updatePersonalInfo("website", e.target.value)}
                placeholder="https://johndoe.com"
              />
            </div>
            <div>
              <Label htmlFor="linkedin" className="flex items-center space-x-1">
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </Label>
              <Input
                id="linkedin"
                value={personalInfo.linkedin || ""}
                onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="github" className="flex items-center space-x-1">
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Label>
              <Input
                id="github"
                value={personalInfo.github || ""}
                onChange={(e) => updatePersonalInfo("github", e.target.value)}
                placeholder="https://github.com/johndoe"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Professional Summary Section
  if (section === "summary") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Professional Summary</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAISuggestion(
              content.summary, 
              "professional_summary", 
              { personalInfo: content.personalInfo, experience: content.experience },
              (suggestion) => onUpdate("summary", suggestion)
            )}
            disabled={isLoading || loadingSection === "professional_summary"}
          >
            <Brain className="h-4 w-4 mr-2" />
            {loadingSection === "professional_summary" ? "Generating..." : "AI Suggest"}
          </Button>
        </div>
        <RichTextEditor
          value={content.summary}
          onChange={(value) => onUpdate("summary", value)}
          placeholder="Write a compelling professional summary that highlights your key qualifications and career objectives..."
          minHeight={150}
        />
        <p className="text-sm text-muted-foreground">
          A strong professional summary should be 2-3 sentences that highlight your most relevant skills and experience.
        </p>
      </div>
    );
  }

  // Experience Section
  if (section === "experience") {
    const addExperience = () => {
      const newExperience: Experience = {
        id: Date.now().toString(),
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        location: "",
        description: "",
        achievements: [],
      };
      onUpdate("experience", [...content.experience, newExperience]);
    };

    const updateExperience = (id: string, field: keyof Experience, value: any) => {
      const updated = content.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      );
      onUpdate("experience", updated);
    };

    const removeExperience = (id: string) => {
      const updated = content.experience.filter(exp => exp.id !== id);
      onUpdate("experience", updated);
    };

    const addAchievement = (expId: string) => {
      const updated = content.experience.map(exp =>
        exp.id === expId ? { ...exp, achievements: [...exp.achievements, ""] } : exp
      );
      onUpdate("experience", updated);
    };

    const updateAchievement = (expId: string, index: number, value: string) => {
      const updated = content.experience.map(exp =>
        exp.id === expId 
          ? { ...exp, achievements: exp.achievements.map((ach, i) => i === index ? value : ach) }
          : exp
      );
      onUpdate("experience", updated);
    };

    const removeAchievement = (expId: string, index: number) => {
      const updated = content.experience.map(exp =>
        exp.id === expId 
          ? { ...exp, achievements: exp.achievements.filter((_, i) => i !== index) }
          : exp
      );
      onUpdate("experience", updated);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Work Experience</h3>
          <Button onClick={addExperience} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </div>

        {content.experience.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground mb-4">
                <div className="text-4xl mb-2">💼</div>
                <p>No work experience added yet</p>
              </div>
              <Button onClick={addExperience} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          content.experience.map((exp, index) => (
            <Card key={exp.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Experience #{index + 1}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Job Title *</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <Label>Company *</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      placeholder="Tech Corp"
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={exp.endDate || ""}
                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                        disabled={exp.current}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pb-2">
                      <Switch
                        checked={exp.current}
                        onCheckedChange={(checked) => {
                          updateExperience(exp.id, "current", checked);
                          if (checked) {
                            updateExperience(exp.id, "endDate", "");
                          }
                        }}
                      />
                      <Label className="text-sm">Current</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Job Description</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAISuggestion(
                        exp.description,
                        "job_description",
                        { position: exp.position, company: exp.company },
                        (suggestion) => updateExperience(exp.id, "description", suggestion)
                      )}
                      disabled={isLoading || loadingSection === "job_description"}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      {loadingSection === "job_description" ? "Generating..." : "AI Suggest"}
                    </Button>
                  </div>
                  <RichTextEditor
                    value={exp.description}
                    onChange={(value) => updateExperience(exp.id, "description", value)}
                    placeholder="Describe your role and responsibilities..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Key Achievements</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAchievement(exp.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Achievement
                    </Button>
                  </div>
                  {exp.achievements.map((achievement, achIndex) => (
                    <div key={achIndex} className="flex items-center space-x-2 mb-2">
                      <Input
                        value={achievement}
                        onChange={(e) => updateAchievement(exp.id, achIndex, e.target.value)}
                        placeholder="Increased team productivity by 25%"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAchievement(exp.id, achIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  // Education Section
  if (section === "education") {
    const addEducation = () => {
      const newEducation: Education = {
        id: Date.now().toString(),
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        current: false,
        gpa: "",
        achievements: [],
      };
      onUpdate("education", [...content.education, newEducation]);
    };

    const updateEducation = (id: string, field: keyof Education, value: any) => {
      const updated = content.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      );
      onUpdate("education", updated);
    };

    const removeEducation = (id: string) => {
      const updated = content.education.filter(edu => edu.id !== id);
      onUpdate("education", updated);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Education</h3>
          <Button onClick={addEducation} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </div>

        {content.education.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground mb-4">
                <div className="text-4xl mb-2">🎓</div>
                <p>No education added yet</p>
              </div>
              <Button onClick={addEducation} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </CardContent>
          </Card>
        ) : (
          content.education.map((edu, index) => (
            <Card key={edu.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Education #{index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(edu.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Institution *</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                      placeholder="University of California"
                    />
                  </div>
                  <div>
                    <Label>Degree *</Label>
                    <Select
                      value={edu.degree}
                      onValueChange={(value) => updateEducation(edu.id, "degree", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select degree" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High School">High School</SelectItem>
                        <SelectItem value="Associate">Associate</SelectItem>
                        <SelectItem value="Bachelor">Bachelor</SelectItem>
                        <SelectItem value="Master">Master</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Field of Study</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                      placeholder="Computer Science"
                    />
                  </div>
                  <div>
                    <Label>GPA (Optional)</Label>
                    <Input
                      value={edu.gpa || ""}
                      onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                      placeholder="3.8"
                    />
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={edu.endDate || ""}
                        onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                        disabled={edu.current}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pb-2">
                      <Switch
                        checked={edu.current}
                        onCheckedChange={(checked) => {
                          updateEducation(edu.id, "current", checked);
                          if (checked) {
                            updateEducation(edu.id, "endDate", "");
                          }
                        }}
                      />
                      <Label className="text-sm">Current</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  // Skills Section
  if (section === "skills") {
    const addSkill = () => {
      const newSkill: Skill = {
        id: Date.now().toString(),
        name: "",
        category: "Technical",
        level: 3,
      };
      onUpdate("skills", [...content.skills, newSkill]);
    };

    const updateSkill = (id: string, field: keyof Skill, value: any) => {
      const updated = content.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      );
      onUpdate("skills", updated);
    };

    const removeSkill = (id: string) => {
      const updated = content.skills.filter(skill => skill.id !== id);
      onUpdate("skills", updated);
    };

    const skillCategories = ["Technical", "Soft Skills", "Languages", "Tools", "Frameworks"];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Skills</h3>
          <Button onClick={addSkill} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>

        {content.skills.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground mb-4">
                <div className="text-4xl mb-2">⚡</div>
                <p>No skills added yet</p>
              </div>
              <Button onClick={addSkill} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Skills
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {content.skills.map((skill) => (
              <Card key={skill.id}>
                <CardContent className="p-4">
                  <div className="grid md:grid-cols-4 gap-4 items-end">
                    <div>
                      <Label>Skill Name *</Label>
                      <Input
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                        placeholder="JavaScript"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={skill.category}
                        onValueChange={(value) => updateSkill(skill.id, "category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {skillCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Level (1-5)</Label>
                      <Select
                        value={skill.level.toString()}
                        onValueChange={(value) => updateSkill(skill.id, "level", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Beginner</SelectItem>
                          <SelectItem value="2">2 - Novice</SelectItem>
                          <SelectItem value="3">3 - Intermediate</SelectItem>
                          <SelectItem value="4">4 - Advanced</SelectItem>
                          <SelectItem value="5">5 - Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(skill.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback for unsupported sections
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Section "{section}" is not yet implemented.</p>
    </div>
  );
}
