/**
 * Sound Manager for NBA Team Wheel
 * Handles all sound effects and audio feedback
 */

const SoundManager = {
    audioContext: null,
    soundsEnabled: true,
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🎵 Sound system initialized');
        } catch (error) {
            console.warn('🔇 Sound system not available:', error);
            this.soundsEnabled = false;
        }
    },
    
    playSpinSound() {
        if (!this.soundsEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Create a sweeping sound for spinning
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    },
    
    playCelebrationSound() {
        if (!this.soundsEnabled || !this.audioContext) return;
        
        // Create a celebratory sound with multiple tones
        const frequencies = [523, 659, 784, 1047]; // C, E, G, C (major chord)
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.5);
            }, index * 100);
        });
    },
    
    playSuccessSound() {
        if (!this.soundsEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    },
    
    toggle() {
        this.soundsEnabled = !this.soundsEnabled;
        const soundButton = document.getElementById('soundToggle');
        if (soundButton) {
            soundButton.textContent = this.soundsEnabled ? '🔊' : '🔇';
            soundButton.style.background = this.soundsEnabled ? '#4CAF50' : '#666';
            soundButton.title = this.soundsEnabled ? 'Sound ON - Click to mute' : 'Sound OFF - Click to enable';
        }
        console.log('🎵 Sound', this.soundsEnabled ? 'enabled' : 'disabled');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
} 