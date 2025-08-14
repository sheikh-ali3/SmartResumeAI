import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Plus, 
  FileText, 
  Download, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  Grid3X3, 
  List, 
  MoreVertical,
  Star
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

type Resume = {
  id: number;
  title: string;
  content: any;
  templateId?: number;
  atsScore?: number;
  createdAt: string;
  updatedAt: string;
};

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ["/api/resumes"],
    enabled: isAuthenticated,
    retry: false,
  });

  const deleteResumeMutation = useMutation({
    mutationFn: async (resumeId: number) => {
      await apiRequest("DELETE", `/api/resumes/${resumeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Success",
        description: "Resume deleted successfully",
      });
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
        description: "Failed to delete resume",
        variant: "destructive",
      });
    },
  });

  const downloadResumeMutation = useMutation({
    mutationFn: async (resumeId: number) => {
      const response = await fetch(`/api/resumes/${resumeId}/export/pdf`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to download resume");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `resume-${resumeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
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
        description: "Failed to download resume",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userResumes = (resumes as Resume[]) || [];
  const totalResumes = userResumes.length;
  const totalDownloads = userResumes.reduce((acc, resume) => acc + Math.floor(Math.random() * 10), 0); // Mock data
  const avgScore = userResumes.length > 0 
    ? Math.round(userResumes.reduce((acc, resume) => acc + (resume.atsScore || 75), 0) / userResumes.length)
    : 0;

  const getUserInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return "1 day ago";
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const getTemplateColor = (templateId?: number) => {
    if (!templateId) return "bg-gray-500";
    
    const colors = [
      "bg-blue-500",
      "bg-purple-500", 
      "bg-emerald-500",
      "bg-orange-500",
      "bg-pink-500"
    ];
    
    return colors[templateId % colors.length];
  };

  const getTemplateName = (templateId?: number) => {
    if (!templateId) return "Default Template";
    
    const names = [
      "Modern Template",
      "Executive Template", 
      "Creative Template",
      "Professional Template",
      "Minimalist Template"
    ];
    
    return names[templateId % names.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-secondary text-white rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profileImageUrl || ""} />
                <AvatarFallback className="bg-primary text-white font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.email
                  }
                </h3>
                <p className="text-gray-300 text-sm">{user.email}</p>
              </div>
            </div>
            <Link href="/builder">
              <Button className="bg-primary hover:bg-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                New Resume
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">{totalResumes}</span>
              </div>
              <h4 className="font-semibold text-secondary">Total Resumes</h4>
              <p className="text-sm text-gray-600">Created this month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Download className="h-8 w-8 text-emerald-600" />
                <span className="text-2xl font-bold text-emerald-600">{totalDownloads}</span>
              </div>
              <h4 className="font-semibold text-secondary">Downloads</h4>
              <p className="text-sm text-gray-600">This month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">{avgScore}%</span>
              </div>
              <h4 className="font-semibold text-secondary">Avg. Score</h4>
              <p className="text-sm text-gray-600">ATS compatibility</p>
            </CardContent>
          </Card>
        </div>

        {/* Resumes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-secondary">Your Resumes</h4>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {resumesLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-20 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : userResumes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes yet</h3>
                <p className="text-gray-600 mb-4">Create your first resume to get started</p>
                <Link href="/builder">
                  <Button className="bg-primary hover:bg-blue-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Resume
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userResumes.map((resume) => (
                <Card key={resume.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-secondary text-lg">{resume.title}</h5>
                          <p className="text-sm text-gray-600">Last edited {formatDate(resume.updatedAt)}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge 
                              variant="secondary" 
                              className={`${getTemplateColor(resume.templateId)} text-white`}
                            >
                              {getTemplateName(resume.templateId)}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-accent fill-current" />
                              <span className="text-xs text-accent font-medium">
                                {resume.atsScore || 85}% ATS Score
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href={`/builder/${resume.id}`}>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:text-emerald-600"
                          onClick={() => downloadResumeMutation.mutate(resume.id)}
                          disabled={downloadResumeMutation.isPending}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-500">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem 
                              onClick={() => deleteResumeMutation.mutate(resume.id)}
                              className="text-red-600"
                              disabled={deleteResumeMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
