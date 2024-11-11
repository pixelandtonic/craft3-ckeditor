import {Plugin} from 'ckeditor5/src/core';
import {
  addListToDropdown,
  ButtonView,
  createDropdown,
  ViewModel,
} from 'ckeditor5/src/ui';
import {Range} from 'ckeditor5/src/engine';
import {Collection} from 'ckeditor5/src/utils';
import {isWidget, WidgetToolbarRepository} from 'ckeditor5/src/widget';
import {DoubleClickObserver} from '../observers/domevent';

export default class CraftEntriesUI extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [WidgetToolbarRepository];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'CraftEntriesUI';
  }

  /**
   * @inheritDoc
   */
  init() {
    this.editor.ui.componentFactory.add('createEntry', (locale) => {
      return this._createToolbarEntriesButton(locale);
    });

    this.editor.ui.componentFactory.add('editEntryBtn', (locale) => {
      return this._createEditEntryBtn(locale);
    });

    this._listenToEvents();
  }

  /**
   * @inheritDoc
   */
  afterInit() {
    // this is needed for the contextual balloon to show for each added entry widget
    const widgetToolbarRepository = this.editor.plugins.get(
      WidgetToolbarRepository,
    );
    widgetToolbarRepository.register('entriesBalloon', {
      ariaLabel: Craft.t('ckeditor', 'Entry toolbar'),
      // Toolbar Buttons
      items: ['editEntryBtn'],
      // If a related element is returned the toolbar is attached
      getRelatedElement: (selection) => {
        const viewElement = selection.getSelectedElement();

        // If the viewElement is a widget and
        // the viewElement has a class `cke-entry-card`
        // return it.
        //
        if (
          viewElement &&
          isWidget(viewElement) &&
          viewElement.hasClass('cke-entry-card')
        ) {
          return viewElement;
        }

        return null;
      },
    });
  }

  /**
   * Hook up event listeners
   *
   * @private
   */
  _listenToEvents() {
    const view = this.editor.editing.view;
    const viewDocument = view.document;

    view.addObserver(DoubleClickObserver);

    this.editor.listenTo(viewDocument, 'dblclick', (evt, data) => {
      const modelElement = this.editor.editing.mapper.toModelElement(
        data.target.parent,
      );

      if (modelElement.name === 'craftEntryModel') {
        this._initEditEntrySlideout(data, modelElement);
      }
    });
  }

  _initEditEntrySlideout(data = null, modelElement = null) {
    if (modelElement === null) {
      const selection = this.editor.model.document.selection;
      modelElement = selection.getSelectedElement();
    }

    const entryId = modelElement.getAttribute('entryId');
    const siteId = modelElement.getAttribute('siteId') ?? null;

    this._showEditEntrySlideout(entryId, siteId, modelElement);
  }

  /**
   * Creates a toolbar button that allows for an entry to be inserted into the editor
   *
   * @param locale
   * @private
   */
  _createToolbarEntriesButton(locale) {
    const editor = this.editor;
    const entryTypeOptions = editor.config.get('entryTypeOptions');
    const insertEntryCommand = editor.commands.get('insertEntry');

    if (!entryTypeOptions || !entryTypeOptions.length) {
      return;
    }

    const dropdownView = createDropdown(locale);
    dropdownView.buttonView.set({
      label:
        editor.config.get('createButtonLabel') ||
        Craft.t('app', 'New {type}', {
          type: Craft.t('app', 'entry'),
        }),
      tooltip: true,
      withText: true,
      //commandValue: null,
    });

    dropdownView.bind('isEnabled').to(insertEntryCommand);
    addListToDropdown(
      dropdownView,
      () =>
        this._getDropdownItemsDefinitions(entryTypeOptions, insertEntryCommand),
      {
        ariaLabel: Craft.t('ckeditor', 'Entry types list'),
      },
    );
    // Execute command when an item from the dropdown is selected.
    this.listenTo(dropdownView, 'execute', (evt) => {
      this._showCreateEntrySlideout(evt.source.commandValue);
    });

    return dropdownView;
  }

  /**
   * Creates a list of entry type options that go into the insert entry button
   *
   * @param options
   * @param command
   * @returns {Collection<Record<string, any>>}
   * @private
   */
  _getDropdownItemsDefinitions(options, command) {
    const itemDefinitions = new Collection();
    options.map((option) => {
      const definition = {
        type: 'button',
        model: new ViewModel({
          commandValue: option.value, //entry type id
          label: option.label || option.value,
          icon: option.icon,
          withText: true,
        }),
      };
      itemDefinitions.add(definition);
    });

    return itemDefinitions;
  }

  /**
   * Creates an edit entry button that shows in the contextual balloon for each craft entry widget
   * @param locale
   * @returns {ButtonView}
   * @private
   */
  _createEditEntryBtn(locale) {
    // const command = this.editor.commands.get('insertEntry');
    const button = new ButtonView(locale);
    button.set({
      isEnabled: true,
      label: Craft.t('app', 'Edit {type}', {
        type: Craft.t('app', 'entry'),
      }),
      tooltip: true,
      withText: true,
    });

    this.listenTo(button, 'execute', (evt) => {
      this._initEditEntrySlideout();
    });

    return button;
  }

  /**
   * Returns Craft.ElementEditor instance that the CKEditor field belongs to.
   *
   * @returns {*}
   */
  getElementEditor() {
    const $editorContainer = $(this.editor.ui.view.element).closest(
      'form,.lp-editor-container',
    );
    const elementEditor = $editorContainer.data('elementEditor');

    return elementEditor;
  }

  /**
   * Returns HTML of the card by the entry ID.
   *
   * @param entryId
   * @returns {*}
   * @private
   */
  _getCardElement(entryId) {
    let $container = $(this.editor.ui.element);
    return $container.find('.element.card[data-id="' + entryId + '"]');
  }

  /**
   * Opens an element editor for existing entry
   *
   * @param entryId
   * @private
   */
  _showEditEntrySlideout(entryId, siteId, modelElement) {
    const editor = this.editor;
    const elementEditor = this.getElementEditor();

    const slideout = Craft.createElementEditor(this.elementType, null, {
      elementId: entryId,
      params: {
        siteId: siteId,
      },
      onBeforeSubmit: async () => {
        let $element = this._getCardElement(entryId);
        // If the nested element is primarily owned by the canonical entry being edited,
        // then ensure we're working with a draft and save the nested entry changes to the draft
        if (
          $element !== null &&
          $element.data('primary-owner-id') === $element.data('owner-id') &&
          !elementEditor.settings.isUnpublishedDraft
        ) {
          await slideout.elementEditor.checkForm(true, true);
          let baseInputName = $(editor.sourceElement).attr('name');
          // mark as dirty
          if (elementEditor && baseInputName) {
            await elementEditor.setFormValue(baseInputName, '*');
          }
          if (
            elementEditor.settings.draftId &&
            slideout.elementEditor.settings.draftId
          ) {
            if (!slideout.elementEditor.settings.saveParams) {
              slideout.elementEditor.settings.saveParams = {};
            }
            slideout.elementEditor.settings.saveParams.action =
              'elements/save-nested-element-for-derivative';
            slideout.elementEditor.settings.saveParams.newOwnerId =
              elementEditor.getDraftElementId($element.data('owner-id'));
          }
        }
      },
      onSubmit: (ev) => {
        let $element = this._getCardElement(entryId);
        if ($element !== null && ev.data.id != $element.data('id')) {
          // swap the element with the new one
          $element
            .attr('data-id', ev.data.id)
            .data('id', ev.data.id)
            .data('owner-id', ev.data.ownerId);

          // and tell CKE about it
          editor.editing.model.change((writer) => {
            writer.setAttribute('entryId', ev.data.id, modelElement);
            editor.ui.update();
          });

          // and refresh the card
          Craft.refreshElementInstances(ev.data.id);
        }
      },
    });
  }

  /**
   * Creates new entry and opens the element editor for it
   *
   * @param entryTypeId
   * @private
   */
  async _showCreateEntrySlideout(entryTypeId) {
    const editor = this.editor;
    const nestedElementAttributes = editor.config.get(
      'nestedElementAttributes',
    );

    const params = Object.assign({}, nestedElementAttributes, {
      typeId: entryTypeId,
    });

    const elementEditor = this.getElementEditor();

    if (elementEditor) {
      await elementEditor.markDeltaNameAsModified(editor.sourceElement.name);
      // replace the owner ID with the new one, maybe?
      params.ownerId = elementEditor.getDraftElementId(
        nestedElementAttributes.ownerId,
      );
    }

    let data;

    try {
      const response = await Craft.sendActionRequest(
        'POST',
        'elements/create',
        {
          data: params,
        },
      );
      data = response.data;
    } catch (e) {
      Craft.cp.displayError(e?.response?.data?.error);
      throw e;
    }

    const slideout = Craft.createElementEditor(this.elementType, {
      elementId: data.element.id,
      draftId: data.element.draftId,
      params: {
        fresh: 1,
        siteId: data.element.siteId,
      },
    });

    slideout.on('submit', (ev) => {
      editor.commands.execute('insertEntry', {
        entryId: ev.data.id,
        siteId: ev.data.siteId,
      });
    });
  }
}
