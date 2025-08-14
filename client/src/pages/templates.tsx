import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navigation/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Star, Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Templates() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
    retry: false,
  });

  const filteredTemplates = (templates || []).filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "modern", "creative", "professional", "executive", "minimal"];

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary mb-4">
            Professional Resume Templates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our carefully crafted, ATS-optimized templates designed to help you stand out to employers
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {getCategoryLabel(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== "all" 
                ? "Try adjusting your search or filters" 
                : "Templates are loading..."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="relative mb-4">
                    {/* Template Preview */}
                    <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {template.previewImage ? (
                        <img 
                          src={template.previewImage} 
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-20 bg-white rounded-lg shadow-md mb-2 mx-auto flex items-center justify-center">
                            <div className="text-xs text-gray-500">Preview</div>
                          </div>
                          <div className="text-xs text-gray-500">{template.name}</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      {isAuthenticated ? (
                        <Link href={`/builder?template=${template.id}`}>
                          <Button size="sm" className="bg-primary hover:bg-blue-600">
                            Use Template
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-blue-600"
                          onClick={() => window.location.href = "/api/login"}
                        >
                          Use Template
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-secondary text-lg">{template.name}</h3>
                      <div className="flex items-center space-x-1">
                        {template.isPremium && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Pro
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                          ATS-Friendly
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description || "A professional resume template designed to help you stand out."}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        {template.category && (
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryLabel(template.category)}
                          </Badge>
                        )}
                      </div>
                      
                      {isAuthenticated ? (
                        <Link href={`/builder?template=${template.id}`}>
                          <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
                            Select Template
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-primary border-primary hover:bg-primary hover:text-white"
                          onClick={() => window.location.href = "/api/login"}
                        >
                          Select Template
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="mt-16 text-center bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Create Your Perfect Resume?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Sign up now and start building with our professional templates
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-50"
              onClick={() => window.location.href = "/api/login"}
            >
              Get Started Free
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
