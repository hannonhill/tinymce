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
  'tinymce.plugins.cascadelive.core.Nodes',
  [
    'tinymce.core.html.Node',
    'tinymce.core.Env'
  ],
  function (Node, Env) {
    var embedToPlaceHolderConverter = function (editor) {
      return function (nodes) {
        var i = nodes.length;
        var node, nodeSrc, placeHolder;

        while (i--) {
          node = nodes[i];
          if (!node.parent) {
            continue;
          }

          // Make sure we're dealing with a script tag with a src attribute containing 'clive.cloud'
          nodeSrc = node.attr('src') || '';
          if (nodeSrc.indexOf('clive.cloud') === -1) {
            continue;
          }

          // Create the placeholder image tag and record the embed code information as data attributes.
          placeHolder = new Node('img', 1);
          placeHolder.shortEnded = true;
          placeHolder.attr({
            width: '100%',
            height: '250',
            style: 'background-image:url(\'CONTEXT_PATH/assets/img/logo-cascadelive.svg\');background-size:25%;',
            src: Env.transparentSrc,
            'data-mce-placeholder': '',
            'data-mce-object-class': node.attr('class'),
            'data-mce-object-style': node.attr('style'),
            'data-mce-cascadelive-src': node.attr('src'),
            'class': 'mce-object mce-object-cascadelive'
          });

          // Replace the div tag with the new placeholder.
          node.replace(placeHolder);
        }
      };
    };

    var placeHolderToEmbedConverter = function (editor) {
      return function (nodes, name) {
        var i = nodes.length, node, realElm;
        var cascadeLiveSrc;

        while (i--) {
          node = nodes[i];
          if (!node.parent) {
            continue;
          }

          // Make sure the required attributes are not empty.
          cascadeLiveSrc = node.attr('data-mce-cascadelive-src') || '';
          if (cascadeLiveSrc === '') {
            continue;
          }

          // Create the script tag for the embed.
          realElm = new Node('script', 1);
          realElm.attr({
            'class': node.attr('data-mce-object-class') || null,
            style: node.attr('data-mce-object-style') || null,
            src: cascadeLiveSrc,
            async: 'true'
          });

          // Replace the placeholder with the Cascade Live embed (i.e. script).
          node.replace(realElm);
        }
      };
    };

    /**
     * Helper method that handles selecting the Cascade Live placeholder after insertion.
     *
     * @param {tinymce.Editor} editor
     * @param {Element[]} beforeObjects - Array of matched elements
     */
    var selectCascadeLivePlaceholder = function (editor, beforeObjects) {
      var i;
      var y;
      var afterObjects = editor.dom.select('img[data-mce-cascadelive-src]');

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
     * @param {string} html
     * @return {jQuery}
     */
    var handleInsertCascadeLiveEmbedHtml = function (editor, html) {
      var beforeObjects = editor.dom.select('img[data-mce-cascadelive-src]');

      editor.insertContent(html);
      selectCascadeLivePlaceholder(editor, beforeObjects);
      editor.nodeChanged();
    };

    return {
      embedToPlaceHolderConverter: embedToPlaceHolderConverter,
      placeHolderToEmbedConverter: placeHolderToEmbedConverter,
      handleInsertCascadeLiveEmbedHtml: handleInsertCascadeLiveEmbedHtml
    };
  }
);
