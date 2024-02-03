let audioContext = null;
let analyser = null;
let dataArray = null;

const run = () => {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      dataArray = new Uint8Array(analyser.fftSize);
      console.log("Connected!");

      const track = audioContext.createMediaStreamSource(stream);
      track.connect(analyser);
    })
    .catch((err) => {
      if (err.name === "NotAllowedError") {
        console.log("You have denied access to your microphone.");
      } else if (err.name === "NotFoundError") {
        console.log("No microphone found.");
      }
    });
};

const updateGain = (e) => {
  gain = e.target.value / 100;
  console.log("Gain updated to: ", gain);
};

let voice = false;
const update = () => {
  if (analyser == null || dataArray == null) {
    console.log("Analyser not found!");
    return;
  }
  analyser.getByteFrequencyData(dataArray);
  const sum = dataArray.reduce((a, b) => a + b, 0);

  if (sum > 10000) {
    voice = true;
  } else {
    voice = false;
  }
};

setInterval(update, 100);

/* Face operations */

const eyesOpened = new Image();
eyesOpened.src = "./face/eyes_opened.png";
const eyesClosed = new Image();
eyesClosed.src = "./face/eyes_closed.png";
const mouthOpened = new Image();
mouthOpened.src = "./face/mouth_opened.png";
const mouthClosed = new Image();
mouthClosed.src = "./face/mouth_closed.png";
const nose = new Image();
nose.src = "./face/nose.png";

let openEyes = true;

const drawFace = () => {
  requestAnimationFrame(drawFace);
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const drawItem = (image) => {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  };

  if (openEyes) {
    drawItem(eyesOpened);
  } else {
    drawItem(eyesClosed);
  }
  if (voice) {
    drawItem(mouthOpened);
  } else {
    drawItem(mouthClosed);
  }
  drawItem(nose);
};

window.onload = () => {
  requestAnimationFrame(drawFace);
  toggleEyes();
};

const toggleEyes = () => {
  if (openEyes) {
    openEyes = false;
    setTimeout(toggleEyes, 1000);
  }else{
    openEyes = true;
    setTimeout(toggleEyes, 3000);
  }

};
