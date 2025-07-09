import React from 'react';
import CustomVocabularyListManager from './components/CustomVocabularyListManager';

const CustomVocabularyPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Daftar Kosakata Kustom</h1>
      <p className="text-lg mb-6">Kelola daftar kosakata Anda sendiri atau impor dari sumber lain.</p>
      <CustomVocabularyListManager />
    </div>
  );
};

export default CustomVocabularyPage;
