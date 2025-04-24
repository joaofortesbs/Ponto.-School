
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({node, ...props}) => <p className="my-1" {...props} />,
        h1: ({node, ...props}) => <h1 className="my-2 text-lg font-bold" {...props} />,
        h2: ({node, ...props}) => <h2 className="my-2 text-md font-bold" {...props} />,
        h3: ({node, ...props}) => <h3 className="my-2 text-sm font-bold" {...props} />,
        ul: ({node, ...props}) => <ul className="my-1 ml-4 list-disc" {...props} />,
        ol: ({node, ...props}) => <ol className="my-1 ml-4 list-decimal" {...props} />,
        li: ({node, ...props}) => <li className="my-0.5" {...props} />,
        code: ({node, inline, ...props}) => 
          inline 
            ? <code className="bg-gray-700/50 px-1 py-0.5 rounded text-sm" {...props} />
            : <code className="block bg-gray-800/50 p-2 rounded text-sm my-2 overflow-x-auto" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 pl-4 italic text-gray-600 dark:text-gray-400" {...props} />
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
