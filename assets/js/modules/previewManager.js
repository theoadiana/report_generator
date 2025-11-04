// modules/previewManager.js
export class PreviewManager {
    constructor(styleManager, selectorManager) {
        this.styleManager = styleManager;
        this.selectorManager = selectorManager;
        this.cachedData = [];
    }

    setPreviewSize(preview, selectorVars) {
        console.log("📐 Setting preview size...");

        if (!preview || !selectorVars) {
            console.error("❌ Preview or selectorVars is missing");
            return;
        }

        const paperSize = selectorVars.paperSize?.value;
        const paperOrientation = selectorVars.paperOrientation?.value;

        console.log("Paper settings:", { paperSize, paperOrientation });

        // Handle custom paper size (array)
        let width, height;

        if (paperSize === 'custom') {
            // Ambil nilai custom width dan height
            const customWidth = selectorVars.customWidth?.value;
            const customHeight = selectorVars.customHeight?.value;

            console.log("Custom size inputs:", { customWidth, customHeight });

            // Parse custom size - bisa berupa string angka atau array
            if (Array.isArray(customWidth)) {
                width = customWidth[0] || 210; // Default A4 width
            } else {
                width = this.parseSizeToNumber(customWidth) || 210;
            }

            if (Array.isArray(customHeight)) {
                height = customHeight[0] || 297; // Default A4 height
            } else {
                height = this.parseSizeToNumber(customHeight) || 297;
            }

            console.log("Parsed custom size:", { width, height });
        } else {
            // Standard paper sizes
            const sizes = this.getPaperSizeInMm(paperSize, paperOrientation);
            width = sizes.width;
            height = sizes.height;

            console.log("Standard paper size:", { width, height });
        }

        // Apply to preview
        preview.style.width = `${width}mm`;
        preview.style.height = `${height}mm`;

        console.log("✅ Preview size set to:", {
            width: preview.style.width,
            height: preview.style.height
        });
    }

    // Tambahkan helper method untuk parse size
    parseSizeToNumber(sizeValue) {
        if (!sizeValue) return null;

        // Jika array, ambil elemen pertama
        if (Array.isArray(sizeValue)) {
            return parseFloat(sizeValue[0]) || null;
        }

        // Jika string, parse angka saja (hilangkan unit)
        if (typeof sizeValue === 'string') {
            // Hapus unit (mm, cm, px, dll) dan parse float
            const numericValue = parseFloat(sizeValue.replace(/[^\d.-]/g, ''));
            return isNaN(numericValue) ? null : numericValue;
        }

        // Jika sudah number, return langsung
        if (typeof sizeValue === 'number') {
            return sizeValue;
        }

        return null;
    }

    // Pastikan method getPaperSizeInMm sudah ada
    getPaperSizeInMm(paperSize, orientation = 'portrait') {
        const sizes = {
            'A4': { width: 210, height: 297 },
            'A3': { width: 297, height: 420 },
            'A5': { width: 148, height: 210 },
            'A6': { width: 105, height: 148 },
            'Letter': { width: 216, height: 279 },
            'Legal': { width: 216, height: 356 }
        };

        let size = sizes[paperSize] || sizes['A4'];

        if (orientation === 'landscape') {
            size = { width: size.height, height: size.width };
        }

        return size;
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