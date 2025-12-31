"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ethers } from "ethers";
import { API_BASE_URL, isAuthenticated } from "@/api";
import { clearAuthData } from "@/api/utils";

// Extend Window interface for wallet providers
declare global {
  interface Window {
    binancew3w?: {
      ethereum?: any;
    };
    ethereum?: any;
  }
}

export type WalletType = "binance" | "browser" | null;
export type WalletId = "binance" | "browser";

export interface WalletState {
  isConnected: boolean;
  address: string;
  walletType: WalletType;
  isConnecting: boolean;
  isAuthenticated: boolean;
  chainId: string | null;
}

interface ConnectResult {
  success: boolean;
  needsRegistration?: boolean;
  address?: string;
  walletType?: WalletType;
}

interface WalletContextType {
  walletState: WalletState;
  connectWallet: (walletId: WalletId) => Promise<ConnectResult>;
  disconnectWallet: () => Promise<void>;
  signAndLogin: (address: string) => Promise<boolean>;
  formatAddress: (address: string, start?: number, end?: number) => string;
  refreshAuthState: () => void;
  isWalletInstalled: (walletId: WalletId) => boolean;
}

const defaultWalletState: WalletState = {
  isConnected: false,
  address: "",
  walletType: null,
  isConnecting: false,
  isAuthenticated: false,
  chainId: null,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Get Binance Web3 Wallet provider (dedicated Binance provider)
function getBinanceProvider(): any {
  if (typeof window !== "undefined" && window.binancew3w?.ethereum) {
    return window.binancew3w.ethereum;
  }
  return null;
}

// Check if a provider is a known browser wallet (not Binance)
function isKnownBrowserWallet(provider: any): boolean {
  if (!provider) return false;
  return !!(
    provider.isMetaMask ||
    provider.isOkxWallet ||
    provider.isOKExWallet ||
    provider.isPhantom ||
    provider.isTrust ||
    provider.isCoinbaseWallet ||
    provider.isRabby ||
    provider.isBraveWallet ||
    provider.isTokenPocket
  );
}

// Get Browser Wallet provider (any EIP-1193 compatible wallet at window.ethereum)
// This allows connection to MetaMask, OKX, Phantom, Trust Wallet, etc.
// When multiple wallets are installed, the browser/wallet will show a selection UI
function getBrowserWalletProvider(): any {
  if (typeof window === "undefined") return null;

  const ethereum = window.ethereum;
  if (!ethereum) return null;

  const binanceProvider = window.binancew3w?.ethereum;

  // If window.ethereum has multiple providers array
  if (ethereum.providers?.length > 0) {
    // Check if any non-Binance wallet exists
    const hasNonBinanceWallet = ethereum.providers.some((p: any) => {
      if (binanceProvider && p === binanceProvider) return false;
      if (p.isBinance) return false;
      return true;
    });
    if (hasNonBinanceWallet) {
      return ethereum; // Return the proxy, wallet selection will be handled by browser
    }
    return null;
  }

  // Single provider case
  // If it's the same as Binance provider and has no other wallet flags, return null
  if (binanceProvider && ethereum === binanceProvider) {
    if (!isKnownBrowserWallet(ethereum)) {
      return null; // Only Binance is installed
    }
  }

  // If it only has Binance flag and nothing else, return null
  if (ethereum.isBinance && !isKnownBrowserWallet(ethereum)) {
    return null;
  }

  return ethereum;
}

// Get provider for specific wallet type
function getProviderForWallet(walletId: WalletId): any {
  switch (walletId) {
    case "binance":
      return getBinanceProvider();
    case "browser":
      return getBrowserWalletProvider();
    default:
      return null;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>(defaultWalletState);

  // Check if a specific wallet is installed
  const isWalletInstalled = useCallback((walletId: WalletId): boolean => {
    return !!getProviderForWallet(walletId);
  }, []);

  // Format address for display
  const formatAddress = useCallback((address: string, start = 6, end = 4): string => {
    if (!address) return "";
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  }, []);

  // Refresh auth state from localStorage
  const refreshAuthState = useCallback(() => {
    const savedAddress = localStorage.getItem("wallet_address");
    const savedWalletType = localStorage.getItem("wallet_type") as WalletType;
    const savedChainId = localStorage.getItem("wallet_chain_id");
    const hasAuth = isAuthenticated();

    if (savedAddress && savedWalletType && hasAuth) {
      setWalletState({
        isConnected: true,
        address: savedAddress,
        walletType: savedWalletType,
        isConnecting: false,
        isAuthenticated: true,
        chainId: savedChainId,
      });
    } else {
      setWalletState({
        ...defaultWalletState,
        isAuthenticated: false,
      });
    }
  }, []);

  // Force disconnect (clear all state)
  const forceDisconnect = useCallback(async () => {
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("wallet_type");
    localStorage.removeItem("wallet_chain_id");
    clearAuthData();

    setWalletState({
      ...defaultWalletState,
      isAuthenticated: false,
    });

    // Dispatch event for other components
    window.dispatchEvent(new Event("authStateChanged"));
  }, []);

  // Handle account change from Binance wallet
  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    const savedAddress = localStorage.getItem("wallet_address");

    if (accounts.length === 0) {
      // Wallet disconnected
      console.log("Binance Wallet disconnected");
      await forceDisconnect();
    } else if (savedAddress && accounts[0].toLowerCase() !== savedAddress.toLowerCase()) {
      // Account switched - force logout
      console.log("Binance Wallet account changed:", accounts[0]);
      await forceDisconnect();
      // Dispatch event for UI to show reconnect dialog
      window.dispatchEvent(new CustomEvent("walletAccountChanged", {
        detail: { newAddress: accounts[0] }
      }));
    }
  }, [forceDisconnect]);

  // Handle chain change from Binance wallet
  const handleChainChanged = useCallback((chainId: string) => {
    console.log("Binance Wallet chain changed:", chainId);
    localStorage.setItem("wallet_chain_id", chainId);
    setWalletState(prev => ({ ...prev, chainId }));
  }, []);

  // Sign message and login to backend
  const signAndLogin = useCallback(async (address: string): Promise<boolean> => {
    if (!address) return false;

    // Get provider based on saved wallet type
    const savedWalletType = localStorage.getItem("wallet_type") as WalletId;
    const provider = savedWalletType ? getProviderForWallet(savedWalletType) : null;

    if (!provider) {
      throw new Error("Wallet provider not found");
    }

    try {
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = await signer.signMessage(timestamp);

      const resp = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature, ts: timestamp }),
      });

      const data = await resp.json();

      if (resp.ok && data.status === "success" && data.data?.access_token) {
        localStorage.setItem("auth_token", data.data.access_token);
        localStorage.setItem("wallet_address", address);
        return true;
      } else {
        if (data.message?.includes("User does not exist")) {
          throw new Error("User does not exist. Please sign up first.");
        }
        throw new Error(data.message || "Authentication failed");
      }
    } catch (error: any) {
      console.error("Sign error:", error);
      throw error;
    }
  }, []);

  // Connect to wallet
  const connectWallet = useCallback(async (walletId: WalletId): Promise<ConnectResult> => {
    setWalletState(prev => ({ ...prev, isConnecting: true }));

    const provider = getProviderForWallet(walletId);

    const walletNames: Record<WalletId, string> = {
      binance: "Binance Web3 Wallet",
      browser: "Browser Wallet",
    };

    if (!provider) {
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      throw new Error(`${walletNames[walletId]} not found. Please install the wallet extension.`);
    }

    try {
      // Request accounts from wallet
      const accounts = await provider.request({ method: "eth_requestAccounts" });

      if (!accounts || accounts.length === 0) {
        throw new Error(`No accounts found. Please unlock your ${walletNames[walletId]}.`);
      }

      const address = accounts[0];
      console.log(`${walletNames[walletId]} connected:`, address);

      // Get current chain ID
      const chainId = await provider.request({ method: "eth_chainId" });
      localStorage.setItem("wallet_chain_id", chainId);

      // Try to login
      try {
        // Store wallet type before signing
        localStorage.setItem("wallet_type", walletId);

        const loginSuccess = await signAndLogin(address);

        if (loginSuccess) {
          setWalletState({
            isConnected: true,
            address,
            walletType: walletId,
            isConnecting: false,
            isAuthenticated: true,
            chainId,
          });

          // Setup event listeners
          provider.removeListener?.("accountsChanged", handleAccountsChanged);
          provider.removeListener?.("chainChanged", handleChainChanged);
          provider.on?.("accountsChanged", handleAccountsChanged);
          provider.on?.("chainChanged", handleChainChanged);

          window.dispatchEvent(new Event("authStateChanged"));
          return { success: true };
        }
      } catch (loginError: any) {
        const errorMessage = loginError.message || "";
        const isUserNotRegistered =
          errorMessage.includes("User does not exist") ||
          errorMessage.includes("sign up first") ||
          errorMessage.includes("not exist") ||
          errorMessage.includes("not found");

        if (isUserNotRegistered) {
          setWalletState(prev => ({ ...prev, isConnecting: false }));
          return { success: false, needsRegistration: true, address, walletType: walletId };
        }
        throw loginError;
      }

      setWalletState(prev => ({ ...prev, isConnecting: false }));
      return { success: false };
    } catch (error: any) {
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      console.error(`${walletNames[walletId]} connection error:`, error);
      throw error;
    }
  }, [signAndLogin, handleAccountsChanged, handleChainChanged]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    const savedWalletType = localStorage.getItem("wallet_type") as WalletId;
    if (savedWalletType) {
      const provider = getProviderForWallet(savedWalletType);
      if (provider) {
        provider.removeListener?.("accountsChanged", handleAccountsChanged);
        provider.removeListener?.("chainChanged", handleChainChanged);
      }
    }
    await forceDisconnect();
  }, [handleAccountsChanged, handleChainChanged, forceDisconnect]);

  // Initialize on mount
  useEffect(() => {
    refreshAuthState();

    // Setup wallet event listeners if already connected
    const savedAddress = localStorage.getItem("wallet_address");
    const savedWalletType = localStorage.getItem("wallet_type") as WalletId;

    if (savedAddress && savedWalletType && isAuthenticated()) {
      const provider = getProviderForWallet(savedWalletType);
      if (provider) {
        provider.removeListener?.("accountsChanged", handleAccountsChanged);
        provider.removeListener?.("chainChanged", handleChainChanged);
        provider.on?.("accountsChanged", handleAccountsChanged);
        provider.on?.("chainChanged", handleChainChanged);
      }
    }

    // Listen for auth state changes from other components
    const handleAuthChange = () => refreshAuthState();
    window.addEventListener("authStateChanged", handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
      const currentWalletType = localStorage.getItem("wallet_type") as WalletId;
      if (currentWalletType) {
        const provider = getProviderForWallet(currentWalletType);
        if (provider) {
          provider.removeListener?.("accountsChanged", handleAccountsChanged);
          provider.removeListener?.("chainChanged", handleChainChanged);
        }
      }
    };
  }, [refreshAuthState, handleAccountsChanged, handleChainChanged]);

  const value: WalletContextType = {
    walletState,
    connectWallet,
    disconnectWallet,
    signAndLogin,
    formatAddress,
    refreshAuthState,
    isWalletInstalled,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook to use wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
