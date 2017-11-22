// getImageData = string -> ImageData 
let getImageData = function(image) {
    let canvas = document.createElement("Canvas");
    canvas.width = image.width;
    canvas.height = image.height; 
    let ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height); 
}; 

let getPixel = function(imageData) {
    let scanWidth = imageData.width * 4;
    return function(point) {
        let index = point.y * scanWidth + point.x * 4;
        return new Color(
            imageData.data[index], 
            imageData.data[index+1], 
            imageData.data[index+2], 
        );
    };
};

// samples the pixels whithin an image.
let sampleImage = function(imageData, count) {
    let result = [];
    for(let i = 0; i < count; i++) {
        let x = Math.floor(Math.random() * imageData.width - 1);
        let y = Math.floor(Math.random() * imageData.height - 1);
        let point = new Point(x, y);
        result.push({
            "point": point,
            "color": getPixel(imageData)(point)
        });
    }
    return result;
};
