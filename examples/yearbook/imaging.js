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
let sampleImage = function(imageData) {
    let points = poisson2d.create(
        imageData.width, 
        imageData.height, 
        7, 60);
    let count = points.length;
    let result = new Array(count);
    for(let i = 0; i < count; i++) {
        let point = new Point(
            Math.floor(points[i].x), 
            Math.floor(points[i].y));
        result[i] = {
            point: point,
            color: getPixel(imageData)(point)
        };
    }
    return result;
};
