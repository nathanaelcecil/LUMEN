import * as React from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, ListChecks } from "lucide-react";
import type { VideoWorkspace } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";

export function QuizTab({ workspace }: { workspace: VideoWorkspace }) {
  const questions = workspace.quiz;
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [submitted, setSubmitted] = React.useState(false);

  if (questions.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        accent="orange"
        title="No quiz yet"
        description="Lumen will generate questions that check understanding — not trivia about timestamps."
      />
    );
  }

  const score = questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0),
    0
  );
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  function select(qid: string, idx: number) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qid]: idx }));
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {questions.map((q, qi) => (
        <div key={q.id} className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-xs text-ink-faint">Question {qi + 1} of {questions.length}</p>
          <h3 className="mt-1.5 font-display text-base leading-snug">{q.question}</h3>

          <div className="mt-4 flex flex-col gap-2">
            {q.options.map((opt, oi) => {
              const isSelected = answers[q.id] === oi;
              const isCorrect = oi === q.correctIndex;
              const showState = submitted && (isSelected || isCorrect);

              return (
                <button
                  key={oi}
                  onClick={() => select(q.id, oi)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition-all",
                    !submitted && isSelected && "border-accent-orange bg-accent-orange/5",
                    !submitted && !isSelected && "border-line hover:border-line/80 hover:bg-canvas",
                    submitted && isCorrect && "border-accent-emerald bg-accent-emerald/10",
                    submitted && isSelected && !isCorrect && "border-destructive/50 bg-destructive/5"
                  )}
                >
                  <span>{opt}</span>
                  {showState && (
                    isCorrect ? (
                      <Check className="h-4 w-4 text-accent-emerald" />
                    ) : isSelected ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : null
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-5 py-4 shadow-sm">
        {submitted ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm"
          >
            You scored <span className="font-medium text-accent-orange">{score}</span> out of {questions.length}
          </motion.p>
        ) : (
          <p className="text-sm text-ink-muted">Answer every question to check your score.</p>
        )}

        {submitted ? (
          <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Retake
          </Button>
        ) : (
          <Button
            variant="marker"
            size="sm"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
          >
            Check answers
          </Button>
        )}
      </div>
    </div>
  );
}
