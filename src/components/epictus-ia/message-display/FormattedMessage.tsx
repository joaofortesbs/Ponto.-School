
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

interface FormattedMessageProps {
  content: string;
  isAI?: boolean;
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, isAI = false }) => {
  return (
    <div className={cn(
      "max-w-[80%] rounded-lg px-4 py-3 shadow-md transition-colors",
      isAI 
        ? "bg-gradient-to-br from-gray-100/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95 text-gray-800 dark:text-gray-200" 
        : "bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white ml-auto"
    )}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-200 dark:border-gray-700 p-2 text-left font-medium" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-200 dark:border-gray-700 p-2" {...props} />
          ),
          code: ({ node, inline, ...props }) => (
            inline 
              ? <code className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono text-orange-600 dark:text-orange-400" {...props} />
              : <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 my-2 overflow-x-auto">{props.children}</pre>
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-orange-500 dark:border-orange-400 pl-4 my-4 italic text-gray-700 dark:text-gray-300" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-[#FF6B00] dark:text-[#FF8C40] bg-gradient-to-r from-[#FF6B00]/10 to-[#FF8C40]/10 dark:from-[#FF6B00]/20 dark:to-[#FF8C40]/20 px-1 py-0.5 rounded-sm" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6 pb-2 border-b border-gray-200 dark:border-gray-700" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 mt-4" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-3 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="mb-1" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
          ),
          img: ({ node, ...props }) => (
            <img className="rounded-lg max-w-full my-4 border border-gray-200 dark:border-gray-700" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-gray-200 dark:border-gray-700" {...props} />
          )
        }}
        className="prose prose-sm dark:prose-invert max-w-none
          prose-headings:text-gray-900 dark:prose-headings:text-gray-100
          prose-p:text-gray-700 dark:prose-p:text-gray-300
          prose-strong:text-orange-600 dark:prose-strong:text-orange-400
          prose-em:text-blue-600 dark:prose-em:text-blue-400
          prose-code:text-orange-600 dark:prose-code:text-orange-400
          prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
          prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
          prose-a:text-blue-600 dark:prose-a:text-blue-400
          prose-img:rounded-lg
          prose-hr:border-gray-200 dark:prose-hr:border-gray-700"
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedMessage;
