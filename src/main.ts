/*
  main.js is primarily responsible for hooking up the UI to the rest of the 
  application and setting up the main event loop
*/

//import * as utils from './utils';
import fscreen from "fscreen";
import * as audio from "./audio";
import * as canvas from "./canvas";

enum DEFAULTS{
  sound1 = "media/New Adventure Theme.mp3"
}

// https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state
enum AUDIO_CONTEXT_STATE{
  suspended = "suspended",
  running = "running", // not using
  closed = "closed" // not using
}

enum BUTTON_PLAYING_STATE{
  yes = "yes",
  no = "no"
}

const drawParams:canvas.DrawParams = {
  showGradient: true,
  showBars: true,
  showCircles: true,
  showNoise: false,
  showInvert: false,
  showEmboss: false
};

const setupUI = (canvasElement:HTMLCanvasElement) => {
  /* Enable Controls */

  // Fullscreen button
  // https://www.jsdelivr.com/package/npm/fscreen
  // https://www.npmjs.com/package/@types/fscreen
  const btnFS:HTMLButtonElement = document.querySelector("#btn-fs");
  if (fscreen.fullscreenEnabled) {
    console.log("Fullscreen API enabled"); // eslint-disable-line no-console
    btnFS.onclick = () => {
      fscreen.requestFullscreen(canvasElement);
    };
  } else {
    console.log("Fullscreen API NOT enabled"); // eslint-disable-line no-console
    btnFS.disabled = true;
  }

  // Play/Pause button
  const btnPlay:HTMLButtonElement = document.querySelector("#btn-play");
  btnPlay.onclick = () => {
    const audioCtx = audio.getAudioCtx();
    // check if context is in suspended state (autoplay policy)
    if (audioCtx.state === AUDIO_CONTEXT_STATE.suspended) {
      audioCtx.resume();
    }
    if (btnPlay.dataset.playing === BUTTON_PLAYING_STATE.no) {
      // if track is currently paused, play it
      audio.playCurrentSound();
      // our CSS will set the text to "Pause"
      btnPlay.dataset.playing = BUTTON_PLAYING_STATE.yes;
    } else {
      // if track IS playing, pause it
      audio.pauseCurrentSound();
      // our CSS will set the text to "Play"
      btnPlay.dataset.playing = BUTTON_PLAYING_STATE.no;
    }
  };

  // Volume Slider & Label
  const sliderVolume:HTMLInputElement = document.querySelector("#slider-volume"); // eslint-disable-line max-len
  const lblVolume:HTMLLabelElement = document.querySelector("#lbl-volume");

  sliderVolume.oninput = () => {
    const value = +sliderVolume.value;
    audio.setVolume(value);
    lblVolume.textContent = String(Math.round(+value / 2 * 100));
  };
  sliderVolume.dispatchEvent(new Event("input"));

  // Audio Track Chooser
  const selectTrack:HTMLSelectElement = document.querySelector("#select-track"); // eslint-disable-line max-len
  selectTrack.onchange = () => {
    audio.loadSoundFile(selectTrack.value);
    // pause the current track if it is playing
    if (btnPlay.dataset.playing === BUTTON_PLAYING_STATE.yes) {
      btnPlay.dispatchEvent(new MouseEvent("click"));
    }
  };

  // Checkboxes
  const cbGradient:HTMLInputElement = document.querySelector("#cb-gradient");
  cbGradient.onchange = () =>  drawParams.showGradient = !!cbGradient.checked;

  const cbBars:HTMLInputElement = document.querySelector("#cb-bars");
  cbBars.onchange = () => drawParams.showBars = !!cbBars.checked;

  const cbCircles:HTMLInputElement = document.querySelector("#cb-circles");
  cbCircles.onchange = () => drawParams.showCircles = !!cbCircles.checked;

  const cbNoise:HTMLInputElement = document.querySelector("#cb-noise");
  cbNoise.onchange = () => drawParams.showNoise = !!cbNoise.checked;

  const cbInvert:HTMLInputElement = document.querySelector("#cb-invert");
  cbInvert.onchange = () => drawParams.showInvert = !!cbInvert.checked;

  const cbEmboss:HTMLInputElement = document.querySelector("#cb-emboss");
  cbEmboss.onchange = () => drawParams.showEmboss = !!cbEmboss.checked;
};

const loop = () => {
  setTimeout(loop, 1000 / 60);
  canvas.draw(drawParams);
};

export const init = () => {
  audio.setupWebaudio(DEFAULTS.sound1);
  const canvasElement:HTMLCanvasElement = document.querySelector("canvas");
  setupUI(canvasElement);
  canvas.setupCanvas(canvasElement, audio.getAnalyserNode());
  loop();
};
