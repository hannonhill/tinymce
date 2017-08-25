(function () {

var defs = {}; // id -> {dependencies, definition, instance (possibly undefined)}

// Used when there is no 'main' module.
// The name is probably (hopefully) unique so minification removes for releases.
var register_3795 = function (id) {
  var module = dem(id);
  var fragments = id.split('.');
  var target = Function('return this;')();
  for (var i = 0; i < fragments.length - 1; ++i) {
    if (target[fragments[i]] === undefined)
      target[fragments[i]] = {};
    target = target[fragments[i]];
  }
  target[fragments[fragments.length - 1]] = module;
};

var instantiate = function (id) {
  var actual = defs[id];
  var dependencies = actual.deps;
  var definition = actual.defn;
  var len = dependencies.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances[i] = dem(dependencies[i]);
  var defResult = definition.apply(null, instances);
  if (defResult === undefined)
     throw 'module [' + id + '] returned undefined';
  actual.instance = defResult;
};

var def = function (id, dependencies, definition) {
  if (typeof id !== 'string')
    throw 'module id must be a string';
  else if (dependencies === undefined)
    throw 'no dependencies for ' + id;
  else if (definition === undefined)
    throw 'no definition function for ' + id;
  defs[id] = {
    deps: dependencies,
    defn: definition,
    instance: undefined
  };
};

var dem = function (id) {
  var actual = defs[id];
  if (actual === undefined)
    throw 'module [' + id + '] was undefined';
  else if (actual.instance === undefined)
    instantiate(id);
  return actual.instance;
};

var req = function (ids, callback) {
  var len = ids.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances.push(dem(ids[i]));
  callback.apply(null, callback);
};

var ephox = {};

ephox.bolt = {
  module: {
    api: {
      define: def,
      require: req,
      demand: dem
    }
  }
};

var define = def;
var require = req;
var demand = dem;
// this helps with minificiation when using a lot of global references
var defineGlobal = function (id, ref) {
  define(id, [], function () { return ref; });
};
/*jsc
["tinymce.plugins.link.Plugin","tinymce.core.PluginManager","tinymce.plugins.link.core.Actions","tinymce.plugins.link.ui.Controls","global!tinymce.util.Tools.resolve","tinymce.core.util.VK","tinymce.plugins.link.ui.Dialog","tinymce.plugins.link.core.OpenUrl","tinymce.plugins.link.core.Utils","tinymce.plugins.link.core.Settings","tinymce.core.util.Delay","tinymce.core.util.Tools","tinymce.core.util.XHR","global!RegExp","tinymce.core.dom.DOMUtils","tinymce.core.Env"]
jsc*/
defineGlobal("global!tinymce.util.Tools.resolve", tinymce.util.Tools.resolve);
/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.PluginManager',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.PluginManager');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.VK',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.util.VK');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.Delay',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.util.Delay');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.Tools',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.util.Tools');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.XHR',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.util.XHR');
  }
);

define(
  'tinymce.plugins.link.core.Settings',
  [

  ],
  function () {
    var assumeExternalTargets = function (editorSettings) {
      return typeof editorSettings.link_assume_external_targets === 'boolean' ? editorSettings.link_assume_external_targets : false;
    };

    var hasContextToolbar = function (editorSettings) {
      return typeof editorSettings.link_context_toolbar === 'boolean' ? editorSettings.link_context_toolbar : false;
    };

    var getLinkList = function (editorSettings) {
      return editorSettings.link_list;
    };

    var hasDefaultLinkTarget = function (editorSettings) {
      return typeof editorSettings.default_link_target === 'string';
    };

    var getDefaultLinkTarget = function (editorSettings) {
      return editorSettings.default_link_target;
    };

    var getTargetList = function (editorSettings) {
      return editorSettings.target_list;
    };

    var setTargetList = function (editor, list) {
      editor.settings.target_list = list;
    };

    var shouldShowTargetList = function (editorSettings) {
      return getTargetList(editorSettings) !== false;
    };

    var getRelList = function (editorSettings) {
      return editorSettings.rel_list;
    };

    var hasRelList = function (editorSettings) {
      return getRelList(editorSettings) !== undefined;
    };

    var getLinkClassList = function (editorSettings) {
      // Add a 'None' option to the beginning if it is not already present.
      if (typeof editorSettings.link_class_list[0] !== 'object') {
        // Using an object as opposed to a string so we can use an empty value.
        editorSettings.link_class_list.unshift({
          text: 'None',
          value: ''
        });
      }

      return editorSettings.link_class_list;
    };

    var hasLinkClassList = function (editorSettings) {
      return getLinkClassList(editorSettings) !== undefined;
    };

    var shouldShowLinkTitle = function (editorSettings) {
      return editorSettings.link_title !== false;
    };

    var allowUnsafeLinkTarget = function (editorSettings) {
      return typeof editorSettings.allow_unsafe_link_target === 'boolean' ? editorSettings.allow_unsafe_link_target : false;
    };

    var shouldShowLinkAnchor = function (editorSettings) {
      return editorSettings.link_anchor !== false;
    };

    return {
      assumeExternalTargets: assumeExternalTargets,
      hasContextToolbar: hasContextToolbar,
      getLinkList: getLinkList,
      hasDefaultLinkTarget: hasDefaultLinkTarget,
      getDefaultLinkTarget: getDefaultLinkTarget,
      getTargetList: getTargetList,
      setTargetList: setTargetList,
      shouldShowTargetList: shouldShowTargetList,
      getRelList: getRelList,
      hasRelList: hasRelList,
      getLinkClassList: getLinkClassList,
      hasLinkClassList: hasLinkClassList,
      shouldShowLinkTitle: shouldShowLinkTitle,
      allowUnsafeLinkTarget: allowUnsafeLinkTarget,
      shouldShowLinkAnchor: shouldShowLinkAnchor
    };
  }
);

defineGlobal("global!RegExp", RegExp);
/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.link.core.Utils',
  [
    'tinymce.core.util.Tools',
    'tinymce.plugins.link.core.Settings',
    'global!RegExp'
  ],
  function (Tools, Settings, RegExp) {

    var toggleTargetRules = function (rel, isUnsafe) {
      var rules = ['noopener'];
      var newRel = rel ? rel.split(/\s+/) : [];

      var toString = function (rel) {
        return Tools.trim(rel.sort().join(' '));
      };

      var addTargetRules = function (rel) {
        rel = removeTargetRules(rel);
        return rel.length ? rel.concat(rules) : rules;
      };

      var removeTargetRules = function (rel) {
        return rel.filter(function (val) {
          return Tools.inArray(rules, val) === -1;
        });
      };

      newRel = isUnsafe ? addTargetRules(newRel) : removeTargetRules(newRel);
      return newRel.length ? toString(newRel) : null;
    };


    var trimCaretContainers = function (text) {
      return text.replace(/\uFEFF/g, '');
    };


    var getAnchorElement = function (editor, selectedElm) {
      selectedElm = selectedElm || editor.selection.getStart();
      if (isImageFigure(selectedElm)) {
        // for an image conained in a figure we look for a link inside the selected element
        return editor.dom.select('a[href]', selectedElm)[0];
      } else {
        return editor.dom.getParent(selectedElm, 'a[href]');
      }
    };


    var getAnchorText = function (selection, anchorElm) {
      var text = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : selection.getContent({ format: 'text' });
      return trimCaretContainers(text);
    };


    var isLink = function (elm) {
      return elm && elm.nodeName === 'A' && elm.href;
    };

    var hasLinks = function (elements) {
      return Tools.grep(elements, isLink).length > 0;
    };


    var isOnlyTextSelected = function (html) {
      // Partial html and not a fully selected anchor element
      if (/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') == -1)) {
        return false;
      }

      return true;
    };


    var isImageFigure = function (node) {
      return node && node.nodeName === 'FIGURE' && /\bimage\b/i.test(node.className);
    };


    var link = function (editor, attachState) {
      return function (data) {
        editor.undoManager.transact(function () {
          var selectedElm = editor.selection.getNode();
          var anchorElm = getAnchorElement(editor, selectedElm);

          var linkAttrs = {
            href: data.href,
            target: data.target ? data.target : null,
            rel: data.rel ? data.rel : null,
            "class": data["class"] ? data["class"] : null,
            title: data.title ? data.title : null
          };

          if (data.source_type === 'internal') {
            linkAttrs['data-mce-asset-id'] = getChosenFromAssetChooser(editor).id;
            linkAttrs['data-mce-asset-type'] = getChosenFromAssetChooser(editor).type;
          }

          if (!Settings.hasRelList(editor.settings) && Settings.allowUnsafeLinkTarget(editor.settings) === false) {
            linkAttrs.rel = toggleTargetRules(linkAttrs.rel, linkAttrs.target == '_blank');
          }

          if (data.href === attachState.href) {
            attachState.attach();
            attachState = {};
          }

          if (anchorElm) {
            editor.focus();

            if (data.hasOwnProperty('text')) {
              if ("innerText" in anchorElm) {
                anchorElm.innerText = data.text;
              } else {
                anchorElm.textContent = data.text;
              }
            }

            editor.dom.setAttribs(anchorElm, linkAttrs);

            editor.selection.select(anchorElm);
            editor.undoManager.add();
          } else {
            if (isImageFigure(selectedElm)) {
              linkImageFigure(editor, selectedElm, linkAttrs);
            } else if (data.hasOwnProperty('text')) {
              editor.insertContent(editor.dom.createHTML('a', linkAttrs, editor.dom.encode(data.text)));
            } else {
              editor.execCommand('mceInsertLink', false, linkAttrs);
            }
          }
        });
      };
    };


    var unlink = function (editor) {
      return function () {
        editor.undoManager.transact(function () {
          var node = editor.selection.getNode();
          if (isImageFigure(node)) {
            unlinkImageFigure(editor, node);
          } else {
            editor.execCommand('unlink');
          }
        });
      };
    };


    var unlinkImageFigure = function (editor, fig) {
      var a, img;
      img = editor.dom.select('img', fig)[0];
      if (img) {
        a = editor.dom.getParents(img, 'a[href]', fig)[0];
        if (a) {
          a.parentNode.insertBefore(img, a);
          editor.dom.remove(a);
        }
      }
    };


    var linkImageFigure = function (editor, fig, attrs) {
      var a, img;
      img = editor.dom.select('img', fig)[0];
      if (img) {
        a = editor.dom.create('a', attrs);
        img.parentNode.insertBefore(a, img);
        a.appendChild(img);
      }
    };


    /**
     * Removes hash (#) symbols from given anchor text.
     *
     * @param {string} str anchor text to clean
     * @return {string}
     */
    var cleanAnchorText = function (str) {
      return str.replace(/\#/g, '');
    };


    /**
     * Gets the AssetChooser property from the provided editor.
     *
     * @param {object} editor - The context editor
     * @return {object}
     */
    var getAssetChooser = function (editor) {
      return editor.LinkAssetChooser;
    };


    /**
     * Gets the chosen asset property from the provided editor's AssetChooser.
     *
     * @param {object} editor - The context editor
     * @return {object}
     */
    var getChosenFromAssetChooser = function (editor) {
      return getAssetChooser(editor).getAssetFromChosen();
    };


    /**
     * Adds the provided AssetChooser property to the provided editor.
     *
     * @param {object} assetChooser - The AssetChooser to set
     * @param {object} editor - The context editor
     * @return {object}
     */
    var setAssetChooser = function (assetChooser, editor) {
      editor.LinkAssetChooser = assetChooser;
    };


    /**
     * Helper method that returns the global Cascade variable.
     *
     * @return {object}
     */
     /* global Cascade */
    var getGlobalCascadeVariable = function () {
      return Cascade;
    };


    /**
     * Helper method that returns the chooser field itself.
     *
     * @return {jQuery}
     */
     /* global $ */
    var getInternalLinkChooser = function () {
      return $(document.getElementById('chooser-linkedAssetId'));
    };


    /**
     * Helper method that returns the hidden input containing the internally
     * chosen asset's path.
     *
     * @return {DOMElement}
     */
    var getInternalLinkChooserPathFieldElement = function () {
      return document.getElementById('linkedAssetPath');
    };


    /**
     * Helper method that determines if a URL is internal (ie Cascade trackable) or external.
     * A URL is internal if one of the following conditions is true:
     * - starts with a leading slash (/)
     * - starts with the site:// prefix
     *
     * @param {string} url URL to analyze
     * @return {boolean}
     */
    var isInternalUrl = function (url) {
      return url.match(/^(?:site:\/\/|\/)\w/) !== null;
    };


    /**
     * Helper method that splits a URL by the first occurring hash symbol, and removes
     * any additional hash symbols to be safe.
     *
     * Note: If the URL is a single hash symbol, it will be retained.
     *
     * @param {string} url URL to split
     * @return {string[]}
     */
    var splitUrlByHash = function (url) {
      return url.match(/^#$|[^#]+/g) || [];
    };


    return {
      link: link,
      unlink: unlink,
      isLink: isLink,
      hasLinks: hasLinks,
      isOnlyTextSelected: isOnlyTextSelected,
      getAnchorElement: getAnchorElement,
      getAnchorText: getAnchorText,
      toggleTargetRules: toggleTargetRules,
      cleanAnchorText: cleanAnchorText,
      getAssetChooser: getAssetChooser,
      setAssetChooser: setAssetChooser,
      getChosenFromAssetChooser: getChosenFromAssetChooser,
      getGlobalCascadeVariable: getGlobalCascadeVariable,
      getInternalLinkChooser: getInternalLinkChooser,
      getInternalLinkChooserPathFieldElement: getInternalLinkChooserPathFieldElement,
      isInternalUrl: isInternalUrl,
      splitUrlByHash: splitUrlByHash
    };
  }
);

/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.link.ui.Dialog',
  [
    'tinymce.core.util.Delay',
    'tinymce.core.util.Tools',
    'tinymce.core.util.XHR',
    'tinymce.plugins.link.core.Utils',
    'tinymce.plugins.link.core.Settings'
  ],
  function (Delay, Tools, XHR, Utils, Settings) {
    var attachState = {};

    /**
     * Retrieves the HTML markup for the internal link chooser and calls the provided
     * callback function.
     *
     * The callback is necessary to create a synchronous method call which ensures
     * the AJAX completes before the link dialog is shown.
     *
     * @param callback method to call on AJAX success/error.
     * @return function
     */
    var getInternalLinkChooserFieldHtml = function (editor, callback) {
      var cascadeLinkChooserUrl = 'CONTEXT_PATH/linkpopup.act?href=<LINK_HREF>&currentSiteId=' + Utils.getGlobalCascadeVariable().Variables.get('currentSiteId');
      var selection = editor.selection;
      var dom = editor.dom;
      var selectedElm = selection.getNode();
      var anchorElm = dom.getParent(selectedElm, 'a[href]');
      var href = anchorElm ? dom.getAttrib(anchorElm, 'href') : '';

      // Leave the chooser empty if the URL is external (ie doesn't start with site:// or /).
      if (!Utils.isInternalUrl(href)) {
        href = '';
      }

      XHR.send({
        url: cascadeLinkChooserUrl.replace('<LINK_HREF>', encodeURIComponent(href)),
        error: function () {
          // In the event of an error, just return an empty string.
          callback(editor, '');
        },
        success: function (text) {
          callback(editor, text);
        }
      });
    };

    var buildListItems = function (inputList, itemCallback, startItems) {
      var truncateListItemText = function (str, n) {
        return str.length > n ? str.substr(0, n - 1) + '...' : str;
      };

      var appendItems = function (values, output) {
        var menuItem;
        output = output || [];

        Tools.each(values, function (item) {
          if (typeof item === 'string') {
            item = {
              text: item,
              value: item
            };
          }

          menuItem = {
            text: item.text || item.title
          };

          menuItem.text = truncateListItemText(menuItem.text, 50);

          if (item.menu) {
            menuItem.menu = appendItems(item.menu);
          } else {
            menuItem.value = item.value;

            if (itemCallback) {
              itemCallback(menuItem);
            }
          }

          output.push(menuItem);
        });

        return output;
      };

      return appendItems(inputList, startItems || []);
    };

    // Delay confirm since onSubmit will move focus
    var delayedConfirm = function (editor, message, callback) {
      var rng = editor.selection.getRng();

      Delay.setEditorTimeout(editor, function () {
        editor.windowManager.confirm(message, function (state) {
          editor.selection.setRng(rng);
          callback(state);
        });
      });
    };

    var showDialog = function (editor, typeAheadFieldHtml) {
      var data = {}, selection = editor.selection, dom = editor.dom, anchorElm, initialText;
      var win, onlyText, textListCtrl, relListCtrl, targetListCtrl, classListCtrl, linkTitleCtrl, value;
      var anchorCtrl, chooserElm, hrefCtrl, sourceTypeCtrl;

      /*
       * Toggles the visibility of the internal and external link controls
       * based on which checkbox is being clicked.
       */
      var toggleLinkFields = function () {
        var isTargetChecked = this.checked();
        var otherCheckbox = win.find('#' + (this.name() === 'source_type_internal' ? 'source_type_external' : 'source_type_internal'));

        // If clicking the same checkbox as the current source type, keep it checked and return.
        if (this.name() === 'source_type_' + data.source_type) {
          this.checked(true);
          return;
        }

        // Toggle the checked state of the two checkboxes.
        this.checked(isTargetChecked);
        otherCheckbox.checked(!isTargetChecked);

        // Toggle the visibility of the two fields and update the source type value.
        if (this.name() === 'source_type_internal' && this.checked()) {
          win.find('#internalLink').show();
          win.find('#externalLink').hide();
          data.source_type = 'internal';
        } else {
          win.find('#internalLink').hide();
          win.find('#externalLink').show();
          data.source_type = 'external';
        }

        updateText();
      };

      /*
       * For new links (ie no text was selected prior to clicking the link control), automatically copies the
       * internal or external link and anchor value over to the link text field.
       */
      var updateText = function () {
        if (!initialText && onlyText && !data.text) {
          var href = data.source_type === 'internal' ? Utils.getChosenFromAssetChooser(editor).path : win.find('#externalLink').value();
          var anchor = Utils.cleanAnchorText(win.find('#anchor').value());

          if (anchor !== '') {
            href += '#' + anchor;
          }

          this.parent().parent().find('#text')[0].value(href);
        }
      };

      /*
       * If the context is a TinyMCE control, automatically: copies anchor text over to
       * the anchor control if the control being changed is the external link control, or
       * automatically cleans up the value of the anchor control (ie removes hash signs)
       * if the control being changed is the anchor control.
       *
       * Attempts to update the link text field for new links without text.
       */
      var urlChange = function (e) {
        // Only run the following if the context element is a TinyMCE control.
        if (e.control && this.value()) {
          var splitUrl = Utils.splitUrlByHash(this.value());
          if (this.name() === 'externalLink') {
            // Update the href value.
            this.value(splitUrl[0]);

            // If a new anchor is present replace the existing anchor value.
            if (splitUrl[1]) {
              win.find('#anchor').value(splitUrl[1]);
            }
          } else if (this.name() === 'anchor') {
            // Update the sanitized anchor value (ie removal of # symbols).
            // Note: splitUrl will differ if a # symbol is present in the anchor value.
            this.value(splitUrl[0] || splitUrl[1]);
          }
        }

        updateText.call(this);
      };

      onlyText = Utils.isOnlyTextSelected(selection.getContent());
      anchorElm = Utils.getAnchorElement(editor);

      data.text = initialText = Utils.getAnchorText(editor.selection, anchorElm);
      data.href = anchorElm ? dom.getAttrib(anchorElm, 'href') : '';

      if (data.href === '#') {
        data.href = '';
      } else {
        var splitUrl = Utils.splitUrlByHash(data.href);

        if (splitUrl.length > 1) {
          data.anchor = splitUrl[1] || '';

          // If there is an anchor, replace the current href with the string before the fragment.
          if (data.anchor !== '') {
            data.href = splitUrl[0];
          }
        } else if (data.href.startsWith('#')) {
          // If the href starts with a #, splutUrl will contain a single value with the # removed.
          data.anchor = splitUrl[0];
          data.href = '';
        }
      }

      // Determine the source type based on the link's href value, or default to internal if empty.
      data.source_type = Utils.isInternalUrl(data.href) || data.href === '' ? 'internal' : 'external';

      if (anchorElm) {
        data.target = dom.getAttrib(anchorElm, 'target');
      } else if (Settings.hasDefaultLinkTarget(editor.settings)) {
        data.target = Settings.getDefaultLinkTarget(editor.settings);
      }

      if ((value = dom.getAttrib(anchorElm, 'rel'))) {
        data.rel = value;
      }

      if ((value = dom.getAttrib(anchorElm, 'class'))) {
        data['class'] = value;
      }

      if ((value = dom.getAttrib(anchorElm, 'title'))) {
        data.title = value;
      }

      // Initialize the external link control
      hrefCtrl = {
        name: 'externalLink',
        type: 'textbox',
        size: 40,
        label: 'Link',
        value: data.source_type === 'external' ? data.href : 'http://',
        onchange: urlChange,
        onkeyup: updateText
      };

      // If the type-ahead HTML generation didn't fail, create the internal/external toggler and separate URL controls.
      if (typeAheadFieldHtml) {
        sourceTypeCtrl = {
          type: 'container',
          label: 'Link Source',
          layout: 'flex',
          direction: 'row',
          align: 'center',
          spacing: 5,
          items: [
            {
              name: 'source_type_internal',
              type: 'checkbox',
              checked: data.source_type === 'internal',
              onclick: toggleLinkFields, text: 'Internal'
            },
            {
              name: 'source_type_external',
              type: 'checkbox',
              checked: data.source_type === 'external',
              onclick: toggleLinkFields,
              text: 'External'
            }
          ]
        };

        // Set the default visibility of the external URL control.
        hrefCtrl.hidden = data.source_type !== 'external';

        // Turn the control into a container, with the original added as one of the items.
        hrefCtrl = {
          type: 'container',
          name: 'linkContainer',
          label: 'Link',
          minHeight: 55,
          items: [
            hrefCtrl,
            {
              name: 'internalLink',
              type: 'container',
              hidden: data.source_type !== 'internal',
              html: typeAheadFieldHtml
            }
          ]
        };
      }

      if (Settings.shouldShowLinkAnchor(editor.settings)) {
        anchorCtrl = {
          name: 'anchor',
          type: 'textbox',
          label: 'Anchor',
          size: 40,
          onchange: urlChange,
          onkeyup: updateText
        };
      }

      if (onlyText) {
        textListCtrl = {
          name: 'text',
          type: 'textbox',
          size: 40,
          label: 'Text to display',
          onchange: function () {
            data.text = this.value();
          }
        };
      }

      if (Settings.shouldShowTargetList(editor.settings)) {
        if (Settings.getTargetList(editor.settings) === undefined) {
          Settings.setTargetList(editor, [
            { text: 'None', value: '' },
            { text: 'New window', value: '_blank' }
          ]);
        }

        targetListCtrl = {
          name: 'target',
          type: 'listbox',
          label: 'Target',
          values: buildListItems(Settings.getTargetList(editor.settings))
        };
      }

      if (Settings.hasRelList(editor.settings)) {
        relListCtrl = {
          name: 'rel',
          type: 'listbox',
          label: 'Rel',
          values: buildListItems(
            Settings.getRelList(editor.settings),
            function (item) {
              if (Settings.allowUnsafeLinkTarget(editor.settings) === false) {
                item.value = Utils.toggleTargetRules(item.value, data.target === '_blank');
              }
            }
          )
        };
      }

      if (Settings.hasLinkClassList(editor.settings)) {
        // If the link's initial class is not empty and not in the pre-defined list, add it so the user can retained the value.
        if (data['class'] && Settings.getLinkClassList(editor.settings).indexOf(data['class']) === -1) {
          Settings.getLinkClassList(editor.settings).push(data['class']);
        }

        classListCtrl = {
          name: 'class',
          type: 'listbox',
          label: 'Class',
          style: 'max-width:100%;', // Make sure the width of the listbox never extends past the width of the dialog.
          values: buildListItems(
            Settings.getLinkClassList(editor.settings),
            function (item) {
              if (item.value) {
                item.textStyle = function () {
                  return editor.formatter.getCssText({ inline: 'a', classes: [item.value] });
                };
              }
            }
          )
        };
      }

      if (Settings.shouldShowLinkTitle(editor.settings)) {
        linkTitleCtrl = {
          name: 'title',
          type: 'textbox',
          label: 'Title',
          value: data.title
        };
      }

      win = editor.windowManager.open({
        title: 'Insert link',
        data: data,
        body: [
          sourceTypeCtrl,
          hrefCtrl,
          anchorCtrl,
          textListCtrl,
          linkTitleCtrl,
          relListCtrl,
          targetListCtrl,
          classListCtrl
        ],
        onSubmit: function (e) {
          var assumeExternalTargets = Settings.assumeExternalTargets(editor.settings);
          var insertLink = Utils.link(editor, attachState);
          var removeLink = Utils.unlink(editor);

          var resultData = Tools.extend({}, data, e.data);
          /*eslint dot-notation: 0*/
          var href = resultData.href;

          if (resultData.source_type_internal) {
            var internalLinkValue = Utils.getChosenFromAssetChooser(editor).path;
            var crossSite = internalLinkValue.match(/(.*):([^\/].*)/);

            /*
             If the link is cross-site, append the site:// prefix. Otherwise,
             make sure it starts with a leading / to denote internal.
            */
            if (crossSite) {
              href = 'site://' + crossSite[1] + '/' + crossSite[2];
            } else if (internalLinkValue) {
              href = internalLinkValue.charAt(0) !== '/' ? '/' + internalLinkValue : internalLinkValue;
            } else {
              href = internalLinkValue;
            }
          } else {
            href = resultData.externalLink;
          }

          // If there is a anchor, append it onto the end of the final href value.
          if (resultData.anchor) {
            href += "#" + Utils.cleanAnchorText(resultData.anchor);
          }

          // If the link is still empty, just default to a # sign.
          if (href === '') {
            href = '#';
          }

          if (!href) {
            removeLink();
            return;
          }

          if (!onlyText || resultData.text === initialText) {
            delete resultData.text;
          }

          // Is email and not //user@domain.com
          if (href.indexOf('@') > 0 && href.indexOf('//') == -1 && href.indexOf('mailto:') == -1) {
            delayedConfirm(
              editor,
              'The URL you entered seems to be an email address. Do you want to add the required mailto: prefix?',
              function (state) {
                if (state) {
                  resultData.href = 'mailto:' + href;
                }
                insertLink(resultData);
              }
            );
            return;
          }

          // Is not protocol prefixed
          if ((assumeExternalTargets === true && !/^\w+:/i.test(href)) ||
            (assumeExternalTargets === false && /^\s*www[\.|\d\.]/i.test(href))) {
            delayedConfirm(
              editor,
              'The URL you entered seems to be an external link. Do you want to add the required http:// prefix?',
              function (state) {
                if (state) {
                  resultData.href = 'http://' + href;
                }
                insertLink(resultData);
              }
            );
            return;
          }

          resultData.href = href;
          insertLink(resultData);
        }
      });

      chooserElm = Utils.getInternalLinkChooser();
      Utils.setAssetChooser(chooserElm.assetChooser().data('cs.chooser'), editor);

      // Call urlChange on chooser clear and submission.
      chooserElm.on('clear.cs.chooser submit.cs.chooser.panel', function () {
        // Call the urlChange method with the context of the linkPath DOM Element.
        urlChange.call(Utils.getInternalLinkChooserPathFieldElement(), {});
      });
    };

    var open = function (editor) {
      getInternalLinkChooserFieldHtml(editor, showDialog);
    };

    return {
      open: open
    };
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.DOMUtils',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.dom.DOMUtils');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.Env',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.Env');
  }
);

/**
 * OpenUrl.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.link.core.OpenUrl',
  [
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.Env'
  ],
  function (DOMUtils, Env) {
    var appendClickRemove = function (link, evt) {
      document.body.appendChild(link);
      link.dispatchEvent(evt);
      document.body.removeChild(link);
    };

    var open = function (url) {
      // Chrome and Webkit has implemented noopener and works correctly with/without popup blocker
      // Firefox has it implemented noopener but when the popup blocker is activated it doesn't work
      // Edge has only implemented noreferrer and it seems to remove opener as well
      // Older IE versions pre IE 11 falls back to a window.open approach
      if (!Env.ie || Env.ie > 10) {
        var link = document.createElement('a');
        link.target = '_blank';
        link.href = url;
        link.rel = 'noreferrer noopener';

        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

        appendClickRemove(link, evt);
      } else {
        var win = window.open('', '_blank');
        if (win) {
          win.opener = null;
          var doc = win.document;
          doc.open();
          doc.write('<meta http-equiv="refresh" content="0; url=' + DOMUtils.DOM.encode(url) + '">');
          doc.close();
        }
      }
    };

    return {
      open: open
    };
  }
);
/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.link.core.Actions',
  [
    'tinymce.core.util.VK',
    'tinymce.plugins.link.ui.Dialog',
    'tinymce.plugins.link.core.OpenUrl',
    'tinymce.plugins.link.core.Utils',
    'tinymce.plugins.link.core.Settings'
  ],
  function (VK, Dialog, OpenUrl, Utils, Settings) {
    var getLink = function (editor, elm) {
      return editor.dom.getParent(elm, 'a[href]');
    };

    var getSelectedLink = function (editor) {
      return getLink(editor, editor.selection.getStart());
    };

    var getHref = function (elm) {
      // Returns the real href value not the resolved a.href value
      var href = elm.getAttribute('data-mce-href');
      return href ? href : elm.getAttribute('href');
    };

    /**
     * Returns the ID and type for the given link by using internal data attributes.
     *
     * @param {DOMElement} elm the context link
     * @returns {object}
     */
    var getAsset = function (elm) {
      var id = elm.getAttribute('data-mce-asset-id');
      var type = elm.getAttribute('data-mce-asset-type');
      return id && type ? { id: id, type: type } : {};
    };

    var isContextMenuVisible = function (editor) {
      var contextmenu = editor.plugins.contextmenu;
      return contextmenu ? contextmenu.isContextMenuVisible() : false;
    };

    var hasOnlyAltModifier = function (e) {
      return e.altKey === true && e.shiftKey === false && e.ctrlKey === false && e.metaKey === false;
    };

    var gotoLink = function (editor, a) {
      var ENTITY_OPEN_ACTION = 'CONTEXT_PATH/entity/open.act';
      if (a) {
        var href = getHref(a);
        if (/^#/.test(href)) {
          var targetEl = editor.$(href);
          if (targetEl.length) {
            editor.selection.scrollIntoView(targetEl[0], true);
          }
        } else if (Utils.isInternalUrl(href)) {
          var asset = getAsset(a);
          if (asset.id && asset.type) {
            OpenUrl.open(ENTITY_OPEN_ACTION + '?id=' + asset.id + '&type=' + asset.type);
          }
        } else {
          OpenUrl.open(a.href);
        }
      }
    };

    var openDialog = function (editor) {
      return function () {
        Dialog.open(editor);
      };
    };

    var gotoSelectedLink = function (editor) {
      return function () {
        gotoLink(editor, getSelectedLink(editor));
      };
    };

    var leftClickedOnAHref = function (editor) {
      return function (elm) {
        var sel, rng, node;
        if (Settings.hasContextToolbar(editor.settings) && !isContextMenuVisible(editor) && Utils.isLink(elm)) {
          sel = editor.selection;
          rng = sel.getRng();
          node = rng.startContainer;
          // ignore cursor positions at the beginning/end (to make context toolbar less noisy)
          if (node.nodeType == 3 && sel.isCollapsed() && rng.startOffset > 0 && rng.startOffset < node.data.length) {
            return true;
          }
        }
        return false;
      };
    };

    var setupGotoLinks = function (editor) {
      editor.on('click', function (e) {
        var link = getLink(editor, e.target);
        if (link && VK.metaKeyPressed(e)) {
          e.preventDefault();
          gotoLink(editor, link);
        }
      });

      editor.on('keydown', function (e) {
        var link = getSelectedLink(editor);
        if (link && e.keyCode === 13 && hasOnlyAltModifier(e)) {
          e.preventDefault();
          gotoLink(editor, link);
        }
      });
    };

    var toggleActiveState = function (editor) {
      return function () {
        var self = this;
        editor.on('nodechange', function (e) {
          self.active(!editor.readonly && !!Utils.getAnchorElement(editor, e.element));
        });
      };
    };

    var toggleViewLinkState = function (editor) {
      return function () {
        var self = this;

        var toggleVisibility = function (e) {
          if (Utils.hasLinks(e.parents)) {
            self.show();
          } else {
            self.hide();
          }
        };

        if (!Utils.hasLinks(editor.dom.getParents(editor.selection.getStart()))) {
          self.hide();
        }

        editor.on('nodechange', toggleVisibility);

        self.on('remove', function () {
          editor.off('nodechange', toggleVisibility);
        });
      };
    };

    return {
      openDialog: openDialog,
      gotoSelectedLink: gotoSelectedLink,
      leftClickedOnAHref: leftClickedOnAHref,
      setupGotoLinks: setupGotoLinks,
      toggleActiveState: toggleActiveState,
      toggleViewLinkState: toggleViewLinkState
    };
  }
);

/**
 * Controls.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.link.ui.Controls',
  [
    'tinymce.plugins.link.core.Actions',
    'tinymce.plugins.link.core.Utils'
  ],
  function (Actions, Utils) {

    var setupButtons = function (editor) {
      editor.addButton('link', {
        icon: 'link',
        tooltip: 'Insert/edit link',
        shortcut: 'Meta+K',
        onclick: Actions.openDialog(editor),
        onpostrender: Actions.toggleActiveState(editor)
      });

      editor.addButton('unlink', {
        icon: 'unlink',
        tooltip: 'Remove link',
        onclick: Utils.unlink(editor),
        onpostrender: Actions.toggleActiveState(editor)
      });

      if (editor.addContextToolbar) {
        editor.addButton('openlink', {
          icon: 'newtab',
          tooltip: 'Open link',
          onclick: Actions.gotoSelectedLink(editor)
        });
      }
    };

    var setupMenuItems = function (editor) {
      editor.addMenuItem('openlink', {
        text: 'Open link',
        icon: 'newtab',
        onclick: Actions.gotoSelectedLink(editor),
        onPostRender: Actions.toggleViewLinkState(editor),
        prependToContext: true
      });

      editor.addMenuItem('link', {
        icon: 'link',
        text: 'Link',
        shortcut: 'Meta+K',
        onclick: Actions.openDialog(editor),
        stateSelector: 'a[href]',
        context: 'insert',
        prependToContext: true
      });
    };

    var setupContextToolbars = function (editor) {
      if (editor.addContextToolbar) {
        editor.addContextToolbar(
          Actions.leftClickedOnAHref(editor),
          'openlink | link unlink'
        );
      }
    };

    return {
      setupButtons: setupButtons,
      setupMenuItems: setupMenuItems,
      setupContextToolbars: setupContextToolbars
    };
  }
);
/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.link.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.plugins.link.core.Actions',
    'tinymce.plugins.link.ui.Controls'
  ],
  function (PluginManager, Actions, Controls) {
    PluginManager.add('link', function (editor) {
      Controls.setupButtons(editor);
      Controls.setupMenuItems(editor);
      Controls.setupContextToolbars(editor);
      Actions.setupGotoLinks(editor);

      // Hook into the editor's preInit callback to add some custom parser filters.
      editor.on('preInit', function () {
        // Removes data atributes added for internal links when the editor's source code is requested.
        editor.serializer.addAttributeFilter('data-mce-asset-id', function (nodes, name) {
          var i = nodes.length, node;
          while (i--) {
            node = nodes[i];
            node.attr('data-mce-asset-id', null);
            node.attr('data-mce-asset-type', null);
          }
        });
      });

      editor.addShortcut('Meta+K', '', Actions.openDialog(editor));
      editor.addCommand('mceLink', Actions.openDialog(editor));
    });

    return function () { };
  }
);

dem('tinymce.plugins.link.Plugin')();
})();
