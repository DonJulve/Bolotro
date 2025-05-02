export class ScoreManager {
    constructor() {
        this.rounds = Array(10).fill({ first: null, second: null, total: null });
        this.currentRound = 0;
        this.isFirstThrow = true;
        this.gameOver = false;
    }

    addThrow(pins) {
        if (this.gameOver || this.currentRound >= 10) {
            this.gameOver = true;
            return;
        }

        const round = this.rounds[this.currentRound];
        
        if (this.isFirstThrow) {
            this.rounds[this.currentRound] = { ...round, first: pins };
            if (pins === 10) { // Strike
                this.currentRound++;
            } else {
                this.isFirstThrow = false;
            }
        } else {
            const availablePins = 10 - (round.first || 0);
            const adjustedPins = Math.min(pins, availablePins);
            
            this.rounds[this.currentRound] = { ...round, second: adjustedPins };
            this.currentRound++;
            this.isFirstThrow = true;
        }
        
        this.calculateScores();
    }

    calculateScores() {
        let totalScore = 0;
        
        for (let i = 0; i < 10; i++) {
            const round = this.rounds[i];
            
            if (round.first === null) {
                // Ronda no comenzada, no calcular
                this.rounds[i] = { ...round, total: null };
                continue;
            }
            
            let roundScore = 0;
            
            if (round.first === 10) { // Strike
                roundScore = 10;
                
                // Buscar siguientes 2 bolos (pueden estar en rondas posteriores)
                let next1 = null, next2 = null;
                
                if (this.rounds[i+1]) {
                    next1 = this.rounds[i+1].first;
                    if (next1 === 10 && this.rounds[i+2]) {
                        next2 = this.rounds[i+2].first;
                    } else {
                        next2 = this.rounds[i+1].second;
                    }
                }
                
                if (next1 !== null && next2 !== null) {
                    roundScore += next1 + next2;
                    totalScore += roundScore;
                    this.rounds[i] = { ...round, total: totalScore };
                } else {
                    // No hay suficientes tiradas para calcular, dejar pendiente
                    this.rounds[i] = { ...round, total: null };
                }
                
            } else if (round.second !== null && round.first + round.second === 10) { // Spare
                roundScore = 10;
                
                // Buscar siguiente bolo
                const next1 = this.rounds[i+1]?.first;
                
                if (next1 !== null) {
                    roundScore += next1;
                    totalScore += roundScore;
                    this.rounds[i] = { ...round, total: totalScore };
                } else {
                    // No hay suficientes tiradas para calcular, dejar pendiente
                    this.rounds[i] = { ...round, total: null };
                }
                
            } else if (round.second !== null) { // Ronda normal completa
                roundScore = round.first + round.second;
                totalScore += roundScore;
                this.rounds[i] = { ...round, total: totalScore };
            } else { // Solo primer tiro, no spare ni strike
                this.rounds[i] = { ...round, total: null };
            }
        }
    }

    getScoreTable() {
        const table = [];
        
        for (let i = 0; i < 10; i++) {
            const round = this.rounds[i];
            let display = { first: '', second: '', total: '' };
            
            if (round.first === 10) {
                display.first = 'X';
            } else if (round.first !== null) {
                display.first = round.first === 0 ? '-' : round.first;
            }
            
            if (round.second !== null) {
                if (round.first + round.second === 10) {
                    display.second = '/';
                } else {
                    display.second = round.second === 0 ? '-' : round.second;
                }
            }
            
            display.total = round.total !== null ? round.total : '';
            table.push(display);
        }
        
        return table;
    }

    isGameOver() {
        if (this.currentRound >= 10) {
            const lastRound = this.rounds[9];
            
            if (!(lastRound.first === 10) && 
                !(lastRound.second !== null && lastRound.first + lastRound.second === 10)) {
                return true;
            }
            
            if (lastRound.total !== null) {
                return true;
            }
        }
        return false;
    }

    getFinalScore() {
        if (this.isGameOver()) {
            const lastRound = this.rounds[9];
            return lastRound.total || 0;
        }
        return 0;
    }

    reset() {
        this.rounds = Array(10).fill({ first: null, second: null, total: null });
        this.currentRound = 0;
        this.isFirstThrow = true;
        this.gameOver = false;
    }
}
