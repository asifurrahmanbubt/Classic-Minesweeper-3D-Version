/*jslint browser: true */
/*global define */
define(['Settings', 'Storage', 'dialog', 'EventListener', 'utils'], function (Settings, Storage, dialog, EventListener, utils) {
    "use strict";
    const UI = function UI() {
        let favIcon;
        const that = this;
        const get = utils.get;
        const elements = {};

        const bind = function bind() {
            if (elements.reset) {
                elements.reset.addEventListener('click', e => {
                    that.trigger(UI.EVENT_RESET);
                    e.preventDefault();
                });
            }
            if (elements.flags) {
                elements.flags.addEventListener('change', function (e) {
                    e.preventDefault();
                    that.trigger(UI.EVENT_TOGGLE_FLAGS, this.checked);
                }, true);
            }
            if (elements.pause) {
                elements.pause.addEventListener('change', function (e) {
                    e.preventDefault();
                    that.trigger(UI.EVENT_PAUSE, this.checked);
                });
            }
            if (elements.score) {
                elements.score.addEventListener('click', function (e) {
                    e.preventDefault();
                    that.trigger(UI.EVENT_SHOW_SCORE);
                });
            }
            if (elements.newGame) {
                elements.newGame.addEventListener('click', function (e) {
                    that.trigger(UI.EVENT_NEW_GAME);
                    e.preventDefault();
                });
            }
            if (elements.settings) {
                elements.settings.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (!elements.settings.classList.contains(UI.CSS_CLASS_VISIBLE)) {
                        elements.settings.classList.toggle(UI.CSS_CLASS_VISIBLE);
                    }
                }, true);

                if (elements.closeSettings) {
                    elements.closeSettings.addEventListener('click', function (e) {
                        e.preventDefault();
                        elements.settings.classList.remove(UI.CSS_CLASS_VISIBLE);
                    })
                }
            }
            if (elements.popular) {
                elements.popular.addEventListener('click', function ({target, preventDefault}) {
                    if (target.nodeName === 'A') {
                        that.settings.deserialize(Settings.SOURCE_INPUT, target.dataset.settings);
                        preventDefault();
                    }
                });
            }
            if (elements.help) {
                elements.help.addEventListener('click', function (e) {
                    e.preventDefault();
                    that.trigger(UI.EVENT_HELP);
                });
            }
            if (elements.name) {
                elements.name.addEventListener('change', function (e) {
                    const val = elements.name.value;
                    that.trigger(UI.EVENT_NAME_CHANGE, val);
                    that.storage.setItem('name', val);
                });
            }
        };

        this.setFavicon = function setFavIcon(icon) {
            /*jslint unparam: true */
            if (favIcon) {
                favIcon.parentNode.removeChild(favIcon);
//                favIcon.href = icon;
//                return;
            }
            favIcon = document.createElement('link');
            favIcon.type = 'image/x-icon';
            favIcon.rel = 'shortcut icon';
            favIcon.href = 'http://www.stackoverflow.com/favicon.ico';
            document.getElementsByTagName('head')[0].appendChild(favIcon);
        };

        this.displayScore = function displayScore({ x, y, z, mines, leaderBoard}) {
            let text = 'Highscores for ' + x + 'x' + y + 'x' + z + ', ' + mines + ' mines:\n';

            const { length } = leaderBoard;
            if (!length) {
                dialog.alert('No results for this settings yet');
            } else {
                for (let i = 0; i < length; i += 1) {
                    text += leaderBoard[i].position + ')' + ' ' + leaderBoard[i].name + ' - ' + leaderBoard[i].time + '\n';
                }
                dialog.alert(text);
            }
        };

        this.getPause = function getPause() {
            return elements.pause;
        };

        this.getFlags = function getFlags() {
            return elements.flags;
        };

        this.setMinesLeft = function setMinesLeft(minesLeft) {
            if (typeof minesLeft === 'number') {
                minesLeft = utils.pad(minesLeft);
            }
            elements.minesLeft.innerHTML = minesLeft;
        };

        this.setTime = function setTime(time) {
            elements.timer.innerHTML = typeof time === 'number'
                ? utils.pad(time)
                : time ;
        };

        this.setName = function setName(name) {
            elements.name.value = name;
        };

        this.populatePopular = function populatePopular({ success, popular }) {
            if (!elements.popular) {
                console.warn('No popular element found');
            }
            if (!success || !popular) {
                return;
            }

            const html = [];
            const { length } = popular;
            for (let i = 0, l = length; i < l; i += 1) {
                let row = popular[i];
                const { x, y, z, mines} = row;
                let serialized = x + ':' + y + ':' + z + ':' + mines;

                html.push('<li><a href="#" data-settings="' + serialized + '">' + x + 'x' + y + 'x' + z + ' ' + mines + ' mines</a></li>');
            }
            elements.popular.innerHTML = html.join('');
        };

        this.setSmiley = function (className) {
            if (!UI.CSS_SMILEYS.includes(className)) {
                return;
            }

            elements.reset.className = className;
        };

        this.resetSmiley = function () {
            elements.reset.className = '';
        };

        EventListener.subscribe(that);
        that.settings = new Settings();
        that.storage = new Storage();
        elements.reset = get(UI.CSS_ID_RESET);
        elements.timer = get(UI.CSS_ID_TIMER);
        elements.minesLeft = get(UI.CSS_ID_MINES_LEFT);
        elements.flags = get(UI.CSS_ID_FLAGS);
        elements.pause = get(UI.CSS_ID_PAUSE);
        elements.score = get(UI.CSS_ID_SCORE);
        elements.newGame = get(UI.CSS_ID_NEW_GAME);
        elements.settings = get(UI.CSS_ID_SETTINGS);
        elements.closeSettings = get(UI.CSS_ID_CLOSE_SETTINGS);
        elements.popular = get(UI.CSS_ID_POPULAR);
        elements.help = get(UI.CSS_ID_HELP);
        elements.name = get(UI.CSS_ID_NAME);
        elements.name.value = that.storage.getItem('name') || 'Annonymous';
        this.elements = elements;

        bind();
    };

    UI.CSS_ID_TIMER = 'timer';
    UI.CSS_ID_MINES_LEFT = 'mines-left';
    UI.CSS_ID_FLAGS = 'flags';
    UI.CSS_ID_PAUSE = 'pause';
    UI.CSS_ID_SCORE = 'score';
    UI.CSS_ID_NEW_GAME = 'new-game';
    UI.CSS_ID_SETTINGS = 'settings';
    UI.CSS_ID_RESET = 'reset';
    UI.CSS_SMILEY_SHOCK_CLASS = 'shock';
    UI.CSS_SMILEY_DEAD_CLASS = 'dead';
    UI.CSS_SMILEY_SUNGLASSES_CLASS = 'sunglasses';
    UI.CSS_SMILEYS = [UI.CSS_SMILEY_SHOCK_CLASS, UI.CSS_SMILEY_DEAD_CLASS, UI.CSS_SMILEY_SUNGLASSES_CLASS];
    UI.EVENT_TOGGLE_FLAGS = 'toggle-flags';
    UI.EVENT_PAUSE = 'pause';
    UI.EVENT_RESET = 'reset';
    UI.EVENT_SHOW_SCORE = 'show-score';
    UI.EVENT_NEW_GAME = 'new-game';
    UI.EVENT_HELP = 'help';
    UI.EVENT_NAME_CHANGE = 'name-change';
    UI.CSS_CLASS_VISIBLE = 'visible';
    UI.CSS_ID_CLOSE_SETTINGS = 'close-settings';
    UI.CSS_ID_POPULAR = 'popular-games';
    UI.CSS_ID_HELP = 'help';
    UI.CSS_ID_NAME = 'name';

    return UI;
});