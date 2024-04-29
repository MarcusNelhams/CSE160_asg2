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
let g_globalYAngle = 0;
let g_globalXAngle = -20;
let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0-g_startTime;
let g_animation = false;
let g_poke = false;
let g_pokeStart = 0;

// global animation angles
let g_frontLegAngle = 0;
let g_backLegAngle = 0;
let g_frontKneeAngle = 0;
let g_backKneeAngle = 0;
let g_frontHoofAngle = 0;
let g_bodyAngle = 0;


function addActionsForHtmlUI() {
  
  // camera slider
  document.getElementById('globSlide').addEventListener('mousemove', function() { g_globalXAngle = this.value });


  // Front Leg Sliders
  document.getElementById('UFRLegSlide').addEventListener('mousemove', function() { if (!g_animation) g_frontLegAngle = this.value; renderAllShapes(); });
  document.getElementById('FRKSlide').addEventListener('mousemove', function() { g_frontKneeAngle = this.value; renderAllShapes(); });
  document.getElementById('FHSlide').addEventListener('mousemove', function() { g_frontHoofAngle = this.value; renderAllShapes(); });

  // Animation Buttons
  document.getElementById('FLAnimationOnButton').onclick = function() {g_animation = true;}
  document.getElementById('FLAnimationOffButton').onclick = function() {g_animation = false; g_poke = false;}

}

function sendTextToHTML(text) {
  const output = document.getElementById('output');
  output.textContent = text;
}

function UpdateAnimationAngles() {

  if (g_poke) {
    if (g_seconds - g_pokeStart < 3) {
      g_globalXAngle = 0;
      g_globalYAngle = 0;

      g_bodyAngle = 117*((g_seconds - g_pokeStart)*1.037);

      g_frontLegAngle = 40*Math.sin((g_seconds - g_pokeStart)*1.05);
      g_backLegAngle = -40*Math.sin((g_seconds - g_pokeStart)*1.05);
    } else {
      g_poke = false;
    }
    return;
  }

  speed = 5;
  dAng_dTime = g_frontLegAngle;
  if (g_animation) {
    g_bodyAngle = 7*Math.sin(g_seconds * speed);
    g_frontLegAngle = 30*Math.sin(g_seconds * speed);
    g_backLegAngle = -g_frontLegAngle - 10;
    dAng_dTime = dAng_dTime - g_frontLegAngle;

    if (dAng_dTime >= 0) {
      if (g_frontLegAngle > 1) {
        g_frontKneeAngle = -2*g_frontLegAngle;
      } else if (g_frontLegAngle < 1 && g_frontLegAngle > -1) {
        g_frontKneeAngle = 0;
      } else {
        g_frontKneeAngle = 2*g_frontLegAngle;
      }
    } else {
      g_frontKneeAngle = -60;
    }

    if (dAng_dTime <= 0) {
      if (g_frontLegAngle > 1) {
        g_backKneeAngle = -2*g_frontLegAngle;
      } else if (g_frontLegAngle < 1 && g_frontLegAngle > -1) {
        g_backKneeAngle = 0;
      } else {
        g_backKneeAngle = 2*g_frontLegAngle;
      }
    } else {
      g_backKneeAngle = -60;
    }

  }
}

// Render all shapes defined by buffers onto canvas
function renderAllShapes() {
  // check time for performance check
  var start = performance.now()

  var globalRotMat = new Matrix4().rotate(-g_globalXAngle,0,1,0);
  globalRotMat.rotate(g_globalYAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear Canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // colors
  let brown = [.44,.15,.01,1]
  let dBrown = [brown[0]*.9, brown[1]*.9, brown[2]*.9, 1];
  let hBrown = [brown[0]*.4, brown[1]*.4, brown[2]*.4, 1];

  // body
  var bodyM = new Matrix4();
  bodyM.translate(-.3, -.3, -.5);
  bodyM.translate(0, .3, .5)
  bodyM.rotate(g_bodyAngle, 1, 0, 0);
  bodyM.translate(0, -.3, -.5)
  var bodyPosM = new Matrix4(bodyM);
  bodyM.translate(0, .2, .5)
  bodyM.scale(0.6, 0.6, 1.1);
  bodyM.translate(0,-.3, -.5)
  var body = new Cube(bodyM, dBrown);
  body.render();

  // front left leg
  var leftArmM = new Matrix4(bodyPosM);
  leftArmM.translate(.3,0,0)
  leftArmM.translate(0.07, .3, 0.25);
  leftArmM.rotate(g_frontLegAngle, 1, 0, 0);
  leftArmM.translate(0, -.5, -.125);
  var leftArmPos = new Matrix4(leftArmM);
  leftArmM.scale(0.15, 0.25, 0.15);
  var leftArm = new Cube(leftArmM, brown);
  leftArm.render();

  leftArmM = leftArmPos;
  leftArmM.translate(.01, -.1, .01);
  leftArmM.scale(.13, .15, .13);
  leftArmM.translate(0, 1, .5)
  leftArmM.rotate(g_frontKneeAngle, 1, 0, 0);
  leftArmM.translate(0, -1, -.5)
  var leftArm = new Cube(leftArmM, brown);
  leftArm.render();

  leftArmM.scale(.9, .9, .8);
  leftArmM.translate(.1, -.3, .1);
  leftArmM.translate(0, .5, .5);
  leftArmM.rotate(g_frontHoofAngle, 1, 0, 0);
  leftArmM.translate(0, -.5, -.5);
  hoof = new Cube(leftArmM, hBrown);
  hoof.render();

  // front right leg
  var rightArmM = new Matrix4(bodyPosM);
  rightArmM.translate(0.07, .3, 0.25);
  rightArmM.rotate(g_frontLegAngle, 1, 0, 0);
  rightArmM.translate(0.00, -.5, -.125);
  var rightArmPos = new Matrix4(rightArmM);
  rightArmM.scale(0.15, 0.25, 0.15);
  var rightArm = new Cube(rightArmM, brown);
  rightArm.render();

  rightArmM = rightArmPos;
  rightArmM.translate(.01, -.1, .01);
  rightArmM.scale(.13, .15, .13);
  rightArmM.translate(0, 1, .5)
  rightArmM.rotate(g_frontKneeAngle, 1, 0, 0);
  rightArmM.translate(0, -1, -.5)
  rightArm = new Cube(rightArmM, brown);
  rightArm.render();

  rightArmM.scale(.9, .9, .8);
  rightArmM.translate(.1, -.3, .1);
  rightArmM.translate(0, .5, .5);
  rightArmM.rotate(g_frontHoofAngle, 1, 0, 0);
  rightArmM.translate(0, -.5, -.5);
  hoof = new Cube(rightArmM, hBrown);
  hoof.render();

  // back right leg
  var rightLegM = new Matrix4(bodyPosM);
  rightLegM.translate(0, 0, .65)
  rightLegM.translate(0.07, .3, 0.25);
  rightLegM.rotate(g_backLegAngle, 1, 0, 0);
  rightLegM.translate(0.00, -.5, -.125);
  var rightLegPos = new Matrix4(rightLegM);
  rightLegM.scale(0.15, 0.25, 0.15);
  var rightLeg = new Cube(rightLegM, brown);
  rightLeg.render();

  rightLegM = rightLegPos;
  rightLegM.translate(.01, -.1, .01);
  rightLegM.scale(.13, .15, .13);
  rightLegM.translate(0, 1, .5)
  rightLegM.rotate(g_backKneeAngle, 1, 0, 0);
  rightLegM.translate(0, -1, -.5)
  rightLeg = new Cube(rightLegM, brown);
  rightLeg.render();

  rightLegM.scale(.9, .9, .8);
  rightLegM.translate(.1, -.3, .1);
  hoof = new Cube(rightLegM, hBrown);
  hoof.render();

  // back left leg
  var backLegM = new Matrix4(bodyPosM);
  backLegM.translate(.3, 0, .65)
  backLegM.translate(0.07, .3, 0.25);
  backLegM.rotate(g_backLegAngle, 1, 0, 0);
  backLegM.translate(0.00, -.5, -.125);
  var backLegPos = new Matrix4(backLegM);
  backLegM.scale(0.15, 0.25, 0.15);
  var backLeg = new Cube(backLegM, brown);
  backLeg.render();

  backLegM = backLegPos;
  backLegM.translate(.01, -.1, .01);
  backLegM.scale(.13, .15, .13);
  backLegM.translate(0, 1, .5)
  backLegM.rotate(g_backKneeAngle, 1, 0, 0);
  backLegM.translate(0, -1, -.5)
  backLeg = new Cube(backLegM, brown);
  backLeg.render();

  backLegM.scale(.9, .9, .8);
  backLegM.translate(.1, -.3, .1);
  hoof = new Cube(backLegM, hBrown);
  hoof.render();

  // Head
  var headM = new Matrix4(bodyPosM);
  headM.translate(0.1, .5, -.3);
  headM.rotate(0, 0, 0, 1);
  headM.scale(0.4, 0.4, 0.4);
  var headPos = new Matrix4(headM);
  var head = new Cube(headM, brown);
  head.render();

  // face
  var eyesM = new Matrix4(headPos);
  eyesM.translate(.25, .7, -.04);
  eyesM.scale(.1, .1, .1);
  var lEye = new Cube(eyesM, [0, .5, .25, 1]);
  lEye.render();

  eyesM.translate(4,0,0);
  var rEye = new Cube(eyesM, [0, .5, .25, 1]);
  rEye.render();

  var noseM = new Matrix4(headPos);
  noseM.translate(0.1, .05, -.35);
  noseM.scale(.8, .5, .5);
  var nose = new Cube(noseM, dBrown);
  nose.render();

  noseM.translate(.2, .2, -.001);
  noseM.scale(.2,.35,.1);
  var lNos = new Cube(noseM, [0,0,0,1]);
  lNos.render();

  noseM.translate(2, 0, 0);
  var rNos = new Cube(noseM, [0,0,0,1]);
  rNos.render();

  var earM = new Matrix4(headPos);
  earM.translate(-.2, .5, .6);
  earM.scale(.2, .3, .1);
  var lEar = new Cube(earM, dBrown);
  lEar.render();

  earM.translate(6,0,0);
  var rEar = new Cube(earM, dBrown);
  rEar.render();

  // right horn
  var hornM = new Matrix4(headPos);
  hornM.translate(1,.8,.3);
  hornM.rotate(-90, 0, 0, 1);
  hornM.scale(.07, .6, .07);
  var rHorn1 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn1.render();

  hornM.translate(0, 1, 0);
  hornM.rotate(180, 0, 0, 1);
  var rHorn2 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn2.render();

  hornM = new Matrix4(headPos);
  hornM.translate(1.55, .78, .3);
  hornM.rotate(-45, 0, 0, 1);
  hornM.scale(.07, .6, .07)
  rHorn3 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn3.render();

  // left horn
  var hornM = new Matrix4(headPos);
  hornM.translate(-1.5, 0, 0);
  hornM.translate(1,.8,.3);
  hornM.rotate(-90, 0, 0, 1);
  hornM.scale(.07, .6, .07);
  var rHorn1 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn1.render();

  hornM.translate(0, 1, 0);
  hornM.rotate(180, 0, 0, 1);
  var rHorn2 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn2.render();

  hornM = new Matrix4(headPos);
  hornM.translate(-.45, .78, .3);
  hornM.rotate(45, 0, 0, 1);
  hornM.scale(.07, .6, .07)
  rHorn3 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn3.render();



  // tail
  var tailM = new Matrix4(bodyPosM);
  tailM.translate(0.27, .5, 1.0);
  tailM.rotate(-2*g_bodyAngle + 70, 1, 0, 0);
  tailM.scale(0.05, 0.05, .6);
  var tail = new Cube(tailM, brown);
  tail.render();

  // performance check
  var duration = performance.now() - start;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration));
}

// registers mouse click and pushes inputed values to buffers
function handleOnClick(ev) {
  if (ev.buttons != 1) {
    return;
  }

  if (keysDown[16]) {
    g_pokeStart = g_seconds;
    g_bodyAngle = 0;
    g_backLegAngle = 0;
    g_frontLegAngle = 0;
    g_backKneeAngle = 0;
    g_frontKneeAngle = 0;
    g_poke = true;
    g_animation = false;
  }

  let [x, y] = convertCoordinatesEventToGL(ev);

  g_globalXAngle = x*90;
  g_globalYAngle = y*90;

  renderAllShapes();
}

// keep track of currently down  keys
let keysDown = {}

// handles when a keyboard key is pressed
function handleOnKeyDown(ev) {
  // store keys pressed
  keysDown[ev.keyCode] = true;
}

// handles if a keyboard key is unpressed
function handleOnKeyUp(ev) {
  keysDown[ev.keyCode] = false;
}

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;

  UpdateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);
}

function main() {

  setupWebGL();
  connectVarsToGLSL();
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.6, 0.6, 1.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  canvas.onmousedown = handleOnClick;
  canvas.onmousemove = handleOnClick;
  document.addEventListener('keydown', handleOnKeyDown);
  document.addEventListener('keyup', handleOnKeyUp);

  requestAnimationFrame(tick);
}
