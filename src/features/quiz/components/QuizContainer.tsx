import React from 'react';

interface QuizContainerProps {
  children: React.ReactNode;
  className?: string; // Tambahkan properti className
}

const QuizContainer: React.FC<QuizContainerProps> = ({ children, className }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {children}
    </div>
  );
};

export default QuizContainer;