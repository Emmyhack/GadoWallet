import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Clock, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Sparkles,
  Globe,
  Lock,
  Award,
  TrendingUp,
  Heart
} from 'lucide-react';

const LandingPageStitch: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Military-Grade Security',
      description: 'Bank-level encryption with Solana blockchain technology ensuring your assets are protected with the highest security standards.',
      color: 'from-blue-500 to-purple-500',
      delay: '0.1s'
    },
    {
      icon: Users,
      title: 'Multi-Heir Support',
      description: 'Designate multiple beneficiaries with individual conditions and automatic distribution percentages.',
      color: 'from-purple-500 to-pink-500',
      delay: '0.2s'
    },
    {
      icon: Clock,
      title: 'Smart Time Locks',
      description: 'Set intelligent time-based conditions with automatic triggers for seamless asset transfer.',
      color: 'from-pink-500 to-red-500',
      delay: '0.3s'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant transfers powered by Solana\'s high-performance blockchain technology.',
      color: 'from-green-500 to-blue-500',
      delay: '0.4s'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '25,000+', icon: Users, color: 'from-blue-400 to-purple-400' },
    { label: 'Assets Secured', value: '$50M+', icon: Shield, color: 'from-green-400 to-blue-400' },
    { label: 'Heirs Protected', value: '15,000+', icon: Heart, color: 'from-pink-400 to-red-400' },
    { label: 'Success Rate', value: '99.9%', icon: CheckCircle, color: 'from-green-400 to-emerald-400' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Crypto Investor',
      content: 'GadaWallet gave me complete peace of mind. The security features are incredible and the interface is so intuitive.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      company: 'TechCorp'
    },
    {
      name: 'Michael Chen',
      role: 'Digital Asset Manager',
      content: 'The platform\'s security and ease of use make it the perfect solution for managing my crypto legacy.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      company: 'Blockchain Ventures'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Crypto Enthusiast',
      content: 'I love how intuitive the interface is and how secure the smart contracts are. It\'s exactly what I was looking for.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      company: 'CryptoFuture'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse opacity-20"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full animate-pulse opacity-10"></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-25"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-white rounded-full animate-pulse opacity-15"></div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="hero-section relative">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-fade-in-up">
              {/* Floating Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8 animate-float">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">Trusted by 25,000+ users worldwide</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
                Secure Your
                <span className="gradient-text block glow-text">Digital Legacy</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
                Protect your crypto assets and ensure they're passed on securely to your loved ones with our 
                <span className="gradient-text font-semibold"> Solana-based inheritance platform</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Link
                  to="/dashboard"
                  className="btn-primary group text-lg px-10 py-5 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started Free
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Link>
                
                <button className="btn-secondary text-lg px-10 py-5 group">
                  <span className="flex items-center">
                    <Globe className="mr-3 w-6 h-6" />
                    Watch Demo
                  </span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-white/70">
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Bank-Level Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Audited Smart Contracts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm">Industry Leading</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-on-scroll">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Why Choose GadaWallet</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Built for the <span className="gradient-text">Future</span>
            </h2>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Experience the next generation of digital inheritance with cutting-edge technology and unparalleled security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="feature-card animate-on-scroll group" 
                  style={{ animationDelay: feature.delay }}
                >
                  <div className={`icon-container bg-gradient-to-br ${feature.color}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:gradient-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="stats-card animate-on-scroll group" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`icon-container bg-gradient-to-br ${stat.color} mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="text-4xl font-bold text-white mb-2 group-hover:gradient-text transition-all duration-300">
                    {stat.value}
                  </div>
                  
                  <div className="text-white/70 text-lg font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-on-scroll">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Simple steps to secure your digital legacy in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Connect Wallet', desc: 'Securely connect your Solana wallet', icon: Shield },
              { step: '02', title: 'Add Heirs', desc: 'Designate your beneficiaries', icon: Users },
              { step: '03', title: 'Set Conditions', desc: 'Define transfer conditions and timing', icon: Clock },
              { step: '04', title: 'Stay Active', desc: 'Maintain activity to keep plan active', icon: TrendingUp }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="glass-card p-8 text-center animate-on-scroll group" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-2xl">{item.step}</span>
                  </div>
                  
                  <div className="icon-container mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:gradient-text transition-all duration-300">
                    {item.title}
                  </h3>
                  
                  <p className="text-white/80 text-lg">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-on-scroll">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              What Our <span className="gradient-text">Users Say</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Join thousands of satisfied users who trust GadaWallet with their digital legacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card animate-on-scroll group" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mr-4 ring-2 ring-white/20"
                  />
                  <div>
                    <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                    <p className="text-white/40 text-xs">{testimonial.company}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-white/90 leading-relaxed text-lg italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-16 animate-on-scroll">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Ready to Get Started?</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Secure Your <span className="gradient-text">Digital Legacy</span> Today
            </h2>
            
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
              Join thousands of users who trust GadaWallet to protect their crypto assets and ensure a smooth transfer to their loved ones.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/dashboard"
                className="btn-primary text-xl px-12 py-6 group"
              >
                <span className="relative z-10 flex items-center">
                  Get Started Free
                  <ArrowRight className="ml-3 w-7 h-7 group-hover:translate-x-2 transition-transform" />
                </span>
              </Link>
              
              <button className="btn-secondary text-xl px-12 py-6 group">
                <span className="flex items-center">
                  <Globe className="mr-3 w-7 h-7" />
                  Learn More
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">GadaWallet</span>
              </div>
              <p className="text-white/70 mb-6 leading-relaxed">
                Secure your digital legacy with the most trusted crypto inheritance platform powered by Solana blockchain technology.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Product</h4>
              <ul className="space-y-3 text-white/70">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/add-heir" className="hover:text-white transition-colors">Add Heir</Link></li>
                <li><Link to="/claim-assets" className="hover:text-white transition-colors">Claim Assets</Link></li>
                <li><Link to="/batch-transfer" className="hover:text-white transition-colors">Batch Transfer</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-3 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-3 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-white/60">
              © 2024 GadaWallet. All rights reserved. Built with ❤️ on Solana.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageStitch; 