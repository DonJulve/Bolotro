export class Camera {
    // ------------------------------
    //  Variales "Globales" de Camera
    //  Sobre todo variables de inicializacion y comparacion
    //  Constantes en mayuscula por favor u de otra manera os asesinaré
    // ------------------------------
    static MAX_ROTATION = 50 // Maxima rotacion de la camara
    static MAX_HORIZONTAL = 8; // Maximo movimiento de la camara
    static MOVE_STEP = 0.1;   // Horizontal step
    static ROTATE_STEP = 1.0; // Rotation step


    static INITIAL_TARGET = vec3(0.0, 0.0, 0.0);
    static INITIAL_EYE = vec3(-10.0, 10.0, 0.0);
    static INITIAL_UP = vec3(0.0, 1.0, 0.0);
    static INITIAL_VEC_POS_INICIAL = vec3(5.0, 5.0, 5.0);

    static instance;
    constructor() {
        // Singleton 
        if (Camera.instance) {
            return Camera.instance;
        }

        // TODO CAMBIAR PARA QUE LA CAMARA MIRE HACIA EL CENTRO DEL PLANO
        this.target = Camera.INITIAL_TARGET     // Donde está mirando la camara
        this.eye = Camera.INITIAL_EYE;      // Posicion de la camara
        this.up = Camera.INITIAL_UP; 	        // El vector hacia arriba de la camara

        this.viewMatrix = lookAt(this.eye, this.target, this.up);

        // Angulo de rotacion de la camara sobre el ejeY
        this.rotationAngle = 0;
        this.vecTarget = subtract(this.eye, this.target); // Vector dirección de la cámara
        this.vecPosInicial = Camera.INITIAL_VEC_POS_INICIAL; // Posición relativa de la esfera
        
        Camera.instance = this;
        
    }

    updateViewMatrix() {
        this.viewMatrix = lookAt(this.eye, this.target, this.up);
    }

    getViewMatrix() {
        this.updateViewMatrix();
        return this.viewMatrix;
    }

    moveCamera(direction) {
        // Verificar límites de movimiento
        if (this.eye[2] > Camera.MAX_HORIZONTAL && direction) return;
        if (this.eye[2] < -Camera.MAX_HORIZONTAL && !direction) return;

        // Mover en el eje Z (horizontal)
        this.eye = direction ? 
            vec3(this.eye[0], this.eye[1], this.eye[2] + Camera.MOVE_STEP) : 
            vec3(this.eye[0], this.eye[1], this.eye[2] - Camera.MOVE_STEP);
        
        this.target = subtract(this.eye, this.vecTarget);
        this.updateViewMatrix();
        
        return this.eye;
    }
    
    rotateCamera(direction) {
        // Verificar límites de rotación
        this.rotationAngle = direction ? 
            this.rotationAngle + Camera.ROTATE_STEP : 
            this.rotationAngle - Camera.ROTATE_STEP;
            
        if (this.rotationAngle > Camera.MAX_ROTATION || this.rotationAngle < -Camera.MAX_ROTATION) {
            this.rotationAngle = this.rotationAngle > Camera.MAX_ROTATION ? 
                Camera.MAX_ROTATION : -Camera.MAX_ROTATION;
            return;
        }

        let vecTarget4 = vec4(this.vecTarget[0], this.vecTarget[1], this.vecTarget[2], 0.0);
        let vecPosInicial4 = vec4(this.vecPosInicial[0], this.vecPosInicial[1], this.vecPosInicial[2], 0.0);

        vecTarget4 = direction ? 
            mult(rotate(Camera.ROTATE_STEP, this.up), vecTarget4) : 
            mult(rotate(-Camera.ROTATE_STEP, this.up), vecTarget4);
            
        vecPosInicial4 = direction ? 
            mult(rotate(Camera.ROTATE_STEP, this.up), vecPosInicial4) : 
            mult(rotate(-Camera.ROTATE_STEP, this.up), vecPosInicial4);

        this.vecTarget = vec3(vecTarget4[0], vecTarget4[1], vecTarget4[2]);
        this.vecPosInicial = vec3(vecPosInicial4[0], vecPosInicial4[1], vecPosInicial4[2]);

        this.target = subtract(this.eye, this.vecTarget);
        this.updateViewMatrix();
        
        return this.vecPosInicial; 
    }

    reset() {
        this.eye = Camera.INITIAL_EYE;
        this.target = Camera.INITIAL_TARGET;
        this.up = Camera.INITIAL_UP;
        this.rotationAngle = 0;
        this.vecTarget = subtract(this.eye, this.target);
        this.vecPosInicial = Camera.INITIAL_VEC_POS_INICIAL;
        this.updateViewMatrix();
    }
}
