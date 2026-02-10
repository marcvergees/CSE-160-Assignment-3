class Sphere {
    constructor() {
        this.type = "sphere";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 100.0;
        this.segments = 15;
        this.matrix = new Matrix4();
    }
    render() {
        var xyz = this.position;
        var rgba = this.color;
        var size = this.size;

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        var d = size / 200.0;

        var step = 360 / this.segments; // Step size for sphere resolution

        for (var t = 0; t < 180; t += step) {
            var angle1 = t * Math.PI / 180;
            var angle2 = (t + step) * Math.PI / 180; // Latitude bands

            for (var r = 0; r < 360; r += step) {
                var angle3 = r * Math.PI / 180;
                var angle4 = (r + step) * Math.PI / 180; // Longitude segments

                // Vertices for the quad
                var v1 = [Math.sin(angle1) * Math.cos(angle3), Math.sin(angle1) * Math.sin(angle3), Math.cos(angle1)];
                var v2 = [Math.sin(angle2) * Math.cos(angle3), Math.sin(angle2) * Math.sin(angle3), Math.cos(angle2)];
                var v3 = [Math.sin(angle2) * Math.cos(angle4), Math.sin(angle2) * Math.sin(angle4), Math.cos(angle2)];
                var v4 = [Math.sin(angle1) * Math.cos(angle4), Math.sin(angle1) * Math.sin(angle4), Math.cos(angle1)];

                // Scale and position
                var pt1 = [xyz[0] + v1[0] * d, xyz[1] + v1[1] * d, xyz[2] + v1[2] * d];
                var pt2 = [xyz[0] + v2[0] * d, xyz[1] + v2[1] * d, xyz[2] + v2[2] * d];
                var pt3 = [xyz[0] + v3[0] * d, xyz[1] + v3[1] * d, xyz[2] + v3[2] * d];
                var pt4 = [xyz[0] + v4[0] * d, xyz[1] + v4[1] * d, xyz[2] + v4[2] * d];

                // Draw two triangles for the quad
                gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
                drawTriangle3D([pt1[0], pt1[1], pt1[2], pt2[0], pt2[1], pt2[2], pt4[0], pt4[1], pt4[2]]);
                gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
                drawTriangle3D([pt2[0], pt2[1], pt2[2], pt3[0], pt3[1], pt3[2], pt4[0], pt4[1], pt4[2]]);
            }
        }
    }


}