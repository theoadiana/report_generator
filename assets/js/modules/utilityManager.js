// modules/utilityManager.js
export class UtilityManager {
    constructor(styleManager, manager) {
        this.styleManager = styleManager;
        this.manager = manager;
    }

    buildStyleStructureFromDOM(tableId = "table_header_style") {
        const table = document.getElementById(tableId);
        const styleStructure = { rows: [] };

        if (!table) return styleStructure;

        const rows = table.querySelectorAll("tr");

        // Hitung jumlah kolom maksimum dengan mempertimbangkan colspan
        let maxCols = 0;
        const colSpans = [];

        rows.forEach(tr => {
            const cells = tr.querySelectorAll("td");
            let colIndex = 0;
            let rowCols = 0;

            cells.forEach(td => {
                const colspan = parseInt(td.getAttribute('colspan')) || 1;
                rowCols += colspan;
            });

            maxCols = Math.max(maxCols, rowCols);
        });

        // Hitung total lebar dari semua kolom
        let totalWidth = 0;
        const columnWidths = new Array(maxCols).fill(0);

        rows.forEach(tr => {
            const cells = tr.querySelectorAll("td");
            let colIndex = 0;

            cells.forEach(td => {
                const colspan = parseInt(td.getAttribute('colspan')) || 1;
                const widthPx = td.offsetWidth || 0;
                const widthPerCol = widthPx / colspan;

                for (let i = 0; i < colspan; i++) {
                    if (colIndex + i < maxCols) {
                        columnWidths[colIndex + i] = Math.max(columnWidths[colIndex + i], widthPerCol);
                    }
                }
                colIndex += colspan;
            });
        });

        totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

        // Bangun struktur data
        rows.forEach(tr => {
            const row = [];
            const cells = tr.querySelectorAll("td");
            let colIndex = 0;

            cells.forEach(td => {
                const tag = td.dataset.tag || 'div';
                const colspan = parseInt(td.getAttribute('colspan')) || 1;
                const rowspan = parseInt(td.getAttribute('rowspan')) || 1;
                const widthPx = td.offsetWidth || 0;
                const heightPx = td.offsetHeight || 0;

                const width = totalWidth > 0 ? ((widthPx / totalWidth) * 100).toFixed(2) + '%' : 'auto';
                const height = heightPx;

                const styleObj = {};
                const extractStyles = (styleText) => {
                    styleText.split(';').forEach(rule => {
                        if (rule.includes(':')) {
                            const [key, value] = rule.split(':');
                            if (key && value) {
                                styleObj[key.trim()] = value.trim();
                            }
                        }
                    });
                };

                extractStyles(td.style.cssText);
                const inner = td.querySelector("*");
                if (inner && inner.style) {
                    extractStyles(inner.style.cssText);
                }

                const tempClone = td.cloneNode(true);
                tempClone.querySelectorAll(".drag-handle, .btn-remove-cell, .btn-add-cell, button, .btn-add, .btn-delete").forEach(el => el.remove());
                const content = tempClone.textContent.trim();

                row.push({
                    content,
                    tag,
                    colspan,
                    rowspan,
                    width,
                    height,
                    styles: styleObj
                });

                colIndex += colspan;
            });

            styleStructure.rows.push(row);
        });

        return styleStructure;
    }

    updateStyleGroupsFromInputs(styleGroups) {
        document.querySelectorAll('[data-style-group]').forEach(input => {
            const group = input.dataset.styleGroup;
            const attr = input.dataset.styleAttr;
            let value = input.value;

            value = this.styleManager.normalizeStyleValue(attr, value);

            if (group === 'headerStyleCell' || group === 'footerStyleCell') {
                const tableId = group === 'headerStyleCell' ? 'table_header_style' : 'table_footer_style';
                const styleKey = group === 'headerStyleCell' ? 'headerStyle' : 'footerStyle';

                const selectedTd = document.querySelector(`#${tableId} td.selected-td`);
                if (!selectedTd) return;

                const rowIndex = selectedTd.parentElement.rowIndex;
                const cellIndex = selectedTd.cellIndex;

                const cell = styleGroups[styleKey]?.rows?.[rowIndex]?.[cellIndex];
                if (!cell) return;

                if (!cell.styles) cell.styles = {};
                cell.styles[attr] = value;

                const inner = selectedTd.querySelector("*");
                if (inner) inner.style.setProperty(attr, value);
            } else {
                if (!styleGroups[group]) styleGroups[group] = {};
                styleGroups[group][attr] = value;
            }
        });
    }

    initStyleCellInputs(styleGroups, previewManager, group = "headerStyle") {
        const inputs = document.querySelectorAll(`[data-style-group='${group}Cell']`);
        inputs.forEach(input => {
            input.addEventListener("input", (e) => {
                const attr = e.target.dataset.styleAttr;
                const value = e.target.value;
                const selected = document.querySelector("td.selected-td");
                if (!selected) return;

                const rowIndex = selected.parentElement.rowIndex;
                const cellIndex = selected.cellIndex;

                const cell = styleGroups?.[group]?.rows?.[rowIndex]?.[cellIndex];
                if (!cell) return;

                if (!cell.styles) cell.styles = {};

                const pxProps = ["font-size", "padding", "border-width", "width", "height"];
                const styleValue = pxProps.includes(attr) && !value.includes("px") ? `${value}px` : value;

                cell.styles[attr] = styleValue;

                previewManager.updateSingleCellStyle(rowIndex, cellIndex, group);
            });
        });
    }

    updateSelectorTable(manager) {
        const tableBody = document.getElementById("selectorTableBody");
        tableBody.innerHTML = "";

        const hiddenFields = [
            "paperSize", "paperOrientation", "metaTitle", "metaAuthor", "metaSubject", 
            "customWidth", "customHeight",
        ];

        const entries = Object.entries(manager.selectors);
        let visibleIndex = 1;

        entries.forEach(([id, el]) => {
            if (hiddenFields.includes(id)) return;

            const value = el.content || "";
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="p-2 border text-center">${visibleIndex++}</td>
                <td class="p-2 border">${id}</td>
                <td class="p-2 border">
                    <select class="tagNameDropdown" data-id="${id}">
                        <option value="div" ${el.tagName === "div" ? "selected" : ""}>div</option>
                        <option value="span" ${el.tagName === "span" ? "selected" : ""}>span</option>
                        <option value="h1" ${el.tagName === "h1" ? "selected" : ""}>h1</option>
                        <option value="p" ${el.tagName === "p" ? "selected" : ""}>p</option>
                        <option value="a" ${el.tagName === "a" ? "selected" : ""}>a</option>
                        <option value="button" ${el.tagName === "button" ? "selected" : ""}>button</option>
                        <option value="img" ${el.tagName === "img" ? "selected" : ""}>img</option>
                    </select>
                </td>
                <td class="p-2 border">
                    <input type="text" class="contentInput" data-id="${id}" value="${value}" placeholder="Isi konten atau src img">
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Dropdown event handler
        document.querySelectorAll(".tagNameDropdown").forEach((dropdown) => {
            dropdown.addEventListener("change", (e) => {
                const id = e.target.getAttribute("data-id");
                const selectedTag = e.target.value;
                manager.updateTagName(id, selectedTag);
                this.updateSelectorTable(manager);
                this.updateHTMLPreview(manager);
            });
        });

        // Input konten event handler
        document.querySelectorAll(".contentInput").forEach((input) => {
            input.addEventListener("input", (e) => {
                const id = e.target.getAttribute("data-id");
                const value = e.target.value;
                if (manager.selectors[id]) {
                    manager.selectors[id].content = value;
                    this.updateHTMLPreview(manager);
                }
            });
        });
    }

    updateHTMLPreview(manager) {
        const previewContainer = document.getElementById("htmlPreview");
        const selectors = manager.getAllValues();

        let htmlCode = "";
        for (const [id, selector] of Object.entries(selectors)) {
            htmlCode += `<${selector.tagName} id="${id}">Content of ${id}</${selector.tagName}>\n`;
        }

        previewContainer.textContent = htmlCode;
    }

    enableHeaderFooterRulesControls(styleGroups, cachedData, renderPreview) {
        const headerRuleDisplaySelect = document.getElementById("headerDisplayRule");
        const footerRuleDisplaySelect = document.getElementById("footerDisplayRule");
        const pageNumberPositionSelect = document.getElementById("pageNumberPosition");

        if (headerRuleDisplaySelect) {
            headerRuleDisplaySelect.addEventListener("change", (e) => {
                styleGroups.headerDisplayRule = e.target.value;
                console.log("Header display rule:", styleGroups.headerDisplayRule);
                if (cachedData.length > 0) {
                    renderPreview(cachedData);
                }
            });
        }

        if (footerRuleDisplaySelect) {
            footerRuleDisplaySelect.addEventListener("change", (e) => {
                styleGroups.footerDisplayRule = e.target.value;
                console.log("Footer display rule:", styleGroups.footerDisplayRule);
                if (cachedData.length > 0) {
                    renderPreview(cachedData);
                }
            });
        }

        if (pageNumberPositionSelect) {
            pageNumberPositionSelect.addEventListener("change", (e) => {
                styleGroups.pageNumberPosition = e.target.value;
                console.log("Page number position:", styleGroups.pageNumberPosition);
            });
        }

        // Set nilai default jika belum ada
        if (!styleGroups.headerDisplayRule) {
            styleGroups.headerDisplayRule = "every-page";
            if (headerRuleDisplaySelect) headerRuleDisplaySelect.value = "every-page";
        }
        if (!styleGroups.footerDisplayRule) {
            styleGroups.footerDisplayRule = "every-page";
            if (footerRuleDisplaySelect) footerRuleDisplaySelect.value = "every-page";
        }
        if (!styleGroups.pageNumberPosition) {
            styleGroups.pageNumberPosition = "none";
            if (pageNumberPositionSelect) pageNumberPositionSelect.value = "none";
        }
    }
}