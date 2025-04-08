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
    #setProjection(fov) {
		const gl = this.gl;
		const aspect = this.canvas.width / this.canvas.height;

		const projection = perspective(fov, aspect, 0.1, 100.0);
		gl.uniformMatrix4fv(this.programInfo.uniformLocations.projection, false, projection);
	}


    #render() {
        this.scene.update(dt);

        const gl = this.gl;
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        objects = this.scene.getObjects();
        for (object in objects) {
            gl.useProgram(object.programInfo.program);

            // Setup buffers and attributes
            setBuffersAndAttributes(object.programInfo, object);

            // Set the uniforms
		    setUniforms(object.programInfo, object.uniforms);

            // Draw
		    gl.drawArrays(object.primitive, 0, object.pointsArray.length);
        }
		requestAnimationFrame(this.#render);
    }

    // -----------------
    // UTILS
    // -----------------
    setBuffersAndAttributes(pInfo, object) {
        const gl = this.gl;
        // Load the data into GPU data buffers
        // Vertices
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER,  flatten(object.pointsArray), gl.STATIC_DRAW );
        gl.vertexAttribPointer( pInfo.attribLocations.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
        gl.enableVertexAttribArray( pInfo.attribLocations.vPosition );
    }

    setUniforms(pInfo, uniforms) {
        const gl = this.gl;
        var canvas = document.getElementById("gl-canvas");
    
        // Set up camera
        // Projection matrix
        projection = perspective( 45.0, canvas.width/canvas.height, 0.1, 100.0 );
        gl.uniformMatrix4fv( pInfo.uniformLocations.projection, gl.FALSE, projection ); // copy projection to uniform value in shader
    
        
        gl.uniformMatrix4fv(pInfo.uniformLocations.view, gl.FALSE, view); // copy view to uniform value in shader
    
        // Copy uniform model values to corresponding values in shaders
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

        WebGLManager.instance = this;
    }

    /**
     * Inicializa el contexto y configura WebGL.
     */
    init(scene, fov) {
		this.scene = scene;
		this.#setupGL();
		this.#setProjection(fov);

		console.log(this.objectsToDraw);
	}

	start() {
		requestAnimFrame(() => this.#render());
	}

    getProgramInfoTemplate(type) {
        const gl = this.gl
        if (type === "PLANE") {
            var planeProgramInfo = {
                program: {},
                uniformLocations: {},
                attribLocations: {},
            };
            // Set up a WebGL program for the plane
            // Load shaders and initialize attribute buffers
            planeProgramInfo.program = initShaders(gl, "plane-vertex-shader", "plane-fragment-shader");
            
            // Save the attribute and uniform locations
            planeProgramInfo.uniformLocations.model = gl.getUniformLocation(planeProgramInfo.program, "model");
            planeProgramInfo.uniformLocations.view = gl.getUniformLocation(planeProgramInfo.program, "view");
            planeProgramInfo.uniformLocations.projection = gl.getUniformLocation(planeProgramInfo.program, "projection");
            planeProgramInfo.uniformLocations.baseColor = gl.getUniformLocation(planeProgramInfo.program, "baseColor");
            planeProgramInfo.attribLocations.vPosition = gl.getAttribLocation(planeProgramInfo.program, "vPosition");

            return planeProgramInfo;
        }
        else if (type === "CUBE") {
            var cubePorgramInfo = {
                program: {},
                uniformLocations: {},
                attribLocations: {},
            };

            //Save the attribute and uniform locations for the cube program
            cubePorgramInfo.program = initShaders(gl, "plane-vertex-shader", "plane-fragment-shader");
            cubePorgramInfo.uniformLocations.model = gl.getUniformLocation(cubePorgramInfo.program, "model");
            cubePorgramInfo.uniformLocations.view = gl.getUniformLocation(cubePorgramInfo.program, "view");
            cubePorgramInfo.uniformLocations.projection = gl.getUniformLocation(cubePorgramInfo.program, "projection");
            cubePorgramInfo.uniformLocations.baseColor = gl.getUniformLocation(cubePorgramInfo.program, "baseColor");
            cubePorgramInfo.attribLocations.vPosition = gl.getAttribLocation(cubePorgramInfo.program, "vPosition");

            return cubePorgramInfo;
        }
        else if (type === "SPHERE") {
            var sphereProgramInfo = {
                program: {},
                uniformLocations: {},
                attribLocations: {},
            };

            // Set up a WebGL program for spheres
            // Load shaders and initialize attribute buffers
            sphereProgramInfo.program = initShaders(gl, "sphere-vertex-shader", "sphere-fragment-shader");
            
            // Save the attribute and uniform locations
            sphereProgramInfo.uniformLocations.model = gl.getUniformLocation(sphereProgramInfo.program, "model");
            sphereProgramInfo.uniformLocations.view = gl.getUniformLocation(sphereProgramInfo.program, "view");
            sphereProgramInfo.uniformLocations.projection = gl.getUniformLocation(sphereProgramInfo.program, "projection");
            sphereProgramInfo.uniformLocations.baseColor = gl.getUniformLocation(sphereProgramInfo.program, "baseColor");
            sphereProgramInfo.attribLocations.vPosition = gl.getAttribLocation(sphereProgramInfo.program, "vPosition");

        }
    }
}