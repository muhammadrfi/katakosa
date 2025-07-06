import React from 'react';

interface QuizContainerProps {
  children: React.ReactNode;
}

const QuizContainer: React.FC<QuizContainerProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-center">
      {children}
    </div>
  );
};

export default QuizContainer;