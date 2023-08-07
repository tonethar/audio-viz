/*
  The purpose of this file:
    - takes in the analyser node and a <canvas> element: 
    - the module will create a drawing context that points at the <canvas> 
    - it will store the reference to the analyser node
    - in draw(), it will loop through the data in the analyser node
    - and then draw something representative on the canvas
    - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from "./utils";

export interface DrawParams{
  showGradient: boolean,
  showBars: boolean,
  showCircles: boolean,
  showNoise: boolean,
  showInvert: boolean,
  showEmboss: boolean
}

let ctx:CanvasRenderingContext2D,
  canvasWidth:number,
  canvasHeight:number,
  gradient:CanvasGradient,
  analyserNode:AnalyserNode,
  audioData:Uint8Array;

export const setupCanvas = (canvas:HTMLCanvasElement, node:AnalyserNode) => {
  // create drawing context
  ctx = canvas.getContext("2d");
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  // create a gradient that runs top to bottom
  const colorStops:utils.ColorStop[] = [
    { percent:0, color:"blue" },
    { percent:.25, color:"green" },
    { percent:.5, color:"yellow" },
    { percent:.75, color:"red" },
    { percent:1, color:"magenta" },
  ];
  
  gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, colorStops);
  // keep a reference to the analyser node
  analyserNode = node;
  // this is the array where the analyser data will be stored
  audioData = new Uint8Array(analyserNode.fftSize / 2);
};

export const draw = (params: DrawParams) => {
  // Populate the audioData array with the frequency data from the analyserNode
  // notice these arrays are passed "by reference" 
  analyserNode.getByteFrequencyData(audioData);
  // OR
  //analyserNode.getByteTimeDomainData(audioData); // waveform data
  
  // 2 - draw background
  ctx.save();
  ctx.fillStyle = "black";
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
  
  // 3 - draw gradient
  if (params.showGradient) {
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.globalAlpha = .3;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }
  
  // 4 - draw bars
  if (params.showBars) {
    const barSpacing = 4;
    const margin = 5;
    const totalBarSpacing = audioData.length * barSpacing;
    const screenWidthForBars = canvasWidth - totalBarSpacing - margin * 2;
    const barWidth = screenWidthForBars / audioData.length;
    const barHeight = 200;
    const topSpacing = 100;

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.strokeStyle = "rgba(0,0,0,0.5)"; 
    // loop through the data and draw!
    for (let i = 0; i < audioData.length; i += 1) { // eslint-disable-line id-length,max-len
      ctx.fillRect(
        margin + i * (barWidth + barSpacing), 
        topSpacing + 256 - audioData[i], 
        barWidth, 
        barHeight
      );
      ctx.strokeRect(
        margin + i * (barWidth + barSpacing),
        topSpacing + 256 - audioData[i], 
        barWidth, 
        barHeight
      );
      
    }
    ctx.restore();
  }
  
  // 5 - draw circles
  if (params.showCircles) {
    const maxRadius = canvasHeight / 4;
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < audioData.length; i += 1) { // eslint-disable-line id-length,max-len
      const percent = audioData[i] / 255;
      const circleRadius = percent * maxRadius;
     
      // red-ish circles
      ctx.beginPath();
      ctx.fillStyle = utils.makeColor(255, 111, 111, .34 - percent / 3);
      ctx.arc(canvasWidth / 2 , canvasHeight / 2, circleRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
      
      // blue-ish circles, bigger, more transparent
      ctx.beginPath();
      ctx.fillStyle = utils.makeColor(0, 0, 255, .1 - percent / 10);
      ctx.arc(canvasWidth / 2 , canvasHeight / 2, circleRadius * 1.5, 0, 2 * Math.PI); // eslint-disable-line max-len
      ctx.fill();
      ctx.closePath();

      // yellow-ish circles, smaller
      ctx.beginPath();
      ctx.fillStyle = utils.makeColor(200, 200, 0, .5 - percent / 5);
      ctx.arc(canvasWidth / 2 , canvasHeight / 2, circleRadius * .5, 0, 2 * Math.PI); // eslint-disable-line max-len
      ctx.fill();
      ctx.closePath();
    }
    ctx.restore();
  }

  // 6 - bitmap manipulation
  // TODO: right now. we are looping though every pixel of the canvas 
  // (320,000 of them!), regardless of whether or not we are applying 
  // a pixel effect At some point, refactor this code so that we are 
  // looping though the image data only if it is necessary

  // A) grab all of the pixels on the canvas and put them in the `data` array
  // `imageData.data` is a `Uint8ClampedArray()` typed array that has 
  // 1.28 million elements!
  // the variable `data` below is a reference to that array 
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imageData.data;
  const length = data.length;
  const width = imageData.width;
	
  // B) Iterate through each pixel, stepping 4 elements at a time 
  // (which is the RGBA for 1 pixel)
  for (let i = 0; i < length; i += 4) { // eslint-disable-line id-length,max-len
    if (params.showNoise && Math.random() < .05) {
      // C) randomly change every 20th pixel to red
      // data[i] is the red channel
      // data[i+1] is the green channel
      // data[i+2] is the blue channel
      // data[i+3] is the alpha channel
      // zero out the red and green and blue channels
      // make the red channel 100% red
      data[i] = data[i + 1] = data[i + 2] = 0;
      data[i] = 255;
    }

    if (params.showInvert) {
      const red = data[i], green = data[i + 1], blue = data[i + 2];
      data[i] = 255 - red;
      data[i + 1] = 255 - green;
      data[i + 2] = 255 - blue;
    }
  }

  if(params.showEmboss) {
    for (let i = 0; i < length; i += 1) { // eslint-disable-line id-length,max-len
      if(i % 4 === 3) continue;
      data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
    }
  }

  // Copy image data back to canvas
  ctx.putImageData(imageData, 0, 0);
};
