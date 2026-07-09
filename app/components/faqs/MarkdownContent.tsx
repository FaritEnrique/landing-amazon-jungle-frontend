import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const MarkdownContent = ({ content, className = "" }: MarkdownContentProps) => {
  return (
    <div className={`space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h2: ({ ...props }) => (
            <h2
              className="pt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="pt-2 text-lg font-black tracking-tight text-emerald-900 dark:text-emerald-100"
              {...props}
            />
          ),
          h4: ({ ...props }) => (
            <h4
              className="pt-1 text-base font-black text-slate-900 dark:text-white"
              {...props}
            />
          ),
          p: ({ ...props }) => <p className="leading-7" {...props} />,
          ul: ({ ...props }) => (
            <ul className="ml-5 list-disc space-y-2 marker:text-emerald-700" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="ml-5 list-decimal space-y-2 marker:font-black marker:text-emerald-700" {...props} />
          ),
          li: ({ ...props }) => <li className="pl-1 leading-7" {...props} />,
          strong: ({ ...props }) => (
            <strong className="font-black text-slate-900 dark:text-white" {...props} />
          ),
          a: ({ ...props }) => (
            <a
              className="font-black text-emerald-800 underline decoration-emerald-700/30 underline-offset-4 transition hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-100"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="rounded-2xl border-l-4 border-emerald-700 bg-emerald-50 px-4 py-3 font-semibold text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-50"
              {...props}
            />
          ),
          code: ({ ...props }) => (
            <code
              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.92em] font-bold text-slate-900 dark:bg-slate-800 dark:text-slate-100"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              className="bg-slate-50 px-4 py-3 font-black text-slate-900 dark:bg-slate-900 dark:text-white"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td className="px-4 py-3 align-top text-slate-600 dark:text-slate-300" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;
