import { useMemo } from "react";
import { marked } from "marked";
import { cn } from "@/lib/utils";

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export function MarkdownView({ content, className }: MarkdownViewProps) {
  const html = useMemo(() => {
    return marked.parse(content || "", {
      gfm: true,
      breaks: true,
    }) as string;
  }, [content]);

  return (
    <div
      className={cn(
        "max-w-none leading-relaxed [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_code]:rounded [&_code]:bg-muted/70 [&_code]:px-1 [&_code]:py-0.5 bg-secondary p-8 rounded-md",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
