/**
 * Convert.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.embeddedblocks.core.Convert',
  [
    'tinymce.core.html.Node',
    'tinymce.core.util.Tools'
  ],
  function (Node, Tools) {
    var htmlToPseudoTag = function (s) {
      s = Tools.trim(s);

      var rep = function (re, str) {
        s = s.replace(re, str);
      };

      // example: <span class="mce-object-embeddedblock"> to [system-asset:embedded-block]
      rep(/<span class=\"mce-object-embedded-block\">(.*?)<\/span>/gi, "[system-asset:embedded-block]$1[/system-asset:embedded-block]");

      return s;
    };

    var pseudoTagToHtml = function (s) {
      s = Tools.trim(s);

      var rep = function (re, str) {
        s = s.replace(re, str);
      };

      // example: [system-asset:embedded-block] to <span class="mce-object-embeddedblock">
      rep(/\[system-asset:embedded-block\](.*?)\[\/system-asset:embedded-block\]/gi, "<span class=\"mce-object-embeddedblock\">$1</span>&nbsp;");

      return s;
    };

    var setup = function (editor) {
      editor.on('beforeSetContent', function (e) {
        e.content = pseudoTagToHtml(e.content);
      });

      editor.on('preInit', function () {
        // Replaces placeholder images with Spectate form's embed code.
        editor.serializer.addNodeFilter('span', function (nodes, name) {
          var i = nodes.length, node, nodeInnerTextNode, newPseudoTagTextNode;
          var blockPath;

          while (i--) {
            node = nodes[i];
            if (!node.parent || node.className.indexOf('mce-object-embeddedblock') === -1) {
              continue;
            }

            nodeInnerTextNode = node.firstChild;

            if (nodeInnerTextNode.type !== 3 || !nodeInnerTextNode.value) {
              continue;
            }

            blockPath = nodeInnerTextNode.value;
            var crossSite = blockPath.match(/(.*):([^\/].*)/);
            var pathBuilder = ['[system-asset:embedded-block]'];

            if (crossSite) {
              pathBuilder.push('site://' + crossSite[1] + '/' + crossSite[2]);
            } else {
              pathBuilder.push(blockPath);
            }

            pathBuilder.push('[/system-asset:embedded-block]');

            // Create the text node for the script tag's content.
            newPseudoTagTextNode = new Node('#text', 3);
            newPseudoTagTextNode.raw = true;
            newPseudoTagTextNode.value = unescape(pathBuilder.join(''));

            // Replace the placeholder with the text node.
            node.replace(newPseudoTagTextNode);
          }
        });
      });

      editor.on('postProcess', function (e) {
        if (e.set) {
          e.content = pseudoTagToHtml(e.content);
        }

        if (e.get) {
          e.content = htmlToPseudoTag(e.content);
        }
      });
    };

    return {
      setup: setup
    };
  }
);
