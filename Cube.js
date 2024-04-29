// const { Matrix4 } = require("three");

// point class that holds point values
class Cube {
  constructor(matrix, color) {
    this.type = 'cube';
    this.color = color;
    this.matrix = matrix;
  }

  render() {
    // var xy = this.position;
    var rgba = this.color;
    // var size = this.size;

    // Pass color to shader
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass matrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // front of cube
    drawTriangle3D([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
    drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);

    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    // top of Cube
    drawTriangle3D([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]);
    drawTriangle3D([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);

    // bottom of Cube
    drawTriangle3D([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0]);
    drawTriangle3D([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0]);

    gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

    // back of Cube
    drawTriangle3D([0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0]);
    drawTriangle3D([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]);

    gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
    
    // right side of Cube
    drawTriangle3D([1.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 1.0, 0.0]);
    drawTriangle3D([1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);

    // left side of Cube
    drawTriangle3D([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0, 0.0]);
    drawTriangle3D([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0]);
  }
}