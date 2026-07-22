"use client";

import { FormEvent, useState } from "react";
import { gradeQuizAnswer, startQuiz } from "@/lib/api";
import type { SourceChunk } from "@/lib/types";

type PublicQuestion = { index: number; prompt: string; hint?: string | null };

type GradeResult = {
  correct: boolean;
  score: number;
  feedback: string;
  expected: string;
};

export default function QuizPanel({
  materialId,
  onSources,
  disabled,
}: {
  materialId: number;
  onSources: (sources: SourceChunk[]) => void;
  disabled?: boolean;
}) {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [scoreboard, setScoreboard] = useState<{ correct: number; total: number }>({
    correct: 0,
    total: 0,
  });

  async function begin() {
    setBusy(true);
    setError("");
    setResult(null);
    setAnswer("");
    setIndex(0);
    setScoreboard({ correct: 0, total: 0 });
    try {
      const data = await startQuiz(materialId);
      setSessionId(data.session_id);
      setQuestions(data.questions);
      onSources(data.sources);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start quiz");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (sessionId == null || result) return;
    setBusy(true);
    setError("");
    try {
      const graded = await gradeQuizAnswer({
        session_id: sessionId,
        index,
        answer,
      });
      setResult(graded);
      setScoreboard((s) => ({
        correct: s.correct + (graded.correct ? 1 : 0),
        total: s.total + 1,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Grading failed");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    setResult(null);
    setAnswer("");
    setIndex((i) => i + 1);
  }

  const current = questions[index];
  const finished = questions.length > 0 && index >= questions.length;

  return (
    <div className="output-box" style={{ marginTop: "1.5rem" }}>
      <h2>Quiz</h2>
      <p className="muted" style={{ margin: "0 0 1rem", fontSize: "0.9rem" }}>
        Short answers — submit each response to get graded.
      </p>

      {!sessionId && (
        <button className="btn btn-primary" type="button" disabled={disabled || busy} onClick={begin}>
          {busy ? "Preparing…" : "Start quiz"}
        </button>
      )}

      {error && <p className="error">{error}</p>}

      {sessionId && current && !finished && (
        <form onSubmit={onSubmit}>
          <p className="muted" style={{ fontSize: "0.82rem", marginBottom: "0.5rem" }}>
            Question {index + 1} of {questions.length}
          </p>
          <p style={{ lineHeight: 1.55, whiteSpace: "pre-wrap", margin: "0 0 1rem" }}>
            {current.prompt}
          </p>
          {current.hint && !result && (
            <p className="muted" style={{ fontSize: "0.85rem", marginTop: "-0.5rem" }}>
              Hint: {current.hint}
            </p>
          )}
          <div className="field">
            <label htmlFor="answer">Your answer</label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={!!result || busy}
              placeholder="Type your answer…"
            />
          </div>

          {!result ? (
            <button className="btn btn-primary" type="submit" disabled={busy || !answer.trim()}>
              {busy ? "Grading…" : "Submit answer"}
            </button>
          ) : (
            <div style={{ marginTop: "0.75rem" }}>
              <p style={{ color: result.correct ? "var(--accent)" : "var(--danger)", fontWeight: 600 }}>
                {result.correct ? "Correct" : "Not quite"} · {result.score}/100
              </p>
              <p style={{ lineHeight: 1.5 }}>{result.feedback}</p>
              {!result.correct && (
                <p className="muted" style={{ marginTop: "0.5rem" }}>
                  Expected: {result.expected}
                </p>
              )}
              <button
                className="btn btn-primary"
                type="button"
                style={{ marginTop: "0.85rem" }}
                onClick={next}
              >
                {index + 1 < questions.length ? "Next question" : "See results"}
              </button>
            </div>
          )}
        </form>
      )}

      {finished && (
        <div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: "0 0 0.5rem" }}>
            Score: {scoreboard.correct}/{scoreboard.total}
          </p>
          <p className="muted">Quiz complete.</p>
          <button className="btn btn-ghost" type="button" style={{ marginTop: "0.85rem" }} onClick={begin}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}