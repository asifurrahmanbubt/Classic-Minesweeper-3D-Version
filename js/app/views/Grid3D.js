/*global define */
define(['three', 'utils', 'views/Cell3D', 'EventListener'], function (THREE, utils, Cell, EventListener) {
    "use strict";
    const Grid = function Grid(o) {
        const that = this;
        const el = new THREE.Object3D();

        let paused = false;
        let active = true;
        let initialized = false;
        let placingFlags = false;
        let x = o.x;
        let y = o.y;
        let z = o.z;
        let mines = o.mines;
        let cells = [];

        const empty = function empty() {
            that.getCells().forEach(function (cell) {
                el.remove(cell.getEl());
            });
        };

        const bind = function bind() {
            const clk = function clk(cell) {
                const mine = cell.isMine();

                if (cell.isFlagged()) {
                    return;
                }
                cell.setRevealed(true);

                if (mine) {
                    that.revealMines(cell);
                    that.setActive(false);
                    that.trigger(Grid.EVENT_GAME_OVER, {
                        cell: cell,
                        status: Grid.STATUS_LOSS
                    });
                } else if (!cell.getNumber()) {
                    that.getNeighbouringCells(cell).forEach(function (n) {
                        if (!n.isRevealed()) {
                            clk(n);
                        }
                    });
                }
            };

            that.on(Grid.EVENT_MOUSE_CLICK, function ({ cell, which }) {
                if (!that.isActive() || that.isPaused()) {
                    return;
                }
                if (which === Grid.MOUSE_LEFT && !that.isPlacingFlags()) {
                    if (!that.isInitialized()) {
                        that.generateMines(cell);
                        that.setInitialized(true);
                    }
                    clk(cell);
                    that.victoryCheck();
                } else {
                    cell.setFlagged(!cell.isFlagged());
                    that.trigger(Grid.EVENT_MINES_LEFT_CHANGE, that.getMinesLeft());
                }
            });

            that.on(Grid.EVENT_MOUSE_ENTER, function (cell) {
                cell.trigger(Cell.EVENT_MOUSE_OVER);
            });

            that.on(Grid.EVENT_MOUSE_OUT, function (cell) {
                cell.trigger(Cell.EVENT_MOUSE_OUT);
            });
        };

        this.getX = function getX() {
            return x;
        };

        this.getY = function getY() {
            return y;
        };

        this.getZ = function getZ() {
            return z;
        };

        this.getEl = function getEl() {
            return el;
        };

        this.getCells = function getCells() {
            return cells;
        };

        this.getCell = function getCell({ x, y, z }) {
            return this.getCells().filter(function (cell) {
                return cell.getX() === x
                    && cell.getY() === y
                    && cell.getZ() === z;
            })[0];
        };

        this.setMines =  function setMines(newMines) {
            mines = newMines;
        };

        this.getMines = function getMines() {
            return mines;
        };

        this.generateMines = function generateMines(excludedCell) {
            let placedMines = 0;

            while (placedMines < mines) {
                let c = that.getCell({
                    x: utils.random(x - 1),
                    y: utils.random(y - 1),
                    z: utils.random(z - 1)
                });
                if (!c.isMine() && c !== excludedCell) {
                    c.setMine(true);
                    placedMines += 1;
                }
            }

            this.getCells().forEach(function (c) {
                const neighbours = that.getNeighbouringCells(c);
                if (!c.isMine()) {
                    c.setNumber(neighbours.reduce(function (prev, c1) {
                        return prev + c1.isMine();
                    }, 0));
                }
            });
        };

        this.getBoxes = function getBoxes() {
            return cells.map(function (cell) {
                return cell.getBox();
            });
        };
        this.getNeighbouringCells = function getNeighbouringCell(o) {
            const opos = o.getPosition();

            return this.getCells().filter(function (cell) {
                const pos = cell.getPosition();

                return cell !== o
                    && Math.abs(opos.x - pos.x) <= 1
                    && Math.abs(opos.y - pos.y) <= 1
                    && Math.abs(opos.z - pos.z) <= 1;
            });
        };

        this.getMinesLeft = function getMinesLeft() {
            const markedMines = that.getCells()
                .filter((cell) => cell.isFlagged())
                .length;

            return Math.max(0, that.getMines() - markedMines);
        };

        this.revealMines = function revealMines(cell) {
            that.getCells().forEach(function (c) {
                if (c === cell) {
                    c.setSteppedMine(true);
                    c.setRevealed(true);
                } else if (c.isMine() && !c.isFlagged()) {
                    c.setRevealed(true);
                }
            });
        };

        this.victoryCheck = function victoryCheck() {
            const unrevealedEmpty = that.getCells().reduce(function (prev, cell) {
                return prev + (!cell.isRevealed() && !cell.isMine());
            }, 0);

            if (!unrevealedEmpty) {
                that.setActive(false);
                that.trigger(Grid.EVENT_GAME_OVER, {
                    status: Grid.STATUS_VICTORY
                });
            }
        };

        this.setX = function setX(newX) {
            x = newX;
        };

        this.setY = function setY(newY) {
            y = newY;
        };

        this.setZ = function setZ(newZ) {
            z = newZ;
        };

        this.reset = function reset({ x, y, z, mines }) {
            const cellSize = Cell.SIZE;
            const d = Cell.DISTANCE;

            empty();
            this.setX(x);
            this.setY(y);
            this.setZ(z);
            this.setMines(mines);
            this.setInitialized(false);
            this.setActive(true);
            this.setPaused(false);

            cells = [];

            for (let i = 0; i < x; i += 1) {
                for (let j = 0; j < y; j += 1) {
                    for (let k = 0; k < z; k += 1) {
                        let cell = new Cell({
                            x: i,
                            y: j,
                            z: k,
                            mine: false,
                            number: 0
                        });
                        let cellEl = cell.getEl();

                        cellEl.position.set(
                            (d + cellSize) * (i - x / 2 + 0.5),
                            (d + cellSize) * (y / 2 - j - 0.5),
                            (d + cellSize) * (z / 2 - k - 0.5),
                        );
                        cells.push(cell);
                        el.add(cellEl);
                    }
                }
            }
        };

        this.isActive = function isActive() {
            return active;
        };

        this.setActive = function setActive(newActive) {
            active = newActive;
        };

        this.isInitialized = function isInitialized() {
            return initialized;
        };

        this.setInitialized = function setInitialized(newInitialized) {
            initialized = newInitialized;
            that.trigger(Grid.EVENT_INIT, initialized);
        };

        this.isPaused = function isPaused() {
            return paused;
        };

        this.setPaused = function setPaused(newPaused) {
            paused = newPaused;
        };

        this.setPlacingFlags = function setPlacingFlags(newPlacingFlags) {
            placingFlags = newPlacingFlags;
        };

        this.isPlacingFlags = function isPlacingFlags() {
            return placingFlags;
        };

        EventListener.subscribe(that);
        bind();

        that.reset(o);
    };

    Grid.STATUS_VICTORY = 'victory';
    Grid.STATUS_LOSS = 'loss';
    Grid.EVENT_MOUSE_ENTER = 'mouse-enter';
    Grid.EVENT_MOUSE_OUT = 'mouse-out';
    Grid.EVENT_MOUSE_CLICK = 'mouse-click';
    Grid.EVENT_GAME_OVER = 'game-over';
    Grid.EVENT_MINES_LEFT_CHANGE = 'mines-left-change';
    Grid.EVENT_INIT = 'init';
    Grid.MOUSE_LEFT = 0;
    Grid.MOUSE_RIGHT = 2;

    return Grid;
});