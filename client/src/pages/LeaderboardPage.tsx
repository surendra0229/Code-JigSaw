import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Filter, Play, Award } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/PageContainer';
import { gameApi } from '../services/gameApi';
import { LeaderboardItem } from '../types/game';

export const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightGameId = searchParams.get('gameId');

  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [playerRankInfo, setPlayerRankInfo] = useState<any | null>(null);

  // Filters
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [selectedDiff, setSelectedDiff] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    gameApi.getLeaderboard(selectedLang, selectedDiff)
      .then(res => setItems(res))
      .catch(err => console.error('Failed to fetch leaderboard:', err))
      .finally(() => setLoading(false));

    if (highlightGameId) {
      gameApi.getPlayerRank(highlightGameId)
        .then(res => setPlayerRankInfo(res))
        .catch(() => setPlayerRankInfo(null));
    }
  }, [selectedLang, selectedDiff, highlightGameId]);

  const languagesList = [
    { id: 'all', name: 'All Languages' },
    { id: 'c', name: 'C' },
    { id: 'python', name: 'Python' },
    { id: 'cpp', name: 'C++' },
    { id: 'java', name: 'Java' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'csharp', name: 'C#' },
    { id: 'php', name: 'PHP' },
    { id: 'typescript', name: 'TypeScript' }
  ];

  return (
    <PageContainer maxWidth="xl" className="py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gunmetal pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold font-semibold mb-1">
            <Trophy className="w-4 h-4 text-gold" />
            <span>ENGINEERING DAY HALL OF FAME</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-snow-white">Competition Leaderboard</h2>
          <p className="text-xs text-cool-gray">Deterministic ranking: Correct Answers → Score → Difficulty → Time Used</p>
        </div>

        <button
          onClick={() => navigate('/setup')}
          className="px-5 py-2.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>START NEW CHALLENGE</span>
        </button>
      </div>

      {/* Player Current Rank Banner (if coming from game completion) */}
      {playerRankInfo && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-green/10 border border-emerald-green/40 text-emerald-green font-mono flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-green/20 text-emerald-green flex items-center justify-center font-bold text-lg border border-emerald-green/40">
              #{playerRankInfo.rank}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">Your Global Standing</span>
              <p className="text-sm font-bold text-snow-white">
                {playerRankInfo.playerName} ranked <strong className="text-emerald-green">#{playerRankInfo.rank}</strong> out of {playerRankInfo.totalPlayers} players!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-graphite px-3 py-1.5 rounded-lg border border-gunmetal text-right">
              <span className="text-cool-gray text-[10px] uppercase block">Final Score</span>
              <span className="text-snow-white font-bold">{playerRankInfo.score} pts</span>
            </div>
            <div className="bg-graphite px-3 py-1.5 rounded-lg border border-gunmetal text-right">
              <span className="text-cool-gray text-[10px] uppercase block">Accuracy</span>
              <span className="text-snow-white font-bold">{playerRankInfo.correctAnswers} / 5</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="bg-dark-slate p-4 rounded-xl border border-gunmetal flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cool-gray">
          <Filter className="w-4 h-4 text-steel-blue" />
          <span>Filter Leaderboard:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono">
          {/* Language filter */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="px-3.5 py-2 rounded-lg bg-jet-black border border-gunmetal text-xs text-steel-blue font-bold uppercase focus:outline-none focus:border-steel-blue"
          >
            {languagesList.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          {/* Difficulty filter */}
          <select
            value={selectedDiff}
            onChange={(e) => setSelectedDiff(e.target.value)}
            className="px-3.5 py-2 rounded-lg bg-jet-black border border-gunmetal text-xs text-amber font-bold uppercase focus:outline-none focus:border-steel-blue"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-dark-slate border border-gunmetal rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-cool-gray">
            <div className="w-8 h-8 border-3 border-steel-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading Leaderboard Rankings...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-cool-gray space-y-3">
            <Trophy className="w-10 h-10 text-gunmetal mx-auto" />
            <p>No completed games yet. Be the first to play!</p>
            <button
              onClick={() => navigate('/setup')}
              className="text-emerald-green underline hover:text-emerald-400 font-semibold cursor-pointer"
            >
              Start a new game and claim 1st place!
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-graphite text-cool-gray uppercase font-bold text-[10px] tracking-wider border-b border-gunmetal">
                <tr>
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-4">Player</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Correct</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4 text-right">Time Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gunmetal/60">
                {items.map((item) => {
                  let rankDisplay = null;
                  let rowBg = 'hover:bg-jet-black/40';
                  const isCurrentPlayer = highlightGameId === item.gameId;

                  if (item.rank === 1) {
                    rankDisplay = (
                      <span className="inline-flex items-center gap-1 bg-gold/20 text-gold px-2.5 py-1 rounded-full border border-gold/40 font-bold text-xs">
                        🥇 1st
                      </span>
                    );
                    rowBg = 'bg-gold/5 hover:bg-gold/10';
                  } else if (item.rank === 2) {
                    rankDisplay = (
                      <span className="inline-flex items-center gap-1 bg-silver/20 text-silver px-2.5 py-1 rounded-full border border-silver/40 font-bold text-xs">
                        🥈 2nd
                      </span>
                    );
                    rowBg = 'bg-silver/5 hover:bg-silver/10';
                  } else if (item.rank === 3) {
                    rankDisplay = (
                      <span className="inline-flex items-center gap-1 bg-bronze/20 text-bronze px-2.5 py-1 rounded-full border border-bronze/40 font-bold text-xs">
                        🥉 3rd
                      </span>
                    );
                    rowBg = 'bg-bronze/5 hover:bg-bronze/10';
                  } else {
                    rankDisplay = <span className="font-bold text-cool-gray">#{item.rank}</span>;
                  }

                  if (isCurrentPlayer) {
                    rowBg = 'bg-emerald-green/15 ring-1 ring-emerald-green/40';
                  }

                  const minutes = Math.floor(item.timeUsed / 60);
                  const seconds = item.timeUsed % 60;
                  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                  return (
                    <tr key={item.gameId} className={`transition-colors ${rowBg}`}>
                      <td className="py-3.5 px-4 text-center">
                        {rankDisplay}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-snow-white flex items-center gap-2">
                        <span>{item.playerName}</span>
                        {isCurrentPlayer && (
                          <span className="text-[10px] bg-emerald-green text-jet-black px-1.5 py-0.5 rounded font-bold uppercase">YOU</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-steel-blue font-bold uppercase">
                        {item.language}
                      </td>
                      <td className="py-3.5 px-4 capitalize font-semibold">
                        <span className={
                          item.difficulty === 'hard' ? 'text-ruby-red font-bold' :
                          item.difficulty === 'moderate' ? 'text-golden-yellow font-bold' :
                          'text-emerald-green font-bold'
                        }>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-snow-white font-bold">
                        {item.correctAnswers} / 5
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-green text-sm">
                        {item.score} pts
                      </td>
                      <td className="py-3.5 px-4 text-right text-cool-gray">
                        {timeFormatted}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
