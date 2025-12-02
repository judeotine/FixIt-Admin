"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, CheckCircle, XCircle, Download, Mail, Phone, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { WorkerRecord } from "@/lib/workers";

interface VerificationModalProps {
  worker: WorkerRecord;
}

export function VerificationModal({ worker }: VerificationModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"approved" | "rejected" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (status === "rejected" && !rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/verify-worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          workerId: worker.id,
          status: status!,
          rejectionReason: status === "rejected" ? rejectionReason : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify worker");
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl">
        <DialogHeader>
          <DialogTitle>Verify Worker: {worker.name}</DialogTitle>
          <DialogDescription>
            Review documents and approve or reject the verification request
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Worker Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{worker.name}</p>
                    <p className="text-muted-foreground capitalize">
                      {worker.service_category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{worker.email || "No email"}</p>
                    <p className="text-muted-foreground text-xs">Email</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{worker.phone || "No phone"}</p>
                    <p className="text-muted-foreground text-xs">Phone</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Uploaded Documents</h4>
              <div className="space-y-2">
                <DocumentLink
                  label="National ID"
                  description="Government issued identification"
                  href={worker.national_id_url}
                />
                <DocumentLink
                  label="Certification"
                  description="Professional certificates"
                  href={worker.certification_url}
                />
                <DocumentLink
                  label="Profile Photo"
                  description="Profile picture provided"
                  href={worker.avatar_url || undefined}
                />
              </div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Document Checklist</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="id" />
                <label htmlFor="id" className="text-sm">
                  National ID verified
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="photo" />
                <label htmlFor="photo" className="text-sm">
                  Photo matches ID
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="certificates" />
                <label htmlFor="certificates" className="text-sm">
                  Certificates validated (if applicable)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="address" />
                <label htmlFor="address" className="text-sm">
                  Address confirmed
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="phone" />
                <label htmlFor="phone" className="text-sm">
                  Phone number verified
                </label>
              </div>
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStatus("approved")}
              className={status === "approved" ? "bg-green-50" : ""}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => setStatus("rejected")}
              className={status === "rejected" ? "bg-red-50" : ""}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
          {status === "rejected" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !status || (status === "rejected" && !rejectionReason.trim())}
          >
            {loading ? "Processing..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DocumentLinkProps {
  label: string;
  description: string;
  href?: string | null;
}

function DocumentLink({ label, description, href }: DocumentLinkProps) {
  const isAvailable = Boolean(href);

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        asChild={isAvailable}
        disabled={!isAvailable}
      >
        {isAvailable ? (
          <a href={href!} target="_blank" rel="noreferrer">
            <Download className="mr-2 h-4 w-4" />
            View
          </a>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Missing
          </>
        )}
      </Button>
    </div>
  );
}

