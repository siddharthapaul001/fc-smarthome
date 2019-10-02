class Switch {
    constructor(parent, callback) {
        this._elem = {};
        this._attr = {};
        if (parent instanceof Node) {
            this._elem.parent = parent;
        }
        this._value = 0;
        this._attr.requestedAnimationFrame = false;

        if (typeof callback === 'function') {
            this._callback = (value) => {
                callback(value);
            }
        }

        requestAnimationFrame(() => {
            this._createSwitch();
        })
    }

    setValue(value) {
        this._attr.value = value;
        this._renderValue();
    }

    _renderValue() {
        if (!this._attr.requestedAnimationFrame) {
            requestAnimationFrame(() => {
                this._attr.requestedAnimationFrame = false;
                if (this._attr.value === 0) {
                    this._elem.selected.classList.add('off');
                } else {
                    this._elem.selected.classList.remove('off');
                }
            });
            this._attr.requestedAnimationFrame = true;
        }
    }

    _createSwitch() {
        let switchWraper;
        switchWraper = document.createElement('div');
        this._elem.selected = document.createElement('div');
        switchWraper.className = 'switch-container';
        this._elem.selected.className = this._attr.value === 0 ? 'selected off' : 'selected';

        this._elem.btnOn = document.createElement('button');
        this._elem.btnOff = document.createElement('button');

        this._elem.btnOn.className = 'btn btn-toggle';
        this._elem.btnOff.className = 'btn btn-toggle';

        this._elem.btnOn.innerHTML = 'ON';
        this._elem.btnOff.innerHTML = 'OFF';

        this._elem.btnOn.addEventListener('click', () => {
            //Do ajax call
            if (this._callback) {
                this._callback(100);
            }
            if (!this._attr.requestedAnimationFrame) {
                requestAnimationFrame(() => {
                    this._elem.selected.classList.remove('off');
                    this._attr.requestedAnimationFrame = false;
                });
                this._attr.requestedAnimationFrame = true;
            }
        });

        this._elem.btnOff.addEventListener('click', () => {
            //Do ajax call
            if (this._callback) {
                this._callback(0);
            }
            if (!this._attr.requestedAnimationFrame) {
                requestAnimationFrame(() => {
                    this._elem.selected.classList.add('off');
                    this._attr.requestedAnimationFrame = false;
                });
                this._attr.requestedAnimationFrame = true;
            }
        });

        switchWraper.appendChild(this._elem.btnOn);
        switchWraper.appendChild(this._elem.btnOff);

        switchWraper.appendChild(this._elem.selected);

        this._elem.parent.appendChild(switchWraper);
    }
}