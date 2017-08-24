/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * @class tinymce.image.core.Utils
 * @private
 */
define(
  'tinymce.plugins.image.core.Utils',
  [
    'tinymce.core.util.Tools',
    'global!Math',
    'global!document'
  ],
  function (Tools, Math, document) {

    var getImageSize = function (url, callback) {
      var img = document.createElement('img');

      function done(width, height) {
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }

        callback({ width: width, height: height });
      }

      img.onload = function () {
        done(Math.max(img.width, img.clientWidth), Math.max(img.height, img.clientHeight));
      };

      img.onerror = function () {
        done();
      };

      var style = img.style;
      style.visibility = 'hidden';
      style.position = 'fixed';
      style.bottom = style.left = 0;
      style.width = style.height = 'auto';

      document.body.appendChild(img);
      img.src = url;
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

    var removePixelSuffix = function (value) {
      if (value) {
        value = value.replace(/px$/, '');
      }
      return value;
    };

    var addPixelSuffix = function (value) {
      if (value.length > 0 && /^[0-9]+$/.test(value)) {
        value += 'px';
      }
      return value;
    };

    var mergeMargins = function (css) {
      if (css.margin) {

        var splitMargin = css.margin.split(" ");

        switch (splitMargin.length) {
          case 1: //margin: toprightbottomleft;
            css['margin-top'] = css['margin-top'] || splitMargin[0];
            css['margin-right'] = css['margin-right'] || splitMargin[0];
            css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
            css['margin-left'] = css['margin-left'] || splitMargin[0];
            break;
          case 2: //margin: topbottom rightleft;
            css['margin-top'] = css['margin-top'] || splitMargin[0];
            css['margin-right'] = css['margin-right'] || splitMargin[1];
            css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
            css['margin-left'] = css['margin-left'] || splitMargin[1];
            break;
          case 3: //margin: top rightleft bottom;
            css['margin-top'] = css['margin-top'] || splitMargin[0];
            css['margin-right'] = css['margin-right'] || splitMargin[1];
            css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
            css['margin-left'] = css['margin-left'] || splitMargin[1];
            break;
          case 4: //margin: top right bottom left;
            css['margin-top'] = css['margin-top'] || splitMargin[0];
            css['margin-right'] = css['margin-right'] || splitMargin[1];
            css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
            css['margin-left'] = css['margin-left'] || splitMargin[3];
        }
        delete css.margin;
      }
      return css;
    };

    /**
     * Gets the AssetChooser property from the provided editor.
     *
     * @param {object} editor - The context editor
     * @return {object}
     */
    var getAssetChooser = function (editor) {
      return editor.ImageAssetChooser;
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
      editor.ImageAssetChooser = assetChooser;
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
      return $(document.getElementById('chooser-imageId'));
    };


    /**
     * Helper method that returns the hidden input containing the internally
     * chosen asset's path.
     *
     * @return {DOMElement}
     */
    var getInternalLinkChooserPathFieldElement = function () {
      return document.getElementById('imagePath');
    };

    /**
     * Turns an internal cache path into a render file path.
     *
     * Example: "/path/to/image.jpg" => "/render/file.act?path=/path/to/image.jpg"
     *
     * @param {string} path Path to convert to a render URL
     * @return {string}
     */
    var internalPathToRenderFileURL = function (path) {
      return path ? 'CONTEXT_PATH/render/file.act?path=' + encodeURI(path) : '';
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

    return {
      getImageSize: getImageSize,
      buildListItems: buildListItems,
      removePixelSuffix: removePixelSuffix,
      addPixelSuffix: addPixelSuffix,
      mergeMargins: mergeMargins,
      getAssetChooser: getAssetChooser,
      getChosenFromAssetChooser: getChosenFromAssetChooser,
      setAssetChooser: setAssetChooser,
      getGlobalCascadeVariable: getGlobalCascadeVariable,
      getInternalLinkChooser: getInternalLinkChooser,
      getInternalLinkChooserPathFieldElement: getInternalLinkChooserPathFieldElement,
      internalPathToRenderFileURL: internalPathToRenderFileURL,
      isInternalUrl: isInternalUrl
    };
  }
);
