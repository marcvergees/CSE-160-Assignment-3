var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }
`;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }`;


let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_GlobalRotateMatrix;

let g_showAxis = true;
let g_globalAngle = 0;

let g_firstFlipperAngle = 0;
let g_secondFlipperAngle = 0;
let g_middleFlipperAngle = 0;
let g_movementAngle = 45;
let g_shellScale = .8;
let g_headAngle = 0;

let g_animationFirstFlipper = false;
let g_animationSecondFlipper = false;
let g_animationMiddleFlipper = false;
let g_animationMovement = false;
let g_pokeAnimation = false;
let g_pokeStartTime = 0;

let sceneMatrix = new Matrix4();
let stats;

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;


function createStats() {
    stats = new Stats();
    stats.dom.style.left = "auto";
    stats.dom.style.right = "0";
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
}

function click(event) {
    if (event.shiftKey) {
        g_pokeAnimation = true;
        g_pokeStartTime = g_seconds;
    } else {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        sceneMatrix.setIdentity();
        // I did a little trick here, that way we can rotate in a more natural way.
        sceneMatrix.rotate(-x, 0, 1, 0);
        sceneMatrix.rotate(y, 1, 0, 0);
    }
}

function setUpWebGL() {
    canvas = document.getElementById('webgl');
    canvas.onmousedown = click;
    // canvas.onmousemove = click;
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (u_ModelMatrix < 0) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (u_GlobalRotateMatrix < 0) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (u_ViewMatrix < 0) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }
    gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (u_ProjectionMatrix < 0) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);
}

function addActionsForHTMLUI() {
    document.getElementById("angleSlide").addEventListener("mousemove", function () { g_globalAngle = this.value; renderScene(); });
    document.getElementById("firstFlipperAngle").addEventListener("mousemove", function () { g_firstFlipperAngle = this.value; renderScene(); });
    document.getElementById("secondFlipperAngle").addEventListener("mousemove", function () { g_secondFlipperAngle = this.value; renderScene(); });
    document.getElementById("middleFlipperAngle").addEventListener("mousemove", function () { g_middleFlipperAngle = this.value; renderScene(); });
    document.getElementById("my-toggle").addEventListener("change", function () { g_showAxis = this.checked; renderScene(); });

    document.getElementById("my-toggle-middleFlipper").addEventListener("change", function () { g_animationMiddleFlipper = this.checked; });
    document.getElementById("my-toggle-firstFlipper").addEventListener("change", function () { g_animationFirstFlipper = this.checked; });
    document.getElementById("my-toggle-secondFlipper").addEventListener("change", function () { g_animationSecondFlipper = this.checked; });
    document.getElementById("my-toggle-movement").addEventListener("change", function () {
        if (this.checked) {
            g_animationFirstFlipper = true;
            g_animationSecondFlipper = true;
            g_animationMiddleFlipper = true;
            g_animationMovement = true;
        } else {
            g_animationFirstFlipper = false;
            g_animationSecondFlipper = false;
            g_animationMiddleFlipper = false;
            g_animationMovement = false;
            g_headAngle = 0;
        }
    });
}

function main() {
    createStats();
    setUpWebGL();
    connectVariablesToGLSL();
    addActionsForHTMLUI();
    canvas.onmousedown = click;
    canvas.onmousemove = function (ev) { if (ev.buttons == 1) click(ev); }; // if we remove ev.buttons == 1, we can drag the mouse without clicking. But we want click+drag to work.
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // renderScene();
    requestAnimationFrame(tick);
}

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    updateAnimationAngles();
    stats.begin();
    renderScene();
    stats.end();
    requestAnimationFrame(tick);
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
    return [x, y];
}

// var body = new Cube();
// body.matrix.rotate(45, 0, 0, 1);
// body.matrix.scale(.5, .5, .5);
// body.matrix.translate(-.5, -.5, -.5);
// body.render();

function body(matrix) {
    var sphere = new Sphere();
    sphere.color = green_body;
    sphere.matrix = new Matrix4(matrix);
    sphere.matrix.scale(1, 0.4, 0.4);
    sphere.render();
}

function updateAnimationAngles() {
    if (g_animationFirstFlipper) {
        g_firstFlipperAngle = 5 * Math.sin(3 * g_seconds);
    } if (g_animationSecondFlipper) {
        g_secondFlipperAngle = 20 * Math.sin(3 * g_seconds);
    } if (g_animationMiddleFlipper) {
        g_middleFlipperAngle = 15 * Math.sin(g_seconds);
    } if (g_animationMovement) {
        g_movementAngle = 45 + 10 * Math.sin(g_seconds);
        g_headAngle = 10 * Math.sin(g_seconds);
        g_shellScale = .8 + .03 * Math.sin(g_seconds);
    }
}

function leg(matrix) {
    // Draw the flipper upper cube
    matrix.rotate(g_firstFlipperAngle, 0, 0, 1);
    var flipper_upper_cube = new Cube();
    flipper_upper_cube.color = flipper_upper;
    flipper_upper_cube.matrix = new Matrix4(matrix);
    flipper_upper_cube.matrix.translate(-.15, -.75, 0.0);
    flipper_upper_cube.matrix.rotate(-5, 1, 0, 0);
    flipper_upper_cube.matrix.scale(0.3, .3, .5);
    flipper_upper_cube.render();

    // Draw the flipper lower cube
    var flipper_lower_cube = new Cube();
    flipper_lower_cube.color = flipper_lower;
    flipper_lower_cube.matrix = new Matrix4(matrix);
    flipper_lower_cube.matrix.translate(0, -.5, 0.0);
    flipper_lower_cube.matrix.rotate(-5, 1, 0, 0);

    flipper_lower_cube.matrix.rotate(-g_middleFlipperAngle, 1, 0, 0);

    var yellowCoordinatesMat = new Matrix4(flipper_lower_cube.matrix);
    flipper_lower_cube.matrix.scale(0.25, .4, .5);
    flipper_lower_cube.matrix.translate(-.5, 0, 0);
    flipper_lower_cube.render();

    // Draw the flipper tip cube
    var flipper_tip_cube = new Cube();
    flipper_tip_cube.color = flipper_tip;
    flipper_tip_cube.matrix = yellowCoordinatesMat;
    flipper_tip_cube.matrix.translate(0, 0.35, 0);
    flipper_tip_cube.matrix.rotate(g_secondFlipperAngle, 0, 0, 1);
    flipper_tip_cube.matrix.scale(.3, .3, .3);
    flipper_tip_cube.matrix.translate(-.5, 0, -0.001);
    flipper_tip_cube.render();
}


function legs(matrix) {
    let M = new Matrix4(matrix);

    // Front left leg
    M.rotate(90, 1, 0, 0);
    M.rotate(90, 0, 1, 0);
    M.scale(0.4, 0.4, 0.4);
    M.translate(-.3, 1, 0.2);
    leg(M);

    // Back right leg
    M = new Matrix4(matrix);
    M.rotate(90, 1, 0, 0);
    M.rotate(-90, 0, 1, 0);
    M.rotate(180, 0, 0, 1);
    M.scale(0.4, 0.4, 0.4);
    M.translate(-.3, 1, 0.2);
    leg(M);

    // Back left leg
    M = new Matrix4(matrix);
    M.rotate(90, 1, 0, 0);
    M.rotate(90, 0, 1, 0);
    M.scale(0.4, 0.4, 0.4);
    M.translate(-.3, 1, -0.7);
    leg(M);

    // Front right leg
    M = new Matrix4(matrix);
    M.rotate(90, 1, 0, 0);
    M.rotate(-90, 0, 1, 0);
    M.rotate(180, 0, 0, 1);
    M.scale(0.4, 0.4, 0.4);
    M.translate(-.3, 1, -0.7);
    leg(M);
}

function eye(matrix) {
    var white = new Sphere();
    white.color = white_eyeball;
    white.segments = 20;
    white.matrix = new Matrix4(matrix);
    white.matrix.scale(0.1, 0.1, 0.1);
    white.render();

    var black = new Sphere();
    black.color = black_eyeball;
    black.segments = 20;
    black.matrix = new Matrix4(matrix);
    black.matrix.scale(0.05, 0.05, 0.05);
    black.matrix.translate(1, 0, 0);
    black.render();
}

function mouth(matrix, color) {
    var cube = new Cube();
    cube.color = color;
    cube.matrix = new Matrix4(matrix);
    cube.matrix.scale(0.05, 0.05, 0.2);
    cube.matrix.translate(0, 0, -.5);
    cube.render();
}

function tongue(matrix) {
    var cube = new Cube();
    cube.color = white_eyeball;
    cube.matrix = new Matrix4(matrix);
    cube.matrix.scale(0.05, 0.05, 0.2);
    cube.matrix.translate(0, 0, -.5);
    cube.render();
}

function head_ball(matrix) {
    var sphere = new Sphere();
    sphere.color = green_body;
    sphere.segments = 20;
    sphere.matrix = new Matrix4(matrix);
    sphere.matrix.scale(.6, .6, .6);
    // sphere.matrix.translate(1, .25, 0);
    sphere.render();
}

function eyes(matrix) {
    let M1 = new Matrix4(matrix);
    M1.translate(0.25, .15, -0.15);
    M1.scale(1.5, 1.5, 1.5);
    eye(M1);

    M1 = new Matrix4(matrix);
    M1.translate(0.25, .15, 0.15);
    M1.scale(1.5, 1.5, 1.5);
    eye(M1);
}

function full_mouth(matrix) {
    let M1 = new Matrix4(matrix);
    M1.translate(.25, -0.15, 0);
    mouth(M1, mouth_color);
    M1 = new Matrix4(matrix);
    M1.translate(.25, -0.20, 0);
    mouth(M1, black_eyeball);
}

function head(matrix) {
    const M = new Matrix4(matrix);
    M.rotate(g_headAngle, 0, 1, 0);
    M.translate(.6, .2, 0);

    head_ball(M);
    eyes(M);
    full_mouth(M);
    tongue(M);
}

function axis(matrix) {
    if (g_showAxis) {
        var cube = new Cube();
        cube.matrix = new Matrix4(matrix);

        // X axis: color red
        cube.color = [1.0, 0.0, 0.0, 1.0];
        cube.matrix.scale(2, .01, .01);
        cube.render();

        // Y axis: color green
        cube.matrix = new Matrix4(matrix);
        cube.color = [0.0, 1.0, 0.0, 1.0];
        cube.matrix.scale(.01, 2, .01);
        cube.render();

        // Z axis: color blue
        cube.matrix = new Matrix4(matrix);
        cube.color = [0.0, 0.0, 1.0, 1.0];
        cube.matrix.scale(.01, .01, 2);
        cube.render();
    }
}

function shell(matrix) {
    var sphere = new Sphere();
    sphere.color = shell_yellow;
    sphere.segments = 8;
    sphere.matrix = new Matrix4(matrix);
    sphere.matrix.scale(g_shellScale, g_shellScale, g_shellScale);
    sphere.matrix.translate(0, .25, 0);
    sphere.render();
}

function tail(matrix) {
    var tail_cube = new Cube();
    tail_cube.color = green_body;
    tail_cube.matrix = new Matrix4(matrix);
    tail_cube.matrix.rotate(g_movementAngle, 0, 0, 1);
    tail_cube.matrix.scale(.1, .35, .1);
    tail_cube.matrix.translate(-3, 0.6, -.6);
    tail_cube.render();
}

function drawTurtle(matrix) {
    axis(matrix);
    head(matrix);
    body(matrix);
    shell(matrix);
    legs(matrix);
    tail(matrix);
}

function renderScene() {
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);

    if (g_pokeAnimation) {
        let timeElapsed = g_seconds - g_pokeStartTime;
        if (timeElapsed > 1.0) {
            g_pokeAnimation = false;
        } else {
            // Jump up and down
            let jumpHeight = Math.sin(timeElapsed * Math.PI);
            globalRotMat.translate(0, jumpHeight, 0);
            // Spin around Y axis (3 full rotations)
            globalRotMat.rotate(timeElapsed * 360 * 3, 0, 1, 0);
        }
    }

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var startTime = performance.now();
    // drawTurtle(sceneMatrix);

    var cube = new Cube();
    cube.color = green_body;
    cube.matrix = new Matrix4(sceneMatrix);
    cube.matrix.scale(.5, .5, .5);
    cube.render();

    var endTime = performance.now();
    sendTextToHTML("ms: " + Math.floor(endTime - startTime) + " fps: " + Math.floor(1000 / (endTime - startTime)), "fps");
}

function sendTextToHTML(text, htmlID) {
    var element = document.getElementById(htmlID);
    if (!element) {
        console.error("Failed to get the HTML element");
        return;
    }
    element.innerText = text;
}

