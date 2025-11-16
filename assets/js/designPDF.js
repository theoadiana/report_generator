import { SelectorManager } from "./modules/selectorManager.js";
import { ZoomManager } from "./modules/zoomManager.js";
import { DialogManager } from "./modules/dialogManager.js";
import { DownloadManager } from "./modules/downloadManager.js";
import { TemplateManager } from "./modules/templateManager.js";
import { StyleManager } from "./modules/styleManager.js";
import { PreviewManager } from "./modules/previewManager.js";
import { TableEditor } from "./modules/tableEditor.js";
import { EventManager } from "./modules/eventManager.js";
import { UtilityManager } from "./modules/utilityManager.js";

document.addEventListener("DOMContentLoaded", () => {
    const manager = new SelectorManager();
    const styleManager = new StyleManager();
    const styleGroups = styleManager.getStyleGroups();
    const previewManager = new PreviewManager(styleManager, manager);
    const utilityManager = new UtilityManager(styleManager, manager);
    const downloadButton = document.getElementById("report_generator_download");
    const zoomManager = new ZoomManager('previewFooter', 'preview');
    const dialogManager = new DialogManager();
    const saveTemplateButton = document.getElementById("report_generator_saveTemplatePDF");
    const saveAsTemplateButton = document.getElementById("report_generator_saveAsTemplatePDF");
    const deleteTemplateButton = document.getElementById("report_generator_deleteTemplatePDF");
    const editTemplateButton = document.getElementById("report_generator_editTemplatePDF");
    const templateSelector = document.getElementById('report_generator_templateSelector');
    const queryExecuteButton = document.getElementById("report_generator_queryExecute");
    const preview = document.getElementById("preview");

    let cachedData = [];
    previewManager.toggleStyleInputs('headerStyleCell', false);
    previewManager.toggleStyleInputs('footerStyleCell', false);
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
            return styleManager.getStyleString(styleObj);
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

    const tableEditor = new TableEditor(styleManager, PDFDesigner);
    const eventManager = new EventManager(styleManager, previewManager, tableEditor, manager, styleGroups);

    eventManager.setupContentEditableListeners();
    eventManager.setupCellSelectionListeners();
    eventManager.setupStyleInputListeners();
    eventManager.setupPopoverCleanup();
    eventManager.setupHeaderFooterDisplayListeners(styleGroups, () => {
        if (cachedData && cachedData.length > 0) {
            renderPreview(cachedData);
        }
    });

    queryExecuteButton.addEventListener('click', () => {
        const query = document.getElementById('manualQueryInput').value;

        if (query.trim() === '') {
            alert('Query cannot be empty.');
            return;
        }

        console.log('Data sent to the backend:', { query: query });

        fetch('src/download.php', {
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
                    utilityManager.updateStyleGroupsFromInputs(styleGroups);
                    generatePreview(); // Fetch data baru
                } else {
                    alert('Error: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while sending the query: ' + error.message);
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
    const downloadManager = new DownloadManager(buildPDFParams);
    const templateManager = new TemplateManager(manager, styleGroups, dialogManager);

    eventManager.setupPaperSizeListeners(selectorVars, preview);

    eventManager.setInputChangeCallback((rowIndex, cellIndex, section) => {
        utilityManager.updateStyleGroupsFromInputs(styleGroups);
        renderPreview(cachedData);

        if (rowIndex !== -1 && cellIndex !== -1) {
            const selector = section === "header"
                ? `#table_header_style tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})`
                : `#table_footer_style tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})`;

            const restoredCell = document.querySelector(selector);
            if (restoredCell) {
                restoredCell.classList.add("selected-td", "outline-dashed", "outline-2", "outline-blue-500", "bg-blue-100");
            }

            if (section === "header") {
                previewManager.updateSingleCellStyle(rowIndex, cellIndex);
            } else {
                previewManager.updateSingleCellStyle(rowIndex, cellIndex);
            }
        }

        utilityManager.initStyleCellInputs(styleGroups, previewManager, section);
    });

    (async () => {
        try {
            const data = await fetch("src/download.php?action=get_data").then(res => res.json());
            const columnCount = Object.keys(data[0]).length;
            const percentage = (100 / columnCount).toFixed(2) + "%";

            styleGroups.columnWidths = Array.from({ length: columnCount }, () => percentage);

            console.log("Column widths set (percent-based):", styleGroups.columnWidths);
        } catch (error) {
            console.error("Failed to fetch data for columnWidths:", error);
        }
    })();

    function renderPreview(data) {
        if (!data || data.length === 0) {
            preview.innerHTML = '<p class="text-red-600">No data from the database.</p>';
            return;
        }

        // Atur ukuran preview terlebih dahulu (fungsi Anda tetap dipanggil)
        previewManager.setPreviewSize(preview, selectorVars);

        const headers = Object.keys(data[0]);

        // Placeholder otomatis
        const currentDate = new Date().toISOString().split("T")[0];
        const placeholderValues = {
            "{{current_date}}": currentDate,
            "{{nama_perusahaan}}": "Perusahaan Tambang",
            "{{logo_url}}": "https://via.placeholder.com/100x50?text=Logo"
        };

        const replacePlaceholders = (str) => previewManager.replacePlaceholders(str);

        const parseLengthToMm = (val, fallbackMm) => previewManager.parseLengthToMm(val, fallbackMm);

        const styleTag = `
            <style>
                .generatorPDF { ${styleManager.getStyleString(styleGroups.bodyStyle)} }
                .generatorPDF-table { ${styleManager.getStyleString(styleGroups.tableStyle)} }
                .generatorPDF-th { ${styleManager.getStyleString(styleGroups.headerTableStyle)} }
                .generatorPDF-td { ${styleManager.getStyleString(styleGroups.rowTableStyle)} }
                .resizable-wrapper {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    z-index: 1;
                    pointer-events: auto;
                }
                /* Style untuk header/footer yang dinonaktifkan */
                /* Efek untuk header dan footer yang dinonaktifkan */
                .header-disabled, .footer-disabled {
                    opacity: 0.4 !important;
                    filter: grayscale(80%) !important;
                    background: repeating-linear-gradient(
                        45deg,
                        rgba(0,0,0,0.02),
                        rgba(0,0,0,0.02) 5px,
                        rgba(220,38,38,0.05) 5px,
                        rgba(220,38,38,0.05) 10px
                    ) !important;
                    border: 2px dashed #dc2626 !important;
                    pointer-events: none !important;
                    position: relative;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }

                .header-disabled::before, .footer-disabled::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(220, 38, 38, 0.03);
                    z-index: 1;
                }

                .disabled-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    color: white;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: bold;
                    z-index: 100;
                    white-space: nowrap;
                    pointer-events: none;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                /* Pastikan generatorPDF menjadi konteks relatif untuk positioning absolute footer */
                .generatorPDF { position: relative; box-sizing: border-box;}
            </style>
        `;

        // renderTable dengan penambahan class disabled
        function renderTable(styleKey = "headerStyle", tableId = "table_header_style") {
            const tableStyle = styleGroups?.[styleKey];
            if (!Array.isArray(tableStyle?.rows)) return '';

            const isHeader = styleKey === "headerStyle";
            const isDisabled = isHeader
                ? styleGroups.headerDisplayRule === "none"
                : styleGroups.footerDisplayRule === "none";

            const disabledClass = isHeader ? "header-disabled" : "footer-disabled";
            const disabledText = isHeader ? "HEADER DISABLED" : "FOOTER DISABLED";

            return `
                <table id="${tableId}" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; table-layout: fixed; ${isDisabled ? 'position: relative;' : ''}">
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
                const width = cell.width || styleObj.width || '100%';
                const height = cell.height || styleObj.height || '';

                if (!styleObj["background-color"]) {
                    styleObj["background-color"] = styleGroups.bodyStyle?.["background-color"] || "#ffffff";
                }

                const innerStyle = Object.entries(styleObj).map(([key, value]) => `${key}:${value};`).join(' ');
                const tdStyle = `${width ? `width:${width};` : ''} ${height ? `height:${height}px;` : ''} border:1px solid #000; position: relative;`;

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
                    ${isDisabled ? `
                        <div class="disabled-overlay">${disabledText}</div>
                    ` : ''}
                </table>
                ${isDisabled ? `
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(220, 38, 38, 0.9); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; z-index: 100; pointer-events: none;">
                        ${disabledText}
                    </div>
                ` : ''}
            `;
        }

        // Siapkan header & rows HTML agar tidak ada nested template complexity
        const headersHtml = headers.map(header => {
            const customHeader = (manager && manager.selectors && manager.selectors[`header_${header}`] && manager.selectors[`header_${header}`].content) || header;
            return `<th id="header_${header}" contentEditable="true" class="generatorPDF-th">${customHeader}</th>`;
        }).join('');

        const rowsHtml = data.map(row => {
            return `<tr>${headers.map(h => `<td class="generatorPDF-td">${row[h]}</td>`).join('')}</tr>`;
        }).join('');

        // Tentukan class untuk header dan footer berdasarkan display rule
        const headerClass = styleGroups.headerDisplayRule === "none" ? "header-disabled" : "";
        const footerClass = styleGroups.footerDisplayRule === "none" ? "footer-disabled" : "";

        // HTML akhir
        let html = `
            ${styleTag}
            <div class="generatorPDF">
                <div id="header-container" class="${headerClass}" style="position: relative;">
                    ${renderTable("headerStyle", "table_header_style")}
                </div>
                
                <table class="generatorPDF-table" id="table_resizeable">
                    <thead id="table_header_tableStyle">
                        <tr>${headersHtml}</tr>
                    </thead>
                    <tbody id="table_data_body">
                        ${rowsHtml}
                    </tbody>
                </table>
    
                <!-- footer -->
                <div id="preview_footer_wrapper" class="${footerClass}" style="position: relative;">
                    ${renderTable("footerStyle", "table_footer_style")}
                </div>
            </div>
        `;

        preview.innerHTML = html;

        // Hitung margin top & bottom dalam mm → convert ke mm (langsung pakai mm biar konsisten)
        const rawMt = (styleGroups.bodyStyle && (styleGroups.bodyStyle["margin-top"] || styleGroups.bodyStyle["margin"])) || "0mm";
        const rawMb = (styleGroups.bodyStyle && (styleGroups.bodyStyle["margin-bottom"] || styleGroups.bodyStyle["margin"])) || "0mm";

        const mtMm = parseLengthToMm(rawMt, 0);
        const mbMm = parseLengthToMm(rawMb, 0);

        const container = preview.querySelector(".generatorPDF");
        if (container) {
            // Gunakan padding agar lebih natural, bukan height manipulasi
            container.style.marginTop = "0";    // nolkan margin agar tidak dobel
            container.style.marginBottom = "0"; // cegah margin native menambah tinggi
            container.style.paddingTop = `${mtMm}mm`;
            container.style.paddingBottom = `${mbMm}mm`;

            // biarkan height normal mengikuti isi
            container.style.height = "100.85%";
            container.style.boxSizing = "border-box";
        }

        // Wait for layout to settle, kemudian posisikan footer secara presisi
        requestAnimationFrame(() => {
            const container = preview.querySelector('.generatorPDF') || preview;
            if (!container) return;

            const headerTable = container.querySelector("#table_header_style") || container.querySelector(".generatorPDF-table");
            const footerWrapper = container.querySelector("#preview_footer_wrapper");
            const footerTable = container.querySelector("#table_footer_style");

            const rawMb = (styleGroups.bodyStyle && (styleGroups.bodyStyle["margin-bottom"] || styleGroups.bodyStyle["margin"])) || "20mm";
            const marginBottomMm = parseLengthToMm(rawMb, 0);

            if (footerWrapper && footerTable) {
                footerWrapper.style.position = "absolute";
                footerWrapper.style.bottom = `${marginBottomMm}mm`;

                if (headerTable) {
                    // atur wrapper agar sama posisi dengan header
                    // footerWrapper.style.left = `${leftPx}px`;
                    // footerWrapper.style.width = `${widthPx}px`;
                } else {
                    footerWrapper.style.left = "0";
                    footerWrapper.style.right = "0";
                    footerWrapper.style.width = "auto";
                    footerTable.style.width = "100%";
                }
            }

            // Tambahkan overlay text untuk header dan footer yang disabled
            if (styleGroups.headerDisplayRule === "none") {
                const headerContainer = container.querySelector("#header-container");
                if (headerContainer) {
                    const overlay = document.createElement("div");
                    overlay.className = "disabled-overlay";
                    overlay.textContent = "HEADER DISABLED";
                    overlay.style.position = "absolute";
                    overlay.style.top = "50%";
                    overlay.style.left = "50%";
                    overlay.style.transform = "translate(-50%, -50%)";
                    overlay.style.zIndex = "100";
                    headerContainer.appendChild(overlay);
                }
            }

            if (styleGroups.footerDisplayRule === "none") {
                const footerContainer = container.querySelector("#preview_footer_wrapper");
                if (footerContainer) {
                    const overlay = document.createElement("div");
                    overlay.className = "disabled-overlay";
                    overlay.textContent = "FOOTER DISABLED";
                    overlay.style.position = "absolute";
                    overlay.style.top = "50%";
                    overlay.style.left = "50%";
                    overlay.style.transform = "translate(-50%, -50%)";
                    overlay.style.zIndex = "100";
                    footerContainer.appendChild(overlay);
                }
            }
        });

        // === event listeners ===
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

        tableEditor.initializeTable("table_resizeable", styleGroups, previewManager);
        tableEditor.initializeTable("table_header_style", styleGroups);
        tableEditor.initializeTable("table_footer_style", styleGroups);
    }

    // Tombol tambah selector
    const addSelectorBtn = document.getElementById("addSelectorBtn");
    addSelectorBtn.addEventListener("click", () => {
        const newId = document.getElementById("newSelectorId").value;

        if (newId && !manager.selectors[newId]) {
            manager.register(newId);
            alert(`Selector with ID "${newId}" has been successfully added!`);
            utilityManager.updateSelectorTable(manager);
            utilityManager.updateHTMLPreview(manager);
        } else if (manager.selectors[newId]) {
            alert(`Failed to add. ID "${newId}" is already registered.`);
        } else {
            alert("The ID selector cannot be empty.");
        }

        document.getElementById("newSelectorId").value = "";
    });

    // ✅ Fungsi ini bisa kamu panggil untuk keperluan seperti generatePreview()
    PDFDesigner.getSelectorValues = () => manager.getAllValuesAsObject();

    utilityManager.updateSelectorTable(manager);
    utilityManager.updateHTMLPreview(manager);

    PDFDesigner.selectorManager = manager;

    function buildPDFParams(extraParams = {}) {
        const values = PDFDesigner.getSelectorValues();
        const getValue = selection => selection?.value || '';
        const paperSize = getValue(selectorVars.paperSize);
        const paperOrientation = getValue(selectorVars.paperOrientation);
        const metaTitle = getValue(selectorVars.metaTitle);
        const metaAuthor = getValue(selectorVars.metaAuthor);
        const metaSubject = getValue(selectorVars.metaSubject);
        const updatedHeaderStyle = utilityManager.buildStyleStructureFromDOM("table_header_style");
        const updatedFooterStyle = utilityManager.buildStyleStructureFromDOM("table_footer_style");

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
            headerDisplayRule: styleGroups.headerDisplayRule || "every-page",
            footerDisplayRule: styleGroups.footerDisplayRule || "every-page",
            pageNumberPosition: styleGroups.pageNumberPosition || "none",
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

    templateManager.fetchTemplateList();

    async function generatePreview() {
        const params = buildPDFParams();
        const url = `/src/download.php?${params.toString()}&action=get_data`;

        const response = await fetch(url);
        const result = await response.json();

        if (!result.success || result.data.length === 0) {
            preview.innerHTML = '<p class="text-red-600">No data from the database..</p>';
            return;
        }

        // ambil hanya 5 data pertama
        cachedData = result.data.slice(0, 5);
        previewManager.setCachedData(cachedData);
        renderPreview(cachedData);
    }

    previewManager.toggleCustomInputs();

    utilityManager.updateStyleGroupsFromInputs(styleGroups);
    generatePreview();
    utilityManager.enableHeaderFooterRulesControls(styleGroups, cachedData, renderPreview);

    downloadButton.addEventListener('click', async () => {
        const selectedOption = await dialogManager.showDownloadOptions();

        if (selectedOption) {
            try {
                await downloadManager.download(selectedOption);
            } catch (error) {
                console.error('Download failed:', error);
                await dialogManager.showCustomAlert(
                    `Download error: ${error.message}`,
                    { showCancel: false }
                );
            }
        }
    });

    saveTemplateButton.addEventListener('click', () => {
        templateManager.saveTemplate(buildPDFParams);
    });

    saveAsTemplateButton.addEventListener('click', () => {
        templateManager.saveAsTemplate(buildPDFParams);
    });

    editTemplateButton.addEventListener('click', () => {
        templateManager.editTemplate();
    });

    deleteTemplateButton.addEventListener('click', () => {
        templateManager.deleteTemplate();
    });

    templateSelector.addEventListener('change', () => {
        const selectedValue = templateSelector.value;
        if (selectedValue) {
            templateManager.loadTemplate(
                selectedValue,
                PDFDesigner,
                (template) => styleManager.updateFormInputsFromTemplate(template),
                () => previewManager.setPreviewSize(preview, selectorVars),
                generatePreview
            );
        }
    });
});
