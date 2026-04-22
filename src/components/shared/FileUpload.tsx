import * as React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  preview?: string | null;
  label?: string;
  className?: string;
}

export function FileUpload({
  accept = "image/*,video/mp4,video/quicktime",
  maxSizeMB = 500,
  onFileSelect,
  onClear,
  preview,
  label = "Перетащите файл или нажмите для загрузки",
  className,
}: FileUploadProps) {
  const [dragOver, setDragOver] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Файл слишком большой (макс. ${maxSizeMB} МБ)`);
      return;
    }
    onFileSelect(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  if (preview) {
    const isVideo = preview.startsWith("blob:") ? false : /\.(mp4|mov|webm)/i.test(preview);
    return (
      <div className={cn("relative rounded-lg border border-border overflow-hidden", className)}>
        {isVideo ? (
          <video src={preview} controls className="w-full max-h-48 object-contain bg-black" />
        ) : (
          <img src={preview} alt="Preview" className="w-full max-h-48 object-contain bg-black" />
        )}
        {onClear && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80"
            onClick={onClear}
            aria-label="Удалить файл"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground/60">Макс. {maxSizeMB} МБ</p>
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} className="hidden" />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
