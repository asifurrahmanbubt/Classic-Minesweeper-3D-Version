/*global define */
/*jslint nomen: true */
define(['./config', 'reqwest'], function (config, reqwest) {
    "use strict";
    return function Api(_t) {
        let token = _t;

        const updateToken = function updateToken(response) {
            if (response.success && response._t) {
                token = response._t;
            }

            return response;
        };

        return {
            token: function () {
                return reqwest({
                    data: {
                        _t: token,
                    },
                    url: config.api.root + config.api.urls.token
                })
                    .then(updateToken);
            },
            gameOver: function (data) {
                data._t = token;

                return reqwest({
                    data: data,
                    method: 'POST',
                    url: config.api.root + config.api.urls.gameOver
                })
                    .then(updateToken);
            },
            popular: function () {
                return reqwest({
                    url: config.api.root + config.api.urls.popular
                })
                    .then(updateToken);
            },
            scores: function (data) {
                return reqwest({
                    data: data,
                    url: config.api.root + config.api.urls.scores
                })
                    .then(updateToken);
            }
        };
    };
});