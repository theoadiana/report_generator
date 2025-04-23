<?php
require_once __DIR__ . '/public/download.php';
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>PDF Report Designer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="assets/js/designPDF.js"></script>
</head>

<body class="p-6 bg-gray-100">
  <div class="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
    <h2 class="text-2xl font-bold">PDF Report Designer</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium">Title</label>
        <input type="text" id="title" class="w-full mt-1 p-2 border rounded" placeholder="Laporan Penjualan">
      </div>
      <div>
        <label class="block text-sm font-medium">Header Style</label>
        <input type="text" id="headerStyle" class="w-full mt-1 p-2 border rounded"
          value="font-size: 16px; font-weight: bold; text-align: left;">
      </div>
      <div>
        <label class="block text-sm font-medium">Row Style</label>
        <input type="text" id="rowStyle" class="w-full mt-1 p-2 border rounded" value="font-size: 12px;">
      </div>
      <div>
        <label class="block text-sm font-medium">Table Style</label>
        <input type="text" id="tableStyle" class="w-full mt-1 p-2 border rounded"
          value="width: 100%; border-collapse: collapse;">
      </div>
      <div>
        <label class="block text-sm font-medium">Header Color</label>
        <input type="color" id="headerColor" class="w-full mt-1 p-2 border rounded" value="#f0f0f0">
      </div>
      <div>
        <label class="block text-sm font-medium">Border Style</label>
        <input type="text" id="borderStyle" class="w-full mt-1 p-2 border rounded" value="1px solid #000">
      </div>
      <!-- Ukuran Kertas -->
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
          <input type="number" id="customWidth" class="w-full p-2 border rounded" placeholder="210" disabled>
        </div>
        <div>
          <label class="block text-sm text-gray-600">Tinggi (mm)</label>
          <input type="number" id="customHeight" class="w-full p-2 border rounded" placeholder="297" disabled>
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
        <label class="block text-sm font-medium">Judul Metadata (PDF Title)</label>
        <input type="text" id="metaTitle" class="w-full mt-1 p-2 border rounded" placeholder="Judul dokumen PDF">
      </div>

      <div>
        <label class="block text-sm font-medium">Penulis Metadata (Author)</label>
        <input type="text" id="metaAuthor" class="w-full mt-1 p-2 border rounded" placeholder="Nama penulis PDF">
      </div>

      <div>
        <label class="block text-sm font-medium">Subjek Metadata</label>
        <input type="text" id="metaSubject" class="w-full mt-1 p-2 border rounded"
          placeholder="Deskripsi singkat laporan">
      </div>

    </div>

    <div class="flex flex-wrap gap-4 mt-4">
      <button id="report_generator_previewPDF" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Preview Desain
      </button>
      <button id="report_generator_downloadPDF" type="submit"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Download PDF
      </button>
    </div>

    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-2">Preview Output:</h3>
      <div id="preview" class="bg-white p-4 border rounded shadow-inner overflow-auto"></div>
    </div>
  </div>

</body>

</html>