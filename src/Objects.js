import { pointsSphere, pointsCube, pointsPlane } from "./Geometría.js";
import { checkCollision, resolveCollision,  multVectScalar } from "./PhysicsEngine.js";
import { SceneManager } from "./SceneManager.js";
import { OBJLoader } from "./OBJLoader.js";

export class BowlingBall {

    constructor(x, y, z) {
        this.scene = new SceneManager();

        // Para control de la camara
        this.start = false;
        this.orientation = mat4();
        this.currentRotationAngle = 0;
        this.currentHorizontalOffset = 0;

        // Guardo posicion y velocidad inicial oara el reset
        this.initialPosition = vec3(x, y, z);
        this.initialVelocity = vec3(0, 0, 0);
        this.initialOrientation = mat4();
    
        this.pointsArray = pointsSphere;
        this.uniforms = {
          u_color: [1.0, 1.0, 1.0, 1.0],  // Color de la bola
          u_model: new mat4(),      // Matriz de modelo (posición y transformación)
          u_texture: null
        };
        this.primType = "triangles";

        // Propiedades fisicas
        this.mass = 3;
        this.velocity = vec3(10, 0, 0);
        this.position = vec3(x, y, z);

        this.velocityNextFrame = vec3(0,0,0);
        this.positionNextFrame = vec3(0,0,0);

        // Propiedades exclusivas de la bola
        this.radius = 0.5

        // Propiedad para evitar bugs de colisones infinitas
        // Un bolo colisiona como máximo una vex con un pin
        this.collisionedPins = [];


        this.#updatePosition();
    }

    loadTexture(gl, url) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Textura temporal mientras se carga
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
                      new Uint8Array([255, 255, 255, 255]));
        
        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            
            // Configuración para WebGL
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            
            this.uniforms.u_texture = texture;
        };
        image.src = url;
        
        return texture;
    }


    #updatePosition() {
        let transform = mult(translate(this.position[0], this.position[1], this.position[2]), this.orientation);
        this.uniforms.u_model = transform;
    }

    setProgramInfo(pInfo) {
        this.programInfo = pInfo;
    }

    reset() {
        this.start = false;
        this.position = vec3(
            this.initialPosition[0],
            this.initialPosition[1],
            this.initialPosition[2]
        );
        this.velocity = vec3(
            this.initialVelocity[0],
            this.initialVelocity[1],
            this.initialVelocity[2]
        );
        this.orientation = mat4();
        this.currentRotationAngle = 0;
        this.currentHorizontalOffset = 0;
        this.collisionedPins = [];
        this.velocityNextFrame = vec3(0, 0, 0);
        this.positionNextFrame = vec3(0, 0, 0);

        // Añadir bola a la escena si no está
        let sceneManager = new SceneManager();
        if (!sceneManager.objects.includes(this)) {
            sceneManager.objects.push(this)
        }
        this.#updatePosition();
    }

    // Mueve la bola junto con la cámara
    moveWithCamera(camera, direction, moveStep, limit) {
        // Verificar límites de movimiento
        if (this.start === true) return;
        if (this.currentHorizontalOffset > limit && direction) return;
        if (this.currentHorizontalOffset < -limit && !direction) return;

        const newEye = direction ? 
            vec3(camera.eye[0], camera.eye[1], camera.eye[2] + moveStep) : 
            vec3(camera.eye[0], camera.eye[1], camera.eye[2] - moveStep);
        
        this.currentHorizontalOffset += direction ? moveStep : -moveStep;
        
        // Calculamos la nueva posición relativa de la bola
        const relativePos = subtract(camera.eye, this.position);
        this.position = subtract(newEye, relativePos);
        
        this.#updatePosition();
    }

    // Rota la bola junto con la cámara
    rotateWithCamera(camera, direction, rotateStep, limit) {
        // Verificar límites de rotación
        if (this.start === true) return;
        const newRotationAngle = direction ? 
            this.currentRotationAngle + rotateStep : 
            this.currentRotationAngle - rotateStep;
            
        if (Math.abs(newRotationAngle) > limit) {
            return;
        }
        this.currentRotationAngle = newRotationAngle;

        const positionRotationMatrix = direction ? 
            rotate(rotateStep, camera.up) : 
            rotate(-rotateStep, camera.up);
    
        const selfRotationMatrix = direction ? 
            rotate(-rotateStep, camera.up) : 
            rotate(rotateStep, camera.up);
    
        // Aplicamos la rotación a la orientación de la bola
        this.orientation = mult(selfRotationMatrix, this.orientation);
    
        // Rotamos la posición de la bola alrededor del punto de vista de la cámara
        const relativePos = subtract(this.position, camera.eye);
        const rotatedPos = mult(positionRotationMatrix, vec4(relativePos[0], relativePos[1], relativePos[2], 1.0));
        this.position = add(camera.eye, vec3(rotatedPos[0], rotatedPos[1], rotatedPos[2]));
    
        this.#updatePosition();
    }


    calculateNextFrame(dt) {
        if (this.start === false) {
            return;
        }
        const sceneObjects = this.scene.getObjectsToDraw();

        // Si no hay cambios las siguientes velocidades serán las de ahora
        const GRAVITY = vec3(0, -20, 0)
        let gravityEffect = multVectScalar(GRAVITY, dt); 
        gravityEffect = vec3(gravityEffect[0], gravityEffect[1], gravityEffect[2]);

        this.velocityNextFrame = add(this.velocity, gravityEffect); 
        this.positionNextFrame = add(this.position, mult(dt, this.velocity));
        
        // - - - DETECCION DE COLISIONES - - - - 
        let collisions = [];
        for(let object of sceneObjects) {
            // No queremos comparar las colisiones con nosotros mismos
            if (object != this && !this.collisionedPins.includes(object) ) {
                if (checkCollision(this, object)) {
                    if (object.constructor.name == "Pin") {
                        this.collisionedPins.push(object);
                    }
                    // Añadimos al vector de objetos que tratar el objeto con el que hemos colisionado.
                    collisions.push(object);
                }
            }
        }

        // - - - - TRATAMIENTO DE COLISIONES - - - -
        for(let object of collisions) {
            resolveCollision(dt, this, object);
        }
    }

    applyNextFrame() {
        if (this.start === false) {
            return;
        }

        const nextY = this.positionNextFrame[1];
        const planeY = 0;
        const eps = 0.02;  // tolerancia, un poco mayor para absorber penetraciones

        if (nextY <= this.radius + eps) {
          const dx = this.positionNextFrame[0] - this.position[0];
          const dz = this.positionNextFrame[2] - this.position[2];
          const dist = Math.hypot(dx, dz);

          // umbral muy pequeño en vez de >0
          if (dist > 1e-4) {
            const dAngleRad = dist / this.radius;
            const dAngleDeg = dAngleRad * (180/Math.PI);

            const up = vec3(0,1,0);
            const velH = vec3(dx,0,dz);
            const axis = normalize(cross(up, velH));

            const deltaRot = rotate(dAngleDeg, axis);
            this.orientation = mult(deltaRot, this.orientation);
          }
        }

        this.velocity = this.velocityNextFrame;
        this.position = this.positionNextFrame;
        this.#updatePosition();
    }
  }
  
export class Pin {
    constructor(x, y, z) {
        this.scene = new SceneManager();
        
        // Representación física (cubo)
        this.hitboxPointsArray = pointsCube;
        this.hitboxUniforms = {
            u_color: [0.3, 0.3, 0.3, 0.3],
            u_model: new mat4(),
        };
        
        // Representación visual (OBJ)
        this.visualPointsArray = null; // Se cargará después
        this.visualUniforms = {
            u_color: [1.0, 1.0, 1.0, 1.0],
            u_model: new mat4(),
            u_texture: null
        };
        
        this.primType = "triangles";

        // Propiedades físicas (usando el cubo como hitbox)
        this.mass = 2;
        this.velocity = vec3(0, 0, 0);
        this.position = vec3(x, y, z);
        this.angularVelocity = vec3(0, 0, 0);
        this.rotationMatrix = mat4();
        this.visualModelMatrix = mat4();

        this.velocityNextFrame = vec3(0,0,0);
        this.positionNextFrame = vec3(0,0,0);

        // Propiedades para el escalado inicial del modelo
        this.modelScale = vec3(0.07, 0.07, 0.07); 
        this.modelRotation = -90; // Rotación en grados
        this.modelRotationAxis = vec3(1, 0, 0); // Eje X

        this.textureLoaded = false;
        this.texture = null;

        // Propiedades del pin
        this.pinNumber = Pin.numPines++;
        this.width = 1;
        this.depth = 1;
        this.height = 3;
        this.hasHitBall = false;
        this.hasHitPin = false;
        this.hasFallen = false;
        
        this.pointOfCollision = null;
        this.#updatePosition();
    }

    async loadModel(gl, url) {
        try {
            // Cargar el modelo OBJ
            this.visualPointsArray = await OBJLoader.loadOBJ(gl, url);
            
            // Configurar transformación inicial del modelo visual
            this.visualModelMatrix = mat4();

            this.visualModelMatrix = mult(this.visualModelMatrix, translate(0, -1, 0));
            
            // 1. Aplicar escalado
            this.visualModelMatrix = mult(this.visualModelMatrix, scale(
                this.modelScale[0], 
                this.modelScale[1], 
                this.modelScale[2]
            ));
            
            // 2. Aplicar rotación inicial
            this.visualModelMatrix = mult(
                this.visualModelMatrix, 
                rotate(this.modelRotation, this.modelRotationAxis)
            );
            
            // 3. Combinar con la transformación física (posición y rotación actual)
            this.#updatePosition();
            
        } catch (error) {
            console.error("Error loading OBJ model:", error);
            // Si falla la carga, usamos el cubo como representación visual también
            this.visualPointsArray = this.hitboxPointsArray;
            this.visualModelMatrix = mat4(); // Matriz identidad
        }
    }

    loadTexture(gl, textureUrl) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        
        // Textura temporal mientras se carga
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
                      new Uint8Array([255, 255, 255, 255]));
        
        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            
            // Configuración para WebGL
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            
            this.textureLoaded = true;
            this.visualUniforms.u_texture = this.texture;
        };
        image.src = textureUrl;
    }


    #updatePosition() {
        const translationMatrix = translate(
            this.position[0], 
            this.position[1], 
            this.position[2]
        );
        
        // Actualizar hitbox (cubo de colisión)
        this.hitboxUniforms.u_model = mult(translationMatrix, this.rotationMatrix);
        
        // Actualizar modelo visual (OBJ)
        if (this.visualPointsArray) {
            // Combinar: transformación física * transformación visual inicial
            this.visualUniforms.u_model = mult(
                mult(translationMatrix, this.rotationMatrix),
                this.visualModelMatrix
            );
        }
    }

  
    setProgramInfo(pInfo) {
        this.programInfo = pInfo;
    }

    calculateNextFrame(dt) {
        const sceneObjects = this.scene.getObjectsToDraw();

        // Si no hay cambios las siguientes velocidades serán las de ahora
        const GRAVITY = vec3(0, -15, 0)
        let gravityEffect = multVectScalar(GRAVITY, dt); 
        gravityEffect = vec3(gravityEffect[0], gravityEffect[1], gravityEffect[2]);

        this.velocityNextFrame = add(this.velocity, gravityEffect); 
        this.positionNextFrame = add(this.position, mult(dt, this.velocity));

        // Gestion de la velocidad angular
        const angle = length(this.angularVelocity) * dt;
        if (angle > 0.001) { // umbral para evitar micro-rotaciones
            // Eje normalizado de rotación
            const axis = normalize(this.angularVelocity);

            // Crear matriz de rotación incremental
            const rotMat = rotate(angle, axis);

            // Acumular rotación
            this.rotationMatrix = mult(rotMat, this.rotationMatrix);
        }

        // - - - DETECCION DE COLISIONES - - - - 
        let collisions = [];
        for(let object of sceneObjects) {
            // No queremos comparar las colisiones con nosotros mismos
            if (object != this) {
                if (checkCollision(this, object)) {
                    // Añadimos al vector de objetos que tratar el objeto con el que hemos colisionado.
                    collisions.push(object);
                }
            }
        }

        // - - - - TRATAMIENTO DE COLISIONES - - - -
        for(let object of collisions) {
            resolveCollision(dt, this, object);
        }
    }

    applyNextFrame() {
        this.velocity = this.velocityNextFrame;
        this.position = this.positionNextFrame;
        this.#updatePosition();
    }

    cleanup() {
        // Limpiar los buffers WebGL
        if (this.vertexBuffer) {
            this.gl.deleteBuffer(this.vertexBuffer);
        }
    }
}

export class Plano {
    constructor() {
        this.pointsArray = pointsPlane;
        this.uniforms = {
        u_color: [1.0, 1.0, 1.0, 1.0],
			  u_model: new mat4(),
        u_texture: null
		};
		this.primType = "triangles";   
        
        this.normal = vec3(0, 1, 0);
        this.position = vec3(0, 0, 0);

        // Caracteristicas del plano
        this.width = 10;
        this.depth = 10
        this.height = 0;


        this.#rotate();
    }

    loadTexture(gl, textureUrl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Textura temporal mientras se carga
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
                      new Uint8Array([255, 255, 255, 255]));
        
        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            
            // Configuración para textura repetible
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
            
            this.uniforms.u_texture = texture;
        };
        image.src = textureUrl;
    }

    #rotate() {
        const rotationMatrix = rotate(90, vec3(1, 0, 0)); 
        this.uniforms.u_model = mult(rotationMatrix, this.uniforms.u_model);
    }

    setProgramInfo(pInfo) {
        this.programInfo = pInfo;
    }

    calculateNextFrame() {
        // El plano no se mueve 
        return;
    }

    applyNextFrame() {
        // El plano no se mueve
        return; 
    }
}
