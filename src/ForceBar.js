export class ForceBar {
    constructor(bowlingBall) {
        this.forceBar = document.getElementById("force-bar"); //Barra de fuerza en el HTML
        this.maxShootForce = 18.0; //Máxima fuerza de lanzamiento
        this.shootStep = 0.3; //Incremento de la fuerza de lanzamiento
        this.shootForce = 0;
        this.shootForceDirection = 1; //Dirección de crecimiento de la barra de fuerza (1 para subir, -1 para bajar)
        this.bowlingBall = bowlingBall;
    }
    

    loadShot() {
        if (!this.bowlingBall.hasShot) {
            this.shootForce += this.shootStep * this.shootForceDirection;

            //Cambia la dirección cuando llega a los límites
            if (this.shootForce >= this.maxShootForce) {
                this.shootForceDirection = -1;
                this.shootForce = this.maxShootForce;
            }
            else if (this.shootForce <= 0) {
                this.shootForceDirection = 1;
                this.shootForce = 0;
            }

            //Actualizar la barra de fuerza
            let forcePercentage = (this.shootForce / this.maxShootForce) * 100;
            console.log("Porcentaje: " + forcePercentage);
            this.forceBar.style.width = forcePercentage + "%";

            //Calcular el color basado en el porcentaje (verde -> amarillo -> rojo)
            let hue = (1 - (forcePercentage / 100)) * 120; // 0 (verde) a 120 (rojo)
            this.forceBar.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
        }
    }

    shoot() {
        setTimeout(() => {
            this.forceBar.style.width = "0%";
        }, 200);
        let shootForce2 = this.shootForce;
        this.shootForce = 0;
        return shootForce2;
    }
}


