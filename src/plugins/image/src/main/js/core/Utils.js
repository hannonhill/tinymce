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
    'tinymce.plugins.image.api.Settings',
    'global!Math',
    'global!document',
    'global!window'
  ],
  function (Settings, Math, document, window) {

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

    /**
     * Helper method that removes the instance URL from a given source, in case it was added by the browser, i.e. when an internal image is repositioned
     */
    var removeOriginFromSrc = function (src) {
      if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
      }

      var origin = window.location.origin;

      return src.replace(origin, "");
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
    * Helper method that returns a string containing the source type (internal or external) of the image
    * based on the image source or given editor's settings.
    *
    * @param {object} imageElement
    * @param {string} imageSource
    * @param {tinymce.Editor} editor
    * @return {string}
    */
    var getSourceType = function (imageElement, imageSource, editor) {
      if (Settings.isExternalOnly(editor)) {
        return 'external';
      }

      //default to internal images
      if (imageElement === null || isInternalUrl(imageSource)) {
        return 'internal';
      } else {
        return 'external';
      }
    };

    return {
      getImageSize: getImageSize,
      removePixelSuffix: removePixelSuffix,
      addPixelSuffix: addPixelSuffix,
      mergeMargins: mergeMargins,
      getAssetChooser: getAssetChooser,
      getChosenFromAssetChooser: getChosenFromAssetChooser,
      setAssetChooser: setAssetChooser,
      getInternalLinkChooser: getInternalLinkChooser,
      getInternalLinkChooserPathFieldElement: getInternalLinkChooserPathFieldElement,
      internalPathToRenderFileURL: internalPathToRenderFileURL,
      isInternalUrl: isInternalUrl,
      generateEnabledDAMIntegrationsLabelFromEditorSettings: generateEnabledDAMIntegrationsLabelFromEditorSettings,
      getSourceType: getSourceType,
      removeOriginFromSrc: removeOriginFromSrc
    };
  }
);
