export class Camera {
    // ------------------------------
    //  Variales "Globales" de Camera
    //  Sobre todo variables de inicializacion y comparacion
    //  Constantes en mayuscula por favor u de otra manera os asesinaré
    // ------------------------------
    static MAX_ROTATION = 180 // Maxima rotacion de la camara

    static INITIAL_TARGET = vec3(0.0, 0.0, 0.0);
    static INITIAL_EYE = vec3(-10.0, 10.0, 0.0);

    static instance;
    constructor() {
        // Singleton 
        if (Camera.instance) {
            return Camera.instance;
        }

        // TODO CAMBIAR PARA QUE LA CAMARA MIRE HACIA EL CENTRO DEL PLANO
        this.target = Camera.INITIAL_TARGET     // Donde está mirando la camara
        this.eye = Camera.INITIAL_EYE;      // Posicion de la camara
        this.up = vec3(0.0, 1.0, 0.0); 	        // El vector hacia arriba de la camara

        this.viewMatrix = lookAt(this.eye, this.target, this.up);

        // Angulo de rotacion de la camara sobre el ejeY
        this.rotationYAngle = 0;
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
    
    rotateCameraY(angle) {
        debugger;
        // TODO
    }
    

}
