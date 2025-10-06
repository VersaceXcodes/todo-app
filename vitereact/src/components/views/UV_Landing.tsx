import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { CheckCircle, Users, Zap, Shield, ArrowRight, Star, Target, Clock, TrendingUp, Award, Globe, Smartphone } from 'lucide-react';

const UV_Landing: React.FC = () => {
  const isAuthenticated = useAppStore(
    (state) => state.authentication_state.authentication_status.is_authenticated
  );

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: <CheckCircle className="w-10 h-10 text-blue-600" />,
      title: "Smart Task Management",
      description: "AI-powered task categorization with intelligent priority suggestions and automated scheduling.",
      highlight: "30% faster task completion"
    },
    {
      icon: <Users className="w-10 h-10 text-green-600" />,
      title: "Real-time Collaboration",
      description: "Seamless team coordination with live updates, instant notifications, and shared workspaces.",
      highlight: "Teams report 40% better sync"
    },
    {
      icon: <Zap className="w-10 h-10 text-yellow-600" />,
      title: "Lightning Performance",
      description: "Blazing-fast interface with offline support and instant sync across all your devices.",
      highlight: "<100ms response time"
    },
    {
      icon: <Shield className="w-10 h-10 text-purple-600" />,
      title: "Enterprise Security",
      description: "Bank-level encryption, SOC 2 compliance, and advanced access controls for your data.",
      highlight: "99.9% uptime guarantee"
    },
    {
      icon: <Target className="w-10 h-10 text-red-600" />,
      title: "Goal Tracking",
      description: "Set and track objectives with visual progress indicators and milestone celebrations.",
      highlight: "Achieve 65% more goals"
    },
    {
      icon: <Smartphone className="w-10 h-10 text-indigo-600" />,
      title: "Mobile First",
      description: "Native mobile apps with full functionality, perfect for productivity on the go.",
      highlight: "Available on all platforms"
    }
  ];

  const testimonials = [
    {
      quote: "TodoMaster transformed how our team manages projects. Productivity is up 40% and we've never been more organized!",
      author: "Sarah Chen",
      role: "Project Manager",
      company: "TechCorp Inc."
    },
    {
      quote: "The most intuitive task management app I've ever used. The AI suggestions are spot-on every time.",
      author: "Mike Rodriguez",
      role: "Team Lead",
      company: "StartupXYZ"
    },
    {
      quote: "Finally, a tool that actually makes task management enjoyable. Our team adoption was instant.",
      author: "Emily Johnson",
      role: "Operations Director",
      company: "Enterprise Solutions"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Teams" },
    { number: "2M+", label: "Tasks Completed" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.9/5", label: "User Rating" }
  ];

  const companies = [
    "TechCorp", "StartupXYZ", "Enterprise Solutions", "InnovateCo", "GlobalTech", "FutureWorks"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Master Your Tasks,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {" "}Amplify Your Impact
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform chaos into clarity with TodoMaster - the intelligent task management platform 
              that helps teams accomplish more together, faster than ever before.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/signup"
                className="group inline-flex items-center px-8 py-4 rounded-full font-semibold text-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 rounded-full font-semibold text-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 border-2 border-gray-300 hover:border-gray-400"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Productive
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your workflow and boost team collaboration
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Teams Worldwide
            </h2>
            <div className="flex justify-center items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600 font-medium">4.9/5 from 1,200+ reviews</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of teams who have already revolutionized their workflow with TodoMaster
          </p>
          <Link
            to="/signup"
            className="group inline-flex items-center px-10 py-5 rounded-full font-bold text-xl text-blue-600 bg-white hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Start Your Free Trial Today
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-blue-200 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default UV_Landing;