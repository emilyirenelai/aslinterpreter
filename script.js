// Open up your console - if everything loaded properly you should see the version number 
// corresponding to the latest version of ml5 printed to the console and in the p5.js canvas.
console.log('ml5 version:', ml5.version);
let imageA;
let capture;
let mobilenet;
let classifier;
let label = 'test';
let aButton;
let bButton;
let trainButton;
let printString = '_';
let overallText = '';
let startTranscribe = false;
let lastNCount;
let lastChar;
let lastNResults = [];
let speakButton;

//Delete/clear button
let deleteButton;
let clearButton;
//Pause/play button
let pauseButton;
let playButton;


function modelReady() {
  console.log('Model is ready!!!');
  classifier = mobilenet.classification(capture, 30, videoReady);

}
function customModelReady() {
  console.log('Custom Model is ready!!!');
  label = 'model ready';
  classifier.classify(gotResults);
}


function videoReady() {
  console.log('Video is ready!!!');
  classifier.load('model.json', customModelReady);
}

function whileTraining(loss) {
  if (loss == null) {
    console.log('Training Complete');
    classifier.classify(gotResults);
  } else {
    console.log(loss);
  }
}

function gotResults(error, result) {
  if (error) {
    console.error(error);
  } else {
    // updated to work with newer version of ml5
    // label = result;
    label = result[0].label;
    //console.log(result[0].label);
    classifier.classify(gotResults);
  }
}

function preload() {
  capture = createCapture(VIDEO);
  capture.size(720, 460);
  capture.hide();
  mobilenet = ml5.featureExtractor('MobileNet', { numLabels: 30 }, modelReady);
}

function setup() {
  //imageA = loadImage('images/aslasign2.png');
  lastNCount = 0;
  createCanvas(720, 490);
  frameRate(60);

  speakButton = createButton('Text-To-Speech');
  speakButton.position(width + 675, 110);
  speakButton.mousePressed(speak);


  // Create delete, clear, pause, and play buttons
  deleteButton = createButton('Delete');
  deleteButton.position(width + 275, 110);
  deleteButton.mousePressed(deleteText);

  clearButton = createButton('Clear');
  clearButton.position(width + 475, 110);
  clearButton.mousePressed(clearText);

  playButton = createButton('Start Transcribing!');
  playButton.position(width - 240, 110);
  playButton.mousePressed(playText);

  pauseButton = createButton('Pause');
  pauseButton.position(width + 100, 110);
  pauseButton.mousePressed(pauseText);
 
}

function draw() {
  background(0);
  image(capture, 0, 0, 720, 460);
  fill(255);
  textSize(20);


  if (startTranscribe == false) {
    text('Press the Start Transcribing button to begin interpreting!', 10, height - 9);
  }
  if (startTranscribe == true) {
    if (label != 'test') {
      lastNCount++;
      if (lastNCount != 180) { // framerate of 60: 3 seconds to determine current sign before moving on
        lastNResults.push(label);
      }
      if (lastNCount == 180) {
        lastNCount = 0;
        printString = printString.slice(0, printString.length - 1);
        printString = printString + findFrequentResult(lastNResults);
        printString = printString + "_";
        lastChar = findFrequentResult(lastNResults);

        lastNResults = [];
        if (printString.length == 29) {
          printString = "-" + lastChar;
        }
      }
      // once printResult gets to a certain amount of letters, clear and restart line

      text(printString, 10, height - 9);
    }
  }
  //console.log(label);
}


function keyPressed() {

  //if the key is a s
  if (key == 's') {
    //save out to a file
    save('my-great-asl.png');
  }
} // modify this slightly so maybe a button instead + add save to text file feature



function speak() {
  message = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  message.voice = voices[10];
  message.volume = 1; // From 0 to 1
  message.rate = 1; // From 0.1 to 10
  message.pitch = 1; // From 0 to 2
  message.lang = "en";
  message.text = `EMILY`;
  //message.text = `${printString}`;
  speechSynthesis.speak(message);
}


function deleteText() {
  // functions as a backspace button, only works for deleting letters on the current line
  if (lastNCount != 0) {
    lastNCount--;
    printString = printString.substring(0, printString.length - 2);
    printString = printString + "_";
    text(printString, 10, height - 10);
  }
}

function clearText() {
  // clears all text from current line
  lastNCount = 0;
  printString = "";
  text(printString, 10, height - 10);
}

function playText() {
  // continue to loop through draw()
  startTranscribe = true;
  loop();
}

function pauseText() {
  // stop looping through draw()
  noLoop();
}


function findFrequentResult(arrayOfLetters) {
  // Place to store our findings
  // keys = letters
  // value = count of the corresponding letter.
  let mapOfLetterCounts = new Map();
  let count = 0;

  // For every letter in the array
  for (letter of arrayOfLetters) {
    count++;
    if (mapOfLetterCounts.has(letter)) {
      // If the letter is already in the map
      // Get its value and increment by 1, then replace it.
      if (count < arrayOfLetters.length / 2) {
        mapOfLetterCounts.set(letter, mapOfLetterCounts.get(letter) + 1);
      }
      if (count >= arrayOfLetters.length / 2) {
        mapOfLetterCounts.set(letter, mapOfLetterCounts.get(letter) + 2);
      }
    } else {
      // If the letter is not in the mapp, add it with a value of 1.
      mapOfLetterCounts.set(letter, 1);
    }
  } /// Weighting more towards the end of the array?

  // forEach((value, key) => {//function that uses value and key});
  // key is the letter
  // value is the count of letter

  let letterHavingHighestCount;
  let highestCount = 0;
  mapOfLetterCounts.forEach((count, letter) => {
    if (count > highestCount) {
      highestCount = count;
      letterHavingHighestCount = letter;
    }
  });
  return letterHavingHighestCount;
  // By now, you should have the letterHavingHighestCount filled in.

  // Technically, we could've counted as we were building the map instead of looping through the map once it has been built, but it results in the same output :)
}
