/*jslint browser: true */
/*global define */
define(function () {
    "use strict";
    return {
        random: function random(from, to) {
            if (arguments.length === 1) {
                to = from;
                from = 0;
            } else if (to < from) {
                from = from + to;
                to = from - to;
                from = from - to;
            }
            return Math.floor((Math.random() * 1e5) % (to - from + 1) + from);
        },
        pad: function pad(number, digits, max) {
            if (typeof number !== 'number') {
                return number;
            }
            max = max === undefined ? 999 : max;
            digits = digits || 3;
            if (number > max) {
                return max.toString();
            }
            return (number < 100 ? '0' : '') + (number < 10 ? '0' : '') + number.toString();
        },
        get: function get(id) {
            return document.getElementById(id);
        }
    };
});