"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ethers } from "ethers";
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
import { useLanguage } from "@/components/language-provider";
import {
  Sparkles,
  CheckCircle,
  Loader2,
  ExternalLink,
  Calendar,
  Award,
  AlertCircle,
  Wallet,
  ArrowRight,
} from "lucide-react";

import { isAuthenticated, NFTAPI, NFTMintParamsResponse } from "@/api";

// EIP-712 domain and types for NFT minting
const EIP712_TYPES = {
  Mint: [
    { name: "to", type: "address" },
    { name: "uri", type: "string" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

// BSC Network configurations
const BSC_NETWORKS: Record<number, { chainId: string; chainName: string; rpcUrls: string[]; blockExplorerUrls: string[]; nativeCurrency: { name: string; symbol: string; decimals: number } }> = {
  56: {
    chainId: "0x38",
    chainName: "BNB Smart Chain",
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com"],
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  },
  97: {
    chainId: "0x61",
    chainName: "BNB Smart Chain Testnet",
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
    nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  },
};

type MintStatus = "idle" | "loading_params" | "signing" | "submitting" | "success" | "error";

export default function NFTMintPage() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [mintStatus, setMintStatus] = useState<MintStatus>("idle");
  const [mintParams, setMintParams] = useState<NFTMintParamsResponse | null>(null);
  const [txHash, setTxHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Check wallet connection status
  useEffect(() => {
    const checkAuth = () => {
      const savedAddress = localStorage.getItem("wallet_address");
      const hasAuth = isAuthenticated();

      if (savedAddress && hasAuth) {
        setWalletAddress(savedAddress);
        setIsWalletConnected(true);
      } else {
        setIsWalletConnected(false);
        setWalletAddress("");
      }
    };

    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener("authStateChanged", handleAuthChange);
    window.addEventListener("storage", (e) => {
      if (e.key === "auth_token" || e.key === "wallet_address") {
        handleAuthChange();
      }
    });

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);

  // Get wallet provider
  const getProvider = useCallback(() => {
    const walletType = localStorage.getItem("wallet_type");
    if (walletType === "binance" && window.binancew3w?.ethereum) {
      return window.binancew3w.ethereum;
    }
    return window.ethereum;
  }, []);

  // Switch to the required network
  const switchNetwork = async (provider: any, targetChainId: number): Promise<boolean> => {
    const networkConfig = BSC_NETWORKS[targetChainId];
    if (!networkConfig) {
      throw new Error(`Unsupported chain ID: ${targetChainId}`);
    }

    try {
      // Get current chain ID
      const currentChainId = await provider.request({ method: "eth_chainId" });
      const currentChainIdNum = parseInt(currentChainId, 16);

      // Already on the correct network
      if (currentChainIdNum === targetChainId) {
        return true;
      }

      // Try to switch network
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: networkConfig.chainId }],
        });
        return true;
      } catch (switchError: any) {
        // Error code 4902: chain not added to wallet
        if (switchError.code === 4902) {
          // Add the network
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: networkConfig.chainId,
              chainName: networkConfig.chainName,
              rpcUrls: networkConfig.rpcUrls,
              blockExplorerUrls: networkConfig.blockExplorerUrls,
              nativeCurrency: networkConfig.nativeCurrency,
            }],
          });
          return true;
        }
        throw switchError;
      }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("User rejected network switch");
      }
      throw error;
    }
  };

  // Handle NFT mint
  const handleMint = async () => {
    if (!isWalletConnected) {
      toast({
        title: t("wallet.not_connected"),
        description: t("wallet.connect_first"),
        variant: "destructive",
      });
      return;
    }

    try {
      // Step 1: Get mint parameters
      setMintStatus("loading_params");
      setErrorMessage("");

      const params = await NFTAPI.getMintParams();
      setMintParams(params);

      // Step 2: Switch to correct network and sign EIP-712 message
      setMintStatus("signing");

      const provider = getProvider();
      if (!provider) {
        throw new Error("Wallet provider not found");
      }

      // Switch to the required BSC network before signing
      await switchNetwork(provider, params.chain_id);

      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      // Build EIP-712 domain
      const domain = {
        name: params.eip712_name,
        version: params.eip712_version,
        chainId: params.chain_id,
        verifyingContract: params.verifying_contract,
      };

      // Build message
      const message = {
        to: params.to,
        uri: params.uri,
        nonce: params.nonce,
        deadline: params.deadline,
      };

      // Sign typed data (EIP-712)
      const signature = await signer.signTypedData(domain, EIP712_TYPES, message);

      // Step 3: Submit mint request
      setMintStatus("submitting");

      const result = await NFTAPI.submitMint(signature, params.nonce, params.deadline);
      setTxHash(result.tx_hash);
      setMintStatus("success");

      toast({
        title: t("nft.toast.success"),
        description: t("nft.toast.success_desc"),
      });
    } catch (error: any) {
      console.error("Mint error:", error);
      setMintStatus("error");

      let errorMsg = error.message || "Failed to mint NFT";

      // Handle specific error messages
      if (errorMsg.includes("sign in") || errorMsg.includes("10")) {
        errorMsg = t("nft.error.signin_days");
      } else if (errorMsg.includes("rejected") || errorMsg.includes("denied")) {
        errorMsg = t("nft.error.rejected");
      } else if (errorMsg.includes("network switch")) {
        errorMsg = t("nft.error.network");
      } else if (errorMsg.includes("already")) {
        errorMsg = t("nft.error.already_minted");
      }

      setErrorMessage(errorMsg);

      toast({
        title: t("nft.toast.failed"),
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  // Reset state
  const handleReset = () => {
    setMintStatus("idle");
    setMintParams(null);
    setTxHash("");
    setErrorMessage("");
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get explorer URL for transaction
  const getExplorerUrl = (hash: string) => {
    const chainId = mintParams?.chain_id;
    if (chainId === 97) {
      return `https://testnet.bscscan.com/tx/${hash}`;
    } else if (chainId === 56) {
      return `https://bscscan.com/tx/${hash}`;
    }
    return `https://bscscan.com/tx/${hash}`;
  };

  // Render status icon
  const renderStatusIcon = () => {
    switch (mintStatus) {
      case "loading_params":
      case "signing":
      case "submitting":
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "error":
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Sparkles className="h-8 w-8 text-primary" />;
    }
  };

  // Render status message
  const renderStatusMessage = () => {
    switch (mintStatus) {
      case "loading_params":
        return t("nft.status.loading_params");
      case "signing":
        return t("nft.status.signing");
      case "submitting":
        return t("nft.status.submitting");
      case "success":
        return t("nft.status.success");
      case "error":
        return errorMessage || t("common.error");
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Page Header */}
          <div className="text-center mb-10">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Award className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">{t("nft.title")}</h1>
            <p className="text-muted-foreground">
              {t("nft.subtitle")}
            </p>
          </div>

          {!isWalletConnected ? (
            // Wallet Not Connected
            <Card className="border border-border/50 text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>{t("nft.connect_wallet")}</CardTitle>
                <CardDescription>
                  {t("nft.connect_wallet_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <p className="text-sm text-muted-foreground mb-4">
                  {t("nft.connect_hint")}
                </p>
              </CardContent>
            </Card>
          ) : mintStatus === "success" ? (
            // Success State
            <Card className="border border-green-500/30 bg-green-500/5">
              <CardHeader className="text-center pb-4">
                <motion.div
                  className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </motion.div>
                <CardTitle className="text-green-500">{t("nft.success")}</CardTitle>
                <CardDescription>
                  {t("nft.success_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {txHash && (
                  <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">{t("nft.tx_hash")}</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono flex-1 truncate">
                        {txHash}
                      </code>
                      <a
                        href={getExplorerUrl(txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleReset}
                  >
                    {t("nft.done")}
                  </Button>
                  <a
                    href={getExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full">
                      {t("nft.view_explorer")}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Main Mint Card
            <Card className="border border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("nft.card_title")}</CardTitle>
                    <CardDescription>{t("nft.card_desc")}</CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {t("nft.limited")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Requirements */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {t("nft.requirements")}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {t("nft.requirement_wallet")}
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      {t("nft.requirement_signin")}
                    </li>
                  </ul>
                </div>

                {/* Connected Wallet */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("nft.connected_wallet")}</p>
                        <code className="text-sm font-mono">{formatAddress(walletAddress)}</code>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      {t("profile.connected")}
                    </Badge>
                  </div>
                </div>

                {/* Status Message */}
                {mintStatus !== "idle" && mintStatus !== "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-center gap-3 ${
                      mintStatus === "error"
                        ? "bg-red-500/10 border border-red-500/30"
                        : "bg-primary/10 border border-primary/30"
                    }`}
                  >
                    {renderStatusIcon()}
                    <p className={mintStatus === "error" ? "text-red-500" : "text-primary"}>
                      {renderStatusMessage()}
                    </p>
                  </motion.div>
                )}

                {/* Mint Button */}
                <Button
                  className="w-full h-12 text-lg"
                  onClick={mintStatus === "error" ? handleReset : handleMint}
                  disabled={
                    mintStatus === "loading_params" ||
                    mintStatus === "signing" ||
                    mintStatus === "submitting"
                  }
                >
                  {mintStatus === "idle" && (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      {t("nft.mint")}
                    </>
                  )}
                  {(mintStatus === "loading_params" ||
                    mintStatus === "signing" ||
                    mintStatus === "submitting") && (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {t("nft.minting")}
                    </>
                  )}
                  {mintStatus === "error" && (
                    <>
                      <ArrowRight className="h-5 w-5 mr-2" />
                      {t("nft.try_again")}
                    </>
                  )}
                </Button>

                {/* Info Text */}
                <p className="text-xs text-center text-muted-foreground">
                  {t("nft.gas_free")}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link
              href="/profile"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; {t("nft.back_profile")}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
