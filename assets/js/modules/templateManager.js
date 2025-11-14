// modules/templateManager.js
export class TemplateManager {
    constructor(selectorManager, styleGroups, dialogManager) {
        this.selectorManager = selectorManager;
        this.styleGroups = styleGroups;
        this.dialogManager = dialogManager;
        this.templateSelector = document.getElementById('report_generator_templateSelector');
    }

    async fetchTemplateList() {
        try {
            const response = await fetch('/src/download.php?action=get_template_list');
            if (!response.ok) throw new Error('Failed to retrieve template list');
            
            const templates = await response.json();
            this.updateTemplateSelector(templates);
            return templates;
        } catch (error) {
            console.error('Fetch Template List Error:', error);
            await this.dialogManager.showCustomAlert(
                'Failed to fetch template list.',
                { showCancel: false }
            );
            throw error;
        }
    }

    updateTemplateSelector(templates) {
        // Clear existing options except the first one
        while (this.templateSelector.options.length > 1) {
            this.templateSelector.remove(1);
        }

        // Add template options
        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template;
            option.textContent = template.replace('.json', '');
            this.templateSelector.appendChild(option);
        });
    }

    async saveTemplate(buildPDFParams) {
        try {
            const templates = await this.fetchTemplateList();
            
            let filename = await this.dialogManager.showCustomPrompt(
                "Save New Template",
                templates,
                this.templateSelector.value
            );
            // Remove .json extension if present
            if (filename.endsWith('.json')) {
                filename = filename.replace('.json', '');
            }

            // Auto-increment filename if exists
            let finalFilename = filename;
            let counter = 1;
            while (templates.includes(finalFilename + '.json')) {
                finalFilename = `${filename}(${counter})`;
                counter++;
            }

            const params = buildPDFParams({ action: 'save_template_PDF' });
            params.append('filename', finalFilename);

            const url = `/src/download.php?${params.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to save template');
            const template = await response.json();
            await this.dialogManager.showCustomAlert(
                `Template successfully saved as: ${template.filename}`,
                { showCancel: false }
            );

            // Refresh and select new template
            await this.fetchTemplateList();
            this.templateSelector.value = finalFilename + '.json';

        } catch (error) {
            console.error('Save Template Error:', error);
            if (error !== 'cancelled') {
                await this.dialogManager.showCustomAlert(
                    'Failed to save template.',
                    { showCancel: false }
                );
            }
        }
    }

    async saveAsTemplate(buildPDFParams) {
        try {
            const templates = await this.fetchTemplateList();
            
            let filename = await this.dialogManager.showCustomPrompt(
                "Save As Template",
                templates,
                this.templateSelector.value
            );

            if (!filename) return;

            // Remove .json extension if present
            if (filename.endsWith('.json')) {
                filename = filename.replace('.json', '');
            }

            // Check if template exists and confirm overwrite
            if (templates.includes(filename + '.json')) {
                const overwrite = await this.dialogManager.showCustomAlert(
                    `Template "${filename}" already exists. Do you want to replace it?`,
                    { okText: 'Yes', cancelText: 'Cancel', showCancel: true }
                );
                
                if (!overwrite) return;
            }

            const params = buildPDFParams({ action: 'save_template_PDF' });
            params.append('filename', filename);

            const url = `/src/download.php?${params.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Failed to save template');

            await this.dialogManager.showCustomAlert(
                `Template successfully saved as: ${filename}`,
                { showCancel: false }
            );

            // Refresh and select new template
            await this.fetchTemplateList();
            this.templateSelector.value = filename + '.json';

        } catch (error) {
            console.error('Save As Template Error:', error);
            if (error !== 'cancelled') {
                await this.dialogManager.showCustomAlert(
                    'Failed to save template.',
                    { showCancel: false }
                );
            }
        }
    }

    async loadTemplate(filename, PDFDesigner, updateFormInputsFromTemplate, setPreviewSize, generatePreview) {
        try {
            const response = await fetch(`/src/download.php?action=load_template&filename=${encodeURIComponent(filename)}`);
            if (!response.ok) throw new Error('Failed to load template');

            const template = await response.json();
            if (!template) throw new Error('Empty template');

            // Process paper size (handle custom dimensions)
            let paperSizeValue = template.paperSize || 'A4';
            let customWidthValue = template.customWidth || '210';
            let customHeightValue = template.customHeight || '297';

            if (Array.isArray(paperSizeValue) && paperSizeValue.length >= 2) {
                paperSizeValue = 'custom';
                customWidthValue = paperSizeValue[0].toString();
                customHeightValue = paperSizeValue[1].toString();
            } else if (typeof paperSizeValue === 'string' && paperSizeValue.startsWith('[') && paperSizeValue.endsWith(']')) {
                try {
                    const sizeArray = JSON.parse(paperSizeValue);
                    if (Array.isArray(sizeArray) && sizeArray.length >= 2) {
                        paperSizeValue = 'custom';
                        customWidthValue = sizeArray[0].toString();
                        customHeightValue = sizeArray[1].toString();
                    }
                } catch (e) {
                    console.warn('Failed to parse paperSize as array:', e);
                }
            }

            // Update selector values
            if (PDFDesigner && PDFDesigner.updateSelectorValues) {
                PDFDesigner.updateSelectorValues({
                    paperSize: paperSizeValue,
                    paperOrientation: template.paperOrientation || 'portrait',
                    metaTitle: template.metaTitle || '',
                    metaAuthor: template.metaAuthor || '',
                    metaSubject: template.metaSubject || '',
                    customWidth: customWidthValue,
                    customHeight: customHeightValue,
                });
            }

            // Update custom headers
            for (const key in template.customHeaders) {
                if (this.selectorManager.selectors[`header_${key}`]) {
                    this.selectorManager.selectors[`header_${key}`].content = template.customHeaders[key];
                } else {
                    this.selectorManager.selectors[`header_${key}`] = { content: template.customHeaders[key] };
                }
            }

            // Update style groups
            this.styleGroups.headerTableStyle = template.headerTableStyle || {};
            this.styleGroups.rowTableStyle = template.rowTableStyle || {};
            this.styleGroups.tableStyle = template.tableStyle || {};
            this.styleGroups.columnWidths = template.columnWidths || [];
            this.styleGroups.bodyStyle = template.bodyStyle || {};
            this.styleGroups.headerStyle = template.headerStyle || { rows: [] };
            this.styleGroups.footerStyle = template.footerStyle || { rows: [] };
            this.styleGroups.headerDisplayRule = template.headerDisplayRule || 'every-page';
            this.styleGroups.footerDisplayRule = template.footerDisplayRule || 'every-page';
            this.styleGroups.pageNumberPosition = template.pageNumberPosition || 'none';

            // Update form and preview
            if (updateFormInputsFromTemplate) {
                updateFormInputsFromTemplate({
                    ...template,
                    paperSize: paperSizeValue,
                    customWidth: customWidthValue,
                    customHeight: customHeightValue
                });
            }

            if (setPreviewSize) setPreviewSize();
            
            // Trigger preview generation
            setTimeout(() => {
                if (generatePreview) generatePreview();
            }, 200);

            console.log('Template loaded successfully:', filename);

        } catch (error) {
            console.error('Load Template Error:', error);
            await this.dialogManager.showCustomAlert(
                'Failed to load template. Please try again.',
                { showCancel: false }
            );
        }
    }

    async editTemplate() {
        try {
            const selectedValue = this.templateSelector.value;
            if (!selectedValue) {
                await this.dialogManager.showCustomAlert(
                    'Please select a template to edit.',
                    { showCancel: false }
                );
                return;
            }

            const templates = await this.fetchTemplateList();
            
            const newName = await this.dialogManager.showCustomPrompt(
                `Rename Template "${selectedValue}"`,
                templates,
                selectedValue
            );

            if (!newName || newName.trim() === '' || newName === selectedValue) {
                return;
            }

            const response = await fetch('/src/download.php?action=edit_template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oldName: selectedValue,
                    newName: newName.trim()
                })
            });

            const result = await response.json();

            if (result.success) {
                await this.dialogManager.showCustomAlert(
                    `Template renamed to "${newName}"`,
                    { showCancel: false }
                );
                await this.fetchTemplateList();
            } else {
                await this.dialogManager.showCustomAlert(
                    result.error || 'Failed to rename template.',
                    { showCancel: false }
                );
            }

        } catch (error) {
            console.error('Edit Template Error:', error);
            if (error !== 'cancelled') {
                await this.dialogManager.showCustomAlert(
                    'Failed to rename template.',
                    { showCancel: false }
                );
            }
        }
    }

    async deleteTemplate() {
        try {
            const selectedValue = this.templateSelector.value;
            if (!selectedValue) {
                await this.dialogManager.showCustomAlert(
                    'Please select a template to delete.',
                    { showCancel: false }
                );
                return;
            }

            const confirmDelete = await this.dialogManager.showCustomAlert(
                `Are you sure you want to delete template "${selectedValue}"?`,
                { okText: 'Delete', cancelText: 'Cancel', showCancel: true }
            );

            if (!confirmDelete) return;

            const response = await fetch(`/src/download.php?action=delete_template&filename=${encodeURIComponent(selectedValue)}`);
            const result = await response.json();

            if (result.success) {
                await this.dialogManager.showCustomAlert(
                    `Template "${selectedValue}" deleted successfully.`,
                    { showCancel: false }
                );
                await this.fetchTemplateList();
            } else {
                await this.dialogManager.showCustomAlert(
                    result.error || 'Failed to delete template.',
                    { showCancel: false }
                );
            }

        } catch (error) {
            console.error('Delete Template Error:', error);
            await this.dialogManager.showCustomAlert(
                'Failed to delete template.',
                { showCancel: false }
            );
        }
    }
}