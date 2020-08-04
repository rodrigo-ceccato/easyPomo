let pomoCount = 0;

// load configuration from local storage
let saveData = JSON.parse(localStorage.saveData || null) || {};
console.log("Loaded saveData: ", saveData);

// configuration values, in seconds
let longRestTime = 15 * 60;
let shortRestTime = 5 * 60;
let focusTime = 25 * 60;
let pomosBeforeLongRest = 4;

// if defined, load saved configuration
console.log("Loading saved data...");
if('longRestTime' in saveData)
    longRestTime = saveData.longRestTime;
if('shortRestTime' in saveData)
    shortRestTime = saveData.shortRestTime;
if('focusTime' in saveData)
    focusTime = saveData.focusTime;
if('pomosBeforeLongRest' in saveData)
    pomosBeforeLongRest = saveData.pomosBeforeLongRest;

let currTime = 0;
const pollInterval = 300

// status variables
let isLongResting = false;
let isCounting = false;
let isResting = false;

// interface variables
let showSettings = false;
settingsPanel.style.display = "none";

displayTimer(0);

//buttons elements
resetButtonElem = document.getElementById("resetButton");
settiButtonElem = document.getElementById("settingsButton");
resumeButtonElem = document.getElementById("resumeButton");
pauseButtonElem = document.getElementById("pauseButton");

//configuration elements
settiPanelElem    = document.getElementById("settingsPanel");
formFocusTimeElem = document.getElementById("focusDuration");
formShortRestElem = document.getElementById("shortRest");
formLongRestElem  = document.getElementById("longRest");
formPomosBLRElem  = document.getElementById("pomosPerSession");

//set values on forms from saved settings
formFocusTimeElem.value = focusTime/60;
formShortRestElem.value = shortRestTime/60;
formLongRestElem.value  = longRestTime/60;
formPomosBLRElem.value  = pomosBeforeLongRest;

var alertAudio = new Audio('sfx/bell.mp3');

function testSound(){
    alertAudio.play();
}

function startOrResume() {
    isCounting = true;
    resetButtonElem.disabled = true;
    resumeButtonElem.disabled = true;
    pauseButtonElem.disabled = false;
    resumeButtonElem.style.display = "none";
}

function pausePomo() {
    isCounting = false;
    resetButtonElem.disabled = false;
    resumeButtonElem.disabled = false;
    pauseButtonElem.disabled = true;
    resumeButtonElem.style.display = "block";
    resumeButtonElem.innerHTML = "Resume";
}

function resetPomo() {
    if (!isCounting) {
        pomoCount = 0;
        currTime = 0;
        isResting = false;
        isLongResting = false;
        resumeButtonElem.innerHTML = "Start";
        displayTimer(currTime);
    }
}

function settingsChanged(){
    longRestTime = 60 * formLongRestElem.value;
    shortRestTime = 60 * formShortRestElem.value;
    focusTime = 60 * formFocusTimeElem.value;
    pomosBeforeLongRest = formPomosBLRElem.value;

    // save settings to local storage
    saveData.longRestTime = longRestTime;
    saveData.shortRestTime = shortRestTime;
    saveData.focusTime = focusTime;
    saveData.pomosBeforeLongRest = pomosBeforeLongRest;

    localStorage.saveData = JSON.stringify(saveData);
    console.log("Saving settings: ", saveData);

    // update displayed info
    displayTimer(currTime)
}

function togglePause(){
    if (isCounting) {
        pausePomo();
    } else {
        startOrResume();
    }
}

function toggleSettings(){
    if (showSettings) {
        settingsPanel.style.display = "none";
        showSettings = false;
    } else {
        settingsPanel.style.display = "block";
        showSettings = true;
    }
}

// catpure space bar to pause
document.body.onkeyup = function(e){
    if(e.keyCode == 32 || e.key === 'Spacebar' || e.key === ' '){
        togglePause();
    }
}

let timeAccumulator = 0;
let prevIterTS = Date.now();
var timeCounter = setInterval(function() {
    let iterStartTS = Date.now();
    if (isCounting) {
        timeAccumulator += iterStartTS - prevIterTS
        let lostSeconds = Math.floor(timeAccumulator/1000)
        for(i=0;i<lostSeconds;i++){
            currTime = currTime + 1;
            advanceTimeStep();
            timeAccumulator -= 1000;
        }
    }

    prevIterTS = Date.now();

}, pollInterval);

function advanceTimeStep(){
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
    if(isCounting) {
        document.title = timeValueString;
    } else {
        document.title = "EasyPomo";
    }

}
