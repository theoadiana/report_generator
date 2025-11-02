// modules/tableEditor.js
export class TableEditor {
    constructor(styleManager, PDFDesigner) {
        this.styleManager = styleManager;
        this.PDFDesigner = PDFDesigner;
    }

    makeTableResizable(table) {
        const cols = table.querySelectorAll("th, td");

        cols.forEach((col, index) => {
            col.style.position = "relative";

            const wrapper = document.createElement("div");
            wrapper.style.position = "absolute";
            wrapper.style.top = "0";
            wrapper.style.left = "0";
            wrapper.style.right = "0";
            wrapper.style.bottom = "0";
            wrapper.style.pointerEvents = "none";
            col.appendChild(wrapper);

            const resizerRight = document.createElement("div");
            resizerRight.style.position = "absolute";
            resizerRight.style.top = "0";
            resizerRight.style.right = "-2px";
            resizerRight.style.width = "4px";
            resizerRight.style.height = "100%";
            resizerRight.style.cursor = "col-resize";
            resizerRight.style.zIndex = "1000";
            resizerRight.style.pointerEvents = "auto";
            wrapper.appendChild(resizerRight);

            const resizerBottom = document.createElement("div");
            resizerBottom.style.position = "absolute";
            resizerBottom.style.bottom = "-2px";
            resizerBottom.style.left = "0";
            resizerBottom.style.width = "100%";
            resizerBottom.style.height = "4px";
            resizerBottom.style.cursor = "row-resize";
            resizerBottom.style.zIndex = "1000";
            resizerBottom.style.pointerEvents = "auto";

            const isCell = !col.closest("tbody#table_data_body");
            if (isCell) {
                wrapper.appendChild(resizerBottom);
            }

            let startX, startY, startWidth, startHeight, tableWidth;

            resizerRight.addEventListener("mousedown", (e) => {
                this.PDFDesigner.isResizing = true;
                startX = e.pageX;
                startWidth = col.offsetWidth;
                tableWidth = table.offsetWidth;

                document.addEventListener("mousemove", onMouseMoveWidth);
                document.addEventListener("mouseup", onMouseUpWidth);
            });

            const onMouseMoveWidth = (e) => {
                const delta = e.pageX - startX;
                let newWidthPx = startWidth + delta;
                const minWidthPx = tableWidth * 0.01;
                if (newWidthPx < minWidthPx) newWidthPx = minWidthPx;
                const newWidthPercent = (newWidthPx / tableWidth) * 100;

                // Temukan index kolom dalam satu row
                const colIndex = Array.from(col.parentElement.children).indexOf(col);

                // Ubah semua baris di kolom yang sama
                table.querySelectorAll("tr").forEach((row) => {
                    const cell = row.children[colIndex];
                    if (cell) {
                        cell.style.width = `${newWidthPercent}%`;
                    }
                });

                // Update styleGroups dengan pendekatan yang lebih robust
                const styleGroups = this.styleManager.getStyleGroups();
                const groupMap = {
                    table_header_style: "headerStyle",
                    table_footer_style: "footerStyle",
                };
                const groupKey = groupMap[table.id];

                if (groupKey && styleGroups[groupKey]?.rows) {
                    // Hitung posisi sel yang sebenarnya dengan mempertimbangkan colspan/rowspan
                    let currentColIndex = 0;
                    let found = false;

                    for (let i = 0; i < styleGroups[groupKey].rows.length && !found; i++) {
                        for (let j = 0; j < styleGroups[groupKey].rows[i].length && !found; j++) {
                            const cell = styleGroups[groupKey].rows[i][j];
                            const colspan = cell.colspan || 1;

                            if (currentColIndex === colIndex) {
                                cell.width = `${newWidthPercent.toFixed(2)}%`;
                                found = true;
                            }

                            currentColIndex += colspan;
                        }
                    }
                } else {
                    if (!styleGroups.columnWidths) styleGroups.columnWidths = [];
                    styleGroups.columnWidths[colIndex] = `${newWidthPercent.toFixed(2)}%`;
                }
            };

            const onMouseUpWidth = () => {
                this.PDFDesigner.isResizing = false;
                document.removeEventListener("mousemove", onMouseMoveWidth);
                document.removeEventListener("mouseup", onMouseUpWidth);
            };

            // Resize height hanya untuk header
            if (isCell) {
                resizerBottom.addEventListener("mousedown", (e) => {
                    this.PDFDesigner.isResizing = true;
                    startY = e.pageY;
                    startHeight = col.offsetHeight;

                    document.addEventListener("mousemove", onMouseMoveHeight);
                    document.addEventListener("mouseup", onMouseUpHeight);
                });

                const onMouseMoveHeight = (e) => {
                    const delta = e.pageY - startY;
                    let newHeightPx = startHeight + delta;
                    if (newHeightPx < 10) newHeightPx = 10;

                    col.style.height = `${newHeightPx}px`;

                    // Deteksi tipe (header/footer)
                    const styleGroups = this.styleManager.getStyleGroups();
                    const isHeader = table.id === "table_header_style";
                    const isFooter = table.id === "table_footer_style";

                    if (isHeader || isFooter) {
                        const key = isHeader ? "headerStyle" : "footerStyle";
                        const styleObj = styleGroups[key];

                        const cellIndex = Array.from(cols).indexOf(col);
                        let rowIndex = 0, colIndex = 0, counter = 0;
                        outer: for (let i = 0; i < styleObj.rows.length; i++) {
                            for (let j = 0; j < styleObj.rows[i].length; j++) {
                                if (counter === cellIndex) {
                                    rowIndex = i;
                                    colIndex = j;
                                    break outer;
                                }
                                counter++;
                            }
                        }

                        const cell = styleObj.rows?.[rowIndex]?.[colIndex];
                        if (cell) {
                            cell.height = `${newHeightPx}`; // Simpan tinggi dalam px, bukan persen
                        }
                    } else {
                        if (!styleGroups.headerTableStyle) styleGroups.headerTableStyle = {};
                        styleGroups.headerTableStyle['height'] = `${newHeightPx}px`;
                    }
                };

                const onMouseUpHeight = () => {
                    this.PDFDesigner.isResizing = false;
                    document.removeEventListener("mousemove", onMouseMoveHeight);
                    document.removeEventListener("mouseup", onMouseUpHeight);
                };
            }
        });
    }

    // modules/tableEditor.js - Perbaiki method enableDragAndDrop
    enableDragAndDrop(tableId = "table_header_style") {
        const table = document.getElementById(tableId);
        if (!table) return;

        let dragSrcTd = null;
        const tableEditor = this; // Simpan reference ke this

        table.querySelectorAll("td").forEach(td => {
            td.setAttribute("draggable", false);
            td.style.cursor = "default";
            td.style.position = "relative";

            let dragHandle = td.querySelector(".drag-handle");
            if (!dragHandle) {
                dragHandle = document.createElement("div");
                dragHandle.className = "drag-handle";
                dragHandle.title = "Geser untuk memindahkan cell";
                dragHandle.innerHTML = "⠿";

                Object.assign(dragHandle.style, {
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    cursor: "move",
                    fontSize: "12px",
                    zIndex: 16,
                    color: "#999",
                    background: "transparent",
                    userSelect: "none",
                    lineHeight: "1"
                });

                td.appendChild(dragHandle);
            }

            dragHandle.setAttribute("draggable", true);

            dragHandle.addEventListener("dragstart", (e) => {
                if (this.PDFDesigner.isResizing) {
                    e.preventDefault();
                    return;
                }

                dragSrcTd = td;
                td.classList.add("dragging-td");
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", "dragging");

                // Ghost image
                const ghost = td.cloneNode(true);
                ghost.classList.remove("dragging-td");
                ghost.style.position = "absolute";
                ghost.style.top = "-9999px";
                ghost.style.left = "-9999px";
                ghost.style.opacity = "0.7";
                ghost.style.pointerEvents = "none";
                ghost.style.zIndex = "9999";
                ghost.style.boxSizing = "border-box";
                ghost.style.width = `${td.offsetWidth}px`;
                ghost.style.height = `${td.offsetHeight}px`;

                document.body.appendChild(ghost);
                e.dataTransfer.setDragImage(ghost, 0, 0);
                setTimeout(() => document.body.removeChild(ghost), 0);
            });

            dragHandle.addEventListener("dragend", () => {
                if (dragSrcTd) {
                    dragSrcTd.classList.remove("dragging-td");
                    dragSrcTd = null;
                }
            });

            td.addEventListener("dragover", (e) => {
                if (this.PDFDesigner.isResizing) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            });

            td.addEventListener("dragenter", function () {
                if (!tableEditor.PDFDesigner.isResizing) {
                    this.classList.add("drag-over");
                }
            });

            td.addEventListener("dragleave", function () {
                this.classList.remove("drag-over");
            });

            // ✅ PERBAIKAN: Gunakan arrow function dan tableEditor reference
            td.addEventListener("drop", (e) => {
                if (this.PDFDesigner.isResizing || !dragSrcTd || dragSrcTd === e.currentTarget) return;

                e.preventDefault();
                e.stopPropagation();

                const targetTd = e.currentTarget;
                targetTd.classList.remove("drag-over");

                // Simpan ukuran masing-masing sebelum swap
                const srcWidth = dragSrcTd.style.width;
                const srcHeight = dragSrcTd.style.height;
                const targetWidth = targetTd.style.width;
                const targetHeight = targetTd.style.height;

                // Tukar innerHTML
                const tempHTML = dragSrcTd.innerHTML;
                dragSrcTd.innerHTML = targetTd.innerHTML;
                targetTd.innerHTML = tempHTML;

                // Tukar style (tanpa width & height)
                const tempStyle = { ...dragSrcTd.style };
                const targetStyle = { ...targetTd.style };

                for (let i = 0; i < dragSrcTd.style.length; i++) {
                    const prop = dragSrcTd.style[i];
                    if (prop !== "width" && prop !== "height") {
                        const val = dragSrcTd.style.getPropertyValue(prop);
                        targetTd.style.setProperty(prop, val);
                    }
                }

                for (let i = 0; i < targetStyle.length; i++) {
                    const prop = targetStyle[i];
                    if (prop !== "width" && prop !== "height") {
                        const val = targetStyle.getPropertyValue(prop);
                        dragSrcTd.style.setProperty(prop, val);
                    }
                }

                // Kembalikan ukuran asli
                dragSrcTd.style.width = srcWidth;
                dragSrcTd.style.height = srcHeight;
                targetTd.style.width = targetWidth;
                targetTd.style.height = targetHeight;

                // ✅ Tambahan: Tukar data di styleGroups
                const styleGroups = this.styleManager.getStyleGroups();
                const isHeader = table.id === "table_header_style";
                const styleKey = isHeader ? "headerStyle" : "footerStyle";

                const srcRow = dragSrcTd.parentElement.rowIndex;
                const srcCol = dragSrcTd.cellIndex;
                const targetRow = targetTd.parentElement.rowIndex;
                const targetCol = targetTd.cellIndex;

                const srcCellData = styleGroups[styleKey]?.rows?.[srcRow]?.[srcCol];
                const targetCellData = styleGroups[styleKey]?.rows?.[targetRow]?.[targetCol];

                if (srcCellData && targetCellData) {
                    const tempContent = srcCellData.content;
                    const tempStyles = { ...srcCellData.styles };

                    srcCellData.content = targetCellData.content;
                    srcCellData.styles = { ...targetCellData.styles };

                    targetCellData.content = tempContent;
                    targetCellData.styles = tempStyles;
                }

                this.makeTableResizable(table);
                this.injectCellControls(tableId);
                this.enableDragAndDrop(tableId);
            });

            td.addEventListener("mousemove", (e) => {
                const isInEditable = e.target.closest("[contenteditable='true']");
                td.style.cursor = isInEditable ? "text" : "default";
            });

            td.addEventListener("mouseleave", () => {
                td.style.cursor = "default";
            });
        });
    }

    injectCellControls(tableId = "table_header_style") {
        const table = document.getElementById(tableId);
        if (!table) return;

        // Hapus semua tombol lama
        table.querySelectorAll(".cell-control-button, .add-popover").forEach(el => el.remove());

        // Inject style global sekali saja
        if (!document.getElementById("cell-control-style")) {
            const style = document.createElement("style");
            style.id = "cell-control-style";
            style.textContent = `
                .cell-control-button {
                    background-color: transparent;
                    color: white;
                    border-radius: 3px;
                    border: 1px solid;
                    width: 16px;
                    height: 16px;
                    font-size: 10px;
                    padding: 0;
                    text-align: center;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: background-color 0.2s, opacity 0.2s;
                    position: absolute;
                    z-index: 15;
                }
                .cell-control-button:hover {
                    opacity: 1;
                }
                .cell-control-add {
                    border-color: #28a745;
                    color: #28a745;
                }
                .cell-control-add:hover {
                    background-color: #28a745;
                    color: white;
                }
                .cell-control-del {
                    border-color: #dc3545;
                    color: #dc3545;
                }
                .cell-control-del:hover {
                    background-color: #dc3545;
                    color: white;
                }
                .add-popover {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    background: white;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    padding: 4px;
                    z-index: 9999;
                }
                .add-popover button {
                    width: 20px;
                    height: 20px;
                    font-size: 12px;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
        }

        const createBtn = (text, title, cls, onClick) => {
            const btn = document.createElement("button");
            btn.textContent = text;
            btn.title = title;
            btn.className = `cell-control-button ${cls}`;
            btn.addEventListener("click", e => {
                e.stopPropagation();
                onClick();
            });
            return btn;
        };

        const createAddPopover = (td, rowIndex, cellIndex) => {
            const popover = document.createElement("div");
            popover.className = "add-popover";

            const directions = [
                { dir: "↑", title: "Tambah Baris di Atas", action: () => this.addRow(tableId, rowIndex) },
                { dir: "←", title: "Tambah Cell Kiri", action: () => this.addCell(tableId, rowIndex, cellIndex, "left") },
                { dir: "→", title: "Tambah Cell Kanan", action: () => this.addCell(tableId, rowIndex, cellIndex, "right") },
                { dir: "↓", title: "Tambah Baris di Bawah", action: () => this.addRow(tableId, rowIndex + 1) },
            ];

            directions.forEach(({ dir, title, action }) => {
                const btn = document.createElement("button");
                btn.textContent = dir;
                btn.title = title;
                btn.addEventListener("click", e => {
                    e.stopPropagation();
                    action();
                });
                popover.appendChild(btn);
            });

            td.appendChild(popover);
            popover.style.top = "20px";
            popover.style.left = "20px";
        };

        // Inject tombol hapus dan tambah ke setiap cell
        const rows = Array.from(table.querySelectorAll("tbody tr"));
        rows.forEach((tr, trIdx) => {
            const styleKey = tableId === "table_footer_style" ? "footerStyle" : "headerStyle";

            const cells = Array.from(tr.querySelectorAll("td"));
            cells.forEach((td, cellIdx) => {
                td.style.position = "relative";

                const btnDel = createBtn("×", "Hapus Cell", "cell-control-del", () => {
                    tr.removeChild(td);
                    const styleGroups = this.styleManager.getStyleGroups();
                    if (styleGroups[styleKey]?.rows?.[trIdx]) {
                        styleGroups[styleKey].rows[trIdx].splice(cellIdx, 1);
                    }
                    this.injectCellControls(tableId);
                    this.enableDragAndDrop(tableId);
                    this.makeTableResizable(table);
                });
                td.appendChild(btnDel);
                btnDel.style.top = "0";
                btnDel.style.left = "0";

                const btnAdd = createBtn("+", "Tambah", "cell-control-add", () => {
                    const existingPopover = td.querySelector(".add-popover");
                    table.querySelectorAll(".add-popover").forEach(p => p.remove());
                    if (!existingPopover) {
                        createAddPopover(td, trIdx, cellIdx, styleKey);
                    }
                });
                td.appendChild(btnAdd);
                btnAdd.style.bottom = "0";
                btnAdd.style.right = "0";
            });
        });

        // Jika semua cell kosong pada table yang sedang diproses, tampilkan tombol tambah pertama
        const styleGroups = this.styleManager.getStyleGroups();
        let isEmpty = false;
        if (tableId === "table_header_style") {
            isEmpty = !styleGroups.headerStyle?.rows?.length ||
                styleGroups.headerStyle.rows.every(row => !row.length);
        } else if (tableId === "table_footer_style") {
            isEmpty = !styleGroups.footerStyle?.rows?.length ||
                styleGroups.footerStyle.rows.every(row => !row.length);
        }

        if (isEmpty) {
            const tbody = table.querySelector("tbody") || table.createTBody();
            tbody.innerHTML = '';

            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 100;
            td.style.position = "relative";
            td.style.width = "120px";
            td.style.height = "50px";
            td.style.border = "1px solid #ccc";
            td.style.verticalAlign = "middle";
            td.style.textAlign = "center";
            td.style.padding = "0";

            const btnAddFirst = document.createElement("button");
            btnAddFirst.textContent = "+ Add First Cell";
            btnAddFirst.style.width = "100%";
            btnAddFirst.style.height = "100%";
            btnAddFirst.style.border = "none";
            btnAddFirst.style.background = "none";
            btnAddFirst.style.cursor = "pointer";
            btnAddFirst.style.color = "#28a745";
            btnAddFirst.style.fontWeight = "bold";

            btnAddFirst.addEventListener("click", () => {
                this.addRow(tableId, 0);
                tr.remove(); // ✅ Hapus tombol saat ditekan
            });

            td.appendChild(btnAddFirst);
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
    }

    addCell(tableId, rowIdx, cellIdx, position) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const tr = table.rows[rowIdx];
        if (!tr) return;

        const refCell = tr.cells[cellIdx];
        const newCell = this.createNewCellElement();

        if (position === "left") tr.insertBefore(newCell, refCell);
        else tr.insertBefore(newCell, refCell.nextSibling);

        const insertIndex = position === "left" ? cellIdx : cellIdx + 1;

        const base = this.getDefaultCell();
        const styleKey = tableId === "table_footer_style" ? "footerStyle" : "headerStyle";
        const styleGroups = this.styleManager.getStyleGroups();

        if (!styleGroups[styleKey].rows[rowIdx]) styleGroups[styleKey].rows[rowIdx] = [];
        styleGroups[styleKey].rows[rowIdx].splice(insertIndex, 0, base);

        this.injectCellControls(tableId);
        this.enableDragAndDrop(tableId);
        this.makeTableResizable(table);
    }

    addRow(tableId, rowIdx) {
        const table = document.getElementById(tableId);
        if (!table) return;

        const newRow = document.createElement("tr");
        const newCell = this.createNewCellElement();
        newRow.appendChild(newCell);

        const refRow = table.rows[rowIdx];
        if (refRow) table.tBodies[0].insertBefore(newRow, refRow);
        else table.tBodies[0].appendChild(newRow);

        const newRowData = [this.getDefaultCell()];

        const styleGroups = this.styleManager.getStyleGroups();
        if (tableId === "table_header_style") {
            if (!styleGroups.headerStyle?.rows) styleGroups.headerStyle.rows = [];
            styleGroups.headerStyle.rows.splice(rowIdx, 0, newRowData);
        } else if (tableId === "table_footer_style") {
            if (!styleGroups.footerStyle?.rows) styleGroups.footerStyle.rows = [];
            styleGroups.footerStyle.rows.splice(rowIdx, 0, newRowData);
        }

        this.injectCellControls(tableId);
        this.enableDragAndDrop(tableId);
        this.makeTableResizable(table);
    }

    createNewCellElement() {
        const td = document.createElement("td");
        td.style.position = "relative";
        td.style.border = "1px solid #000";
        td.style.verticalAlign = "top";

        const div = document.createElement("div");
        div.contentEditable = true;
        div.textContent = "Baru";

        // Ambil default styles dan terapkan ke <div>
        const styles = this.getDefaultCell().styles;
        Object.entries(styles).forEach(([key, value]) => {
            div.style.setProperty(key, value);
        });

        td.appendChild(div);
        return td;
    }

    getDefaultCell() {
        const styleGroups = this.styleManager.getStyleGroups();
        return {
            content: "Baru",
            tag: "div",
            colspan: 1,
            rowspan: 1,
            width: 120,
            height: 25,
            styles: {
                "text-align": "center",
                "font-size": "16px",
                "font-weight": "700",
                "background-color": styleGroups.bodyStyle?.["background-color"] || "#ffffff",
                "color": "#000000",
            }
        };
    }

    // Method untuk apply semua table functionality sekaligus
    initializeTable(tableId, styleGroups, previewManager = null) {
        const table = document.getElementById(tableId);
        if (!table) return;
    
        // Special handling untuk table_resizeable (data table)
        if (tableId === "table_resizeable") {
            this.makeTableResizable(table);
            if (previewManager) {
                previewManager.applyColumnWidths(table, styleGroups);
            }
            return;
        }
    
        // Untuk header dan footer tables
        const isHeader = tableId === "table_header_style";
        const isFooter = tableId === "table_footer_style";
        
        if ((isHeader && styleGroups.headerDisplayRule !== "none") || 
            (isFooter && styleGroups.footerDisplayRule !== "none")) {
            this.makeTableResizable(table);
            this.injectCellControls(tableId);
            this.enableDragAndDrop(tableId);
        }
    }
}