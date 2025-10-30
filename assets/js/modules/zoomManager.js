export class ZoomManager {
    constructor(containerId, previewId) {
        this.container = document.getElementById(containerId);
        this.preview = document.getElementById(previewId);
        this.zoomLevel = 100;
        
        this.init();
    }

    init() {
        this.createControls();
        this.setupEvents();
        this.applyZoom();
    }

    createControls() {
        this.container.innerHTML = `
            <button id="zoomOut" class="w-6 h-6 flex items-center justify-center text-xs bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 transition">-</button>
            <input type="range" id="zoomSlider" min="10" max="300" value="100" step="0.5" 
                   class="w-32 h-2 appearance-none bg-gray-200 rounded-lg overflow-hidden cursor-pointer accent-indigo-500">
            <span id="zoomLabel" class="text-xs text-gray-600">100%</span>
            <button id="zoomIn" class="w-6 h-6 flex items-center justify-center text-xs bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 transition">+</button>
        `;

        this.zoomOutBtn = document.getElementById('zoomOut');
        this.zoomInBtn = document.getElementById('zoomIn');
        this.zoomSlider = document.getElementById('zoomSlider');
        this.zoomLabel = document.getElementById('zoomLabel');
    }

    setupEvents() {
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.zoomSlider.addEventListener('input', () => this.handleSlider());
        
        this.preview.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    }

    zoomIn() {
        this.setZoom(this.zoomLevel + 10);
    }

    zoomOut() {
        this.setZoom(this.zoomLevel - 10);
    }

    handleSlider() {
        this.setZoom(parseFloat(this.zoomSlider.value));
    }

    handleWheel(event) {
        if (!event.ctrlKey) return;
        
        event.preventDefault();
        const delta = event.deltaY < 0 ? 5 : -5;
        this.setZoom(this.zoomLevel + delta);
    }

    setZoom(level) {
        // Batasi zoom antara 10% - 300%
        this.zoomLevel = Math.max(10, Math.min(300, level));
        this.applyZoom();
    }

    applyZoom() {
        this.preview.style.transform = `scale(${this.zoomLevel / 100})`;
        this.preview.style.transformOrigin = 'top center';
        this.zoomLabel.textContent = `${this.zoomLevel.toFixed(1)}%`;
        this.zoomSlider.value = this.zoomLevel;
    }

    reset() {
        this.setZoom(100);
    }
}