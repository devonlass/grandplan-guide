import { useRef } from "react";
import { SectionCard } from "./SectionCard";
import { Paperclip, Upload, FileText, Image, File, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAttachments,
  useCreateAttachment,
  useDeleteAttachment,
  openHubSpotFile,
  fileTypeFromName,
  formatFileSize,
  type Attachment,
} from "@/hooks/useAttachments";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getFileIcon = (type: string | null) => {
  switch (type) {
    case "document": return <FileText className="w-5 h-5 text-primary" />;
    case "image":    return <Image    className="w-5 h-5 text-accent"   />;
    default:         return <File     className="w-5 h-5 text-muted-foreground" />;
  }
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ─── Component ────────────────────────────────────────────────────────────────

interface AttachmentsProps {
  planId: string;
}

export const Attachments = ({ planId }: AttachmentsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: attachments = [], isLoading } = useAttachments(planId);
  const { mutate: createAttachment } = useCreateAttachment();
  const { mutate: deleteAttachment } = useDeleteAttachment();

  // Handle local file selection — stores metadata in DB (no binary upload to Supabase)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      createAttachment({
        plan_id:   planId,
        name:      file.name,
        url:       null,      // no storage backend wired yet — file name only
        file_type: fileTypeFromName(file.name),
        file_size: file.size,
        source:    "manual",
      });
    }
    e.target.value = "";
  };

  const handleOpen = async (attachment: Attachment) => {
    if (attachment.source === "hubspot" || attachment.hubspot_file_id) {
      await openHubSpotFile(attachment);
    } else if (attachment.url) {
      window.open(attachment.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <SectionCard
      title="Attachments"
      badge={
        <span className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
          <Paperclip className="w-3 h-3" />
          {isLoading ? "…" : `${attachments.length} files`}
        </span>
      }
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 text-center mb-4 hover:border-primary/40 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          Drag & drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, DOCX, XLSX, PNG, JPG up to 20 MB
        </p>
      </div>

      {/* File list */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-md bg-background flex items-center justify-center border border-border flex-shrink-0">
                {getFileIcon(file.file_type)}
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  {file.source === "hubspot" && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-orange-300 text-orange-600">
                      HubSpot
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {[
                    formatFileSize(file.file_size),
                    formatDate(file.uploaded_at),
                  ].filter(Boolean).join(" • ")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {(file.url || file.hubspot_file_id) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => handleOpen(file)}
                    title="Open file"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => deleteAttachment({ id: file.id, plan_id: planId })}
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};
