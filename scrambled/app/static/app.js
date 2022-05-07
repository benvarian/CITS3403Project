$(window).on('load', () => {

    const darkModebtn = document.getElementById("dark-mode")
    const hcmModebtn = document.getElementById("HCM-mode")
    const navBarColor = document.getElementById("navBar")
    const gearColor = document.getElementById("gearMode")
    const questionColor = document.getElementById("questionMode")
    const graphColor = document.getElementById("graphMode")
    const idcolorMode = document.getElementById("idMode")
    const xColor1 = document.getElementById("squareColor1")
    const xColor2 = document.getElementById("squareColor2")
    const xColor3 = document.getElementById("squareColor3")
    const xColor4 = document.getElementById("squareColor4")

    darkModebtn.addEventListener('click', function(){
        document.body.classList.toggle("dark-theme")
       
       
        if (navBarColor.classList.contains("bg-dark")) 
        {
            navBarColor.classList.remove("bg-dark")
            navBarColor.classList.add("bg-light")
            gearColor.classList.remove("gear-dark")
            gearColor.classList.add("gear-light")
            questionColor.classList.remove("question-dark")
            questionColor.classList.add("question-light")
            graphColor.classList.remove("graph-dark")
            graphColor.classList.add("graph-light")
            idcolorMode.classList.remove("id-dark")
            idcolorMode.classList.add("id-light")
            xColor1.classList.remove("squareColor-dark")
            xColor1.classList.add("squareColor-light") 
            xColor2.classList.remove("squareColor-dark")
            xColor2.classList.add("squareColor-light") 
            xColor3.classList.remove("squareColor-dark")
            xColor3.classList.add("squareColor-light") 
            xColor4.classList.remove("squareColor-dark")
            xColor4.classList.add("squareColor-light")

        } else if (navBarColor.classList.contains("bg-light")) 
        {
            navBarColor.classList.remove("bg-light")
            navBarColor.classList.add("bg-dark")
            gearColor.classList.remove("gear-light")
            gearColor.classList.add("gear-dark")
            questionColor.classList.remove("question-light")
            questionColor.classList.add("question-dark")
            graphColor.classList.remove("graph-light")
            graphColor.classList.add("graph-dark")
            idcolorMode.classList.remove("id-light")
            idcolorMode.classList.add("id-dark")
            xColor1.classList.remove("squareColor-light")
            xColor1.classList.add("squareColor-dark")
            xColor2.classList.remove("squareColor-light")
            xColor2.classList.add("squareColor-dark")
            xColor3.classList.remove("squareColor-light")
            xColor3.classList.add("squareColor-dark")
            xColor4.classList.remove("squareColor-light")
            xColor4.classList.add("squareColor-dark")
        }
        
       
    })
    })
    
    hcmModebtn.addEventListener('click', function(){
        document.body.classList.toggle("high-contrast")
        
    })

    var rowNum;
var colNum;

function init() {
    rowNum = 0;
    colNum = 0;
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

    for(let k = 0; k < 7; k++) {
        let letter = document.createElement("td");
        letter.innerHTML = "A<sub>1</sub>";
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
}

function clickedLetter(letter) {
    if(colNum < 7) {
        let guessBoxID = "G" + colNum;
        let guessBox = document.getElementById(guessBoxID);
        if(letter.className == "clickedLetter") {

        }
        else {
            guessBox.innerHTML = letter.innerHTML;
            letter.className="clickedLetter";
            colNum++;
        }
    }
    else {
       //alert
    }
}

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
    colNum = 0;
}

function submitWord() {
    if(colNum < 3) {
        //ALERT LESS THAN 3 Letter word
    }
    else {
        
    }
    var guess = "";
    for(let k = 0; k < colNum; k++) {
        let letterID =  "L" + k;
        document.getElementById(letterID).className = "letter";
        let id = String(rowNum) + String(k);
        let letter = document.getElementById(id).innerText;
        guess += letter;
    }
    console.log(guess);
    // Check guess
    // if positive
    // for
    rowNum++;
    colNum = 0;
}
  
function openRules() {
    var rulesModal = new bootstrap.Modal(
        document.getElementById("rulesModal"),
        {}
      );
      rulesModal.toggle();
}

function startTimer() {
    var minutesLabel = document.getElementById("minutes");
    var secondsLabel = document.getElementById("seconds");
    var totalSeconds = 0;
    setInterval(setTime, 1000);

    function setTime() {
      ++totalSeconds;
      secondsLabel.innerHTML = pad(totalSeconds % 60);
      minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
    }

    function pad(val) {
      var valString = val + "";
      if (valString.length < 2) {
        return "0" + valString;
      } else {
        return valString;
      }
    }
  }