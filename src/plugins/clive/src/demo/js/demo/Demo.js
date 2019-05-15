/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0 */

define(
  'tinymce.plugins.clive.demo.Demo',
  [
    'tinymce.core.EditorManager',
    'tinymce.plugins.code.Plugin',
    'tinymce.plugins.clive.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (EditorManager, CodePlugin, ClivePlugin, ModernTheme) {
    return function () {
      CodePlugin();
      ClivePlugin();
      ModernTheme();

      EditorManager.init({
        selector: "textarea.tinymce",
        theme: "modern",
        skin_url: "../../../../../skins/lightgray/dist/lightgray",
        plugins: "clive code",
        toolbar: "clive code",
        media_dimensions: false,
        height: 600
      });
    };
  }
);
