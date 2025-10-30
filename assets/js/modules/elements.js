export const elements = {
    downloadButton: null,
    saveTemplateButton: null,
    saveAsTemplateButton: null,
    deleteTemplateButton: null,
    editTemplateButton: null,
    templateSelector: null,
    queryExecuteButton: null,
    headerRuleSelect: null,
    footerRuleSelect: null,
    pageNumberPositionSelect: null,

    initialize() {
        this.downloadButton = document.getElementById("report_generator_downloadPDF");
        this.saveTemplateButton = document.getElementById("report_generator_saveTemplatePDF");
        this.saveAsTemplateButton = document.getElementById("report_generator_saveAsTemplatePDF");
        this.deleteTemplateButton = document.getElementById("report_generator_deleteTemplatePDF");
        this.editTemplateButton = document.getElementById("report_generator_editTemplatePDF");
        this.templateSelector = document.getElementById('report_generator_templateSelector');
        this.queryExecuteButton = document.getElementById("report_generator_queryExecute");
        this.headerRuleSelect = document.getElementById("headerDisplayRule");
        this.footerRuleSelect = document.getElementById("footerDisplayRule");
        this.pageNumberPositionSelect = document.getElementById("pageNumberPosition");
    }
};