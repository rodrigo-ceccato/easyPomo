let pomoCount = 0;

// configuration values, in seconds
let longRestTime = 15 * 60;
let shortRestTime = 5 * 60;
let focusTime = 25 * 60;
let pomosBeforeLongRest = 4;
let currTime = 0;

let isCounting = false;
let isResting = false;

displayTimer(0);
var alertAudio = new Audio('sfx/bell.mp3');


function startOrResume() {
    isCounting = true;
}

function pausePomo() {
    isCounting = false;
}

function stopPomo() {
    if (!isCounting) {
        pomoCount = 0;
        currTime = 0;
        displayTimer(currTime)
    }
}

var timeCounter = setInterval(function() {
    if (isCounting) {
        currTime = currTime + 1;

        if (isResting) {
            // check if is on long rest
            if (pomoCount != 0 && (pomoCount % pomosBeforeLongRest == 0)) {
                if (currTime >= longRestTime) {
                    currTime = 0;
                    isResting = false;
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
                alertAudio.play();
            }

        }

        displayTimer(currTime)
    }
}, 10);


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
        timeValueString = secondsToString(shortRestTime-timeValue);
        infoText = "Resting"
        progressBar.style.backgroundColor = '#8FBC8F';
        progress = 100 - (timeValue / shortRestTime) * 100;

    }
    let formatedProgress = "" + progress + "%"
    progressBar.style.width = formatedProgress;

    
    document.getElementById("infoText").innerHTML = infoText;
    document.getElementById("timeDisplay").innerHTML = timeValueString;

}