import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Code, Award } from 'lucide-react';
import { AnswerFeedback } from '../types/game';

interface QuestionFeedbackModalProps {
  feedback: AnswerFeedback | null;
  onNextQuestion: () => void;
}

export const QuestionFeedbackModal: React.FC<QuestionFeedbackModalProps> = ({
  feedback,
  onNextQuestion
}) => {
  if (!feedback) return null;

  const isCorrect = feedback.isCorrect;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl bg-dark-slate rounded-2xl border p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
        isCorrect ? 'border-emerald-green/50 ring-1 ring-emerald-green/30' : 'border-crimson-red/50 ring-1 ring-crimson-red/30'
      }`}>
        {/* Banner Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gunmetal">
          {isCorrect ? (
            <div className="w-12 h-12 rounded-full bg-emerald-green/20 text-emerald-green flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-crimson-red/20 text-crimson-red flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7 stroke-[2.5]" />
            </div>
          )}

          <div>
            <h3 className={`text-xl font-bold font-mono uppercase tracking-wide ${
              isCorrect ? 'text-emerald-green' : 'text-crimson-red'
            }`}>
              {isCorrect ? '✓ Correct Answer!' : '✕ Incorrect'}
            </h3>
            <p className="text-xs text-cool-gray">
              {isCorrect
                ? `Great job! You earned ${feedback.pointsEarned} points for this question.`
                : 'Review the correct code ordering below before proceeding.'}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1 font-mono">
          {/* Points summary badge */}
          {isCorrect && (
            <div className="flex items-center justify-between bg-emerald-green/10 border border-emerald-green/30 px-4 py-2.5 rounded-xl text-xs">
              <span className="text-snow-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-green" /> Points Awarded:
              </span>
              <span className="text-emerald-green font-bold text-base">+{feedback.pointsEarned} pts</span>
            </div>
          )}

          {/* Correct Code Order Display */}
          <div>
            <span className="text-xs text-cool-gray uppercase font-bold tracking-wider flex items-center gap-1.5 mb-2">
              <Code className="w-4 h-4 text-steel-blue" /> Correct Canonical Code Order:
            </span>
            <div className="rounded-xl border border-gunmetal bg-jet-black p-3 space-y-1.5 max-h-56 overflow-y-auto">
              {feedback.correctCodeOrder.map((line) => (
                <div key={line.position} className="flex items-center gap-3 p-2 rounded bg-charcoal-gray/60 text-xs">
                  <span className="w-6 h-6 rounded bg-steel-blue/20 text-steel-blue font-bold flex items-center justify-center text-[11px] shrink-0">
                    {line.position}
                  </span>
                  <span className="text-snow-white font-mono whitespace-pre flex-1">{line.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {feedback.explanation && (
            <div className="bg-graphite p-3.5 rounded-xl border border-gunmetal">
              <span className="text-amber text-xs font-bold flex items-center gap-1.5 mb-1">
                <Lightbulb className="w-4 h-4" /> Explanation:
              </span>
              <p className="text-xs text-cool-gray font-sans leading-relaxed">
                {feedback.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="pt-4 border-t border-gunmetal flex justify-end">
          <button
            onClick={onNextQuestion}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-green/50 cursor-pointer shadow-lg"
          >
            <span>{feedback.gameCompleted ? 'View Final Results' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
