const sharp = require('sharp');
const fetch = require('node-fetch');
const fs = require('fs');
const grayRamp = '@$B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'  ';
const rampLength = grayRamp.length - 1;

const img2ascii = (path, width, invert = false) => {
    let height = width; //Assume a 1 to 1 aspect ratio initially
    let str = '';
    let image = sharp(path); // Get image from path
    image.metadata().then(data => {
        height = Math.floor(data.height / 2); // Since ASCII characters are taller than they are wide, set height to be half that of
    }).then(() => {
        image.sharpen(100).removeAlpha().resize(width, height, { fit: "fill" }).raw().toBuffer().then(val => {
            for (let px = 0; px < width * height; px++) {
                if (px % width == 0) str += '\n'; // Add line break at end of row
                let r = val[px * 3 + 0];
                let g = val[px * 3 + 1];
                let b = val[px * 3 + 2];
                let bwVal = ((r + g + b) / 3.0) / 255.0; // Get grayscale values
                let asciiVal = Math.floor((invert ? bwVal : (bwVal * -1.0 + 1.0)) * rampLength); //Reverse the values (so darker is a higher value)
                str += grayRamp[asciiVal];
            }
            console.log(str);
            // Post final text to hastebin
            fetch("https://hastebin.com/documents", {
                method: "POST",
                body: str,
                headers: {
                    "Content-Type": "text/plain"
                }
            }).then(response => {
                response.json().then(json => {
                    let link = "https://hastebin.com/raw/" + json["key"];
                    console.log(link); // Print this link
                    return link; // Return the link
                }).catch(err => { console.log(err) });
            }).catch((err) => { console.log(err); throw err; });
        }).catch(err => { console.log(err); throw err; });
    }).catch(err => { console.log(err); throw err; });
}

img2ascii("input.png", 570, false);
