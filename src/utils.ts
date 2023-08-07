export interface ColorStop{
  percent: number,
  color: string
}

export const makeColor = (red:number, green:number, blue:number, alpha = 1) => {
  return `rgba(${red},${green},${blue},${alpha})`;
};

export const getRandom = (min:number, max:number) => {
  return Math.random() * (max - min) + min;
};

export const getRandomColor = () => {
  const floor = 35; // so that colors are not too bright or too dark 
  const getByte = () => getRandom(floor, 255 - floor);
  return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};

export const getLinearGradient = (
  ctx:CanvasRenderingContext2D,
  startX:number,
  startY:number,
  endX:number,
  endY:number,
  colorStops: ColorStop[]
) => {
  const lg = ctx.createLinearGradient(startX,startY,endX,endY);
  for (const stop of colorStops) {
    lg.addColorStop(stop.percent,stop.color);
  }
  return lg;
};
