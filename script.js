"use strict";
const words = [
  {
    en: "cat",
    rus: "кот",
    example: "The cat chased the mouse"
  },
  {
    en: "dress",
    rus: "платье",
    example: "This black dress is very elegant"
  },
  {
    en: "forest",
    rus: "лес",
    example: "The children played in the forest"
  },
  {
    en: "beauty",
    rus: "красота",
    example: "The beauty of the sunset was breathtaking"
  },
  {
    en: "love",
    rus: "любовь",
    example: "There's magic to love!"
  },
  {
    en: "house",
    rus: "дом",
    example: "Our house is on the corner of the street"
  },
  {
    en: "game",
    rus: "игра",
    example: "The football game was exciting"
  },
  {
    en: "music",
    rus: "музыка",
    example: "He composed the music for the film"
  },
  {
    en: "orange",
    rus: "апельсин",
    example: "She sliced an orange for breakfast"
  },
  {
    en: "son",
    rus: "сын",
    example: "He is very proud of his son"
  }
]

let currentState = [...words];

const cardFront = document.querySelector("#card-front h1");
const cardBack = document.querySelector("#card-back h1");
const cardBackExample = document.querySelector("#card-back span");
const btnNext = document.querySelector("#next");
const btnBack = document.querySelector("#back");
const card = document.querySelector(".flip-card");
const randomWordBtn = document.querySelector("#shuffle-words");
const progressSliderStudy = document.querySelector("#words-progress");
const currentWord = document.querySelector("#current-word");
const totalWords = document.querySelector("#total-word");
const examBtn = document.querySelector("#exam");
const container = document.querySelector("#exam-cards");
const btnNavigation = document.querySelector(".slider-controls");
const studyMode = document.querySelector("#study-mode");
const examMode = document.querySelector("#exam-mode");
const progressSliderExam = document.querySelector("#exam-progress");
const percentageAnsweredCorrectly = document.querySelector("#correct-percent")
const timer = document.querySelector("#time");

let currentIndex = 0;
let matchedPairs = 0;
let amountAttempts = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

class StudyTimer {
  constructor(displaySelector) {
  this._timerId = null;
  this._totalSeconds = 0;
  this._displayElement = document.querySelector(displaySelector);
}

start() {
  this.stop();
  this._totalSeconds = 0;
  this._updateTimer();
  this._timerId = setInterval(() => {
    this._totalSeconds++;
    this._updateTimer();
  }, 1000);
}

stop() {
  clearInterval(this._timerId);
  this._timerId = null;
}

get formattedTime() {
  return this._displayElement.textContent;
}

_updateTimer() {
  let minutes = Math.floor(this._totalSeconds / 60);
  let seconds = this._totalSeconds % 60;

  minutes = String(minutes).padStart(2, '0');
  seconds = String(seconds).padStart(2, '0');

  this._displayElement.textContent = `${minutes}:${seconds}`;
}
}

const examTimer = new StudyTimer("#time");

function renderCard(index) {
  const word = currentState[index];

  cardFront.textContent = word.en;
  cardBack.textContent = word.rus;
  cardBackExample.textContent = word.example;

  currentWord.textContent = index + 1;
  totalWords.textContent = currentState.length;

  const percentage = ((index + 1) / currentState.length) * 100;
  progressSliderStudy.value = percentage;

  btnBack.disabled = index === 0;
  btnNext.disabled = index === currentState.length - 1;

  card.classList.remove('active');
}

function renderAllCards() {
  container.innerHTML = "";

  let examItems = [];

  currentState.forEach(word => {
    examItems.push({ text: word.en, id: word.en });
    examItems.push({ text: word.rus, id: word.en });
  })

  shuffle(examItems);

  examItems.forEach(item => {
    const miniCard = document.createElement("div");
    miniCard.textContent = item.text;
    miniCard.classList.add("card");
    miniCard.dataset.wordId = item.id;
    container.append(miniCard);
  })
}

let firstChosenCard = null;

function handleExamCard(event) {
  const clickedCard = event.target.closest(".card");

  if (clickedCard === firstChosenCard || clickedCard.classList.contains("fade-out")) {
    return;
  }

  if (!firstChosenCard) {
    firstChosenCard = clickedCard;
    firstChosenCard.classList.add("correct");
  } else {
    amountAttempts++;

    const secondChosenCard = clickedCard;

    if (secondChosenCard.dataset.wordId === firstChosenCard.dataset.wordId) {
      secondChosenCard.classList.add("correct");

      matchedPairs++;

      const firstCard = firstChosenCard;
      const secondCard = secondChosenCard;
      setTimeout(() => {
        firstCard.classList.add("fade-out");
        secondCard.classList.add("fade-out");
      }, 300);
    } else {
      secondChosenCard.classList.add("wrong");

      const firstCard = firstChosenCard;
      const secondCard = secondChosenCard;
      setTimeout(() => {
        firstCard.classList.remove("correct");
        secondCard.classList.remove("wrong");
      }, 500);
    }

    updateStats();

    showResults();

    firstChosenCard = null;
  }
}

function updateStats() {
  const percentProgress = Math.round((matchedPairs / currentState.length) * 100);
  progressSliderExam.value = percentProgress;

  const accuracyPercent = amountAttempts > 0 ? Math.round((matchedPairs / amountAttempts) * 100) : 100;
  percentageAnsweredCorrectly.textContent = `${accuracyPercent}%`;
}

function showResults() {
  if (matchedPairs === currentState.length) {
    examTimer.stop();
    setTimeout(() => {
      alert(`Поздравляем! Режим проверки знаний окончен. Вы нашли все пары за: ${examTimer.formattedTime}. 
        Ваша эффективность: ${percentageAnsweredCorrectly.textContent}.`);
    }, 1000);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  renderCard(currentIndex);

  container.addEventListener("click", handleExamCard);

  card.addEventListener('click', function () {
    card.classList.toggle('active');
  });

  btnNext.addEventListener("click", function () {
    if (currentIndex < currentState.length - 1) {
      currentIndex++;
      renderCard(currentIndex);
    }
  });

  btnBack.addEventListener("click", function () {
    if (currentIndex > 0) {
      currentIndex--;
      renderCard(currentIndex);
    }
  });

  randomWordBtn.addEventListener("click", function () {
    shuffle(currentState);
    currentIndex = 0;
    renderCard(currentIndex);
  });

  examBtn.addEventListener("click", function () {
    card.classList.add("hidden");
    btnNavigation.classList.add("hidden");
    studyMode.classList.add("hidden");
    examMode.classList.remove("hidden");

    matchedPairs = 0;
    amountAttempts = 0;
    updateStats();
    renderAllCards();
    examTimer.start();
  })
})