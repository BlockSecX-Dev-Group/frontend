"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Calendar,
  Users,
  RefreshCw,
  Loader2,
  Medal,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSignInRanking, getAnswerRanking } from "@/api";
import { RankingItem } from "@/api/types";
import { useLanguage } from "@/components/language-provider";

export default function RankingPage() {
  const { toast } = useToast();
  const { t } = useLanguage();

  // State Management
  const [activeTab, setActiveTab] = useState("sign-in");
  const [signInRanking, setSignInRanking] = useState<RankingItem[]>([]);
  const [answerRanking, setAnswerRanking] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Set mounted state and listen for auth changes
  useEffect(() => {
    setMounted(true);
    loadRankingData();

    // Listen for auth state changes
    const handleAuthChange = () => {
      loadRankingData();
    };

    window.addEventListener("authStateChanged", handleAuthChange);

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);

  const loadRankingData = async () => {
    setIsLoading(true);

    try {
      const [signInResult, answerResult] = await Promise.allSettled([
        getSignInRanking(),
        getAnswerRanking(),
      ]);

      // Handle sign-in ranking result
      if (signInResult.status === "fulfilled") {
        setSignInRanking(signInResult.value || []);
      } else {
        console.error("Sign-in ranking failed:", signInResult.reason);
        setSignInRanking([]);
      }

      // Handle answer ranking result
      if (answerResult.status === "fulfilled") {
        setAnswerRanking(answerResult.value || []);
      } else {
        console.error("Answer ranking failed:", answerResult.reason);
        setAnswerRanking([]);
      }

      setLastUpdateTime(new Date().toLocaleTimeString());

      // Show error if both failed
      if (signInResult.status === "rejected" && answerResult.status === "rejected") {
        toast({
          title: t("ranking.load_failed"),
          description: t("ranking.load_failed_desc"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: t("ranking.load_failed"),
        description: t("ranking.error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get rank display
  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: <Trophy className="h-5 w-5" />,
          color: "text-yellow-500",
          bg: "bg-yellow-500/10",
        };
      case 2:
        return {
          icon: <Medal className="h-5 w-5" />,
          color: "text-gray-400",
          bg: "bg-gray-400/10",
        };
      case 3:
        return {
          icon: <Medal className="h-5 w-5" />,
          color: "text-orange-500",
          bg: "bg-orange-500/10",
        };
      default:
        return {
          icon: null,
          color: "text-muted-foreground",
          bg: "",
        };
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRankingData();
    setIsRefreshing(false);
  };

  // Render ranking list
  const renderRankingList = (data: RankingItem[], type: "sign-in" | "answer") => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">{t("ranking.loading")}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!data || data.length === 0) {
      return (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">{t("ranking.no_data")}</p>
              <p className="text-sm text-muted-foreground">
                {type === "sign-in"
                  ? t("ranking.no_signin")
                  : t("ranking.no_answer")}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const rankDisplay = getRankDisplay(item.rank);

          return (
            <motion.div
              key={`${item.user_address}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`hover:shadow-md transition-shadow ${
                  item.rank <= 3 ? "border-primary/20" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${rankDisplay.bg} ${rankDisplay.color} font-bold`}
                      >
                        {rankDisplay.icon || item.rank}
                      </div>

                      {/* User Info */}
                      <div>
                        <div className="font-mono font-medium">
                          {formatAddress(item.user_address)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {t("ranking.rank")} #{item.rank}
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {(item.points ?? 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">{t("ranking.points")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Sign-in Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t("ranking.signin_card")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(signInRanking[0]?.points ?? 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t("ranking.top_scorer")}
              </p>
            </CardContent>
          </Card>

          {/* Answer Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {t("ranking.challenge_card")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(answerRanking[0]?.points ?? 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t("ranking.top_scorer")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-sm text-muted-foreground">
            {mounted ? lastUpdateTime || t("common.loading") : "---"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">{t("ranking.refresh")}</span>
          </Button>
        </motion.div>

        {/* Rankings Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="sign-in" className="gap-2">
                <Calendar className="h-4 w-4" />
                {t("ranking.signin_tab")}
              </TabsTrigger>
              <TabsTrigger value="answer" className="gap-2">
                <Trophy className="h-4 w-4" />
                {t("ranking.answer_tab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sign-in">
              {renderRankingList(signInRanking, "sign-in")}
            </TabsContent>

            <TabsContent value="answer">
              {renderRankingList(answerRanking, "answer")}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
