"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet, LogOut, User, RefreshCw, Globe } from "lucide-react";
import { logoutUser } from "@/api";
import InviteCodeDialog from "../app/components/InviteCodeDialog";
import WalletSelectDialog, { WalletId } from "./WalletSelectDialog";
import { useLanguage } from "./language-provider";
import { useWallet, WalletType } from "@/contexts/WalletContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { t, language, setLanguage, languages, languageNames } = useLanguage();
  const { toast } = useToast();
  const { walletState, connectWallet, disconnectWallet, signAndLogin, formatAddress, isWalletInstalled } = useWallet();

  // Dialog states
  const [showWalletSelectDialog, setShowWalletSelectDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteDialogLoading, setInviteDialogLoading] = useState(false);
  const [inviteDialogError, setInviteDialogError] = useState("");
  const [showWalletChangedDialog, setShowWalletChangedDialog] = useState(false);

  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<WalletId | null>(null);

  // Pending registration data
  const [pendingRegistration, setPendingRegistration] = useState<{
    address: string;
    walletType: WalletType;
  } | null>(null);

  // Listen for wallet account change events
  useEffect(() => {
    const handleWalletChanged = () => {
      setShowWalletChangedDialog(true);
    };

    window.addEventListener("walletAccountChanged", handleWalletChanged);
    return () => {
      window.removeEventListener("walletAccountChanged", handleWalletChanged);
    };
  }, []);

  // Handle wallet selection
  const handleWalletSelect = async (walletId: WalletId) => {
    setIsConnecting(true);
    setConnectingWallet(walletId);

    try {
      const result = await connectWallet(walletId);

      if (result.success) {
        setShowWalletSelectDialog(false);
        toast({
          title: t("wallet.login_success"),
          description: "Welcome back!",
        });
      } else if (result.needsRegistration && result.address && result.walletType) {
        setShowWalletSelectDialog(false);
        setPendingRegistration({
          address: result.address,
          walletType: result.walletType,
        });
        setShowInviteDialog(true);
      }
    } catch (error: any) {
      toast({
        title: t("wallet.login_failed"),
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  // Handle reconnect after wallet change
  const handleReconnect = () => {
    setShowWalletChangedDialog(false);
    setShowWalletSelectDialog(true);
  };

  // Handle invite code confirmation
  const handleInviteCodeConfirm = async (inviteCode: string) => {
    if (!pendingRegistration) return;

    setInviteDialogLoading(true);
    setInviteDialogError("");

    try {
      const loginSuccess = await signAndLogin(pendingRegistration.address);

      if (loginSuccess) {
        localStorage.setItem("wallet_address", pendingRegistration.address);
        localStorage.setItem("wallet_type", pendingRegistration.walletType || "binance");

        toast({
          title: t("wallet.login_success"),
          description: "Welcome to BlockSec!",
        });

        setShowInviteDialog(false);
        setPendingRegistration(null);

        window.dispatchEvent(new Event("authStateChanged"));
      }
    } catch (error: any) {
      console.error("Login with invite code failed:", error);
      setInviteDialogError(error.message || "Failed to connect");
    } finally {
      setInviteDialogLoading(false);
    }
  };

  const handleInviteCodeCancel = () => {
    setShowInviteDialog(false);
    setPendingRegistration(null);
    setInviteDialogError("");
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      await disconnectWallet();
      toast({
        title: t("wallet.disconnect"),
        description: t("wallet.disconnect") + " Success",
      });
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50">
        <motion.header
          className="bg-background/80 backdrop-blur-md border-b border-border"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <nav
            className="mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-8"
            aria-label="Global"
          >
            <div className="flex lg:flex-1">
              <Link href="/" className="-m-1.5 p-1.5">
                <Image
                  src="/no_border.png"
                  alt="BlockSec Logo"
                  width={100}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center gap-x-6">
              {/* Navigation Links */}
              <div className="flex gap-x-8">
                <Link
                  href="/"
                  className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
                >
                  {t("nav.home")}
                </Link>
                <Link
                  href="/learning"
                  className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
                >
                  {t("nav.learning")}
                </Link>
                <Link
                  href="/#audit"
                  className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
                >
                  {t("nav.audit")}
                </Link>
                <Link
                  href="/docs"
                  className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
                >
                  {t("nav.docs")}
                </Link>
                <Link
                  href="/rank"
                  className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
                >
                  {t("nav.rankings")}
                </Link>
                <Link
                  href="/nft"
                  className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
                >
                  NFT
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
                >
                  {t("nav.profile")}
                </Link>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 px-2">
                      <Globe className="h-4 w-4" />
                      <span className="ml-1 text-xs hidden sm:inline">{languageNames[language]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={language === lang ? "bg-accent" : ""}
                      >
                        {languageNames[lang]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Wallet Connection Button */}
                {!walletState.isConnected ? (
                  <Button
                    onClick={() => setShowWalletSelectDialog(true)}
                    disabled={walletState.isConnecting}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 text-sm"
                    size="sm"
                  >
                    {walletState.isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                        {t("wallet.connecting")}
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        {t("wallet.connect")}
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center gap-x-3">
                    <div className="text-sm text-muted-foreground hidden md:flex items-center">
                      <User className="inline mr-1 h-4 w-4" />
                      {formatAddress(walletState.address)}
                    </div>
                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      size="sm"
                      className="text-sm"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("wallet.disconnect")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </motion.header>
      </div>

      {/* Wallet Select Dialog */}
      <WalletSelectDialog
        isOpen={showWalletSelectDialog}
        onClose={() => setShowWalletSelectDialog(false)}
        onSelect={handleWalletSelect}
        isConnecting={isConnecting}
        connectingWallet={connectingWallet}
        isWalletInstalled={isWalletInstalled}
      />

      {/* Invite Code Dialog */}
      <InviteCodeDialog
        isOpen={showInviteDialog}
        onConfirm={handleInviteCodeConfirm}
        onCancel={handleInviteCodeCancel}
        isLoading={inviteDialogLoading}
        error={inviteDialogError}
      />

      {/* Wallet Changed Dialog */}
      <Dialog open={showWalletChangedDialog} onOpenChange={setShowWalletChangedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("wallet.changed")}</DialogTitle>
            <DialogDescription>
              {t("wallet.changed_desc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleReconnect} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("wallet.reconnect")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
