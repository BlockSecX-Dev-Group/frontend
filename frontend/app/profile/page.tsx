"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet,
  Trophy,
  LogOut,
  CheckCircle,
  User,
  RefreshCw,
  Coins,
  Star,
  Calendar,
  Target,
  Loader2,
  Shield,
  Copy,
  Zap,
  Award,
} from "lucide-react";

import {
  isAuthenticated,
  logoutUser,
  getUserBalance,
  getUserPoints,
  clearAuthData,
} from "@/api";
import { useLanguage } from "@/components/language-provider";

interface UserStats {
  balance: number;
  points: number;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);

  const [userStats, setUserStats] = useState<UserStats>({
    balance: 0,
    points: 0,
  });

  const loadUserInfo = useCallback(async () => {
    if (!isAuthenticated()) {
      return;
    }

    try {
      setIsLoadingUserInfo(true);

      const [balanceResponse, pointsResponse] = await Promise.allSettled([
        getUserBalance(),
        getUserPoints(),
      ]);

      let balance = 0;
      if (balanceResponse.status === 'fulfilled') {
        balance = balanceResponse.value;
      }

      let points = 0;
      if (pointsResponse.status === 'fulfilled') {
        points = pointsResponse.value;
      }

      setUserStats({ balance, points });
    } catch (error) {
      console.error("Failed to load user info:", error);
      toast({
        title: t("profile.load_failed"),
        description: t("profile.load_failed_desc"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingUserInfo(false);
    }
  }, [toast, t]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadUserInfo();
      toast({
        title: t("profile.refreshed"),
        description: t("profile.refresh_success"),
      });
    } catch (error) {
      toast({
        title: t("profile.refresh_failed"),
        description: t("profile.refresh_failed_desc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const checkAuthAndWallet = async () => {
      const savedAddress = localStorage.getItem("wallet_address");
      const hasAuth = isAuthenticated();

      if (savedAddress && hasAuth) {
        setWalletAddress(savedAddress);
        setIsWalletConnected(true);
        await loadUserInfo();
      } else {
        setIsWalletConnected(false);
        setWalletAddress("");
      }
    };

    checkAuthAndWallet();
  }, [loadUserInfo]);

  useEffect(() => {
    const handleAuthChange = () => {
      const savedAddress = localStorage.getItem("wallet_address");
      const hasAuth = isAuthenticated();

      if (savedAddress && hasAuth) {
        setWalletAddress(savedAddress);
        setIsWalletConnected(true);
        loadUserInfo();
      } else {
        setIsWalletConnected(false);
        setWalletAddress("");
        setUserStats({ balance: 0, points: 0 });
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "wallet_address") {
        handleAuthChange();
      }
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadUserInfo]);

  const handleDisconnect = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("wallet_address");
      localStorage.removeItem("wallet_type");
      clearAuthData();

      setIsWalletConnected(false);
      setWalletAddress("");
      setUserStats({ balance: 0, points: 0 });

      window.dispatchEvent(new Event("authStateChanged"));

      toast({
        title: t("profile.disconnected"),
        description: t("profile.disconnected_desc"),
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({ title: t("profile.copied"), description: t("profile.copied_desc") });
  };

  const quickActions = [
    {
      icon: Target,
      labelKey: "profile.action.learning",
      descKey: "profile.action.learning_desc",
      href: "/learning",
      color: "text-red-500",
    },
    {
      icon: Trophy,
      labelKey: "profile.action.leaderboard",
      descKey: "profile.action.leaderboard_desc",
      href: "/rank",
      color: "text-yellow-500",
    },
    {
      icon: Award,
      labelKey: "profile.action.nft",
      descKey: "profile.action.nft_desc",
      href: "/nft",
      color: "text-purple-500",
    },
    {
      icon: Shield,
      labelKey: "profile.action.audit",
      descKey: "profile.action.audit_desc",
      href: "/#audit",
      color: "text-primary",
    },
    {
      icon: Calendar,
      labelKey: "profile.action.signin",
      descKey: "profile.action.signin_desc",
      href: "/",
      color: "text-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-4xl relative z-10">
        {!isWalletConnected ? (
          // Wallet Not Connected UI
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border border-border/50 text-center max-w-lg mx-auto">
              <CardHeader className="pb-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl">{t("profile.not_connected.title")}</CardTitle>
                <CardDescription>
                  {t("profile.not_connected.desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="text-sm text-muted-foreground space-y-3 mb-6">
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("profile.not_connected.feature1")}
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("profile.not_connected.feature2")}
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("profile.not_connected.feature3")}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("profile.not_connected.hint")}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Connected User UI
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Wallet Info Card */}
            <Card className="border border-border/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                      <Wallet className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{t("profile.wallet")}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm text-muted-foreground font-mono">
                          {formatAddress(walletAddress)}
                        </code>
                        <button
                          onClick={copyAddress}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      size="sm"
                      disabled={isRefreshing || isLoadingUserInfo}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {t("profile.refresh")}
                    </Button>
                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("profile.disconnect")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {t("profile.connected")}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Balance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border border-border/50 h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t("profile.balance")}</p>
                        <div className="text-3xl font-bold">
                          {isLoadingUserInfo ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            (userStats.balance ?? 0).toLocaleString()
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t("profile.tokens")}</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                        <Coins className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Points */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border border-border/50 h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                  <CardContent className="pt-6 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t("profile.points")}</p>
                        <div className="text-3xl font-bold text-primary">
                          {isLoadingUserInfo ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            (userStats.points ?? 0).toLocaleString()
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t("profile.total_earned")}</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    {t("profile.quick_actions")}
                  </CardTitle>
                  <CardDescription>{t("profile.quick_actions_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <Link key={action.labelKey} href={action.href}>
                        <motion.div
                          className="group p-4 rounded-xl border border-border/50 hover:border-primary/30 bg-card hover:bg-muted/30 transition-all cursor-pointer text-center"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`w-10 h-10 mx-auto rounded-lg bg-muted/50 group-hover:bg-muted flex items-center justify-center mb-3 transition-colors`}>
                            <action.icon className={`h-5 w-5 ${action.color}`} />
                          </div>
                          <p className="font-medium text-sm">{t(action.labelKey)}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t(action.descKey)}</p>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
