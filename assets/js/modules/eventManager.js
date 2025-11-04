// modules/eventManager.js
export class EventManager {
    constructor(styleManager, previewManager, tableEditor, manager, styleGroups) {
        this.styleManager = styleManager;
        this.previewManager = previewManager;
        this.tableEditor = tableEditor;
        this.manager = manager;
        this.styleGroups = styleGroups;
        this.onInputChange = null;

        console.log("🎯 EventManager initialized with:", {
            styleManager: !!styleManager,
            previewManager: !!previewManager,
            tableEditor: !!tableEditor,
            manager: !!manager,
            styleGroups: !!styleGroups
        });
    }

    setupContentEditableListeners() {
        console.log("🔧 Setting up content editable listeners...");
        document.addEventListener("input", (e) => {
            if (e.target.isContentEditable) {
                console.log("📝 Content editable input detected");
                const td = e.target.closest("td");
                const table = td?.closest("table");
                if (!td || !table) return;

                const isHeader = table.id === "table_header_style";
                const isFooter = table.id === "table_footer_style";
                const group = isHeader ? "headerStyle" : isFooter ? "footerStyle" : null;
                if (!group) return;

                const rowIndex = td.parentElement.rowIndex;
                const cellIndex = td.cellIndex;

                const cell = this.styleGroups?.[group]?.rows?.[rowIndex]?.[cellIndex];
                if (!cell) return;

                cell.content = e.target.textContent;
                console.log("💾 Cell content updated:", { group, rowIndex, cellIndex, content: cell.content });
            }
        });
    }

    setupCellSelectionListeners() {
        console.log("🔧 Setting up cell selection listeners...");
        document.addEventListener("click", (event) => {
            const td = event.target.closest("td");
            const table = td?.closest("table");

            const headerTable = document.getElementById("table_header_style");
            const footerTable = document.getElementById("table_footer_style");

            const headerPanel = document.querySelector('[data-content="headerStyle"]');
            const footerPanel = document.querySelector('[data-content="footerStyle"]');

            const clickedInsideHeaderTable = headerTable?.contains(event.target);
            const clickedInsideFooterTable = footerTable?.contains(event.target);
            const clickedInsideHeaderPanel = headerPanel?.contains(event.target);
            const clickedInsideFooterPanel = footerPanel?.contains(event.target);

            const clearSelection = () => {
                document.querySelectorAll("#table_header_style td, #table_footer_style td").forEach(cell => {
                    cell.classList.remove("selected-td", "outline-dashed", "outline-2", "outline-blue-500", "bg-blue-100");
                });
                this.previewManager.toggleStyleInputs('headerStyleCell', false);
                this.previewManager.toggleStyleInputs('footerStyleCell', false);
            };

            if (td && (table?.id === "table_header_style" || table?.id === "table_footer_style")) {
                console.log("🎯 Cell clicked:", table.id);
                clearSelection();

                td.classList.add("selected-td", "outline-dashed", "outline-2", "outline-blue-500", "bg-blue-100");

                const isHeader = table.id === "table_header_style";
                const styleKey = isHeader ? 'headerStyle' : 'footerStyle';
                const inputGroup = isHeader ? 'headerStyleCell' : 'footerStyleCell';

                this.previewManager.toggleStyleInputs(inputGroup, true);

                const rowIndex = td.parentElement.rowIndex;
                const cellIndex = td.cellIndex;

                const cellData = this.styleGroups[styleKey]?.rows?.[rowIndex]?.[cellIndex];
                const styleObj = cellData?.styles || {};

                document.querySelectorAll(`[data-style-group='${inputGroup}']`).forEach(input => {
                    const attr = input.dataset.styleAttr;
                    if (!attr) return;
                    let value = styleObj[attr] || '';
                    if (input.type === "number") {
                        value = parseFloat(value) || '';
                    }
                    if (attr.indexOf("color") !== -1 && typeof value === 'string' && value.startsWith("rgb")) {
                        value = this.styleManager.rgbToHex(value);
                    }
                    input.value = value;
                });
            } else if (!clickedInsideHeaderTable && !clickedInsideFooterTable && !clickedInsideHeaderPanel && !clickedInsideFooterPanel) {
                clearSelection();
            }
        });
    }

    setupStyleInputListeners() {
        console.log("🔧 Setting up style input listeners...");
        const styleInputs = document.querySelectorAll('[data-style-group]');
        console.log(`📋 Found ${styleInputs.length} style inputs`);

        styleInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                console.log("🎛️ Style input changed:", e.target.dataset.styleGroup, e.target.dataset.styleAttr, e.target.value);
                this.handleInputChange();
            });
            input.addEventListener('change', (e) => {
                console.log("🎛️ Style input changed (change event):", e.target.dataset.styleGroup, e.target.dataset.styleAttr, e.target.value);
                this.handleInputChange();
            });
        });
    }

    setupPopoverCleanup() {
        console.log("🔧 Setting up popover cleanup...");
        document.addEventListener("click", (e) => {
            const allPopovers = document.querySelectorAll(".add-popover");
            const isAddButton = e.target.closest(".cell-control-add");
            const isInsidePopover = e.target.closest(".add-popover");

            if (!isAddButton && !isInsidePopover) {
                allPopovers.forEach(p => p.remove());
                console.log("🧹 Popovers cleaned up");
            }
        });
    }

    handleInputChange() {
        console.log("🔄 handleInputChange called");
        let selected = document.querySelector("#table_header_style td.selected-td");
        let section = "header";
        if (!selected) {
            selected = document.querySelector("#table_footer_style td.selected-td");
            if (selected) section = "footer";
        }

        let rowIndex = -1;
        let cellIndex = -1;

        if (selected) {
            rowIndex = selected.parentElement.rowIndex;
            cellIndex = selected.cellIndex;
            console.log("📍 Selected cell:", { section, rowIndex, cellIndex });
        } else {
            console.log("📍 No cell selected");
        }

        // Trigger update style groups and re-render
        if (this.onInputChange) {
            console.log("📞 Calling onInputChange callback");
            this.onInputChange(rowIndex, cellIndex, section);
        } else {
            console.log("❌ No onInputChange callback set");
        }
    }

    setInputChangeCallback(callback) {
        console.log("📞 Input change callback set");
        this.onInputChange = callback;
    }

    setupPaperSizeListeners(selectorVars, preview) {
        console.log("🔧 Setting up paper size listeners...");

        const paperSizeHandler = () => {
            console.log("📄 Paper size changed");
            this.previewManager.toggleCustomInputs();
            this.previewManager.setPreviewSize(preview, selectorVars);
        };

        const paperOrientationHandler = () => {
            console.log("🔄 Paper orientation changed");
            this.previewManager.setPreviewSize(preview, selectorVars);
        };

        // Custom size input handlers
        const customSizeHandler = () => {
            console.log("📏 Custom size changed");
            if (selectorVars.paperSize?.value === 'custom') {
                this.previewManager.setPreviewSize(preview, selectorVars);
            }
        };

        // Add listeners
        selectorVars.paperSize.addEventListener("change", paperSizeHandler);
        selectorVars.paperOrientation.addEventListener("change", paperOrientationHandler);

        // Add listeners for custom inputs jika ada
        if (selectorVars.customWidth) {
            selectorVars.customWidth.addEventListener("input", customSizeHandler);
            selectorVars.customWidth.addEventListener("change", customSizeHandler);
        }

        if (selectorVars.customHeight) {
            selectorVars.customHeight.addEventListener("input", customSizeHandler);
            selectorVars.customHeight.addEventListener("change", customSizeHandler);
        }

        // Initial setup
        this.previewManager.toggleCustomInputs();
        this.previewManager.setPreviewSize(preview, selectorVars);

        console.log("✅ Paper size listeners setup completed");
    }
    
    setupHeaderFooterDisplayListeners(styleGroups, renderPreviewCallback) {
        console.log("🔧 Setting up header/footer display listeners...");

        const headerDisplayRuleSelect = document.getElementById('headerDisplayRule');
        const footerDisplayRuleSelect = document.getElementById('footerDisplayRule');
        const pageNumberPositionSelect = document.getElementById('pageNumberPosition');

        // Inisialisasi nilai awal
        if (headerDisplayRuleSelect && styleGroups.headerDisplayRule) {
            headerDisplayRuleSelect.value = styleGroups.headerDisplayRule;
        }
        if (footerDisplayRuleSelect && styleGroups.footerDisplayRule) {
            footerDisplayRuleSelect.value = styleGroups.footerDisplayRule;
        }
        if (pageNumberPositionSelect && styleGroups.pageNumberPosition) {
            pageNumberPositionSelect.value = styleGroups.pageNumberPosition;
        }

        // Event listeners
        if (headerDisplayRuleSelect) {
            headerDisplayRuleSelect.addEventListener('change', (e) => {
                styleGroups.headerDisplayRule = e.target.value;
                console.log('Header display rule changed to:', e.target.value);
                if (renderPreviewCallback) {
                    renderPreviewCallback();
                }
            });
        }

        if (footerDisplayRuleSelect) {
            footerDisplayRuleSelect.addEventListener('change', (e) => {
                styleGroups.footerDisplayRule = e.target.value;
                console.log('Footer display rule changed to:', e.target.value);
                if (renderPreviewCallback) {
                    renderPreviewCallback();
                }
            });
        }

        if (pageNumberPositionSelect) {
            pageNumberPositionSelect.addEventListener('change', (e) => {
                styleGroups.pageNumberPosition = e.target.value;
                console.log('Page number position changed to:', e.target.value);
            });
        }

        console.log("✅ Header/footer display listeners setup completed");
    }
}