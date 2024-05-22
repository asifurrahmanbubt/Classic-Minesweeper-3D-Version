/*global require, define */
/*jslint browser: true */
require.config({
    baseUrl: './js/app',
    paths: {
        three: '../vendor/three.min',
        TrackballControls: '../vendor/TrackballControls',
        OrbitControls: '../vendor/OrbitControls',
        Detector: '../vendor/Detector',
        optimer: '../vendor/fonts/optimer_bold.typeface',
        keyboardState: '../vendor/THREEx.KeyboardState',
        fullScreen: '../vendor/THREEx.FullScreen',
        reqwest: '../vendor/reqwest',
        nanoModal: '../vendor/nanomodal.min',
    },
    shim: {
        three: {
            exports: 'THREE'
        },
        TrackballControls: {
            deps: ['three']
        },
        OrbitControls: {
            deps: ['three']
        },
        Detector: {
            exports: 'Detector'
        },
        optimer: {
            deps: ['three']
        },
        keyboardState: {
            exports: 'THREEx'
        },
        fullScreen: {
            depts: ['keyboardState']
        }
    }
});
define(['three', 'Clock', 'Detector', 'UI', 'Api', 'Settings', 'Storage', 'utils', 'views/Grid3D', 'displayScore', 'dialog', 'keyboardState', 'OrbitControls', 'optimer', 'fullScreen'], function (THREE, Clock, Detector, UI, Api, Settings, Storage, utils, Grid, displayScore, dialog, THREEx) {
    "use strict";
    let grid;
    let clock;
    const config = {
        debug: false,
        fog: true,
        cache: false,
        renderer: {
            antialias: false,
            alpha: true
        },
        camera: {
            fov: 75,
            position: {
                x: 0,
                y: 0,
                z: 200
            },
            aspect: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 1000
        },
        controls: {
            rotateSpeed: 1.0,
            zoomSpeed: 1.2,
            panSpeed: 0.8,
            noZoom: false,
            noPan: false,
            staticMoving: true,
            dynamicDampingFactor: 0.3,
        },
        lights: [{
            type: 'DirectionalLight',
            color: 0xffffff,
            position: {
                x: 1,
                y: 1,
                z: 1
            }
        }, {
            type: 'DirectionalLight',
            color: 0x002288,
            position: {
                x: -1,
                y: -1,
                z: -1
            }
        }, {
            type: 'AmbientLight',
            color: 0x222222
        }]
    };
    const LAMBDA = 0.1;
    const ui = new UI();
    const api = new Api();
    const storage = new Storage();
    const app = {
        mouse: new THREE.Vector3(0, 0, 0.5),
        hoveredCell: null
    };

    const render = function render() {
        app.renderer.render(app.scene, app.camera);
        if (clock.running) {
            ui.setTime(utils.pad(Math.round(clock.getElapsedTime())));
        }
    };

    const pause = ({ updateUi} = {updateUi: false}) => {
        clock.stop();
        grid.setPaused(true);
        app.scene.fog.density = 0.1;
        if (updateUi) {
            ui.elements.pause.checked = true;
        }
    };

    const resume = ({updateUi} = {updateUi: false}) => {
        if (updateUi) {
            ui.elements.pause.checked = false;
        }

        app.scene.fog.density = 0.00025;

        if (!grid.isInitialized()) {
            return;
        }
        clock.start();
        grid.setPaused(false);
    };

    const animate = function animate() {
//            if (grid.isInitialized() && !grid.isPaused() && grid.isActive()) {
//                clock.start();
//            }
        if (!document.hasFocus() && clock.running) {
            pause({updateUi: true});
        }
        window.requestAnimationFrame(animate);
        app.controls.update();
        render();
//            if (grid.isInitialized() && !grid.isPaused() && grid.isActive()) {
//                clock.stop();
//            }
//            update();
    };

    const handlers = {
        mouse: {
            move: function ({ clientX, clientY }) {
                app.mouse.x = (clientX / window.innerWidth) * 2 - 1;
                app.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
                app.mouse.unproject(app.camera);
                app.mouse.sub(app.camera.position);
                app.mouse.normalize();

                const rayCaster = new THREE.Raycaster(app.camera.position, app.mouse);
                const intersections = rayCaster.intersectObjects(grid.getBoxes());

                if (intersections.length) {
                    const o = intersections.reduce(function (prev, interaction) {
                        var cell;
                        if (prev) {
                            return prev;
                        }
                        cell = interaction.object.cell;
                        if (cell.isFlagged() && app.keyboard.pressed('shift')) {
                            return cell;
                        }
                        if (!cell.isRevealed() && !cell.isFlagged()) {
                            return cell;
                        }
                        return null;
                    }, null);
                    if (app.hoveredCell && app.hoveredCell !== o) {
                        grid.trigger(Grid.EVENT_MOUSE_OUT, app.hoveredCell);
                    }
                    if (o) {
                        app.hoveredCell = o;
                        grid.trigger(Grid.EVENT_MOUSE_ENTER, app.hoveredCell);
                    }
                } else if (app.hoveredCell) {
                    grid.trigger(Grid.EVENT_MOUSE_OUT, app.hoveredCell);
                    app.hoveredCell = null;
                }
            },
            up: function ({ button }) {
                const cell = app.hoveredCell;
                if (cell && app.mouseHeld) {
                    if (Math.abs(app.mouseHeld.x - app.mouse.x) + Math.abs(app.mouseHeld.y - app.mouse.y) < LAMBDA) {
                        grid.trigger(Grid.EVENT_MOUSE_CLICK, {
                            which: button,
                            cell: cell
                        });
                    }
                }
                app.mouseHeld = null;
                if (grid.isActive()) {
                    ui.resetSmiley();
                }
            },
            down: function () {
                app.mouseHeld = app.mouse.clone();
                if (grid.isActive()) {
                    ui.setSmiley(UI.CSS_SMILEY_SHOCK_CLASS);
                }
            }
        }
    };

    const initLights = function initLights() {
        app.lights = [];
        config.lights.forEach(function (lightConfig) {
            const pos = lightConfig.position;
            let light = new THREE[lightConfig.type](lightConfig.color);

            if (pos) {
                light.position.set(pos.x, pos.y, pos.z);
            }

            app.scene.add(light);
            app.lights.push(light);
        });

        return app.lights;
    };

    const initCamera = function initCamera() {
        app.camera = new THREE.PerspectiveCamera(config.camera.fov, config.camera.aspect, config.camera.near, config.camera.far);
        app.camera.position.set(config.camera.position.x, config.camera.position.y, config.camera.position.z);
    };

    const initControls = function initControls() {
        app.controls = new THREE.OrbitControls(app.camera, app.container);
        app.controls.rotateSpeed = config.controls.rotateSpeed;
        app.controls.zoomSpeed = config.controls.zoomSpeed;
        app.controls.panSpeed = config.controls.panSpeed;
        app.controls.noZoom = config.controls.noZoom;
        app.controls.noPan = config.controls.noPan;
        app.controls.staticMoving = config.controls.staticMoving;
        app.controls.dynamicDampingFactor = config.controls.dynamicDampingFactor;
    };

    const initRenderer = function initRenderer() {
        app.renderer = new THREE.WebGLRenderer(config.renderer);//utils.webglAvailable() ? new THREE.WebGLRenderer(config.renderer) : new THREE.CanvasRenderer(config.renderer); // Fallback to canvas renderer, if necessary.
        if (config.fog) {
            app.scene.fog = new THREE.FogExp2(0xcccccc);
            app.renderer.setClearColor(app.scene.fog.color);
        }
        app.renderer.setPixelRatio(window.devicePixelRatio);
        app.renderer.setSize(window.innerWidth, window.innerHeight);
        app.container.appendChild(app.renderer.domElement);
    };

    const initGrid = function initGrid() {
        const s = ui.settings.get(Settings.SOURCE_STORAGE);
        grid = new Grid(s);
        ui.settings.set(Settings.SOURCE_INPUT, s);
        app.scene.add(grid.getEl());
        ui.setMinesLeft(grid.getMines());
    };

    const bind = function () {
        app.controls.addEventListener('change', render);

        window.addEventListener('resize', function () {
            app.camera.aspect = window.innerWidth / window.innerHeight;
            app.camera.updateProjectionMatrix();
            app.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);

        app.renderer.domElement.addEventListener('mousemove', handlers.mouse.move, false);
        app.renderer.domElement.addEventListener('mouseup', handlers.mouse.up, false);
        app.renderer.domElement.addEventListener('mousedown', handlers.mouse.down, false);

        grid.on(Grid.EVENT_GAME_OVER, function ({ status }) {
            let name = storage.getItem('name');
            console.log('name from storage', name);
            const timestamp = Math.floor(Date.now() / 1000);
            const victory = () => {
                ui.setSmiley(UI.CSS_SMILEY_SUNGLASSES_CLASS);
                api.gameOver({
                    status,
                    name,
                    time: Math.floor(clock.getElapsedTime()),
                    timestamp,
                    y: grid.getX(),
                    x: grid.getY(),
                    z: grid.getZ(),
                    mines: grid.getMines()
                }).then(function (response) {
                    if (response.success) {
                        // displayScore(response);

                        return;
                    }
                    dialog.alert(response.message);
                });
            };
            const prompt = function prompt(input) {
                if (!input) {
                    dialog.prompt('You won, please enter your name', name ?? 'Anonymous', prompt);

                    return;
                }
                name = input;
                storage.setItem('name', name);
                ui.setName(name);
                victory();
            };
            clock.reset();
            clock.stop();
            if (status === Grid.STATUS_VICTORY) {
                dialog.prompt('You won, please enter your name', name ?? 'Anonymous', prompt);

                return;
            }

            if (status === Grid.STATUS_LOSS) {
                ui.setSmiley(UI.CSS_SMILEY_DEAD_CLASS);
            }

        });
        grid.on(Grid.EVENT_MINES_LEFT_CHANGE, function (minesLeft) {
            ui.setMinesLeft(minesLeft);
        });
        grid.on(Grid.EVENT_INIT, function (initialized) {
            initialized ? clock.start() : clock.stop();
        });
        // api.popular().then(ui.populatePopular);

        ui.on(UI.EVENT_NEW_GAME, function () {
            const o = ui.settings.get(Settings.SOURCE_INPUT);
            ui.settings.set(Settings.SOURCE_STORAGE, o);
            grid.reset(o);
            ui.resetSmiley();
            clock = new Clock();
            ui.setTime(0);
            ui.setMinesLeft(o.mines);
        });

        ui.on(UI.EVENT_SHOW_SCORE, function () {
            api.scores({
                x: grid.getX(),
                y: grid.getY(),
                z: grid.getZ(),
                mines: grid.getMines()
            }).then(function (response) {
                displayScore(response);
            });
        });

        ui.on(UI.EVENT_TOGGLE_FLAGS, grid.setPlacingFlags);

        ui.on(UI.EVENT_HELP, function () {
            pause({updateUi: true});
            dialog.alert(document.getElementById('help-message').innerHTML, () => resume({updateUi: true}));
        });

        ui.on(UI.EVENT_PAUSE, function (paused) {
            if (paused) {
                pause();

                return;
            }

            resume();
        });

        ui.on(UI.EVENT_RESET, () => {
            // @todo this needs some reworking.
            const s = ui.settings.get(Settings.SOURCE_STORAGE);
            grid.reset(s);
            clock.reset();
            clock.stop();

            ui.setMinesLeft(grid.getMines());
            ui.setTime(clock.elapsedTime);
            ui.resetSmiley();
        });

        THREEx.FullScreen.bindKey({
            charCode: true,//config.fullscreen.charCode,
            dblclick: true,
            container: app.container
        });

        window.addEventListener('load', function () {
            setTimeout(function () {
                window.scrollTo(0, 1);
            }, 1);
        }, false);
    };

    const initDebugger = function initDebugger() {
        if (config.debug) {
            window.app = app;
            window.grid = grid;
            window.clock = clock;
            window.ui = ui;

            return;
        }

        const noop = function () {};
        window.console = {
            log: noop,
            error: noop,
            assert: noop,
            debug: noop,
            info: noop,
            warn: noop,
        };
    };

    const initKeyboard = function initKeyboard() {
        app.keyboard = new THREEx.KeyboardState();
    };

    const initClock = function initClock() {
        clock = new Clock();
    };

    if (!Detector.webgl) {// || !utils.webglAvailable()) {
        Detector.addGetWebGLMessage();

        return;
    }

    app.container = document.getElementById('main');
    initCamera();
    initControls();
    initKeyboard();
    app.scene = new THREE.Scene();
    initGrid();
    initLights();
    initRenderer();
    initClock();
    bind();
    animate();
    initDebugger();
});