<?php
namespace Theob\ReportGenerator;
abstract class ExportHandler {
    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    abstract public function export(string $filename): void;
}
