var sharp = require('sharp');
function makeArray(d1, d2) {
    var arr = new Array(d1), i, l;
    for (i = 0, l = d2; i < l; i++) {
        arr[i] = new Array(d1);
    }
    return arr;
}

const generateBlur = (radius) => {
    let kernel = makeArray(radius, radius);
    let nElements = radius * radius;
    for (let i = 0; i < radius; i++) {
        for (let j = 0; j < radius; j++) {
            kernel[i][j] = 1 / nElements;
        }
    }
    return kernel;
}


const gaussianKernel = [[1 / 273, 4 / 273, 5 / 273, 4 / 273, 1 / 273], [4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273], [7 / 273, 26 / 273, 41 / 273, 26 / 273, 7 / 273], [4 / 273, 16 / 273, 26 / 273, 16 / 273, 4 / 273], [1 / 273, 4 / 273, 7 / 273, 4 / 273, 1 / 273]];
const identityKernel = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];
const blurKernel = [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]];
const edgeKernel = [[-1, 0, 0], [0, 1, 0], [0, 0, -1]]
const convolve = (pxBuf, w, h, kernel) => {
    let rowBound = Math.floor(kernel.length / 2.0); //Distance from the top and bottom sides of the kernel to the center
    let colBound = Math.floor(kernel[0].length / 2.0); //Same but horizontally
    console.log("colbound: ", colBound, "rowbound: ", rowBound);
    let newBuf = [];
    for (let row = 0; row < h; row++) {
        for (let col = 0; col < w; col++) {
            let newRed = 0;
            let newBlue = 0;
            let newGreen = 0;
            if (row - rowBound > 0 && row + rowBound < h && col - colBound > 0 && col + colBound < w) {
                for (let krow = 0; krow < kernel.length; krow++) {
                    for (let kcol = 0; kcol < kernel[krow].length; kcol++) {
                        let kval = kernel[krow][kcol];
                        let pxRed = pxBuf[((row + (krow - (rowBound))) * width + (col + (kcol - (colBound)))) * 3 + 0] / 255;
                        let pxGreen = pxBuf[((row + (krow - (rowBound))) * width + (col + (kcol - (colBound)))) * 3 + 1] / 255;
                        let pxBlue = pxBuf[((row + (krow - (rowBound))) * width + (col + (kcol - (colBound)))) * 3 + 2] / 255;
                        newRed += Math.floor((kval * pxRed) * 255);
                        newGreen += Math.floor((kval * pxGreen) * 255);
                        newBlue += Math.floor((kval * pxBlue) * 255);
                        if (newRed < 0) newRed = 0;
                        if (newGreen < 0) newGreen = 0;
                        if (newBlue < 0) newBlue = 0;
                        if (newRed > 255) newRed = 255;
                        if (newGreen > 255) newGreen = 255;
                        if (newBlue > 255) newBlue = 255;
                        //console.log("R:", pxRed, "G:", pxGreen, "B:", pxBlue);
                    }
                }
            } else {
                //                console.log("cant process pixel, kernel coords out of bounds")
            }
            newBuf.push(newRed);
            newBuf.push(newGreen);
            newBuf.push(newBlue);
            //console.log("newR:", newRed, "newG:", newGreen, "newB:", newBlue);
        }
    }
    return newBuf;
}
let width, height;
let img = sharp('test.jpg');
img.metadata().then(data => {
    width = data.width;
    height = data.height;
    console.log("width:", width, "height:", height);
});
img.removeAlpha().raw().toBuffer().then((buf) => {
    let timebegin = Date.now();
    let newBuf = new Buffer(convolve(buf, width, height, edgeKernel));
    let elapsedTime = Date.now() - timebegin;
    console.log("Elapsed time: ", elapsedTime, "ms");
    sharp(newBuf, {
        raw: {
            width: width,
            height: height,
            channels: 3
        }
    }).toFile('out.png').catch(err => {
        console.log(err);
    })
}).catch(err => { console.log(err); });