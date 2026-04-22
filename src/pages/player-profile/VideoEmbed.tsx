import { Link } from "lucide-react";

export function VideoEmbed({ url }: { url: string }) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return (
      <iframe
        title="Видео"
        src={`https://www.youtube.com/embed/${yt[1]}`}
        className="aspect-video w-full rounded-lg border border-border"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (/\.(mp4|webm|mov|ogg)(\?|$)/i.test(url)) {
    return <video src={url} controls className="aspect-video w-full rounded-lg bg-black" controlsList="nodownload" />;
  }
  return (
    <div className="flex aspect-video flex-col items-center justify-center rounded-lg bg-muted">
      <Link className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden />
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
        Открыть ссылку
      </a>
    </div>
  );
}

export function videoThumbFromUrl(url?: string): string {
  const m = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : "";
}
