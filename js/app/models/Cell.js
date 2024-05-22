/*global define */
define(['EventListener'], function (EventListener) {
    "use strict";
    const Cell = function Cell(o) {
        const that = this;
        EventListener.subscribe(that);
        const x = o.x;
        const y = o.y;
        const z = o.z;
        let mine = o.mine || false;
        let revealed = o.revealed || false;
        let flagged = o.flagged || false;
        let number = o.number || 0;

        this.getX = function getX() {
            return x;
        };

        this.getY = function getY() {
            return y;
        };

        this.getZ = function getZ() {
            return z;
        };

        this.isMine = function isMine() {
            return mine;
        };

        this.setMine = function setMine(newMine/*, silent*/) {
            mine = newMine;
        };

        this.setNumber = function setNumber(newNumber) {
            number = newNumber;
        };

        this.getNumber = function getNumber() {
            return number;
        };

        this.setRevealed = function setRevealed(newRevealed, silent) {
            revealed = newRevealed;
            if (!silent) {
                this.trigger(Cell.EVENT_REVEAL, revealed);
            }
        };

        this.isRevealed = function isRevealed() {
            return revealed;
        };

        this.getPosition = function getPosition() {
            return {x, y, z};
        };

        this.setFlagged = function setFlagged(newFlagged, silent) {
            flagged = newFlagged;
            if (!silent) {
                this.trigger(Cell.EVENT_FLAG, flagged);
            }
        };

        this.isFlagged = function isFlagged() {
            return flagged;
        };

        this.toJSON = function toJSON() {
            return {
                mine,
                x,
                y,
                z,
                revealed,
                flagged,
                number,
            };
        };
    };

    Cell.EVENT_FLAG = 'flag';
    Cell.EVENT_REVEAL = 'reveal';

    return Cell;
});