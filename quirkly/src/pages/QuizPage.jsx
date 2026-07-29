import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { useQuirkly } from '../context/QuirklyContext.jsx';

export function QuizPage() {
  const navigate = useNavigate();
  const { profile, retakeQuiz } = useQuirkly();

  if (!profile) return <Navigate to="/" replace />;
  if (!profile.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  return (
    <div className="page page--narrow">
      <h1>Productivity style quiz</h1>
      <p className="muted">
        Revisit the short questionnaire to refresh gentle nudges, layout density, and starter-step sizing. This is not a
        clinical assessment.
      </p>
      <Card className="stack-lg" style={{ marginTop: '1rem' }}>
        <p className="muted" style={{ margin: 0 }}>
          Your current profile: <strong style={{ color: 'var(--text)' }}>{profile.derivedProfileType}</strong>
        </p>
        <Button
          type="button"
          onClick={() => {
            retakeQuiz();
            navigate('/onboarding', { replace: true });
          }}
        >
          Retake quiz
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/settings')}>
          Open settings
        </Button>
      </Card>
    </div>
  );
}
