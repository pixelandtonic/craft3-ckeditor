import * as eu from "ckeditor5";
import { ImageInsertUI as Ku, ButtonView as Cs, icons as tu, Plugin as rr, LinkUI as Xl, ContextualBalloon as Qu, createDropdown as _a, SplitButtonView as Gu, addListToDropdown as xa, Collection as Sa, ViewModel as $o, Range as Xu, Command as Ts, ImageUtils as nu, DropdownButtonView as Ju, Widget as Zu, viewToModelPositionOutsideModelElement as ec, toWidget as tc, DomEventObserver as nc, WidgetToolbarRepository as Jl, isWidget as rc } from "ckeditor5";
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */
class oc extends Ku {
  static get pluginName() {
    return "CraftImageInsertUI";
  }
  init() {
    if (!this._assetSources) {
      console.warn(
        'Omitting the "image" CKEditor toolbar button, because there aren’t any permitted volumes.'
      );
      return;
    }
    const H = this.editor.ui.componentFactory, E = (s) => this._createToolbarImageButton(s);
    H.add("insertImage", E), H.add("imageInsert", E);
  }
  get _assetSources() {
    return this.editor.config.get("assetSources");
  }
  _createToolbarImageButton(H) {
    const E = this.editor, s = E.t, d = new Cs(H);
    d.isEnabled = !0, d.label = s("Insert image"), d.icon = tu.image, d.tooltip = !0;
    const u = E.commands.get("insertImage");
    return d.bind("isEnabled").to(u), this.listenTo(d, "execute", () => this._showImageSelectModal()), d;
  }
  _showImageSelectModal() {
    const H = this._assetSources, E = this.editor, s = E.config, d = Object.assign({}, s.get("assetSelectionCriteria"), {
      kind: "image"
    });
    Craft.createElementSelectorModal("craft\\elements\\Asset", {
      storageKey: `ckeditor:${this.pluginName}:'craft\\elements\\Asset'`,
      sources: H,
      criteria: d,
      defaultSiteId: s.get("elementSiteId"),
      transforms: s.get("transforms"),
      multiSelect: !0,
      autoFocusSearchBox: !1,
      onSelect: (u, o) => {
        this._processAssetUrls(u, o).then(() => {
          E.editing.view.focus();
        });
      },
      onHide: () => {
        E.editing.view.focus();
      },
      closeOtherModals: !1
    });
  }
  _processAssetUrls(H, E) {
    return new Promise((s) => {
      if (!H.length) {
        s();
        return;
      }
      const d = this.editor, u = d.config.get("defaultTransform"), o = new Craft.Queue(), S = [];
      o.on("afterRun", () => {
        d.execute("insertImage", { source: S }), s();
      });
      for (const m of H)
        o.push(
          () => new Promise((g) => {
            const y = this._isTransformUrl(m.url);
            if (!y && u)
              this._getTransformUrl(m.id, u, (b) => {
                S.push(b), g();
              });
            else {
              const b = this._buildAssetUrl(
                m.id,
                m.url,
                y ? E : u
              );
              S.push(b), g();
            }
          })
        );
    });
  }
  _buildAssetUrl(H, E, s) {
    return `${E}#asset:${H}:${s ? "transform:" + s : "url"}`;
  }
  _removeTransformFromUrl(H) {
    return H.replace(/(^|\/)(_[^\/]+\/)([^\/]+)$/, "$1$3");
  }
  _isTransformUrl(H) {
    return /(^|\/)_[^\/]+\/[^\/]+$/.test(H);
  }
  _getTransformUrl(H, E, s) {
    Craft.sendActionRequest("POST", "ckeditor/ckeditor/image-url", {
      data: {
        assetId: H,
        transform: E
      }
    }).then(({ data: d }) => {
      s(this._buildAssetUrl(H, d.url, E));
    }).catch(() => {
      alert("There was an error generating the transform URL.");
    });
  }
  _getAssetUrlComponents(H) {
    const E = H.match(
      /(.*)#asset:(\d+):(url|transform):?([a-zA-Z][a-zA-Z0-9_]*)?/
    );
    return E ? {
      url: E[1],
      assetId: E[2],
      transform: E[3] !== "url" ? E[4] : null
    } : null;
  }
}
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */
const ic = '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="m11.077 15 .991-1.416a.75.75 0 1 1 1.229.86l-1.148 1.64a.748.748 0 0 1-.217.206 5.251 5.251 0 0 1-8.503-5.955.741.741 0 0 1 .12-.274l1.147-1.639a.75.75 0 1 1 1.228.86L4.933 10.7l.006.003a3.75 3.75 0 0 0 6.132 4.294l.006.004zm5.494-5.335a.748.748 0 0 1-.12.274l-1.147 1.639a.75.75 0 1 1-1.228-.86l.86-1.23a3.75 3.75 0 0 0-6.144-4.301l-.86 1.229a.75.75 0 0 1-1.229-.86l1.148-1.64a.748.748 0 0 1 .217-.206 5.251 5.251 0 0 1 8.503 5.955zm-4.563-2.532a.75.75 0 0 1 .184 1.045l-3.155 4.505a.75.75 0 1 1-1.229-.86l3.155-4.506a.75.75 0 0 1 1.045-.184z"/></svg>', ac = "Ctrl+K";
class sc extends rr {
  static get requires() {
    return [Xl];
  }
  static get pluginName() {
    return "CraftLinkUI";
  }
  constructor() {
    super(...arguments), this.siteDropdownView = null, this.siteDropdownItemModels = null, this.localizedRefHandleRE = null, this.editor.config.define("linkOptions", []);
  }
  init() {
    const H = this.editor;
    if (this._linkUI = H.plugins.get(Xl), this._balloon = H.plugins.get(Qu), this._createToolbarLinkButton(), Craft.isMultiSite) {
      this._modifyFormViewTemplate();
      const E = su.join("|");
      this.localizedRefHandleRE = new RegExp(
        `(#(?:${E}):\\d+)(?:@(\\d+))?`
      );
    }
  }
  _createToolbarLinkButton() {
    const H = this.editor, E = H.config.get("linkOptions");
    if (!E || !E.length) {
      this._linkUI._createToolbarLinkButton();
      return;
    }
    const s = H.commands.get("link"), d = H.t;
    H.ui.componentFactory.add("link", (u) => {
      const o = _a(u, Gu), S = o.buttonView;
      return S.isEnabled = !0, S.label = d("Link"), S.icon = ic, S.keystroke = ac, S.tooltip = !0, S.isToggleable = !0, this.listenTo(
        S,
        "execute",
        () => this._linkUI._showUI(!0)
      ), o.on("execute", (m) => {
        if (m.source.linkOption) {
          const g = m.source.linkOption;
          this._showElementSelectorModal(g);
        } else
          this._linkUI._showUI(!0);
      }), o.class = "ck-code-block-dropdown", o.bind("isEnabled").to(s, "isEnabled"), S.bind("isOn").to(s, "value", (m) => !!m), xa(
        o,
        () => this._getLinkListItemDefinitions(E)
      ), o;
    });
  }
  _getLinkListItemDefinitions(H) {
    const E = new Sa();
    for (const s of H)
      E.add({
        type: "button",
        model: new $o({
          label: s.label,
          linkOption: s,
          withText: !0
        })
      });
    return E.add({
      type: "button",
      model: new $o({
        label: Craft.t("ckeditor", "Insert link"),
        withText: !0
      })
    }), E;
  }
  _showElementSelectorModal(H) {
    const E = this.editor, s = E.model, d = s.document.selection, u = d.isCollapsed, o = d.getFirstRange(), S = () => {
      E.editing.view.focus(), !u && o && s.change((m) => {
        m.setSelection(o);
      }), this._linkUI._hideFakeVisualSelection();
    };
    this._linkUI._getSelectedLinkElement() || this._linkUI._showFakeVisualSelection(), Craft.createElementSelectorModal(H.elementType, {
      storageKey: `ckeditor:${this.pluginName}:${H.elementType}`,
      sources: H.sources,
      criteria: H.criteria,
      defaultSiteId: E.config.get("elementSiteId"),
      autoFocusSearchBox: !1,
      onSelect: (m) => {
        if (m.length) {
          const g = m[0], y = `${g.url}#${H.refHandle}:${g.id}@${g.siteId}`;
          E.editing.view.focus(), !u && o ? (s.change((C) => {
            C.setSelection(o);
          }), E.commands.get("link").execute(y)) : s.change((b) => {
            if (b.insertText(
              g.label,
              {
                linkHref: y
              },
              d.getFirstPosition()
            ), o instanceof Xu)
              try {
                const C = o.clone();
                C.end.path[1] += g.label.length, b.setSelection(C);
              } catch {
              }
          }), this._linkUI._hideFakeVisualSelection(), setTimeout(() => {
            E.editing.view.focus(), this._linkUI._showUI(!0);
          }, 100);
        } else
          S();
      },
      onCancel: () => {
        S();
      },
      closeOtherModals: !1
    });
  }
  _modifyFormViewTemplate() {
    this._linkUI.formView || this._linkUI._createViews();
    const { formView: H } = this._linkUI, { urlInputView: E } = H, { fieldView: s } = E;
    H.template.attributes.class.push(
      "ck-link-form_layout-vertical",
      "ck-vertical-form"
    ), this.siteDropdownView = _a(H.locale), this.siteDropdownView.buttonView.set({
      label: "",
      withText: !0,
      isVisible: !1
    }), this.siteDropdownItemModels = Object.fromEntries(
      Craft.sites.map((o) => [
        o.id,
        new $o({
          label: o.name,
          siteId: o.id,
          withText: !0
        })
      ])
    ), this.siteDropdownItemModels.current = new $o({
      label: Craft.t("ckeditor", "Link to the current site"),
      siteId: null,
      withText: !0
    }), xa(
      this.siteDropdownView,
      new Sa([
        ...Craft.sites.map((o) => ({
          type: "button",
          model: this.siteDropdownItemModels[o.id]
        })),
        {
          type: "button",
          model: this.siteDropdownItemModels.current
        }
      ])
    ), this.siteDropdownView.on("execute", (o) => {
      const S = this._urlInputRefMatch();
      if (!S) {
        console.warn(
          `No reference tag hash present in URL: ${this._urlInputValue()}`
        );
        return;
      }
      const { siteId: m } = o.source;
      let g = S[1];
      m && (g += `@${m}`);
      const y = this._urlInputValue().replace(S[0], g);
      s.set("value", y);
    });
    const { children: d } = H, u = d.getIndex(E);
    d.add(this.siteDropdownView, u + 1), H._focusables.add(this.siteDropdownView), H.focusTracker.add(this.siteDropdownView.element), this.listenTo(s, "change:value", () => {
      this._toggleSiteDropdownView();
    }), this.listenTo(s, "input", () => {
      this._toggleSiteDropdownView();
    });
  }
  _urlInputValue() {
    return this._linkUI.formView.urlInputView.fieldView.element.value;
  }
  _urlInputRefMatch() {
    return this._urlInputValue().match(this.localizedRefHandleRE);
  }
  _toggleSiteDropdownView() {
    const H = this._urlInputRefMatch();
    if (H) {
      this.siteDropdownView.buttonView.set("isVisible", !0);
      let E = H[2] ? parseInt(H[2], 10) : null;
      E && typeof this.siteDropdownItemModels[E] > "u" && (E = null), this._selectSiteDropdownItem(E);
    } else
      this.siteDropdownView.buttonView.set("isVisible", !1);
  }
  _selectSiteDropdownItem(H) {
    const E = this.siteDropdownItemModels[H ?? "current"], s = H ? Craft.t("ckeditor", "Site: {name}", { name: E.label }) : E.label;
    this.siteDropdownView.buttonView.set("label", s), Object.values(this.siteDropdownItemModels).forEach((d) => {
      d.set("isOn", d === E);
    });
  }
}
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */
class lc extends Ts {
  refresh() {
    const H = this._element(), E = this._srcInfo(H);
    this.isEnabled = !!E, E ? this.value = {
      transform: E.transform
    } : this.value = null;
  }
  _element() {
    const H = this.editor;
    return H.plugins.get("ImageUtils").getClosestSelectedImageElement(
      H.model.document.selection
    );
  }
  _srcInfo(H) {
    if (!H || !H.hasAttribute("src"))
      return null;
    const E = H.getAttribute("src"), s = E.match(
      /#asset:(\d+)(?::transform:([a-zA-Z][a-zA-Z0-9_]*))?/
    );
    return s ? {
      src: E,
      assetId: s[1],
      transform: s[2]
    } : null;
  }
  /**
   * Executes the command.
   *
   * ```js
   * // Applies the `thumb` transform
   * editor.execute( 'transformImage', { transform: 'thumb' } );
   *
   * // Removes the transform
   * editor.execute( 'transformImage', { transform: null } );
   * ```
   *
   * @param options
   * @param options.transform The new transform for the image.
   * @fires execute
   */
  execute(H) {
    const s = this.editor.model, d = this._element(), u = this._srcInfo(d);
    if (this.value = {
      transform: H.transform
    }, u) {
      const o = `#asset:${u.assetId}` + (H.transform ? `:transform:${H.transform}` : "");
      s.change((S) => {
        const m = u.src.replace(/#.*/, "") + o;
        S.setAttribute("src", m, d);
      }), Craft.sendActionRequest("post", "ckeditor/ckeditor/image-url", {
        data: {
          assetId: u.assetId,
          transform: H.transform
        }
      }).then(({ data: S }) => {
        s.change((m) => {
          const g = S.url + o;
          m.setAttribute("src", g, d), S.width && m.setAttribute("width", S.width, d), S.height && m.setAttribute("height", S.height, d);
        });
      });
    }
  }
}
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */
class ru extends rr {
  static get requires() {
    return [nu];
  }
  static get pluginName() {
    return "ImageTransformEditing";
  }
  constructor(H) {
    super(H), H.config.define("transforms", []);
  }
  init() {
    const H = this.editor, E = new lc(H);
    H.commands.add("transformImage", E);
  }
}
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */
const uc = tu.objectSizeMedium;
class cc extends rr {
  static get requires() {
    return [ru];
  }
  static get pluginName() {
    return "ImageTransformUI";
  }
  init() {
    const H = this.editor, E = H.config.get("transforms"), s = H.commands.get("transformImage");
    this.bind("isEnabled").to(s), this._registerImageTransformDropdown(E);
  }
  /**
   * A helper function that creates a dropdown component for the plugin containing all the transform options defined in
   * the editor configuration.
   *
   * @param transforms An array of the available image transforms.
   */
  _registerImageTransformDropdown(H) {
    const E = this.editor, s = E.t, d = {
      name: "transformImage:original",
      value: null
    }, u = [
      d,
      ...H.map((S) => ({
        label: S.name,
        name: `transformImage:${S.handle}`,
        value: S.handle
      }))
    ], o = (S) => {
      const m = E.commands.get("transformImage"), g = _a(S, Ju), y = g.buttonView;
      return y.set({
        tooltip: s("Resize image"),
        commandValue: null,
        icon: uc,
        isToggleable: !0,
        label: this._getOptionLabelValue(d),
        withText: !0,
        class: "ck-resize-image-button"
      }), y.bind("label").to(m, "value", (b) => {
        if (!b || !b.transform)
          return this._getOptionLabelValue(d);
        const C = H.find(
          (O) => O.handle === b.transform
        );
        return C ? C.name : b.transform;
      }), g.bind("isEnabled").to(this), xa(
        g,
        () => this._getTransformDropdownListItemDefinitions(u, m),
        {
          ariaLabel: s("Image resize list")
        }
      ), this.listenTo(g, "execute", (b) => {
        E.execute(b.source.commandName, {
          transform: b.source.commandValue
        }), E.editing.view.focus();
      }), g;
    };
    E.ui.componentFactory.add("transformImage", o);
  }
  /**
   * A helper function for creating an option label value string.
   *
   * @param option A transform option object.
   * @returns The option label.
   */
  _getOptionLabelValue(H) {
    return H.label || H.value || this.editor.t("Original");
  }
  /**
   * A helper function that parses the transform options and returns list item definitions ready for use in the dropdown.
   *
   * @param options The transform options.
   * @param command The transform image command.
   * @returns Dropdown item definitions.
   */
  _getTransformDropdownListItemDefinitions(H, E) {
    const s = new Sa();
    return H.map((d) => {
      const u = {
        type: "button",
        model: new $o({
          commandName: "transformImage",
          commandValue: d.value,
          label: this._getOptionLabelValue(d),
          withText: !0,
          icon: null
        })
      };
      u.model.bind("isOn").to(E, "value", fc(d.value)), s.add(u);
    }), s;
  }
}
function fc(ke) {
  return (H) => {
    const E = H;
    return ke === null && E === ke ? !0 : E !== null && E.transform === ke;
  };
}
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */
class dc extends rr {
  static get requires() {
    return [ru, cc];
  }
  static get pluginName() {
    return "ImageTransform";
  }
}
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */
class pc extends Ts {
  refresh() {
    const H = this._element(), E = this._srcInfo(H);
    if (this.isEnabled = !!E, this.isEnabled) {
      let s = {
        assetId: E.assetId
      };
      Craft.sendActionRequest("POST", "ckeditor/ckeditor/image-permissions", {
        data: s
      }).then((d) => {
        d.data.editable === !1 && (this.isEnabled = !1);
      });
    }
  }
  /**
   * Returns the selected image element.
   */
  _element() {
    const H = this.editor;
    return H.plugins.get("ImageUtils").getClosestSelectedImageElement(
      H.model.document.selection
    );
  }
  /**
   * Checks if element has a src attribute and at least an asset id.
   * Returns null if not and array containing src, baseSrc, asset id and transform (if used).
   *
   * @param element
   * @returns {{transform: *, src: *, assetId: *, baseSrc: *}|null}
   * @private
   */
  _srcInfo(H) {
    if (!H || !H.hasAttribute("src"))
      return null;
    const E = H.getAttribute("src"), s = E.match(
      /(.*)#asset:(\d+)(?::transform:([a-zA-Z][a-zA-Z0-9_]*))?/
    );
    return s ? {
      src: E,
      baseSrc: s[1],
      assetId: s[2],
      transform: s[3]
    } : null;
  }
  /**
   * Executes the command.
   *
   * @fires execute
   */
  execute() {
    this.editor.model;
    const E = this._element(), s = this._srcInfo(E);
    if (s) {
      let d = {
        allowSavingAsNew: !1,
        // todo: we might want to change that, but currently we're doing the same functionality as in Redactor
        onSave: (u) => {
          this._reloadImage(s.assetId, u);
        },
        allowDegreeFractions: Craft.isImagick
      };
      new Craft.AssetImageEditor(s.assetId, d);
    }
  }
  /**
   * Reloads the matching images after save was triggered from the Image Editor.
   *
   * @param data
   */
  _reloadImage(H, E) {
    let d = this.editor.model;
    this._getAllImageAssets().forEach((o) => {
      if (o.srcInfo.assetId == H)
        if (o.srcInfo.transform) {
          let S = {
            assetId: o.srcInfo.assetId,
            handle: o.srcInfo.transform
          };
          Craft.sendActionRequest("POST", "assets/generate-transform", {
            data: S
          }).then((m) => {
            let g = m.data.url + "?" + (/* @__PURE__ */ new Date()).getTime() + "#asset:" + o.srcInfo.assetId + ":transform:" + o.srcInfo.transform;
            d.change((y) => {
              y.setAttribute("src", g, o.element);
            });
          });
        } else {
          let S = o.srcInfo.baseSrc + "?" + (/* @__PURE__ */ new Date()).getTime() + "#asset:" + o.srcInfo.assetId;
          d.change((m) => {
            m.setAttribute("src", S, o.element);
          });
        }
    });
  }
  /**
   * Returns all images present in the editor that are Craft Assets.
   *
   * @returns {*[]}
   * @private
   */
  _getAllImageAssets() {
    const E = this.editor.model, s = E.createRangeIn(E.document.getRoot());
    let d = [];
    for (const u of s.getWalker({ ignoreElementEnd: !0 }))
      if (u.item.is("element") && u.item.name === "imageBlock") {
        let o = this._srcInfo(u.item);
        o && d.push({
          element: u.item,
          srcInfo: o
        });
      }
    return d;
  }
}
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */
class ou extends rr {
  static get requires() {
    return [nu];
  }
  static get pluginName() {
    return "ImageEditorEditing";
  }
  init() {
    const H = this.editor, E = new pc(H);
    H.commands.add("imageEditor", E);
  }
}
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */
class hc extends rr {
  static get requires() {
    return [ou];
  }
  static get pluginName() {
    return "ImageEditorUI";
  }
  init() {
    const E = this.editor.commands.get("imageEditor");
    this.bind("isEnabled").to(E), this._registerImageEditorButton();
  }
  /**
   * A helper function that creates a button component for the plugin that triggers launch of the Image Editor.
   */
  _registerImageEditorButton() {
    const H = this.editor, E = H.t, s = H.commands.get("imageEditor"), d = () => {
      const u = new Cs();
      return u.set({
        label: E("Edit Image"),
        withText: !0
      }), u.bind("isEnabled").to(s), this.listenTo(u, "execute", (o) => {
        H.execute("imageEditor"), H.editing.view.focus();
      }), u;
    };
    H.ui.componentFactory.add("imageEditor", d);
  }
}
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */
class mc extends rr {
  static get requires() {
    return [ou, hc];
  }
  static get pluginName() {
    return "ImageEditor";
  }
}
class gc extends Ts {
  execute(H) {
    const E = this.editor, s = E.model.document.selection;
    E.model.change((d) => {
      const u = d.createElement("craftEntryModel", {
        ...Object.fromEntries(s.getAttributes()),
        cardHtml: H.cardHtml,
        entryId: H.entryId,
        siteId: H.siteId
      });
      E.model.insertObject(u, null, null, {
        setSelection: "after"
      });
    });
  }
  refresh() {
    const E = this.editor.model.document.selection, s = !E.isCollapsed && E.getFirstRange();
    this.isEnabled = !s;
  }
}
class bc extends rr {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [Zu];
  }
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "CraftEntriesEditing";
  }
  /**
   * @inheritDoc
   */
  init() {
    this._defineSchema(), this._defineConverters();
    const H = this.editor;
    H.commands.add("insertEntry", new gc(H)), H.editing.mapper.on(
      "viewToModelPosition",
      ec(H.model, (E) => {
        E.hasClass("cke-entry-card");
      })
    );
  }
  /**
   * Defines model schema for our widget.
   * @private
   */
  _defineSchema() {
    this.editor.model.schema.register("craftEntryModel", {
      inheritAllFrom: "$blockObject",
      allowAttributes: ["cardHtml", "entryId", "siteId"],
      allowChildren: !1
    });
  }
  /**
   * Defines conversion methods for model and both editing and data views.
   * @private
   */
  _defineConverters() {
    const H = this.editor.conversion;
    H.for("upcast").elementToElement({
      view: {
        name: "craft-entry"
        // has to be lower case
      },
      model: (s, { writer: d }) => {
        const u = s.getAttribute("data-card-html"), o = s.getAttribute("data-entry-id"), S = s.getAttribute("data-site-id") ?? null;
        return d.createElement("craftEntryModel", {
          cardHtml: u,
          entryId: o,
          siteId: S
        });
      }
    }), H.for("editingDowncast").elementToElement({
      model: "craftEntryModel",
      view: (s, { writer: d }) => {
        const u = s.getAttribute("entryId") ?? null, o = s.getAttribute("siteId") ?? null, S = d.createContainerElement("div", {
          class: "cke-entry-card",
          "data-entry-id": u,
          "data-site-id": o
        });
        return E(s, d, S), tc(S, d);
      }
    }), H.for("dataDowncast").elementToElement({
      model: "craftEntryModel",
      view: (s, { writer: d }) => {
        const u = s.getAttribute("entryId") ?? null, o = s.getAttribute("siteId") ?? null;
        return d.createContainerElement("craft-entry", {
          "data-entry-id": u,
          "data-site-id": o
        });
      }
    });
    const E = (s, d, u) => {
      this._getCardHtml(s).then((o) => {
        const S = d.createRawElement(
          "div",
          null,
          function(g) {
            g.innerHTML = o.cardHtml, Craft.appendHeadHtml(o.headHtml), Craft.appendBodyHtml(o.bodyHtml);
          }
        );
        d.insert(d.createPositionAt(u, 0), S);
        const m = this.editor;
        m.editing.view.focus(), setTimeout(() => {
          Craft.cp.elementThumbLoader.load($(m.ui.element));
        }, 100), m.model.change((g) => {
          m.ui.update(), $(m.sourceElement).trigger("keyup");
        });
      });
    };
  }
  /**
   * Get card html either from the attribute or via ajax request. In both cases, return via a promise.
   *
   * @param modelItem
   * @returns {Promise<unknown>|Promise<T | string>}
   * @private
   */
  async _getCardHtml(H) {
    var S, m, g;
    let E = H.getAttribute("cardHtml") ?? null, s = $(this.editor.sourceElement).parents(".field");
    const d = $(s[0]).data("layout-element");
    if (E)
      return { cardHtml: E };
    const u = H.getAttribute("entryId") ?? null, o = H.getAttribute("siteId") ?? null;
    try {
      const y = this.editor, C = $(y.ui.view.element).closest(
        "form,.lp-editor-container"
      ).data("elementEditor");
      C && await C.checkForm();
      const { data: O } = await Craft.sendActionRequest(
        "POST",
        "ckeditor/ckeditor/entry-card-html",
        {
          data: {
            entryId: u,
            siteId: o,
            layoutElementUid: d
          }
        }
      );
      return O;
    } catch (y) {
      return console.error((S = y == null ? void 0 : y.response) == null ? void 0 : S.data), { cardHtml: '<div class="element card"><div class="card-content"><div class="card-heading"><div class="label error"><span>' + (((g = (m = y == null ? void 0 : y.response) == null ? void 0 : m.data) == null ? void 0 : g.message) || "An unknown error occurred.") + "</span></div></div></div></div>" };
    }
  }
}
class yc extends nc {
  constructor(H) {
    super(H), this.domEventType = "dblclick";
  }
  onDomEvent(H) {
    this.fire(H.type, H);
  }
}
class vc extends rr {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [Jl];
  }
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "CraftEntriesUI";
  }
  /**
   * @inheritDoc
   */
  init() {
    this.editor.ui.componentFactory.add("createEntry", (H) => this._createToolbarEntriesButton(H)), this.editor.ui.componentFactory.add("editEntryBtn", (H) => this._createEditEntryBtn(H)), this._listenToEvents();
  }
  /**
   * @inheritDoc
   */
  afterInit() {
    this.editor.plugins.get(
      Jl
    ).register("entriesBalloon", {
      ariaLabel: Craft.t("ckeditor", "Entry toolbar"),
      // Toolbar Buttons
      items: ["editEntryBtn"],
      // If a related element is returned the toolbar is attached
      getRelatedElement: (E) => {
        const s = E.getSelectedElement();
        return s && rc(s) && s.hasClass("cke-entry-card") ? s : null;
      }
    });
  }
  /**
   * Hook up event listeners
   *
   * @private
   */
  _listenToEvents() {
    const H = this.editor.editing.view, E = H.document;
    H.addObserver(yc), this.editor.listenTo(E, "dblclick", (s, d) => {
      const u = this.editor.editing.mapper.toModelElement(
        d.target.parent
      );
      u.name === "craftEntryModel" && this._initEditEntrySlideout(d, u);
    });
  }
  _initEditEntrySlideout(H = null, E = null) {
    E === null && (E = this.editor.model.document.selection.getSelectedElement());
    const s = E.getAttribute("entryId"), d = E.getAttribute("siteId") ?? null;
    this._showEditEntrySlideout(s, d, E);
  }
  /**
   * Creates a toolbar button that allows for an entry to be inserted into the editor
   *
   * @param locale
   * @private
   */
  _createToolbarEntriesButton(H) {
    const E = this.editor, s = E.config.get("entryTypeOptions"), d = E.commands.get("insertEntry");
    if (!s || !s.length)
      return;
    const u = _a(H);
    return u.buttonView.set({
      label: E.config.get("createButtonLabel") || Craft.t("app", "New {type}", {
        type: Craft.t("app", "entry")
      }),
      tooltip: !0,
      withText: !0
      //commandValue: null,
    }), u.bind("isEnabled").to(d), xa(
      u,
      () => this._getDropdownItemsDefinitions(s, d),
      {
        ariaLabel: Craft.t("ckeditor", "Entry types list")
      }
    ), this.listenTo(u, "execute", (o) => {
      this._showCreateEntrySlideout(o.source.commandValue);
    }), u;
  }
  /**
   * Creates a list of entry type options that go into the insert entry button
   *
   * @param options
   * @param command
   * @returns {Collection<Record<string, any>>}
   * @private
   */
  _getDropdownItemsDefinitions(H, E) {
    const s = new Sa();
    return H.map((d) => {
      const u = {
        type: "button",
        model: new $o({
          commandValue: d.value,
          //entry type id
          label: d.label || d.value,
          icon: d.icon,
          withText: !0
        })
      };
      s.add(u);
    }), s;
  }
  /**
   * Creates an edit entry button that shows in the contextual balloon for each craft entry widget
   * @param locale
   * @returns {ButtonView}
   * @private
   */
  _createEditEntryBtn(H) {
    const E = new Cs(H);
    return E.set({
      isEnabled: !0,
      label: Craft.t("app", "Edit {type}", {
        type: Craft.t("app", "entry")
      }),
      tooltip: !0,
      withText: !0
    }), this.listenTo(E, "execute", (s) => {
      this._initEditEntrySlideout();
    }), E;
  }
  /**
   * Returns Craft.ElementEditor instance that the CKEditor field belongs to.
   *
   * @returns {*}
   */
  getElementEditor() {
    return $(this.editor.ui.view.element).closest(
      "form,.lp-editor-container"
    ).data("elementEditor");
  }
  /**
   * Returns HTML of the card by the entry ID.
   *
   * @param entryId
   * @returns {*}
   * @private
   */
  _getCardElement(H) {
    return $(this.editor.ui.element).find('.element.card[data-id="' + H + '"]');
  }
  /**
   * Opens an element editor for existing entry
   *
   * @param entryId
   * @private
   */
  _showEditEntrySlideout(H, E, s) {
    const d = this.editor, u = this.getElementEditor(), o = Craft.createElementEditor(this.elementType, null, {
      elementId: H,
      params: {
        siteId: E
      },
      onBeforeSubmit: async () => {
        let S = this._getCardElement(H);
        if (S !== null && Garnish.hasAttr(S, "data-owner-is-canonical") && !u.settings.isUnpublishedDraft) {
          await o.elementEditor.checkForm(!0, !0);
          let m = $(d.sourceElement).attr("name");
          u && m && await u.setFormValue(m, "*"), u.settings.draftId && o.elementEditor.settings.draftId && (o.elementEditor.settings.saveParams || (o.elementEditor.settings.saveParams = {}), o.elementEditor.settings.saveParams.action = "elements/save-nested-element-for-derivative", o.elementEditor.settings.saveParams.newOwnerId = u.getDraftElementId(S.data("owner-id")));
        }
      },
      onSubmit: (S) => {
        let m = this._getCardElement(H);
        m !== null && S.data.id != m.data("id") && (m.attr("data-id", S.data.id).data("id", S.data.id).data("owner-id", S.data.ownerId), d.editing.model.change((g) => {
          g.setAttribute("entryId", S.data.id, s), d.ui.update();
        }), Craft.refreshElementInstances(S.data.id));
      }
    });
  }
  /**
   * Creates new entry and opens the element editor for it
   *
   * @param entryTypeId
   * @private
   */
  async _showCreateEntrySlideout(H) {
    var m, g;
    const E = this.editor, s = E.config.get(
      "nestedElementAttributes"
    ), d = Object.assign({}, s, {
      typeId: H
    }), u = this.getElementEditor();
    u && (await u.markDeltaNameAsModified(E.sourceElement.name), d.ownerId = u.getDraftElementId(
      s.ownerId
    ));
    let o;
    try {
      o = (await Craft.sendActionRequest(
        "POST",
        "elements/create",
        {
          data: d
        }
      )).data;
    } catch (y) {
      throw Craft.cp.displayError((g = (m = y == null ? void 0 : y.response) == null ? void 0 : m.data) == null ? void 0 : g.error), y;
    }
    Craft.createElementEditor(this.elementType, {
      elementId: o.element.id,
      draftId: o.element.draftId,
      params: {
        fresh: 1,
        siteId: o.element.siteId
      }
    }).on("submit", (y) => {
      E.commands.execute("insertEntry", {
        entryId: y.data.id,
        siteId: y.data.siteId
      });
    });
  }
}
class iu extends rr {
  static get requires() {
    return [bc, vc];
  }
  static get pluginName() {
    return "CraftEntries";
  }
}
function kc(ke) {
  return ke && ke.__esModule && Object.prototype.hasOwnProperty.call(ke, "default") ? ke.default : ke;
}
var Ss = { exports: {} };
/*! For license information please see inspector.js.LICENSE.txt */
var Zl;
function wc() {
  return Zl || (Zl = 1, function(ke, H) {
    (function(E, s) {
      ke.exports = s();
    })(window, function() {
      return function(E) {
        var s = {};
        function d(u) {
          if (s[u]) return s[u].exports;
          var o = s[u] = { i: u, l: !1, exports: {} };
          return E[u].call(o.exports, o, o.exports, d), o.l = !0, o.exports;
        }
        return d.m = E, d.c = s, d.d = function(u, o, S) {
          d.o(u, o) || Object.defineProperty(u, o, { enumerable: !0, get: S });
        }, d.r = function(u) {
          typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(u, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(u, "__esModule", { value: !0 });
        }, d.t = function(u, o) {
          if (1 & o && (u = d(u)), 8 & o || 4 & o && typeof u == "object" && u && u.__esModule) return u;
          var S = /* @__PURE__ */ Object.create(null);
          if (d.r(S), Object.defineProperty(S, "default", { enumerable: !0, value: u }), 2 & o && typeof u != "string") for (var m in u) d.d(S, m, (function(g) {
            return u[g];
          }).bind(null, m));
          return S;
        }, d.n = function(u) {
          var o = u && u.__esModule ? function() {
            return u.default;
          } : function() {
            return u;
          };
          return d.d(o, "a", o), o;
        }, d.o = function(u, o) {
          return Object.prototype.hasOwnProperty.call(u, o);
        }, d.p = "", d(d.s = 94);
      }([function(E, s, d) {
        E.exports = d(21);
      }, function(E, s, d) {
        d.d(s, "a", function() {
          return o;
        }), d.d(s, "b", function() {
          return S;
        }), d.d(s, "c", function() {
          return m;
        });
        var u = d(19);
        function o(y, b = !0) {
          if (y === void 0) return "undefined";
          if (typeof y == "function") return "function() {…}";
          const C = Object(u.stringify)(y, g, null, { maxDepth: 2 });
          return b ? C : C.replace(/(^"|"$)/g, "");
        }
        function S(y) {
          const b = {};
          for (const C in y) b[C] = y[C], b[C].value = o(b[C].value);
          return b;
        }
        function m(y, b) {
          return y.length > b ? y.substr(0, b) + `… [${y.length - b} characters left]` : y;
        }
        function g(y, b, C) {
          return typeof y == "string" ? `"${y.replace("'", '"')}"` : C(y);
        }
      }, function(E, s, d) {
        function u(N) {
          return N && N.name;
        }
        function o(N) {
          return N && u(N) && N.is("attributeElement");
        }
        function S(N) {
          return N && u(N) && N.is("emptyElement");
        }
        function m(N) {
          return N && u(N) && N.is("uiElement");
        }
        function g(N) {
          return N && u(N) && N.is("rawElement");
        }
        function y(N) {
          return N && u(N) && N.is("editableElement");
        }
        function b(N) {
          return N && N.is("rootElement");
        }
        function C(N) {
          return { path: [...N.parent.getPath(), N.offset], offset: N.offset, isAtEnd: N.isAtEnd, isAtStart: N.isAtStart, parent: O(N.parent) };
        }
        function O(N) {
          return u(N) ? o(N) ? "attribute:" + N.name : b(N) ? "root:" + N.name : "container:" + N.name : N.data;
        }
        d.d(s, "d", function() {
          return u;
        }), d.d(s, "b", function() {
          return o;
        }), d.d(s, "e", function() {
          return S;
        }), d.d(s, "h", function() {
          return m;
        }), d.d(s, "f", function() {
          return g;
        }), d.d(s, "c", function() {
          return y;
        }), d.d(s, "g", function() {
          return b;
        }), d.d(s, "a", function() {
          return C;
        });
      }, function(E, s, d) {
        d.d(s, "a", function() {
          return u;
        });
        class u {
          static group(...S) {
            console.group(...S);
          }
          static groupEnd(...S) {
            console.groupEnd(...S);
          }
          static log(...S) {
            console.log(...S);
          }
          static warn(...S) {
            console.warn(...S);
          }
        }
      }, function(E, s, d) {
        function u(g) {
          return g && g.is("element");
        }
        function o(g) {
          return g && g.is("rootElement");
        }
        function S(g) {
          return g.getPath ? g.getPath() : g.path;
        }
        function m(g) {
          return { path: S(g), stickiness: g.stickiness, index: g.index, isAtEnd: g.isAtEnd, isAtStart: g.isAtStart, offset: g.offset, textNode: g.textNode && g.textNode.data };
        }
        d.d(s, "c", function() {
          return u;
        }), d.d(s, "d", function() {
          return o;
        }), d.d(s, "b", function() {
          return S;
        }), d.d(s, "a", function() {
          return m;
        });
      }, function(E, s, d) {
        (function(u, o) {
          var S = "[object Arguments]", m = "[object Map]", g = "[object Object]", y = "[object Set]", b = /^\[object .+?Constructor\]$/, C = /^(?:0|[1-9]\d*)$/, O = {};
          O["[object Float32Array]"] = O["[object Float64Array]"] = O["[object Int8Array]"] = O["[object Int16Array]"] = O["[object Int32Array]"] = O["[object Uint8Array]"] = O["[object Uint8ClampedArray]"] = O["[object Uint16Array]"] = O["[object Uint32Array]"] = !0, O[S] = O["[object Array]"] = O["[object ArrayBuffer]"] = O["[object Boolean]"] = O["[object DataView]"] = O["[object Date]"] = O["[object Error]"] = O["[object Function]"] = O[m] = O["[object Number]"] = O[g] = O["[object RegExp]"] = O[y] = O["[object String]"] = O["[object WeakMap]"] = !1;
          var N = typeof u == "object" && u && u.Object === Object && u, J = typeof self == "object" && self && self.Object === Object && self, Q = N || J || Function("return this")(), j = s && !s.nodeType && s, W = j && typeof o == "object" && o && !o.nodeType && o, P = W && W.exports === j, M = P && N.process, F = function() {
            try {
              return M && M.binding && M.binding("util");
            } catch {
            }
          }(), R = F && F.isTypedArray;
          function oe(V, ae) {
            for (var we = -1, Ce = V == null ? 0 : V.length; ++we < Ce; ) if (ae(V[we], we, V)) return !0;
            return !1;
          }
          function K(V) {
            var ae = -1, we = Array(V.size);
            return V.forEach(function(Ce, it) {
              we[++ae] = [it, Ce];
            }), we;
          }
          function I(V) {
            var ae = -1, we = Array(V.size);
            return V.forEach(function(Ce) {
              we[++ae] = Ce;
            }), we;
          }
          var A, se, le, te = Array.prototype, ue = Function.prototype, ye = Object.prototype, Z = Q["__core-js_shared__"], fe = ue.toString, D = ye.hasOwnProperty, ie = (A = /[^.]+$/.exec(Z && Z.keys && Z.keys.IE_PROTO || "")) ? "Symbol(src)_1." + A : "", be = ye.toString, Te = RegExp("^" + fe.call(D).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"), Ee = P ? Q.Buffer : void 0, Pe = Q.Symbol, Se = Q.Uint8Array, ze = ye.propertyIsEnumerable, Ze = te.splice, G = Pe ? Pe.toStringTag : void 0, Y = Object.getOwnPropertySymbols, me = Ee ? Ee.isBuffer : void 0, l = (se = Object.keys, le = Object, function(V) {
            return se(le(V));
          }), f = gn(Q, "DataView"), k = gn(Q, "Map"), L = gn(Q, "Promise"), U = gn(Q, "Set"), B = gn(Q, "WeakMap"), he = gn(Object, "create"), je = bn(f), Re = bn(k), Xe = bn(L), Ve = bn(U), At = bn(B), kt = Pe ? Pe.prototype : void 0, Zt = kt ? kt.valueOf : void 0;
          function wt(V) {
            var ae = -1, we = V == null ? 0 : V.length;
            for (this.clear(); ++ae < we; ) {
              var Ce = V[ae];
              this.set(Ce[0], Ce[1]);
            }
          }
          function gt(V) {
            var ae = -1, we = V == null ? 0 : V.length;
            for (this.clear(); ++ae < we; ) {
              var Ce = V[ae];
              this.set(Ce[0], Ce[1]);
            }
          }
          function un(V) {
            var ae = -1, we = V == null ? 0 : V.length;
            for (this.clear(); ++ae < we; ) {
              var Ce = V[ae];
              this.set(Ce[0], Ce[1]);
            }
          }
          function Er(V) {
            var ae = -1, we = V == null ? 0 : V.length;
            for (this.__data__ = new un(); ++ae < we; ) this.add(V[ae]);
          }
          function Tt(V) {
            var ae = this.__data__ = new gt(V);
            this.size = ae.size;
          }
          function pt(V, ae) {
            var we = ar(V), Ce = !we && ir(V), it = !we && !Ce && Cn(V), qe = !we && !Ce && !it && Gr(V), st = we || Ce || it || qe, tt = st ? function(bt, Pt) {
              for (var tn = -1, ht = Array(bt); ++tn < bt; ) ht[tn] = Pt(tn);
              return ht;
            }(V.length, String) : [], Ot = tt.length;
            for (var nt in V) !D.call(V, nt) || st && (nt == "length" || it && (nt == "offset" || nt == "parent") || qe && (nt == "buffer" || nt == "byteLength" || nt == "byteOffset") || Cr(nt, Ot)) || tt.push(nt);
            return tt;
          }
          function $n(V, ae) {
            for (var we = V.length; we--; ) if (Tr(V[we][0], ae)) return we;
            return -1;
          }
          function Sn(V) {
            return V == null ? V === void 0 ? "[object Undefined]" : "[object Null]" : G && G in Object(V) ? function(ae) {
              var we = D.call(ae, G), Ce = ae[G];
              try {
                ae[G] = void 0;
                var it = !0;
              } catch {
              }
              var qe = be.call(ae);
              return it && (we ? ae[G] = Ce : delete ae[G]), qe;
            }(V) : function(ae) {
              return be.call(ae);
            }(V);
          }
          function or(V) {
            return On(V) && Sn(V) == S;
          }
          function _r(V, ae, we, Ce, it) {
            return V === ae || (V == null || ae == null || !On(V) && !On(ae) ? V != V && ae != ae : function(qe, st, tt, Ot, nt, bt) {
              var Pt = ar(qe), tn = ar(st), ht = Pt ? "[object Array]" : ct(qe), Wt = tn ? "[object Array]" : ct(st), Pn = (ht = ht == S ? g : ht) == g, ut = (Wt = Wt == S ? g : Wt) == g, yn = ht == Wt;
              if (yn && Cn(qe)) {
                if (!Cn(st)) return !1;
                Pt = !0, Pn = !1;
              }
              if (yn && !Pn) return bt || (bt = new Tt()), Pt || Gr(qe) ? Yt(qe, st, tt, Ot, nt, bt) : function(rt, Ue, Yn, Kt, Or, Mt, nn) {
                switch (Yn) {
                  case "[object DataView]":
                    if (rt.byteLength != Ue.byteLength || rt.byteOffset != Ue.byteOffset) return !1;
                    rt = rt.buffer, Ue = Ue.buffer;
                  case "[object ArrayBuffer]":
                    return !(rt.byteLength != Ue.byteLength || !Mt(new Se(rt), new Se(Ue)));
                  case "[object Boolean]":
                  case "[object Date]":
                  case "[object Number]":
                    return Tr(+rt, +Ue);
                  case "[object Error]":
                    return rt.name == Ue.name && rt.message == Ue.message;
                  case "[object RegExp]":
                  case "[object String]":
                    return rt == Ue + "";
                  case m:
                    var Ht = K;
                  case y:
                    var Qt = 1 & Kt;
                    if (Ht || (Ht = I), rt.size != Ue.size && !Qt) return !1;
                    var ur = nn.get(rt);
                    if (ur) return ur == Ue;
                    Kt |= 2, nn.set(rt, Ue);
                    var Dn = Yt(Ht(rt), Ht(Ue), Kt, Or, Mt, nn);
                    return nn.delete(rt), Dn;
                  case "[object Symbol]":
                    if (Zt) return Zt.call(rt) == Zt.call(Ue);
                }
                return !1;
              }(qe, st, ht, tt, Ot, nt, bt);
              if (!(1 & tt)) {
                var cn = Pn && D.call(qe, "__wrapped__"), Nn = ut && D.call(st, "__wrapped__");
                if (cn || Nn) {
                  var Eo = cn ? qe.value() : qe, _o = Nn ? st.value() : st;
                  return bt || (bt = new Tt()), nt(Eo, _o, tt, Ot, bt);
                }
              }
              return yn ? (bt || (bt = new Tt()), function(rt, Ue, Yn, Kt, Or, Mt) {
                var nn = 1 & Yn, Ht = xr(rt), Qt = Ht.length, ur = xr(Ue).length;
                if (Qt != ur && !nn) return !1;
                for (var Dn = Qt; Dn--; ) {
                  var rn = Ht[Dn];
                  if (!(nn ? rn in Ue : D.call(Ue, rn))) return !1;
                }
                var yt = Mt.get(rt);
                if (yt && Mt.get(Ue)) return yt == Ue;
                var Et = !0;
                Mt.set(rt, Ue), Mt.set(Ue, rt);
                for (var cr = nn; ++Dn < Qt; ) {
                  rn = Ht[Dn];
                  var fr = rt[rn], vn = Ue[rn];
                  if (Kt) var Ut = nn ? Kt(vn, fr, rn, Ue, rt, Mt) : Kt(fr, vn, rn, rt, Ue, Mt);
                  if (!(Ut === void 0 ? fr === vn || Or(fr, vn, Yn, Kt, Mt) : Ut)) {
                    Et = !1;
                    break;
                  }
                  cr || (cr = rn == "constructor");
                }
                if (Et && !cr) {
                  var Vt = rt.constructor, on = Ue.constructor;
                  Vt == on || !("constructor" in rt) || !("constructor" in Ue) || typeof Vt == "function" && Vt instanceof Vt && typeof on == "function" && on instanceof on || (Et = !1);
                }
                return Mt.delete(rt), Mt.delete(Ue), Et;
              }(qe, st, tt, Ot, nt, bt)) : !1;
            }(V, ae, we, Ce, _r, it));
          }
          function wo(V) {
            return !(!lr(V) || function(ae) {
              return !!ie && ie in ae;
            }(V)) && (sr(V) ? Te : b).test(bn(V));
          }
          function en(V) {
            if (we = (ae = V) && ae.constructor, Ce = typeof we == "function" && we.prototype || ye, ae !== Ce) return l(V);
            var ae, we, Ce, it = [];
            for (var qe in Object(V)) D.call(V, qe) && qe != "constructor" && it.push(qe);
            return it;
          }
          function Yt(V, ae, we, Ce, it, qe) {
            var st = 1 & we, tt = V.length, Ot = ae.length;
            if (tt != Ot && !(st && Ot > tt)) return !1;
            var nt = qe.get(V);
            if (nt && qe.get(ae)) return nt == ae;
            var bt = -1, Pt = !0, tn = 2 & we ? new Er() : void 0;
            for (qe.set(V, ae), qe.set(ae, V); ++bt < tt; ) {
              var ht = V[bt], Wt = ae[bt];
              if (Ce) var Pn = st ? Ce(Wt, ht, bt, ae, V, qe) : Ce(ht, Wt, bt, V, ae, qe);
              if (Pn !== void 0) {
                if (Pn) continue;
                Pt = !1;
                break;
              }
              if (tn) {
                if (!oe(ae, function(ut, yn) {
                  if (cn = yn, !tn.has(cn) && (ht === ut || it(ht, ut, we, Ce, qe))) return tn.push(yn);
                  var cn;
                })) {
                  Pt = !1;
                  break;
                }
              } else if (ht !== Wt && !it(ht, Wt, we, Ce, qe)) {
                Pt = !1;
                break;
              }
            }
            return qe.delete(V), qe.delete(ae), Pt;
          }
          function xr(V) {
            return function(ae, we, Ce) {
              var it = we(ae);
              return ar(ae) ? it : function(qe, st) {
                for (var tt = -1, Ot = st.length, nt = qe.length; ++tt < Ot; ) qe[nt + tt] = st[tt];
                return qe;
              }(it, Ce(ae));
            }(V, Xr, Sr);
          }
          function qt(V, ae) {
            var we, Ce, it = V.__data__;
            return ((Ce = typeof (we = ae)) == "string" || Ce == "number" || Ce == "symbol" || Ce == "boolean" ? we !== "__proto__" : we === null) ? it[typeof ae == "string" ? "string" : "hash"] : it.map;
          }
          function gn(V, ae) {
            var we = function(Ce, it) {
              return Ce == null ? void 0 : Ce[it];
            }(V, ae);
            return wo(we) ? we : void 0;
          }
          wt.prototype.clear = function() {
            this.__data__ = he ? he(null) : {}, this.size = 0;
          }, wt.prototype.delete = function(V) {
            var ae = this.has(V) && delete this.__data__[V];
            return this.size -= ae ? 1 : 0, ae;
          }, wt.prototype.get = function(V) {
            var ae = this.__data__;
            if (he) {
              var we = ae[V];
              return we === "__lodash_hash_undefined__" ? void 0 : we;
            }
            return D.call(ae, V) ? ae[V] : void 0;
          }, wt.prototype.has = function(V) {
            var ae = this.__data__;
            return he ? ae[V] !== void 0 : D.call(ae, V);
          }, wt.prototype.set = function(V, ae) {
            var we = this.__data__;
            return this.size += this.has(V) ? 0 : 1, we[V] = he && ae === void 0 ? "__lodash_hash_undefined__" : ae, this;
          }, gt.prototype.clear = function() {
            this.__data__ = [], this.size = 0;
          }, gt.prototype.delete = function(V) {
            var ae = this.__data__, we = $n(ae, V);
            return !(we < 0) && (we == ae.length - 1 ? ae.pop() : Ze.call(ae, we, 1), --this.size, !0);
          }, gt.prototype.get = function(V) {
            var ae = this.__data__, we = $n(ae, V);
            return we < 0 ? void 0 : ae[we][1];
          }, gt.prototype.has = function(V) {
            return $n(this.__data__, V) > -1;
          }, gt.prototype.set = function(V, ae) {
            var we = this.__data__, Ce = $n(we, V);
            return Ce < 0 ? (++this.size, we.push([V, ae])) : we[Ce][1] = ae, this;
          }, un.prototype.clear = function() {
            this.size = 0, this.__data__ = { hash: new wt(), map: new (k || gt)(), string: new wt() };
          }, un.prototype.delete = function(V) {
            var ae = qt(this, V).delete(V);
            return this.size -= ae ? 1 : 0, ae;
          }, un.prototype.get = function(V) {
            return qt(this, V).get(V);
          }, un.prototype.has = function(V) {
            return qt(this, V).has(V);
          }, un.prototype.set = function(V, ae) {
            var we = qt(this, V), Ce = we.size;
            return we.set(V, ae), this.size += we.size == Ce ? 0 : 1, this;
          }, Er.prototype.add = Er.prototype.push = function(V) {
            return this.__data__.set(V, "__lodash_hash_undefined__"), this;
          }, Er.prototype.has = function(V) {
            return this.__data__.has(V);
          }, Tt.prototype.clear = function() {
            this.__data__ = new gt(), this.size = 0;
          }, Tt.prototype.delete = function(V) {
            var ae = this.__data__, we = ae.delete(V);
            return this.size = ae.size, we;
          }, Tt.prototype.get = function(V) {
            return this.__data__.get(V);
          }, Tt.prototype.has = function(V) {
            return this.__data__.has(V);
          }, Tt.prototype.set = function(V, ae) {
            var we = this.__data__;
            if (we instanceof gt) {
              var Ce = we.__data__;
              if (!k || Ce.length < 199) return Ce.push([V, ae]), this.size = ++we.size, this;
              we = this.__data__ = new un(Ce);
            }
            return we.set(V, ae), this.size = we.size, this;
          };
          var Sr = Y ? function(V) {
            return V == null ? [] : (V = Object(V), function(ae, we) {
              for (var Ce = -1, it = ae == null ? 0 : ae.length, qe = 0, st = []; ++Ce < it; ) {
                var tt = ae[Ce];
                we(tt, Ce, ae) && (st[qe++] = tt);
              }
              return st;
            }(Y(V), function(ae) {
              return ze.call(V, ae);
            }));
          } : function() {
            return [];
          }, ct = Sn;
          function Cr(V, ae) {
            return !!(ae = ae ?? 9007199254740991) && (typeof V == "number" || C.test(V)) && V > -1 && V % 1 == 0 && V < ae;
          }
          function bn(V) {
            if (V != null) {
              try {
                return fe.call(V);
              } catch {
              }
              try {
                return V + "";
              } catch {
              }
            }
            return "";
          }
          function Tr(V, ae) {
            return V === ae || V != V && ae != ae;
          }
          (f && ct(new f(new ArrayBuffer(1))) != "[object DataView]" || k && ct(new k()) != m || L && ct(L.resolve()) != "[object Promise]" || U && ct(new U()) != y || B && ct(new B()) != "[object WeakMap]") && (ct = function(V) {
            var ae = Sn(V), we = ae == g ? V.constructor : void 0, Ce = we ? bn(we) : "";
            if (Ce) switch (Ce) {
              case je:
                return "[object DataView]";
              case Re:
                return m;
              case Xe:
                return "[object Promise]";
              case Ve:
                return y;
              case At:
                return "[object WeakMap]";
            }
            return ae;
          });
          var ir = or(/* @__PURE__ */ function() {
            return arguments;
          }()) ? or : function(V) {
            return On(V) && D.call(V, "callee") && !ze.call(V, "callee");
          }, ar = Array.isArray, Cn = me || function() {
            return !1;
          };
          function sr(V) {
            if (!lr(V)) return !1;
            var ae = Sn(V);
            return ae == "[object Function]" || ae == "[object GeneratorFunction]" || ae == "[object AsyncFunction]" || ae == "[object Proxy]";
          }
          function Tn(V) {
            return typeof V == "number" && V > -1 && V % 1 == 0 && V <= 9007199254740991;
          }
          function lr(V) {
            var ae = typeof V;
            return V != null && (ae == "object" || ae == "function");
          }
          function On(V) {
            return V != null && typeof V == "object";
          }
          var Gr = R ? /* @__PURE__ */ function(V) {
            return function(ae) {
              return V(ae);
            };
          }(R) : function(V) {
            return On(V) && Tn(V.length) && !!O[Sn(V)];
          };
          function Xr(V) {
            return (ae = V) != null && Tn(ae.length) && !sr(ae) ? pt(V) : en(V);
            var ae;
          }
          o.exports = function(V, ae) {
            return _r(V, ae);
          };
        }).call(this, d(15), d(33)(E));
      }, function(E, s, d) {
        var u, o = function() {
          return u === void 0 && (u = !!(window && document && document.all && !window.atob)), u;
        }, S = /* @__PURE__ */ function() {
          var P = {};
          return function(M) {
            if (P[M] === void 0) {
              var F = document.querySelector(M);
              if (window.HTMLIFrameElement && F instanceof window.HTMLIFrameElement) try {
                F = F.contentDocument.head;
              } catch {
                F = null;
              }
              P[M] = F;
            }
            return P[M];
          };
        }(), m = [];
        function g(P) {
          for (var M = -1, F = 0; F < m.length; F++) if (m[F].identifier === P) {
            M = F;
            break;
          }
          return M;
        }
        function y(P, M) {
          for (var F = {}, R = [], oe = 0; oe < P.length; oe++) {
            var K = P[oe], I = M.base ? K[0] + M.base : K[0], A = F[I] || 0, se = "".concat(I, " ").concat(A);
            F[I] = A + 1;
            var le = g(se), te = { css: K[1], media: K[2], sourceMap: K[3] };
            le !== -1 ? (m[le].references++, m[le].updater(te)) : m.push({ identifier: se, updater: W(te, M), references: 1 }), R.push(se);
          }
          return R;
        }
        function b(P) {
          var M = document.createElement("style"), F = P.attributes || {};
          if (F.nonce === void 0) {
            var R = d.nc;
            R && (F.nonce = R);
          }
          if (Object.keys(F).forEach(function(K) {
            M.setAttribute(K, F[K]);
          }), typeof P.insert == "function") P.insert(M);
          else {
            var oe = S(P.insert || "head");
            if (!oe) throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
            oe.appendChild(M);
          }
          return M;
        }
        var C, O = (C = [], function(P, M) {
          return C[P] = M, C.filter(Boolean).join(`
`);
        });
        function N(P, M, F, R) {
          var oe = F ? "" : R.media ? "@media ".concat(R.media, " {").concat(R.css, "}") : R.css;
          if (P.styleSheet) P.styleSheet.cssText = O(M, oe);
          else {
            var K = document.createTextNode(oe), I = P.childNodes;
            I[M] && P.removeChild(I[M]), I.length ? P.insertBefore(K, I[M]) : P.appendChild(K);
          }
        }
        function J(P, M, F) {
          var R = F.css, oe = F.media, K = F.sourceMap;
          if (oe ? P.setAttribute("media", oe) : P.removeAttribute("media"), K && typeof btoa < "u" && (R += `
/*# sourceMappingURL=data:application/json;base64,`.concat(btoa(unescape(encodeURIComponent(JSON.stringify(K)))), " */")), P.styleSheet) P.styleSheet.cssText = R;
          else {
            for (; P.firstChild; ) P.removeChild(P.firstChild);
            P.appendChild(document.createTextNode(R));
          }
        }
        var Q = null, j = 0;
        function W(P, M) {
          var F, R, oe;
          if (M.singleton) {
            var K = j++;
            F = Q || (Q = b(M)), R = N.bind(null, F, K, !1), oe = N.bind(null, F, K, !0);
          } else F = b(M), R = J.bind(null, F, M), oe = function() {
            (function(I) {
              if (I.parentNode === null) return !1;
              I.parentNode.removeChild(I);
            })(F);
          };
          return R(P), function(I) {
            if (I) {
              if (I.css === P.css && I.media === P.media && I.sourceMap === P.sourceMap) return;
              R(P = I);
            } else oe();
          };
        }
        E.exports = function(P, M) {
          (M = M || {}).singleton || typeof M.singleton == "boolean" || (M.singleton = o());
          var F = y(P = P || [], M);
          return function(R) {
            if (R = R || [], Object.prototype.toString.call(R) === "[object Array]") {
              for (var oe = 0; oe < F.length; oe++) {
                var K = g(F[oe]);
                m[K].references--;
              }
              for (var I = y(R, M), A = 0; A < F.length; A++) {
                var se = g(F[A]);
                m[se].references === 0 && (m[se].updater(), m.splice(se, 1));
              }
              F = I;
            }
          };
        };
      }, function(E, s, d) {
        E.exports = function(u) {
          var o = [];
          return o.toString = function() {
            return this.map(function(S) {
              var m = function(g, y) {
                var b = g[1] || "", C = g[3];
                if (!C) return b;
                if (y && typeof btoa == "function") {
                  var O = (J = C, "/*# sourceMappingURL=data:application/json;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(J)))) + " */"), N = C.sources.map(function(Q) {
                    return "/*# sourceURL=" + C.sourceRoot + Q + " */";
                  });
                  return [b].concat(N).concat([O]).join(`
`);
                }
                var J;
                return [b].join(`
`);
              }(S, u);
              return S[2] ? "@media " + S[2] + "{" + m + "}" : m;
            }).join("");
          }, o.i = function(S, m) {
            typeof S == "string" && (S = [[null, S, ""]]);
            for (var g = {}, y = 0; y < this.length; y++) {
              var b = this[y][0];
              b != null && (g[b] = !0);
            }
            for (y = 0; y < S.length; y++) {
              var C = S[y];
              C[0] != null && g[C[0]] || (m && !C[2] ? C[2] = m : m && (C[2] = "(" + C[2] + ") and (" + m + ")"), o.push(C));
            }
          }, o;
        };
      }, function(E, s, d) {
        d.d(s, "c", function() {
          return S;
        }), d.d(s, "b", function() {
          return m;
        }), d.d(s, "a", function() {
          return g;
        });
        var u = d(3);
        let o = 0;
        function S(y) {
          const b = { editors: {}, options: {} };
          if (typeof y[0] == "string") u.a.warn(`[CKEditorInspector] The CKEditorInspector.attach( '${y[0]}', editor ) syntax has been deprecated and will be removed in the near future. To pass a name of an editor instance, use CKEditorInspector.attach( { '${y[0]}': editor } ) instead. Learn more in https://github.com/ckeditor/ckeditor5-inspector/blob/master/README.md.`), b.editors[y[0]] = y[1];
          else {
            if ((C = y[0]).model && C.editing) b.editors["editor-" + ++o] = y[0];
            else for (const O in y[0]) b.editors[O] = y[0][O];
            b.options = y[1] || b.options;
          }
          var C;
          return b;
        }
        function m(y) {
          return [...y][0][0] || "";
        }
        function g(y, b) {
          const C = Math.min(y.length, b.length);
          for (let O = 0; O < C; O++) if (y[O] != b[O]) return O;
          return y.length == b.length ? "same" : y.length < b.length ? "prefix" : "extension";
        }
      }, function(E, s, d) {
        d.d(s, "a", function() {
          return m;
        }), d.d(s, "d", function() {
          return b;
        }), d.d(s, "c", function() {
          return C;
        }), d.d(s, "e", function() {
          return O;
        }), d.d(s, "b", function() {
          return N;
        });
        var u = d(2), o = d(8), S = d(1);
        const m = "https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view", g = `&lt;!--The View UI element content has been skipped. <a href="${m}_uielement-UIElement.html" target="_blank">Find out why</a>. --&gt;`, y = `&lt;!--The View raw element content has been skipped. <a href="${m}_rawelement-RawElement.html" target="_blank">Find out why</a>. --&gt;`;
        function b(P) {
          return P ? [...P.editing.view.document.roots] : [];
        }
        function C(P, M) {
          if (!P) return [];
          const F = [], R = P.editing.view.document.selection;
          for (const oe of R.getRanges()) oe.root.rootName === M && F.push({ type: "selection", start: Object(u.a)(oe.start), end: Object(u.a)(oe.end) });
          return F;
        }
        function O({ currentEditor: P, currentRootName: M, ranges: F }) {
          return !P || !M ? null : [J(P.editing.view.document.getRoot(M), [...F])];
        }
        function N(P) {
          const M = { editorNode: P, properties: {}, attributes: {}, customProperties: {} };
          if (Object(u.d)(P)) {
            Object(u.g)(P) ? (M.type = "RootEditableElement", M.name = P.rootName, M.url = m + "_rooteditableelement-RootEditableElement.html") : (M.name = P.name, Object(u.b)(P) ? (M.type = "AttributeElement", M.url = m + "_attributeelement-AttributeElement.html") : Object(u.e)(P) ? (M.type = "EmptyElement", M.url = m + "_emptyelement-EmptyElement.html") : Object(u.h)(P) ? (M.type = "UIElement", M.url = m + "_uielement-UIElement.html") : Object(u.f)(P) ? (M.type = "RawElement", M.url = m + "_rawelement-RawElement.html") : Object(u.c)(P) ? (M.type = "EditableElement", M.url = m + "_editableelement-EditableElement.html") : (M.type = "ContainerElement", M.url = m + "_containerelement-ContainerElement.html")), W(P).forEach(([F, R]) => {
              M.attributes[F] = { value: R };
            }), M.properties = { index: { value: P.index }, isEmpty: { value: P.isEmpty }, childCount: { value: P.childCount } };
            for (let [F, R] of P.getCustomProperties()) typeof F == "symbol" && (F = F.toString()), M.customProperties[F] = { value: R };
          } else M.name = P.data, M.type = "Text", M.url = m + "_text-Text.html", M.properties = { index: { value: P.index } };
          return M.properties = Object(S.b)(M.properties), M.customProperties = Object(S.b)(M.customProperties), M.attributes = Object(S.b)(M.attributes), M;
        }
        function J(P, M) {
          const F = {};
          return Object.assign(F, { index: P.index, path: P.getPath(), node: P, positionsBefore: [], positionsAfter: [] }), Object(u.d)(P) ? function(R, oe) {
            const K = R.node;
            Object.assign(R, { type: "element", children: [], positions: [] }), R.name = K.name, Object(u.b)(K) ? R.elementType = "attribute" : Object(u.g)(K) ? R.elementType = "root" : Object(u.e)(K) ? R.elementType = "empty" : Object(u.h)(K) ? R.elementType = "ui" : Object(u.f)(K) ? R.elementType = "raw" : R.elementType = "container", Object(u.e)(K) ? R.presentation = { isEmpty: !0 } : Object(u.h)(K) ? R.children.push({ type: "comment", text: g }) : Object(u.f)(K) && R.children.push({ type: "comment", text: y });
            for (const I of K.getChildren()) R.children.push(J(I, oe));
            (function(I, A) {
              for (const se of A) {
                const le = Q(I, se);
                for (const te of le) {
                  const ue = te.offset;
                  if (ue === 0) {
                    const ye = I.children[0];
                    ye ? ye.positionsBefore.push(te) : I.positions.push(te);
                  } else if (ue === I.children.length) {
                    const ye = I.children[I.children.length - 1];
                    ye ? ye.positionsAfter.push(te) : I.positions.push(te);
                  } else {
                    let ye = te.isEnd ? 0 : I.children.length - 1, Z = I.children[ye];
                    for (; Z; ) {
                      if (Z.index === ue) {
                        Z.positionsBefore.push(te);
                        break;
                      }
                      if (Z.index + 1 === ue) {
                        Z.positionsAfter.push(te);
                        break;
                      }
                      ye += te.isEnd ? 1 : -1, Z = I.children[ye];
                    }
                  }
                }
              }
            })(R, oe), R.attributes = function(I) {
              const A = W(I).map(([se, le]) => [se, Object(S.a)(le, !1)]);
              return new Map(A);
            }(K);
          }(F, M) : function(R, oe) {
            Object.assign(R, { type: "text", startOffset: 0, text: R.node.data, positions: [] });
            for (const K of oe) {
              const I = Q(R, K);
              R.positions.push(...I);
            }
          }(F, M), F;
        }
        function Q(P, M) {
          const F = P.path, R = M.start.path, oe = M.end.path, K = [];
          return j(F, R) && K.push({ offset: R[R.length - 1], isEnd: !1, presentation: M.presentation || null, type: M.type, name: M.name || null }), j(F, oe) && K.push({ offset: oe[oe.length - 1], isEnd: !0, presentation: M.presentation || null, type: M.type, name: M.name || null }), K;
        }
        function j(P, M) {
          return P.length === M.length - 1 && Object(o.a)(P, M) === "prefix";
        }
        function W(P) {
          return [...P.getAttributes()].sort(([M], [F]) => M.toUpperCase() < F.toUpperCase() ? -1 : 1);
        }
      }, function(E, s, d) {
        d.d(s, "d", function() {
          return y;
        }), d.d(s, "c", function() {
          return b;
        }), d.d(s, "a", function() {
          return C;
        }), d.d(s, "e", function() {
          return O;
        }), d.d(s, "b", function() {
          return N;
        });
        var u = d(4), o = d(8), S = d(1);
        const m = "https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_", g = ["#03a9f4", "#fb8c00", "#009688", "#e91e63", "#4caf50", "#00bcd4", "#607d8b", "#cddc39", "#9c27b0", "#f44336", "#6d4c41", "#8bc34a", "#3f51b5", "#2196f3", "#f4511e", "#673ab7", "#ffb300"];
        function y(M) {
          if (!M) return [];
          const F = [...M.model.document.roots];
          return F.filter(({ rootName: R }) => R !== "$graveyard").concat(F.filter(({ rootName: R }) => R === "$graveyard"));
        }
        function b(M, F) {
          if (!M) return [];
          const R = [], oe = M.model;
          for (const K of oe.document.selection.getRanges()) K.root.rootName === F && R.push({ type: "selection", start: Object(u.a)(K.start), end: Object(u.a)(K.end) });
          return R;
        }
        function C(M, F) {
          if (!M) return [];
          const R = [], oe = M.model;
          let K = 0;
          for (const I of oe.markers) {
            const { name: A, affectsData: se, managedUsingOperations: le } = I, te = I.getStart(), ue = I.getEnd();
            te.root.rootName === F && R.push({ type: "marker", marker: I, name: A, affectsData: se, managedUsingOperations: le, presentation: { color: g[K++ % (g.length - 1)] }, start: Object(u.a)(te), end: Object(u.a)(ue) });
          }
          return R;
        }
        function O({ currentEditor: M, currentRootName: F, ranges: R, markers: oe }) {
          return M ? [J(M.model.document.getRoot(F), [...R, ...oe])] : [];
        }
        function N(M, F) {
          const R = { editorNode: F, properties: {}, attributes: {} };
          Object(u.c)(F) ? (Object(u.d)(F) ? (R.type = "RootElement", R.name = F.rootName, R.url = m + "rootelement-RootElement.html") : (R.type = "Element", R.name = F.name, R.url = m + "element-Element.html"), R.properties = { childCount: { value: F.childCount }, startOffset: { value: F.startOffset }, endOffset: { value: F.endOffset }, maxOffset: { value: F.maxOffset } }) : (R.name = F.data, R.type = "Text", R.url = m + "text-Text.html", R.properties = { startOffset: { value: F.startOffset }, endOffset: { value: F.endOffset }, offsetSize: { value: F.offsetSize } }), R.properties.path = { value: Object(u.b)(F) }, j(F).forEach(([oe, K]) => {
            R.attributes[oe] = { value: K };
          }), R.properties = Object(S.b)(R.properties), R.attributes = Object(S.b)(R.attributes);
          for (const oe in R.attributes) {
            const K = {}, I = M.model.schema.getAttributeProperties(oe);
            for (const A in I) K[A] = { value: I[A] };
            R.attributes[oe].subProperties = Object(S.b)(K);
          }
          return R;
        }
        function J(M, F) {
          const R = {}, { startOffset: oe, endOffset: K } = M;
          return Object.assign(R, { startOffset: oe, endOffset: K, node: M, path: M.getPath(), positionsBefore: [], positionsAfter: [] }), Object(u.c)(M) ? function(I, A) {
            const se = I.node;
            Object.assign(I, { type: "element", name: se.name, children: [], maxOffset: se.maxOffset, positions: [] });
            for (const le of se.getChildren()) I.children.push(J(le, A));
            (function(le, te) {
              for (const ue of te) {
                const ye = W(le, ue);
                for (const Z of ye) {
                  const fe = Z.offset;
                  if (fe === 0) {
                    const D = le.children[0];
                    D ? D.positionsBefore.push(Z) : le.positions.push(Z);
                  } else if (fe === le.maxOffset) {
                    const D = le.children[le.children.length - 1];
                    D ? D.positionsAfter.push(Z) : le.positions.push(Z);
                  } else {
                    let D = Z.isEnd ? 0 : le.children.length - 1, ie = le.children[D];
                    for (; ie; ) {
                      if (ie.startOffset === fe) {
                        ie.positionsBefore.push(Z);
                        break;
                      }
                      if (ie.endOffset === fe) {
                        const be = le.children[D + 1], Te = ie.type === "text" && be && be.type === "element", Ee = ie.type === "element" && be && be.type === "text", Pe = ie.type === "text" && be && be.type === "text";
                        Z.isEnd && (Te || Ee || Pe) ? be.positionsBefore.push(Z) : ie.positionsAfter.push(Z);
                        break;
                      }
                      if (ie.startOffset < fe && ie.endOffset > fe) {
                        ie.positions.push(Z);
                        break;
                      }
                      D += Z.isEnd ? 1 : -1, ie = le.children[D];
                    }
                  }
                }
              }
            })(I, A), I.attributes = Q(se);
          }(R, F) : function(I) {
            const A = I.node;
            Object.assign(I, { type: "text", text: A.data, positions: [], presentation: { dontRenderAttributeValue: !0 } }), I.attributes = Q(A);
          }(R), R;
        }
        function Q(M) {
          const F = j(M).map(([R, oe]) => [R, Object(S.a)(oe, !1)]);
          return new Map(F);
        }
        function j(M) {
          return [...M.getAttributes()].sort(([F], [R]) => F < R ? -1 : 1);
        }
        function W(M, F) {
          const R = M.path, oe = F.start.path, K = F.end.path, I = [];
          return P(R, oe) && I.push({ offset: oe[oe.length - 1], isEnd: !1, presentation: F.presentation || null, type: F.type, name: F.name || null }), P(R, K) && I.push({ offset: K[K.length - 1], isEnd: !0, presentation: F.presentation || null, type: F.type, name: F.name || null }), I;
        }
        function P(M, F) {
          return M.length === F.length - 1 && Object(o.a)(M, F) === "prefix";
        }
      }, function(E, s, d) {
        d.d(s, "a", function() {
          return j;
        });
        var u = d(0), o = d.n(u), S = d(5), m = d.n(S);
        class g extends u.Component {
          constructor(P) {
            super(P), this.handleClick = this.handleClick.bind(this);
          }
          handleClick(P) {
            this.globalTreeProps.onClick(P, this.definition.node);
          }
          getChildren() {
            return this.definition.children.map((P, M) => Q(P, M, this.props.globalTreeProps));
          }
          get definition() {
            return this.props.definition;
          }
          get globalTreeProps() {
            return this.props.globalTreeProps || {};
          }
          get isActive() {
            return this.definition.node === this.globalTreeProps.activeNode;
          }
          shouldComponentUpdate(P) {
            return !m()(this.props, P);
          }
        }
        var y = d(1);
        class b extends u.PureComponent {
          render() {
            let P;
            const M = Object(y.c)(this.props.value, 500);
            return this.props.dontRenderValue || (P = o.a.createElement("span", { className: "ck-inspector-tree-node__attribute__value" }, M)), o.a.createElement("span", { className: "ck-inspector-tree-node__attribute" }, o.a.createElement("span", { className: "ck-inspector-tree-node__attribute__name", title: M }, this.props.name), P);
          }
        }
        class C extends u.Component {
          render() {
            const P = this.props.definition, M = { className: ["ck-inspector-tree__position", P.type === "selection" ? "ck-inspector-tree__position_selection" : "", P.type === "marker" ? "ck-inspector-tree__position_marker" : "", P.isEnd ? "ck-inspector-tree__position_end" : ""].join(" "), style: {} };
            return P.presentation && P.presentation.color && (M.style["--ck-inspector-color-tree-position"] = P.presentation.color), P.type === "marker" && (M["data-marker-name"] = P.name), o.a.createElement("span", M, "​");
          }
          shouldComponentUpdate(P) {
            return !m()(this.props, P);
          }
        }
        class O extends g {
          render() {
            const P = this.definition, M = P.presentation, F = M && M.isEmpty, R = M && M.cssClass, oe = this.getChildren(), K = ["ck-inspector-code", "ck-inspector-tree-node", this.isActive ? "ck-inspector-tree-node_active" : "", F ? "ck-inspector-tree-node_empty" : "", R], I = [], A = [];
            P.positionsBefore && P.positionsBefore.forEach((le, te) => {
              I.push(o.a.createElement(C, { key: "position-before:" + te, definition: le }));
            }), P.positionsAfter && P.positionsAfter.forEach((le, te) => {
              A.push(o.a.createElement(C, { key: "position-after:" + te, definition: le }));
            }), P.positions && P.positions.forEach((le, te) => {
              oe.push(o.a.createElement(C, { key: "position" + te, definition: le }));
            });
            let se = P.name;
            return this.globalTreeProps.showElementTypes && (se = P.elementType + ":" + se), o.a.createElement("div", { className: K.join(" "), onClick: this.handleClick }, I, o.a.createElement("span", { className: "ck-inspector-tree-node__name" }, o.a.createElement("span", { className: "ck-inspector-tree-node__name__bracket ck-inspector-tree-node__name__bracket_open" }), se, this.getAttributes(), F ? "" : o.a.createElement("span", { className: "ck-inspector-tree-node__name__bracket ck-inspector-tree-node__name__bracket_close" })), o.a.createElement("div", { className: "ck-inspector-tree-node__content" }, oe), F ? "" : o.a.createElement("span", { className: "ck-inspector-tree-node__name ck-inspector-tree-node__name_close" }, o.a.createElement("span", { className: "ck-inspector-tree-node__name__bracket ck-inspector-tree-node__name__bracket_open" }), "/", se, o.a.createElement("span", { className: "ck-inspector-tree-node__name__bracket ck-inspector-tree-node__name__bracket_close" }), A));
          }
          getAttributes() {
            const P = [], M = this.definition;
            for (const [F, R] of M.attributes) P.push(o.a.createElement(b, { key: F, name: F, value: R }));
            return P;
          }
          shouldComponentUpdate(P) {
            return !m()(this.props, P);
          }
        }
        class N extends g {
          render() {
            const P = this.definition, M = ["ck-inspector-tree-text", this.isActive ? "ck-inspector-tree-node_active" : ""].join(" ");
            let F = this.definition.text;
            P.positions && P.positions.length && (F = F.split(""), Array.from(P.positions).sort((oe, K) => oe.offset < K.offset ? -1 : oe.offset === K.offset ? 0 : 1).reverse().forEach((oe, K) => {
              F.splice(oe.offset - P.startOffset, 0, o.a.createElement(C, { key: "position" + K, definition: oe }));
            }));
            const R = [F];
            return P.positionsBefore && P.positionsBefore.length && P.positionsBefore.forEach((oe, K) => {
              R.unshift(o.a.createElement(C, { key: "position-before:" + K, definition: oe }));
            }), P.positionsAfter && P.positionsAfter.length && P.positionsAfter.forEach((oe, K) => {
              R.push(o.a.createElement(C, { key: "position-after:" + K, definition: oe }));
            }), o.a.createElement("span", { className: M, onClick: this.handleClick }, o.a.createElement("span", { className: "ck-inspector-tree-node__content" }, this.globalTreeProps.showCompactText ? "" : this.getAttributes(), this.globalTreeProps.showCompactText ? "" : '"', R, this.globalTreeProps.showCompactText ? "" : '"'));
          }
          getAttributes() {
            const P = [], M = this.definition, F = M.presentation, R = F && F.dontRenderAttributeValue;
            for (const [oe, K] of M.attributes) P.push(o.a.createElement(b, { key: oe, name: oe, value: K, dontRenderValue: R }));
            return o.a.createElement("span", { className: "ck-inspector-tree-text__attributes" }, P);
          }
          shouldComponentUpdate(P) {
            return !m()(this.props, P);
          }
        }
        class J extends u.Component {
          render() {
            return o.a.createElement("span", { className: "ck-inspector-tree-comment", dangerouslySetInnerHTML: { __html: this.props.definition.text } });
          }
        }
        function Q(W, P, M) {
          return W.type === "element" ? o.a.createElement(O, { key: P, definition: W, globalTreeProps: M }) : W.type === "text" ? o.a.createElement(N, { key: P, definition: W, globalTreeProps: M }) : W.type === "comment" ? o.a.createElement(J, { key: P, definition: W }) : void 0;
        }
        d(34);
        class j extends u.Component {
          render() {
            let P;
            return P = this.props.definition ? this.props.definition.map((M, F) => Q(M, F, { onClick: this.props.onClick, showCompactText: this.props.showCompactText, showElementTypes: this.props.showElementTypes, activeNode: this.props.activeNode })) : "Nothing to show.", o.a.createElement("div", { className: ["ck-inspector-tree", ...this.props.className || [], this.props.textDirection ? "ck-inspector-tree_text-direction_" + this.props.textDirection : "", this.props.showCompactText ? "ck-inspector-tree_compact-text" : ""].join(" ") }, P);
          }
        }
      }, function(E, s, d) {
        (function u() {
          if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function")
            try {
              __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(u);
            } catch (o) {
              console.error(o);
            }
        })(), E.exports = d(22);
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.stringifyPath = s.quoteKey = s.isValidVariableName = s.IS_VALID_IDENTIFIER = s.quoteString = void 0;
        const u = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, o = /* @__PURE__ */ new Map([["\b", "\\b"], ["	", "\\t"], [`
`, "\\n"], ["\f", "\\f"], ["\r", "\\r"], ["'", "\\'"], ['"', '\\"'], ["\\", "\\\\"]]);
        function S(y) {
          return o.get(y) || "\\u" + ("0000" + y.charCodeAt(0).toString(16)).slice(-4);
        }
        s.quoteString = function(y) {
          return `'${y.replace(u, S)}'`;
        };
        const m = new Set("break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "));
        function g(y) {
          return typeof y == "string" && !m.has(y) && s.IS_VALID_IDENTIFIER.test(y);
        }
        s.IS_VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/, s.isValidVariableName = g, s.quoteKey = function(y, b) {
          return g(y) ? y : b(y);
        }, s.stringifyPath = function(y, b) {
          let C = "";
          for (const O of y) g(O) ? C += "." + O : C += `[${b(O)}]`;
          return C;
        };
      }, function(E, s) {
        function d(b, C, O, N) {
          var J, Q = (J = N) == null || typeof J == "number" || typeof J == "boolean" ? N : O(N), j = C.get(Q);
          return j === void 0 && (j = b.call(this, N), C.set(Q, j)), j;
        }
        function u(b, C, O) {
          var N = Array.prototype.slice.call(arguments, 3), J = O(N), Q = C.get(J);
          return Q === void 0 && (Q = b.apply(this, N), C.set(J, Q)), Q;
        }
        function o(b, C, O, N, J) {
          return O.bind(C, b, N, J);
        }
        function S(b, C) {
          return o(b, this, b.length === 1 ? d : u, C.cache.create(), C.serializer);
        }
        function m() {
          return JSON.stringify(arguments);
        }
        function g() {
          this.cache = /* @__PURE__ */ Object.create(null);
        }
        g.prototype.has = function(b) {
          return b in this.cache;
        }, g.prototype.get = function(b) {
          return this.cache[b];
        }, g.prototype.set = function(b, C) {
          this.cache[b] = C;
        };
        var y = { create: function() {
          return new g();
        } };
        E.exports = function(b, C) {
          var O = C && C.cache ? C.cache : y, N = C && C.serializer ? C.serializer : m;
          return (C && C.strategy ? C.strategy : S)(b, { cache: O, serializer: N });
        }, E.exports.strategies = { variadic: function(b, C) {
          return o(b, this, u, C.cache.create(), C.serializer);
        }, monadic: function(b, C) {
          return o(b, this, d, C.cache.create(), C.serializer);
        } };
      }, function(E, s) {
        var d;
        d = /* @__PURE__ */ function() {
          return this;
        }();
        try {
          d = d || new Function("return this")();
        } catch {
          typeof window == "object" && (d = window);
        }
        E.exports = d;
      }, function(E, s, d) {
        var u = Object.getOwnPropertySymbols, o = Object.prototype.hasOwnProperty, S = Object.prototype.propertyIsEnumerable;
        function m(g) {
          if (g == null) throw new TypeError("Object.assign cannot be called with null or undefined");
          return Object(g);
        }
        E.exports = function() {
          try {
            if (!Object.assign) return !1;
            var g = new String("abc");
            if (g[5] = "de", Object.getOwnPropertyNames(g)[0] === "5") return !1;
            for (var y = {}, b = 0; b < 10; b++) y["_" + String.fromCharCode(b)] = b;
            if (Object.getOwnPropertyNames(y).map(function(O) {
              return y[O];
            }).join("") !== "0123456789") return !1;
            var C = {};
            return "abcdefghijklmnopqrst".split("").forEach(function(O) {
              C[O] = O;
            }), Object.keys(Object.assign({}, C)).join("") === "abcdefghijklmnopqrst";
          } catch {
            return !1;
          }
        }() ? Object.assign : function(g, y) {
          for (var b, C, O = m(g), N = 1; N < arguments.length; N++) {
            for (var J in b = Object(arguments[N])) o.call(b, J) && (O[J] = b[J]);
            if (u) {
              C = u(b);
              for (var Q = 0; Q < C.length; Q++) S.call(b, C[Q]) && (O[C[Q]] = b[C[Q]]);
            }
          }
          return O;
        };
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.FunctionParser = s.dedentFunction = s.functionToString = s.USED_METHOD_KEY = void 0;
        const u = d(13), o = { " "() {
        } }[" "].toString().charAt(0) === '"', S = { Function: "function ", GeneratorFunction: "function* ", AsyncFunction: "async function ", AsyncGeneratorFunction: "async function* " }, m = { Function: "", GeneratorFunction: "*", AsyncFunction: "async ", AsyncGeneratorFunction: "async *" }, g = new Set("case delete else in instanceof new return throw typeof void , ; : + - ! ~ & | ^ * / % < > ? =".split(" "));
        s.USED_METHOD_KEY = /* @__PURE__ */ new WeakSet();
        function y(C) {
          let O;
          for (const N of C.split(`
`).slice(1)) {
            const J = /^[\s\t]+/.exec(N);
            if (!J) return C;
            const [Q] = J;
            (O === void 0 || Q.length < O.length) && (O = Q);
          }
          return O ? C.split(`
` + O).join(`
`) : C;
        }
        s.functionToString = (C, O, N, J) => {
          const Q = typeof J == "string" ? J : void 0;
          return Q !== void 0 && s.USED_METHOD_KEY.add(C), new b(C, O, N, Q).stringify();
        }, s.dedentFunction = y;
        class b {
          constructor(O, N, J, Q) {
            this.fn = O, this.indent = N, this.next = J, this.key = Q, this.pos = 0, this.hadKeyword = !1, this.fnString = Function.prototype.toString.call(O), this.fnType = O.constructor.name, this.keyQuote = Q === void 0 ? "" : u.quoteKey(Q, J), this.keyPrefix = Q === void 0 ? "" : `${this.keyQuote}:${N ? " " : ""}`, this.isMethodCandidate = Q !== void 0 && (this.fn.name === "" || this.fn.name === Q);
          }
          stringify() {
            const O = this.tryParse();
            return O ? y(O) : `${this.keyPrefix}void ${this.next(this.fnString)}`;
          }
          getPrefix() {
            return this.isMethodCandidate && !this.hadKeyword ? m[this.fnType] + this.keyQuote : this.keyPrefix + S[this.fnType];
          }
          tryParse() {
            if (this.fnString[this.fnString.length - 1] !== "}") return this.keyPrefix + this.fnString;
            if (this.fn.name) {
              const N = this.tryStrippingName();
              if (N) return N;
            }
            const O = this.pos;
            if (this.consumeSyntax() === "class") return this.fnString;
            if (this.pos = O, this.tryParsePrefixTokens()) {
              const N = this.tryStrippingName();
              if (N) return N;
              let J = this.pos;
              switch (this.consumeSyntax("WORD_LIKE")) {
                case "WORD_LIKE":
                  this.isMethodCandidate && !this.hadKeyword && (J = this.pos);
                case "()":
                  if (this.fnString.substr(this.pos, 2) === "=>") return this.keyPrefix + this.fnString;
                  this.pos = J;
                case '"':
                case "'":
                case "[]":
                  return this.getPrefix() + this.fnString.substr(this.pos);
              }
            }
          }
          tryStrippingName() {
            if (o) return;
            let O = this.pos;
            const N = this.fnString.substr(this.pos, this.fn.name.length);
            if (N === this.fn.name && (this.pos += N.length, this.consumeSyntax() === "()" && this.consumeSyntax() === "{}" && this.pos === this.fnString.length)) return !this.isMethodCandidate && u.isValidVariableName(N) || (O += N.length), this.getPrefix() + this.fnString.substr(O);
            this.pos = O;
          }
          tryParsePrefixTokens() {
            let O = this.pos;
            switch (this.hadKeyword = !1, this.fnType) {
              case "AsyncFunction":
                if (this.consumeSyntax() !== "async") return !1;
                O = this.pos;
              case "Function":
                return this.consumeSyntax() === "function" ? this.hadKeyword = !0 : this.pos = O, !0;
              case "AsyncGeneratorFunction":
                if (this.consumeSyntax() !== "async") return !1;
              case "GeneratorFunction":
                let N = this.consumeSyntax();
                return N === "function" && (N = this.consumeSyntax(), this.hadKeyword = !0), N === "*";
            }
          }
          consumeSyntax(O) {
            const N = this.consumeMatch(/^(?:([A-Za-z_0-9$\xA0-\uFFFF]+)|=>|\+\+|\-\-|.)/);
            if (!N) return;
            const [J, Q] = N;
            if (this.consumeWhitespace(), Q) return O || Q;
            switch (J) {
              case "(":
                return this.consumeSyntaxUntil("(", ")");
              case "[":
                return this.consumeSyntaxUntil("[", "]");
              case "{":
                return this.consumeSyntaxUntil("{", "}");
              case "`":
                return this.consumeTemplate();
              case '"':
                return this.consumeRegExp(/^(?:[^\\"]|\\.)*"/, '"');
              case "'":
                return this.consumeRegExp(/^(?:[^\\']|\\.)*'/, "'");
            }
            return J;
          }
          consumeSyntaxUntil(O, N) {
            let J = !0;
            for (; ; ) {
              const Q = this.consumeSyntax();
              if (Q === N) return O + N;
              if (!Q || Q === ")" || Q === "]" || Q === "}") return;
              Q === "/" && J && this.consumeMatch(/^(?:\\.|[^\\\/\n[]|\[(?:\\.|[^\]])*\])+\/[a-z]*/) ? (J = !1, this.consumeWhitespace()) : J = g.has(Q);
            }
          }
          consumeMatch(O) {
            const N = O.exec(this.fnString.substr(this.pos));
            return N && (this.pos += N[0].length), N;
          }
          consumeRegExp(O, N) {
            const J = O.exec(this.fnString.substr(this.pos));
            if (J) return this.pos += J[0].length, this.consumeWhitespace(), N;
          }
          consumeTemplate() {
            for (; ; ) {
              if (this.consumeMatch(/^(?:[^`$\\]|\\.|\$(?!{))*/), this.fnString[this.pos] === "`") return this.pos++, this.consumeWhitespace(), "`";
              if (this.fnString.substr(this.pos, 2) !== "${" || (this.pos += 2, this.consumeWhitespace(), !this.consumeSyntaxUntil("{", "}"))) return;
            }
          }
          consumeWhitespace() {
            this.consumeMatch(/^(?:\s|\/\/.*|\/\*[^]*?\*\/)*/);
          }
        }
        s.FunctionParser = b;
      }, function(E, s, d) {
        E.exports = d(53)();
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.stringify = void 0;
        const u = d(25), o = d(13), S = Symbol("root");
        s.stringify = function(m, g, y, b = {}) {
          const C = typeof y == "string" ? y : " ".repeat(y || 0), O = [], N = /* @__PURE__ */ new Set(), J = /* @__PURE__ */ new Map(), Q = /* @__PURE__ */ new Map();
          let j = 0;
          const { maxDepth: W = 100, references: P = !1, skipUndefinedProperties: M = !1, maxValues: F = 1e5 } = b, R = function(A) {
            return A ? (se, le, te, ue) => A(se, le, (ye) => u.toString(ye, le, te, ue), ue) : u.toString;
          }(g), oe = (A, se) => {
            if (++j > F || M && A === void 0 || O.length > W) return;
            if (se === void 0) return R(A, C, oe, se);
            O.push(se);
            const le = K(A, se === S ? void 0 : se);
            return O.pop(), le;
          }, K = P ? (A, se) => {
            if (A !== null && (typeof A == "object" || typeof A == "function" || typeof A == "symbol")) {
              if (J.has(A)) return Q.set(O.slice(1), J.get(A)), R(void 0, C, oe, se);
              J.set(A, O.slice(1));
            }
            return R(A, C, oe, se);
          } : (A, se) => {
            if (N.has(A)) return;
            N.add(A);
            const le = R(A, C, oe, se);
            return N.delete(A), le;
          }, I = oe(m, S);
          if (Q.size) {
            const A = C ? " " : "", se = C ? `
` : "";
            let le = `var x${A}=${A}${I};${se}`;
            for (const [te, ue] of Q.entries())
              le += `x${o.stringifyPath(te, oe)}${A}=${A}x${o.stringifyPath(ue, oe)};${se}`;
            return `(function${A}()${A}{${se}${le}return x;${se}}())`;
          }
          return I;
        };
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.findInArray = function(u, o) {
          for (var S = 0, m = u.length; S < m; S++) if (o.apply(o, [u[S], S, u])) return u[S];
        }, s.isFunction = function(u) {
          return typeof u == "function" || Object.prototype.toString.call(u) === "[object Function]";
        }, s.isNum = function(u) {
          return typeof u == "number" && !isNaN(u);
        }, s.int = function(u) {
          return parseInt(u, 10);
        }, s.dontSetMe = function(u, o, S) {
          if (u[o]) return new Error("Invalid prop ".concat(o, " passed to ").concat(S, " - do not set this, set it on the child."));
        };
      }, function(E, s, d) {
        var u = d(16), o = typeof Symbol == "function" && Symbol.for, S = o ? Symbol.for("react.element") : 60103, m = o ? Symbol.for("react.portal") : 60106, g = o ? Symbol.for("react.fragment") : 60107, y = o ? Symbol.for("react.strict_mode") : 60108, b = o ? Symbol.for("react.profiler") : 60114, C = o ? Symbol.for("react.provider") : 60109, O = o ? Symbol.for("react.context") : 60110, N = o ? Symbol.for("react.forward_ref") : 60112, J = o ? Symbol.for("react.suspense") : 60113, Q = o ? Symbol.for("react.memo") : 60115, j = o ? Symbol.for("react.lazy") : 60116, W = typeof Symbol == "function" && Symbol.iterator;
        function P(G) {
          for (var Y = "https://reactjs.org/docs/error-decoder.html?invariant=" + G, me = 1; me < arguments.length; me++) Y += "&args[]=" + encodeURIComponent(arguments[me]);
          return "Minified React error #" + G + "; visit " + Y + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
        }
        var M = { isMounted: function() {
          return !1;
        }, enqueueForceUpdate: function() {
        }, enqueueReplaceState: function() {
        }, enqueueSetState: function() {
        } }, F = {};
        function R(G, Y, me) {
          this.props = G, this.context = Y, this.refs = F, this.updater = me || M;
        }
        function oe() {
        }
        function K(G, Y, me) {
          this.props = G, this.context = Y, this.refs = F, this.updater = me || M;
        }
        R.prototype.isReactComponent = {}, R.prototype.setState = function(G, Y) {
          if (typeof G != "object" && typeof G != "function" && G != null) throw Error(P(85));
          this.updater.enqueueSetState(this, G, Y, "setState");
        }, R.prototype.forceUpdate = function(G) {
          this.updater.enqueueForceUpdate(this, G, "forceUpdate");
        }, oe.prototype = R.prototype;
        var I = K.prototype = new oe();
        I.constructor = K, u(I, R.prototype), I.isPureReactComponent = !0;
        var A = { current: null }, se = Object.prototype.hasOwnProperty, le = { key: !0, ref: !0, __self: !0, __source: !0 };
        function te(G, Y, me) {
          var l, f = {}, k = null, L = null;
          if (Y != null) for (l in Y.ref !== void 0 && (L = Y.ref), Y.key !== void 0 && (k = "" + Y.key), Y) se.call(Y, l) && !le.hasOwnProperty(l) && (f[l] = Y[l]);
          var U = arguments.length - 2;
          if (U === 1) f.children = me;
          else if (1 < U) {
            for (var B = Array(U), he = 0; he < U; he++) B[he] = arguments[he + 2];
            f.children = B;
          }
          if (G && G.defaultProps) for (l in U = G.defaultProps) f[l] === void 0 && (f[l] = U[l]);
          return { $$typeof: S, type: G, key: k, ref: L, props: f, _owner: A.current };
        }
        function ue(G) {
          return typeof G == "object" && G !== null && G.$$typeof === S;
        }
        var ye = /\/+/g, Z = [];
        function fe(G, Y, me, l) {
          if (Z.length) {
            var f = Z.pop();
            return f.result = G, f.keyPrefix = Y, f.func = me, f.context = l, f.count = 0, f;
          }
          return { result: G, keyPrefix: Y, func: me, context: l, count: 0 };
        }
        function D(G) {
          G.result = null, G.keyPrefix = null, G.func = null, G.context = null, G.count = 0, 10 > Z.length && Z.push(G);
        }
        function ie(G, Y, me) {
          return G == null ? 0 : function l(f, k, L, U) {
            var B = typeof f;
            B !== "undefined" && B !== "boolean" || (f = null);
            var he = !1;
            if (f === null) he = !0;
            else switch (B) {
              case "string":
              case "number":
                he = !0;
                break;
              case "object":
                switch (f.$$typeof) {
                  case S:
                  case m:
                    he = !0;
                }
            }
            if (he) return L(U, f, k === "" ? "." + be(f, 0) : k), 1;
            if (he = 0, k = k === "" ? "." : k + ":", Array.isArray(f)) for (var je = 0; je < f.length; je++) {
              var Re = k + be(B = f[je], je);
              he += l(B, Re, L, U);
            }
            else if (f === null || typeof f != "object" ? Re = null : Re = typeof (Re = W && f[W] || f["@@iterator"]) == "function" ? Re : null, typeof Re == "function") for (f = Re.call(f), je = 0; !(B = f.next()).done; ) he += l(B = B.value, Re = k + be(B, je++), L, U);
            else if (B === "object") throw L = "" + f, Error(P(31, L === "[object Object]" ? "object with keys {" + Object.keys(f).join(", ") + "}" : L, ""));
            return he;
          }(G, "", Y, me);
        }
        function be(G, Y) {
          return typeof G == "object" && G !== null && G.key != null ? function(me) {
            var l = { "=": "=0", ":": "=2" };
            return "$" + ("" + me).replace(/[=:]/g, function(f) {
              return l[f];
            });
          }(G.key) : Y.toString(36);
        }
        function Te(G, Y) {
          G.func.call(G.context, Y, G.count++);
        }
        function Ee(G, Y, me) {
          var l = G.result, f = G.keyPrefix;
          G = G.func.call(G.context, Y, G.count++), Array.isArray(G) ? Pe(G, l, me, function(k) {
            return k;
          }) : G != null && (ue(G) && (G = function(k, L) {
            return { $$typeof: S, type: k.type, key: L, ref: k.ref, props: k.props, _owner: k._owner };
          }(G, f + (!G.key || Y && Y.key === G.key ? "" : ("" + G.key).replace(ye, "$&/") + "/") + me)), l.push(G));
        }
        function Pe(G, Y, me, l, f) {
          var k = "";
          me != null && (k = ("" + me).replace(ye, "$&/") + "/"), ie(G, Ee, Y = fe(Y, k, l, f)), D(Y);
        }
        var Se = { current: null };
        function ze() {
          var G = Se.current;
          if (G === null) throw Error(P(321));
          return G;
        }
        var Ze = { ReactCurrentDispatcher: Se, ReactCurrentBatchConfig: { suspense: null }, ReactCurrentOwner: A, IsSomeRendererActing: { current: !1 }, assign: u };
        s.Children = { map: function(G, Y, me) {
          if (G == null) return G;
          var l = [];
          return Pe(G, l, null, Y, me), l;
        }, forEach: function(G, Y, me) {
          if (G == null) return G;
          ie(G, Te, Y = fe(null, null, Y, me)), D(Y);
        }, count: function(G) {
          return ie(G, function() {
            return null;
          }, null);
        }, toArray: function(G) {
          var Y = [];
          return Pe(G, Y, null, function(me) {
            return me;
          }), Y;
        }, only: function(G) {
          if (!ue(G)) throw Error(P(143));
          return G;
        } }, s.Component = R, s.Fragment = g, s.Profiler = b, s.PureComponent = K, s.StrictMode = y, s.Suspense = J, s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Ze, s.cloneElement = function(G, Y, me) {
          if (G == null) throw Error(P(267, G));
          var l = u({}, G.props), f = G.key, k = G.ref, L = G._owner;
          if (Y != null) {
            if (Y.ref !== void 0 && (k = Y.ref, L = A.current), Y.key !== void 0 && (f = "" + Y.key), G.type && G.type.defaultProps) var U = G.type.defaultProps;
            for (B in Y) se.call(Y, B) && !le.hasOwnProperty(B) && (l[B] = Y[B] === void 0 && U !== void 0 ? U[B] : Y[B]);
          }
          var B = arguments.length - 2;
          if (B === 1) l.children = me;
          else if (1 < B) {
            U = Array(B);
            for (var he = 0; he < B; he++) U[he] = arguments[he + 2];
            l.children = U;
          }
          return { $$typeof: S, type: G.type, key: f, ref: k, props: l, _owner: L };
        }, s.createContext = function(G, Y) {
          return Y === void 0 && (Y = null), (G = { $$typeof: O, _calculateChangedBits: Y, _currentValue: G, _currentValue2: G, _threadCount: 0, Provider: null, Consumer: null }).Provider = { $$typeof: C, _context: G }, G.Consumer = G;
        }, s.createElement = te, s.createFactory = function(G) {
          var Y = te.bind(null, G);
          return Y.type = G, Y;
        }, s.createRef = function() {
          return { current: null };
        }, s.forwardRef = function(G) {
          return { $$typeof: N, render: G };
        }, s.isValidElement = ue, s.lazy = function(G) {
          return { $$typeof: j, _ctor: G, _status: -1, _result: null };
        }, s.memo = function(G, Y) {
          return { $$typeof: Q, type: G, compare: Y === void 0 ? null : Y };
        }, s.useCallback = function(G, Y) {
          return ze().useCallback(G, Y);
        }, s.useContext = function(G, Y) {
          return ze().useContext(G, Y);
        }, s.useDebugValue = function() {
        }, s.useEffect = function(G, Y) {
          return ze().useEffect(G, Y);
        }, s.useImperativeHandle = function(G, Y, me) {
          return ze().useImperativeHandle(G, Y, me);
        }, s.useLayoutEffect = function(G, Y) {
          return ze().useLayoutEffect(G, Y);
        }, s.useMemo = function(G, Y) {
          return ze().useMemo(G, Y);
        }, s.useReducer = function(G, Y, me) {
          return ze().useReducer(G, Y, me);
        }, s.useRef = function(G) {
          return ze().useRef(G);
        }, s.useState = function(G) {
          return ze().useState(G);
        }, s.version = "16.14.0";
      }, function(E, s, d) {
        var u = d(0), o = d(16), S = d(23);
        function m(e) {
          for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
          return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
        }
        if (!u) throw Error(m(227));
        function g(e, t, n, r, i, p, v, x, X) {
          var q = Array.prototype.slice.call(arguments, 3);
          try {
            t.apply(n, q);
          } catch (ge) {
            this.onError(ge);
          }
        }
        var y = !1, b = null, C = !1, O = null, N = { onError: function(e) {
          y = !0, b = e;
        } };
        function J(e, t, n, r, i, p, v, x, X) {
          y = !1, b = null, g.apply(N, arguments);
        }
        var Q = null, j = null, W = null;
        function P(e, t, n) {
          var r = e.type || "unknown-event";
          e.currentTarget = W(n), function(i, p, v, x, X, q, ge, De, He) {
            if (J.apply(this, arguments), y) {
              if (!y) throw Error(m(198));
              var ot = b;
              y = !1, b = null, C || (C = !0, O = ot);
            }
          }(r, t, void 0, e), e.currentTarget = null;
        }
        var M = null, F = {};
        function R() {
          if (M) for (var e in F) {
            var t = F[e], n = M.indexOf(e);
            if (!(-1 < n)) throw Error(m(96, e));
            if (!K[n]) {
              if (!t.extractEvents) throw Error(m(97, e));
              for (var r in K[n] = t, n = t.eventTypes) {
                var i = void 0, p = n[r], v = t, x = r;
                if (I.hasOwnProperty(x)) throw Error(m(99, x));
                I[x] = p;
                var X = p.phasedRegistrationNames;
                if (X) {
                  for (i in X) X.hasOwnProperty(i) && oe(X[i], v, x);
                  i = !0;
                } else p.registrationName ? (oe(p.registrationName, v, x), i = !0) : i = !1;
                if (!i) throw Error(m(98, r, e));
              }
            }
          }
        }
        function oe(e, t, n) {
          if (A[e]) throw Error(m(100, e));
          A[e] = t, se[e] = t.eventTypes[n].dependencies;
        }
        var K = [], I = {}, A = {}, se = {};
        function le(e) {
          var t, n = !1;
          for (t in e) if (e.hasOwnProperty(t)) {
            var r = e[t];
            if (!F.hasOwnProperty(t) || F[t] !== r) {
              if (F[t]) throw Error(m(102, t));
              F[t] = r, n = !0;
            }
          }
          n && R();
        }
        var te = !(typeof window > "u" || window.document === void 0 || window.document.createElement === void 0), ue = null, ye = null, Z = null;
        function fe(e) {
          if (e = j(e)) {
            if (typeof ue != "function") throw Error(m(280));
            var t = e.stateNode;
            t && (t = Q(t), ue(e.stateNode, e.type, t));
          }
        }
        function D(e) {
          ye ? Z ? Z.push(e) : Z = [e] : ye = e;
        }
        function ie() {
          if (ye) {
            var e = ye, t = Z;
            if (Z = ye = null, fe(e), t) for (e = 0; e < t.length; e++) fe(t[e]);
          }
        }
        function be(e, t) {
          return e(t);
        }
        function Te(e, t, n, r, i) {
          return e(t, n, r, i);
        }
        function Ee() {
        }
        var Pe = be, Se = !1, ze = !1;
        function Ze() {
          ye === null && Z === null || (Ee(), ie());
        }
        function G(e, t, n) {
          if (ze) return e(t, n);
          ze = !0;
          try {
            return Pe(e, t, n);
          } finally {
            ze = !1, Ze();
          }
        }
        var Y = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, me = Object.prototype.hasOwnProperty, l = {}, f = {};
        function k(e, t, n, r, i, p) {
          this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = i, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = p;
        }
        var L = {};
        "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
          L[e] = new k(e, 0, !1, e, null, !1);
        }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
          var t = e[0];
          L[t] = new k(t, 1, !1, e[1], null, !1);
        }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
          L[e] = new k(e, 2, !1, e.toLowerCase(), null, !1);
        }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
          L[e] = new k(e, 2, !1, e, null, !1);
        }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
          L[e] = new k(e, 3, !1, e.toLowerCase(), null, !1);
        }), ["checked", "multiple", "muted", "selected"].forEach(function(e) {
          L[e] = new k(e, 3, !0, e, null, !1);
        }), ["capture", "download"].forEach(function(e) {
          L[e] = new k(e, 4, !1, e, null, !1);
        }), ["cols", "rows", "size", "span"].forEach(function(e) {
          L[e] = new k(e, 6, !1, e, null, !1);
        }), ["rowSpan", "start"].forEach(function(e) {
          L[e] = new k(e, 5, !1, e.toLowerCase(), null, !1);
        });
        var U = /[\-:]([a-z])/g;
        function B(e) {
          return e[1].toUpperCase();
        }
        "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
          var t = e.replace(U, B);
          L[t] = new k(t, 1, !1, e, null, !1);
        }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
          var t = e.replace(U, B);
          L[t] = new k(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1);
        }), ["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
          var t = e.replace(U, B);
          L[t] = new k(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1);
        }), ["tabIndex", "crossOrigin"].forEach(function(e) {
          L[e] = new k(e, 1, !1, e.toLowerCase(), null, !1);
        }), L.xlinkHref = new k("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0), ["src", "href", "action", "formAction"].forEach(function(e) {
          L[e] = new k(e, 1, !1, e.toLowerCase(), null, !0);
        });
        var he = u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        function je(e, t, n, r) {
          var i = L.hasOwnProperty(t) ? L[t] : null;
          (i !== null ? i.type === 0 : !r && 2 < t.length && (t[0] === "o" || t[0] === "O") && (t[1] === "n" || t[1] === "N")) || (function(p, v, x, X) {
            if (v == null || function(q, ge, De, He) {
              if (De !== null && De.type === 0) return !1;
              switch (typeof ge) {
                case "function":
                case "symbol":
                  return !0;
                case "boolean":
                  return !He && (De !== null ? !De.acceptsBooleans : (q = q.toLowerCase().slice(0, 5)) !== "data-" && q !== "aria-");
                default:
                  return !1;
              }
            }(p, v, x, X)) return !0;
            if (X) return !1;
            if (x !== null) switch (x.type) {
              case 3:
                return !v;
              case 4:
                return v === !1;
              case 5:
                return isNaN(v);
              case 6:
                return isNaN(v) || 1 > v;
            }
            return !1;
          }(t, n, i, r) && (n = null), r || i === null ? function(p) {
            return !!me.call(f, p) || !me.call(l, p) && (Y.test(p) ? f[p] = !0 : (l[p] = !0, !1));
          }(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : i.mustUseProperty ? e[i.propertyName] = n === null ? i.type !== 3 && "" : n : (t = i.attributeName, r = i.attributeNamespace, n === null ? e.removeAttribute(t) : (n = (i = i.type) === 3 || i === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
        }
        he.hasOwnProperty("ReactCurrentDispatcher") || (he.ReactCurrentDispatcher = { current: null }), he.hasOwnProperty("ReactCurrentBatchConfig") || (he.ReactCurrentBatchConfig = { suspense: null });
        var Re = /^(.*)[\\\/]/, Xe = typeof Symbol == "function" && Symbol.for, Ve = Xe ? Symbol.for("react.element") : 60103, At = Xe ? Symbol.for("react.portal") : 60106, kt = Xe ? Symbol.for("react.fragment") : 60107, Zt = Xe ? Symbol.for("react.strict_mode") : 60108, wt = Xe ? Symbol.for("react.profiler") : 60114, gt = Xe ? Symbol.for("react.provider") : 60109, un = Xe ? Symbol.for("react.context") : 60110, Er = Xe ? Symbol.for("react.concurrent_mode") : 60111, Tt = Xe ? Symbol.for("react.forward_ref") : 60112, pt = Xe ? Symbol.for("react.suspense") : 60113, $n = Xe ? Symbol.for("react.suspense_list") : 60120, Sn = Xe ? Symbol.for("react.memo") : 60115, or = Xe ? Symbol.for("react.lazy") : 60116, _r = Xe ? Symbol.for("react.block") : 60121, wo = typeof Symbol == "function" && Symbol.iterator;
        function en(e) {
          return e === null || typeof e != "object" ? null : typeof (e = wo && e[wo] || e["@@iterator"]) == "function" ? e : null;
        }
        function Yt(e) {
          if (e == null) return null;
          if (typeof e == "function") return e.displayName || e.name || null;
          if (typeof e == "string") return e;
          switch (e) {
            case kt:
              return "Fragment";
            case At:
              return "Portal";
            case wt:
              return "Profiler";
            case Zt:
              return "StrictMode";
            case pt:
              return "Suspense";
            case $n:
              return "SuspenseList";
          }
          if (typeof e == "object") switch (e.$$typeof) {
            case un:
              return "Context.Consumer";
            case gt:
              return "Context.Provider";
            case Tt:
              var t = e.render;
              return t = t.displayName || t.name || "", e.displayName || (t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef");
            case Sn:
              return Yt(e.type);
            case _r:
              return Yt(e.render);
            case or:
              if (e = e._status === 1 ? e._result : null) return Yt(e);
          }
          return null;
        }
        function xr(e) {
          var t = "";
          do {
            e: switch (e.tag) {
              case 3:
              case 4:
              case 6:
              case 7:
              case 10:
              case 9:
                var n = "";
                break e;
              default:
                var r = e._debugOwner, i = e._debugSource, p = Yt(e.type);
                n = null, r && (n = Yt(r.type)), r = p, p = "", i ? p = " (at " + i.fileName.replace(Re, "") + ":" + i.lineNumber + ")" : n && (p = " (created by " + n + ")"), n = `
    in ` + (r || "Unknown") + p;
            }
            t += n, e = e.return;
          } while (e);
          return t;
        }
        function qt(e) {
          switch (typeof e) {
            case "boolean":
            case "number":
            case "object":
            case "string":
            case "undefined":
              return e;
            default:
              return "";
          }
        }
        function gn(e) {
          var t = e.type;
          return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
        }
        function Sr(e) {
          e._valueTracker || (e._valueTracker = function(t) {
            var n = gn(t) ? "checked" : "value", r = Object.getOwnPropertyDescriptor(t.constructor.prototype, n), i = "" + t[n];
            if (!t.hasOwnProperty(n) && r !== void 0 && typeof r.get == "function" && typeof r.set == "function") {
              var p = r.get, v = r.set;
              return Object.defineProperty(t, n, { configurable: !0, get: function() {
                return p.call(this);
              }, set: function(x) {
                i = "" + x, v.call(this, x);
              } }), Object.defineProperty(t, n, { enumerable: r.enumerable }), { getValue: function() {
                return i;
              }, setValue: function(x) {
                i = "" + x;
              }, stopTracking: function() {
                t._valueTracker = null, delete t[n];
              } };
            }
          }(e));
        }
        function ct(e) {
          if (!e) return !1;
          var t = e._valueTracker;
          if (!t) return !0;
          var n = t.getValue(), r = "";
          return e && (r = gn(e) ? e.checked ? "true" : "false" : e.value), (e = r) !== n && (t.setValue(e), !0);
        }
        function Cr(e, t) {
          var n = t.checked;
          return o({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
        }
        function bn(e, t) {
          var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
          n = qt(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
        }
        function Tr(e, t) {
          (t = t.checked) != null && je(e, "checked", t, !1);
        }
        function ir(e, t) {
          Tr(e, t);
          var n = qt(t.value), r = t.type;
          if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
          else if (r === "submit" || r === "reset") return void e.removeAttribute("value");
          t.hasOwnProperty("value") ? Cn(e, t.type, n) : t.hasOwnProperty("defaultValue") && Cn(e, t.type, qt(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
        }
        function ar(e, t, n) {
          if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
            var r = t.type;
            if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
            t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
          }
          (n = e.name) !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
        }
        function Cn(e, t, n) {
          t === "number" && e.ownerDocument.activeElement === e || (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
        }
        function sr(e, t) {
          return e = o({ children: void 0 }, t), (t = function(n) {
            var r = "";
            return u.Children.forEach(n, function(i) {
              i != null && (r += i);
            }), r;
          }(t.children)) && (e.children = t), e;
        }
        function Tn(e, t, n, r) {
          if (e = e.options, t) {
            t = {};
            for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
            for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
          } else {
            for (n = "" + qt(n), t = null, i = 0; i < e.length; i++) {
              if (e[i].value === n) return e[i].selected = !0, void (r && (e[i].defaultSelected = !0));
              t !== null || e[i].disabled || (t = e[i]);
            }
            t !== null && (t.selected = !0);
          }
        }
        function lr(e, t) {
          if (t.dangerouslySetInnerHTML != null) throw Error(m(91));
          return o({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
        }
        function On(e, t) {
          var n = t.value;
          if (n == null) {
            if (n = t.children, t = t.defaultValue, n != null) {
              if (t != null) throw Error(m(92));
              if (Array.isArray(n)) {
                if (!(1 >= n.length)) throw Error(m(93));
                n = n[0];
              }
              t = n;
            }
            t == null && (t = ""), n = t;
          }
          e._wrapperState = { initialValue: qt(n) };
        }
        function Gr(e, t) {
          var n = qt(t.value), r = qt(t.defaultValue);
          n != null && ((n = "" + n) !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
        }
        function Xr(e) {
          var t = e.textContent;
          t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
        }
        var V = "http://www.w3.org/1999/xhtml", ae = "http://www.w3.org/2000/svg";
        function we(e) {
          switch (e) {
            case "svg":
              return "http://www.w3.org/2000/svg";
            case "math":
              return "http://www.w3.org/1998/Math/MathML";
            default:
              return "http://www.w3.org/1999/xhtml";
          }
        }
        function Ce(e, t) {
          return e == null || e === "http://www.w3.org/1999/xhtml" ? we(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
        }
        var it, qe = function(e) {
          return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, i) {
            MSApp.execUnsafeLocalFunction(function() {
              return e(t, n);
            });
          } : e;
        }(function(e, t) {
          if (e.namespaceURI !== ae || "innerHTML" in e) e.innerHTML = t;
          else {
            for ((it = it || document.createElement("div")).innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = it.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
            for (; t.firstChild; ) e.appendChild(t.firstChild);
          }
        });
        function st(e, t) {
          if (t) {
            var n = e.firstChild;
            if (n && n === e.lastChild && n.nodeType === 3) return void (n.nodeValue = t);
          }
          e.textContent = t;
        }
        function tt(e, t) {
          var n = {};
          return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
        }
        var Ot = { animationend: tt("Animation", "AnimationEnd"), animationiteration: tt("Animation", "AnimationIteration"), animationstart: tt("Animation", "AnimationStart"), transitionend: tt("Transition", "TransitionEnd") }, nt = {}, bt = {};
        function Pt(e) {
          if (nt[e]) return nt[e];
          if (!Ot[e]) return e;
          var t, n = Ot[e];
          for (t in n) if (n.hasOwnProperty(t) && t in bt) return nt[e] = n[t];
          return e;
        }
        te && (bt = document.createElement("div").style, "AnimationEvent" in window || (delete Ot.animationend.animation, delete Ot.animationiteration.animation, delete Ot.animationstart.animation), "TransitionEvent" in window || delete Ot.transitionend.transition);
        var tn = Pt("animationend"), ht = Pt("animationiteration"), Wt = Pt("animationstart"), Pn = Pt("transitionend"), ut = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), yn = new (typeof WeakMap == "function" ? WeakMap : Map)();
        function cn(e) {
          var t = yn.get(e);
          return t === void 0 && (t = /* @__PURE__ */ new Map(), yn.set(e, t)), t;
        }
        function Nn(e) {
          var t = e, n = e;
          if (e.alternate) for (; t.return; ) t = t.return;
          else {
            e = t;
            do
              1026 & (t = e).effectTag && (n = t.return), e = t.return;
            while (e);
          }
          return t.tag === 3 ? n : null;
        }
        function Eo(e) {
          if (e.tag === 13) {
            var t = e.memoizedState;
            if (t === null && (e = e.alternate) !== null && (t = e.memoizedState), t !== null) return t.dehydrated;
          }
          return null;
        }
        function _o(e) {
          if (Nn(e) !== e) throw Error(m(188));
        }
        function rt(e) {
          if (!(e = function(n) {
            var r = n.alternate;
            if (!r) {
              if ((r = Nn(n)) === null) throw Error(m(188));
              return r !== n ? null : n;
            }
            for (var i = n, p = r; ; ) {
              var v = i.return;
              if (v === null) break;
              var x = v.alternate;
              if (x === null) {
                if ((p = v.return) !== null) {
                  i = p;
                  continue;
                }
                break;
              }
              if (v.child === x.child) {
                for (x = v.child; x; ) {
                  if (x === i) return _o(v), n;
                  if (x === p) return _o(v), r;
                  x = x.sibling;
                }
                throw Error(m(188));
              }
              if (i.return !== p.return) i = v, p = x;
              else {
                for (var X = !1, q = v.child; q; ) {
                  if (q === i) {
                    X = !0, i = v, p = x;
                    break;
                  }
                  if (q === p) {
                    X = !0, p = v, i = x;
                    break;
                  }
                  q = q.sibling;
                }
                if (!X) {
                  for (q = x.child; q; ) {
                    if (q === i) {
                      X = !0, i = x, p = v;
                      break;
                    }
                    if (q === p) {
                      X = !0, p = x, i = v;
                      break;
                    }
                    q = q.sibling;
                  }
                  if (!X) throw Error(m(189));
                }
              }
              if (i.alternate !== p) throw Error(m(190));
            }
            if (i.tag !== 3) throw Error(m(188));
            return i.stateNode.current === i ? n : r;
          }(e))) return null;
          for (var t = e; ; ) {
            if (t.tag === 5 || t.tag === 6) return t;
            if (t.child) t.child.return = t, t = t.child;
            else {
              if (t === e) break;
              for (; !t.sibling; ) {
                if (!t.return || t.return === e) return null;
                t = t.return;
              }
              t.sibling.return = t.return, t = t.sibling;
            }
          }
          return null;
        }
        function Ue(e, t) {
          if (t == null) throw Error(m(30));
          return e == null ? t : Array.isArray(e) ? Array.isArray(t) ? (e.push.apply(e, t), e) : (e.push(t), e) : Array.isArray(t) ? [e].concat(t) : [e, t];
        }
        function Yn(e, t, n) {
          Array.isArray(e) ? e.forEach(t, n) : e && t.call(n, e);
        }
        var Kt = null;
        function Or(e) {
          if (e) {
            var t = e._dispatchListeners, n = e._dispatchInstances;
            if (Array.isArray(t)) for (var r = 0; r < t.length && !e.isPropagationStopped(); r++) P(e, t[r], n[r]);
            else t && P(e, t, n);
            e._dispatchListeners = null, e._dispatchInstances = null, e.isPersistent() || e.constructor.release(e);
          }
        }
        function Mt(e) {
          if (e !== null && (Kt = Ue(Kt, e)), e = Kt, Kt = null, e) {
            if (Yn(e, Or), Kt) throw Error(m(95));
            if (C) throw e = O, C = !1, O = null, e;
          }
        }
        function nn(e) {
          return (e = e.target || e.srcElement || window).correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
        }
        function Ht(e) {
          if (!te) return !1;
          var t = (e = "on" + e) in document;
          return t || ((t = document.createElement("div")).setAttribute(e, "return;"), t = typeof t[e] == "function"), t;
        }
        var Qt = [];
        function ur(e) {
          e.topLevelType = null, e.nativeEvent = null, e.targetInst = null, e.ancestors.length = 0, 10 > Qt.length && Qt.push(e);
        }
        function Dn(e, t, n, r) {
          if (Qt.length) {
            var i = Qt.pop();
            return i.topLevelType = e, i.eventSystemFlags = r, i.nativeEvent = t, i.targetInst = n, i;
          }
          return { topLevelType: e, eventSystemFlags: r, nativeEvent: t, targetInst: n, ancestors: [] };
        }
        function rn(e) {
          var t = e.targetInst, n = t;
          do {
            if (!n) {
              e.ancestors.push(n);
              break;
            }
            var r = n;
            if (r.tag === 3) r = r.stateNode.containerInfo;
            else {
              for (; r.return; ) r = r.return;
              r = r.tag !== 3 ? null : r.stateNode.containerInfo;
            }
            if (!r) break;
            (t = n.tag) !== 5 && t !== 6 || e.ancestors.push(n), n = Ir(r);
          } while (n);
          for (n = 0; n < e.ancestors.length; n++) {
            t = e.ancestors[n];
            var i = nn(e.nativeEvent);
            r = e.topLevelType;
            var p = e.nativeEvent, v = e.eventSystemFlags;
            n === 0 && (v |= 64);
            for (var x = null, X = 0; X < K.length; X++) {
              var q = K[X];
              q && (q = q.extractEvents(r, t, p, i, v)) && (x = Ue(x, q));
            }
            Mt(x);
          }
        }
        function yt(e, t, n) {
          if (!n.has(e)) {
            switch (e) {
              case "scroll":
                Zr(t, "scroll", !0);
                break;
              case "focus":
              case "blur":
                Zr(t, "focus", !0), Zr(t, "blur", !0), n.set("blur", null), n.set("focus", null);
                break;
              case "cancel":
              case "close":
                Ht(e) && Zr(t, e, !0);
                break;
              case "invalid":
              case "submit":
              case "reset":
                break;
              default:
                ut.indexOf(e) === -1 && mt(e, t);
            }
            n.set(e, null);
          }
        }
        var Et, cr, fr, vn = !1, Ut = [], Vt = null, on = null, qn = null, dr = /* @__PURE__ */ new Map(), Jr = /* @__PURE__ */ new Map(), Pr = [], Bn = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput close cancel copy cut paste click change contextmenu reset submit".split(" "), Nt = "focus blur dragenter dragleave mouseover mouseout pointerover pointerout gotpointercapture lostpointercapture".split(" ");
        function xo(e, t, n, r, i) {
          return { blockedOn: e, topLevelType: t, eventSystemFlags: 32 | n, nativeEvent: i, container: r };
        }
        function kn(e, t) {
          switch (e) {
            case "focus":
            case "blur":
              Vt = null;
              break;
            case "dragenter":
            case "dragleave":
              on = null;
              break;
            case "mouseover":
            case "mouseout":
              qn = null;
              break;
            case "pointerover":
            case "pointerout":
              dr.delete(t.pointerId);
              break;
            case "gotpointercapture":
            case "lostpointercapture":
              Jr.delete(t.pointerId);
          }
        }
        function Nr(e, t, n, r, i, p) {
          return e === null || e.nativeEvent !== p ? (e = xo(t, n, r, i, p), t !== null && (t = oo(t)) !== null && cr(t), e) : (e.eventSystemFlags |= r, e);
        }
        function Ca(e) {
          var t = Ir(e.target);
          if (t !== null) {
            var n = Nn(t);
            if (n !== null) {
              if ((t = n.tag) === 13) {
                if ((t = Eo(n)) !== null) return e.blockedOn = t, void S.unstable_runWithPriority(e.priority, function() {
                  fr(n);
                });
              } else if (t === 3 && n.stateNode.hydrate) return void (e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null);
            }
          }
          e.blockedOn = null;
        }
        function So(e) {
          if (e.blockedOn !== null) return !1;
          var t = Ar(e.topLevelType, e.eventSystemFlags, e.container, e.nativeEvent);
          if (t !== null) {
            var n = oo(t);
            return n !== null && cr(n), e.blockedOn = t, !1;
          }
          return !0;
        }
        function yi(e, t, n) {
          So(e) && n.delete(t);
        }
        function vi() {
          for (vn = !1; 0 < Ut.length; ) {
            var e = Ut[0];
            if (e.blockedOn !== null) {
              (e = oo(e.blockedOn)) !== null && Et(e);
              break;
            }
            var t = Ar(e.topLevelType, e.eventSystemFlags, e.container, e.nativeEvent);
            t !== null ? e.blockedOn = t : Ut.shift();
          }
          Vt !== null && So(Vt) && (Vt = null), on !== null && So(on) && (on = null), qn !== null && So(qn) && (qn = null), dr.forEach(yi), Jr.forEach(yi);
        }
        function Dr(e, t) {
          e.blockedOn === t && (e.blockedOn = null, vn || (vn = !0, S.unstable_scheduleCallback(S.unstable_NormalPriority, vi)));
        }
        function pr(e) {
          function t(i) {
            return Dr(i, e);
          }
          if (0 < Ut.length) {
            Dr(Ut[0], e);
            for (var n = 1; n < Ut.length; n++) {
              var r = Ut[n];
              r.blockedOn === e && (r.blockedOn = null);
            }
          }
          for (Vt !== null && Dr(Vt, e), on !== null && Dr(on, e), qn !== null && Dr(qn, e), dr.forEach(t), Jr.forEach(t), n = 0; n < Pr.length; n++) (r = Pr[n]).blockedOn === e && (r.blockedOn = null);
          for (; 0 < Pr.length && (n = Pr[0]).blockedOn === null; ) Ca(n), n.blockedOn === null && Pr.shift();
        }
        var ki = {}, wi = /* @__PURE__ */ new Map(), Rr = /* @__PURE__ */ new Map(), Ta = ["abort", "abort", tn, "animationEnd", ht, "animationIteration", Wt, "animationStart", "canplay", "canPlay", "canplaythrough", "canPlayThrough", "durationchange", "durationChange", "emptied", "emptied", "encrypted", "encrypted", "ended", "ended", "error", "error", "gotpointercapture", "gotPointerCapture", "load", "load", "loadeddata", "loadedData", "loadedmetadata", "loadedMetadata", "loadstart", "loadStart", "lostpointercapture", "lostPointerCapture", "playing", "playing", "progress", "progress", "seeking", "seeking", "stalled", "stalled", "suspend", "suspend", "timeupdate", "timeUpdate", Pn, "transitionEnd", "waiting", "waiting"];
        function Yo(e, t) {
          for (var n = 0; n < e.length; n += 2) {
            var r = e[n], i = e[n + 1], p = "on" + (i[0].toUpperCase() + i.slice(1));
            p = { phasedRegistrationNames: { bubbled: p, captured: p + "Capture" }, dependencies: [r], eventPriority: t }, Rr.set(r, t), wi.set(r, p), ki[i] = p;
          }
        }
        Yo("blur blur cancel cancel click click close close contextmenu contextMenu copy copy cut cut auxclick auxClick dblclick doubleClick dragend dragEnd dragstart dragStart drop drop focus focus input input invalid invalid keydown keyDown keypress keyPress keyup keyUp mousedown mouseDown mouseup mouseUp paste paste pause pause play play pointercancel pointerCancel pointerdown pointerDown pointerup pointerUp ratechange rateChange reset reset seeked seeked submit submit touchcancel touchCancel touchend touchEnd touchstart touchStart volumechange volumeChange".split(" "), 0), Yo("drag drag dragenter dragEnter dragexit dragExit dragleave dragLeave dragover dragOver mousemove mouseMove mouseout mouseOut mouseover mouseOver pointermove pointerMove pointerout pointerOut pointerover pointerOver scroll scroll toggle toggle touchmove touchMove wheel wheel".split(" "), 1), Yo(Ta, 2);
        for (var Ei = "change selectionchange textInput compositionstart compositionend compositionupdate".split(" "), qo = 0; qo < Ei.length; qo++) Rr.set(Ei[qo], 0);
        var Oa = S.unstable_UserBlockingPriority, Pa = S.unstable_runWithPriority, Co = !0;
        function mt(e, t) {
          Zr(t, e, !1);
        }
        function Zr(e, t, n) {
          var r = Rr.get(t);
          switch (r === void 0 ? 2 : r) {
            case 0:
              r = eo.bind(null, t, 1, e);
              break;
            case 1:
              r = Na.bind(null, t, 1, e);
              break;
            default:
              r = To.bind(null, t, 1, e);
          }
          n ? e.addEventListener(t, r, !0) : e.addEventListener(t, r, !1);
        }
        function eo(e, t, n, r) {
          Se || Ee();
          var i = To, p = Se;
          Se = !0;
          try {
            Te(i, e, t, n, r);
          } finally {
            (Se = p) || Ze();
          }
        }
        function Na(e, t, n, r) {
          Pa(Oa, To.bind(null, e, t, n, r));
        }
        function To(e, t, n, r) {
          if (Co) if (0 < Ut.length && -1 < Bn.indexOf(e)) e = xo(null, e, t, n, r), Ut.push(e);
          else {
            var i = Ar(e, t, n, r);
            if (i === null) kn(e, r);
            else if (-1 < Bn.indexOf(e)) e = xo(i, e, t, n, r), Ut.push(e);
            else if (!function(p, v, x, X, q) {
              switch (v) {
                case "focus":
                  return Vt = Nr(Vt, p, v, x, X, q), !0;
                case "dragenter":
                  return on = Nr(on, p, v, x, X, q), !0;
                case "mouseover":
                  return qn = Nr(qn, p, v, x, X, q), !0;
                case "pointerover":
                  var ge = q.pointerId;
                  return dr.set(ge, Nr(dr.get(ge) || null, p, v, x, X, q)), !0;
                case "gotpointercapture":
                  return ge = q.pointerId, Jr.set(ge, Nr(Jr.get(ge) || null, p, v, x, X, q)), !0;
              }
              return !1;
            }(i, e, t, n, r)) {
              kn(e, r), e = Dn(e, r, null, t);
              try {
                G(rn, e);
              } finally {
                ur(e);
              }
            }
          }
        }
        function Ar(e, t, n, r) {
          if ((n = Ir(n = nn(r))) !== null) {
            var i = Nn(n);
            if (i === null) n = null;
            else {
              var p = i.tag;
              if (p === 13) {
                if ((n = Eo(i)) !== null) return n;
                n = null;
              } else if (p === 3) {
                if (i.stateNode.hydrate) return i.tag === 3 ? i.stateNode.containerInfo : null;
                n = null;
              } else i !== n && (n = null);
            }
          }
          e = Dn(e, r, n, t);
          try {
            G(rn, e);
          } finally {
            ur(e);
          }
          return null;
        }
        var to = { animationIterationCount: !0, borderImageOutset: !0, borderImageSlice: !0, borderImageWidth: !0, boxFlex: !0, boxFlexGroup: !0, boxOrdinalGroup: !0, columnCount: !0, columns: !0, flex: !0, flexGrow: !0, flexPositive: !0, flexShrink: !0, flexNegative: !0, flexOrder: !0, gridArea: !0, gridRow: !0, gridRowEnd: !0, gridRowSpan: !0, gridRowStart: !0, gridColumn: !0, gridColumnEnd: !0, gridColumnSpan: !0, gridColumnStart: !0, fontWeight: !0, lineClamp: !0, lineHeight: !0, opacity: !0, order: !0, orphans: !0, tabSize: !0, widows: !0, zIndex: !0, zoom: !0, fillOpacity: !0, floodOpacity: !0, stopOpacity: !0, strokeDasharray: !0, strokeDashoffset: !0, strokeMiterlimit: !0, strokeOpacity: !0, strokeWidth: !0 }, Da = ["Webkit", "ms", "Moz", "O"];
        function _i(e, t, n) {
          return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || to.hasOwnProperty(e) && to[e] ? ("" + t).trim() : t + "px";
        }
        function xi(e, t) {
          for (var n in e = e.style, t) if (t.hasOwnProperty(n)) {
            var r = n.indexOf("--") === 0, i = _i(n, t[n], r);
            n === "float" && (n = "cssFloat"), r ? e.setProperty(n, i) : e[n] = i;
          }
        }
        Object.keys(to).forEach(function(e) {
          Da.forEach(function(t) {
            t = t + e.charAt(0).toUpperCase() + e.substring(1), to[t] = to[e];
          });
        });
        var Si = o({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
        function Ko(e, t) {
          if (t) {
            if (Si[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(m(137, e, ""));
            if (t.dangerouslySetInnerHTML != null) {
              if (t.children != null) throw Error(m(60));
              if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(m(61));
            }
            if (t.style != null && typeof t.style != "object") throw Error(m(62, ""));
          }
        }
        function Qo(e, t) {
          if (e.indexOf("-") === -1) return typeof t.is == "string";
          switch (e) {
            case "annotation-xml":
            case "color-profile":
            case "font-face":
            case "font-face-src":
            case "font-face-uri":
            case "font-face-format":
            case "font-face-name":
            case "missing-glyph":
              return !1;
            default:
              return !0;
          }
        }
        var Ci = V;
        function Wn(e, t) {
          var n = cn(e = e.nodeType === 9 || e.nodeType === 11 ? e : e.ownerDocument);
          t = se[t];
          for (var r = 0; r < t.length; r++) yt(t[r], e, n);
        }
        function Oo() {
        }
        function Go(e) {
          if ((e = e || (typeof document < "u" ? document : void 0)) === void 0) return null;
          try {
            return e.activeElement || e.body;
          } catch {
            return e.body;
          }
        }
        function Ti(e) {
          for (; e && e.firstChild; ) e = e.firstChild;
          return e;
        }
        function Oi(e, t) {
          var n, r = Ti(e);
          for (e = 0; r; ) {
            if (r.nodeType === 3) {
              if (n = e + r.textContent.length, e <= t && n >= t) return { node: r, offset: t - e };
              e = n;
            }
            e: {
              for (; r; ) {
                if (r.nextSibling) {
                  r = r.nextSibling;
                  break e;
                }
                r = r.parentNode;
              }
              r = void 0;
            }
            r = Ti(r);
          }
        }
        function Pi() {
          for (var e = window, t = Go(); t instanceof e.HTMLIFrameElement; ) {
            try {
              var n = typeof t.contentWindow.location.href == "string";
            } catch {
              n = !1;
            }
            if (!n) break;
            t = Go((e = t.contentWindow).document);
          }
          return t;
        }
        function Xo(e) {
          var t = e && e.nodeName && e.nodeName.toLowerCase();
          return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
        }
        var Jo = null, Zo = null;
        function Ni(e, t) {
          switch (e) {
            case "button":
            case "input":
            case "select":
            case "textarea":
              return !!t.autoFocus;
          }
          return !1;
        }
        function ei(e, t) {
          return e === "textarea" || e === "option" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
        }
        var ti = typeof setTimeout == "function" ? setTimeout : void 0, Di = typeof clearTimeout == "function" ? clearTimeout : void 0;
        function Mr(e) {
          for (; e != null; e = e.nextSibling) {
            var t = e.nodeType;
            if (t === 1 || t === 3) break;
          }
          return e;
        }
        function Ri(e) {
          e = e.previousSibling;
          for (var t = 0; e; ) {
            if (e.nodeType === 8) {
              var n = e.data;
              if (n === "$" || n === "$!" || n === "$?") {
                if (t === 0) return e;
                t--;
              } else n === "/$" && t++;
            }
            e = e.previousSibling;
          }
          return null;
        }
        var Po = Math.random().toString(36).slice(2), Kn = "__reactInternalInstance$" + Po, no = "__reactEventHandlers$" + Po, ro = "__reactContainere$" + Po;
        function Ir(e) {
          var t = e[Kn];
          if (t) return t;
          for (var n = e.parentNode; n; ) {
            if (t = n[ro] || n[Kn]) {
              if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = Ri(e); e !== null; ) {
                if (n = e[Kn]) return n;
                e = Ri(e);
              }
              return t;
            }
            n = (e = n).parentNode;
          }
          return null;
        }
        function oo(e) {
          return !(e = e[Kn] || e[ro]) || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
        }
        function Qn(e) {
          if (e.tag === 5 || e.tag === 6) return e.stateNode;
          throw Error(m(33));
        }
        function ni(e) {
          return e[no] || null;
        }
        function Rn(e) {
          do
            e = e.return;
          while (e && e.tag !== 5);
          return e || null;
        }
        function Ai(e, t) {
          var n = e.stateNode;
          if (!n) return null;
          var r = Q(n);
          if (!r) return null;
          n = r[t];
          e: switch (t) {
            case "onClick":
            case "onClickCapture":
            case "onDoubleClick":
            case "onDoubleClickCapture":
            case "onMouseDown":
            case "onMouseDownCapture":
            case "onMouseMove":
            case "onMouseMoveCapture":
            case "onMouseUp":
            case "onMouseUpCapture":
            case "onMouseEnter":
              (r = !r.disabled) || (r = !((e = e.type) === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
              break e;
            default:
              e = !1;
          }
          if (e) return null;
          if (n && typeof n != "function") throw Error(m(231, t, typeof n));
          return n;
        }
        function Mi(e, t, n) {
          (t = Ai(e, n.dispatchConfig.phasedRegistrationNames[t])) && (n._dispatchListeners = Ue(n._dispatchListeners, t), n._dispatchInstances = Ue(n._dispatchInstances, e));
        }
        function Ra(e) {
          if (e && e.dispatchConfig.phasedRegistrationNames) {
            for (var t = e._targetInst, n = []; t; ) n.push(t), t = Rn(t);
            for (t = n.length; 0 < t--; ) Mi(n[t], "captured", e);
            for (t = 0; t < n.length; t++) Mi(n[t], "bubbled", e);
          }
        }
        function No(e, t, n) {
          e && n && n.dispatchConfig.registrationName && (t = Ai(e, n.dispatchConfig.registrationName)) && (n._dispatchListeners = Ue(n._dispatchListeners, t), n._dispatchInstances = Ue(n._dispatchInstances, e));
        }
        function Aa(e) {
          e && e.dispatchConfig.registrationName && No(e._targetInst, null, e);
        }
        function jr(e) {
          Yn(e, Ra);
        }
        var hr = null, ri = null, Do = null;
        function Ii() {
          if (Do) return Do;
          var e, t, n = ri, r = n.length, i = "value" in hr ? hr.value : hr.textContent, p = i.length;
          for (e = 0; e < r && n[e] === i[e]; e++) ;
          var v = r - e;
          for (t = 1; t <= v && n[r - t] === i[p - t]; t++) ;
          return Do = i.slice(e, 1 < t ? 1 - t : void 0);
        }
        function Ro() {
          return !0;
        }
        function Ao() {
          return !1;
        }
        function an(e, t, n, r) {
          for (var i in this.dispatchConfig = e, this._targetInst = t, this.nativeEvent = n, e = this.constructor.Interface) e.hasOwnProperty(i) && ((t = e[i]) ? this[i] = t(n) : i === "target" ? this.target = r : this[i] = n[i]);
          return this.isDefaultPrevented = (n.defaultPrevented != null ? n.defaultPrevented : n.returnValue === !1) ? Ro : Ao, this.isPropagationStopped = Ao, this;
        }
        function ji(e, t, n, r) {
          if (this.eventPool.length) {
            var i = this.eventPool.pop();
            return this.call(i, e, t, n, r), i;
          }
          return new this(e, t, n, r);
        }
        function $e(e) {
          if (!(e instanceof this)) throw Error(m(279));
          e.destructor(), 10 > this.eventPool.length && this.eventPool.push(e);
        }
        function w(e) {
          e.eventPool = [], e.getPooled = ji, e.release = $e;
        }
        o(an.prototype, { preventDefault: function() {
          this.defaultPrevented = !0;
          var e = this.nativeEvent;
          e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Ro);
        }, stopPropagation: function() {
          var e = this.nativeEvent;
          e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Ro);
        }, persist: function() {
          this.isPersistent = Ro;
        }, isPersistent: Ao, destructor: function() {
          var e, t = this.constructor.Interface;
          for (e in t) this[e] = null;
          this.nativeEvent = this._targetInst = this.dispatchConfig = null, this.isPropagationStopped = this.isDefaultPrevented = Ao, this._dispatchInstances = this._dispatchListeners = null;
        } }), an.Interface = { type: null, target: null, currentTarget: function() {
          return null;
        }, eventPhase: null, bubbles: null, cancelable: null, timeStamp: function(e) {
          return e.timeStamp || Date.now();
        }, defaultPrevented: null, isTrusted: null }, an.extend = function(e) {
          function t() {
          }
          function n() {
            return r.apply(this, arguments);
          }
          var r = this;
          t.prototype = r.prototype;
          var i = new t();
          return o(i, n.prototype), n.prototype = i, n.prototype.constructor = n, n.Interface = o({}, r.Interface, e), n.extend = r.extend, w(n), n;
        }, w(an);
        var a = an.extend({ data: null }), c = an.extend({ data: null }), h = [9, 13, 27, 32], _ = te && "CompositionEvent" in window, T = null;
        te && "documentMode" in document && (T = document.documentMode);
        var z = te && "TextEvent" in window && !T, ne = te && (!_ || T && 8 < T && 11 >= T), de = " ", pe = { beforeInput: { phasedRegistrationNames: { bubbled: "onBeforeInput", captured: "onBeforeInputCapture" }, dependencies: ["compositionend", "keypress", "textInput", "paste"] }, compositionEnd: { phasedRegistrationNames: { bubbled: "onCompositionEnd", captured: "onCompositionEndCapture" }, dependencies: "blur compositionend keydown keypress keyup mousedown".split(" ") }, compositionStart: { phasedRegistrationNames: { bubbled: "onCompositionStart", captured: "onCompositionStartCapture" }, dependencies: "blur compositionstart keydown keypress keyup mousedown".split(" ") }, compositionUpdate: { phasedRegistrationNames: { bubbled: "onCompositionUpdate", captured: "onCompositionUpdateCapture" }, dependencies: "blur compositionupdate keydown keypress keyup mousedown".split(" ") } }, _e = !1;
        function Ne(e, t) {
          switch (e) {
            case "keyup":
              return h.indexOf(t.keyCode) !== -1;
            case "keydown":
              return t.keyCode !== 229;
            case "keypress":
            case "mousedown":
            case "blur":
              return !0;
            default:
              return !1;
          }
        }
        function We(e) {
          return typeof (e = e.detail) == "object" && "data" in e ? e.data : null;
        }
        var Ae = !1, Ke = { eventTypes: pe, extractEvents: function(e, t, n, r) {
          var i;
          if (_) e: {
            switch (e) {
              case "compositionstart":
                var p = pe.compositionStart;
                break e;
              case "compositionend":
                p = pe.compositionEnd;
                break e;
              case "compositionupdate":
                p = pe.compositionUpdate;
                break e;
            }
            p = void 0;
          }
          else Ae ? Ne(e, n) && (p = pe.compositionEnd) : e === "keydown" && n.keyCode === 229 && (p = pe.compositionStart);
          return p ? (ne && n.locale !== "ko" && (Ae || p !== pe.compositionStart ? p === pe.compositionEnd && Ae && (i = Ii()) : (ri = "value" in (hr = r) ? hr.value : hr.textContent, Ae = !0)), p = a.getPooled(p, t, n, r), (i || (i = We(n)) !== null) && (p.data = i), jr(p), i = p) : i = null, (e = z ? function(v, x) {
            switch (v) {
              case "compositionend":
                return We(x);
              case "keypress":
                return x.which !== 32 ? null : (_e = !0, de);
              case "textInput":
                return (v = x.data) === de && _e ? null : v;
              default:
                return null;
            }
          }(e, n) : function(v, x) {
            if (Ae) return v === "compositionend" || !_ && Ne(v, x) ? (v = Ii(), Do = ri = hr = null, Ae = !1, v) : null;
            switch (v) {
              case "paste":
                return null;
              case "keypress":
                if (!(x.ctrlKey || x.altKey || x.metaKey) || x.ctrlKey && x.altKey) {
                  if (x.char && 1 < x.char.length) return x.char;
                  if (x.which) return String.fromCharCode(x.which);
                }
                return null;
              case "compositionend":
                return ne && x.locale !== "ko" ? null : x.data;
              default:
                return null;
            }
          }(e, n)) ? ((t = c.getPooled(pe.beforeInput, t, n, r)).data = e, jr(t)) : t = null, i === null ? t : t === null ? i : [i, t];
        } }, Ie = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
        function Fe(e) {
          var t = e && e.nodeName && e.nodeName.toLowerCase();
          return t === "input" ? !!Ie[e.type] : t === "textarea";
        }
        var et = { change: { phasedRegistrationNames: { bubbled: "onChange", captured: "onChangeCapture" }, dependencies: "blur change click focus input keydown keyup selectionchange".split(" ") } };
        function Ye(e, t, n) {
          return (e = an.getPooled(et.change, e, t, n)).type = "change", D(n), jr(e), e;
        }
        var Le = null, ft = null;
        function Dt(e) {
          Mt(e);
        }
        function It(e) {
          if (ct(Qn(e))) return e;
        }
        function jt(e, t) {
          if (e === "change") return t;
        }
        var _t = !1;
        function zt() {
          Le && (Le.detachEvent("onpropertychange", dt), ft = Le = null);
        }
        function dt(e) {
          if (e.propertyName === "value" && It(ft)) if (e = Ye(ft, e, nn(e)), Se) Mt(e);
          else {
            Se = !0;
            try {
              be(Dt, e);
            } finally {
              Se = !1, Ze();
            }
          }
        }
        function An(e, t, n) {
          e === "focus" ? (zt(), ft = n, (Le = t).attachEvent("onpropertychange", dt)) : e === "blur" && zt();
        }
        function lt(e) {
          if (e === "selectionchange" || e === "keyup" || e === "keydown") return It(ft);
        }
        function Mn(e, t) {
          if (e === "click") return It(t);
        }
        function Hn(e, t) {
          if (e === "input" || e === "change") return It(t);
        }
        te && (_t = Ht("input") && (!document.documentMode || 9 < document.documentMode));
        var zr = { eventTypes: et, _isInputEventSupported: _t, extractEvents: function(e, t, n, r) {
          var i = t ? Qn(t) : window, p = i.nodeName && i.nodeName.toLowerCase();
          if (p === "select" || p === "input" && i.type === "file") var v = jt;
          else if (Fe(i)) if (_t) v = Hn;
          else {
            v = lt;
            var x = An;
          }
          else (p = i.nodeName) && p.toLowerCase() === "input" && (i.type === "checkbox" || i.type === "radio") && (v = Mn);
          if (v && (v = v(e, t))) return Ye(v, n, r);
          x && x(e, i, t), e === "blur" && (e = i._wrapperState) && e.controlled && i.type === "number" && Cn(i, "number", i.value);
        } }, xt = an.extend({ view: null, detail: null }), io = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
        function In(e) {
          var t = this.nativeEvent;
          return t.getModifierState ? t.getModifierState(e) : !!(e = io[e]) && !!t[e];
        }
        function $t() {
          return In;
        }
        var fn = 0, Gn = 0, Gt = !1, dn = !1, Lr = xt.extend({ screenX: null, screenY: null, clientX: null, clientY: null, pageX: null, pageY: null, ctrlKey: null, shiftKey: null, altKey: null, metaKey: null, getModifierState: $t, button: null, buttons: null, relatedTarget: function(e) {
          return e.relatedTarget || (e.fromElement === e.srcElement ? e.toElement : e.fromElement);
        }, movementX: function(e) {
          if ("movementX" in e) return e.movementX;
          var t = fn;
          return fn = e.screenX, Gt ? e.type === "mousemove" ? e.screenX - t : 0 : (Gt = !0, 0);
        }, movementY: function(e) {
          if ("movementY" in e) return e.movementY;
          var t = Gn;
          return Gn = e.screenY, dn ? e.type === "mousemove" ? e.screenY - t : 0 : (dn = !0, 0);
        } }), oi = Lr.extend({ pointerId: null, width: null, height: null, pressure: null, tangentialPressure: null, tiltX: null, tiltY: null, twist: null, pointerType: null, isPrimary: null }), Ur = { mouseEnter: { registrationName: "onMouseEnter", dependencies: ["mouseout", "mouseover"] }, mouseLeave: { registrationName: "onMouseLeave", dependencies: ["mouseout", "mouseover"] }, pointerEnter: { registrationName: "onPointerEnter", dependencies: ["pointerout", "pointerover"] }, pointerLeave: { registrationName: "onPointerLeave", dependencies: ["pointerout", "pointerover"] } }, Mo = { eventTypes: Ur, extractEvents: function(e, t, n, r, i) {
          var p = e === "mouseover" || e === "pointerover", v = e === "mouseout" || e === "pointerout";
          if (p && !(32 & i) && (n.relatedTarget || n.fromElement) || !v && !p || (p = r.window === r ? r : (p = r.ownerDocument) ? p.defaultView || p.parentWindow : window, v ? (v = t, (t = (t = n.relatedTarget || n.toElement) ? Ir(t) : null) !== null && (t !== Nn(t) || t.tag !== 5 && t.tag !== 6) && (t = null)) : v = null, v === t)) return null;
          if (e === "mouseout" || e === "mouseover") var x = Lr, X = Ur.mouseLeave, q = Ur.mouseEnter, ge = "mouse";
          else e !== "pointerout" && e !== "pointerover" || (x = oi, X = Ur.pointerLeave, q = Ur.pointerEnter, ge = "pointer");
          if (e = v == null ? p : Qn(v), p = t == null ? p : Qn(t), (X = x.getPooled(X, v, n, r)).type = ge + "leave", X.target = e, X.relatedTarget = p, (n = x.getPooled(q, t, n, r)).type = ge + "enter", n.target = p, n.relatedTarget = e, ge = t, (r = v) && ge) e: {
            for (q = ge, v = 0, e = x = r; e; e = Rn(e)) v++;
            for (e = 0, t = q; t; t = Rn(t)) e++;
            for (; 0 < v - e; ) x = Rn(x), v--;
            for (; 0 < e - v; ) q = Rn(q), e--;
            for (; v--; ) {
              if (x === q || x === q.alternate) break e;
              x = Rn(x), q = Rn(q);
            }
            x = null;
          }
          else x = null;
          for (q = x, x = []; r && r !== q && ((v = r.alternate) === null || v !== q); ) x.push(r), r = Rn(r);
          for (r = []; ge && ge !== q && ((v = ge.alternate) === null || v !== q); ) r.push(ge), ge = Rn(ge);
          for (ge = 0; ge < x.length; ge++) No(x[ge], "bubbled", X);
          for (ge = r.length; 0 < ge--; ) No(r[ge], "captured", n);
          return 64 & i ? [X, n] : [X];
        } }, mr = typeof Object.is == "function" ? Object.is : function(e, t) {
          return e === t && (e !== 0 || 1 / e == 1 / t) || e != e && t != t;
        }, zi = Object.prototype.hasOwnProperty;
        function gr(e, t) {
          if (mr(e, t)) return !0;
          if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
          var n = Object.keys(e), r = Object.keys(t);
          if (n.length !== r.length) return !1;
          for (r = 0; r < n.length; r++) if (!zi.call(t, n[r]) || !mr(e[n[r]], t[n[r]])) return !1;
          return !0;
        }
        var Io = te && "documentMode" in document && 11 >= document.documentMode, ii = { select: { phasedRegistrationNames: { bubbled: "onSelect", captured: "onSelectCapture" }, dependencies: "blur contextmenu dragend focus keydown keyup mousedown mouseup selectionchange".split(" ") } }, Xn = null, ao = null, wn = null, so = !1;
        function Ns(e, t) {
          var n = t.window === t ? t.document : t.nodeType === 9 ? t : t.ownerDocument;
          return so || Xn == null || Xn !== Go(n) ? null : ("selectionStart" in (n = Xn) && Xo(n) ? n = { start: n.selectionStart, end: n.selectionEnd } : n = { anchorNode: (n = (n.ownerDocument && n.ownerDocument.defaultView || window).getSelection()).anchorNode, anchorOffset: n.anchorOffset, focusNode: n.focusNode, focusOffset: n.focusOffset }, wn && gr(wn, n) ? null : (wn = n, (e = an.getPooled(ii.select, ao, e, t)).type = "select", e.target = Xn, jr(e), e));
        }
        var cu = { eventTypes: ii, extractEvents: function(e, t, n, r, i, p) {
          if (!(p = !(i = p || (r.window === r ? r.document : r.nodeType === 9 ? r : r.ownerDocument)))) {
            e: {
              i = cn(i), p = se.onSelect;
              for (var v = 0; v < p.length; v++) if (!i.has(p[v])) {
                i = !1;
                break e;
              }
              i = !0;
            }
            p = !i;
          }
          if (p) return null;
          switch (i = t ? Qn(t) : window, e) {
            case "focus":
              (Fe(i) || i.contentEditable === "true") && (Xn = i, ao = t, wn = null);
              break;
            case "blur":
              wn = ao = Xn = null;
              break;
            case "mousedown":
              so = !0;
              break;
            case "contextmenu":
            case "mouseup":
            case "dragend":
              return so = !1, Ns(n, r);
            case "selectionchange":
              if (Io) break;
            case "keydown":
            case "keyup":
              return Ns(n, r);
          }
          return null;
        } }, fu = an.extend({ animationName: null, elapsedTime: null, pseudoElement: null }), du = an.extend({ clipboardData: function(e) {
          return "clipboardData" in e ? e.clipboardData : window.clipboardData;
        } }), pu = xt.extend({ relatedTarget: null });
        function Li(e) {
          var t = e.keyCode;
          return "charCode" in e ? (e = e.charCode) === 0 && t === 13 && (e = 13) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
        }
        var hu = { Esc: "Escape", Spacebar: " ", Left: "ArrowLeft", Up: "ArrowUp", Right: "ArrowRight", Down: "ArrowDown", Del: "Delete", Win: "OS", Menu: "ContextMenu", Apps: "ContextMenu", Scroll: "ScrollLock", MozPrintableKey: "Unidentified" }, mu = { 8: "Backspace", 9: "Tab", 12: "Clear", 13: "Enter", 16: "Shift", 17: "Control", 18: "Alt", 19: "Pause", 20: "CapsLock", 27: "Escape", 32: " ", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown", 45: "Insert", 46: "Delete", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 144: "NumLock", 145: "ScrollLock", 224: "Meta" }, gu = xt.extend({ key: function(e) {
          if (e.key) {
            var t = hu[e.key] || e.key;
            if (t !== "Unidentified") return t;
          }
          return e.type === "keypress" ? (e = Li(e)) === 13 ? "Enter" : String.fromCharCode(e) : e.type === "keydown" || e.type === "keyup" ? mu[e.keyCode] || "Unidentified" : "";
        }, location: null, ctrlKey: null, shiftKey: null, altKey: null, metaKey: null, repeat: null, locale: null, getModifierState: $t, charCode: function(e) {
          return e.type === "keypress" ? Li(e) : 0;
        }, keyCode: function(e) {
          return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
        }, which: function(e) {
          return e.type === "keypress" ? Li(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
        } }), bu = Lr.extend({ dataTransfer: null }), yu = xt.extend({ touches: null, targetTouches: null, changedTouches: null, altKey: null, metaKey: null, ctrlKey: null, shiftKey: null, getModifierState: $t }), vu = an.extend({ propertyName: null, elapsedTime: null, pseudoElement: null }), ku = Lr.extend({ deltaX: function(e) {
          return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
        }, deltaY: function(e) {
          return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
        }, deltaZ: null, deltaMode: null }), wu = { eventTypes: ki, extractEvents: function(e, t, n, r) {
          var i = wi.get(e);
          if (!i) return null;
          switch (e) {
            case "keypress":
              if (Li(n) === 0) return null;
            case "keydown":
            case "keyup":
              e = gu;
              break;
            case "blur":
            case "focus":
              e = pu;
              break;
            case "click":
              if (n.button === 2) return null;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              e = Lr;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              e = bu;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              e = yu;
              break;
            case tn:
            case ht:
            case Wt:
              e = fu;
              break;
            case Pn:
              e = vu;
              break;
            case "scroll":
              e = xt;
              break;
            case "wheel":
              e = ku;
              break;
            case "copy":
            case "cut":
            case "paste":
              e = du;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              e = oi;
              break;
            default:
              e = an;
          }
          return jr(t = e.getPooled(i, t, n, r)), t;
        } };
        if (M) throw Error(m(101));
        M = Array.prototype.slice.call("ResponderEventPlugin SimpleEventPlugin EnterLeaveEventPlugin ChangeEventPlugin SelectEventPlugin BeforeInputEventPlugin".split(" ")), R(), Q = ni, j = oo, W = Qn, le({ SimpleEventPlugin: wu, EnterLeaveEventPlugin: Mo, ChangeEventPlugin: zr, SelectEventPlugin: cu, BeforeInputEventPlugin: Ke });
        var Ma = [], jo = -1;
        function vt(e) {
          0 > jo || (e.current = Ma[jo], Ma[jo] = null, jo--);
        }
        function St(e, t) {
          jo++, Ma[jo] = e.current, e.current = t;
        }
        var Fr = {}, Xt = { current: Fr }, pn = { current: !1 }, lo = Fr;
        function zo(e, t) {
          var n = e.type.contextTypes;
          if (!n) return Fr;
          var r = e.stateNode;
          if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
          var i, p = {};
          for (i in n) p[i] = t[i];
          return r && ((e = e.stateNode).__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = p), p;
        }
        function hn(e) {
          return (e = e.childContextTypes) != null;
        }
        function Ui() {
          vt(pn), vt(Xt);
        }
        function Ds(e, t, n) {
          if (Xt.current !== Fr) throw Error(m(168));
          St(Xt, t), St(pn, n);
        }
        function Rs(e, t, n) {
          var r = e.stateNode;
          if (e = t.childContextTypes, typeof r.getChildContext != "function") return n;
          for (var i in r = r.getChildContext()) if (!(i in e)) throw Error(m(108, Yt(t) || "Unknown", i));
          return o({}, n, {}, r);
        }
        function Fi(e) {
          return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Fr, lo = Xt.current, St(Xt, e), St(pn, pn.current), !0;
        }
        function As(e, t, n) {
          var r = e.stateNode;
          if (!r) throw Error(m(169));
          n ? (e = Rs(e, t, lo), r.__reactInternalMemoizedMergedChildContext = e, vt(pn), vt(Xt), St(Xt, e)) : vt(pn), St(pn, n);
        }
        var Eu = S.unstable_runWithPriority, Ia = S.unstable_scheduleCallback, Ms = S.unstable_cancelCallback, Is = S.unstable_requestPaint, ja = S.unstable_now, _u = S.unstable_getCurrentPriorityLevel, Bi = S.unstable_ImmediatePriority, js = S.unstable_UserBlockingPriority, zs = S.unstable_NormalPriority, Ls = S.unstable_LowPriority, Us = S.unstable_IdlePriority, Fs = {}, xu = S.unstable_shouldYield, Su = Is !== void 0 ? Is : function() {
        }, br = null, Wi = null, za = !1, Bs = ja(), jn = 1e4 > Bs ? ja : function() {
          return ja() - Bs;
        };
        function Hi() {
          switch (_u()) {
            case Bi:
              return 99;
            case js:
              return 98;
            case zs:
              return 97;
            case Ls:
              return 96;
            case Us:
              return 95;
            default:
              throw Error(m(332));
          }
        }
        function Ws(e) {
          switch (e) {
            case 99:
              return Bi;
            case 98:
              return js;
            case 97:
              return zs;
            case 96:
              return Ls;
            case 95:
              return Us;
            default:
              throw Error(m(332));
          }
        }
        function Br(e, t) {
          return e = Ws(e), Eu(e, t);
        }
        function Hs(e, t, n) {
          return e = Ws(e), Ia(e, t, n);
        }
        function Vs(e) {
          return br === null ? (br = [e], Wi = Ia(Bi, $s)) : br.push(e), Fs;
        }
        function Jn() {
          if (Wi !== null) {
            var e = Wi;
            Wi = null, Ms(e);
          }
          $s();
        }
        function $s() {
          if (!za && br !== null) {
            za = !0;
            var e = 0;
            try {
              var t = br;
              Br(99, function() {
                for (; e < t.length; e++) {
                  var n = t[e];
                  do
                    n = n(!0);
                  while (n !== null);
                }
              }), br = null;
            } catch (n) {
              throw br !== null && (br = br.slice(e + 1)), Ia(Bi, Jn), n;
            } finally {
              za = !1;
            }
          }
        }
        function Vi(e, t, n) {
          return 1073741821 - (1 + ((1073741821 - e + t / 10) / (n /= 10) | 0)) * n;
        }
        function Vn(e, t) {
          if (e && e.defaultProps) for (var n in t = o({}, t), e = e.defaultProps) t[n] === void 0 && (t[n] = e[n]);
          return t;
        }
        var $i = { current: null }, Yi = null, Lo = null, qi = null;
        function La() {
          qi = Lo = Yi = null;
        }
        function Ua(e) {
          var t = $i.current;
          vt($i), e.type._context._currentValue = t;
        }
        function Ys(e, t) {
          for (; e !== null; ) {
            var n = e.alternate;
            if (e.childExpirationTime < t) e.childExpirationTime = t, n !== null && n.childExpirationTime < t && (n.childExpirationTime = t);
            else {
              if (!(n !== null && n.childExpirationTime < t)) break;
              n.childExpirationTime = t;
            }
            e = e.return;
          }
        }
        function Uo(e, t) {
          Yi = e, qi = Lo = null, (e = e.dependencies) !== null && e.firstContext !== null && (e.expirationTime >= t && (er = !0), e.firstContext = null);
        }
        function zn(e, t) {
          if (qi !== e && t !== !1 && t !== 0) if (typeof t == "number" && t !== 1073741823 || (qi = e, t = 1073741823), t = { context: e, observedBits: t, next: null }, Lo === null) {
            if (Yi === null) throw Error(m(308));
            Lo = t, Yi.dependencies = { expirationTime: 0, firstContext: t, responders: null };
          } else Lo = Lo.next = t;
          return e._currentValue;
        }
        var Wr = !1;
        function Fa(e) {
          e.updateQueue = { baseState: e.memoizedState, baseQueue: null, shared: { pending: null }, effects: null };
        }
        function Ba(e, t) {
          e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, baseQueue: e.baseQueue, shared: e.shared, effects: e.effects });
        }
        function Hr(e, t) {
          return (e = { expirationTime: e, suspenseConfig: t, tag: 0, payload: null, callback: null, next: null }).next = e;
        }
        function Vr(e, t) {
          if ((e = e.updateQueue) !== null) {
            var n = (e = e.shared).pending;
            n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
          }
        }
        function qs(e, t) {
          var n = e.alternate;
          n !== null && Ba(n, e), (n = (e = e.updateQueue).baseQueue) === null ? (e.baseQueue = t.next = t, t.next = t) : (t.next = n.next, n.next = t);
        }
        function ai(e, t, n, r) {
          var i = e.updateQueue;
          Wr = !1;
          var p = i.baseQueue, v = i.shared.pending;
          if (v !== null) {
            if (p !== null) {
              var x = p.next;
              p.next = v.next, v.next = x;
            }
            p = v, i.shared.pending = null, (x = e.alternate) !== null && (x = x.updateQueue) !== null && (x.baseQueue = v);
          }
          if (p !== null) {
            x = p.next;
            var X = i.baseState, q = 0, ge = null, De = null, He = null;
            if (x !== null) for (var ot = x; ; ) {
              if ((v = ot.expirationTime) < r) {
                var Fn = { expirationTime: ot.expirationTime, suspenseConfig: ot.suspenseConfig, tag: ot.tag, payload: ot.payload, callback: ot.callback, next: null };
                He === null ? (De = He = Fn, ge = X) : He = He.next = Fn, v > q && (q = v);
              } else {
                He !== null && (He = He.next = { expirationTime: 1073741823, suspenseConfig: ot.suspenseConfig, tag: ot.tag, payload: ot.payload, callback: ot.callback, next: null }), Wl(v, ot.suspenseConfig);
                e: {
                  var ln = e, re = ot;
                  switch (v = t, Fn = n, re.tag) {
                    case 1:
                      if (typeof (ln = re.payload) == "function") {
                        X = ln.call(Fn, X, v);
                        break e;
                      }
                      X = ln;
                      break e;
                    case 3:
                      ln.effectTag = -4097 & ln.effectTag | 64;
                    case 0:
                      if ((v = typeof (ln = re.payload) == "function" ? ln.call(Fn, X, v) : ln) == null) break e;
                      X = o({}, X, v);
                      break e;
                    case 2:
                      Wr = !0;
                  }
                }
                ot.callback !== null && (e.effectTag |= 32, (v = i.effects) === null ? i.effects = [ot] : v.push(ot));
              }
              if ((ot = ot.next) === null || ot === x) {
                if ((v = i.shared.pending) === null) break;
                ot = p.next = v.next, v.next = x, i.baseQueue = p = v, i.shared.pending = null;
              }
            }
            He === null ? ge = X : He.next = De, i.baseState = ge, i.baseQueue = He, va(q), e.expirationTime = q, e.memoizedState = X;
          }
        }
        function Ks(e, t, n) {
          if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
            var r = e[t], i = r.callback;
            if (i !== null) {
              if (r.callback = null, r = i, i = n, typeof r != "function") throw Error(m(191, r));
              r.call(i);
            }
          }
        }
        var si = he.ReactCurrentBatchConfig, Qs = new u.Component().refs;
        function Ki(e, t, n, r) {
          n = (n = n(r, t = e.memoizedState)) == null ? t : o({}, t, n), e.memoizedState = n, e.expirationTime === 0 && (e.updateQueue.baseState = n);
        }
        var Qi = { isMounted: function(e) {
          return !!(e = e._reactInternalFiber) && Nn(e) === e;
        }, enqueueSetState: function(e, t, n) {
          e = e._reactInternalFiber;
          var r = tr(), i = si.suspense;
          (i = Hr(r = mo(r, e, i), i)).payload = t, n != null && (i.callback = n), Vr(e, i), Kr(e, r);
        }, enqueueReplaceState: function(e, t, n) {
          e = e._reactInternalFiber;
          var r = tr(), i = si.suspense;
          (i = Hr(r = mo(r, e, i), i)).tag = 1, i.payload = t, n != null && (i.callback = n), Vr(e, i), Kr(e, r);
        }, enqueueForceUpdate: function(e, t) {
          e = e._reactInternalFiber;
          var n = tr(), r = si.suspense;
          (r = Hr(n = mo(n, e, r), r)).tag = 2, t != null && (r.callback = t), Vr(e, r), Kr(e, n);
        } };
        function Gs(e, t, n, r, i, p, v) {
          return typeof (e = e.stateNode).shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, p, v) : !t.prototype || !t.prototype.isPureReactComponent || !gr(n, r) || !gr(i, p);
        }
        function Xs(e, t, n) {
          var r = !1, i = Fr, p = t.contextType;
          return typeof p == "object" && p !== null ? p = zn(p) : (i = hn(t) ? lo : Xt.current, p = (r = (r = t.contextTypes) != null) ? zo(e, i) : Fr), t = new t(n, p), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Qi, e.stateNode = t, t._reactInternalFiber = e, r && ((e = e.stateNode).__reactInternalMemoizedUnmaskedChildContext = i, e.__reactInternalMemoizedMaskedChildContext = p), t;
        }
        function Js(e, t, n, r) {
          e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Qi.enqueueReplaceState(t, t.state, null);
        }
        function Wa(e, t, n, r) {
          var i = e.stateNode;
          i.props = n, i.state = e.memoizedState, i.refs = Qs, Fa(e);
          var p = t.contextType;
          typeof p == "object" && p !== null ? i.context = zn(p) : (p = hn(t) ? lo : Xt.current, i.context = zo(e, p)), ai(e, n, i, r), i.state = e.memoizedState, typeof (p = t.getDerivedStateFromProps) == "function" && (Ki(e, t, p, n), i.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof i.getSnapshotBeforeUpdate == "function" || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (t = i.state, typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount(), t !== i.state && Qi.enqueueReplaceState(i, i.state, null), ai(e, n, i, r), i.state = e.memoizedState), typeof i.componentDidMount == "function" && (e.effectTag |= 4);
        }
        var Gi = Array.isArray;
        function li(e, t, n) {
          if ((e = n.ref) !== null && typeof e != "function" && typeof e != "object") {
            if (n._owner) {
              if (n = n._owner) {
                if (n.tag !== 1) throw Error(m(309));
                var r = n.stateNode;
              }
              if (!r) throw Error(m(147, e));
              var i = "" + e;
              return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i ? t.ref : ((t = function(p) {
                var v = r.refs;
                v === Qs && (v = r.refs = {}), p === null ? delete v[i] : v[i] = p;
              })._stringRef = i, t);
            }
            if (typeof e != "string") throw Error(m(284));
            if (!n._owner) throw Error(m(290, e));
          }
          return e;
        }
        function Xi(e, t) {
          if (e.type !== "textarea") throw Error(m(31, Object.prototype.toString.call(t) === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : t, ""));
        }
        function Zs(e) {
          function t(re, ee) {
            if (e) {
              var ce = re.lastEffect;
              ce !== null ? (ce.nextEffect = ee, re.lastEffect = ee) : re.firstEffect = re.lastEffect = ee, ee.nextEffect = null, ee.effectTag = 8;
            }
          }
          function n(re, ee) {
            if (!e) return null;
            for (; ee !== null; ) t(re, ee), ee = ee.sibling;
            return null;
          }
          function r(re, ee) {
            for (re = /* @__PURE__ */ new Map(); ee !== null; ) ee.key !== null ? re.set(ee.key, ee) : re.set(ee.index, ee), ee = ee.sibling;
            return re;
          }
          function i(re, ee) {
            return (re = vo(re, ee)).index = 0, re.sibling = null, re;
          }
          function p(re, ee, ce) {
            return re.index = ce, e ? (ce = re.alternate) !== null ? (ce = ce.index) < ee ? (re.effectTag = 2, ee) : ce : (re.effectTag = 2, ee) : ee;
          }
          function v(re) {
            return e && re.alternate === null && (re.effectTag = 2), re;
          }
          function x(re, ee, ce, ve) {
            return ee === null || ee.tag !== 6 ? ((ee = ys(ce, re.mode, ve)).return = re, ee) : ((ee = i(ee, ce)).return = re, ee);
          }
          function X(re, ee, ce, ve) {
            return ee !== null && ee.elementType === ce.type ? ((ve = i(ee, ce.props)).ref = li(re, ee, ce), ve.return = re, ve) : ((ve = ka(ce.type, ce.key, ce.props, null, re.mode, ve)).ref = li(re, ee, ce), ve.return = re, ve);
          }
          function q(re, ee, ce, ve) {
            return ee === null || ee.tag !== 4 || ee.stateNode.containerInfo !== ce.containerInfo || ee.stateNode.implementation !== ce.implementation ? ((ee = vs(ce, re.mode, ve)).return = re, ee) : ((ee = i(ee, ce.children || [])).return = re, ee);
          }
          function ge(re, ee, ce, ve, xe) {
            return ee === null || ee.tag !== 7 ? ((ee = Qr(ce, re.mode, ve, xe)).return = re, ee) : ((ee = i(ee, ce)).return = re, ee);
          }
          function De(re, ee, ce) {
            if (typeof ee == "string" || typeof ee == "number") return (ee = ys("" + ee, re.mode, ce)).return = re, ee;
            if (typeof ee == "object" && ee !== null) {
              switch (ee.$$typeof) {
                case Ve:
                  return (ce = ka(ee.type, ee.key, ee.props, null, re.mode, ce)).ref = li(re, null, ee), ce.return = re, ce;
                case At:
                  return (ee = vs(ee, re.mode, ce)).return = re, ee;
              }
              if (Gi(ee) || en(ee)) return (ee = Qr(ee, re.mode, ce, null)).return = re, ee;
              Xi(re, ee);
            }
            return null;
          }
          function He(re, ee, ce, ve) {
            var xe = ee !== null ? ee.key : null;
            if (typeof ce == "string" || typeof ce == "number") return xe !== null ? null : x(re, ee, "" + ce, ve);
            if (typeof ce == "object" && ce !== null) {
              switch (ce.$$typeof) {
                case Ve:
                  return ce.key === xe ? ce.type === kt ? ge(re, ee, ce.props.children, ve, xe) : X(re, ee, ce, ve) : null;
                case At:
                  return ce.key === xe ? q(re, ee, ce, ve) : null;
              }
              if (Gi(ce) || en(ce)) return xe !== null ? null : ge(re, ee, ce, ve, null);
              Xi(re, ce);
            }
            return null;
          }
          function ot(re, ee, ce, ve, xe) {
            if (typeof ve == "string" || typeof ve == "number") return x(ee, re = re.get(ce) || null, "" + ve, xe);
            if (typeof ve == "object" && ve !== null) {
              switch (ve.$$typeof) {
                case Ve:
                  return re = re.get(ve.key === null ? ce : ve.key) || null, ve.type === kt ? ge(ee, re, ve.props.children, xe, ve.key) : X(ee, re, ve, xe);
                case At:
                  return q(ee, re = re.get(ve.key === null ? ce : ve.key) || null, ve, xe);
              }
              if (Gi(ve) || en(ve)) return ge(ee, re = re.get(ce) || null, ve, xe, null);
              Xi(ee, ve);
            }
            return null;
          }
          function Fn(re, ee, ce, ve) {
            for (var xe = null, Oe = null, Be = ee, at = ee = 0, Rt = null; Be !== null && at < ce.length; at++) {
              Be.index > at ? (Rt = Be, Be = null) : Rt = Be.sibling;
              var Je = He(re, Be, ce[at], ve);
              if (Je === null) {
                Be === null && (Be = Rt);
                break;
              }
              e && Be && Je.alternate === null && t(re, Be), ee = p(Je, ee, at), Oe === null ? xe = Je : Oe.sibling = Je, Oe = Je, Be = Rt;
            }
            if (at === ce.length) return n(re, Be), xe;
            if (Be === null) {
              for (; at < ce.length; at++) (Be = De(re, ce[at], ve)) !== null && (ee = p(Be, ee, at), Oe === null ? xe = Be : Oe.sibling = Be, Oe = Be);
              return xe;
            }
            for (Be = r(re, Be); at < ce.length; at++) (Rt = ot(Be, re, at, ce[at], ve)) !== null && (e && Rt.alternate !== null && Be.delete(Rt.key === null ? at : Rt.key), ee = p(Rt, ee, at), Oe === null ? xe = Rt : Oe.sibling = Rt, Oe = Rt);
            return e && Be.forEach(function(Bt) {
              return t(re, Bt);
            }), xe;
          }
          function ln(re, ee, ce, ve) {
            var xe = en(ce);
            if (typeof xe != "function") throw Error(m(150));
            if ((ce = xe.call(ce)) == null) throw Error(m(151));
            for (var Oe = xe = null, Be = ee, at = ee = 0, Rt = null, Je = ce.next(); Be !== null && !Je.done; at++, Je = ce.next()) {
              Be.index > at ? (Rt = Be, Be = null) : Rt = Be.sibling;
              var Bt = He(re, Be, Je.value, ve);
              if (Bt === null) {
                Be === null && (Be = Rt);
                break;
              }
              e && Be && Bt.alternate === null && t(re, Be), ee = p(Bt, ee, at), Oe === null ? xe = Bt : Oe.sibling = Bt, Oe = Bt, Be = Rt;
            }
            if (Je.done) return n(re, Be), xe;
            if (Be === null) {
              for (; !Je.done; at++, Je = ce.next()) (Je = De(re, Je.value, ve)) !== null && (ee = p(Je, ee, at), Oe === null ? xe = Je : Oe.sibling = Je, Oe = Je);
              return xe;
            }
            for (Be = r(re, Be); !Je.done; at++, Je = ce.next()) (Je = ot(Be, re, at, Je.value, ve)) !== null && (e && Je.alternate !== null && Be.delete(Je.key === null ? at : Je.key), ee = p(Je, ee, at), Oe === null ? xe = Je : Oe.sibling = Je, Oe = Je);
            return e && Be.forEach(function(wr) {
              return t(re, wr);
            }), xe;
          }
          return function(re, ee, ce, ve) {
            var xe = typeof ce == "object" && ce !== null && ce.type === kt && ce.key === null;
            xe && (ce = ce.props.children);
            var Oe = typeof ce == "object" && ce !== null;
            if (Oe) switch (ce.$$typeof) {
              case Ve:
                e: {
                  for (Oe = ce.key, xe = ee; xe !== null; ) {
                    if (xe.key === Oe) {
                      switch (xe.tag) {
                        case 7:
                          if (ce.type === kt) {
                            n(re, xe.sibling), (ee = i(xe, ce.props.children)).return = re, re = ee;
                            break e;
                          }
                          break;
                        default:
                          if (xe.elementType === ce.type) {
                            n(re, xe.sibling), (ee = i(xe, ce.props)).ref = li(re, xe, ce), ee.return = re, re = ee;
                            break e;
                          }
                      }
                      n(re, xe);
                      break;
                    }
                    t(re, xe), xe = xe.sibling;
                  }
                  ce.type === kt ? ((ee = Qr(ce.props.children, re.mode, ve, ce.key)).return = re, re = ee) : ((ve = ka(ce.type, ce.key, ce.props, null, re.mode, ve)).ref = li(re, ee, ce), ve.return = re, re = ve);
                }
                return v(re);
              case At:
                e: {
                  for (xe = ce.key; ee !== null; ) {
                    if (ee.key === xe) {
                      if (ee.tag === 4 && ee.stateNode.containerInfo === ce.containerInfo && ee.stateNode.implementation === ce.implementation) {
                        n(re, ee.sibling), (ee = i(ee, ce.children || [])).return = re, re = ee;
                        break e;
                      }
                      n(re, ee);
                      break;
                    }
                    t(re, ee), ee = ee.sibling;
                  }
                  (ee = vs(ce, re.mode, ve)).return = re, re = ee;
                }
                return v(re);
            }
            if (typeof ce == "string" || typeof ce == "number") return ce = "" + ce, ee !== null && ee.tag === 6 ? (n(re, ee.sibling), (ee = i(ee, ce)).return = re, re = ee) : (n(re, ee), (ee = ys(ce, re.mode, ve)).return = re, re = ee), v(re);
            if (Gi(ce)) return Fn(re, ee, ce, ve);
            if (en(ce)) return ln(re, ee, ce, ve);
            if (Oe && Xi(re, ce), ce === void 0 && !xe) switch (re.tag) {
              case 1:
              case 0:
                throw re = re.type, Error(m(152, re.displayName || re.name || "Component"));
            }
            return n(re, ee);
          };
        }
        var Fo = Zs(!0), Ha = Zs(!1), ui = {}, Zn = { current: ui }, ci = { current: ui }, fi = { current: ui };
        function uo(e) {
          if (e === ui) throw Error(m(174));
          return e;
        }
        function Va(e, t) {
          switch (St(fi, t), St(ci, e), St(Zn, ui), e = t.nodeType) {
            case 9:
            case 11:
              t = (t = t.documentElement) ? t.namespaceURI : Ce(null, "");
              break;
            default:
              t = Ce(t = (e = e === 8 ? t.parentNode : t).namespaceURI || null, e = e.tagName);
          }
          vt(Zn), St(Zn, t);
        }
        function Bo() {
          vt(Zn), vt(ci), vt(fi);
        }
        function el(e) {
          uo(fi.current);
          var t = uo(Zn.current), n = Ce(t, e.type);
          t !== n && (St(ci, e), St(Zn, n));
        }
        function $a(e) {
          ci.current === e && (vt(Zn), vt(ci));
        }
        var Ct = { current: 0 };
        function Ji(e) {
          for (var t = e; t !== null; ) {
            if (t.tag === 13) {
              var n = t.memoizedState;
              if (n !== null && ((n = n.dehydrated) === null || n.data === "$?" || n.data === "$!")) return t;
            } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
              if (64 & t.effectTag) return t;
            } else if (t.child !== null) {
              t.child.return = t, t = t.child;
              continue;
            }
            if (t === e) break;
            for (; t.sibling === null; ) {
              if (t.return === null || t.return === e) return null;
              t = t.return;
            }
            t.sibling.return = t.return, t = t.sibling;
          }
          return null;
        }
        function Ya(e, t) {
          return { responder: e, props: t };
        }
        var Zi = he.ReactCurrentDispatcher, Ln = he.ReactCurrentBatchConfig, $r = 0, Lt = null, sn = null, Jt = null, ea = !1;
        function En() {
          throw Error(m(321));
        }
        function qa(e, t) {
          if (t === null) return !1;
          for (var n = 0; n < t.length && n < e.length; n++) if (!mr(e[n], t[n])) return !1;
          return !0;
        }
        function Ka(e, t, n, r, i, p) {
          if ($r = p, Lt = t, t.memoizedState = null, t.updateQueue = null, t.expirationTime = 0, Zi.current = e === null || e.memoizedState === null ? Cu : Tu, e = n(r, i), t.expirationTime === $r) {
            p = 0;
            do {
              if (t.expirationTime = 0, !(25 > p)) throw Error(m(301));
              p += 1, Jt = sn = null, t.updateQueue = null, Zi.current = Ou, e = n(r, i);
            } while (t.expirationTime === $r);
          }
          if (Zi.current = ia, t = sn !== null && sn.next !== null, $r = 0, Jt = sn = Lt = null, ea = !1, t) throw Error(m(300));
          return e;
        }
        function Wo() {
          var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
          return Jt === null ? Lt.memoizedState = Jt = e : Jt = Jt.next = e, Jt;
        }
        function Ho() {
          if (sn === null) {
            var e = Lt.alternate;
            e = e !== null ? e.memoizedState : null;
          } else e = sn.next;
          var t = Jt === null ? Lt.memoizedState : Jt.next;
          if (t !== null) Jt = t, sn = e;
          else {
            if (e === null) throw Error(m(310));
            e = { memoizedState: (sn = e).memoizedState, baseState: sn.baseState, baseQueue: sn.baseQueue, queue: sn.queue, next: null }, Jt === null ? Lt.memoizedState = Jt = e : Jt = Jt.next = e;
          }
          return Jt;
        }
        function co(e, t) {
          return typeof t == "function" ? t(e) : t;
        }
        function ta(e) {
          var t = Ho(), n = t.queue;
          if (n === null) throw Error(m(311));
          n.lastRenderedReducer = e;
          var r = sn, i = r.baseQueue, p = n.pending;
          if (p !== null) {
            if (i !== null) {
              var v = i.next;
              i.next = p.next, p.next = v;
            }
            r.baseQueue = i = p, n.pending = null;
          }
          if (i !== null) {
            i = i.next, r = r.baseState;
            var x = v = p = null, X = i;
            do {
              var q = X.expirationTime;
              if (q < $r) {
                var ge = { expirationTime: X.expirationTime, suspenseConfig: X.suspenseConfig, action: X.action, eagerReducer: X.eagerReducer, eagerState: X.eagerState, next: null };
                x === null ? (v = x = ge, p = r) : x = x.next = ge, q > Lt.expirationTime && (Lt.expirationTime = q, va(q));
              } else x !== null && (x = x.next = { expirationTime: 1073741823, suspenseConfig: X.suspenseConfig, action: X.action, eagerReducer: X.eagerReducer, eagerState: X.eagerState, next: null }), Wl(q, X.suspenseConfig), r = X.eagerReducer === e ? X.eagerState : e(r, X.action);
              X = X.next;
            } while (X !== null && X !== i);
            x === null ? p = r : x.next = v, mr(r, t.memoizedState) || (er = !0), t.memoizedState = r, t.baseState = p, t.baseQueue = x, n.lastRenderedState = r;
          }
          return [t.memoizedState, n.dispatch];
        }
        function na(e) {
          var t = Ho(), n = t.queue;
          if (n === null) throw Error(m(311));
          n.lastRenderedReducer = e;
          var r = n.dispatch, i = n.pending, p = t.memoizedState;
          if (i !== null) {
            n.pending = null;
            var v = i = i.next;
            do
              p = e(p, v.action), v = v.next;
            while (v !== i);
            mr(p, t.memoizedState) || (er = !0), t.memoizedState = p, t.baseQueue === null && (t.baseState = p), n.lastRenderedState = p;
          }
          return [p, r];
        }
        function Qa(e) {
          var t = Wo();
          return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = (e = t.queue = { pending: null, dispatch: null, lastRenderedReducer: co, lastRenderedState: e }).dispatch = ll.bind(null, Lt, e), [t.memoizedState, e];
        }
        function Ga(e, t, n, r) {
          return e = { tag: e, create: t, destroy: n, deps: r, next: null }, (t = Lt.updateQueue) === null ? (t = { lastEffect: null }, Lt.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect) === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
        }
        function tl() {
          return Ho().memoizedState;
        }
        function Xa(e, t, n, r) {
          var i = Wo();
          Lt.effectTag |= e, i.memoizedState = Ga(1 | t, n, void 0, r === void 0 ? null : r);
        }
        function Ja(e, t, n, r) {
          var i = Ho();
          r = r === void 0 ? null : r;
          var p = void 0;
          if (sn !== null) {
            var v = sn.memoizedState;
            if (p = v.destroy, r !== null && qa(r, v.deps)) return void Ga(t, n, p, r);
          }
          Lt.effectTag |= e, i.memoizedState = Ga(1 | t, n, p, r);
        }
        function nl(e, t) {
          return Xa(516, 4, e, t);
        }
        function ra(e, t) {
          return Ja(516, 4, e, t);
        }
        function rl(e, t) {
          return Ja(4, 2, e, t);
        }
        function ol(e, t) {
          return typeof t == "function" ? (e = e(), t(e), function() {
            t(null);
          }) : t != null ? (e = e(), t.current = e, function() {
            t.current = null;
          }) : void 0;
        }
        function il(e, t, n) {
          return n = n != null ? n.concat([e]) : null, Ja(4, 2, ol.bind(null, t, e), n);
        }
        function Za() {
        }
        function al(e, t) {
          return Wo().memoizedState = [e, t === void 0 ? null : t], e;
        }
        function oa(e, t) {
          var n = Ho();
          t = t === void 0 ? null : t;
          var r = n.memoizedState;
          return r !== null && t !== null && qa(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
        }
        function sl(e, t) {
          var n = Ho();
          t = t === void 0 ? null : t;
          var r = n.memoizedState;
          return r !== null && t !== null && qa(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
        }
        function es(e, t, n) {
          var r = Hi();
          Br(98 > r ? 98 : r, function() {
            e(!0);
          }), Br(97 < r ? 97 : r, function() {
            var i = Ln.suspense;
            Ln.suspense = t === void 0 ? null : t;
            try {
              e(!1), n();
            } finally {
              Ln.suspense = i;
            }
          });
        }
        function ll(e, t, n) {
          var r = tr(), i = si.suspense;
          i = { expirationTime: r = mo(r, e, i), suspenseConfig: i, action: n, eagerReducer: null, eagerState: null, next: null };
          var p = t.pending;
          if (p === null ? i.next = i : (i.next = p.next, p.next = i), t.pending = i, p = e.alternate, e === Lt || p !== null && p === Lt) ea = !0, i.expirationTime = $r, Lt.expirationTime = $r;
          else {
            if (e.expirationTime === 0 && (p === null || p.expirationTime === 0) && (p = t.lastRenderedReducer) !== null) try {
              var v = t.lastRenderedState, x = p(v, n);
              if (i.eagerReducer = p, i.eagerState = x, mr(x, v)) return;
            } catch {
            }
            Kr(e, r);
          }
        }
        var ia = { readContext: zn, useCallback: En, useContext: En, useEffect: En, useImperativeHandle: En, useLayoutEffect: En, useMemo: En, useReducer: En, useRef: En, useState: En, useDebugValue: En, useResponder: En, useDeferredValue: En, useTransition: En }, Cu = { readContext: zn, useCallback: al, useContext: zn, useEffect: nl, useImperativeHandle: function(e, t, n) {
          return n = n != null ? n.concat([e]) : null, Xa(4, 2, ol.bind(null, t, e), n);
        }, useLayoutEffect: function(e, t) {
          return Xa(4, 2, e, t);
        }, useMemo: function(e, t) {
          var n = Wo();
          return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
        }, useReducer: function(e, t, n) {
          var r = Wo();
          return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = (e = r.queue = { pending: null, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }).dispatch = ll.bind(null, Lt, e), [r.memoizedState, e];
        }, useRef: function(e) {
          return e = { current: e }, Wo().memoizedState = e;
        }, useState: Qa, useDebugValue: Za, useResponder: Ya, useDeferredValue: function(e, t) {
          var n = Qa(e), r = n[0], i = n[1];
          return nl(function() {
            var p = Ln.suspense;
            Ln.suspense = t === void 0 ? null : t;
            try {
              i(e);
            } finally {
              Ln.suspense = p;
            }
          }, [e, t]), r;
        }, useTransition: function(e) {
          var t = Qa(!1), n = t[0];
          return t = t[1], [al(es.bind(null, t, e), [t, e]), n];
        } }, Tu = { readContext: zn, useCallback: oa, useContext: zn, useEffect: ra, useImperativeHandle: il, useLayoutEffect: rl, useMemo: sl, useReducer: ta, useRef: tl, useState: function() {
          return ta(co);
        }, useDebugValue: Za, useResponder: Ya, useDeferredValue: function(e, t) {
          var n = ta(co), r = n[0], i = n[1];
          return ra(function() {
            var p = Ln.suspense;
            Ln.suspense = t === void 0 ? null : t;
            try {
              i(e);
            } finally {
              Ln.suspense = p;
            }
          }, [e, t]), r;
        }, useTransition: function(e) {
          var t = ta(co), n = t[0];
          return t = t[1], [oa(es.bind(null, t, e), [t, e]), n];
        } }, Ou = { readContext: zn, useCallback: oa, useContext: zn, useEffect: ra, useImperativeHandle: il, useLayoutEffect: rl, useMemo: sl, useReducer: na, useRef: tl, useState: function() {
          return na(co);
        }, useDebugValue: Za, useResponder: Ya, useDeferredValue: function(e, t) {
          var n = na(co), r = n[0], i = n[1];
          return ra(function() {
            var p = Ln.suspense;
            Ln.suspense = t === void 0 ? null : t;
            try {
              i(e);
            } finally {
              Ln.suspense = p;
            }
          }, [e, t]), r;
        }, useTransition: function(e) {
          var t = na(co), n = t[0];
          return t = t[1], [oa(es.bind(null, t, e), [t, e]), n];
        } }, yr = null, Yr = null, fo = !1;
        function ul(e, t) {
          var n = nr(5, null, null, 0);
          n.elementType = "DELETED", n.type = "DELETED", n.stateNode = t, n.return = e, n.effectTag = 8, e.lastEffect !== null ? (e.lastEffect.nextEffect = n, e.lastEffect = n) : e.firstEffect = e.lastEffect = n;
        }
        function cl(e, t) {
          switch (e.tag) {
            case 5:
              var n = e.type;
              return (t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t) !== null && (e.stateNode = t, !0);
            case 6:
              return (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t) !== null && (e.stateNode = t, !0);
            case 13:
            default:
              return !1;
          }
        }
        function ts(e) {
          if (fo) {
            var t = Yr;
            if (t) {
              var n = t;
              if (!cl(e, t)) {
                if (!(t = Mr(n.nextSibling)) || !cl(e, t)) return e.effectTag = -1025 & e.effectTag | 2, fo = !1, void (yr = e);
                ul(yr, n);
              }
              yr = e, Yr = Mr(t.firstChild);
            } else e.effectTag = -1025 & e.effectTag | 2, fo = !1, yr = e;
          }
        }
        function fl(e) {
          for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
          yr = e;
        }
        function aa(e) {
          if (e !== yr) return !1;
          if (!fo) return fl(e), fo = !0, !1;
          var t = e.type;
          if (e.tag !== 5 || t !== "head" && t !== "body" && !ei(t, e.memoizedProps)) for (t = Yr; t; ) ul(e, t), t = Mr(t.nextSibling);
          if (fl(e), e.tag === 13) {
            if (!(e = (e = e.memoizedState) !== null ? e.dehydrated : null)) throw Error(m(317));
            e: {
              for (e = e.nextSibling, t = 0; e; ) {
                if (e.nodeType === 8) {
                  var n = e.data;
                  if (n === "/$") {
                    if (t === 0) {
                      Yr = Mr(e.nextSibling);
                      break e;
                    }
                    t--;
                  } else n !== "$" && n !== "$!" && n !== "$?" || t++;
                }
                e = e.nextSibling;
              }
              Yr = null;
            }
          } else Yr = yr ? Mr(e.stateNode.nextSibling) : null;
          return !0;
        }
        function ns() {
          Yr = yr = null, fo = !1;
        }
        var Pu = he.ReactCurrentOwner, er = !1;
        function Un(e, t, n, r) {
          t.child = e === null ? Ha(t, null, n, r) : Fo(t, e.child, n, r);
        }
        function dl(e, t, n, r, i) {
          n = n.render;
          var p = t.ref;
          return Uo(t, i), r = Ka(e, t, n, r, p, i), e === null || er ? (t.effectTag |= 1, Un(e, t, r, i), t.child) : (t.updateQueue = e.updateQueue, t.effectTag &= -517, e.expirationTime <= i && (e.expirationTime = 0), vr(e, t, i));
        }
        function pl(e, t, n, r, i, p) {
          if (e === null) {
            var v = n.type;
            return typeof v != "function" || bs(v) || v.defaultProps !== void 0 || n.compare !== null || n.defaultProps !== void 0 ? ((e = ka(n.type, null, r, null, t.mode, p)).ref = t.ref, e.return = t, t.child = e) : (t.tag = 15, t.type = v, hl(e, t, v, r, i, p));
          }
          return v = e.child, i < p && (i = v.memoizedProps, (n = (n = n.compare) !== null ? n : gr)(i, r) && e.ref === t.ref) ? vr(e, t, p) : (t.effectTag |= 1, (e = vo(v, r)).ref = t.ref, e.return = t, t.child = e);
        }
        function hl(e, t, n, r, i, p) {
          return e !== null && gr(e.memoizedProps, r) && e.ref === t.ref && (er = !1, i < p) ? (t.expirationTime = e.expirationTime, vr(e, t, p)) : rs(e, t, n, r, p);
        }
        function ml(e, t) {
          var n = t.ref;
          (e === null && n !== null || e !== null && e.ref !== n) && (t.effectTag |= 128);
        }
        function rs(e, t, n, r, i) {
          var p = hn(n) ? lo : Xt.current;
          return p = zo(t, p), Uo(t, i), n = Ka(e, t, n, r, p, i), e === null || er ? (t.effectTag |= 1, Un(e, t, n, i), t.child) : (t.updateQueue = e.updateQueue, t.effectTag &= -517, e.expirationTime <= i && (e.expirationTime = 0), vr(e, t, i));
        }
        function gl(e, t, n, r, i) {
          if (hn(n)) {
            var p = !0;
            Fi(t);
          } else p = !1;
          if (Uo(t, i), t.stateNode === null) e !== null && (e.alternate = null, t.alternate = null, t.effectTag |= 2), Xs(t, n, r), Wa(t, n, r, i), r = !0;
          else if (e === null) {
            var v = t.stateNode, x = t.memoizedProps;
            v.props = x;
            var X = v.context, q = n.contextType;
            typeof q == "object" && q !== null ? q = zn(q) : q = zo(t, q = hn(n) ? lo : Xt.current);
            var ge = n.getDerivedStateFromProps, De = typeof ge == "function" || typeof v.getSnapshotBeforeUpdate == "function";
            De || typeof v.UNSAFE_componentWillReceiveProps != "function" && typeof v.componentWillReceiveProps != "function" || (x !== r || X !== q) && Js(t, v, r, q), Wr = !1;
            var He = t.memoizedState;
            v.state = He, ai(t, r, v, i), X = t.memoizedState, x !== r || He !== X || pn.current || Wr ? (typeof ge == "function" && (Ki(t, n, ge, r), X = t.memoizedState), (x = Wr || Gs(t, n, x, r, He, X, q)) ? (De || typeof v.UNSAFE_componentWillMount != "function" && typeof v.componentWillMount != "function" || (typeof v.componentWillMount == "function" && v.componentWillMount(), typeof v.UNSAFE_componentWillMount == "function" && v.UNSAFE_componentWillMount()), typeof v.componentDidMount == "function" && (t.effectTag |= 4)) : (typeof v.componentDidMount == "function" && (t.effectTag |= 4), t.memoizedProps = r, t.memoizedState = X), v.props = r, v.state = X, v.context = q, r = x) : (typeof v.componentDidMount == "function" && (t.effectTag |= 4), r = !1);
          } else v = t.stateNode, Ba(e, t), x = t.memoizedProps, v.props = t.type === t.elementType ? x : Vn(t.type, x), X = v.context, typeof (q = n.contextType) == "object" && q !== null ? q = zn(q) : q = zo(t, q = hn(n) ? lo : Xt.current), (De = typeof (ge = n.getDerivedStateFromProps) == "function" || typeof v.getSnapshotBeforeUpdate == "function") || typeof v.UNSAFE_componentWillReceiveProps != "function" && typeof v.componentWillReceiveProps != "function" || (x !== r || X !== q) && Js(t, v, r, q), Wr = !1, X = t.memoizedState, v.state = X, ai(t, r, v, i), He = t.memoizedState, x !== r || X !== He || pn.current || Wr ? (typeof ge == "function" && (Ki(t, n, ge, r), He = t.memoizedState), (ge = Wr || Gs(t, n, x, r, X, He, q)) ? (De || typeof v.UNSAFE_componentWillUpdate != "function" && typeof v.componentWillUpdate != "function" || (typeof v.componentWillUpdate == "function" && v.componentWillUpdate(r, He, q), typeof v.UNSAFE_componentWillUpdate == "function" && v.UNSAFE_componentWillUpdate(r, He, q)), typeof v.componentDidUpdate == "function" && (t.effectTag |= 4), typeof v.getSnapshotBeforeUpdate == "function" && (t.effectTag |= 256)) : (typeof v.componentDidUpdate != "function" || x === e.memoizedProps && X === e.memoizedState || (t.effectTag |= 4), typeof v.getSnapshotBeforeUpdate != "function" || x === e.memoizedProps && X === e.memoizedState || (t.effectTag |= 256), t.memoizedProps = r, t.memoizedState = He), v.props = r, v.state = He, v.context = q, r = ge) : (typeof v.componentDidUpdate != "function" || x === e.memoizedProps && X === e.memoizedState || (t.effectTag |= 4), typeof v.getSnapshotBeforeUpdate != "function" || x === e.memoizedProps && X === e.memoizedState || (t.effectTag |= 256), r = !1);
          return os(e, t, n, r, p, i);
        }
        function os(e, t, n, r, i, p) {
          ml(e, t);
          var v = (64 & t.effectTag) != 0;
          if (!r && !v) return i && As(t, n, !1), vr(e, t, p);
          r = t.stateNode, Pu.current = t;
          var x = v && typeof n.getDerivedStateFromError != "function" ? null : r.render();
          return t.effectTag |= 1, e !== null && v ? (t.child = Fo(t, e.child, null, p), t.child = Fo(t, null, x, p)) : Un(e, t, x, p), t.memoizedState = r.state, i && As(t, n, !0), t.child;
        }
        function bl(e) {
          var t = e.stateNode;
          t.pendingContext ? Ds(0, t.pendingContext, t.pendingContext !== t.context) : t.context && Ds(0, t.context, !1), Va(e, t.containerInfo);
        }
        var yl, vl, kl, is = { dehydrated: null, retryTime: 0 };
        function wl(e, t, n) {
          var r, i = t.mode, p = t.pendingProps, v = Ct.current, x = !1;
          if ((r = (64 & t.effectTag) != 0) || (r = (2 & v) != 0 && (e === null || e.memoizedState !== null)), r ? (x = !0, t.effectTag &= -65) : e !== null && e.memoizedState === null || p.fallback === void 0 || p.unstable_avoidThisFallback === !0 || (v |= 1), St(Ct, 1 & v), e === null) {
            if (p.fallback !== void 0 && ts(t), x) {
              if (x = p.fallback, (p = Qr(null, i, 0, null)).return = t, (2 & t.mode) == 0) for (e = t.memoizedState !== null ? t.child.child : t.child, p.child = e; e !== null; ) e.return = p, e = e.sibling;
              return (n = Qr(x, i, n, null)).return = t, p.sibling = n, t.memoizedState = is, t.child = p, n;
            }
            return i = p.children, t.memoizedState = null, t.child = Ha(t, null, i, n);
          }
          if (e.memoizedState !== null) {
            if (i = (e = e.child).sibling, x) {
              if (p = p.fallback, (n = vo(e, e.pendingProps)).return = t, (2 & t.mode) == 0 && (x = t.memoizedState !== null ? t.child.child : t.child) !== e.child) for (n.child = x; x !== null; ) x.return = n, x = x.sibling;
              return (i = vo(i, p)).return = t, n.sibling = i, n.childExpirationTime = 0, t.memoizedState = is, t.child = n, i;
            }
            return n = Fo(t, e.child, p.children, n), t.memoizedState = null, t.child = n;
          }
          if (e = e.child, x) {
            if (x = p.fallback, (p = Qr(null, i, 0, null)).return = t, p.child = e, e !== null && (e.return = p), (2 & t.mode) == 0) for (e = t.memoizedState !== null ? t.child.child : t.child, p.child = e; e !== null; ) e.return = p, e = e.sibling;
            return (n = Qr(x, i, n, null)).return = t, p.sibling = n, n.effectTag |= 2, p.childExpirationTime = 0, t.memoizedState = is, t.child = p, n;
          }
          return t.memoizedState = null, t.child = Fo(t, e, p.children, n);
        }
        function El(e, t) {
          e.expirationTime < t && (e.expirationTime = t);
          var n = e.alternate;
          n !== null && n.expirationTime < t && (n.expirationTime = t), Ys(e.return, t);
        }
        function as(e, t, n, r, i, p) {
          var v = e.memoizedState;
          v === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailExpiration: 0, tailMode: i, lastEffect: p } : (v.isBackwards = t, v.rendering = null, v.renderingStartTime = 0, v.last = r, v.tail = n, v.tailExpiration = 0, v.tailMode = i, v.lastEffect = p);
        }
        function _l(e, t, n) {
          var r = t.pendingProps, i = r.revealOrder, p = r.tail;
          if (Un(e, t, r.children, n), (2 & (r = Ct.current)) != 0) r = 1 & r | 2, t.effectTag |= 64;
          else {
            if (e !== null && 64 & e.effectTag) e: for (e = t.child; e !== null; ) {
              if (e.tag === 13) e.memoizedState !== null && El(e, n);
              else if (e.tag === 19) El(e, n);
              else if (e.child !== null) {
                e.child.return = e, e = e.child;
                continue;
              }
              if (e === t) break e;
              for (; e.sibling === null; ) {
                if (e.return === null || e.return === t) break e;
                e = e.return;
              }
              e.sibling.return = e.return, e = e.sibling;
            }
            r &= 1;
          }
          if (St(Ct, r), (2 & t.mode) == 0) t.memoizedState = null;
          else switch (i) {
            case "forwards":
              for (n = t.child, i = null; n !== null; ) (e = n.alternate) !== null && Ji(e) === null && (i = n), n = n.sibling;
              (n = i) === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), as(t, !1, i, n, p, t.lastEffect);
              break;
            case "backwards":
              for (n = null, i = t.child, t.child = null; i !== null; ) {
                if ((e = i.alternate) !== null && Ji(e) === null) {
                  t.child = i;
                  break;
                }
                e = i.sibling, i.sibling = n, n = i, i = e;
              }
              as(t, !0, n, null, p, t.lastEffect);
              break;
            case "together":
              as(t, !1, null, null, void 0, t.lastEffect);
              break;
            default:
              t.memoizedState = null;
          }
          return t.child;
        }
        function vr(e, t, n) {
          e !== null && (t.dependencies = e.dependencies);
          var r = t.expirationTime;
          if (r !== 0 && va(r), t.childExpirationTime < n) return null;
          if (e !== null && t.child !== e.child) throw Error(m(153));
          if (t.child !== null) {
            for (n = vo(e = t.child, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, (n = n.sibling = vo(e, e.pendingProps)).return = t;
            n.sibling = null;
          }
          return t.child;
        }
        function sa(e, t) {
          switch (e.tailMode) {
            case "hidden":
              t = e.tail;
              for (var n = null; t !== null; ) t.alternate !== null && (n = t), t = t.sibling;
              n === null ? e.tail = null : n.sibling = null;
              break;
            case "collapsed":
              n = e.tail;
              for (var r = null; n !== null; ) n.alternate !== null && (r = n), n = n.sibling;
              r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
          }
        }
        function Nu(e, t, n) {
          var r = t.pendingProps;
          switch (t.tag) {
            case 2:
            case 16:
            case 15:
            case 0:
            case 11:
            case 7:
            case 8:
            case 12:
            case 9:
            case 14:
              return null;
            case 1:
              return hn(t.type) && Ui(), null;
            case 3:
              return Bo(), vt(pn), vt(Xt), (n = t.stateNode).pendingContext && (n.context = n.pendingContext, n.pendingContext = null), e !== null && e.child !== null || !aa(t) || (t.effectTag |= 4), null;
            case 5:
              $a(t), n = uo(fi.current);
              var i = t.type;
              if (e !== null && t.stateNode != null) vl(e, t, i, r, n), e.ref !== t.ref && (t.effectTag |= 128);
              else {
                if (!r) {
                  if (t.stateNode === null) throw Error(m(166));
                  return null;
                }
                if (e = uo(Zn.current), aa(t)) {
                  r = t.stateNode, i = t.type;
                  var p = t.memoizedProps;
                  switch (r[Kn] = t, r[no] = p, i) {
                    case "iframe":
                    case "object":
                    case "embed":
                      mt("load", r);
                      break;
                    case "video":
                    case "audio":
                      for (e = 0; e < ut.length; e++) mt(ut[e], r);
                      break;
                    case "source":
                      mt("error", r);
                      break;
                    case "img":
                    case "image":
                    case "link":
                      mt("error", r), mt("load", r);
                      break;
                    case "form":
                      mt("reset", r), mt("submit", r);
                      break;
                    case "details":
                      mt("toggle", r);
                      break;
                    case "input":
                      bn(r, p), mt("invalid", r), Wn(n, "onChange");
                      break;
                    case "select":
                      r._wrapperState = { wasMultiple: !!p.multiple }, mt("invalid", r), Wn(n, "onChange");
                      break;
                    case "textarea":
                      On(r, p), mt("invalid", r), Wn(n, "onChange");
                  }
                  for (var v in Ko(i, p), e = null, p) if (p.hasOwnProperty(v)) {
                    var x = p[v];
                    v === "children" ? typeof x == "string" ? r.textContent !== x && (e = ["children", x]) : typeof x == "number" && r.textContent !== "" + x && (e = ["children", "" + x]) : A.hasOwnProperty(v) && x != null && Wn(n, v);
                  }
                  switch (i) {
                    case "input":
                      Sr(r), ar(r, p, !0);
                      break;
                    case "textarea":
                      Sr(r), Xr(r);
                      break;
                    case "select":
                    case "option":
                      break;
                    default:
                      typeof p.onClick == "function" && (r.onclick = Oo);
                  }
                  n = e, t.updateQueue = n, n !== null && (t.effectTag |= 4);
                } else {
                  switch (v = n.nodeType === 9 ? n : n.ownerDocument, e === Ci && (e = we(i)), e === Ci ? i === "script" ? ((e = v.createElement("div")).innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = v.createElement(i, { is: r.is }) : (e = v.createElement(i), i === "select" && (v = e, r.multiple ? v.multiple = !0 : r.size && (v.size = r.size))) : e = v.createElementNS(e, i), e[Kn] = t, e[no] = r, yl(e, t), t.stateNode = e, v = Qo(i, r), i) {
                    case "iframe":
                    case "object":
                    case "embed":
                      mt("load", e), x = r;
                      break;
                    case "video":
                    case "audio":
                      for (x = 0; x < ut.length; x++) mt(ut[x], e);
                      x = r;
                      break;
                    case "source":
                      mt("error", e), x = r;
                      break;
                    case "img":
                    case "image":
                    case "link":
                      mt("error", e), mt("load", e), x = r;
                      break;
                    case "form":
                      mt("reset", e), mt("submit", e), x = r;
                      break;
                    case "details":
                      mt("toggle", e), x = r;
                      break;
                    case "input":
                      bn(e, r), x = Cr(e, r), mt("invalid", e), Wn(n, "onChange");
                      break;
                    case "option":
                      x = sr(e, r);
                      break;
                    case "select":
                      e._wrapperState = { wasMultiple: !!r.multiple }, x = o({}, r, { value: void 0 }), mt("invalid", e), Wn(n, "onChange");
                      break;
                    case "textarea":
                      On(e, r), x = lr(e, r), mt("invalid", e), Wn(n, "onChange");
                      break;
                    default:
                      x = r;
                  }
                  Ko(i, x);
                  var X = x;
                  for (p in X) if (X.hasOwnProperty(p)) {
                    var q = X[p];
                    p === "style" ? xi(e, q) : p === "dangerouslySetInnerHTML" ? (q = q ? q.__html : void 0) != null && qe(e, q) : p === "children" ? typeof q == "string" ? (i !== "textarea" || q !== "") && st(e, q) : typeof q == "number" && st(e, "" + q) : p !== "suppressContentEditableWarning" && p !== "suppressHydrationWarning" && p !== "autoFocus" && (A.hasOwnProperty(p) ? q != null && Wn(n, p) : q != null && je(e, p, q, v));
                  }
                  switch (i) {
                    case "input":
                      Sr(e), ar(e, r, !1);
                      break;
                    case "textarea":
                      Sr(e), Xr(e);
                      break;
                    case "option":
                      r.value != null && e.setAttribute("value", "" + qt(r.value));
                      break;
                    case "select":
                      e.multiple = !!r.multiple, (n = r.value) != null ? Tn(e, !!r.multiple, n, !1) : r.defaultValue != null && Tn(e, !!r.multiple, r.defaultValue, !0);
                      break;
                    default:
                      typeof x.onClick == "function" && (e.onclick = Oo);
                  }
                  Ni(i, r) && (t.effectTag |= 4);
                }
                t.ref !== null && (t.effectTag |= 128);
              }
              return null;
            case 6:
              if (e && t.stateNode != null) kl(0, t, e.memoizedProps, r);
              else {
                if (typeof r != "string" && t.stateNode === null) throw Error(m(166));
                n = uo(fi.current), uo(Zn.current), aa(t) ? (n = t.stateNode, r = t.memoizedProps, n[Kn] = t, n.nodeValue !== r && (t.effectTag |= 4)) : ((n = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r))[Kn] = t, t.stateNode = n);
              }
              return null;
            case 13:
              return vt(Ct), r = t.memoizedState, 64 & t.effectTag ? (t.expirationTime = n, t) : (n = r !== null, r = !1, e === null ? t.memoizedProps.fallback !== void 0 && aa(t) : (r = (i = e.memoizedState) !== null, n || i === null || (i = e.child.sibling) !== null && ((p = t.firstEffect) !== null ? (t.firstEffect = i, i.nextEffect = p) : (t.firstEffect = t.lastEffect = i, i.nextEffect = null), i.effectTag = 8)), n && !r && 2 & t.mode && (e === null && t.memoizedProps.unstable_avoidThisFallback !== !0 || 1 & Ct.current ? Ft === po && (Ft = ua) : (Ft !== po && Ft !== ua || (Ft = ca), pi !== 0 && _n !== null && (ko(_n, mn), ql(_n, pi)))), (n || r) && (t.effectTag |= 4), null);
            case 4:
              return Bo(), null;
            case 10:
              return Ua(t), null;
            case 17:
              return hn(t.type) && Ui(), null;
            case 19:
              if (vt(Ct), (r = t.memoizedState) === null) return null;
              if (i = (64 & t.effectTag) != 0, (p = r.rendering) === null) {
                if (i) sa(r, !1);
                else if (Ft !== po || e !== null && 64 & e.effectTag) for (p = t.child; p !== null; ) {
                  if ((e = Ji(p)) !== null) {
                    for (t.effectTag |= 64, sa(r, !1), (i = e.updateQueue) !== null && (t.updateQueue = i, t.effectTag |= 4), r.lastEffect === null && (t.firstEffect = null), t.lastEffect = r.lastEffect, r = t.child; r !== null; ) p = n, (i = r).effectTag &= 2, i.nextEffect = null, i.firstEffect = null, i.lastEffect = null, (e = i.alternate) === null ? (i.childExpirationTime = 0, i.expirationTime = p, i.child = null, i.memoizedProps = null, i.memoizedState = null, i.updateQueue = null, i.dependencies = null) : (i.childExpirationTime = e.childExpirationTime, i.expirationTime = e.expirationTime, i.child = e.child, i.memoizedProps = e.memoizedProps, i.memoizedState = e.memoizedState, i.updateQueue = e.updateQueue, p = e.dependencies, i.dependencies = p === null ? null : { expirationTime: p.expirationTime, firstContext: p.firstContext, responders: p.responders }), r = r.sibling;
                    return St(Ct, 1 & Ct.current | 2), t.child;
                  }
                  p = p.sibling;
                }
              } else {
                if (!i) if ((e = Ji(p)) !== null) {
                  if (t.effectTag |= 64, i = !0, (n = e.updateQueue) !== null && (t.updateQueue = n, t.effectTag |= 4), sa(r, !0), r.tail === null && r.tailMode === "hidden" && !p.alternate) return (t = t.lastEffect = r.lastEffect) !== null && (t.nextEffect = null), null;
                } else 2 * jn() - r.renderingStartTime > r.tailExpiration && 1 < n && (t.effectTag |= 64, i = !0, sa(r, !1), t.expirationTime = t.childExpirationTime = n - 1);
                r.isBackwards ? (p.sibling = t.child, t.child = p) : ((n = r.last) !== null ? n.sibling = p : t.child = p, r.last = p);
              }
              return r.tail !== null ? (r.tailExpiration === 0 && (r.tailExpiration = jn() + 500), n = r.tail, r.rendering = n, r.tail = n.sibling, r.lastEffect = t.lastEffect, r.renderingStartTime = jn(), n.sibling = null, t = Ct.current, St(Ct, i ? 1 & t | 2 : 1 & t), n) : null;
          }
          throw Error(m(156, t.tag));
        }
        function Du(e) {
          switch (e.tag) {
            case 1:
              hn(e.type) && Ui();
              var t = e.effectTag;
              return 4096 & t ? (e.effectTag = -4097 & t | 64, e) : null;
            case 3:
              if (Bo(), vt(pn), vt(Xt), (64 & (t = e.effectTag)) != 0) throw Error(m(285));
              return e.effectTag = -4097 & t | 64, e;
            case 5:
              return $a(e), null;
            case 13:
              return vt(Ct), 4096 & (t = e.effectTag) ? (e.effectTag = -4097 & t | 64, e) : null;
            case 19:
              return vt(Ct), null;
            case 4:
              return Bo(), null;
            case 10:
              return Ua(e), null;
            default:
              return null;
          }
        }
        function ss(e, t) {
          return { value: e, source: t, stack: xr(t) };
        }
        yl = function(e, t) {
          for (var n = t.child; n !== null; ) {
            if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
            else if (n.tag !== 4 && n.child !== null) {
              n.child.return = n, n = n.child;
              continue;
            }
            if (n === t) break;
            for (; n.sibling === null; ) {
              if (n.return === null || n.return === t) return;
              n = n.return;
            }
            n.sibling.return = n.return, n = n.sibling;
          }
        }, vl = function(e, t, n, r, i) {
          var p = e.memoizedProps;
          if (p !== r) {
            var v, x, X = t.stateNode;
            switch (uo(Zn.current), e = null, n) {
              case "input":
                p = Cr(X, p), r = Cr(X, r), e = [];
                break;
              case "option":
                p = sr(X, p), r = sr(X, r), e = [];
                break;
              case "select":
                p = o({}, p, { value: void 0 }), r = o({}, r, { value: void 0 }), e = [];
                break;
              case "textarea":
                p = lr(X, p), r = lr(X, r), e = [];
                break;
              default:
                typeof p.onClick != "function" && typeof r.onClick == "function" && (X.onclick = Oo);
            }
            for (v in Ko(n, r), n = null, p) if (!r.hasOwnProperty(v) && p.hasOwnProperty(v) && p[v] != null) if (v === "style") for (x in X = p[v]) X.hasOwnProperty(x) && (n || (n = {}), n[x] = "");
            else v !== "dangerouslySetInnerHTML" && v !== "children" && v !== "suppressContentEditableWarning" && v !== "suppressHydrationWarning" && v !== "autoFocus" && (A.hasOwnProperty(v) ? e || (e = []) : (e = e || []).push(v, null));
            for (v in r) {
              var q = r[v];
              if (X = p != null ? p[v] : void 0, r.hasOwnProperty(v) && q !== X && (q != null || X != null)) if (v === "style") if (X) {
                for (x in X) !X.hasOwnProperty(x) || q && q.hasOwnProperty(x) || (n || (n = {}), n[x] = "");
                for (x in q) q.hasOwnProperty(x) && X[x] !== q[x] && (n || (n = {}), n[x] = q[x]);
              } else n || (e || (e = []), e.push(v, n)), n = q;
              else v === "dangerouslySetInnerHTML" ? (q = q ? q.__html : void 0, X = X ? X.__html : void 0, q != null && X !== q && (e = e || []).push(v, q)) : v === "children" ? X === q || typeof q != "string" && typeof q != "number" || (e = e || []).push(v, "" + q) : v !== "suppressContentEditableWarning" && v !== "suppressHydrationWarning" && (A.hasOwnProperty(v) ? (q != null && Wn(i, v), e || X === q || (e = [])) : (e = e || []).push(v, q));
            }
            n && (e = e || []).push("style", n), i = e, (t.updateQueue = i) && (t.effectTag |= 4);
          }
        }, kl = function(e, t, n, r) {
          n !== r && (t.effectTag |= 4);
        };
        var Ru = typeof WeakSet == "function" ? WeakSet : Set;
        function ls(e, t) {
          var n = t.source, r = t.stack;
          r === null && n !== null && (r = xr(n)), n !== null && Yt(n.type), t = t.value, e !== null && e.tag === 1 && Yt(e.type);
          try {
            console.error(t);
          } catch (i) {
            setTimeout(function() {
              throw i;
            });
          }
        }
        function xl(e) {
          var t = e.ref;
          if (t !== null) if (typeof t == "function") try {
            t(null);
          } catch (n) {
            yo(e, n);
          }
          else t.current = null;
        }
        function Au(e, t) {
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
            case 22:
              return;
            case 1:
              if (256 & t.effectTag && e !== null) {
                var n = e.memoizedProps, r = e.memoizedState;
                t = (e = t.stateNode).getSnapshotBeforeUpdate(t.elementType === t.type ? n : Vn(t.type, n), r), e.__reactInternalSnapshotBeforeUpdate = t;
              }
              return;
            case 3:
            case 5:
            case 6:
            case 4:
            case 17:
              return;
          }
          throw Error(m(163));
        }
        function Sl(e, t) {
          if ((t = (t = t.updateQueue) !== null ? t.lastEffect : null) !== null) {
            var n = t = t.next;
            do {
              if ((n.tag & e) === e) {
                var r = n.destroy;
                n.destroy = void 0, r !== void 0 && r();
              }
              n = n.next;
            } while (n !== t);
          }
        }
        function Cl(e, t) {
          if ((t = (t = t.updateQueue) !== null ? t.lastEffect : null) !== null) {
            var n = t = t.next;
            do {
              if ((n.tag & e) === e) {
                var r = n.create;
                n.destroy = r();
              }
              n = n.next;
            } while (n !== t);
          }
        }
        function Mu(e, t, n) {
          switch (n.tag) {
            case 0:
            case 11:
            case 15:
            case 22:
              return void Cl(3, n);
            case 1:
              if (e = n.stateNode, 4 & n.effectTag) if (t === null) e.componentDidMount();
              else {
                var r = n.elementType === n.type ? t.memoizedProps : Vn(n.type, t.memoizedProps);
                e.componentDidUpdate(r, t.memoizedState, e.__reactInternalSnapshotBeforeUpdate);
              }
              return void ((t = n.updateQueue) !== null && Ks(n, t, e));
            case 3:
              if ((t = n.updateQueue) !== null) {
                if (e = null, n.child !== null) switch (n.child.tag) {
                  case 5:
                    e = n.child.stateNode;
                    break;
                  case 1:
                    e = n.child.stateNode;
                }
                Ks(n, t, e);
              }
              return;
            case 5:
              return e = n.stateNode, void (t === null && 4 & n.effectTag && Ni(n.type, n.memoizedProps) && e.focus());
            case 6:
            case 4:
            case 12:
              return;
            case 13:
              return void (n.memoizedState === null && (n = n.alternate, n !== null && (n = n.memoizedState, n !== null && (n = n.dehydrated, n !== null && pr(n)))));
            case 19:
            case 17:
            case 20:
            case 21:
              return;
          }
          throw Error(m(163));
        }
        function Tl(e, t, n) {
          switch (typeof gs == "function" && gs(t), t.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
            case 22:
              if ((e = t.updateQueue) !== null && (e = e.lastEffect) !== null) {
                var r = e.next;
                Br(97 < n ? 97 : n, function() {
                  var i = r;
                  do {
                    var p = i.destroy;
                    if (p !== void 0) {
                      var v = t;
                      try {
                        p();
                      } catch (x) {
                        yo(v, x);
                      }
                    }
                    i = i.next;
                  } while (i !== r);
                });
              }
              break;
            case 1:
              xl(t), typeof (n = t.stateNode).componentWillUnmount == "function" && function(i, p) {
                try {
                  p.props = i.memoizedProps, p.state = i.memoizedState, p.componentWillUnmount();
                } catch (v) {
                  yo(i, v);
                }
              }(t, n);
              break;
            case 5:
              xl(t);
              break;
            case 4:
              Dl(e, t, n);
          }
        }
        function Ol(e) {
          var t = e.alternate;
          e.return = null, e.child = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.alternate = null, e.firstEffect = null, e.lastEffect = null, e.pendingProps = null, e.memoizedProps = null, e.stateNode = null, t !== null && Ol(t);
        }
        function Pl(e) {
          return e.tag === 5 || e.tag === 3 || e.tag === 4;
        }
        function Nl(e) {
          e: {
            for (var t = e.return; t !== null; ) {
              if (Pl(t)) {
                var n = t;
                break e;
              }
              t = t.return;
            }
            throw Error(m(160));
          }
          switch (t = n.stateNode, n.tag) {
            case 5:
              var r = !1;
              break;
            case 3:
            case 4:
              t = t.containerInfo, r = !0;
              break;
            default:
              throw Error(m(161));
          }
          16 & n.effectTag && (st(t, ""), n.effectTag &= -17);
          e: t: for (n = e; ; ) {
            for (; n.sibling === null; ) {
              if (n.return === null || Pl(n.return)) {
                n = null;
                break e;
              }
              n = n.return;
            }
            for (n.sibling.return = n.return, n = n.sibling; n.tag !== 5 && n.tag !== 6 && n.tag !== 18; ) {
              if (2 & n.effectTag || n.child === null || n.tag === 4) continue t;
              n.child.return = n, n = n.child;
            }
            if (!(2 & n.effectTag)) {
              n = n.stateNode;
              break e;
            }
          }
          r ? function i(p, v, x) {
            var X = p.tag, q = X === 5 || X === 6;
            if (q) p = q ? p.stateNode : p.stateNode.instance, v ? x.nodeType === 8 ? x.parentNode.insertBefore(p, v) : x.insertBefore(p, v) : (x.nodeType === 8 ? (v = x.parentNode).insertBefore(p, x) : (v = x).appendChild(p), (x = x._reactRootContainer) !== null && x !== void 0 || v.onclick !== null || (v.onclick = Oo));
            else if (X !== 4 && (p = p.child) !== null) for (i(p, v, x), p = p.sibling; p !== null; ) i(p, v, x), p = p.sibling;
          }(e, n, t) : function i(p, v, x) {
            var X = p.tag, q = X === 5 || X === 6;
            if (q) p = q ? p.stateNode : p.stateNode.instance, v ? x.insertBefore(p, v) : x.appendChild(p);
            else if (X !== 4 && (p = p.child) !== null) for (i(p, v, x), p = p.sibling; p !== null; ) i(p, v, x), p = p.sibling;
          }(e, n, t);
        }
        function Dl(e, t, n) {
          for (var r, i, p = t, v = !1; ; ) {
            if (!v) {
              v = p.return;
              e: for (; ; ) {
                if (v === null) throw Error(m(160));
                switch (r = v.stateNode, v.tag) {
                  case 5:
                    i = !1;
                    break e;
                  case 3:
                  case 4:
                    r = r.containerInfo, i = !0;
                    break e;
                }
                v = v.return;
              }
              v = !0;
            }
            if (p.tag === 5 || p.tag === 6) {
              e: for (var x = e, X = p, q = n, ge = X; ; ) if (Tl(x, ge, q), ge.child !== null && ge.tag !== 4) ge.child.return = ge, ge = ge.child;
              else {
                if (ge === X) break e;
                for (; ge.sibling === null; ) {
                  if (ge.return === null || ge.return === X) break e;
                  ge = ge.return;
                }
                ge.sibling.return = ge.return, ge = ge.sibling;
              }
              i ? (x = r, X = p.stateNode, x.nodeType === 8 ? x.parentNode.removeChild(X) : x.removeChild(X)) : r.removeChild(p.stateNode);
            } else if (p.tag === 4) {
              if (p.child !== null) {
                r = p.stateNode.containerInfo, i = !0, p.child.return = p, p = p.child;
                continue;
              }
            } else if (Tl(e, p, n), p.child !== null) {
              p.child.return = p, p = p.child;
              continue;
            }
            if (p === t) break;
            for (; p.sibling === null; ) {
              if (p.return === null || p.return === t) return;
              (p = p.return).tag === 4 && (v = !1);
            }
            p.sibling.return = p.return, p = p.sibling;
          }
        }
        function us(e, t) {
          switch (t.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
            case 22:
              return void Sl(3, t);
            case 1:
              return;
            case 5:
              var n = t.stateNode;
              if (n != null) {
                var r = t.memoizedProps, i = e !== null ? e.memoizedProps : r;
                e = t.type;
                var p = t.updateQueue;
                if (t.updateQueue = null, p !== null) {
                  for (n[no] = r, e === "input" && r.type === "radio" && r.name != null && Tr(n, r), Qo(e, i), t = Qo(e, r), i = 0; i < p.length; i += 2) {
                    var v = p[i], x = p[i + 1];
                    v === "style" ? xi(n, x) : v === "dangerouslySetInnerHTML" ? qe(n, x) : v === "children" ? st(n, x) : je(n, v, x, t);
                  }
                  switch (e) {
                    case "input":
                      ir(n, r);
                      break;
                    case "textarea":
                      Gr(n, r);
                      break;
                    case "select":
                      t = n._wrapperState.wasMultiple, n._wrapperState.wasMultiple = !!r.multiple, (e = r.value) != null ? Tn(n, !!r.multiple, e, !1) : t !== !!r.multiple && (r.defaultValue != null ? Tn(n, !!r.multiple, r.defaultValue, !0) : Tn(n, !!r.multiple, r.multiple ? [] : "", !1));
                  }
                }
              }
              return;
            case 6:
              if (t.stateNode === null) throw Error(m(162));
              return void (t.stateNode.nodeValue = t.memoizedProps);
            case 3:
              return void ((t = t.stateNode).hydrate && (t.hydrate = !1, pr(t.containerInfo)));
            case 12:
              return;
            case 13:
              if (n = t, t.memoizedState === null ? r = !1 : (r = !0, n = t.child, cs = jn()), n !== null) e: for (e = n; ; ) {
                if (e.tag === 5) p = e.stateNode, r ? typeof (p = p.style).setProperty == "function" ? p.setProperty("display", "none", "important") : p.display = "none" : (p = e.stateNode, i = (i = e.memoizedProps.style) != null && i.hasOwnProperty("display") ? i.display : null, p.style.display = _i("display", i));
                else if (e.tag === 6) e.stateNode.nodeValue = r ? "" : e.memoizedProps;
                else {
                  if (e.tag === 13 && e.memoizedState !== null && e.memoizedState.dehydrated === null) {
                    (p = e.child.sibling).return = e, e = p;
                    continue;
                  }
                  if (e.child !== null) {
                    e.child.return = e, e = e.child;
                    continue;
                  }
                }
                if (e === n) break;
                for (; e.sibling === null; ) {
                  if (e.return === null || e.return === n) break e;
                  e = e.return;
                }
                e.sibling.return = e.return, e = e.sibling;
              }
              return void Rl(t);
            case 19:
              return void Rl(t);
            case 17:
              return;
          }
          throw Error(m(163));
        }
        function Rl(e) {
          var t = e.updateQueue;
          if (t !== null) {
            e.updateQueue = null;
            var n = e.stateNode;
            n === null && (n = e.stateNode = new Ru()), t.forEach(function(r) {
              var i = Hu.bind(null, e, r);
              n.has(r) || (n.add(r), r.then(i, i));
            });
          }
        }
        var Iu = typeof WeakMap == "function" ? WeakMap : Map;
        function Al(e, t, n) {
          (n = Hr(n, null)).tag = 3, n.payload = { element: null };
          var r = t.value;
          return n.callback = function() {
            ha || (ha = !0, fs = r), ls(e, t);
          }, n;
        }
        function Ml(e, t, n) {
          (n = Hr(n, null)).tag = 3;
          var r = e.type.getDerivedStateFromError;
          if (typeof r == "function") {
            var i = t.value;
            n.payload = function() {
              return ls(e, t), r(i);
            };
          }
          var p = e.stateNode;
          return p !== null && typeof p.componentDidCatch == "function" && (n.callback = function() {
            typeof r != "function" && (qr === null ? qr = /* @__PURE__ */ new Set([this]) : qr.add(this), ls(e, t));
            var v = t.stack;
            this.componentDidCatch(t.value, { componentStack: v !== null ? v : "" });
          }), n;
        }
        var Il, ju = Math.ceil, la = he.ReactCurrentDispatcher, jl = he.ReactCurrentOwner, po = 0, ua = 3, ca = 4, Qe = 0, _n = null, Ge = null, mn = 0, Ft = po, fa = null, kr = 1073741823, di = 1073741823, da = null, pi = 0, pa = !1, cs = 0, Me = null, ha = !1, fs = null, qr = null, ma = !1, hi = null, mi = 90, ho = null, gi = 0, ds = null, ga = 0;
        function tr() {
          return 48 & Qe ? 1073741821 - (jn() / 10 | 0) : ga !== 0 ? ga : ga = 1073741821 - (jn() / 10 | 0);
        }
        function mo(e, t, n) {
          if (!(2 & (t = t.mode))) return 1073741823;
          var r = Hi();
          if (!(4 & t)) return r === 99 ? 1073741823 : 1073741822;
          if (16 & Qe) return mn;
          if (n !== null) e = Vi(e, 0 | n.timeoutMs || 5e3, 250);
          else switch (r) {
            case 99:
              e = 1073741823;
              break;
            case 98:
              e = Vi(e, 150, 100);
              break;
            case 97:
            case 96:
              e = Vi(e, 5e3, 250);
              break;
            case 95:
              e = 2;
              break;
            default:
              throw Error(m(326));
          }
          return _n !== null && e === mn && --e, e;
        }
        function Kr(e, t) {
          if (50 < gi) throw gi = 0, ds = null, Error(m(185));
          if ((e = ba(e, t)) !== null) {
            var n = Hi();
            t === 1073741823 ? 8 & Qe && !(48 & Qe) ? ps(e) : (xn(e), Qe === 0 && Jn()) : xn(e), !(4 & Qe) || n !== 98 && n !== 99 || (ho === null ? ho = /* @__PURE__ */ new Map([[e, t]]) : ((n = ho.get(e)) === void 0 || n > t) && ho.set(e, t));
          }
        }
        function ba(e, t) {
          e.expirationTime < t && (e.expirationTime = t);
          var n = e.alternate;
          n !== null && n.expirationTime < t && (n.expirationTime = t);
          var r = e.return, i = null;
          if (r === null && e.tag === 3) i = e.stateNode;
          else for (; r !== null; ) {
            if (n = r.alternate, r.childExpirationTime < t && (r.childExpirationTime = t), n !== null && n.childExpirationTime < t && (n.childExpirationTime = t), r.return === null && r.tag === 3) {
              i = r.stateNode;
              break;
            }
            r = r.return;
          }
          return i !== null && (_n === i && (va(t), Ft === ca && ko(i, mn)), ql(i, t)), i;
        }
        function ya(e) {
          var t = e.lastExpiredTime;
          if (t !== 0 || !Yl(e, t = e.firstPendingTime)) return t;
          var n = e.lastPingedTime;
          return 2 >= (e = n > (e = e.nextKnownPendingLevel) ? n : e) && t !== e ? 0 : e;
        }
        function xn(e) {
          if (e.lastExpiredTime !== 0) e.callbackExpirationTime = 1073741823, e.callbackPriority = 99, e.callbackNode = Vs(ps.bind(null, e));
          else {
            var t = ya(e), n = e.callbackNode;
            if (t === 0) n !== null && (e.callbackNode = null, e.callbackExpirationTime = 0, e.callbackPriority = 90);
            else {
              var r = tr();
              if (t === 1073741823 ? r = 99 : t === 1 || t === 2 ? r = 95 : r = 0 >= (r = 10 * (1073741821 - t) - 10 * (1073741821 - r)) ? 99 : 250 >= r ? 98 : 5250 >= r ? 97 : 95, n !== null) {
                var i = e.callbackPriority;
                if (e.callbackExpirationTime === t && i >= r) return;
                n !== Fs && Ms(n);
              }
              e.callbackExpirationTime = t, e.callbackPriority = r, t = t === 1073741823 ? Vs(ps.bind(null, e)) : Hs(r, zl.bind(null, e), { timeout: 10 * (1073741821 - t) - jn() }), e.callbackNode = t;
            }
          }
        }
        function zl(e, t) {
          if (ga = 0, t) return ks(e, t = tr()), xn(e), null;
          var n = ya(e);
          if (n !== 0) {
            if (t = e.callbackNode, (48 & Qe) != 0) throw Error(m(327));
            if (Vo(), e === _n && n === mn || go(e, n), Ge !== null) {
              var r = Qe;
              Qe |= 16;
              for (var i = Bl(); ; ) try {
                Lu();
                break;
              } catch (x) {
                Fl(e, x);
              }
              if (La(), Qe = r, la.current = i, Ft === 1) throw t = fa, go(e, n), ko(e, n), xn(e), t;
              if (Ge === null) switch (i = e.finishedWork = e.current.alternate, e.finishedExpirationTime = n, r = Ft, _n = null, r) {
                case po:
                case 1:
                  throw Error(m(345));
                case 2:
                  ks(e, 2 < n ? 2 : n);
                  break;
                case ua:
                  if (ko(e, n), n === (r = e.lastSuspendedTime) && (e.nextKnownPendingLevel = hs(i)), kr === 1073741823 && 10 < (i = cs + 500 - jn())) {
                    if (pa) {
                      var p = e.lastPingedTime;
                      if (p === 0 || p >= n) {
                        e.lastPingedTime = n, go(e, n);
                        break;
                      }
                    }
                    if ((p = ya(e)) !== 0 && p !== n) break;
                    if (r !== 0 && r !== n) {
                      e.lastPingedTime = r;
                      break;
                    }
                    e.timeoutHandle = ti(bo.bind(null, e), i);
                    break;
                  }
                  bo(e);
                  break;
                case ca:
                  if (ko(e, n), n === (r = e.lastSuspendedTime) && (e.nextKnownPendingLevel = hs(i)), pa && ((i = e.lastPingedTime) === 0 || i >= n)) {
                    e.lastPingedTime = n, go(e, n);
                    break;
                  }
                  if ((i = ya(e)) !== 0 && i !== n) break;
                  if (r !== 0 && r !== n) {
                    e.lastPingedTime = r;
                    break;
                  }
                  if (di !== 1073741823 ? r = 10 * (1073741821 - di) - jn() : kr === 1073741823 ? r = 0 : (r = 10 * (1073741821 - kr) - 5e3, 0 > (r = (i = jn()) - r) && (r = 0), (n = 10 * (1073741821 - n) - i) < (r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * ju(r / 1960)) - r) && (r = n)), 10 < r) {
                    e.timeoutHandle = ti(bo.bind(null, e), r);
                    break;
                  }
                  bo(e);
                  break;
                case 5:
                  if (kr !== 1073741823 && da !== null) {
                    p = kr;
                    var v = da;
                    if (0 >= (r = 0 | v.busyMinDurationMs) ? r = 0 : (i = 0 | v.busyDelayMs, r = (p = jn() - (10 * (1073741821 - p) - (0 | v.timeoutMs || 5e3))) <= i ? 0 : i + r - p), 10 < r) {
                      ko(e, n), e.timeoutHandle = ti(bo.bind(null, e), r);
                      break;
                    }
                  }
                  bo(e);
                  break;
                default:
                  throw Error(m(329));
              }
              if (xn(e), e.callbackNode === t) return zl.bind(null, e);
            }
          }
          return null;
        }
        function ps(e) {
          var t = e.lastExpiredTime;
          if (t = t !== 0 ? t : 1073741823, (48 & Qe) != 0) throw Error(m(327));
          if (Vo(), e === _n && t === mn || go(e, t), Ge !== null) {
            var n = Qe;
            Qe |= 16;
            for (var r = Bl(); ; ) try {
              zu();
              break;
            } catch (i) {
              Fl(e, i);
            }
            if (La(), Qe = n, la.current = r, Ft === 1) throw n = fa, go(e, t), ko(e, t), xn(e), n;
            if (Ge !== null) throw Error(m(261));
            e.finishedWork = e.current.alternate, e.finishedExpirationTime = t, _n = null, bo(e), xn(e);
          }
          return null;
        }
        function Ll(e, t) {
          var n = Qe;
          Qe |= 1;
          try {
            return e(t);
          } finally {
            (Qe = n) === 0 && Jn();
          }
        }
        function Ul(e, t) {
          var n = Qe;
          Qe &= -2, Qe |= 8;
          try {
            return e(t);
          } finally {
            (Qe = n) === 0 && Jn();
          }
        }
        function go(e, t) {
          e.finishedWork = null, e.finishedExpirationTime = 0;
          var n = e.timeoutHandle;
          if (n !== -1 && (e.timeoutHandle = -1, Di(n)), Ge !== null) for (n = Ge.return; n !== null; ) {
            var r = n;
            switch (r.tag) {
              case 1:
                (r = r.type.childContextTypes) != null && Ui();
                break;
              case 3:
                Bo(), vt(pn), vt(Xt);
                break;
              case 5:
                $a(r);
                break;
              case 4:
                Bo();
                break;
              case 13:
              case 19:
                vt(Ct);
                break;
              case 10:
                Ua(r);
            }
            n = n.return;
          }
          _n = e, Ge = vo(e.current, null), mn = t, Ft = po, fa = null, di = kr = 1073741823, da = null, pi = 0, pa = !1;
        }
        function Fl(e, t) {
          for (; ; ) {
            try {
              if (La(), Zi.current = ia, ea) for (var n = Lt.memoizedState; n !== null; ) {
                var r = n.queue;
                r !== null && (r.pending = null), n = n.next;
              }
              if ($r = 0, Jt = sn = Lt = null, ea = !1, Ge === null || Ge.return === null) return Ft = 1, fa = t, Ge = null;
              e: {
                var i = e, p = Ge.return, v = Ge, x = t;
                if (t = mn, v.effectTag |= 2048, v.firstEffect = v.lastEffect = null, x !== null && typeof x == "object" && typeof x.then == "function") {
                  var X = x;
                  if (!(2 & v.mode)) {
                    var q = v.alternate;
                    q ? (v.updateQueue = q.updateQueue, v.memoizedState = q.memoizedState, v.expirationTime = q.expirationTime) : (v.updateQueue = null, v.memoizedState = null);
                  }
                  var ge = (1 & Ct.current) != 0, De = p;
                  do {
                    var He;
                    if (He = De.tag === 13) {
                      var ot = De.memoizedState;
                      if (ot !== null) He = ot.dehydrated !== null;
                      else {
                        var Fn = De.memoizedProps;
                        He = Fn.fallback !== void 0 && (Fn.unstable_avoidThisFallback !== !0 || !ge);
                      }
                    }
                    if (He) {
                      var ln = De.updateQueue;
                      if (ln === null) {
                        var re = /* @__PURE__ */ new Set();
                        re.add(X), De.updateQueue = re;
                      } else ln.add(X);
                      if (!(2 & De.mode)) {
                        if (De.effectTag |= 64, v.effectTag &= -2981, v.tag === 1) if (v.alternate === null) v.tag = 17;
                        else {
                          var ee = Hr(1073741823, null);
                          ee.tag = 2, Vr(v, ee);
                        }
                        v.expirationTime = 1073741823;
                        break e;
                      }
                      x = void 0, v = t;
                      var ce = i.pingCache;
                      if (ce === null ? (ce = i.pingCache = new Iu(), x = /* @__PURE__ */ new Set(), ce.set(X, x)) : (x = ce.get(X)) === void 0 && (x = /* @__PURE__ */ new Set(), ce.set(X, x)), !x.has(v)) {
                        x.add(v);
                        var ve = Wu.bind(null, i, X, v);
                        X.then(ve, ve);
                      }
                      De.effectTag |= 4096, De.expirationTime = t;
                      break e;
                    }
                    De = De.return;
                  } while (De !== null);
                  x = Error((Yt(v.type) || "A React component") + ` suspended while rendering, but no fallback UI was specified.

Add a <Suspense fallback=...> component higher in the tree to provide a loading indicator or placeholder to display.` + xr(v));
                }
                Ft !== 5 && (Ft = 2), x = ss(x, v), De = p;
                do {
                  switch (De.tag) {
                    case 3:
                      X = x, De.effectTag |= 4096, De.expirationTime = t, qs(De, Al(De, X, t));
                      break e;
                    case 1:
                      X = x;
                      var xe = De.type, Oe = De.stateNode;
                      if (!(64 & De.effectTag) && (typeof xe.getDerivedStateFromError == "function" || Oe !== null && typeof Oe.componentDidCatch == "function" && (qr === null || !qr.has(Oe)))) {
                        De.effectTag |= 4096, De.expirationTime = t, qs(De, Ml(De, X, t));
                        break e;
                      }
                  }
                  De = De.return;
                } while (De !== null);
              }
              Ge = Vl(Ge);
            } catch (Be) {
              t = Be;
              continue;
            }
            break;
          }
        }
        function Bl() {
          var e = la.current;
          return la.current = ia, e === null ? ia : e;
        }
        function Wl(e, t) {
          e < kr && 2 < e && (kr = e), t !== null && e < di && 2 < e && (di = e, da = t);
        }
        function va(e) {
          e > pi && (pi = e);
        }
        function zu() {
          for (; Ge !== null; ) Ge = Hl(Ge);
        }
        function Lu() {
          for (; Ge !== null && !xu(); ) Ge = Hl(Ge);
        }
        function Hl(e) {
          var t = Il(e.alternate, e, mn);
          return e.memoizedProps = e.pendingProps, t === null && (t = Vl(e)), jl.current = null, t;
        }
        function Vl(e) {
          Ge = e;
          do {
            var t = Ge.alternate;
            if (e = Ge.return, (2048 & Ge.effectTag) == 0) {
              if (t = Nu(t, Ge, mn), mn === 1 || Ge.childExpirationTime !== 1) {
                for (var n = 0, r = Ge.child; r !== null; ) {
                  var i = r.expirationTime, p = r.childExpirationTime;
                  i > n && (n = i), p > n && (n = p), r = r.sibling;
                }
                Ge.childExpirationTime = n;
              }
              if (t !== null) return t;
              e !== null && !(2048 & e.effectTag) && (e.firstEffect === null && (e.firstEffect = Ge.firstEffect), Ge.lastEffect !== null && (e.lastEffect !== null && (e.lastEffect.nextEffect = Ge.firstEffect), e.lastEffect = Ge.lastEffect), 1 < Ge.effectTag && (e.lastEffect !== null ? e.lastEffect.nextEffect = Ge : e.firstEffect = Ge, e.lastEffect = Ge));
            } else {
              if ((t = Du(Ge)) !== null) return t.effectTag &= 2047, t;
              e !== null && (e.firstEffect = e.lastEffect = null, e.effectTag |= 2048);
            }
            if ((t = Ge.sibling) !== null) return t;
            Ge = e;
          } while (Ge !== null);
          return Ft === po && (Ft = 5), null;
        }
        function hs(e) {
          var t = e.expirationTime;
          return t > (e = e.childExpirationTime) ? t : e;
        }
        function bo(e) {
          var t = Hi();
          return Br(99, Uu.bind(null, e, t)), null;
        }
        function Uu(e, t) {
          do
            Vo();
          while (hi !== null);
          if (48 & Qe) throw Error(m(327));
          var n = e.finishedWork, r = e.finishedExpirationTime;
          if (n === null) return null;
          if (e.finishedWork = null, e.finishedExpirationTime = 0, n === e.current) throw Error(m(177));
          e.callbackNode = null, e.callbackExpirationTime = 0, e.callbackPriority = 90, e.nextKnownPendingLevel = 0;
          var i = hs(n);
          if (e.firstPendingTime = i, r <= e.lastSuspendedTime ? e.firstSuspendedTime = e.lastSuspendedTime = e.nextKnownPendingLevel = 0 : r <= e.firstSuspendedTime && (e.firstSuspendedTime = r - 1), r <= e.lastPingedTime && (e.lastPingedTime = 0), r <= e.lastExpiredTime && (e.lastExpiredTime = 0), e === _n && (Ge = _n = null, mn = 0), 1 < n.effectTag ? n.lastEffect !== null ? (n.lastEffect.nextEffect = n, i = n.firstEffect) : i = n : i = n.firstEffect, i !== null) {
            var p = Qe;
            Qe |= 32, jl.current = null, Jo = Co;
            var v = Pi();
            if (Xo(v)) {
              if ("selectionStart" in v) var x = { start: v.selectionStart, end: v.selectionEnd };
              else e: {
                var X = (x = (x = v.ownerDocument) && x.defaultView || window).getSelection && x.getSelection();
                if (X && X.rangeCount !== 0) {
                  x = X.anchorNode;
                  var q = X.anchorOffset, ge = X.focusNode;
                  X = X.focusOffset;
                  try {
                    x.nodeType, ge.nodeType;
                  } catch {
                    x = null;
                    break e;
                  }
                  var De = 0, He = -1, ot = -1, Fn = 0, ln = 0, re = v, ee = null;
                  t: for (; ; ) {
                    for (var ce; re !== x || q !== 0 && re.nodeType !== 3 || (He = De + q), re !== ge || X !== 0 && re.nodeType !== 3 || (ot = De + X), re.nodeType === 3 && (De += re.nodeValue.length), (ce = re.firstChild) !== null; ) ee = re, re = ce;
                    for (; ; ) {
                      if (re === v) break t;
                      if (ee === x && ++Fn === q && (He = De), ee === ge && ++ln === X && (ot = De), (ce = re.nextSibling) !== null) break;
                      ee = (re = ee).parentNode;
                    }
                    re = ce;
                  }
                  x = He === -1 || ot === -1 ? null : { start: He, end: ot };
                } else x = null;
              }
              x = x || { start: 0, end: 0 };
            } else x = null;
            Zo = { activeElementDetached: null, focusedElem: v, selectionRange: x }, Co = !1, Me = i;
            do
              try {
                Fu();
              } catch (Je) {
                if (Me === null) throw Error(m(330));
                yo(Me, Je), Me = Me.nextEffect;
              }
            while (Me !== null);
            Me = i;
            do
              try {
                for (v = e, x = t; Me !== null; ) {
                  var ve = Me.effectTag;
                  if (16 & ve && st(Me.stateNode, ""), 128 & ve) {
                    var xe = Me.alternate;
                    if (xe !== null) {
                      var Oe = xe.ref;
                      Oe !== null && (typeof Oe == "function" ? Oe(null) : Oe.current = null);
                    }
                  }
                  switch (1038 & ve) {
                    case 2:
                      Nl(Me), Me.effectTag &= -3;
                      break;
                    case 6:
                      Nl(Me), Me.effectTag &= -3, us(Me.alternate, Me);
                      break;
                    case 1024:
                      Me.effectTag &= -1025;
                      break;
                    case 1028:
                      Me.effectTag &= -1025, us(Me.alternate, Me);
                      break;
                    case 4:
                      us(Me.alternate, Me);
                      break;
                    case 8:
                      Dl(v, q = Me, x), Ol(q);
                  }
                  Me = Me.nextEffect;
                }
              } catch (Je) {
                if (Me === null) throw Error(m(330));
                yo(Me, Je), Me = Me.nextEffect;
              }
            while (Me !== null);
            if (Oe = Zo, xe = Pi(), ve = Oe.focusedElem, x = Oe.selectionRange, xe !== ve && ve && ve.ownerDocument && function Je(Bt, wr) {
              return !(!Bt || !wr) && (Bt === wr || (!Bt || Bt.nodeType !== 3) && (wr && wr.nodeType === 3 ? Je(Bt, wr.parentNode) : "contains" in Bt ? Bt.contains(wr) : !!Bt.compareDocumentPosition && !!(16 & Bt.compareDocumentPosition(wr))));
            }(ve.ownerDocument.documentElement, ve)) {
              for (x !== null && Xo(ve) && (xe = x.start, (Oe = x.end) === void 0 && (Oe = xe), "selectionStart" in ve ? (ve.selectionStart = xe, ve.selectionEnd = Math.min(Oe, ve.value.length)) : (Oe = (xe = ve.ownerDocument || document) && xe.defaultView || window).getSelection && (Oe = Oe.getSelection(), q = ve.textContent.length, v = Math.min(x.start, q), x = x.end === void 0 ? v : Math.min(x.end, q), !Oe.extend && v > x && (q = x, x = v, v = q), q = Oi(ve, v), ge = Oi(ve, x), q && ge && (Oe.rangeCount !== 1 || Oe.anchorNode !== q.node || Oe.anchorOffset !== q.offset || Oe.focusNode !== ge.node || Oe.focusOffset !== ge.offset) && ((xe = xe.createRange()).setStart(q.node, q.offset), Oe.removeAllRanges(), v > x ? (Oe.addRange(xe), Oe.extend(ge.node, ge.offset)) : (xe.setEnd(ge.node, ge.offset), Oe.addRange(xe))))), xe = [], Oe = ve; Oe = Oe.parentNode; ) Oe.nodeType === 1 && xe.push({ element: Oe, left: Oe.scrollLeft, top: Oe.scrollTop });
              for (typeof ve.focus == "function" && ve.focus(), ve = 0; ve < xe.length; ve++) (Oe = xe[ve]).element.scrollLeft = Oe.left, Oe.element.scrollTop = Oe.top;
            }
            Co = !!Jo, Zo = Jo = null, e.current = n, Me = i;
            do
              try {
                for (ve = e; Me !== null; ) {
                  var Be = Me.effectTag;
                  if (36 & Be && Mu(ve, Me.alternate, Me), 128 & Be) {
                    xe = void 0;
                    var at = Me.ref;
                    if (at !== null) {
                      var Rt = Me.stateNode;
                      switch (Me.tag) {
                        case 5:
                          xe = Rt;
                          break;
                        default:
                          xe = Rt;
                      }
                      typeof at == "function" ? at(xe) : at.current = xe;
                    }
                  }
                  Me = Me.nextEffect;
                }
              } catch (Je) {
                if (Me === null) throw Error(m(330));
                yo(Me, Je), Me = Me.nextEffect;
              }
            while (Me !== null);
            Me = null, Su(), Qe = p;
          } else e.current = n;
          if (ma) ma = !1, hi = e, mi = t;
          else for (Me = i; Me !== null; ) t = Me.nextEffect, Me.nextEffect = null, Me = t;
          if ((t = e.firstPendingTime) === 0 && (qr = null), t === 1073741823 ? e === ds ? gi++ : (gi = 0, ds = e) : gi = 0, typeof ms == "function" && ms(n.stateNode, r), xn(e), ha) throw ha = !1, e = fs, fs = null, e;
          return 8 & Qe || Jn(), null;
        }
        function Fu() {
          for (; Me !== null; ) {
            var e = Me.effectTag;
            256 & e && Au(Me.alternate, Me), !(512 & e) || ma || (ma = !0, Hs(97, function() {
              return Vo(), null;
            })), Me = Me.nextEffect;
          }
        }
        function Vo() {
          if (mi !== 90) {
            var e = 97 < mi ? 97 : mi;
            return mi = 90, Br(e, Bu);
          }
        }
        function Bu() {
          if (hi === null) return !1;
          var e = hi;
          if (hi = null, (48 & Qe) != 0) throw Error(m(331));
          var t = Qe;
          for (Qe |= 32, e = e.current.firstEffect; e !== null; ) {
            try {
              var n = e;
              if (512 & n.effectTag) switch (n.tag) {
                case 0:
                case 11:
                case 15:
                case 22:
                  Sl(5, n), Cl(5, n);
              }
            } catch (r) {
              if (e === null) throw Error(m(330));
              yo(e, r);
            }
            n = e.nextEffect, e.nextEffect = null, e = n;
          }
          return Qe = t, Jn(), !0;
        }
        function $l(e, t, n) {
          Vr(e, t = Al(e, t = ss(n, t), 1073741823)), (e = ba(e, 1073741823)) !== null && xn(e);
        }
        function yo(e, t) {
          if (e.tag === 3) $l(e, e, t);
          else for (var n = e.return; n !== null; ) {
            if (n.tag === 3) {
              $l(n, e, t);
              break;
            }
            if (n.tag === 1) {
              var r = n.stateNode;
              if (typeof n.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (qr === null || !qr.has(r))) {
                Vr(n, e = Ml(n, e = ss(t, e), 1073741823)), (n = ba(n, 1073741823)) !== null && xn(n);
                break;
              }
            }
            n = n.return;
          }
        }
        function Wu(e, t, n) {
          var r = e.pingCache;
          r !== null && r.delete(t), _n === e && mn === n ? Ft === ca || Ft === ua && kr === 1073741823 && jn() - cs < 500 ? go(e, mn) : pa = !0 : Yl(e, n) && ((t = e.lastPingedTime) !== 0 && t < n || (e.lastPingedTime = n, xn(e)));
        }
        function Hu(e, t) {
          var n = e.stateNode;
          n !== null && n.delete(t), (t = 0) == 0 && (t = mo(t = tr(), e, null)), (e = ba(e, t)) !== null && xn(e);
        }
        Il = function(e, t, n) {
          var r = t.expirationTime;
          if (e !== null) {
            var i = t.pendingProps;
            if (e.memoizedProps !== i || pn.current) er = !0;
            else {
              if (r < n) {
                switch (er = !1, t.tag) {
                  case 3:
                    bl(t), ns();
                    break;
                  case 5:
                    if (el(t), 4 & t.mode && n !== 1 && i.hidden) return t.expirationTime = t.childExpirationTime = 1, null;
                    break;
                  case 1:
                    hn(t.type) && Fi(t);
                    break;
                  case 4:
                    Va(t, t.stateNode.containerInfo);
                    break;
                  case 10:
                    r = t.memoizedProps.value, i = t.type._context, St($i, i._currentValue), i._currentValue = r;
                    break;
                  case 13:
                    if (t.memoizedState !== null) return (r = t.child.childExpirationTime) !== 0 && r >= n ? wl(e, t, n) : (St(Ct, 1 & Ct.current), (t = vr(e, t, n)) !== null ? t.sibling : null);
                    St(Ct, 1 & Ct.current);
                    break;
                  case 19:
                    if (r = t.childExpirationTime >= n, (64 & e.effectTag) != 0) {
                      if (r) return _l(e, t, n);
                      t.effectTag |= 64;
                    }
                    if ((i = t.memoizedState) !== null && (i.rendering = null, i.tail = null), St(Ct, Ct.current), !r) return null;
                }
                return vr(e, t, n);
              }
              er = !1;
            }
          } else er = !1;
          switch (t.expirationTime = 0, t.tag) {
            case 2:
              if (r = t.type, e !== null && (e.alternate = null, t.alternate = null, t.effectTag |= 2), e = t.pendingProps, i = zo(t, Xt.current), Uo(t, n), i = Ka(null, t, r, e, i, n), t.effectTag |= 1, typeof i == "object" && i !== null && typeof i.render == "function" && i.$$typeof === void 0) {
                if (t.tag = 1, t.memoizedState = null, t.updateQueue = null, hn(r)) {
                  var p = !0;
                  Fi(t);
                } else p = !1;
                t.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null, Fa(t);
                var v = r.getDerivedStateFromProps;
                typeof v == "function" && Ki(t, r, v, e), i.updater = Qi, t.stateNode = i, i._reactInternalFiber = t, Wa(t, r, e, n), t = os(null, t, r, !0, p, n);
              } else t.tag = 0, Un(null, t, i, n), t = t.child;
              return t;
            case 16:
              e: {
                if (i = t.elementType, e !== null && (e.alternate = null, t.alternate = null, t.effectTag |= 2), e = t.pendingProps, function(ge) {
                  if (ge._status === -1) {
                    ge._status = 0;
                    var De = ge._ctor;
                    De = De(), ge._result = De, De.then(function(He) {
                      ge._status === 0 && (He = He.default, ge._status = 1, ge._result = He);
                    }, function(He) {
                      ge._status === 0 && (ge._status = 2, ge._result = He);
                    });
                  }
                }(i), i._status !== 1) throw i._result;
                switch (i = i._result, t.type = i, p = t.tag = function(ge) {
                  if (typeof ge == "function") return bs(ge) ? 1 : 0;
                  if (ge != null) {
                    if ((ge = ge.$$typeof) === Tt) return 11;
                    if (ge === Sn) return 14;
                  }
                  return 2;
                }(i), e = Vn(i, e), p) {
                  case 0:
                    t = rs(null, t, i, e, n);
                    break e;
                  case 1:
                    t = gl(null, t, i, e, n);
                    break e;
                  case 11:
                    t = dl(null, t, i, e, n);
                    break e;
                  case 14:
                    t = pl(null, t, i, Vn(i.type, e), r, n);
                    break e;
                }
                throw Error(m(306, i, ""));
              }
              return t;
            case 0:
              return r = t.type, i = t.pendingProps, rs(e, t, r, i = t.elementType === r ? i : Vn(r, i), n);
            case 1:
              return r = t.type, i = t.pendingProps, gl(e, t, r, i = t.elementType === r ? i : Vn(r, i), n);
            case 3:
              if (bl(t), r = t.updateQueue, e === null || r === null) throw Error(m(282));
              if (r = t.pendingProps, i = (i = t.memoizedState) !== null ? i.element : null, Ba(e, t), ai(t, r, null, n), (r = t.memoizedState.element) === i) ns(), t = vr(e, t, n);
              else {
                if ((i = t.stateNode.hydrate) && (Yr = Mr(t.stateNode.containerInfo.firstChild), yr = t, i = fo = !0), i) for (n = Ha(t, null, r, n), t.child = n; n; ) n.effectTag = -3 & n.effectTag | 1024, n = n.sibling;
                else Un(e, t, r, n), ns();
                t = t.child;
              }
              return t;
            case 5:
              return el(t), e === null && ts(t), r = t.type, i = t.pendingProps, p = e !== null ? e.memoizedProps : null, v = i.children, ei(r, i) ? v = null : p !== null && ei(r, p) && (t.effectTag |= 16), ml(e, t), 4 & t.mode && n !== 1 && i.hidden ? (t.expirationTime = t.childExpirationTime = 1, t = null) : (Un(e, t, v, n), t = t.child), t;
            case 6:
              return e === null && ts(t), null;
            case 13:
              return wl(e, t, n);
            case 4:
              return Va(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Fo(t, null, r, n) : Un(e, t, r, n), t.child;
            case 11:
              return r = t.type, i = t.pendingProps, dl(e, t, r, i = t.elementType === r ? i : Vn(r, i), n);
            case 7:
              return Un(e, t, t.pendingProps, n), t.child;
            case 8:
            case 12:
              return Un(e, t, t.pendingProps.children, n), t.child;
            case 10:
              e: {
                r = t.type._context, i = t.pendingProps, v = t.memoizedProps, p = i.value;
                var x = t.type._context;
                if (St($i, x._currentValue), x._currentValue = p, v !== null) if (x = v.value, (p = mr(x, p) ? 0 : 0 | (typeof r._calculateChangedBits == "function" ? r._calculateChangedBits(x, p) : 1073741823)) === 0) {
                  if (v.children === i.children && !pn.current) {
                    t = vr(e, t, n);
                    break e;
                  }
                } else for ((x = t.child) !== null && (x.return = t); x !== null; ) {
                  var X = x.dependencies;
                  if (X !== null) {
                    v = x.child;
                    for (var q = X.firstContext; q !== null; ) {
                      if (q.context === r && q.observedBits & p) {
                        x.tag === 1 && ((q = Hr(n, null)).tag = 2, Vr(x, q)), x.expirationTime < n && (x.expirationTime = n), (q = x.alternate) !== null && q.expirationTime < n && (q.expirationTime = n), Ys(x.return, n), X.expirationTime < n && (X.expirationTime = n);
                        break;
                      }
                      q = q.next;
                    }
                  } else v = x.tag === 10 && x.type === t.type ? null : x.child;
                  if (v !== null) v.return = x;
                  else for (v = x; v !== null; ) {
                    if (v === t) {
                      v = null;
                      break;
                    }
                    if ((x = v.sibling) !== null) {
                      x.return = v.return, v = x;
                      break;
                    }
                    v = v.return;
                  }
                  x = v;
                }
                Un(e, t, i.children, n), t = t.child;
              }
              return t;
            case 9:
              return i = t.type, r = (p = t.pendingProps).children, Uo(t, n), r = r(i = zn(i, p.unstable_observedBits)), t.effectTag |= 1, Un(e, t, r, n), t.child;
            case 14:
              return p = Vn(i = t.type, t.pendingProps), pl(e, t, i, p = Vn(i.type, p), r, n);
            case 15:
              return hl(e, t, t.type, t.pendingProps, r, n);
            case 17:
              return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : Vn(r, i), e !== null && (e.alternate = null, t.alternate = null, t.effectTag |= 2), t.tag = 1, hn(r) ? (e = !0, Fi(t)) : e = !1, Uo(t, n), Xs(t, r, i), Wa(t, r, i, n), os(null, t, r, !0, e, n);
            case 19:
              return _l(e, t, n);
          }
          throw Error(m(156, t.tag));
        };
        var ms = null, gs = null;
        function Vu(e, t, n, r) {
          this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.effectTag = 0, this.lastEffect = this.firstEffect = this.nextEffect = null, this.childExpirationTime = this.expirationTime = 0, this.alternate = null;
        }
        function nr(e, t, n, r) {
          return new Vu(e, t, n, r);
        }
        function bs(e) {
          return !(!(e = e.prototype) || !e.isReactComponent);
        }
        function vo(e, t) {
          var n = e.alternate;
          return n === null ? ((n = nr(e.tag, t, e.key, e.mode)).elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.effectTag = 0, n.nextEffect = null, n.firstEffect = null, n.lastEffect = null), n.childExpirationTime = e.childExpirationTime, n.expirationTime = e.expirationTime, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { expirationTime: t.expirationTime, firstContext: t.firstContext, responders: t.responders }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
        }
        function ka(e, t, n, r, i, p) {
          var v = 2;
          if (r = e, typeof e == "function") bs(e) && (v = 1);
          else if (typeof e == "string") v = 5;
          else e: switch (e) {
            case kt:
              return Qr(n.children, i, p, t);
            case Er:
              v = 8, i |= 7;
              break;
            case Zt:
              v = 8, i |= 1;
              break;
            case wt:
              return (e = nr(12, n, t, 8 | i)).elementType = wt, e.type = wt, e.expirationTime = p, e;
            case pt:
              return (e = nr(13, n, t, i)).type = pt, e.elementType = pt, e.expirationTime = p, e;
            case $n:
              return (e = nr(19, n, t, i)).elementType = $n, e.expirationTime = p, e;
            default:
              if (typeof e == "object" && e !== null) switch (e.$$typeof) {
                case gt:
                  v = 10;
                  break e;
                case un:
                  v = 9;
                  break e;
                case Tt:
                  v = 11;
                  break e;
                case Sn:
                  v = 14;
                  break e;
                case or:
                  v = 16, r = null;
                  break e;
                case _r:
                  v = 22;
                  break e;
              }
              throw Error(m(130, e == null ? e : typeof e, ""));
          }
          return (t = nr(v, n, t, i)).elementType = e, t.type = r, t.expirationTime = p, t;
        }
        function Qr(e, t, n, r) {
          return (e = nr(7, e, r, t)).expirationTime = n, e;
        }
        function ys(e, t, n) {
          return (e = nr(6, e, null, t)).expirationTime = n, e;
        }
        function vs(e, t, n) {
          return (t = nr(4, e.children !== null ? e.children : [], e.key, t)).expirationTime = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
        }
        function $u(e, t, n) {
          this.tag = t, this.current = null, this.containerInfo = e, this.pingCache = this.pendingChildren = null, this.finishedExpirationTime = 0, this.finishedWork = null, this.timeoutHandle = -1, this.pendingContext = this.context = null, this.hydrate = n, this.callbackNode = null, this.callbackPriority = 90, this.lastExpiredTime = this.lastPingedTime = this.nextKnownPendingLevel = this.lastSuspendedTime = this.firstSuspendedTime = this.firstPendingTime = 0;
        }
        function Yl(e, t) {
          var n = e.firstSuspendedTime;
          return e = e.lastSuspendedTime, n !== 0 && n >= t && e <= t;
        }
        function ko(e, t) {
          var n = e.firstSuspendedTime, r = e.lastSuspendedTime;
          n < t && (e.firstSuspendedTime = t), (r > t || n === 0) && (e.lastSuspendedTime = t), t <= e.lastPingedTime && (e.lastPingedTime = 0), t <= e.lastExpiredTime && (e.lastExpiredTime = 0);
        }
        function ql(e, t) {
          t > e.firstPendingTime && (e.firstPendingTime = t);
          var n = e.firstSuspendedTime;
          n !== 0 && (t >= n ? e.firstSuspendedTime = e.lastSuspendedTime = e.nextKnownPendingLevel = 0 : t >= e.lastSuspendedTime && (e.lastSuspendedTime = t + 1), t > e.nextKnownPendingLevel && (e.nextKnownPendingLevel = t));
        }
        function ks(e, t) {
          var n = e.lastExpiredTime;
          (n === 0 || n > t) && (e.lastExpiredTime = t);
        }
        function wa(e, t, n, r) {
          var i = t.current, p = tr(), v = si.suspense;
          p = mo(p, i, v);
          e: if (n) {
            t: {
              if (Nn(n = n._reactInternalFiber) !== n || n.tag !== 1) throw Error(m(170));
              var x = n;
              do {
                switch (x.tag) {
                  case 3:
                    x = x.stateNode.context;
                    break t;
                  case 1:
                    if (hn(x.type)) {
                      x = x.stateNode.__reactInternalMemoizedMergedChildContext;
                      break t;
                    }
                }
                x = x.return;
              } while (x !== null);
              throw Error(m(171));
            }
            if (n.tag === 1) {
              var X = n.type;
              if (hn(X)) {
                n = Rs(n, X, x);
                break e;
              }
            }
            n = x;
          } else n = Fr;
          return t.context === null ? t.context = n : t.pendingContext = n, (t = Hr(p, v)).payload = { element: e }, (r = r === void 0 ? null : r) !== null && (t.callback = r), Vr(i, t), Kr(i, p), p;
        }
        function ws(e) {
          if (!(e = e.current).child) return null;
          switch (e.child.tag) {
            case 5:
            default:
              return e.child.stateNode;
          }
        }
        function Kl(e, t) {
          (e = e.memoizedState) !== null && e.dehydrated !== null && e.retryTime < t && (e.retryTime = t);
        }
        function Es(e, t) {
          Kl(e, t), (e = e.alternate) && Kl(e, t);
        }
        function _s(e, t, n) {
          var r = new $u(e, t, n = n != null && n.hydrate === !0), i = nr(3, null, null, t === 2 ? 7 : t === 1 ? 3 : 0);
          r.current = i, i.stateNode = r, Fa(i), e[ro] = r.current, n && t !== 0 && function(p, v) {
            var x = cn(v);
            Bn.forEach(function(X) {
              yt(X, v, x);
            }), Nt.forEach(function(X) {
              yt(X, v, x);
            });
          }(0, e.nodeType === 9 ? e : e.ownerDocument), this._internalRoot = r;
        }
        function bi(e) {
          return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
        }
        function Ea(e, t, n, r, i) {
          var p = n._reactRootContainer;
          if (p) {
            var v = p._internalRoot;
            if (typeof i == "function") {
              var x = i;
              i = function() {
                var q = ws(v);
                x.call(q);
              };
            }
            wa(t, v, e, i);
          } else {
            if (p = n._reactRootContainer = function(q, ge) {
              if (ge || (ge = !(!(ge = q ? q.nodeType === 9 ? q.documentElement : q.firstChild : null) || ge.nodeType !== 1 || !ge.hasAttribute("data-reactroot"))), !ge) for (var De; De = q.lastChild; ) q.removeChild(De);
              return new _s(q, 0, ge ? { hydrate: !0 } : void 0);
            }(n, r), v = p._internalRoot, typeof i == "function") {
              var X = i;
              i = function() {
                var q = ws(v);
                X.call(q);
              };
            }
            Ul(function() {
              wa(t, v, e, i);
            });
          }
          return ws(v);
        }
        function Yu(e, t, n) {
          var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
          return { $$typeof: At, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
        }
        function Ql(e, t) {
          var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
          if (!bi(t)) throw Error(m(200));
          return Yu(e, t, null, n);
        }
        _s.prototype.render = function(e) {
          wa(e, this._internalRoot, null, null);
        }, _s.prototype.unmount = function() {
          var e = this._internalRoot, t = e.containerInfo;
          wa(null, e, null, function() {
            t[ro] = null;
          });
        }, Et = function(e) {
          if (e.tag === 13) {
            var t = Vi(tr(), 150, 100);
            Kr(e, t), Es(e, t);
          }
        }, cr = function(e) {
          e.tag === 13 && (Kr(e, 3), Es(e, 3));
        }, fr = function(e) {
          if (e.tag === 13) {
            var t = tr();
            Kr(e, t = mo(t, e, null)), Es(e, t);
          }
        }, ue = function(e, t, n) {
          switch (t) {
            case "input":
              if (ir(e, n), t = n.name, n.type === "radio" && t != null) {
                for (n = e; n.parentNode; ) n = n.parentNode;
                for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
                  var r = n[t];
                  if (r !== e && r.form === e.form) {
                    var i = ni(r);
                    if (!i) throw Error(m(90));
                    ct(r), ir(r, i);
                  }
                }
              }
              break;
            case "textarea":
              Gr(e, n);
              break;
            case "select":
              (t = n.value) != null && Tn(e, !!n.multiple, t, !1);
          }
        }, be = Ll, Te = function(e, t, n, r, i) {
          var p = Qe;
          Qe |= 4;
          try {
            return Br(98, e.bind(null, t, n, r, i));
          } finally {
            (Qe = p) === 0 && Jn();
          }
        }, Ee = function() {
          !(49 & Qe) && (function() {
            if (ho !== null) {
              var e = ho;
              ho = null, e.forEach(function(t, n) {
                ks(n, t), xn(n);
              }), Jn();
            }
          }(), Vo());
        }, Pe = function(e, t) {
          var n = Qe;
          Qe |= 2;
          try {
            return e(t);
          } finally {
            (Qe = n) === 0 && Jn();
          }
        };
        var Gl, xs, qu = { Events: [oo, Qn, ni, le, I, jr, function(e) {
          Yn(e, Aa);
        }, D, ie, To, Mt, Vo, { current: !1 }] };
        xs = (Gl = { findFiberByHostInstance: Ir, bundleType: 0, version: "16.14.0", rendererPackageName: "react-dom" }).findFiberByHostInstance, function(e) {
          if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u") return !1;
          var t = __REACT_DEVTOOLS_GLOBAL_HOOK__;
          if (t.isDisabled || !t.supportsFiber) return !0;
          try {
            var n = t.inject(e);
            ms = function(r) {
              try {
                t.onCommitFiberRoot(n, r, void 0, (64 & r.current.effectTag) == 64);
              } catch {
              }
            }, gs = function(r) {
              try {
                t.onCommitFiberUnmount(n, r);
              } catch {
              }
            };
          } catch {
          }
        }(o({}, Gl, { overrideHookState: null, overrideProps: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: he.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
          return (e = rt(e)) === null ? null : e.stateNode;
        }, findFiberByHostInstance: function(e) {
          return xs ? xs(e) : null;
        }, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null })), s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = qu, s.createPortal = Ql, s.findDOMNode = function(e) {
          if (e == null) return null;
          if (e.nodeType === 1) return e;
          var t = e._reactInternalFiber;
          if (t === void 0)
            throw typeof e.render == "function" ? Error(m(188)) : Error(m(268, Object.keys(e)));
          return e = (e = rt(t)) === null ? null : e.stateNode;
        }, s.flushSync = function(e, t) {
          if (48 & Qe) throw Error(m(187));
          var n = Qe;
          Qe |= 1;
          try {
            return Br(99, e.bind(null, t));
          } finally {
            Qe = n, Jn();
          }
        }, s.hydrate = function(e, t, n) {
          if (!bi(t)) throw Error(m(200));
          return Ea(null, e, t, !0, n);
        }, s.render = function(e, t, n) {
          if (!bi(t)) throw Error(m(200));
          return Ea(null, e, t, !1, n);
        }, s.unmountComponentAtNode = function(e) {
          if (!bi(e)) throw Error(m(40));
          return !!e._reactRootContainer && (Ul(function() {
            Ea(null, null, e, !1, function() {
              e._reactRootContainer = null, e[ro] = null;
            });
          }), !0);
        }, s.unstable_batchedUpdates = Ll, s.unstable_createPortal = function(e, t) {
          return Ql(e, t, 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null);
        }, s.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
          if (!bi(n)) throw Error(m(200));
          if (e == null || e._reactInternalFiber === void 0) throw Error(m(38));
          return Ea(e, t, n, !1, r);
        }, s.version = "16.14.0";
      }, function(E, s, d) {
        E.exports = d(24);
      }, function(E, s, d) {
        var u, o, S, m, g;
        if (typeof window > "u" || typeof MessageChannel != "function") {
          var y = null, b = null, C = function() {
            if (y !== null) try {
              var Y = s.unstable_now();
              y(!0, Y), y = null;
            } catch (me) {
              throw setTimeout(C, 0), me;
            }
          }, O = Date.now();
          s.unstable_now = function() {
            return Date.now() - O;
          }, u = function(Y) {
            y !== null ? setTimeout(u, 0, Y) : (y = Y, setTimeout(C, 0));
          }, o = function(Y, me) {
            b = setTimeout(Y, me);
          }, S = function() {
            clearTimeout(b);
          }, m = function() {
            return !1;
          }, g = s.unstable_forceFrameRate = function() {
          };
        } else {
          var N = window.performance, J = window.Date, Q = window.setTimeout, j = window.clearTimeout;
          if (typeof console < "u") {
            var W = window.cancelAnimationFrame;
            typeof window.requestAnimationFrame != "function" && console.error("This browser doesn't support requestAnimationFrame. Make sure that you load a polyfill in older browsers. https://fb.me/react-polyfills"), typeof W != "function" && console.error("This browser doesn't support cancelAnimationFrame. Make sure that you load a polyfill in older browsers. https://fb.me/react-polyfills");
          }
          if (typeof N == "object" && typeof N.now == "function") s.unstable_now = function() {
            return N.now();
          };
          else {
            var P = J.now();
            s.unstable_now = function() {
              return J.now() - P;
            };
          }
          var M = !1, F = null, R = -1, oe = 5, K = 0;
          m = function() {
            return s.unstable_now() >= K;
          }, g = function() {
          }, s.unstable_forceFrameRate = function(Y) {
            0 > Y || 125 < Y ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing framerates higher than 125 fps is not unsupported") : oe = 0 < Y ? Math.floor(1e3 / Y) : 5;
          };
          var I = new MessageChannel(), A = I.port2;
          I.port1.onmessage = function() {
            if (F !== null) {
              var Y = s.unstable_now();
              K = Y + oe;
              try {
                F(!0, Y) ? A.postMessage(null) : (M = !1, F = null);
              } catch (me) {
                throw A.postMessage(null), me;
              }
            } else M = !1;
          }, u = function(Y) {
            F = Y, M || (M = !0, A.postMessage(null));
          }, o = function(Y, me) {
            R = Q(function() {
              Y(s.unstable_now());
            }, me);
          }, S = function() {
            j(R), R = -1;
          };
        }
        function se(Y, me) {
          var l = Y.length;
          Y.push(me);
          e: for (; ; ) {
            var f = l - 1 >>> 1, k = Y[f];
            if (!(k !== void 0 && 0 < ue(k, me))) break e;
            Y[f] = me, Y[l] = k, l = f;
          }
        }
        function le(Y) {
          return (Y = Y[0]) === void 0 ? null : Y;
        }
        function te(Y) {
          var me = Y[0];
          if (me !== void 0) {
            var l = Y.pop();
            if (l !== me) {
              Y[0] = l;
              e: for (var f = 0, k = Y.length; f < k; ) {
                var L = 2 * (f + 1) - 1, U = Y[L], B = L + 1, he = Y[B];
                if (U !== void 0 && 0 > ue(U, l)) he !== void 0 && 0 > ue(he, U) ? (Y[f] = he, Y[B] = l, f = B) : (Y[f] = U, Y[L] = l, f = L);
                else {
                  if (!(he !== void 0 && 0 > ue(he, l))) break e;
                  Y[f] = he, Y[B] = l, f = B;
                }
              }
            }
            return me;
          }
          return null;
        }
        function ue(Y, me) {
          var l = Y.sortIndex - me.sortIndex;
          return l !== 0 ? l : Y.id - me.id;
        }
        var ye = [], Z = [], fe = 1, D = null, ie = 3, be = !1, Te = !1, Ee = !1;
        function Pe(Y) {
          for (var me = le(Z); me !== null; ) {
            if (me.callback === null) te(Z);
            else {
              if (!(me.startTime <= Y)) break;
              te(Z), me.sortIndex = me.expirationTime, se(ye, me);
            }
            me = le(Z);
          }
        }
        function Se(Y) {
          if (Ee = !1, Pe(Y), !Te) if (le(ye) !== null) Te = !0, u(ze);
          else {
            var me = le(Z);
            me !== null && o(Se, me.startTime - Y);
          }
        }
        function ze(Y, me) {
          Te = !1, Ee && (Ee = !1, S()), be = !0;
          var l = ie;
          try {
            for (Pe(me), D = le(ye); D !== null && (!(D.expirationTime > me) || Y && !m()); ) {
              var f = D.callback;
              if (f !== null) {
                D.callback = null, ie = D.priorityLevel;
                var k = f(D.expirationTime <= me);
                me = s.unstable_now(), typeof k == "function" ? D.callback = k : D === le(ye) && te(ye), Pe(me);
              } else te(ye);
              D = le(ye);
            }
            if (D !== null) var L = !0;
            else {
              var U = le(Z);
              U !== null && o(Se, U.startTime - me), L = !1;
            }
            return L;
          } finally {
            D = null, ie = l, be = !1;
          }
        }
        function Ze(Y) {
          switch (Y) {
            case 1:
              return -1;
            case 2:
              return 250;
            case 5:
              return 1073741823;
            case 4:
              return 1e4;
            default:
              return 5e3;
          }
        }
        var G = g;
        s.unstable_IdlePriority = 5, s.unstable_ImmediatePriority = 1, s.unstable_LowPriority = 4, s.unstable_NormalPriority = 3, s.unstable_Profiling = null, s.unstable_UserBlockingPriority = 2, s.unstable_cancelCallback = function(Y) {
          Y.callback = null;
        }, s.unstable_continueExecution = function() {
          Te || be || (Te = !0, u(ze));
        }, s.unstable_getCurrentPriorityLevel = function() {
          return ie;
        }, s.unstable_getFirstCallbackNode = function() {
          return le(ye);
        }, s.unstable_next = function(Y) {
          switch (ie) {
            case 1:
            case 2:
            case 3:
              var me = 3;
              break;
            default:
              me = ie;
          }
          var l = ie;
          ie = me;
          try {
            return Y();
          } finally {
            ie = l;
          }
        }, s.unstable_pauseExecution = function() {
        }, s.unstable_requestPaint = G, s.unstable_runWithPriority = function(Y, me) {
          switch (Y) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
              break;
            default:
              Y = 3;
          }
          var l = ie;
          ie = Y;
          try {
            return me();
          } finally {
            ie = l;
          }
        }, s.unstable_scheduleCallback = function(Y, me, l) {
          var f = s.unstable_now();
          if (typeof l == "object" && l !== null) {
            var k = l.delay;
            k = typeof k == "number" && 0 < k ? f + k : f, l = typeof l.timeout == "number" ? l.timeout : Ze(Y);
          } else l = Ze(Y), k = f;
          return Y = { id: fe++, callback: me, priorityLevel: Y, startTime: k, expirationTime: l = k + l, sortIndex: -1 }, k > f ? (Y.sortIndex = k, se(Z, Y), le(ye) === null && Y === le(Z) && (Ee ? S() : Ee = !0, o(Se, k - f))) : (Y.sortIndex = l, se(ye, Y), Te || be || (Te = !0, u(ze))), Y;
        }, s.unstable_shouldYield = function() {
          var Y = s.unstable_now();
          Pe(Y);
          var me = le(ye);
          return me !== D && D !== null && me !== null && me.callback !== null && me.startTime <= Y && me.expirationTime < D.expirationTime || m();
        }, s.unstable_wrapCallback = function(Y) {
          var me = ie;
          return function() {
            var l = ie;
            ie = me;
            try {
              return Y.apply(this, arguments);
            } finally {
              ie = l;
            }
          };
        };
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.toString = void 0;
        const u = d(13), o = d(26), S = d(17), m = { string: u.quoteString, number: (g) => Object.is(g, -0) ? "-0" : String(g), boolean: String, symbol: (g, y, b) => {
          const C = Symbol.keyFor(g);
          return C !== void 0 ? `Symbol.for(${b(C)})` : `Symbol(${b(g.description)})`;
        }, bigint: (g, y, b) => `BigInt(${b(String(g))})`, undefined: String, object: o.objectToString, function: S.functionToString };
        s.toString = (g, y, b, C) => g === null ? "null" : m[typeof g](g, y, b, C);
      }, function(E, s, d) {
        (function(u, o) {
          Object.defineProperty(s, "__esModule", { value: !0 }), s.objectToString = void 0;
          const S = d(13), m = d(17), g = d(31);
          s.objectToString = (C, O, N, J) => {
            if (typeof u == "function" && u.isBuffer(C)) return `Buffer.from(${N(C.toString("base64"))}, 'base64')`;
            if (typeof o == "object" && C === o) return y(C, O, N);
            const Q = b[Object.prototype.toString.call(C)];
            return Q ? Q(C, O, N, J) : void 0;
          };
          const y = (C, O, N) => `Function(${N("return this")})()`, b = { "[object Array]": g.arrayToString, "[object Object]": (C, O, N, J) => {
            const Q = O ? `
` : "", j = O ? " " : "", W = Object.keys(C).reduce(function(P, M) {
              const F = C[M], R = N(F, M);
              if (R === void 0) return P;
              const oe = R.split(`
`).join(`
` + O);
              return m.USED_METHOD_KEY.has(F) ? (P.push(`${O}${oe}`), P) : (P.push(`${O}${S.quoteKey(M, N)}:${j}${oe}`), P);
            }, []).join("," + Q);
            return W === "" ? "{}" : `{${Q}${W}${Q}}`;
          }, "[object Error]": (C, O, N) => `new Error(${N(C.message)})`, "[object Date]": (C) => `new Date(${C.getTime()})`, "[object String]": (C, O, N) => `new String(${N(C.toString())})`, "[object Number]": (C) => `new Number(${C})`, "[object Boolean]": (C) => `new Boolean(${C})`, "[object Set]": (C, O, N) => `new Set(${N(Array.from(C))})`, "[object Map]": (C, O, N) => `new Map(${N(Array.from(C))})`, "[object RegExp]": String, "[object global]": y, "[object Window]": y };
        }).call(this, d(27).Buffer, d(15));
      }, function(E, s, d) {
        (function(u) {
          var o = d(28), S = d(29), m = d(30);
          function g() {
            return b.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
          }
          function y(l, f) {
            if (g() < f) throw new RangeError("Invalid typed array length");
            return b.TYPED_ARRAY_SUPPORT ? (l = new Uint8Array(f)).__proto__ = b.prototype : (l === null && (l = new b(f)), l.length = f), l;
          }
          function b(l, f, k) {
            if (!(b.TYPED_ARRAY_SUPPORT || this instanceof b)) return new b(l, f, k);
            if (typeof l == "number") {
              if (typeof f == "string") throw new Error("If encoding is specified then the first argument must be a string");
              return N(this, l);
            }
            return C(this, l, f, k);
          }
          function C(l, f, k, L) {
            if (typeof f == "number") throw new TypeError('"value" argument must not be a number');
            return typeof ArrayBuffer < "u" && f instanceof ArrayBuffer ? function(U, B, he, je) {
              if (B.byteLength, he < 0 || B.byteLength < he) throw new RangeError("'offset' is out of bounds");
              if (B.byteLength < he + (je || 0)) throw new RangeError("'length' is out of bounds");
              return B = he === void 0 && je === void 0 ? new Uint8Array(B) : je === void 0 ? new Uint8Array(B, he) : new Uint8Array(B, he, je), b.TYPED_ARRAY_SUPPORT ? (U = B).__proto__ = b.prototype : U = J(U, B), U;
            }(l, f, k, L) : typeof f == "string" ? function(U, B, he) {
              if (typeof he == "string" && he !== "" || (he = "utf8"), !b.isEncoding(he)) throw new TypeError('"encoding" must be a valid string encoding');
              var je = 0 | j(B, he), Re = (U = y(U, je)).write(B, he);
              return Re !== je && (U = U.slice(0, Re)), U;
            }(l, f, k) : function(U, B) {
              if (b.isBuffer(B)) {
                var he = 0 | Q(B.length);
                return (U = y(U, he)).length === 0 || B.copy(U, 0, 0, he), U;
              }
              if (B) {
                if (typeof ArrayBuffer < "u" && B.buffer instanceof ArrayBuffer || "length" in B) return typeof B.length != "number" || (je = B.length) != je ? y(U, 0) : J(U, B);
                if (B.type === "Buffer" && m(B.data)) return J(U, B.data);
              }
              var je;
              throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
            }(l, f);
          }
          function O(l) {
            if (typeof l != "number") throw new TypeError('"size" argument must be a number');
            if (l < 0) throw new RangeError('"size" argument must not be negative');
          }
          function N(l, f) {
            if (O(f), l = y(l, f < 0 ? 0 : 0 | Q(f)), !b.TYPED_ARRAY_SUPPORT) for (var k = 0; k < f; ++k) l[k] = 0;
            return l;
          }
          function J(l, f) {
            var k = f.length < 0 ? 0 : 0 | Q(f.length);
            l = y(l, k);
            for (var L = 0; L < k; L += 1) l[L] = 255 & f[L];
            return l;
          }
          function Q(l) {
            if (l >= g()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + g().toString(16) + " bytes");
            return 0 | l;
          }
          function j(l, f) {
            if (b.isBuffer(l)) return l.length;
            if (typeof ArrayBuffer < "u" && typeof ArrayBuffer.isView == "function" && (ArrayBuffer.isView(l) || l instanceof ArrayBuffer)) return l.byteLength;
            typeof l != "string" && (l = "" + l);
            var k = l.length;
            if (k === 0) return 0;
            for (var L = !1; ; ) switch (f) {
              case "ascii":
              case "latin1":
              case "binary":
                return k;
              case "utf8":
              case "utf-8":
              case void 0:
                return G(l).length;
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return 2 * k;
              case "hex":
                return k >>> 1;
              case "base64":
                return Y(l).length;
              default:
                if (L) return G(l).length;
                f = ("" + f).toLowerCase(), L = !0;
            }
          }
          function W(l, f, k) {
            var L = !1;
            if ((f === void 0 || f < 0) && (f = 0), f > this.length || ((k === void 0 || k > this.length) && (k = this.length), k <= 0) || (k >>>= 0) <= (f >>>= 0)) return "";
            for (l || (l = "utf8"); ; ) switch (l) {
              case "hex":
                return Z(this, f, k);
              case "utf8":
              case "utf-8":
                return te(this, f, k);
              case "ascii":
                return ue(this, f, k);
              case "latin1":
              case "binary":
                return ye(this, f, k);
              case "base64":
                return le(this, f, k);
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return fe(this, f, k);
              default:
                if (L) throw new TypeError("Unknown encoding: " + l);
                l = (l + "").toLowerCase(), L = !0;
            }
          }
          function P(l, f, k) {
            var L = l[f];
            l[f] = l[k], l[k] = L;
          }
          function M(l, f, k, L, U) {
            if (l.length === 0) return -1;
            if (typeof k == "string" ? (L = k, k = 0) : k > 2147483647 ? k = 2147483647 : k < -2147483648 && (k = -2147483648), k = +k, isNaN(k) && (k = U ? 0 : l.length - 1), k < 0 && (k = l.length + k), k >= l.length) {
              if (U) return -1;
              k = l.length - 1;
            } else if (k < 0) {
              if (!U) return -1;
              k = 0;
            }
            if (typeof f == "string" && (f = b.from(f, L)), b.isBuffer(f)) return f.length === 0 ? -1 : F(l, f, k, L, U);
            if (typeof f == "number") return f &= 255, b.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf == "function" ? U ? Uint8Array.prototype.indexOf.call(l, f, k) : Uint8Array.prototype.lastIndexOf.call(l, f, k) : F(l, [f], k, L, U);
            throw new TypeError("val must be string, number or Buffer");
          }
          function F(l, f, k, L, U) {
            var B, he = 1, je = l.length, Re = f.length;
            if (L !== void 0 && ((L = String(L).toLowerCase()) === "ucs2" || L === "ucs-2" || L === "utf16le" || L === "utf-16le")) {
              if (l.length < 2 || f.length < 2) return -1;
              he = 2, je /= 2, Re /= 2, k /= 2;
            }
            function Xe(Zt, wt) {
              return he === 1 ? Zt[wt] : Zt.readUInt16BE(wt * he);
            }
            if (U) {
              var Ve = -1;
              for (B = k; B < je; B++) if (Xe(l, B) === Xe(f, Ve === -1 ? 0 : B - Ve)) {
                if (Ve === -1 && (Ve = B), B - Ve + 1 === Re) return Ve * he;
              } else Ve !== -1 && (B -= B - Ve), Ve = -1;
            } else for (k + Re > je && (k = je - Re), B = k; B >= 0; B--) {
              for (var At = !0, kt = 0; kt < Re; kt++) if (Xe(l, B + kt) !== Xe(f, kt)) {
                At = !1;
                break;
              }
              if (At) return B;
            }
            return -1;
          }
          function R(l, f, k, L) {
            k = Number(k) || 0;
            var U = l.length - k;
            L ? (L = Number(L)) > U && (L = U) : L = U;
            var B = f.length;
            if (B % 2 != 0) throw new TypeError("Invalid hex string");
            L > B / 2 && (L = B / 2);
            for (var he = 0; he < L; ++he) {
              var je = parseInt(f.substr(2 * he, 2), 16);
              if (isNaN(je)) return he;
              l[k + he] = je;
            }
            return he;
          }
          function oe(l, f, k, L) {
            return me(G(f, l.length - k), l, k, L);
          }
          function K(l, f, k, L) {
            return me(function(U) {
              for (var B = [], he = 0; he < U.length; ++he) B.push(255 & U.charCodeAt(he));
              return B;
            }(f), l, k, L);
          }
          function I(l, f, k, L) {
            return K(l, f, k, L);
          }
          function A(l, f, k, L) {
            return me(Y(f), l, k, L);
          }
          function se(l, f, k, L) {
            return me(function(U, B) {
              for (var he, je, Re, Xe = [], Ve = 0; Ve < U.length && !((B -= 2) < 0); ++Ve) he = U.charCodeAt(Ve), je = he >> 8, Re = he % 256, Xe.push(Re), Xe.push(je);
              return Xe;
            }(f, l.length - k), l, k, L);
          }
          function le(l, f, k) {
            return f === 0 && k === l.length ? o.fromByteArray(l) : o.fromByteArray(l.slice(f, k));
          }
          function te(l, f, k) {
            k = Math.min(l.length, k);
            for (var L = [], U = f; U < k; ) {
              var B, he, je, Re, Xe = l[U], Ve = null, At = Xe > 239 ? 4 : Xe > 223 ? 3 : Xe > 191 ? 2 : 1;
              if (U + At <= k) switch (At) {
                case 1:
                  Xe < 128 && (Ve = Xe);
                  break;
                case 2:
                  (192 & (B = l[U + 1])) == 128 && (Re = (31 & Xe) << 6 | 63 & B) > 127 && (Ve = Re);
                  break;
                case 3:
                  B = l[U + 1], he = l[U + 2], (192 & B) == 128 && (192 & he) == 128 && (Re = (15 & Xe) << 12 | (63 & B) << 6 | 63 & he) > 2047 && (Re < 55296 || Re > 57343) && (Ve = Re);
                  break;
                case 4:
                  B = l[U + 1], he = l[U + 2], je = l[U + 3], (192 & B) == 128 && (192 & he) == 128 && (192 & je) == 128 && (Re = (15 & Xe) << 18 | (63 & B) << 12 | (63 & he) << 6 | 63 & je) > 65535 && Re < 1114112 && (Ve = Re);
              }
              Ve === null ? (Ve = 65533, At = 1) : Ve > 65535 && (Ve -= 65536, L.push(Ve >>> 10 & 1023 | 55296), Ve = 56320 | 1023 & Ve), L.push(Ve), U += At;
            }
            return function(kt) {
              var Zt = kt.length;
              if (Zt <= 4096) return String.fromCharCode.apply(String, kt);
              for (var wt = "", gt = 0; gt < Zt; ) wt += String.fromCharCode.apply(String, kt.slice(gt, gt += 4096));
              return wt;
            }(L);
          }
          s.Buffer = b, s.SlowBuffer = function(l) {
            return +l != l && (l = 0), b.alloc(+l);
          }, s.INSPECT_MAX_BYTES = 50, b.TYPED_ARRAY_SUPPORT = u.TYPED_ARRAY_SUPPORT !== void 0 ? u.TYPED_ARRAY_SUPPORT : function() {
            try {
              var l = new Uint8Array(1);
              return l.__proto__ = { __proto__: Uint8Array.prototype, foo: function() {
                return 42;
              } }, l.foo() === 42 && typeof l.subarray == "function" && l.subarray(1, 1).byteLength === 0;
            } catch {
              return !1;
            }
          }(), s.kMaxLength = g(), b.poolSize = 8192, b._augment = function(l) {
            return l.__proto__ = b.prototype, l;
          }, b.from = function(l, f, k) {
            return C(null, l, f, k);
          }, b.TYPED_ARRAY_SUPPORT && (b.prototype.__proto__ = Uint8Array.prototype, b.__proto__ = Uint8Array, typeof Symbol < "u" && Symbol.species && b[Symbol.species] === b && Object.defineProperty(b, Symbol.species, { value: null, configurable: !0 })), b.alloc = function(l, f, k) {
            return function(L, U, B, he) {
              return O(U), U <= 0 ? y(L, U) : B !== void 0 ? typeof he == "string" ? y(L, U).fill(B, he) : y(L, U).fill(B) : y(L, U);
            }(null, l, f, k);
          }, b.allocUnsafe = function(l) {
            return N(null, l);
          }, b.allocUnsafeSlow = function(l) {
            return N(null, l);
          }, b.isBuffer = function(l) {
            return !(l == null || !l._isBuffer);
          }, b.compare = function(l, f) {
            if (!b.isBuffer(l) || !b.isBuffer(f)) throw new TypeError("Arguments must be Buffers");
            if (l === f) return 0;
            for (var k = l.length, L = f.length, U = 0, B = Math.min(k, L); U < B; ++U) if (l[U] !== f[U]) {
              k = l[U], L = f[U];
              break;
            }
            return k < L ? -1 : L < k ? 1 : 0;
          }, b.isEncoding = function(l) {
            switch (String(l).toLowerCase()) {
              case "hex":
              case "utf8":
              case "utf-8":
              case "ascii":
              case "latin1":
              case "binary":
              case "base64":
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return !0;
              default:
                return !1;
            }
          }, b.concat = function(l, f) {
            if (!m(l)) throw new TypeError('"list" argument must be an Array of Buffers');
            if (l.length === 0) return b.alloc(0);
            var k;
            if (f === void 0) for (f = 0, k = 0; k < l.length; ++k) f += l[k].length;
            var L = b.allocUnsafe(f), U = 0;
            for (k = 0; k < l.length; ++k) {
              var B = l[k];
              if (!b.isBuffer(B)) throw new TypeError('"list" argument must be an Array of Buffers');
              B.copy(L, U), U += B.length;
            }
            return L;
          }, b.byteLength = j, b.prototype._isBuffer = !0, b.prototype.swap16 = function() {
            var l = this.length;
            if (l % 2 != 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
            for (var f = 0; f < l; f += 2) P(this, f, f + 1);
            return this;
          }, b.prototype.swap32 = function() {
            var l = this.length;
            if (l % 4 != 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
            for (var f = 0; f < l; f += 4) P(this, f, f + 3), P(this, f + 1, f + 2);
            return this;
          }, b.prototype.swap64 = function() {
            var l = this.length;
            if (l % 8 != 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
            for (var f = 0; f < l; f += 8) P(this, f, f + 7), P(this, f + 1, f + 6), P(this, f + 2, f + 5), P(this, f + 3, f + 4);
            return this;
          }, b.prototype.toString = function() {
            var l = 0 | this.length;
            return l === 0 ? "" : arguments.length === 0 ? te(this, 0, l) : W.apply(this, arguments);
          }, b.prototype.equals = function(l) {
            if (!b.isBuffer(l)) throw new TypeError("Argument must be a Buffer");
            return this === l || b.compare(this, l) === 0;
          }, b.prototype.inspect = function() {
            var l = "", f = s.INSPECT_MAX_BYTES;
            return this.length > 0 && (l = this.toString("hex", 0, f).match(/.{2}/g).join(" "), this.length > f && (l += " ... ")), "<Buffer " + l + ">";
          }, b.prototype.compare = function(l, f, k, L, U) {
            if (!b.isBuffer(l)) throw new TypeError("Argument must be a Buffer");
            if (f === void 0 && (f = 0), k === void 0 && (k = l ? l.length : 0), L === void 0 && (L = 0), U === void 0 && (U = this.length), f < 0 || k > l.length || L < 0 || U > this.length) throw new RangeError("out of range index");
            if (L >= U && f >= k) return 0;
            if (L >= U) return -1;
            if (f >= k) return 1;
            if (this === l) return 0;
            for (var B = (U >>>= 0) - (L >>>= 0), he = (k >>>= 0) - (f >>>= 0), je = Math.min(B, he), Re = this.slice(L, U), Xe = l.slice(f, k), Ve = 0; Ve < je; ++Ve) if (Re[Ve] !== Xe[Ve]) {
              B = Re[Ve], he = Xe[Ve];
              break;
            }
            return B < he ? -1 : he < B ? 1 : 0;
          }, b.prototype.includes = function(l, f, k) {
            return this.indexOf(l, f, k) !== -1;
          }, b.prototype.indexOf = function(l, f, k) {
            return M(this, l, f, k, !0);
          }, b.prototype.lastIndexOf = function(l, f, k) {
            return M(this, l, f, k, !1);
          }, b.prototype.write = function(l, f, k, L) {
            if (f === void 0) L = "utf8", k = this.length, f = 0;
            else if (k === void 0 && typeof f == "string") L = f, k = this.length, f = 0;
            else {
              if (!isFinite(f)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
              f |= 0, isFinite(k) ? (k |= 0, L === void 0 && (L = "utf8")) : (L = k, k = void 0);
            }
            var U = this.length - f;
            if ((k === void 0 || k > U) && (k = U), l.length > 0 && (k < 0 || f < 0) || f > this.length) throw new RangeError("Attempt to write outside buffer bounds");
            L || (L = "utf8");
            for (var B = !1; ; ) switch (L) {
              case "hex":
                return R(this, l, f, k);
              case "utf8":
              case "utf-8":
                return oe(this, l, f, k);
              case "ascii":
                return K(this, l, f, k);
              case "latin1":
              case "binary":
                return I(this, l, f, k);
              case "base64":
                return A(this, l, f, k);
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return se(this, l, f, k);
              default:
                if (B) throw new TypeError("Unknown encoding: " + L);
                L = ("" + L).toLowerCase(), B = !0;
            }
          }, b.prototype.toJSON = function() {
            return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
          };
          function ue(l, f, k) {
            var L = "";
            k = Math.min(l.length, k);
            for (var U = f; U < k; ++U) L += String.fromCharCode(127 & l[U]);
            return L;
          }
          function ye(l, f, k) {
            var L = "";
            k = Math.min(l.length, k);
            for (var U = f; U < k; ++U) L += String.fromCharCode(l[U]);
            return L;
          }
          function Z(l, f, k) {
            var L = l.length;
            (!f || f < 0) && (f = 0), (!k || k < 0 || k > L) && (k = L);
            for (var U = "", B = f; B < k; ++B) U += Ze(l[B]);
            return U;
          }
          function fe(l, f, k) {
            for (var L = l.slice(f, k), U = "", B = 0; B < L.length; B += 2) U += String.fromCharCode(L[B] + 256 * L[B + 1]);
            return U;
          }
          function D(l, f, k) {
            if (l % 1 != 0 || l < 0) throw new RangeError("offset is not uint");
            if (l + f > k) throw new RangeError("Trying to access beyond buffer length");
          }
          function ie(l, f, k, L, U, B) {
            if (!b.isBuffer(l)) throw new TypeError('"buffer" argument must be a Buffer instance');
            if (f > U || f < B) throw new RangeError('"value" argument is out of bounds');
            if (k + L > l.length) throw new RangeError("Index out of range");
          }
          function be(l, f, k, L) {
            f < 0 && (f = 65535 + f + 1);
            for (var U = 0, B = Math.min(l.length - k, 2); U < B; ++U) l[k + U] = (f & 255 << 8 * (L ? U : 1 - U)) >>> 8 * (L ? U : 1 - U);
          }
          function Te(l, f, k, L) {
            f < 0 && (f = 4294967295 + f + 1);
            for (var U = 0, B = Math.min(l.length - k, 4); U < B; ++U) l[k + U] = f >>> 8 * (L ? U : 3 - U) & 255;
          }
          function Ee(l, f, k, L, U, B) {
            if (k + L > l.length) throw new RangeError("Index out of range");
            if (k < 0) throw new RangeError("Index out of range");
          }
          function Pe(l, f, k, L, U) {
            return U || Ee(l, 0, k, 4), S.write(l, f, k, L, 23, 4), k + 4;
          }
          function Se(l, f, k, L, U) {
            return U || Ee(l, 0, k, 8), S.write(l, f, k, L, 52, 8), k + 8;
          }
          b.prototype.slice = function(l, f) {
            var k, L = this.length;
            if ((l = ~~l) < 0 ? (l += L) < 0 && (l = 0) : l > L && (l = L), (f = f === void 0 ? L : ~~f) < 0 ? (f += L) < 0 && (f = 0) : f > L && (f = L), f < l && (f = l), b.TYPED_ARRAY_SUPPORT) (k = this.subarray(l, f)).__proto__ = b.prototype;
            else {
              var U = f - l;
              k = new b(U, void 0);
              for (var B = 0; B < U; ++B) k[B] = this[B + l];
            }
            return k;
          }, b.prototype.readUIntLE = function(l, f, k) {
            l |= 0, f |= 0, k || D(l, f, this.length);
            for (var L = this[l], U = 1, B = 0; ++B < f && (U *= 256); ) L += this[l + B] * U;
            return L;
          }, b.prototype.readUIntBE = function(l, f, k) {
            l |= 0, f |= 0, k || D(l, f, this.length);
            for (var L = this[l + --f], U = 1; f > 0 && (U *= 256); ) L += this[l + --f] * U;
            return L;
          }, b.prototype.readUInt8 = function(l, f) {
            return f || D(l, 1, this.length), this[l];
          }, b.prototype.readUInt16LE = function(l, f) {
            return f || D(l, 2, this.length), this[l] | this[l + 1] << 8;
          }, b.prototype.readUInt16BE = function(l, f) {
            return f || D(l, 2, this.length), this[l] << 8 | this[l + 1];
          }, b.prototype.readUInt32LE = function(l, f) {
            return f || D(l, 4, this.length), (this[l] | this[l + 1] << 8 | this[l + 2] << 16) + 16777216 * this[l + 3];
          }, b.prototype.readUInt32BE = function(l, f) {
            return f || D(l, 4, this.length), 16777216 * this[l] + (this[l + 1] << 16 | this[l + 2] << 8 | this[l + 3]);
          }, b.prototype.readIntLE = function(l, f, k) {
            l |= 0, f |= 0, k || D(l, f, this.length);
            for (var L = this[l], U = 1, B = 0; ++B < f && (U *= 256); ) L += this[l + B] * U;
            return L >= (U *= 128) && (L -= Math.pow(2, 8 * f)), L;
          }, b.prototype.readIntBE = function(l, f, k) {
            l |= 0, f |= 0, k || D(l, f, this.length);
            for (var L = f, U = 1, B = this[l + --L]; L > 0 && (U *= 256); ) B += this[l + --L] * U;
            return B >= (U *= 128) && (B -= Math.pow(2, 8 * f)), B;
          }, b.prototype.readInt8 = function(l, f) {
            return f || D(l, 1, this.length), 128 & this[l] ? -1 * (255 - this[l] + 1) : this[l];
          }, b.prototype.readInt16LE = function(l, f) {
            f || D(l, 2, this.length);
            var k = this[l] | this[l + 1] << 8;
            return 32768 & k ? 4294901760 | k : k;
          }, b.prototype.readInt16BE = function(l, f) {
            f || D(l, 2, this.length);
            var k = this[l + 1] | this[l] << 8;
            return 32768 & k ? 4294901760 | k : k;
          }, b.prototype.readInt32LE = function(l, f) {
            return f || D(l, 4, this.length), this[l] | this[l + 1] << 8 | this[l + 2] << 16 | this[l + 3] << 24;
          }, b.prototype.readInt32BE = function(l, f) {
            return f || D(l, 4, this.length), this[l] << 24 | this[l + 1] << 16 | this[l + 2] << 8 | this[l + 3];
          }, b.prototype.readFloatLE = function(l, f) {
            return f || D(l, 4, this.length), S.read(this, l, !0, 23, 4);
          }, b.prototype.readFloatBE = function(l, f) {
            return f || D(l, 4, this.length), S.read(this, l, !1, 23, 4);
          }, b.prototype.readDoubleLE = function(l, f) {
            return f || D(l, 8, this.length), S.read(this, l, !0, 52, 8);
          }, b.prototype.readDoubleBE = function(l, f) {
            return f || D(l, 8, this.length), S.read(this, l, !1, 52, 8);
          }, b.prototype.writeUIntLE = function(l, f, k, L) {
            l = +l, f |= 0, k |= 0, L || ie(this, l, f, k, Math.pow(2, 8 * k) - 1, 0);
            var U = 1, B = 0;
            for (this[f] = 255 & l; ++B < k && (U *= 256); ) this[f + B] = l / U & 255;
            return f + k;
          }, b.prototype.writeUIntBE = function(l, f, k, L) {
            l = +l, f |= 0, k |= 0, L || ie(this, l, f, k, Math.pow(2, 8 * k) - 1, 0);
            var U = k - 1, B = 1;
            for (this[f + U] = 255 & l; --U >= 0 && (B *= 256); ) this[f + U] = l / B & 255;
            return f + k;
          }, b.prototype.writeUInt8 = function(l, f, k) {
            return l = +l, f |= 0, k || ie(this, l, f, 1, 255, 0), b.TYPED_ARRAY_SUPPORT || (l = Math.floor(l)), this[f] = 255 & l, f + 1;
          }, b.prototype.writeUInt16LE = function(l, f, k) {
            return l = +l, f |= 0, k || ie(this, l, f, 2, 65535, 0), b.TYPED_ARRAY_SUPPORT ? (this[f] = 255 & l, this[f + 1] = l >>> 8) : be(this, l, f, !0), f + 2;
          }, b.prototype.writeUInt16BE = function(l, f, k) {
            return l = +l, f |= 0, k || ie(this, l, f, 2, 65535, 0), b.TYPED_ARRAY_SUPPORT ? (this[f] = l >>> 8, this[f + 1] = 255 & l) : be(this, l, f, !1), f + 2;
          }, b.prototype.writeUInt32LE = function(l, f, k) {
            return l = +l, f |= 0, k || ie(this, l, f, 4, 4294967295, 0), b.TYPED_ARRAY_SUPPORT ? (this[f + 3] = l >>> 24, this[f + 2] = l >>> 16, this[f + 1] = l >>> 8, this[f] = 255 & l) : Te(this, l, f, !0), f + 4;
          }, b.prototype.writeUInt32BE = function(l, f, k) {
            return l = +l, f |= 0, k || ie(this, l, f, 4, 4294967295, 0), b.TYPED_ARRAY_SUPPORT ? (this[f] = l >>> 24, this[f + 1] = l >>> 16, this[f + 2] = l >>> 8, this[f + 3] = 255 & l) : Te(this, l, f, !1), f + 4;
          }, b.prototype.writeIntLE = function(l, f, k, L) {
            if (l = +l, f |= 0, !L) {
              var U = Math.pow(2, 8 * k - 1);
              ie(this, l, f, k, U - 1, -U);
            }
            var B = 0, he = 1, je = 0;
            for (this[f] = 255 & l; ++B < k && (he *= 256); ) l < 0 && je === 0 && this[f + B - 1] !== 0 && (je = 1), this[f + B] = (l / he >> 0) - je & 255;
            return f + k;
          }, b.prototype.writeIntBE = function(l, f, k, L) {
            if (l = +l, f |= 0, !L) {
              var U = Math.pow(2, 8 * k - 1);
              ie(this, l, f, k, U - 1, -U);
            }
            var B = k - 1, he = 1, je = 0;
            for (this[f + B] = 255 & l; --B >= 0 && (he *= 256); ) l < 0 && je === 0 && this[f + B + 1] !== 0 && (je = 1), this[f + B] = (l / he >> 0) - je & 255;
            return f + k;
          }, b.prototype.writeInt8 = function(l, f, k) {
            return l = +l, f |= 0, k || ie(this, l, f, 1, 127, -128), b.TYPED_ARRAY_SUPPORT || (l = Math.floor(l)), l < 0 && (l = 255 + l + 1), this[f] = 255 & l, f + 1;
          }, b.prototype.writeInt16LE = function(l, f, k) {
            return l = +l, f |= 0, k || ie(this, l, f, 2, 32767, -32768), b.TYPED_ARRAY_SUPPORT ? (this[f] = 255 & l, this[f + 1] = l >>> 8) : be(this, l, f, !0), f + 2;
          }, b.prototype.writeInt16BE = function(l, f, k) {
            return l = +l, f |= 0, k || ie(this, l, f, 2, 32767, -32768), b.TYPED_ARRAY_SUPPORT ? (this[f] = l >>> 8, this[f + 1] = 255 & l) : be(this, l, f, !1), f + 2;
          }, b.prototype.writeInt32LE = function(l, f, k) {
            return l = +l, f |= 0, k || ie(this, l, f, 4, 2147483647, -2147483648), b.TYPED_ARRAY_SUPPORT ? (this[f] = 255 & l, this[f + 1] = l >>> 8, this[f + 2] = l >>> 16, this[f + 3] = l >>> 24) : Te(this, l, f, !0), f + 4;
          }, b.prototype.writeInt32BE = function(l, f, k) {
            return l = +l, f |= 0, k || ie(this, l, f, 4, 2147483647, -2147483648), l < 0 && (l = 4294967295 + l + 1), b.TYPED_ARRAY_SUPPORT ? (this[f] = l >>> 24, this[f + 1] = l >>> 16, this[f + 2] = l >>> 8, this[f + 3] = 255 & l) : Te(this, l, f, !1), f + 4;
          }, b.prototype.writeFloatLE = function(l, f, k) {
            return Pe(this, l, f, !0, k);
          }, b.prototype.writeFloatBE = function(l, f, k) {
            return Pe(this, l, f, !1, k);
          }, b.prototype.writeDoubleLE = function(l, f, k) {
            return Se(this, l, f, !0, k);
          }, b.prototype.writeDoubleBE = function(l, f, k) {
            return Se(this, l, f, !1, k);
          }, b.prototype.copy = function(l, f, k, L) {
            if (k || (k = 0), L || L === 0 || (L = this.length), f >= l.length && (f = l.length), f || (f = 0), L > 0 && L < k && (L = k), L === k || l.length === 0 || this.length === 0) return 0;
            if (f < 0) throw new RangeError("targetStart out of bounds");
            if (k < 0 || k >= this.length) throw new RangeError("sourceStart out of bounds");
            if (L < 0) throw new RangeError("sourceEnd out of bounds");
            L > this.length && (L = this.length), l.length - f < L - k && (L = l.length - f + k);
            var U, B = L - k;
            if (this === l && k < f && f < L) for (U = B - 1; U >= 0; --U) l[U + f] = this[U + k];
            else if (B < 1e3 || !b.TYPED_ARRAY_SUPPORT) for (U = 0; U < B; ++U) l[U + f] = this[U + k];
            else Uint8Array.prototype.set.call(l, this.subarray(k, k + B), f);
            return B;
          }, b.prototype.fill = function(l, f, k, L) {
            if (typeof l == "string") {
              if (typeof f == "string" ? (L = f, f = 0, k = this.length) : typeof k == "string" && (L = k, k = this.length), l.length === 1) {
                var U = l.charCodeAt(0);
                U < 256 && (l = U);
              }
              if (L !== void 0 && typeof L != "string") throw new TypeError("encoding must be a string");
              if (typeof L == "string" && !b.isEncoding(L)) throw new TypeError("Unknown encoding: " + L);
            } else typeof l == "number" && (l &= 255);
            if (f < 0 || this.length < f || this.length < k) throw new RangeError("Out of range index");
            if (k <= f) return this;
            var B;
            if (f >>>= 0, k = k === void 0 ? this.length : k >>> 0, l || (l = 0), typeof l == "number") for (B = f; B < k; ++B) this[B] = l;
            else {
              var he = b.isBuffer(l) ? l : G(new b(l, L).toString()), je = he.length;
              for (B = 0; B < k - f; ++B) this[B + f] = he[B % je];
            }
            return this;
          };
          var ze = /[^+\/0-9A-Za-z-_]/g;
          function Ze(l) {
            return l < 16 ? "0" + l.toString(16) : l.toString(16);
          }
          function G(l, f) {
            var k;
            f = f || 1 / 0;
            for (var L = l.length, U = null, B = [], he = 0; he < L; ++he) {
              if ((k = l.charCodeAt(he)) > 55295 && k < 57344) {
                if (!U) {
                  if (k > 56319) {
                    (f -= 3) > -1 && B.push(239, 191, 189);
                    continue;
                  }
                  if (he + 1 === L) {
                    (f -= 3) > -1 && B.push(239, 191, 189);
                    continue;
                  }
                  U = k;
                  continue;
                }
                if (k < 56320) {
                  (f -= 3) > -1 && B.push(239, 191, 189), U = k;
                  continue;
                }
                k = 65536 + (U - 55296 << 10 | k - 56320);
              } else U && (f -= 3) > -1 && B.push(239, 191, 189);
              if (U = null, k < 128) {
                if ((f -= 1) < 0) break;
                B.push(k);
              } else if (k < 2048) {
                if ((f -= 2) < 0) break;
                B.push(k >> 6 | 192, 63 & k | 128);
              } else if (k < 65536) {
                if ((f -= 3) < 0) break;
                B.push(k >> 12 | 224, k >> 6 & 63 | 128, 63 & k | 128);
              } else {
                if (!(k < 1114112)) throw new Error("Invalid code point");
                if ((f -= 4) < 0) break;
                B.push(k >> 18 | 240, k >> 12 & 63 | 128, k >> 6 & 63 | 128, 63 & k | 128);
              }
            }
            return B;
          }
          function Y(l) {
            return o.toByteArray(function(f) {
              if ((f = function(k) {
                return k.trim ? k.trim() : k.replace(/^\s+|\s+$/g, "");
              }(f).replace(ze, "")).length < 2) return "";
              for (; f.length % 4 != 0; ) f += "=";
              return f;
            }(l));
          }
          function me(l, f, k, L) {
            for (var U = 0; U < L && !(U + k >= f.length || U >= l.length); ++U) f[U + k] = l[U];
            return U;
          }
        }).call(this, d(15));
      }, function(E, s, d) {
        s.byteLength = function(O) {
          var N = b(O), J = N[0], Q = N[1];
          return 3 * (J + Q) / 4 - Q;
        }, s.toByteArray = function(O) {
          var N, J, Q = b(O), j = Q[0], W = Q[1], P = new S(function(R, oe, K) {
            return 3 * (oe + K) / 4 - K;
          }(0, j, W)), M = 0, F = W > 0 ? j - 4 : j;
          for (J = 0; J < F; J += 4) N = o[O.charCodeAt(J)] << 18 | o[O.charCodeAt(J + 1)] << 12 | o[O.charCodeAt(J + 2)] << 6 | o[O.charCodeAt(J + 3)], P[M++] = N >> 16 & 255, P[M++] = N >> 8 & 255, P[M++] = 255 & N;
          return W === 2 && (N = o[O.charCodeAt(J)] << 2 | o[O.charCodeAt(J + 1)] >> 4, P[M++] = 255 & N), W === 1 && (N = o[O.charCodeAt(J)] << 10 | o[O.charCodeAt(J + 1)] << 4 | o[O.charCodeAt(J + 2)] >> 2, P[M++] = N >> 8 & 255, P[M++] = 255 & N), P;
        }, s.fromByteArray = function(O) {
          for (var N, J = O.length, Q = J % 3, j = [], W = 0, P = J - Q; W < P; W += 16383) j.push(C(O, W, W + 16383 > P ? P : W + 16383));
          return Q === 1 ? (N = O[J - 1], j.push(u[N >> 2] + u[N << 4 & 63] + "==")) : Q === 2 && (N = (O[J - 2] << 8) + O[J - 1], j.push(u[N >> 10] + u[N >> 4 & 63] + u[N << 2 & 63] + "=")), j.join("");
        };
        for (var u = [], o = [], S = typeof Uint8Array < "u" ? Uint8Array : Array, m = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", g = 0, y = m.length; g < y; ++g) u[g] = m[g], o[m.charCodeAt(g)] = g;
        function b(O) {
          var N = O.length;
          if (N % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
          var J = O.indexOf("=");
          return J === -1 && (J = N), [J, J === N ? 0 : 4 - J % 4];
        }
        function C(O, N, J) {
          for (var Q, j, W = [], P = N; P < J; P += 3) Q = (O[P] << 16 & 16711680) + (O[P + 1] << 8 & 65280) + (255 & O[P + 2]), W.push(u[(j = Q) >> 18 & 63] + u[j >> 12 & 63] + u[j >> 6 & 63] + u[63 & j]);
          return W.join("");
        }
        o[45] = 62, o[95] = 63;
      }, function(E, s) {
        s.read = function(d, u, o, S, m) {
          var g, y, b = 8 * m - S - 1, C = (1 << b) - 1, O = C >> 1, N = -7, J = o ? m - 1 : 0, Q = o ? -1 : 1, j = d[u + J];
          for (J += Q, g = j & (1 << -N) - 1, j >>= -N, N += b; N > 0; g = 256 * g + d[u + J], J += Q, N -= 8) ;
          for (y = g & (1 << -N) - 1, g >>= -N, N += S; N > 0; y = 256 * y + d[u + J], J += Q, N -= 8) ;
          if (g === 0) g = 1 - O;
          else {
            if (g === C) return y ? NaN : 1 / 0 * (j ? -1 : 1);
            y += Math.pow(2, S), g -= O;
          }
          return (j ? -1 : 1) * y * Math.pow(2, g - S);
        }, s.write = function(d, u, o, S, m, g) {
          var y, b, C, O = 8 * g - m - 1, N = (1 << O) - 1, J = N >> 1, Q = m === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, j = S ? 0 : g - 1, W = S ? 1 : -1, P = u < 0 || u === 0 && 1 / u < 0 ? 1 : 0;
          for (u = Math.abs(u), isNaN(u) || u === 1 / 0 ? (b = isNaN(u) ? 1 : 0, y = N) : (y = Math.floor(Math.log(u) / Math.LN2), u * (C = Math.pow(2, -y)) < 1 && (y--, C *= 2), (u += y + J >= 1 ? Q / C : Q * Math.pow(2, 1 - J)) * C >= 2 && (y++, C /= 2), y + J >= N ? (b = 0, y = N) : y + J >= 1 ? (b = (u * C - 1) * Math.pow(2, m), y += J) : (b = u * Math.pow(2, J - 1) * Math.pow(2, m), y = 0)); m >= 8; d[o + j] = 255 & b, j += W, b /= 256, m -= 8) ;
          for (y = y << m | b, O += m; O > 0; d[o + j] = 255 & y, j += W, y /= 256, O -= 8) ;
          d[o + j - W] |= 128 * P;
        };
      }, function(E, s) {
        var d = {}.toString;
        E.exports = Array.isArray || function(u) {
          return d.call(u) == "[object Array]";
        };
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.arrayToString = void 0, s.arrayToString = (u, o, S) => {
          const m = u.map(function(y, b) {
            const C = S(y, b);
            return C === void 0 ? String(C) : o + C.split(`
`).join(`
` + o);
          }).join(o ? `,
` : ","), g = o && m ? `
` : "";
          return `[${g}${m}${g}]`;
        };
      }, function(E, s, d) {
        function u(j) {
          return (u = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(W) {
            return typeof W;
          } : function(W) {
            return W && typeof Symbol == "function" && W.constructor === Symbol && W !== Symbol.prototype ? "symbol" : typeof W;
          })(j);
        }
        Object.defineProperty(s, "__esModule", { value: !0 }), s.matchesSelector = O, s.matchesSelectorAndParentsTo = function(j, W, P) {
          var M = j;
          do {
            if (O(M, W)) return !0;
            if (M === P) return !1;
            M = M.parentNode;
          } while (M);
          return !1;
        }, s.addEvent = function(j, W, P, M) {
          if (j) {
            var F = y({ capture: !0 }, M);
            j.addEventListener ? j.addEventListener(W, P, F) : j.attachEvent ? j.attachEvent("on" + W, P) : j["on" + W] = P;
          }
        }, s.removeEvent = function(j, W, P, M) {
          if (j) {
            var F = y({ capture: !0 }, M);
            j.removeEventListener ? j.removeEventListener(W, P, F) : j.detachEvent ? j.detachEvent("on" + W, P) : j["on" + W] = null;
          }
        }, s.outerHeight = function(j) {
          var W = j.clientHeight, P = j.ownerDocument.defaultView.getComputedStyle(j);
          return W += (0, o.int)(P.borderTopWidth), W += (0, o.int)(P.borderBottomWidth);
        }, s.outerWidth = function(j) {
          var W = j.clientWidth, P = j.ownerDocument.defaultView.getComputedStyle(j);
          return W += (0, o.int)(P.borderLeftWidth), W += (0, o.int)(P.borderRightWidth);
        }, s.innerHeight = function(j) {
          var W = j.clientHeight, P = j.ownerDocument.defaultView.getComputedStyle(j);
          return W -= (0, o.int)(P.paddingTop), W -= (0, o.int)(P.paddingBottom);
        }, s.innerWidth = function(j) {
          var W = j.clientWidth, P = j.ownerDocument.defaultView.getComputedStyle(j);
          return W -= (0, o.int)(P.paddingLeft), W -= (0, o.int)(P.paddingRight);
        }, s.offsetXYFromParent = function(j, W, P) {
          var M = W === W.ownerDocument.body ? { left: 0, top: 0 } : W.getBoundingClientRect(), F = (j.clientX + W.scrollLeft - M.left) / P, R = (j.clientY + W.scrollTop - M.top) / P;
          return { x: F, y: R };
        }, s.createCSSTransform = function(j, W) {
          var P = N(j, W, "px");
          return b({}, (0, S.browserPrefixToKey)("transform", S.default), P);
        }, s.createSVGTransform = function(j, W) {
          return N(j, W, "");
        }, s.getTranslation = N, s.getTouch = function(j, W) {
          return j.targetTouches && (0, o.findInArray)(j.targetTouches, function(P) {
            return W === P.identifier;
          }) || j.changedTouches && (0, o.findInArray)(j.changedTouches, function(P) {
            return W === P.identifier;
          });
        }, s.getTouchIdentifier = function(j) {
          if (j.targetTouches && j.targetTouches[0]) return j.targetTouches[0].identifier;
          if (j.changedTouches && j.changedTouches[0]) return j.changedTouches[0].identifier;
        }, s.addUserSelectStyles = function(j) {
          if (j) {
            var W = j.getElementById("react-draggable-style-el");
            W || ((W = j.createElement("style")).type = "text/css", W.id = "react-draggable-style-el", W.innerHTML = `.react-draggable-transparent-selection *::-moz-selection {all: inherit;}
`, W.innerHTML += `.react-draggable-transparent-selection *::selection {all: inherit;}
`, j.getElementsByTagName("head")[0].appendChild(W)), j.body && J(j.body, "react-draggable-transparent-selection");
          }
        }, s.removeUserSelectStyles = function(j) {
          if (j)
            try {
              if (j.body && Q(j.body, "react-draggable-transparent-selection"), j.selection) j.selection.empty();
              else {
                var W = (j.defaultView || window).getSelection();
                W && W.type !== "Caret" && W.removeAllRanges();
              }
            } catch {
            }
        }, s.addClassName = J, s.removeClassName = Q;
        var o = d(20), S = function(j) {
          if (j && j.__esModule) return j;
          if (j === null || u(j) !== "object" && typeof j != "function") return { default: j };
          var W = m();
          if (W && W.has(j)) return W.get(j);
          var P = {}, M = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var F in j) if (Object.prototype.hasOwnProperty.call(j, F)) {
            var R = M ? Object.getOwnPropertyDescriptor(j, F) : null;
            R && (R.get || R.set) ? Object.defineProperty(P, F, R) : P[F] = j[F];
          }
          return P.default = j, W && W.set(j, P), P;
        }(d(56));
        function m() {
          if (typeof WeakMap != "function") return null;
          var j = /* @__PURE__ */ new WeakMap();
          return m = function() {
            return j;
          }, j;
        }
        function g(j, W) {
          var P = Object.keys(j);
          if (Object.getOwnPropertySymbols) {
            var M = Object.getOwnPropertySymbols(j);
            W && (M = M.filter(function(F) {
              return Object.getOwnPropertyDescriptor(j, F).enumerable;
            })), P.push.apply(P, M);
          }
          return P;
        }
        function y(j) {
          for (var W = 1; W < arguments.length; W++) {
            var P = arguments[W] != null ? arguments[W] : {};
            W % 2 ? g(Object(P), !0).forEach(function(M) {
              b(j, M, P[M]);
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(j, Object.getOwnPropertyDescriptors(P)) : g(Object(P)).forEach(function(M) {
              Object.defineProperty(j, M, Object.getOwnPropertyDescriptor(P, M));
            });
          }
          return j;
        }
        function b(j, W, P) {
          return W in j ? Object.defineProperty(j, W, { value: P, enumerable: !0, configurable: !0, writable: !0 }) : j[W] = P, j;
        }
        var C = "";
        function O(j, W) {
          return C || (C = (0, o.findInArray)(["matches", "webkitMatchesSelector", "mozMatchesSelector", "msMatchesSelector", "oMatchesSelector"], function(P) {
            return (0, o.isFunction)(j[P]);
          })), !!(0, o.isFunction)(j[C]) && j[C](W);
        }
        function N(j, W, P) {
          var M = j.x, F = j.y, R = "translate(".concat(M).concat(P, ",").concat(F).concat(P, ")");
          if (W) {
            var oe = "".concat(typeof W.x == "string" ? W.x : W.x + P), K = "".concat(typeof W.y == "string" ? W.y : W.y + P);
            R = "translate(".concat(oe, ", ").concat(K, ")") + R;
          }
          return R;
        }
        function J(j, W) {
          j.classList ? j.classList.add(W) : j.className.match(new RegExp("(?:^|\\s)".concat(W, "(?!\\S)"))) || (j.className += " ".concat(W));
        }
        function Q(j, W) {
          j.classList ? j.classList.remove(W) : j.className = j.className.replace(new RegExp("(?:^|\\s)".concat(W, "(?!\\S)"), "g"), "");
        }
      }, function(E, s) {
        E.exports = function(d) {
          return d.webpackPolyfill || (d.deprecate = function() {
          }, d.paths = [], d.children || (d.children = []), Object.defineProperty(d, "loaded", { enumerable: !0, get: function() {
            return d.l;
          } }), Object.defineProperty(d, "id", { enumerable: !0, get: function() {
            return d.i;
          } }), d.webpackPolyfill = 1), d;
        };
      }, function(E, s, d) {
        var u = d(6), o = d(35);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, `.ck-inspector{--ck-inspector-color-tree-node-hover:#eaf2fb;--ck-inspector-color-tree-node-name:#882680;--ck-inspector-color-tree-node-attribute-name:#8a8a8a;--ck-inspector-color-tree-node-tag:#aaa;--ck-inspector-color-tree-node-attribute:#9a4819;--ck-inspector-color-tree-node-attribute-value:#2a43ac;--ck-inspector-color-tree-text-border:#b7b7b7;--ck-inspector-color-tree-node-border-hover:#b0c6e0;--ck-inspector-color-tree-content-delimiter:#ddd;--ck-inspector-color-tree-node-active-bg:#f5faff;--ck-inspector-color-tree-node-name-active-bg:#2b98f0;--ck-inspector-color-tree-node-inactive:#8a8a8a;--ck-inspector-color-tree-selection:#ff1744;--ck-inspector-color-tree-position:#000;--ck-inspector-color-comment:green}.ck-inspector .ck-inspector-tree{background:var(--ck-inspector-color-white);padding:1em;width:100%;height:100%;overflow:auto;user-select:none}.ck-inspector-tree .ck-inspector-tree-node__attribute{font:inherit;margin-left:.4em;color:var(--ck-inspector-color-tree-node-tag)}.ck-inspector-tree .ck-inspector-tree-node__attribute .ck-inspector-tree-node__attribute__name{color:var(--ck-inspector-color-tree-node-attribute)}.ck-inspector-tree .ck-inspector-tree-node__attribute .ck-inspector-tree-node__attribute__value{color:var(--ck-inspector-color-tree-node-attribute-value)}.ck-inspector-tree .ck-inspector-tree-node__attribute .ck-inspector-tree-node__attribute__value:before{content:'="'}.ck-inspector-tree .ck-inspector-tree-node__attribute .ck-inspector-tree-node__attribute__value:after{content:'"'}.ck-inspector-tree .ck-inspector-tree-node .ck-inspector-tree-node__name{color:var(--ck-inspector-color-tree-node-name);display:inline-block;width:100%;padding:0 .1em;border-left:1px solid transparent}.ck-inspector-tree .ck-inspector-tree-node .ck-inspector-tree-node__name:hover{background:var(--ck-inspector-color-tree-node-hover)}.ck-inspector-tree .ck-inspector-tree-node .ck-inspector-tree-node__content{padding:1px .5em 1px 1.5em;border-left:1px solid var(--ck-inspector-color-tree-content-delimiter);white-space:pre-wrap}.ck-inspector-tree .ck-inspector-tree-node:not(.ck-inspector-tree-node_tagless) .ck-inspector-tree-node__name>.ck-inspector-tree-node__name__bracket_open:after{content:"<";color:var(--ck-inspector-color-tree-node-tag)}.ck-inspector-tree .ck-inspector-tree-node:not(.ck-inspector-tree-node_tagless) .ck-inspector-tree-node__name .ck-inspector-tree-node__name__bracket_close:after{content:">";color:var(--ck-inspector-color-tree-node-tag)}.ck-inspector-tree .ck-inspector-tree-node:not(.ck-inspector-tree-node_tagless).ck-inspector-tree-node_empty .ck-inspector-tree-node__name:after{content:" />"}.ck-inspector-tree .ck-inspector-tree-node.ck-inspector-tree-node_tagless .ck-inspector-tree-node__content{display:none}.ck-inspector-tree .ck-inspector-tree-node.ck-inspector-tree-node_active>.ck-inspector-tree-node__name:not(.ck-inspector-tree-node__name_close),.ck-inspector-tree .ck-inspector-tree-node.ck-inspector-tree-node_active>.ck-inspector-tree-node__name:not(.ck-inspector-tree-node__name_close) :not(.ck-inspector-tree__position),.ck-inspector-tree .ck-inspector-tree-node.ck-inspector-tree-node_active>.ck-inspector-tree-node__name:not(.ck-inspector-tree-node__name_close)>.ck-inspector-tree-node__name__bracket:after{background:var(--ck-inspector-color-tree-node-name-active-bg);color:var(--ck-inspector-color-white)}.ck-inspector-tree .ck-inspector-tree-node.ck-inspector-tree-node_active>.ck-inspector-tree-node__content,.ck-inspector-tree .ck-inspector-tree-node.ck-inspector-tree-node_active>.ck-inspector-tree-node__name_close{background:var(--ck-inspector-color-tree-node-active-bg)}.ck-inspector-tree .ck-inspector-tree-node.ck-inspector-tree-node_active>.ck-inspector-tree-node__content{border-left-color:var(--ck-inspector-color-tree-node-name-active-bg)}.ck-inspector-tree .ck-inspector-tree-node.ck-inspector-tree-node_active>.ck-inspector-tree-node__name{border-left:1px solid var(--ck-inspector-color-tree-node-name-active-bg)}.ck-inspector-tree .ck-inspector-tree-node.ck-inspector-tree-node_disabled{opacity:.8}.ck-inspector-tree .ck-inspector-tree-node.ck-inspector-tree-node_disabled .ck-inspector-tree-node__name,.ck-inspector-tree .ck-inspector-tree-node.ck-inspector-tree-node_disabled .ck-inspector-tree-node__name *{color:var(--ck-inspector-color-tree-node-inactive)}.ck-inspector-tree .ck-inspector-tree-text{display:block;margin-bottom:1px}.ck-inspector-tree .ck-inspector-tree-text .ck-inspector-tree-node__content{border:1px dotted var(--ck-inspector-color-tree-text-border);border-radius:2px;padding:0 1px;margin-right:1px;display:inline-block;word-break:break-all}.ck-inspector-tree .ck-inspector-tree-text .ck-inspector-tree-text__attributes:not(:empty){margin-right:.5em}.ck-inspector-tree .ck-inspector-tree-text .ck-inspector-tree-text__attributes .ck-inspector-tree-node__attribute{background:var(--ck-inspector-color-tree-node-attribute-name);border-radius:2px;padding:0 .5em}.ck-inspector-tree .ck-inspector-tree-text .ck-inspector-tree-text__attributes .ck-inspector-tree-node__attribute+.ck-inspector-tree-node__attribute{margin-left:.2em}.ck-inspector-tree .ck-inspector-tree-text .ck-inspector-tree-text__attributes .ck-inspector-tree-node__attribute>*{color:var(--ck-inspector-color-white)}.ck-inspector-tree .ck-inspector-tree-text .ck-inspector-tree-text__attributes .ck-inspector-tree-node__attribute:first-child{margin-left:0}.ck-inspector-tree .ck-inspector-tree-text.ck-inspector-tree-node_active .ck-inspector-tree-node__content{border-style:solid;border-color:var(--ck-inspector-color-tree-node-name-active-bg)}.ck-inspector-tree .ck-inspector-tree-text.ck-inspector-tree-node_active .ck-inspector-tree-node__attribute{background:var(--ck-inspector-color-white)}.ck-inspector-tree .ck-inspector-tree-text.ck-inspector-tree-node_active .ck-inspector-tree-node__attribute>*{color:var(--ck-inspector-color-tree-node-name-active-bg)}.ck-inspector-tree .ck-inspector-tree-text.ck-inspector-tree-node_active>.ck-inspector-tree-node__content{background:var(--ck-inspector-color-tree-node-name-active-bg);color:var(--ck-inspector-color-white)}.ck-inspector-tree .ck-inspector-tree-text:not(.ck-inspector-tree-node_active) .ck-inspector-tree-node__content:hover{background:var(--ck-inspector-color-tree-node-hover);border-style:solid;border-color:var(--ck-inspector-color-tree-node-border-hover)}.ck-inspector-tree.ck-inspector-tree_text-direction_ltr .ck-inspector-tree-node__content{direction:ltr}.ck-inspector-tree.ck-inspector-tree_text-direction_rtl .ck-inspector-tree-node__content{direction:rtl}.ck-inspector-tree.ck-inspector-tree_text-direction_rtl .ck-inspector-tree-node__content .ck-inspector-tree-node__name{direction:ltr}.ck-inspector-tree.ck-inspector-tree_text-direction_rtl .ck-inspector-tree__position{transform:rotate(180deg)}.ck-inspector-tree .ck-inspector-tree-comment{color:var(--ck-inspector-color-comment);font-style:italic}.ck-inspector-tree .ck-inspector-tree-comment a{color:inherit;text-decoration:underline}.ck-inspector-tree_compact-text .ck-inspector-tree-text,.ck-inspector-tree_compact-text .ck-inspector-tree-text .ck-inspector-tree-node__content{display:inline}.ck-inspector .ck-inspector__tree__navigation{padding:.5em 1em;border-bottom:1px solid var(--ck-inspector-color-border)}.ck-inspector .ck-inspector__tree__navigation label{margin-right:.5em}.ck-inspector-tree .ck-inspector-tree__position{display:inline-block;position:relative;cursor:default;height:100%;pointer-events:none;vertical-align:top}.ck-inspector-tree .ck-inspector-tree__position:after{content:"";position:absolute;border:1px solid var(--ck-inspector-color-tree-position);width:0;top:0;bottom:0;margin-left:-1px}.ck-inspector-tree .ck-inspector-tree__position:before{margin-left:-1px}.ck-inspector-tree .ck-inspector-tree__position.ck-inspector-tree__position_selection{z-index:2;--ck-inspector-color-tree-position:var(--ck-inspector-color-tree-selection)}.ck-inspector-tree .ck-inspector-tree__position.ck-inspector-tree__position_selection:before{content:"";position:absolute;top:-1px;bottom:-1px;left:0;border-top:2px solid var(--ck-inspector-color-tree-position);border-bottom:2px solid var(--ck-inspector-color-tree-position);width:8px}.ck-inspector-tree .ck-inspector-tree__position.ck-inspector-tree__position_selection.ck-inspector-tree__position_end:before{right:-1px;left:auto}.ck-inspector-tree .ck-inspector-tree__position.ck-inspector-tree__position_marker{z-index:1}.ck-inspector-tree .ck-inspector-tree__position.ck-inspector-tree__position_marker:before{content:"";display:block;position:absolute;left:0;top:-1px;cursor:default;width:0;height:0;border-left:0 solid transparent;border-bottom:0 solid transparent;border-right:7px solid transparent;border-top:7px solid var(--ck-inspector-color-tree-position)}.ck-inspector-tree .ck-inspector-tree__position.ck-inspector-tree__position_marker.ck-inspector-tree__position_end:before{border-width:0 7px 7px 0;border-left-color:transparent;border-bottom-color:transparent;border-right-color:var(--ck-inspector-color-tree-position);border-top-color:transparent;left:-5px}`, ""]);
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.canUseDOM = s.SafeNodeList = s.SafeHTMLCollection = void 0;
        var u, o = d(82), S = ((u = o) && u.__esModule ? u : { default: u }).default, m = S.canUseDOM ? window.HTMLElement : {};
        s.SafeHTMLCollection = S.canUseDOM ? window.HTMLCollection : {}, s.SafeNodeList = S.canUseDOM ? window.NodeList : {}, s.canUseDOM = S.canUseDOM, s.default = m;
      }, function(E, s, d) {
        var u = d(6), o = d(38);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, `.ck-inspector,.ck-inspector-portal{--ck-inspector-color-white:#fff;--ck-inspector-color-black:#000;--ck-inspector-color-background:#f3f3f3;--ck-inspector-color-link:#005cc6;--ck-inspector-code-font-size:11px;--ck-inspector-code-font-family:monaco,Consolas,Lucida Console,monospace;--ck-inspector-color-border:#d0d0d0}.ck-inspector,.ck-inspector-portal,.ck-inspector-portal :not(select),.ck-inspector :not(select){box-sizing:border-box;width:auto;height:auto;position:static;margin:0;padding:0;border:0;background:transparent;text-decoration:none;transition:none;word-wrap:break-word;font-family:Arial,Helvetica Neue,Helvetica,sans-serif;font-size:12px;line-height:17px;font-weight:400;-webkit-font-smoothing:auto}.ck-inspector{overflow:hidden;border-collapse:collapse;color:var(--ck-inspector-color-black);text-align:left;white-space:normal;cursor:auto;float:none;background:var(--ck-inspector-color-background);border-top:1px solid var(--ck-inspector-color-border);z-index:9999}.ck-inspector.ck-inspector_collapsed>.ck-inspector-navbox>.ck-inspector-navbox__navigation .ck-inspector-horizontal-nav{display:none}.ck-inspector .ck-inspector-navbox__navigation__logo{background-size:contain;background-repeat:no-repeat;background-position:50%;display:block;overflow:hidden;text-indent:100px;align-self:center;white-space:nowrap;margin-right:1em;background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg width='68' height='64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M43.71 11.025a11.508 11.508 0 00-1.213 5.159c0 6.42 5.244 11.625 11.713 11.625.083 0 .167 0 .25-.002v16.282a5.464 5.464 0 01-2.756 4.739L30.986 60.7a5.548 5.548 0 01-5.512 0L4.756 48.828A5.464 5.464 0 012 44.089V20.344c0-1.955 1.05-3.76 2.756-4.738L25.474 3.733a5.548 5.548 0 015.512 0l12.724 7.292z' fill='%23FFF'/%3E%3Cpath d='M45.684 8.79a12.604 12.604 0 00-1.329 5.65c0 7.032 5.744 12.733 12.829 12.733.091 0 .183-.001.274-.003v17.834a5.987 5.987 0 01-3.019 5.19L31.747 63.196a6.076 6.076 0 01-6.037 0L3.02 50.193A5.984 5.984 0 010 45.003V18.997c0-2.14 1.15-4.119 3.019-5.19L25.71.804a6.076 6.076 0 016.037 0L45.684 8.79zm-29.44 11.89c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h25.489c.833 0 1.51-.67 1.51-1.498v-.715c0-.827-.677-1.498-1.51-1.498h-25.49zm0 9.227c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h18.479c.833 0 1.509-.67 1.509-1.498v-.715c0-.827-.676-1.498-1.51-1.498H16.244zm0 9.227c-.834 0-1.51.671-1.51 1.498v.715c0 .828.676 1.498 1.51 1.498h25.489c.833 0 1.51-.67 1.51-1.498v-.715c0-.827-.677-1.498-1.51-1.498h-25.49zm41.191-14.459c-5.835 0-10.565-4.695-10.565-10.486 0-5.792 4.73-10.487 10.565-10.487C63.27 3.703 68 8.398 68 14.19c0 5.791-4.73 10.486-10.565 10.486zm3.422-8.68c0-.467-.084-.875-.251-1.225a2.547 2.547 0 00-.686-.88 2.888 2.888 0 00-1.026-.531 4.418 4.418 0 00-1.259-.175c-.134 0-.283.006-.447.018a2.72 2.72 0 00-.446.07l.075-1.4h3.587v-1.8h-5.462l-.214 5.06c.319-.116.682-.21 1.089-.28.406-.071.77-.107 1.088-.107.218 0 .437.021.655.063.218.041.413.114.585.218s.313.244.422.419c.109.175.163.391.163.65 0 .424-.132.745-.396.961a1.434 1.434 0 01-.938.325c-.352 0-.656-.1-.912-.3-.256-.2-.43-.453-.523-.762l-1.925.588c.1.35.258.664.472.943.214.279.47.514.767.706.298.191.63.339.995.443.365.104.749.156 1.151.156.437 0 .86-.064 1.272-.193.41-.13.778-.323 1.1-.581a2.8 2.8 0 00.775-.981c.193-.396.29-.864.29-1.405z' fill='%231EBC61' fill-rule='nonzero'/%3E%3C/g%3E%3C/svg%3E");width:1.8em;height:1.8em;margin-left:1em}.ck-inspector .ck-inspector-navbox__navigation__toggle{margin-right:1em}.ck-inspector .ck-inspector-navbox__navigation__toggle.ck-inspector-navbox__navigation__toggle_up{transform:rotate(180deg)}.ck-inspector .ck-inspector-editor-selector{margin-left:auto;margin-right:.3em}@media screen and (max-width:680px){.ck-inspector .ck-inspector-editor-selector label{display:none}}.ck-inspector .ck-inspector-editor-selector select{margin-left:.5em}.ck-inspector .ck-inspector-code,.ck-inspector .ck-inspector-code *{font-size:var(--ck-inspector-code-font-size);font-family:var(--ck-inspector-code-font-family);cursor:default}.ck-inspector a{color:var(--ck-inspector-color-link);text-decoration:none}.ck-inspector a:hover{text-decoration:underline;cursor:pointer}.ck-inspector button{outline:0}.ck-inspector .ck-inspector-separator{border-right:1px solid var(--ck-inspector-color-border);display:inline-block;width:0;height:20px;margin:0 .5em;vertical-align:middle}`, ""]);
      }, function(E, s, d) {
        var u = d(49), o = { childContextTypes: !0, contextType: !0, contextTypes: !0, defaultProps: !0, displayName: !0, getDefaultProps: !0, getDerivedStateFromError: !0, getDerivedStateFromProps: !0, mixins: !0, propTypes: !0, type: !0 }, S = { name: !0, length: !0, prototype: !0, caller: !0, callee: !0, arguments: !0, arity: !0 }, m = { $$typeof: !0, compare: !0, defaultProps: !0, displayName: !0, propTypes: !0, type: !0 }, g = {};
        function y(j) {
          return u.isMemo(j) ? m : g[j.$$typeof] || o;
        }
        g[u.ForwardRef] = { $$typeof: !0, render: !0, defaultProps: !0, displayName: !0, propTypes: !0 }, g[u.Memo] = m;
        var b = Object.defineProperty, C = Object.getOwnPropertyNames, O = Object.getOwnPropertySymbols, N = Object.getOwnPropertyDescriptor, J = Object.getPrototypeOf, Q = Object.prototype;
        E.exports = function j(W, P, M) {
          if (typeof P != "string") {
            if (Q) {
              var F = J(P);
              F && F !== Q && j(W, F, M);
            }
            var R = C(P);
            O && (R = R.concat(O(P)));
            for (var oe = y(W), K = y(P), I = 0; I < R.length; ++I) {
              var A = R[I];
              if (!(S[A] || M && M[A] || K && K[A] || oe && oe[A])) {
                var se = N(P, A);
                try {
                  b(W, A, se);
                } catch {
                }
              }
            }
          }
          return W;
        };
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.getBoundPosition = function(m, g, y) {
          if (!m.props.bounds) return [g, y];
          var b = m.props.bounds;
          b = typeof b == "string" ? b : function(W) {
            return { left: W.left, top: W.top, right: W.right, bottom: W.bottom };
          }(b);
          var C = S(m);
          if (typeof b == "string") {
            var O, N = C.ownerDocument, J = N.defaultView;
            if (!((O = b === "parent" ? C.parentNode : N.querySelector(b)) instanceof J.HTMLElement)) throw new Error('Bounds selector "' + b + '" could not find an element.');
            var Q = J.getComputedStyle(C), j = J.getComputedStyle(O);
            b = { left: -C.offsetLeft + (0, u.int)(j.paddingLeft) + (0, u.int)(Q.marginLeft), top: -C.offsetTop + (0, u.int)(j.paddingTop) + (0, u.int)(Q.marginTop), right: (0, o.innerWidth)(O) - (0, o.outerWidth)(C) - C.offsetLeft + (0, u.int)(j.paddingRight) - (0, u.int)(Q.marginRight), bottom: (0, o.innerHeight)(O) - (0, o.outerHeight)(C) - C.offsetTop + (0, u.int)(j.paddingBottom) - (0, u.int)(Q.marginBottom) };
          }
          return (0, u.isNum)(b.right) && (g = Math.min(g, b.right)), (0, u.isNum)(b.bottom) && (y = Math.min(y, b.bottom)), (0, u.isNum)(b.left) && (g = Math.max(g, b.left)), (0, u.isNum)(b.top) && (y = Math.max(y, b.top)), [g, y];
        }, s.snapToGrid = function(m, g, y) {
          var b = Math.round(g / m[0]) * m[0], C = Math.round(y / m[1]) * m[1];
          return [b, C];
        }, s.canDragX = function(m) {
          return m.props.axis === "both" || m.props.axis === "x";
        }, s.canDragY = function(m) {
          return m.props.axis === "both" || m.props.axis === "y";
        }, s.getControlPosition = function(m, g, y) {
          var b = typeof g == "number" ? (0, o.getTouch)(m, g) : null;
          if (typeof g == "number" && !b) return null;
          var C = S(y), O = y.props.offsetParent || C.offsetParent || C.ownerDocument.body;
          return (0, o.offsetXYFromParent)(b || m, O, y.props.scale);
        }, s.createCoreData = function(m, g, y) {
          var b = m.state, C = !(0, u.isNum)(b.lastX), O = S(m);
          return C ? { node: O, deltaX: 0, deltaY: 0, lastX: g, lastY: y, x: g, y } : { node: O, deltaX: g - b.lastX, deltaY: y - b.lastY, lastX: b.lastX, lastY: b.lastY, x: g, y };
        }, s.createDraggableData = function(m, g) {
          var y = m.props.scale;
          return { node: g.node, x: m.state.x + g.deltaX / y, y: m.state.y + g.deltaY / y, deltaX: g.deltaX / y, deltaY: g.deltaY / y, lastX: m.state.x, lastY: m.state.y };
        };
        var u = d(20), o = d(32);
        function S(m) {
          var g = m.findDOMNode();
          if (!g) throw new Error("<DraggableCore>: Unmounted during event!");
          return g;
        }
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.default = function() {
        };
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.default = function g(y) {
          return [].slice.call(y.querySelectorAll("*"), 0).reduce(function(b, C) {
            return b.concat(C.shadowRoot ? g(C.shadowRoot) : [C]);
          }, []).filter(m);
        };
        var u = /input|select|textarea|button|object|iframe/;
        function o(g) {
          var y = g.offsetWidth <= 0 && g.offsetHeight <= 0;
          if (y && !g.innerHTML) return !0;
          try {
            var b = window.getComputedStyle(g);
            return y ? b.getPropertyValue("overflow") !== "visible" || g.scrollWidth <= 0 && g.scrollHeight <= 0 : b.getPropertyValue("display") == "none";
          } catch {
            return console.warn("Failed to inspect element style"), !1;
          }
        }
        function S(g, y) {
          var b = g.nodeName.toLowerCase();
          return (u.test(b) && !g.disabled || b === "a" && g.href || y) && function(C) {
            for (var O = C, N = C.getRootNode && C.getRootNode(); O && O !== document.body; ) {
              if (N && O === N && (O = N.host.parentNode), o(O)) return !1;
              O = O.parentNode;
            }
            return !0;
          }(g);
        }
        function m(g) {
          var y = g.getAttribute("tabindex");
          y === null && (y = void 0);
          var b = isNaN(y);
          return (b || y >= 0) && S(g, !b);
        }
        E.exports = s.default;
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.resetState = function() {
          g && (g.removeAttribute ? g.removeAttribute("aria-hidden") : g.length != null ? g.forEach(function(C) {
            return C.removeAttribute("aria-hidden");
          }) : document.querySelectorAll(g).forEach(function(C) {
            return C.removeAttribute("aria-hidden");
          })), g = null;
        }, s.log = function() {
        }, s.assertNodeList = y, s.setElement = function(C) {
          var O = C;
          if (typeof O == "string" && m.canUseDOM) {
            var N = document.querySelectorAll(O);
            y(N, O), O = N;
          }
          return g = O || g;
        }, s.validateElement = b, s.hide = function(C) {
          var O = !0, N = !1, J = void 0;
          try {
            for (var Q, j = b(C)[Symbol.iterator](); !(O = (Q = j.next()).done); O = !0)
              Q.value.setAttribute("aria-hidden", "true");
          } catch (W) {
            N = !0, J = W;
          } finally {
            try {
              !O && j.return && j.return();
            } finally {
              if (N) throw J;
            }
          }
        }, s.show = function(C) {
          var O = !0, N = !1, J = void 0;
          try {
            for (var Q, j = b(C)[Symbol.iterator](); !(O = (Q = j.next()).done); O = !0)
              Q.value.removeAttribute("aria-hidden");
          } catch (W) {
            N = !0, J = W;
          } finally {
            try {
              !O && j.return && j.return();
            } finally {
              if (N) throw J;
            }
          }
        }, s.documentNotReadyOrSSRTesting = function() {
          g = null;
        };
        var u, o = d(81), S = (u = o) && u.__esModule ? u : { default: u }, m = d(36), g = null;
        function y(C, O) {
          if (!C || !C.length) throw new Error("react-modal: No elements were found for selector " + O + ".");
        }
        function b(C) {
          var O = C || g;
          return O ? Array.isArray(O) || O instanceof HTMLCollection || O instanceof NodeList ? O : [O] : ((0, S.default)(!1, ["react-modal: App element is not defined.", "Please use `Modal.setAppElement(el)` or set `appElement={el}`.", "This is needed so screen readers don't see main content", "when modal is opened. It is not recommended, but you can opt-out", "by setting `ariaHideApp={false}`."].join(" ")), []);
        }
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.log = function() {
          console.log("portalOpenInstances ----------"), console.log(o.openInstances.length), o.openInstances.forEach(function(S) {
            return console.log(S);
          }), console.log("end portalOpenInstances ----------");
        }, s.resetState = function() {
          o = new u();
        };
        var u = function S() {
          var m = this;
          (function(g, y) {
            if (!(g instanceof y)) throw new TypeError("Cannot call a class as a function");
          })(this, S), this.register = function(g) {
            m.openInstances.indexOf(g) === -1 && (m.openInstances.push(g), m.emit("register"));
          }, this.deregister = function(g) {
            var y = m.openInstances.indexOf(g);
            y !== -1 && (m.openInstances.splice(y, 1), m.emit("deregister"));
          }, this.subscribe = function(g) {
            m.subscribers.push(g);
          }, this.emit = function(g) {
            m.subscribers.forEach(function(y) {
              return y(g, m.openInstances.slice());
            });
          }, this.openInstances = [], this.subscribers = [];
        }, o = new u();
        s.default = o;
      }, function(E, s, d) {
        E.exports = d(51);
      }, function(E, s, d) {
        var u = d(52), o = u.default, S = u.DraggableCore;
        E.exports = o, E.exports.default = o, E.exports.DraggableCore = S;
      }, function(E, s, d) {
        var u = d(76), o = { "text/plain": "Text", "text/html": "Url", default: "Text" };
        E.exports = function(S, m) {
          var g, y, b, C, O, N, J = !1;
          m || (m = {}), g = m.debug || !1;
          try {
            if (b = u(), C = document.createRange(), O = document.getSelection(), (N = document.createElement("span")).textContent = S, N.style.all = "unset", N.style.position = "fixed", N.style.top = 0, N.style.clip = "rect(0, 0, 0, 0)", N.style.whiteSpace = "pre", N.style.webkitUserSelect = "text", N.style.MozUserSelect = "text", N.style.msUserSelect = "text", N.style.userSelect = "text", N.addEventListener("copy", function(Q) {
              if (Q.stopPropagation(), m.format) if (Q.preventDefault(), Q.clipboardData === void 0) {
                g && console.warn("unable to use e.clipboardData"), g && console.warn("trying IE specific stuff"), window.clipboardData.clearData();
                var j = o[m.format] || o.default;
                window.clipboardData.setData(j, S);
              } else Q.clipboardData.clearData(), Q.clipboardData.setData(m.format, S);
              m.onCopy && (Q.preventDefault(), m.onCopy(Q.clipboardData));
            }), document.body.appendChild(N), C.selectNodeContents(N), O.addRange(C), !document.execCommand("copy")) throw new Error("copy command was unsuccessful");
            J = !0;
          } catch (Q) {
            g && console.error("unable to copy using execCommand: ", Q), g && console.warn("trying IE specific stuff");
            try {
              window.clipboardData.setData(m.format || "text", S), m.onCopy && m.onCopy(window.clipboardData), J = !0;
            } catch (j) {
              g && console.error("unable to copy using clipboardData: ", j), g && console.error("falling back to prompt"), y = function(W) {
                var P = (/mac os x/i.test(navigator.userAgent) ? "⌘" : "Ctrl") + "+C";
                return W.replace(/#{\s*key\s*}/g, P);
              }("message" in m ? m.message : "Copy to clipboard: #{key}, Enter"), window.prompt(y, S);
            }
          } finally {
            O && (typeof O.removeRange == "function" ? O.removeRange(C) : O.removeAllRanges()), N && document.body.removeChild(N), b();
          }
          return J;
        };
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 });
        var u, o = d(77), S = (u = o) && u.__esModule ? u : { default: u };
        s.default = S.default, E.exports = s.default;
      }, function(E, s, d) {
        E.exports = d(50);
      }, function(E, s, d) {
        var u = typeof Symbol == "function" && Symbol.for, o = u ? Symbol.for("react.element") : 60103, S = u ? Symbol.for("react.portal") : 60106, m = u ? Symbol.for("react.fragment") : 60107, g = u ? Symbol.for("react.strict_mode") : 60108, y = u ? Symbol.for("react.profiler") : 60114, b = u ? Symbol.for("react.provider") : 60109, C = u ? Symbol.for("react.context") : 60110, O = u ? Symbol.for("react.async_mode") : 60111, N = u ? Symbol.for("react.concurrent_mode") : 60111, J = u ? Symbol.for("react.forward_ref") : 60112, Q = u ? Symbol.for("react.suspense") : 60113, j = u ? Symbol.for("react.suspense_list") : 60120, W = u ? Symbol.for("react.memo") : 60115, P = u ? Symbol.for("react.lazy") : 60116, M = u ? Symbol.for("react.block") : 60121, F = u ? Symbol.for("react.fundamental") : 60117, R = u ? Symbol.for("react.responder") : 60118, oe = u ? Symbol.for("react.scope") : 60119;
        function K(A) {
          if (typeof A == "object" && A !== null) {
            var se = A.$$typeof;
            switch (se) {
              case o:
                switch (A = A.type) {
                  case O:
                  case N:
                  case m:
                  case y:
                  case g:
                  case Q:
                    return A;
                  default:
                    switch (A = A && A.$$typeof) {
                      case C:
                      case J:
                      case P:
                      case W:
                      case b:
                        return A;
                      default:
                        return se;
                    }
                }
              case S:
                return se;
            }
          }
        }
        function I(A) {
          return K(A) === N;
        }
        s.AsyncMode = O, s.ConcurrentMode = N, s.ContextConsumer = C, s.ContextProvider = b, s.Element = o, s.ForwardRef = J, s.Fragment = m, s.Lazy = P, s.Memo = W, s.Portal = S, s.Profiler = y, s.StrictMode = g, s.Suspense = Q, s.isAsyncMode = function(A) {
          return I(A) || K(A) === O;
        }, s.isConcurrentMode = I, s.isContextConsumer = function(A) {
          return K(A) === C;
        }, s.isContextProvider = function(A) {
          return K(A) === b;
        }, s.isElement = function(A) {
          return typeof A == "object" && A !== null && A.$$typeof === o;
        }, s.isForwardRef = function(A) {
          return K(A) === J;
        }, s.isFragment = function(A) {
          return K(A) === m;
        }, s.isLazy = function(A) {
          return K(A) === P;
        }, s.isMemo = function(A) {
          return K(A) === W;
        }, s.isPortal = function(A) {
          return K(A) === S;
        }, s.isProfiler = function(A) {
          return K(A) === y;
        }, s.isStrictMode = function(A) {
          return K(A) === g;
        }, s.isSuspense = function(A) {
          return K(A) === Q;
        }, s.isValidElementType = function(A) {
          return typeof A == "string" || typeof A == "function" || A === m || A === N || A === y || A === g || A === Q || A === j || typeof A == "object" && A !== null && (A.$$typeof === P || A.$$typeof === W || A.$$typeof === b || A.$$typeof === C || A.$$typeof === J || A.$$typeof === F || A.$$typeof === R || A.$$typeof === oe || A.$$typeof === M);
        }, s.typeOf = K;
      }, function(E, s, d) {
        var u = 60103, o = 60106, S = 60107, m = 60108, g = 60114, y = 60109, b = 60110, C = 60112, O = 60113, N = 60120, J = 60115, Q = 60116, j = 60121, W = 60122, P = 60117, M = 60129, F = 60131;
        if (typeof Symbol == "function" && Symbol.for) {
          var R = Symbol.for;
          u = R("react.element"), o = R("react.portal"), S = R("react.fragment"), m = R("react.strict_mode"), g = R("react.profiler"), y = R("react.provider"), b = R("react.context"), C = R("react.forward_ref"), O = R("react.suspense"), N = R("react.suspense_list"), J = R("react.memo"), Q = R("react.lazy"), j = R("react.block"), W = R("react.server.block"), P = R("react.fundamental"), M = R("react.debug_trace_mode"), F = R("react.legacy_hidden");
        }
        function oe(D) {
          if (typeof D == "object" && D !== null) {
            var ie = D.$$typeof;
            switch (ie) {
              case u:
                switch (D = D.type) {
                  case S:
                  case g:
                  case m:
                  case O:
                  case N:
                    return D;
                  default:
                    switch (D = D && D.$$typeof) {
                      case b:
                      case C:
                      case Q:
                      case J:
                      case y:
                        return D;
                      default:
                        return ie;
                    }
                }
              case o:
                return ie;
            }
          }
        }
        var K = y, I = u, A = C, se = S, le = Q, te = J, ue = o, ye = g, Z = m, fe = O;
        s.ContextConsumer = b, s.ContextProvider = K, s.Element = I, s.ForwardRef = A, s.Fragment = se, s.Lazy = le, s.Memo = te, s.Portal = ue, s.Profiler = ye, s.StrictMode = Z, s.Suspense = fe, s.isAsyncMode = function() {
          return !1;
        }, s.isConcurrentMode = function() {
          return !1;
        }, s.isContextConsumer = function(D) {
          return oe(D) === b;
        }, s.isContextProvider = function(D) {
          return oe(D) === y;
        }, s.isElement = function(D) {
          return typeof D == "object" && D !== null && D.$$typeof === u;
        }, s.isForwardRef = function(D) {
          return oe(D) === C;
        }, s.isFragment = function(D) {
          return oe(D) === S;
        }, s.isLazy = function(D) {
          return oe(D) === Q;
        }, s.isMemo = function(D) {
          return oe(D) === J;
        }, s.isPortal = function(D) {
          return oe(D) === o;
        }, s.isProfiler = function(D) {
          return oe(D) === g;
        }, s.isStrictMode = function(D) {
          return oe(D) === m;
        }, s.isSuspense = function(D) {
          return oe(D) === O;
        }, s.isValidElementType = function(D) {
          return typeof D == "string" || typeof D == "function" || D === S || D === g || D === M || D === m || D === O || D === N || D === F || typeof D == "object" && D !== null && (D.$$typeof === Q || D.$$typeof === J || D.$$typeof === y || D.$$typeof === b || D.$$typeof === C || D.$$typeof === P || D.$$typeof === j || D[0] === W);
        }, s.typeOf = oe;
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), Object.defineProperty(s, "DraggableCore", { enumerable: !0, get: function() {
          return C.default;
        } }), s.default = void 0;
        var u = function(Z) {
          if (Z && Z.__esModule) return Z;
          if (Z === null || Q(Z) !== "object" && typeof Z != "function") return { default: Z };
          var fe = J();
          if (fe && fe.has(Z)) return fe.get(Z);
          var D = {}, ie = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var be in Z) if (Object.prototype.hasOwnProperty.call(Z, be)) {
            var Te = ie ? Object.getOwnPropertyDescriptor(Z, be) : null;
            Te && (Te.get || Te.set) ? Object.defineProperty(D, be, Te) : D[be] = Z[be];
          }
          return D.default = Z, fe && fe.set(Z, D), D;
        }(d(0)), o = N(d(18)), S = N(d(12)), m = N(d(55)), g = d(32), y = d(40), b = d(20), C = N(d(57)), O = N(d(41));
        function N(Z) {
          return Z && Z.__esModule ? Z : { default: Z };
        }
        function J() {
          if (typeof WeakMap != "function") return null;
          var Z = /* @__PURE__ */ new WeakMap();
          return J = function() {
            return Z;
          }, Z;
        }
        function Q(Z) {
          return (Q = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(fe) {
            return typeof fe;
          } : function(fe) {
            return fe && typeof Symbol == "function" && fe.constructor === Symbol && fe !== Symbol.prototype ? "symbol" : typeof fe;
          })(Z);
        }
        function j() {
          return (j = Object.assign || function(Z) {
            for (var fe = 1; fe < arguments.length; fe++) {
              var D = arguments[fe];
              for (var ie in D) Object.prototype.hasOwnProperty.call(D, ie) && (Z[ie] = D[ie]);
            }
            return Z;
          }).apply(this, arguments);
        }
        function W(Z, fe) {
          if (Z == null) return {};
          var D, ie, be = function(Ee, Pe) {
            if (Ee == null) return {};
            var Se, ze, Ze = {}, G = Object.keys(Ee);
            for (ze = 0; ze < G.length; ze++) Se = G[ze], Pe.indexOf(Se) >= 0 || (Ze[Se] = Ee[Se]);
            return Ze;
          }(Z, fe);
          if (Object.getOwnPropertySymbols) {
            var Te = Object.getOwnPropertySymbols(Z);
            for (ie = 0; ie < Te.length; ie++) D = Te[ie], fe.indexOf(D) >= 0 || Object.prototype.propertyIsEnumerable.call(Z, D) && (be[D] = Z[D]);
          }
          return be;
        }
        function P(Z, fe) {
          return function(D) {
            if (Array.isArray(D)) return D;
          }(Z) || function(D, ie) {
            if (!(typeof Symbol > "u" || !(Symbol.iterator in Object(D)))) {
              var be = [], Te = !0, Ee = !1, Pe = void 0;
              try {
                for (var Se, ze = D[Symbol.iterator](); !(Te = (Se = ze.next()).done) && (be.push(Se.value), !ie || be.length !== ie); Te = !0) ;
              } catch (Ze) {
                Ee = !0, Pe = Ze;
              } finally {
                try {
                  Te || ze.return == null || ze.return();
                } finally {
                  if (Ee) throw Pe;
                }
              }
              return be;
            }
          }(Z, fe) || function(D, ie) {
            if (D) {
              if (typeof D == "string") return M(D, ie);
              var be = Object.prototype.toString.call(D).slice(8, -1);
              if (be === "Object" && D.constructor && (be = D.constructor.name), be === "Map" || be === "Set") return Array.from(D);
              if (be === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(be)) return M(D, ie);
            }
          }(Z, fe) || function() {
            throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
          }();
        }
        function M(Z, fe) {
          (fe == null || fe > Z.length) && (fe = Z.length);
          for (var D = 0, ie = new Array(fe); D < fe; D++) ie[D] = Z[D];
          return ie;
        }
        function F(Z, fe) {
          var D = Object.keys(Z);
          if (Object.getOwnPropertySymbols) {
            var ie = Object.getOwnPropertySymbols(Z);
            fe && (ie = ie.filter(function(be) {
              return Object.getOwnPropertyDescriptor(Z, be).enumerable;
            })), D.push.apply(D, ie);
          }
          return D;
        }
        function R(Z) {
          for (var fe = 1; fe < arguments.length; fe++) {
            var D = arguments[fe] != null ? arguments[fe] : {};
            fe % 2 ? F(Object(D), !0).forEach(function(ie) {
              ue(Z, ie, D[ie]);
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(Z, Object.getOwnPropertyDescriptors(D)) : F(Object(D)).forEach(function(ie) {
              Object.defineProperty(Z, ie, Object.getOwnPropertyDescriptor(D, ie));
            });
          }
          return Z;
        }
        function oe(Z, fe) {
          for (var D = 0; D < fe.length; D++) {
            var ie = fe[D];
            ie.enumerable = ie.enumerable || !1, ie.configurable = !0, "value" in ie && (ie.writable = !0), Object.defineProperty(Z, ie.key, ie);
          }
        }
        function K(Z, fe, D) {
          return fe && oe(Z.prototype, fe), D && oe(Z, D), Z;
        }
        function I(Z, fe) {
          return (I = Object.setPrototypeOf || function(D, ie) {
            return D.__proto__ = ie, D;
          })(Z, fe);
        }
        function A(Z) {
          var fe = function() {
            if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham) return !1;
            if (typeof Proxy == "function") return !0;
            try {
              return Date.prototype.toString.call(Reflect.construct(Date, [], function() {
              })), !0;
            } catch {
              return !1;
            }
          }();
          return function() {
            var D, ie = te(Z);
            if (fe) {
              var be = te(this).constructor;
              D = Reflect.construct(ie, arguments, be);
            } else D = ie.apply(this, arguments);
            return se(this, D);
          };
        }
        function se(Z, fe) {
          return !fe || Q(fe) !== "object" && typeof fe != "function" ? le(Z) : fe;
        }
        function le(Z) {
          if (Z === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
          return Z;
        }
        function te(Z) {
          return (te = Object.setPrototypeOf ? Object.getPrototypeOf : function(fe) {
            return fe.__proto__ || Object.getPrototypeOf(fe);
          })(Z);
        }
        function ue(Z, fe, D) {
          return fe in Z ? Object.defineProperty(Z, fe, { value: D, enumerable: !0, configurable: !0, writable: !0 }) : Z[fe] = D, Z;
        }
        var ye = function(Z) {
          (function(ie, be) {
            if (typeof be != "function" && be !== null) throw new TypeError("Super expression must either be null or a function");
            ie.prototype = Object.create(be && be.prototype, { constructor: { value: ie, writable: !0, configurable: !0 } }), be && I(ie, be);
          })(D, Z);
          var fe = A(D);
          function D(ie) {
            var be;
            return function(Te, Ee) {
              if (!(Te instanceof Ee)) throw new TypeError("Cannot call a class as a function");
            }(this, D), ue(le(be = fe.call(this, ie)), "onDragStart", function(Te, Ee) {
              if ((0, O.default)("Draggable: onDragStart: %j", Ee), be.props.onStart(Te, (0, y.createDraggableData)(le(be), Ee)) === !1) return !1;
              be.setState({ dragging: !0, dragged: !0 });
            }), ue(le(be), "onDrag", function(Te, Ee) {
              if (!be.state.dragging) return !1;
              (0, O.default)("Draggable: onDrag: %j", Ee);
              var Pe = (0, y.createDraggableData)(le(be), Ee), Se = { x: Pe.x, y: Pe.y };
              if (be.props.bounds) {
                var ze = Se.x, Ze = Se.y;
                Se.x += be.state.slackX, Se.y += be.state.slackY;
                var G = P((0, y.getBoundPosition)(le(be), Se.x, Se.y), 2), Y = G[0], me = G[1];
                Se.x = Y, Se.y = me, Se.slackX = be.state.slackX + (ze - Se.x), Se.slackY = be.state.slackY + (Ze - Se.y), Pe.x = Se.x, Pe.y = Se.y, Pe.deltaX = Se.x - be.state.x, Pe.deltaY = Se.y - be.state.y;
              }
              if (be.props.onDrag(Te, Pe) === !1) return !1;
              be.setState(Se);
            }), ue(le(be), "onDragStop", function(Te, Ee) {
              if (!be.state.dragging || be.props.onStop(Te, (0, y.createDraggableData)(le(be), Ee)) === !1) return !1;
              (0, O.default)("Draggable: onDragStop: %j", Ee);
              var Pe = { dragging: !1, slackX: 0, slackY: 0 };
              if (be.props.position) {
                var Se = be.props.position, ze = Se.x, Ze = Se.y;
                Pe.x = ze, Pe.y = Ze;
              }
              be.setState(Pe);
            }), be.state = { dragging: !1, dragged: !1, x: ie.position ? ie.position.x : ie.defaultPosition.x, y: ie.position ? ie.position.y : ie.defaultPosition.y, prevPropsPosition: R({}, ie.position), slackX: 0, slackY: 0, isElementSVG: !1 }, !ie.position || ie.onDrag || ie.onStop || console.warn("A `position` was applied to this <Draggable>, without drag handlers. This will make this component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the `position` of this element."), be;
          }
          return K(D, null, [{ key: "getDerivedStateFromProps", value: function(ie, be) {
            var Te = ie.position, Ee = be.prevPropsPosition;
            return !Te || Ee && Te.x === Ee.x && Te.y === Ee.y ? null : ((0, O.default)("Draggable: getDerivedStateFromProps %j", { position: Te, prevPropsPosition: Ee }), { x: Te.x, y: Te.y, prevPropsPosition: R({}, Te) });
          } }]), K(D, [{ key: "componentDidMount", value: function() {
            window.SVGElement !== void 0 && this.findDOMNode() instanceof window.SVGElement && this.setState({ isElementSVG: !0 });
          } }, { key: "componentWillUnmount", value: function() {
            this.setState({ dragging: !1 });
          } }, { key: "findDOMNode", value: function() {
            return this.props.nodeRef ? this.props.nodeRef.current : S.default.findDOMNode(this);
          } }, { key: "render", value: function() {
            var ie, be = this.props, Te = (be.axis, be.bounds, be.children), Ee = be.defaultPosition, Pe = be.defaultClassName, Se = be.defaultClassNameDragging, ze = be.defaultClassNameDragged, Ze = be.position, G = be.positionOffset, Y = (be.scale, W(be, ["axis", "bounds", "children", "defaultPosition", "defaultClassName", "defaultClassNameDragging", "defaultClassNameDragged", "position", "positionOffset", "scale"])), me = {}, l = null, f = !Ze || this.state.dragging, k = Ze || Ee, L = { x: (0, y.canDragX)(this) && f ? this.state.x : k.x, y: (0, y.canDragY)(this) && f ? this.state.y : k.y };
            this.state.isElementSVG ? l = (0, g.createSVGTransform)(L, G) : me = (0, g.createCSSTransform)(L, G);
            var U = (0, m.default)(Te.props.className || "", Pe, (ue(ie = {}, Se, this.state.dragging), ue(ie, ze, this.state.dragged), ie));
            return u.createElement(C.default, j({}, Y, { onStart: this.onDragStart, onDrag: this.onDrag, onStop: this.onDragStop }), u.cloneElement(u.Children.only(Te), { className: U, style: R(R({}, Te.props.style), me), transform: l }));
          } }]), D;
        }(u.Component);
        s.default = ye, ue(ye, "displayName", "Draggable"), ue(ye, "propTypes", R(R({}, C.default.propTypes), {}, { axis: o.default.oneOf(["both", "x", "y", "none"]), bounds: o.default.oneOfType([o.default.shape({ left: o.default.number, right: o.default.number, top: o.default.number, bottom: o.default.number }), o.default.string, o.default.oneOf([!1])]), defaultClassName: o.default.string, defaultClassNameDragging: o.default.string, defaultClassNameDragged: o.default.string, defaultPosition: o.default.shape({ x: o.default.number, y: o.default.number }), positionOffset: o.default.shape({ x: o.default.oneOfType([o.default.number, o.default.string]), y: o.default.oneOfType([o.default.number, o.default.string]) }), position: o.default.shape({ x: o.default.number, y: o.default.number }), className: b.dontSetMe, style: b.dontSetMe, transform: b.dontSetMe })), ue(ye, "defaultProps", R(R({}, C.default.defaultProps), {}, { axis: "both", bounds: !1, defaultClassName: "react-draggable", defaultClassNameDragging: "react-draggable-dragging", defaultClassNameDragged: "react-draggable-dragged", defaultPosition: { x: 0, y: 0 }, position: null, scale: 1 }));
      }, function(E, s, d) {
        var u = d(54);
        function o() {
        }
        function S() {
        }
        S.resetWarningCache = o, E.exports = function() {
          function m(b, C, O, N, J, Q) {
            if (Q !== u) {
              var j = new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");
              throw j.name = "Invariant Violation", j;
            }
          }
          function g() {
            return m;
          }
          m.isRequired = m;
          var y = { array: m, bigint: m, bool: m, func: m, number: m, object: m, string: m, symbol: m, any: m, arrayOf: g, element: m, elementType: m, instanceOf: g, node: m, objectOf: g, oneOf: g, oneOfType: g, shape: g, exact: g, checkPropTypes: S, resetWarningCache: o };
          return y.PropTypes = y, y;
        };
      }, function(E, s, d) {
        E.exports = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
      }, function(E, s, d) {
        var u;
        (function() {
          var o = {}.hasOwnProperty;
          function S() {
            for (var m = [], g = 0; g < arguments.length; g++) {
              var y = arguments[g];
              if (y) {
                var b = typeof y;
                if (b === "string" || b === "number") m.push(y);
                else if (Array.isArray(y)) {
                  if (y.length) {
                    var C = S.apply(null, y);
                    C && m.push(C);
                  }
                } else if (b === "object") if (y.toString === Object.prototype.toString) for (var O in y) o.call(y, O) && y[O] && m.push(O);
                else m.push(y.toString());
              }
            }
            return m.join(" ");
          }
          E.exports ? (S.default = S, E.exports = S) : (u = (function() {
            return S;
          }).apply(s, [])) === void 0 || (E.exports = u);
        })();
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.getPrefix = o, s.browserPrefixToKey = S, s.browserPrefixToStyle = function(g, y) {
          return y ? "-".concat(y.toLowerCase(), "-").concat(g) : g;
        }, s.default = void 0;
        var u = ["Moz", "Webkit", "O", "ms"];
        function o() {
          var g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "transform";
          if (typeof window > "u" || window.document === void 0) return "";
          var y = window.document.documentElement.style;
          if (g in y) return "";
          for (var b = 0; b < u.length; b++) if (S(g, u[b]) in y) return u[b];
          return "";
        }
        function S(g, y) {
          return y ? "".concat(y).concat(function(b) {
            for (var C = "", O = !0, N = 0; N < b.length; N++) O ? (C += b[N].toUpperCase(), O = !1) : b[N] === "-" ? O = !0 : C += b[N];
            return C;
          }(g)) : g;
        }
        var m = o();
        s.default = m;
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.default = void 0;
        var u = function(te) {
          if (te && te.__esModule) return te;
          if (te === null || N(te) !== "object" && typeof te != "function") return { default: te };
          var ue = O();
          if (ue && ue.has(te)) return ue.get(te);
          var ye = {}, Z = Object.defineProperty && Object.getOwnPropertyDescriptor;
          for (var fe in te) if (Object.prototype.hasOwnProperty.call(te, fe)) {
            var D = Z ? Object.getOwnPropertyDescriptor(te, fe) : null;
            D && (D.get || D.set) ? Object.defineProperty(ye, fe, D) : ye[fe] = te[fe];
          }
          return ye.default = te, ue && ue.set(te, ye), ye;
        }(d(0)), o = C(d(18)), S = C(d(12)), m = d(32), g = d(40), y = d(20), b = C(d(41));
        function C(te) {
          return te && te.__esModule ? te : { default: te };
        }
        function O() {
          if (typeof WeakMap != "function") return null;
          var te = /* @__PURE__ */ new WeakMap();
          return O = function() {
            return te;
          }, te;
        }
        function N(te) {
          return (N = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(ue) {
            return typeof ue;
          } : function(ue) {
            return ue && typeof Symbol == "function" && ue.constructor === Symbol && ue !== Symbol.prototype ? "symbol" : typeof ue;
          })(te);
        }
        function J(te, ue) {
          return function(ye) {
            if (Array.isArray(ye)) return ye;
          }(te) || function(ye, Z) {
            if (!(typeof Symbol > "u" || !(Symbol.iterator in Object(ye)))) {
              var fe = [], D = !0, ie = !1, be = void 0;
              try {
                for (var Te, Ee = ye[Symbol.iterator](); !(D = (Te = Ee.next()).done) && (fe.push(Te.value), !Z || fe.length !== Z); D = !0) ;
              } catch (Pe) {
                ie = !0, be = Pe;
              } finally {
                try {
                  D || Ee.return == null || Ee.return();
                } finally {
                  if (ie) throw be;
                }
              }
              return fe;
            }
          }(te, ue) || function(ye, Z) {
            if (ye) {
              if (typeof ye == "string") return Q(ye, Z);
              var fe = Object.prototype.toString.call(ye).slice(8, -1);
              if (fe === "Object" && ye.constructor && (fe = ye.constructor.name), fe === "Map" || fe === "Set") return Array.from(ye);
              if (fe === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(fe)) return Q(ye, Z);
            }
          }(te, ue) || function() {
            throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
          }();
        }
        function Q(te, ue) {
          (ue == null || ue > te.length) && (ue = te.length);
          for (var ye = 0, Z = new Array(ue); ye < ue; ye++) Z[ye] = te[ye];
          return Z;
        }
        function j(te, ue) {
          if (!(te instanceof ue)) throw new TypeError("Cannot call a class as a function");
        }
        function W(te, ue) {
          for (var ye = 0; ye < ue.length; ye++) {
            var Z = ue[ye];
            Z.enumerable = Z.enumerable || !1, Z.configurable = !0, "value" in Z && (Z.writable = !0), Object.defineProperty(te, Z.key, Z);
          }
        }
        function P(te, ue) {
          return (P = Object.setPrototypeOf || function(ye, Z) {
            return ye.__proto__ = Z, ye;
          })(te, ue);
        }
        function M(te) {
          var ue = function() {
            if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham) return !1;
            if (typeof Proxy == "function") return !0;
            try {
              return Date.prototype.toString.call(Reflect.construct(Date, [], function() {
              })), !0;
            } catch {
              return !1;
            }
          }();
          return function() {
            var ye, Z = oe(te);
            if (ue) {
              var fe = oe(this).constructor;
              ye = Reflect.construct(Z, arguments, fe);
            } else ye = Z.apply(this, arguments);
            return F(this, ye);
          };
        }
        function F(te, ue) {
          return !ue || N(ue) !== "object" && typeof ue != "function" ? R(te) : ue;
        }
        function R(te) {
          if (te === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
          return te;
        }
        function oe(te) {
          return (oe = Object.setPrototypeOf ? Object.getPrototypeOf : function(ue) {
            return ue.__proto__ || Object.getPrototypeOf(ue);
          })(te);
        }
        function K(te, ue, ye) {
          return ue in te ? Object.defineProperty(te, ue, { value: ye, enumerable: !0, configurable: !0, writable: !0 }) : te[ue] = ye, te;
        }
        var I = { start: "touchstart", move: "touchmove", stop: "touchend" }, A = { start: "mousedown", move: "mousemove", stop: "mouseup" }, se = A, le = function(te) {
          (function(D, ie) {
            if (typeof ie != "function" && ie !== null) throw new TypeError("Super expression must either be null or a function");
            D.prototype = Object.create(ie && ie.prototype, { constructor: { value: D, writable: !0, configurable: !0 } }), ie && P(D, ie);
          })(fe, te);
          var ue, ye, Z = M(fe);
          function fe() {
            var D;
            j(this, fe);
            for (var ie = arguments.length, be = new Array(ie), Te = 0; Te < ie; Te++) be[Te] = arguments[Te];
            return K(R(D = Z.call.apply(Z, [this].concat(be))), "state", { dragging: !1, lastX: NaN, lastY: NaN, touchIdentifier: null }), K(R(D), "mounted", !1), K(R(D), "handleDragStart", function(Ee) {
              if (D.props.onMouseDown(Ee), !D.props.allowAnyClick && typeof Ee.button == "number" && Ee.button !== 0) return !1;
              var Pe = D.findDOMNode();
              if (!Pe || !Pe.ownerDocument || !Pe.ownerDocument.body) throw new Error("<DraggableCore> not mounted on DragStart!");
              var Se = Pe.ownerDocument;
              if (!(D.props.disabled || !(Ee.target instanceof Se.defaultView.Node) || D.props.handle && !(0, m.matchesSelectorAndParentsTo)(Ee.target, D.props.handle, Pe) || D.props.cancel && (0, m.matchesSelectorAndParentsTo)(Ee.target, D.props.cancel, Pe))) {
                Ee.type === "touchstart" && Ee.preventDefault();
                var ze = (0, m.getTouchIdentifier)(Ee);
                D.setState({ touchIdentifier: ze });
                var Ze = (0, g.getControlPosition)(Ee, ze, R(D));
                if (Ze != null) {
                  var G = Ze.x, Y = Ze.y, me = (0, g.createCoreData)(R(D), G, Y);
                  (0, b.default)("DraggableCore: handleDragStart: %j", me), (0, b.default)("calling", D.props.onStart), D.props.onStart(Ee, me) !== !1 && D.mounted !== !1 && (D.props.enableUserSelectHack && (0, m.addUserSelectStyles)(Se), D.setState({ dragging: !0, lastX: G, lastY: Y }), (0, m.addEvent)(Se, se.move, D.handleDrag), (0, m.addEvent)(Se, se.stop, D.handleDragStop));
                }
              }
            }), K(R(D), "handleDrag", function(Ee) {
              var Pe = (0, g.getControlPosition)(Ee, D.state.touchIdentifier, R(D));
              if (Pe != null) {
                var Se = Pe.x, ze = Pe.y;
                if (Array.isArray(D.props.grid)) {
                  var Ze = Se - D.state.lastX, G = ze - D.state.lastY, Y = J((0, g.snapToGrid)(D.props.grid, Ze, G), 2);
                  if (Ze = Y[0], G = Y[1], !Ze && !G) return;
                  Se = D.state.lastX + Ze, ze = D.state.lastY + G;
                }
                var me = (0, g.createCoreData)(R(D), Se, ze);
                if ((0, b.default)("DraggableCore: handleDrag: %j", me), D.props.onDrag(Ee, me) !== !1 && D.mounted !== !1) D.setState({ lastX: Se, lastY: ze });
                else try {
                  D.handleDragStop(new MouseEvent("mouseup"));
                } catch {
                  var l = document.createEvent("MouseEvents");
                  l.initMouseEvent("mouseup", !0, !0, window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null), D.handleDragStop(l);
                }
              }
            }), K(R(D), "handleDragStop", function(Ee) {
              if (D.state.dragging) {
                var Pe = (0, g.getControlPosition)(Ee, D.state.touchIdentifier, R(D));
                if (Pe != null) {
                  var Se = Pe.x, ze = Pe.y, Ze = (0, g.createCoreData)(R(D), Se, ze);
                  if (D.props.onStop(Ee, Ze) === !1 || D.mounted === !1) return !1;
                  var G = D.findDOMNode();
                  G && D.props.enableUserSelectHack && (0, m.removeUserSelectStyles)(G.ownerDocument), (0, b.default)("DraggableCore: handleDragStop: %j", Ze), D.setState({ dragging: !1, lastX: NaN, lastY: NaN }), G && ((0, b.default)("DraggableCore: Removing handlers"), (0, m.removeEvent)(G.ownerDocument, se.move, D.handleDrag), (0, m.removeEvent)(G.ownerDocument, se.stop, D.handleDragStop));
                }
              }
            }), K(R(D), "onMouseDown", function(Ee) {
              return se = A, D.handleDragStart(Ee);
            }), K(R(D), "onMouseUp", function(Ee) {
              return se = A, D.handleDragStop(Ee);
            }), K(R(D), "onTouchStart", function(Ee) {
              return se = I, D.handleDragStart(Ee);
            }), K(R(D), "onTouchEnd", function(Ee) {
              return se = I, D.handleDragStop(Ee);
            }), D;
          }
          return ue = fe, (ye = [{ key: "componentDidMount", value: function() {
            this.mounted = !0;
            var D = this.findDOMNode();
            D && (0, m.addEvent)(D, I.start, this.onTouchStart, { passive: !1 });
          } }, { key: "componentWillUnmount", value: function() {
            this.mounted = !1;
            var D = this.findDOMNode();
            if (D) {
              var ie = D.ownerDocument;
              (0, m.removeEvent)(ie, A.move, this.handleDrag), (0, m.removeEvent)(ie, I.move, this.handleDrag), (0, m.removeEvent)(ie, A.stop, this.handleDragStop), (0, m.removeEvent)(ie, I.stop, this.handleDragStop), (0, m.removeEvent)(D, I.start, this.onTouchStart, { passive: !1 }), this.props.enableUserSelectHack && (0, m.removeUserSelectStyles)(ie);
            }
          } }, { key: "findDOMNode", value: function() {
            return this.props.nodeRef ? this.props.nodeRef.current : S.default.findDOMNode(this);
          } }, { key: "render", value: function() {
            return u.cloneElement(u.Children.only(this.props.children), { onMouseDown: this.onMouseDown, onMouseUp: this.onMouseUp, onTouchEnd: this.onTouchEnd });
          } }]) && W(ue.prototype, ye), fe;
        }(u.Component);
        s.default = le, K(le, "displayName", "DraggableCore"), K(le, "propTypes", { allowAnyClick: o.default.bool, disabled: o.default.bool, enableUserSelectHack: o.default.bool, offsetParent: function(te, ue) {
          if (te[ue] && te[ue].nodeType !== 1) throw new Error("Draggable's offsetParent must be a DOM Node.");
        }, grid: o.default.arrayOf(o.default.number), handle: o.default.string, cancel: o.default.string, nodeRef: o.default.object, onStart: o.default.func, onDrag: o.default.func, onStop: o.default.func, onMouseDown: o.default.func, scale: o.default.number, className: y.dontSetMe, style: y.dontSetMe, transform: y.dontSetMe }), K(le, "defaultProps", { allowAnyClick: !1, cancel: null, disabled: !1, enableUserSelectHack: !0, offsetParent: null, handle: null, grid: null, transform: null, onStart: function() {
        }, onDrag: function() {
        }, onStop: function() {
        }, onMouseDown: function() {
        }, scale: 1 });
      }, function(E, s, d) {
        var u = d(6), o = d(59);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, ".ck-inspector{--ck-inspector-color-tab-background-hover:rgba(0,0,0,0.07);--ck-inspector-color-tab-active-border:#0dacef }.ck-inspector .ck-inspector-horizontal-nav{display:flex;flex-direction:row;user-select:none;align-self:stretch}.ck-inspector .ck-inspector-horizontal-nav .ck-inspector-horizontal-nav__item{-webkit-appearance:none;background:none;border:0;border-bottom:2px solid transparent;padding:.5em 1em;align-self:stretch}.ck-inspector .ck-inspector-horizontal-nav .ck-inspector-horizontal-nav__item:hover{background:var(--ck-inspector-color-tab-background-hover)}.ck-inspector .ck-inspector-horizontal-nav .ck-inspector-horizontal-nav__item.ck-inspector-horizontal-nav__item_active{border-bottom-color:var(--ck-inspector-color-tab-active-border)}", ""]);
      }, function(E, s, d) {
        var u = d(6), o = d(61);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, ".ck-inspector{--ck-inspector-navbox-empty-background:#fafafa}.ck-inspector .ck-inspector-navbox{display:flex;flex-direction:column;height:100%;align-items:stretch}.ck-inspector .ck-inspector-navbox .ck-inspector-navbox__navigation{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:stretch;min-height:30px;max-height:30px;border-bottom:1px solid var(--ck-inspector-color-border);width:100%;user-select:none;align-items:center}.ck-inspector .ck-inspector-navbox .ck-inspector-navbox__content{display:flex;flex-direction:row;height:100%;overflow:hidden}", ""]);
      }, function(E, s, d) {
        var u = d(6), o = d(63);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, ".ck-inspector{--ck-inspector-icon-size:19px;--ck-inspector-button-size:calc(4px + var(--ck-inspector-icon-size));--ck-inspector-color-button:#777;--ck-inspector-color-button-hover:#222;--ck-inspector-color-button-on:#0f79e2}.ck-inspector .ck-inspector-button{width:var(--ck-inspector-button-size);height:var(--ck-inspector-button-size);border:0;overflow:hidden;border-radius:2px;padding:2px;color:var(--ck-inspector-color-button)}.ck-inspector .ck-inspector-button.ck-inspector-button_on,.ck-inspector .ck-inspector-button.ck-inspector-button_on:hover{color:var(--ck-inspector-color-button-on);opacity:1}.ck-inspector .ck-inspector-button.ck-inspector-button_disabled{opacity:.3}.ck-inspector .ck-inspector-button>span{display:none}.ck-inspector .ck-inspector-button:hover{color:var(--ck-inspector-color-button-hover)}.ck-inspector .ck-inspector-button svg{width:var(--ck-inspector-icon-size);height:var(--ck-inspector-icon-size)}.ck-inspector .ck-inspector-button svg,.ck-inspector .ck-inspector-button svg *{fill:currentColor}", ""]);
      }, function(E, s, d) {
        var u = d(6), o = d(65);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, ".ck-inspector{--ck-inspector-explorer-width:300px}.ck-inspector .ck-inspector-pane{display:flex;width:100%}.ck-inspector .ck-inspector-pane.ck-inspector-pane_empty{align-items:center;justify-content:center;padding:1em;background:var(--ck-inspector-navbox-empty-background)}.ck-inspector .ck-inspector-pane.ck-inspector-pane_empty p{align-self:center;width:100%;text-align:center}.ck-inspector .ck-inspector-pane>.ck-inspector-navbox:last-child{min-width:var(--ck-inspector-explorer-width);width:var(--ck-inspector-explorer-width)}.ck-inspector .ck-inspector-pane.ck-inspector-pane_vsplit>.ck-inspector-navbox:first-child{border-right:1px solid var(--ck-inspector-color-border);flex:1 1 auto;overflow:hidden}.ck-inspector .ck-inspector-pane.ck-inspector-pane_vsplit>.ck-inspector-navbox:first-child .ck-inspector-navbox__navigation{align-items:center}.ck-inspector .ck-inspector-pane.ck-inspector-pane_vsplit>.ck-inspector-navbox:first-child .ck-inspector-tree__config label{margin:0 .5em}.ck-inspector .ck-inspector-pane.ck-inspector-pane_vsplit>.ck-inspector-navbox:first-child .ck-inspector-tree__config input+label{margin-right:1em}", ""]);
      }, function(E, s, d) {
        var u = d(6), o = d(67);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, ".ck-inspector-side-pane{position:relative}", ""]);
      }, function(E, s, d) {
        var u = d(6), o = d(69);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, ".ck-inspector .ck-inspector-checkbox{vertical-align:middle}", ""]);
      }, function(E, s, d) {
        var u = d(6), o = d(71);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, '.ck-inspector{--ck-inspector-color-property-list-property-name:#d0363f;--ck-inspector-color-property-list-property-value-true:green;--ck-inspector-color-property-list-property-value-false:red;--ck-inspector-color-property-list-property-value-unknown:#888;--ck-inspector-color-property-list-background:#f5f5f5;--ck-inspector-color-property-list-title-collapser:#727272}.ck-inspector .ck-inspector-property-list{display:grid;grid-template-columns:auto 1fr;background:var(--ck-inspector-color-white)}.ck-inspector .ck-inspector-property-list>:nth-of-type(odd){background:var(--ck-inspector-color-property-list-background)}.ck-inspector .ck-inspector-property-list>:nth-of-type(2n){background:var(--ck-inspector-color-white)}.ck-inspector .ck-inspector-property-list dt{padding:0 .7em 0 1.2em;min-width:15em}.ck-inspector .ck-inspector-property-list dt.ck-inspector-property-list__title_collapsible button{display:inline-block;overflow:hidden;vertical-align:middle;margin-left:-9px;margin-right:.3em;width:0;height:0;border-left:6px solid var(--ck-inspector-color-property-list-title-collapser);border-bottom:3.5px solid transparent;border-right:0 solid transparent;border-top:3.5px solid transparent;transition:transform .2s ease-in-out;transform:rotate(0deg)}.ck-inspector .ck-inspector-property-list dt.ck-inspector-property-list__title_expanded button{transform:rotate(90deg)}.ck-inspector .ck-inspector-property-list dt.ck-inspector-property-list__title_collapsed+dd+.ck-inspector-property-list{display:none}.ck-inspector .ck-inspector-property-list dt .ck-inspector-property-list__title__color-box{width:12px;height:12px;vertical-align:text-top;display:inline-block;margin-right:3px;border-radius:2px;border:1px solid #000}.ck-inspector .ck-inspector-property-list dt.ck-inspector-property-list__title_clickable label:hover{text-decoration:underline;cursor:pointer}.ck-inspector .ck-inspector-property-list dt label{color:var(--ck-inspector-color-property-list-property-name)}.ck-inspector .ck-inspector-property-list dd{padding-right:.7em}.ck-inspector .ck-inspector-property-list dd input{width:100%}.ck-inspector .ck-inspector-property-list dd input[value=false]{color:var(--ck-inspector-color-property-list-property-value-false)}.ck-inspector .ck-inspector-property-list dd input[value=true]{color:var(--ck-inspector-color-property-list-property-value-true)}.ck-inspector .ck-inspector-property-list dd input[value="function() {…}"],.ck-inspector .ck-inspector-property-list dd input[value=undefined]{color:var(--ck-inspector-color-property-list-property-value-unknown)}.ck-inspector .ck-inspector-property-list dd input[value="function() {…}"]{font-style:italic}.ck-inspector .ck-inspector-property-list .ck-inspector-property-list{grid-column:1/-1;margin-left:1em;background:transparent}.ck-inspector .ck-inspector-property-list .ck-inspector-property-list>:nth-of-type(2n),.ck-inspector .ck-inspector-property-list .ck-inspector-property-list>:nth-of-type(odd){background:transparent}', ""]);
      }, function(E, s, d) {
        var u = d(6), o = d(73);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, `.ck-inspector .ck-inspector__object-inspector{width:100%;background:var(--ck-inspector-color-white);overflow:auto}.ck-inspector .ck-inspector__object-inspector h2,.ck-inspector .ck-inspector__object-inspector h3{display:flex;flex-direction:row;flex-wrap:nowrap}.ck-inspector .ck-inspector__object-inspector h2{display:flex;align-items:center;padding:1em;overflow:hidden;text-overflow:ellipsis}.ck-inspector .ck-inspector__object-inspector h2>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;margin-right:auto}.ck-inspector .ck-inspector__object-inspector h2>.ck-inspector-button{flex-shrink:0;margin-left:.5em}.ck-inspector .ck-inspector__object-inspector h2 a{font-weight:700;color:var(--ck-inspector-color-tree-node-name)}.ck-inspector .ck-inspector__object-inspector h2 a,.ck-inspector .ck-inspector__object-inspector h2 a>*{cursor:pointer}.ck-inspector .ck-inspector__object-inspector h2 em:after,.ck-inspector .ck-inspector__object-inspector h2 em:before{content:'"'}.ck-inspector .ck-inspector__object-inspector h3{display:flex;align-items:center;font-size:12px;padding:.4em .7em}.ck-inspector .ck-inspector__object-inspector h3 a{color:inherit;font-weight:700;margin-right:auto}.ck-inspector .ck-inspector__object-inspector h3 .ck-inspector-button{visibility:hidden}.ck-inspector .ck-inspector__object-inspector h3:hover .ck-inspector-button{visibility:visible}.ck-inspector .ck-inspector__object-inspector hr{border-top:1px solid var(--ck-inspector-color-border)}`, ""]);
      }, function(E, s, d) {
        var u = d(6), o = d(75);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, ".ck-inspector-model-tree__hide-markers .ck-inspector-tree__position.ck-inspector-tree__position_marker{display:none}", ""]);
      }, function(E, s) {
        E.exports = function() {
          var d = document.getSelection();
          if (!d.rangeCount) return function() {
          };
          for (var u = document.activeElement, o = [], S = 0; S < d.rangeCount; S++) o.push(d.getRangeAt(S));
          switch (u.tagName.toUpperCase()) {
            case "INPUT":
            case "TEXTAREA":
              u.blur();
              break;
            default:
              u = null;
          }
          return d.removeAllRanges(), function() {
            d.type === "Caret" && d.removeAllRanges(), d.rangeCount || o.forEach(function(m) {
              d.addRange(m);
            }), u && u.focus();
          };
        };
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.bodyOpenClassName = s.portalClassName = void 0;
        var u = Object.assign || function(A) {
          for (var se = 1; se < arguments.length; se++) {
            var le = arguments[se];
            for (var te in le) Object.prototype.hasOwnProperty.call(le, te) && (A[te] = le[te]);
          }
          return A;
        }, o = /* @__PURE__ */ function() {
          function A(se, le) {
            for (var te = 0; te < le.length; te++) {
              var ue = le[te];
              ue.enumerable = ue.enumerable || !1, ue.configurable = !0, "value" in ue && (ue.writable = !0), Object.defineProperty(se, ue.key, ue);
            }
          }
          return function(se, le, te) {
            return le && A(se.prototype, le), te && A(se, te), se;
          };
        }(), S = d(0), m = Q(S), g = Q(d(12)), y = Q(d(18)), b = Q(d(78)), C = function(A) {
          if (A && A.__esModule) return A;
          var se = {};
          if (A != null) for (var le in A) Object.prototype.hasOwnProperty.call(A, le) && (se[le] = A[le]);
          return se.default = A, se;
        }(d(43)), O = d(36), N = Q(O), J = d(85);
        function Q(A) {
          return A && A.__esModule ? A : { default: A };
        }
        function j(A, se) {
          if (!(A instanceof se)) throw new TypeError("Cannot call a class as a function");
        }
        function W(A, se) {
          if (!A) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
          return !se || typeof se != "object" && typeof se != "function" ? A : se;
        }
        var P = s.portalClassName = "ReactModalPortal", M = s.bodyOpenClassName = "ReactModal__Body--open", F = O.canUseDOM && g.default.createPortal !== void 0, R = function(A) {
          return document.createElement(A);
        }, oe = function() {
          return F ? g.default.createPortal : g.default.unstable_renderSubtreeIntoContainer;
        };
        function K(A) {
          return A();
        }
        var I = function(A) {
          function se() {
            var le, te, ue;
            j(this, se);
            for (var ye = arguments.length, Z = Array(ye), fe = 0; fe < ye; fe++) Z[fe] = arguments[fe];
            return te = ue = W(this, (le = se.__proto__ || Object.getPrototypeOf(se)).call.apply(le, [this].concat(Z))), ue.removePortal = function() {
              !F && g.default.unmountComponentAtNode(ue.node);
              var D = K(ue.props.parentSelector);
              D && D.contains(ue.node) ? D.removeChild(ue.node) : console.warn('React-Modal: "parentSelector" prop did not returned any DOM element. Make sure that the parent element is unmounted to avoid any memory leaks.');
            }, ue.portalRef = function(D) {
              ue.portal = D;
            }, ue.renderPortal = function(D) {
              var ie = oe()(ue, m.default.createElement(b.default, u({ defaultStyles: se.defaultStyles }, D)), ue.node);
              ue.portalRef(ie);
            }, W(ue, te);
          }
          return function(le, te) {
            if (typeof te != "function" && te !== null) throw new TypeError("Super expression must either be null or a function, not " + typeof te);
            le.prototype = Object.create(te && te.prototype, { constructor: { value: le, enumerable: !1, writable: !0, configurable: !0 } }), te && (Object.setPrototypeOf ? Object.setPrototypeOf(le, te) : le.__proto__ = te);
          }(se, A), o(se, [{ key: "componentDidMount", value: function() {
            O.canUseDOM && (F || (this.node = R("div")), this.node.className = this.props.portalClassName, K(this.props.parentSelector).appendChild(this.node), !F && this.renderPortal(this.props));
          } }, { key: "getSnapshotBeforeUpdate", value: function(le) {
            return { prevParent: K(le.parentSelector), nextParent: K(this.props.parentSelector) };
          } }, { key: "componentDidUpdate", value: function(le, te, ue) {
            if (O.canUseDOM) {
              var ye = this.props, Z = ye.isOpen, fe = ye.portalClassName;
              le.portalClassName !== fe && (this.node.className = fe);
              var D = ue.prevParent, ie = ue.nextParent;
              ie !== D && (D.removeChild(this.node), ie.appendChild(this.node)), (le.isOpen || Z) && !F && this.renderPortal(this.props);
            }
          } }, { key: "componentWillUnmount", value: function() {
            if (O.canUseDOM && this.node && this.portal) {
              var le = this.portal.state, te = Date.now(), ue = le.isOpen && this.props.closeTimeoutMS && (le.closesAt || te + this.props.closeTimeoutMS);
              ue ? (le.beforeClose || this.portal.closeWithTimeout(), setTimeout(this.removePortal, ue - te)) : this.removePortal();
            }
          } }, { key: "render", value: function() {
            return O.canUseDOM && F ? (!this.node && F && (this.node = R("div")), oe()(m.default.createElement(b.default, u({ ref: this.portalRef, defaultStyles: se.defaultStyles }, this.props)), this.node)) : null;
          } }], [{ key: "setAppElement", value: function(le) {
            C.setElement(le);
          } }]), se;
        }(S.Component);
        I.propTypes = { isOpen: y.default.bool.isRequired, style: y.default.shape({ content: y.default.object, overlay: y.default.object }), portalClassName: y.default.string, bodyOpenClassName: y.default.string, htmlOpenClassName: y.default.string, className: y.default.oneOfType([y.default.string, y.default.shape({ base: y.default.string.isRequired, afterOpen: y.default.string.isRequired, beforeClose: y.default.string.isRequired })]), overlayClassName: y.default.oneOfType([y.default.string, y.default.shape({ base: y.default.string.isRequired, afterOpen: y.default.string.isRequired, beforeClose: y.default.string.isRequired })]), appElement: y.default.oneOfType([y.default.instanceOf(N.default), y.default.instanceOf(O.SafeHTMLCollection), y.default.instanceOf(O.SafeNodeList), y.default.arrayOf(y.default.instanceOf(N.default))]), onAfterOpen: y.default.func, onRequestClose: y.default.func, closeTimeoutMS: y.default.number, ariaHideApp: y.default.bool, shouldFocusAfterRender: y.default.bool, shouldCloseOnOverlayClick: y.default.bool, shouldReturnFocusAfterClose: y.default.bool, preventScroll: y.default.bool, parentSelector: y.default.func, aria: y.default.object, data: y.default.object, role: y.default.string, contentLabel: y.default.string, shouldCloseOnEsc: y.default.bool, overlayRef: y.default.func, contentRef: y.default.func, id: y.default.string, overlayElement: y.default.func, contentElement: y.default.func }, I.defaultProps = { isOpen: !1, portalClassName: P, bodyOpenClassName: M, role: "dialog", ariaHideApp: !0, closeTimeoutMS: 0, shouldFocusAfterRender: !0, shouldCloseOnEsc: !0, shouldCloseOnOverlayClick: !0, shouldReturnFocusAfterClose: !0, preventScroll: !1, parentSelector: function() {
          return document.body;
        }, overlayElement: function(A, se) {
          return m.default.createElement("div", A, se);
        }, contentElement: function(A, se) {
          return m.default.createElement("div", A, se);
        } }, I.defaultStyles = { overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255, 255, 255, 0.75)" }, content: { position: "absolute", top: "40px", left: "40px", right: "40px", bottom: "40px", border: "1px solid #ccc", background: "#fff", overflow: "auto", WebkitOverflowScrolling: "touch", borderRadius: "4px", outline: "none", padding: "20px" } }, (0, J.polyfill)(I), s.default = I;
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 });
        var u = Object.assign || function(R) {
          for (var oe = 1; oe < arguments.length; oe++) {
            var K = arguments[oe];
            for (var I in K) Object.prototype.hasOwnProperty.call(K, I) && (R[I] = K[I]);
          }
          return R;
        }, o = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(R) {
          return typeof R;
        } : function(R) {
          return R && typeof Symbol == "function" && R.constructor === Symbol && R !== Symbol.prototype ? "symbol" : typeof R;
        }, S = /* @__PURE__ */ function() {
          function R(oe, K) {
            for (var I = 0; I < K.length; I++) {
              var A = K[I];
              A.enumerable = A.enumerable || !1, A.configurable = !0, "value" in A && (A.writable = !0), Object.defineProperty(oe, A.key, A);
            }
          }
          return function(oe, K, I) {
            return K && R(oe.prototype, K), I && R(oe, I), oe;
          };
        }(), m = d(0), g = W(d(18)), y = j(d(79)), b = W(d(80)), C = j(d(43)), O = j(d(83)), N = d(36), J = W(N), Q = W(d(44));
        function j(R) {
          if (R && R.__esModule) return R;
          var oe = {};
          if (R != null) for (var K in R) Object.prototype.hasOwnProperty.call(R, K) && (oe[K] = R[K]);
          return oe.default = R, oe;
        }
        function W(R) {
          return R && R.__esModule ? R : { default: R };
        }
        d(84);
        var P = { overlay: "ReactModal__Overlay", content: "ReactModal__Content" }, M = 0, F = function(R) {
          function oe(K) {
            (function(A, se) {
              if (!(A instanceof se)) throw new TypeError("Cannot call a class as a function");
            })(this, oe);
            var I = function(A, se) {
              if (!A) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
              return !se || typeof se != "object" && typeof se != "function" ? A : se;
            }(this, (oe.__proto__ || Object.getPrototypeOf(oe)).call(this, K));
            return I.setOverlayRef = function(A) {
              I.overlay = A, I.props.overlayRef && I.props.overlayRef(A);
            }, I.setContentRef = function(A) {
              I.content = A, I.props.contentRef && I.props.contentRef(A);
            }, I.afterClose = function() {
              var A = I.props, se = A.appElement, le = A.ariaHideApp, te = A.htmlOpenClassName, ue = A.bodyOpenClassName;
              ue && O.remove(document.body, ue), te && O.remove(document.getElementsByTagName("html")[0], te), le && M > 0 && (M -= 1) === 0 && C.show(se), I.props.shouldFocusAfterRender && (I.props.shouldReturnFocusAfterClose ? (y.returnFocus(I.props.preventScroll), y.teardownScopedFocus()) : y.popWithoutFocus()), I.props.onAfterClose && I.props.onAfterClose(), Q.default.deregister(I);
            }, I.open = function() {
              I.beforeOpen(), I.state.afterOpen && I.state.beforeClose ? (clearTimeout(I.closeTimer), I.setState({ beforeClose: !1 })) : (I.props.shouldFocusAfterRender && (y.setupScopedFocus(I.node), y.markForFocusLater()), I.setState({ isOpen: !0 }, function() {
                I.openAnimationFrame = requestAnimationFrame(function() {
                  I.setState({ afterOpen: !0 }), I.props.isOpen && I.props.onAfterOpen && I.props.onAfterOpen({ overlayEl: I.overlay, contentEl: I.content });
                });
              }));
            }, I.close = function() {
              I.props.closeTimeoutMS > 0 ? I.closeWithTimeout() : I.closeWithoutTimeout();
            }, I.focusContent = function() {
              return I.content && !I.contentHasFocus() && I.content.focus({ preventScroll: !0 });
            }, I.closeWithTimeout = function() {
              var A = Date.now() + I.props.closeTimeoutMS;
              I.setState({ beforeClose: !0, closesAt: A }, function() {
                I.closeTimer = setTimeout(I.closeWithoutTimeout, I.state.closesAt - Date.now());
              });
            }, I.closeWithoutTimeout = function() {
              I.setState({ beforeClose: !1, isOpen: !1, afterOpen: !1, closesAt: null }, I.afterClose);
            }, I.handleKeyDown = function(A) {
              A.keyCode === 9 && (0, b.default)(I.content, A), I.props.shouldCloseOnEsc && A.keyCode === 27 && (A.stopPropagation(), I.requestClose(A));
            }, I.handleOverlayOnClick = function(A) {
              I.shouldClose === null && (I.shouldClose = !0), I.shouldClose && I.props.shouldCloseOnOverlayClick && (I.ownerHandlesClose() ? I.requestClose(A) : I.focusContent()), I.shouldClose = null;
            }, I.handleContentOnMouseUp = function() {
              I.shouldClose = !1;
            }, I.handleOverlayOnMouseDown = function(A) {
              I.props.shouldCloseOnOverlayClick || A.target != I.overlay || A.preventDefault();
            }, I.handleContentOnClick = function() {
              I.shouldClose = !1;
            }, I.handleContentOnMouseDown = function() {
              I.shouldClose = !1;
            }, I.requestClose = function(A) {
              return I.ownerHandlesClose() && I.props.onRequestClose(A);
            }, I.ownerHandlesClose = function() {
              return I.props.onRequestClose;
            }, I.shouldBeClosed = function() {
              return !I.state.isOpen && !I.state.beforeClose;
            }, I.contentHasFocus = function() {
              return document.activeElement === I.content || I.content.contains(document.activeElement);
            }, I.buildClassName = function(A, se) {
              var le = (se === void 0 ? "undefined" : o(se)) === "object" ? se : { base: P[A], afterOpen: P[A] + "--after-open", beforeClose: P[A] + "--before-close" }, te = le.base;
              return I.state.afterOpen && (te = te + " " + le.afterOpen), I.state.beforeClose && (te = te + " " + le.beforeClose), typeof se == "string" && se ? te + " " + se : te;
            }, I.attributesFromObject = function(A, se) {
              return Object.keys(se).reduce(function(le, te) {
                return le[A + "-" + te] = se[te], le;
              }, {});
            }, I.state = { afterOpen: !1, beforeClose: !1 }, I.shouldClose = null, I.moveFromContentToOverlay = null, I;
          }
          return function(K, I) {
            if (typeof I != "function" && I !== null) throw new TypeError("Super expression must either be null or a function, not " + typeof I);
            K.prototype = Object.create(I && I.prototype, { constructor: { value: K, enumerable: !1, writable: !0, configurable: !0 } }), I && (Object.setPrototypeOf ? Object.setPrototypeOf(K, I) : K.__proto__ = I);
          }(oe, R), S(oe, [{ key: "componentDidMount", value: function() {
            this.props.isOpen && this.open();
          } }, { key: "componentDidUpdate", value: function(K, I) {
            this.props.isOpen && !K.isOpen ? this.open() : !this.props.isOpen && K.isOpen && this.close(), this.props.shouldFocusAfterRender && this.state.isOpen && !I.isOpen && this.focusContent();
          } }, { key: "componentWillUnmount", value: function() {
            this.state.isOpen && this.afterClose(), clearTimeout(this.closeTimer), cancelAnimationFrame(this.openAnimationFrame);
          } }, { key: "beforeOpen", value: function() {
            var K = this.props, I = K.appElement, A = K.ariaHideApp, se = K.htmlOpenClassName, le = K.bodyOpenClassName;
            le && O.add(document.body, le), se && O.add(document.getElementsByTagName("html")[0], se), A && (M += 1, C.hide(I)), Q.default.register(this);
          } }, { key: "render", value: function() {
            var K = this.props, I = K.id, A = K.className, se = K.overlayClassName, le = K.defaultStyles, te = K.children, ue = A ? {} : le.content, ye = se ? {} : le.overlay;
            if (this.shouldBeClosed()) return null;
            var Z = { ref: this.setOverlayRef, className: this.buildClassName("overlay", se), style: u({}, ye, this.props.style.overlay), onClick: this.handleOverlayOnClick, onMouseDown: this.handleOverlayOnMouseDown }, fe = u({ id: I, ref: this.setContentRef, style: u({}, ue, this.props.style.content), className: this.buildClassName("content", A), tabIndex: "-1", onKeyDown: this.handleKeyDown, onMouseDown: this.handleContentOnMouseDown, onMouseUp: this.handleContentOnMouseUp, onClick: this.handleContentOnClick, role: this.props.role, "aria-label": this.props.contentLabel }, this.attributesFromObject("aria", u({ modal: !0 }, this.props.aria)), this.attributesFromObject("data", this.props.data || {}), { "data-testid": this.props.testId }), D = this.props.contentElement(fe, te);
            return this.props.overlayElement(Z, D);
          } }]), oe;
        }(m.Component);
        F.defaultProps = { style: { overlay: {}, content: {} }, defaultStyles: {} }, F.propTypes = { isOpen: g.default.bool.isRequired, defaultStyles: g.default.shape({ content: g.default.object, overlay: g.default.object }), style: g.default.shape({ content: g.default.object, overlay: g.default.object }), className: g.default.oneOfType([g.default.string, g.default.object]), overlayClassName: g.default.oneOfType([g.default.string, g.default.object]), bodyOpenClassName: g.default.string, htmlOpenClassName: g.default.string, ariaHideApp: g.default.bool, appElement: g.default.oneOfType([g.default.instanceOf(J.default), g.default.instanceOf(N.SafeHTMLCollection), g.default.instanceOf(N.SafeNodeList), g.default.arrayOf(g.default.instanceOf(J.default))]), onAfterOpen: g.default.func, onAfterClose: g.default.func, onRequestClose: g.default.func, closeTimeoutMS: g.default.number, shouldFocusAfterRender: g.default.bool, shouldCloseOnOverlayClick: g.default.bool, shouldReturnFocusAfterClose: g.default.bool, preventScroll: g.default.bool, role: g.default.string, contentLabel: g.default.string, aria: g.default.object, data: g.default.object, children: g.default.node, shouldCloseOnEsc: g.default.bool, overlayRef: g.default.func, contentRef: g.default.func, id: g.default.string, overlayElement: g.default.func, contentElement: g.default.func, testId: g.default.string }, s.default = F, E.exports = s.default;
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.resetState = function() {
          m = [];
        }, s.log = function() {
        }, s.handleBlur = b, s.handleFocus = C, s.markForFocusLater = function() {
          m.push(document.activeElement);
        }, s.returnFocus = function() {
          var O = arguments.length > 0 && arguments[0] !== void 0 && arguments[0], N = null;
          try {
            return void (m.length !== 0 && (N = m.pop()).focus({ preventScroll: O }));
          } catch {
            console.warn(["You tried to return focus to", N, "but it is not in the DOM anymore"].join(" "));
          }
        }, s.popWithoutFocus = function() {
          m.length > 0 && m.pop();
        }, s.setupScopedFocus = function(O) {
          g = O, window.addEventListener ? (window.addEventListener("blur", b, !1), document.addEventListener("focus", C, !0)) : (window.attachEvent("onBlur", b), document.attachEvent("onFocus", C));
        }, s.teardownScopedFocus = function() {
          g = null, window.addEventListener ? (window.removeEventListener("blur", b), document.removeEventListener("focus", C)) : (window.detachEvent("onBlur", b), document.detachEvent("onFocus", C));
        };
        var u, o = d(42), S = (u = o) && u.__esModule ? u : { default: u }, m = [], g = null, y = !1;
        function b() {
          y = !0;
        }
        function C() {
          if (y) {
            if (y = !1, !g) return;
            setTimeout(function() {
              g.contains(document.activeElement) || ((0, S.default)(g)[0] || g).focus();
            }, 0);
          }
        }
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.default = function(m, g) {
          var y = (0, S.default)(m);
          if (!y.length) return void g.preventDefault();
          var b = void 0, C = g.shiftKey, O = y[0], N = y[y.length - 1], J = function W() {
            var P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : document;
            return P.activeElement.shadowRoot ? W(P.activeElement.shadowRoot) : P.activeElement;
          }();
          if (m === J) {
            if (!C) return;
            b = N;
          }
          if (N !== J || C || (b = O), O === J && C && (b = N), b) return g.preventDefault(), void b.focus();
          var Q = /(\bChrome\b|\bSafari\b)\//.exec(navigator.userAgent);
          if (!(Q == null || Q[1] == "Chrome" || /\biPod\b|\biPad\b/g.exec(navigator.userAgent) != null)) {
            var j = y.indexOf(J);
            if (j > -1 && (j += C ? -1 : 1), (b = y[j]) === void 0) return g.preventDefault(), void (b = C ? N : O).focus();
            g.preventDefault(), b.focus();
          }
        };
        var u, o = d(42), S = (u = o) && u.__esModule ? u : { default: u };
        E.exports = s.default;
      }, function(E, s, d) {
        var u = function() {
        };
        E.exports = u;
      }, function(E, s, d) {
        var u;
        (function() {
          var o = !(typeof window > "u" || !window.document || !window.document.createElement), S = { canUseDOM: o, canUseWorkers: typeof Worker < "u", canUseEventListeners: o && !(!window.addEventListener && !window.attachEvent), canUseViewport: o && !!window.screen };
          (u = (function() {
            return S;
          }).call(s, d, s, E)) === void 0 || (E.exports = u);
        })();
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.resetState = function() {
          var m = document.getElementsByTagName("html")[0];
          for (var g in u) S(m, u[g]);
          var y = document.body;
          for (var b in o) S(y, o[b]);
          u = {}, o = {};
        }, s.log = function() {
        };
        var u = {}, o = {};
        function S(m, g) {
          m.classList.remove(g);
        }
        s.add = function(m, g) {
          return y = m.classList, b = m.nodeName.toLowerCase() == "html" ? u : o, void g.split(" ").forEach(function(C) {
            (function(O, N) {
              O[N] || (O[N] = 0), O[N] += 1;
            })(b, C), y.add(C);
          });
          var y, b;
        }, s.remove = function(m, g) {
          return y = m.classList, b = m.nodeName.toLowerCase() == "html" ? u : o, void g.split(" ").forEach(function(C) {
            (function(O, N) {
              O[N] && (O[N] -= 1);
            })(b, C), b[C] === 0 && y.remove(C);
          });
          var y, b;
        };
      }, function(E, s, d) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.resetState = function() {
          for (var C = [m, g], O = 0; O < C.length; O++) {
            var N = C[O];
            N && N.parentNode && N.parentNode.removeChild(N);
          }
          m = g = null, y = [];
        }, s.log = function() {
          console.log("bodyTrap ----------"), console.log(y.length);
          for (var C = [m, g], O = 0; O < C.length; O++) {
            var N = C[O] || {};
            console.log(N.nodeName, N.className, N.id);
          }
          console.log("edn bodyTrap ----------");
        };
        var u, o = d(44), S = (u = o) && u.__esModule ? u : { default: u }, m = void 0, g = void 0, y = [];
        function b() {
          y.length !== 0 && y[y.length - 1].focusContent();
        }
        S.default.subscribe(function(C, O) {
          m || g || ((m = document.createElement("div")).setAttribute("data-react-modal-body-trap", ""), m.style.position = "absolute", m.style.opacity = "0", m.setAttribute("tabindex", "0"), m.addEventListener("focus", b), (g = m.cloneNode()).addEventListener("focus", b)), (y = O).length > 0 ? (document.body.firstChild !== m && document.body.insertBefore(m, document.body.firstChild), document.body.lastChild !== g && document.body.appendChild(g)) : (m.parentElement && m.parentElement.removeChild(m), g.parentElement && g.parentElement.removeChild(g));
        });
      }, function(E, s, d) {
        function u() {
          var g = this.constructor.getDerivedStateFromProps(this.props, this.state);
          g != null && this.setState(g);
        }
        function o(g) {
          this.setState((function(y) {
            var b = this.constructor.getDerivedStateFromProps(g, y);
            return b ?? null;
          }).bind(this));
        }
        function S(g, y) {
          try {
            var b = this.props, C = this.state;
            this.props = g, this.state = y, this.__reactInternalSnapshotFlag = !0, this.__reactInternalSnapshot = this.getSnapshotBeforeUpdate(b, C);
          } finally {
            this.props = b, this.state = C;
          }
        }
        function m(g) {
          var y = g.prototype;
          if (!y || !y.isReactComponent) throw new Error("Can only polyfill class components");
          if (typeof g.getDerivedStateFromProps != "function" && typeof y.getSnapshotBeforeUpdate != "function") return g;
          var b = null, C = null, O = null;
          if (typeof y.componentWillMount == "function" ? b = "componentWillMount" : typeof y.UNSAFE_componentWillMount == "function" && (b = "UNSAFE_componentWillMount"), typeof y.componentWillReceiveProps == "function" ? C = "componentWillReceiveProps" : typeof y.UNSAFE_componentWillReceiveProps == "function" && (C = "UNSAFE_componentWillReceiveProps"), typeof y.componentWillUpdate == "function" ? O = "componentWillUpdate" : typeof y.UNSAFE_componentWillUpdate == "function" && (O = "UNSAFE_componentWillUpdate"), b !== null || C !== null || O !== null) {
            var N = g.displayName || g.name, J = typeof g.getDerivedStateFromProps == "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
            throw Error(`Unsafe legacy lifecycles will not be called for components using new component APIs.

` + N + " uses " + J + " but also contains the following legacy lifecycles:" + (b !== null ? `
  ` + b : "") + (C !== null ? `
  ` + C : "") + (O !== null ? `
  ` + O : "") + `

The above lifecycles should be removed. Learn more about this warning here:
https://fb.me/react-async-component-lifecycle-hooks`);
          }
          if (typeof g.getDerivedStateFromProps == "function" && (y.componentWillMount = u, y.componentWillReceiveProps = o), typeof y.getSnapshotBeforeUpdate == "function") {
            if (typeof y.componentDidUpdate != "function") throw new Error("Cannot polyfill getSnapshotBeforeUpdate() for components that do not define componentDidUpdate() on the prototype");
            y.componentWillUpdate = S;
            var Q = y.componentDidUpdate;
            y.componentDidUpdate = function(j, W, P) {
              var M = this.__reactInternalSnapshotFlag ? this.__reactInternalSnapshot : P;
              Q.call(this, j, W, M);
            };
          }
          return g;
        }
        d.r(s), d.d(s, "polyfill", function() {
          return m;
        }), u.__suppressDeprecationWarning = !0, o.__suppressDeprecationWarning = !0, S.__suppressDeprecationWarning = !0;
      }, function(E, s, d) {
        var u = d(6), o = d(87);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, ".ck-inspector-modal{--ck-inspector-set-data-modal-overlay:rgba(0,0,0,0.5);--ck-inspector-set-data-modal-shadow:rgba(0,0,0,0.06);--ck-inspector-set-data-modal-button-background:#eee;--ck-inspector-set-data-modal-button-background-hover:#ddd;--ck-inspector-set-data-modal-save-button-background:#1976d2;--ck-inspector-set-data-modal-save-button-background-hover:#0b60b5}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal{z-index:999999;position:fixed;inset:0;background-color:var(--ck-inspector-set-data-modal-overlay)}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal .ck-inspector-quick-actions__set-data-modal__content{position:absolute;border:1px solid var(--ck-inspector-color-border);background:var(--ck-inspector-color-white);overflow:auto;border-radius:2px;outline:none;box-shadow:0 1px 1px var(--ck-inspector-set-data-modal-shadow),0 2px 2px var(--ck-inspector-set-data-modal-shadow),0 4px 4px var(--ck-inspector-set-data-modal-shadow),0 8px 8px var(--ck-inspector-set-data-modal-shadow),0 16px 16px var(--ck-inspector-set-data-modal-shadow);max-height:calc(100vh - 160px);max-width:calc(100vw - 160px);width:100%;height:100%;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;justify-content:space-between}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal .ck-inspector-quick-actions__set-data-modal__content h2{font-size:14px;font-weight:700;margin:0;padding:12px 20px;background:var(--ck-inspector-color-background);border-bottom:1px solid var(--ck-inspector-color-border)}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal .ck-inspector-quick-actions__set-data-modal__content textarea{flex-grow:1;margin:20px;border:1px solid var(--ck-inspector-color-border);border-radius:2px;resize:none;padding:10px;font-family:monospace;font-size:14px}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal .ck-inspector-quick-actions__set-data-modal__content button{padding:10px 20px;border-radius:2px;font-size:14px;white-space:nowrap;border:1px solid var(--ck-inspector-color-border)}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal .ck-inspector-quick-actions__set-data-modal__content button:hover{background:var(--ck-inspector-set-data-modal-button-background-hover)}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal .ck-inspector-quick-actions__set-data-modal__content .ck-inspector-quick-actions__set-data-modal__buttons{margin:0 20px 20px;display:flex;justify-content:center}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal .ck-inspector-quick-actions__set-data-modal__content .ck-inspector-quick-actions__set-data-modal__buttons button+button{margin-left:20px}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal .ck-inspector-quick-actions__set-data-modal__content .ck-inspector-quick-actions__set-data-modal__buttons button:first-child{margin-right:auto}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal .ck-inspector-quick-actions__set-data-modal__content .ck-inspector-quick-actions__set-data-modal__buttons button:not(:first-child){flex-basis:20%}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal .ck-inspector-quick-actions__set-data-modal__content .ck-inspector-quick-actions__set-data-modal__buttons button:last-child{background:var(--ck-inspector-set-data-modal-save-button-background);border-color:var(--ck-inspector-set-data-modal-save-button-background);color:#fff;font-weight:700}.ck-inspector-modal.ck-inspector-quick-actions__set-data-modal .ck-inspector-quick-actions__set-data-modal__content .ck-inspector-quick-actions__set-data-modal__buttons button:last-child:hover{background:var(--ck-inspector-set-data-modal-save-button-background-hover)}", ""]);
      }, function(E, s, d) {
        var u = d(6), o = d(89);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, ".ck-inspector .ck-inspector-editor-quick-actions{display:flex;align-content:center;justify-content:center;align-items:center;flex-direction:row;flex-wrap:nowrap}.ck-inspector .ck-inspector-editor-quick-actions>.ck-inspector-button{margin-left:.3em}.ck-inspector .ck-inspector-editor-quick-actions>.ck-inspector-button.ck-inspector-button_data-copied{animation-duration:.5s;animation-name:ck-inspector-bounce-in;color:green}@keyframes ck-inspector-bounce-in{0%{opacity:0;transform:scale3d(.5,.5,.5)}20%{transform:scale3d(1.1,1.1,1.1)}40%{transform:scale3d(.8,.8,.8)}60%{opacity:1;transform:scale3d(1.05,1.05,1.05)}to{opacity:1;transform:scaleX(1)}}", ""]);
      }, function(E, s, d) {
        var u = d(6), o = d(91);
        typeof (o = o.__esModule ? o.default : o) == "string" && (o = [[E.i, o, ""]]);
        var S = { injectType: "singletonStyleTag", attributes: { "data-cke-inspector": !0 }, insert: "head", singleton: !0 };
        u(o, S), E.exports = o.locals || {};
      }, function(E, s, d) {
        (E.exports = d(7)(!1)).push([E.i, "html body.ck-inspector-body-expanded{margin-bottom:var(--ck-inspector-height)}html body.ck-inspector-body-collapsed{margin-bottom:var(--ck-inspector-collapsed-height)}.ck-inspector-wrapper *{box-sizing:border-box}", ""]);
      }, , , function(E, s, d) {
        d.r(s), d.d(s, "default", function() {
          return $e;
        });
        var u = d(0), o = d.n(u), S = d(12), m = d.n(S);
        function g(w) {
          return "Minified Redux error #" + w + "; visit https://redux.js.org/Errors?code=" + w + " for the full message or use the non-minified dev environment for full errors. ";
        }
        var y = typeof Symbol == "function" && Symbol.observable || "@@observable", b = function() {
          return Math.random().toString(36).substring(7).split("").join(".");
        }, C = { INIT: "@@redux/INIT" + b(), REPLACE: "@@redux/REPLACE" + b(), PROBE_UNKNOWN_ACTION: function() {
          return "@@redux/PROBE_UNKNOWN_ACTION" + b();
        } };
        function O(w) {
          if (typeof w != "object" || w === null) return !1;
          for (var a = w; Object.getPrototypeOf(a) !== null; ) a = Object.getPrototypeOf(a);
          return Object.getPrototypeOf(w) === a;
        }
        function N(w, a, c) {
          var h;
          if (typeof a == "function" && typeof c == "function" || typeof c == "function" && typeof arguments[3] == "function") throw new Error(g(0));
          if (typeof a == "function" && c === void 0 && (c = a, a = void 0), c !== void 0) {
            if (typeof c != "function") throw new Error(g(1));
            return c(N)(w, a);
          }
          if (typeof w != "function") throw new Error(g(2));
          var _ = w, T = a, z = [], ne = z, de = !1;
          function pe() {
            ne === z && (ne = z.slice());
          }
          function _e() {
            if (de) throw new Error(g(3));
            return T;
          }
          function Ne(Ie) {
            if (typeof Ie != "function") throw new Error(g(4));
            if (de) throw new Error(g(5));
            var Fe = !0;
            return pe(), ne.push(Ie), function() {
              if (Fe) {
                if (de) throw new Error(g(6));
                Fe = !1, pe();
                var et = ne.indexOf(Ie);
                ne.splice(et, 1), z = null;
              }
            };
          }
          function We(Ie) {
            if (!O(Ie)) throw new Error(g(7));
            if (Ie.type === void 0) throw new Error(g(8));
            if (de) throw new Error(g(9));
            try {
              de = !0, T = _(T, Ie);
            } finally {
              de = !1;
            }
            for (var Fe = z = ne, et = 0; et < Fe.length; et++)
              (0, Fe[et])();
            return Ie;
          }
          function Ae(Ie) {
            if (typeof Ie != "function") throw new Error(g(10));
            _ = Ie, We({ type: C.REPLACE });
          }
          function Ke() {
            var Ie, Fe = Ne;
            return (Ie = { subscribe: function(et) {
              if (typeof et != "object" || et === null) throw new Error(g(11));
              function Ye() {
                et.next && et.next(_e());
              }
              return Ye(), { unsubscribe: Fe(Ye) };
            } })[y] = function() {
              return this;
            }, Ie;
          }
          return We({ type: C.INIT }), (h = { dispatch: We, subscribe: Ne, getState: _e, replaceReducer: Ae })[y] = Ke, h;
        }
        var J = o.a.createContext(null), Q = function(w) {
          w();
        };
        function j() {
          var w = Q, a = null, c = null;
          return { clear: function() {
            a = null, c = null;
          }, notify: function() {
            w(function() {
              for (var h = a; h; ) h.callback(), h = h.next;
            });
          }, get: function() {
            for (var h = [], _ = a; _; ) h.push(_), _ = _.next;
            return h;
          }, subscribe: function(h) {
            var _ = !0, T = c = { callback: h, next: null, prev: c };
            return T.prev ? T.prev.next = T : a = T, function() {
              _ && a !== null && (_ = !1, T.next ? T.next.prev = T.prev : c = T.prev, T.prev ? T.prev.next = T.next : a = T.next);
            };
          } };
        }
        var W = { notify: function() {
        }, get: function() {
          return [];
        } };
        function P(w, a) {
          var c, h = W;
          function _() {
            z.onStateChange && z.onStateChange();
          }
          function T() {
            c || (c = a ? a.addNestedSub(_) : w.subscribe(_), h = j());
          }
          var z = { addNestedSub: function(ne) {
            return T(), h.subscribe(ne);
          }, notifyNestedSubs: function() {
            h.notify();
          }, handleChangeWrapper: _, isSubscribed: function() {
            return !!c;
          }, trySubscribe: T, tryUnsubscribe: function() {
            c && (c(), c = void 0, h.clear(), h = W);
          }, getListeners: function() {
            return h;
          } };
          return z;
        }
        var M = typeof window < "u" && window.document !== void 0 && window.document.createElement !== void 0 ? u.useLayoutEffect : u.useEffect, F = function(w) {
          var a = w.store, c = w.context, h = w.children, _ = Object(u.useMemo)(function() {
            var ne = P(a);
            return { store: a, subscription: ne };
          }, [a]), T = Object(u.useMemo)(function() {
            return a.getState();
          }, [a]);
          M(function() {
            var ne = _.subscription;
            return ne.onStateChange = ne.notifyNestedSubs, ne.trySubscribe(), T !== a.getState() && ne.notifyNestedSubs(), function() {
              ne.tryUnsubscribe(), ne.onStateChange = null;
            };
          }, [_, T]);
          var z = c || J;
          return o.a.createElement(z.Provider, { value: _ }, h);
        };
        function R() {
          return (R = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        function oe(w, a) {
          if (w == null) return {};
          var c, h, _ = {}, T = Object.keys(w);
          for (h = 0; h < T.length; h++) c = T[h], a.indexOf(c) >= 0 || (_[c] = w[c]);
          return _;
        }
        var K = d(39), I = d.n(K), A = d(45), se = ["getDisplayName", "methodName", "renderCountProp", "shouldHandleStateChanges", "storeKey", "withRef", "forwardRef", "context"], le = ["reactReduxForwardedRef"], te = [], ue = [null, null];
        function ye(w, a) {
          var c = w[1];
          return [a.payload, c + 1];
        }
        function Z(w, a, c) {
          M(function() {
            return w.apply(void 0, a);
          }, c);
        }
        function fe(w, a, c, h, _, T, z) {
          w.current = h, a.current = _, c.current = !1, T.current && (T.current = null, z());
        }
        function D(w, a, c, h, _, T, z, ne, de, pe) {
          if (w) {
            var _e = !1, Ne = null, We = function() {
              if (!_e) {
                var Ae, Ke, Ie = a.getState();
                try {
                  Ae = h(Ie, _.current);
                } catch (Fe) {
                  Ke = Fe, Ne = Fe;
                }
                Ke || (Ne = null), Ae === T.current ? z.current || de() : (T.current = Ae, ne.current = Ae, z.current = !0, pe({ type: "STORE_UPDATED", payload: { error: Ke } }));
              }
            };
            return c.onStateChange = We, c.trySubscribe(), We(), function() {
              if (_e = !0, c.tryUnsubscribe(), c.onStateChange = null, Ne) throw Ne;
            };
          }
        }
        var ie = function() {
          return [null, 0];
        };
        function be(w, a) {
          a === void 0 && (a = {});
          var c = a, h = c.getDisplayName, _ = h === void 0 ? function(Le) {
            return "ConnectAdvanced(" + Le + ")";
          } : h, T = c.methodName, z = T === void 0 ? "connectAdvanced" : T, ne = c.renderCountProp, de = ne === void 0 ? void 0 : ne, pe = c.shouldHandleStateChanges, _e = pe === void 0 || pe, Ne = c.storeKey, We = Ne === void 0 ? "store" : Ne, Ae = (c.withRef, c.forwardRef), Ke = Ae !== void 0 && Ae, Ie = c.context, Fe = Ie === void 0 ? J : Ie, et = oe(c, se), Ye = Fe;
          return function(Le) {
            var ft = Le.displayName || Le.name || "Component", Dt = _(ft), It = R({}, et, { getDisplayName: _, methodName: z, renderCountProp: de, shouldHandleStateChanges: _e, storeKey: We, displayName: Dt, wrappedComponentName: ft, WrappedComponent: Le }), jt = et.pure, _t = jt ? u.useMemo : function(lt) {
              return lt();
            };
            function zt(lt) {
              var Mn = Object(u.useMemo)(function() {
                var wn = lt.reactReduxForwardedRef, so = oe(lt, le);
                return [lt.context, wn, so];
              }, [lt]), Hn = Mn[0], zr = Mn[1], xt = Mn[2], io = Object(u.useMemo)(function() {
                return Hn && Hn.Consumer && Object(A.isContextConsumer)(o.a.createElement(Hn.Consumer, null)) ? Hn : Ye;
              }, [Hn, Ye]), In = Object(u.useContext)(io), $t = !!lt.store && !!lt.store.getState && !!lt.store.dispatch;
              In && In.store;
              var fn = $t ? lt.store : In.store, Gn = Object(u.useMemo)(function() {
                return function(wn) {
                  return w(wn.dispatch, It);
                }(fn);
              }, [fn]), Gt = Object(u.useMemo)(function() {
                if (!_e) return ue;
                var wn = P(fn, $t ? null : In.subscription), so = wn.notifyNestedSubs.bind(wn);
                return [wn, so];
              }, [fn, $t, In]), dn = Gt[0], Lr = Gt[1], oi = Object(u.useMemo)(function() {
                return $t ? In : R({}, In, { subscription: dn });
              }, [$t, In, dn]), Ur = Object(u.useReducer)(ye, te, ie), Mo = Ur[0][0], mr = Ur[1];
              if (Mo && Mo.error) throw Mo.error;
              var zi = Object(u.useRef)(), gr = Object(u.useRef)(xt), Io = Object(u.useRef)(), ii = Object(u.useRef)(!1), Xn = _t(function() {
                return Io.current && xt === gr.current ? Io.current : Gn(fn.getState(), xt);
              }, [fn, Mo, xt]);
              Z(fe, [gr, zi, ii, xt, Xn, Io, Lr]), Z(D, [_e, fn, dn, Gn, gr, zi, ii, Io, Lr, mr], [fn, dn, Gn]);
              var ao = Object(u.useMemo)(function() {
                return o.a.createElement(Le, R({}, Xn, { ref: zr }));
              }, [zr, Le, Xn]);
              return Object(u.useMemo)(function() {
                return _e ? o.a.createElement(io.Provider, { value: oi }, ao) : ao;
              }, [io, ao, oi]);
            }
            var dt = jt ? o.a.memo(zt) : zt;
            if (dt.WrappedComponent = Le, dt.displayName = zt.displayName = Dt, Ke) {
              var An = o.a.forwardRef(function(lt, Mn) {
                return o.a.createElement(dt, R({}, lt, { reactReduxForwardedRef: Mn }));
              });
              return An.displayName = Dt, An.WrappedComponent = Le, I()(An, Le);
            }
            return I()(dt, Le);
          };
        }
        function Te(w, a) {
          return w === a ? w !== 0 || a !== 0 || 1 / w == 1 / a : w != w && a != a;
        }
        function Ee(w, a) {
          if (Te(w, a)) return !0;
          if (typeof w != "object" || w === null || typeof a != "object" || a === null) return !1;
          var c = Object.keys(w), h = Object.keys(a);
          if (c.length !== h.length) return !1;
          for (var _ = 0; _ < c.length; _++) if (!Object.prototype.hasOwnProperty.call(a, c[_]) || !Te(w[c[_]], a[c[_]])) return !1;
          return !0;
        }
        function Pe(w) {
          return function(a, c) {
            var h = w(a, c);
            function _() {
              return h;
            }
            return _.dependsOnOwnProps = !1, _;
          };
        }
        function Se(w) {
          return w.dependsOnOwnProps !== null && w.dependsOnOwnProps !== void 0 ? !!w.dependsOnOwnProps : w.length !== 1;
        }
        function ze(w, a) {
          return function(c, h) {
            h.displayName;
            var _ = function(T, z) {
              return _.dependsOnOwnProps ? _.mapToProps(T, z) : _.mapToProps(T);
            };
            return _.dependsOnOwnProps = !0, _.mapToProps = function(T, z) {
              _.mapToProps = w, _.dependsOnOwnProps = Se(w);
              var ne = _(T, z);
              return typeof ne == "function" && (_.mapToProps = ne, _.dependsOnOwnProps = Se(ne), ne = _(T, z)), ne;
            }, _;
          };
        }
        var Ze = [function(w) {
          return typeof w == "function" ? ze(w) : void 0;
        }, function(w) {
          return w ? void 0 : Pe(function(a) {
            return { dispatch: a };
          });
        }, function(w) {
          return w && typeof w == "object" ? Pe(function(a) {
            return function(c, h) {
              var _ = {}, T = function(ne) {
                var de = c[ne];
                typeof de == "function" && (_[ne] = function() {
                  return h(de.apply(void 0, arguments));
                });
              };
              for (var z in c) T(z);
              return _;
            }(w, a);
          }) : void 0;
        }], G = [function(w) {
          return typeof w == "function" ? ze(w) : void 0;
        }, function(w) {
          return w ? void 0 : Pe(function() {
            return {};
          });
        }];
        function Y(w, a, c) {
          return R({}, c, w, a);
        }
        var me = [function(w) {
          return typeof w == "function" ? /* @__PURE__ */ function(a) {
            return function(c, h) {
              h.displayName;
              var _, T = h.pure, z = h.areMergedPropsEqual, ne = !1;
              return function(de, pe, _e) {
                var Ne = a(de, pe, _e);
                return ne ? T && z(Ne, _) || (_ = Ne) : (ne = !0, _ = Ne), _;
              };
            };
          }(w) : void 0;
        }, function(w) {
          return w ? void 0 : function() {
            return Y;
          };
        }], l = ["initMapStateToProps", "initMapDispatchToProps", "initMergeProps"];
        function f(w, a, c, h) {
          return function(_, T) {
            return c(w(_, T), a(h, T), T);
          };
        }
        function k(w, a, c, h, _) {
          var T, z, ne, de, pe, _e = _.areStatesEqual, Ne = _.areOwnPropsEqual, We = _.areStatePropsEqual, Ae = !1;
          function Ke(Ie, Fe) {
            var et, Ye, Le = !Ne(Fe, z), ft = !_e(Ie, T);
            return T = Ie, z = Fe, Le && ft ? (ne = w(T, z), a.dependsOnOwnProps && (de = a(h, z)), pe = c(ne, de, z)) : Le ? (w.dependsOnOwnProps && (ne = w(T, z)), a.dependsOnOwnProps && (de = a(h, z)), pe = c(ne, de, z)) : (ft && (et = w(T, z), Ye = !We(et, ne), ne = et, Ye && (pe = c(ne, de, z))), pe);
          }
          return function(Ie, Fe) {
            return Ae ? Ke(Ie, Fe) : (ne = w(T = Ie, z = Fe), de = a(h, z), pe = c(ne, de, z), Ae = !0, pe);
          };
        }
        function L(w, a) {
          var c = a.initMapStateToProps, h = a.initMapDispatchToProps, _ = a.initMergeProps, T = oe(a, l), z = c(w, T), ne = h(w, T), de = _(w, T);
          return (T.pure ? k : f)(z, ne, de, w, T);
        }
        var U = ["pure", "areStatesEqual", "areOwnPropsEqual", "areStatePropsEqual", "areMergedPropsEqual"];
        function B(w, a, c) {
          for (var h = a.length - 1; h >= 0; h--) {
            var _ = a[h](w);
            if (_) return _;
          }
          return function(T, z) {
            throw new Error("Invalid value of type " + typeof w + " for " + c + " argument when connecting component " + z.wrappedComponentName + ".");
          };
        }
        function he(w, a) {
          return w === a;
        }
        function je(w) {
          var a = {}, c = a.connectHOC, h = c === void 0 ? be : c, _ = a.mapStateToPropsFactories, T = _ === void 0 ? G : _, z = a.mapDispatchToPropsFactories, ne = z === void 0 ? Ze : z, de = a.mergePropsFactories, pe = de === void 0 ? me : de, _e = a.selectorFactory, Ne = _e === void 0 ? L : _e;
          return function(We, Ae, Ke, Ie) {
            Ie === void 0 && (Ie = {});
            var Fe = Ie, et = Fe.pure, Ye = et === void 0 || et, Le = Fe.areStatesEqual, ft = Le === void 0 ? he : Le, Dt = Fe.areOwnPropsEqual, It = Dt === void 0 ? Ee : Dt, jt = Fe.areStatePropsEqual, _t = jt === void 0 ? Ee : jt, zt = Fe.areMergedPropsEqual, dt = zt === void 0 ? Ee : zt, An = oe(Fe, U), lt = B(We, T, "mapStateToProps"), Mn = B(Ae, ne, "mapDispatchToProps"), Hn = B(Ke, pe, "mergeProps");
            return h(Ne, R({ methodName: "connect", getDisplayName: function(zr) {
              return "Connect(" + zr + ")";
            }, shouldHandleStateChanges: !!We, initMapStateToProps: lt, initMapDispatchToProps: Mn, initMergeProps: Hn, pure: Ye, areStatesEqual: ft, areOwnPropsEqual: It, areStatePropsEqual: _t, areMergedPropsEqual: dt }, An));
          };
        }
        var Re = je(), Xe;
        Xe = S.unstable_batchedUpdates, Q = Xe;
        function Ve(w) {
          return { type: "SET_MODEL_ACTIVE_TAB", tabName: w };
        }
        function At() {
          return { type: "TOGGLE_IS_COLLAPSED" };
        }
        function kt(w) {
          return { type: "SET_EDITORS", editors: w };
        }
        function Zt(w) {
          return { type: "SET_CURRENT_EDITOR_NAME", editorName: w };
        }
        function wt(w) {
          return { type: "SET_ACTIVE_INSPECTOR_TAB", tabName: w };
        }
        var gt = d(10), un = d(4);
        class Er {
          constructor(a) {
            this._config = a;
          }
          startListening(a) {
            a.model.document.on("change", this._config.onModelChange), a.editing.view.on("render", this._config.onViewRender), a.on("change:isReadOnly", this._config.onReadOnlyChange);
          }
          stopListening(a) {
            a.model.document.off("change", this._config.onModelChange), a.editing.view.off("render", this._config.onViewRender), a.off("change:isReadOnly", this._config.onReadOnlyChange);
          }
        }
        function Tt(w) {
          return w.editors.get(w.currentEditorName);
        }
        class pt {
          static set(a, c) {
            window.localStorage.setItem("ck5-inspector-" + a, c);
          }
          static get(a) {
            return window.localStorage.getItem("ck5-inspector-" + a);
          }
        }
        function $n(w, a, c) {
          const h = function(_, T, z) {
            if (_.ui.activeTab !== "Model") return T;
            if (!T) return Sn(_, T);
            switch (z.type) {
              case "SET_MODEL_CURRENT_ROOT_NAME":
                return function(ne, de, pe) {
                  const _e = pe.currentRootName;
                  return { ...de, ...or(ne, de, { currentRootName: _e }), currentNode: null, currentNodeDefinition: null, currentRootName: _e };
                }(_, T, z);
              case "SET_MODEL_CURRENT_NODE":
                return { ...T, currentNode: z.currentNode, currentNodeDefinition: Object(gt.b)(Tt(_), z.currentNode) };
              case "SET_ACTIVE_INSPECTOR_TAB":
              case "UPDATE_MODEL_STATE":
                return { ...T, ...or(_, T) };
              case "SET_EDITORS":
              case "SET_CURRENT_EDITOR_NAME":
                return Sn(_, T);
              default:
                return T;
            }
          }(w, a, c);
          return h && (h.ui = function(_, T) {
            if (!_) return { activeTab: pt.get("active-model-tab-name") || "Inspect", showMarkers: pt.get("model-show-markers") === "true", showCompactText: pt.get("model-compact-text") === "true" };
            switch (T.type) {
              case "SET_MODEL_ACTIVE_TAB":
                return function(z, ne) {
                  return pt.set("active-model-tab-name", ne.tabName), { ...z, activeTab: ne.tabName };
                }(_, T);
              case "TOGGLE_MODEL_SHOW_MARKERS":
                return function(z) {
                  const ne = !z.showMarkers;
                  return pt.set("model-show-markers", ne), { ...z, showMarkers: ne };
                }(_);
              case "TOGGLE_MODEL_SHOW_COMPACT_TEXT":
                return function(z) {
                  const ne = !z.showCompactText;
                  return pt.set("model-compact-text", ne), { ...z, showCompactText: ne };
                }(_);
              default:
                return _;
            }
          }(h.ui, c)), h;
        }
        function Sn(w, a = {}) {
          const c = Tt(w);
          if (!c) return { ui: a.ui };
          const h = Object(gt.d)(c)[0].rootName;
          return { ...a, ...or(w, a, { currentRootName: h }), currentRootName: h, currentNode: null, currentNodeDefinition: null };
        }
        function or(w, a, c) {
          const h = Tt(w), _ = { ...a, ...c }, T = _.currentRootName, z = Object(gt.c)(h, T), ne = Object(gt.a)(h, T), de = Object(gt.e)({ currentEditor: h, currentRootName: _.currentRootName, ranges: z, markers: ne });
          let pe = _.currentNode, _e = _.currentNodeDefinition;
          return pe ? pe.root.rootName !== T || !Object(un.d)(pe) && !pe.parent ? (pe = null, _e = null) : _e = Object(gt.b)(h, pe) : _e = null, { treeDefinition: de, currentNode: pe, currentNodeDefinition: _e, ranges: z, markers: ne };
        }
        function _r(w) {
          return { type: "SET_VIEW_ACTIVE_TAB", tabName: w };
        }
        function wo() {
          return { type: "UPDATE_VIEW_STATE" };
        }
        var en = d(9), Yt = d(2);
        function xr(w, a, c) {
          const h = function(_, T, z) {
            if (_.ui.activeTab !== "View") return T;
            if (!T) return qt(_, T);
            switch (z.type) {
              case "SET_VIEW_CURRENT_ROOT_NAME":
                return function(ne, de, pe) {
                  const _e = pe.currentRootName;
                  return { ...de, ...gn(ne, de, { currentRootName: _e }), currentNode: null, currentNodeDefinition: null, currentRootName: _e };
                }(_, T, z);
              case "SET_VIEW_CURRENT_NODE":
                return { ...T, currentNode: z.currentNode, currentNodeDefinition: Object(en.b)(z.currentNode) };
              case "SET_ACTIVE_INSPECTOR_TAB":
              case "UPDATE_VIEW_STATE":
                return { ...T, ...gn(_, T) };
              case "SET_EDITORS":
              case "SET_CURRENT_EDITOR_NAME":
                return qt(_, T);
              default:
                return T;
            }
          }(w, a, c);
          return h && (h.ui = function(_, T, z) {
            if (!T) return { activeTab: pt.get("active-view-tab-name") || "Inspect", showElementTypes: pt.get("view-element-types") === "true" };
            switch (z.type) {
              case "SET_VIEW_ACTIVE_TAB":
                return function(ne, de) {
                  return pt.set("active-view-tab-name", de.tabName), { ...ne, activeTab: de.tabName };
                }(T, z);
              case "TOGGLE_VIEW_SHOW_ELEMENT_TYPES":
                return function(ne, de) {
                  const pe = !de.showElementTypes;
                  return pt.set("view-element-types", pe), { ...de, showElementTypes: pe };
                }(0, T);
              default:
                return T;
            }
          }(0, h.ui, c)), h;
        }
        function qt(w, a = {}) {
          const c = Tt(w), h = Object(en.d)(c), _ = h[0] ? h[0].rootName : null;
          return { ...a, ...gn(w, a, { currentRootName: _ }), currentRootName: _, currentNode: null, currentNodeDefinition: null };
        }
        function gn(w, a, c) {
          const h = { ...a, ...c }, _ = h.currentRootName, T = Object(en.c)(Tt(w), _), z = Object(en.e)({ currentEditor: Tt(w), currentRootName: _, ranges: T });
          let ne = h.currentNode, de = h.currentNodeDefinition;
          return ne ? ne.root.rootName !== _ || !Object(Yt.g)(ne) && !ne.parent ? (ne = null, de = null) : de = Object(en.b)(ne) : de = null, { treeDefinition: z, currentNode: ne, currentNodeDefinition: de, ranges: T };
        }
        function Sr() {
          return { type: "UPDATE_COMMANDS_STATE" };
        }
        var ct = d(1);
        function Cr({ editors: w, currentEditorName: a }, c) {
          if (!c) return null;
          const h = w.get(a).commands.get(c);
          return { currentCommandName: c, type: "Command", url: "https://ckeditor.com/docs/ckeditor5/latest/api/module_core_command-Command.html", properties: Object(ct.b)({ isEnabled: { value: h.isEnabled }, value: { value: h.value } }), command: h };
        }
        function bn({ editors: w, currentEditorName: a }) {
          if (!w.get(a)) return [];
          const c = [];
          for (const [h, _] of w.get(a).commands) {
            const T = [];
            _.value !== void 0 && T.push(["value", Object(ct.a)(_.value, !1)]), c.push({ name: h, type: "element", children: [], node: h, attributes: T, presentation: { isEmpty: !0, cssClass: ["ck-inspector-tree-node_tagless", _.isEnabled ? "" : "ck-inspector-tree-node_disabled"].join(" ") } });
          }
          return c.sort((h, _) => h.name > _.name ? 1 : -1);
        }
        function Tr(w, a = {}) {
          return { ...a, currentCommandName: null, currentCommandDefinition: null, treeDefinition: bn(w) };
        }
        function ir(w) {
          return { type: "SET_SCHEMA_CURRENT_DEFINITION_NAME", currentSchemaDefinitionName: w };
        }
        const ar = ["isBlock", "isInline", "isObject", "isContent", "isLimit", "isSelectable"], Cn = "https://ckeditor.com/docs/ckeditor5/latest/api/";
        function sr({ editors: w, currentEditorName: a }, c) {
          if (!c) return null;
          const h = w.get(a).model.schema, _ = h.getDefinitions()[c], T = {}, z = {}, ne = {};
          let de = {};
          for (const pe of ar) _[pe] && (T[pe] = { value: _[pe] });
          for (const pe of _.allowChildren.sort()) z[pe] = { value: !0, title: "Click to see the definition of " + pe };
          for (const pe of _.allowIn.sort()) ne[pe] = { value: !0, title: "Click to see the definition of " + pe };
          for (const pe of _.allowAttributes.sort()) de[pe] = { value: !0 };
          de = Object(ct.b)(de);
          for (const pe in de) {
            const _e = h.getAttributeProperties(pe), Ne = {};
            for (const We in _e) Ne[We] = { value: _e[We] };
            de[pe].subProperties = Object(ct.b)(Ne);
          }
          return { currentSchemaDefinitionName: c, type: "SchemaCompiledItemDefinition", urls: { general: Cn + "module_engine_model_schema-SchemaCompiledItemDefinition.html", allowAttributes: Cn + "module_engine_model_schema-SchemaItemDefinition.html#member-allowAttributes", allowChildren: Cn + "module_engine_model_schema-SchemaItemDefinition.html#member-allowChildren", allowIn: Cn + "module_engine_model_schema-SchemaItemDefinition.html#member-allowIn" }, properties: Object(ct.b)(T), allowChildren: Object(ct.b)(z), allowIn: Object(ct.b)(ne), allowAttributes: de, definition: _ };
        }
        function Tn({ editors: w, currentEditorName: a }) {
          if (!w.get(a)) return [];
          const c = [], h = w.get(a).model.schema.getDefinitions();
          for (const _ in h) c.push({ name: _, type: "element", children: [], node: _, attributes: [], presentation: { isEmpty: !0, cssClass: "ck-inspector-tree-node_tagless" } });
          return c.sort((_, T) => _.name > T.name ? 1 : -1);
        }
        function lr(w, a = {}) {
          return { ...a, currentSchemaDefinitionName: null, currentSchemaDefinition: null, treeDefinition: Tn(w) };
        }
        var On = d(8);
        function Gr(w, a) {
          const c = function(h, _) {
            switch (_.type) {
              case "SET_EDITORS":
                return function(T, z) {
                  const ne = { editors: new Map(z.editors) };
                  return z.editors.size ? z.editors.has(T.currentEditorName) || (ne.currentEditorName = Object(On.b)(z.editors)) : ne.currentEditorName = null, { ...T, ...ne };
                }(h, _);
              case "SET_CURRENT_EDITOR_NAME":
                return function(T, z) {
                  return { ...T, currentEditorName: z.editorName };
                }(h, _);
              default:
                return h;
            }
          }(w, a);
          return c.currentEditorGlobals = function(h, _, T) {
            switch (T.type) {
              case "SET_EDITORS":
              case "SET_CURRENT_EDITOR_NAME":
                return { ...Xr(h, {}) };
              case "UPDATE_CURRENT_EDITOR_IS_READ_ONLY":
                return Xr(h, _);
              default:
                return _;
            }
          }(c, c.currentEditorGlobals, a), c.ui = function(h, _) {
            if (!h.activeTab) {
              let T;
              return T = h.isCollapsed !== void 0 ? h.isCollapsed : pt.get("is-collapsed") === "true", { ...h, isCollapsed: T, activeTab: pt.get("active-tab-name") || "Model", height: pt.get("height") || "400px", sidePaneWidth: pt.get("side-pane-width") || "500px" };
            }
            switch (_.type) {
              case "TOGGLE_IS_COLLAPSED":
                return function(T) {
                  const z = !T.isCollapsed;
                  return pt.set("is-collapsed", z), { ...T, isCollapsed: z };
                }(h);
              case "SET_HEIGHT":
                return function(T, z) {
                  return pt.set("height", z.newHeight), { ...T, height: z.newHeight };
                }(h, _);
              case "SET_SIDE_PANE_WIDTH":
                return function(T, z) {
                  return pt.set("side-pane-width", z.newWidth), { ...T, sidePaneWidth: z.newWidth };
                }(h, _);
              case "SET_ACTIVE_INSPECTOR_TAB":
                return function(T, z) {
                  return pt.set("active-tab-name", z.tabName), { ...T, activeTab: z.tabName };
                }(h, _);
              default:
                return h;
            }
          }(c.ui, a), c.model = $n(c, c.model, a), c.view = xr(c, c.view, a), c.commands = function(h, _, T) {
            if (h.ui.activeTab !== "Commands") return _;
            if (!_) return Tr(h, _);
            switch (T.type) {
              case "SET_COMMANDS_CURRENT_COMMAND_NAME":
                return { ..._, currentCommandDefinition: Cr(h, T.currentCommandName), currentCommandName: T.currentCommandName };
              case "SET_ACTIVE_INSPECTOR_TAB":
              case "UPDATE_COMMANDS_STATE":
                return { ..._, currentCommandDefinition: Cr(h, _.currentCommandName), treeDefinition: bn(h) };
              case "SET_EDITORS":
              case "SET_CURRENT_EDITOR_NAME":
                return Tr(h, _);
              default:
                return _;
            }
          }(c, c.commands, a), c.schema = function(h, _, T) {
            if (h.ui.activeTab !== "Schema") return _;
            if (!_) return lr(h, _);
            switch (T.type) {
              case "SET_SCHEMA_CURRENT_DEFINITION_NAME":
                return { ..._, currentSchemaDefinition: sr(h, T.currentSchemaDefinitionName), currentSchemaDefinitionName: T.currentSchemaDefinitionName };
              case "SET_ACTIVE_INSPECTOR_TAB":
                return { ..._, currentSchemaDefinition: sr(h, _.currentSchemaDefinitionName), treeDefinition: Tn(h) };
              case "SET_EDITORS":
              case "SET_CURRENT_EDITOR_NAME":
                return lr(h, _);
              default:
                return _;
            }
          }(c, c.schema, a), { ...w, ...c };
        }
        function Xr(w, a) {
          const c = Tt(w);
          return { ...a, isReadOnly: !!c && c.isReadOnly };
        }
        var V = d(46), ae = d.n(V), we = /* @__PURE__ */ function() {
          var w = function(a, c) {
            return (w = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(h, _) {
              h.__proto__ = _;
            } || function(h, _) {
              for (var T in _) _.hasOwnProperty(T) && (h[T] = _[T]);
            })(a, c);
          };
          return function(a, c) {
            function h() {
              this.constructor = a;
            }
            w(a, c), a.prototype = c === null ? Object.create(c) : (h.prototype = c.prototype, new h());
          };
        }(), Ce = function() {
          return (Ce = Object.assign || function(w) {
            for (var a, c = 1, h = arguments.length; c < h; c++) for (var _ in a = arguments[c]) Object.prototype.hasOwnProperty.call(a, _) && (w[_] = a[_]);
            return w;
          }).apply(this, arguments);
        }, it = { top: { width: "100%", height: "10px", top: "-5px", left: "0px", cursor: "row-resize" }, right: { width: "10px", height: "100%", top: "0px", right: "-5px", cursor: "col-resize" }, bottom: { width: "100%", height: "10px", bottom: "-5px", left: "0px", cursor: "row-resize" }, left: { width: "10px", height: "100%", top: "0px", left: "-5px", cursor: "col-resize" }, topRight: { width: "20px", height: "20px", position: "absolute", right: "-10px", top: "-10px", cursor: "ne-resize" }, bottomRight: { width: "20px", height: "20px", position: "absolute", right: "-10px", bottom: "-10px", cursor: "se-resize" }, bottomLeft: { width: "20px", height: "20px", position: "absolute", left: "-10px", bottom: "-10px", cursor: "sw-resize" }, topLeft: { width: "20px", height: "20px", position: "absolute", left: "-10px", top: "-10px", cursor: "nw-resize" } }, qe = function(w) {
          function a() {
            var c = w !== null && w.apply(this, arguments) || this;
            return c.onMouseDown = function(h) {
              c.props.onResizeStart(h, c.props.direction);
            }, c.onTouchStart = function(h) {
              c.props.onResizeStart(h, c.props.direction);
            }, c;
          }
          return we(a, w), a.prototype.render = function() {
            return u.createElement("div", { className: this.props.className || "", style: Ce(Ce({ position: "absolute", userSelect: "none" }, it[this.props.direction]), this.props.replaceStyles || {}), onMouseDown: this.onMouseDown, onTouchStart: this.onTouchStart }, this.props.children);
          }, a;
        }(u.PureComponent), st = d(14), tt = d.n(st), Ot = /* @__PURE__ */ function() {
          var w = function(a, c) {
            return (w = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(h, _) {
              h.__proto__ = _;
            } || function(h, _) {
              for (var T in _) _.hasOwnProperty(T) && (h[T] = _[T]);
            })(a, c);
          };
          return function(a, c) {
            function h() {
              this.constructor = a;
            }
            w(a, c), a.prototype = c === null ? Object.create(c) : (h.prototype = c.prototype, new h());
          };
        }(), nt = function() {
          return (nt = Object.assign || function(w) {
            for (var a, c = 1, h = arguments.length; c < h; c++) for (var _ in a = arguments[c]) Object.prototype.hasOwnProperty.call(a, _) && (w[_] = a[_]);
            return w;
          }).apply(this, arguments);
        }, bt = { width: "auto", height: "auto" }, Pt = tt()(function(w, a, c) {
          return Math.max(Math.min(w, c), a);
        }), tn = tt()(function(w, a) {
          return Math.round(w / a) * a;
        }), ht = tt()(function(w, a) {
          return new RegExp(w, "i").test(a);
        }), Wt = function(w) {
          return !!(w.touches && w.touches.length);
        }, Pn = tt()(function(w, a, c) {
          c === void 0 && (c = 0);
          var h = a.reduce(function(T, z, ne) {
            return Math.abs(z - w) < Math.abs(a[T] - w) ? ne : T;
          }, 0), _ = Math.abs(a[h] - w);
          return c === 0 || _ < c ? a[h] : w;
        }), ut = tt()(function(w, a) {
          return w.substr(w.length - a.length, a.length) === a;
        }), yn = tt()(function(w) {
          return (w = w.toString()) === "auto" || ut(w, "px") || ut(w, "%") || ut(w, "vh") || ut(w, "vw") || ut(w, "vmax") || ut(w, "vmin") ? w : w + "px";
        }), cn = function(w, a, c, h) {
          if (w && typeof w == "string") {
            if (ut(w, "px")) return Number(w.replace("px", ""));
            if (ut(w, "%")) return a * (Number(w.replace("%", "")) / 100);
            if (ut(w, "vw")) return c * (Number(w.replace("vw", "")) / 100);
            if (ut(w, "vh")) return h * (Number(w.replace("vh", "")) / 100);
          }
          return w;
        }, Nn = tt()(function(w, a, c, h, _, T, z) {
          return h = cn(h, w.width, a, c), _ = cn(_, w.height, a, c), T = cn(T, w.width, a, c), z = cn(z, w.height, a, c), { maxWidth: h === void 0 ? void 0 : Number(h), maxHeight: _ === void 0 ? void 0 : Number(_), minWidth: T === void 0 ? void 0 : Number(T), minHeight: z === void 0 ? void 0 : Number(z) };
        }), Eo = ["as", "style", "className", "grid", "snap", "bounds", "boundsByDirection", "size", "defaultSize", "minWidth", "minHeight", "maxWidth", "maxHeight", "lockAspectRatio", "lockAspectRatioExtraWidth", "lockAspectRatioExtraHeight", "enable", "handleStyles", "handleClasses", "handleWrapperStyle", "handleWrapperClass", "children", "onResizeStart", "onResize", "onResizeStop", "handleComponent", "scale", "resizeRatio", "snapGap"], _o = function(w) {
          function a(c) {
            var h = w.call(this, c) || this;
            return h.ratio = 1, h.resizable = null, h.parentLeft = 0, h.parentTop = 0, h.resizableLeft = 0, h.resizableRight = 0, h.resizableTop = 0, h.resizableBottom = 0, h.targetLeft = 0, h.targetTop = 0, h.appendBase = function() {
              if (!h.resizable || !h.window) return null;
              var _ = h.parentNode;
              if (!_) return null;
              var T = h.window.document.createElement("div");
              return T.style.width = "100%", T.style.height = "100%", T.style.position = "absolute", T.style.transform = "scale(0, 0)", T.style.left = "0", T.style.flex = "0", T.classList ? T.classList.add("__resizable_base__") : T.className += "__resizable_base__", _.appendChild(T), T;
            }, h.removeBase = function(_) {
              var T = h.parentNode;
              T && T.removeChild(_);
            }, h.ref = function(_) {
              _ && (h.resizable = _);
            }, h.state = { isResizing: !1, width: (h.propsSize && h.propsSize.width) === void 0 ? "auto" : h.propsSize && h.propsSize.width, height: (h.propsSize && h.propsSize.height) === void 0 ? "auto" : h.propsSize && h.propsSize.height, direction: "right", original: { x: 0, y: 0, width: 0, height: 0 }, backgroundStyle: { height: "100%", width: "100%", backgroundColor: "rgba(0,0,0,0)", cursor: "auto", opacity: 0, position: "fixed", zIndex: 9999, top: "0", left: "0", bottom: "0", right: "0" }, flexBasis: void 0 }, h.onResizeStart = h.onResizeStart.bind(h), h.onMouseMove = h.onMouseMove.bind(h), h.onMouseUp = h.onMouseUp.bind(h), h;
          }
          return Ot(a, w), Object.defineProperty(a.prototype, "parentNode", { get: function() {
            return this.resizable ? this.resizable.parentNode : null;
          }, enumerable: !1, configurable: !0 }), Object.defineProperty(a.prototype, "window", { get: function() {
            return this.resizable && this.resizable.ownerDocument ? this.resizable.ownerDocument.defaultView : null;
          }, enumerable: !1, configurable: !0 }), Object.defineProperty(a.prototype, "propsSize", { get: function() {
            return this.props.size || this.props.defaultSize || bt;
          }, enumerable: !1, configurable: !0 }), Object.defineProperty(a.prototype, "size", { get: function() {
            var c = 0, h = 0;
            if (this.resizable && this.window) {
              var _ = this.resizable.offsetWidth, T = this.resizable.offsetHeight, z = this.resizable.style.position;
              z !== "relative" && (this.resizable.style.position = "relative"), c = this.resizable.style.width !== "auto" ? this.resizable.offsetWidth : _, h = this.resizable.style.height !== "auto" ? this.resizable.offsetHeight : T, this.resizable.style.position = z;
            }
            return { width: c, height: h };
          }, enumerable: !1, configurable: !0 }), Object.defineProperty(a.prototype, "sizeStyle", { get: function() {
            var c = this, h = this.props.size, _ = function(T) {
              if (c.state[T] === void 0 || c.state[T] === "auto") return "auto";
              if (c.propsSize && c.propsSize[T] && ut(c.propsSize[T].toString(), "%")) {
                if (ut(c.state[T].toString(), "%")) return c.state[T].toString();
                var z = c.getParentSize();
                return Number(c.state[T].toString().replace("px", "")) / z[T] * 100 + "%";
              }
              return yn(c.state[T]);
            };
            return { width: h && h.width !== void 0 && !this.state.isResizing ? yn(h.width) : _("width"), height: h && h.height !== void 0 && !this.state.isResizing ? yn(h.height) : _("height") };
          }, enumerable: !1, configurable: !0 }), a.prototype.getParentSize = function() {
            if (!this.parentNode) return this.window ? { width: this.window.innerWidth, height: this.window.innerHeight } : { width: 0, height: 0 };
            var c = this.appendBase();
            if (!c) return { width: 0, height: 0 };
            var h = !1, _ = this.parentNode.style.flexWrap;
            _ !== "wrap" && (h = !0, this.parentNode.style.flexWrap = "wrap"), c.style.position = "relative", c.style.minWidth = "100%";
            var T = { width: c.offsetWidth, height: c.offsetHeight };
            return h && (this.parentNode.style.flexWrap = _), this.removeBase(c), T;
          }, a.prototype.bindEvents = function() {
            this.window && (this.window.addEventListener("mouseup", this.onMouseUp), this.window.addEventListener("mousemove", this.onMouseMove), this.window.addEventListener("mouseleave", this.onMouseUp), this.window.addEventListener("touchmove", this.onMouseMove, { capture: !0, passive: !1 }), this.window.addEventListener("touchend", this.onMouseUp));
          }, a.prototype.unbindEvents = function() {
            this.window && (this.window.removeEventListener("mouseup", this.onMouseUp), this.window.removeEventListener("mousemove", this.onMouseMove), this.window.removeEventListener("mouseleave", this.onMouseUp), this.window.removeEventListener("touchmove", this.onMouseMove, !0), this.window.removeEventListener("touchend", this.onMouseUp));
          }, a.prototype.componentDidMount = function() {
            if (this.resizable && this.window) {
              var c = this.window.getComputedStyle(this.resizable);
              this.setState({ width: this.state.width || this.size.width, height: this.state.height || this.size.height, flexBasis: c.flexBasis !== "auto" ? c.flexBasis : void 0 });
            }
          }, a.prototype.componentWillUnmount = function() {
            this.window && this.unbindEvents();
          }, a.prototype.createSizeForCssProperty = function(c, h) {
            var _ = this.propsSize && this.propsSize[h];
            return this.state[h] !== "auto" || this.state.original[h] !== c || _ !== void 0 && _ !== "auto" ? c : "auto";
          }, a.prototype.calculateNewMaxFromBoundary = function(c, h) {
            var _, T, z = this.props.boundsByDirection, ne = this.state.direction, de = z && ht("left", ne), pe = z && ht("top", ne);
            if (this.props.bounds === "parent") {
              var _e = this.parentNode;
              _e && (_ = de ? this.resizableRight - this.parentLeft : _e.offsetWidth + (this.parentLeft - this.resizableLeft), T = pe ? this.resizableBottom - this.parentTop : _e.offsetHeight + (this.parentTop - this.resizableTop));
            } else this.props.bounds === "window" ? this.window && (_ = de ? this.resizableRight : this.window.innerWidth - this.resizableLeft, T = pe ? this.resizableBottom : this.window.innerHeight - this.resizableTop) : this.props.bounds && (_ = de ? this.resizableRight - this.targetLeft : this.props.bounds.offsetWidth + (this.targetLeft - this.resizableLeft), T = pe ? this.resizableBottom - this.targetTop : this.props.bounds.offsetHeight + (this.targetTop - this.resizableTop));
            return _ && Number.isFinite(_) && (c = c && c < _ ? c : _), T && Number.isFinite(T) && (h = h && h < T ? h : T), { maxWidth: c, maxHeight: h };
          }, a.prototype.calculateNewSizeFromDirection = function(c, h) {
            var _ = this.props.scale || 1, T = this.props.resizeRatio || 1, z = this.state, ne = z.direction, de = z.original, pe = this.props, _e = pe.lockAspectRatio, Ne = pe.lockAspectRatioExtraHeight, We = pe.lockAspectRatioExtraWidth, Ae = de.width, Ke = de.height, Ie = Ne || 0, Fe = We || 0;
            return ht("right", ne) && (Ae = de.width + (c - de.x) * T / _, _e && (Ke = (Ae - Fe) / this.ratio + Ie)), ht("left", ne) && (Ae = de.width - (c - de.x) * T / _, _e && (Ke = (Ae - Fe) / this.ratio + Ie)), ht("bottom", ne) && (Ke = de.height + (h - de.y) * T / _, _e && (Ae = (Ke - Ie) * this.ratio + Fe)), ht("top", ne) && (Ke = de.height - (h - de.y) * T / _, _e && (Ae = (Ke - Ie) * this.ratio + Fe)), { newWidth: Ae, newHeight: Ke };
          }, a.prototype.calculateNewSizeFromAspectRatio = function(c, h, _, T) {
            var z = this.props, ne = z.lockAspectRatio, de = z.lockAspectRatioExtraHeight, pe = z.lockAspectRatioExtraWidth, _e = T.width === void 0 ? 10 : T.width, Ne = _.width === void 0 || _.width < 0 ? c : _.width, We = T.height === void 0 ? 10 : T.height, Ae = _.height === void 0 || _.height < 0 ? h : _.height, Ke = de || 0, Ie = pe || 0;
            if (ne) {
              var Fe = (We - Ke) * this.ratio + Ie, et = (Ae - Ke) * this.ratio + Ie, Ye = (_e - Ie) / this.ratio + Ke, Le = (Ne - Ie) / this.ratio + Ke, ft = Math.max(_e, Fe), Dt = Math.min(Ne, et), It = Math.max(We, Ye), jt = Math.min(Ae, Le);
              c = Pt(c, ft, Dt), h = Pt(h, It, jt);
            } else c = Pt(c, _e, Ne), h = Pt(h, We, Ae);
            return { newWidth: c, newHeight: h };
          }, a.prototype.setBoundingClientRect = function() {
            if (this.props.bounds === "parent") {
              var c = this.parentNode;
              if (c) {
                var h = c.getBoundingClientRect();
                this.parentLeft = h.left, this.parentTop = h.top;
              }
            }
            if (this.props.bounds && typeof this.props.bounds != "string") {
              var _ = this.props.bounds.getBoundingClientRect();
              this.targetLeft = _.left, this.targetTop = _.top;
            }
            if (this.resizable) {
              var T = this.resizable.getBoundingClientRect(), z = T.left, ne = T.top, de = T.right, pe = T.bottom;
              this.resizableLeft = z, this.resizableRight = de, this.resizableTop = ne, this.resizableBottom = pe;
            }
          }, a.prototype.onResizeStart = function(c, h) {
            if (this.resizable && this.window) {
              var _, T = 0, z = 0;
              if (c.nativeEvent && function(Ne) {
                return !!((Ne.clientX || Ne.clientX === 0) && (Ne.clientY || Ne.clientY === 0));
              }(c.nativeEvent)) {
                if (T = c.nativeEvent.clientX, z = c.nativeEvent.clientY, c.nativeEvent.which === 3) return;
              } else c.nativeEvent && Wt(c.nativeEvent) && (T = c.nativeEvent.touches[0].clientX, z = c.nativeEvent.touches[0].clientY);
              if (this.props.onResizeStart && this.resizable && this.props.onResizeStart(c, h, this.resizable) === !1) return;
              this.props.size && (this.props.size.height !== void 0 && this.props.size.height !== this.state.height && this.setState({ height: this.props.size.height }), this.props.size.width !== void 0 && this.props.size.width !== this.state.width && this.setState({ width: this.props.size.width })), this.ratio = typeof this.props.lockAspectRatio == "number" ? this.props.lockAspectRatio : this.size.width / this.size.height;
              var ne = this.window.getComputedStyle(this.resizable);
              if (ne.flexBasis !== "auto") {
                var de = this.parentNode;
                if (de) {
                  var pe = this.window.getComputedStyle(de).flexDirection;
                  this.flexDir = pe.startsWith("row") ? "row" : "column", _ = ne.flexBasis;
                }
              }
              this.setBoundingClientRect(), this.bindEvents();
              var _e = { original: { x: T, y: z, width: this.size.width, height: this.size.height }, isResizing: !0, backgroundStyle: nt(nt({}, this.state.backgroundStyle), { cursor: this.window.getComputedStyle(c.target).cursor || "auto" }), direction: h, flexBasis: _ };
              this.setState(_e);
            }
          }, a.prototype.onMouseMove = function(c) {
            if (this.state.isResizing && this.resizable && this.window) {
              if (this.window.TouchEvent && Wt(c)) try {
                c.preventDefault(), c.stopPropagation();
              } catch {
              }
              var h = this.props, _ = h.maxWidth, T = h.maxHeight, z = h.minWidth, ne = h.minHeight, de = Wt(c) ? c.touches[0].clientX : c.clientX, pe = Wt(c) ? c.touches[0].clientY : c.clientY, _e = this.state, Ne = _e.direction, We = _e.original, Ae = _e.width, Ke = _e.height, Ie = this.getParentSize(), Fe = Nn(Ie, this.window.innerWidth, this.window.innerHeight, _, T, z, ne);
              _ = Fe.maxWidth, T = Fe.maxHeight, z = Fe.minWidth, ne = Fe.minHeight;
              var et = this.calculateNewSizeFromDirection(de, pe), Ye = et.newHeight, Le = et.newWidth, ft = this.calculateNewMaxFromBoundary(_, T), Dt = this.calculateNewSizeFromAspectRatio(Le, Ye, { width: ft.maxWidth, height: ft.maxHeight }, { width: z, height: ne });
              if (Le = Dt.newWidth, Ye = Dt.newHeight, this.props.grid) {
                var It = tn(Le, this.props.grid[0]), jt = tn(Ye, this.props.grid[1]), _t = this.props.snapGap || 0;
                Le = _t === 0 || Math.abs(It - Le) <= _t ? It : Le, Ye = _t === 0 || Math.abs(jt - Ye) <= _t ? jt : Ye;
              }
              this.props.snap && this.props.snap.x && (Le = Pn(Le, this.props.snap.x, this.props.snapGap)), this.props.snap && this.props.snap.y && (Ye = Pn(Ye, this.props.snap.y, this.props.snapGap));
              var zt = { width: Le - We.width, height: Ye - We.height };
              Ae && typeof Ae == "string" && (ut(Ae, "%") ? Le = Le / Ie.width * 100 + "%" : ut(Ae, "vw") ? Le = Le / this.window.innerWidth * 100 + "vw" : ut(Ae, "vh") && (Le = Le / this.window.innerHeight * 100 + "vh")), Ke && typeof Ke == "string" && (ut(Ke, "%") ? Ye = Ye / Ie.height * 100 + "%" : ut(Ke, "vw") ? Ye = Ye / this.window.innerWidth * 100 + "vw" : ut(Ke, "vh") && (Ye = Ye / this.window.innerHeight * 100 + "vh"));
              var dt = { width: this.createSizeForCssProperty(Le, "width"), height: this.createSizeForCssProperty(Ye, "height") };
              this.flexDir === "row" ? dt.flexBasis = dt.width : this.flexDir === "column" && (dt.flexBasis = dt.height), this.setState(dt), this.props.onResize && this.props.onResize(c, Ne, this.resizable, zt);
            }
          }, a.prototype.onMouseUp = function(c) {
            var h = this.state, _ = h.isResizing, T = h.direction, z = h.original;
            if (_ && this.resizable) {
              var ne = { width: this.size.width - z.width, height: this.size.height - z.height };
              this.props.onResizeStop && this.props.onResizeStop(c, T, this.resizable, ne), this.props.size && this.setState(this.props.size), this.unbindEvents(), this.setState({ isResizing: !1, backgroundStyle: nt(nt({}, this.state.backgroundStyle), { cursor: "auto" }) });
            }
          }, a.prototype.updateSize = function(c) {
            this.setState({ width: c.width, height: c.height });
          }, a.prototype.renderResizer = function() {
            var c = this, h = this.props, _ = h.enable, T = h.handleStyles, z = h.handleClasses, ne = h.handleWrapperStyle, de = h.handleWrapperClass, pe = h.handleComponent;
            if (!_) return null;
            var _e = Object.keys(_).map(function(Ne) {
              return _[Ne] !== !1 ? u.createElement(qe, { key: Ne, direction: Ne, onResizeStart: c.onResizeStart, replaceStyles: T && T[Ne], className: z && z[Ne] }, pe && pe[Ne] ? pe[Ne] : null) : null;
            });
            return u.createElement("div", { className: de, style: ne }, _e);
          }, a.prototype.render = function() {
            var c = this, h = Object.keys(this.props).reduce(function(z, ne) {
              return Eo.indexOf(ne) !== -1 || (z[ne] = c.props[ne]), z;
            }, {}), _ = nt(nt(nt({ position: "relative", userSelect: this.state.isResizing ? "none" : "auto" }, this.props.style), this.sizeStyle), { maxWidth: this.props.maxWidth, maxHeight: this.props.maxHeight, minWidth: this.props.minWidth, minHeight: this.props.minHeight, boxSizing: "border-box", flexShrink: 0 });
            this.state.flexBasis && (_.flexBasis = this.state.flexBasis);
            var T = this.props.as || "div";
            return u.createElement(T, nt({ ref: this.ref, style: _, className: this.props.className }, h), this.state.isResizing && u.createElement("div", { style: this.state.backgroundStyle }), this.props.children, this.renderResizer());
          }, a.defaultProps = { as: "div", onResizeStart: function() {
          }, onResize: function() {
          }, onResizeStop: function() {
          }, enable: { top: !0, right: !0, bottom: !0, left: !0, topRight: !0, bottomRight: !0, bottomLeft: !0, topLeft: !0 }, style: {}, grid: [1, 1], lockAspectRatio: !1, lockAspectRatioExtraWidth: 0, lockAspectRatioExtraHeight: 0, scale: 1, resizeRatio: 1, snapGap: 0 }, a;
        }(u.PureComponent), rt = function(w, a) {
          return (rt = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(c, h) {
            c.__proto__ = h;
          } || function(c, h) {
            for (var _ in h) h.hasOwnProperty(_) && (c[_] = h[_]);
          })(w, a);
        }, Ue = function() {
          return (Ue = Object.assign || function(w) {
            for (var a, c = 1, h = arguments.length; c < h; c++) for (var _ in a = arguments[c]) Object.prototype.hasOwnProperty.call(a, _) && (w[_] = a[_]);
            return w;
          }).apply(this, arguments);
        }, Yn = ae.a, Kt = { width: "auto", height: "auto", display: "inline-block", position: "absolute", top: 0, left: 0 }, Or = function(w) {
          function a(c) {
            var h = w.call(this, c) || this;
            return h.resizing = !1, h.resizingPosition = { x: 0, y: 0 }, h.offsetFromParent = { left: 0, top: 0 }, h.resizableElement = { current: null }, h.refDraggable = function(_) {
              _ && (h.draggable = _);
            }, h.refResizable = function(_) {
              _ && (h.resizable = _, h.resizableElement.current = _.resizable);
            }, h.state = { original: { x: 0, y: 0 }, bounds: { top: 0, right: 0, bottom: 0, left: 0 }, maxWidth: c.maxWidth, maxHeight: c.maxHeight }, h.onResizeStart = h.onResizeStart.bind(h), h.onResize = h.onResize.bind(h), h.onResizeStop = h.onResizeStop.bind(h), h.onDragStart = h.onDragStart.bind(h), h.onDrag = h.onDrag.bind(h), h.onDragStop = h.onDragStop.bind(h), h.getMaxSizesFromProps = h.getMaxSizesFromProps.bind(h), h;
          }
          return function(c, h) {
            function _() {
              this.constructor = c;
            }
            rt(c, h), c.prototype = h === null ? Object.create(h) : (_.prototype = h.prototype, new _());
          }(a, w), a.prototype.componentDidMount = function() {
            this.updateOffsetFromParent();
            var c = this.offsetFromParent, h = c.left, _ = c.top, T = this.getDraggablePosition(), z = T.x, ne = T.y;
            this.draggable.setState({ x: z - h, y: ne - _ }), this.forceUpdate();
          }, a.prototype.getDraggablePosition = function() {
            var c = this.draggable.state;
            return { x: c.x, y: c.y };
          }, a.prototype.getParent = function() {
            return this.resizable && this.resizable.parentNode;
          }, a.prototype.getParentSize = function() {
            return this.resizable.getParentSize();
          }, a.prototype.getMaxSizesFromProps = function() {
            return { maxWidth: this.props.maxWidth === void 0 ? Number.MAX_SAFE_INTEGER : this.props.maxWidth, maxHeight: this.props.maxHeight === void 0 ? Number.MAX_SAFE_INTEGER : this.props.maxHeight };
          }, a.prototype.getSelfElement = function() {
            return this.resizable && this.resizable.resizable;
          }, a.prototype.getOffsetHeight = function(c) {
            var h = this.props.scale;
            switch (this.props.bounds) {
              case "window":
                return window.innerHeight / h;
              case "body":
                return document.body.offsetHeight / h;
              default:
                return c.offsetHeight;
            }
          }, a.prototype.getOffsetWidth = function(c) {
            var h = this.props.scale;
            switch (this.props.bounds) {
              case "window":
                return window.innerWidth / h;
              case "body":
                return document.body.offsetWidth / h;
              default:
                return c.offsetWidth;
            }
          }, a.prototype.onDragStart = function(c, h) {
            if (this.props.onDragStart && this.props.onDragStart(c, h), this.props.bounds) {
              var _, T = this.getParent(), z = this.props.scale;
              if (this.props.bounds === "parent") _ = T;
              else {
                if (this.props.bounds === "body") {
                  var ne = T.getBoundingClientRect(), de = ne.left, pe = ne.top, _e = document.body.getBoundingClientRect(), Ne = -(de - T.offsetLeft * z - _e.left) / z, We = -(pe - T.offsetTop * z - _e.top) / z, Ae = (document.body.offsetWidth - this.resizable.size.width * z) / z + Ne, Ke = (document.body.offsetHeight - this.resizable.size.height * z) / z + We;
                  return this.setState({ bounds: { top: We, right: Ae, bottom: Ke, left: Ne } });
                }
                if (this.props.bounds === "window") {
                  if (!this.resizable) return;
                  var Ie = T.getBoundingClientRect(), Fe = Ie.left, et = Ie.top, Ye = -(Fe - T.offsetLeft * z) / z, Le = -(et - T.offsetTop * z) / z;
                  return Ae = (window.innerWidth - this.resizable.size.width * z) / z + Ye, Ke = (window.innerHeight - this.resizable.size.height * z) / z + Le, this.setState({ bounds: { top: Le, right: Ae, bottom: Ke, left: Ye } });
                }
                _ = document.querySelector(this.props.bounds);
              }
              if (_ instanceof HTMLElement && T instanceof HTMLElement) {
                var ft = _.getBoundingClientRect(), Dt = ft.left, It = ft.top, jt = T.getBoundingClientRect(), _t = (Dt - jt.left) / z, zt = It - jt.top;
                if (this.resizable) {
                  this.updateOffsetFromParent();
                  var dt = this.offsetFromParent;
                  this.setState({ bounds: { top: zt - dt.top, right: _t + (_.offsetWidth - this.resizable.size.width) - dt.left / z, bottom: zt + (_.offsetHeight - this.resizable.size.height) - dt.top, left: _t - dt.left / z } });
                }
              }
            }
          }, a.prototype.onDrag = function(c, h) {
            if (this.props.onDrag) {
              var _ = this.offsetFromParent;
              return this.props.onDrag(c, Ue(Ue({}, h), { x: h.x - _.left, y: h.y - _.top }));
            }
          }, a.prototype.onDragStop = function(c, h) {
            if (this.props.onDragStop) {
              var _ = this.offsetFromParent, T = _.left, z = _.top;
              return this.props.onDragStop(c, Ue(Ue({}, h), { x: h.x + T, y: h.y + z }));
            }
          }, a.prototype.onResizeStart = function(c, h, _) {
            c.stopPropagation(), this.resizing = !0;
            var T = this.props.scale, z = this.offsetFromParent, ne = this.getDraggablePosition();
            if (this.resizingPosition = { x: ne.x + z.left, y: ne.y + z.top }, this.setState({ original: ne }), this.props.bounds) {
              var de = this.getParent(), pe = void 0;
              pe = this.props.bounds === "parent" ? de : this.props.bounds === "body" ? document.body : this.props.bounds === "window" ? window : document.querySelector(this.props.bounds);
              var _e = this.getSelfElement();
              if (_e instanceof Element && (pe instanceof HTMLElement || pe === window) && de instanceof HTMLElement) {
                var Ne = this.getMaxSizesFromProps(), We = Ne.maxWidth, Ae = Ne.maxHeight, Ke = this.getParentSize();
                if (We && typeof We == "string") if (We.endsWith("%")) {
                  var Ie = Number(We.replace("%", "")) / 100;
                  We = Ke.width * Ie;
                } else We.endsWith("px") && (We = Number(We.replace("px", "")));
                Ae && typeof Ae == "string" && (Ae.endsWith("%") ? (Ie = Number(Ae.replace("%", "")) / 100, Ae = Ke.width * Ie) : Ae.endsWith("px") && (Ae = Number(Ae.replace("px", ""))));
                var Fe = _e.getBoundingClientRect(), et = Fe.left, Ye = Fe.top, Le = this.props.bounds === "window" ? { left: 0, top: 0 } : pe.getBoundingClientRect(), ft = Le.left, Dt = Le.top, It = this.getOffsetWidth(pe), jt = this.getOffsetHeight(pe), _t = h.toLowerCase().endsWith("left"), zt = h.toLowerCase().endsWith("right"), dt = h.startsWith("top"), An = h.startsWith("bottom");
                if (_t && this.resizable) {
                  var lt = (et - ft) / T + this.resizable.size.width;
                  this.setState({ maxWidth: lt > Number(We) ? We : lt });
                }
                (zt || this.props.lockAspectRatio && !_t) && (lt = It + (ft - et) / T, this.setState({ maxWidth: lt > Number(We) ? We : lt })), dt && this.resizable && (lt = (Ye - Dt) / T + this.resizable.size.height, this.setState({ maxHeight: lt > Number(Ae) ? Ae : lt })), (An || this.props.lockAspectRatio && !dt) && (lt = jt + (Dt - Ye) / T, this.setState({ maxHeight: lt > Number(Ae) ? Ae : lt }));
              }
            } else this.setState({ maxWidth: this.props.maxWidth, maxHeight: this.props.maxHeight });
            this.props.onResizeStart && this.props.onResizeStart(c, h, _);
          }, a.prototype.onResize = function(c, h, _, T) {
            var z = { x: this.state.original.x, y: this.state.original.y }, ne = -T.width, de = -T.height;
            ["top", "left", "topLeft", "bottomLeft", "topRight"].indexOf(h) !== -1 && (h === "bottomLeft" ? z.x += ne : (h === "topRight" || (z.x += ne), z.y += de)), z.x === this.draggable.state.x && z.y === this.draggable.state.y || this.draggable.setState(z), this.updateOffsetFromParent();
            var pe = this.offsetFromParent, _e = this.getDraggablePosition().x + pe.left, Ne = this.getDraggablePosition().y + pe.top;
            this.resizingPosition = { x: _e, y: Ne }, this.props.onResize && this.props.onResize(c, h, _, T, { x: _e, y: Ne });
          }, a.prototype.onResizeStop = function(c, h, _, T) {
            this.resizing = !1;
            var z = this.getMaxSizesFromProps(), ne = z.maxWidth, de = z.maxHeight;
            this.setState({ maxWidth: ne, maxHeight: de }), this.props.onResizeStop && this.props.onResizeStop(c, h, _, T, this.resizingPosition);
          }, a.prototype.updateSize = function(c) {
            this.resizable && this.resizable.updateSize({ width: c.width, height: c.height });
          }, a.prototype.updatePosition = function(c) {
            this.draggable.setState(c);
          }, a.prototype.updateOffsetFromParent = function() {
            var c = this.props.scale, h = this.getParent(), _ = this.getSelfElement();
            if (!h || _ === null) return { top: 0, left: 0 };
            var T = h.getBoundingClientRect(), z = T.left, ne = T.top, de = _.getBoundingClientRect(), pe = this.getDraggablePosition();
            this.offsetFromParent = { left: de.left - z - pe.x * c, top: de.top - ne - pe.y * c };
          }, a.prototype.render = function() {
            var c = this.props, h = c.disableDragging, _ = c.style, T = c.dragHandleClassName, z = c.position, ne = c.onMouseDown, de = c.onMouseUp, pe = c.dragAxis, _e = c.dragGrid, Ne = c.bounds, We = c.enableUserSelectHack, Ae = c.cancel, Ke = c.children, Ie = (c.onResizeStart, c.onResize, c.onResizeStop, c.onDragStart, c.onDrag, c.onDragStop, c.resizeHandleStyles), Fe = c.resizeHandleClasses, et = c.resizeHandleComponent, Ye = c.enableResizing, Le = c.resizeGrid, ft = c.resizeHandleWrapperClass, Dt = c.resizeHandleWrapperStyle, It = c.scale, jt = c.allowAnyClick, _t = function($t, fn) {
              var Gn = {};
              for (var Gt in $t) Object.prototype.hasOwnProperty.call($t, Gt) && fn.indexOf(Gt) < 0 && (Gn[Gt] = $t[Gt]);
              if ($t != null && typeof Object.getOwnPropertySymbols == "function") {
                var dn = 0;
                for (Gt = Object.getOwnPropertySymbols($t); dn < Gt.length; dn++) fn.indexOf(Gt[dn]) < 0 && Object.prototype.propertyIsEnumerable.call($t, Gt[dn]) && (Gn[Gt[dn]] = $t[Gt[dn]]);
              }
              return Gn;
            }(c, ["disableDragging", "style", "dragHandleClassName", "position", "onMouseDown", "onMouseUp", "dragAxis", "dragGrid", "bounds", "enableUserSelectHack", "cancel", "children", "onResizeStart", "onResize", "onResizeStop", "onDragStart", "onDrag", "onDragStop", "resizeHandleStyles", "resizeHandleClasses", "resizeHandleComponent", "enableResizing", "resizeGrid", "resizeHandleWrapperClass", "resizeHandleWrapperStyle", "scale", "allowAnyClick"]), zt = this.props.default ? Ue({}, this.props.default) : void 0;
            delete _t.default;
            var dt, An = h || T ? { cursor: "auto" } : { cursor: "move" }, lt = Ue(Ue(Ue({}, Kt), An), _), Mn = this.offsetFromParent, Hn = Mn.left, zr = Mn.top;
            z && (dt = { x: z.x - Hn, y: z.y - zr });
            var xt, io = this.resizing ? void 0 : dt, In = this.resizing ? "both" : pe;
            return Object(u.createElement)(Yn, { ref: this.refDraggable, handle: T ? "." + T : void 0, defaultPosition: zt, onMouseDown: ne, onMouseUp: de, onStart: this.onDragStart, onDrag: this.onDrag, onStop: this.onDragStop, axis: In, disabled: h, grid: _e, bounds: Ne ? this.state.bounds : void 0, position: io, enableUserSelectHack: We, cancel: Ae, scale: It, allowAnyClick: jt, nodeRef: this.resizableElement }, Object(u.createElement)(_o, Ue({}, _t, { ref: this.refResizable, defaultSize: zt, size: this.props.size, enable: typeof Ye == "boolean" ? (xt = Ye, { bottom: xt, bottomLeft: xt, bottomRight: xt, left: xt, right: xt, top: xt, topLeft: xt, topRight: xt }) : Ye, onResizeStart: this.onResizeStart, onResize: this.onResize, onResizeStop: this.onResizeStop, style: lt, minWidth: this.props.minWidth, minHeight: this.props.minHeight, maxWidth: this.resizing ? this.state.maxWidth : this.props.maxWidth, maxHeight: this.resizing ? this.state.maxHeight : this.props.maxHeight, grid: Le, handleWrapperClass: ft, handleWrapperStyle: Dt, lockAspectRatio: this.props.lockAspectRatio, lockAspectRatioExtraWidth: this.props.lockAspectRatioExtraWidth, lockAspectRatioExtraHeight: this.props.lockAspectRatioExtraHeight, handleStyles: Ie, handleClasses: Fe, handleComponent: et, scale: this.props.scale }), Ke));
          }, a.defaultProps = { maxWidth: Number.MAX_SAFE_INTEGER, maxHeight: Number.MAX_SAFE_INTEGER, scale: 1, onResizeStart: function() {
          }, onResize: function() {
          }, onResizeStop: function() {
          }, onDragStart: function() {
          }, onDrag: function() {
          }, onDragStop: function() {
          } }, a;
        }(u.PureComponent);
        d(58);
        class Mt extends u.Component {
          constructor(a) {
            super(a), this.handleTabClick = this.handleTabClick.bind(this);
          }
          handleTabClick(a) {
            this.setState({ activeTab: a }, () => {
              this.props.onClick(a);
            });
          }
          render() {
            return o.a.createElement("div", { className: "ck-inspector-horizontal-nav" }, this.props.definitions.map((a) => o.a.createElement(nn, { key: a, label: a, isActive: this.props.activeTab === a, onClick: () => this.handleTabClick(a) })));
          }
        }
        class nn extends u.Component {
          render() {
            return o.a.createElement("button", { className: ["ck-inspector-horizontal-nav__item", this.props.isActive ? " ck-inspector-horizontal-nav__item_active" : ""].join(" "), key: this.props.label, onClick: this.props.onClick, type: "button" }, this.props.label);
          }
        }
        d(60);
        class Ht extends u.Component {
          render() {
            const a = Array.isArray(this.props.children) ? this.props.children : [this.props.children];
            return o.a.createElement("div", { className: "ck-inspector-navbox" }, a.length > 1 ? o.a.createElement("div", { className: "ck-inspector-navbox__navigation" }, a[0]) : "", o.a.createElement("div", { className: "ck-inspector-navbox__content" }, a[a.length - 1]));
          }
        }
        class Qt extends u.Component {
          constructor(a) {
            super(a), this.handleTabClick = this.handleTabClick.bind(this);
          }
          handleTabClick(a) {
            this.props.onTabChange(a);
          }
          render() {
            const a = Array.isArray(this.props.children) ? this.props.children : [this.props.children];
            return o.a.createElement(Ht, null, [this.props.contentBefore, o.a.createElement(Mt, { key: "navigation", definitions: a.map((c) => c.props.label), activeTab: this.props.activeTab, onClick: this.handleTabClick }), this.props.contentAfter], a.filter((c) => c.props.label === this.props.activeTab));
          }
        }
        var ur = d(5), Dn = d.n(ur);
        class rn extends u.Component {
          render() {
            return [o.a.createElement("label", { htmlFor: this.props.id, key: "label" }, this.props.label, ":"), o.a.createElement("select", { id: this.props.id, value: this.props.value, onChange: this.props.onChange, key: "select" }, this.props.options.map((a) => o.a.createElement("option", { value: a, key: a }, a)))];
          }
          shouldComponentUpdate(a) {
            return !Dn()(this.props, a);
          }
        }
        d(62);
        class yt extends u.PureComponent {
          render() {
            const a = ["ck-inspector-button", this.props.className || "", this.props.isOn ? "ck-inspector-button_on" : "", this.props.isEnabled === !1 ? "ck-inspector-button_disabled" : ""].filter((c) => c).join(" ");
            return o.a.createElement("button", { className: a, type: "button", onClick: this.props.isEnabled === !1 ? () => {
            } : this.props.onClick, title: this.props.title || this.props.text }, o.a.createElement("span", null, this.props.text), this.props.icon);
          }
        }
        d(64);
        class Et extends u.Component {
          render() {
            return o.a.createElement("div", { className: ["ck-inspector-pane", this.props.splitVertically ? "ck-inspector-pane_vsplit" : "", this.props.isEmpty ? "ck-inspector-pane_empty" : ""].join(" ") }, this.props.children);
          }
        }
        d(66);
        const cr = { position: "relative" };
        class fr extends u.Component {
          get maxSidePaneWidth() {
            return Math.min(window.innerWidth - 400, 0.8 * window.innerWidth);
          }
          render() {
            return o.a.createElement("div", { className: "ck-inspector-side-pane" }, o.a.createElement(Or, { enableResizing: { left: !0 }, disableDragging: !0, minWidth: 200, maxWidth: this.maxSidePaneWidth, style: cr, position: { x: "100%", y: "100%" }, size: { width: this.props.sidePaneWidth, height: "100%" }, onResizeStop: (a, c, h) => this.props.setSidePaneWidth(h.style.width) }, this.props.children));
          }
        }
        var vn = Re(({ ui: { sidePaneWidth: w } }) => ({ sidePaneWidth: w }), { setSidePaneWidth: function(w) {
          return { type: "SET_SIDE_PANE_WIDTH", newWidth: w };
        } })(fr), Ut = d(11);
        d(68);
        class Vt extends u.PureComponent {
          render() {
            return [o.a.createElement("input", { type: "checkbox", className: "ck-inspector-checkbox", id: this.props.id, key: "input", checked: this.props.isChecked, onChange: this.props.onChange }), o.a.createElement("label", { htmlFor: this.props.id, key: "label" }, this.props.label)];
          }
        }
        class on extends u.Component {
          constructor(a) {
            super(a), this.handleTreeClick = this.handleTreeClick.bind(this), this.handleRootChange = this.handleRootChange.bind(this);
          }
          handleTreeClick(a, c) {
            a.persist(), a.stopPropagation(), this.props.setModelCurrentNode(c), a.detail === 2 && this.props.setModelActiveTab("Inspect");
          }
          handleRootChange(a) {
            this.props.setModelCurrentRootName(a.target.value);
          }
          render() {
            const a = this.props.editors.get(this.props.currentEditorName);
            return o.a.createElement(Ht, null, [o.a.createElement("div", { className: "ck-inspector-tree__config", key: "root-cfg" }, o.a.createElement(rn, { id: "view-root-select", label: "Root", value: this.props.currentRootName, options: Object(gt.d)(a).map((c) => c.rootName), onChange: this.handleRootChange })), o.a.createElement("span", { className: "ck-inspector-separator", key: "separator" }), o.a.createElement("div", { className: "ck-inspector-tree__config", key: "text-cfg" }, o.a.createElement(Vt, { label: "Compact text", id: "model-compact-text", isChecked: this.props.showCompactText, onChange: this.props.toggleModelShowCompactText }), o.a.createElement(Vt, { label: "Show markers", id: "model-show-markers", isChecked: this.props.showMarkers, onChange: this.props.toggleModelShowMarkers }))], o.a.createElement(Ut.a, { className: [this.props.showMarkers ? "" : "ck-inspector-model-tree__hide-markers"], definition: this.props.treeDefinition, textDirection: a.locale.contentLanguageDirection, onClick: this.handleTreeClick, showCompactText: this.props.showCompactText, activeNode: this.props.currentNode }));
          }
        }
        var qn = Re(({ editors: w, currentEditorName: a, model: { treeDefinition: c, currentRootName: h, currentNode: _, ui: { showMarkers: T, showCompactText: z } } }) => ({ treeDefinition: c, editors: w, currentEditorName: a, currentRootName: h, currentNode: _, showMarkers: T, showCompactText: z }), { toggleModelShowCompactText: function() {
          return { type: "TOGGLE_MODEL_SHOW_COMPACT_TEXT" };
        }, setModelCurrentRootName: function(w) {
          return { type: "SET_MODEL_CURRENT_ROOT_NAME", currentRootName: w };
        }, toggleModelShowMarkers: function() {
          return { type: "TOGGLE_MODEL_SHOW_MARKERS" };
        }, setModelCurrentNode: function(w) {
          return { type: "SET_MODEL_CURRENT_NODE", currentNode: w };
        }, setModelActiveTab: Ve })(on);
        d(70);
        class dr extends u.Component {
          render() {
            const a = this.props.presentation && this.props.presentation.expandCollapsibles, c = [];
            for (const h in this.props.itemDefinitions) {
              const _ = this.props.itemDefinitions[h], { subProperties: T, presentation: z = {} } = _, ne = T && Object.keys(T).length, de = Object(ct.c)(String(_.value), 2e3), pe = [o.a.createElement(Jr, { key: `${this.props.name}-${h}-name`, name: h, listUid: this.props.name, canCollapse: ne, colorBox: z.colorBox, expandCollapsibles: a, onClick: this.props.onPropertyTitleClick, title: _.title }), o.a.createElement("dd", { key: `${this.props.name}-${h}-value` }, o.a.createElement("input", { id: `${this.props.name}-${h}-value-input`, type: "text", value: de, readOnly: !0 }))];
              ne && pe.push(o.a.createElement(dr, { name: `${this.props.name}-${h}`, key: `${this.props.name}-${h}`, itemDefinitions: T, presentation: this.props.presentation })), c.push(pe);
            }
            return o.a.createElement("dl", { className: "ck-inspector-property-list ck-inspector-code" }, c);
          }
          shouldComponentUpdate(a) {
            return !Dn()(this.props, a);
          }
        }
        class Jr extends u.PureComponent {
          constructor(a) {
            super(a), this.state = { isCollapsed: !this.props.expandCollapsibles }, this.handleCollapsedChange = this.handleCollapsedChange.bind(this);
          }
          handleCollapsedChange() {
            this.setState({ isCollapsed: !this.state.isCollapsed });
          }
          render() {
            const a = ["ck-inspector-property-list__title"];
            let c, h;
            return this.props.canCollapse && (a.push("ck-inspector-property-list__title_collapsible"), a.push("ck-inspector-property-list__title_" + (this.state.isCollapsed ? "collapsed" : "expanded")), c = o.a.createElement("button", { type: "button", onClick: this.handleCollapsedChange }, "Toggle")), this.props.colorBox && (h = o.a.createElement("span", { className: "ck-inspector-property-list__title__color-box", style: { background: this.props.colorBox } })), this.props.onClick && a.push("ck-inspector-property-list__title_clickable"), o.a.createElement("dt", { className: a.join(" ").trim() }, c, h, o.a.createElement("label", { htmlFor: `${this.props.listUid}-${this.props.name}-value-input`, onClick: this.props.onClick ? () => this.props.onClick(this.props.name) : null, title: this.props.title }, this.props.name), ":");
          }
        }
        d(72);
        function Pr() {
          return (Pr = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        class Bn extends u.PureComponent {
          render() {
            const a = [];
            for (const c of this.props.lists) Object.keys(c.itemDefinitions).length && a.push(o.a.createElement("hr", { key: c.name + "-separator" }), o.a.createElement("h3", { key: c.name + "-header" }, o.a.createElement("a", { href: c.url, target: "_blank", rel: "noopener noreferrer" }, c.name), c.buttons && c.buttons.map((h, _) => o.a.createElement(yt, Pr({ key: "button" + _ }, h)))), o.a.createElement(dr, { key: c.name + "-list", name: c.name, itemDefinitions: c.itemDefinitions, presentation: c.presentation, onPropertyTitleClick: c.onPropertyTitleClick }));
            return o.a.createElement("div", { className: "ck-inspector__object-inspector" }, o.a.createElement("h2", { className: "ck-inspector-code" }, this.props.header), a);
          }
        }
        var Nt = d(3);
        function xo() {
          return (xo = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        var kn = ({ styles: w = {}, ...a }) => o.a.createElement("svg", xo({ viewBox: "0 0 19 19", xmlns: "http://www.w3.org/2000/svg" }, a), o.a.createElement("path", { d: "M17 15.75a.75.75 0 01.102 1.493L17 17.25H9a.75.75 0 01-.102-1.493L9 15.75h8zM2.156 2.947l.095.058 7.58 5.401a.75.75 0 01.084 1.152l-.083.069-7.58 5.425a.75.75 0 01-.958-1.148l.086-.071 6.724-4.815-6.723-4.792a.75.75 0 01-.233-.95l.057-.096a.75.75 0 01.951-.233z" }));
        function Nr() {
          return (Nr = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        var Ca = ({ styles: w = {}, ...a }) => o.a.createElement("svg", Nr({ fill: "none", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 19 19" }, a), o.a.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M6 1a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-2v2h5a1 1 0 011 1v3h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3a1 1 0 011-1h1v-2.5a.5.5 0 00-.5-.5H10v3h1a1 1 0 011 1v3a1 1 0 01-1 1H8a1 1 0 01-1-1v-3a1 1 0 011-1h1v-3H4.5a.5.5 0 00-.5.5V13h1a1 1 0 011 1v3a1 1 0 01-1 1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1v-3a1 1 0 011-1h5V7H7a1 1 0 01-1-1V1zm1.5 4.5v-4h4v4h-4zm-5 11v-2h2v2h-2zm6-2v2h2v-2h-2zm6 2v-2h2v2h-2z", fill: "#000" }));
        class So extends u.Component {
          constructor(a) {
            super(a), this.handleNodeLogButtonClick = this.handleNodeLogButtonClick.bind(this), this.handleNodeSchemaButtonClick = this.handleNodeSchemaButtonClick.bind(this);
          }
          handleNodeLogButtonClick() {
            Nt.a.log(this.props.currentNodeDefinition.editorNode);
          }
          handleNodeSchemaButtonClick() {
            const a = this.props.editors.get(this.props.currentEditorName).model.schema.getDefinition(this.props.currentNodeDefinition.editorNode);
            this.props.setActiveTab("Schema"), this.props.setSchemaCurrentDefinitionName(a.name);
          }
          render() {
            const a = this.props.currentNodeDefinition;
            return a ? o.a.createElement(Bn, { header: [o.a.createElement("span", { key: "link" }, o.a.createElement("a", { href: a.url, target: "_blank", rel: "noopener noreferrer" }, o.a.createElement("b", null, a.type)), ":", a.type === "Text" ? o.a.createElement("em", null, a.name) : a.name), o.a.createElement(yt, { key: "log", icon: o.a.createElement(kn, null), text: "Log in console", onClick: this.handleNodeLogButtonClick }), o.a.createElement(yt, { key: "schema", icon: o.a.createElement(Ca, null), text: "Show in schema", onClick: this.handleNodeSchemaButtonClick })], lists: [{ name: "Attributes", url: a.url, itemDefinitions: a.attributes }, { name: "Properties", url: a.url, itemDefinitions: a.properties }] }) : o.a.createElement(Et, { isEmpty: "true" }, o.a.createElement("p", null, "Select a node in the tree to inspect"));
          }
        }
        var yi = Re(({ editors: w, currentEditorName: a, model: { currentNodeDefinition: c } }) => ({ editors: w, currentEditorName: a, currentNodeDefinition: c }), { setActiveTab: wt, setSchemaCurrentDefinitionName: ir })(So);
        function vi() {
          return (vi = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        var Dr = ({ styles: w = {}, ...a }) => o.a.createElement("svg", vi({ viewBox: "0 0 19 19", xmlns: "http://www.w3.org/2000/svg" }, a), o.a.createElement("path", { d: "M9.5 4.5c1.85 0 3.667.561 5.199 1.519C16.363 7.059 17.5 8.4 17.5 9.5s-1.137 2.441-2.801 3.481c-1.532.958-3.35 1.519-5.199 1.519-1.85 0-3.667-.561-5.199-1.519C2.637 11.941 1.5 10.6 1.5 9.5s1.137-2.441 2.801-3.481C5.833 5.06 7.651 4.5 9.5 4.5zm0 1a4 4 0 11-.2.005l.2-.005c-1.655 0-3.29.505-4.669 1.367C3.431 7.742 2.5 8.84 2.5 9.5c0 .66.931 1.758 2.331 2.633C6.21 12.995 7.845 13.5 9.5 13.5c1.655 0 3.29-.505 4.669-1.367 1.4-.875 2.331-1.974 2.331-2.633 0-.66-.931-1.758-2.331-2.633C12.79 6.005 11.155 5.5 9.5 5.5zM8 6.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" }));
        const pr = "https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_selection-Selection.html";
        class ki extends u.Component {
          constructor(a) {
            super(a), this.handleSelectionLogButtonClick = this.handleSelectionLogButtonClick.bind(this), this.handleScrollToSelectionButtonClick = this.handleScrollToSelectionButtonClick.bind(this);
          }
          handleSelectionLogButtonClick() {
            const a = this.props.editor;
            Nt.a.log(a.model.document.selection);
          }
          handleScrollToSelectionButtonClick() {
            const a = document.querySelector(".ck-inspector-tree__position.ck-inspector-tree__position_selection");
            a && a.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          render() {
            const a = this.props.editor, c = this.props.info;
            return o.a.createElement(Bn, { header: [o.a.createElement("span", { key: "link" }, o.a.createElement("a", { href: pr, target: "_blank", rel: "noopener noreferrer" }, o.a.createElement("b", null, "Selection"))), o.a.createElement(yt, { key: "log", icon: o.a.createElement(kn, null), text: "Log in console", onClick: this.handleSelectionLogButtonClick }), o.a.createElement(yt, { key: "scroll", icon: o.a.createElement(Dr, null), text: "Scroll to selection", onClick: this.handleScrollToSelectionButtonClick })], lists: [{ name: "Attributes", url: pr + "#function-getAttributes", itemDefinitions: c.attributes }, { name: "Properties", url: "" + pr, itemDefinitions: c.properties }, { name: "Anchor", url: pr + "#member-anchor", buttons: [{ icon: o.a.createElement(kn, null), text: "Log in console", onClick: () => Nt.a.log(a.model.document.selection.anchor) }], itemDefinitions: c.anchor }, { name: "Focus", url: pr + "#member-focus", buttons: [{ icon: o.a.createElement(kn, null), text: "Log in console", onClick: () => Nt.a.log(a.model.document.selection.focus) }], itemDefinitions: c.focus }, { name: "Ranges", url: pr + "#function-getRanges", buttons: [{ icon: o.a.createElement(kn, null), text: "Log in console", onClick: () => Nt.a.log(...a.model.document.selection.getRanges()) }], itemDefinitions: c.ranges, presentation: { expandCollapsibles: !0 } }] });
          }
        }
        var wi = Re(({ editors: w, currentEditorName: a, model: { ranges: c } }) => {
          const h = w.get(a);
          return { editor: h, currentEditorName: a, info: function(_, T) {
            const z = _.model.document.selection, ne = z.anchor, de = z.focus, pe = { properties: { isCollapsed: { value: z.isCollapsed }, isBackward: { value: z.isBackward }, isGravityOverridden: { value: z.isGravityOverridden }, rangeCount: { value: z.rangeCount } }, attributes: {}, anchor: Rr(Object(un.a)(ne)), focus: Rr(Object(un.a)(de)), ranges: {} };
            for (const [_e, Ne] of z.getAttributes()) pe.attributes[_e] = { value: Ne };
            T.forEach((_e, Ne) => {
              pe.ranges[Ne] = { value: "", subProperties: { start: { value: "", subProperties: Object(ct.b)(Rr(_e.start)) }, end: { value: "", subProperties: Object(ct.b)(Rr(_e.end)) } } };
            });
            for (const _e in pe) _e !== "ranges" && (pe[_e] = Object(ct.b)(pe[_e]));
            return pe;
          }(h, c) };
        }, {})(ki);
        function Rr({ path: w, stickiness: a, index: c, isAtEnd: h, isAtStart: _, offset: T, textNode: z }) {
          return { path: { value: w }, stickiness: { value: a }, index: { value: c }, isAtEnd: { value: h }, isAtStart: { value: _ }, offset: { value: T }, textNode: { value: z } };
        }
        class Ta extends u.Component {
          render() {
            const a = function(_) {
              const T = {};
              for (const z of _) {
                const ne = z.name.split(":");
                let de = T;
                for (const pe of ne) {
                  const _e = pe === ne[ne.length - 1];
                  de = de[pe] ? de[pe] : de[pe] = _e ? z : {};
                }
              }
              return T;
            }(this.props.markers), c = function _(T) {
              const z = {};
              for (const ne in T) {
                const de = T[ne];
                if (de.name) {
                  const pe = Object(ct.b)(Ei(de));
                  z[ne] = { value: "", presentation: { colorBox: de.presentation.color }, subProperties: pe };
                } else {
                  const pe = Object.keys(de).length;
                  z[ne] = { value: pe + " marker" + (pe > 1 ? "s" : ""), subProperties: _(de) };
                }
              }
              return z;
            }(a), h = this.props.editors.get(this.props.currentEditorName);
            return Object.keys(a).length ? o.a.createElement(Bn, { header: [o.a.createElement("span", { key: "link" }, o.a.createElement("a", { href: "https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_markercollection-Marker.html", target: "_blank", rel: "noopener noreferrer" }, o.a.createElement("b", null, "Markers"))), o.a.createElement(yt, { key: "log", icon: o.a.createElement(kn, null), text: "Log in console", onClick: () => Nt.a.log([...h.model.markers]) })], lists: [{ name: "Markers tree", itemDefinitions: c, presentation: { expandCollapsibles: !0 } }] }) : o.a.createElement(Et, { isEmpty: "true" }, o.a.createElement("p", null, "No markers in the document."));
          }
        }
        var Yo = Re(({ editors: w, currentEditorName: a, model: { markers: c } }) => ({ editors: w, currentEditorName: a, markers: c }), {})(Ta);
        function Ei({ name: w, start: a, end: c, affectsData: h, managedUsingOperations: _ }) {
          return { name: { value: w }, start: { value: a.path }, end: { value: c.path }, affectsData: { value: h }, managedUsingOperations: { value: _ } };
        }
        d(74);
        class qo extends u.Component {
          render() {
            return this.props.currentEditorName ? o.a.createElement(Et, { splitVertically: "true" }, o.a.createElement(qn, null), o.a.createElement(vn, null, o.a.createElement(Qt, { onTabChange: this.props.setModelActiveTab, activeTab: this.props.activeTab }, o.a.createElement(yi, { label: "Inspect" }), o.a.createElement(wi, { label: "Selection" }), o.a.createElement(Yo, { label: "Markers" })))) : o.a.createElement(Et, { isEmpty: "true" }, o.a.createElement("p", null, "Nothing to show. Attach another editor instance to start inspecting."));
          }
        }
        var Oa = Re(({ currentEditorName: w, model: { ui: { activeTab: a } } }) => ({ currentEditorName: w, activeTab: a }), { setModelActiveTab: Ve })(qo);
        class Pa extends u.Component {
          constructor(a) {
            super(a), this.handleTreeClick = this.handleTreeClick.bind(this), this.handleRootChange = this.handleRootChange.bind(this);
          }
          handleTreeClick(a, c) {
            a.persist(), a.stopPropagation(), this.props.setViewCurrentNode(c), a.detail === 2 && this.props.setViewActiveTab("Inspect");
          }
          handleRootChange(a) {
            this.props.setViewCurrentRootName(a.target.value);
          }
          render() {
            const a = this.props.editors.get(this.props.currentEditorName);
            return o.a.createElement(Ht, null, [o.a.createElement("div", { className: "ck-inspector-tree__config", key: "root-cfg" }, o.a.createElement(rn, { id: "view-root-select", label: "Root", value: this.props.currentRootName, options: Object(en.d)(a).map((c) => c.rootName), onChange: this.handleRootChange })), o.a.createElement("span", { className: "ck-inspector-separator", key: "separator" }), o.a.createElement("div", { className: "ck-inspector-tree__config", key: "types-cfg" }, o.a.createElement(Vt, { label: "Show element types", id: "view-show-types", isChecked: this.props.showElementTypes, onChange: this.props.toggleViewShowElementTypes }))], o.a.createElement(Ut.a, { definition: this.props.treeDefinition, textDirection: a.locale.contentLanguageDirection, onClick: this.handleTreeClick, showCompactText: "true", showElementTypes: this.props.showElementTypes, activeNode: this.props.currentNode }));
          }
        }
        var Co = Re(({ editors: w, currentEditorName: a, view: { treeDefinition: c, currentRootName: h, currentNode: _, ui: { showElementTypes: T } } }) => ({ treeDefinition: c, editors: w, currentEditorName: a, currentRootName: h, currentNode: _, showElementTypes: T }), { setViewCurrentRootName: function(w) {
          return { type: "SET_VIEW_CURRENT_ROOT_NAME", currentRootName: w };
        }, toggleViewShowElementTypes: function() {
          return { type: "TOGGLE_VIEW_SHOW_ELEMENT_TYPES" };
        }, setViewCurrentNode: function(w) {
          return { type: "SET_VIEW_CURRENT_NODE", currentNode: w };
        }, setViewActiveTab: _r })(Pa);
        class mt extends u.Component {
          constructor(a) {
            super(a), this.handleNodeLogButtonClick = this.handleNodeLogButtonClick.bind(this);
          }
          handleNodeLogButtonClick() {
            Nt.a.log(this.props.currentNodeDefinition.editorNode);
          }
          render() {
            const a = this.props.currentNodeDefinition;
            return a ? o.a.createElement(Bn, { header: [o.a.createElement("span", { key: "link" }, o.a.createElement("a", { href: a.url, target: "_blank", rel: "noopener noreferrer" }, o.a.createElement("b", null, a.type), ":"), a.type === "Text" ? o.a.createElement("em", null, a.name) : a.name), o.a.createElement(yt, { key: "log", icon: o.a.createElement(kn, null), text: "Log in console", onClick: this.handleNodeLogButtonClick })], lists: [{ name: "Attributes", url: a.url, itemDefinitions: a.attributes }, { name: "Properties", url: a.url, itemDefinitions: a.properties }, { name: "Custom Properties", url: en.a + "_element-Element.html#function-getCustomProperty", itemDefinitions: a.customProperties }] }) : o.a.createElement(Et, { isEmpty: "true" }, o.a.createElement("p", null, "Select a node in the tree to inspect"));
          }
        }
        var Zr = Re(({ view: { currentNodeDefinition: w } }) => ({ currentNodeDefinition: w }), {})(mt);
        const eo = "https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_selection-Selection.html";
        class Na extends u.Component {
          constructor(a) {
            super(a), this.handleSelectionLogButtonClick = this.handleSelectionLogButtonClick.bind(this), this.handleScrollToSelectionButtonClick = this.handleScrollToSelectionButtonClick.bind(this);
          }
          handleSelectionLogButtonClick() {
            const a = this.props.editor;
            Nt.a.log(a.editing.view.document.selection);
          }
          handleScrollToSelectionButtonClick() {
            const a = document.querySelector(".ck-inspector-tree__position.ck-inspector-tree__position_selection");
            a && a.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          render() {
            const a = this.props.editor, c = this.props.info;
            return o.a.createElement(Bn, { header: [o.a.createElement("span", { key: "link" }, o.a.createElement("a", { href: eo, target: "_blank", rel: "noopener noreferrer" }, o.a.createElement("b", null, "Selection"))), o.a.createElement(yt, { key: "log", icon: o.a.createElement(kn, null), text: "Log in console", onClick: this.handleSelectionLogButtonClick }), o.a.createElement(yt, { key: "scroll", icon: o.a.createElement(Dr, null), text: "Scroll to selection", onClick: this.handleScrollToSelectionButtonClick })], lists: [{ name: "Properties", url: "" + eo, itemDefinitions: c.properties }, { name: "Anchor", url: eo + "#member-anchor", buttons: [{ type: "log", text: "Log in console", onClick: () => Nt.a.log(a.editing.view.document.selection.anchor) }], itemDefinitions: c.anchor }, { name: "Focus", url: eo + "#member-focus", buttons: [{ type: "log", text: "Log in console", onClick: () => Nt.a.log(a.editing.view.document.selection.focus) }], itemDefinitions: c.focus }, { name: "Ranges", url: eo + "#function-getRanges", buttons: [{ type: "log", text: "Log in console", onClick: () => Nt.a.log(...a.editing.view.document.selection.getRanges()) }], itemDefinitions: c.ranges, presentation: { expandCollapsibles: !0 } }] });
          }
        }
        var To = Re(({ editors: w, currentEditorName: a, view: { ranges: c } }) => {
          const h = w.get(a);
          return { editor: h, currentEditorName: a, info: function(_, T) {
            const z = _.editing.view.document.selection, ne = { properties: { isCollapsed: { value: z.isCollapsed }, isBackward: { value: z.isBackward }, isFake: { value: z.isFake }, rangeCount: { value: z.rangeCount } }, anchor: Ar(Object(Yt.a)(z.anchor)), focus: Ar(Object(Yt.a)(z.focus)), ranges: {} };
            T.forEach((de, pe) => {
              ne.ranges[pe] = { value: "", subProperties: { start: { value: "", subProperties: Object(ct.b)(Ar(de.start)) }, end: { value: "", subProperties: Object(ct.b)(Ar(de.end)) } } };
            });
            for (const de in ne) de !== "ranges" && (ne[de] = Object(ct.b)(ne[de]));
            return ne;
          }(h, c) };
        }, {})(Na);
        function Ar({ offset: w, isAtEnd: a, isAtStart: c, parent: h }) {
          return { offset: { value: w }, isAtEnd: { value: a }, isAtStart: { value: c }, parent: { value: h } };
        }
        class to extends u.Component {
          render() {
            return this.props.currentEditorName ? o.a.createElement(Et, { splitVertically: "true" }, o.a.createElement(Co, null), o.a.createElement(vn, null, o.a.createElement(Qt, { onTabChange: this.props.setViewActiveTab, activeTab: this.props.activeTab }, o.a.createElement(Zr, { label: "Inspect" }), o.a.createElement(To, { label: "Selection" })))) : o.a.createElement(Et, { isEmpty: "true" }, o.a.createElement("p", null, "Nothing to show. Attach another editor instance to start inspecting."));
          }
        }
        var Da = Re(({ currentEditorName: w, view: { ui: { activeTab: a } } }) => ({ currentEditorName: w, activeTab: a }), { setViewActiveTab: _r, updateViewState: wo })(to);
        class _i extends u.Component {
          constructor(a) {
            super(a), this.handleTreeClick = this.handleTreeClick.bind(this);
          }
          handleTreeClick(a, c) {
            a.persist(), a.stopPropagation(), this.props.setCommandsCurrentCommandName(c);
          }
          render() {
            return o.a.createElement(Ht, null, o.a.createElement(Ut.a, { definition: this.props.treeDefinition, onClick: this.handleTreeClick, activeNode: this.props.currentCommandName }));
          }
        }
        var xi = Re(({ commands: { treeDefinition: w, currentCommandName: a } }) => ({ treeDefinition: w, currentCommandName: a }), { setCommandsCurrentCommandName: function(w) {
          return { type: "SET_COMMANDS_CURRENT_COMMAND_NAME", currentCommandName: w };
        } })(_i);
        function Si() {
          return (Si = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        var Ko = ({ styles: w = {}, ...a }) => o.a.createElement("svg", Si({ viewBox: "0 0 19 19", xmlns: "http://www.w3.org/2000/svg" }, a), o.a.createElement("path", { d: "M9.25 1.25a8 8 0 110 16 8 8 0 010-16zm0 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.344 6.485l4.98 2.765-4.98 3.018V6.485z" }));
        class Qo extends u.Component {
          constructor(a) {
            super(a), this.handleCommandLogButtonClick = this.handleCommandLogButtonClick.bind(this), this.handleCommandExecuteButtonClick = this.handleCommandExecuteButtonClick.bind(this);
          }
          handleCommandLogButtonClick() {
            Nt.a.log(this.props.currentCommandDefinition.command);
          }
          handleCommandExecuteButtonClick() {
            this.props.editors.get(this.props.currentEditorName).execute(this.props.currentCommandName);
          }
          render() {
            const a = this.props.currentCommandDefinition;
            return a ? o.a.createElement(Bn, { header: [o.a.createElement("span", { key: "link" }, o.a.createElement("a", { href: a.url, target: "_blank", rel: "noopener noreferrer" }, o.a.createElement("b", null, a.type)), ":", this.props.currentCommandName), o.a.createElement(yt, { key: "exec", icon: o.a.createElement(Ko, null), text: "Execute command", onClick: this.handleCommandExecuteButtonClick }), o.a.createElement(yt, { key: "log", icon: o.a.createElement(kn, null), text: "Log in console", onClick: this.handleCommandLogButtonClick })], lists: [{ name: "Properties", url: a.url, itemDefinitions: a.properties }] }) : o.a.createElement(Et, { isEmpty: "true" }, o.a.createElement("p", null, "Select a command to inspect"));
          }
        }
        var Ci = Re(({ editors: w, currentEditorName: a, commands: { currentCommandName: c, currentCommandDefinition: h } }) => ({ editors: w, currentEditorName: a, currentCommandName: c, currentCommandDefinition: h }), {})(Qo);
        class Wn extends u.Component {
          render() {
            return this.props.currentEditorName ? o.a.createElement(Et, { splitVertically: "true" }, o.a.createElement(xi, null), o.a.createElement(vn, null, o.a.createElement(Qt, { activeTab: "Inspect" }, o.a.createElement(Ci, { label: "Inspect" })))) : o.a.createElement(Et, { isEmpty: "true" }, o.a.createElement("p", null, "Nothing to show. Attach another editor instance to start inspecting."));
          }
        }
        var Oo = Re(({ currentEditorName: w }) => ({ currentEditorName: w }), { updateCommandsState: Sr })(Wn);
        class Go extends u.Component {
          constructor(a) {
            super(a), this.handleTreeClick = this.handleTreeClick.bind(this);
          }
          handleTreeClick(a, c) {
            a.persist(), a.stopPropagation(), this.props.setSchemaCurrentDefinitionName(c);
          }
          render() {
            return o.a.createElement(Ht, null, o.a.createElement(Ut.a, { definition: this.props.treeDefinition, onClick: this.handleTreeClick, activeNode: this.props.currentSchemaDefinitionName }));
          }
        }
        var Ti = Re(({ schema: { treeDefinition: w, currentSchemaDefinitionName: a } }) => ({ treeDefinition: w, currentSchemaDefinitionName: a }), { setSchemaCurrentDefinitionName: ir })(Go);
        class Oi extends u.Component {
          render() {
            const a = this.props.currentSchemaDefinition;
            return a ? o.a.createElement(Bn, { header: [o.a.createElement("span", { key: "link" }, o.a.createElement("a", { href: a.urls.general, target: "_blank", rel: "noopener noreferrer" }, o.a.createElement("b", null, a.type)), ":", this.props.currentSchemaDefinitionName)], lists: [{ name: "Properties", url: a.urls.general, itemDefinitions: a.properties }, { name: "Allowed attributes", url: a.urls.allowAttributes, itemDefinitions: a.allowAttributes }, { name: "Allowed children", url: a.urls.allowChildren, itemDefinitions: a.allowChildren, onPropertyTitleClick: (c) => {
              this.props.setSchemaCurrentDefinitionName(c);
            } }, { name: "Allowed in", url: a.urls.allowIn, itemDefinitions: a.allowIn, onPropertyTitleClick: (c) => {
              this.props.setSchemaCurrentDefinitionName(c);
            } }] }) : o.a.createElement(Et, { isEmpty: "true" }, o.a.createElement("p", null, "Select a schema definition to inspect"));
          }
        }
        var Pi = Re(({ editors: w, currentEditorName: a, schema: { currentSchemaDefinitionName: c, currentSchemaDefinition: h } }) => ({ editors: w, currentEditorName: a, currentSchemaDefinitionName: c, currentSchemaDefinition: h }), { setSchemaCurrentDefinitionName: ir })(Oi);
        class Xo extends u.Component {
          render() {
            return this.props.currentEditorName ? o.a.createElement(Et, { splitVertically: "true" }, o.a.createElement(Ti, null), o.a.createElement(vn, null, o.a.createElement(Qt, { activeTab: "Inspect" }, o.a.createElement(Pi, { label: "Inspect" })))) : o.a.createElement(Et, { isEmpty: "true" }, o.a.createElement("p", null, "Nothing to show. Attach another editor instance to start inspecting."));
          }
        }
        var Jo = Re(({ currentEditorName: w }) => ({ currentEditorName: w }))(Xo), Zo = d(47), Ni = d.n(Zo), ei = d(48), ti = d.n(ei);
        function Di() {
          return (Di = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        var Mr = ({ styles: w = {}, ...a }) => o.a.createElement("svg", Di({ viewBox: "0 0 19 19", xmlns: "http://www.w3.org/2000/svg" }, a), o.a.createElement("path", { d: "M12.936 0l5 4.5v12.502l-1.504-.001v.003h1.504v1.499h-5v-1.501l3.496-.001V5.208L12.21 1.516 3.436 1.5v15.504l3.5-.001v1.5h-5V0h11z" }), o.a.createElement("path", { d: "M10.374 9.463l.085.072.477.464L11 10v.06l3.545 3.453-1.047 1.075L11 12.155V19H9v-6.9l-2.424 2.476-1.072-1.05L9.4 9.547a.75.75 0 01.974-.084zM12.799 1.5l-.001 2.774h3.645v1.5h-5.144V1.5z" }));
        d(86);
        class Ri extends u.Component {
          constructor(a) {
            super(a), this.state = { isModalOpen: !1, editorDataValue: "" }, this.textarea = o.a.createRef();
          }
          render() {
            return [o.a.createElement(yt, { text: "Set editor data", icon: o.a.createElement(Mr, null), isEnabled: !!this.props.editor, onClick: () => this.setState({ isModalOpen: !0 }), key: "button" }), o.a.createElement(ti.a, { isOpen: this.state.isModalOpen, appElement: document.querySelector(".ck-inspector-wrapper"), onAfterOpen: this._handleModalAfterOpen.bind(this), overlayClassName: "ck-inspector-modal ck-inspector-quick-actions__set-data-modal", className: "ck-inspector-quick-actions__set-data-modal__content", onRequestClose: this._closeModal.bind(this), portalClassName: "ck-inspector-portal", shouldCloseOnEsc: !0, shouldCloseOnOverlayClick: !0, key: "modal" }, o.a.createElement("h2", null, "Set editor data"), o.a.createElement("textarea", { autoFocus: !0, ref: this.textarea, value: this.state.editorDataValue, placeholder: "Paste HTML here...", onChange: this._handlDataChange.bind(this), onKeyPress: (a) => {
              a.key == "Enter" && a.shiftKey && this._setEditorDataAndCloseModal();
            } }), o.a.createElement("div", { className: "ck-inspector-quick-actions__set-data-modal__buttons" }, o.a.createElement("button", { type: "button", onClick: () => {
              this.setState({ editorDataValue: this.props.editor.getData() }), this.textarea.current.focus();
            } }, "Load data"), o.a.createElement("button", { type: "button", title: "Cancel (Esc)", onClick: this._closeModal.bind(this) }, "Cancel"), o.a.createElement("button", { type: "button", title: "Set editor data (⇧+Enter)", onClick: this._setEditorDataAndCloseModal.bind(this) }, "Set data")))];
          }
          _setEditorDataAndCloseModal() {
            this.props.editor.setData(this.state.editorDataValue), this._closeModal();
          }
          _closeModal() {
            this.setState({ isModalOpen: !1 });
          }
          _handlDataChange(a) {
            this.setState({ editorDataValue: a.target.value });
          }
          _handleModalAfterOpen() {
            this.setState({ editorDataValue: this.props.editor.getData() }), this.textarea.current.select();
          }
        }
        function Po() {
          return (Po = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        var Kn = ({ styles: w = {}, ...a }) => o.a.createElement("svg", Po({ viewBox: "0 0 19 19", xmlns: "http://www.w3.org/2000/svg" }, a), o.a.createElement("path", { d: "M12.936 0l5 4.5v14.003h-4.503L14.936 17h-10l1.503 1.503H1.936V0h11zm-9.5 1.5v15.504h12.996V5.208L12.21 1.516 3.436 1.5z" }), o.a.createElement("path", { d: "M12.799 1.5l-.001 2.774h3.645v1.5h-5.144V1.5zM9.675 18.859l-.085-.072-4.086-3.978 1.047-1.075L9 16.119V9h2v7.273l2.473-2.526 1.072 1.049-3.896 3.979a.75.75 0 01-.974.084z" }));
        function no() {
          return (no = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        var ro = ({ styles: w = {}, ...a }) => o.a.createElement("svg", no({ viewBox: "0 0 19 19", xmlns: "http://www.w3.org/2000/svg" }, a), o.a.createElement("path", { d: "M3.144 15.748l2.002 1.402-1.976.516-.026-1.918zM2.438 3.391l15.346 11.023-.875 1.218-5.202-3.736-2.877 4.286.006.005-3.055.797-2.646-1.852-.04-2.95-.006-.005.006-.008v-.025l.01.008L6.02 7.81l-4.457-3.2.876-1.22zM7.25 8.695l-2.13 3.198 3.277 2.294 2.104-3.158-3.25-2.334zM14.002 0l2.16 1.512-.856 1.222c.828.967 1.144 2.141.432 3.158l-2.416 3.599-1.214-.873 2.396-3.593.005.003c.317-.452-.16-1.332-1.064-1.966-.891-.624-1.865-.776-2.197-.349l-.006-.004-2.384 3.575-1.224-.879 2.376-3.539c.674-.932 1.706-1.155 3.096-.668l.046.018.85-1.216z" }));
        function Ir() {
          return (Ir = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        var oo = ({ styles: w = {}, ...a }) => o.a.createElement("svg", Ir({ viewBox: "0 0 19 19", xmlns: "http://www.w3.org/2000/svg" }, a), o.a.createElement("path", { d: "M11.28 1a1 1 0 01.948.684l.333 1 .018.066H16a.75.75 0 01.102 1.493L16 4.25h-.5V16a2 2 0 01-2 2h-8a2 2 0 01-2-2V4.25H3a.75.75 0 01-.102-1.493L3 2.75h3.42a1 1 0 01.019-.066l.333-1A1 1 0 017.721 1h3.558zM14 4.5H5V16a.5.5 0 00.41.492l.09.008h8a.5.5 0 00.492-.41L14 16V4.5zM7.527 6.06v8.951h-1V6.06h1zm5 0v8.951h-1V6.06h1zM10 6.06v8.951H9V6.06h1z" }));
        function Qn() {
          return (Qn = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        var ni = ({ styles: w = {}, ...a }) => o.a.createElement("svg", Qn({ viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg" }, a), o.a.createElement("path", { d: "M2.284 2.498c-.239.266-.184.617-.184 1.002V4H2a.5.5 0 00-.492.41L1.5 4.5V17a1 1 0 00.883.993L2.5 18h10a1 1 0 00.97-.752l-.081-.062c.438.368.976.54 1.507.526a2.5 2.5 0 01-2.232 1.783l-.164.005h-10a2.5 2.5 0 01-2.495-2.336L0 17V4.5a2 2 0 011.85-1.995L2 2.5l.284-.002zm10.532 0L13 2.5a2 2 0 011.995 1.85L15 4.5v2.28a2.243 2.243 0 00-1.5.404V4.5a.5.5 0 00-.41-.492L13 4v-.5l-.007-.144c-.031-.329.032-.626-.177-.858z" }), o.a.createElement("path", { d: "M6 .49l-.144.006a1.75 1.75 0 00-1.41.94l-.029.058.083-.004c-.69 0-1.25.56-1.25 1.25v1c0 .69.56 1.25 1.25 1.25h6c.69 0 1.25-.56 1.25-1.25v-1l-.006-.128a1.25 1.25 0 00-1.116-1.116l-.046-.002-.027-.058A1.75 1.75 0 009 .49H6zm0 1.5h3a.25.25 0 01.25.25l.007.102A.75.75 0 0010 2.99h.25v.5h-5.5v-.5H5a.75.75 0 00.743-.648l.007-.102A.25.25 0 016 1.99zm9.374 6.55a.75.75 0 01-.093 1.056l-2.33 1.954h6.127a.75.75 0 010 1.501h-5.949l2.19 1.837a.75.75 0 11-.966 1.15l-3.788-3.18a.747.747 0 01-.21-.285.75.75 0 01.17-.945l3.792-3.182a.75.75 0 011.057.093z" }));
        function Rn() {
          return (Rn = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        var Ai = ({ styles: w = {}, ...a }) => o.a.createElement("svg", Rn({ viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg" }, a), o.a.createElement("path", { fill: "#4fa800", d: "M6.972 16.615a.997.997 0 01-.744-.292l-4.596-4.596a1 1 0 111.414-1.414l3.926 3.926 9.937-9.937a1 1 0 011.414 1.415L7.717 16.323a.997.997 0 01-.745.292z" }));
        d(88);
        class Mi extends u.Component {
          constructor(a) {
            super(a), this.state = { isShiftKeyPressed: !1, wasEditorDataJustCopied: !1 }, this._keyDownHandler = this._handleKeyDown.bind(this), this._keyUpHandler = this._handleKeyUp.bind(this), this._readOnlyHandler = this._handleReadOnly.bind(this), this._editorDataJustCopiedTimeout = null;
          }
          render() {
            return o.a.createElement("div", { className: "ck-inspector-editor-quick-actions" }, o.a.createElement(yt, { text: "Log editor", icon: o.a.createElement(kn, null), isEnabled: !!this.props.editor, onClick: () => console.log(this.props.editor) }), this._getLogButton(), o.a.createElement(Ri, { editor: this.props.editor }), o.a.createElement(yt, { text: "Toggle read only", icon: o.a.createElement(ro, null), isOn: this.props.isReadOnly, isEnabled: !!this.props.editor, onClick: this._readOnlyHandler }), o.a.createElement(yt, { text: "Destroy editor", icon: o.a.createElement(oo, null), isEnabled: !!this.props.editor, onClick: () => {
              this.props.editor.destroy();
            } }));
          }
          componentDidMount() {
            document.addEventListener("keydown", this._keyDownHandler), document.addEventListener("keyup", this._keyUpHandler);
          }
          componentWillUnmount() {
            document.removeEventListener("keydown", this._keyDownHandler), document.removeEventListener("keyup", this._keyUpHandler), clearTimeout(this._editorDataJustCopiedTimeout);
          }
          _getLogButton() {
            let a, c;
            return this.state.wasEditorDataJustCopied ? (a = o.a.createElement(Ai, null), c = "Data copied to clipboard.") : (a = this.state.isShiftKeyPressed ? o.a.createElement(ni, null) : o.a.createElement(Kn, null), c = "Log editor data (press with Shift to copy)"), o.a.createElement(yt, { text: c, icon: a, className: this.state.wasEditorDataJustCopied ? "ck-inspector-button_data-copied" : "", isEnabled: !!this.props.editor, onClick: this._handleLogEditorDataClick.bind(this) });
          }
          _handleLogEditorDataClick({ shiftKey: a }) {
            a ? (Ni()(this.props.editor.getData()), this.setState({ wasEditorDataJustCopied: !0 }), clearTimeout(this._editorDataJustCopiedTimeout), this._editorDataJustCopiedTimeout = setTimeout(() => {
              this.setState({ wasEditorDataJustCopied: !1 });
            }, 3e3)) : console.log(this.props.editor.getData());
          }
          _handleKeyDown({ key: a }) {
            this.setState({ isShiftKeyPressed: a === "Shift" });
          }
          _handleKeyUp() {
            this.setState({ isShiftKeyPressed: !1 });
          }
          _handleReadOnly() {
            this.props.editor.isReadOnly ? this.props.editor.disableReadOnlyMode("Lock from Inspector (@ckeditor/ckeditor5-inspector)") : this.props.editor.enableReadOnlyMode("Lock from Inspector (@ckeditor/ckeditor5-inspector)");
          }
        }
        var Ra = Re(({ editors: w, currentEditorName: a, currentEditorGlobals: { isReadOnly: c } }) => ({ editor: w.get(a), isReadOnly: c }), {})(Mi);
        function No() {
          return (No = Object.assign ? Object.assign.bind() : function(w) {
            for (var a = 1; a < arguments.length; a++) {
              var c = arguments[a];
              for (var h in c) Object.prototype.hasOwnProperty.call(c, h) && (w[h] = c[h]);
            }
            return w;
          }).apply(this, arguments);
        }
        var Aa = ({ styles: w = {}, ...a }) => o.a.createElement("svg", No({ viewBox: "0 0 19 19", xmlns: "http://www.w3.org/2000/svg" }, a), o.a.createElement("path", { d: "M17.03 6.47a.75.75 0 01.073.976l-.072.084-6.984 7a.75.75 0 01-.977.073l-.084-.072-7.016-7a.75.75 0 01.976-1.134l.084.072 6.485 6.47 6.454-6.469a.75.75 0 01.977-.073l.084.072z" }));
        d(37);
        const jr = { position: "fixed", bottom: "0", left: "0", right: "0", top: "auto" };
        class hr extends u.Component {
          constructor(a) {
            super(a), ji(this.props.height), document.body.style.setProperty("--ck-inspector-collapsed-height", "30px"), this.handleInspectorResize = this.handleInspectorResize.bind(this);
          }
          handleInspectorResize(a, c, h) {
            const _ = h.style.height;
            this.props.setHeight(_), ji(_);
          }
          render() {
            return this.props.isCollapsed ? (document.body.classList.remove("ck-inspector-body-expanded"), document.body.classList.add("ck-inspector-body-collapsed")) : (document.body.classList.remove("ck-inspector-body-collapsed"), document.body.classList.add("ck-inspector-body-expanded")), o.a.createElement(Or, { bounds: "window", enableResizing: { top: !this.props.isCollapsed }, disableDragging: !0, minHeight: "100", maxHeight: "100%", style: jr, className: ["ck-inspector", this.props.isCollapsed ? "ck-inspector_collapsed" : ""].join(" "), position: { x: 0, y: "100%" }, size: { width: "100%", height: this.props.isCollapsed ? 30 : this.props.height }, onResizeStop: this.handleInspectorResize }, o.a.createElement(Qt, { onTabChange: this.props.setActiveTab, contentBefore: o.a.createElement(Do, { key: "docs" }), activeTab: this.props.activeTab, contentAfter: [o.a.createElement(an, { key: "selector" }), o.a.createElement("span", { className: "ck-inspector-separator", key: "separator-a" }), o.a.createElement(Ra, { key: "quick-actions" }), o.a.createElement("span", { className: "ck-inspector-separator", key: "separator-b" }), o.a.createElement(Ro, { key: "inspector-toggle" })] }, o.a.createElement(Oa, { label: "Model" }), o.a.createElement(Da, { label: "View" }), o.a.createElement(Oo, { label: "Commands" }), o.a.createElement(Jo, { label: "Schema" })));
          }
          componentWillUnmount() {
            document.body.classList.remove("ck-inspector-body-expanded"), document.body.classList.remove("ck-inspector-body-collapsed");
          }
        }
        var ri = Re(({ editors: w, currentEditorName: a, ui: { isCollapsed: c, height: h, activeTab: _ } }) => ({ isCollapsed: c, height: h, editors: w, currentEditorName: a, activeTab: _ }), { toggleIsCollapsed: At, setHeight: function(w) {
          return { type: "SET_HEIGHT", newHeight: w };
        }, setEditors: kt, setCurrentEditorName: Zt, setActiveTab: wt })(hr);
        class Do extends u.Component {
          render() {
            return o.a.createElement("a", { className: "ck-inspector-navbox__navigation__logo", title: "Go to the documentation", href: "https://ckeditor.com/docs/ckeditor5/latest/", target: "_blank", rel: "noopener noreferrer" }, "CKEditor documentation");
          }
        }
        class Ii extends u.Component {
          constructor(a) {
            super(a), this.handleShortcut = this.handleShortcut.bind(this);
          }
          render() {
            return o.a.createElement(yt, { text: "Toggle inspector", icon: o.a.createElement(Aa, null), onClick: this.props.toggleIsCollapsed, title: "Toggle inspector (Alt+F12)", className: ["ck-inspector-navbox__navigation__toggle", this.props.isCollapsed ? " ck-inspector-navbox__navigation__toggle_up" : ""].join(" ") });
          }
          componentDidMount() {
            window.addEventListener("keydown", this.handleShortcut);
          }
          componentWillUnmount() {
            window.removeEventListener("keydown", this.handleShortcut);
          }
          handleShortcut(a) {
            (function(c) {
              return c.altKey && !c.shiftKey && !c.ctrlKey && c.key === "F12";
            })(a) && this.props.toggleIsCollapsed();
          }
        }
        const Ro = Re(({ ui: { isCollapsed: w } }) => ({ isCollapsed: w }), { toggleIsCollapsed: At })(Ii);
        class Ao extends u.Component {
          render() {
            return o.a.createElement("div", { className: "ck-inspector-editor-selector", key: "editor-selector" }, this.props.currentEditorName ? o.a.createElement(rn, { id: "inspector-editor-selector", label: "Instance", value: this.props.currentEditorName, options: [...this.props.editors].map(([a]) => a), onChange: (a) => this.props.setCurrentEditorName(a.target.value) }) : "");
          }
        }
        const an = Re(({ currentEditorName: w, editors: a }) => ({ currentEditorName: w, editors: a }), { setCurrentEditorName: Zt })(Ao);
        function ji(w) {
          document.body.style.setProperty("--ck-inspector-height", w);
        }
        d(90), window.CKEDITOR_INSPECTOR_VERSION = "4.1.0";
        class $e {
          constructor() {
            Nt.a.warn("[CKEditorInspector] Whoops! Looks like you tried to create an instance of the CKEditorInspector class. To attach the inspector, use the static CKEditorInspector.attach( editor ) method instead. For the latest API, please refer to https://github.com/ckeditor/ckeditor5-inspector/blob/master/README.md. ");
          }
          static attach(...a) {
            const { CKEDITOR_VERSION: c } = window;
            if (c) {
              const [T] = c.split(".").map(Number);
              T < 34 && Nt.a.warn("[CKEditorInspector] The inspector requires using CKEditor 5 in version 34 or higher. If you cannot update CKEditor 5, consider downgrading the major version of the inspector to version 3.");
            } else Nt.a.warn("[CKEditorInspector] Could not determine a version of CKEditor 5. Some of the functionalities may not work as expected.");
            const { editors: h, options: _ } = Object(On.c)(a);
            for (const T in h) {
              const z = h[T];
              Nt.a.group("%cAttached the inspector to a CKEditor 5 instance. To learn more, visit https://ckeditor.com/docs/ckeditor5.", "font-weight: bold;"), Nt.a.log(`Editor instance "${T}"`, z), Nt.a.groupEnd(), $e._editors.set(T, z), z.on("destroy", () => {
                $e.detach(T);
              }), $e._mount(_), $e._updateEditorsState();
            }
            return Object.keys(h);
          }
          static attachToAll(a) {
            const c = document.querySelectorAll(".ck.ck-content.ck-editor__editable"), h = [];
            for (const _ of c) {
              const T = _.ckeditorInstance;
              T && !$e._isAttachedTo(T) && h.push(...$e.attach(T, a));
            }
            return h;
          }
          static detach(a) {
            $e._wrapper && ($e._editors.delete(a), $e._updateEditorsState());
          }
          static destroy() {
            if (!$e._wrapper) return;
            m.a.unmountComponentAtNode($e._wrapper), $e._editors.clear(), $e._wrapper.remove();
            const a = $e._store.getState(), c = a.editors.get(a.currentEditorName);
            c && $e._editorListener.stopListening(c), $e._editorListener = null, $e._wrapper = null, $e._store = null;
          }
          static _updateEditorsState() {
            $e._store.dispatch(kt($e._editors));
          }
          static _mount(a) {
            if ($e._wrapper) return;
            const c = $e._wrapper = document.createElement("div");
            let h, _;
            c.className = "ck-inspector-wrapper", document.body.appendChild(c), $e._editorListener = new Er({ onModelChange() {
              const T = $e._store;
              T.getState().ui.isCollapsed || (T.dispatch({ type: "UPDATE_MODEL_STATE" }), T.dispatch({ type: "UPDATE_COMMANDS_STATE" }));
            }, onViewRender() {
              const T = $e._store;
              T.getState().ui.isCollapsed || T.dispatch({ type: "UPDATE_VIEW_STATE" });
            }, onReadOnlyChange() {
              $e._store.dispatch({ type: "UPDATE_CURRENT_EDITOR_IS_READ_ONLY" });
            } }), $e._store = N(Gr, { editors: $e._editors, currentEditorName: Object(On.b)($e._editors), currentEditorGlobals: {}, ui: { isCollapsed: a.isCollapsed } }), $e._store.subscribe(() => {
              const T = $e._store.getState(), z = T.editors.get(T.currentEditorName);
              h !== z && (h && $e._editorListener.stopListening(h), z && $e._editorListener.startListening(z), h = z);
            }), $e._store.subscribe(() => {
              const T = $e._store, z = T.getState().ui.isCollapsed, ne = _ && !z;
              _ = z, ne && (T.dispatch({ type: "UPDATE_MODEL_STATE" }), T.dispatch({ type: "UPDATE_COMMANDS_STATE" }), T.dispatch({ type: "UPDATE_VIEW_STATE" }));
            }), m.a.render(o.a.createElement(F, { store: $e._store }, o.a.createElement(ri, null)), c);
          }
          static _isAttachedTo(a) {
            return [...$e._editors.values()].includes(a);
          }
        }
        $e._editors = /* @__PURE__ */ new Map(), $e._wrapper = null;
      }]).default;
    });
  }(Ss)), Ss.exports;
}
var Ec = wc();
const _c = /* @__PURE__ */ kc(Ec);
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license GPL-3.0-or-later
 */
const {
  Alignment: xc,
  Autoformat: Sc,
  AutoImage: Cc,
  AutoLink: Tc,
  BlockQuote: Oc,
  Bold: Pc,
  ClassicEditor: Nc,
  Clipboard: Dc,
  Code: Rc,
  CodeBlock: Ac,
  Essentials: Mc,
  FindAndReplace: Ic,
  Font: jc,
  GeneralHtmlSupport: zc,
  Heading: au,
  HorizontalLine: Lc,
  HtmlComment: Uc,
  HtmlEmbed: Fc,
  Image: Bc,
  ImageCaption: Wc,
  ImageStyle: Hc,
  ImageToolbar: Vc,
  Indent: $c,
  IndentBlock: Yc,
  Italic: qc,
  LinkEditing: Kc,
  LinkImage: Qc,
  List: Gc,
  ListProperties: Xc,
  MediaEmbed: Jc,
  MediaEmbedToolbar: Zc,
  PageBreak: ef,
  Paragraph: tf,
  PasteFromOffice: nf,
  RemoveFormat: rf,
  SelectAll: of,
  SourceEditing: Os,
  Strikethrough: af,
  Style: sf,
  Subscript: lf,
  Superscript: uf,
  Table: cf,
  TableCaption: ff,
  TableCellProperties: df,
  TableProperties: pf,
  TableToolbar: hf,
  TableUI: mf,
  TextPartLanguage: gf,
  TodoList: bf,
  Underline: yf,
  WordCount: vf
} = eu, Ps = [
  tf,
  of,
  Dc,
  xc,
  // Anchor,
  Cc,
  Tc,
  Sc,
  Oc,
  Pc,
  Rc,
  Ac,
  Gc,
  Xc,
  Mc,
  Ic,
  jc,
  zc,
  au,
  Lc,
  Uc,
  Fc,
  Bc,
  Wc,
  Hc,
  Vc,
  $c,
  Yc,
  qc,
  Kc,
  Qc,
  Jc,
  Zc,
  ef,
  nf,
  rf,
  Os,
  af,
  sf,
  lf,
  uf,
  cf,
  ff,
  df,
  pf,
  hf,
  mf,
  gf,
  bf,
  yf,
  vf,
  oc,
  dc,
  mc,
  sc,
  iu
];
let su = [];
function Tf(ke) {
  su = ke;
}
const kf = (ke) => ($.isArray(ke) || (ke = [ke]), ke.map((H) => (typeof H == "string" && (H = { button: H }), H))), lu = (ke) => ke.map((H) => kf(H)), wf = lu([
  { button: "heading", configOption: "heading" },
  { button: "style", configOption: "style" },
  { button: "alignment", configOption: "alignment" },
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "subscript",
  "superscript",
  "code",
  "link",
  // 'anchor',
  "textPartLanguage",
  { button: "fontSize", configOption: "fontSize" },
  "fontFamily",
  "fontColor",
  "fontBackgroundColor",
  "insertImage",
  "mediaEmbed",
  "htmlEmbed",
  "blockQuote",
  "insertTable",
  "codeBlock",
  "bulletedList",
  "numberedList",
  "todoList",
  ["outdent", "indent"],
  "horizontalLine",
  "pageBreak",
  "removeFormat",
  "selectAll",
  "findAndReplace",
  ["undo", "redo"],
  "sourceEditing",
  "createEntry"
]), uu = [
  { plugins: ["Alignment"], buttons: ["alignment"] },
  // {plugins: ['Anchor'], buttons: ['anchor']},
  {
    plugins: [
      "AutoImage",
      // 'CraftImageInsertUI',
      "Image",
      "ImageCaption",
      "ImageStyle",
      "ImageToolbar",
      "ImageTransform",
      "ImageEditor",
      "LinkImage"
    ],
    buttons: ["insertImage"]
  },
  {
    plugins: ["AutoLink", "CraftLinkUI", "LinkEditing", "LinkImage"],
    buttons: ["link"]
  },
  { plugins: ["BlockQuote"], buttons: ["blockQuote"] },
  { plugins: ["Bold"], buttons: ["bold"] },
  { plugins: ["Code"], buttons: ["code"] },
  { plugins: ["CodeBlock"], buttons: ["codeBlock"] },
  {
    plugins: ["List", "ListProperties"],
    buttons: ["bulletedList", "numberedList"]
  },
  {
    plugins: ["Font"],
    buttons: ["fontSize", "fontFamily", "fontColor", "fontBackgroundColor"]
  },
  { plugins: ["FindAndReplace"], buttons: ["findAndReplace"] },
  { plugins: ["Heading"], buttons: ["heading"] },
  { plugins: ["HorizontalLine"], buttons: ["horizontalLine"] },
  { plugins: ["HtmlEmbed"], buttons: ["htmlEmbed"] },
  {
    plugins: ["Indent", "IndentBlock"],
    buttons: ["outdent", "indent"]
  },
  { plugins: ["Italic"], buttons: ["italic"] },
  {
    plugins: ["MediaEmbed", "MediaEmbedToolbar"],
    buttons: ["mediaEmbed"]
  },
  { plugins: ["PageBreak"], buttons: ["pageBreak"] },
  { plugins: ["RemoveFormat"], buttons: ["removeFormat"] },
  { plugins: ["SourceEditing"], buttons: ["sourceEditing"] },
  { plugins: ["Strikethrough"], buttons: ["strikethrough"] },
  { plugins: ["Style"], buttons: ["style"] },
  { plugins: ["Subscript"], buttons: ["subscript"] },
  { plugins: ["Superscript"], buttons: ["superscript"] },
  {
    plugins: [
      "Table",
      "TableCaption",
      "TableCellProperties",
      "TableProperties",
      "TableToolbar",
      "TableUI"
    ],
    buttons: ["insertTable"]
  },
  { plugins: ["TextPartLanguage"], buttons: ["textPartLanguage"] },
  { plugins: ["TodoList"], buttons: ["todoList"] },
  { plugins: ["Underline"], buttons: ["underline"] },
  { plugins: ["CraftEntries"], buttons: ["createEntry"] }
], Ef = (ke) => {
  for (const [H, E] of Object.entries(eu))
    if (typeof E == "object") {
      for (const [s, d] of Object.entries(E))
        if (typeof d == "function" && d.pluginName === ke)
          return d;
    }
}, Of = (ke) => {
  ke.pluginNames && ke.pluginNames.forEach((H) => {
    const E = Ef(H);
    if (!E) {
      console.warn(
        `No plugin named ${H} found in window.CKEditor5.`
      );
      return;
    }
    Ps.push(E);
  }), ke.toolbarItems && (ke.toolbarItems = lu(ke.toolbarItems), wf.push(...ke.toolbarItems)), ke.pluginNames && ke.pluginNames.length && ke.toolbarItems && ke.toolbarItems.length && uu.push({
    plugins: ke.pluginNames,
    buttons: ke.toolbarItems.flat().map((H) => H.button).flat()
  });
}, _f = function(ke) {
  const H = ke.plugins.get(Os), E = $(ke.ui.view.element), s = $(ke.sourceElement), d = `ckeditor${Math.floor(Math.random() * 1e9)}`, u = [
    "keypress",
    "keyup",
    "change",
    "focus",
    "blur",
    "click",
    "mousedown",
    "mouseup"
  ].map((o) => `${o}.${d}`).join(" ");
  H.on("change:isSourceEditingMode", () => {
    const o = E.find(
      ".ck-source-editing-area"
    );
    if (H.isSourceEditingMode) {
      let S = o.attr("data-value");
      o.on(u, () => {
        S !== (S = o.attr("data-value")) && s.val(S);
      });
    } else
      o.off(`.${d}`);
  });
}, xf = function(ke, H) {
  if (H.heading !== void 0) {
    var E = H.heading.options;
    E.find((s) => s.view === "h1") !== void 0 && ke.keystrokes.set(
      "Ctrl+Alt+1",
      () => ke.execute("heading", { value: "heading1" })
    ), E.find((s) => s.view === "h2") !== void 0 && ke.keystrokes.set(
      "Ctrl+Alt+2",
      () => ke.execute("heading", { value: "heading2" })
    ), E.find((s) => s.view === "h3") !== void 0 && ke.keystrokes.set(
      "Ctrl+Alt+3",
      () => ke.execute("heading", { value: "heading3" })
    ), E.find((s) => s.view === "h4") !== void 0 && ke.keystrokes.set(
      "Ctrl+Alt+4",
      () => ke.execute("heading", { value: "heading4" })
    ), E.find((s) => s.view === "h5") !== void 0 && ke.keystrokes.set(
      "Ctrl+Alt+5",
      () => ke.execute("heading", { value: "heading5" })
    ), E.find((s) => s.view === "h6") !== void 0 && ke.keystrokes.set(
      "Ctrl+Alt+6",
      () => ke.execute("heading", { value: "heading6" })
    ), E.find((s) => s.model === "paragraph") !== void 0 && ke.keystrokes.set("Ctrl+Alt+p", "paragraph");
  }
}, Sf = function(ke, H) {
  let E = null;
  const s = ke.editing.view.document, d = ke.plugins.get("ClipboardPipeline");
  s.on("clipboardOutput", (u, o) => {
    E = ke.id;
  }), s.on("clipboardInput", async (u, o) => {
    let S = o.dataTransfer.getData("text/html");
    if (S && S.includes("<craft-entry") && !(o.method == "drop" && E === ke.id)) {
      if (o.method == "paste" || o.method == "drop" && E !== ke.id) {
        let m = S, g = !1;
        const y = Craft.siteId;
        let b = null, C = null;
        const O = ke.getData(), N = [...S.matchAll(/data-entry-id="([0-9]+)/g)];
        u.stop();
        const J = $(ke.ui.view.element);
        let j = J.parents("form").data("elementEditor");
        await j.ensureIsDraftOrRevision(), b = j.settings.elementId, C = J.parents(".field").data("layoutElement");
        for (let W = 0; W < N.length; W++) {
          let P = null;
          if (N[W][1] && (P = N[W][1]), P !== null) {
            const M = new RegExp('data-entry-id="' + P + '"');
            if (!(E === ke.id && !M.test(O))) {
              let F = null;
              E !== ke.id && (H.includes(iu) ? F = ke.config.get("entryTypeOptions").map((R) => R.value) : (Craft.cp.displayError(
                Craft.t(
                  "ckeditor",
                  "This field doesn’t allow nested entries."
                )
              ), g = !0)), await Craft.sendActionRequest(
                "POST",
                "ckeditor/ckeditor/duplicate-nested-entry",
                {
                  data: {
                    entryId: P,
                    siteId: y,
                    targetEntryTypeIds: F,
                    targetOwnerId: b,
                    targetLayoutElementUid: C
                  }
                }
              ).then((R) => {
                R.data.newEntryId && (m = m.replace(
                  P,
                  R.data.newEntryId
                ));
              }).catch((R) => {
                var oe, K, I, A;
                g = !0, Craft.cp.displayError((K = (oe = R == null ? void 0 : R.response) == null ? void 0 : oe.data) == null ? void 0 : K.message), console.error((A = (I = R == null ? void 0 : R.response) == null ? void 0 : I.data) == null ? void 0 : A.additionalMessage);
              });
            }
          }
        }
        g || (o.content = ke.data.htmlProcessor.toView(m), d.fire("inputTransformation", o));
      }
    }
  });
}, Pf = () => Ps.map((ke) => ke.pluginName), Nf = async function(ke, H) {
  let E = Ps;
  const s = [];
  H.toolbar && s.push(
    ...uu.filter(
      ({ buttons: u }) => !H.toolbar.items.some((o) => u.includes(o))
    ).map(({ plugins: u }) => u).flat()
  ), (!H.transforms || !H.transforms.length) && s.push("ImageTransform"), s.push("MediaEmbedToolbar"), s.length && (E = E.filter((u) => !s.includes(u.pluginName))), typeof ke == "string" && (ke = document.querySelector(`#${ke}`)), H.licenseKey = "GPL";
  const d = await Nc.create(
    ke,
    Object.assign({ plugins: E }, H)
  );
  return Craft.showCkeditorInspector && Craft.userIsAdmin && _c.attach(d), d.editing.view.change((u) => {
    const o = d.editing.view.document.getRoot();
    if (typeof H.accessibleFieldName < "u" && H.accessibleFieldName.length) {
      let S = o.getAttribute("aria-label");
      u.setAttribute(
        "aria-label",
        H.accessibleFieldName + ", " + S,
        o
      );
    }
    typeof H.describedBy < "u" && H.describedBy.length && u.setAttribute(
      "aria-describedby",
      H.describedBy,
      o
    );
  }), d.updateSourceElement(), d.model.document.on("change:data", () => {
    d.updateSourceElement();
  }), E.includes(Os) && _f(d), E.includes(au) && xf(d, H), Sf(d, E), d;
};
export {
  Nf as create,
  su as localizedRefHandles,
  Pf as pluginNames,
  Of as registerPackage,
  Tf as setLocalizedRefHandles,
  wf as toolbarItems
};
