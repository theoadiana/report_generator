## Report Generator by theob
v1.0.0

## Overview
    Report Generator is a PHP library for generating dynamic reports in various formats (PDF, Excel, CSV) with customizable templates and a visual query builder.

## Installation
* Requirements
    - "php": "^7.4|^8.0"
    - "phpoffice/phpspreadsheet": "^2.1"
    - "dompdf/dompdf": "^3.1"
    - Composer
    - PHP Extensions: PDO, GD, MBString

* Install via Composer
    - composer require theob/report-generator

## How to install
* Open the terminal, type 
    composer require theob/report-generator
* Open vendor/theob/report-generator/composer.json adn run
    "post-install-cmd": [
        "php scripts/make-config.php",
        "php scripts/make-example.php"
    ]
* Open reportGenerator.config.php
    change host, dbname, username, password according to your project



## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Bug Reports
If you discover any bugs, please create an issue on GitHub Issues.

## Support
* Documentation: GitHub Wiki
* Issues: GitHub Issues
* Email: theobenitoadiana@gmail.com

Happy Reporting!

