const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('lds-hourglass');
const game = document.getElementById('game');
const passMessage = document.getElementById('passMessage');
const failMessage = document.getElementById('failMessage');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let questions = [];
let possibleQuestions
let answerToQuestion;
let smileyPass = "&#128526;"
let smileyFail = "&#128533;"

fetch("https://opentdb.com/api.php?amount=10&category=26&difficulty=easy&type=multiple"
)
.then(res => {
    return res.json();
})
.then(loadedQuestions => {
    possibleQuestions = loadedQuestions.results
    questions = loadedQuestions.results.map(loadedQuestion => {
        const formattedQuestion = {
            question: loadedQuestion.question
        };

        const answerChoices = [...loadedQuestion.incorrect_answers];
        formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
        answerChoices.splice(
            formattedQuestion.answer - 1, 
            0, 
            loadedQuestion.correct_answer
        );

        answerChoices.forEach((choice, index) => {
            formattedQuestion["choice" + (index + 1)] = choice
        })

        return formattedQuestion;
    });
   
   console.log(questions) 
    startGame();
})
.catch(err => {
    console.log(err)
})



const CORRECT_BONUS = 10;
const MAX_QUESTION = 3;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    getNewQuestion();
    game.classList.remove('hidden')
    loader.style.display = 'none';
}

//get question function

getNewQuestion = () => {

    //if there are no question left in the array/ we have used up all the quwestions
    if(availableQuestions.length === 0 || questionCounter >= MAX_QUESTION){
        localStorage.setItem('mostRecentScore', score)
        //go to the end of the page
        return window.location.assign('/end.html')
    }
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTION}`;
   
   

    //Update progress Bar in %
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTION) * 100}%`; //to get percentage

    const questionIndex =  Math.floor(Math.random() * availableQuestions.length)
   
    currentQuestion = availableQuestions[questionIndex];
   
    
    question.innerText = currentQuestion.question;

    //loop through the choices and display each in the choices segment
    choices.forEach( choice => {
        const number = choice.dataset["number"];
        choice.innerText = currentQuestion["choice" + number]
    });

    //splice the currently viewed question
    availableQuestions.splice(questionIndex, 1)
    
    acceptingAnswers = true
}


//event listener for each selected choice of answer
choices.forEach(choice => {
    choice.addEventListener('click', (e) => {
        if(!acceptingAnswers) return

        acceptingAnswers = false
        const selectedChoice = e.target
        const selectedAnswer = selectedChoice.dataset["number"];

        const classToApply = selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';
        if(classToApply === 'correct'){
            incrementScore(CORRECT_BONUS)
            passMessage.innerText = `Correct!!!! nice try that was awesome `;
        }else{
            possibleQuestions.forEach((q) => {
                if(q.question === currentQuestion.question){
                    answerToQuestion = q.correct_answer
                }
            })
            failMessage.innerText = `Oops!!! wrong answer correct answer is ${answerToQuestion}`;    
        }

        selectedChoice.parentElement.classList.add(classToApply);

        //remove classToApply and empty success/failure message
        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            passMessage.innerText = ''
            failMessage.innerText = ''
            getNewQuestion();
        }, 2000)

        
    });
});



incrementScore = num => {
    score += num;
    scoreText.innerText = score
};

