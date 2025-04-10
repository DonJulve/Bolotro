export class PhysicsEngine {

    // Colisiones entre pins
    #checkBoundingBoxes(a,b) {

    }
    // Colision entre Bowlingball y pin
    #checkSphereAabb(ball, pin) {

    }

    checkPlaneCollision(object, plane) {

    }

    checkObjectCollision(object1, object2) {
        const type1 = object1.constructor.type;
        const type2 = object2.constructor.type;

        if (type1 === "BowlingBall" && type2 === "Pin" || 
            type2 === "BowlingBall" && type1 === "Pin") {
            return this.#checkSphereAabb(object1, object2);
        }
        else if (type1 === "Pin" && type2 === "Pin") {
            return this.#checkBoundingBoxes(object1, object2);
        }
    }
}