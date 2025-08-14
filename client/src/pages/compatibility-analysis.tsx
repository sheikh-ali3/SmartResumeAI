import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Zap, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CompatibilityResult {
  id: number;
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  missingSkills: string[];
  recommendations: string[];
  detailedAnalysis: Record<string, any>;
  createdAt: string;
  analysis: {
    overallScore: number;
    skillsScore: number;
    experienceScore: number;
    educationScore: number;
    missingSkills: string[];
    recommendations: string[];
    detailedAnalysis: Record<string, any>;
  };
}

interface ResumeUpload {
  id: number;
  originalFilename: string;
  rawText: string;
  extractedSkills: string[];
  extractedExperience: string[];
  createdAt: string;
}

export default function CompatibilityAnalysis() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentResult, setCurrentResult] = useState<CompatibilityResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's uploaded resumes
  const { data: resumeUploads } = useQuery<ResumeUpload[]>({
    queryKey: ["/api/resume-uploads"],
    enabled: true,
  });

  // Fetch previous analyses
  const { data: previousAnalyses } = useQuery<CompatibilityResult[]>({
    queryKey: ["/api/analyses"],
    enabled: true,
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);
      
      const response = await fetch("/api/resume/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload resume");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setResumeText(data.rawText);
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been processed and is ready for analysis.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resume-uploads"] });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (data: { resumeText: string; jobDescription: string }) => {
      const response = await fetch("/api/analysis/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }
      
      return response.json();
    },
    onSuccess: (data: CompatibilityResult) => {
      setCurrentResult(data);
      toast({
        title: "Analysis completed",
        description: `Your resume scored ${data.overallScore}% compatibility!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
    },
    onError: () => {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      uploadMutation.mutate(file);
    }
  };

  const handleAnalysis = () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both resume text and job description.",
        variant: "destructive",
      });
      return;
    }

    analysisMutation.mutate({
      resumeText: resumeText.trim(),
      jobDescription: jobDescription.trim(),
    });
  };

  const useResumeUpload = (upload: ResumeUpload) => {
    setResumeText(upload.rawText);
    toast({
      title: "Resume loaded",
      description: `Loaded resume: ${upload.originalFilename}`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Resume Compatibility Analysis</h1>
        <p className="text-muted-foreground">
          Analyze how well your resume matches a specific job description using AI-powered analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resume Content
            </CardTitle>
            <CardDescription>
              Upload a resume file or paste the text content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="resume-upload">Upload Resume File</Label>
              <div className="mt-2">
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("resume-upload")?.click()}
                  disabled={uploadMutation.isPending}
                  className="w-full"
                  data-testid="button-upload-resume"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadMutation.isPending ? "Uploading..." : "Upload Resume"}
                </Button>
              </div>
            </div>

            {/* Previous Uploads */}
            {resumeUploads && resumeUploads.length > 0 && (
              <div>
                <Label>Or use a previously uploaded resume:</Label>
                <div className="mt-2 space-y-2">
                  {resumeUploads.slice(0, 3).map((upload) => (
                    <Button
                      key={upload.id}
                      variant="ghost"
                      onClick={() => useResumeUpload(upload)}
                      className="w-full justify-start text-sm"
                      data-testid={`button-use-resume-${upload.id}`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {upload.originalFilename}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Manual Text Input */}
            <div>
              <Label htmlFor="resume-text">Or paste resume text:</Label>
              <Textarea
                id="resume-text"
                placeholder="Paste your resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={8}
                data-testid="textarea-resume-text"
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Description Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Job Description
            </CardTitle>
            <CardDescription>
              Enter the job description you want to match against
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={12}
                data-testid="textarea-job-description"
              />
            </div>

            <div className="mt-6">
              <Button
                onClick={handleAnalysis}
                disabled={!resumeText.trim() || !jobDescription.trim() || analysisMutation.isPending}
                className="w-full"
                data-testid="button-analyze"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {analysisMutation.isPending ? "Analyzing..." : "Analyze Compatibility"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {currentResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              AI-powered compatibility analysis between your resume and the job description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(currentResult.overallScore)}`}>
                {currentResult.overallScore}%
              </div>
              <p className="text-muted-foreground">Overall Compatibility Score</p>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Progress value={currentResult.skillsScore} className="mb-2" />
                <Badge variant={getScoreVariant(currentResult.skillsScore)} data-testid="badge-skills-score">
                  Skills: {currentResult.skillsScore}%
                </Badge>
              </div>
              <div className="text-center">
                <Progress value={currentResult.experienceScore} className="mb-2" />
                <Badge variant={getScoreVariant(currentResult.experienceScore)} data-testid="badge-experience-score">
                  Experience: {currentResult.experienceScore}%
                </Badge>
              </div>
              <div className="text-center">
                <Progress value={currentResult.educationScore} className="mb-2" />
                <Badge variant={getScoreVariant(currentResult.educationScore)} data-testid="badge-education-score">
                  Education: {currentResult.educationScore}%
                </Badge>
              </div>
            </div>

            {/* Missing Skills */}
            {currentResult.missingSkills && currentResult.missingSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentResult.missingSkills.map((skill, index) => (
                    <Badge key={index} variant="outline" data-testid={`badge-missing-skill-${index}`}>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {currentResult.recommendations && currentResult.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {currentResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2" data-testid={`text-recommendation-${index}`}>
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Previous Analyses */}
      {previousAnalyses && previousAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Analyses</CardTitle>
            <CardDescription>Your recent compatibility analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previousAnalyses.slice(0, 5).map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setCurrentResult(analysis)}
                  data-testid={`card-previous-analysis-${analysis.id}`}
                >
                  <div>
                    <div className="font-medium">
                      Analysis from {new Date(analysis.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {analysis.missingSkills?.length || 0} missing skills identified
                    </div>
                  </div>
                  <Badge variant={getScoreVariant(analysis.overallScore)}>
                    {analysis.overallScore}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}