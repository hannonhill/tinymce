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
  'tinymce.plugins.image.core.Nodes',
  [
    'tinymce.core.html.Node',
    'tinymce.core.Env',
    'global!window'
  ],
    function (Node, Env, window) {
      var fixBadInternalSrc = function (editor) {
        return function (nodes, name) {
          var instanceHost = getInstanceHost();

          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var imgSrc = node.attr('src');

            if (!imgSrc.startsWith(instanceHost)) {
              continue;
            }

            node.attr('src', removeInstanceHostFromSrc(imgSrc));
          }
        };

      };

    /**
     * Helper method that removes the instance URL from a given source, in case it was added by the browser, i.e. when an internal image is repositioned
     */
      var removeInstanceHostFromSrc = function (src) {
        if (!window.location.origin) {
          window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        }

        var origin = window.location.origin;

        if (src.startsWith(origin)) {
          return src.replace(origin, "");
        }
      };

      var getInstanceHost = function () {
        if (!window.location.origin) {
          window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        }

        return window.location.origin;
      };

      return {
        fixBadInternalSrc: fixBadInternalSrc,
        removeInstanceHostFromSrc: removeInstanceHostFromSrc,
        getInstanceHost: getInstanceHost
      };
    }
  );