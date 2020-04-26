/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.embeddedblocks.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.plugins.embeddedblocks.core.Convert',
    'tinymce.plugins.embeddedblocks.core.LoadCSS',
    'tinymce.plugins.embeddedblocks.ui.Buttons',
    'tinymce.plugins.embeddedblocks.api.Commands'
  ],
  function (PluginManager, Convert, LoadCSS, Buttons, Commands) {

    PluginManager.add('embeddedblocks', function (editor, pluginUrl) {
      Convert.setup(editor);
      Commands.register(editor);
      Buttons.register(editor);

      if (editor.settings.embeddedblocks_css) {
        editor.on('init', function () {
          LoadCSS.load(editor.getDoc(), editor.settings.embeddedblocks_css);
        });
      }
    });

    return function () { };
  }
);
