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
  'tinymce.plugins.spectate.core.Nodes',
  [
    'tinymce.core.html.Node',
    'tinymce.core.Env'
  ],
  function (Node, Env) {
    var placeHolderConverter = function (editor) {
      return function (nodes) {
        var i = nodes.length;
        var node, nodeClass, fScriptTextNode, placeHolder;

        while (i--) {
          node = nodes[i];
          if (!node.parent) {
            continue;
          }

          // Make sure we're dealing with a div with the 'spectate-form' class
          nodeClass = node.attr('class') || '';
          if (nodeClass.indexOf('spectate-form') === -1) {
            continue;
          }

          // Get the text contents of script element, which may be wrapped in a p depending on how the embed code was inserted (ie button vs html editor).
          // getAll('#text') will return the text content of the script tag at either level.
          fScriptTextNode = node.next.getAll('#text')[0] || null;

          // Test to see if a text node was returned and the value contains the string "spectate" just to be safe.
          if (!fScriptTextNode || fScriptTextNode.value.indexOf('spectate') === -1) {
            continue;
          }

          // Remove the following node, which should be the script portion of the embed code.
          node.next.remove();

          // Create the placeholder image tag and record the embed code information as data attributes.
          placeHolder = new Node('img', 1);
          placeHolder.shortEnded = true;
          placeHolder.attr({
            width: '100%',
            height: node.attr('data-spectate-form-height') || '500',
            style: 'background-image:url(\'CONTEXT_PATH/assets/img/logo-spectate-dark.svg\');background-size:25%;',
            src: Env.transparentSrc,
            'data-mce-placeholder': '',
            'data-mce-object-class': node.attr('class'),
            'data-mce-object-style': node.attr('style'),
            'data-mce-spectate-domain': node.attr('data-spectate-domain'),
            'data-mce-spectate-form': node.attr('data-spectate-form'),
            'data-mce-spectate-path': node.attr('data-spectate-path'),
            'data-mce-spectate-fscript': escape(fScriptTextNode.value),
            'class': 'mce-object mce-object-spectate'
          });

          // Replace the div tag with the new placeholder.
          node.replace(placeHolder);
        }
      };
    };

    return {
      placeHolderConverter: placeHolderConverter
    };
  }
);
