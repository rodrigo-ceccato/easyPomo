const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path")
const app = express();

const PORT = 35123;

// Object to store IP addresses and timestamps
const ipAddresses = {};

// Function to track IP addresses and timestamps
const trackIP = (req) => {
  const ip = (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress;
  ipAddresses[ip] = Date.now();
};


app.use(cors());
app.use(bodyParser.json());

// Pomodoro logic
let isCounting = true;
let timeAccumulator = 0;
let prevIterTS = Date.now();
let pollInterval = 500;
let pomosBeforeLongRest = 4;
let currTime = 0;
let pomoCount = 0;
let isResting = false;
let isLongResting = false;
let focusTime = 25 * 60;
let shortRestTime = 5 * 60;
let longRestTime = 15 * 60;

// Serve the configuration page
app.get("/config", (req, res) => {
  res.sendFile(__dirname + "/config.html");
});

// Handle configuration data
app.post("/save-config", (req, res) => {
  // update server state with req.body, cast to int
  pomosBeforeLongRest = Number(req.body.pomosBeforeLongRest);
  currTime = Number(req.body.currTime);
  pomoCount = Number(req.body.pomoCount);
  isResting = req.body.isResting == "true";
  isLongResting = req.body.isLongResting == "true";
  shortRestTime = Number(req.body.shortRestTime);
  longRestTime = Number(req.body.longRestTime);


  // Save the configuration data as needed (replace this with your logic)
  // For demonstration purposes, we'll just log the received data
  console.log("Received configuration data");
  console.log(req.body);

  // Send a response (you can customize this based on your needs)
  res.json({ success: true, message: "Configuration saved successfully" });
});

var timeCounter = setInterval(function () {
  //console.log("Computing step, currTime = " + currTime);
  let iterStartTS = Date.now();
  if (isCounting) {
    timeAccumulator += iterStartTS - prevIterTS;
    let lostSeconds = Math.floor(timeAccumulator / 1000);
    for (i = 0; i < lostSeconds; i++) {
      currTime = currTime + 1;
      advanceTimeStep();
      timeAccumulator -= 1000;
    }
  }

  prevIterTS = Date.now();
}, pollInterval);

function advanceTimeStep() {
  if (isResting) {
    // check if is on long rest
    if (pomoCount != 0 && isLongResting) {
      if (currTime >= longRestTime) {
        currTime = 0;
        isResting = false;
        isLongResting = false;
        pomoCount = 0;
      }
    } else {
      // if on short rest
      if (currTime >= shortRestTime) {
        currTime = 0;
        isResting = false;
      }
    }
  } else {
    // if not on res
    if (currTime >= focusTime) {
      currTime = 0;
      isResting = true;
      pomoCount = pomoCount + 1;

      if (pomoCount % pomosBeforeLongRest == 0) {
        isLongResting = true;
      }
    }
  }
}

// Define a sample JSON object
getPomoStateJSON = () => {
  return {
    message: "JSON response!",
    pomosBeforeLongRest: pomosBeforeLongRest,
    currTime: currTime,
    pomoCount: pomoCount,
    isResting: isResting,
    isLongResting: isLongResting,
    focusTime: focusTime,
    shortRestTime: shortRestTime,
    longRestTime: longRestTime,
    timestamp: new Date().toISOString(),
  };
};

// Define a route that serves the JSON
app.get("/json-endpoint", cors(), (req, res) => {
  trackIP(req); // Track IP
  res.json(getPomoStateJSON());
});

// Endpoint to display the number of online users
app.get('/online-users', (req, res) => {
  // Call the function to count unique IPs in the last 5 seconds
  const onlineUsersCount = countUniqueIPsInLast5Seconds();

  // Respond to the request with the online users count
  res.send(`Number of online users in the last 5 seconds: ${onlineUsersCount}`);
});

// Function to count unique IPs in the last 5 seconds
const countUniqueIPsInLast5Seconds = () => {
  const currentTime = Date.now();
  const threshold = currentTime - 5000; // 5 seconds ago

  const uniqueIPs = Object.keys(ipAddresses).filter(
    (ip) => ipAddresses[ip] >= threshold
  );

  console.log('Number of unique IPs in the last 5 seconds:', uniqueIPs.length);

  return uniqueIPs.length;
};

// Start index.html server to avoid mixed content error
app.use(express.static(path.join(__dirname, '.')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname));
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server IP:${PORT}/config for configuration`);
  console.log(`Server IP:${PORT}/ for usage`);
});
