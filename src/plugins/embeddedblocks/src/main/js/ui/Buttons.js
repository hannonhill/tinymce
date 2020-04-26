/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.embeddedblocks.ui.Buttons',
  [
    'tinymce.plugins.embeddedblocks.ui.Dialog'
  ],
  function (Dialog) {
    var register = function (editor) {
      editor.addButton('embeddedblocks', {
        icon: 'block',
        tooltip: 'Embed Block',
        classes: 'embeddedblock-chooser',
        onclick: Dialog(editor).open,
        stateSelector: 'span.mce-object-embeddedblock'
      });

      editor.addMenuItem('embeddedblocks', {
        icon: 'block',
        text: 'Embed Block',
        classes: 'embeddedblock-chooser',
        onclick: Dialog(editor).open,
        context: 'insert',
        prependToContext: true
      });
    };

    return {
      register: register
    };
  }
);
