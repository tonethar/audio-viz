enum DEFAULTS{
  gain = .5,
  numSamples = 256
}

// our WebAudio context
const audioCtx = new AudioContext();

// WebAudio nodes that are part of our WebAudio audio routing graph
// create an off-screen <audio> element
const element =  new Audio();
// create a source node that points at the <audio> element
const sourceNode = audioCtx.createMediaElementSource(element);
// create an analyser node
const analyserNode = audioCtx.createAnalyser();
// create a gain (volume) node
const gainNode = audioCtx.createGain();
// create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
//const audioData = new Uint8Array(DEFAULTS.numSamples / 2);

// Getters
export const getAnalyserNode = () => analyserNode;
export const getAudioCtx = () => audioCtx;

// Public
export const loadSoundFile = (filePath:string) => {
  element.src = filePath;
};

export const playCurrentSound = () => {
  element.play();
};

export const pauseCurrentSound = () => {
  element.pause();
};

export const setVolume = (value:number) => {
  gainNode.gain.value = value;
};

export const setupWebaudio = (filePath:string) => {
  /*
  We will request DEFAULTS.numSamples number of samples or "bins" spaced 
  equally across the sound spectrum.

  If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, 
  the second is 172 Hz, the third is 344Hz, and so on. 
  Each bin contains a number between 0-255 representing 
  the amplitude of that frequency.
  */ 
  // fft stands for Fast Fourier Transform
  analyserNode.fftSize = DEFAULTS.numSamples;

  // connect the nodes - we now have an audio graph
  sourceNode.connect(analyserNode);
  analyserNode.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // set initial volume
  setVolume(DEFAULTS.gain);

  // have <audio> point at a sound file
  loadSoundFile(filePath);
};
