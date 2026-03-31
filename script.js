let questions = [];
let index = 0;
let score = 0;
let answered = false;

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const scoreEl = document.getElementById("score");

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

async function getQuestions() {
  const res = await fetch("https://opentdb.com/api.php?amount=5&category=18&difficulty=easy&type=multiple");
  const data = await res.json();
  questions = data.results;
  showQuestion();
}
function showQuestion() {
  answered = false;
  nextBtn.style.display = "none";

  const q = questions[index];

  questionEl.innerHTML = decodeHTML(q.question);
  answersEl.innerHTML = "";

  let options = [...q.incorrect_answers, q.correct_answer];
  options.sort(() => Math.random() - 0.5);

  options.forEach(option => {
    const btn = document.createElement("button");
    btn.classList.add("answer");
    btn.innerHTML = decodeHTML(option);

    btn.onclick = () => selectAnswer(btn, option, q.correct_answer);

    answersEl.appendChild(btn);
  });
}

function selectAnswer(button, selected, correct) {
  if (answered) return;

  answered = true;
  nextBtn.style.display = "block";

  const buttons = document.querySelectorAll(".answer");

  buttons.forEach(btn => {
    if (decodeHTML(btn.innerHTML) === decodeHTML(correct)) {
      btn.classList.add("correct");
    }
  });

  if (selected === correct) {
    score++;
    button.classList.add("correct");
  } else {
    button.classList.add("wrong");
  }
}

nextBtn.onclick = () => {
  index++;

  if (index < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
};

function showScore() {
  questionEl.innerHTML = "Quiz Completed!";
  answersEl.innerHTML = "";
  nextBtn.style.display = "none";
  scoreEl.innerHTML = `Score: ${score}/${questions.length}`;
}

getQuestions();