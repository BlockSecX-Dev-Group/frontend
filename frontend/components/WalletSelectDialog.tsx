"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type WalletId = "binance" | "browser";

interface WalletOption {
  id: WalletId;
  name: string;
  description: string;
  icon: string;
  downloadUrl: string;
  bgColor: string;
}

interface WalletSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (walletId: WalletId) => Promise<void>;
  isConnecting: boolean;
  connectingWallet: WalletId | null;
  isWalletInstalled: (walletId: WalletId) => boolean;
}

// Official wallet icons
// Binance official logo
const BINANCE_ICON = "https://public.bnbstatic.com/static/images/common/favicon.ico";

// Generic wallet icon (Ethereum logo as universal symbol)
const BROWSER_WALLET_ICON = "https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg";

// Wallet configurations
const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "binance",
    name: "Binance Web3 Wallet",
    description: "Connect with Binance Web3 Wallet",
    icon: BINANCE_ICON,
    downloadUrl: "https://www.binance.com/en/web3wallet",
    bgColor: "#F0B90B",
  },
  {
    id: "browser",
    name: "Browser Wallet",
    description: "MetaMask, OKX, Phantom, or any injected wallet",
    icon: BROWSER_WALLET_ICON,
    downloadUrl: "https://ethereum.org/en/wallets/find-wallet/",
    bgColor: "#627EEA",
  },
];

// Wallet option component
function WalletOptionItem({
  wallet,
  isInstalled,
  isConnecting,
  isSelected,
  onClick,
}: {
  wallet: WalletOption;
  isInstalled: boolean;
  isConnecting: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isDisabled = isConnecting && !isSelected;

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "w-full p-3 rounded-xl border-2 transition-all duration-200",
        "flex items-center gap-3 text-left",
        "hover:bg-muted/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isSelected && isConnecting
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50"
      )}
      whileHover={!isDisabled ? { scale: 1.01 } : undefined}
      whileTap={!isDisabled ? { scale: 0.99 } : undefined}
    >
      {/* Wallet Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${wallet.bgColor}20` }}
      >
        <img
          src={wallet.icon}
          alt={wallet.name}
          className="w-6 h-6 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Wallet Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground text-sm">{wallet.name}</span>
          {isSelected && isConnecting ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : isInstalled ? (
            <span className="w-2 h-2 rounded-full bg-green-500" title="Installed" />
          ) : (
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {wallet.description}
        </p>
      </div>
    </motion.button>
  );
}

export default function WalletSelectDialog({
  isOpen,
  onClose,
  onSelect,
  isConnecting,
  connectingWallet,
  isWalletInstalled,
}: WalletSelectDialogProps) {
  const [installedStatus, setInstalledStatus] = useState<Record<WalletId, boolean>>({
    binance: false,
    browser: false,
  });

  // Check wallet installation status when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure wallet providers are injected
      const timer = setTimeout(() => {
        setInstalledStatus({
          binance: isWalletInstalled("binance"),
          browser: isWalletInstalled("browser"),
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isWalletInstalled]);

  const handleWalletClick = async (wallet: WalletOption) => {
    if (!installedStatus[wallet.id]) {
      // Open download page in new tab
      window.open(wallet.downloadUrl, "_blank");
      return;
    }
    await onSelect(wallet.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isConnecting && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to the platform.
          </DialogDescription>
        </DialogHeader>

        {/* Wallet Options */}
        <div className="space-y-3 py-4">
          <AnimatePresence mode="wait">
            {WALLET_OPTIONS.map((wallet, index) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <WalletOptionItem
                  wallet={wallet}
                  isInstalled={installedStatus[wallet.id]}
                  isConnecting={isConnecting}
                  isSelected={connectingWallet === wallet.id}
                  onClick={() => handleWalletClick(wallet)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Info Notice */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>Not installed? Click to download from official source.</span>
        </div>

        {/* Cancel Button */}
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isConnecting}
          className="w-full"
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
