class Root {
    constructor(parent) {
        if (!(parent instanceof HTMLElement)) {
            console.error('Provide DOM Element to add the room.');
            return null;
        }
        this._attr = {};
        this._elem = { parent };
        this._requestedAnimationFrame = false;
        this._requestedHide = false,
            this._requestedShow = false;
    }

    render(isUpdate) {
        if (!this._requestedAnimationFrame) {
            requestAnimationFrame(() => {
                this._draw(isUpdate);
            });
            this._requestedAnimationFrame = true;
        }
    }

    fadeIn() {
        requestAnimationFrame(() => {
            this._elem.root.style = 'opacity: 0;';
            setTimeout(() => {
                requestAnimationFrame(() => {
                    this._elem.root.style = 'opacity:0;visibility:hidden;';
                });
            }, 300);
        });
    }

    fadeOut(cb) {
        requestAnimationFrame(() => {
            this._elem.root.style = 'opacity: 1;';
            setTimeout(() => {
                cb();
            }, 100);
        });
    }

    hide(removeSpace) {
        if (!this._requestedHide) {
            requestAnimationFrame(() => {
                this._elem.root.style = 'animation:animHide 300ms ease 1;opacity:0;transform:scale(0)';
                if (removeSpace) {
                    setTimeout(() => {
                        this._elem.root.classList.add('hidden');
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                this._elem.root.style = 'display: none;';
                            });
                        }, 300);
                    }, 300);
                }
                this._requestedShow = false;
            });
            this._requestedShow = true;
        }
    }

    show() {
        if (!this._requestedShow) {
            requestAnimationFrame(() => {
                this._elem.root.style = 'opacity:0;';
                requestAnimationFrame(() => {
                    this._elem.root.classList.remove('hidden');
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            this._elem.root.style = 'animation:animHide 300ms ease 1 reverse;opacity:1;';
                        });
                    }, 300);
                });
                this._requestedHide = false;
            });
            this._requestedHide = true;
        }
    }

    _draw(isUpdate) {
        this._requestedAnimationFrame = false;
        if (!isUpdate) {
            this._elem.root = document.createElement('div');
            this._elem.root.className = 'card';
        }
    }
}

class Room extends Root {
    constructor(parent, attr, uiOnly, beforeElem) {
        super(parent);
        //uiOnly means no request to Server update / create UI only
        this._attr.name = attr.name || this._attr.name;
        this._attr.iconSrc = attr.icon || this._attr.iconSrc;
        this._attr.isNew = attr.isNew;
        this._elem.beforeElem = beforeElem;
        this.render(false);
    }

    update(attr, uiOnly) {
        //code to update on server
        this._attr.name = attr.name || this._attr.name; //saniized name from server
        this._attr.iconSrc = attr.icon || this._attr.iconSrc; //sanitized icon src from server
        this.render(true);
    }

    _draw(isUpdate) {
        let statsDiv, elem, iconElem, statArr = ['stat-usage', 'stat-running', 'stat-devices'],
            iconArr = ['fa fa-line-chart', 'online', 'fa fa-microchip'], statTxt,
            beforeElem = this._elem.beforeElem;

        super._draw(isUpdate);
        if (!isUpdate) {
            this._elem.root.className += ' room';
            if (this._attr.isNew) {
                this._elem.root.className += ' new';
            }
            this._elem.name = document.createElement('h2');
            this._elem.icon = document.createElement('img');

            this._elem.stats = [];

            statsDiv = document.createElement('div');
            statsDiv.className = 'stats';
            for (let i = 0; i < 3; i++) {
                elem = document.createElement('div');
                iconElem = document.createElement('span');
                statTxt = document.createTextNode(' 0');
                this._elem.stats.push(statTxt);
                elem.className = statArr[i];
                iconElem.className = iconArr[i];
                elem.appendChild(iconElem);
                elem.appendChild(statTxt);
                statsDiv.appendChild(elem);
            }
            this._elem.icon.className = 'room-icon';

            this._elem.root.setAttribute('onclick', 'openRoom(this, ' + this._attr.id + ')');

            this._elem.root.appendChild(this._elem.icon);
            this._elem.root.appendChild(this._elem.name);
            this._elem.root.appendChild(statsDiv);
        }

        //name related changes
        this._elem.name.innerHTML = this._attr.name;
        this._elem.icon.setAttribute('alt', this._attr.name);
        this._elem.icon.setAttribute('title', this._attr.name);

        //icon src related changes --> icon update
        this._elem.icon.src = this._attr.iconSrc;

        //Append Room DOM into HTML DOM
        if (!isUpdate) {
            if (beforeElem instanceof HTMLElement) {
                this._elem.parent.insertBefore(this._elem.root, beforeElem);
            } else {
                this._elem.parent.appendChild(this._elem.root);
            }
        }
    }
}

class Device extends Root {
    constructor() {
        super();

    }
}