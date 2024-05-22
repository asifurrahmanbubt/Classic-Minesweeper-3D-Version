/*global define */
define(['dialog'], function (dialog) {
    "use strict";
    return function displayScore({x, y, z, mines}) {
        let text = 'Highscores for ' + x + 'x' + y + 'x' + z + ', ' + mines + ' mines:\n';
        const leaderBoard = score.leaderBoard;
        const l = leaderBoard.length;

        if (!l) {
            dialog.alert('No results for this settings yet');
        } else {
            for (let i = 0; i < l; i += 1) {
                const { position, name, time } = leaderBoard[i];
                text += position + ')' + ' ' + name + ' - ' + time + '\n';
            }

            dialog.alert(text);
        }
    };
});