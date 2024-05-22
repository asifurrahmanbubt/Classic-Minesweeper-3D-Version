/*global define, Detector */
/*jslint browser: true */
(function () {
    "use strict";
    function webglAvailable() {
        try {
            const canvas = document.createElement('canvas');

            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));

        } catch (e) {
            return false;
        }
    }

    if (Detector.webgl && webglAvailable()) {
        define(['./app3D'], function () {
            const head  = document.getElementsByTagName('head')[0];
            const link  = document.createElement('link');

            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = './css/styles3d.css';
            link.media = 'all';
            head.appendChild(link);
        });
    } else {
        document.body.innerText = 'WebGl is required.';// @todo add more info
    }
}());