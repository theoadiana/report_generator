export class DialogManager {
    constructor() {
        this.modals = new Map();
        this.initGlobalStyles();
    }

    initGlobalStyles() {
        if (!document.getElementById('ui-manager-styles')) {
            const style = document.createElement('style');
            style.id = 'ui-manager-styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity:0; transform:scale(0.95); }
                    to { opacity:1; transform:scale(1); }
                }
                .ui-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                }
                .ui-modal-container {
                    background: #fff;
                    padding: 24px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                    animation: fadeIn 0.2s ease-out;
                }
                .ui-modal-title {
                    margin-bottom: 16px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #111;
                    text-align: center;
                }
                .ui-modal-message {
                    margin-bottom: 20px;
                    font-size: 15px;
                    color: #111;
                    line-height: 1.5;
                }
                .ui-modal-input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    outline: none;
                    font-size: 14px;
                    margin-bottom: 8px;
                    transition: border 0.2s;
                }
                .ui-modal-input:focus {
                    border-color: #2563eb;
                }
                .ui-suggestions-list {
                    max-height: 150px;
                    overflow-y: auto;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    margin: 6px 0;
                    padding: 0;
                    list-style: none;
                    font-size: 14px;
                }
                .ui-suggestion-item {
                    padding: 8px 12px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .ui-suggestion-item:hover {
                    background: #f9fafb;
                }
                .ui-modal-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-top: 16px;
                }
                .ui-button {
                    padding: 6px 14px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                    font-weight: 500;
                }
                .ui-button-primary {
                    background: #2563eb;
                    color: white;
                }
                .ui-button-primary:hover {
                    background: #1d4ed8;
                }
                .ui-button-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }
                .ui-button-secondary:hover {
                    background: #e5e7eb;
                }
                .ui-button-success {
                    background: #059669;
                    color: white;
                }
                .ui-button-success:hover {
                    background: #047857;
                }
                .ui-button-danger {
                    background: #dc2626;
                    color: white;
                }
                .ui-button-danger:hover {
                    background: #b91c1c;
                }
                .download-options-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    createModal(id, content) {
        // Remove existing modal if any
        this.removeModal(id);

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'ui-modal-overlay';
        modal.innerHTML = content;

        document.body.appendChild(modal);
        this.modals.set(id, modal);
        return modal;
    }

    removeModal(id) {
        const existingModal = document.getElementById(id);
        if (existingModal) {
            existingModal.remove();
        }
        this.modals.delete(id);
    }

    async showCustomAlert(message, options = {}) {
        return new Promise((resolve) => {
            const {
                okText = "OK",
                cancelText = "Cancel", 
                showCancel = true
            } = options;

            const modalId = 'custom-alert-modal';
            const modalContent = `
                <div class="ui-modal-container">
                    <p class="ui-modal-message">${message}</p>
                    <div class="ui-modal-buttons">
                        ${showCancel ? `
                            <button class="ui-button ui-button-secondary" id="alertCancel">
                                ${cancelText}
                            </button>
                        ` : ''}
                        <button class="ui-button ui-button-primary" id="alertOk">
                            ${okText}
                        </button>
                    </div>
                </div>
            `;

            const modal = this.createModal(modalId, modalContent);

            // Event handlers
            modal.querySelector('#alertOk').onclick = () => {
                this.removeModal(modalId);
                resolve(true);
            };

            if (showCancel) {
                modal.querySelector('#alertCancel').onclick = () => {
                    this.removeModal(modalId);
                    resolve(false);
                };
            }

            // Close on overlay click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    this.removeModal(modalId);
                    resolve(false);
                }
            };
        });
    }

    async showCustomPrompt(title = "Input File Name", templates = [], defaultValue = "") {
        return new Promise((resolve, reject) => {
            const modalId = 'custom-prompt-modal';
            const modalContent = `
                <div class="ui-modal-container">
                    <h3 class="ui-modal-title">${title}</h3>
                    <input type="text" id="promptInput" class="ui-modal-input" 
                           placeholder="File name..." value="${defaultValue}">
                    <ul id="promptSuggestions" class="ui-suggestions-list"></ul>
                    <div class="ui-modal-buttons">
                        <button class="ui-button ui-button-secondary" id="promptCancel">Cancel</button>
                        <button class="ui-button ui-button-primary" id="promptOk">Save</button>
                    </div>
                </div>
            `;

            const modal = this.createModal(modalId, modalContent);
            const input = modal.querySelector('#promptInput');
            const list = modal.querySelector('#promptSuggestions');
            const btnOk = modal.querySelector('#promptOk');
            const btnCancel = modal.querySelector('#promptCancel');

            input.focus();
            input.select();

            const renderSuggestions = (value) => {
                list.innerHTML = "";
                if (!value) return;
                
                const filtered = templates.filter(t => 
                    t.toLowerCase().includes(value.toLowerCase())
                );
                
                filtered.forEach(template => {
                    const li = document.createElement('li');
                    li.className = 'ui-suggestion-item';
                    li.textContent = template.replace('.json', '');
                    li.onclick = () => {
                        input.value = li.textContent;
                        list.innerHTML = "";
                    };
                    list.appendChild(li);
                });
            };

            input.oninput = () => renderSuggestions(input.value);

            btnOk.onclick = () => {
                const value = input.value.trim();
                this.removeModal(modalId);
                resolve(value);
            };

            btnCancel.onclick = () => {
                this.removeModal(modalId);
                reject('cancelled');
            };

            // Close on overlay click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    this.removeModal(modalId);
                    reject('cancelled');
                }
            };

            // Enter key support
            input.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    btnOk.click();
                }
            };
        });
    }

    async showDownloadOptions() {
        return new Promise((resolve) => {
            const modalId = 'download-options-modal';
            const modalContent = `
                <div class="ui-modal-container">
                    <h3 class="ui-modal-title">Download Options</h3>
                    <div class="download-options-grid">
                        <button class="ui-button ui-button-danger" id="downloadPDF">
                            Download PDF
                        </button>
                        <button class="ui-button ui-button-success" id="downloadCSV">
                            Download CSV
                        </button>
                        <button class="ui-button ui-button-primary" id="downloadExcel">
                            Download Excel
                        </button>
                        <button class="ui-button ui-button-secondary" id="downloadCancel" style="margin-top:8px;">
                            Cancel
                        </button>
                    </div>
                </div>
            `;

            const modal = this.createModal(modalId, modalContent);

            // Event handlers
            modal.querySelector('#downloadPDF').onclick = () => {
                this.removeModal(modalId);
                resolve('pdf');
            };

            modal.querySelector('#downloadCSV').onclick = () => {
                this.removeModal(modalId);
                resolve('csv');
            };

            modal.querySelector('#downloadExcel').onclick = () => {
                this.removeModal(modalId);
                resolve('excel');
            };

            modal.querySelector('#downloadCancel').onclick = () => {
                this.removeModal(modalId);
                resolve(null);
            };

            // Close on overlay click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    this.removeModal(modalId);
                    resolve(null);
                }
            };
        });
    }

    // Utility method to show loading spinner
    showLoading(message = "Loading...") {
        const modalId = 'loading-modal';
        const modalContent = `
            <div class="ui-modal-container">
                <div style="text-align: center; padding: 20px;">
                    <div style="margin-bottom: 16px;">${message}</div>
                    <div style="width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
            </div>
        `;

        // Add spin animation if not exists
        if (!document.getElementById('spin-animation')) {
            const spinStyle = document.createElement('style');
            spinStyle.id = 'spin-animation';
            spinStyle.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(spinStyle);
        }

        this.createModal(modalId, modalContent);
        return modalId;
    }

    hideLoading(modalId = 'loading-modal') {
        this.removeModal(modalId);
    }

    // Cleanup all modals
    destroy() {
        this.modals.forEach((modal, id) => {
            this.removeModal(id);
        });
    }
}