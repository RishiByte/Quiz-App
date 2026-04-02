let questions = [];
let currentQuestionIndex = 0;
let score = 0;

const questionTextElement = document.querySelector('.question-text');
const optionsSection = document.querySelector('.options-section');
const nextButton = document.querySelector('.next-btn');
const questionNumberElement = document.querySelector('.question-number');
const progressFill = document.querySelector('.progress-fill');

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

async function fetchQuestions() {
    questionTextElement.textContent = "Loading questions...";
    optionsSection.innerHTML = '';
    
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
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
        console.error("Error fetching questions:", error);
        questionTextElement.textContent = "Failed to load questions. Please refresh the page.";
    }
}

function renderQuestion() {
    if (questions.length === 0) return;

    const currentQuestion = questions[currentQuestionIndex];
    
    questionNumberElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    progressFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    
    questionTextElement.innerHTML = currentQuestion.question;
    
    optionsSection.innerHTML = '';
    
    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.innerHTML = option;
        
        button.addEventListener('click', () => {
            if (optionsSection.classList.contains('answered')) return;
            optionsSection.classList.add('answered');
            
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
            
            setTimeout(() => {
                optionsSection.classList.remove('answered');
                if (currentQuestionIndex < questions.length - 1) {
                    currentQuestionIndex++;
                    renderQuestion();
                } else {
                    const quizContainer = document.querySelector('.quiz-container');
                    quizContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px;">
                            <h2>Quiz Completed!</h2>
                            <p style="font-size: 24px; margin-top: 20px;">Your score: <strong>${score} / ${questions.length}</strong></p>
                            <button class="next-btn" style="margin-top: 30px;" onclick="location.reload()">Restart Quiz</button>
                        </div>
                    `;
                }
            }, 1000);
        });
        
        optionsSection.appendChild(button);
    });
    
    nextButton.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', fetchQuestions);
