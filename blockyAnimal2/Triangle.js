class Triangle {
    constructor() {
        this.type = "triangle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.buffer = null;
        this.vertices = null;
    }
    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_PointSize, size);

        var d = this.size / 200.0;
        drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
    }
}

function drawTriangle(vertices) {
    this.vertices = new Float32Array(vertices);
    // Create a buffer object <- (1)
    if (!this.buffer || this.buffer === null) {
        this.buffer = gl.createBuffer();
        if (!this.buffer) {
            console.log('Failed to create a buffer object');
            return -1;
        }
    }
    // Bind the buffer object to a target <- (2)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    // Write date into the buffer object <- (3)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable <- (4)
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_Position variable <- (5)
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function drawTriangle3D(vertices) {
    this.vertices = new Float32Array(vertices);
    // Create a buffer object <- (1)
    if (!this.buffer) {
        this.buffer = gl.createBuffer();
        if (!this.buffer) {
            console.log('Failed to create a buffer object');
            return -1;
        }
    }
    // Bind the buffer object to a target <- (2)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    // Write date into the buffer object <- (3)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable <- (4)
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_Position variable <- (5)
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}