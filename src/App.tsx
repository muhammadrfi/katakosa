
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { Suspense, lazy } from "react";
import Navbar from "./layout/Navbar";
import ErrorBoundary from "./error/ErrorBoundary";
import { Loading } from '@/components/ui/Loading';

// Lazy load all page components for better performance
const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage"));

const FlipbookPage = lazy(() => import("./features/flipbook/FlipbookPage"));
const TestPage = lazy(() => import("./features/quiz/TestPage"));

const NotFound = lazy(() => import("./features/error/NotFound"));
const ProjectDetailPage = lazy(() => import("./features/practice-projects/ProjectDetailPage"));
const ProjectVocabularyListPage = lazy(() => import("./features/vocabulary/ProjectVocabularyListPage"));
const PracticeModeLayout = lazy(() => import("./features/practice-projects/PracticeModeLayout"));
const ListeningPracticePage = lazy(() => import("./features/listening-practice/ListeningPracticePage").then(module => ({ default: module.default })));
const ProjectReviewPracticePage = lazy(() => import("./features/review-practice/ProjectReviewPracticePage"));

const ReviewPracticePage = lazy(() => import("./features/review-practice/ReviewPracticePage"));
const HomePage = lazy(() => import("./features/home/HomePage"));
const AllVocabularyPage = lazy(() => import("./features/vocabulary/AllVocabularyPage"));
const ProjectsPage = lazy(() => import("./features/practice-projects/ProjectsPage"));
const MatchingPracticePage = lazy(() => import("./features/matching-game/MatchingPracticePage"));
const MemorizationPracticePage = lazy(() => import("./features/memorization-practice/MemorizationPracticePage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider storageKey="katalatih-theme">
      <TooltipProvider>
        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <ErrorBoundary>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<Loading fullScreen text="Memuat halaman..." />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/kosakata" element={<AllVocabularyPage />} />
                    <Route path="/latihan" element={<ProjectsPage />} />
                    
                    {/* Project-based Routes */}
                    <Route path="/latihan/:projectId" element={<ProjectDetailPage />} />
                    <Route path="/latihan/:projectId/kosakata" element={<ProjectVocabularyListPage />} />

                    {/* Practice mode routes wrapped with a layout */}
                    <Route path="/practice/:projectId" element={<PracticeModeLayout />}>
                      <Route index element={<Navigate to="quiz" replace />} />
                      <Route path="listening" element={<ListeningPracticePage />} />
                      <Route path="matching" element={<MatchingPracticePage />} />
                      <Route path="memorization" element={<MemorizationPracticePage />} />
                      <Route path="review" element={<ProjectReviewPracticePage />} />
                      <Route path="quiz" element={<TestPage />} />
                      <Route path="flipbook" element={<FlipbookPage />} />
                      
                    </Route>
            <Route path="/latihan/ulasan" element={<ReviewPracticePage />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
