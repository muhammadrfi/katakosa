import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { PracticeProjectsProvider } from './features/practice-projects/usePracticeProjects';

createRoot(document.getElementById("root")!).render(
  
    <PracticeProjectsProvider>
      <App />
    </PracticeProjectsProvider>
  
);
