
// function darkMode(theme) {
//     const navBarColor = document.getElementById("navBar");
//     const gearColor = document.getElementById("gearMode");
//     const questionColor = document.getElementById("questionMode");
//     const idcolorMode = document.getElementById("idMode");
//     const xColor1 = document.getElementById("squareColor1");
//     const xColor2 = document.getElementById("squareColor2");
//     const xColor3 = document.getElementById("squareColor3");
//     const xColor4 = document.getElementById("squareColor4");

//     console.log(theme);
//     if (theme == "light") {
//         document.body.classList.toggle("dark-theme");
//         navBarColor.classList.remove("bg-dark");
//         navBarColor.classList.add("bg-light");
//         gearColor.classList.remove("gear-dark");
//         gearColor.classList.add("gear-light");
//         questionColor.classList.remove("question-dark");
//         questionColor.classList.add("question-light");
//         idcolorMode.classList.remove("id-dark");
//         idcolorMode.classList.add("id-light");
//         xColor1.classList.remove("squareColor-dark");
//         xColor2.classList.remove("squareColor-dark");
//         xColor2.classList.add("squareColor-light");
//         // xColor3.classList.remove("squareColor-dark");
//         // xColor3.classList.add("squareColor-light");
//         xColor4.classList.remove("squareColor-dark");
//         xColor4.classList.add("squareColor-light");
//         localStorage.setItem("theme", "light");
//         console.log(localStorage.getItem("theme"));
//     } 
//     else if(theme == "dark") {
//         navBarColor.classList.remove("bg-light");
//         navBarColor.classList.add("bg-dark");
//         gearColor.classList.remove("gear-light");
//         gearColor.classList.add("gear-dark");
//         questionColor.classList.remove("question-light");
//         questionColor.classList.add("question-dark");
//         idcolorMode.classList.remove("id-light");
//         idcolorMode.classList.add("id-dark");
//         xColor1.classList.remove("squareColor-light");
//         xColor1.classList.add("squareColor-dark");
//         xColor2.classList.remove("squareColor-light");
//         xColor2.classList.add("squareColor-dark");
//         xColor3.classList.remove("squareColor-light");
//         xColor3.classList.add("squareColor-dark");
//         xColor4.classList.remove("squareColor-light");
//         xColor4.classList.add("squareColor-dark");
//         localStorage.setItem("theme", "dark");
//     }
// }

// Normal Scrambled Functionality 
var rowNum;
var colNum;
var words;
var score;
var timeTaken;
var timer;

// To tell which mode it is currently on
var mode;

// Speed Scrambled functionality
var speedRowNum;
var speedColNum;
var speedWords;
var speedScore;
var speedTimeLeft;
var speedTimer;

//Initialisation 
//Initialises normal Scrambled, with global variables and creating guess, letter and submitted table
//Uses cookies to reload previous game state (words, score, time, etc) if played within the day 
function initNormal() {
    mode = "normal";
    document.getElementById("gameMode").setAttribute("href", "/speed");
    createSubmitTable();
    getLettersAndScores();
    score = 0
    updateScore(0);
    rowNum = 0;
    colNum = 0;
    words = [];
    timeTaken = 0;
    reloadPreviousGameState();
    timer = startTimer(timeTaken);
    if(rowNum == 6) {
        finishedGame();   
    }
} 


// Initialises speed mode
function initSpeed() {
    mode = "speed";
    document.getElementById("gameMode").setAttribute("href", "/index");
    createSubmitTable();
    getLettersAndScores();
    speedScore = 0;
    updateScore(0);
    speedRowNum = 0;
    speedColNum = 0;
    speedWords = [];
    speedTimeLeft = 120;
    reloadPreviousGameState();
    speedTimer = startTimer(speedTimeLeft);
    if(speedRowNum == 6 || speedTimeLeft <= 0) {
        finishedGame();
    }
}

// Function to reload previous game state (if user has played within the day)
// Global variables are reloaded from cookies 
// Previous words are loaded into game template
function reloadPreviousGameState() {
    if(mode == "speed") {
        if(getCookie("speedTimeLeft") != "") {
            speedTimeLeft = getCookie("speedTimeLeft");
            if(getCookie("speedRowNum") != "") {
                speedRowNum = getCookie("speedRowNum");
                loadPreviousWords();
                if(getCookie("speedScore") != "") {
                    updateScore(getCookie("speedScore"));
                }
            }
        }
    }
    else {
        if(getCookie("timeTaken") != "") {
            timeTaken = parseInt(getCookie('timeTaken'));
            if(getCookie("rowNum") != "") {
                rowNum = parseInt(getCookie("rowNum"));
                loadPreviousWords();
                if(getCookie("score") != "") {
                    updateScore(getCookie("score"));
                }
            }
        }
    }
}

// Helper function to load previous words from cookies
// Cookie words are stored as innerHTML of letters
function loadPreviousWords() {
    let prevWords;
    if(mode == "speed") {
        speedWords = getCookie("speedWords").split(",");
        prevWords = speedWords;
    }
    else {
        words = getCookie("words").split(",");
        prevWords = words;
    }
    for(let i = 0; i < prevWords.length; i++) {
        let prevWord = prevWords[i];
        let cookieWordLetters = prevWord.trim().split(" ");
        for(let k = 0; k < cookieWordLetters.length; k++) {
            let submittedBox = document.getElementById(String(i) + String(k));
            submittedBox.innerHTML = cookieWordLetters[k];
        }
    }
}

// Creates the table to for the submitted words
function createSubmitTable() {
    for(let i=0; i < 6; i++) {
        let submittedRow = document.createElement("tr");
        for(let j=0; j < 7; j++) {
            let submittedBox = document.createElement("td");
            submittedBox.setAttribute("id", String(i) + String(j));
            submittedBox.className = "submittedBox";
            submittedRow.appendChild(submittedBox);
        }
        $("#submittedTable").append(submittedRow);
    }
}

// Get letters for the day and creates letter array and guess array
function createWordAndGuessTable(letters) {
    for(let k = 0; k < 7; k++) {
        let letter = document.createElement("td");
        letter.innerHTML = letters[k][0] + "<sub>" + letters[k][1] + "</sub>";
        letter.className = "letter";
        letter.setAttribute("id",  "L" + k);
        letter.addEventListener("click", function() {
            clickedLetter(letter);
        })
        $("#letterRow").append(letter);

        let guessBox = document.createElement("td");
        guessBox.className = "guessBox";
        guessBox.setAttribute("id", "G" + k);
        $("#guess").append(guessBox);
    } 
    document.getElementById("submit").addEventListener("click", checkWord);
    document.getElementById("reset").addEventListener("click", resetWord);
}

// Ajax request for letters of the day for each mode 
function getLettersAndScores() {
    xhhtp = new XMLHttpRequest();
    xhhtp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            let result = JSON.parse(this.responseText);
            createWordAndGuessTable(result.letters);
        }
    }
    if(mode == "speed") {
        xhhtp.open("GET", "http://127.0.0.1:5000/letters/speed");
    }
    else {
        xhhtp.open("GET", "http://127.0.0.1:5000/letters/normal");
    }
    xhhtp.send();
}

// Game functionality functions
// Selects the letter 
function clickedLetter(letter) {
    let column;
    if(mode == "speed") {
        column = speedColNum;
    }
    else {
        column = colNum;
    }
    if(column < 7) {
        let guessBoxID = "G" + column;
        let guessBox = document.getElementById(guessBoxID);
        if(letter.className != "clickedLetter") {
            guessBox.innerHTML = letter.innerHTML;
            letter.className="clickedLetter";
            if(mode == "speed") {
                speedColNum++;
            }
            else {
                colNum++;
            }
        }
    }
}

// Reset word attempt
function resetWord() {
    for(let i = 0; i < 7; i++) {
        let guessBoxID = "G" + i;
        document.getElementById(guessBoxID).innerHTML = "";
    }
    for(let k = 0; k < 7; k++) {
        let letterID = "L" + k;
        let letter = document.getElementById(letterID)
        letter.className="letter";
    }
    if(mode == "speed") {
        speedColNum = 0;
    }
    else {
        colNum = 0;
    }
}

// Gets the word from attempt + warning if words less than 3 letters
function getWord(columns) {
    let word = "";
    let scoreIncrease = 0; 
    let cookieWord = ""
    for(let i = 0; i < columns; i++) {
        let guessBoxID =  "G" + i;
        let guessLetter = document.getElementById(guessBoxID);
        word += guessLetter.innerText.charAt(0);
        scoreIncrease += parseInt(guessLetter.innerText.charAt(1)); 
        cookieWord += guessLetter.innerHTML + " ";

    }
    return [word, scoreIncrease, cookieWord];
}

function checkWord() {
    let columns;
    let rows; 
    if(mode == "speed") {
        columns = speedColNum;
        rows = speedRowNum;
    }
    else {
        columns = colNum;
        rows = rowNum;
    }
    let word = getWord(columns)[0];
    let scoreIncrease = getWord(columns)[1];
    let cookieWord = getWord(columns)[2];
    xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            outcome = (JSON.parse(this.responseText)).outcome;
            checkedWordResponse(outcome, columns, rows, word, scoreIncrease, cookieWord);
        }
    }
    xhttp.open("GET", "http://127.0.0.1:5000/checkword?word=" + word, true)
    xhttp.send();
}

function checkedWordResponse(outcome, columns, rows, word, scoreIncrease, cookieWord) {
    if(outcome) {
        for(let k = 0; k < columns; k++) {
            let guessBoxID =  "G" + k;
            let guessLetter = document.getElementById(guessBoxID);
            let submittedID = String(rows) + String(k);
            let submittedLetter = document.getElementById(submittedID);
                submittedLetter.innerHTML = guessLetter.innerHTML;
        }

        if(mode == "speed") {
            speedWords[speedRowNum] = cookieWord;
            updateScore(scoreIncrease);
            speedRowNum++;
            createCookie("speedWords", speedWords);
            createCookie("speedRowNum", speedRowNum);
            createCookie("speedScore", speedScore);
            if(speedRowNum == 6) {
                finishedGame();
            }
        }
        else {
            words[rowNum] = cookieWord;
            updateScore(scoreIncrease);
            rowNum++;
            createCookie("words", words);
            createCookie("rowNum", rowNum);
            createCookie("score", score);
            if(rowNum == 6) {
                finishedGame();
            }
        }
        resetWord()
    }
    else {
        var wrongWord = new bootstrap.Modal(
            document.getElementById("wrongWord"),
            {}
          );
        wrongWord.toggle();
    }
}

// Finished game functionality for Normal Scrambled 
function finishedGame() {
    if(mode == "speed") {
        speedGameFinished = true;
        clearInterval(speedTimer);
        document.getElementById("finishedScore").innerText= speedScore;
        document.getElementById("submit").removeEventListener("click", checkWord);
        if(getCookie('speedGameFinished') == "") {
            submitScore();
            createCookie('speedGameFinished', true);
        }
    }
    else if(mode == "normal") {
        clearInterval(timer);
        let time = document.getElementById("minutes").innerText + ":" + document.getElementById("seconds").innerText;
        document.getElementById("finishedTime").innerText = time;
        document.getElementById("finishedScore").innerText= score;
        document.getElementById("submit").removeEventListener("click", checkWord);
        if(getCookie('gameFinished') == "") {
            submitScore();
            createCookie('gameFinished', true);
        }
    }

    var finishedGameModal = new bootstrap.Modal(
        document.getElementById("finishedGameModal"),
        {}
      );
      finishedGameModal.toggle();
}


function submitScore() {
    let xhttp = new XMLHttpRequest();
    let obj;
    if(mode == "speed") {
        obj = {'speedScore': speedScore};
    }
    else {
        obj = {'score':score, 'timeTaken':timeTaken};
    }
    submission = JSON.stringify(obj)
    xhttp.open("POST", "http://127.0.0.1:5000/submitscore/" + mode)
    xhttp.send(submission);
}

// Starts timer for Normal and Speed Scrambled 
function startTimer(time) {
    function pad(val) {
        var valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }
    let minutesLabel = document.getElementById("minutes");
    let secondsLabel = document.getElementById("seconds");
    secondsLabel.innerHTML = pad(time % 60);
    minutesLabel.innerHTML = parseInt(time / 60);

    let timer;
    if(mode == "normal") {
        timer = setInterval(normalTime, 1000);
    }
    else {
        timer = setInterval(speedTime, 1000);
    }
    
    function normalTime() {
      ++timeTaken;
      createCookie("timeTaken", timeTaken);
      secondsLabel.innerHTML = pad(timeTaken % 60);
      minutesLabel.innerHTML = parseInt(timeTaken / 60);
    }

    function speedTime() {
        speedTimeLeft--;
        createCookie("speedTimeLeft", speedTimeLeft);
        secondsLabel.innerHTML = pad(speedTimeLeft % 60);
        minutesLabel.innerHTML = parseInt(speedTimeLeft / 60);
        if(speedTimeLeft == 0) {
            finishedGame();
        }
    }
    return timer;
} 

// Updates score during game
function updateScore(update) {
    if(mode == "speed") {
        speedScore += parseInt(update);
        let scoreDisplay = document.getElementById("score")
        scoreDisplay.innerHTML = "<b>" + speedScore + "</b>";
    }
    else {
        score += parseInt(update);
        let scoreDisplay = document.getElementById("score")
        scoreDisplay.innerHTML = "<b>" + score + "</b>";
    }
}

// Cookie functions to create and get cookies 
// Creates cookies for page to store daily game progress
function createCookie(name, value) {
    var date = new Date();
    var midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    expires = "; expires=" + midnight.toGMTString();
    document.cookie =  name + "=" + value + expires;
}

// Gets the value of cookie with the specified name 
function getCookie(name) {
    let cname = name + "=";
    let cookieArray = document.cookie.split(';');
    for(let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) == " ") {
            cookie = cookie.substring(1);
        }
        if(cookie.indexOf(cname) == 0) {
            return cookie.substring(name.length + 1, cookie.length);
        }
    }
    return "";
}
