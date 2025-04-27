export class MassManager {
    constructor(bowlingBall) {
        this.bowlingBall = bowlingBall;
        this.massDecreaseBtn = document.getElementById('mass-decrease');
        this.massIncreaseBtn = document.getElementById('mass-increase');
        this.massValueDisplay = document.getElementById('mass-value');
        this.massControls = [this.massDecreaseBtn, this.massIncreaseBtn];

        this.init();
    }

    init() {
        // Configurar event listeners
        this.massDecreaseBtn.addEventListener('click', () => this.updateMass(-1));
        this.massIncreaseBtn.addEventListener('click', () => this.updateMass(1));

        // Inicializar el valor mostrado
        this.massValueDisplay.textContent = this.bowlingBall.mass;

        // Comenzar a observar el estado de la bola
        this.observeBallState();
    }

    updateMass(change) {
        if (this.bowlingBall.start) return; // No permitir cambios si la bola está en movimiento
        
        const newMass = this.bowlingBall.mass + change;
        if (newMass >= 3 && newMass <= 8) {
            this.bowlingBall.mass = newMass;
            this.massValueDisplay.textContent = newMass;
        }
    }

    setMassControlsEnabled(enabled) {
        this.massControls.forEach(control => {
            control.disabled = !enabled;
            control.style.backgroundColor = enabled ? '#555' : '#333';
            control.style.cursor = enabled ? 'pointer' : 'not-allowed';
        });
    }

    observeBallState() {
        this.setMassControlsEnabled(!this.bowlingBall.start);
        requestAnimationFrame(() => this.observeBallState());
    }
}
