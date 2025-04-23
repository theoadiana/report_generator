function downloadFile(type) {
    let currentFile = window.location.pathname.split("/").pop() || "index.php";
    fetch(`${currentFile}?type=${type}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Gagal mengunduh file");
            }
            console.log("✅ Berhasil mengunduh laporan.");
            window.location.href = `${currentFile}?type=${type}`;
        }
        )
        .catch(error => console.error("❌ Gagal mengunduh:", error));
}

