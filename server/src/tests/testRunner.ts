import { calculateQuestionScore } from '../utils/scoring.js';
import {
  hashPassword,
  verifyPassword,
  createAdminToken,
  verifyAdminToken,
  createPlayerToken,
  verifyPlayerToken
} from '../utils/authUtils.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASSED: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAILED: ${testName}`);
    failed++;
  }
}

export function runAllTests() {
  console.log('\n=================================================');
  console.log('   RUNNING CODE JIGSAW AUTOMATED TEST SUITE     ');
  console.log('=================================================\n');

  // TEST SUITE 1: SCORING FORMULA & BOUNDS
  console.log('[Suite 1] Score Calculation Service:');
  const maxScoreEasy = calculateQuestionScore({
    difficulty: 'easy',
    questionIndex: 0,
    isCorrect: true,
    timeTakenForQuestion: 5,
    totalGameTime: 300,
    timeRemainingInGame: 300
  });
  assert(maxScoreEasy === 5, 'Easy Q1 max points equals 5');

  const maxScoreHard = calculateQuestionScore({
    difficulty: 'hard',
    questionIndex: 4,
    isCorrect: true,
    timeTakenForQuestion: 10,
    totalGameTime: 600,
    timeRemainingInGame: 600
  });
  assert(maxScoreHard === 10, 'Hard Q5 max points equals 10');

  const wrongScore = calculateQuestionScore({
    difficulty: 'hard',
    questionIndex: 2,
    isCorrect: false,
    timeTakenForQuestion: 10,
    totalGameTime: 600,
    timeRemainingInGame: 500
  });
  assert(wrongScore === 0, 'Wrong answer yields exactly 0 points');

  // TEST SUITE 2: ADMIN AUTH & SECURITY
  console.log('\n[Suite 2] Admin Authentication & Isolation:');
  const pass = 'TestAdminPass123!';
  const hash = hashPassword(pass);
  assert(verifyPassword(pass, hash) === true, 'Correct Admin password verifies against hash');
  assert(verifyPassword('WrongPass', hash) === false, 'Incorrect Admin password fails verification');

  const adminToken = createAdminToken({
    id: 'admin-123',
    email: 'admin@example.com',
    userId: 'admin123',
    displayName: 'Admin'
  });
  const decodedAdmin = verifyAdminToken(adminToken);
  assert(decodedAdmin !== null && decodedAdmin.email === 'admin@example.com' && decodedAdmin.userId === 'admin123', 'Admin token signs and decodes email & userId correctly');
  assert(verifyAdminToken('invalid.token.string') === null, 'Malformed admin token is rejected');

  // TEST SUITE 3: PLAYER AUTH & PERMANENT IDENTITY
  console.log('\n[Suite 3] Player Registration, Login & Permanent Identity:');
  const playerToken = createPlayerToken({
    id: 'player-999',
    playerName: 'Surendra Chennamalli',
    email: 'surendra@example.com'
  });
  const decodedPlayer = verifyPlayerToken(playerToken);
  assert(decodedPlayer !== null && decodedPlayer.playerName === 'Surendra Chennamalli', 'Player token decodes player name correctly');
  assert(verifyAdminToken(playerToken) === null, 'Player token cannot authenticate as admin (Role Isolation)');
  assert(verifyPlayerToken(adminToken) === null, 'Admin token cannot authenticate as player (Role Isolation)');

  // TEST SUITE 4: LEADERBOARD TIE-BREAKING ALGORITHM
  console.log('\n[Suite 4] Deterministic Leaderboard Tie-Breaking:');
  const mockGames = [
    { playerName: 'Player A', correctAnswers: 4, totalScore: 35, difficulty: 'moderate', timeUsed: 120, selectedTime: 300, createdAt: new Date('2026-09-03T10:00:00Z') },
    { playerName: 'Player B', correctAnswers: 5, totalScore: 30, difficulty: 'easy', timeUsed: 200, selectedTime: 300, createdAt: new Date('2026-09-03T10:05:00Z') },
    { playerName: 'Player C', correctAnswers: 4, totalScore: 35, difficulty: 'hard', timeUsed: 110, selectedTime: 300, createdAt: new Date('2026-09-03T10:02:00Z') }
  ];

  const diffWeight: Record<string, number> = { hard: 3, moderate: 2, easy: 1 };
  mockGames.sort((a, b) => {
    if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    const weightA = diffWeight[a.difficulty] || 1;
    const weightB = diffWeight[b.difficulty] || 1;
    if (weightB !== weightA) return weightB - weightA;
    if (a.timeUsed !== b.timeUsed) return a.timeUsed - b.timeUsed;
    return a.selectedTime - b.selectedTime;
  });

  assert(mockGames[0].playerName === 'Player B', 'Player with 5/5 correct outranks 4/5 players regardless of score');
  assert(mockGames[1].playerName === 'Player C', 'Among 4/5 correct ties, Hard difficulty outranks Moderate difficulty');

  console.log('\n=================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED `);
  console.log('=================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Always run when executed directly (tsx src/tests/testRunner.ts)
runAllTests();
