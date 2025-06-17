import { SelectorManager } from "./selectorManager.js";

document.addEventListener("DOMContentLoaded", () => {
    const manager = new SelectorManager();
    const previewButton = document.getElementById("report_generator_previewPDF");

    // Registrasi default
    [
        "paperSize",
        "paperOrientation",
        "metaTitle",
        "metaAuthor",
        "metaSubject",
        "customWidth",
        "customHeight",
        "report_generator_downloadPDF",
        "title",
        "titleStyle",
        "headerStyle",
        "headerColor",
        "rowStyle",
        "rowColor",
        "footer",
        "footerStyle",
    ].forEach((id) => manager.register(id));

    const selectorVars = manager.generateSelectorVariables();

    const styleGroups = {
        titleStyle: {
            'font-size': '24px',
            'font-weight': 'bold',
            'color': '#000000',
            'text-align': 'center',
            'background-color': '#ffffff',
            'border': 'none',
            'padding': '10px',
            'margin': '10px',
        },
        headerStyle: {
            'font-size': '14px',
            'font-weight': 'bold',
            'color': '#000000',
            'text-align': 'center',
            'background-color': '#ffffff',
            'border': '1px solid #000000',
            'padding': '8px',
        },
        rowStyle: {
            'font-size': '12px',
            'font-weight': 'normal',
            'color': '#000000',
            'text-align': 'left',
            'background-color': '#f9f9f9',
            'border': '1px solid #000000',
            'padding': '6px',
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
        },
        columnWidths: []
    };

    (async () => {
        try {
            const data = await fetch("public/download2.php?action=get_data").then(res => res.json());
            
            const columnCount = Object.keys(data[0]).length;
            const percentage = (100 / columnCount).toFixed(2) + "%";
    
            styleGroups.columnWidths = Array.from({ length: columnCount }, () => percentage);
    
            console.log("Column widths set (percent-based):", styleGroups.columnWidths);
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
    window.getSelectorValues = () => manager.getAllValuesAsObject();

    updateSelectorTable();
    updateHTMLPreview();

    window.selectorManager = manager;

    // Fungsi Download PDF
    function downloadPDF() {

        // Helper function untuk ambil value dari input/select
        const getValue = selection => selection?.value || '';
    
        // Ambil data umum
        const title = getValue(selectorVars.title);
        const headerColor = getValue(selectorVars.headerColor);
        const paperSize = getValue(selectorVars.paperSize);
        const paperOrientation = getValue(selectorVars.paperOrientation);
        const metaTitle = getValue(selectorVars.metaTitle);
        const metaAuthor = getValue(selectorVars.metaAuthor);
        const metaSubject = getValue(selectorVars.metaSubject);
        const footer = getValue(selectorVars.footer);
    
        // Serialisasi styleGroups agar bisa dikirim via GET
        const titleStyle = encodeURIComponent(JSON.stringify(styleGroups.titleStyle || {}));
        const headerStyle = encodeURIComponent(JSON.stringify(styleGroups.headerStyle || {}));
        const rowStyle = encodeURIComponent(JSON.stringify(styleGroups.rowStyle || {}));
        const tableStyle = encodeURIComponent(JSON.stringify(styleGroups.tableStyle || {}));
        const columnWidths = encodeURIComponent(JSON.stringify(styleGroups.columnWidths));
    
        // Bangun parameter URL
        const params = new URLSearchParams({
            type: 'pdf',
            title,
            titleStyle,
            headerStyle,
            rowStyle,
            tableStyle,
            headerColor,
            paperSize,
            paperOrientation,
            metaTitle,
            metaAuthor,
            metaSubject,
            footer,
            columnWidths,
        });
    
        // Jika ukuran kertas custom, tambahkan dimensi manual
        if (paperSize === "custom") {
            const width = getValue(selectorVars.customWidth) || '210';
            const height = getValue(selectorVars.customHeight) || '297';
            params.append('customWidth', width);
            params.append('customHeight', height);
        }
    
        // Bangun URL akhir
        const url = `/public/download2.php?${params.toString()}`;
        console.log("Download URL:", url);
    
        // Fetch dan proses hasilnya sebagai file PDF
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
    

    async function generatePreview() {
        const data = await fetch("public/download2.php?action=get_data").then(res => res.json());

        const previewEl = document.getElementById("preview");
        if (!data || data.length === 0) {
            previewEl.innerHTML = '<p class="text-red-600">Tidak ada data dari database.</p>';
            return;
        }

        const values = window.getSelectorValues(); // objek dinamis
        const headers = Object.keys(data[0]);

        // Mulai bangun HTML
        let html = `
        <html>
            <head>
                <meta name="title" content="${values.metaTitle || ''}">
                <meta name="author" content="${values.metaAuthor || ''}">
                <meta name="subject" content="${values.metaSubject || ''}">
                <style>
                    .generatorPDF {
                        margin: 0;
                        padding: 20px;
                        box-sizing: border-box;
                        font-family: Arial, sans-serif;
                    }
                    .generatorPDF-table {
                        width: 100%;
                        table-layout: fixed;
                        word-wrap: break-word;
                    }
                    .generatorPDF-th,
                    .generatorPDF-td {
                        max-width: 100%;
                        border: 1px solid #000;
                        padding: 8px;
                    }
                </style>
            </head>
            <body>
                <div class="generatorPDF">
                    <h1 id="title"style="${getStyleString(styleGroups.titleStyle)}" contentEditable=true>${values.title}</h1>
                    <table class="generatorPDF-table" id="table_resizeable" style="${getStyleString(styleGroups.tableStyle)}" border="1">
                        <thead>
                            <tr style="${getStyleString(styleGroups.headerStyle)}">
                                ${headers.map(header => `
                                    <th class="generatorPDF-th" style="${getStyleString(styleGroups.headerStyle)}">${header}</th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(row => `
                                <tr>
                                    ${headers.map(header => `
                                        <td class="generatorPDF-td" style="${getStyleString(styleGroups.rowStyle)}">${row[header]}</td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div style="${getStyleString(styleGroups.footerStyle)}">
                        ${values.footer || ''}
                    </div>
                </div>
            </body>
        </html>
        `;

        previewEl.innerHTML = html;

        document.getElementById("title").addEventListener("blur", ()=>{
           title.value = document.getElementById("title").innerText;
        });


        const table = document.querySelector("#preview #table_resizeable");
        if (table) {
            makeTableResizable(table);
            applyColumnWidths(table); 
        }
    }

    function getStyleString(styleObj) {
        return Object.entries(styleObj || {})
            .map(([prop, value]) => `${prop}: ${value}`)
            .join('; ');
    }

    function makeTableResizable(table) {
        const cols = table.querySelectorAll("th");
    
        cols.forEach((col, index) => {
            const resizer = document.createElement("div");
            resizer.style.width = "5px";
            resizer.style.height = "100%";
            resizer.style.position = "absolute";
            resizer.style.right = "0";
            resizer.style.top = "0";
            resizer.style.cursor = "col-resize";
            resizer.style.userSelect = "none";
            resizer.style.zIndex = "10";
    
            col.style.position = "relative";
            col.appendChild(resizer);
    
            let startX, startWidth, tableWidth;
    
            resizer.addEventListener("mousedown", function (e) {
                startX = e.pageX;
                startWidth = col.offsetWidth;
                tableWidth = table.offsetWidth;
    
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });
    
            function onMouseMove(e) {
                const delta = e.pageX - startX;
                let newWidthPx = startWidth + delta;
    
                // Minimum width 1%
                const minWidthPx = tableWidth * 0.01;
                if (newWidthPx < minWidthPx) newWidthPx = minWidthPx;
    
                // Konversi ke persen
                const newWidthPercent = (newWidthPx / tableWidth) * 100;
    
                // Terapkan lebar baru dalam persen
                col.style.width = `${newWidthPercent}%`;
                col.setAttribute("style", `width: ${newWidthPercent}%; position: relative;`);
    
                // Simpan ke styleGroups
                if (!styleGroups.columnWidths) styleGroups.columnWidths = [];
                styleGroups.columnWidths[index] = `${newWidthPercent.toFixed(2)}%`;
            }
    
            function onMouseUp() {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                console.log("Updated styleGroups.columnWidths (percent):", styleGroups.columnWidths);
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

        previewElement.style.width = `${width}mm`;
        previewElement.style.height = `${height}mm`;
        previewElement.style.border = '1px solid #ccc';
        previewElement.style.padding = '20px';
        previewElement.style.overflow = 'auto';
        previewElement.style.background = 'white';
    }
    selectorVars.paperSize.addEventListener("change", toggleCustomInputs);
    toggleCustomInputs();
    selectorVars.paperSize.addEventListener("change", setPreviewSize);
    selectorVars.paperOrientation.addEventListener("change", setPreviewSize);
    previewButton.addEventListener("click", () => {
        updateStyleGroupsFromInputs(); // Ambil semua input dan update styleGroups
        generatePreview();             // Tampilkan preview HTML
    });

    selectorVars.report_generator_downloadPDF.addEventListener('click', () => {
        // const values = window.getSelectorValues();
        // console.log("Data dikirim ke backend:", values);
        // const params = new URLSearchParams(values).toString();
        // window.open(`public/download2.php?type=pdf&${params}`, "_blank");
        downloadPDF();
    });
});
