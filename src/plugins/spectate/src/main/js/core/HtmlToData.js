/**
 * HtmlToData.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.spectate.core.HtmlToData',
  [
    'tinymce.core.util.Tools',
    'tinymce.core.html.SaxParser'
  ],
  function (Tools, SaxParser) {
    var htmlToData = function (html) {
      var data = {};

      new SaxParser({
        validate: false,
        start: function (name, attrs) {
          if (name === "div") {
            data = Tools.extend(attrs.map, data);
          }
        }
      }).parse(html);

      data.spectateform = data['data-spectate-form'];

      return data;
    };

    return {
      htmlToData: htmlToData
    };
  }
);
