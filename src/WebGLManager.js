import { Camera } from "./Camera.js";
import { SceneManager } from "./SceneManager.js";

export class WebGLManager {
    static last_tick;
    static actual_tick;
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
    #setProjection(fov) {
        const gl = this.gl;
        const aspect = this.canvas.width / this.canvas.height;
        this.projectionMatrix = perspective(fov, aspect, 0.1, 100.0);
    }


    #render() {
        // Calculo delta Time
        WebGLManager.actual_tick = Date.now();
        var dt = (WebGLManager.actual_tick - WebGLManager.last_tick)/1000;
        
        // Actualizacion de la escena
        this.scene.update(dt);

        // Renderizacion de la escena
        const gl = this.gl;
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        var objects = this.scene.getObjectsToDraw();
        for (let object of objects) {
            gl.useProgram(object.programInfo.program);
            this.#setBuffersAndAttributes(object);
            this.#setUniforms(object);
            gl.drawArrays(object.primitive, 0, object.pointsArray.length);
        }
        WebGLManager.last_tick = WebGLManager.actual_tick;
        requestAnimationFrame(() => this.#render());
    }

    // -----------------
    // UTILS
    // -----------------
    #setBuffersAndAttributes(object) {
        const gl = this.gl;
        var pointsArray = object.pointsArray;
        var pInfo = object.programInfo;

        // Load the data into GPU data buffers
        // Vertices
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER,  flatten(pointsArray), gl.STATIC_DRAW );
        gl.vertexAttribPointer( pInfo.attribLocations.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
        gl.enableVertexAttribArray( pInfo.attribLocations.vPosition );
    }

    #setUniforms(object) {
        const gl = this.gl;
        var uniforms = object.uniforms;
        var pInfo = object.programInfo;
        var view = this.camera.getViewMatrix();

        // Matrices
	    // Copy uniform model values to corresponding values in shaders
        gl.uniformMatrix4fv( pInfo.uniformLocations.projection, gl.FALSE, this.projectionMatrix);
        gl.uniformMatrix4fv(pInfo.uniformLocations.view, gl.FALSE, view);
        if (pInfo.uniformLocations.baseColor != null) {
            gl.uniform4f(pInfo.uniformLocations.baseColor, uniforms.u_color[0], uniforms.u_color[1], uniforms.u_color[2], uniforms.u_color[3]);
        }
        gl.uniformMatrix4fv(pInfo.uniformLocations.model, gl.FALSE, uniforms.u_model);
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
        this.camera = new Camera();

        // Matriz de proyeccion 3D
        this.projectionMatrix = mat4();

        WebGLManager.instance = this;
        console.log("WebGLManager construido correctamente");

        WebGLManager.last_tick = Date.now();
    }

    /**
     * Inicializa el contexto y configura WebGL.
     */
    init(fov) {
		this.#setupGL();
		this.#setProjection(fov);
        console.log("WebGLManager inicializado");
	}

	start() {
        console.log("Empezando el renderizado");
		requestAnimFrame(() => this.#render());
	}

    getProgramInfoTemplate(type) {
        const gl = this.gl;
        var programInfo = {
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

    setPrimitives(objectsToDraw) {	
        const gl = this.gl;
        objectsToDraw.forEach(function(object) {
            switch(object.primType) {
              case "lines":
                object.primitive = gl.LINES;
                break;
              case "line_strip":
                object.primitive = gl.LINE_STRIP;
                break;
              case "triangles":
                object.primitive = gl.TRIANGLES;
                break;
              default:
                object.primitive = gl.TRIANGLES;
            }
        });	
    }
}
