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
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    uniform sampler2D u_Sampler5;
    uniform sampler2D u_Sampler6;
    uniform sampler2D u_Sampler7;
    uniform int u_whichTexture;
    void main() {
        if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;                     // User color
        } else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);            // UV coordinates
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);     // Texture 0
        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);     // Texture 1
        } else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);     // Texture 2
        } else if (u_whichTexture == 3) {
            gl_FragColor = texture2D(u_Sampler3, v_UV);     // Texture 3
        } else if (u_whichTexture == 4) {
            gl_FragColor = texture2D(u_Sampler4, v_UV);     // Texture 4
        } else if (u_whichTexture == 5) {
            gl_FragColor = texture2D(u_Sampler5, v_UV);     // Texture 5
        } else if (u_whichTexture == 6) {
            gl_FragColor = texture2D(u_Sampler6, v_UV);     // Texture 6
        } else if (u_whichTexture == 7) {
            gl_FragColor = texture2D(u_Sampler7, v_UV);     // Texture 7
        } else {
            gl_FragColor = vec4(1, .2, .2, 1);              // Default color
        }
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
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_Sampler6;
let u_Sampler7;
let u_whichTexture;

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

let g_camera;
let sceneMatrix = new Matrix4();
let stats;

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var g_map = [
    // ENTRANCE 
    [7, 6, 7, 6, 7, 3, 4, 4, 3, 6, 6, 3, 4, 6.3, 8.3, 0, 0, 8.3, 6.3, 4, 3, 6, 6, 3, 4, 4, 3, 7, 6, 7, 6, 7],   // Row 0
    [6, 5.3, 5.3, 5.3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 5.3, 5.3, 5.3, 6],    // Row 1
    [7, 5.3, 5.3, 5.3, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 5.3, 5.3, 5.3, 7],    // Row 2
    [6, 5.3, 5.3, 5.3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 5.3, 5.3, 5.3, 6],    // Row 3
    [7, 6, 7, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 6, 7, 6, 7],    // Row 4
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 1.5, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1.5, 1.5, 0, 0, 0, 0, 0, 0, 0, 4],
    [3, 0, 0, 0, 0, 0, 0, 0, 1.5, 6.3, 4.3, 4.3, 4.3, 0, 0, 0, 0, 4.3, 4.3, 4.3, 4.3, 6.3, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [4, 0, 0, 0, 0, 0, 0, 0, 1.5, 4.3, 6.4, 6.4, 6.4, 0, 0, 0, 0, 6.4, 6.4, 6.4, 4.3, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 4.3, 6.4, 2.7, 1.7, 0, 0, 0, 0, 1.7, 2.7, 6.4, 4.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 4.3, 6.4, 1.7, 0, 0, 0, 0, 0, 0, 1.7, 6.4, 4.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [4, 0, 0, 0, 0, 0, 0, 0, 4, 4.3, 6.4, 0, 0, 0, 0, 0, 0, 0, 0, 6.4, 4.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 4, 4.3, 6.4, 0, 0, 0, 1.6, 1.6, 0, 0, 0, 6.4, 4.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [3, 0, 0, 0, 0, 0, 0, 0, 2, 4.3, 6.4, 0, 0, 0, 1.6, 1.6, 0, 0, 0, 6.4, 4.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [4, 0, 0, 0, 0, 0, 0, 0, 1.5, 4.3, 6.4, 0, 0, 0, 0, 0, 0, 0, 0, 6.4, 4.3, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 4.3, 6.4, 1.7, 0, 0, 0, 0, 0, 0, 1.7, 6.4, 4.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 4.3, 6.4, 2.7, 1.7, 0, 0, 0, 0, 1.7, 2.7, 6.4, 4.3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [4, 0, 0, 0, 0, 0, 0, 0, 1.5, 4.3, 6.4, 6.4, 6.4, 0, 0, 0, 0, 6.4, 6.4, 6.4, 4.3, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 1.5, 6.3, 4.3, 4.3, 4.3, 0, 0, 0, 0, 4.3, 4.3, 4.3, 4.3, 6.3, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 1.5, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1.5, 1.5, 0, 0, 0, 0, 0, 0, 0, 3],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [7, 6, 7, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 6, 7, 6, 7],    // Row 27
    [6, 5.3, 5.3, 5.3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 5.3, 5.3, 5.3, 6],    // Row 28
    [7, 5.3, 5.3, 5.3, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 5.3, 5.3, 5.3, 7],    // Row 29
    [6, 5.3, 5.3, 5.3, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 5.3, 5.3, 5.3, 6],    // Row 30
    [7, 6, 7, 6, 7, 3, 4, 4, 3, 6, 6, 3, 4, 6.3, 6.3, 0, 0, 6.3, 6.3, 4, 3, 6, 6, 3, 4, 4, 3, 7, 6, 7, 6, 7],   // Row 31 (bottom): Mirrored from Row 0
];

function drawMap() {
    for (let x = 0; x < g_map.length; x++) {
        for (let y = 0; y < g_map[x].length; y++) {
            if (g_map[x].length != 32) {
                console.log(g_map[x].length, x);
            }
            let height_to_get = parseInt(g_map[x][y]);
            for (let height = 0; height < height_to_get; height++) {
                var cube = new Cube();
                // cube.color = [.5, .5, .5, 1];
                var decimal = Math.round((g_map[x][y] - height_to_get) * 10) / 10;
                if (decimal == .3) {
                    cube.textureNum = 3;
                } else if (decimal == .4) {
                    cube.textureNum = 4;
                } else if (decimal == .5) {
                    cube.textureNum = 5;
                } else if (decimal == .6) {
                    cube.textureNum = 6;
                } else if (decimal == .7) {
                    cube.textureNum = 7;
                } else {
                    cube.textureNum = 2;
                }
                cube.matrix.translate(0, -.75 + height, 0);
                cube.matrix.translate(x - 16, 0, y - 16);
                cube.renderfast();
            }
        }
    }
    // for (let x = 0; x < 32; x++) {
    //     for (let y = 0; y < 32; y++) {
    //         if (x == 0 || x == 31 || y == 0 || y == 31) {
    //             var cube = new Cube();
    //             cube.color = [1, 1, 1, 1];
    //             cube.matrix.translate(0, -.75, 0);
    //             cube.matrix.scale(.4, .4, .4);
    //             cube.matrix.translate(x - 16, 0, y - 16);
    //             cube.renderfast();
    //         }
    //     }
    // }
}


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
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (u_Sampler0 < 0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (u_Sampler1 < 0) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (u_Sampler2 < 0) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (u_Sampler3 < 0) {
        console.log('Failed to get the storage location of u_Sampler3');
        return;
    }
    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if (u_Sampler4 < 0) {
        console.log('Failed to get the storage location of u_Sampler4');
        return;
    }
    u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
    if (u_Sampler5 < 0) {
        console.log('Failed to get the storage location of u_Sampler5');
        return;
    }
    u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
    if (u_Sampler6 < 0) {
        console.log('Failed to get the storage location of u_Sampler6');
        return;
    }
    u_Sampler7 = gl.getUniformLocation(gl.program, 'u_Sampler7');
    if (u_Sampler7 < 0) {
        console.log('Failed to get the storage location of u_Sampler7');
        return;
    }
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (u_ViewMatrix < 0) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (u_ProjectionMatrix < 0) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
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

function initTextures() {
    var image0 = new Image();
    if (!image0) {
        console.log('Failed to load the image');
        return false;
    }
    image0.onload = function () { sendImageToTEXTURE0(image0); };
    image0.src = '../img/floor.jpg';

    var image1 = new Image();
    if (!image1) {
        console.log('Failed to load the image');
        return false;
    }
    image1.onload = function () { sendImageToTEXTURE1(image1); };
    image1.src = '../img/sky.jpg';

    var image2 = new Image();
    if (!image2) {
        console.log('Failed to load the image');
        return false;
    }
    image2.onload = function () { sendImageToTEXTURE2(image2); };
    image2.src = '../img/stone.png';

    var image3 = new Image();
    if (!image3) {
        console.log('Failed to load the image');
        return false;
    }
    image3.onload = function () { sendImageToTEXTURE3(image3); };
    image3.src = '../img/wood.jpeg';

    var image4 = new Image();
    if (!image4) {
        console.log('Failed to load the image');
        return false;
    }
    image4.onload = function () { sendImageToTEXTURE4(image4); };
    image4.src = '../img/tree.png';

    var image5 = new Image();
    if (!image5) {
        console.log('Failed to load the image');
        return false;
    }
    image5.onload = function () { sendImageToTEXTURE5(image5); };
    image5.src = '../img/diamond.png';

    var image6 = new Image();
    if (!image6) {
        console.log('Failed to load the image');
        return false;
    }
    image6.onload = function () { sendImageToTEXTURE6(image6); };
    image6.src = '../img/chest.png';

    var image7 = new Image();
    if (!image7) {
        console.log('Failed to load the image');
        return false;
    }
    image7.onload = function () { sendImageToTEXTURE7(image7); };
    image7.src = '../img/tnt.webp';

    return true;
}

function sendImageToTEXTURE0(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler0, 0);
}

function sendImageToTEXTURE1(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler1, 1);
}
function sendImageToTEXTURE2(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler2, 2);
}

function sendImageToTEXTURE3(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler3, 3);
}

function sendImageToTEXTURE4(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler4, 4);
}

function sendImageToTEXTURE5(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler5, 5);
}

function sendImageToTEXTURE6(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler6, 6);
}

function sendImageToTEXTURE7(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE7);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler7, 7);
}

function initCamera() {
    g_camera = new Camera();
    g_camera.eye = new Vector3([0, 0, 3]);
    g_camera.at = new Vector3([0, 0, -100]);
    g_camera.up = new Vector3([0, 1, 0]);
}

function main() {
    createStats();
    setUpWebGL();
    connectVariablesToGLSL();
    addActionsForHTMLUI();
    initTextures();
    initCamera();
    canvas.onmousedown = click;
    canvas.onmousemove = function (ev) { if (ev.buttons == 1) click(ev); }; // if we remove ev.buttons == 1, we can drag the mouse without clicking. But we want click+drag to work.
    document.onkeydown = keydown;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // renderScene();
    requestAnimationFrame(tick);
}

function keydown(ev) {
    // KEYBOARD CONTROLS
    // WASD for camera movement
    // QE for horizontal camera rotation
    // Arrow keys for vertical and horizontal camera rotation
    // P for camera reset


    // CAMERA MOVEMENT
    if (ev.keyCode == 87) { // W
        g_camera.moveForward(0.1);
    } else if (ev.keyCode == 83) { // S
        g_camera.moveBackwards(0.1);
    } else if (ev.keyCode == 65) { // A
        g_camera.moveLeft(0.1);
    } else if (ev.keyCode == 68) { // D
        g_camera.moveRight(0.1);
    }

    // CAMERA ROTATION
    else if (ev.keyCode == 81 || ev.keyCode == 37) { // Q or left arrow
        g_camera.panLeft(2);
    } else if (ev.keyCode == 69 || ev.keyCode == 39) { // E or right arrow
        g_camera.panRight(2);
    } else if (ev.keyCode == 38) { // Up arrow
        g_camera.tiltUp(2);
    } else if (ev.keyCode == 40) { // Down arrow
        g_camera.tiltDown(2);
    }


    // CAMERA RESET
    else if (ev.keyCode == 80) { // P
        g_camera.reset();
    }
    renderScene();
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

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    // console.log(g_camera.toString());
    viewMat.lookAt(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2], g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2], g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]); // (eye, at, up)
    // console.log(g_camera.toString());
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    // drawTurtle(sceneMatrix);

    var startTime = performance.now();

    var floor = new Cube();
    floor.color = [1, 0, 0, 1];
    floor.textureNum = 0;
    floor.matrix.translate(0, -.75, 0);
    floor.matrix.scale(50, 0, 50);
    floor.matrix.translate(-.5, 0, -.5);
    floor.render();

    var sky = new Cube();
    sky.textureNum = 1;
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-.5, -.5, -.5);
    sky.render();

    var cube = new Cube();
    cube.color = green_body;
    cube.matrix = new Matrix4(sceneMatrix);
    cube.matrix.scale(.5, .5, .5);
    cube.render();

    drawMap();

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

