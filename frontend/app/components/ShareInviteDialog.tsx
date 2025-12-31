"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Gift, 
  Copy, 
  CheckCircle, 
  Users, 
  Link,
  TrendingUp,
  Zap
} from "lucide-react";

interface ShareInviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
}

export default function ShareInviteDialog({
  isOpen,
  onClose,
  inviteCode,
}: ShareInviteDialogProps) {
  const { toast } = useToast();
  const inviteLink = `http://digaming.xyz/?invite=${inviteCode}`;

  // Copy invite code
  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard",
      duration: 2000,
    });
  };

  // Copy invite link
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied!",
      description: "Invite link copied to clipboard",
      duration: 2000,
    });
  };

  // Native share
  const handleNativeShare = async () => {
    const shareText = `Join DIG Machine and start earning! Use my invite code: ${inviteCode}\n\n${inviteLink}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join DIG Machine",
          text: shareText,
          url: inviteLink,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to copying the link
      copyInviteLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Share Your Invite Code
          </DialogTitle>
          <DialogDescription>
            Invite friends to join DIG Machine and earn rewards together
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits Section */}
          <Alert className="border-primary/20 bg-primary/5">
            <TrendingUp className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Invitation Benefits:</p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <Zap className="h-3 w-3 mt-0.5 text-yellow-500" />
                    <span>You earn <strong>USDT</strong> for each successful invite</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-3 w-3 mt-0.5 text-blue-500" />
                    <span>Your friends get priority access to DIG Machine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-0.5 text-green-500" />
                    <span>Unlimited invitations - invite as many as you want!</span>
                  </li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Invite Code Section */}
          <div className="space-y-3">
            <div className="bg-secondary/30 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Invite Code</Label>
                <Badge variant="outline" className="text-xs">8 Characters</Badge>
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-2xl font-mono font-bold tracking-wider text-center py-2 bg-background rounded">
                  {inviteCode}
                </code>
                <Button
                  onClick={copyInviteCode}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Invite Link Section */}
            <div className="bg-secondary/30 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Invite Link</Label>
                <Link className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-sm font-mono bg-background rounded px-3 py-2.5 truncate">
                  {inviteLink}
                </div>
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Share Instructions */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>How to Successfully Invite:</strong> When the invited user participates in the machine purchase, it is regarded as a successful invitation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleNativeShare}
              className="flex-1"
              variant="default"
            >
              <Gift className="mr-2 h-4 w-4" />
              Share Now
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add missing Label import to the component
import { Label } from "@/components/ui/label";