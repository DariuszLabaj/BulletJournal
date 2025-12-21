class ProgressBar {
    constructor(x, y, w, h, text="Loading...", fontColor=color(212, 211, 232), fgColor=color(103, 80, 164), bgColor=color(226, 224, 249)) {
        this._barWidth = w;
        this._barHeight = h;
        this._x = x;
        this._y = y;
        this.text = text;
        this._fgColor = fgColor;
        this._bgColor = bgColor;
        this._fontColor = fontColor;
    }

    resize(x, y, w, h) {
        this._barWidth = w;
        this._barHeight = h;
        this._x = x;
        this._y = y;
    }

    draw(progress) {
        push();

        fill(this._fontColor);
        textAlign(CENTER, CENTER);
        SetFontSize(24);
        text(this.text, this._x, this._y - 50);

        noStroke();
        fill(this._bgColor);
        rect(this._x - this._barWidth / 2, this._y - this._barHeight / 2,
            this._barWidth, this._barHeight,
            this._barHeight / 2 - 1);
        fill(this._fgColor);
        rect(this._x - this._barWidth / 2, this._y - this._barHeight / 2,
            this._barWidth * progress, this._barHeight,
            this._barHeight / 2 - 1);

        stroke(this._fontColor);
        strokeWeight(1);
        noFill();
        rect(this._x - this._barWidth / 2, this._y - this._barHeight / 2,
            this._barWidth, this._barHeight,
            this._barHeight / 2 - 1);

        pop();
    }
}
