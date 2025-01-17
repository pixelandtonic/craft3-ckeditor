<?php

namespace craft\ckeditor\helpers;

use Craft;

final class CkeditorConfig
{
    public static function toolbarItems(): array
    {
        return self::normalizeToolbarItems([
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
        ]);
    }


    public static function pluginButtonMap(): array
    {
        return [
            [
                'plugins' => ['Alignment'],
                'buttons' => ['alignment']
            ],
            // ['plugins' => ['Anchor'], 'buttons' => ['anchor']],
            [
                'plugins' => [
                    'AutoImage',
                    // 'CraftImageInsertUI',
                    'Image',
                    'ImageCaption',
                    'ImageStyle',
                    'ImageToolbar',
                    'ImageTransform',
                    'ImageEditor',
                    'LinkImage',
                ],
                'buttons' => ['insertImage']
            ],
            [
                'plugins' => ['AutoLink', 'CraftLinkUI', 'LinkEditing', 'LinkImage'],
                'buttons' => ['link']
            ],
            [
                'plugins' => ['BlockQuote'],
                'buttons' => ['blockQuote']
            ],
            [
                'plugins' => ['Bold'],
                'buttons' => ['bold']
            ],
            [
                'plugins' => ['Code'],
                'buttons' => ['code']
            ],
            [
                'plugins' => ['CodeBlock'],
                'buttons' => ['codeBlock']
            ],
            [
                'plugins' => ['List', 'ListProperties'],
                'buttons' => ['bulletedList', 'numberedList']
            ],
            [
                'plugins' => ['Font'],
                'buttons' => ['fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor']
            ],
            [
                'plugins' => ['FindAndReplace'],
                'buttons' => ['findAndReplace']
            ],
            [
                'plugins' => ['Heading'],
                'buttons' => ['heading']
            ],
            [
                'plugins' => ['HorizontalLine'],
                'buttons' => ['horizontalLine']
            ],
            [
                'plugins' => ['HtmlEmbed'],
                'buttons' => ['htmlEmbed']
            ],
            [
                'plugins' => ['Indent', 'IndentBlock'],
                'buttons' => ['outdent', 'indent']
            ],
            [
                'plugins' => ['Italic'],
                'buttons' => ['italic']
            ],
            [
                'plugins' => ['MediaEmbed', 'MediaEmbedToolbar'],
                'buttons' => ['mediaEmbed']
            ],
            [
                'plugins' => ['PageBreak'],
                'buttons' => ['pageBreak']
            ],
            [
                'plugins' => ['RemoveFormat'],
                'buttons' => ['removeFormat']
            ],
            [
                'plugins' => ['SourceEditing'],
                'buttons' => ['sourceEditing']
            ],
            [
                'plugins' => ['Strikethrough'],
                'buttons' => ['strikethrough']
            ],
            [
                'plugins' => ['Style'],
                'buttons' => ['style']
            ],
            [
                'plugins' => ['Subscript'],
                'buttons' => ['subscript']
            ],
            [
                'plugins' => ['Superscript'],
                'buttons' => ['superscript']
            ],
            [
                'plugins' => [
                    'Table',
                    'TableCaption',
                    'TableCellProperties',
                    'TableProperties',
                    'TableToolbar',
                    'TableUI',
                ],
                'buttons' => ['insertTable']
            ],
            [
                'plugins' => ['TextPartLanguage'],
                'buttons' => ['textPartLanguage']
            ],
            [
                'plugins' => ['TodoList'],
                'buttons' => ['todoList']
            ],
            [
                'plugins' => ['Underline'],
                'buttons' => ['underline']
            ],
            [
                'plugins' => ['CraftEntries'],
                'buttons' => ['createEntry']
            ]
        ];
    }

    public static function pluginsByPackage(): array
    {
        return [
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
            ],
        ];
    }

    public static function plugins(): array
    {
        return collect(self::pluginsByPackage())->flatten()->toArray();
    }

    private static function normalizeToolbarItem($item): array
    {
        if (is_string($item)) {
            return [
                ['button' => $item]
            ];
        }

        if (array_is_list($item)) {
            return collect($item)->map(fn($item) => ['button' => $item])->toArray();
        }

        return [$item];
    }

    public static function normalizeToolbarItems($items): array
    {
        return collect($items)
            ->map(fn($item) => self::normalizeToolbarItem($item))
            ->toArray();
    }
}
