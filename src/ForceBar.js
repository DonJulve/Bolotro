export class ForceBar {
    static MAX_VISUAL = 100.0;   // Máximo visual (100%)
    static MAX_FORCE = 70.0;     // Máximo real de fuerza aplicable
    static MIN_FORCE = 10.0;     // Mínimo de fuerza (debajo de este valor no se dispara)
    static EXPONENT = 3.0;       // Curva más pronunciada
    static DEAD_ZONE = 0.15;     // Zona inicial que no genera fuerza significativa

    static instance;
    constructor() {
        if (ForceBar.instance) {
            return ForceBar.instance;
        }

        this.forceBarElement = document.getElementById("force-bar");
        this.shootStep = 2.0;    // Velocidad de carga
        this.rawForce = 0;       // Valor lineal interno
        this.shootForceDirection = 1;
    }

    loadShot() {
        this.rawForce += this.shootStep * this.shootForceDirection;

        // Control de límites
        if (this.rawForce >= ForceBar.MAX_VISUAL) {
            this.shootForceDirection = -1;
            this.rawForce = ForceBar.MAX_VISUAL;
        } else if (this.rawForce <= 0) {
            this.shootForceDirection = 1;
            this.rawForce = 0;
        }

        // Actualización visual (lineal)
        this.forceBarElement.style.width = (this.rawForce / ForceBar.MAX_VISUAL * 100) + "%";

        // Cálculo de color con énfasis en zona alta
        const visualProgress = this.rawForce / ForceBar.MAX_VISUAL;
        let hue = 120 * (1 - Math.pow(visualProgress, 0.5)); // Rojo aparece más rápido
        this.forceBarElement.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    }

    shoot() {
        const normalized = this.rawForce / ForceBar.MAX_VISUAL;
        

        let effectiveForce = 0;
        
        if (normalized > ForceBar.DEAD_ZONE) {
            const remapped = (normalized - ForceBar.DEAD_ZONE) / (1 - ForceBar.DEAD_ZONE);
            effectiveForce = ForceBar.MAX_FORCE * Math.pow(remapped, ForceBar.EXPONENT);
        }
        
        // Resetear valores
        this.rawForce = 0;
        this.forceBarElement.style.width = "0%";
        
        // Aseguramos que esté entre MIN y MAX
        return Math.max(ForceBar.MIN_FORCE, Math.min(ForceBar.MAX_FORCE, effectiveForce));
    }

    reset() {
        this.rawForce = 0;
        this.forceBarElement.style.width = "0%";
        this.forceBarElement.style.backgroundColor = "hsl(120, 100%, 50%)";
    }
}
