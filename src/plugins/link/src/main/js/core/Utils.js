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
    'global!document',
    'global!RegExp',
    'tinymce.core.util.Tools',
    'tinymce.plugins.link.api.Settings',
    'tinymce.plugins.cascade.core.Utils',
    'tinymce.plugins.cascade.core.CustomStyleFormatsUtils'
  ],
  function (document, RegExp, Tools, Settings, CascadeUtils, CustomStyleFormatsUtils) {
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
      if (/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') === -1)) {
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
            linkAttrs.rel = toggleTargetRules(linkAttrs.rel, linkAttrs.target === '_blank');
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

    /**
     * Helper method that converts the provided TinyMCE field into a jQuery object.
     * If the field passed does not exist, an empty jQuery object will be returned.
     *
     * @param {tinymce.ui.Control} tinymceField
     * @return {jQuery}
     */
     /* global $ */
    var convertTinyMCEFieldToJqueryObject = function (tinymceField) {
      var element = tinymceField ? tinymceField.getEl() : null;
      return $(element);
    };

    /**
     * Helper method that generates a string containing the enabled DAM integrations
     * based on the given editor's settings. If there are more than one enabled, they
     * will be joined with ' or '.
     *
     * @param {tinymce.Editor} editor
     * @return {string}
     */
    var generateEnabledDAMIntegrationsLabelFromEditorSettings = function (editor) {
      var enabledIntegrationLabels = [];

      if (editor.settings.dam_widen_enabled) {
        enabledIntegrationLabels.push('Widen Collective');
      }

      if (editor.settings.dam_webdam_enabled) {
        enabledIntegrationLabels.push('Webdam');
      }

      return enabledIntegrationLabels.join(' or ');
    };

   /**
    * Helper method that returns a string containing the source type (internal or external) of the link
    * based on the href or given editor's settings.
    *
    * @param {string}
    * @param {tinymce.Editor} editor
    * @return {string}
    */
    var getSourceType = function (href, editor) {
      if (Settings.isExternalOnly(editor)) {
        return 'external';
      }

      //Has an internal Url or none at all, default to internal
      if (isInternalUrl(href) || href === '') {
        return 'internal';
      } else {
        return 'external';
      }
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
      splitUrlByHash: splitUrlByHash,
      convertTinyMCEFieldToJqueryObject: convertTinyMCEFieldToJqueryObject,
      generateEnabledDAMIntegrationsLabelFromEditorSettings: generateEnabledDAMIntegrationsLabelFromEditorSettings,
      getSourceType: getSourceType
    };
  }
);
