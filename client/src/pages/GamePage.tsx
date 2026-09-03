import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Code2,
  Cpu,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  Code,
  Award
} from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { CodeEditor } from '../components/CodeEditor';
import { SimulationPanel } from '../components/SimulationPanel';
import { useGame } from '../context/GameContext';
import { gameApi } from '../services/gameApi';
import { SimulationResult, AnswerFeedback } from '../types/game';

export const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { gameState, refreshGameState, loading } = useGame();

  // User line selections: lineId -> position number (1..N) or null
  const [selections, setSelections] = useState<Record<string, number | null>>({});

  // Simulation states
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [showSimPanel, setShowSimPanel] = useState<boolean>(false);

  // Post-submission feedback state
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(null);

  // Loading & validation warning states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [advancing, setAdvancing] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initial sync on mount
  useEffect(() => {
    refreshGameState();
  }, [gameId, refreshGameState]);

  // Sync state when current question changes or submittedFeedback arrives from backend
  useEffect(() => {
    if (gameState?.currentQuestion) {
      const initial: Record<string, number | null> = {};
      gameState.currentQuestion.lines.forEach((l) => {
        initial[l.id] = null;
      });
      setSelections(initial);
      setValidationError(null);
      setSimResult(null);
      setShowSimPanel(false);

      if (gameState.submittedFeedback) {
        setAnswerFeedback(gameState.submittedFeedback);
      } else {
        setAnswerFeedback(null);
      }
    }
  }, [gameState?.currentQuestionIndex, gameState?.currentQuestion?.title, gameState?.submittedFeedback]);

  // Redirect if game is completed or expired
  useEffect(() => {
    if (gameState?.completed || gameState?.status === 'completed' || gameState?.status === 'expired') {
      navigate(`/result/${gameState.gameId}`);
    }
  }, [gameState?.completed, gameState?.status, gameState?.gameId, navigate]);

  if (loading || !gameState || !gameState.currentQuestion) {
    return (
      <PageContainer maxWidth="lg" className="py-16 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-steel-blue border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-sm text-cool-gray">Loading Jigsaw Challenge Session...</p>
        </div>
      </PageContainer>
    );
  }

  const currentQ = gameState.currentQuestion;

  const handleSelectionChange = (lineId: string, value: number | null) => {
    setSelections((prev) => ({
      ...prev,
      [lineId]: value
    }));
    if (validationError) setValidationError(null);
  };

  const handleDiscardAll = () => {
    const cleared: Record<string, number | null> = {};
    currentQ.lines.forEach((l) => {
      cleared[l.id] = null;
    });
    setSelections(cleared);
    setValidationError(null);
  };

  // Simulation feature on revealed canonical code
  const handleSimulation = async () => {
    if (!answerFeedback) return;
    setShowSimPanel(true);
    setSimLoading(true);
    setSimResult(null);
    try {
      const canonicalLines = answerFeedback.correctCodeOrder.map((l, idx) => ({
        id: String(idx + 1),
        code: l.code
      }));

      const res = await gameApi.getSimulation(gameState.gameId, canonicalLines);
      setSimResult(res);
    } catch (err: any) {
      setSimResult({
        supported: false,
        language: gameState.language,
        message: 'Simulation is currently unavailable for this language.',
        steps: []
      });
    } finally {
      setSimLoading(false);
    }
  };

  // Answer Submission
  const handleSubmitAnswer = async () => {
    const missingLine = currentQ.lines.some(
      (l) => selections[l.id] === null || selections[l.id] === undefined
    );
    if (missingLine) {
      setValidationError('Please assign a line number to every code line.');
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    const submissionPayload: Record<string, number> = {};
    Object.entries(selections).forEach(([id, val]) => {
      if (val !== null) submissionPayload[id] = val;
    });

    try {
      const result = await gameApi.submitAnswer(gameState.gameId, submissionPayload);
      setAnswerFeedback(result);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  // Next Question Action
  const handleNextQuestion = async () => {
    setAdvancing(true);
    try {
      const updatedState = await gameApi.nextQuestion(gameState.gameId);
      setAnswerFeedback(null);
      await refreshGameState();
      if (updatedState.completed || updatedState.status === 'completed') {
        navigate(`/result/${gameState.gameId}`);
      }
    } catch (err: any) {
      setValidationError(err.message || 'Failed to advance to next question.');
    } finally {
      setAdvancing(false);
    }
  };

  const isLastQuestion = gameState.currentQuestionIndex >= gameState.totalQuestions - 1;

  return (
    <PageContainer maxWidth="xl" className="py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header Info Banner */}
      <div className="bg-dark-slate p-3.5 sm:p-4 rounded-xl border border-gunmetal flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-1">
            <span className="bg-emerald-green/10 text-emerald-green px-2 py-0.5 rounded font-bold uppercase">
              Question {gameState.currentQuestionIndex + 1} of {gameState.totalQuestions}
            </span>
            <span className="text-cool-gray">•</span>
            <span className="text-steel-blue font-bold uppercase">{currentQ.language}</span>
            <span className="text-cool-gray">•</span>
            <span className="text-amber font-bold capitalize">{currentQ.difficulty}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-snow-white">{currentQ.title}</h2>
          <p className="text-xs text-cool-gray mt-0.5">{currentQ.description}</p>
        </div>

        {/* Score & Question Progress Pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-graphite px-3 py-1.5 rounded-lg border border-gunmetal font-mono text-xs text-right">
            <span className="text-cool-gray block text-[10px] uppercase">Current Score</span>
            <span className="text-emerald-green font-bold text-sm sm:text-base">{gameState.totalScore} pts</span>
          </div>

          <div className="bg-graphite px-3 py-1.5 rounded-lg border border-gunmetal font-mono text-xs text-right">
            <span className="text-cool-gray block text-[10px] uppercase">Correct</span>
            <span className="text-snow-white font-bold text-sm sm:text-base">{gameState.correctAnswers} / {gameState.totalQuestions}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BEFORE SUBMISSION VIEW                                                    */}
      {/* ========================================================================= */}
      {!answerFeedback ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Main Scrambled Code Editor Panel */}
          <CodeEditor
            lines={currentQ.lines}
            selections={selections}
            onSelectionChange={handleSelectionChange}
            onDiscardAll={handleDiscardAll}
            disabled={submitting}
          />

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3 bg-crimson-red/10 border border-crimson-red/30 rounded-xl text-xs text-crimson-red font-mono flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Controls Bar - ONLY Submit Answer before submission */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-green/40 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-jet-black border-t-transparent rounded-full animate-spin" />
                  <span>Checking Answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>SUBMIT ANSWER</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* AFTER SUBMISSION VIEW (STACKED MOBILE-RESPONSIVE FLOW)                    */
        /* ========================================================================= */
        <div className="space-y-4 sm:space-y-6 animate-fadeIn font-mono">
          {/* 1. SUBMISSION RESULT BANNER */}
          <div
            className={`p-4 sm:p-6 rounded-2xl border shadow-2xl flex items-center gap-4 ${
              answerFeedback.isCorrect
                ? 'bg-emerald-green/10 border-emerald-green/50 ring-1 ring-emerald-green/30'
                : 'bg-crimson-red/10 border-crimson-red/50 ring-1 ring-crimson-red/30'
            }`}
          >
            {answerFeedback.isCorrect ? (
              <div className="w-12 h-12 rounded-full bg-emerald-green/20 text-emerald-green flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-crimson-red/20 text-crimson-red flex items-center justify-center shrink-0">
                <XCircle className="w-7 h-7 stroke-[2.5]" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                  className={`text-xl sm:text-2xl font-bold uppercase tracking-wide ${
                    answerFeedback.isCorrect ? 'text-emerald-green' : 'text-crimson-red'
                  }`}
                >
                  {answerFeedback.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                </h3>
                {answerFeedback.isCorrect && (
                  <span className="bg-emerald-green/20 text-emerald-green px-3 py-1 rounded-lg border border-emerald-green/40 text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> +{answerFeedback.pointsEarned} pts
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-cool-gray mt-1 font-sans">
                {answerFeedback.isCorrect
                  ? 'Great job! You reconstructed the code correctly.'
                  : 'Review your selection alongside the correct line order below.'}
              </p>
            </div>
          </div>

          {/* 2. WRONG ANSWER DETAILS (Only displayed if answer is incorrect) */}
          {!answerFeedback.isCorrect && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Your Answer */}
              <div className="bg-dark-slate p-4 rounded-xl border border-gunmetal space-y-2">
                <div className="text-xs text-crimson-red font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Your Answer:
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {answerFeedback.submittedArrangement.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2 rounded bg-jet-black/60 border border-gunmetal text-xs min-w-0"
                    >
                      <span className="px-2 py-0.5 rounded bg-crimson-red/20 text-crimson-red font-bold text-[11px] shrink-0">
                        Line {item.submittedPosition}
                      </span>
                      <span className="text-cool-gray whitespace-pre overflow-x-auto min-w-0 flex-1">{item.code}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Answer */}
              <div className="bg-dark-slate p-4 rounded-xl border border-gunmetal space-y-2">
                <div className="text-xs text-emerald-green font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Correct Answer:
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {answerFeedback.submittedArrangement.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2 rounded bg-jet-black/60 border border-gunmetal text-xs min-w-0"
                    >
                      <span className="px-2 py-0.5 rounded bg-emerald-green/20 text-emerald-green font-bold text-[11px] shrink-0">
                        Line {item.correctPosition ?? item.submittedPosition}
                      </span>
                      <span className="text-snow-white whitespace-pre overflow-x-auto min-w-0 flex-1">{item.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. CORRECT CODE (Displayed in canonical order for both correct and wrong answers) */}
          <div className="bg-dark-slate p-4 sm:p-5 rounded-xl border border-gunmetal space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-snow-white uppercase font-bold tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-steel-blue" /> Correct Code (Canonical Order):
              </span>
              <span className="text-[11px] text-cool-gray">Original sequence</span>
            </div>

            <div className="rounded-xl border border-gunmetal bg-jet-black p-3 space-y-1.5 max-h-80 overflow-y-auto">
              {answerFeedback.correctCodeOrder.map((line) => (
                <div key={line.position} className="flex items-center gap-3 p-2.5 rounded bg-charcoal-gray/60 text-xs sm:text-sm min-w-0">
                  <span className="w-7 h-7 rounded-md bg-steel-blue/20 text-steel-blue font-bold flex items-center justify-center text-xs shrink-0">
                    {line.position}
                  </span>
                  <span className="text-snow-white font-mono whitespace-pre overflow-x-auto min-w-0 flex-1 py-0.5">{line.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. EXPLANATION */}
          {answerFeedback.explanation && (
            <div className="bg-dark-slate p-4 rounded-xl border border-gunmetal">
              <span className="text-amber text-xs font-bold flex items-center gap-1.5 mb-1.5">
                <Lightbulb className="w-4 h-4" /> Explanation:
              </span>
              <p className="text-xs sm:text-sm text-cool-gray font-sans leading-relaxed">
                {answerFeedback.explanation}
              </p>
            </div>
          )}

          {/* 5. POST-SUBMISSION ACTION CONTROLS */}
          <div className="bg-dark-slate p-4 rounded-xl border border-gunmetal flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Simulation Button */}
              <button
                type="button"
                onClick={handleSimulation}
                disabled={simLoading}
                className="px-5 py-3 rounded-xl bg-indigo hover:bg-indigo-600 text-white font-mono font-bold text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo/50 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Cpu className="w-4 h-4" />
                <span>{simLoading ? 'Trace...' : 'Simulation'}</span>
              </button>
            </div>

            {/* Next Question Button */}
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={advancing}
              className="px-8 py-3.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-green/40 flex items-center justify-center gap-2.5 cursor-pointer shadow-xl disabled:opacity-50"
            >
              {advancing ? (
                <>
                  <div className="w-4 h-4 border-2 border-jet-black border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>{isLastQuestion ? 'VIEW FINAL RESULTS' : 'NEXT QUESTION'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Simulation Panel Output Window */}
          {showSimPanel && (
            <SimulationPanel
              simulation={simResult}
              loading={simLoading}
              onClose={() => setShowSimPanel(false)}
            />
          )}
        </div>
      )}
    </PageContainer>
  );
};
