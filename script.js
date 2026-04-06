let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
const TIME_LIMIT = 15;

const startScreen    = document.getElementById('start-screen');
const startBtn       = document.getElementById('start-btn');
const categorySelect = document.getElementById('category-select');
const quizContainer  = document.getElementById('quiz-container');
const questionTextElement   = quizContainer.querySelector('.question-text');
const timerElement          = quizContainer.querySelector('.timer');
const optionsSection        = quizContainer.querySelector('.options-section');
const nextButton            = quizContainer.querySelector('.next-btn');
const questionNumberElement = quizContainer.querySelector('.question-number');
const progressFill          = quizContainer.querySelector('.progress-fill');

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

function startTimer() {
    let timeLeft = TIME_LIMIT;
    if (timerElement) {
        timerElement.textContent = `${timeLeft}s`;
        timerElement.classList.remove('warning');
    }

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timerElement) {
            timerElement.textContent = `${timeLeft}s`;
            if (timeLeft <= 5) {
                timerElement.classList.add('warning');
            }
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            advanceToNextQuestion();
        }
    }, 1000);
}

function advanceToNextQuestion() {
    if (quizContainer) quizContainer.classList.add('fade-out');
    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            const isNewRecord = saveHighScore(score);
            const highScore = getHighScore();
            if (quizContainer) quizContainer.classList.remove('fade-out');
            if (quizContainer) quizContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h2>Quiz Completed!</h2>
                    <p style="font-size: 24px; margin-top: 20px;">Your score: <strong>${score} / ${questions.length}</strong></p>
                    ${isNewRecord
                    ? `<p class="new-record-badge">🏆 New High Score!</p>`
                    : `<p class="high-score-display">🥇 Best: <strong>${highScore} / ${questions.length}</strong></p>`
                }
                    <button class="next-btn" style="margin-top: 30px;" onclick="location.reload()">Restart Quiz</button>
                </div>
            `;
        }
    }, 300);
}

// --- Start screen ---
startBtn.addEventListener('click', () => {
    const categoryId = categorySelect.value;
    startScreen.style.display = 'none';
    quizContainer.style.display = 'flex';
    fetchQuestions(categoryId);
});

async function fetchQuestions(categoryId = '') {
    questionTextElement.textContent = 'Loading questions...';
    optionsSection.innerHTML = '';
    nextButton.style.display = 'block';
    nextButton.disabled = true;

    let url = 'https://opentdb.com/api.php?amount=10&type=multiple';
    if (categoryId) url += `&category=${categoryId}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

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
        questionTextElement.textContent = 'Failed to load questions. Please refresh the page.';
    }
}

function renderQuestion() {
    if (questions.length === 0) return;

    if (quizContainer) quizContainer.classList.remove('fade-out');
    clearInterval(timerInterval);
    optionsSection.classList.remove('answered');
    if (nextButton) {
        nextButton.style.display = 'block';
        nextButton.disabled = true;
    }

    const currentQuestion = questions[currentQuestionIndex];

    if (questionNumberElement) questionNumberElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    if (progressFill) progressFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;

    startTimer();

    questionTextElement.innerHTML = currentQuestion.question;

    optionsSection.innerHTML = '';

    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.innerHTML = option;

        button.addEventListener('click', () => {
            if (optionsSection.classList.contains('answered')) return;
            optionsSection.classList.add('answered');
            clearInterval(timerInterval);
            if (nextButton) nextButton.disabled = false;

            const isCorrect = option === currentQuestion.correctAnswer;
            if (isCorrect) score++;

            const allOptions = document.querySelectorAll('.option-btn');
            allOptions.forEach(btn => {
                btn.disabled = true;
                if (btn.innerHTML === currentQuestion.correctAnswer) {
                    btn.classList.add('correct');
                } else if (btn === button && !isCorrect) {
                    btn.classList.add('incorrect');
                }
            });
        });

        optionsSection.appendChild(button);
    });
}

if (nextButton) {
    nextButton.addEventListener('click', () => {
        if (!nextButton.disabled) {
            advanceToNextQuestion();
        }
    });
}


