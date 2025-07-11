import { SelectorManager } from "./selectorManager.js";

document.addEventListener("DOMContentLoaded", () => {
    const manager = new SelectorManager();
    const downloadButton = document.getElementById("report_generator_downloadPDF");
    const saveTemplateButton = document.getElementById("report_generator_saveTemplatePDF");
    const templateSelector = document.getElementById('report_generator_templateSelector');
    const loadTemplateButton = document.getElementById("report_generator_loadTemplatePDF");
    const queryExecuteButton = document.getElementById("report_generator_queryExecute");
    let cachedData = [];
    const PDFDesigner = {
        isResizing: false,
        getSelectorValues() {
            const result = {};
            for (const id in manager.selectors) {
                const element = document.getElementById(id);
                if (element) {
                    result[id] = element.innerText || element.value || "";
                }
            }
            return result;
        },

        getStyleString(styleObj) {
            // console.log("styleObj", styleObj);
            return Object.entries(styleObj)
                .map(([key, value]) => `${key}: ${value}`)
                .join('; ');
        },

        updateSelectorValues(newValues = {}) {
            for (const id in newValues) {
                // Update manager selector
                if (!manager.selectors[id]) {
                    manager.selectors[id] = {};
                }
                manager.selectors[id].value = newValues[id];

                const element = document.getElementById(id);
                if (element) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                        element.value = newValues[id]; // Update form input jika ada
                    } else {
                        element.innerText = newValues[id]; // Update contentEditable atau text element
                    }
                }
            }
        }
    };

    queryExecuteButton.addEventListener('click', () => {
        const query = document.getElementById('manualQueryInput').value;

        if (query.trim() === '') {
            alert('Query tidak boleh kosong.');
            return;
        }

        console.log('Data yang dikirim ke backend:', { query: query });

        fetch('public/download2.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP status ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    updateStyleGroupsFromInputs();
                    generatePreview(); // Fetch data baru
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat mengirim query: ' + error.message);
            });
    });



    // Registrasi default
    [
        "paperSize",
        "paperOrientation",
        "metaTitle",
        "metaAuthor",
        "metaSubject",
        "customWidth",
        "customHeight",
        "title",
        "titleStyle",
        "haderTableStyle",
        "rowTableStyle",
        "rowColor",
        "footer",
        "footerStyle",
        "bodyStyle",
    ].forEach((id) => manager.register(id));

    const selectorVars = manager.generateSelectorVariables();

    const styleGroups = {
        titleStyle: {
            'font-size': '24px',
            'font-weight': 'bold',
            'color': '#000000',
            'text-align': 'center',
            'border': 'none',
        },
        haderTableStyle: {
            'font-size': '14px',
            'font-weight': 'bold',
            'color': '#000000',
            'text-align': 'center',
            'background-color': '#ffffff',
            'border': '1px solid #000000',
            'line-height': '1.1',
        },
        rowTableStyle: {
            'font-size': '12px',
            'font-weight': 'normal',
            'color': '#000000',
            'text-align': 'left',
            'background-color': '#f9f9f9',
            'border': '1px solid #000000',
            'padding': '6px',
            'line-height': '1.1',
        },
        footerStyle: {
            'bottom': '0',
            'left': '0',
            'right': '0',
            'height': '50px',
            'text-align': 'center',
            'font-size': '12px',
            'border-top': '1px solid #000',
        },
        tableStyle: {
            'width': '100%',
            'border-collapse': 'collapse',
            'margin-top': '20px',
            'margin-bottom': '20px',
            'table-layout': 'fixed',
            'word-wrap': 'break-word',
        },
        bodyStyle: {
            'margin': '20px',
            'padding': '50px',
            'box-sizing': 'border-box',
            'font-family': 'Arial, sans-serif',
            'background-color': '#ffffff',
        },
        columnWidths: [],
        headerStyle: {
            rows: [
                [
                    {
                        content: '<img src="{{logo_url}}" alt="Logo" style="height: 50px;">',
                        tag: 'div',
                        colspan: 1,
                        rowspan: 2,
                        styles: {
                            "text-align": "center",
                            "border": "1px solid #000",
                            "padding": "5px"
                        }
                    },
                    {
                        content: "{{nama_perusahaan}}",
                        tag: "h2",
                        colspan: 3,
                        rowspan: 1,
                        styles: {
                            "font-size": "18px",
                            "font-weight": "bold",
                            "text-align": "center",
                            "border": "1px solid #000",
                            "padding": "8px",
                            "margin": "0"
                        }
                    }
                ],
                [
                    {
                        content: "Laporan Stok Barang",
                        tag: "h1",
                        colspan: 3,
                        rowspan: 1,
                        styles: {
                            "font-size": "20px",
                            "font-weight": "bold",
                            "text-align": "center",
                            "border": "1px solid #000",
                            "padding": "10px",
                            "margin": "0"
                        }
                    }
                ],
                [
                    {
                        content: "Tanggal:",
                        tag: "span",
                        colspan: 1,
                        rowspan: 1,
                        styles: {
                            "font-size": "12px",
                            "text-align": "left",
                            "border": "1px solid #000",
                            "padding": "5px"
                        }
                    },
                    {
                        content: "{{current_date}}",
                        tag: "span",
                        colspan: 3,
                        rowspan: 1,
                        styles: {
                            "font-size": "12px",
                            "text-align": "left",
                            "border": "1px solid #000",
                            "padding": "5px"
                        }
                    }
                ]
            ]
        }
    };



    (async () => {
        try {
            const data = await fetch("public/download2.php?action=get_data").then(res => res.json());

            const columnCount = Object.keys(data[0]).length;
            const percentage = (100 / columnCount).toFixed(2) + "%";

            styleGroups.columnWidths = Array.from({ length: columnCount }, () => percentage);

            // console.log("Column widths set (percent-based):", styleGroups.columnWidths);
        } catch (error) {
            console.error("Gagal mengambil data untuk columnWidths:", error);
        }
    })();



    function normalizeStyleValue(attr, value) {
        // Properti yang perlu satuan px otomatis
        const pxProperties = [
            'font-size', 'padding', 'margin',
            'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
            'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
            'border-width', 'border-top-width', 'border-bottom-width', 'border-left-width', 'border-right-width'
        ];

        if (pxProperties.includes(attr) && !value.toString().endsWith('px')) {
            return value + 'px';
        }

        // Aturan khusus untuk properti 'border' yang mengandung beberapa nilai
        if (attr === 'border') {
            // value misal "1 solid #000000"
            // kita pastikan format benar, jika nilai borderWidth adalah angka tanpa satuan, tambahkan px
            let parts = value.split(' ');
            if (parts.length === 3) {
                let [width, style, color] = parts;
                if (!width.endsWith('px') && !isNaN(width)) {
                    width = width + 'px';
                }
                return [width, style, color].join(' ');
            }
            return value; // fallback jika format tidak sesuai
        }

        return value;
    }

    function updateStyleGroupsFromInputs() {
        document.querySelectorAll('[data-style-group]').forEach(input => {
            const group = input.dataset.styleGroup;
            const attr = input.dataset.styleAttr;
            let value = input.value;

            // Normalisasi nilai jika perlu
            value = normalizeStyleValue(attr, value);

            // Simpan ke styleGroups
            if (!styleGroups[group]) styleGroups[group] = {};
            styleGroups[group][attr] = value;
        });
    }

    function renderPreview(data) {
        const previewEl = document.getElementById("preview");

        if (!data || data.length === 0) {
            previewEl.innerHTML = '<p class="text-red-600">Tidak ada data dari database.</p>';
            return;
        }

        setPreviewSize();

        const values = PDFDesigner.getSelectorValues();
        const headers = Object.keys(data[0]);
        const bodyBackground = styleGroups.bodyStyle['background-color'] || '#ffffff';

        // Placeholder otomatis
        const currentDate = new Date().toISOString().split("T")[0];
        const placeholderValues = {
            "{{current_date}}": currentDate,
            "{{nama_perusahaan}}": "Perusahaan Tambang",
            "{{logo_url}}": "https://via.placeholder.com/100x50?text=Logo"
        };

        function replacePlaceholders(str) {
            if (!str || typeof str !== "string") return str;
            return Object.entries(placeholderValues).reduce((result, [key, value]) => {
                return result.replaceAll(key, value);
            }, str);
        }

        const styleTag = `
            <style>
                .generatorPDF { ${PDFDesigner.getStyleString(styleGroups.bodyStyle)} }
                .generatorPDF-table { ${PDFDesigner.getStyleString(styleGroups.tableStyle)} }
                .generatorPDF-th { ${PDFDesigner.getStyleString(styleGroups.haderTableStyle)} }
                .generatorPDF-td { ${PDFDesigner.getStyleString(styleGroups.rowTableStyle)} }
                .generatorPDF-title { background-color: ${bodyBackground}; ${PDFDesigner.getStyleString(styleGroups.titleStyle)} }
                .generatorPDF-footer { ${PDFDesigner.getStyleString(styleGroups.footerStyle)} }
                .resizable-wrapper {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    z-index: 1;
                    pointer-events: auto;
                }                
            </style>
        `;

        // 🔽 Render headerStyle table
        function renderHeaderTable() {
            if (!Array.isArray(styleGroups.headerStyle?.rows)) return '';

            return `
                <table id="table_header_style" style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                    ${styleGroups.headerStyle.rows.map((row, rowIndex) => `
                        <tr>
                            ${row.map((cell, colIndex) => {
                const tag = cell.tag || 'div';
                const content = replacePlaceholders(cell.content || '');
                const colspan = cell.colspan ? `colspan="${cell.colspan}"` : '';
                const rowspan = cell.rowspan ? `rowspan="${cell.rowspan}"` : '';
                const styles = PDFDesigner.getStyleString(cell.styles || {});
                const cellId = `header_cell_${rowIndex}_${colIndex}`;

                const editableTags = ['span', 'div', 'h1', 'h2', 'h3', 'p'];
                const editable = editableTags.includes(tag.toLowerCase()) ? 'contentEditable="true"' : '';

                return `<td ${colspan} ${rowspan} style="${styles}">
                                            <${tag} id="${cellId}" ${editable}>${content}</${tag}>
                                        </td>`;
            }).join('')}
                        </tr>
                    `).join('')}
                </table>
            `;
        }

        // 🔽 HTML akhir
        let html = `
            ${styleTag}
            <div class="generatorPDF">
                ${renderHeaderTable()}
                <h1 id="title" class="generatorPDF-title" contentEditable="true">${values.title}</h1>
                <table class="generatorPDF-table" id="table_resizeable">
                    <thead>
                        <tr>
                            ${headers.map(header => {
            const customHeader = manager.selectors[`header_${header}`]?.content || header;
            return `<th id="header_${header}" contentEditable="true" class="generatorPDF-th">${customHeader}</th>`;
        }).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                ${headers.map(header => `
                                    <td class="generatorPDF-td">${row[header]}</td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="generatorPDF-footer">
                    ${values.footer || ''}
                </div>
            </div>
        `;

        previewEl.innerHTML = html;

        // 🔽 Event listener judul
        const titleEl = document.getElementById("title");
        if (titleEl) {
            titleEl.addEventListener("blur", () => {
                const text = titleEl.innerText;
                if (manager.selectors.title) {
                    manager.selectors.title.content = text;
                }
            });
        }

        // 🔽 Header blur listener
        headers.forEach(headerName => {
            const id = `header_${headerName}`;
            const el = document.getElementById(id);
            if (el) {
                if (!manager.selectors[id]) manager.selectors[id] = {};
                el.addEventListener("blur", () => {
                    manager.selectors[id].content = el.innerText;
                });
            }
        });

        // 🔽 Table utama (data) resizable
        const table = document.querySelector("#preview #table_resizeable");
        if (table) {
            makeTableResizable(table);
            applyColumnWidths(table);
        }

        // 🔽 Table header (headerStyle) resizable
        const headerTable = document.querySelector("#preview #table_header_style");
        if (headerTable) {
            makeTableResizable(headerTable);
        }

        // 🔽 Aktifkan drag & drop untuk headerStyle
        enableHeaderDragAndDrop();
        // 🔽 Buat semua headerStyle teks bisa disimpan ke styleGroups setelah diedit
        styleGroups.headerStyle.rows.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const tag = cell.tag || 'div';
                const editableTags = ['span', 'div', 'h1', 'h2', 'h3', 'p'];
                if (!editableTags.includes(tag.toLowerCase())) return;

                const el = document.getElementById(`header_cell_${rowIndex}_${colIndex}`);
                if (el) {
                    el.addEventListener("blur", () => {
                        styleGroups.headerStyle.rows[rowIndex][colIndex].content = el.innerText;
                    });
                }
            });
        });
        injectHeaderCellControls("table_header_style");
    }


    function enableHeaderDragAndDrop(tableId = "table_header_style") {
        const table = document.getElementById(tableId);
        if (!table) return;

        let dragSrcEl = null;

        table.querySelectorAll("td").forEach(td => {
            td.setAttribute("draggable", true);
            td.style.cursor = "move";

            // Drag start
            td.addEventListener("dragstart", function (e) {
                if (PDFDesigner.isResizing) {
                    e.preventDefault();
                    return;
                }

                dragSrcEl = this;
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/html", this.innerHTML);
                this.style.opacity = "0.5";
            });

            // Drag end
            td.addEventListener("dragend", function () {
                this.style.opacity = "1";
            });

            // Drag over
            td.addEventListener("dragover", function (e) {
                if (PDFDesigner.isResizing) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            });

            td.addEventListener("dragenter", function () {
                if (!PDFDesigner.isResizing) {
                    this.classList.add("drag-over");
                }
            });

            td.addEventListener("dragleave", function () {
                this.classList.remove("drag-over");
            });

            // Drop
            td.addEventListener("drop", function (e) {
                if (PDFDesigner.isResizing) {
                    e.preventDefault();
                    return;
                }

                e.stopPropagation();
                this.classList.remove("drag-over");

                if (dragSrcEl && dragSrcEl !== this) {
                    // Simpan referensi style inline sebelum swap
                    const tmpHTML = this.innerHTML;
                    const tmpStyle = this.getAttribute("style");

                    // Tukar innerHTML dan style antar cell
                    this.innerHTML = dragSrcEl.innerHTML;
                    this.setAttribute("style", dragSrcEl.getAttribute("style"));

                    dragSrcEl.innerHTML = tmpHTML;
                    dragSrcEl.setAttribute("style", tmpStyle);

                    // Reapply resizer karena innerHTML swap menghapusnya
                    makeTableResizable(table);
                }
                return false;
            });
        });
    }

    function injectHeaderCellControls(tableId = "table_header_style") {
        const table = document.getElementById(tableId);
        if (!table) return;
    
        // Hapus semua tombol lama
        table.querySelectorAll(".cell-control-button").forEach(btn => btn.remove());
    
        // Inject style global (sekali saja)
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
            `;
            document.head.appendChild(style);
        }
    
        table.querySelectorAll("tr").forEach((tr, rowIndex) => {
            tr.querySelectorAll("td").forEach((td, cellIndex) => {
                td.style.position = "relative";
    
                const isLastCellInRow = (cellIndex === tr.cells.length - 1);
    
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
    
                // === Horizontal Button Group ===
                const hGroup = document.createElement("div");
                hGroup.style.cssText = `
                    position: absolute;
                    top: 50%;
                    right: -22px;
                    transform: translateY(-50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 10;
                    gap: 2px;
                `;
    
                // ➕ Tambah cell ke kanan
                const btnAddRight = createBtn("+", "Tambah Cell Kanan", "cell-control-add", () => {
                    const newCell = document.createElement("td");
                    newCell.innerHTML = '<div contenteditable="true">Baru</div>';
                    tr.insertBefore(newCell, td.nextSibling);
    
                    if (styleGroups.headerStyle?.rows?.[rowIndex]) {
                        const clone = JSON.parse(JSON.stringify(styleGroups.headerStyle.rows[rowIndex][cellIndex]));
                        clone.content = "Baru";
                        styleGroups.headerStyle.rows[rowIndex].splice(cellIndex + 1, 0, clone);
                    }
    
                    injectHeaderCellControls(tableId);
                });
    
                hGroup.appendChild(btnAddRight);
    
                // ❌ Hapus cell (jika jumlah > 1)
                if (tr.cells.length > 1) {
                    const btnDel = createBtn("×", "Hapus Cell", "cell-control-del", () => {
                        tr.removeChild(td);
                        if (styleGroups.headerStyle?.rows?.[rowIndex]) {
                            styleGroups.headerStyle.rows[rowIndex].splice(cellIndex, 1);
                        }
                        injectHeaderCellControls(tableId);
                    });
                    hGroup.appendChild(btnDel);
                }
    
                td.appendChild(hGroup);
    
                // === Vertical Button Group (bawah) ===
                if (isLastCellInRow) {
                    const vGroup = document.createElement("div");
                    vGroup.style.cssText = `
                        position: absolute;
                        left: 50%;
                        bottom: -22px;
                        transform: translateX(-50%);
                        display: flex;
                        flex-direction: row;
                        gap: 2px;
                        z-index: 10;
                    `;
    
                    // ➕ Tambah baris ke bawah
                    const btnAddBelow = createBtn("↓", "Tambah Baris di Bawah", "cell-control-add", () => {
                        const newRow = document.createElement("tr");
                        const newCell = document.createElement("td");
                        newCell.innerHTML = '<div contenteditable="true">Baru</div>';
                        newRow.appendChild(newCell);
                        table.tBodies[0].insertBefore(newRow, tr.nextSibling);
    
                        if (Array.isArray(styleGroups.headerStyle?.rows)) {
                            const newRowData = [{ tag: "div", content: "Baru", styles: {} }];
                            styleGroups.headerStyle.rows.splice(rowIndex + 1, 0, newRowData);
                        }
    
                        injectHeaderCellControls(tableId);
                    });
                    vGroup.appendChild(btnAddBelow);
    
                    // ❌ Hapus baris bawah (jika lebih dari 1 baris)
                    if (table.rows.length > 1) {
                        const btnDelRow = createBtn("×", "Hapus Baris", "cell-control-del", () => {
                            if (rowIndex < table.rows.length) {
                                table.deleteRow(rowIndex);
                                if (styleGroups.headerStyle?.rows?.[rowIndex]) {
                                    styleGroups.headerStyle.rows.splice(rowIndex, 1);
                                }
                                injectHeaderCellControls(tableId);
                            }
                        });
                        vGroup.appendChild(btnDelRow);
                    }
    
                    td.appendChild(vGroup);
                }
            });
        });
    }
    

    // Tombol tambah selector
    const addSelectorBtn = document.getElementById("addSelectorBtn");
    addSelectorBtn.addEventListener("click", () => {
        const newId = document.getElementById("newSelectorId").value;

        if (newId && !manager.selectors[newId]) {
            manager.register(newId);
            alert(`Selector dengan ID "${newId}" berhasil ditambahkan!`);
            updateSelectorTable();
            updateHTMLPreview();
        } else if (manager.selectors[newId]) {
            alert(`Gagal menambahkan. ID "${newId}" sudah terdaftar.`);
        } else {
            alert("ID selector tidak boleh kosong.");
        }

        document.getElementById("newSelectorId").value = "";
    });

    function updateSelectorTable() {
        const tableBody = document.getElementById("selectorTableBody");
        tableBody.innerHTML = "";

        const hiddenFields = [
            "paperSize",
            "paperOrientation",
            "metaTitle",
            "metaAuthor",
            "metaSubject",
            "customWidth",
            "customHeight",
        ];

        const entries = Object.entries(manager.selectors);
        let visibleIndex = 1; // Counter untuk nomor urut, hanya untuk selector yang ditampilkan

        entries.forEach(([id, el]) => {
            if (hiddenFields.includes(id)) return; // Lewati field tersembunyi

            const value = el.content || "";
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="p-2 border text-center">${visibleIndex++}</td>
                <td class="p-2 border">${id}</td>
                <td class="p-2 border">
                    <select class="tagNameDropdown" data-id="${id}">
                        <option value="div" ${el.tagName === "div" ? "selected" : ""
                }>div</option>
                        <option value="span" ${el.tagName === "span" ? "selected" : ""
                }>span</option>
                        <option value="h1" ${el.tagName === "h1" ? "selected" : ""
                }>h1</option>
                        <option value="p" ${el.tagName === "p" ? "selected" : ""
                }>p</option>
                        <option value="a" ${el.tagName === "a" ? "selected" : ""
                }>a</option>
                        <option value="button" ${el.tagName === "button" ? "selected" : ""
                }>button</option>
                        <option value="img" ${el.tagName === "img" ? "selected" : ""
                }>img</option>
                    </select>
                </td>
                <td class="p-2 border">
                    <input type="text" class="contentInput" data-id="${id}" value="${value}" placeholder="Isi konten atau src img">
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Dropdown event handler
        const tagNameDropdowns = document.querySelectorAll(".tagNameDropdown");
        tagNameDropdowns.forEach((dropdown) => {
            dropdown.addEventListener("change", (e) => {
                const id = e.target.getAttribute("data-id");
                const selectedTag = e.target.value;
                manager.updateTagName(id, selectedTag);
                updateSelectorTable();
                updateHTMLPreview();
            });
        });

        // Input konten event handler
        const contentInputs = document.querySelectorAll(".contentInput");
        contentInputs.forEach((input) => {
            input.addEventListener("input", (e) => {
                const id = e.target.getAttribute("data-id");
                const value = e.target.value;
                if (manager.selectors[id]) {
                    manager.selectors[id].content = value;
                    updateHTMLPreview();
                }
            });
        });
    }

    function updateHTMLPreview() {
        const previewContainer = document.getElementById("htmlPreview");
        const selectors = manager.getAllValues();

        let htmlCode = "";
        for (const [id, selector] of Object.entries(selectors)) {
            htmlCode += `<${selector.tagName} id="${id}">Content of ${id}</${selector.tagName}>\n`;
        }

        previewContainer.textContent = htmlCode;
    }

    // ✅ Fungsi ini bisa kamu panggil untuk keperluan seperti generatePreview()
    PDFDesigner.getSelectorValues = () => manager.getAllValuesAsObject();

    updateSelectorTable();
    updateHTMLPreview();

    PDFDesigner.selectorManager = manager;

    function buildPDFParams(extraParams = {}) {
        const values = PDFDesigner.getSelectorValues();
        const getValue = selection => selection?.value || '';
        const paperSize = getValue(selectorVars.paperSize);
        const paperOrientation = getValue(selectorVars.paperOrientation);
        const metaTitle = getValue(selectorVars.metaTitle);
        const metaAuthor = getValue(selectorVars.metaAuthor);
        const metaSubject = getValue(selectorVars.metaSubject);
        const footer = getValue(selectorVars.footer);

        // Ambil header hasil edit yang dinamakan "header_<field>"
        const customHeaders = {};
        for (const key in values) {
            if (key.startsWith("header_")) {
                const field = key.replace("header_", "");
                customHeaders[field] = values[key];
            }
        }

        console.log("buildPDF title style", encodeURIComponent(JSON.stringify(styleGroups.titleStyle || {})));

        const params = new URLSearchParams({
            title: values.title || '',
            titleStyle: encodeURIComponent(JSON.stringify(styleGroups.titleStyle || {})),
            haderTableStyle: encodeURIComponent(JSON.stringify(styleGroups.haderTableStyle || {})),
            rowTableStyle: encodeURIComponent(JSON.stringify(styleGroups.rowTableStyle || {})),
            tableStyle: encodeURIComponent(JSON.stringify(styleGroups.tableStyle || {})),
            bodyStyle: encodeURIComponent(JSON.stringify(styleGroups.bodyStyle || {})),
            headerStyle: encodeURIComponent(JSON.stringify(styleGroups.headerStyle || {})),
            paperSize,
            paperOrientation,
            metaTitle,
            metaAuthor,
            metaSubject,
            footer,
            columnWidths: encodeURIComponent(JSON.stringify(styleGroups.columnWidths)),
            headers: encodeURIComponent(JSON.stringify(customHeaders)),
            ...extraParams // Untuk menambahkan parameter spesifik seperti action
        });

        // Tambahkan custom size jika ada
        if (paperSize === "custom") {
            const width = getValue(selectorVars.customWidth) || '210';
            const height = getValue(selectorVars.customHeight) || '297';
            params.append('customWidth', width);
            params.append('customHeight', height);
        }

        return params;
    }

    function downloadPDF() {
        const params = buildPDFParams({ type: 'pdf' });
        const url = `/public/download2.php?${params.toString()}`;
        console.log("Download URL:", url);

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'laporan_' + new Date().toISOString().split('T')[0] + '.pdf';
                link.click();
            })
            .catch(error => {
                console.error('Download error:', error);
            });
    }

    function saveTemplate() {
        const params = buildPDFParams({ action: 'save_template_PDF' });
        const url = `/public/download2.php?${params.toString()}`;

        fetch(url)
            .then(response => response.text())
            .then(result => {
                alert('Template berhasil disimpan!');
                console.log(result);
            })
            .catch(error => {
                console.error('Save template error:', error);
            });
    }

    function applyStyleGroupsToForm() {
        document.querySelectorAll('[data-style-group]').forEach(input => {
            const group = input.dataset.styleGroup;
            const attr = input.dataset.styleAttr;

            if (styleGroups[group] && styleGroups[group][attr] !== undefined) {
                input.value = styleGroups[group][attr];
            }
        });
    }

    function applyStyleGroupsToForm() {
        document.querySelectorAll('[data-style-group]').forEach(input => {
            const group = input.dataset.styleGroup;
            const attr = input.dataset.styleAttr;

            if (styleGroups[group] && styleGroups[group][attr] !== undefined) {
                let value = styleGroups[group][attr];

                // Tambahan: Jika properti style berupa px, hapus satuannya
                if (typeof value === 'string' && value.endsWith('px')) {
                    value = value.replace('px', '');
                }

                // Tambahan: Jika input type color, pastikan format warna
                if (input.type === 'color' && value && !value.startsWith('#')) {
                    // Jika warna dalam rgb, convert ke hex (optional)
                    value = '#000000'; // fallback jika format tidak dikenali
                }

                input.value = value;
            }
        });
    }


    async function loadTemplate(filename) {
        try {
            const response = await fetch(`/public/download2.php?action=load_template&filename=${encodeURIComponent(filename)}`);
            if (!response.ok) throw new Error('Gagal memuat template');

            const template = await response.json();
            console.log("template", template);
            if (!template) throw new Error('Template kosong');

            // Set selector values
            if (PDFDesigner && PDFDesigner.updateSelectorValues) {
                PDFDesigner.updateSelectorValues({
                    title: template.title || '',
                    paperSize: template.paperSize || 'A4',
                    paperOrientation: template.paperOrientation || 'portrait',
                    metaTitle: template.metaTitle || '',
                    metaAuthor: template.metaAuthor || '',
                    metaSubject: template.metaSubject || '',
                    footer: template.footer || ''
                });
            }

            // Update custom headers
            for (const key in template.customHeaders) {
                if (manager.selectors[`header_${key}`]) {
                    manager.selectors[`header_${key}`].content = template.customHeaders[key];
                } else {
                    manager.selectors[`header_${key}`] = { content: template.customHeaders[key] };
                }
            }

            if (typeof applyStyleGroupsToForm === 'function') {
                applyStyleGroupsToForm();
            }

            // Update styleGroups
            styleGroups.titleStyle = template.titleStyle || {};
            styleGroups.haderTableStyle = template.haderTableStyle || {};
            styleGroups.rowTableStyle = template.rowTableStyle || {};
            styleGroups.tableStyle = template.tableStyle || {};
            styleGroups.columnWidths = template.columnWidths || [];
            styleGroups.bodyStyle = template.bodyStyle || [];
            console.log("styleGroups.titleStyle", styleGroups.titleStyle);
            // Apply style ke form input jika pakai input form style
            if (typeof applyStyleGroupsToForm === 'function') {
                applyStyleGroupsToForm();
            }
            console.log("sssss", styleGroups);
            // Preview otomatis
            generatePreview();

            console.log('Template berhasil dimuat');
        } catch (error) {
            console.error('Load Template Error:', error);
            alert('Gagal memuat template. Silakan coba lagi.');
        }
    }

    async function fetchTemplateList() {
        try {
            const response = await fetch('/public/download2.php?action=get_template_list');
            if (!response.ok) throw new Error('Gagal mengambil daftar template');

            const templates = await response.json();

            // Bersihkan dropdown dan tambahkan opsi default
            templateSelector.innerHTML = '<option value="">Pilih Template</option>';

            // Masukkan semua template ke dropdown
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template;
                option.textContent = template.replace('.json', '');
                templateSelector.appendChild(option);
            });
        } catch (error) {
            console.error('Fetch Template List Error:', error);
            alert('Gagal mengambil daftar template.');
        }
    }

    fetchTemplateList();

    async function generatePreview() {
        const params = buildPDFParams();
        const url = `/public/download2.php?${params.toString()}&action=get_data`;

        const response = await fetch(url);
        const result = await response.json();

        if (!result.success || result.data.length === 0) {
            document.getElementById("preview").innerHTML = '<p class="text-red-600">Tidak ada data dari database.</p>';
            return;
        }

        cachedData = result.data;
        renderPreview(cachedData);
        truncateTableRowsToFitPreview();
    }


    // function getStyleString(styleObj) {
    //     return Object.entries(styleObj || {})
    //         .map(([prop, value]) => `${prop}: ${value}`)
    //         .join('; ');
    // }

    function makeTableResizable(table) {
        const cols = table.querySelectorAll("th, td");

        cols.forEach((col, index) => {
            // Pastikan col bisa menjadi posisi relatif
            col.style.position = "relative";

            // Wrapper agar posisi resizer tidak mempengaruhi isi cell
            const wrapper = document.createElement("div");
            wrapper.style.position = "absolute";
            wrapper.style.top = "0";
            wrapper.style.left = "0";
            wrapper.style.right = "0";
            wrapper.style.bottom = "0";
            wrapper.style.pointerEvents = "none";
            col.appendChild(wrapper);

            // Resizer Horizontal (kanan)
            const resizerRight = document.createElement("div");
            resizerRight.style.position = "absolute";
            resizerRight.style.top = "0";
            resizerRight.style.right = "-2px"; // sedikit di luar cell
            resizerRight.style.width = "10px";
            resizerRight.style.height = "100%";
            resizerRight.style.cursor = "col-resize";
            resizerRight.style.zIndex = "1000";
            resizerRight.style.pointerEvents = "auto";

            // Resizer Vertikal (bawah)
            const resizerBottom = document.createElement("div");
            resizerBottom.style.position = "absolute";
            resizerBottom.style.bottom = "-2px"; // sedikit di luar cell
            resizerBottom.style.left = "0";
            resizerBottom.style.height = "10px";
            resizerBottom.style.width = "100%";
            resizerBottom.style.cursor = "row-resize";
            resizerBottom.style.zIndex = "1000";
            resizerBottom.style.pointerEvents = "auto";

            wrapper.appendChild(resizerRight);
            wrapper.appendChild(resizerBottom);

            let startX, startY, startWidth, startHeight, tableWidth;

            // --------- Resize Width ---------
            resizerRight.addEventListener("mousedown", function (e) {
                PDFDesigner.isResizing = true;
                startX = e.pageX;
                startWidth = col.offsetWidth;
                tableWidth = table.offsetWidth;

                document.addEventListener("mousemove", onMouseMoveWidth);
                document.addEventListener("mouseup", onMouseUpWidth);
            });

            function onMouseMoveWidth(e) {
                const delta = e.pageX - startX;
                let newWidthPx = startWidth + delta;
                const minWidthPx = tableWidth * 0.01;
                if (newWidthPx < minWidthPx) newWidthPx = minWidthPx;
                const newWidthPercent = (newWidthPx / tableWidth) * 100;

                const existingHeight = col.style.height || '';
                col.style.width = `${newWidthPercent}%`;
                col.style.height = existingHeight;

                if (!styleGroups.columnWidths) styleGroups.columnWidths = [];
                styleGroups.columnWidths[index] = `${newWidthPercent.toFixed(2)}%`;
            }

            function onMouseUpWidth() {
                PDFDesigner.isResizing = false;
                document.removeEventListener("mousemove", onMouseMoveWidth);
                document.removeEventListener("mouseup", onMouseUpWidth);
            }

            // --------- Resize Height ---------
            resizerBottom.addEventListener("mousedown", function (e) {
                PDFDesigner.isResizing = true;
                startY = e.pageY;
                startHeight = col.offsetHeight;

                document.addEventListener("mousemove", onMouseMoveHeight);
                document.addEventListener("mouseup", onMouseUpHeight);
            });

            function onMouseMoveHeight(e) {
                const delta = e.pageY - startY;
                let newHeightPx = startHeight + delta;
                if (newHeightPx < 10) newHeightPx = 10;

                const existingWidth = col.style.width || '';
                col.style.height = `${newHeightPx}px`;
                col.style.width = existingWidth;

                if (!styleGroups.haderTableStyle) styleGroups.haderTableStyle = {};
                styleGroups.haderTableStyle['height'] = `${newHeightPx}px`;
            }

            function onMouseUpHeight() {
                PDFDesigner.isResizing = false;
                document.removeEventListener("mousemove", onMouseMoveHeight);
                document.removeEventListener("mouseup", onMouseUpHeight);
            }
        });
    }



    function applyColumnWidths(table) {
        if (!styleGroups.columnWidths) return;
        const cols = table.querySelectorAll("th");
        cols.forEach((col, i) => {
            const width = styleGroups.columnWidths[i];
            if (width) {
                col.style.width = width;
            }
        });
    }

    function toggleCustomInputs() {
        const isCustom = selectorVars.paperSize.value === "custom";
        customPaperInputs.classList.toggle("hidden", !isCustom);
        selectorVars.customWidth.disabled = !isCustom;
        selectorVars.customHeight.disabled = !isCustom;
    }

    function truncateTableRowsToFitPreview() {
        const preview = document.getElementById("preview");
        const table = preview.querySelector("table");
    
        if (!table) return;
    
        const maxHeight = preview.offsetHeight;
        const rows = table.querySelectorAll("tr");
        let accumulatedHeight = 0;
    
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowHeight = row.offsetHeight;
    
            accumulatedHeight += rowHeight;
    
            if (accumulatedHeight > maxHeight) {
                // Sembunyikan baris yang melebihi kertas
                for (let j = i; j < rows.length; j++) {
                    rows[j].style.display = "none";
                }
                break;
            }
        }
    }
    

    function setPreviewSize() {
        const paperSize = selectorVars.paperSize.value;
        const paperOrientation = selectorVars.paperOrientation.value;
        const previewElement = document.getElementById('preview');

        let width = 210, height = 297; // Default A4 ukuran mm

        switch (paperSize) {
            case "A4":
                width = 210;
                height = 297;
                break;
            case "A5":
                width = 148;
                height = 210;
                break;
            case "Letter":
                width = 216;
                height = 279;
                break;
            case "custom":
                width = parseFloat(selectorVars.customWidth.value) || 210;
                height = parseFloat(selectorVars.customHeight.value) || 297;
                break;
        }

        // Tukar width dan height jika orientasi landscape
        if (paperOrientation === "landscape") {
            [width, height] = [height, width];
        }

        previewElement.style.width = `${width}mm`;
        previewElement.style.height = `${height}mm`;
        previewElement.style.border = '1px solid #ccc';
        previewElement.style.backgroundColor = styleGroups.bodyStyle['background-color'];
    }
    selectorVars.paperSize.addEventListener("change", toggleCustomInputs);
    toggleCustomInputs();
    selectorVars.paperSize.addEventListener("change", setPreviewSize);
    selectorVars.paperOrientation.addEventListener("change", setPreviewSize);
    document.querySelectorAll('[data-style-group]').forEach(input => {
        input.addEventListener('input', () => {
            updateStyleGroupsFromInputs();
            renderPreview(cachedData); // Gunakan data yang sudah diambil
        });
        input.addEventListener('change', () => {
            updateStyleGroupsFromInputs();
            renderPreview(cachedData);
        });
    });

    updateStyleGroupsFromInputs();
    generatePreview();


    downloadButton.addEventListener('click', () => {
        // const values = PDFDesigner.getSelectorValues();
        // console.log("Data dikirim ke backend:", values);
        // const params = new URLSearchParams(values).toString();
        // PDFDesigner.open(`public/download2.php?type=pdf&${params}`, "_blank");
        downloadPDF();
    });

    loadTemplateButton.addEventListener('click', () => {
        const selector = templateSelector;
        const selectedValue = selector.value;

        if (!selectedValue) {
            alert('Silakan pilih template terlebih dahulu.');
            return;
        }

        console.log('Template yang dipilih:', selectedValue);

        // Load template
        loadTemplate(selectedValue); // Load Template
    });


    saveTemplateButton.addEventListener('click', saveTemplate);
});
