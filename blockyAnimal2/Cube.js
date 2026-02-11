class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
    }
    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        drawTriangle3dUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3dUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);

        // Back of cube
        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        drawTriangle3dUV([0, 0, 1, 1, 1, 1, 1, 0, 1], [0, 0, 1, 1, 1, 0]);
        drawTriangle3dUV([0, 0, 1, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);

        // Top of cube
        gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
        drawTriangle3dUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [1, 0, 1, 1, 0, 1]);
        drawTriangle3dUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [1, 0, 0, 1, 0, 0]);

        // Bottom of cube
        gl.uniform4f(u_FragColor, rgba[0] * .7, rgba[1] * .7, rgba[2] * .7, rgba[3]);
        drawTriangle3dUV([0, 0, 0, 0, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 1]);
        drawTriangle3dUV([0, 0, 0, 1, 0, 1, 1, 0, 0], [1, 0, 0, 1, 0, 0]);

        // Right of cube
        gl.uniform4f(u_FragColor, rgba[0] * .6, rgba[1] * .6, rgba[2] * .6, rgba[3]);
        drawTriangle3dUV([0, 1, 0, 0, 1, 1, 0, 0, 0], [1, 1, 0, 1, 1, 0]);
        drawTriangle3dUV([0, 0, 0, 0, 1, 1, 0, 0, 1], [1, 0, 0, 1, 0, 0]);

        // Left of cube
        gl.uniform4f(u_FragColor, rgba[0] * .5, rgba[1] * .5, rgba[2] * .5, rgba[3]);
        drawTriangle3dUV([1, 1, 0, 1, 1, 1, 1, 0, 0], [1, 1, 0, 1, 1, 0]);
        drawTriangle3dUV([1, 0, 0, 1, 1, 1, 1, 0, 1], [1, 0, 0, 1, 0, 0]);

    }


}