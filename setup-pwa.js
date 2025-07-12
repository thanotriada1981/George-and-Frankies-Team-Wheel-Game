/**
 * PWA Setup Script for NBA Team Wheel
 * Adds offline functionality and app installation
 */

// Add PWA manifest and service worker registration to index.html
function setupPWA() {
    console.log('🏀 Setting up PWA functionality...');
    
    // Add manifest link to head
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/public/manifest.json';
    document.head.appendChild(manifestLink);
    
    // Add PWA meta tags
    const metaTags = [
        { name: 'theme-color', content: '#ff6b35' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'NBA Team Wheel' },
        { name: 'msapplication-TileColor', content: '#ff6b35' },
        { name: 'msapplication-tap-highlight', content: 'no' }
    ];
    
    metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
    });
    
    // Add apple touch icons
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = '/public/icons/icon-192x192.png';
    document.head.appendChild(appleTouchIcon);
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/public/sw.js')
                .then(registration => {
                    console.log('🏀 Service Worker registered successfully:', registration);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch(error => {
                    console.log('🏀 Service Worker registration failed:', error);
                });
        });
    }
    
    // Add install app button
    addInstallButton();
    
    // Add offline indicator
    addOfflineIndicator();
    
    console.log('🏀 PWA setup complete!');
}

// Add install app button
function addInstallButton() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('🏀 Install prompt available');
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button
        const installBtn = document.createElement('button');
        installBtn.innerHTML = '📱 Install as App';
        installBtn.className = 'install-btn';
        installBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b35;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
            transition: all 0.3s ease;
        `;
        
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const choiceResult = await deferredPrompt.userChoice;
                
                if (choiceResult.outcome === 'accepted') {
                    console.log('🏀 User accepted the install prompt');
                    installBtn.remove();
                } else {
                    console.log('🏀 User dismissed the install prompt');
                }
                
                deferredPrompt = null;
            }
        });
        
        document.body.appendChild(installBtn);
    });
    
    // Handle app installed
    window.addEventListener('appinstalled', () => {
        console.log('🏀 NBA Team Wheel installed successfully!');
        const installBtn = document.querySelector('.install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    });
}

// Add offline indicator
function addOfflineIndicator() {
    const offlineIndicator = document.createElement('div');
    offlineIndicator.id = 'offline-indicator';
    offlineIndicator.innerHTML = '🔴 Offline Mode';
    offlineIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: #333;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 1000;
        display: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(offlineIndicator);
    
    // Update online/offline status
    function updateOnlineStatus() {
        if (navigator.onLine) {
            offlineIndicator.style.display = 'none';
        } else {
            offlineIndicator.style.display = 'block';
        }
    }
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
}

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            text-align: center;
            max-width: 300px;
        ">
            <h3>🎉 Update Available!</h3>
            <p>A new version of NBA Team Wheel is ready!</p>
            <button onclick="location.reload()" style="
                background: #ff6b35;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin: 5px;
            ">Update Now</button>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #ccc;
                color: black;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin: 5px;
            ">Later</button>
        </div>
    `;
    
    document.body.appendChild(notification);
}

// Initialize PWA when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPWA);
} else {
    setupPWA();
} 