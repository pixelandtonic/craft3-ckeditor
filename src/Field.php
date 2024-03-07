<?php
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */

namespace craft\ckeditor;

use Craft;
use craft\base\ElementContainerFieldInterface;
use craft\base\ElementInterface;
use craft\base\FieldInterface;
use craft\base\NestedElementInterface;
use craft\behaviors\EventBehavior;
use craft\ckeditor\events\DefineLinkOptionsEvent;
use craft\ckeditor\events\ModifyConfigEvent;
use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;
use craft\ckeditor\web\assets\ckeditor\CkeditorAsset;
use craft\controllers\GraphqlController;
use craft\db\FixedOrderExpression;
use craft\db\Query;
use craft\db\Table;
use craft\elements\Asset;
use craft\elements\Category;
use craft\elements\db\ElementQuery;
use craft\elements\db\EntryQuery;
use craft\elements\Entry;
use craft\elements\NestedElementManager;
use craft\elements\User;
use craft\enums\PropagationMethod;
use craft\errors\InvalidHtmlTagException;
use craft\events\CancelableEvent;
use craft\events\DuplicateNestedElementsEvent;
use craft\helpers\ArrayHelper;
use craft\helpers\Cp;
use craft\helpers\Html;
use craft\helpers\Json;
use craft\helpers\UrlHelper;
use craft\htmlfield\events\ModifyPurifierConfigEvent;
use craft\htmlfield\HtmlField;
use craft\htmlfield\HtmlFieldData;
use craft\i18n\Locale;
use craft\models\CategoryGroup;
use craft\models\EntryType;
use craft\models\ImageTransform;
use craft\models\Section;
use craft\models\Volume;
use craft\services\ElementSources;
use craft\web\View;
use HTMLPurifier_Config;
use HTMLPurifier_Exception;
use HTMLPurifier_HTMLDefinition;
use Illuminate\Support\Collection;
use yii\base\InvalidArgumentException;
use yii\base\InvalidConfigException;
use yii\db\Exception;

/**
 * CKEditor field type
 *
 * @author Pixel & Tonic, Inc. <support@pixelandtonic.com>
 */
class Field extends HtmlField implements ElementContainerFieldInterface
{
    /**
     * @event ModifyPurifierConfigEvent The event that is triggered when creating HTML Purifier config
     *
     * Plugins can get notified when HTML Purifier config is being constructed.
     *
     * ```php
     * use craft\htmlfield\events\ModifyPurifierConfigEvent;
     * use craft\ckeditor\Field;
     * use HTMLPurifier_Config;
     * use yii\base\Event;
     *
     * Event::on(
     *     Field::class,
     *     Field::EVENT_MODIFY_PURIFIER_CONFIG,
     *     function(ModifyPurifierConfigEvent $event) {
     *         // @var HTMLPurifier_Config $config
     *         $config = $event->config;
     *         // ...
     *     }
     * );
     * ```
     */
    public const EVENT_MODIFY_PURIFIER_CONFIG = 'modifyPurifierConfig';

    /**
     * @event DefineLinkOptionsEvent The event that is triggered when registering the link options for the field.
     * @since 3.0.0
     */
    public const EVENT_DEFINE_LINK_OPTIONS = 'defineLinkOptions';

    /**
     * @event ModifyConfigEvent The event that is triggered when registering the link options for the field.
     * @since 3.1.0
     */
    public const EVENT_MODIFY_CONFIG = 'modifyConfig';

    /**
     * @var NestedElementManager[]
     */
    private static array $entryManagers = [];
    
    /**
     * @inheritdoc
     */
    public static function displayName(): string
    {
        return 'CKEditor';
    }

    /**
     * @inheritdoc
     */
    public static function icon(): string
    {
        return '@craft/ckeditor/icon.svg';
    }

    /**
     * @return array Returns the default `language.textPartLanguage` config option that should be used.
     * @since 3.5.0
     * @see https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-LanguageConfig.html#member-textPartLanguage
     */
    public static function textPartLanguage(): array
    {
        return Collection::make(Craft::$app->getI18n()->getSiteLocales())
            ->map(fn(Locale $locale) => array_filter([
                'title' => $locale->getDisplayName(Craft::$app->language),
                'languageCode' => $locale->id,
                'textDirection' => $locale->getOrientation() === 'rtl' ? 'rtl' : null,
            ]))
            ->sortBy('title')
            ->values()
            ->all();
    }

    /**
     * Returns the nested element manager for a given CKEditor field.
     *
     * @param self $field
     * @return NestedElementManager
     */
    public static function entryManager(self $field): NestedElementManager
    {
        if (!isset(self::$entryManagers[$field->id])) {
            self::$entryManagers[$field->id] = $entryManager = new NestedElementManager(
                Entry::class,
                fn(ElementInterface $owner) => self::createEntryQuery($owner, $field),
                [
                    'field' => $field,
                    'propagationMethod' => match ($field->translationMethod) {
                        self::TRANSLATION_METHOD_NONE => PropagationMethod::All,
                        self::TRANSLATION_METHOD_SITE => PropagationMethod::None,
                        self::TRANSLATION_METHOD_SITE_GROUP => PropagationMethod::SiteGroup,
                        self::TRANSLATION_METHOD_LANGUAGE => PropagationMethod::Language,
                        self::TRANSLATION_METHOD_CUSTOM => PropagationMethod::Custom,
                    },
                    'propagationKeyFormat' => $field->translationKeyFormat,
                    'criteria' => [
                        'fieldId' => $field->id,
                    ],
                    'valueGetter' => function(ElementInterface $owner, bool $fetchAll = false) use ($field) {
                        $entryIds = array_merge(...array_map(function(self $fieldInstance) use ($owner) {
                            $value = $owner->getFieldValue($fieldInstance->handle);
                            preg_match_all('/<craft-entry\s+data-entry-id="(\d+)"[^>]*>/i', $value, $matches);
                            return array_map(fn($match) => (int)$match, $matches[1]);
                        }, self::fieldInstances($owner, $field)));

                        $query = self::createEntryQuery($owner, $field);
                        $query->where(['in', 'elements.id', $entryIds]);
                        if (!empty($entryIds)) {
                            $query->orderBy(new FixedOrderExpression('elements.id', $entryIds, Craft::$app->getDb()));
                        }

                        return $query;
                    },
                    'valueSetter' => false,
                ],
            );
            $entryManager->on(
                NestedElementManager::EVENT_AFTER_DUPLICATE_NESTED_ELEMENTS,
                function(DuplicateNestedElementsEvent $event) use ($field) {
                    self::afterDuplicateNestedElements($event, $field);
                },
            );
            $entryManager->on(
                NestedElementManager::EVENT_AFTER_CREATE_REVISIONS,
                function(DuplicateNestedElementsEvent $event) use ($field) {
                    self::afterCreateRevisions($event, $field);
                },
            );
        }

        return self::$entryManagers[$field->id];
    }

    private static function fieldInstances(ElementInterface $element, self $field): array
    {
        $customFields = $element->getFieldLayout()?->getCustomFields() ?? [];
        return array_values(array_filter($customFields, fn(FieldInterface $f) => $f->id === $field->id));
    }

    private static function createEntryQuery(?ElementInterface $owner, self $field): EntryQuery
    {
        $query = Entry::find();

        // Existing element?
        if ($owner && $owner->id) {
            $query->attachBehavior(self::class, new EventBehavior([
                ElementQuery::EVENT_BEFORE_PREPARE => function(
                    CancelableEvent $event,
                    EntryQuery $query,
                ) use ($owner) {
                    $query->ownerId = $owner->id;

                    // Clear out id=false if this query was populated previously
                    if ($query->id === false) {
                        $query->id = null;
                    }

                    // If the owner is a revision, allow revision entries to be returned as well
                    if ($owner->getIsRevision()) {
                        $query
                            ->revisions(null)
                            ->trashed(null);
                    }
                },
            ], true));

            // Prepare the query for lazy eager loading
            $query->prepForEagerLoading($field->handle, $owner);
        } else {
            $query->id = false;
        }

        $query
            ->fieldId($field->id)
            ->siteId($owner->siteId ?? null);

        return $query;
    }

    private static function afterDuplicateNestedElements(DuplicateNestedElementsEvent $event, self $field): void
    {
        $oldEntryIds = array_keys($event->newElementIds);
        $newElementIds = array_values($event->newElementIds);
        self::adjustFieldValues($event->target, $field, $oldEntryIds, $newElementIds, true);
    }

    private static function afterCreateRevisions(DuplicateNestedElementsEvent $event, self $field): void
    {
        $revisionOwners = [
            $event->target,
            ...$event->target->getLocalized()->status(null)->all(),
        ];

        $oldElementIds = array_keys($event->newElementIds);
        $newElementIds = array_values($event->newElementIds);

        foreach ($revisionOwners as $revisionOwner) {
            self::adjustFieldValues($revisionOwner, $field, $oldElementIds, $newElementIds, false);
        }
    }

    private static function adjustFieldValues(
        ElementInterface $owner,
        self $field,
        array $oldEntryIds,
        array $newEntryIds,
        bool $propagate,
    ): void {
        $resave = false;

        foreach (self::fieldInstances($owner, $field) as $fieldInstance) {
            /** @var HtmlFieldData|null $oldValue */
            $oldValue = $owner->getFieldValue($fieldInstance->handle);
            $oldValue = $oldValue?->getRawContent();

            if (!$oldValue || empty($oldEntryIds) || $oldEntryIds === $newEntryIds) {
                continue;
            }

            // and in the field value replace elementIds from original (duplicateOf) with elementIds from the new owner
            $newValue = preg_replace_callback(
                '/(<craft-entry\sdata-entry-id=")(\d+)("[^>]*>)/i',
                function(array $match) use ($oldEntryIds, $newEntryIds) {
                    $key = array_search($match[2], $oldEntryIds);
                    if (isset($newEntryIds[$key])) {
                        return $match[1] . $newEntryIds[$key] . $match[3];
                    }
                    return $match[1] . $match[2] . $match[3];
                },
                $oldValue,
            );

            if ($oldValue !== $newValue) {
                $owner->setFieldValue($fieldInstance->handle, $newValue);
                $resave = true;
            }
        }

        if ($resave) {
            Craft::$app->getElements()->saveElement($owner, false, $propagate, false);
        }
    }

    /**
     * @var string|null The CKEditor config UUID
     * @since 3.0.0
     */
    public ?string $ckeConfig = null;

    /**
     * @var int|null The total number of words allowed.
     * @since 3.5.0
     */
    public ?int $wordLimit = null;

    /**
     * @var bool Whether the word count should be shown below the field.
     * @since 3.2.0
     */
    public bool $showWordCount = false;

    /**
     * @var string|array|null The volumes that should be available for image selection.
     * @since 1.2.0
     */
    public string|array|null $availableVolumes = '*';

    /**
     * @var string|array|null The transforms available when selecting an image.
     * @since 1.2.0
     */
    public string|array|null $availableTransforms = '*';

    /**
     * @var string|null The default transform to use.
     */
    public ?string $defaultTransform = null;

    /**
     * @var bool Whether to enable source editing for non-admin users.
     * @since 3.3.0
     */
    public bool $enableSourceEditingForNonAdmins = false;

    /**
     * @var bool Whether to show volumes the user doesn’t have permission to view.
     * @since 1.2.0
     */
    public bool $showUnpermittedVolumes = false;

    /**
     * @var bool Whether to show files the user doesn’t have permission to view, per the
     * “View files uploaded by other users” permission.
     * @since 1.2.0
     */
    public bool $showUnpermittedFiles = false;

    /**
     * @var EntryType[] The field’s available entry types
     * @see getEntryTypes()
     * @see setEntryTypes()
     */
    private array $_entryTypes = [];

    /**
     * @inheritdoc
     */
    public function __construct($config = [])
    {
        unset(
            $config['initJs'],
            $config['removeInlineStyles'],
            $config['removeEmptyTags'],
            $config['removeNbsp'],
        );

        if (isset($config['entryTypes']) && $config['entryTypes'] === '') {
            $config['entryTypes'] = [];
        }

        parent::__construct($config);
    }

    /**
     * @inheritdoc
     */
    public function init(): void
    {
        parent::init();

        if ($this->wordLimit === 0) {
            $this->wordLimit = null;
        }
    }

    /**
     * @inheritdoc
     */
    protected function defineRules(): array
    {
        return array_merge(parent::defineRules(), [
            ['wordLimit', 'number', 'min' => 1],
        ]);
    }

    /**
     * @inheritdoc
     */
    public function getElementValidationRules(): array
    {
        $rules = [];

        if ($this->wordLimit) {
            $rules[] = [
                function(ElementInterface $element) {
                    $value = strip_tags((string)$element->getFieldValue($this->handle));
                    if (
                        // regex copied from the WordCount plugin, for consistency
                        preg_match_all('/(?:[\p{L}\p{N}]+\S?)+/', $value, $matches) &&
                        count($matches[0]) > $this->wordLimit
                    ) {
                        $element->addError(
                            "field:$this->handle",
                            Craft::t('ckeditor', '{field} should contain at most {max, number} {max, plural, one{word} other{words}}.', [
                                'field' => Craft::t('site', $this->name),
                                'max' => $this->wordLimit,
                            ]),
                        );
                    }
                },
            ];
        }

        return $rules;
    }

    /**
     * @inheritdoc
     */
    public function settingsAttributes(): array
    {
        $attributes = parent::settingsAttributes();
        $attributes[] = 'entryTypes';
        return $attributes;
    }

    /**
     * @inheritdoc
     */
    public function getUriFormatForElement(NestedElementInterface $element): ?string
    {
        return null;
    }

    /**
     * @inheritdoc
     */
    public function getRouteForElement(NestedElementInterface $element): mixed
    {
        return null;
    }

    /**
     * @inheritdoc
     */
    public function getSupportedSitesForElement(NestedElementInterface $element): array
    {
        try {
            $owner = $element->getOwner();
        } catch (InvalidConfigException) {
            $owner = $element->duplicateOf;
        }

        if (!$owner) {
            return [Craft::$app->getSites()->getPrimarySite()->id];
        }

        return self::entryManager($this)->getSupportedSiteIds($owner);
    }

    /**
     * @inheritdoc
     */
    public function canViewElement(NestedElementInterface $element, User $user): ?bool
    {
        return Craft::$app->getElements()->canView($element->getOwner(), $user);
    }

    /**
     * @inheritdoc
     */
    public function canSaveElement(NestedElementInterface $element, User $user): ?bool
    {
        return Craft::$app->getElements()->canSave($element->getOwner(), $user);
    }

    /**
     * @inheritdoc
     */
    public function canDuplicateElement(NestedElementInterface $element, User $user): ?bool
    {
        return Craft::$app->getElements()->canSave($element->getOwner(), $user);
    }

    /**
     * @inheritdoc
     */
    public function canDeleteElement(NestedElementInterface $element, User $user): ?bool
    {
        return Craft::$app->getElements()->canSave($element->getOwner(), $user);
    }

    /**
     * @inheritdoc
     */
    public function canDeleteElementForSite(NestedElementInterface $element, User $user): ?bool
    {
        return Craft::$app->getElements()->canSave($element->getOwner(), $user);
    }

    /**
     * @inheritdoc
     */
    public function getSettingsHtml(): ?string
    {
        $view = Craft::$app->getView();

        $volumeOptions = [];
        foreach (Craft::$app->getVolumes()->getAllVolumes() as $volume) {
            if ($volume->getFs()->hasUrls) {
                $volumeOptions[] = [
                    'label' => $volume->name,
                    'value' => $volume->uid,
                ];
            }
        }

        $transformOptions = [];
        foreach (Craft::$app->getImageTransforms()->getAllTransforms() as $transform) {
            $transformOptions[] = [
                'label' => $transform->name,
                'value' => $transform->uid,
            ];
        }

        return $view->renderTemplate('ckeditor/_field-settings.twig', [
            'field' => $this,
            'purifierConfigOptions' => $this->configOptions('htmlpurifier'),
            'volumeOptions' => $volumeOptions,
            'transformOptions' => $transformOptions,
            'defaultTransformOptions' => array_merge([
                [
                    'label' => Craft::t('ckeditor', 'No transform'),
                    'value' => null,
                ],
            ], $transformOptions),
        ]);
    }

    /**
     * Returns the available entry types.
     *
     * @return EntryType[]
     */
    public function getEntryTypes(): array
    {
        return $this->_entryTypes;
    }

    /**
     * Sets the available entry types.
     *
     * @param array<int|string|EntryType> $entryTypes The entry types, or their IDs or UUIDs
     */
    public function setEntryTypes(array $entryTypes): void
    {
        $entriesService = Craft::$app->getEntries();

        $this->_entryTypes = array_values(array_filter(array_map(function(EntryType|string|int $entryType) use ($entriesService) {
            if (is_numeric($entryType)) {
                $entryType = $entriesService->getEntryTypeById($entryType);
            } elseif (is_string($entryType)) {
                $entryTypeUid = $entryType;
                $entryType = $entriesService->getEntryTypeByUid($entryTypeUid);
            } elseif (!$entryType instanceof EntryType) {
                throw new InvalidArgumentException('Invalid entry type');
            }
            return $entryType;
        }, $entryTypes)));
    }

    /**
     * @inheritdoc
     */
    public function getFieldLayoutProviders(): array
    {
        return $this->getEntryTypes();
    }

    /**
     * @inheritdoc
     */
    public function getSettings(): array
    {
        $settings = parent::getSettings();

        // Cleanup
        unset(
            $settings['removeInlineStyles'],
            $settings['removeEmptyTags'],
            $settings['removeNbsp'],
        );

        $settings['entryTypes'] = array_map(fn(EntryType $entryType) => $entryType->uid, $this->_entryTypes);

        return $settings;
    }

    /**
     * @inheritdoc
     */
    public function serializeValue(mixed $value, ?ElementInterface $element): mixed
    {
        if ($value instanceof HtmlFieldData) {
            $value = $value->getRawContent();
        }

        if ($value !== null) {
            // Redactor to CKEditor syntax for <figure>
            // (https://github.com/craftcms/ckeditor/issues/96)
            $value = $this->_normalizeFigures($value);
        }

        return parent::serializeValue($value, $element);
    }

    /**
     * Return HTML for the entry card or a placeholder one if entry can't be found
     *
     * @param ElementInterface $entry
     * @return string
     */
    public function getCardHtml(ElementInterface $entry): string
    {
        $isRevision = $entry->getIsRevision();

        return Cp::elementCardHtml($entry, [
            'autoReload' => !$isRevision,
            'showDraftName' => !$isRevision,
            'showStatus' => !$isRevision,
            'showThumb' => !$isRevision,
            'attributes' => [
                'class' => array_filter([$isRevision ? 'cke-entry-card' : null]),
            ],
        ]);
    }

    /**
     * @inheritdoc
     */
    public function getEagerLoadingMap(array $sourceElements): array|null|false
    {
        // Get the source element IDs
        $sourceElementIds = [];

        foreach ($sourceElements as $sourceElement) {
            $sourceElementIds[] = $sourceElement->id;
        }

        // Return any relation data on these elements, defined with this field
        $map = (new Query())
            ->select([
                'source' => 'elements_owners.ownerId',
                'target' => 'entries.id',
            ])
            ->from(['entries' => Table::ENTRIES])
            ->innerJoin(['elements_owners' => Table::ELEMENTS_OWNERS], [
                'and',
                '[[elements_owners.elementId]] = [[entries.id]]',
                ['elements_owners.ownerId' => $sourceElementIds],
            ])
            ->where(['entries.fieldId' => $this->id])
            ->orderBy(['elements_owners.sortOrder' => SORT_ASC])
            ->all();

        return [
            'elementType' => Entry::class,
            'map' => $map,
            'criteria' => [
                'fieldId' => $this->id,
                'allowOwnerDrafts' => true,
                'allowOwnerRevisions' => true,
            ],
        ];
    }

    /**
     * @inheritdoc
     */
    protected function inputHtml(mixed $value, ?ElementInterface $element, $inline): string
    {
        $view = Craft::$app->getView();
        $view->registerAssetBundle(CkeditorAsset::class);

        $ckeConfig = $this->_ckeConfig();
        $transforms = $this->_transforms();

        if ($this->defaultTransform) {
            $defaultTransform = Craft::$app->getImageTransforms()->getTransformByUid($this->defaultTransform);
        } else {
            $defaultTransform = null;
        }

        // Toolbar cleanup
        $toolbar = array_merge($ckeConfig->toolbar);

        if (!$element?->id) {
            ArrayHelper::removeValue($toolbar, 'createEntry');
        }

        if (!$this->enableSourceEditingForNonAdmins && !Craft::$app->getUser()->getIsAdmin()) {
            ArrayHelper::removeValue($toolbar, 'sourceEditing');
        }

        $toolbar = array_values($toolbar);

        $id = Html::id($this->handle);
        $idJs = Json::encode($view->namespaceInputId($id));
        $wordCountId = "$id-counts";
        $wordCountIdJs = Json::encode($view->namespaceInputId($wordCountId));

        $baseConfig = array_filter([
            'defaultTransform' => $defaultTransform?->handle,
            'elementSiteId' => $element?->siteId,
            'accessibleFieldName' => $this->_accessibleFieldName($element),
            'describedBy' => $this->_describedBy($view),
            'entryTypeOptions' => $this->_getEntryTypeOptions(),
            'findAndReplace' => [
                'uiType' => 'dropdown',
            ],
            'nestedElementAttributes' => $element?->id ? array_filter([
                'elementType' => Entry::class,
                'ownerId' => $element->id,
                'fieldId' => $this->id,
                'siteId' => Entry::isLocalized() ? $element->siteId : null,
            ]) : null,
            'heading' => [
                'options' => [
                    [
                        'model' => 'paragraph',
                        'title' => 'Paragraph',
                        'class' => 'ck-heading_paragraph',
                    ],
                    ...array_map(fn(int $level) => [
                        'model' => "heading$level",
                        'view' => "h$level",
                        'title' => "Heading $level",
                        'class' => "ck-heading_heading$level",
                    ], $ckeConfig->headingLevels ?: []),
                ],
            ],
            'image' => [
                'toolbar' => [
                    ...(!empty($transforms) ? ['transformImage', '|'] : []),
                    'toggleImageCaption',
                    'imageTextAlternative',
                ],
            ],
            'assetSources' => $this->_assetSources(),
            'assetSelectionCriteria' => $this->_assetSelectionCriteria(),
            'linkOptions' => $this->_linkOptions($element),
            'table' => [
                'contentToolbar' => [
                    'tableRow',
                    'tableColumn',
                    'mergeTableCells',
                ],
            ],
            'transforms' => $transforms,
            'ui' => [
                'viewportOffset' => ['top' => 50],
                'poweredBy' => [
                    'position' => 'inside',
                    'label' => '',
                ],
            ],
        ]);

        // Give plugins/modules a chance to modify the config
        $event = new ModifyConfigEvent([
            'baseConfig' => $baseConfig,
            'ckeConfig' => $ckeConfig,
        ]);
        $this->trigger(self::EVENT_MODIFY_CONFIG, $event);

        if (isset($ckeConfig->options)) {
            // translate the placeholder text
            if (isset($ckeConfig->options['placeholder']) && is_string($ckeConfig->options['placeholder'])) {
                $ckeConfig->options['placeholder'] = Craft::t('site', $ckeConfig->options['placeholder']);
            }

            $configOptionsJs = Json::encode($ckeConfig->options);
        } elseif (isset($ckeConfig->js)) {
            $configOptionsJs = <<<JS
(() => {
  $ckeConfig->js
})()
JS;
        } else {
            $configOptionsJs = '{}';
        }

        $baseConfigJs = Json::encode($event->baseConfig);
        $toolbarJs = Json::encode($toolbar);
        $languageJs = Json::encode([
            'ui' => BaseCkeditorPackageAsset::uiLanguage(),
            'content' => $element?->getSite()->language ?? Craft::$app->language,
            'textPartLanguage' => static::textPartLanguage(),
        ]);
        $showWordCountJs = Json::encode($this->showWordCount);
        $wordLimitJs = $this->wordLimit ?: 0;

        $view->registerJs(<<<JS
(($) => {
  const config = Object.assign($baseConfigJs, $configOptionsJs);
  if (!jQuery.isPlainObject(config.toolbar)) {
    config.toolbar = {};
  }
  config.toolbar.items = $toolbarJs;
  if (!jQuery.isPlainObject(config.language)) {
    config.language = {};
  }
  config.language = Object.assign($languageJs, config.language);
  const extraRemovePlugins = [];
  if ($showWordCountJs) {
    if (typeof config.wordCount === 'undefined') {
      config.wordCount = {};
    }
    const onUpdate = config.wordCount.onUpdate || (() => {});
    config.wordCount.onUpdate = (stats) => {
      const statText = [];
      if (config.wordCount.displayWords || typeof config.wordCount.displayWords === 'undefined') {
        statText.push(Craft.t('ckeditor', '{num, number} {num, plural, =1{word} other{words}}', {
          num: stats.words,
        }));
      }
      if (config.wordCount.displayCharacters) { // false by default
        statText.push(Craft.t('ckeditor', '{num, number} {num, plural, =1{character} other{characters}}', {
          num: stats.characters,
        }));
      }
      const container = $('#' + $wordCountIdJs);
      container.html(Craft.escapeHtml(statText.join(', ')) || '&nbsp;');
      if ($wordLimitJs) {
        if (stats.words > $wordLimitJs) {
          container.addClass('error');
        } else if (stats.words >= Math.floor($wordLimitJs * .9)) {
          container.addClass('warning');
        } else {
          container.removeClass('error warning');
        }
      }
      onUpdate(stats);
    }
  } else {
    extraRemovePlugins.push('WordCount');
  }
  if (extraRemovePlugins.length) {
    if (typeof config.removePlugins === 'undefined') {
      config.removePlugins = [];
    }
    config.removePlugins.push(...extraRemovePlugins);
  }
  CKEditor5.craftcms.create($idJs, config);
})(jQuery)
JS,
            View::POS_END,
        );

        if ($ckeConfig->css) {
            $view->registerCss($ckeConfig->css);
        }

        $value = $this->prepValueForInput($value, $element);
        $html = Html::textarea($this->handle, $value, [
            'id' => $id,
            'class' => 'hidden',
        ]);

        if ($this->showWordCount) {
            $html .= Html::tag('div', '&nbps;', [
                'id' => $wordCountId,
                'class' => ['ck-word-count', 'light', 'smalltext'],
            ]);
        }

        return Html::tag('div', $html, [
            'class' => array_filter([
                $this->showWordCount ? 'ck-with-show-word-count' : null,
            ]),
            'data' => [
                'element-id' => $element?->id,
            ],
        ]);
    }

    /**
     * @inheritdoc
     */
    public function getStaticHtml(mixed $value, ElementInterface $element): string
    {
        Craft::$app->getView()->registerAssetBundle(CkeditorAsset::class);

        return Html::tag(
            'div',
            $this->prepValueForInput($value, $element, true) ?: '&nbsp;',
            ['class' => 'noteditable']
        );
    }

    /**
     * @inheritdoc
     */
    protected function purifierConfig(): HTMLPurifier_Config
    {
        $purifierConfig = parent::purifierConfig();

        // adjust the purifier config based on the CKEditor config
        $purifierConfig = $this->_adjustPurifierConfig($purifierConfig);

        // Give plugins a chance to modify the HTML Purifier config, or add new ones
        $event = new ModifyPurifierConfigEvent([
            'config' => $purifierConfig,
        ]);

        $this->trigger(self::EVENT_MODIFY_PURIFIER_CONFIG, $event);

        return $event->config;
    }

    /**
     * @inheritdoc
     */
    protected function prepValueForInput($value, ?ElementInterface $element, bool $static = false): string
    {
        if ($value instanceof HtmlFieldData) {
            $value = $value->getRawContent();
        }

        if ($value !== null) {
            // Replace NBSP chars with entities, and remove XHTML formatting from  self-closing HTML elements,
            // so CKEditor doesn’t need to normalize them and cause the input value to change
            // (https://github.com/craftcms/cms/issues/13112)
            $pairs = [
                ' ' => '&nbsp;',
            ];
            foreach (array_keys(Html::$voidElements) as $tag) {
                $pairs["<$tag />"] = "<$tag>";
            }
            $value = strtr($value, $pairs);

            // Redactor to CKEditor syntax for <figure>
            // (https://github.com/craftcms/ckeditor/issues/96)
            $value = $this->_normalizeFigures($value);

            $value = $this->_prepNestedEntriesForDisplay($value, $element?->siteId, $static);
        }

        return parent::prepValueForInput($value, $element);
    }

    /**
     * Returns entry type options in form of an array with 'label' and 'value' keys for each option.
     *
     * @return array
     */
    private function _getEntryTypeOptions(): array
    {
        $entryTypeOptions = array_map(
            fn(EntryType $entryType) => [
                'icon' => $entryType->icon ? Cp::iconSvg($entryType->icon) : null,
                'label' => Craft::t('site', $entryType->name),
                'value' => $entryType->id,
            ],
            $this->getEntryTypes(),
        );

        return $entryTypeOptions;
    }

    /**
     * Fill the CKE markup (<craft-entry data-entry-id="96"></craft-entry>)
     *  with actual card or template HTML of the entry it's linking to.
     * If it's not a CP request - always use the rendered HTML
     * If it's a CP request - use rendered HTML if that's what's assigned to the entry type in the field's setting; otherwise use card HTML.
     * If it's a static request
     *
     * @param string $value
     * @param int|null $elementSiteId
     * @param bool $static
     * @return string
     */
    private function _prepNestedEntriesForDisplay(string $value, ?int $elementSiteId, bool $static = false): string
    {
        [$entryIds, $markers] = $this->findEntries($value, true);

        if (empty($entryIds)) {
            return $value;
        }

        $isCpRequest = $this->isCpRequest();
        $entries = Entry::find()
            ->id($entryIds)
            ->siteId($elementSiteId)
            ->status(null)
            ->drafts(null)
            ->revisions(null)
            ->trashed(null)
            ->indexBy('id')
            ->all();

        foreach ($markers as $i => $marker) {
            $entryId = $entryIds[$i];
            /** @var Entry|null $entry */
            $entry = $entries[$entryId] ?? null;
            if (!$entry) {
                $entryHtml = '';
            } elseif ($isCpRequest) {
                $entryHtml = $this->getCardHtml($entry);
                if (!$static) {
                    $entryHtml = Html::tag('craft-entry', options: [
                        'data' => [
                            'entry-id' => $entryId,
                            'card-html' => $entryHtml,
                        ],
                    ]);
                }
            } else {
                $entryHtml = $entry->render();
            }

            $value = str_replace($marker, $entryHtml, $value);
        }

        return $value;
    }

    private function isCpRequest(): bool
    {
        return (
            Craft::$app->getRequest()->getIsCpRequest() &&
            !Craft::$app->controller instanceof GraphqlController
        );
    }

    private function findEntries(string &$html, bool $replaceWithMarkers = false): array
    {
        $entryIds = [];
        $markers = [];
        $offset = 0;
        $r = '';

        while (($pos = stripos($html, '<craft-entry data-entry-id="', $offset)) !== false) {
            $idStartPos = $pos + 28;
            $closingTagPos = strpos($html, '</craft-entry>', $idStartPos);
            if ($closingTagPos === false) {
                break;
            }
            $endPos = $closingTagPos + 14;
            if (!preg_match('/^\d+/', substr($html, $idStartPos, $closingTagPos - $idStartPos), $match)) {
                break;
            }
            $entryIds[] = $match[0];
            if ($replaceWithMarkers) {
                $markers[] = $marker = sprintf('{marker:%s}', mt_rand());
                $r .= substr($html, $offset, $pos - $offset) . $marker;
            }
            $offset = $endPos;
        }

        if ($replaceWithMarkers && $offset !== 0) {
            $html = $r . substr($html, $offset);
        }

        return [$entryIds, $markers];
    }

    /**
     * Fill entry card CKE markup (<craft-entry data-entry-id="96"></craft-entry>)
     * with actual card HTML of the entry it's linking to

     * Replace the entry card CKE markup (<craft-entry data-entry-id="96"></craft-entry>)
     * with actual card HTML of the entry it's linking to

     * Replace the entry card CKE markup (<craft-entry data-entry-id="96"></craft-entry>)
     * with the rendered HTML of the entry it's linking to
     */

    /**
     * Normalizes <figure> tags, ensuring they have an `image` or `media` class depending on their contents,
     * and they contain a <div data-oembed-url> or <oembed> tag, depending on the `mediaEmbed.previewsInData`
     * CKEditor config option.
     *
     * @param string $value
     * @return string
     */
    private function _normalizeFigures(string $value): string
    {
        // Ensure <figure> tags have `image` or `media` classes
        $offset = 0;
        while (preg_match('/<figure\b[^>]*>\s*<(img|iframe)\b.*?<\/figure>/is', $value, $match, PREG_OFFSET_CAPTURE, $offset)) {
            /** @var int $startPos */
            $startPos = $match[0][1];
            $endPos = $startPos + strlen($match[0][0]);

            $class = strtolower($match[1][0]) === 'img' ? 'image' : 'media';
            try {
                $tag = Html::modifyTagAttributes($match[0][0], [
                    'class' => [$class],
                ]);
            } catch (InvalidHtmlTagException) {
                $offset = $endPos;
                continue;
            }

            $value = substr($value, 0, $startPos) . $tag . substr($value, $endPos);
            $offset = $startPos + strlen($tag);
        }

        $previewsInData = $this->_ckeConfig()->options['mediaEmbed']['previewsInData'] ?? false;

        $value = preg_replace_callback(
            '/(<figure\b[^>]*>\s*)(<iframe\b([^>]*)src="([^"]+)"([^>]*)>(.*?)<\/iframe>)/i',
            function(array $match) use ($previewsInData) {
                $absUrl = UrlHelper::isProtocolRelativeUrl($match[4]) ? "https:$match[4]" : $match[4];
                return $previewsInData
                    ? sprintf(
                        '%s<div data-oembed-url="%s">%s</div>',
                        $match[1],
                        $absUrl,
                        $match[2],
                    )
                    : sprintf(
                        '%s<oembed%surl="%s"%s>%s</oembed>',
                        $match[1],
                        $match[3],
                        $absUrl,
                        $match[5],
                        $match[6],
                    );
            },
            $value,
        );

        return $value;
    }

    /**
     * Returns the field’s CKEditor config.
     *
     * @return CkeConfig
     */
    private function _ckeConfig(): CkeConfig
    {
        if ($this->ckeConfig) {
            try {
                return Plugin::getInstance()->getCkeConfigs()->getByUid($this->ckeConfig);
            } catch (InvalidArgumentException) {
            }
        }

        return new CkeConfig();
    }

    /**
     * Returns the link options available to the field.
     *
     * Each link option is represented by an array with the following keys:
     * - `label` (required) – the user-facing option label that appears in the Link dropdown menu
     * - `elementType` (required) – the element type class that the option should be linking to
     * - `sources` (optional) – the sources that the user should be able to select elements from
     * - `criteria` (optional) – any specific element criteria parameters that should limit which elements the user can select
     *
     * @param ElementInterface|null $element The element the field is associated with, if there is one
     * @return array
     */
    private function _linkOptions(?ElementInterface $element): array
    {
        $linkOptions = [];

        $sectionSources = $this->_entrySources($element);
        $categorySources = $this->_categorySources($element);
        $volumeSources = $this->_assetSources(true);

        if (!empty($sectionSources)) {
            $linkOptions[] = [
                'label' => Craft::t('ckeditor', 'Link to an entry'),
                'elementType' => Entry::class,
                'refHandle' => Entry::refHandle(),
                'sources' => $sectionSources,
                'criteria' => ['uri' => ':notempty:'],
            ];
        }

        if (!empty($categorySources)) {
            $linkOptions[] = [
                'label' => Craft::t('ckeditor', 'Link to a category'),
                'elementType' => Category::class,
                'refHandle' => Category::refHandle(),
                'sources' => $categorySources,
                'criteria' => ['uri' => ':notempty:'],
            ];
        }

        if (!empty($volumeSources)) {
            $linkOptions[] = [
                'label' => Craft::t('ckeditor', 'Link to an asset'),
                'elementType' => Asset::class,
                'refHandle' => Asset::refHandle(),
                'sources' => $volumeSources,
                'criteria' => $this->_assetSelectionCriteria(),
            ];
        }

        // Give plugins a chance to add their own
        $event = new DefineLinkOptionsEvent([
            'linkOptions' => $linkOptions,
        ]);
        $this->trigger(self::EVENT_DEFINE_LINK_OPTIONS, $event);
        $linkOptions = $event->linkOptions;

        // Fill in any missing ref handles
        foreach ($linkOptions as &$linkOption) {
            if (!isset($linkOption['refHandle'])) {
                /** @var class-string<ElementInterface> $class */
                $class = $linkOption['elementType'];
                $linkOption['refHandle'] = $class::refHandle() ?? $class;
            }
        }

        return $linkOptions;
    }

    /**
     * Returns the available entry sources.
     *
     * @param ElementInterface|null $element The element the field is associated with, if there is one
     * @param bool $showSingles Whether to include Singles in the available sources
     * @return array
     */
    private function _entrySources(?ElementInterface $element, bool $showSingles = false): array
    {
        $sources = [];
        $sections = Craft::$app->getEntries()->getAllSections();

        // Get all sites
        $sites = Craft::$app->getSites()->getAllSites();

        foreach ($sections as $section) {
            if ($section->type === Section::TYPE_SINGLE) {
                $showSingles = true;
            } elseif ($element) {
                $sectionSiteSettings = $section->getSiteSettings();
                foreach ($sites as $site) {
                    if (isset($sectionSiteSettings[$site->id]) && $sectionSiteSettings[$site->id]->hasUrls) {
                        $sources[] = 'section:' . $section->uid;
                    }
                }
            }
        }

        $sources = array_values(array_unique($sources));

        if ($showSingles) {
            array_unshift($sources, 'singles');
        }

        if (!empty($sources)) {
            array_unshift($sources, '*');
        }

        // include custom sources
        $customSources = $this->_getCustomSources(Entry::class);
        if (!empty($customSources)) {
            $sources = array_merge($sources, $customSources);
        }

        return $sources;
    }

    /**
     * Returns the available category sources.
     *
     * @param ElementInterface|null $element The element the field is associated with, if there is one
     * @return array
     */
    private function _categorySources(?ElementInterface $element): array
    {
        if (!$element) {
            return [];
        }

        $sources = Collection::make(Craft::$app->getCategories()->getAllGroups())
            ->filter(fn(CategoryGroup $group) => $group->getSiteSettings()[$element->siteId]?->hasUrls ?? false)
            ->map(fn(CategoryGroup $group) => "group:$group->uid")
            ->values()
            ->all();

        // include custom sources
        $customSources = $this->_getCustomSources(Category::class);
        if (!empty($customSources)) {
            $sources = array_merge($sources, $customSources);
        }

        return $sources;
    }

    /**
     * Returns the available asset sources.
     *
     * @param bool $withUrlsOnly Whether to only return volumes that have filesystems that have public URLs
     * @return string[]
     */
    private function _assetSources(bool $withUrlsOnly = false): array
    {
        if (!$this->availableVolumes) {
            return [];
        }

        $volumes = Collection::make(Craft::$app->getVolumes()->getAllVolumes());

        if (is_array($this->availableVolumes)) {
            $volumes = $volumes->filter(fn(Volume $volume) => in_array($volume->uid, $this->availableVolumes));
        }

        if (!$this->showUnpermittedVolumes) {
            $userService = Craft::$app->getUser();
            $volumes = $volumes->filter(fn(Volume $volume) => $userService->checkPermission("viewAssets:$volume->uid"));
        }

        if ($withUrlsOnly) {
            // only allow volumes that belong to FS that have public URLs
            $volumes = $volumes->filter(fn(Volume $volume) => $volume->getFs()->hasUrls);
        }

        $sources = $volumes
            ->map(fn(Volume $volume) => "volume:$volume->uid")
            ->values()
            ->all();

        // include custom sources
        $customSources = $this->_getCustomSources(Asset::class);
        if (!empty($customSources)) {
            $sources = array_merge($sources, $customSources);
        }

        return $sources;
    }

    /**
     * Returns the asset selection criteria.
     *
     * @return array
     */
    private function _assetSelectionCriteria(): array
    {
        $criteria = [];
        if ($this->showUnpermittedFiles) {
            $criteria['uploaderId'] = null;
        }
        return $criteria;
    }

    /**
     * Returns custom element sources keys for given element type.
     *
     * @param string $elementType
     * @return array
     */
    private function _getCustomSources(string $elementType): array
    {
        $customSources = [];
        $elementSources = Craft::$app->getElementSources()->getSources($elementType, 'modal');
        foreach ($elementSources as $elementSource) {
            if ($elementSource['type'] === ElementSources::TYPE_CUSTOM && isset($elementSource['key'])) {
                $customSources[] = $elementSource['key'];
            }
        }

        return $customSources;
    }

    /**
     * Get available transforms.
     *
     * @return array
     */
    private function _transforms(): array
    {
        if (!$this->availableTransforms) {
            return [];
        }

        $transforms = Collection::make(Craft::$app->getImageTransforms()->getAllTransforms());

        if (is_array($this->availableTransforms)) {
            $transforms = $transforms->filter(fn(ImageTransform $transform) => in_array($transform->uid, $this->availableTransforms));
        }

        return $transforms->map(fn(ImageTransform $transform) => [
            'handle' => $transform->handle,
            'name' => $transform->name,
        ])->values()->all();
    }

    /**
     * Adjust HTML Purifier based on items added to the toolbar
     *
     * @param HTMLPurifier_Config $purifierConfig
     * @return HTMLPurifier_Config
     * @throws HTMLPurifier_Exception
     */
    private function _adjustPurifierConfig(HTMLPurifier_Config $purifierConfig): HTMLPurifier_Config
    {
        $ckeConfig = $this->_ckeConfig();

        // These will come back as indexed (key => true) arrays
        $allowedTargets = $purifierConfig->get('Attr.AllowedFrameTargets');
        $allowedRels = $purifierConfig->get('Attr.AllowedRel');
        if (isset($ckeConfig->options['link']['addTargetToExternalLinks'])) {
            $allowedTargets['_blank'] = true;
        }
        foreach ($ckeConfig->options['link']['decorators'] ?? [] as $decorator) {
            if (isset($decorator['attributes']['target'])) {
                $allowedTargets[$decorator['attributes']['target']] = true;
            }
            if (isset($decorator['attributes']['rel'])) {
                foreach (explode(' ', $decorator['attributes']['rel']) as $rel) {
                    $allowedRels[$rel] = true;
                }
            }
        }
        $purifierConfig->set('Attr.AllowedFrameTargets', array_keys($allowedTargets));
        $purifierConfig->set('Attr.AllowedRel', array_keys($allowedRels));

        if (in_array('todoList', $ckeConfig->toolbar)) {
            // Add input[type=checkbox][disabled][checked] to the definition
            /** @var HTMLPurifier_HTMLDefinition|null $def */
            $def = $purifierConfig->getDefinition('HTML', true);
            $def?->addElement('input', 'Inline', 'Inline', '', [
                'type' => 'Enum#checkbox',
                'disabled' => 'Enum#disabled',
                'checked' => 'Enum#checked',
            ]);
        }

        if (in_array('numberedList', $ckeConfig->toolbar)) {
            /** @var HTMLPurifier_HTMLDefinition|null $def */
            $def = $purifierConfig->getDefinition('HTML', true);
            $def?->addAttribute('ol', 'style', 'Text');
        }

        if (in_array('bulletedList', $ckeConfig->toolbar)) {
            /** @var HTMLPurifier_HTMLDefinition|null $def */
            $def = $purifierConfig->getDefinition('HTML', true);
            $def?->addAttribute('ul', 'style', 'Text');
        }

        if (in_array('createEntry', $ckeConfig->toolbar)) {
            /** @var HTMLPurifier_HTMLDefinition|null $def */
            $def = $purifierConfig->getDefinition('HTML', true);
            $def?->addElement('craft-entry', 'Inline', 'Inline', '', [
                'data-entry-id' => 'Number',
            ]);
        }

        return $purifierConfig;
    }

    /**
     * Returns an accessible name for the field (to be plugged into CKEditor's main editing area aria-label).
     *
     * @param ElementInterface|null $element
     * @return string
     */
    private function _accessibleFieldName(?ElementInterface $element = null): string
    {
        return Craft::t('site', $this->name) .
        ($element?->getFieldLayout()?->getField($this->handle)?->required ? ' ' . Craft::t('site', 'Required') : '') .
        ($this->getIsTranslatable($element) ? ' ' . $this->getTranslationDescription($element) : '');
    }

    /**
     * Namespaces field's $describedBy value to be passed to the field.
     *
     * @param View $view
     * @return string
     */
    private function _describedBy(View $view): string
    {
        if (!empty($this->describedBy)) {
            $describedByArray = explode(' ', $this->describedBy);
            $namespace = trim(preg_replace('/\[|\]/', '-', $view->getNamespace()), '-');
            foreach ($describedByArray as $key => $item) {
                $describedByArray[$key] = "$namespace-$item";
            }

            return implode(' ', $describedByArray);
        }

        return '';
    }
}
