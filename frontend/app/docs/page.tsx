"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Code,
  Shield,
  Zap,
  Target,
  Users,
  Trophy,
  ChevronRight,
  Search,
  FileText,
  Play,
  HelpCircle,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Bug,
  Lock,
  ArrowLeft,
  ScrollText,
  Download
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

export default function DocsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  // Article content using translation keys
  const getArticleContent = (slug: string) => ({
    title: t(`docs.article.${slug.replace(/-/g, '_')}`),
    content: t(`docs.article.${slug.replace(/-/g, '_')}_content`)
  });

  // Documentation categories with translations
  const docCategories = [
    {
      title: t("docs.cat.getting_started"),
      icon: Zap,
      description: t("docs.cat.getting_started_desc"),
      articles: [
        { title: t("docs.article.what_is_bsa"), slug: "what-is-bsa", readTime: "3" },
        { title: t("docs.article.connect_wallet"), slug: "connect-wallet", readTime: "2" },
        { title: t("docs.article.earn_points"), slug: "earn-points", readTime: "4" },
      ]
    },
    {
      title: t("docs.cat.quiz"),
      icon: HelpCircle,
      description: t("docs.cat.quiz_desc"),
      articles: [
        { title: t("docs.article.ai_quiz"), slug: "ai-quiz", readTime: "3" },
      ]
    },
    {
      title: t("docs.cat.ctf"),
      icon: Target,
      description: t("docs.cat.ctf_desc"),
      articles: [
        { title: t("docs.article.ctf_intro"), slug: "ctf-intro", readTime: "4" },
        { title: t("docs.article.reentrancy"), slug: "reentrancy", readTime: "8" },
        { title: t("docs.article.flash_loan"), slug: "flash-loan", readTime: "10" },
      ]
    },
    {
      title: t("docs.cat.audit"),
      icon: Shield,
      description: t("docs.cat.audit_desc"),
      articles: [
        { title: t("docs.article.audit_overview"), slug: "audit-overview", readTime: "4" },
      ]
    },
  ];

  // Featured guides with translations
  const featuredGuides = [
    {
      title: t("docs.guide.web3_security"),
      description: t("docs.guide.web3_security_desc"),
      icon: Shield,
      difficulty: t("docs.difficulty.beginner"),
      readTime: "15",
      slug: "what-is-bsa"
    },
    {
      title: t("docs.guide.mastering_reentrancy"),
      description: t("docs.guide.mastering_reentrancy_desc"),
      icon: Bug,
      difficulty: t("docs.difficulty.advanced"),
      readTime: "20",
      slug: "reentrancy"
    },
    {
      title: t("docs.guide.flash_loan_security"),
      description: t("docs.guide.flash_loan_security_desc"),
      icon: Lock,
      difficulty: t("docs.difficulty.intermediate"),
      readTime: "12",
      slug: "flash-loan"
    },
  ];

  const filteredCategories = docCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleArticleClick = (slug: string) => {
    setSelectedArticle(slug);
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
  };

  // If an article is selected, show the article view
  if (selectedArticle) {
    const article = getArticleContent(selectedArticle);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              className="mb-6"
              onClick={handleCloseArticle}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("docs.back")}
            </Button>

            {/* Article Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {article.content.split('\n\n').map((paragraph, index) => {
                    // Handle code blocks
                    if (paragraph.includes('```')) {
                      const codeMatch = paragraph.match(/```(\w+)?\n?([\s\S]*?)```/);
                      if (codeMatch) {
                        return (
                          <pre key={index} className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm font-mono">{codeMatch[2]}</code>
                          </pre>
                        );
                      }
                    }
                    // Handle headers
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h4 key={index} className="font-semibold text-lg mt-6 mb-2">
                          {paragraph.replace(/\*\*/g, '')}
                        </h4>
                      );
                    }
                    // Handle list items
                    if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                      return (
                        <ul key={index} className="list-disc pl-6 space-y-1">
                          {paragraph.split('\n').map((item, i) => (
                            <li key={i} className="text-muted-foreground">
                              {item.replace(/^[-\d.]\s*/, '').replace(/\*\*/g, '')}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    // Regular paragraphs
                    return (
                      <p key={index} className="text-muted-foreground mb-4 whitespace-pre-line">
                        {paragraph.split('**').map((part, i) =>
                          i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
                        )}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Related Articles */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4">{t("docs.continue_learning")}</h3>
              <div className="flex flex-wrap gap-2">
                {["what-is-bsa", "connect-wallet", "earn-points", "ctf-intro", "reentrancy"]
                  .filter(slug => slug !== selectedArticle)
                  .slice(0, 3)
                  .map(slug => (
                    <Button
                      key={slug}
                      variant="outline"
                      size="sm"
                      onClick={() => handleArticleClick(slug)}
                    >
                      {t(`docs.article.${slug.replace(/-/g, '_')}`)}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">
            {t("docs.title")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("docs.subtitle")}
          </p>
        </motion.div>

        {/* Whitepaper Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-primary/20">
                  <ScrollText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <Badge variant="secondary" className="mb-1">{t("docs.official_document")}</Badge>
                  <CardTitle className="text-2xl">{t("docs.whitepaper")}</CardTitle>
                </div>
              </div>
              <CardDescription className="text-base max-w-2xl">
                {t("docs.whitepaper_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="gap-2">
                  <a href="/doc/whitebook.pdf" target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4" />
                    {t("docs.read_whitepaper")}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <a href="/doc/whitebook.pdf" download="BSA_Whitepaper.pdf">
                    <Download className="h-4 w-4" />
                    {t("docs.download_pdf")}
                  </a>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>{t("docs.security_architecture")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>{t("docs.platform_vision")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span>{t("docs.tokenomics")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>{t("docs.technical_details")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Guides */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            {t("docs.featured")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredGuides.map((guide, index) => (
              <Card
                key={index}
                className="hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => handleArticleClick(guide.slug)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <guide.icon className="h-8 w-8 text-primary" />
                    <Badge variant="outline">{guide.difficulty}</Badge>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {guide.title}
                  </CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{guide.readTime} {t("docs.read_time")}</span>
                    <Button variant="ghost" size="sm" className="gap-1">
                      {t("docs.read_guide")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Documentation Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            {t("docs.documentation")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredCategories.map((category, index) => (
              <Card key={index} className="hover:border-primary/30 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <button
                          onClick={() => handleArticleClick(article.slug)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group text-left"
                        >
                          <span className="text-sm group-hover:text-primary transition-colors">
                            {article.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {article.readTime} {t("docs.read_time")}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="mt-12 p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{t("docs.ready_to_learn")}</h2>
            <p className="text-muted-foreground">
              {t("docs.ready_to_learn_desc")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link href="/learning">
                <Target className="mr-2 h-4 w-4" />
                {t("docs.start_challenges")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/#audit">
                <Shield className="mr-2 h-4 w-4" />
                {t("docs.try_audit")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/rank">
                <Trophy className="mr-2 h-4 w-4" />
                {t("docs.view_leaderboard")}
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* BSA Introduction */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                {t("docs.about_bsa")}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                <strong>BSA</strong> {t("docs.about_bsa_intro")}
              </p>

              <h4>{t("docs.problem_title")}</h4>
              <ul>
                <li>
                  <strong>{t("docs.problem_risk").split('：')[0]}：</strong>
                  {t("docs.problem_risk").split('：')[1]}
                </li>
                <li>
                  <strong>{t("docs.problem_talent").split('：')[0]}：</strong>
                  {t("docs.problem_talent").split('：')[1]}
                </li>
                <li>
                  <strong>{t("docs.problem_ecosystem").split('：')[0]}：</strong>
                  {t("docs.problem_ecosystem").split('：')[1]}
                </li>
              </ul>

              <h4>{t("docs.solution_title")}</h4>
              <ul>
                <li>
                  <strong>{t("docs.solution_quiz").split('：')[0]}：</strong>
                  {t("docs.solution_quiz").split('：')[1]}
                </li>
                <li>
                  <strong>{t("docs.solution_ctf").split('：')[0]}：</strong>
                  {t("docs.solution_ctf").split('：')[1]}
                </li>
                <li>
                  <strong>{t("docs.solution_course").split('：')[0]}：</strong>
                  {t("docs.solution_course").split('：')[1]}
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
