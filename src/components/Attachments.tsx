import { SectionCard } from "./SectionCard";
import { Paperclip, Upload, FileText, Image, File, Trash2 } from "lucide-react";
import { useState, useRef } from "react"; // fixed: added useRef
import { Button } from "@/components/ui/button";

interface Attachment {
  id: string;
  name: string;
  type: "document" | "image" | "other";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

const initialAttachments: Attachment[] = [
  {
    id: "1",
    name: "Q1_Business_Review.pdf",
    type: "document",
    size: "2.4 MB",
    uploadedBy: "Sarah Johnson",
    uploadedAt: "Jan 10, 2025",
  },
  {
    id: "2",
    name: "Architecture_Diagram.png",
    type: "image",
    size: "1.1 MB",
    uploadedBy: "Michael Torres",
    uploadedAt: "Jan 8, 2025",
  },
  {
    id: "3",
    name: "SOW_Amendment_v2.docx",
    type: "document",
    size: "340 KB",
    uploadedBy: "Amanda Foster",
    uploadedAt: "Dec 20, 2024",
  },
];

const getFileIcon = (type: Attachment["type"]) => {
  switch (type) {
    case "document":
      return <FileText className="w-5 h-5 text-primary" />;
    case "image":
      return <Image className="w-5 h-5 text-accent" />;
    default:
      return <File className="w-5 h-5 text-muted-foreground" />;
  }
};

// Fixed: helper to determine file type from extension
const getFileType = (filename: string): Attachment["type"] => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["pdf", "doc", "docx", "xlsx", "txt"].includes(ext ?? "")) return "document";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext ?? "")) return "image";
  return "other";
};

// Fixed: helper to format bytes into readable size string
const formatFileSize = (bytes: number): string => {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${bytes} B`;
};

export const Attachments = () => {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  // Fixed: ref to trigger hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemove = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Fixed: handle files selected via the file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const newAttachments: Attachment[] = files.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      type: getFileType(file.name),
      size: formatFileSize(file.size),
      uploadedBy: "You",
      uploadedAt: today,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset input so the same file can be re-uploaded if needed
    e.target.value = "";
  };

  return (
    <SectionCard
      title="Attachments"
      badge={
        <span className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
          <Paperclip className="w-3 h-3" />
          {attachments.length} files
        </span>
      }
    >
      {/* Fixed: hidden file input wired to upload area */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload area - fixed: now triggers file picker on click */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 text-center mb-4 hover:border-primary/40 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          Drag & drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, DOCX, XLSX, PNG, JPG up to 20MB
        </p>
      </div>

      {/* File list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-md bg-background flex items-center justify-center border border-border">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.size} • Uploaded by {file.uploadedBy} • {file.uploadedAt}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(file.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};
