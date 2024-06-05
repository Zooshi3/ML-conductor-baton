let handpose;
let video;
let predictions = [];
let myOutput;
let volume = 80;

function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Initialize the handpose model
  handpose = ml5.handpose(video, modelReady);
  
  // MIDI
  WebMidi.enable()
    .then(onEnabled)
    .catch(function (err) {
      alert(err);
    });
}

function modelReady() {
  console.log("Model ready!");
  handpose.on('predict', results => {
    predictions = results;
  });
}

function onEnabled() {
  console.log('WebMIDI Enabled');

  WebMidi.inputs.forEach(function (input) {
    console.log('Input: ', input.manufacturer, input.name);
  });
  WebMidi.outputs.forEach(function (output) {
    console.log('Output: ', output.manufacturer, output.name);
  });

  myOutput = WebMidi.outputs[0];
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // Draw all the tracked hand points
  for (let i = 0; i < predictions.length; i++) {
    let hand = predictions[i];
    for (let j = 0; j < hand.landmarks.length; j++) {
      let keypoint = hand.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint[0], keypoint[1], 10);
    }

    // Check for specific gestures
    checkForGestures(hand);
  }
}

// Callback function for when handpose outputs data
function gotHands(results) {
  // Save the output to the hands variable
  predictions = results;
  console.log("Hands detected:", predictions);
}

// Function to check for specific gestures and send corresponding MIDI control changes
function checkForGestures(hand) {
  // Example gesture: Thumb up (check if thumb tip is above thumb base)
  let thumbTip = hand.landmarks[4];
  let pinkyTip = hand.annotations.pinky[3];
  
  let thumbBase = hand.landmarks[2];

  if (thumbTip[1] < thumbBase[1]) {
    // Thumb up gesture detected, toggle track 1
    //toggleTrack(1);
    console.log(typeof volume);

    volume = volume + 1;
    if (volume > 127) {
      volume = 127;
    }

  }

  // Add more gestures and track toggles as needed
}

// Function to toggle a track on/off
function toggleTrack(trackNumber) {
  // You can implement state management logic here if needed
  sendMidiControlChange(trackNumber, 10); // Send MIDI CC with value 127 for on
  // sendMidiControlChange(trackNumber, 0); // Uncomment if you need to toggle off
}

function sendMidiControlChange(ccNumber, ccValue) {
  if (myOutput) {
    myOutput.sendControlChange(ccNumber, ccValue); // Send CC number with value
    console.log('CC:', ccNumber, 'Value:', ccValue);
  }
}

