import { useEffect } from "react";
import Navbar from "@/components/navigation/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Brain, Search, Palette, TrendingUp, FileText, Upload, Zap, Star } from "lucide-react";

export default function Landing() {

  const features = [
    {
      icon: Brain,
      title: "AI Content Suggestions",
      description: "Get intelligent suggestions for professional summaries, bullet points, and skills based on your industry and role.",
      gradient: "from-blue-50 to-blue-100",
      iconColor: "text-primary"
    },
    {
      icon: Search,
      title: "Job Description Analysis",
      description: "Upload job descriptions and get personalized recommendations to match your resume with requirements.",
      gradient: "from-emerald-50 to-emerald-100", 
      iconColor: "text-accent"
    },
    {
      icon: Palette,
      title: "Professional Templates",
      description: "Choose from expertly designed, ATS-friendly templates that make your resume stand out to recruiters.",
      gradient: "from-purple-50 to-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Compatibility Scoring",
      description: "Get real-time scores showing how well your resume matches job requirements and industry standards.",
      gradient: "from-orange-50 to-orange-100",
      iconColor: "text-orange-600"
    },
    {
      icon: FileText,
      title: "Multiple Export Formats",
      description: "Download your resume in PDF, DOCX, or share via web link. Perfect for any application method.",
      gradient: "from-pink-50 to-pink-100",
      iconColor: "text-pink-600"
    },
    {
      icon: Upload,
      title: "Resume Import & Parse",
      description: "Upload your existing resume and our AI will automatically extract and organize your information.",
      gradient: "from-teal-50 to-teal-100",
      iconColor: "text-teal-600"
    }
  ];

  const templates = [
    {
      id: "modern",
      name: "Modern Professional",
      description: "Clean and contemporary design perfect for tech and creative industries",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=500"
    },
    {
      id: "executive", 
      name: "Executive Classic",
      description: "Traditional and formal design ideal for senior management positions",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=500"
    },
    {
      id: "creative",
      name: "Creative Edge", 
      description: "Bold and innovative design for designers and creative professionals",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=500"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "month",
      features: [
        "3 Resume templates",
        "Basic AI suggestions", 
        "PDF export",
        "1 Resume storage"
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Pro", 
      price: "$9",
      period: "month",
      features: [
        "All templates",
        "Advanced AI suggestions",
        "PDF, DOCX, Web export",
        "Unlimited resumes",
        "Job description analysis", 
        "ATS optimization"
      ],
      buttonText: "Start Pro Trial",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: "$29", 
      period: "month",
      features: [
        "Everything in Pro",
        "Custom templates",
        "Team collaboration",
        "Priority support",
        "Analytics dashboard"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-secondary leading-tight mb-6">
                Build Your Perfect Resume with <span className="text-primary">AI-Powered</span> Intelligence
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create professional, ATS-friendly resumes in minutes. Our AI analyzes job descriptions and optimizes your content for maximum impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-primary text-white hover:bg-blue-600"
                  onClick={() => window.location.href = "/api/login"}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Start Building Free
                </Button>
                <Button size="lg" variant="outline">
                  <FileText className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="text-accent mr-2 h-4 w-4" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-accent mr-2 h-4 w-4" />
                  <span>ATS-Optimized</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-accent mr-2 h-4 w-4" />
                  <span>Export to PDF</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Professional resume templates on a modern workspace" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">AI is optimizing your resume...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">Powered by Advanced AI Technology</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intelligent resume builder uses cutting-edge NLP and machine learning to help you create resumes that get noticed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`bg-gradient-to-br ${feature.gradient} border-none`}>
                <CardContent className="p-8">
                  <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className={`${feature.iconColor} h-6 w-6`} />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Builder Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">Build Your Resume in 3 Simple Steps</h2>
            <p className="text-xl text-gray-600">Our intuitive interface guides you through every step of the process</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">Enter Your Information</h3>
                  <p className="text-gray-600">Fill in your personal details, work experience, education, and skills. Our AI suggests improvements as you type.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">Choose Your Template</h3>
                  <p className="text-gray-600">Select from our collection of professional templates. Switch between templates anytime without losing your content.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">Download & Apply</h3>
                  <p className="text-gray-600">Export your optimized resume in your preferred format and start applying to your dream jobs with confidence.</p>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="bg-primary text-white hover:bg-blue-600"
                onClick={() => window.location.href = "/api/login"}
              >
                Start Building Now
              </Button>
            </div>
            
            <Card className="bg-white shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-secondary">Resume Builder</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Step Progress */}
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-primary h-2 rounded-full"></div>
                    <div className="flex-1 bg-primary h-2 rounded-full"></div>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full"></div>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full"></div>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full"></div>
                  </div>
                  
                  {/* Form Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-secondary">Professional Summary</h4>
                    <div className="relative">
                      <textarea 
                        className="w-full p-4 border border-gray-200 rounded-lg resize-none" 
                        rows={4} 
                        value="Experienced software developer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies."
                        readOnly
                      />
                      <Button 
                        size="sm" 
                        className="absolute bottom-2 right-2 bg-accent text-white hover:bg-emerald-600"
                      >
                        <Brain className="mr-1 h-3 w-3" />
                        AI Suggest
                      </Button>
                    </div>
                  </div>
                  
                  {/* AI Suggestions Panel */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">AI Suggestions</span>
                    </div>
                    <div className="text-sm text-emerald-700 space-y-1">
                      <p>• Add specific technologies you've worked with</p>
                      <p>• Mention years of experience more prominently</p>
                      <p>• Include quantifiable achievements</p>
                    </div>
                  </div>
                  
                  {/* Template Preview */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-2">Live Preview</div>
                    <div className="bg-gray-50 rounded p-3 text-xs space-y-2">
                      <div className="font-semibold">John Doe</div>
                      <div className="text-gray-600">Senior Software Developer</div>
                      <div className="border-t pt-2 text-gray-700">
                        Experienced software developer with 5+ years of expertise in full-stack development...
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">Professional Templates for Every Industry</h2>
            <p className="text-xl text-gray-600">Choose from our carefully crafted, ATS-optimized templates</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <Card key={template.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <img 
                    src={template.image} 
                    alt={`${template.name} resume template`}
                    className="w-full h-64 object-cover rounded-lg mb-4" 
                  />
                  <h3 className="font-semibold text-secondary mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-accent">
                      ATS-Friendly
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-blue-600">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-primary text-white hover:bg-blue-600"
              onClick={() => window.location.href = "/templates"}
            >
              View All Templates
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600">Start free and upgrade as you grow</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-secondary mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-secondary">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={plan.buttonVariant} 
                    className="w-full"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Land Your Dream Job?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have successfully transformed their careers with SmartResume AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-50"
              onClick={() => window.location.href = "/api/login"}
            >
              Start Building for Free
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-600">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-4">No credit card required • 2-minute setup • ATS-optimized templates</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">SmartResume AI</span>
              </div>
              <p className="text-gray-300">
                The AI-powered resume builder that helps you create professional, ATS-optimized resumes in minutes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/templates" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career Tips</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-300">© 2024 SmartResume AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
