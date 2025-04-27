export class ForceBar {
    static MAX_FORCE = 100.0;

    static instance;
    constructor() {
        // Singleton 
        if (ForceBar.instance) {
            return ForceBar.instance;
        }

        this.forceBarElement = document.getElementById("force-bar");
        this.shootStep = 2.5; //Incremento de la fuerza de lanzamiento
        this.shootForce = 0;
        this.shootForceDirection = 1; //Dirección de crecimiento de la barra de fuerza (1 para subir, -1 para bajar)

    }

    loadShot() {
        this.shootForce += this.shootStep * this.shootForceDirection;

        //Cambia la dirección cuando llega a los límites
        if (this.shootForce >= ForceBar.MAX_FORCE) {
            this.shootForceDirection = -1;
            this.shootForce = ForceBar.MAX_FORCE;
        }
        else if (this.shootForce <= 0) {
            this.shootForceDirection = 1;
            this.shootForce = 0;
        }

        //Actualizar la barra de fuerza
        let forcePercentage = (this.shootForce / ForceBar.MAX_FORCE) * 100;
        this.forceBarElement.style.width = forcePercentage + "%";

        //Calcular el color basado en el porcentaje (verde -> amarillo -> rojo)
        let hue = (1 - (forcePercentage / 100)) * 120; // 0 (verde) a 120 (rojo)
        this.forceBarElement.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    }

    shoot() {
        let result = this.shootForce;
        this.shootForce = 0;
        return result
    }

    
    reset() {
        this.forceBarElement.style.width = "0%";
        this.forceBarElement.style.backgroundColor = `hsl(120%, 100%, 50%)`;
    }
}