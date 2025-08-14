import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brain, Menu, X, User, LogOut, FileText, LayoutTemplate } from "lucide-react";
import { Link } from "wouter";
import MobileMenu from "./mobile-menu";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Brain className="h-8 w-8 text-primary" />
                  <span className="text-xl font-bold text-secondary">SmartResume AI</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/templates">
                <a className="text-gray-600 hover:text-primary transition-colors">Templates</a>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <a className="text-gray-600 hover:text-primary transition-colors">Dashboard</a>
                  </Link>
                  
                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.profileImageUrl || ""} />
                          <AvatarFallback className="bg-primary text-white text-sm">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium leading-none">
                          {user?.firstName && user?.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user?.email
                          }
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <Link href="/dashboard">
                        <DropdownMenuItem className="cursor-pointer">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>My Resumes</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/templates">
                        <DropdownMenuItem className="cursor-pointer">
                          <LayoutTemplate className="mr-2 h-4 w-4" />
                          <span>Templates</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => window.location.href = "/api/logout"}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {!isLoading && (
                    <>
                      <Button 
                        variant="ghost" 
                        onClick={() => window.location.href = "/api/login"}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                      <Button 
                        onClick={() => window.location.href = "/api/login"}
                        className="bg-primary text-white hover:bg-blue-600"
                      >
                        Get Started Free
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        isLoading={isLoading}
      />
    </>
  );
}
