let audioContext = null;
let analyser = null;
let dataArray = null;
let stream = null;
const THRESHOLD = 10000; /* 秘伝のタレ. いい感じに調整できるようにしたい */

/* Face patterns */
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

const startMouth = () => {
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  const stopButton = document.getElementById("stop-button");
  stopButton.style.display = "block";
  const startButton = document.getElementById("start-button");
  startButton.style.display = "none";

  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((s) => {
      stream = s;
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

  analyser.fftSize = 2048;
  dataArray = new Uint8Array(analyser.fftSize);
};

const stopMouth = () => {
  stream.getTracks().forEach(function (track) {
    track.stop();
  });

  audioContext.close();
  audioContext = null;
  analyser = null;
  dataArray = null;

  const stopButton = document.getElementById("stop-button");
  stopButton.style.display = "none";
  const startButton = document.getElementById("start-button");
  startButton.style.display = "block";
};

const isVoiceDetected = () => {
  if (analyser == null || dataArray == null) {
    return false;
  }

  analyser.getByteFrequencyData(dataArray);

  // FIXME: 雑に合計値をとっているので、ちゃんと声の帯域だけ取るなどしたい
  const sum = dataArray.reduce((a, b) => a + b, 0);

  return sum > 10000;
};

let openEyes = true;
/* タイマーまばたき */
const toggleEyes = () => {
  const time = openEyes ? 500 : 10000 * Math.random();
  openEyes = !openEyes;
  setTimeout(toggleEyes, time);
};

const drawFace = () => {
  requestAnimationFrame(drawFace);

  const voice = isVoiceDetected();
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const drawItem = (image) => {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  };

  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
