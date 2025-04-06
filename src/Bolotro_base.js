// Variable to store the WebGL rendering context
var gl;

//----------------------------------------------------------------------------
// OTHER DATA 
//----------------------------------------------------------------------------

var model = new mat4();   		// create a model matrix and set it to the identity matrix
var view = new mat4();   		// create a view matrix and set it to the identity matrix
var projection = new mat4();	// create a projection matrix and set it to the identity matrix

var eye, target, up;			// for view matrix

// Valores iniciales de la cámara
var initialEye = vec3(10.0, 0.0, 10.0);
var initialTarget = subtract(initialEye, vec3(10.0, 0.0, 10.0));
var initialUp = vec3(0.0, 0.0, 1.0);
var initialVecTarget = vec3(10.0, 0.0, 10.0);
var initialVecPosInicial = vec3(5.0, 0.0, 5.0);
var initialRotationAngle = 0;

var gravity = 9.8;

// Variables para el control de la esfera
var forceMagnitude = 5.0; // Magnitud de la fuerza aplicada
var maxSpeed = 10.0;      // Velocidad máxima de la esfera
var sphereControllerIndex = 1; // Índice de la esfera controladora (blanca)
var appliedForce = vec3(0.0, 0.0, 0.0); // Fuerza aplicada por las teclas
const boundForce = 1.2; //Fuerza del rebote con el plano
var hasShoot = false;
var vecPosInicial = vec3(5.0, 0.0, 5.0);
var vecTarget = vec3(10.0, 0.0, 10.0);
var shiftDown = false;
const moveStep = 0.1; //Cuanto se movera hacia los lados
const maxHorizontal = 10; //Maximo movimiento horizontal
const rotateStep = 1.0; //Cuanto se rotara
var rotationAngle = 0; //Angulo de rotacion solo se usará para no salirse de los límites
const maxRotation = 70; //Maxima rotacion
var shootForce = 0.0; //Fuerza de lanzamiento
const maxShootForce = 18.0; //Maxima fuerza de lanzamiento
var shootStep = 0.3; //Incremento de la fuerza de lanzamiento
var isCharging = false; //Si se esta cargando la bola
var shootForceDirection = 1; // 1 para subir, -1 para bajar

const forceBar = document.getElementById("force-bar");

var planeProgramInfo = {
	program: {},
	uniformLocations: {},
	attribLocations: {},
};

var sphereProgramInfo = {
	program: {},
	uniformLocations: {},
	attribLocations: {},
};

var cubePorgramInfo = {
	program: {},
	uniformLocations: {},
	attribLocations: {},
};

// List of objects to draw
var objectsToDraw = [
	{
		programInfo: planeProgramInfo,
		pointsArray: pointsPlane, 
		uniforms: {
			u_color: [0.2, 0.2, 0.2, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
	{
		programInfo: sphereProgramInfo,
		pointsArray: pointsSphere, 
		uniforms: {
			u_color: [1.0, 1.0, 1.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},

    //--------------------Bolos
	{
		programInfo: cubePorgramInfo,
		pointsArray: pointsCube, 
		uniforms: {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
    {
		programInfo: cubePorgramInfo,
		pointsArray: pointsCube, 
		uniforms: {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
    {
		programInfo: cubePorgramInfo,
		pointsArray: pointsCube, 
		uniforms: {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
    {
		programInfo: cubePorgramInfo,
		pointsArray: pointsCube, 
		uniforms: {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
    {
		programInfo: cubePorgramInfo,
		pointsArray: pointsCube, 
		uniforms: {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
    {
		programInfo: cubePorgramInfo,
		pointsArray: pointsCube, 
		uniforms: {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
    {
		programInfo: cubePorgramInfo,
		pointsArray: pointsCube, 
		uniforms: {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
    {
		programInfo: cubePorgramInfo,
		pointsArray: pointsCube, 
		uniforms: {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
    {
		programInfo: cubePorgramInfo,
		pointsArray: pointsCube, 
		uniforms: {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	},
    {
		programInfo: cubePorgramInfo,
		pointsArray: pointsCube, 
		uniforms: {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		},
		primType: "triangles",
	}
];

//List of physical objects
var entities = [
	{
		type: "plane",
		position: [0.0, 0.0, 0.0],
		rotation: [0.0, 0.0, 0.0],
		scale: [1.0, 0.6, 1.0]
	},
	{
		type: "sphere",
		position: [0.0, 0.0, 0.0],
		rotation: [0.0, 0.0, 0.0],
		radius: 1.5,
		velocity: [0.0, 0.0, 0.0]
	},

    //--------------------Bolos
	{
		type: "cube",
        origPosition: [-6.0, -3.0, 1.0],
		position: [],
		rotation: [0.0, 0.0, 0.0],
        velocity: [0.0, 0.0, 0.0],
        isFalling: false
	},
	{
		type: "cube",
		origPosition: [-6.0, -1.0, 1.0],
        position: [],
		rotation: [0.0, 0.0, 0.0],
        velocity: [0.0, 0.0, 0.0],
        isFalling: false
	},
	{
		type: "cube",
		origPosition: [-6.0, 1.0, 1.0],
        position: [],
		rotation: [0.0, 0.0, 0.0],
        velocity: [0.0, 0.0, 0.0],
        isFalling: false
	},
    {
		type: "cube",
        origPosition: [-6.0, 3.0, 1.0],
		position: [],
		rotation: [0.0, 0.0, 0.0],
        velocity: [0.0, 0.0, 0.0],
        isFalling: false
	},
	{
		type: "cube",
		origPosition: [-5.0, -2.0, 1.0],
        position: [],
		rotation: [0.0, 0.0, 0.0],
        velocity: [0.0, 0.0, 0.0],
        isFalling: false
	},
	{
		type: "cube",
		origPosition: [-5.0, 0.0, 1.0],
        position: [],
		rotation: [0.0, 0.0, 0.0],
        velocity: [0.0, 0.0, 0.0],
        isFalling: false
	},
    {
		type: "cube",
        origPosition: [-5.0, 2.0, 1.0],
		position: [],
		rotation: [0.0, 0.0, 0.0],
        velocity: [0.0, 0.0, 0.0],
        isFalling: false
	},
	{
		type: "cube",
		origPosition: [-4.0, -1.0, 1.0],
        position: [],
		rotation: [0.0, 0.0, 0.0],
        velocity: [0.0, 0.0, 0.0],
        isFalling: false
	},
	{
		type: "cube",
		origPosition: [-4.0, 1.0, 1.0],
        position: [],
		rotation: [0.0, 0.0, 0.0],
        velocity: [0.0, 0.0, 0.0],
        isFalling: false
	},
    {
		type: "cube",
		origPosition: [-3.0, 0.0, 1.0],
        position: [],
		rotation: [0.0, 0.0, 0.0],
        velocity: [0.0, 0.0, 0.0],
        isFalling: false
	}
]

//----------------------------------------------------------------------------
// Initialization function
//----------------------------------------------------------------------------

window.onload = function init() {
	// Set up a WebGL Rendering Context in an HTML5 Canvas
	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	//  Configure WebGL
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);

	setPrimitive(objectsToDraw);

	// Set up a WebGL program for the plane
	// Load shaders and initialize attribute buffers
	planeProgramInfo.program = initShaders(gl, "plane-vertex-shader", "plane-fragment-shader");
	  
	// Save the attribute and uniform locations
	planeProgramInfo.uniformLocations.model = gl.getUniformLocation(planeProgramInfo.program, "model");
	planeProgramInfo.uniformLocations.view = gl.getUniformLocation(planeProgramInfo.program, "view");
	planeProgramInfo.uniformLocations.projection = gl.getUniformLocation(planeProgramInfo.program, "projection");
	planeProgramInfo.uniformLocations.baseColor = gl.getUniformLocation(planeProgramInfo.program, "baseColor");
	planeProgramInfo.attribLocations.vPosition = gl.getAttribLocation(planeProgramInfo.program, "vPosition");

	// Set up a WebGL program for spheres
	// Load shaders and initialize attribute buffers
	sphereProgramInfo.program = initShaders(gl, "sphere-vertex-shader", "sphere-fragment-shader");
	  
	// Save the attribute and uniform locations
	sphereProgramInfo.uniformLocations.model = gl.getUniformLocation(sphereProgramInfo.program, "model");
	sphereProgramInfo.uniformLocations.view = gl.getUniformLocation(sphereProgramInfo.program, "view");
	sphereProgramInfo.uniformLocations.projection = gl.getUniformLocation(sphereProgramInfo.program, "projection");
	sphereProgramInfo.uniformLocations.baseColor = gl.getUniformLocation(sphereProgramInfo.program, "baseColor");
	sphereProgramInfo.attribLocations.vPosition = gl.getAttribLocation(sphereProgramInfo.program, "vPosition");

	//Save the attribute and uniform locations for the cube program
	cubePorgramInfo.program = initShaders(gl, "plane-vertex-shader", "plane-fragment-shader");
	cubePorgramInfo.uniformLocations.model = gl.getUniformLocation(cubePorgramInfo.program, "model");
	cubePorgramInfo.uniformLocations.view = gl.getUniformLocation(cubePorgramInfo.program, "view");
	cubePorgramInfo.uniformLocations.projection = gl.getUniformLocation(cubePorgramInfo.program, "projection");
	cubePorgramInfo.uniformLocations.baseColor = gl.getUniformLocation(cubePorgramInfo.program, "baseColor");
	cubePorgramInfo.attribLocations.vPosition = gl.getAttribLocation(cubePorgramInfo.program, "vPosition");

	// Set up viewport 
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

	//Set up camera
	// View matrix (static cam)
	eye = vec3(10.0, 0.0, 10.0);
	target = subtract(eye, vecTarget);
	up = vec3(0.0, 0.0, 1.0);
	view = lookAt(eye,target,up);

    entities[1].position = subtract(eye, vecPosInicial);
	entities[1].orientation = mat4();

    // Inicializar valores de cámara
    eye = initialEye;
    target = initialTarget;
    up = initialUp;
    vecTarget = initialVecTarget;
    vecPosInicial = initialVecPosInicial;
    rotationAngle = initialRotationAngle;

    //Colocar cada bolo en su sitio
    entities.forEach(function(entity, index) {
        if (entity.type==="cube") {
            entity.position = [entity.origPosition[0], entity.origPosition[1], entity.origPosition[2]];
            updateTransformMatrix(entity, index);
        }
    });
	

	lastTick = Date.now();
	requestAnimFrame(tick);
};


//----------------------------------------------------------------------------
// Tick Event Function
//----------------------------------------------------------------------------

var lastTick;

function tick(nowish) {
	var now = Date.now();

    var dt = (now - lastTick)/1000;
    lastTick = now;

	update(dt)
	render(dt)

	window.requestAnimationFrame(tick)
}

//----------------------------------------------------------------------------
// Update Event Function
//----------------------------------------------------------------------------

function update(dt) {
	if(hasShoot){
		physics_update(dt);
		colisions_update(dt);
	}
	
	// Update state
	entities.forEach(function(entity, index) {
		if(entity.type === "sphere") {
			
			// Comprobamos si la esfera está “tocando” el plano (su posición z cercana a radius/2)
			if (Math.abs(entity.position[2] - entity.radius/2.0) < 0.05) {
				// Extraemos el desplazamiento en el plano (x e y)
				let dx = entity.velocity[0] * dt;
				let dy = entity.velocity[1] * dt;
				let distance = Math.sqrt(dx*dx + dy*dy);
				if(distance > 0) {
					// Calcula el ángulo incremental en grados.
					// (distance / radius) da el ángulo en radianes.
					let dAngle = (distance / entity.radius) * (180/Math.PI);
					// El eje de rotación es perpendicular a la dirección de desplazamiento.
					let up = vec3(0.0, 0.0, 1.0);
					let velocityXY = vec3(dx, dy, 0.0);
					let rollAxis = normalize(cross(up, velocityXY)); // rollAxis = (dy, -dx, 0) normalizado
	
					// Crea la matriz de rotación incremental usando el eje y el ángulo calculado
					let deltaRot = rotate(dAngle, rollAxis);
	
					// Actualiza la orientación multiplicando la nueva rotación por la orientación previa.
					entity.orientation = mult(deltaRot, entity.orientation);
				}
			}
	
			// Actualiza la transformación final de la esfera:
			// Primero se aplica la escala, luego la rotación (orientación actual) y finalmente la traslación.
			let transform = scale(entity.radius, entity.radius, entity.radius);
			transform = mult(entity.orientation, transform);
			transform = mult(translate(entity.position[0], entity.position[1], entity.position[2]), transform);
	
			// Asignar la transformación al objeto correspondiente en objectsToDraw
			objectsToDraw[index].uniforms.u_model = transform;
		}
		else if(entity.type==="plane")
		{
			let transform = scale(entity.scale[0], entity.scale[1], entity.scale[2]);

			let ejeX = vec3(1.0, 0.0, 0.0);
			transform = mult(rotate(entity.rotation[0], ejeX), transform);
			let ejeY = vec3(0.0, 1.0, 0.0);
			transform = mult(rotate(entity.rotation[1], ejeY), transform);
			let ejeZ = vec3(0.0, 0.0,1.0);
			transform = mult(rotate(entity.rotation[2], ejeZ), transform);
			transform = mult(translate(entity.position[0], entity.position[1], entity.position[2]), transform);
			
			objectsToDraw[index].uniforms.u_model = transform;
		}
        else if(entity.type === "cube") {
            // Rotación dinámica durante la caída
            if(entity.isFalling) {
                // Actualizar rotación basada en la velocidad
                entity.rotation[0] += entity.velocity[1] * 0.5 * dt * 180/Math.PI;
                entity.rotation[1] += entity.velocity[0] * 0.5 * dt * 180/Math.PI;
                entity.rotation[2] += entity.velocity[2] * 0.2 * dt * 180/Math.PI;
            }

            // Construir matriz de transformación
            updateTransformMatrix(entity,index);

        }
	});
}

//Actualizar la matriz de transformación de una entidad (actualizar gráficos con respecto a la posición lógica)
function updateTransformMatrix(entity, index) {
    let ejeX = vec3(1.0, 0.0, 0.0);
    let transform = rotate(entity.rotation[0], ejeX);
    let ejeY = vec3(0.0, 1.0, 0.0);
    transform = mult(rotate(entity.rotation[1], ejeY), transform);
    let ejeZ = vec3(0.0, 0.0,1.0);
    transform = mult(rotate(entity.rotation[2], ejeZ), transform);
    transform = mult(translate(entity.position[0], entity.position[1], entity.position[2]), transform);

    objectsToDraw[index].uniforms.u_model = transform;
}

function physics_update(dt) {
    var gravity_ac = gravity;
    entities.forEach(function (entity, index) {
        if (entity.type === "sphere") {
            // Aplicar la fuerza solo a la esfera controladora
            if (index === sphereControllerIndex) {
                entity.velocity[0] += appliedForce[0] * dt;
                entity.velocity[1] += appliedForce[1] * dt;

                // Limitar la velocidad máxima
                let speed = length(vec3(entity.velocity[0], entity.velocity[1], 0.0));
                if (speed > maxSpeed) {
                    entity.velocity[0] = (entity.velocity[0] / speed) * maxSpeed;
                    entity.velocity[1] = (entity.velocity[1] / speed) * maxSpeed;
                }
            }

            // Aplicar gravedad a la esfera
            entity.velocity[2] -= gravity_ac * dt;

            // Actualizar posición de la esfera
            entity.position[0] += entity.velocity[0] * dt;
            entity.position[1] += entity.velocity[1] * dt;
            entity.position[2] += entity.velocity[2] * dt;

        } else if (entity.type === "cube" && entity.isFalling) {
            // Física para cubos en caída
            let airResistance = 0.99;  // Resistencia del aire

            // Aplicar gravedad al cubo
            entity.velocity[2] -= gravity_ac * dt;

            // Aplicar resistencia del aire
            entity.velocity[0] *= airResistance;
            entity.velocity[1] *= airResistance;
            entity.velocity[2] *= airResistance;

            // Actualizar posición del cubo
            entity.position[0] += entity.velocity[0] * dt;
            entity.position[1] += entity.velocity[1] * dt;
            entity.position[2] += entity.velocity[2] * dt;

            // Actualizar rotación del cubo
            let angularVelocity = 2.0;
            entity.rotation[0] += (entity.velocity[0] * angularVelocity) * dt;
            entity.rotation[1] += (entity.velocity[1] * angularVelocity) * dt;
            entity.rotation[2] += (entity.velocity[0] + entity.velocity[1]) * 0.5 * angularVelocity * dt;

        }
    });
}

function colisions_update(dt) {
    // Colisiones de esferas
    entities.forEach(function(entity, index) {
        if(entity.type !== "sphere") return;

        // Colisión esfera-plano
        if(check_sphere_plane_col(entity, entities[0])) {
            let plane_normal = getPlaneNormal(entities[0]);
            plane_normal = vec3(plane_normal[0], plane_normal[1], plane_normal[2]);
            plane_normal = normalize(plane_normal);

            let sphere_pos = vec3(entity.position[0], entity.position[1], entity.position[2]);
            let plane_point = vec3(entities[0].position[0], entities[0].position[1], entities[0].position[2]);
            
            let d = dot(plane_normal, plane_point);
            let distance = dot(plane_normal, sphere_pos) - d;

            let effectiveRadius = entity.radius * 0.5;
            entity.position[0] -= plane_normal[0] * (distance - effectiveRadius);
            entity.position[1] -= plane_normal[1] * (distance - effectiveRadius);
            entity.position[2] -= plane_normal[2] * (distance - effectiveRadius);

            let velocity = vec3(entity.velocity[0], entity.velocity[1], entity.velocity[2]);
            let dot_product = dot(velocity, plane_normal);
            
            // Rebote con amortiguación
            entity.velocity[0] -= boundForce * dot_product * plane_normal[0];
            entity.velocity[1] -= boundForce * dot_product * plane_normal[1];
            entity.velocity[2] -= boundForce * dot_product * plane_normal[2];
        }

        // Colisión esfera-cubo
        for (let i = index + 1; i < entities.length; i++) {
            if (entities[i].type === "cube" && !entities[i].isFalling && check_sphere_cube_col(entity, entities[i])) {
                handle_sphere_cube_collision(entity, entities[i]);
            }
        }

        // Resetear posición si sale de los límites
        if (entity.position[2] < -10) {
            reset_sphere_position(entity);
        }
    });

    // Colisiones de cubos
    entities.forEach(function(entity, index) {
        if(entity.type !== "cube" || !entity.isFalling) return;

        // Colisión cubo-plano (versión mejorada)
        if(check_cube_plane_col(entity, entities[0])) {
            let plane_normal = getPlaneNormal(entities[0]);
            plane_normal = vec3(plane_normal[0], plane_normal[1], plane_normal[2]);
            plane_normal = normalize(plane_normal);

            let cube_center = vec3(entity.position[0], entity.position[1], entity.position[2]);
            let plane_point = vec3(entities[0].position[0], entities[0].position[1], entities[0].position[2]);
            
            let d = dot(plane_normal, plane_point);
            let distance = dot(plane_normal, cube_center) - d;

            // Calcular radio efectivo del cubo (considerando su orientación)
            let effective_radius = 0.5 * (
                Math.abs(plane_normal[0]) + 
                Math.abs(plane_normal[1]) + 
                Math.abs(plane_normal[2])
            );

            // Corregir posición para evitar hundimiento
            entity.position[0] -= plane_normal[0] * (distance - effective_radius);
            entity.position[1] -= plane_normal[1] * (distance - effective_radius);
            entity.position[2] -= plane_normal[2] * (distance - effective_radius);

            // Calcular velocidad de impacto
            let velocity = vec3(entity.velocity[0], entity.velocity[1], entity.velocity[2]);
            let impactSpeed = dot(velocity, plane_normal);

            // Solo aplicar rebote si está cayendo con suficiente velocidad
            if(impactSpeed < -0.2) {
                let restitution = 0.6; // Coeficiente de rebote (0-1)
                
                // Aplicar rebote
                entity.velocity[0] -= (1 + restitution) * impactSpeed * plane_normal[0];
                entity.velocity[1] -= (1 + restitution) * impactSpeed * plane_normal[1];
                entity.velocity[2] -= (1 + restitution) * impactSpeed * plane_normal[2];
                
                // Amortiguamiento y fricción
                let damping = 0.7;
                entity.velocity[0] *= damping;
                entity.velocity[1] *= damping;
                entity.velocity[2] *= damping;
                
                // Añadir rotación por impacto
                let spinFactor = 5.0;
                entity.rotation[0] += entity.velocity[1] * spinFactor;
                entity.rotation[1] += entity.velocity[0] * spinFactor;
            }
        }
        
        // Colisión cubo-cubo (opcional)
        for(let i = index + 1; i < entities.length; i++) {
            if(entities[i].type === "cube" && entities[i].isFalling) {
                if(check_cube_cube_col(entity, entities[i])) {
                    handle_cube_cube_collision(entity, entities[i]);
                }
            }
        }
    });
}

// Función auxiliar para colisión cubo-cubo (opcional)
function check_cube_cube_col(cube1, cube2) {
    let size = 0.5; // Mitad del tamaño del cubo (1x1x1)
    
    return (Math.abs(cube1.position[0] - cube2.position[0]) < size * 2 &&
            Math.abs(cube1.position[1] - cube2.position[1]) < size * 2 &&
            Math.abs(cube1.position[2] - cube2.position[2]) < size * 2);
}

// Función auxiliar para manejar colisión cubo-cubo (opcional)
function handle_cube_cube_collision(cube1, cube2) {
    let direction = normalize(vec3(
        cube2.position[0] - cube1.position[0],
        cube2.position[1] - cube1.position[1],
        cube2.position[2] - cube1.position[2]
    ));
    
    let force = 0.3;
    
    // Aplicar fuerzas opuestas a ambos cubos
    cube1.velocity[0] -= direction[0] * force;
    cube1.velocity[1] -= direction[1] * force;
    cube1.velocity[2] -= direction[2] * force;
    
    cube2.velocity[0] += direction[0] * force;
    cube2.velocity[1] += direction[1] * force;
    cube2.velocity[2] += direction[2] * force;
}
//----------------------------------------------------------------------------
// Colisiones entre esferas y planos
//----------------------------------------------------------------------------

function check_sphere_plane_col(sphere, plane) {
    let plane_normal = getPlaneNormal(plane);
    plane_normal = vec3(plane_normal[0], plane_normal[1], plane_normal[2]);
    plane_normal = normalize(plane_normal);

    // Obtener un punto en el plano (la posición del plano)
    let plane_point = vec3(plane.position[0], plane.position[1], plane.position[2]);

    // Calcular D en base a la ecuación del plano (n · X = D)
    let d = dot(plane_normal, plane_point);

    // Calcular la distancia del centro de la esfera al plano
    let sphere_pos = vec3(sphere.position[0], sphere.position[1], sphere.position[2]);
    let distance = dot(plane_normal, sphere_pos) - d;

    // Calcular los límites del plano teniendo en cuenta la escala
    let planeBounds = calculatePlaneBounds(pointsPlane, plane.scale);

    // Verificar si la esfera está dentro de los límites del plano
    let withinPlaneBounds = (
        sphere.position[0] >= plane.position[0] + planeBounds.minX &&
        sphere.position[0] <= plane.position[0] + planeBounds.maxX &&
        sphere.position[1] >= plane.position[1] + planeBounds.minY &&
        sphere.position[1] <= plane.position[1] + planeBounds.maxY
    );

    // Ver si la distancia es menor que el radio de la esfera y está dentro de los límites del plano
    return Math.abs(distance) < (sphere.radius * 0.5) && withinPlaneBounds;
}

function calculatePlaneBounds(pointsPlane, scale) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    pointsPlane.forEach(point => {
        // Aplicar la escala a los puntos
        let scaledX = point[0] * scale[0];
        let scaledY = point[1] * scale[1];

        // Calcular los límites
        if (scaledX < minX) minX = scaledX;
        if (scaledX > maxX) maxX = scaledX;
        if (scaledY < minY) minY = scaledY;
        if (scaledY > maxY) maxY = scaledY;
    });

    return {
        minX: minX,
        maxX: maxX,
        minY: minY,
        maxY: maxY
    };
}

function getPlaneNormal(plane) {
    const [rx, ry, rz] = plane.rotation;
    

	let ejeX = vec3(1.0, 0.0, 0.0);
	let ejeY = vec3(0.0, 1.0, 0.0);
	let ejeZ = vec3(0.0, 0.0, 1.0);

    let normal = vec4(0.0, 0.0, 1.0, 1.0);
    let matrix = mat4();

	matrix = mult(rotate(rx,ejeX),matrix)
	matrix = mult(rotate(ry,ejeY),matrix)
	matrix = mult(rotate(rz,ejeZ),matrix)

	return mult(matrix, normal)
}

//----------------------------------------------------------------------------
// Colisiones entre esfera y cubo
//----------------------------------------------------------------------------

function check_sphere_cube_col(sphere, cube) {
    let halfsize = 0.5;

    // Calcular los límites del cubo en el mundo
    let cubeMinX = cube.position[0] - halfsize;
    let cubeMaxX = cube.position[0] + halfsize;
    let cubeMinY = cube.position[1] - halfsize;
    let cubeMaxY = cube.position[1] + halfsize;
    let cubeMinZ = cube.position[2] - halfsize;
    let cubeMaxZ = cube.position[2] + halfsize;

    // Encontrar el punto más cercano en el cubo a la esfera
    let closestX = Math.max(cubeMinX, Math.min(sphere.position[0], cubeMaxX));
    let closestY = Math.max(cubeMinY, Math.min(sphere.position[1], cubeMaxY));
    let closestZ = Math.max(cubeMinZ, Math.min(sphere.position[2], cubeMaxZ));

    // Calcular la distancia entre el punto más cercano y el centro de la esfera
    let dx = sphere.position[0] - closestX;
    let dy = sphere.position[1] - closestY;
    let dz = sphere.position[2] - closestZ;

    let distanceSquared = dx*dx + dy*dy + dz*dz;
    let sphereRadius = sphere.radius * 0.5; // Radio efectivo

    return distanceSquared < (sphereRadius * sphereRadius);
}

function handle_sphere_cube_collision(sphere, cube) {
    if (!cube.isFalling) {
        cube.isFalling = true;
        
        // Dirección del impacto (de la esfera al cubo)
        let direction = normalize(vec3(
            cube.position[0] - sphere.position[0],
            cube.position[1] - sphere.position[1],
            cube.position[2] - sphere.position[2]
        ));
        
        // Magnitud basada en la velocidad de la esfera, con un mínimo garantizado
        let sphereSpeed = length(vec3(sphere.velocity[0], sphere.velocity[1], sphere.velocity[2]));
        let minImpactStrength = 3.0; // Fuerza mínima de impacto
        let maxImpactStrength = 8.0;  // Fuerza máxima (ajusta este valor según necesites)
        let impactStrength = Math.min(Math.max(sphereSpeed * 0.3, minImpactStrength), maxImpactStrength);
        
        // Aplicar fuerza de impacto con un mínimo hacia arriba
        cube.velocity = [
            direction[0] * impactStrength,
            direction[1] * impactStrength,
            Math.max(Math.abs(direction[2]) * impactStrength, 2.5)  // Mínimo de 2.5 hacia arriba
        ];
        
        // Rotación inicial basada en la dirección del impacto
        cube.rotation = [
            direction[1] * 30,
            direction[0] * 30,
            (direction[0] + direction[1]) * 15
        ];
    }
}

//----------------------------------------------------------------------------
// Colision cubo plano
//----------------------------------------------------------------------------

function check_cube_plane_col(cube, plane) {
    let plane_normal = getPlaneNormal(plane);
    plane_normal = vec3(plane_normal[0], plane_normal[1], plane_normal[2]);
    plane_normal = normalize(plane_normal);

    let plane_point = vec3(plane.position[0], plane.position[1], plane.position[2]);
    let d = dot(plane_normal, plane_point);

    // Calcular los 8 vértices del cubo (considerando su rotación)
    let halfsize = 0.5;
    let vertices = [
        vec3(-halfsize, -halfsize, -halfsize),
        vec3(-halfsize, -halfsize, halfsize),
        vec3(-halfsize, halfsize, -halfsize),
        vec3(-halfsize, halfsize, halfsize),
        vec3(halfsize, -halfsize, -halfsize),
        vec3(halfsize, -halfsize, halfsize),
        vec3(halfsize, halfsize, -halfsize),
        vec3(halfsize, halfsize, halfsize)
    ];

    // Transformar vértices según la posición y rotación del cubo
    let transform = mat4();
    transform = mult(transform, translate(cube.position[0], cube.position[1], cube.position[2]));
    transform = mult(transform, rotate(cube.rotation[0], vec3(1, 0, 0)));
    transform = mult(transform, rotate(cube.rotation[1], vec3(0, 1, 0)));
    transform = mult(transform, rotate(cube.rotation[2], vec3(0, 0, 1)));

    let worldVertices = vertices.map(v => {
        let v4 = mult(transform, vec4(v[0], v[1], v[2], 1));
        return vec3(v4[0], v4[1], v4[2]);
    });

    // Verificar colisión para cada vértice con margen predictivo
    for (let vertex of worldVertices) {
        // Calcular posición futura basada en velocidad
        let futureVertex = add(vertex, vec3(cube.velocity[0]*0.1, cube.velocity[1]*0.1, cube.velocity[2]*0.1));
        
        let currentDistance = dot(plane_normal, vertex) - d;
        let futureDistance = dot(plane_normal, futureVertex) - d;
        
        // Si está penetrando o va a penetrar en el próximo frame
        if (currentDistance < 0.1 || (currentDistance > 0 && futureDistance < 0)) {
            return true;
        }
    }

    return false;
}

//----------------------------------------------------------------------------
// Funciones para el juego
//----------------------------------------------------------------------------

function reset_sphere_position(sphere) {
   if (entities.indexOf(sphere) === sphereControllerIndex) {
        // Restaurar valores iniciales de la cámara
        eye = initialEye;
        target = initialTarget;
        up = initialUp;
        vecTarget = initialVecTarget;
        vecPosInicial = initialVecPosInicial;
        rotationAngle = initialRotationAngle;
        
        // Recalcular view matrix
        view = lookAt(eye, target, up);
        
        // Reiniciar posición inicial
        sphere.position = subtract(eye, vecPosInicial);
        
        // Reiniciar velocidad
        sphere.velocity = [0.0, 0.0, 0.0];
        
        // Reiniciar orientación
        sphere.orientation = mat4();
        
        // Permitir volver a disparar
        hasShoot = false;
        shootForce = 0.0;
        forceBar.style.width = "0%"; // Resetear la barra
    } 
}

function reset_cube_position() {
    entities.forEach(function(entity, index) {
        if (entity.type==="cube") {
            entity.position = [entity.origPosition[0], entity.origPosition[1], entity.origPosition[2]];
            entity.rotation = [0.0, 0.0, 0.0];
            entity.velocity = [0.0, 0.0, 0.0];
            entity.isFalling = false;

            // También actualizamos su matriz de transformación
            let transform = translate(entity.position[0], entity.position[1], entity.position[2]);
            objectsToDraw[index].uniforms.u_model = transform;
        }
    })
    
}

//Derecha true obviamente 
function moverHorizontal(direccion){
	//Miramos que no se salga de los limites
	if(eye[1] > maxHorizontal && direccion) return;
	if(eye[1] < -maxHorizontal && !direccion) return;

	eye = direccion ? vec3(eye[0], eye[1] + moveStep, eye[2]) : vec3(eye[0], eye[1] - moveStep, eye[2]); //Recalculamos el eye de la camara
	target = subtract(eye, vecTarget); //Recalculasmos el target para apunatar en la misma direccion
	view = lookAt(eye,target,up); //Matriz nueva de la camara
	entities[sphereControllerIndex].position = subtract(eye, vecPosInicial); //Movemos la bola a donde toque

	return;
}

//DERECHA TRUEEEEEEEEE
function rotateCamera(direccion){
	//Siento mucho estas dos variables pero no se me ocurre nada mejor
	var vecTarget4 = vec4(vecTarget[0], vecTarget[1], vecTarget[2], 0.0); //Convertimos el target a vec4 porq si no da pinche error
	var vecPosInicial4 = vec4(vecPosInicial[0], vecPosInicial[1], vecPosInicial[2], 0.0); //Convertimos la posicion inicial a vec4 porq si no da pinche error

	rotationAngle = direccion ? rotationAngle + rotateStep : rotationAngle - rotateStep; //Calculamos el nuevo angulo
	if(rotationAngle > maxRotation || rotationAngle < -maxRotation){
		rotationAngle = rotationAngle > maxRotation ? maxRotation : -maxRotation;
		return; //No te puedes pasar del angulo maximo
	} 
	vecTarget4 = direccion ? mult(rotate(rotateStep, up), vecTarget4) : mult(rotate(-rotateStep, up), vecTarget4); //Rotamos el target
	vecPosInicial = direccion ? mult(rotate(rotateStep, up), vecPosInicial4) : mult(rotate(-rotateStep, up), vecPosInicial4); //Rotamos la posicion inicial

	vecTarget = vec3(vecTarget4[0], vecTarget4[1], vecTarget4[2]); //Recalculamos el target
	vecPosInicial = vec3(vecPosInicial[0], vecPosInicial[1], vecPosInicial[2]); //Recalculamos la posicion inicial

	target = subtract(eye, vecTarget); //Recalculamos el target
	view = lookAt(eye,target,up); //Recalculamos la vista
	entities[sphereControllerIndex].position = subtract(eye, vecPosInicial); //Movemos la bola a donde toque
  let rotationMatrix = direccion ? rotate(-rotateStep, up) : rotate(rotateStep, up);
  entities[sphereControllerIndex].orientation = mult(rotationMatrix, entities[sphereControllerIndex].orientation);

	return;
}

//Lanza la bola 
function lanzarBola(){
	hasShoot = true;
	entities[sphereControllerIndex].
				velocity = mult(shootForce, 
								normalize(subtract(entities[sphereControllerIndex].position, eye))); //Calculamos la velocidad de la bola
}

// Manejador de eventos para las teclas de dirección
window.addEventListener("keydown", function (event) {
    switch (event.key) {
		case "ArrowRight":
			if(shiftDown){
				if(!hasShoot && !isCharging) rotateCamera(true);
			}
			else{
				//Caso de moverse hacia los lados
				if(!hasShoot && !isCharging) moverHorizontal(true);
			}
			break;
		case "ArrowLeft":
			if(shiftDown){
				if(!hasShoot && !isCharging) rotateCamera(false);
			}
			else{
				//Se repite lo de arriba, lo va a recomen
				if(!hasShoot && !isCharging) moverHorizontal(false);
			}
			break;
		case "Shift":
			shiftDown = true;
			break;
    case "r":
      reset_sphere_position(entities[sphereControllerIndex]);
      reset_cube_position();
      break;
    case "R":
      reset_sphere_position(entities[sphereControllerIndex]);
      reset_cube_position();
      break;
		case " ":
      if(!hasShoot){
        shootForce += shootStep * shootForceDirection;

        // Cambia la dirección cuando llega a los límites
        if (shootForce >= maxShootForce) {
            shootForceDirection = -1;
            shootForce = maxShootForce;
        } else if (shootForce <= 0) {
            shootForceDirection = 1;
            shootForce = 0;
        }

        // Actualizar la barra de fuerza
        let forcePercentage = (shootForce / maxShootForce) * 100;
        forceBar.style.width = forcePercentage + "%";

        // Calcular el color basado en el porcentaje (verde -> amarillo -> rojo)
        let hue = (1 - (forcePercentage / 100)) * 120; // 0 (verde) a 120 (rojo)
        forceBar.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    }
    break;
	}
});

// Resetear la fuerza cuando se suelta una tecla
window.addEventListener("keyup", function (event) {
    switch (event.key) {
		case "Shift":
			shiftDown = false;
			break;
		case " ":
      if(!hasShoot) {
        lanzarBola();
        // Resetear la barra después de un pequeño retraso
        setTimeout(() => {
            forceBar.style.width = "0%";
        }, 200);
    }
    break;
	}
});

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------

function render(dt) {
	// Clear the buffer and draw everything
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	objectsToDraw.forEach(function(object) {
		gl.useProgram(object.programInfo.program);

		// Setup buffers and attributes
		setBuffersAndAttributes(object.programInfo, object);

		// Set the uniforms
		setUniforms(object.programInfo, object.uniforms);

		// Draw
		gl.drawArrays(object.primitive, 0, object.pointsArray.length);
	});
}

//----------------------------------------------------------------------------
// Utils functions
//----------------------------------------------------------------------------

function setPrimitive(objectsToDraw) {	
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

function setUniforms(pInfo, uniforms) {
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

function setBuffersAndAttributes(pInfo, object) {
	// Load the data into GPU data buffers
	// Vertices
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,  flatten(object.pointsArray), gl.STATIC_DRAW );
	gl.vertexAttribPointer( pInfo.attribLocations.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
	gl.enableVertexAttribArray( pInfo.attribLocations.vPosition );
}

