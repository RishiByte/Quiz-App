let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let autoAdvanceTimeout;
let isAdvancing = false;
let timeLeft = 15;
let isPaused = false;
const TIME_LIMIT = 15;

// Audio Assets
const correctSound = new Audio('https://raw.githubusercontent.com/shubhamsigdar1/Quiz-App/master/correct.mp3');
const wrongSound   = new Audio('https://raw.githubusercontent.com/shubhamsigdar1/Quiz-App/master/wrong.mp3');
const clickSound   = new Audio('https://raw.githubusercontent.com/ArunMichaelTarigan/quiz-app-javascript/master/sound/click.mp3');

function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(err => console.log("Audio play blocked until user interaction", err));
}


const startScreen    = document.getElementById('start-screen');
const startBtn       = document.getElementById('start-btn');
const categorySelect   = document.getElementById('category-select');
const difficultySelect = document.getElementById('difficulty-select');
const quizContainer    = document.getElementById('quiz-container');

// Theme management
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon      = document.getElementById('theme-icon');

function initTheme() {
    const savedTheme = localStorage.getItem('quiz-theme') || 'dark';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.textContent = '🌙';
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.textContent = '☀️';
    }
    localStorage.setItem('quiz-theme', theme);
}

function toggleTheme() {
    playSound(clickSound);
    const isLight = document.body.classList.contains('light-mode');
    applyTheme(isLight ? 'dark' : 'light');
}

themeToggleBtn.addEventListener('click', toggleTheme);

// Initialize theme immediately
initTheme();

// Re-cacheable sub-elements of quizContainer
let questionTextElement   = quizContainer.querySelector('.question-text');
let timerElement          = quizContainer.querySelector('.timer');
let optionsSection        = quizContainer.querySelector('.options-section');
let nextButton            = quizContainer.querySelector('.next-btn');
let questionNumberElement = quizContainer.querySelector('.question-number');
let progressFill          = quizContainer.querySelector('.progress-fill');
let progressText          = quizContainer.querySelector('.progress-percentage');
let pauseBtn;

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function getHighScore() {
    return parseInt(localStorage.getItem('quizHighScore') || '0', 10);
}

function saveHighScore(newScore) {
    if (newScore > getHighScore()) {
        localStorage.setItem('quizHighScore', newScore);
        return true;
    }
    return false;
}

/* ── Timer ────────────────────────────────────── */

function startTimer() {
    if (timerElement) {
        timerElement.textContent = `${timeLeft}s`;
        timerElement.classList.remove('warning');
    }

    timerInterval = setInterval(() => {
        if (isPaused) return;

        timeLeft--;
        if (timerElement) {
            timerElement.textContent = `${timeLeft}s`;
            if (timeLeft <= 5) {
                timerElement.classList.add('warning');
            }
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (pauseBtn) pauseBtn.disabled = true;
            revealCorrectAnswer();
            autoAdvanceTimeout = setTimeout(() => advanceToNextQuestion(), 1200);
        }
    }, 1000);
}

function togglePause() {
    if (optionsSection.classList.contains('answered')) return;
    
    isPaused = !isPaused;
    playSound(clickSound);
    
    if (pauseBtn) {
        pauseBtn.textContent = isPaused ? '▶' : '⏸';
        pauseBtn.setAttribute('aria-label', isPaused ? 'Resume quiz' : 'Pause quiz');
    }
    
    if (optionsSection) {
        optionsSection.style.pointerEvents = isPaused ? 'none' : 'auto';
        optionsSection.style.opacity = isPaused ? '0.5' : '1';
    }
}

function revealCorrectAnswer() {
    if (optionsSection.classList.contains('answered')) return;
    optionsSection.classList.add('answered');
    const currentQuestion = questions[currentQuestionIndex];
    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === currentQuestion.correctAnswer) {
            btn.classList.add('correct');
        }
    });
}

/* ── Navigation ───────────────────────────────── */

function advanceToNextQuestion() {
    if (isAdvancing) return;
    isAdvancing = true;

    clearInterval(timerInterval);
    if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
    if (quizContainer) quizContainer.classList.add('fade-out');

    setTimeout(() => {
        isAdvancing = false;
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            showResults();
        }
    }, 300);
}

/* ── Results Screen ───────────────────────────── */

function getResultEmoji(pct) {
    if (pct === 100) return '🏆';
    if (pct >= 80)  return '🌟';
    if (pct >= 60)  return '🎉';
    if (pct >= 40)  return '💪';
    return '📚';
}

function getResultTitle(pct) {
    if (pct === 100) return 'Perfect Score!';
    if (pct >= 80)  return 'Outstanding!';
    if (pct >= 60)  return 'Well Done!';
    if (pct >= 40)  return 'Good Effort!';
    return 'Keep Practicing!';
}

function showResults() {
    const isNewRecord = saveHighScore(score);
    const highScore = getHighScore();
    const totalQuestions = questions.length;
    const pct = Math.round((score / totalQuestions) * 100);
    const wrongAnswers = totalQuestions - score;
    const circumference = 314; // 2 * π * 50
    const dashOffset = circumference - (circumference * pct / 100);

    if (quizContainer) quizContainer.classList.remove('fade-out');
    if (quizContainer) {
        quizContainer.innerHTML = `
            <div class="result-screen">
                <div class="result-emoji">${getResultEmoji(pct)}</div>
                <h2 class="result-title">${getResultTitle(pct)}</h2>

                <div class="score-ring-wrap">
                    <svg viewBox="0 0 120 120" width="100%" height="100%">
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#6366f1"/>
                                <stop offset="100%" stop-color="#8b5cf6"/>
                            </linearGradient>
                        </defs>
                        <circle class="score-ring-bg" cx="60" cy="60" r="50"/>
                        <circle class="score-ring-fill" cx="60" cy="60" r="50"
                                style="stroke-dashoffset: ${circumference}"/>
                    </svg>
                    <div class="score-ring-text">${pct}%</div>
                </div>

                <div class="result-stats-grid">
                    <div class="stat-card">
                        <span class="stat-label">Correct</span>
                        <span class="stat-value correct">${score}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Wrong</span>
                        <span class="stat-value wrong">${wrongAnswers}</span>
                    </div>
                </div>

                <p class="result-score">Accuracy Rate: <strong>${pct}%</strong></p>

                ${isNewRecord
                    ? `<p class="new-record-badge">🏆 New High Score!</p>`
                    : `<p class="high-score-display">🥇 Best: <strong>${highScore} / ${totalQuestions}</strong></p>`
                }

                <div class="result-actions">
                    <button class="review-btn" id="review-btn">📋 Review Answers</button>
                    <button class="restart-btn" id="restart-btn" style="margin-top: 0;">↻ Play Again</button>
                </div>
            </div>
        `;

        // Animate score ring after mount
        requestAnimationFrame(() => {
            const ringFill = quizContainer.querySelector('.score-ring-fill');
            if (ringFill) {
                ringFill.style.strokeDashoffset = dashOffset;
            }
        });

        document.getElementById('review-btn').addEventListener('click', () => {
            playSound(clickSound);
            showReview();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            playSound(clickSound);
            restartQuiz();
        });
    }
}

function showReview() {
    if (!quizContainer) return;
    
    quizContainer.innerHTML = `
        <div class="review-screen">
            <h2 class="review-title">Answer Review</h2>
            <div class="review-list">
                ${questions.map((q, i) => {
                    const isCorrect = q.userAnswer === q.correctAnswer;
                    return `
                        <div class="review-card">
                            <h3 class="review-question">${i + 1}. ${q.question}</h3>
                            <div class="review-answers">
                                <div class="answer-row">
                                    <span class="answer-indicator indicator-user">Your Answer</span>
                                    <span class="answer-text ${isCorrect ? 'correct' : 'wrong'}">
                                        ${q.userAnswer || '<span style="opacity:0.5">Time Expired</span>'}
                                    </span>
                                </div>
                                ${!isCorrect ? `
                                <div class="answer-row">
                                    <span class="answer-indicator indicator-correct">Correct Answer</span>
                                    <span class="answer-text correct">${q.correctAnswer}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="result-actions">
                <button class="restart-btn" id="restart-from-review-btn">↻ Play Again</button>
            </div>
        </div>
    `;

    document.getElementById('restart-from-review-btn').addEventListener('click', () => {
        playSound(clickSound);
        restartQuiz();
    });
}

/* ── Restart Quiz ─────────────────────────────── */

function restartQuiz() {
    // Reset state
    questions = [];
    currentQuestionIndex = 0;
    score = 0;
    isAdvancing = false;
    if (startBtn) startBtn.disabled = false;
    clearInterval(timerInterval);

    // Rebuild quiz container HTML
    quizContainer.style.display = 'none';
    quizContainer.innerHTML = `
        <div class="quiz-header">
            <div class="header-top">
                <span class="question-number">Question 1 of 10</span>
                <span class="progress-percentage">0%</span>
                <div class="timer-group">
                    <span class="timer">15s</span>
                    <button id="pause-btn" class="pause-btn" aria-label="Pause quiz">⏸</button>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%;"></div>
            </div>
        </div>
        <div class="question-section">
            <h2 class="question-text">Loading questions...</h2>
        </div>
        <div class="options-section"></div>
        <div class="quiz-footer">
            <button class="next-btn">Next Question</button>
        </div>
    `;

    // Re-cache elements
    recacheElements();

    // Show start screen
    startScreen.style.display = 'flex';

    // Replay start card animation
    const startCard = startScreen.querySelector('.start-card');
    if (startCard) {
        startCard.style.animation = 'none';
        startCard.offsetHeight; // force reflow
        startCard.style.animation = '';
    }
}

function recacheElements() {
    questionTextElement   = quizContainer.querySelector('.question-text');
    timerElement          = quizContainer.querySelector('.timer');
    optionsSection        = quizContainer.querySelector('.options-section');
    nextButton            = quizContainer.querySelector('.next-btn');
    questionNumberElement = quizContainer.querySelector('.question-number');
    progressFill          = quizContainer.querySelector('.progress-fill');
    progressText          = quizContainer.querySelector('.progress-percentage');
    pauseBtn              = quizContainer.querySelector('#pause-btn');
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', togglePause);
    }
}

/* ── Start Quiz ───────────────────────────────── */

startBtn.addEventListener('click', () => {
    if (startBtn.disabled) return;
    startBtn.disabled = true;
    playSound(clickSound);
    const categoryId = categorySelect.value;

    // Fade out the start screen
    const startCard = startScreen.querySelector('.start-card');
    if (startCard) {
        startCard.style.animation = 'fadeOut 0.3s ease-in forwards';
    }

    setTimeout(() => {
        startScreen.style.display = 'none';
        quizContainer.style.display = 'flex';

        // Re-trigger quiz container entrance
        quizContainer.style.animation = 'none';
        quizContainer.offsetHeight;
        quizContainer.style.animation = '';

        fetchQuestions(categoryId, difficultySelect.value);
    }, 300);
});

async function fetchQuestions(categoryId = '', difficulty = '', isRetry = false) {
    const qText = quizContainer.querySelector('.question-text');
    const opts  = quizContainer.querySelector('.options-section');
    const nBtn  = quizContainer.querySelector('.next-btn');

    if (qText) {
        qText.textContent = isRetry ? 'Trying alternative settings...' : 'Loading questions...';
    }
    if (opts)  opts.innerHTML = '';
    if (nBtn)  { nBtn.style.display = 'block'; nBtn.disabled = true; }

    let url = 'https://opentdb.com/api.php?amount=10&type=multiple';
    if (categoryId) url += `&category=${categoryId}`;
    if (difficulty) url += `&difficulty=${difficulty}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Handle OpenTDB Response Codes or insufficient questions
        if (data.response_code === 1 || (data.results && data.results.length < 10)) { // No Results or Not Enough
            console.warn("Not enough results for:", { categoryId, difficulty, fetched: data.results?.length });
            if (difficulty) {
                // Try removing difficulty first
                return fetchQuestions(categoryId, '', true);
            } else if (categoryId) {
                // Try removing category if difficulty was already empty
                return fetchQuestions('', '', true);
            }
        } else if (data.response_code === 5) { // Rate Limit
            console.warn("Rate limited, retrying in 1s...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchQuestions(categoryId, difficulty, isRetry);
        }

        if (data.response_code !== 0 || !data.results || data.results.length === 0) {
            throw new Error(`API Error: Code ${data.response_code}`);
        }

        questions = data.results.map(q => {
            const formattedQuestion = {
                question: decodeHTML(q.question),
                correctAnswer: decodeHTML(q.correct_answer),
                options: [...q.incorrect_answers.map(decodeHTML), decodeHTML(q.correct_answer)]
            };
            formattedQuestion.options.sort(() => Math.random() - 0.5);
            return formattedQuestion;
        });

        currentQuestionIndex = 0;
        score = 0;
        renderQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
        if (qText) qText.textContent = 'Failed to load questions. Please try again.';
    }
}

/* ── Render Question ──────────────────────────── */

function renderQuestion() {
    if (questions.length === 0) return;

    const qContainer = quizContainer;
    const qText   = qContainer.querySelector('.question-text');
    const opts    = qContainer.querySelector('.options-section');
    const nBtn    = qContainer.querySelector('.next-btn');
    const qNum    = qContainer.querySelector('.question-number');
    const pFill   = qContainer.querySelector('.progress-fill');

    if (qContainer) qContainer.classList.remove('fade-out');
    clearInterval(timerInterval);
    if (opts) opts.classList.remove('answered');
    if (nBtn) { nBtn.style.display = 'block'; nBtn.disabled = true; }

    const currentQuestion = questions[currentQuestionIndex];

    const progressPct = Math.round(((currentQuestionIndex) / questions.length) * 100);
    if (qNum)  qNum.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    if (pFill) pFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    if (progressText) progressText.textContent = `${Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%`;

    // Animate question section
    const qSection = qContainer.querySelector('.question-section');
    if (qSection) {
        qSection.style.animation = 'none';
        qSection.offsetHeight;
        qSection.style.animation = 'scaleIn 0.35s ease-out';
    }

    timeLeft = TIME_LIMIT;
    isPaused = false;
    startTimer();

    if (qText) qText.innerHTML = currentQuestion.question;
    if (opts)  opts.innerHTML = '';

    currentQuestion.options.forEach((option, idx) => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.textContent = option;

        // Staggered entrance animation
        button.style.animationDelay = `${idx * 0.07}s`;

        // Radial hover glow follows cursor
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            button.style.setProperty('--x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
            button.style.setProperty('--y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
        });

        button.addEventListener('click', () => {
            if (opts.classList.contains('answered') || isPaused) return;
            currentQuestion.userAnswer = option;
            opts.classList.add('answered');
            clearInterval(timerInterval);
            if (pauseBtn) pauseBtn.disabled = true;
            if (nBtn) nBtn.disabled = false;

            const isCorrect = option === currentQuestion.correctAnswer;
            if (isCorrect) {
                score++;
                playSound(correctSound);
            } else {
                playSound(wrongSound);
            }

            const allOptions = opts.querySelectorAll('.option-btn');
            allOptions.forEach(btn => {
                btn.disabled = true;
                if (btn.textContent === currentQuestion.correctAnswer) {
                    btn.classList.add('correct');
                } else if (btn === button && !isCorrect) {
                    btn.classList.add('incorrect');
                }
            });

            // Auto-advance after answering to keep the flow smooth
            autoAdvanceTimeout = setTimeout(() => advanceToNextQuestion(), 1500);
        });

        if (opts) opts.appendChild(button);
    });

    // Clone the next button to remove ALL previous listeners (prevents stacking)
    const oldNextBtn = qContainer.querySelector('.next-btn');
    if (oldNextBtn) {
        const freshNextBtn = oldNextBtn.cloneNode(true);
        oldNextBtn.parentNode.replaceChild(freshNextBtn, oldNextBtn);
        freshNextBtn.addEventListener('click', () => {
            if (!freshNextBtn.disabled && !isAdvancing) {
                freshNextBtn.disabled = true;
                playSound(clickSound);
                advanceToNextQuestion();
            }
        });
    }
}

