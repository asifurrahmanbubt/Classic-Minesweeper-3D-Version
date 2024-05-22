/*global define */
/*jslint browser: true */
define(['./Storage'], function (Storage) {
    "use strict";
    const KEY = 'scores';
    const MAX_POSITION = 10;
    const POPULAR_RESULTS = 10;
    const store = new Storage();
    const storage = {
        load: function () {
            return store.getItem(KEY);
        },
        save: function (value) {
            store.setItem(KEY, value);
        },
    };
    const getScores = function getScores(size) {
        return (storage.load() || [])
            .filter(({ x, y, z, mines }) => (x === x && y === y && z === size.z && mines === size.mines))
            .map((score, index)  => ({...score, position: index + 1}))
            .slice(0, MAX_POSITION);
    };

    const insertScores = function insertScores(size, score) {
        const s = getScores(size);
        s.push(score);
        s.sort(function (a, b) {
            if (a.time < b.time) {
                return -1;
            }
            if (a.time > b.time) {
                return 1;
            }
            if (a.timestamp < b.timestamp) {
                return -1;
            }
            if (a.timestamp > b.timestamp) {
                return 1;
            }
        });
        storage.save(s);
    };

    const getPopular = function getPopular() {
        const popular = {};
        const scores = storage.load() || [];
        const key = function key(score) {
            return [score.x, score.y, score.z, score.mines].join('.');
        };

        scores.forEach(function (score) {
            const k = key(score);
            if (!popular[k]) {
                popular[k] = 0;
            }
            popular[k] += 1;
        });

        scores.sort(function (a, b) {
            return popular[key(a)] > popular[key(b)]
                ? -1
                : 1;
        });

        return scores;
    };

    const validateScoresObj = function validateScoresObj(obj) {
        return ['name', 'time', 'timestamp', 'x', 'y', 'z', 'mines'].every(function (k) {
            return obj.hasOwnProperty(k);
        });
    };

    return function Api() {
        this.gameOver = function gameOver(data) {
            if (!validateScoresObj(data)) {
                return false;
            }
            insertScores(data, data);

            return this.scores(data);
        };

        this.popular = function popular() {
            return {
                then: function then(cb) {
                    cb({
                        success: true,
                        popular: getPopular()
                    });
                }
            };
        };
        this.scores = function scores(data) {
            return {
                then: function then(cb) {
                    cb({
                        ...data,
                        success: true,
                        leaderBoard: getScores(data)
                    });
                }
            };
        };
    };
});
