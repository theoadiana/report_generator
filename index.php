<?php 
require_once __DIR__ . "/public/download.php";
?>

<!DOCTYPE html>
<html>
<head>
    <title>Export Laporan</title>
</head>

<body>
    <h1>Export Laporan</h1>
    <a href="designPDF.php">Design PDF</a>
    <br>
    <a href="designExcel.php">Design Excel</a>
    <br>
    <a href="designCSV.php">Design CSV</a>
    <br><br>
    <button onclick="downloadFile('csv')">Download CSV</button>
    <br>
    <button onclick="downloadFile('xlsx')">Download Excel</button>
    <br>
    <button onclick="downloadFile('pdf')">Download PDF</button>
    <script src="./assets/js/script.js"></script>
</body>

</html>