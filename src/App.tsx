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
            className={`fixed w-6 h-6 pointer-events-none z-50 transition-transform duration-200 ease-out ${isHovering ? 'scale-150' : 'scale-100'
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

// Typewriter animation component
const TypewriterText = ({ texts, speed = 100, deleteSpeed = 50, pauseTime = 2000 }: {
    texts: string[];
    speed?: number;
    deleteSpeed?: number;
    pauseTime?: number;
}) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const currentFullText = texts[currentTextIndex];

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (currentText.length < currentFullText.length) {
                    setCurrentText(currentFullText.slice(0, currentText.length + 1));
                } else {
                    // Finished typing, wait then start deleting
                    setTimeout(() => setIsDeleting(true), pauseTime);
                }
            } else {
                // Deleting
                if (currentText.length > 0) {
                    setCurrentText(currentText.slice(0, -1));
                } else {
                    // Finished deleting, move to next text
                    setIsDeleting(false);
                    setCurrentTextIndex((prev) => (prev + 1) % texts.length);
                }
            }
        }, isDeleting ? deleteSpeed : speed);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentTextIndex, texts, speed, deleteSpeed, pauseTime]);

    // Cursor blinking effect
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <span className="text-xl md:text-2xl text-gray-300">
            {currentText}
            <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
        </span>
    );
};

// Enhanced Spotify Widget - Based on lukky's design
const SpotifyWidget = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<{
        name: string;
        artist: string;
        album: string;
        image: string;
        external_url?: string;
        progress_ms?: number;
        duration_ms?: number;
    } | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [progress, setProgress] = useState(0);

    // Format time from milliseconds to MM:SS
    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Fetch current playing track from Netlify function
    const fetchNowPlaying = async () => {
        try {
            const response = await fetch('/.netlify/functions/spotify-now-playing');
            const data = await response.json();

            if (data.error) {
                console.error('Spotify API error:', data.error);
                setIsOnline(false);
                return;
            }

            setIsOnline(true);
            setIsPlaying(data.isPlaying);
            setCurrentTrack(data.track);

            if (data.track && data.track.progress_ms && data.track.duration_ms) {
                setProgress((data.track.progress_ms / data.track.duration_ms) * 100);
            }
        } catch (error) {
            console.error('Error fetching now playing:', error);
            setIsOnline(false);
            setCurrentTrack(null);
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        fetchNowPlaying();
        const interval = setInterval(fetchNowPlaying, 3000); // Update every 3 seconds
        return () => clearInterval(interval);
    }, []);

    // Update progress bar every second when playing - more accurate calculation
    useEffect(() => {
        if (!isPlaying || !currentTrack?.progress_ms || !currentTrack?.duration_ms) return;

        const startTime = Date.now();
        const initialProgress = currentTrack.progress_ms;

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const currentProgressMs = initialProgress + elapsed;
            const newProgress = (currentProgressMs / currentTrack.duration_ms!) * 100;

            if (newProgress >= 100) {
                setProgress(100);
                clearInterval(interval);
            } else {
                setProgress(newProgress);
            }
        }, 100); // Update every 100ms for smoother animation

        return () => clearInterval(interval);
    }, [isPlaying, currentTrack]);

    if (!isOnline) {
        return (
            <div className="fixed bottom-8 left-8 z-40 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 max-w-sm shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-white font-medium">neyo is currently offline</span>
                    <div className="text-gray-400">
                        <Music className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-gray-300 font-medium">Not listening to Spotify</div>
                        <div className="text-gray-500 text-sm">Offline</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentTrack || !isPlaying) {
        return (
            <div className="fixed bottom-8 left-8 z-40 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 max-w-sm shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-white font-medium">neyo is currently listening to:</span>
                    <div className="text-green-500">
                        <Music className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-gray-300 font-medium">Nothing playing</div>
                        <div className="text-gray-500 text-sm">Paused or stopped</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-8 left-8 z-40 p-4 bg-gray-900/90 backdrop-blur-sm border border-green-500/50 rounded-2xl max-w-xs hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                    <img
                        src={currentTrack.image || '/api/placeholder/48/48'}
                        alt="Album Art"
                        className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        {isPlaying ? <Play className="w-2 h-2 text-white" /> : <Pause className="w-2 h-2 text-white" />}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">neyo is listening to</p>
                    <a
                        href={currentTrack.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 font-semibold text-sm truncate hover:text-green-300 transition-colors block"
                    >
                        {currentTrack.name}
                    </a>
                    <p className="text-gray-400 text-xs truncate">by {currentTrack.artist}</p>
                </div>
            </div>

            {/* Compact Progress Bar */}
            {currentTrack.duration_ms && (
                <div className="space-y-1">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                        <div
                            className="bg-green-500 h-1 rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatTime((progress / 100) * currentTrack.duration_ms)}</span>
                        <span>{formatTime(currentTrack.duration_ms)}</span>
                    </div>
                </div>
            )}
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
            className={`fixed bottom-8 right-8 z-40 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
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
                        className={`interactive group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium overflow-hidden border ${
                            link.type === 'github' 
                                ? 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white border-gray-600 hover:border-gray-500 hover:shadow-lg hover:shadow-gray-500/20' 
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-green-500 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
                        } hover:-translate-y-1 hover:scale-105`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <ExternalLink className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="relative z-10">{link.label}</span>
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
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isActive
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
                                className={`interactive group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium overflow-hidden ${link.disabled
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : link.type === 'warning'
                                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white border border-yellow-500 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 hover:-translate-y-1 hover:scale-105'
                                        : link.type === 'primary'
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border border-purple-500 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 hover:scale-105'
                                            : link.type === 'discord'
                                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white border border-indigo-500 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 hover:scale-105'
                                            : 'border-2 border-purple-500 text-purple-400 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 hover:scale-105'
                                    }`}
                                onClick={link.type === 'warning' ? (e) => {
                                    e.preventDefault();
                                    setShowWarning(true);
                                } : undefined}
                            >
                                {!link.disabled && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                )}
                                <div className="relative z-10 flex items-center gap-2">
                                    {link.type === 'discord' && <MessageSquare className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />}
                                    {link.type === 'website' && <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />}
                                    {link.type === 'warning' && <AlertTriangle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />}
                                    {link.disabled && <X className="w-4 h-4" />}
                                    <span>{link.label}</span>
                                </div>
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
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 text-white relative overflow-x-hidden">
            {/* Grid pattern overlay */}
            <div className="fixed inset-0 opacity-15 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Dark overlay for better text readability */}
            <div className="fixed inset-0 bg-black/30 pointer-events-none" />

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
                                    className={`transition-colors hover:text-purple-400 ${activeSection === item.id ? 'text-purple-400' : 'text-gray-300'
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
                            <div className="mb-8">
                                <div className="bg-gray-800/50 rounded-xl p-6 border border-dashed border-gray-600 max-w-2xl mx-auto">
                                    <TypewriterText
                                        texts={[
                                            "Full Stack Developer",
                                            "See no evil, Hear no evil, Speak no evil",
                                            "You cannot change things by loving them harder"
                                        ]}
                                        speed={80}
                                        deleteSpeed={40}
                                        pauseTime={2500}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-6 mb-12">
                            {[
                                { icon: <img src="https://clipartcraft.com/images/discord-logo-transparent-gray-3.png" alt="Discord" className="w-6 h-6" />, href: "#", label: "Discord" },
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
                                className="interactive group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-500 hover:via-purple-600 hover:to-pink-500 text-white rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-2 hover:scale-105 border border-purple-400/20 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <span className="relative z-10 font-semibold">Learn More</span>
                                <ChevronDown className="w-5 h-5 relative z-10 group-hover:animate-bounce" />
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
                                { icon: <img src="https://clipartcraft.com/images/discord-logo-transparent-gray-3.png" alt="Discord" className="w-5 h-5" />, href: "#", label: "Discord" },
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