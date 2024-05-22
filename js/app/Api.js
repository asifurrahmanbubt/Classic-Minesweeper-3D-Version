/*global define */
define(['config', 'ApiLocal', 'ApiRemote'], function (config, Local, Remote) {
    "use strict";
    return function Api() {
        const api = config.api.local ? new Local() : new Remote();

        this.gameOver = function gameOver(data) {
            return api.gameOver(data);
        };

        this.popular = function popular() {
            return api.popular();
        };

        this.scores = function scores(data) {
            return api.scores(data);
        };
    };
});