import React from 'react';

const NotebookSimulation: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="notebook-simulation my-4">
      <div className="notebook-lines">
        <div className="notebook-content">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
};

export default NotebookSimulation;