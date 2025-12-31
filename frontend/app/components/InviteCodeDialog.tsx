"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Gift, AlertCircle, CheckCircle, Users } from "lucide-react";

interface InviteCodeDialogProps {
  isOpen: boolean;
  onConfirm: (inviteCode: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

export default function InviteCodeDialog({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
  error = "",
}: InviteCodeDialogProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [validationError, setValidationError] = useState("");

  // ====== Validate invite code format ======
  const validateInviteCode = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 8) {
      setValidationError("Invite code must be 8 characters");
      return false;
    }
    if (!/^[A-Z0-9]+$/.test(cleanCode)) {
      setValidationError("Invite code can only contain uppercase letters and numbers");
      return false;
    }
    setValidationError("");
    return true;
  };

  // ====== Handle input change ======
  const handleInputChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setInviteCode(upperValue.slice(0, 8)); // Limit to 8 characters
    setValidationError("");
  };

  // ====== Handle confirm ======
  const handleConfirm = () => {
    if (validateInviteCode(inviteCode)) {
      onConfirm(inviteCode.trim().toUpperCase());
    }
  };

  // ====== Handle cancel ======
  const handleCancel = () => {
    setInviteCode("");
    setValidationError("");
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Invite Code Required
          </DialogTitle>
          <DialogDescription>
            You are the 101st or later user, an invite code is required to complete registration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invite code explanation */}
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Why is an invite code required?</strong>
                </p>
                <ul className="text-sm space-y-1">
                  <li>• First 100 users can register directly and enjoy 10% referral privileges</li>
                  <li>• Starting from the 101st user, an invite code is required for registration</li>
                  <li>• Invited by top 100 users can get double lottery chances</li>
                  <li>• Referral commission rate is 6% when invited by regular users</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Invite code input */}
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code *</Label>
            <div className="space-y-2">
              <Input
                id="inviteCode"
                placeholder="Please enter 8-character invite code (e.g., ABC12345)"
                value={inviteCode}
                onChange={(e) => handleInputChange(e.target.value)}
                maxLength={8}
                className="text-center text-lg font-mono tracking-wider"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Format: 8 uppercase letters and numbers</span>
                <Badge variant="outline">{inviteCode.length}/8</Badge>
              </div>
            </div>
          </div>

          {/* Error messages */}
          {(validationError || error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError || error}</AlertDescription>
            </Alert>
          )}

          {/* Invite code examples */}
          <div className="bg-secondary/20 p-3 rounded-lg">
            <p className="text-sm font-semibold mb-2">Invite Code Examples:</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="font-mono">
                XTH9WY25
              </Badge>
              <Badge variant="outline" className="font-mono">
                ABC12345
              </Badge>
              <Badge variant="outline" className="font-mono">
                DIG88888
              </Badge>
            </div>
          </div>

          {/* Help information */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Don't have an invite code?</strong>
              <br />
              Please contact registered friends or obtain through official channels
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !inviteCode || inviteCode.length !== 8}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Confirm Registration"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}