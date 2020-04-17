function _getTimeString(mins) {
    let timeStr = '', d, h, m = mins;

    if (mins > 60) {
        h = (mins / 60) >> 0;
        m = (mins % 60);

    }
    if (h > 24) {
        d = (h / 24) >> 0;
        h = (h % 24);
    }
    if (d > 0) {
        timeStr = d + 'd ';
    }
    if (h > 0) {
        timeStr += h + 'h ';
    }
    timeStr += m + 'm';
    if (mins < 1) {
        timeStr = ' < 1m';
    }

    return timeStr;
}


class Root {
    constructor(parent, id) {
        if (!(parent instanceof HTMLElement)) {
            console.error('Provide DOM Element to add the room.');
            return null;
        }
        //Give id check here
        this._attr = { '_id': id };
        this._elem = { parent };
        this._requestedAnimationFrame = false;
        this._requestedHide = false;
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
    constructor(parent, attr, beforeElem) {
        super(parent, attr._id);
        this._attr.name = attr.roomName || 'Unnamed room';
        this._attr.iconSrc = attr.roomIcon || this._attr.iconSrc;
        this._attr.type = +attr.type || 0;
        this._attr.isNew = attr.isNew;
        this._attr.guests = attr.guests;
        this._attr.isHidden = Boolean(attr.isHidden);
        this._attr.stats = [+attr.usage || 0, +attr.online || 0, +attr.devices || 0];
        this._elem.beforeElem = beforeElem;
        this.render(false);
    }

    update(attr) {
        this._attr.name = attr.roomName || this._attr.name; //saniized name from server
        this._attr.iconSrc = attr.roomIcon || this._attr.iconSrc; //sanitized icon src from server
        this._attr.stats = [+attr.usage >= 0 ? +attr.usage : this._attr.stats[0], +attr.online >= 0 ? +attr.online : this._attr.stats[1], +attr.devices >= 0 ? +attr.devices : this._attr.stats[2]];
        this._attr.guests = attr.guests || this._attr.guests;
        this.render(true);
    }

    _draw(isUpdate) {
        let statsDiv, elem, iconElem, statArr = ['stat-usage', 'stat-running', 'stat-devices'],
            iconArr = ['fa fa-line-chart', 'online', 'fa fa-microchip'], statTxt, btnDelete,
            beforeElem = this._elem.beforeElem;

        super._draw(isUpdate);
        if (!isUpdate) {
            this._elem.root.classList.add('room');
            if (this._attr.isHidden) {
                this._elem.root.style = 'opacity:0;transform:scale(0)';
            } else if (this._attr.isNew) {
                this._elem.root.className += ' hidden';
                setTimeout(() => {
                    this.show();
                }, 300);
            }
            this._elem.name = document.createElement('h2');
            this._elem.icon = document.createElement('img');

            if (this._attr.type === 0) {
                btnDelete = document.createElement('button');
                btnDelete.className = 'btn btn-remove';
                btnDelete.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.confirmRemoveRoom(this._attr._id);
                    //return true;
                });
                btnDelete.innerHTML = '<span class="fa fa-trash"></span>';
                this._elem.root.appendChild(btnDelete);
            }

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

            this._elem.root.setAttribute('onclick', 'openRoom(this, \'' + this._attr._id + '\')');

            this._elem.root.appendChild(this._elem.icon);
            this._elem.root.appendChild(this._elem.name);
            this._elem.root.appendChild(statsDiv);
        }

        //name related changes
        this._elem.name.innerHTML = this._attr.name.length > 20 ? this._attr.name.slice(0, 17) + '...' : this._attr.name;
        this._elem.icon.setAttribute('alt', this._attr.name);
        this._elem.icon.setAttribute('title', this._attr.name);

        for (let i = 0; i < 3; i++) {
            this._elem.stats[i].data = ' ' + this._attr.stats[i];
        }

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
    constructor(parent, attr, beforeElem, cb) {
        let kwh, temp;
        super(parent, attr._id);
        this._attr.name = attr.deviceName || 'Unnamed device';
        //this._attr.iconSrc = attr.icon || this._attr.iconSrc;
        this._attr.isNew = Boolean(attr.isNew);
        this._attr.steps = +attr.steps || 10;
        this.type = +attr.deviceType || 0; // can access from outside
        this._attr.value = +attr.value >= 0 ? +attr.value : 0;
        this._attr.wattage = +attr.wattage || 0;
        this._attr.isGuest = Boolean(attr.isGuest);
        this._attr.lastUpdated = +attr.lastUpdated || 0;
        this._attr.online = this._attr.value ? ((new Date()).getTime() - this._attr.lastUpdated) / (60 * 1000) >> 0 : 0;
        kwh = this._attr.wattage * this._attr.value / 100;
        temp = kwh;
        kwh = kwh >> 0;
        temp = temp - kwh;
        if(temp > 0){
            //fraction exists
            kwh += ((temp * 100) >> 0) * 0.01;
        }
        this._attr.stats = [kwh, _getTimeString(this._attr.online)];
        this._elem.stats = [];
        this._elem.beforeElem = beforeElem;
        this._attr.btnRAF = false;
        if (typeof cb === 'function') {
            this._callback = (deviceId, val) => {
                cb(deviceId, val);
            }
        }
        this.render(false);
    }

    update(attr) {
        let kwh, temp;
        if (attr) {
            this._attr.name = attr.deviceName || this._attr.name; //saniized name from server
            this._attr.value = +attr.value >= 0 ? +attr.value : this._attr.value;
            this._attr.wattage = +attr.wattage >= 0 ? +attr.wattage : this._attr.wattage;
            this._attr.lastUpdated = +attr.lastUpdated || this._attr.lastUpdated;
        }
        //this._attr.iconSrc = attr.icon || this._attr.iconSrc; //sanitized icon src from server
        this._attr.online = this._attr.value ? ((new Date()).getTime() - this._attr.lastUpdated) / (60 * 1000) >> 0 : 0;
        kwh = this._attr.wattage * this._attr.value / 100;
        temp = kwh;
        kwh = kwh >> 0;
        temp = temp - kwh;
        if(temp > 0){
            //fraction exists
            kwh += ((temp * 100) >> 0) * 0.01;
        }
        this._attr.stats = [kwh, _getTimeString(this._attr.online)];

        this.render(true);
    }

    _draw(isUpdate) {
        let equipmentHead, icon, equipmentBody, stats, stat, txtStat, statClasses = ['stat-usage', 'stat-online'], statIcons = ['fa fa-line-chart', 'fa fa-clock-o'];
        super._draw(isUpdate);
        if (!isUpdate) {
            this._elem.root.classList.add('equipment');
            if (this._attr.isNew) {
                this._elem.root.className += ' hidden';
                setTimeout(() => {
                    this.show();
                }, 300);
            }
            equipmentHead = document.createElement('div');
            this._elem.deviceName = document.createElement('h3');
            equipmentHead.className = 'equipment-head';
            if (!this._attr.isGuest) {
                this._elem.btnDelete = document.createElement('button');
                this._elem.btnDelete.className = 'btn btn-remove';
                icon = document.createElement('span');
                icon.className = 'fa fa-trash';
                this._elem.btnDelete.appendChild(icon);
                this._elem.btnDelete.setAttribute('onclick', 'confirmRemoveDevice(\'' + this._attr._id + '\')');
            }
            equipmentHead.appendChild(this._elem.deviceName);
            if (!this._attr.isGuest) {
                equipmentHead.appendChild(this._elem.btnDelete);
            }
            equipmentBody = document.createElement('div');
            equipmentBody.className = 'equipment-body';
            if (this.type === 0) {
                this._elem.control = new Switch(
                    equipmentBody,
                    (val) => {
                        if (this._callback) {
                            this._callback(this._attr._id, val);
                        }
                    }
                );
            } else if (this.type === 1) {
                this._elem.control = new Regulator(
                    equipmentBody,
                    180, '#1c90dd', '#aaa', '#aaa', '#477201', this._attr.steps, 2,
                    (val) => {
                        if (this._callback) {
                            this._callback(this._attr._id, val);
                        }
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
        for (let i = 0; i < 2 && isUpdate; i++) {
            this._elem.stats[i].data = ' ' + this._attr.stats[i];
        }
        if (this._attr.value === 0) {
            this._elem.root.getElementsByClassName('stat-online')[0].style.display = 'none';
        } else {
            this._elem.root.getElementsByClassName('stat-online')[0].removeAttribute('style');
        }
        this._elem.control.setValue(this._attr.value);

        if (!isUpdate) {
            if (this._elem.beforeElem instanceof HTMLElement) {
                this._elem.parent.insertBefore(this._elem.root, this._elem.beforeElem);
            } else {
                this._elem.parent.appendChild(this._elem.root);
            }
        }
    }
}