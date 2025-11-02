// modules/styleManager.js
export class StyleManager {
    constructor() {
        this.styleGroups = {
            headerTableStyle: {
                'font-size': '16px',
                'font-weight': 'bold',
                'color': '#000000',
                'text-align': 'center',
                'background-color': '#ffffff',
                'border': '1px solid #000000',
                'line-height': '1.1',
            },
            rowTableStyle: {
                'font-size': '12px',
                'font-weight': 'normal',
                'color': '#000000',
                'text-align': 'left',
                'background-color': '#f9f9f9',
                'border': '1px solid #000000',
                'padding': '6px',
                'line-height': '1.1',
            },
            tableStyle: {
                'width': '100%',
                'border-collapse': 'collapse',
                'table-layout': 'fixed',
                'word-wrap': 'break-word',
            },
            bodyStyle: {
                'box-sizing': 'border-box',
                'font-family': 'Arial, sans-serif',
                'background-color': '#ffffff',
            },
            columnWidths: [],
            headerDisplayRule: "every-page",
            footerDisplayRule: "every-page",
            pageNumberPosition: "none",
            headerStyle: {
                rows: [
                    [
                        {
                            content: "Cell 1",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        },
                        {
                            content: "Cell 2",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        },
                        {
                            content: "Cell 3",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        }
                    ],
                    [
                        {
                            content: "Cell 4",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        },
                        {
                            content: "Cell 5",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        },
                        {
                            content: "Cell 6",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        }
                    ]
                ]
            },
            footerStyle: {
                rows: [
                    [
                        {
                            content: "Cell 1",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        },
                        {
                            content: "Cell 2",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        },
                        {
                            content: "Cell 3",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        }
                    ],
                    [
                        {
                            content: "Cell 4",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        },
                        {
                            content: "Cell 5",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        },
                        {
                            content: "Cell 6",
                            tag: "div",
                            colspan: 1,
                            rowspan: 1,
                            width: 120,
                            height: 25,
                            styles: {
                                "text-align": "center",
                                "font-size": "16px",
                                "font-weight": "700",
                                "background-color": "#ffffff",
                                "color": "#000000",
                            }
                        }
                    ]
                ]
            },
        };
    }

    normalizeStyleValue(attr, value) {
        // Properti yang perlu satuan px otomatis
        const pxProperties = [
            'font-size', 'padding', 'margin',
            'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
            'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
            'border-width', 'border-top-width', 'border-bottom-width', 'border-left-width', 'border-right-width'
        ];

        if (pxProperties.includes(attr) && !value.toString().endsWith('px')) {
            return value + 'px';
        }

        // Aturan khusus untuk properti 'border' yang mengandung beberapa nilai
        if (attr === 'border') {
            // value misal "1 solid #000000"
            // kita pastikan format benar, jika nilai borderWidth adalah angka tanpa satuan, tambahkan px
            let parts = value.split(' ');
            if (parts.length === 3) {
                let [width, style, color] = parts;
                if (!width.endsWith('px') && !isNaN(width)) {
                    width = width + 'px';
                }
                return [width, style, color].join(' ');
            }
            return value; // fallback jika format tidak sesuai
        }

        return value;
    }

    rgbToHex(rgb) {
        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return null;
        const hex = result
            .slice(0, 3)
            .map(x => {
                const hexPart = parseInt(x).toString(16);
                return hexPart.length === 1 ? "0" + hexPart : hexPart;
            })
            .join("");
        return "#" + hex;
    }

    getStyleString(styleObj) {
        return Object.entries(styleObj)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');
    }

    updateStyleInputsFromObject(styleGroup, styleObject) {
        document.querySelectorAll(`[data-style-group="${styleGroup}"]`).forEach(input => {
            const attr = input.dataset.styleAttr;
            if (attr && styleObject[attr] !== undefined) {
                let value = styleObject[attr];

                // Handle color values (convert rgb to hex jika perlu)
                if (attr.includes('color') && typeof value === 'string' && value.startsWith('rgb')) {
                    value = this.rgbToHex(value);
                }

                // Handle number values (remove 'px' jika ada)
                if (input.type === 'number' && typeof value === 'string' && value.endsWith('px')) {
                    value = parseFloat(value);
                }

                input.value = value;
            }
        });
    }

    updateFormInputsFromTemplate(template) {
        // Update Paper Settings
        if (template.paperSize) {
            const paperSizeSelect = document.getElementById('paperSize');
            if (paperSizeSelect) paperSizeSelect.value = template.paperSize;
        }

        if (template.paperOrientation) {
            const paperOrientationSelect = document.getElementById('paperOrientation');
            if (paperOrientationSelect) paperOrientationSelect.value = template.paperOrientation;
        }

        if (template.customWidth) {
            const customWidthInput = document.getElementById('customWidth');
            if (customWidthInput) customWidthInput.value = template.customWidth;
        }

        if (template.customHeight) {
            const customHeightInput = document.getElementById('customHeight');
            if (customHeightInput) customHeightInput.value = template.customHeight;
        }

        // Update Layout Options
        if (template.headerDisplayRule) {
            const headerDisplaySelect = document.getElementById('headerDisplayRule');
            if (headerDisplaySelect) headerDisplaySelect.value = template.headerDisplayRule;
        }

        if (template.footerDisplayRule) {
            const footerDisplaySelect = document.getElementById('footerDisplayRule');
            if (footerDisplaySelect) footerDisplaySelect.value = template.footerDisplayRule;
        }

        if (template.pageNumberPosition) {
            const pageNumberSelect = document.getElementById('pageNumberPosition');
            if (pageNumberSelect) pageNumberSelect.value = template.pageNumberPosition;
        }

        // Update Header Table Style inputs
        this.updateStyleInputsFromObject('headerTableStyle', template.headerTableStyle || {});

        // Update Row Table Style inputs  
        this.updateStyleInputsFromObject('rowTableStyle', template.rowTableStyle || {});

        // Update Body Style inputs
        this.updateStyleInputsFromObject('bodyStyle', template.bodyStyle || {});
    }

    getStyleGroups() {
        return this.styleGroups;
    }

    setStyleGroups(newStyleGroups) {
        this.styleGroups = { ...this.styleGroups, ...newStyleGroups };
    }

    updateStyleGroup(group, key, value) {
        if (!this.styleGroups[group]) {
            this.styleGroups[group] = {};
        }
        this.styleGroups[group][key] = value;
    }

    updateCellStyle(group, rowIndex, cellIndex, styleKey, styleValue) {
        if (this.styleGroups[group]?.rows?.[rowIndex]?.[cellIndex]) {
            if (!this.styleGroups[group].rows[rowIndex][cellIndex].styles) {
                this.styleGroups[group].rows[rowIndex][cellIndex].styles = {};
            }
            this.styleGroups[group].rows[rowIndex][cellIndex].styles[styleKey] = styleValue;
        }
    }
}