function simpleheat(canvas) {
    if (!(this instanceof simpleheat))
        return new simpleheat(canvas);
    this._canvas = canvas =
        typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
    this._ctx = canvas.getContext('2d', { willReadFrequently: true });
    this._width = canvas.width;
    this._height = canvas.height;
    this._max = 1;
    this._data = [];
}
simpleheat.prototype = {
    defaultRadius: 25,
    defaultGradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
    },
    data: function (data) {
        this._data = data;
        return this;
    },
    max: function (max) {
        this._max = max;
        return this;
    },
    add: function (point) {
        this._data.push(point);
        return this;
    },
    clear: function () {
        this._data = [];
        return this;
    },
    radius: function (r, blur) {
        blur = blur === undefined ? 15 : blur;
        // create a grayscale blurred circle image that we'll use for drawing points
        const circle = (this._circle = this._createCanvas());
        const context = circle.getContext('2d');
        const r2 = (this._r = r + blur);
        circle.width = circle.height = r2 * 2;
        context.shadowOffsetX = context.shadowOffsetY = r2 * 2;
        context.shadowBlur = blur;
        context.shadowColor = 'black';
        context.beginPath();
        context.arc(-r2, -r2, r, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        return this;
    },
    resize: function () {
        this._width = this._canvas.width;
        this._height = this._canvas.height;
    },
    gradient: function (grad) {
        // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
        const canvas = this._createCanvas();
        const context = canvas.getContext('2d', { willReadFrequently: true });
        const gradient = context.createLinearGradient(0, 0, 0, 256);
        canvas.width = 1;
        canvas.height = 256;
        for (const i in grad) {
            gradient.addColorStop(+i, grad[i]);
        }
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1, 256);
        this._grad = context.getImageData(0, 0, 1, 256).data;
        return this;
    },
    draw: function (minOpacity) {
        if (!this._circle)
            this.radius(this.defaultRadius);
        if (!this._grad)
            this.gradient(this.defaultGradient);
        const context = this._ctx;
        context.clearRect(0, 0, this._width, this._height);
        // draw a grayscale heatmap by putting a blurred circle at each data point
        for (var i = 0, len = this._data.length, p; i < len; i++) {
            p = this._data[i];
            context.globalAlpha = Math.min(Math.max(p[2] / this._max, minOpacity === undefined ? 0.05 : minOpacity), 1);
            context.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
        }
        // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
        if (this._width != 0 && this._height != 0) {
            const colored = context.getImageData(0, 0, this._width, this._height);
            this._colorize(colored.data, this._grad);
            context.putImageData(colored, 0, 0);
        }
        return this;
    },
    _colorize: function (pixels, gradient) {
        for (let index = 0, len = pixels.length, j; index < len; index += 4) {
            j = pixels[index + 3] * 4; // get gradient color from opacity value
            if (j) {
                pixels[index] = gradient[j];
                pixels[index + 1] = gradient[j + 1];
                pixels[index + 2] = gradient[j + 2];
            }
        }
    },
    _createCanvas: function () {
        return document.createElement('canvas');
    }
};
