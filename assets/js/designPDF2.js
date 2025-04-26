import { SelectorManager } from './selectorManager.js';

document.addEventListener("DOMContentLoaded", () => {
    const manager = new SelectorManager();
    const previewButton = document.getElementById("report_generator_previewPDF");

    // Registrasi default
    ["paperSize", "paperOrientation", "metaTitle", "metaAuthor", "metaSubject", "customWidth", "customHeight"].forEach(id => manager.register(id));

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

        const entries = Object.entries(manager.selectors);
        entries.forEach(([id, el], index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="p-2 border text-center">${index + 1}</td>
                <td class="p-2 border">${id}</td>
                <td class="p-2 border">${el.tagName}</td>
                <td class="p-2 border">
                    <select class="tagNameDropdown" data-id="${id}">
                        <option value="unknown" ${el.tagName === "unknown" ? "selected" : ""}>unknown</option>
                        <option value="div" ${el.tagName === "div" ? "selected" : ""}>div</option>
                        <option value="span" ${el.tagName === "span" ? "selected" : ""}>span</option>
                        <option value="h1" ${el.tagName === "h1" ? "selected" : ""}>h1</option>
                        <option value="p" ${el.tagName === "p" ? "selected" : ""}>p</option>
                        <option value="a" ${el.tagName === "a" ? "selected" : ""}>a</option>
                        <option value="button" ${el.tagName === "button" ? "selected" : ""}>button</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Event listener dropdown
        const tagNameDropdowns = document.querySelectorAll(".tagNameDropdown");
        tagNameDropdowns.forEach(dropdown => {
            dropdown.addEventListener("change", (e) => {
                const id = e.target.getAttribute("data-id");
                const selectedTag = e.target.value;
                manager.updateTagName(id, selectedTag);
                updateSelectorTable();
                updateHTMLPreview();
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

    async function generatePreview() {
        const data = await fetch('public/download.php?action=get_data').then(res => res.json());

        if (!data || data.length === 0) {
            document.getElementById('preview').innerHTML = '<p class="text-red-600">Tidak ada data dari database.</p>';
            return;
        }

        const values = window.getSelectorValues(); // objek dinamis
        const headers = Object.keys(data[0]);

        let html = `<html><head>
            <meta name="title" content="${values.metaTitle || ''}">
            <meta name="author" content="${values.metaAuthor || ''}">
            <meta name="subject" content="${values.metaSubject || ''}">
            <style>
            body {
                margin: 0;
                padding: 20px;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
            }
            table {
                width: 100%;
                table-layout: fixed;
                word-wrap: break-word;
            }
            th, td {
                max-width: 100%;
                border: 1px solid #000;
                padding: 8px;
            }
        </style>
        </head><body>`;

        html += `<h1 style="text-align: center;">${values.title || ''}</h1>`;
        html += `<p style="text-align:center; font-size: 12px;">Ukuran Kertas: ${values.paperSize || ''}, Orientasi: ${values.paperOrientation || ''}</p>`;
        html += `<table id="table_resizeable" style="${values.tableStyle || ''}" border="1"><tr style="background-color: ${values.headerColor || ''};">`;

        headers.forEach(header => {
            html += `<th style="${values.headerStyle || ''}">${header}</th>`;
        });

        html += `</tr>`;

        data.forEach(row => {
            html += `<tr>`;
            headers.forEach(header => {
                html += `<td style="${values.rowStyle || ''}; border: ${values.borderStyle || ''};">${row[header]}</td>`;
            });
            html += `</tr>`;
        });

        html += `<tfoot>`;
        html += `<tr>`;
        html += `<td colspan="${headers.length}" style="text-align: center; font-weight: bold;">${values.footer || ''}</td>`;
        html += `</tr>`;
        html += `</tfoot>`;
        html += `</table></body></html>`;

        document.getElementById('preview').innerHTML = html;
        const table = document.querySelector('#preview #table_resizeable');
        if (table) {
            makeTableResizable(table);
        }
    }

    function makeTableResizable(table) {
        const cols = table.querySelectorAll('th');

        cols.forEach((col) => {
            const resizer = document.createElement('div');
            resizer.style.width = '5px';
            resizer.style.height = '100%';
            resizer.style.position = 'absolute';
            resizer.style.right = '0';
            resizer.style.top = '0';
            resizer.style.cursor = 'col-resize';
            resizer.style.userSelect = 'none';
            resizer.style.zIndex = '10';

            col.style.position = 'relative';
            col.appendChild(resizer);

            let startX, startWidth;

            resizer.addEventListener('mousedown', function (e) {
                startX = e.pageX;
                startWidth = col.offsetWidth;

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });

            function onMouseMove(e) {
                const newWidth = startWidth + (e.pageX - startX);
                col.style.width = newWidth + 'px';
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        });
    }

    previewButton.addEventListener('click', generatePreview);
});
