/*jslint browser: true */
/*global define */
define(function () {
    "use strict";

    return function Clock(autoStart = true) {
        const now = function now() {
            return window.performance && window.performance.now ? window.performance.now() : Date.now();
        };

        this.autoStart = autoStart;
        this.startTime = 0;
        this.oldTime = 0;
        this.elapsedTime = 0;
        this.running = false;

        this.reset = function reset() {
            this.elapsedTime = 0;
            this.start();
        };

        this.start = function () {
            this.startTime = now();
            this.oldTime = this.startTime;
            this.running = true;
        };

        this.stop = function () {
            this.getElapsedTime();
            this.running = false;
        };

        this.getElapsedTime = function () {
            this.getDelta();

            return this.elapsedTime;
        };

        this.getDelta = function () {
            let diff = 0;
//            if (this.autoStart && !this.running) {
//                this.start();
//            }
            if (this.running) {
                let newTime = now();
                diff = 0.001 * (newTime - this.oldTime);
                this.oldTime = newTime;
                this.elapsedTime += diff;
            }

            return diff;
        };
    };
});