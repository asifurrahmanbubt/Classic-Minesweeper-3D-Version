/*global define */
/*jslint browser: true */
define(function () {
    "use strict";
    return function Storage() {
        const KEY = 'mines3d';
        let data = {};

        const getStorage = () => {
            try {
                return window.localStorage;
            } catch (e) {
                if (e instanceof DOMException) {
                    return null;
                }
            }
        };

        const localStorage = getStorage();

        this.setItem = function setItem(key, item) {
            data[key] = item;
            if (localStorage) {
                localStorage.setItem(KEY, JSON.stringify(data));
            }
        };

        this.getItem = function getItem(key) {
            if (localStorage) {
                data = JSON.parse(localStorage.getItem(KEY)) || {};
            }

            return data[key];
        };
    };
});