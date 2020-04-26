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
  'tinymce.plugins.embeddedblocks.core.Utils',
  [
    'global!$',
    'global!Cascade'
  ],
  function ($, Cascade) {
    /**
     * Gets the AssetChooser property from the provided editor.
     *
     * @param {object} editor - The context editor
     * @return {object}
     */
    var getBlockAssetChooser = function (editor) {
      return editor.BlockAssetChooser;
    };

    /**
     * Adds the provided assetChooser property to the provided editor.
     *
     * @param {object} assetChooser - The AssetChooser to set
     * @param {object} editor - The context editor
     * @return {object}
     */
    var setBlockAssetChooser = function (assetChooser, editor) {
      editor.BlockAssetChooser = assetChooser;
    };

    /**
     * Gets the chosen asset property from the provided editor's AssetChooser.
     *
     * @param {object} editor - The context editor
     * @return {object}
     */
    var getChosenFromAssetChooser = function (editor) {
      return getBlockAssetChooser(editor).getAssetFromChosen();
    };

    /**
     * Helper method that returns the global Cascade variable.
     *
     * @return {object}
     */
    var getGlobalCascadeVariable = function () {
      return Cascade;
    };

    /**
     * Helper method that returns the chooser field itself.
     *
     * @return {jQuery}
     */
    var getInternalBlockChooser = function () {
      return $(document.getElementById('chooser-blockId'));
    };


    /**
     * Helper method that returns the hidden input containing the internally
     * chosen asset's path.
     *
     * @return {DOMElement}
     */
    var getInternalBlockChooserPathFieldElement = function () {
      return document.getElementById('blockPath');
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
     * Helper method that converts the select block into a [system-asset:embedded-block] pseudo tag.
     *
     * @param {tinymce.Editor} editor
     * @return {string} The resulting pseudo tag
     */
    var chosenBlockToPseudoTag = function (editor) {
      var internalSrcValue = getChosenFromAssetChooser(editor).path;
      var crossSite = internalSrcValue.match(/(.*):([^\/].*)/);

      if (crossSite.length !== 3) {
        return '';
      }

      var pathBuilder = ['[system-asset:embedded-block]'];

      if (crossSite) {
        pathBuilder.push('site://' + crossSite[1] + '/' + crossSite[2]);
      } else {
        pathBuilder.push(internalSrcValue);
      }

      pathBuilder.push('[/system-asset:embedded-block]');

      return pathBuilder.join('');
    };

    return {
      chosenBlockToPseudoTag: chosenBlockToPseudoTag,
      getBlockAssetChooser: getBlockAssetChooser,
      getGlobalCascadeVariable: getGlobalCascadeVariable,
      getInternalBlockChooser: getInternalBlockChooser,
      getInternalBlockChooserPathFieldElement: getInternalBlockChooserPathFieldElement,
      isInternalUrl: isInternalUrl,
      setBlockAssetChooser: setBlockAssetChooser
    };
  }
);
