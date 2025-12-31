"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Trophy,
  Target,
  Zap,
  ArrowRight,
  Loader2,
  CheckCircle,
  Star,
  Play,
  HelpCircle,
  BookOpen,
  Wallet,
  Lock,
  Code,
  FileCode,
  AlertTriangle,
  Bug,
  FileText,
  Copy,
  Download,
  Search,
  XCircle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { signIn, getUserPoints, isAuthenticated } from "@/api";
import { useLanguage } from "@/components/language-provider";
import {
  performFullAudit,
  AuditResponse,
  HoneypotCheckResponse,
} from "@/api/audit";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import dynamic from "next/dynamic";

// Dynamic import for Threads background (WebGL component)
const ThreadsBackground = dynamic(() => import("@/components/threads-background"), {
  ssr: false,
});

// Supported chains for Audit
const SUPPORTED_CHAINS = [
  { value: "eth", label: "Ethereum" },
  { value: "bsc", label: "BNB Chain" },
  { value: "polygon", label: "Polygon" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "optimism", label: "Optimism" },
  { value: "base", label: "Base" },
  { value: "avalanche", label: "Avalanche" },
];

// Cyber grid background with animated effects
function CyberBackground() {
  // Generate circuit paths
  const circuitPaths = useMemo(() => [
    { id: 1, d: "M0,100 L100,100 L100,200 L250,200", delay: 0 },
    { id: 2, d: "M400,0 L400,150 L550,150 L550,300", delay: 1 },
    { id: 3, d: "M800,50 L800,180 L650,180", delay: 2 },
    { id: 4, d: "M200,400 L200,300 L350,300 L350,200", delay: 0.5 },
    { id: 5, d: "M600,350 L750,350 L750,450 L900,450", delay: 1.5 },
  ], []);

  // Generate hexagon positions
  const hexagons = useMemo(() => [
    { id: 1, x: '10%', y: '20%', size: 60, delay: 0 },
    { id: 2, x: '85%', y: '15%', size: 80, delay: 1 },
    { id: 3, x: '75%', y: '70%', size: 50, delay: 2 },
    { id: 4, x: '15%', y: '75%', size: 70, delay: 1.5 },
    { id: 5, x: '50%', y: '85%', size: 40, delay: 0.5 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Hexagonal pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 15v22L30 52 0 37V15z' fill='none' stroke='rgba(240,185,11,0.15)' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 52px'
        }}
      />

      {/* Animated circuit lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(240,185,11,0.8)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {circuitPaths.map((path) => (
          <g key={path.id}>
            {/* Static circuit line */}
            <path
              d={path.d}
              fill="none"
              stroke="rgba(240,185,11,0.1)"
              strokeWidth="1"
            />
            {/* Animated glow traveling along path */}
            <motion.circle
              r="3"
              fill="rgba(240,185,11,0.8)"
              filter="url(#glow)"
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: "100%" }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: path.delay,
                ease: "linear"
              }}
              style={{ offsetPath: `path('${path.d}')` }}
            />
          </g>
        ))}
        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Animated hexagons */}
      {hexagons.map((hex) => (
        <motion.div
          key={hex.id}
          className="absolute"
          style={{
            left: hex.x,
            top: hex.y,
            width: hex.size,
            height: hex.size,
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [0.8, 1, 0.8],
            rotate: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: hex.delay,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
              fill="none"
              stroke="rgba(240,185,11,0.3)"
              strokeWidth="1"
            />
          </svg>
        </motion.div>
      ))}

      {/* Pulsing rings */}
      <div className="absolute top-1/4 right-1/4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/20"
            style={{
              width: 100 + i * 50,
              height: 100 + i * 50,
              left: -(50 + i * 25),
              top: -(50 + i * 25),
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Threads Background - WebGL animated lines */}
      <ThreadsBackground amplitude={1} distance={0} color={[0.94, 0.73, 0.04]} />

      {/* Animated gradient orb - top right */}
      <motion.div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(240,185,11,0.15) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Animated gradient orb - bottom left */}
      <motion.div
        className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Corner frame lines - enhanced */}
      <div className="absolute top-0 left-0 w-40 h-40">
        <div className="absolute top-8 left-0 w-32 h-[1px] bg-gradient-to-r from-primary/50 to-transparent" />
        <div className="absolute top-0 left-8 w-[1px] h-32 bg-gradient-to-b from-primary/50 to-transparent" />
        <motion.div
          className="absolute top-8 left-0 w-2 h-2 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <div className="absolute top-0 right-0 w-40 h-40">
        <div className="absolute top-8 right-0 w-32 h-[1px] bg-gradient-to-l from-primary/50 to-transparent" />
        <div className="absolute top-0 right-8 w-[1px] h-32 bg-gradient-to-b from-primary/50 to-transparent" />
        <motion.div
          className="absolute top-8 right-0 w-2 h-2 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-40 h-40">
        <div className="absolute bottom-8 left-0 w-32 h-[1px] bg-gradient-to-r from-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-8 w-[1px] h-32 bg-gradient-to-t from-primary/50 to-transparent" />
        <motion.div
          className="absolute bottom-8 left-0 w-2 h-2 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </div>
      <div className="absolute bottom-0 right-0 w-40 h-40">
        <div className="absolute bottom-8 right-0 w-32 h-[1px] bg-gradient-to-l from-primary/50 to-transparent" />
        <div className="absolute bottom-0 right-8 w-[1px] h-32 bg-gradient-to-t from-primary/50 to-transparent" />
        <motion.div
          className="absolute bottom-8 right-0 w-2 h-2 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        />
      </div>

      {/* Tech decoration - corner brackets */}
      <div className="absolute top-20 left-20 opacity-30">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M0,15 L0,0 L15,0" fill="none" stroke="rgba(240,185,11,0.5)" strokeWidth="2"/>
        </svg>
      </div>
      <div className="absolute top-20 right-20 opacity-30">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M25,0 L40,0 L40,15" fill="none" stroke="rgba(240,185,11,0.5)" strokeWidth="2"/>
        </svg>
      </div>
      <div className="absolute bottom-20 left-20 opacity-30">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M0,25 L0,40 L15,40" fill="none" stroke="rgba(240,185,11,0.5)" strokeWidth="2"/>
        </svg>
      </div>
      <div className="absolute bottom-20 right-20 opacity-30">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M25,40 L40,40 L40,25" fill="none" stroke="rgba(240,185,11,0.5)" strokeWidth="2"/>
        </svg>
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}

// Floating particles with glow
function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
      size: 2 + Math.random() * 3,
      isGold: Math.random() > 0.7, // 30% chance to be gold
    }))
  , []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${particle.isGold ? 'bg-primary/60' : 'bg-white/50'}`}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            boxShadow: particle.isGold
              ? '0 0 10px rgba(240,185,11,0.5)'
              : '0 0 6px rgba(255,255,255,0.3)',
          }}
          animate={{
            y: [-40, 40, -40],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Stats counter animation
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function HomePage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Home State
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [isUserConnected, setIsUserConnected] = useState(false);

  // Audit State
  const [contractAddress, setContractAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState("eth");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResponse | null>(null);
  const [honeypotResult, setHoneypotResult] = useState<HoneypotCheckResponse | null>(null);

  const auditSectionRef = useRef<HTMLDivElement>(null);

  // localStorage keys
  const AUDIT_CACHE_KEY = "bsa_audit_cache";

  // Load cached audit result on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(AUDIT_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.auditResult) setAuditResult(data.auditResult);
        if (data.honeypotResult) setHoneypotResult(data.honeypotResult);
        if (data.contractAddress) setContractAddress(data.contractAddress);
        if (data.selectedChain) setSelectedChain(data.selectedChain);
      }
    } catch (e) {
      console.log("Failed to load cached audit");
    }
  }, []);

  // Save audit result to localStorage when it changes
  useEffect(() => {
    if (auditResult || honeypotResult) {
      try {
        localStorage.setItem(AUDIT_CACHE_KEY, JSON.stringify({
          auditResult,
          honeypotResult,
          contractAddress,
          selectedChain,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.log("Failed to cache audit result");
      }
    }
  }, [auditResult, honeypotResult, contractAddress, selectedChain]);

  // Fetch user points function
  const fetchPoints = async () => {
    const connected = isAuthenticated();
    setIsUserConnected(connected);

    if (!connected) {
      setUserPoints(null);
      return;
    }

    setIsLoadingPoints(true);
    try {
      const points = await getUserPoints();
      setUserPoints(points);
    } catch (error) {
      console.log("Could not fetch points");
    } finally {
      setIsLoadingPoints(false);
    }
  };

  // Fetch user points on mount and listen for auth changes
  useEffect(() => {
    fetchPoints();

    const handleAuthChange = () => {
      fetchPoints();
    };

    window.addEventListener("authStateChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);

  // Handle daily sign-in
  const handleSignIn = async () => {
    if (!isAuthenticated()) {
      toast({
        title: t("wallet.connect"),
        description: t("home.signin.connect_first"),
        variant: "destructive",
      });
      return;
    }

    setIsSigningIn(true);
    try {
      const result = await signIn();
      toast({
        title: t("home.signin.success"),
        description: t("home.signin.earned").replace("{points}", String(result.points)),
      });
      const newPoints = await getUserPoints();
      setUserPoints(newPoints);
    } catch (error: any) {
      toast({
        title: t("home.signin.failed"),
        description: error.message || t("home.signin.already"),
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  // Audit Functions
  const handleAnalyze = async () => {
    // Validate input
    if (!contractAddress.trim()) {
      toast({
        title: t("audit.no_address"),
        description: t("audit.no_address_desc"),
        variant: "destructive",
      });
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress.trim())) {
      toast({
        title: t("audit.invalid_address"),
        description: t("audit.invalid_address_desc"),
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAuditResult(null);
    setHoneypotResult(null);

    try {
      // Full audit with address - fetches source code, honeypot check, and AI audit
      const result = await performFullAudit(
        selectedChain,
        contractAddress.trim()
      );
      setAuditResult(result.audit);
      setHoneypotResult(result.honeypot);

      toast({
        title: t("audit.complete"),
        description: t("audit.complete_desc"),
      });
    } catch (error: any) {
      console.error("Audit failed:", error);
      toast({
        title: t("audit.failed"),
        description: error.message || t("audit.failed_desc"),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "info":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleCopyReport = () => {
    if (!auditResult) return;
    const reportText = JSON.stringify(auditResult, null, 2);
    navigator.clipboard.writeText(reportText);
    toast({ title: t("audit.copied"), description: t("audit.copied_desc") });
  };

  const handleDownloadReport = () => {
    if (!auditResult) return;
    const reportText = JSON.stringify(auditResult, null, 2);
    const blob = new Blob([reportText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-report-${contractAddress || "code"}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToAudit = () => {
    auditSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: HelpCircle,
      title: t("learning.tabs.quiz"),
      description: t("home.features.quiz"),
      link: "/learning?tab=quiz",
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-500"
    },
    {
      icon: Target,
      title: t("learning.tabs.ctf"),
      description: t("home.features.ctf"),
      link: "/learning?tab=ctf",
      color: "from-red-500/20 to-red-600/20",
      iconColor: "text-red-500"
    },
    {
      icon: Play,
      title: t("learning.tabs.video"),
      description: t("home.features.video"),
      link: "/learning?tab=video",
      color: "from-green-500/20 to-green-600/20",
      iconColor: "text-green-500"
    },
    {
      icon: Shield,
      title: t("audit.title"),
      description: t("home.features.audit"),
      link: "/#audit",
      color: "from-primary/20 to-primary/30",
      iconColor: "text-primary"
    },
    {
      icon: BookOpen,
      title: t("nav.docs"),
      description: t("home.features.docs"),
      link: "/docs",
      color: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-500"
    },
    {
      icon: Trophy,
      title: t("nav.rankings"),
      description: t("home.features.rank"),
      link: "/rank",
      color: "from-yellow-500/20 to-yellow-600/20",
      iconColor: "text-yellow-500"
    },
  ];

  const stats = [
    { labelKey: "home.stats.challenges", value: 50, suffix: "+" },
    { labelKey: "home.stats.users", value: 1000, suffix: "+" },
    { labelKey: "home.stats.audits", value: 500, suffix: "+" },
  ];

  // Parse structured data from audit result
  const riskSummary = auditResult?.risk_summary;
  const riskLevel = riskSummary?.level || auditResult?.risk_level || "unknown";
  const riskScore = riskSummary?.score ?? auditResult?.risk_score;
  const verdict = riskSummary?.verdict || "unknown";
  const oneLine = riskSummary?.one_line || "";
  const investmentAdvice = auditResult?.investment_advice;
  const quickChecks = auditResult?.quick_checks;
  const structuredVulns = auditResult?.vulnerabilities;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <CyberBackground />
        <FloatingParticles />

        <div className="container mx-auto px-6 py-20 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-white/20 bg-white/5">
                  {t("home.badge.infra")}
                </Badge>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="block">{t("home.hero.title")}</span>
                <span className="text-primary relative">
                  Arena
                  <motion.span
                    className="absolute -bottom-2 left-0 h-1 bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
                {t("home.hero.subtitle")}
              </p>

              {/* Stats Row */}
              <motion.div
                className="flex gap-8 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {stats.map((stat, index) => (
                  <div key={stat.labelKey} className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs text-muted-foreground">{t(stat.labelKey)}</div>
                  </div>
                ))}
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild size="lg" className="group">
                    <Link href="/learning">
                      {t("home.hero.start")}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="lg" onClick={scrollToAudit}>
                    <Shield className="mr-2 h-5 w-5" />
                    {t("home.try_audit")}
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Right - Sign In Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="relative overflow-hidden bg-card/80 backdrop-blur-sm border-white/10">
                {/* Decorative corner */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

                <CardHeader className="text-center relative">
                  <motion.div
                    className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 border border-white/10"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src="/icon_in_white.png"
                      alt="Sign In"
                      width={48}
                      height={48}
                      className="h-12 w-12"
                    />
                  </motion.div>
                  <CardTitle className="text-2xl">{t("home.signin.title")}</CardTitle>
                  <CardDescription>
                    {t("home.signin.desc")}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 relative">
                  {/* Points Display */}
                  <motion.div
                    className="text-center p-6 bg-white/5 rounded-xl border border-white/10"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      {t("home.signin.points")}
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      {isLoadingPoints ? (
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      ) : userPoints != null ? (
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={userPoints}
                        >
                          {userPoints.toLocaleString()}
                        </motion.span>
                      ) : (
                        <span className="text-muted-foreground/50">---</span>
                      )}
                    </div>
                  </motion.div>

                  {/* Sign-in Button */}
                  {isUserConnected ? (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className="w-full h-14 text-lg relative overflow-hidden group"
                        size="lg"
                        onClick={handleSignIn}
                        disabled={isSigningIn}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          {isSigningIn ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              {t("home.signin.signing_in")}
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-5 w-5" />
                              {t("home.signin.button")}
                            </>
                          )}
                        </span>
                        {/* Shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                          animate={{ translateX: ["100%", "-100%"] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        />
                      </Button>
                    </motion.div>
                  ) : (
                    <Button
                      className="w-full h-14 text-lg"
                      size="lg"
                      variant="secondary"
                      disabled={true}
                    >
                      <Wallet className="mr-2 h-5 w-5" />
                      {t("home.signin.connect_first")}
                    </Button>
                  )}

                  {/* Bonus info */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>{t("home.signin.bonus")}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Audit Section (Integrated from Audit Page) */}
      <section id="audit" ref={auditSectionRef} className="py-24 bg-white/[0.02] relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="container mx-auto px-6 max-w-6xl relative">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 px-3 py-1 bg-white/5 text-primary border-primary/30">
              <Shield className="w-3 h-3 mr-2" />
              {t("audit.badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("audit.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("audit.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    {t("audit.input.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("audit.input.desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chain Selector */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("audit.select_chain")}
                    </label>
                    <Select
                      value={selectedChain}
                      onValueChange={setSelectedChain}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("audit.select_chain_placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CHAINS.map((chain) => (
                          <SelectItem key={chain.value} value={chain.value}>
                            {chain.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Address Input */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("audit.address")}
                    </label>
                    <Input
                      placeholder={t("audit.address_placeholder")}
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("audit.source_auto")}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("audit.analyzing")}
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          {t("audit.analyze")}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setContractAddress("");
                        setAuditResult(null);
                        setHoneypotResult(null);
                        localStorage.removeItem(AUDIT_CACHE_KEY);
                      }}
                    >
                      {t("audit.clear")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t("audit.results")}
                  </CardTitle>
                  <CardDescription>
                    {t("audit.results.desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                      <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                      <p className="text-muted-foreground">
                        {t("audit.results.loading")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t("audit.results.loading_hint")}
                      </p>
                    </div>
                  ) : !auditResult ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                      <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">
                        {t("audit.results.empty")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {/* Risk Score Header */}
                      <div className={`p-4 rounded-lg border-2 ${
                        verdict === 'dangerous' ? 'bg-red-500/10 border-red-500/30' :
                        verdict === 'risky' ? 'bg-orange-500/10 border-orange-500/30' :
                        verdict === 'caution' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-green-500/10 border-green-500/30'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`text-3xl font-bold ${
                              verdict === 'dangerous' ? 'text-red-500' :
                              verdict === 'risky' ? 'text-orange-500' :
                              verdict === 'caution' ? 'text-yellow-500' :
                              'text-green-500'
                            }`}>
                              {riskScore !== undefined ? `${riskScore}/100` : '--'}
                            </div>
                            <Badge className={getSeverityColor(riskLevel)}>
                              {riskLevel.toUpperCase()}
                            </Badge>
                          </div>
                          {investmentAdvice && (
                            <Badge variant="outline" className={`text-xs ${
                              investmentAdvice.recommendation === 'avoid' ? 'border-red-500 text-red-500' :
                              investmentAdvice.recommendation === 'caution' ? 'border-yellow-500 text-yellow-500' :
                              'border-green-500 text-green-500'
                            }`}>
                              {investmentAdvice.recommendation === 'avoid' ? `❌ ${t("audit.results.not_recommended")}` :
                               investmentAdvice.recommendation === 'caution' ? `⚠️ ${t("audit.results.caution")}` :
                               investmentAdvice.recommendation === 'safe_to_invest' ? `✅ ${t("audit.results.safe")}` :
                               `? ${t("audit.results.unknown")}`}
                            </Badge>
                          )}
                        </div>
                        {oneLine && (
                          <p className="text-sm text-muted-foreground">{oneLine}</p>
                        )}
                      </div>

                      {/* Quick Checks Grid */}
                      {quickChecks && (
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries({
                            [t("audit.check.open_source")]: quickChecks.is_open_source,
                            [t("audit.check.pause")]: quickChecks.has_pause_function,
                            [t("audit.check.blacklist")]: quickChecks.has_blacklist,
                            [t("audit.check.mint")]: quickChecks.has_mint_function,
                          }).map(([label, value]) => (
                            <div key={label} className="flex items-center gap-2 text-xs p-2 bg-secondary/20 rounded">
                              {label === t("audit.check.open_source") ? (
                                value ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />
                              ) : (
                                value ? <AlertTriangle className="h-3 w-3 text-yellow-500" /> : <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                              <span className="text-muted-foreground">{label}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Honeypot Detection */}
                      {honeypotResult && (
                        <div className={`p-3 rounded-lg border ${
                          honeypotResult.is_honeypot ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Lock className="h-4 w-4" />
                            <span className="font-medium text-sm">{t("audit.honeypot")}</span>
                            {honeypotResult.is_honeypot ? (
                              <Badge variant="destructive" className="text-xs">{t("audit.honeypot.detected")}</Badge>
                            ) : (
                              <Badge className="bg-green-500/20 text-green-500 text-xs">{t("audit.honeypot.safe")}</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div><span className="text-muted-foreground">{t("audit.honeypot.symbol")}:</span> {honeypotResult.token_symbol || 'N/A'}</div>
                            <div><span className="text-muted-foreground">{t("audit.honeypot.buy_tax")}:</span> {honeypotResult.buy_tax}%</div>
                            <div><span className="text-muted-foreground">{t("audit.honeypot.sell_tax")}:</span> {honeypotResult.sell_tax}%</div>
                          </div>
                        </div>
                      )}

                      {/* Vulnerabilities Summary */}
                      {structuredVulns && (
                        <div className="space-y-2">
                          {structuredVulns.critical?.length > 0 && (
                            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-red-500">Critical ({structuredVulns.critical.length})</span>
                              </div>
                              {structuredVulns.critical.map((v, i) => (
                                <p key={i} className="text-xs text-muted-foreground ml-6">• {v.title}</p>
                              ))}
                            </div>
                          )}
                          {structuredVulns.high?.length > 0 && (
                            <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium text-orange-500">High ({structuredVulns.high.length})</span>
                              </div>
                              {structuredVulns.high.map((v, i) => (
                                <p key={i} className="text-xs text-muted-foreground ml-6">• {v.title}</p>
                              ))}
                            </div>
                          )}
                          {structuredVulns.medium?.length > 0 && (
                            <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium text-yellow-500">Medium ({structuredVulns.medium.length})</span>
                              </div>
                              {structuredVulns.medium.map((v, i) => (
                                <p key={i} className="text-xs text-muted-foreground ml-6">• {v.title}</p>
                              ))}
                            </div>
                          )}
                          {structuredVulns.low?.length > 0 && (
                            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <Info className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-blue-500">Low ({structuredVulns.low.length})</span>
                              </div>
                              {structuredVulns.low.map((v, i) => (
                                <p key={i} className="text-xs text-muted-foreground ml-6">• {v.title}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Full AI Analysis - Markdown Rendered with Lazy Loading */}
                      {auditResult.raw_analysis && (
                        <details className="border rounded-lg overflow-hidden group">
                          <summary className="bg-secondary/30 px-4 py-2 border-b flex items-center gap-2 cursor-pointer hover:bg-secondary/40 transition-colors">
                            <span className="font-medium text-sm">{t("audit.full_analysis")}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{t("audit.click_expand")}</span>
                          </summary>
                          <div className="p-4 max-h-[400px] overflow-y-auto">
                            <MarkdownRenderer content={auditResult.raw_analysis} />
                          </div>
                        </details>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={handleCopyReport}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {t("audit.copy")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={handleDownloadReport}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {t("audit.download")}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 px-3 py-1 border-white/20 bg-white/5">
              <Code className="w-3 h-3 mr-2" />
              {t("home.badge.features")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.features.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={feature.link}>
                  <Card className="h-full group cursor-pointer relative overflow-hidden border-white/10 hover:border-white/20 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80">
                    {/* Top border accent */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardHeader className="relative">
                      <motion.div
                        className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors duration-300"
                        whileHover={{ rotate: 5 }}
                      >
                        <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                      </motion.div>
                      <CardTitle className="text-xl group-hover:text-white transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-medium">{t("home.explore")}</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Clean gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
        {/* Subtle corner accents */}
        <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-32 bg-gradient-to-b from-primary/20 to-transparent" />

        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Lock className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("home.cta.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t("home.cta.desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" asChild className="px-8">
                  <Link href="/learning">
                    {t("home.cta.start")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" asChild className="px-8">
                  <Link href="/docs">
                    {t("home.cta.docs")}
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}