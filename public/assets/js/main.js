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

    hide(removeSpace, doDelete) {
        if (!this._requestedHide) {
            requestAnimationFrame(() => {
                this._elem.root.style = 'animation:animHide 300ms ease 1;opacity:0;transform:scale(0)';
                if (removeSpace) {
                    setTimeout(() => {
                        this._elem.root.classList.add('hidden');
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                if (doDelete) {
                                    this._elem.root.parentNode.removeChild(this._elem.root);
                                } else {
                                    this._elem.root.style = 'display: none;';
                                }
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
        this._attr.name = attr.name || 'Unnamed room';
        this._attr.iconSrc = attr.icon || this._attr.iconSrc;
        this._attr.isNew = attr.isNew;
        this._attr.stats = [+attr.usage || 0, +attr.online || 0, +attr.devices || 0];
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
                statTxt = document.createTextNode(' ' + this._attr.stats[i]);
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
        this._elem.name.innerHTML = this._attr.name.length > 20 ? this._attr.name.slice(0, 17) + '...' : this._attr.name;
        this._elem.icon.setAttribute('alt', this._attr.name);
        this._elem.icon.setAttribute('title', this._attr.name);

        //icon src related changes --> icon update
        this._elem.icon.src = this._attr.iconSrc;

        //Append Room DOM into HTML DOM
        if (!isUpdate) {
            if (beforeElem instanceof HTMLElement) {
                this._elem.parent.appendChild(this._elem.root);
            } else {
                this._elem.parent.appendChild(this._elem.root);
            }
        }
    }
}

class Device extends Root {
    constructor(parent, attr, uiOnly, beforeElem) {
        super(parent);
        //uiOnly means no request to Server update / create UI only
        this._attr.name = attr.name || this._attr.name;
        //this._attr.iconSrc = attr.icon || this._attr.iconSrc;
        this._attr.isNew = attr.isNew;
        this.isRegulator = Boolean(attr.isRegulator);
        this._attr.stats = [+attr.usage || 0, +attr.online || 0];
        this._elem.stats = [];
        this._elem.beforeElem = beforeElem;
        this._attr.btnRAF = false;

        this.render(false);
    }

    update(attr, uiOnly) {
        //code to update on server
        this._attr.name = attr.name || this._attr.name; //saniized name from server
        //this._attr.iconSrc = attr.icon || this._attr.iconSrc; //sanitized icon src from server
        this.render(true);
    }

    _draw(isUpdate) {
        let equipmentHead, icon, equipmentBody, stats, stat, txtStat, statClasses = ['stat-usage', 'stat-online'], statIcons = ['fa fa-line-chart', 'fa fa-clock-o'], switchWraper;
        super._draw(isUpdate);
        if (!isUpdate) {
            this._elem.root.className = 'equipment';
            equipmentHead = document.createElement('div');
            this._elem.deviceName = document.createElement('h3');
            equipmentHead.className = 'equipment-head';
            this._elem.btnDelete = document.createElement('button');
            this._elem.btnDelete.className = 'btn btn-remove';
            icon = document.createElement('span');
            icon.className = 'fa fa-trash';
            this._elem.btnDelete.appendChild(icon);
            equipmentHead.appendChild(this._elem.deviceName);
            equipmentHead.appendChild(this._elem.btnDelete);

            equipmentBody = document.createElement('div');
            switchWraper = document.createElement('div');
            this._elem.selected = document.createElement('div');
            equipmentBody.className = 'equipment-body';
            if (!this.isRegulator) {
                switchWraper.className = 'switch-container';
                this._elem.selected.className = 'selected'

                this._elem.btnOn = document.createElement('button');
                this._elem.btnOff = document.createElement('button');

                this._elem.btnOn.className = 'btn btn-toggle';
                this._elem.btnOff.className = 'btn btn-toggle';

                this._elem.btnOn.innerHTML = 'ON';
                this._elem.btnOff.innerHTML = 'OFF';

                this._elem.btnOn.addEventListener('click', () =>{
                    //Do ajax call
                    if(!this._attr.btnRAF){
                        requestAnimationFrame(() => {
                            this._elem.selected.classList.remove('off');
                            this._attr.btnRAF = false;
                        });
                        this._attr.btnRAF = true;
                    }
                });

                this._elem.btnOff.addEventListener('click', () =>{
                    //Do ajax call
                    if(!this._attr.btnRAF){
                        requestAnimationFrame(() => {
                            this._elem.selected.classList.add('off');
                            this._attr.btnRAF = false;
                        });
                        this._attr.btnRAF = true;
                    }
                });

                switchWraper.appendChild(this._elem.btnOn);
                switchWraper.appendChild(this._elem.btnOff);

                switchWraper.appendChild(this._elem.selected);

                equipmentBody.appendChild(switchWraper);
            }else{
                this.regulator = new Regulator(
                    equipmentBody,
                    180, '#1c90dd', '#aaa', '#aaa', '#477201', 10, 2,
                    (val) => {
                        console.log(val);
                    }
                );
            }
            stats = document.createElement('div');
            stats.className = 'equipment-stats';

            for (let i = 0; i < 2; i++) {
                stat = document.createElement('div');
                icon = document.createElement('span');
                txtStat = document.createTextNode(' ' + this._attr.stats[i]);
                stat.className = statClasses[i];
                icon.className = statIcons[i];
                stat.appendChild(icon);
                stat.appendChild(txtStat);
                this._elem.stats.push(txtStat);
                stats.appendChild(stat);
            }
            this._elem.root.appendChild(equipmentHead);
            this._elem.root.appendChild(equipmentBody);
            this._elem.root.appendChild(stats);
        }

        this._elem.deviceName.innerHTML = this._attr.name;

        if (!isUpdate) {
            if (this._elem.beforeElem instanceof HTMLElement) {
                this._elem.parent.insertBefore(this._elem.root, this._elem.beforeElem);
            } else {
                this._elem.parent.appendChild(this._elem.root);
            }
        }
    }
}