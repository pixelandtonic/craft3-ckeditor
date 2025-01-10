<?php
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */

namespace craft\ckeditor\web\assets\ckeditor;

use Craft;
use craft\base\ElementInterface;
use craft\base\Event;
use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;
use craft\helpers\App;
use craft\helpers\Json;
use craft\web\assets\cp\CpAsset;
use craft\web\View;

/**
 * CKEditor custom build asset bundle
 *
 * @since 3.0.0
 */
class CkeditorAsset extends BaseCkeditorPackageAsset
{
    /**
     * @event Event The event that is triggered when asset bundle is published.
     * @see registerCkeditorAsset()
     * @since 3.4.0
     * @deprecated in 3.5.0. [[\craft\ckeditor\Plugin::registerCkeditorPackage()]] should be used instead.
     */
    public const EVENT_PUBLISH = 'publish';

    /**
     * @inheritdoc
     */
    public $sourcePath = __DIR__ . '/build';

    /**
     * @inheritdoc
     */
    public $depends = [
        CpAsset::class,
    ];

    /**
     * @inheritdoc
     */
    public $js = [
        ['ckeditor5-craftcms.js', 'type' => 'module']
    ];

    /**
     * @inheritdoc
     */
    public $css = [
        'lib/ckeditor5.css',
        'ckeditor.css',
    ];

    public function registerAssetFiles($view): void
    {
        parent::registerAssetFiles($view);

        if ($view instanceof View) {
            $this->registerRefHandles($view);
            $view->registerTranslations('app', [
                'Edit {type}',
            ]);
            $view->registerTranslations('ckeditor', [
                'Entries cannot be copied between CKEditor fields.',
                'Entry toolbar',
                'Entry types list',
                'Insert link',
                'Link to the current site',
                'Site: {name}',
                'This field doesn’t allow nested entries.',
            ]);

            $assetManager = Craft::$app->getAssetManager();

            $view->registerJsImport('ckeditor5', $this->baseUrl . '/lib/ckeditor5.js');
            $view->registerJsImport('ckeditor5/', $this->baseUrl . '/lib/');
            $view->registerJsImport('@craftcms/ckeditor', $assetManager->getAssetUrl($this, 'ckeditor5-craftcms.js'));

            $view->registerJsWithVars(fn($attach) => <<<JS
Craft.showCkeditorInspector = $attach;
JS, [
                (bool)App::env('CRAFT_SHOW_CKEDITOR_INSPECTOR'),
], View::POS_END);
        }
    }

    private function registerRefHandles(View $view): void
    {
        $refHandles = [];

        foreach (Craft::$app->getElements()->getAllElementTypes() as $elementType) {
            /** @var string|ElementInterface $elementType */
            if ($elementType::isLocalized() && ($refHandle = $elementType::refHandle()) !== null) {
                $refHandles[] = $refHandle;
            }
        }

        $view->registerScriptWithVars(fn($refHandles) => <<<JS
import {setLocalizedRefHandles} from '@craftcms/ckeditor';
setLocalizedRefHandles($refHandles);
JS, [$refHandles], View::POS_END, ['type' => 'module']);
    }
}
