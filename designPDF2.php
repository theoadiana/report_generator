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
    <!-- Header dengan Tabs -->
    <div class="bg-white shadow px-6 py-2 sticky top-0 z-50">
        <div class="flex space-x-4 text-sm font-semibold">
            <button class="tab-button text-gray-600 hover:text-black py-2 px-3 border-b-2 border-transparent active-tab"
                data-tab="home">Home</button>
            <button class="tab-button text-gray-600 hover:text-black py-2 px-3 border-b-2 border-transparent"
                data-tab="paperSettings">Paper Settings</button>
            <button class="tab-button text-gray-600 hover:text-black py-2 px-3 border-b-2 border-transparent"
                data-tab="headerStyle">Header Style</button>
            <button class="tab-button text-gray-600 hover:text-black py-2 px-3 border-b-2 border-transparent"
                data-tab="rowStyle">Row Style</button>
            <button class="tab-button text-gray-600 hover:text-black py-2 px-3 border-b-2 border-transparent"
                data-tab="tools">Tools</button>
            <button id="report_generator_previewPDF"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Generate Preview
            </button>
            <button id="report_generator_downloadPDF" type="submit"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Download PDF
            </button>
            <button id="report_generator_saveTemplatePDF" type="submit"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Save Template PDF
            </button>
            <!-- <select id="templateSelector" class="border p-2 rounded">
                <option value="">Pilih Template</option>
            </select>
            <button id="report_generator_loadTemplatePDF" class="ml-2 bg-blue-500 text-white p-2 rounded">Load Template</button> -->
        </div>
    </div>

    <!-- Container utama -->
    <div class="flex">
        <!-- Kontainer Tab Panel -->
        <div class="w-full bg-white p-4 border-b space-y-4">
            <!-- Konten Home (tools) -->
            <div class="tab-content" data-content="home">
                <div>
                    <label class="block text-sm font-medium">Title Font Size</label>
                    <input type="text" class="w-full mt-1 p-2 border rounded" value="16" data-style-group="titleStyle"
                        data-style-attr="font-size">
                </div>
                <div>
                    <label class="block text-sm font-medium">Title Font Color</label>
                    <input type="color" class="w-full mt-1 p-2 border rounded" value="#000000"
                        data-style-group="titleStyle" data-style-attr="color">
                </div>
                <div>
                    <label class="block text-sm font-medium">Title Text Align</label>
                    <select class="w-full mt-1 p-2 border rounded" value="center" data-style-group="titleStyle"
                        data-style-attr="text-align">
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="center" selected>Center</option>
                        <option value="justify">Justify</option>
                    </select>
                </div>
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

                <div id="customPaperInputs" class="grid grid-cols-2 gap-2 mt-2">
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
            </div>
            <!-- Tab Header Style -->
            <div class="tab-content hidden" data-content="headerStyle">
                <div>
                    <label class="block text-sm font-medium">Font Size</label>
                    <input type="number" class="w-full mt-1 p-2 border rounded" value="16"
                        data-style-group="headerStyle" data-style-attr="font-size">
                </div>
                <div>
                    <label class="block text-sm font-medium">Font Weight</label>
                    <select class="w-full mt-1 p-2 border rounded" data-style-group="headerStyle"
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
                    <select class="w-full mt-1 p-2 border rounded" data-style-group="headerStyle"
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
                        data-style-group="headerStyle" data-style-attr="color">
                </div>
                <div>
                    <label class="block text-sm font-medium">Header Background Color</label>
                    <input type="color" class="w-full mt-1 p-2 border rounded" value="#FFFFFF"
                        data-style-group="headerStyle" data-style-attr="background-color">
                </div>
            </div>

            <!-- Tab Row Style -->
            <div class="tab-content hidden" data-content="rowStyle">
                <div>
                    <label class="block text-sm font-medium">Font Size</label>
                    <input type="number" class="w-full mt-1 p-2 border rounded" value="16" data-style-group="rowStyle"
                        data-style-attr="font-size">
                </div>

                <div>
                    <label class="block text-sm font-medium">Font Weight</label>
                    <select class="w-full mt-1 p-2 border rounded" data-style-group="rowStyle"
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
                    <select class="w-full mt-1 p-2 border rounded" data-style-group="rowStyle"
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
                        data-style-group="rowStyle" data-style-attr="color">
                </div>

                <div>
                    <label class="block text-sm font-medium">Border Size</label>
                    <input type="number" class="w-full mt-1 p-2 border rounded" value="1" data-style-group="rowStyle"
                        data-style-attr="border-width">
                </div>

                <div>
                    <label class="block text-sm font-medium">Border Type</label>
                    <select class="w-full mt-1 p-2 border rounded" data-style-group="rowStyle"
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
                        data-style-group="rowStyle" data-style-attr="border-color">
                </div>
            </div>


            <div class="tab-content hidden" data-content="tools">
                <div class="mt-4">
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
    <div id="preview" class="max-w-5xl mx-auto bg-white mt-6 shadow-lg p-6">
    </div>

    <script>
        document.querySelectorAll(".tab-button").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("border-black", "active-tab"));
                document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));

                btn.classList.add("border-black", "active-tab");
                document.querySelector(`.tab-content[data-content="${btn.dataset.tab}"]`).classList.remove("hidden");
            });
        });
    </script>
</body>

</html>