<?php

namespace craft\ckeditor;

use craft\base\Component;
use Illuminate\Support\Collection;

class CkePackageManager extends Component
{
    private array $pluginsByPackage = [
        'ckeditor5' => [
            'Paragraph',
            'SelectAll',
            'Clipboard',
            'Alignment',
            // 'Anchor',
            'AutoImage',
            'AutoLink',
            'Autoformat',
            'BlockQuote',
            'Bold',
            'Code',
            'CodeBlock',
            'List',
            'ListProperties',
            'Essentials',
            'FindAndReplace',
            'Font',
            'GeneralHtmlSupport',
            'Heading',
            'HorizontalLine',
            'HtmlComment',
            'HtmlEmbed',
            'Image',
            'ImageCaption',
            'ImageStyle',
            'ImageToolbar',
            'Indent',
            'IndentBlock',
            'Italic',
            'LinkEditing',
            'LinkImage',
            'MediaEmbed',
            'MediaEmbedToolbar',
            'PageBreak',
            'PasteFromOffice',
            'RemoveFormat',
            'SourceEditing',
            'Strikethrough',
            'Style',
            'Subscript',
            'Superscript',
            'Table',
            'TableCaption',
            'TableCellProperties',
            'TableProperties',
            'TableToolbar',
            'TableUI',
            'TextPartLanguage',
            'TodoList',
            'Underline',
            'WordCount',
        ],
        '@craftcms/ckeditor' => [
            'CraftImageInsertUI',
            'ImageTransform',
            'ImageEditor',
            'CraftLinkUI',
            'CraftEntries',
        ]
    ];

    private array $toolbarItems = [
        ['button' => 'heading', 'configOption' => 'heading'],
        ['button' => 'style', 'configOption' => 'style'],
        ['button' => 'alignment', 'configOption' => 'alignment'],
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'subscript',
        'superscript',
        'code',
        'link',
        // 'anchor',
        'textPartLanguage',
        ['button' => 'fontSize', 'configOption' => 'fontSize'],
        'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        'insertImage',
        'mediaEmbed',
        'htmlEmbed',
        'blockQuote',
        'insertTable',
        'codeBlock',
        'bulletedList',
        'numberedList',
        'todoList',
        ['outdent', 'indent'],
        'horizontalLine',
        'pageBreak',
        'removeFormat',
        'selectAll',
        'findAndReplace',
        ['undo', 'redo'],
        'sourceEditing',
        'createEntry',
    ];


    public function getToolbarItems(): array
    {
        return $this->toolbarItems;
    }

    public function registerPackage(string $name, array $config): void
    {
        $this->pluginsByPackage[$name] = $config['plugins'];
        $this->toolbarItems[] = $config['toolbarItems'];
    }

    public function getPluginsByPackage(): array
    {
        return $this->pluginsByPackage;
    }

    public function getAllPlugins(): array
    {
        return collect($this->getPluginsByPackage())
            ->flatten()
            ->toArray();
    }

    public function getImportStatements(): string
    {
        return collect($this->getPluginsByPackage())
            ->reduce(function(Collection $carry, array $plugins, string $import) {
                $carry->push('import { ' . implode(', ', $plugins) . ' } from "' . $import . '";');

                return $carry;
            }, Collection::empty())->join("\n");
    }

}
