/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.link.core.Actions',
  [
    'tinymce.core.util.VK',
    'tinymce.plugins.link.api.Settings',
    'tinymce.plugins.link.core.OpenUrl',
    'tinymce.plugins.link.core.Utils',
    'tinymce.plugins.link.ui.Dialog'
  ],
  function (VK, Settings, OpenUrl, Utils, Dialog) {
    var getLink = function (editor, elm) {
      return editor.dom.getParent(elm, 'a[href]');
    };

    var getSelectedLink = function (editor) {
      return getLink(editor, editor.selection.getStart());
    };

    var getHref = function (elm) {
      // Returns the real href value not the resolved a.href value
      var href = elm.getAttribute('data-mce-href');
      return href ? href : elm.getAttribute('href');
    };

    /**
     * Returns the ID and type for the given link by using internal data attributes.
     *
     * @param {DOMElement} elm the context link
     * @returns {object}
     */
    var getAsset = function (elm) {
      var id = elm.getAttribute('data-mce-asset-id');
      var type = elm.getAttribute('data-mce-asset-type');
      return id && type ? { id: id, type: type } : {};
    };

    var isContextMenuVisible = function (editor) {
      var contextmenu = editor.plugins.contextmenu;
      return contextmenu ? contextmenu.isContextMenuVisible() : false;
    };

    var hasOnlyAltModifier = function (e) {
      return e.altKey === true && e.shiftKey === false && e.ctrlKey === false && e.metaKey === false;
    };

    var gotoLink = function (editor, a) {
      var ENTITY_OPEN_ACTION = 'CONTEXT_PATH/entity/open.act';
      if (a) {
        var href = getHref(a);
        if (/^#/.test(href)) {
          var targetEl = editor.$(href);
          if (targetEl.length) {
            editor.selection.scrollIntoView(targetEl[0], true);
          }
        } else if (Utils.isInternalUrl(href)) {
          var asset = getAsset(a);
          if (asset.id && asset.type) {
            OpenUrl.open(ENTITY_OPEN_ACTION + '?id=' + asset.id + '&type=' + asset.type);
          }
        } else {
          OpenUrl.open(a.href);
        }
      }
    };

    var openDialog = function (editor) {
      return function () {
        Dialog.open(editor);
      };
    };

    var gotoSelectedLink = function (editor) {
      return function () {
        gotoLink(editor, getSelectedLink(editor));
      };
    };

    var leftClickedOnAHref = function (editor) {
      return function (elm) {
        var sel, rng, node;
        if (Settings.hasContextToolbar(editor.settings) && !isContextMenuVisible(editor) && Utils.isLink(elm)) {
          sel = editor.selection;
          rng = sel.getRng();
          node = rng.startContainer;
          // ignore cursor positions at the beginning/end (to make context toolbar less noisy)
          if (node.nodeType === 3 && sel.isCollapsed() && rng.startOffset > 0 && rng.startOffset < node.data.length) {
            return true;
          }
        }
        return false;
      };
    };

    var setupGotoLinks = function (editor) {
      editor.on('click', function (e) {
        var link = getLink(editor, e.target);
        if (link && VK.metaKeyPressed(e)) {
          e.preventDefault();
          gotoLink(editor, link);
        }
      });

      editor.on('keydown', function (e) {
        var link = getSelectedLink(editor);
        if (link && e.keyCode === 13 && hasOnlyAltModifier(e)) {
          e.preventDefault();
          gotoLink(editor, link);
        }
      });
    };

    var toggleActiveState = function (editor) {
      return function () {
        var self = this;
        editor.on('nodechange', function (e) {
          self.active(!editor.readonly && !!Utils.getAnchorElement(editor, e.element));
        });
      };
    };

    var toggleViewLinkState = function (editor) {
      return function () {
        var self = this;

        var toggleVisibility = function (e) {
          if (Utils.hasLinks(e.parents)) {
            self.show();
          } else {
            self.hide();
          }
        };

        if (!Utils.hasLinks(editor.dom.getParents(editor.selection.getStart()))) {
          self.hide();
        }

        editor.on('nodechange', toggleVisibility);

        self.on('remove', function () {
          editor.off('nodechange', toggleVisibility);
        });
      };
    };

    return {
      openDialog: openDialog,
      gotoSelectedLink: gotoSelectedLink,
      leftClickedOnAHref: leftClickedOnAHref,
      setupGotoLinks: setupGotoLinks,
      toggleActiveState: toggleActiveState,
      toggleViewLinkState: toggleViewLinkState
    };
  }
);
