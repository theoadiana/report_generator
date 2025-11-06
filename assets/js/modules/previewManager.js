// modules/previewManager.js
export class PreviewManager {
    constructor(styleManager, selectorManager) {
        this.styleManager = styleManager;
        this.selectorManager = selectorManager;
        this.cachedData = [];
    }

    setPreviewSize(previewElement, selectorVars) {
        const paperSize = selectorVars.paperSize.value;
        const paperOrientation = selectorVars.paperOrientation.value;
    
        let width = 210, height = 297; // default A4
    
        switch (paperSize) {
            case "A4": width = 210; height = 297; break;
            case "A5": width = 148; height = 210; break;
            case "Letter": width = 216; height = 279; break;
            case "custom":
                // PERBAIKAN: Handle jika value berupa array
                let customWidth = selectorVars.customWidth.value;
                let customHeight = selectorVars.customHeight.value;
                
                // Jika berupa array, ambil elemen pertama
                if (Array.isArray(customWidth)) {
                    customWidth = customWidth[0];
                }
                if (Array.isArray(customHeight)) {
                    customHeight = customHeight[0];
                }
                
                width = parseFloat(customWidth) || 210;
                height = parseFloat(customHeight) || 297;
                break;
        }
    
        if (paperOrientation === "landscape") {
            [width, height] = [height, width];
        }
    
        previewElement.style.position = "relative";
        previewElement.style.overflow = "hidden";
        previewElement.style.width = `${width}mm`;
        previewElement.style.height = `${height}mm`;
        previewElement.style.border = "1px solid #ccc";
        previewElement.style.backgroundColor = this.styleManager.getStyleGroups().bodyStyle["background-color"];
    }

    toggleCustomInputs() {
        const paperSize = document.getElementById('paperSize')?.value;
        const customPaperInputs = document.getElementById('customPaperInputs');
        const customWidth = document.getElementById('customWidth');
        const customHeight = document.getElementById('customHeight');

        if (customPaperInputs && customWidth && customHeight) {
            const isCustom = paperSize === "custom";
            customPaperInputs.classList.toggle("hidden", !isCustom);
            customWidth.disabled = !isCustom;
            customHeight.disabled = !isCustom;
        }
    }

    applyColumnWidths(table, styleGroups) {
        if (!styleGroups.columnWidths) return;
        const cols = table.querySelectorAll("th");
        cols.forEach((col, i) => {
            const width = styleGroups.columnWidths[i];
            if (width) {
                col.style.width = width;
            }
        });
    }

    parseLengthToMm(val, fallbackMm = 20) {
        if (!val && val !== 0) return fallbackMm;
        val = String(val).trim().toLowerCase();
        
        const pxPerMm = 3.78;
        
        if (val.endsWith("mm")) {
            return parseFloat(val) || fallbackMm;
        } else if (val.endsWith("cm")) {
            return (parseFloat(val) * 10) || fallbackMm;
        } else if (val.endsWith("px")) {
            return (parseFloat(val) / pxPerMm) || fallbackMm;
        } else if (val.endsWith("in")) {
            return (parseFloat(val) * 25.4) || fallbackMm;
        } else if (val.endsWith("%")) {
            return fallbackMm;
        } else {
            const n = parseFloat(val);
            if (isNaN(n)) return fallbackMm;
            return n / pxPerMm;
        }
    }

    setCachedData(data) {
        this.cachedData = data;
    }

    getCachedData() {
        return this.cachedData;
    }

    // Helper function untuk replace placeholders
    replacePlaceholders(str) {
        if (!str || typeof str !== "string") return str;
        
        const currentDate = new Date().toISOString().split("T")[0];
        const placeholderValues = {
            "{{current_date}}": currentDate,
            "{{nama_perusahaan}}": "Perusahaan Tambang",
            "{{logo_url}}": "https://via.placeholder.com/100x50?text=Logo"
        };

        return Object.entries(placeholderValues).reduce((result, [key, value]) => {
            return result.replaceAll(key, value);
        }, str);
    }

    // Method untuk toggle style inputs visibility
    toggleStyleInputs(groupName, show) {
        document.querySelectorAll(`[data-style-group='${groupName}']`).forEach(input => {
            input.parentElement.style.display = show ? "block" : "none";
        });
    }

    // Method untuk update single cell style
    updateSingleCellStyle(rowIndex, cellIndex, group = "headerStyle") {
        const styleGroups = this.styleManager.getStyleGroups();
        const groupData = styleGroups[group];
        if (!groupData?.rows?.[rowIndex]?.[cellIndex]) return;

        const cellData = groupData.rows[rowIndex][cellIndex];

        const tableId = group === "footerStyle" ? "table_footer_style" : "table_header_style";
        const td = document.querySelector(`#${tableId} tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})`);
        if (!td) return;

        const innerEl = td.querySelector(cellData.tag || "div");
        if (!innerEl) return;

        const styles = cellData.styles || {};
        Object.entries(styles).forEach(([key, val]) => {
            innerEl.style[key] = val;
        });
    }
}