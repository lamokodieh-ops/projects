import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.jsx';
import { ThemeBinder } from './components/ThemeBinder.jsx';
import { QuirklyProvider } from './context/QuirklyContext.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { FocusMode } from './pages/FocusMode.jsx';
import { HabitForm } from './pages/HabitForm.jsx';
import { InsightsPage } from './pages/InsightsPage.jsx';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { OnboardingQuiz } from './pages/OnboardingQuiz.jsx';
import { QuizPage } from './pages/QuizPage.jsx';
import { QuizResults } from './pages/QuizResults.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { SignUp } from './pages/SignUp.jsx';

// Strip trailing slash — BrowserRouter basename must not end with /
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <QuirklyProvider>
      <BrowserRouter basename={basename}>
        <ThemeBinder />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/onboarding" element={<OnboardingQuiz />} />
          <Route path="/onboarding/results" element={<QuizResults />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/habit/new" element={<HabitForm key="new" />} />
            <Route path="/dashboard/habit/:id/edit" element={<HabitForm />} />
            <Route path="/focus" element={<FocusMode />} />
            <Route path="/focus/:habitId" element={<FocusMode />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QuirklyProvider>
  );
}
