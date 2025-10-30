export class DownloadManager {
    constructor(buildPDFParamsFunction) {
        this.buildPDFParams = buildPDFParamsFunction;
    }

    async downloadPDF() {
        try {
            const params = this.buildPDFParams({ type: 'pdf' });
            const url = `/public/download.php?${params.toString()}`;
            
            console.log("Download PDF URL:", url);
            await this.handleDownload(url, 'pdf');
            
        } catch (error) {
            console.error('PDF Download error:', error);
            throw new Error(`Failed to download PDF: ${error.message}`);
        }
    }

    async downloadCSV() {
        try {
            const params = this.buildPDFParams({ type: 'csv' });
            const url = `/public/download.php?${params.toString()}`;
            
            await this.handleDownload(url, 'csv');
            
        } catch (error) {
            console.error('CSV Download error:', error);
            throw new Error(`Failed to download CSV: ${error.message}`);
        }
    }

    async downloadExcel() {
        try {
            const params = this.buildPDFParams({ type: 'xlsx' });
            const url = `/public/download.php?${params.toString()}`;
            
            await this.handleDownload(url, 'excel');
            
        } catch (error) {
            console.error('Excel Download error:', error);
            throw new Error(`Failed to download Excel: ${error.message}`);
        }
    }

    async handleDownload(url, fileType) {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const blob = await response.blob();
        this.downloadBlob(blob, fileType);
    }

    downloadBlob(blob, fileType) {
        const timestamp = new Date().toISOString().split('T')[0];
        const extensions = {
            'pdf': 'pdf',
            'csv': 'csv', 
            'excel': 'xlsx'
        };
        
        const extension = extensions[fileType] || 'bin';
        const filename = `report_${timestamp}.${extension}`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // Unified method untuk handle semua type download
    async download(type) {
        const downloadMethods = {
            'pdf': () => this.downloadPDF(),
            'csv': () => this.downloadCSV(),
            'excel': () => this.downloadExcel()
        };

        if (downloadMethods[type]) {
            await downloadMethods[type]();
        } else {
            throw new Error(`Unknown download type: ${type}`);
        }
    }
}