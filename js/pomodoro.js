let pomoCount = 0;

// configuration values, in seconds
let longRestTime = 15 * 60;
let shortRestTime = 5 * 60;
let focusTime = 25 * 60;
let pomosBeforeLongRest = 4;
let currTime = 0;

// status variables
let isLongResting = false;
let isCounting = false;
let isResting = false;


displayTimer(0);
resetButtonElem = document.getElementById("resetButton");
var alertAudio = new Audio('sfx/bell.mp3');


function startOrResume() {
    isCounting = true;
    resetButtonElem.disabled = true;
}

function pausePomo() {
    isCounting = false;
    resetButtonElem.disabled = false;
}

function resetPomo() {
    if (!isCounting) {
        pomoCount = 0;
        currTime = 0;
        displayTimer(currTime)
    }
}

function togglePause(){
    if (isCounting) {
        pausePomo();
    } else {
        startOrResume();
    }
}

// catpure space bar to pause
document.body.onkeyup = function(e){
    if(e.keyCode == 32 || e.key === 'Spacebar' || e.key === ' '){
        togglePause();
    }
}

var timeCounter = setInterval(function() {
    if (isCounting) {
        currTime = currTime + 1;

        if (isResting) {
            // check if is on long rest
            if (pomoCount != 0 && isLongResting) {
                if (currTime >= longRestTime) {
                    currTime = 0;
                    isResting = false;
                    isLongResting = false;
                    pomoCount = 0;
                    alertAudio.play();
                }
            } else { // if on short rest
                if (currTime >= shortRestTime) {
                    currTime = 0;
                    isResting = false;
                    alertAudio.play();
                }
            }

        } else { // if not on res
            if (currTime >= focusTime) {
                currTime = 0;
                isResting = true;
                pomoCount = pomoCount + 1;

                if (pomoCount % pomosBeforeLongRest == 0) {
                    isLongResting = true;
                }
                alertAudio.play();
            }

        }

        displayTimer(currTime)
    }
}, 1000);


function secondsToString(timeValue) {
    let minutes = Math.floor(timeValue / 60);
    let seconds = timeValue - minutes * 60;

    let minString = "" + minutes;
    let secString = "" + seconds;

    if (minutes < 10) {
        minString = "0" + minString;
    }

    if (secString < 10) {
        secString = "0" + secString;
    }

    let timeValueString = minString + ":" + secString;

    return timeValueString;
}

function displayTimer(timeValue) {
    let infoText = ""

    // update progress bar
    let progress = 0;
    let progressBar = document.getElementById("progressbarstatus")
    if (!isResting) {
        timeValueString = secondsToString(timeValue);
        infoText = "On pomo: " + (pomoCount+1) + " | " + pomosBeforeLongRest;
        progressBar.style.backgroundColor = '#696969';
        progress = (timeValue / focusTime) * 100;
    } else {
        if (isLongResting) {
            timeValueString = secondsToString(longRestTime-timeValue)
            progress = 100 - (timeValue / longRestTime) * 100;
        } else {
            timeValueString = secondsToString(shortRestTime-timeValue);
            progress = 100 - (timeValue / shortRestTime) * 100;
        }
        infoText = "Resting"
        progressBar.style.backgroundColor = '#8FBC8F';

    }
    let formatedProgress = "" + progress + "%"
    progressBar.style.width = formatedProgress;


    document.getElementById("infoText").innerHTML = infoText;
    document.getElementById("timeDisplay").innerHTML = timeValueString;

}
