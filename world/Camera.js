class Camera {
    constructor() {
        this.fov = 60;                                  // field of view, float
        this.eye = new Vector3([0, 0, 0]);              // position of the camera, vector3
        this.at = new Vector3([0, 0, -1]);              // point the camera is looking at, vector3
        this.up = new Vector3([0, 1, 0]);               // up direction of the camera, vector3
        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();
        this.initialize_view_projection_matrices();
        this.gravity = 0.015;
        this.velocityY = 0;
        this.isJumping = false;
    }

    initialize_view_projection_matrices() {
        this.viewMatrix.setLookAt(this.eye, this.at, this.up);
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, .1, 100);
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = 0.3; // it has to be 0.2
            this.isJumping = true;
        }
    }
    doubleJump() {
        if (!this.isJumping) {
            this.velocityY = 0.8; // it has to be 0.2
            this.isJumping = true;
        }
    }


    update(map) {
        this.eye.elements[1] += this.velocityY;
        this.at.elements[1] += this.velocityY;
        this.velocityY -= this.gravity;

        let mapX = this.eye.elements[0] > 0 ? Math.round(this.eye.elements[0]) + 16 : Math.floor(this.eye.elements[0]) + 15;
        let mapZ = this.eye.elements[2] > 0 ? Math.round(this.eye.elements[2]) + 16 : Math.floor(this.eye.elements[2]) + 15;

        // Ground collision (assuming ground is at map[x][z])
        if (this.eye.elements[1] <= map[mapX][mapZ]) {
            let diff = map[mapX][mapZ] - this.eye.elements[1];
            this.eye.elements[1] += diff;
            this.at.elements[1] += diff;
            this.velocityY = 0;
            this.isJumping = false;
        }
    }

    moveForward(speed) {
        let f = new Vector3();
        f.set(this.at);         // f = at
        f.sub(this.eye);        // f = at - eye
        f.normalize();          // f = (at - eye) / |at - eye|
        f.mul(speed);           // f = speed * (at - eye) / |at - eye|
        this.eye.add(f);        // eye = eye + f
        this.at.add(f);         // at = at + f
    }

    moveBackwards(speed) {
        let b = new Vector3();
        b.set(this.eye);        // b = eye
        b.sub(this.at);         // b = eye - at
        b.normalize();          // b = (eye - at) / |eye - at|
        b.mul(speed);           // b = speed * (eye - at) / |eye - at|
        this.eye.add(b);        // eye = eye + b
        this.at.add(b);         // at = at + b
    }

    moveLeft(speed) {
        let f = new Vector3();
        f.set(this.at);         // f = at
        f.sub(this.eye);        // f = at - eye

        let s = new Vector3();
        s.set(Vector3.cross(this.up, f));         // s = up
        s.normalize();          // s = (up x f) / |up x f|
        s.mul(speed);           // s = speed * (up x f) / |up x f|
        this.eye.add(s);        // eye = eye + s
        this.at.add(s);         // at = at + s
    }

    moveRight(speed) {
        let f = new Vector3();
        f.set(this.at);         // f = at
        f.sub(this.eye);        // f = at - eye

        let s = new Vector3();
        s.set(Vector3.cross(f, this.up));       // s = f x up
        s.normalize();          // s = (f x up) / |f x up|
        s.mul(speed);           // s = speed * (f x up) / |f x up|
        this.eye.add(s);        // eye = eye + s
        this.at.add(s);         // at = at + s
    }

    panLeft(alpha) {
        let f = new Vector3();
        f.set(this.at);         // f = at
        f.sub(this.eye);        // f = at - eye

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);                    // f_prime = rotationMatrix * f
        this.at.set(this.eye);                                              // at = eye
        this.at.add(f_prime);                                               // at = eye + f_prime
    }

    panRight(alpha) {
        let f = new Vector3();
        f.set(this.at);         // f = at
        f.sub(this.eye);        // f = at - eye

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);   // rotationMatrix = rotation matrix around up vector

        let f_prime = rotationMatrix.multiplyVector3(f);                    // f_prime = rotationMatrix * f
        this.at.set(this.eye);                                              // at = eye
        this.at.add(f_prime);                                               // at = eye + f_prime
    }

    tiltUp(alpha) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let s = Vector3.cross(f, this.up);
        s.normalize();

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, s.elements[0], s.elements[1], s.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    tiltDown(alpha) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        let s = Vector3.cross(f, this.up);
        s.normalize();

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, s.elements[0], s.elements[1], s.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    toString() {
        return `at: ${this.at.elements}, eye: ${this.eye.elements}, up: ${this.up.elements}`;
    }

    reset() {
        this.eye.set(new Vector3([0, 0, 0]));
        this.at.set(new Vector3([0, 0, -1]));
        this.up.set(new Vector3([0, 1, 0]));
        this.initialize_view_projection_matrices();
    }

}