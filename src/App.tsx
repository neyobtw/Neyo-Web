import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  ExternalLink, 
  Code, 
  Briefcase, 
  User, 
  Star,
  ArrowUp,
  MessageSquare,
  Globe,
  AlertTriangle,
  X,
  ChevronDown,
  Zap,
  Shield,
  Gamepad2,
  Atom,
  Cloud,
  Music,
  Play,
  Pause
} from 'lucide-react';

// Cursor follower component
const CursorFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    // Use requestAnimationFrame for smoother updates
    let animationId: number;
    const throttledMouseMove = (e: MouseEvent) => {
      if (animationId) return;
      animationId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        animationId = 0;
      });
    };

    document.addEventListener('mousemove', throttledMouseMove, { passive: true });
    
    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .interactive');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      if (animationId) cancelAnimationFrame(animationId);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <div
      className={`fixed w-6 h-6 pointer-events-none z-50 transition-transform duration-200 ease-out ${
        isHovering ? 'scale-150' : 'scale-100'
      }`}
      style={{
        left: mousePosition.x - 16,
        top: mousePosition.y - 16,
        background: 'rgba(147, 51, 234, 0.8)',
        borderRadius: '50%',
        boxShadow: '0 0 20px rgba(147, 51, 234, 0.6)',
        willChange: 'transform',
      }}
    />
  );
};

// Spotify Now Playing Widget
const SpotifyWidget = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<{
    name: string;
    artist: string;
    album: string;
    image: string;
  } | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Fetch current playing track from our backend
  const fetchNowPlaying = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/spotify/now-playing');
      const data = await response.json();
      
      if (data.error) {
        console.error('Spotify API error:', data.error);
        setIsOnline(false);
        return;
      }
      
      setIsOnline(true);
      setIsPlaying(data.isPlaying);
      setCurrentTrack(data.track);
    } catch (error) {
      console.error('Error fetching now playing:', error);
      setIsOnline(false);
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchNowPlaying();
    
    // Update every 10 seconds
    const interval = setInterval(fetchNowPlaying, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed bottom-8 left-8 z-40 p-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-2xl max-w-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
            <Music className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-white font-medium">neyo is offline</p>
            <p className="text-gray-400 text-sm">Not listening to Spotify</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTrack || !isPlaying) {
    return (
      <div className="fixed bottom-8 left-8 z-40 p-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-2xl max-w-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
            <Music className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-white font-medium">neyo</p>
            <p className="text-gray-400 text-sm">Not listening to Spotify</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 left-8 z-40 p-4 bg-gray-900/90 backdrop-blur-sm border border-green-500/50 rounded-2xl max-w-xs hover:scale-105 transition-transform duration-300">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            {isPlaying ? <Play className="w-2 h-2 text-white" /> : <Pause className="w-2 h-2 text-white" />}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm">neyo is listening to</p>
          <p className="text-green-400 font-semibold text-sm truncate">{currentTrack.name}</p>
          <p className="text-gray-400 text-xs truncate">by {currentTrack.artist}</p>
        </div>
      </div>
    </div>
  );
};

// Scroll to top button
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-40 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

// Modal component for warnings/details
const Modal = ({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="text-gray-300 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Project card component
const ProjectCard = ({ title, description, tech, links, status }: {
  title: string;
  description: string;
  tech: string[];
  links: { type: string; url: string; label: string }[];
  status: 'active' | 'completed' | 'archived';
}) => {
  const statusColors = {
    active: 'bg-green-500',
    completed: 'bg-blue-500',
    archived: 'bg-gray-500'
  };

  return (
    <div className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
              <span className="text-sm text-gray-400 capitalize">{status}</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-300 mb-4">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tech.map((item, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm"
          >
            {item}
          </span>
        ))}
      </div>
      
      <div className="flex gap-2">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
};

// Staff position card
const StaffCard = ({ icon, title, description, links, isActive = true, warning }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  links: { type: string; url: string; label: string; disabled?: boolean }[];
  isActive?: boolean;
  warning?: {
    title: string;
    content: React.ReactNode;
  };
}) => {
  const [showWarning, setShowWarning] = useState(false);

  return (
    <>
      <div className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
            isActive 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
              : 'bg-gray-700'
          }`}>
            {icon}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-300 mb-4">{description}</p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.disabled ? undefined : link.url}
                target={link.disabled ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={`interactive flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm ${
                  link.disabled
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : link.type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : link.type === 'primary'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white'
                }`}
                onClick={link.type === 'warning' ? (e) => {
                  e.preventDefault();
                  setShowWarning(true);
                } : undefined}
              >
                {link.type === 'discord' && <MessageSquare className="w-4 h-4" />}
                {link.type === 'website' && <Globe className="w-4 h-4" />}
                {link.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                {link.disabled && <X className="w-4 h-4" />}
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      
      {warning && (
        <Modal
          isOpen={showWarning}
          onClose={() => setShowWarning(false)}
          title={warning.title}
        >
          {warning.content}
        </Modal>
      )}
    </>
  );
};

function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'projects', 'current-staff', 'past-staff'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-x-hidden">
      {/* Full page gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-pink-900/20 pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <CursorFollower />
      <ScrollToTop />
     <SpotifyWidget />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              neyo
            </div>
            <div className="hidden md:flex items-center gap-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'projects', label: 'Projects' },
                { id: 'current-staff', label: 'Current Roles' },
                { id: 'past-staff', label: 'Past Roles' }
              ].map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`transition-colors hover:text-purple-400 ${
                    activeSection === item.id ? 'text-purple-400' : 'text-gray-300'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-20">
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                neyo
              </h1>
              <div className="text-xl md:text-2xl text-gray-300 mb-8">
                {/* PLACEHOLDER: Add your main title/role here */}
                <p className="bg-gray-800 rounded-lg p-4 border border-dashed border-gray-600">
                  [Your main title/role - edit this description]
                </p>
              </div>
            </div>
            
            <div className="flex justify-center gap-6 mb-12">
              {[
                { icon: <MessageSquare className="w-6 h-6" />, href: "#", label: "Discord" },
                { icon: <Github className="w-6 h-6" />, href: "#", label: "GitHub" },
                { icon: <Twitter className="w-6 h-6" />, href: "#", label: "Twitter" },
                { icon: <Mail className="w-6 h-6" />, href: "#", label: "Email" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="interactive group p-4 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1"
                  aria-label={social.label}
                >
                  <div className="text-gray-400 group-hover:text-purple-400 transition-colors">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
            
            <div className="flex justify-center">
              <a
                href="#about"
                className="interactive flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-1"
              >
                <span>Learn More</span>
                <ChevronDown className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                About Me
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="w-80 h-80 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
                  <div className="relative w-full h-full bg-gray-800 rounded-3xl border-4 border-purple-500/20 overflow-hidden">
                    {/* PLACEHOLDER: Add your profile image here */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <User className="w-24 h-24 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* PLACEHOLDER: Add your description here */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-dashed border-gray-600">
                    <p className="text-gray-300 leading-relaxed">
                      [Add your personal description here - tell people about yourself, your interests, background, etc.]
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-dashed border-gray-600">
                    <p className="text-gray-300 leading-relaxed">
                      [Add more details about your experience, skills, or what you're passionate about]
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">5+</div>
                    <div className="text-sm text-gray-400">Years Experience</div>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-pink-400">10+</div>
                    <div className="text-sm text-gray-400">Communities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Projects
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4" />
              <p className="text-gray-300 text-lg">Things I've built and worked on</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Sample Project - Replace with actual projects */}
              <ProjectCard
                title="Sample Project 1"
                description="[Replace with your actual project description]"
                tech={["React", "TypeScript", "Tailwind"]}
                links={[
                  { type: "github", url: "#", label: "GitHub" },
                  { type: "demo", url: "#", label: "Live Demo" }
                ]}
                status="active"
              />
              
              <ProjectCard
                title="Sample Project 2"
                description="[Replace with your actual project description]"
                tech={["Node.js", "Express", "MongoDB"]}
                links={[
                  { type: "github", url: "#", label: "GitHub" }
                ]}
                status="completed"
              />
            </div>
            
            {/* Empty State */}
            <div className="text-center mt-12 p-12 bg-gray-900/30 border border-dashed border-gray-700 rounded-2xl">
              <Cloud className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">More Projects Coming Soon</h3>
              <p className="text-gray-400">Check back later or reach out to collaborate!</p>
            </div>
          </div>
        </section>

        {/* Current Staff Positions */}
        <section id="current-staff" className="py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Current Roles
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4" />
              <p className="text-gray-300 text-lg">Where I'm currently active</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Replace these with your actual current positions */}
              <StaffCard
                icon={<Gamepad2 className="w-8 h-8 text-white" />}
                title="Sample Community 1"
                description="[Add description of your role and the community]"
                links={[
                  { type: "discord", url: "#", label: "Join Server" },
                  { type: "website", url: "#", label: "Website" }
                ]}
              />
              
              <StaffCard
                icon={<Shield className="w-8 h-8 text-white" />}
                title="Sample Community 2"
                description="[Add description of your role and the community]"
                links={[
                  { type: "discord", url: "#", label: "Join Server" },
                  { type: "primary", url: "#", label: "Website" }
                ]}
              />
              
              <StaffCard
                icon={<Zap className="w-8 h-8 text-white" />}
                title="Sample Community 3"
                description="[Add description of your role and the community]"
                links={[
                  { type: "discord", url: "#", label: "Join Server" }
                ]}
              />
            </div>
          </div>
        </section>

        {/* Past Staff Positions */}
        <section id="past-staff" className="py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Past Roles
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4" />
              <p className="text-gray-300 text-lg">Previous positions and experiences</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Sample past positions - Replace with actual ones */}
              <StaffCard
                icon={<Atom className="w-8 h-8 text-gray-400" />}
                title="Previous Community 1"
                description="[Add description of your past role and why you left]"
                links={[
                  { type: "info", url: "#", label: "No Longer Active", disabled: true }
                ]}
                isActive={false}
              />
              
              <StaffCard
                icon={<Star className="w-8 h-8 text-gray-400" />}
                title="Previous Community 2"
                description="[Add description with option to explain departure]"
                links={[
                  { type: "warning", url: "#", label: "Why I Left" },
                  { type: "info", url: "#", label: "No Longer Staff", disabled: true }
                ]}
                isActive={false}
                warning={{
                  title: "Why I Left [Community Name]",
                  content: (
                    <div className="space-y-4">
                      <p>[Add your explanation here about why you left this position]</p>
                      <p>[You can include multiple paragraphs to explain the situation]</p>
                      <p>[This gives transparency about your professional history]</p>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-gray-800 mt-20">
          <div className="text-center">
            <div className="mb-6">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                neyo
              </div>
              <p className="text-gray-400">Thanks for visiting!</p>
            </div>
            
            <div className="flex justify-center gap-6 mb-6">
              {[
                { icon: <MessageSquare className="w-5 h-5" />, href: "#", label: "Discord" },
                { icon: <Github className="w-5 h-5" />, href: "#", label: "GitHub" },
                { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
                { icon: <Mail className="w-5 h-5" />, href: "#", label: "Email" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="interactive text-gray-400 hover:text-purple-400 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            <p className="text-gray-500 text-sm">
              © 2024 neyo. Built with React & Tailwind CSS.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;