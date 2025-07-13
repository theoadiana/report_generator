<?php
require_once __DIR__ . '/public/download2.php';
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>PDF Report Designer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module" defer src="assets/js/designPDF2.js"></script>
</head>

<body class="bg-gray-100">
    <div class="bg-white shadow px-6 py-2 sticky top-0 z-50">
        <!-- Header dengan Tabs -->
        <div class="flex space-x-4 text-sm font-semibold">
            <button class="tab-button text-gray-600 hover:text-black py-2 px-3 border-b-2 border-transparent"
                data-tab="headerStyle">Header Style</button>
            <button class="tab-button text-gray-600 hover:text-black py-2 px-3 border-b-2 border-transparent"
                data-tab="paperSettings">Paper Settings</button>
            <button class="tab-button text-gray-600 hover:text-black py-2 px-3 border-b-2 border-transparent"
                data-tab="haderTableStyle">Header Table Style</button>
            <button class="tab-button text-gray-600 hover:text-black py-2 px-3 border-b-2 border-transparent"
                data-tab="rowTableStyle">Row Table Style</button>
            <button class="tab-button text-gray-600 hover:text-black py-2 px-3 border-b-2 border-transparent"
                data-tab="tools">Tools</button>
            <button class="tab-button text-gray-600 hover:text-black py-2 px-3 border-b-2 border-transparent"
                data-tab="query">Query</button>
            <button id="report_generator_downloadPDF" type="submit"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Download PDF
            </button>
            <button id="report_generator_saveTemplatePDF" type="submit"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Save Template PDF
            </button>
            <select id="report_generator_templateSelector" class="border p-2 rounded">
                <option value="">Pilih Template</option>
            </select>
            <button id="report_generator_loadTemplatePDF" class="ml-2 bg-blue-500 text-white p-2 rounded">Load
                Template</button>
        </div>

        <!-- Container utama -->
        <div class="flex">
            <!-- Kontainer Tab Panel -->
            <div class="w-full bg-white p-4 border-b space-y-4">
                <!-- Konten Header Style -->
                <div class="tab-content hidden" data-content="headerStyle">
                </div>

                <!-- Tab Paper Settings -->
                <div class="tab-content hidden" data-content="paperSettings">
                    <div>
                        <label class="block text-sm font-medium">Ukuran Kertas</label>
                        <select id="paperSize" class="w-full mt-1 p-2 border rounded">
                            <option value="A4">A4</option>
                            <option value="Letter">Letter</option>
                            <option value="Legal">Legal</option>
                            <option value="custom">Custom (mm)</option>
                        </select>
                    </div>

                    <div id="customPaperInputs" class="grid grid-cols-2 gap-2 mt-1">
                        <div>
                            <label class="block text-sm text-gray-600">Lebar (mm)</label>
                            <input type="number" id="customWidth" class="w-full p-2 border rounded" placeholder="210"
                                disabled>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600">Tinggi (mm)</label>
                            <input type="number" id="customHeight" class="w-full p-2 border rounded" placeholder="297"
                                disabled>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Orientasi</label>
                        <select id="paperOrientation" class="w-full mt-1 p-2 border rounded">
                            <option value="portrait">Portrait</option>
                            <option value="landscape">Landscape</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Background Color</label>
                        <input type="color" class="w-full mt-1 p-2 border rounded" value="#FFFFFF"
                            data-style-group="bodyStyle" data-style-attr="background-color">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Margin Top</label>
                        <input type="number" class="w-full mt-1 p-2 border rounded" value="20"
                            data-style-group="bodyStyle" data-style-attr="margin-top">
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Margin Right</label>
                        <input type="number" class="w-full mt-1 p-2 border rounded" value="20"
                            data-style-group="bodyStyle" data-style-attr="margin-right">
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Margin Bottom</label>
                        <input type="number" class="w-full mt-1 p-2 border rounded" value="20"
                            data-style-group="bodyStyle" data-style-attr="margin-bottom">
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Margin Left</label>
                        <input type="number" class="w-full mt-1 p-2 border rounded" value="20"
                            data-style-group="bodyStyle" data-style-attr="margin-left">
                    </div>
                </div>
                <!-- Tab Header Style -->
                <div class="tab-content hidden" data-content="haderTableStyle">
                    <div>
                        <label class="block text-sm font-medium">Font Size</label>
                        <input type="number" class="w-full mt-1 p-2 border rounded" value="16"
                            data-style-group="haderTableStyle" data-style-attr="font-size">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Font Weight</label>
                        <select class="w-full mt-1 p-2 border rounded" data-style-group="haderTableStyle"
                            data-style-attr="font-weight">
                            <option value="100">100 - Thin</option>
                            <option value="200">200 - Extra Light</option>
                            <option value="300">300 - Light</option>
                            <option value="400">400 - Normal</option>
                            <option value="500">500 - Medium</option>
                            <option value="600">600 - Semi Bold</option>
                            <option value="700" selected>700 - Bold</option>
                            <option value="800">800 - Extra Bold</option>
                            <option value="900">900 - Black</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Text Align</label>
                        <select class="w-full mt-1 p-2 border rounded" data-style-group="haderTableStyle"
                            data-style-attr="text-align">
                            <option value="left" selected>Left</option>
                            <option value="right">Right</option>
                            <option value="center">Center</option>
                            <option value="justify">Justify</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Font Color</label>
                        <input type="color" class="w-full mt-1 p-2 border rounded" value="#000000"
                            data-style-group="haderTableStyle" data-style-attr="color">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Header Background Color</label>
                        <input type="color" class="w-full mt-1 p-2 border rounded" value="#FFFFFF"
                            data-style-group="haderTableStyle" data-style-attr="background-color">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Border Size</label>
                        <input type="number" class="w-full mt-1 p-2 border rounded" value="1"
                            data-style-group="haderTableStyle" data-style-attr="border-width">
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Border Type</label>
                        <select class="w-full mt-1 p-2 border rounded" data-style-group="haderTableStyle"
                            data-style-attr="border-style">
                            <option value="none">None</option>
                            <option value="solid" selected>Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                            <option value="groove">Groove</option>
                            <option value="ridge">Ridge</option>
                            <option value="inset">Inset</option>
                            <option value="outset">Outset</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Border Color</label>
                        <input type="color" class="w-full mt-1 p-2 border rounded" value="#000000"
                            data-style-group="haderTableStyle" data-style-attr="border-color">
                    </div>
                </div>

                <!-- Tab Row Style -->
                <div class="tab-content hidden" data-content="rowTableStyle">
                    <div>
                        <label class="block text-sm font-medium">Font Size</label>
                        <input type="number" class="w-full mt-1 p-2 border rounded" value="16"
                            data-style-group="rowTableStyle" data-style-attr="font-size">
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Font Weight</label>
                        <select class="w-full mt-1 p-2 border rounded" data-style-group="rowTableStyle"
                            data-style-attr="font-weight">
                            <option value="100">100 - Thin</option>
                            <option value="200">200 - Extra Light</option>
                            <option value="300">300 - Light</option>
                            <option value="400">400 - Normal</option>
                            <option value="500">500 - Medium</option>
                            <option value="600">600 - Semi Bold</option>
                            <option value="700" selected>700 - Bold</option>
                            <option value="800">800 - Extra Bold</option>
                            <option value="900">900 - Black</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Text Align</label>
                        <select class="w-full mt-1 p-2 border rounded" data-style-group="rowTableStyle"
                            data-style-attr="text-align">
                            <option value="left" selected>Left</option>
                            <option value="right">Right</option>
                            <option value="center">Center</option>
                            <option value="justify">Justify</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Font Color</label>
                        <input type="color" class="w-full mt-1 p-2 border rounded" value="#000000"
                            data-style-group="rowTableStyle" data-style-attr="color">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Row Background Color</label>
                        <input type="color" class="w-full mt-1 p-2 border rounded" value="#FFFFFF"
                            data-style-group="rowTableStyle" data-style-attr="background-color">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Border Size</label>
                        <input type="number" class="w-full mt-1 p-2 border rounded" value="1"
                            data-style-group="rowTableStyle" data-style-attr="border-width">
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Border Type</label>
                        <select class="w-full mt-1 p-2 border rounded" data-style-group="rowTableStyle"
                            data-style-attr="border-style">
                            <option value="none">None</option>
                            <option value="solid" selected>Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                            <option value="groove">Groove</option>
                            <option value="ridge">Ridge</option>
                            <option value="inset">Inset</option>
                            <option value="outset">Outset</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium">Border Color</label>
                        <input type="color" class="w-full mt-1 p-2 border rounded" value="#000000"
                            data-style-group="rowTableStyle" data-style-attr="border-color">
                    </div>
                </div>

                <!-- Tab Row Style -->
                <div class="tab-content hidden" data-content="query">
                    <div class="col-span-2">
                        <h4 class="text-sm font-semibold mb-1">Query Manual</h4>
                        <textarea id="manualQueryInput" class="w-full p-2 border rounded text-sm" rows="4"
                            placeholder="Tulis query di sini..."></textarea>
                        <button id="report_generator_queryExecute"
                            class="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Jalankan Query
                        </button>
                    </div>

                </div>

                <div class="tab-content hidden" data-content="tools">
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                        <!-- Tambah Selector Baru -->
                        <div class="col-span-1">
                            <h4 class="text-sm font-semibold mb-1">Tambah Selector Baru</h4>
                            <div class="flex gap-2">
                                <input type="text" id="newSelectorId" class="p-2 border rounded w-full text-sm"
                                    placeholder="ID elemen baru">
                                <button id="addSelectorBtn"
                                    class="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700">Tambah</button>
                            </div>
                        </div>
                        <!-- Daftar Selector -->
                        <div class="col-span-2">
                            <h4 class="text-sm font-semibold mb-1">Daftar Selector</h4>
                            <div class="overflow-x-auto max-h-60 overflow-y-auto border rounded">
                                <table class="w-full table-auto text-sm">
                                    <thead class="bg-gray-200">
                                        <tr>
                                            <th class="p-1 border">#</th>
                                            <th class="p-1 border text-left">ID</th>
                                            <th class="p-1 border text-left">Tag</th>
                                            <th class="p-1 border text-left">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody id="selectorTableBody" class="bg-white">
                                        <!-- Diisi JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <!-- Preview HTML -->
                        <div class="col-span-2">
                            <h4 class="text-sm font-semibold mb-1">Preview HTML</h4>
                            <pre id="htmlPreview" class="bg-gray-100 p-2 rounded text-xs h-full overflow-auto"></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Area Canvas (Preview Data) -->
    <div id="preview" class="max-w-5xl mx-auto mt-6 shadow-lg"></div>


    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const tabs = document.querySelectorAll(".tab-button");
            const contents = document.querySelectorAll(".tab-content");

            tabs.forEach(btn => {
                btn.addEventListener("click", () => {
                    // Reset semua tab
                    tabs.forEach(b => b.classList.remove("border-black", "active-tab"));
                    contents.forEach(c => {
                        c.classList.add("hidden");
                        // Hapus semua grid yang mungkin tersisa
                        c.classList.remove("grid", "grid-cols-1", "md:grid-cols-4", "gap-4");
                        // Set fixed height agar semua tab ukurannya konsisten
                        c.style.height = "130px"; // Fixed height
                    });

                    // Aktifkan tab yang dipilih
                    btn.classList.add("border-black", "active-tab");

                    const targetTab = document.querySelector(`.tab-content[data-content="${btn.dataset.tab}"]`);
                    targetTab.classList.remove("hidden");
                    targetTab.classList.add("grid", "grid-cols-1", "md:grid-cols-4", "gap-4");
                });
            });

            // Trigger tab pertama saat halaman diload
            if (tabs.length > 0) {
                tabs[0].click();
            }
        });
    </script>


</body>

</html>