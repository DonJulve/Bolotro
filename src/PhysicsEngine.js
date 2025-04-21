// ------------------------------
//
// CHECK DE COLISONES
//
// ------------------------------

// Colisiones entre pins
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

    return overlapX && overlapY && overlapZ;
}

// Colision entre Bowlingball y pin
// * FUNCIONA
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


// Mapa de handlers a colisiones
const collisionHandlers = new Map([
    [["BowlingBall", "Pin"].sort().join("-"), unorderedHandler("BowlingBall", "Pin", checkSphereAabb)],
    [["BowlingBall", "Plano"].sort().join("-"), unorderedHandler("BowlingBall", "Plano", checkSpherePlane)],
    [["Pin", "Pin"].join("-"), checkBoundingBoxes]
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

// Actualiza pin1 sabiendo que ha chocado con pin2
function resolvePinPin(dt, pin1, pin2) {
    resolveLinearMomentum(dt, pin1, pin2);
}

// Actualiza ball sabiendo que ha chocado con pin
function resolveBallPin(dt, ball, pin) {
    resolveLinearMomentum(dt, ball, pin);
}
// Actualiza pin sabiendo que ha chocado con ball
function resolvePinBall (dt, pin, ball) {
    resolveLinearMomentum(dt, pin, ball);
}

// Mapa de handlers a resoluciones de colisiones
const resolveHandlers = new Map([
    [["BowlingBall", "Pin"].join("-"), resolveBallPin],
    [["Pin", "BowlingBall"].join("-"), resolvePinBall],
    [["Pin", "Pin"].join("-"), resolvePinPin]
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
function multVectScalar(vec, scalar) {
    return vec.map(v => v * scalar);
}