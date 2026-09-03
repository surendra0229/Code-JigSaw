import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { AuthPage } from './pages/AuthPage';
import { PlayerSetup } from './pages/PlayerSetup';
import { LanguageSelection } from './pages/LanguageSelection';
import { DifficultySelection } from './pages/DifficultySelection';
import { TimeSelection } from './pages/TimeSelection';
import { Instructions } from './pages/Instructions';
import { GamePage } from './pages/GamePage';
import { ResultPage } from './pages/ResultPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <GameProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/setup" element={<PlayerSetup />} />
          <Route path="/select-language" element={<LanguageSelection />} />
          <Route path="/select-difficulty" element={<DifficultySelection />} />
          <Route path="/select-time" element={<TimeSelection />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/result/:gameId" element={<ResultPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </GameProvider>
    </BrowserRouter>
  );
};

export default App;
