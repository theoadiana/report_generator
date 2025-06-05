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
        "titleStyleFontSize",
        "titleStyleFontColor",
        "titleStyleFontWeight",
        "headerStyle",
        "headerStyleFontSize",
        "headerStyleFontWeight",
        "headerStyleFontTextAlign",
        "headerStyleFontColor",
        "headerColor",
        "rowStyle",
        "rowStyleFontSize",
        "rowStyleFontWeight",
        "rowStyleFontTextAlign",
        "rowStyleFontColor",
        "rowColor",
        "borderStyle",
        "borderStyleSize",
        "borderStyleType",
        "borderStyleColor",
        "footer"
    ].forEach((id) => manager.register(id));

    const selectorVars = manager.generateSelectorVariables();

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
        const getValue = selection => selection?.value || '';
        const title = getValue(selectorVars.title);
        const headerStyle = getValue(selectorVars.headerStyle);
        const rowStyle = getValue(selectorVars.rowStyle);
        const tableStyle = getValue(selectorVars.tableStyle);
        const headerColor = getValue(selectorVars.headerColor);
        const borderStyle = getValue(selectorVars.borderStyle);
        const paperSize = getValue(selectorVars.paperSize);
        const paperOrientation = getValue(selectorVars.paperOrientation);
        const metaTitle = getValue(selectorVars.metaTitle);
        const metaAuthor = getValue(selectorVars.metaAuthor);
        const metaSubject = getValue(selectorVars.metaSubject);
        const footer = getValue(selectorVars.footer);


        const params = new URLSearchParams({
            type: 'pdf',
            title,
            headerStyle,
            rowStyle,
            tableStyle,
            headerColor,
            borderStyle,
            paperSize,
            paperOrientation,
            metaTitle,
            metaAuthor,
            metaSubject,
            footer
        });

        // Jika custom, tambahkan width dan height
        if (paperSize === "custom") {
            const width = customWidth.value || '210';
            const height = customHeight.value || '297';
            params.append('customWidth', width);
            params.append('customHeight', height);
        }

        const url = `/public/download.php?${params.toString()}`;

        fetch(url)
            .then(response => response.blob())
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
        const data = await fetch("public/download.php?action=get_data").then(
            (res) => res.json()
        );

        if (!data || data.length === 0) {
            document.getElementById("preview").innerHTML =
                '<p class="text-red-600">Tidak ada data dari database.</p>';
            return;
        }

        const values = window.getSelectorValues(); // objek dinamis
        const headers = Object.keys(data[0]);

        let html = `<html><head>
            <meta name="title" content="${values.metaTitle || ""}">
            <meta name="author" content="${values.metaAuthor || ""}">
            <meta name="subject" content="${values.metaSubject || ""}">
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
        </head><body><div class="generatorPDF">`;
       
        values.borderStyle = `
        ${values.borderStyleSize || "1"}px ${values.borderStyleType || "solid"} ${values.borderStyleColor || "#000000"};
        `
        const titleStyle = `
            font-size: ${values.headerStyleFontSize || "16"}px;
            font-weight: ${values.headerStyleFontWeight || "bold"};
            text-align: ${values.headerStyleFontTextAlign || "left"};
            color: ${values.headerStyleFontColor || "#000000"};
            background-color: ${values.headerColor || "#FFFFFF"};
            border: ${values.borderStyle};
        `;

        const headerStyle = `
            font-size: ${values.headerStyleFontSize || "16"}px;
            font-weight: ${values.headerStyleFontWeight || "bold"};
            text-align: ${values.headerStyleFontTextAlign || "left"};
            color: ${values.headerStyleFontColor || "#000000"};
            background-color: ${values.headerColor || "#FFFFFF"};
            border: ${values.borderStyle};
        `;

        const rowStyle = `
            font-size: ${values.rowStyleFontSize || "16"}px;
            font-weight: ${values.rowStyleFontWeight || "bold"};
            text-align: ${values.rowStyleFontTextAlign || "left"};
            color: ${values.rowStyleFontColor || "#000000"};
            background-color: ${values.rowColor || "#FFFFFF"};
            border: ${values.borderStyle};
        `;

        html += `<h1 style="text-align: center;">${values.title || ""}</h1>`;
        html += `<p style="text-align:center; font-size: 12px;">Ukuran Kertas: ${values.paperSize || ""
            }, Orientasi: ${values.paperOrientation || ""}</p>`;
        html += `<table class="generatorPDF-table" id="table_resizeable" style="${values.tableStyle || ""
            }" border="1"><tr style="background-color: ${values.headerColor || "#FFFFFF"};">`;

        headers.forEach((header) => {
            html += `<th class="generatorPDF-th" style="${headerStyle || ""}">${header}</th>`;
        });

        html += `</tr>`;

        data.forEach((row) => {
            html += `<tr>`;
            headers.forEach((header) => {
                html += `<td class="generatorPDF-td" style="${rowStyle || ""}; ">${row[header]}</td>`;
            });
            html += `</tr>`;
        });

        html += `<tfoot>`;
        html += `<tr>`;
        html += `<td class="generatorPDF-td" colspan="${headers.length
            }" style="text-align: center; font-weight: bold;">${values.footer || ""
            }</td>`;
        html += `</tr>`;
        html += `</tfoot>`;
        html += `</table></div></body></html>`;

        document.getElementById("preview").innerHTML = html;
        const table = document.querySelector("#preview #table_resizeable");
        if (table) {
            makeTableResizable(table);
        }
    }

    function buildStyle(styles) {
        return Object.entries(styles)
            .map(([key, value]) => `${key}: ${value};`)
            .join(" ");
    }
    

    function makeTableResizable(table) {
        const cols = table.querySelectorAll("th");

        cols.forEach((col) => {
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

            let startX, startWidth;

            resizer.addEventListener("mousedown", function (e) {
                startX = e.pageX;
                startWidth = col.offsetWidth;

                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });

            function onMouseMove(e) {
                const newWidth = startWidth + (e.pageX - startX);
                col.style.width = newWidth + "px";
            }

            function onMouseUp() {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
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
    previewButton.addEventListener("click", generatePreview);
    selectorVars.report_generator_downloadPDF.addEventListener('click', downloadPDF);
});
