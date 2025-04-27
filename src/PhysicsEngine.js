// ------------------------------
//
// CHECK DE COLISONES
//
// ------------------------------

// Colisiones entre pins
// * FUNCIONA SIN ROTACIONES DE PIN
function checkBoundingBoxes(a, b) {
    const aMinX = a.position[0] - a.width / 2;
    const aMaxX = a.position[0] + a.width / 2;
    const aMinY = a.position[1] - a.height / 2;
    const aMaxY = a.position[1] + a.height / 2;
    const aMinZ = a.position[2] - a.depth / 2;
    const aMaxZ = a.position[2] + a.depth / 2;

    const bMinX = b.position[0] - b.width / 2;
    const bMaxX = b.position[0] + b.width / 2;
    const bMinY = b.position[1] - b.height / 2;
    const bMaxY = b.position[1] + b.height / 2;
    const bMinZ = b.position[2] - b.depth / 2;
    const bMaxZ = b.position[2] + b.depth / 2;

    const overlapX = aMinX <= bMaxX && aMaxX >= bMinX;
    const overlapY = aMinY <= bMaxY && aMaxY >= bMinY;
    const overlapZ = aMinZ <= bMaxZ && aMaxZ >= bMinZ;

    if (overlapX && overlapY && overlapZ) {
        b.hasHitPin = true;
        a.hasHitPin = true;
        return true
    }
    return false
}

// Colision entre Bowlingball y pin
// * FUNCIONA SIN ROTACIONES DE PIN
function checkSphereAabb(ball, pin) {
    
    const ballPos = ball.position;
    const pinPos = pin.position;
    const r = ball.radius;

    const halfWidth = pin.width / 2;
    const halfHeight = pin.height / 2;
    const halfDepth = pin.depth / 2;

    let pinMinX = pinPos[0] - halfWidth;
    let pinMaxX = pinPos[0] + halfWidth;
    let pinMinY = pinPos[1] - halfHeight;
    let pinMaxY = pinPos[1] + halfHeight;
    let pinMinZ = pinPos[2] - halfDepth;
    let pinMaxZ = pinPos[2] + halfDepth;

    // calcula el punto más cercano en la caja al centro de la esfera
    let closestX = Math.max(pinMinX, Math.min(ball.position[0], pinMaxX));
    let closestY = Math.max(pinMinY, Math.min(ball.position[1], pinMaxY));
    let closestZ = Math.max(pinMinZ, Math.min(ball.position[2], pinMaxZ));

    // Calcular la distancia del centro de la esfera al punto más cercano
    const dx = ballPos[0] - closestX;
    const dy = ballPos[1] - closestY;
    const dz = ballPos[2] - closestZ;

    return (dx * dx + dy * dy + dz * dz) < r * r;
}

// Colision entre la bola y el plano
// * FUNCIONA
function checkSpherePlane(sphere, plane) {
    const spherePos = sphere.position;
    const r = sphere.radius;
    const planePoint = plane.position;
    const normal = plane.normal;

    // Vector del punto del plano al centro de la esfera
    const dx = spherePos[0] - planePoint[0];
    const dy = spherePos[1] - planePoint[1];
    const dz = spherePos[2] - planePoint[2];

    // Producto escalar: distancia del centro de la esfera al plano
    const dot = dx * normal[0] + dy * normal[1] + dz * normal[2];

    // Colisión si la distancia del centro de la esfera al plano es menor o igual al radio
    return Math.abs(dot) <= r;
}

// Checkea si un pin rotado o no rotado ha colisionado con el plano
// * FUNCIONA
function checkAabbPlane(pin, plane) {
    const halfWidth = pin.width / 2;
    const halfHeight = pin.height / 2;
    const halfDepth = pin.depth / 2;

    // Los 8 vértices en el espacio local del pin
    const localVertices = [
        vec3(-halfWidth, -halfHeight, -halfDepth),
        vec3(-halfWidth, -halfHeight, halfDepth),
        vec3(-halfWidth, halfHeight, -halfDepth),
        vec3(-halfWidth, halfHeight, halfDepth),
        vec3(halfWidth, -halfHeight, -halfDepth),
        vec3(halfWidth, -halfHeight, halfDepth),
        vec3(halfWidth, halfHeight, -halfDepth),
        vec3(halfWidth, halfHeight, halfDepth)
    ];

    // Transformar todos los vértices al espacio mundial
    const worldVertices = localVertices.map(localV => {
        const rotatedV = multVec3(pin.rotationMatrix, localV); 
        return add(rotatedV, pin.position);
    });

    // Ecuación del plano: dot(n, x) - d = 0
    const planeDistance = dot(plane.normal, plane.position); // d

    // Recorremos todos los vértices transformados
    for (const vertex of worldVertices) {
        const vertexDistance = dot(plane.normal, vertex) - planeDistance;

        // Si cualquier vértice está debajo del plano (distancia negativa), hay colisión
        if (vertexDistance < 0) {
            pin.pointOfCollision = vertex;
            return true;
        }
    }

    return false;
    
}

// Mapa de handlers a colisiones
const collisionHandlers = new Map([
    [["BowlingBall", "Pin"].sort().join("-"), unorderedHandler("BowlingBall", "Pin", checkSphereAabb)],
    [["BowlingBall", "Plano"].sort().join("-"), unorderedHandler("BowlingBall", "Plano", checkSpherePlane)],
    [["Pin", "Pin"].join("-"), checkBoundingBoxes],
    [["Pin", "Plano"].sort().join("-"), unorderedHandler("Pin", "Plano", checkAabbPlane)]
]);

export function checkCollision(object1, object2) {
    // Todo esto para no poner 80000 if-else
    const type1 = object1.constructor.name;
    const type2 = object2.constructor.name;
    const key = [type1, type2].sort().join("-");

    const handler = collisionHandlers.get(key);

    // Si hay handler devuelve su resultado sino false siempre
    return handler ? handler(object1, object2) : false;
}

// ------------------------------
//
// RESOLVE DE COLISONES
//
// ------------------------------

// Resuelve el momento lineal para el obj1 sabiendo que choca con obj2
// * FUNCIONA
function resolveLinearMomentum(dt, obj1, obj2) {
    // Vector normal de colision de ball hacia cube
    const normal = normalize(subtract(obj1.position, obj2.position));
    
    // Proyeccion de velocidades
    const v1n = dot(obj1.velocity, normal); // componente normal de la bola
    const v2n = dot(obj2.velocity, normal); // componente normal del bolo

    // Nuevas velocidades normales tras el choque elástico
    const m1 = obj1.mass;
    const m2 = obj2.mass;

    const v1nAfter = ((m1 - m2) * v1n + 2 * m2 * v2n) / (m1 + m2);

    // Vectores normales con la nueva magnitud
    let v1nAfterVec = multVectScalar(normal, v1nAfter);
    v1nAfterVec = vec3(v1nAfterVec[0],v1nAfterVec[1],v1nAfterVec[2])

    // Calculamos la parte tangencial que no se ve afectada por el choque
    let v1nOriginal = multVectScalar(normal, v1n);
    v1nOriginal = vec3(v1nOriginal[0],v1nOriginal[1],v1nOriginal[2])

    const v1tangent = subtract(obj1.velocity, v1nOriginal);

    // Velocidades finales = tangencial + nueva normal
    obj1.velocityNextFrame = add(v1tangent, v1nAfterVec);
    obj1.positionNextFrame = add(obj1.position, mult(dt, obj1.velocityNextFrame)); 
}

// * FUNCIONA
function resolveAngularMomentum(dt, obj1, obj2) {
    const r = subtract(obj1.position, obj2.position);   // Punto del impacto
    const force = multVectScalar(obj2.velocity, obj2.mass*-100);       // Fuerza que se aplica sobre obj1

    const vec3R = vec3(r[0], r[1], r[2]);
    const vec3force = vec3(force[0], force[1], force[2]);
    const torque = cross(vec3R, vec3force);

    const inertia = 1;
    const angularAcceleration = multVectScalar(torque, 1 / inertia);

    let vec3AngularAcceleration = multVectScalar(angularAcceleration, dt);
    vec3AngularAcceleration = vec3(vec3AngularAcceleration[0], vec3AngularAcceleration[1], vec3AngularAcceleration[2])
    obj1.angularVelocity = add(obj1.angularVelocity, vec3AngularAcceleration);
}

// Actualiza pin1 sabiendo que ha chocado con pin2
function resolvePinPin(dt, pin1, pin2) {
    if (pin1.hasHitPin === true) return;
    resolveLinearMomentum(dt, pin1, pin2);
    resolveAngularMomentum(dt, pin1, pin2);
}

// Actualiza ball sabiendo que ha chocado con pin
function resolveBallPin(dt, ball, pin) {
    resolveLinearMomentum(dt, ball, pin);
}



// Actualiza pin sabiendo que ha chocado con ball
function resolvePinBall (dt, pin, ball) {
    if (pin.hasHitBall === true) return;
    resolveLinearMomentum(dt, pin, ball);
    resolveAngularMomentum(dt, pin, ball);
    pin.hasHitBall = true;
}

function resolveBallPlano(dt, ball, plano) {
    ball.velocityNextFrame = vec3(ball.velocity[0], ball.velocity[1]*-0.4, ball.velocity[2]);
    ball.positionNextFrame = add(ball.position, mult(dt, ball.velocityNextFrame));
}

function resolvePinPlano(dt, pin, plane) {
    const restitution = 0.2;   // Cuánto rebota (0 = no rebota, 1 = rebote perfecto)
    const friction = 0.5;      // Cuánta fricción aplica en horizontal

    // Asegúrate de que la normal sea un vec3
    const normal = vec3(plane.normal[0], plane.normal[1], plane.normal[2]);

    // Calcular componente vertical de la velocidad (hacia el suelo)

    const verticalVelocity = pin.velocity[1];
    if (verticalVelocity < 0) {
        // Rebote básico
        const newVerticalVelocity = -verticalVelocity * restitution;

        // Velocidad horizontal afectada por fricción
        const horizontalVelocity = subtract(pin.velocity, scale(normal, verticalVelocity));
        const newHorizontalVelocity = scale(horizontalVelocity, friction);

        // Nueva velocidad combinada
        pin.velocityNextFrame = add(scale(normal, newVerticalVelocity), newHorizontalVelocity);
        // Pequeña corrección de posición para no atravesar el plano
        pin.positionNextFrame = add(pin.position, mult(dt, pin.velocityNextFrame));
        pin.angularVelocity = scale(pin.angularVelocity, 0.8);
        if (pin.angularVelocity[0] * pin.angularVelocity[1] * pin.angularVelocity[2] < 0.3 && (pin.hasHitBall || pin.hasHitPin)) {
            pin.angularVelocity = vec3(0, 0, 0)
            const upVector = vec3(pin.rotationMatrix[4], pin.rotationMatrix[5], pin.rotationMatrix[6]); // Segunda columna de matriz
            const verticalAlignment = dot(upVector, vec3(0, 1, 0)); // 1 si está de pie, 0 si está tumbado
            if (verticalAlignment < 0.85) {
                const rotation = pin.rotationMatrix;

                // Extraer los ejes locales del pin
                const right = normalize(vec3(rotation[0], rotation[1], rotation[2])); // X local
                const up = normalize(vec3(rotation[4], rotation[5], rotation[6]));     // Y local
                const forward = normalize(vec3(rotation[8], rotation[9], rotation[10])); // Z local
            
                // Nuevo 'up' es uno de los ejes X o Z, dependiendo de qué esté más cerca
                // Queremos que 'up' esté tumbado sobre el plano XZ
            
                let newUp;
                newUp = normalize(vec3(Math.sign(up[0]), 0, Math.sign(up[2])));
            
                // Ajustamos los otros dos vectores para que sigan siendo ortogonales
                const newForward = normalize(cross(newUp, right));
                const newRight = normalize(cross(newForward, newUp));
            
                // Construimos la nueva matriz de rotación
                const newRotation = mat4(
                    newRight[0], newRight[1], newRight[2], 0,
                    newUp[0],   newUp[1],   newUp[2],   0,
                    newForward[0], newForward[1], newForward[2], 0,
                    0, 0, 0, 1
                );
            
                pin.rotationMatrix = newRotation;
                pin.hasFallen = true;
            }
            else {
                pin.rotationMatrix = mat4();
            }
        }
    }
}

// Mapa de handlers a resoluciones de colisiones
const resolveHandlers = new Map([
    [["BowlingBall", "Pin"].join("-"), resolveBallPin],
    [["Pin", "BowlingBall"].join("-"), resolvePinBall],
    [["Pin", "Pin"].join("-"), resolvePinPin],
    [["BowlingBall", "Plano"].join("-"), resolveBallPlano],
    [["Pin", "Plano"].join("-"), resolvePinPlano],

]);

export function resolveCollision(dt, object1, object2) {
        // Todo esto para no poner 80000 if-else
        const type1 = object1.constructor.name;
        const type2 = object2.constructor.name;
        const key = [type1, type2].join("-");
    
        const handler = resolveHandlers.get(key);
    
        // Si hay handler devuelve su resultado
        if (handler) {
            handler(dt, object1, object2);
        }
}


// ------------------
// Utils
// ------------------
function unorderedHandler(expected1, expected2, handler) {
    return function(obj1, obj2) {
        const type1 = obj1.constructor.name;
        const type2 = obj2.constructor.name;

        if (type1 === expected1 && type2 === expected2) {
            return handler(obj1, obj2);
        } else if (type1 === expected2 && type2 === expected1) {
            return handler(obj2, obj1);
        } else {
            return false;
        }
    };
}

// Multiplicar vector por escalar
export function multVectScalar(vec, scalar) {
    return vec.map(v => v * scalar);
}

function multVec3(matrix, vec) {
    const x = matrix[0] * vec[0] + matrix[4] * vec[1] + matrix[8] * vec[2] + matrix[12];
    const y = matrix[1] * vec[0] + matrix[5] * vec[1] + matrix[9] * vec[2] + matrix[13];
    const z = matrix[2] * vec[0] + matrix[6] * vec[1] + matrix[10] * vec[2] + matrix[14];
    return vec3(x, y, z);
}

function scale(vec, scalar) {
    return vec3(
        vec[0] * scalar,
        vec[1] * scalar,
        vec[2] * scalar
    );
}