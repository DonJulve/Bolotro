export class Camera {
    static instance;
    
    constructor() {
        // Singleton 
        if (Camera.instance) {
            return Camera.instance;
        }

        // TODO CAMBIAR PARA QUE LA CAMARA MIRE HACIA EL CENTRO DEL PLANO
        this.target = vec3(0.0, 0.0, 0.0);     // Donde está mirando la camara
        this.eye = vec3(5.0, 5.0, 10.0);      // Posicion de la camara
        this.up = vec3(0.0, 1.0, 0.0); 	        // El vector hacia arriba de la camara

        this.viewMatrix = lookAt(this.eye, this.target, this.up);

        // TODO
        
        Camera.instance = this;
        
    }

    updateViewMatrix() {
        this.viewMatrix = lookAt(this.eye, this.target, this.up);
    }

    getViewMatrix() {
        this.updateViewMatrix();
        return this.viewMatrix;
    }

    move(x, y, z) {
        this.eye[0] += x;
        this.eye[1] += y;
        this.eye[2] += z;
        this.updateViewMatrix();
    }
    
}
