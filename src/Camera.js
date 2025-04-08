import {vec3} from "../Common/MVnew"

export class Camera {
    static instance;
    
    constructor() {
        // Singleton 
        if (Camera.instance) {
            return Camera.instance;
        }

        // TODO CAMBIAR PARA QUE LA CAMARA MIRE HACIA EL CENTRO DEL PLANO
        this.target = vec3(0.0, 0.0, 0.0);     // Donde está mirando la camara
        this.eye = vec3(10.0, 0.0, 10.0);      // Posicion de la camara
        this.up = vec3(0.0, 1.0, 0.0); 	        // El vector hacia arriba de la camara

        this.viewMatrix = lookAt(this.eye, this.target, this.up);

        // TODO
        
        Camera.instance = this;
        
    }

    updateViewMatrix() {
        this.viewMatrix = lookAt(this.eye, this.target, this.up);
    }

    move(x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.updateViewMatrix();
    }
    
}