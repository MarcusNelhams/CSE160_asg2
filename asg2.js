// HelloPoint1.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

// Sets up WebGL
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer:true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

// Connects js vars to GLSL vars in shaders
function connectVarsToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  return;
}

// Extract mouse coords and return WebGL coords
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // Get mouse x position
  var y = ev.clientY; // Get mouse y position
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2) / (canvas.width / 2);
  y = (canvas.height/2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

// global UI elements
let g_globalAngle = 0;
let g_UpperFrontRightLegAngle = 0;

function addActionsForHtmlUI() {
  // Camera slider
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('UFRLegSlide').addEventListener('mousemove', function() { g_UpperFrontRightLegAngle = this.value; renderAllShapes(); });
  
}


function sendTextToHTML(text) {
  const output = document.getElementById('output');
  output.textContent = text;
}

// Render all shapes defined by buffers onto canvas
function renderAllShapes() {
  // check time for performance check
  var start = performance.now()

  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear Canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // colors
  let brown = [.44,.15,.01,1]

  // body
  var bodyM = new Matrix4();
  bodyM.translate(-.3, -.3, -.5);
  var bodyPosM = new Matrix4(bodyM);
  bodyM.rotate(0, 0, 1, 0);
  bodyM.scale(0.6, 0.6, 1.1);
  var leftArm = new Cube(bodyM, brown);
  leftArm.render();

  // left front leg
  var leftArmM = new Matrix4(bodyPosM);
  leftArmM.translate(0.33, -.25, 0.1);
  leftArmM.rotate(0, 0, 0, 1);
  leftArmM.scale(0.25, 0.25, 0.25);
  var leftArm = new Cube(leftArmM, brown);
  leftArm.render();

  // right front leg
  var rightArmM = new Matrix4(bodyPosM);
  rightArmM.translate(0.02, .25, 0.25);
  rightArmM.rotate(g_UpperFrontRightLegAngle, 1, 0, 0);
  rightArmM.translate(0.00, -.5, -.125);
  rightArmM.scale(0.25, 0.5, 0.25);
  var rightArm = new Cube(rightArmM, brown);
  rightArm.render();

  // right back leg
  var rightBackM = new Matrix4(bodyPosM);
  rightBackM.translate(0.02, -.25, 0.7);
  rightBackM.rotate(0, 0, 0, 1);
  rightBackM.scale(0.25, 0.25, 0.25);
  var rightBack = new Cube(rightBackM, brown);
  rightBack.render();

  // left back leg
  var leftBackM = new Matrix4(bodyPosM);
  leftBackM.translate(0.33, -.25, 0.7);
  leftBackM.rotate(0, 0, 0, 1);
  leftBackM.scale(0.25, 0.25, 0.25);
  var leftBack = new Cube(leftBackM, brown);
  leftBack.render();

  // performance check
  var duration = performance.now() - start;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration));
}

// save previous coords for mouseless draw
let last_xy = [0, 0];

// registers mouse click and pushes inputed values to buffers
function handleOnClick(ev) {
  // if mouse button is not down, return
  if (ev.buttons != 1 && !(keysDown[16])) {
    return;
  }

  let [x, y] = [0, 0];
  // get webGL coords from click
  if (ev.buttons == 1) {
    [x, y] = convertCoordinatesEventToGL(ev);
    last_xy = [x, y];
  } else {
    [x, y] = last_xy;
  }

  // console.log(g_selected_colors.slice());
  renderAllShapes();
  return;
}

// keep track of currently down  keys
let keysDown = {}

// handles when a keyboard key is pressed
function handleOnKeyDown(ev) {
  // store keys pressed
  keysDown[ev.keyCode] = true;

  // if spacebar down
  if (keysDown[16]) {
    console.log("16");
  }
}

// handles if a keyboard key is unpressed
function handleOnKeyUp(ev) {
  keysDown[ev.keyCode] = false;
}

function main() {

  setupWebGL();
  connectVarsToGLSL();
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  canvas.onmousedown = handleOnClick;
  document.addEventListener('keydown', handleOnKeyDown);
  document.addEventListener('keyup', handleOnKeyUp);

  renderAllShapes();
}
