/**
 * Visual Effects System for NBA Team Wheel
 * Handles confetti, animations, and visual feedback
 */

const VisualEffects = {
    createConfetti(container = document.body) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}vw;
                z-index: 10000;
                pointer-events: none;
                transform: rotate(${Math.random() * 360}deg);
                animation: confetti-fall 3s linear forwards;
            `;
            
            container.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3000);
        }
    },
    
    createFloatingText(text, container, color = '#ff6b6b') {
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: ${color};
            font-size: 2em;
            font-weight: bold;
            z-index: 9999;
            pointer-events: none;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            animation: float-up 2s ease-out forwards;
        `;
        
        container.appendChild(floatingText);
        
        // Remove text after animation
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 2000);
    },
    
    addSpinGlow(wheelElement) {
        wheelElement.parentElement.classList.add('spinning-glow');
    },
    
    removeSpinGlow(wheelElement) {
        wheelElement.parentElement.classList.remove('spinning-glow');
    },
    
    celebratePopup(popup) {
        popup.classList.add('celebration-popup');
        
        // Remove class after animation
        setTimeout(() => {
            popup.classList.remove('celebration-popup');
        }, 600);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualEffects;
} 