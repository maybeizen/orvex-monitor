import { useRef, useState } from "react";
import { ImagePlus, Mail } from "lucide-react";

import { UserAvatarType, type AccountSettings, type UserStatus } from "@orvex/types";
import { Button, cn, Input, useToast } from "@orvex/ui";

import { getAvatarSrc } from "@/lib/auth";
import { StatusAvatar } from "./StatusAvatar";
import { createAvatarUploadUrl } from "@/lib/account-api";

interface AvatarEditorProps {
  account: AccountSettings;
  /** Live status for presence ring preview (e.g. unsaved picker value). */
  status?: UserStatus;
  onSave: (patch: {
    avatarType: UserAvatarType;
    avatarUrl?: string | null;
    gravatarEmail?: string | null;
  }) => Promise<void>;
  saving?: boolean;
}

type AvatarMode = "upload" | "gravatar";

export function AvatarEditor({
  account,
  status: statusOverride,
  onSave,
  saving = false,
}: AvatarEditorProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<AvatarMode>(
    account.avatarType === UserAvatarType.Upload ? "upload" : "gravatar",
  );
  const [gravatarEmail, setGravatarEmail] = useState(
    account.gravatarEmail ?? account.email,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    account.avatarType === UserAvatarType.Upload ? (account.avatarUrl ?? null) : null,
  );
  const [uploading, setUploading] = useState(false);

  const previewUser: typeof account = {
    ...account,
    avatarType: mode === "gravatar" ? UserAvatarType.Gravatar : UserAvatarType.Upload,
  };
  if (mode === "upload" && previewUrl) previewUser.avatarUrl = previewUrl;
  if (mode === "gravatar") previewUser.gravatarEmail = gravatarEmail;

  async function handleFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const extension = ext === "jpeg" ? "jpg" : ext;
    const contentType = file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(contentType)) {
      toast({ variant: "error", title: "Use JPEG, PNG, WebP, or GIF" });
      return;
    }

    setUploading(true);
    try {
      const { data } = await createAvatarUploadUrl(contentType, extension as "jpg" | "png" | "webp" | "gif");
      const uploadRes = await fetch(data.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      setPreviewUrl(data.publicUrl);
      await onSave({
        avatarType: UserAvatarType.Upload,
        avatarUrl: data.publicUrl,
        gravatarEmail: null,
      });
      toast({ variant: "success", title: "Avatar updated" });
    } catch {
      toast({ variant: "error", title: "Failed to upload avatar" });
    } finally {
      setUploading(false);
    }
  }

  async function saveGravatar() {
    await onSave({
      avatarType: UserAvatarType.Gravatar,
      avatarUrl: null,
      gravatarEmail: gravatarEmail.trim() || account.email,
    });
    toast({ variant: "success", title: "Gravatar updated" });
  }

  return (
    <div className="rounded-xl border border-white/8 bg-slate-900/40 p-6">
      <h2 className="text-sm font-medium text-slate-200">Profile picture</h2>
      <p className="mt-1 text-xs text-slate-500">Upload an image or use Gravatar</p>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        <StatusAvatar
          src={getAvatarSrc(previewUser)}
          name={`${account.firstName} ${account.lastName}`}
          status={statusOverride ?? account.status}
          size="xl"
        />

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex gap-2">
            {(["upload", "gravatar"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => { setMode(tab); }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  mode === tab
                    ? "bg-brand-500/15 text-brand-300"
                    : "text-slate-500 hover:bg-white/4 hover:text-slate-300",
                )}
              >
                {tab === "upload" ? <ImagePlus size={14} /> : <Mail size={14} />}
                {tab === "upload" ? "Upload" : "Gravatar"}
              </button>
            ))}
          </div>

          {mode === "upload" ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <Button
                variant="secondary"
                loading={uploading || saving}
                onClick={() => fileRef.current?.click()}
              >
                Choose image
              </Button>
              <p className="mt-2 text-xs text-slate-600">Max 2 MB. JPG, PNG, WebP, or GIF.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                label="Gravatar email"
                value={gravatarEmail}
                onChange={(e) => { setGravatarEmail(e.target.value); }}
                hint="Uses this email for your Gravatar hash"
              />
              <Button
                variant="secondary"
                loading={saving}
                onClick={() => void saveGravatar()}
              >
                Save Gravatar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
