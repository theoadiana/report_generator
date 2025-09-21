import { SelectorManager } from "./selectorManager.js";

document.addEventListener("DOMContentLoaded", () => {
    const manager = new SelectorManager();
    const downloadButton = document.getElementById("report_generator_downloadPDF");
    const saveTemplateButton = document.getElementById("report_generator_saveTemplatePDF");
    const saveAsTemplateButton = document.getElementById("report_generator_saveAsTemplatePDF");
    const deleteTemplateButton = document.getElementById("report_generator_deleteTemplatePDF");
    const editTemplateButton = document.getElementById("report_generator_editTemplatePDF");
    const templateSelector = document.getElementById('report_generator_templateSelector');
    const queryExecuteButton = document.getElementById("report_generator_queryExecute");

    //zoom in zoom out variable
    const preview = document.getElementById("preview");
    const footer = document.getElementById("previewFooter");

    // Inject HTML controls ke dalam footer
    footer.innerHTML = `
    <button id="zoomOut" class="w-6 h-6 flex items-center justify-center text-xs bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 transition">-</button>
    
    <input 
        type="range" 
        id="zoomSlider" 
        min="10" max="300" value="100" step="0.5" 
        class="w-32 h-2 appearance-none bg-gray-200 rounded-lg overflow-hidden cursor-pointer accent-indigo-500">
    
    <span id="zoomLabel" class="text-xs text-gray-600">100%</span>
    
    <button id="zoomIn" class="w-6 h-6 flex items-center justify-center text-xs bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 transition">+</button>
`;

    const zoomOutBtn = document.getElementById("zoomOut");
    const zoomInBtn = document.getElementById("zoomIn");
    const zoomSlider = document.getElementById("zoomSlider");
    const zoomLabel = document.getElementById("zoomLabel");

    let zoomLevel = 100;

    let cachedData = [];
    toggleStyleInputs('headerStyleCell', false);
    toggleStyleInputs('footerStyleCell', false);
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

        // console.log('Data yang dikirim ke backend:', { query: query });

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
        "headerTableStyle",
        "rowTableStyle",
        "footerStyle",
        "bodyStyle",
    ].forEach((id) => manager.register(id));

    const selectorVars = manager.generateSelectorVariables();
    const styleGroups = {
        headerTableStyle: {
            'font-size': '16px',
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
                        content: "Cell 1",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    },
                    {
                        content: "Cell 2",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    },
                    {
                        content: "Cell 3",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    }
                ],
                [
                    {
                        content: "Cell 4",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    },
                    {
                        content: "Cell 5",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    },
                    {
                        content: "Cell 6",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    }
                ]
            ]
        },
        footerStyle: {
            rows: [
                [
                    {
                        content: "Cell 1",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    },
                    {
                        content: "Cell 2",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    },
                    {
                        content: "Cell 3",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    }
                ],
                [
                    {
                        content: "Cell 4",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    },
                    {
                        content: "Cell 5",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    },
                    {
                        content: "Cell 6",
                        tag: "div",
                        colspan: 1,
                        rowspan: 1,
                        width: 120,
                        height: 25,
                        styles: {
                            "text-align": "center",
                            "font-size": "16px",
                            "font-weight": "700",
                            "background-color": "#ffffff",
                            "color": "#000000",
                        }
                    }
                ]
            ]
        },

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

    function buildStyleStructureFromDOM(tableId = "table_header_style") {
        const table = document.getElementById(tableId);
        const styleStructure = { rows: [] };

        if (!table) return styleStructure;

        const rows = table.querySelectorAll("tr");

        // Hitung total lebar dari baris pertama untuk referensi persen
        let totalWidth = 0;
        const firstRowCells = rows[0]?.querySelectorAll("td") || [];
        firstRowCells.forEach(td => {
            totalWidth += td.offsetWidth || 0;
        });

        rows.forEach(tr => {
            const row = [];
            const cells = tr.querySelectorAll("td");

            cells.forEach(td => {
                const tag = td.dataset.tag || 'div';
                const colspan = parseInt(td.getAttribute('colspan')) || 1;
                const rowspan = parseInt(td.getAttribute('rowspan')) || 1;
                const widthPx = td.offsetWidth || 0;
                const heightPx = td.offsetHeight || 0;

                // Konversi width ke persen (relatif terhadap total baris pertama)
                const width = totalWidth
                    ? ((widthPx / totalWidth) * 100).toFixed(2) + '%'
                    : 'auto';
                const height = heightPx;

                // Gabungkan style inline dari td dan elemen anak pertama
                const styleObj = {};
                const extractStyles = (styleText) => {
                    styleText.split(';').forEach(rule => {
                        if (rule.includes(':')) {
                            const [key, value] = rule.split(':');
                            if (key && value) {
                                styleObj[key.trim()] = value.trim();
                            }
                        }
                    });
                };

                extractStyles(td.style.cssText);
                const inner = td.querySelector("*");
                if (inner && inner.style) {
                    extractStyles(inner.style.cssText);
                }

                // Clone cell dan hapus elemen-elemen kontrol sebelum ambil isi kontennya
                const tempClone = td.cloneNode(true);
                tempClone.querySelectorAll(".drag-handle, .btn-remove-cell, .btn-add-cell, button, .btn-add, .btn-delete").forEach(el => el.remove());
                const content = tempClone.textContent.trim();

                row.push({
                    content,
                    tag,
                    colspan,
                    rowspan,
                    width,
                    height,
                    styles: styleObj
                });
            });

            styleStructure.rows.push(row);
        });

        return styleStructure;
    }


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

    document.addEventListener("input", (e) => {
        if (e.target.isContentEditable) {
            const td = e.target.closest("td");
            const table = td?.closest("table");
            if (!td || !table) return;

            const isHeader = table.id === "table_header_style";
            const isFooter = table.id === "table_footer_style";
            const group = isHeader ? "headerStyle" : isFooter ? "footerStyle" : null;
            if (!group) return;

            const rowIndex = td.parentElement.rowIndex;
            const cellIndex = td.cellIndex;

            const cell = styleGroups?.[group]?.rows?.[rowIndex]?.[cellIndex];
            if (!cell) return;

            cell.content = e.target.textContent;
        }
    });


    function updateStyleGroupsFromInputs() {
        document.querySelectorAll('[data-style-group]').forEach(input => {
            const group = input.dataset.styleGroup;
            const attr = input.dataset.styleAttr;
            let value = input.value;

            // Normalisasi satuan, misal px
            value = normalizeStyleValue(attr, value);

            // Handler khusus untuk cell berbasis tabel
            if (group === 'headerStyleCell' || group === 'footerStyleCell') {
                const tableId = group === 'headerStyleCell' ? 'table_header_style' : 'table_footer_style';
                const styleKey = group === 'headerStyleCell' ? 'headerStyle' : 'footerStyle';

                const selectedTd = document.querySelector(`#${tableId} td.selected-td`);
                if (!selectedTd) return;

                const rowIndex = selectedTd.parentElement.rowIndex;
                const cellIndex = selectedTd.cellIndex;

                const cell = styleGroups[styleKey]?.rows?.[rowIndex]?.[cellIndex];
                if (!cell) return;

                if (!cell.styles) cell.styles = {};
                cell.styles[attr] = value;

                // Terapkan langsung ke DOM
                const inner = selectedTd.querySelector("*");
                if (inner) inner.style.setProperty(attr, value);
            } else {
                // Handler untuk global styleGroup biasa
                if (!styleGroups[group]) styleGroups[group] = {};
                styleGroups[group][attr] = value;
            }
        });
    }


    function renderPreview(data) {
        const previewEl = document.getElementById("preview");

        if (!data || data.length === 0) {
            previewEl.innerHTML = '<p class="text-red-600">Tidak ada data dari database.</p>';
            return;
        }

        setPreviewSize();

        const headers = Object.keys(data[0]);

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
                .generatorPDF-th { ${PDFDesigner.getStyleString(styleGroups.headerTableStyle)} }
                .generatorPDF-td { ${PDFDesigner.getStyleString(styleGroups.rowTableStyle)} }
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
        function renderTable(styleKey = "headerStyle", tableId = "table_header_style") {
            const tableStyle = styleGroups?.[styleKey];
            if (!Array.isArray(tableStyle?.rows)) return '';

            return `
                <table id="${tableId}" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; table-layout: fixed;">
                    ${tableStyle.rows.map((row, rowIndex) => `
                        <tr>
                            ${row.map((cell, colIndex) => {
                const tag = cell.tag || 'div';
                const content = replacePlaceholders(cell.content || '');
                const colspan = cell.colspan ? `colspan="${cell.colspan}"` : '';
                const rowspan = cell.rowspan ? `rowspan="${cell.rowspan}"` : '';
                const cellId = `${styleKey}_cell_${rowIndex}_${colIndex}`;
                const editableTags = ['span', 'div', 'h1', 'h2', 'h3', 'p'];
                const editable = editableTags.includes(tag.toLowerCase()) ? 'contentEditable="true"' : '';

                const styleObj = { ...(cell.styles || {}) };
                const width = cell.width || styleObj.width;
                const height = cell.height || styleObj.height;

                if (!styleObj["background-color"]) {
                    styleObj["background-color"] = styleGroups.bodyStyle?.["background-color"] || "#ffffff";
                }

                const innerStyle = Object.entries(styleObj).map(([key, value]) => {
                    return `${key}:${value};`;
                }).join(' ');

                const tdStyle = `width:${width}; height:${height}px; border:1px solid #000; position: relative;`;

                return `<td ${colspan} ${rowspan} style="${tdStyle}">
                                    <${tag} id="${cellId}" ${editable}
                                        style="
                                            ${innerStyle}
                                            width: 100%;
                                            height: 100%;
                                            box-sizing: border-box;
                                            display: block;
                                            margin: 0;
                                            white-space: normal;
                                            word-break: break-word;
                                            overflow-wrap: anywhere;
                                        ">
                                        ${content}
                                    </${tag}>
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
<div class="generatorPDF" style="display:flex; flex-direction:column; min-height:100%; box-sizing:border-box;">
    <div class="generatorPDF-content" style="flex:1 1 auto; box-sizing:border-box; padding-bottom:8px;">
        ${renderTable("headerStyle", "table_header_style")}
        
        <table class="generatorPDF-table" id="table_resizeable" 
               style="width:100%; border-collapse:collapse; table-layout:fixed;">
            <thead id="table_header_tableStyle">
                <tr>
                    ${headers.map(header => {
            const customHeader = manager.selectors[`header_${header}`]?.content || header;
            return `<th id="header_${header}" contentEditable="true" class="generatorPDF-th">${customHeader}</th>`;
        }).join('')}
                </tr>
            </thead>
            <tbody id="table_data_body">
                ${data.map(row => `
                    <tr>
                        ${headers.map(header => `
                            <td class="generatorPDF-td">${row[header]}</td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <!-- FOOTER selalu di bawah -->
    <div class="generatorPDF-footer" style="margin-top:auto;">
        ${renderTable("footerStyle", "table_footer_style")}
    </div>
</div>
`;



        previewEl.innerHTML = html;

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

        // 🔽 Table resizable
        const headerTable = document.querySelector("#preview #table_header_style");
        const footerTable = document.querySelector("#preview #table_footer_style");
        if (headerTable) {
            makeTableResizable(headerTable);
        }
        if (footerTable) {
            makeTableResizable(footerTable);
        }

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
        styleGroups.footerStyle.rows.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const tag = cell.tag || 'div';
                const editableTags = ['span', 'div', 'h1', 'h2', 'h3', 'p'];
                if (!editableTags.includes(tag.toLowerCase())) return;

                const el = document.getElementById(`footer_cell_${rowIndex}_${colIndex}`);
                if (el) {
                    el.addEventListener("blur", () => {
                        styleGroups.footerStyle.rows[rowIndex][colIndex].content = el.innerText;
                    });
                }
            });
        });
        injectCellControls("table_header_style");
        injectCellControls("table_footer_style");
        enableDragAndDrop("table_header_style");
        enableDragAndDrop("table_footer_style");
        // console.log(html);
        // makeTableResizable(document.getElementById("table_header_style"));
        // makeTableResizable(document.getElementById("table_footer_style"));
    }


    function enableDragAndDrop(tableId = "table_header_style") {
        const table = document.getElementById(tableId);
        if (!table) return;

        let dragSrcTd = null;

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

            dragHandle.addEventListener("dragstart", function (e) {
                if (PDFDesigner.isResizing) {
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

            dragHandle.addEventListener("dragend", function () {
                if (dragSrcTd) {
                    dragSrcTd.classList.remove("dragging-td");
                    dragSrcTd = null;
                }
            });

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

            td.addEventListener("drop", function (e) {
                if (PDFDesigner.isResizing || !dragSrcTd || dragSrcTd === this) return;

                e.preventDefault();
                e.stopPropagation();
                this.classList.remove("drag-over");

                const targetTd = this;

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

                makeTableResizable(table);
                injectCellControls(tableId);
                enableDragAndDrop(tableId);
            });

            td.addEventListener("mousemove", function (e) {
                const isInEditable = e.target.closest("[contenteditable='true']");
                td.style.cursor = isInEditable ? "text" : "default";
            });

            td.addEventListener("mouseleave", function () {
                td.style.cursor = "default";
            });
        });
    }




    function injectCellControls(tableId = "table_header_style") {
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
                { dir: "↑", title: "Tambah Baris di Atas", action: () => addRow(rowIndex) },
                { dir: "←", title: "Tambah Cell Kiri", action: () => addCell(rowIndex, cellIndex, "left") },
                { dir: "→", title: "Tambah Cell Kanan", action: () => addCell(rowIndex, cellIndex, "right") },
                { dir: "↓", title: "Tambah Baris di Bawah", action: () => addRow(rowIndex + 1) },
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

        const defaultCell = () => ({
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
        });

        const createNewCellElement = () => {
            const td = document.createElement("td");
            td.style.position = "relative";
            td.style.border = "1px solid #000";
            td.style.verticalAlign = "top";

            const div = document.createElement("div");
            div.contentEditable = true;
            div.textContent = "Baru";

            // Ambil default styles dan terapkan ke <div>
            const styles = defaultCell().styles;
            Object.entries(styles).forEach(([key, value]) => {
                div.style.setProperty(key, value);
            });

            td.appendChild(div);
            return td;
        };

        const addCell = (rowIdx, cellIdx, position) => {
            const tr = table.rows[rowIdx];
            if (!tr) return;

            const refCell = tr.cells[cellIdx];
            const newCell = createNewCellElement();

            if (position === "left") tr.insertBefore(newCell, refCell);
            else tr.insertBefore(newCell, refCell.nextSibling);

            const insertIndex = position === "left" ? cellIdx : cellIdx + 1;

            const base = defaultCell(); // Pakai defaultCell() langsung
            const styleKey = table.id === "table_footer_style" ? "footerStyle" : "headerStyle";
            if (!styleGroups[styleKey].rows[rowIdx]) styleGroups[styleKey].rows[rowIdx] = [];
            styleGroups[styleKey].rows[rowIdx].splice(insertIndex, 0, base);

            injectCellControls(tableId);
            enableDragAndDrop(tableId);
            makeTableResizable(table);
        };

        const addRow = (rowIdx) => {
            const table = document.getElementById(tableId);
            if (!table) return;

            const newRow = document.createElement("tr");
            const newCell = createNewCellElement();
            newRow.appendChild(newCell);

            const refRow = table.rows[rowIdx];
            if (refRow) table.tBodies[0].insertBefore(newRow, refRow);
            else table.tBodies[0].appendChild(newRow);

            const newRowData = [defaultCell()];

            if (tableId === "table_header_style") {
                if (!styleGroups.headerStyle?.rows) styleGroups.headerStyle.rows = [];
                styleGroups.headerStyle.rows.splice(rowIdx, 0, newRowData);
            } else if (tableId === "table_footer_style") {
                if (!styleGroups.footerStyle?.rows) styleGroups.footerStyle.rows = [];
                styleGroups.footerStyle.rows.splice(rowIdx, 0, newRowData);
            }

            injectCellControls(tableId);
            enableDragAndDrop(tableId);
            makeTableResizable(table);
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
                    if (styleGroups[styleKey]?.rows?.[trIdx]) {
                        styleGroups[styleKey].rows[trIdx].splice(cellIdx, 1);
                    }
                    injectCellControls(tableId);
                    enableDragAndDrop(tableId);
                    makeTableResizable(table);
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
                addRow(0);
                tr.remove(); // ✅ Hapus tombol saat ditekan
            });

            td.appendChild(btnAddFirst);
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
    }

    function rgbToHex(rgb) {
        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return null;
        const hex = result
            .slice(0, 3)
            .map(x => {
                const hexPart = parseInt(x).toString(16);
                return hexPart.length === 1 ? "0" + hexPart : hexPart;
            })
            .join("");
        return "#" + hex;
    }


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
            toggleStyleInputs('headerStyleCell', false);
            toggleStyleInputs('footerStyleCell', false);
        };

        if (td && (table?.id === "table_header_style" || table?.id === "table_footer_style")) {
            clearSelection();

            td.classList.add("selected-td", "outline-dashed", "outline-2", "outline-blue-500", "bg-blue-100");

            const isHeader = table.id === "table_header_style";
            const styleKey = isHeader ? 'headerStyle' : 'footerStyle';
            const inputGroup = isHeader ? 'headerStyleCell' : 'footerStyleCell';

            toggleStyleInputs(inputGroup, true);

            const rowIndex = td.parentElement.rowIndex;
            const cellIndex = td.cellIndex;

            const cellData = styleGroups[styleKey]?.rows?.[rowIndex]?.[cellIndex];
            const styleObj = cellData?.styles || {};

            document.querySelectorAll(`[data-style-group='${inputGroup}']`).forEach(input => {
                const attr = input.dataset.styleAttr;
                if (!attr) return;
                let value = styleObj[attr] || '';
                if (input.type === "number") {
                    value = parseFloat(value) || '';
                }
                if (attr.indexOf("color") !== -1 && typeof value === 'string' && value.startsWith("rgb")) {
                    value = rgbToHex(value);
                }
                input.value = value;
            });
        }

        // Klik di luar semua table dan panel
        else if (!clickedInsideHeaderTable && !clickedInsideFooterTable && !clickedInsideHeaderPanel && !clickedInsideFooterPanel) {
            clearSelection();
        }
    });

    function toggleStyleInputs(groupName, show) {
        document.querySelectorAll(`[data-style-group='${groupName}']`).forEach(input => {
            input.parentElement.style.display = show ? "block" : "none";
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

    function initStyleCellInputs(group = "headerStyle") {
        const inputs = document.querySelectorAll(`[data-style-group='${group}Cell']`);
        inputs.forEach(input => {
            input.addEventListener("input", (e) => {
                const attr = e.target.dataset.styleAttr;
                const value = e.target.value;
                const selected = document.querySelector("td.selected-td");
                if (!selected) return;

                const rowIndex = selected.parentElement.rowIndex;
                const cellIndex = selected.cellIndex;

                const cell = styleGroups?.[group]?.rows?.[rowIndex]?.[cellIndex];
                if (!cell) return;

                if (!cell.styles) cell.styles = {};

                const pxProps = ["font-size", "padding", "border-width", "width", "height"];
                const styleValue = pxProps.includes(attr) && !value.includes("px") ? `${value}px` : value;

                cell.styles[attr] = styleValue;

                updateSingleCellStyle(rowIndex, cellIndex, group);
            });
        });
    }


    function updateSingleCellStyle(rowIndex, cellIndex, group = "headerStyle") {
        const groupData = styleGroups[group];
        if (!groupData?.rows?.[rowIndex]?.[cellIndex]) return;

        const cellData = groupData.rows[rowIndex][cellIndex];

        const tableId = group === "footerStyle" ? "table_footer_style" : "table_header_style";
        const td = document.querySelector(`#${tableId} tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})`);
        if (!td) return;

        const innerEl = td.querySelector(cellData.tag || "div");
        if (!innerEl) return;

        const styles = cellData.styles || {};
        Object.entries(styles).forEach(([key, val]) => {
            innerEl.style[key] = val;
        });
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
        const updatedHeaderStyle = buildStyleStructureFromDOM("table_header_style");
        const updatedFooterStyle = buildStyleStructureFromDOM("table_footer_style");

        // Ambil header hasil edit yang dinamakan "header_<field>"
        const customHeaders = {};
        for (const key in values) {
            if (key.startsWith("header_")) {
                const field = key.replace("header_", "");
                customHeaders[field] = values[key];
            }
        }

        const params = new URLSearchParams({
            headerTableStyle: encodeURIComponent(JSON.stringify(styleGroups.headerTableStyle || {})),
            rowTableStyle: encodeURIComponent(JSON.stringify(styleGroups.rowTableStyle || {})),
            tableStyle: encodeURIComponent(JSON.stringify(styleGroups.tableStyle || {})),
            bodyStyle: encodeURIComponent(JSON.stringify(styleGroups.bodyStyle || {})),
            headerStyle: encodeURIComponent(JSON.stringify(updatedHeaderStyle)),
            footerStyle: encodeURIComponent(JSON.stringify(updatedFooterStyle)),
            paperSize,
            paperOrientation,
            metaTitle,
            metaAuthor,
            metaSubject,
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
        // console.log("Download URL:", url);

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

    function showCustomAlert(
        message,
        options = { okText: "OK", cancelText: "Cancel", showCancel: true }
    ) {
        return new Promise((resolve) => {
            // inject modal kalau belum ada
            if (!document.getElementById("customAlert")) {
                const modal = document.createElement("div");
                modal.id = "customAlert";
                modal.style.cssText = `
                    display:none; position:fixed; inset:0;
                    background:rgba(0,0,0,0.5); z-index:10000;
                    display:flex; align-items:center; justify-content:center;
                    font-family: 'Inter', sans-serif;
                `;
                modal.innerHTML = `
                    <div style="
                        background:#fff; padding:24px; border-radius:12px;
                        width:320px; max-width:90%;
                        box-shadow:0 8px 20px rgba(0,0,0,0.15);
                        animation:fadeIn 0.2s ease-out;
                    ">
                        <p id="alertMessage"
                            style="margin-bottom:20px; font-size:15px; color:#111; line-height:1.5;">
                        </p>
                        <div id="alertButtons"
                            style="text-align:right; display:flex; justify-content:flex-end; gap:8px;">
                        </div>
                    </div>
                `;

                // animasi fadeIn
                const style = document.createElement("style");
                style.innerHTML = `
                    @keyframes fadeIn {
                        from { opacity:0; transform:scale(0.95); }
                        to { opacity:1; transform:scale(1); }
                    }
                `;
                document.head.appendChild(style);

                document.body.appendChild(modal);
            }

            const modal = document.getElementById("customAlert");
            const msgEl = document.getElementById("alertMessage");
            const btnContainer = document.getElementById("alertButtons");

            msgEl.textContent = message;
            btnContainer.innerHTML = ""; // reset tombol

            // tombol Cancel (jika diizinkan)
            if (options.showCancel) {
                const btnCancel = document.createElement("button");
                btnCancel.textContent = options.cancelText || "Cancel";
                btnCancel.style.cssText = `
                    background:#f3f4f6; border:none; padding:6px 14px;
                    border-radius:6px; font-size:14px; cursor:pointer;
                `;
                btnCancel.onclick = () => {
                    modal.style.display = "none";
                    resolve(false);
                };
                btnContainer.appendChild(btnCancel);
            }

            // tombol OK
            const btnOk = document.createElement("button");
            btnOk.textContent = options.okText || "OK";
            btnOk.style.cssText = `
                background:#2563eb; color:white; border:none;
                padding:6px 14px; border-radius:6px; font-size:14px;
                cursor:pointer;
            `;
            btnOk.onclick = () => {
                modal.style.display = "none";
                resolve(true);
            };
            btnContainer.appendChild(btnOk);

            modal.style.display = "flex";
        });
    }



    // === Utility: Custom Prompt Modern ===
    async function showCustomPrompt(title = "Masukkan nama file", templates = [], defaultValue = "") {
        return new Promise((resolve, reject) => {
            // inject modal kalau belum ada
            if (!document.getElementById("customPrompt")) {
                const modal = document.createElement("div");
                modal.id = "customPrompt";
                modal.style.cssText = `
                    display:none; position:fixed; inset:0;
                    background:rgba(0,0,0,0.5); z-index:9999;
                    display:flex; align-items:center; justify-content:center;
                    font-family: 'Inter', sans-serif;
                `;
                modal.innerHTML = `
                    <div style="
                        background:#fff; padding:24px; border-radius:12px;
                        width:350px; max-width:90%;
                        box-shadow:0 8px 20px rgba(0,0,0,0.15);
                        animation:fadeIn 0.2s ease-out;
                    ">
                        <h3 style="margin-bottom:12px; font-size:16px; font-weight:600; color:#111;">
                            ${title}
                        </h3>
                        <input type="text" id="promptInput" placeholder="Nama file..."
                            style="
                                width:100%; padding:10px 12px; border:1px solid #ddd;
                                border-radius:8px; outline:none;
                                font-size:14px; margin-bottom:8px;
                                transition:border 0.2s;
                            "
                        >
                        <ul id="promptSuggestions"
                            style="
                                max-height:150px; overflow-y:auto;
                                border:1px solid #eee; border-radius:8px;
                                margin:6px 0; padding:0;
                                list-style:none; font-size:14px;
                            ">
                        </ul>
                        <div style="margin-top:16px; text-align:right; display:flex; justify-content:flex-end; gap:8px;">
                            <button id="promptCancel"
                                style="
                                    background:#f3f4f6; border:none; padding:6px 14px;
                                    border-radius:6px; font-size:14px; cursor:pointer;
                                    transition:background 0.2s;
                                "
                            >Cancel</button>
                            <button id="promptOk"
                                style="
                                    background:#2563eb; color:white; border:none;
                                    padding:6px 14px; border-radius:6px; font-size:14px;
                                    cursor:pointer; transition:background 0.2s;
                                "
                            >Simpan</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                // style animasi
                const style = document.createElement("style");
                style.innerHTML = `
                    @keyframes fadeIn {
                        from { opacity:0; transform:scale(0.95); }
                        to { opacity:1; transform:scale(1); }
                    }
                    #promptSuggestions li {
                        padding:8px 12px; cursor:pointer;
                        transition: background 0.2s;
                    }
                    #promptSuggestions li:hover {
                        background:#f9fafb;
                    }
                `;
                document.head.appendChild(style);
            }

            const modal = document.getElementById("customPrompt");
            const input = document.getElementById("promptInput");
            const list = document.getElementById("promptSuggestions");
            const btnOk = document.getElementById("promptOk");
            const btnCancel = document.getElementById("promptCancel");

            modal.style.display = "flex";
            input.value = defaultValue; // ✅ isi default value
            list.innerHTML = "";
            input.focus();
            input.select(); // biar teks langsung terseleksi

            function renderSuggestions(value) {
                list.innerHTML = "";
                if (!value) return;
                const filtered = templates.filter(t => t.toLowerCase().includes(value.toLowerCase()));
                filtered.forEach(t => {
                    const li = document.createElement("li");
                    li.textContent = t.replace(".json", "");
                    li.onclick = () => {
                        input.value = li.textContent;
                        list.innerHTML = "";
                    };
                    list.appendChild(li);
                });
            }

            input.oninput = () => renderSuggestions(input.value);

            btnOk.onclick = () => {
                modal.style.display = "none";
                resolve(input.value.trim());
            };
            btnCancel.onclick = () => {
                modal.style.display = "none";
                reject("dibatalkan");
            };
        });
    }



    // === SAVE TEMPLATE pakai customPrompt ===
    async function saveTemplate() {
        try {
            // ambil daftar template dulu
            const listResponse = await fetch('/public/download2.php?action=get_template_list');
            if (!listResponse.ok) throw new Error('Gagal mengambil daftar template');
            const templates = await listResponse.json();

            // pakai customPrompt
            let filename = await showCustomPrompt("Simpan Template", "Nama file...", templateSelector.value);
            if (filename && filename.endsWith(".json")) {
                filename = filename.replace(".json", "");
            }

            // kalau nama sudah ada → auto tambah (1), (2), ...
            if (filename) {
                let newName = filename;
                let counter = 1;
                while (templates.includes(newName + ".json")) {
                    newName = `${filename}(${counter})`;
                    counter++;
                }
                filename = newName;
            }

            const params = buildPDFParams({ action: 'save_template_PDF' });
            if (filename) params.append("filename", filename);

            const url = `/public/download2.php?${params.toString()}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Gagal menyimpan template');

            const result = await response.text();
            showCustomAlert(`Template berhasil disimpan sebagai: ${filename || "default"}`, { showCancel: false });
            // console.log(result);

            // refresh dropdown + pilih otomatis
            await fetchTemplateList();
            if (filename) {
                const selector = document.getElementById("report_generator_templateSelector");
                selector.value = filename + ".json";
                loadTemplate(selector.value);
            }

        } catch (error) {
            console.error('Save template error:', error);
        }
    }


    // Save As Template (duplikasi kalau nama sudah ada)
    async function saveAsTemplate() {
        try {
            const listResponse = await fetch('/public/download2.php?action=get_template_list');
            if (!listResponse.ok) throw new Error('Gagal mengambil daftar template');
            const templates = await listResponse.json();

            let filename = await showCustomPrompt("Simpan Template Baru", templates, templateSelector.value);
            if (!filename) return;

            // pastikan tanpa ekstensi .json
            if (filename.endsWith(".json")) {
                filename = filename.replace(".json", "");
            }

            // jika nama sudah ada, minta konfirmasi overwrite
            if (templates.includes(filename + ".json")) {
                const overwrite = await showCustomAlert(
                    `Template dengan nama "${filename}" sudah ada.\nApakah Anda ingin menggantinya?`,
                    { okText: "Ya, Ganti", cancelText: "Batal", showCancel: true }
                );
                if (!overwrite) return; // batal overwrite
            }

            const params = buildPDFParams({ action: 'save_template_PDF' });
            params.append("filename", filename);

            const url = `/public/download2.php?${params.toString()}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Gagal menyimpan template');

            await showCustomAlert(`Template berhasil disimpan sebagai: ${filename}`,);

            await fetchTemplateList(); { showCancel: false }

            // set selector ke nama baru
            const selector = document.getElementById("report_generator_templateSelector");
            selector.value = filename + ".json";
            loadTemplate(selector.value);

        } catch (e) {
            console.error("Save As Template Error:", e);
            await showCustomAlert("Terjadi kesalahan saat menyimpan template.", { showCancel: false });
        }
    }





    async function loadTemplate(filename) {
        try {
            const response = await fetch(`/public/download2.php?action=load_template&filename=${encodeURIComponent(filename)}`);
            if (!response.ok) throw new Error('Gagal memuat template');

            const template = await response.json();
            // console.log("template", template);
            if (!template) throw new Error('Template kosong');

            // Set selector values
            if (PDFDesigner && PDFDesigner.updateSelectorValues) {
                PDFDesigner.updateSelectorValues({
                    paperSize: template.paperSize || 'A4',
                    paperOrientation: template.paperOrientation || 'portrait',
                    metaTitle: template.metaTitle || '',
                    metaAuthor: template.metaAuthor || '',
                    metaSubject: template.metaSubject || '',
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

            // Update styleGroups
            styleGroups.headerTableStyle = template.headerTableStyle || {};
            styleGroups.rowTableStyle = template.rowTableStyle || {};
            styleGroups.tableStyle = template.tableStyle || {};
            styleGroups.columnWidths = template.columnWidths || [];
            styleGroups.bodyStyle = template.bodyStyle || [];
            styleGroups.headerStyle = template.headerStyle || [];
            styleGroups.footerStyle = template.footerStyle || [];

            // Preview otomatis
            generatePreview();
            // console.log('Template berhasil dimuat');
            // console.log(styleGroups.headerStyle);
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
            // console.log("TEMPLATES : " + templates);
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

    async function editTemplate() {
        const selectedValue = templateSelector.value;

        if (!selectedValue) {
            showCustomAlert("Silakan pilih template yang ingin diedit.", { showCancel: false });
            return;
        }

        // Ambil daftar template dulu (supaya jadi array untuk showCustomPrompt)
        let templates = [];
        try {
            const response = await fetch('/public/download2.php?action=get_template_list');
            if (response.ok) {
                templates = await response.json();
            }
        } catch (e) {
            console.warn("Gagal load template list untuk prompt:", e);
        }

        // Panggil prompt dengan array templates
        showCustomPrompt(
            `Masukkan nama baru untuk template "${selectedValue}":`,
            templates,
            templateSelector.value
        ).then(async (newName) => {
            if (!newName || newName.trim() === "" || newName === selectedValue) {
                return; // batal rename
            }

            try {
                const response = await fetch(`/public/download2.php?action=edit_template`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        oldName: selectedValue,
                        newName: newName.trim()
                    })
                });

                const result = await response.json();

                if (result.success) {
                    showCustomAlert(`Template berhasil diubah menjadi "${newName}".`);
                    fetchTemplateList(); // refresh daftar template
                } else {
                    showCustomAlert(result.error || "Gagal mengubah nama template.");
                }
            } catch (error) {
                console.error("Edit Template Error:", error);
                showCustomAlert("Terjadi kesalahan saat mengubah nama template.");
            }
        }).catch(() => {
            console.log("Rename dibatalkan");
        });
    }



    async function deleteTemplate() {
        const selectedValue = templateSelector.value;

        if (!selectedValue) {
            showCustomAlert("Silakan pilih template yang ingin dihapus.", { showCancel: false });
            return;
        }

        const confirmDelete = await showCustomAlert(
            `Apakah Anda yakin ingin menghapus template "${selectedValue}"?`,
            { okText: "OK", cancelText: "Cancel", showCancel: true }
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(`/public/download2.php?action=delete_template&filename=${encodeURIComponent(selectedValue)}`);
            const result = await response.json();

            if (result.success) {
                await showCustomAlert(`Template "${selectedValue}" berhasil dihapus.`, { showCancel: false });
                // refresh daftar template
                await fetchTemplateList();
                // reload halaman
                location.reload();
            } else {
                await showCustomAlert(result.error || "Gagal menghapus template.", { showCancel: false });
            }
        } catch (error) {
            console.error("Delete Template Error:", error);
            await showCustomAlert("Terjadi kesalahan saat menghapus template.", { showCancel: false });
        }
    }



    async function generatePreview() {
        const params = buildPDFParams();
        const url = `/public/download2.php?${params.toString()}&action=get_data`;

        const response = await fetch(url);
        const result = await response.json();

        if (!result.success || result.data.length === 0) {
            document.getElementById("preview").innerHTML = '<p class="text-red-600">Tidak ada data dari database.</p>';
            return;
        }

        // ambil hanya 5 data pertama
        cachedData = result.data.slice(0, 5);
        renderPreview(cachedData);
    }


    function makeTableResizable(table) {
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

                // Temukan index kolom dalam satu row
                const colIndex = Array.from(col.parentElement.children).indexOf(col);

                // Ubah semua baris di kolom yang sama
                table.querySelectorAll("tr").forEach((row) => {
                    const cell = row.children[colIndex];
                    if (cell) {
                        cell.style.width = `${newWidthPercent}%`;
                    }
                });

                // Mapping ke styleGroups berdasarkan table.id
                const groupMap = {
                    table_header_style: "headerStyle",
                    table_footer_style: "footerStyle",
                };
                const groupKey = groupMap[table.id];

                if (groupKey && styleGroups[groupKey]?.rows) {
                    const cellIndex = Array.from(cols).indexOf(col);
                    let rowIndex = 0, colIdx = 0, counter = 0;
                    outer: for (let i = 0; i < styleGroups[groupKey].rows.length; i++) {
                        for (let j = 0; j < styleGroups[groupKey].rows[i].length; j++) {
                            if (counter === cellIndex) {
                                rowIndex = i;
                                colIdx = j;
                                break outer;
                            }
                            counter++;
                        }
                    }
                    const cell = styleGroups[groupKey].rows?.[rowIndex]?.[colIdx];
                    if (cell) {
                        cell.width = `${newWidthPercent.toFixed(2)}%`;
                    }
                } else {
                    if (!styleGroups.columnWidths) styleGroups.columnWidths = [];
                    styleGroups.columnWidths[colIndex] = `${newWidthPercent.toFixed(2)}%`;
                }
            }

            function onMouseUpWidth() {
                PDFDesigner.isResizing = false;
                document.removeEventListener("mousemove", onMouseMoveWidth);
                document.removeEventListener("mouseup", onMouseUpWidth);
            }

            // Resize height hanya untuk header
            if (isCell) {
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

                    col.style.height = `${newHeightPx}px`;

                    // Deteksi tipe (header/footer)
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
                }


                function onMouseUpHeight() {
                    PDFDesigner.isResizing = false;
                    document.removeEventListener("mousemove", onMouseMoveHeight);
                    document.removeEventListener("mouseup", onMouseUpHeight);
                }
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

        previewElement.style.overflow = `hidden`;
        previewElement.style.width = `${width}mm`;
        previewElement.style.height = `${height}mm`;
        previewElement.style.border = '1px solid #ccc';
        previewElement.style.backgroundColor = styleGroups.bodyStyle['background-color'];
    }

    function applyZoom() {
        preview.style.transformOrigin = "top center";
        preview.style.transform = `scale(${zoomLevel / 100})`;
        zoomLabel.textContent = `${zoomLevel.toFixed(1)}%`;
        zoomSlider.value = zoomLevel;
    }


    selectorVars.paperSize.addEventListener("change", toggleCustomInputs);
    toggleCustomInputs();
    selectorVars.paperSize.addEventListener("change", setPreviewSize);
    selectorVars.paperOrientation.addEventListener("change", setPreviewSize);
    document.querySelectorAll('[data-style-group]').forEach(input => {
        input.addEventListener('input', handleInputChange);
        input.addEventListener('change', handleInputChange);
    });

    function handleInputChange() {
        // Coba cari di header dulu, jika tidak ada baru ke footer
        let selected = document.querySelector("#table_header_style td.selected-td");
        let section = "header"; // default
        if (!selected) {
            selected = document.querySelector("#table_footer_style td.selected-td");
            if (selected) section = "footer";
        }

        let rowIndex = -1;
        let cellIndex = -1;

        if (selected) {
            rowIndex = selected.parentElement.rowIndex;
            cellIndex = selected.cellIndex;
        }

        updateStyleGroupsFromInputs();
        renderPreview(cachedData);

        // Coba kembalikan class selected-td
        if (rowIndex !== -1 && cellIndex !== -1) {
            const selector =
                section === "header"
                    ? `#table_header_style tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})`
                    : `#table_footer_style tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})`;

            const restoredCell = document.querySelector(selector);
            if (restoredCell) {
                restoredCell.classList.add("selected-td", "outline-dashed", "outline-2", "outline-blue-500", "bg-blue-100");
            }

            // Panggil ulang update tampilan cell individual jika perlu
            if (section === "header") {
                updateSingleCellStyle(rowIndex, cellIndex);
            } else {
                updateSingleCellStyle(rowIndex, cellIndex);
            }
        }

        initStyleCellInputs(section); // pastikan fungsi ini menangani 'header' atau 'footer'
    }



    updateStyleGroupsFromInputs();
    generatePreview();

    document.addEventListener("click", function (e) {
        // Hapus semua popover jika klik bukan pada tombol tambah atau popover itu sendiri
        const allPopovers = document.querySelectorAll(".add-popover");
        const isAddButton = e.target.closest(".cell-control-add");
        const isInsidePopover = e.target.closest(".add-popover");

        if (!isAddButton && !isInsidePopover) {
            allPopovers.forEach(p => p.remove());
        }
    });


    downloadButton.addEventListener('click', () => {
        // const values = PDFDesigner.getSelectorValues();
        // console.log("Data dikirim ke backend:", values);
        // const params = new URLSearchParams(values).toString();
        // PDFDesigner.open(`public/download2.php?type=pdf&${params}`, "_blank");
        downloadPDF();
    });

    deleteTemplateButton.addEventListener("click", deleteTemplate);

    templateSelector.addEventListener('change', () => {
        const selectedValue = templateSelector.value;

        if (!selectedValue) {
            return; // kalau pilih default "Pilih Template"
        }

        // console.log('Template yang dipilih:', selectedValue);

        // Auto load template
        loadTemplate(selectedValue);
    });

    zoomInBtn.addEventListener("click", () => {
        zoomLevel = Math.min(zoomLevel + 5, parseFloat(zoomSlider.max));
        applyZoom();
    });

    zoomOutBtn.addEventListener("click", () => {
        zoomLevel = Math.max(zoomLevel - 5, parseFloat(zoomSlider.min));
        applyZoom();
    });

    zoomSlider.addEventListener("input", () => {
        zoomLevel = parseFloat(zoomSlider.value);
        applyZoom();
    });

    preview.addEventListener("wheel", (event) => {
        if (event.ctrlKey) {  
            event.preventDefault(); // cegah zoom bawaan browser
    
            let currentZoom = parseFloat(zoomSlider.value);
    
            if (event.deltaY < 0) {
                // Scroll up → zoom in
                currentZoom = Math.min(currentZoom + 2, parseFloat(zoomSlider.max));
            } else {
                // Scroll down → zoom out
                currentZoom = Math.max(currentZoom - 2, parseFloat(zoomSlider.min));
            }
    
            // Update slider & label
            zoomSlider.value = currentZoom;
            zoomLabel.textContent = `${currentZoom}%`;
    
            // Terapkan zoom ke canvas/preview
            preview.style.transform = `scale(${currentZoom / 100})`;
            preview.style.transformOrigin = "top center";
        }
    }, { passive: false }); // supaya preventDefault bisa jalan
    
    applyZoom();


    editTemplateButton.addEventListener('click', editTemplate);
    saveTemplateButton.addEventListener('click', saveTemplate);
    saveAsTemplateButton.addEventListener("click", saveAsTemplate);
});
