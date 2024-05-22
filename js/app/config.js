/*global define */
define(function () {
    "use strict";
    return {
        api: {
            local: true,
            root: 'http://api.mines3d',//relevant only if !local
            urls: {
                ameOver: '/game/save',
                scores: '/game/scores',
                popular: '/game/popular',
                token: '/token',
            },
        },
    };
});
