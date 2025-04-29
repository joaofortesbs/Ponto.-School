
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FormattedMessageProps {
  content: string;
  isAI?: boolean;
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, isAI = false }) => {
  return (
    <div className={`
      rounded-lg p-4 max-w-[90%] 
      ${isAI ? 'bg-gradient-to-br from-[#0c2341]/40 to-[#0f3562]/40' : 'bg-gradient-to-br from-[#0D23A0] to-[#5B21BD]'}
      border border-white/10 backdrop-blur-sm
    `}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#122C4B]/50" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-white/10 p-2 text-left" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-white/10 p-2" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="bg-[#122C4B]/30 rounded px-1" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-[#5B21BD] pl-4 my-4 italic" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="text-[#5B21BD]" {...props} />
          )
        }}
        className="text-white prose prose-invert prose-sm max-w-none
          prose-headings:text-white prose-p:text-gray-100
          prose-strong:text-[#5B21BD] prose-em:text-blue-300
          prose-code:text-blue-300 prose-pre:bg-[#122C4B]/30
          prose-blockquote:text-gray-300"
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedMessage;
