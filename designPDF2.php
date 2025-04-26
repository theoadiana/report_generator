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

<body class="p-6 bg-gray-100">
    <div class="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
        <h2 class="text-3xl font-bold text-center">PDF Report Designer</h2>

        <!-- Form untuk menambahkan selector baru -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="mt-6 border-t pt-6">
                <h4 class="text-lg font-semibold mb-2">Tambah Selector Baru</h4>
                <div class="flex gap-4 items-center">
                    <input type="text" id="newSelectorId" class="p-2 border rounded w-full md:w-1/2"
                        placeholder="Masukkan ID elemen baru">
                    <button id="addSelectorBtn" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                        Daftarkan Selector
                    </button>
                </div>
                <p class="text-sm text-gray-500 mt-2">Tambahkan ID selector yang akan digunakan dalam desain PDF.</p>
            </div>
        </div>

        <!-- Tabel untuk menampilkan selectors yang sudah terdaftar -->
        <div class="mt-6">
            <h4 class="text-lg font-semibold mb-2">Daftar Selector Terdaftar</h4>
            <table class="w-full table-auto border border-gray-300 rounded">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="p-2 border">#</th>
                        <th class="p-2 border text-left">ID Selector</th>
                        <th class="p-2 border text-left">Tipe Elemen</th>
                        <th class="p-2 border text-left">Tag Name</th>
                    </tr>
                </thead>
                <tbody id="selectorTableBody" class="bg-white">
                    <!-- Baris akan diisi lewat JS -->
                </tbody>
            </table>
        </div>
        <!-- Area Preview untuk menampilkan HTML dari selectors -->
        <div class="mt-6">
            <h4 class="text-lg font-semibold mb-2">Preview HTML</h4>
            <pre id="htmlPreview" class="bg-gray-200 p-4 rounded text-sm text-gray-800">
        <!-- HTML code preview akan muncul di sini -->
            </pre>
        </div>
        <!-- Tombol untuk generate preview -->
        <div class="mt-6">
            <button id="report_generator_previewPDF" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Generate Preview
            </button>
        </div>
        <!-- Preview hasil generatePreview() -->
        <div class="mt-6">
            <h4 class="text-lg font-semibold mb-2">Preview Data</h4>
            <div id="preview" class="bg-white border p-4 rounded overflow-auto text-sm"></div>
        </div>

    </div>
</body>

</html>