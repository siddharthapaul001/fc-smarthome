class Regulator {
    constructor(parent, side, color, nobColor, scaleColor, setScaleColor, scale = 10, scaleWidth = 2) {
        this._elem = {};
        this._attr = {};
        this._attr.scale = scale;
        this._attr.color = color;
        this._attr.nobColor = nobColor;
        this._attr.scaleColor = scaleColor;
        this._attr.setScaleColor = setScaleColor;
        this._elem.lines = [];
        this._attr.lines = [];
        this._elem.parent = parent;
        this.value = 0;
        this._requestedAnimationFrame = false;

        requestAnimationFrame(() => {
            this._createRegulator(parent, side, color, nobColor, scaleColor, scale, scaleWidth);
        });
        this._requestedAnimationFrame = true;
    }

    setValue(val) {
        this.value = +val >= 0 ? val : this.value;
        if (!this._requestedAnimationFrame) {
            requestAnimationFrame(() => {
                this._renderValue();
            });
            this._requestedAnimationFrame = true;
        }
    }

    _renderValue() {
        this._requestedAnimationFrame = false;
        let val = this.value,
            deg = 180 * val / 100,
            c = this._attr.regulatorCenter, strokeColor;
        for (let i = 0; i <= this._attr.scale; i++) {
            strokeColor = i <= this._attr.scale * val / 100 ? this._attr.setScaleColor : this._attr.scaleColor;
            this._elem.lines[i].setAttribute('stroke', strokeColor);
        }
        this._elem.regulator.setAttribute('transform', 'rotate(' + deg + ',' + c + ',' + c + ')');
    }

    _createRegulator(parent, side, color, nobColor, scaleColor, scale, scaleWidth) {
        this._requestedAnimationFrame = false;
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
            rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect'),
            g = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
            sideIn = side * 0.6,
            c = side / 2,
            degScale = 180 / scale;

        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', side);
        svg.setAttribute('height', side / 2);
        rect.setAttribute('x', 0.2 * side);
        rect.setAttribute('y', c - (sideIn * 0.02));
        rect.setAttribute('width', c * 0.2);
        rect.setAttribute('height', sideIn * 0.04);
        rect.setAttribute('fill', nobColor);
        circle.setAttribute('cx', c);
        circle.setAttribute('cy', c);
        circle.setAttribute('r', c * 0.6);
        circle.setAttribute('fill', color);

        for (let i = 0, deg = 0, x = 0, x2 = 0; i <= scale; i++ , deg += degScale) {
            x = c * Math.cos(deg * (Math.PI / 180));
            x2 = c * 0.8 * Math.cos(deg * (Math.PI / 180));
            let y = Math.sqrt(c * c - x * x), y2 = Math.sqrt(c * c * 0.64 - x2 * x2),
                line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('stroke-width', scaleWidth);
            line.setAttribute('stroke', scaleColor);
            line.setAttribute('x1', c - x);
            line.setAttribute('x2', c - x2);
            line.setAttribute('y1', c - y);
            line.setAttribute('y2', c - y2);
            this._elem.lines.push(line);
            this._attr.lines.push({
                x: c - x,
                y: c - y
            });
            // dot.setAttribute('r', '2');
            // dot.setAttribute('cx', c-x);
            // dot.setAttribute('cy', c-y);
            // dot.setAttribute('fill', '#ff0');
            svg.appendChild(line);
        }

        g.appendChild(circle);
        g.appendChild(rect);
        svg.appendChild(g);

        //Need to fix
        svg.addEventListener('click', (e) => {
            let selectedIdx = 0, minDist;
            let rect = this._elem.svg.getBoundingClientRect();
            this._attr.lines.forEach((line, idx) => {
                let x = e.clientX - rect.x - line.x, y = e.clientY - rect.y - line.y,
                    dist = x * x + y * y;
                if (!minDist || dist < minDist) {
                    minDist = dist;
                    selectedIdx = idx;
                }
            });
            this.setValue(selectedIdx * 100 / this._attr.scale);
        });

        this._elem.regulator = g;
        this._elem.svg = svg;
        this._attr.regulatorCenter = c;
        this._renderValue();
        parent.appendChild(svg);
    }
}