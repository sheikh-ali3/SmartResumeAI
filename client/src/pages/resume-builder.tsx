import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import SectionEditor from "@/components/resume/section-editor";
import ResumePreview from "@/components/resume/resume-preview";
import TemplateSelector from "@/components/resume/template-selector";
import { 
  Save, 
  Download, 
  Eye, 
  Settings, 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Wrench,
  ArrowLeft,
  Brain
} from "lucide-react";
import { Link } from "wouter";
import type { ResumeContent } from "@shared/schema";

const initialResumeContent: ResumeContent = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: ""
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  customSections: []
};

export default function ResumeBuilder() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("personal");
  const [resumeContent, setResumeContent] = useState<ResumeContent>(initialResumeContent);
  const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Load existing resume if editing
  const { data: existingResume, isLoading: resumeLoading } = useQuery({
    queryKey: ["/api/resumes", id],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  // Load templates
  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
    retry: false,
  });

  // Update state when resume data loads
  useEffect(() => {
    if (existingResume) {
      setResumeContent(existingResume.content || initialResumeContent);
      setResumeTitle(existingResume.title);
      setSelectedTemplateId(existingResume.templateId || null);
    }
  }, [existingResume]);

  // Save resume mutation
  const saveResumeMutation = useMutation({
    mutationFn: async (data: { title: string; content: ResumeContent; templateId?: number }) => {
      if (id) {
        // Update existing resume
        return await apiRequest("PATCH", `/api/resumes/${id}`, data);
      } else {
        // Create new resume
        const response = await apiRequest("POST", "/api/resumes", data);
        return response.json();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Success",
        description: id ? "Resume updated successfully" : "Resume created successfully",
      });
      
      // If creating new resume, redirect to edit mode
      if (!id && data) {
        setLocation(`/builder/${data.id}`);
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save resume",
        variant: "destructive",
      });
    },
  });

  // AI suggestion mutation
  const aiSuggestionMutation = useMutation({
    mutationFn: async (data: { text: string; type: string; context?: any }) => {
      const response = await apiRequest("POST", "/api/ai/suggest", data);
      return response.json();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to get AI suggestions",
        variant: "destructive",
      });
    },
  });

  if (authLoading || (id && resumeLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSave = () => {
    saveResumeMutation.mutate({
      title: resumeTitle,
      content: resumeContent,
      templateId: selectedTemplateId || undefined,
    });
  };

  const handleAISuggestion = async (text: string, type: string, context?: any) => {
    const suggestion = await aiSuggestionMutation.mutateAsync({ text, type, context });
    return suggestion;
  };

  const updateResumeContent = (section: keyof ResumeContent, data: any) => {
    setResumeContent(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const calculateProgress = () => {
    let completedSections = 0;
    const totalSections = 5; // personal, summary, experience, education, skills

    if (resumeContent.personalInfo.firstName && resumeContent.personalInfo.email) completedSections++;
    if (resumeContent.summary) completedSections++;
    if (resumeContent.experience.length > 0) completedSections++;
    if (resumeContent.education.length > 0) completedSections++;
    if (resumeContent.skills.length > 0) completedSections++;

    return (completedSections / totalSections) * 100;
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "summary", label: "Summary", icon: FileText },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
                placeholder="Untitled Resume"
              />
              <div className="flex items-center space-x-2 mt-1">
                <Progress value={calculateProgress()} className="w-32 h-2" />
                <span className="text-sm text-gray-600">{Math.round(calculateProgress())}% complete</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveResumeMutation.isPending}
              className="bg-primary hover:bg-blue-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveResumeMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Editor */}
          <div className={`${showPreview ? "lg:col-span-6" : "lg:col-span-8"}`}>
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5 mb-6">
                    {sections.map((section) => (
                      <TabsTrigger key={section.id} value={section.id} className="flex items-center space-x-1">
                        <section.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{section.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {sections.map((section) => (
                    <TabsContent key={section.id} value={section.id}>
                      <SectionEditor
                        section={section.id as keyof ResumeContent}
                        content={resumeContent}
                        onUpdate={updateResumeContent}
                        onAISuggestion={handleAISuggestion}
                        isLoading={aiSuggestionMutation.isPending}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Template Selector / Preview */}
          <div className={`${showPreview ? "lg:col-span-6" : "lg:col-span-4"}`}>
            {showPreview ? (
              <Card>
                <CardContent className="p-6">
                  <ResumePreview 
                    content={resumeContent}
                    template={templates?.find(t => t.id === selectedTemplateId)}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Choose Template</h3>
                    <TemplateSelector
                      templates={templates || []}
                      selectedTemplateId={selectedTemplateId}
                      onSelectTemplate={setSelectedTemplateId}
                    />
                  </CardContent>
                </Card>

                {/* AI Suggestions Panel */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Brain className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-semibold">AI Assistant</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Use AI suggestions to improve your resume content as you edit each section.
                    </p>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <p className="text-sm text-emerald-800">
                        💡 Click the "AI Suggest" buttons in each section to get personalized recommendations.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
