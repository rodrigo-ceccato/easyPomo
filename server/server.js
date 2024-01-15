const express = require("express");
const cors = require("cors");
const app = express();

const PORT = 35123;

app.use(cors());

// Define a sample JSON object
const sampleJson = {
  message: "Hello, this is a simple JSON response!",
  pomosBeforeLongRest: 4,
  currTime: 15,
  pomoCount: 1,
  isResting: false,
  isLongResting: false,
  timestamp: new Date().toISOString(),
};

// Define a route that serves the JSON
app.get("/json-endpoint", cors(), (req, res) => {
  res.json(sampleJson);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
