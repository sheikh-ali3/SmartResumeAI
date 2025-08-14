import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  User, 
  LogOut, 
  FileText, 
  LayoutTemplate,
  X,
  Home,
  LayoutGrid,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import type { User as UserType } from "@shared/schema";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user?: UserType;
  isLoading: boolean;
}

export default function MobileMenu({ 
  isOpen, 
  onClose, 
  isAuthenticated, 
  user, 
  isLoading 
}: MobileMenuProps) {
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className="mobile-menu">
      {/* Overlay */}
      <div 
        className="mobile-menu-overlay"
        onClick={onClose}
      />
      
      {/* Menu Content */}
      <div className="mobile-menu-content animate-slide-in">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-secondary">SmartResume AI</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 space-y-6">
            {/* User Info (if authenticated) */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profileImageUrl || ""} />
                  <AvatarFallback className="bg-primary text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.email
                    }
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={handleLinkClick}
                    >
                      <Home className="mr-3 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/builder">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={handleLinkClick}
                    >
                      <FileText className="mr-3 h-4 w-4" />
                      Resume Builder
                    </Button>
                  </Link>
                  <Link href="/analysis">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={handleLinkClick}
                    >
                      <TrendingUp className="mr-3 h-4 w-4" />
                      Compatibility Analysis
                    </Button>
                  </Link>
                  <Link href="/templates">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={handleLinkClick}
                    >
                      <LayoutTemplate className="mr-3 h-4 w-4" />
                      Templates
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={handleLinkClick}
                    >
                      <Home className="mr-3 h-4 w-4" />
                      Home
                    </Button>
                  </Link>
                  <Link href="/templates">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      onClick={handleLinkClick}
                    >
                      <LayoutTemplate className="mr-3 h-4 w-4" />
                      Templates
                    </Button>
                  </Link>
                </>
              )}
            </nav>

            <Separator />

            {/* Auth Actions */}
            <div className="space-y-2">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    onClose();
                    window.location.href = "/api/logout";
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <>
                  {!isLoading && (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          onClose();
                          window.location.href = "/api/login";
                        }}
                      >
                        <User className="mr-3 h-4 w-4" />
                        Sign In
                      </Button>
                      <Button
                        className="w-full bg-primary hover:bg-blue-600"
                        onClick={() => {
                          onClose();
                          window.location.href = "/api/login";
                        }}
                      >
                        Get Started Free
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Features (for unauthenticated users) */}
            {!isAuthenticated && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Features
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-4 w-4 text-primary" />
                      <span>AI-Powered Suggestions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <LayoutGrid className="h-4 w-4 text-emerald-600" />
                      <span>Professional Templates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span>ATS-Optimized Export</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              © 2024 SmartResume AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
