// memory cache for session
const colorCache = new Map<string, string>();

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export async function extractDominantColor(imageSrc: string): Promise<string> {
  //just cache if seen the image before
  if (colorCache.has(imageSrc)) {
    return colorCache.get(imageSrc)!;
  }
  //new image
  const extractPromise = new Promise<string>((resolve, reject)=> {
    const img = new Image;
    img.crossOrigin = 'anonymous'; //in case its blocked
    //set up error
    img.onerror = () => reject(new Error("failed to load image"));
    //load images and then count
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error("canvas context not found"));
          return;
        }

        //downscale
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        const imageData = ctx.getImageData(0, 0, 50, 50);
        const pixels = imageData.data;

        const colorCounts: {[key: string]: number} = {};
        const quantize = 64; //group similar colors together

        //count colors
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i+1];
          const b = pixels[i+2];
          const a = pixels[i+3];
          //skips if too transparent
          if (a < 200) continue;
          //skip if too dim/bright
          const brightness = r * 0.299 + g * 0.587 + b * 0.114;
          if (brightness < 50 || brightness > 200) continue;

          //blend different tone of the same color together
          const qR = Math.floor(r / quantize) * quantize;
          const qG = Math.floor(g / quantize) * quantize; 
          const qB = Math.floor(b / quantize) * quantize;
          
          const key = `${qR},${qG},${qB}`;
          colorCounts[key] = (colorCounts[key] || 0) + 1;
        }
        //find most prominent color
        let dominantC = '100,120,140'; 
        let maxCount = 0;
        for (const [color, count] of Object.entries(colorCounts)) {
          if (count > maxCount) {
            maxCount = count;
            dominantC = color;
          }
        }
        const [r, g, b] = dominantC.split(',').map(Number);
        const result = rgbToHex(r, g, b);
        //cache
        colorCache.set(imageSrc, result);

        resolve(result);
      } catch (e) {
        reject(e);
      }
    };
    // start loading the image
    img.src = imageSrc;
  });

  //1500ms timeout
  const timeoutPromise = new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve('#64788c'); 
    }, 1500)
  });

  //return whichever promise finishes first
  return Promise.race([extractPromise, timeoutPromise]);
}