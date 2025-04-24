// Ambil elemen
const previewButton = document.querySelector("#report_generator_previewPDF");
const downloadButton = document.querySelector("#report_generator_downloadPDF");
const inputFields = document.querySelectorAll('input, select, textarea');
const customPaperInputs = document.getElementById("customPaperInputs");
const customWidth = document.getElementById("customWidth");
const customHeight = document.getElementById("customHeight");
const titleSelect = document.getElementById("title");
const headerStyleSelect = document.getElementById("header");
const rowStyleSelect = document.getElementById("rowStyle");
const tableStyleSelect = document.getElementById("tableStyle");
const headerColorSelect = document.getElementById("headerColor");
const borderStyleSelect = document.getElementById("borderStyle");
const paperSizeSelect = document.getElementById("paperSize");
const paperOrientationSelect = document.getElementById("paperOrientation");
const metaTitleSelect = document.getElementById("metaTitle");
const metaAuthorSelect = document.getElementById("metaAuthor");
const metaSubjectSelect = document.getElementById("metaSubject");
const footerSelect = document.getElementById("footer");

// Fungsi Preview
async function generatePreview() {
    const data = await fetch('public/download.php?action=get_data').then(res => res.json());

    if (!data || data.length === 0) {
        document.getElementById('preview').innerHTML = '<p class="text-red-600">Tidak ada data dari database.</p>';
        return;
    }

    const getValue = selection => selection?.value || '';
    const title = getValue(titleSelect);
    const headerStyle = getValue(headerStyleSelect);
    const rowStyle = getValue(rowStyleSelect);
    const tableStyle = getValue(tableStyleSelect);
    const headerColor = getValue(headerColorSelect);
    const borderStyle = getValue(borderStyleSelect);
    const paperSize = getValue(paperSizeSelect);
    const paperOrientation = getValue(paperOrientationSelect);
    const metaTitle = getValue(metaTitleSelect);
    const metaAuthor = getValue(metaAuthorSelect);
    const metaSubject = getValue(metaSubjectSelect);
    const footer = getValue(footerSelect);

    const headers = Object.keys(data[0]);
    let html = `<html><head>
        <meta name="title" content="${metaTitle}">
        <meta name="author" content="${metaAuthor}">
        <meta name="subject" content="${metaSubject}">
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
        }
    </style>
    </head><body>`;
    html += `<h1 style="text-align: center;">${title}</h1>`;
    html += `<p style="text-align:center; font-size: 12px;">Ukuran Kertas: ${paperSize}, Orientasi: ${paperOrientation}</p>`;
    html += `<table style="${tableStyle}" border="1"><tr style="background-color: ${headerColor};">`;
    headers.forEach(header => {
        html += `<th style="${headerStyle}">${header}</th>`;
    });
    html += `</tr>`;
    data.forEach(row => {
        html += `<tr>`;
        headers.forEach(header => {
            html += `<td style="${rowStyle}; border: ${borderStyle};">${row[header]}</td>`;
        });
        html += `</tr>`;
    });
    html += `<tfoot>`;
    html += `<tr>`;
    html += `<td colspan="${headers.length}" style="text-align: center; font-weight: bold;">${footer}</td>`;
    html += `</tr>`;
    html += `</tfoot>`;
    html += `</table></body></html>`;
    document.getElementById('preview').innerHTML = html;
}

// Fungsi untuk toggle input custom size
function toggleCustomInputs() {
    const isCustom = paperSizeSelect.value === "custom";
    customPaperInputs.classList.toggle("hidden", !isCustom);
    customWidth.disabled = !isCustom;
    customHeight.disabled = !isCustom;
}

// Fungsi Download PDF
function downloadPDF() {
    const getValue = selection => selection?.value || '';
    const title = getValue(titleSelect);
    const headerStyle = getValue(headerStyleSelect);
    const rowStyle = getValue(rowStyleSelect);
    const tableStyle = getValue(tableStyleSelect);
    const headerColor = getValue(headerColorSelect);
    const borderStyle = getValue(borderStyleSelect);
    const paperSize = getValue(paperSizeSelect);
    const paperOrientation = getValue(paperOrientationSelect);
    const metaTitle = getValue(metaTitleSelect);
    const metaAuthor = getValue(metaAuthorSelect);
    const metaSubject = getValue(metaSubjectSelect);
    const footer = getValue(footerSelect);


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

function setPreviewSize() {
    const paperSize = paperSizeSelect.value;
    const paperOrientation = paperOrientationSelect.value;
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
            width = parseFloat(customWidth.value) || 210;
            height = parseFloat(customHeight.value) || 297;
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



// Event listener
paperSizeSelect.addEventListener("change", toggleCustomInputs);
toggleCustomInputs();

// Tambahkan event listener untuk mengatur ukuran preview
paperSizeSelect.addEventListener("change", setPreviewSize);
paperOrientationSelect.addEventListener("change", setPreviewSize);
customWidth.addEventListener("input", setPreviewSize);
customHeight.addEventListener("input", setPreviewSize);

// Panggil fungsi setPreviewSize secara manual untuk mengatur ukuran preview awal
setPreviewSize();

inputFields.forEach(input => {
    input.addEventListener('input', generatePreview);
});

previewButton.addEventListener('click', generatePreview);
downloadButton.addEventListener('click', downloadPDF);
