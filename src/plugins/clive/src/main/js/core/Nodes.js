/**
 * Nodes.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.clive.core.Nodes',
  [
    'tinymce.core.html.Node',
    'tinymce.core.Env'
  ],
  function (Node, Env) {
    var embedToPlaceHolderConverter = function (editor) {
      return function (nodes) {
        var i = nodes.length;
        var node, nodeSrc, nodeDataCliveId, nodeDataCliveType, clivePlaceHolderImg;

        while (i--) {
          node = nodes[i];
          if (!node.parent) {
            continue;
          }

          nodeSrc = node.attr('src') || '';
          nodeDataCliveId = node.attr('data-clive-id') || '';
          nodeDataCliveType = node.attr('data-clive-type') || '';

          // Make sure we're dealing with a script tag with required src and data-clive attributes.
          if (!nodeSrc || !nodeDataCliveId || !nodeDataCliveType) {
            continue;
          }

          // Create the placeholder image tag and record the embed code information as data attributes.
          clivePlaceHolderImg = new Node('img', 1);
          clivePlaceHolderImg.shortEnded = true;
          clivePlaceHolderImg.attr({
            width: '100%',
            height: '250',
            style: 'background-image:url(\'CONTEXT_PATH/assets/img/logo-clive.svg\');background-size:25%;',
            src: Env.transparentSrc,
            'data-mce-placeholder': 'true',
            'data-mce-object-class': node.attr('class'),
            'data-mce-object-style': node.attr('style'),
            'data-mce-clive-src': nodeSrc,
            'data-mce-clive-id': nodeDataCliveId,
            'data-mce-clive-type': nodeDataCliveType,
            'class': 'mce-object mce-object-clive'
          });

          // Replace the embed/script tag with the new placeholder.
          node.replace(clivePlaceHolderImg);
        }
      };
    };

    var placeHolderToEmbedConverter = function (editor) {
      return function (nodes, name) {
        var i = nodes.length, node, cliveScriptElm;
        var cliveSrc, cliveDataId, cliveDataType;

        while (i--) {
          node = nodes[i];
          if (!node.parent) {
            continue;
          }

          cliveSrc = node.attr('data-mce-clive-src') || '';
          cliveDataId = node.attr('data-mce-clive-id') || '';
          cliveDataType = node.attr('data-mce-clive-type') || '';

          // Make sure the required src and data-mce-clive attributes are not empty.
          if (!cliveSrc || !cliveDataId || !cliveDataType) {
            continue;
          }

          // Create the script tag for the embed.
          cliveScriptElm = new Node('script', 1);
          cliveScriptElm.attr({
            'class': node.attr('data-mce-object-class') || null,
            style: node.attr('data-mce-object-style') || null,
            src: cliveSrc,
            'data-clive-id': cliveDataId,
            'data-clive-type': cliveDataType,
            async: 'true'
          });

          // Replace the placeholder with the Clive embed (i.e. script).
          node.replace(cliveScriptElm);
        }
      };
    };

    /**
     * Helper method that handles selecting the Clive placeholder after insertion.
     *
     * @param {tinymce.Editor} editor
     * @param {Element[]} beforeObjects - Array of matched elements
     */
    var selectClivePlaceholder = function (editor, beforeObjects) {
      var i;
      var y;
      var afterObjects = editor.dom.select('img[data-mce-clive-src]');

      // Find new image placeholder so we can select it
      for (i = 0; i < beforeObjects.length; i++) {
        for (y = afterObjects.length - 1; y >= 0; y--) {
          if (beforeObjects[i] === afterObjects[y]) {
            afterObjects.splice(y, 1);
          }
        }
      }

      editor.selection.select(afterObjects[0]);
    };

    /**
     * Helper method that handles inserting the provided HTML into the editor and selecting the resulting placeholder.
     *
     * @param {tinymce.Editor} editor
     * @param {object} cliveSelectionData
     * @return {jQuery}
     */
    var handleInsertCliveEmbedHtml = function (editor, cliveSelectionData) {
      var beforeObjects = editor.dom.select('img[data-mce-clive-src]');
      var cliveUrl = cliveSelectionData.embed_link || '';
      var cliveAssetId = cliveSelectionData.id || '';
      var cliveAssetType = cliveSelectionData.type || '';
      var html = '';

      if (!cliveUrl || !cliveAssetId || !cliveAssetType) {
        return;
      }

      html = '<script src="' + cliveUrl + '" data-clive-id="' + cliveAssetId + '" data-clive-type="' + cliveAssetType + '" async="true"></script>';

      editor.insertContent(html);
      selectClivePlaceholder(editor, beforeObjects);
      editor.nodeChanged();
    };

    return {
      embedToPlaceHolderConverter: embedToPlaceHolderConverter,
      placeHolderToEmbedConverter: placeHolderToEmbedConverter,
      handleInsertCliveEmbedHtml: handleInsertCliveEmbedHtml
    };
  }
);
