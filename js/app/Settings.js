/*jslint browser: true */
/*global define */
define(['./Storage', 'utils'], function (Storage, utils) {
    "use strict";
    const Settings = function Settings() {
        const elements = {};
        const storage = new Storage();
        const get = utils.get;

        this.get = function get(source) {
            const result = {
                x: Settings.DEFAULT_X,
                y: Settings.DEFAULT_Y,
                z: Settings.DEFAULT_Z,
                mines: Settings.DEFAULT_MINES
            };
            const keys = Object.keys(result);
            const add = function add(key, value) {
                if (value) {
                    result[key] = parseInt(value, 10);
                }
            };

            if (source === Settings.SOURCE_STORAGE) {
                keys.forEach(function (key) {
                    add(key, storage.getItem(key));
                });

                return result;
            }

            if (source === Settings.SOURCE_INPUT) {
                keys.forEach(function (key) {
                    add(key, elements[key].value);
                });
            }
            return result;
        };

        this.set = function set(source, obj) {
            const keys = Object.keys(obj);

            if (source === Settings.SOURCE_STORAGE) {
                keys.forEach(function (key) {
                    storage.setItem(key, parseInt(obj[key], 10));
                });

                return;
            }

            if (source === Settings.SOURCE_INPUT) {
                keys.forEach(function (key) {
                    elements[key].value = parseInt(obj[key], 10);
                });
            }
        };

        this.deserialize = function deserialize(source, string) {
            const arr = string.split(':');

            if (arr.length === 4) {
                return this.set(source, {
                    x: arr[0],
                    y: arr[1],
                    z: arr[2],
                    mines: arr[3]
                });
            }
        };

        elements.x = get(Settings.CSS_ID_X);
        elements.y = get(Settings.CSS_ID_Y);
        elements.z = get(Settings.CSS_ID_Z);
        elements.mines = get(Settings.CSS_ID_MINES);
    };

    Settings.SOURCE_STORAGE = 'storage';
    Settings.SOURCE_INPUT = 'input';
    Settings.DEFAULT_X = 10;
    Settings.DEFAULT_Y = 10;
    Settings.DEFAULT_Z = 10;
    Settings.DEFAULT_MINES = 30;
    Settings.CSS_ID_X = 'x';
    Settings.CSS_ID_Y = 'y';
    Settings.CSS_ID_Z = 'z';
    Settings.CSS_ID_MINES = 'm';

    return Settings;
});