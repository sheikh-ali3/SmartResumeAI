import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Template } from "@shared/schema";

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId: number | null;
  onSelectTemplate: (templateId: number) => void;
  showPreview?: boolean;
}

export default function TemplateSelector({ 
  templates, 
  selectedTemplateId, 
  onSelectTemplate,
  showPreview = false 
}: TemplateSelectorProps) {
  
  if (!templates || templates.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">📄</div>
        <p className="text-gray-500">No templates available</p>
      </div>
    );
  }

  const handleTemplateSelect = (templateId: number) => {
    onSelectTemplate(templateId);
  };

  return (
    <div className="template-grid">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={cn(
            "template-card",
            selectedTemplateId === template.id && "selected"
          )}
          onClick={() => handleTemplateSelect(template.id)}
        >
          <CardContent className="p-4">
            {/* Template Preview */}
            <div className="template-preview">
              {template.previewImage ? (
                <img 
                  src={template.previewImage} 
                  alt={template.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded">
                  <div className="w-12 h-16 bg-white rounded shadow-sm mb-2 flex items-center justify-center">
                    <div className="w-8 h-1 bg-gray-300 mb-1"></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center px-2">
                    {template.name}
                  </div>
                </div>
              )}
              
              {/* Selection Indicator */}
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{template.name}</h3>
                <div className="flex items-center space-x-1">
                  {template.isPremium && (
                    <Badge variant="secondary" className="text-xs">
                      Pro
                    </Badge>
                  )}
                </div>
              </div>
              
              {template.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                {template.category && (
                  <Badge variant="outline" className="text-xs">
                    {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                  </Badge>
                )}
                
                {showPreview && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle preview logic here
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
