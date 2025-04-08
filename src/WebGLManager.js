import { SceneManager } from "./SceneManager.js";

export class WebGLManager {

    // ----------------------------
    // Funciones Privadas
    // ----------------------------

    /**
     * Configura las opciones y estados básicos de WebGL.
     */
    #setupGL() {
		    const gl = this.gl;
		    gl.clearColor(0.0, 0.0, 0.0, 1.0); // fondo negro
		    gl.enable(gl.DEPTH_TEST);
		    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	  }

    /**
     * Establece la matriz de proyección para la cámara.
     */
    #setProjection(pInfo, fov) {
        const gl = this.gl;
        const aspect = this.canvas.width / this.canvas.height;
        this.projectionMatrix = perspective(fov, aspect, 0.1, 100.0);
        
        // Actualiza el uniform en el programa específico
        if (pInfo && pInfo.uniformLocations) {
            gl.uniformMatrix4fv(
                pInfo.uniformLocations.projection, 
                false, 
                this.projectionMatrix
            );
        }
    }


    #render() {
        const gl = this.gl;
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        this.objectsToDraw.forEach(object => {
            gl.useProgram(object.programInfo.program);
            
            // Actualizar matrices y uniforms
            this.#setUniforms(object.programInfo, {
                u_model: object.uniforms.u_model,
                u_color: object.uniforms.u_color,
                view: this.viewMatrix,
                projection: this.projectionMatrix
            });

            // Configurar buffers
            this.#setBuffersAndAttributes(object.programInfo, object);
            
            gl.drawArrays(object.primitive, 0, object.pointsArray.length);
        });

        requestAnimationFrame(() => this.#render());
    }

    // -----------------
    // UTILS
    // -----------------
    #setBuffersAndAttributes(pInfo, object) {
        const gl = this.gl;
        // Load the data into GPU data buffers
        // Vertices
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER,  flatten(object.pointsArray), gl.STATIC_DRAW );
        gl.vertexAttribPointer( pInfo.attribLocations.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
        gl.enableVertexAttribArray( pInfo.attribLocations.vPosition );
    }

    #setUniforms(pInfo, uniforms) {
    const gl = this.gl;
    
        // Matrices
        gl.uniformMatrix4fv(pInfo.uniformLocations.projection, false, uniforms.projection);
        gl.uniformMatrix4fv(pInfo.uniformLocations.view, false, uniforms.view);
        gl.uniformMatrix4fv(pInfo.uniformLocations.model, false, uniforms.u_model);
    
        if (pInfo.uniformLocations.baseColor && uniforms.u_color) {
            gl.uniform4f(
                pInfo.uniformLocations.baseColor,
                uniforms.u_color[0],
                uniforms.u_color[1],
                uniforms.u_color[2],
                uniforms.u_color[3]
            );
        }
    }


	  // ----------------------------
    // Funciones Publicas
    // ----------------------------
    static instance;
    constructor() {
        if (WebGLManager.instance) {
            return WebGLManager.instance;
        }

        this.canvas = document.getElementById("gl-canvas");
        this.gl = WebGLUtils.setupWebGL(this.canvas);
        if (!this.gl) {
            alert("WebGL isn't available");
        }

        this.scene = new SceneManager();
        this.viewMatrix = mat4();
        this.projectionMatrix = mat4();
        

        WebGLManager.instance = this;
    }

    /**
     * Inicializa el contexto y configura WebGL.
     */
    init(objectsToDraw, fov) {
    this.objectsToDraw = objectsToDraw;
		this.#setupGL();
		this.#setProjection(fov);

		console.log(this.objectsToDraw);
	}

	start() {
		requestAnimFrame(() => this.#render());
	}

    updateViewMatrix(eye, target, up) {
        this.viewMatrix = lookAt(eye, target, up);
    }

    getProgramInfoTemplate(type) {
        const gl = this.gl;
        const programInfo = {
            program: null,
            uniformLocations: {},
            attribLocations: {}
        };

        let vertexShader, fragmentShader;
        
        switch(type) {
            case "PLANE":
                vertexShader = "plane-vertex-shader";
                fragmentShader = "plane-fragment-shader";
                break;
            case "SPHERE":
                vertexShader = "sphere-vertex-shader";
                fragmentShader = "sphere-fragment-shader";
                break;
            case "CUBE":
                vertexShader = "plane-vertex-shader";
                fragmentShader = "plane-fragment-shader";
                break;
            default:
                throw new Error("Tipo de programa no soportado");
        }

        programInfo.program = initShaders(gl, vertexShader, fragmentShader);
        
        // Obtener ubicaciones de uniforms
        programInfo.uniformLocations.model = gl.getUniformLocation(programInfo.program, "model");
        programInfo.uniformLocations.view = gl.getUniformLocation(programInfo.program, "view");
        programInfo.uniformLocations.projection = gl.getUniformLocation(programInfo.program, "projection");
        programInfo.uniformLocations.baseColor = gl.getUniformLocation(programInfo.program, "baseColor");
        
        // Obtener ubicaciones de atributos
        programInfo.attribLocations.vPosition = gl.getAttribLocation(programInfo.program, "vPosition");

        return programInfo;
    }
}

