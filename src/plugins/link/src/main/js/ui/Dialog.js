/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.link.ui.Dialog',
  [
    'ephox.katamari.api.Strings',
    'tinymce.core.util.Delay',
    'tinymce.core.util.Tools',
    'tinymce.core.util.XHR',
    'tinymce.plugins.link.api.Settings',
    'tinymce.plugins.link.core.Utils',
    'tinymce.plugins.cascade.core.Utils'
  ],
  function (Strings, Delay, Tools, XHR, Settings, Utils, CascadeUtils) {
    var attachState = {};

    /**
     * Retrieves the HTML markup for the internal link chooser and calls the provided
     * callback function.
     *
     * The callback is necessary to create a synchronous method call which ensures
     * the AJAX completes before the link dialog is shown.
     *
     * @param callback method to call on AJAX success/error.
     * @return function
     */
    var getInternalLinkChooserFieldHtml = function (editor, callback) {
      var cascadeLinkChooserUrl = 'CONTEXT_PATH/linkpopup.act?href=<LINK_HREF>&currentSiteId=' + Utils.getGlobalCascadeVariable().Variables.get('currentSiteId');
      var selection = editor.selection;
      var dom = editor.dom;
      var selectedElm = selection.getNode();
      var anchorElm = dom.getParent(selectedElm, 'a[href]');
      var href = anchorElm ? dom.getAttrib(anchorElm, 'href') : '';
      var restrictToFolderId = Settings.getRestrictToFolderId(editor);

      // Leave the chooser empty if the URL is external (ie doesn't start with site:// or /).
      if (!Utils.isInternalUrl(href)) {
        href = '';
      }

      if (restrictToFolderId) {
        cascadeLinkChooserUrl += '&restrictToFolderId=' + restrictToFolderId;
      }

      XHR.send({
        url: cascadeLinkChooserUrl.replace('<LINK_HREF>', encodeURIComponent(href)),
        error: function () {
          // In the event of an error, just return an empty string.
          callback(editor, '');
        },
        success: function (text) {
          callback(editor, text);
        }
      });
    };

    var buildListItems = function (inputList, itemCallback, startItems) {
      var truncateListItemText = function (str, n) {
        return str.length > n ? str.substr(0, n - 1) + '...' : str;
      };

      var appendItems = function (values, output) {
        var menuItem;
        output = output || [];

        Tools.each(values, function (item) {
          if (typeof item === 'string') {
            item = {
              text: item,
              value: item
            };
          }

          menuItem = {
            text: item.text || item.title
          };

          menuItem.text = truncateListItemText(menuItem.text, 50);

          if (item.menu) {
            menuItem.menu = appendItems(item.menu);
          } else {
            menuItem.value = item.value;

            if (itemCallback) {
              itemCallback(menuItem);
            }
          }

          output.push(menuItem);
        });

        return output;
      };

      return appendItems(inputList, startItems || []);
    };

    // Delay confirm since onSubmit will move focus
    var delayedConfirm = function (editor, message, callback) {
      var rng = editor.selection.getRng();

      Delay.setEditorTimeout(editor, function () {
        editor.windowManager.confirm(message, function (state) {
          editor.selection.setRng(rng);
          callback(state);
        });
      });
    };

    var showDialog = function (editor, typeAheadFieldHtml) {
      var data = {}, selection = editor.selection, dom = editor.dom, anchorElm, initialText;
      var win, onlyText, textListCtrl, relListCtrl, targetListCtrl, classListCtrl, linkTitleCtrl, value;
      var anchorCtrl, chooserElm, hrefCtrl, sourceTypeCtrl;

      /*
       * Toggles the visibility of the internal and external link controls
       * based on which checkbox is being clicked.
       */
      var toggleLinkFields = function () {
        var isTargetChecked = this.checked();
        var otherCheckbox = win.find('#' + (this.name() === 'source_type_internal' ? 'source_type_external' : 'source_type_internal'));

        // If clicking the same checkbox as the current source type, keep it checked and return.
        if (this.name() === 'source_type_' + data.source_type) {
          this.checked(true);
          return;
        }

        // Toggle the checked state of the two checkboxes.
        this.checked(isTargetChecked);
        otherCheckbox.checked(!isTargetChecked);

        // Toggle the visibility of the two fields and update the source type value.
        if (this.name() === 'source_type_internal' && this.checked()) {
          win.find('#internalLink').show();
          win.find('#externalLink').hide();
          win.find('#damassetChooserLink').hide();
          data.source_type = 'internal';
        } else {
          win.find('#internalLink').hide();
          win.find('#externalLink').show();
          win.find('#damassetChooserLink').show();
          data.source_type = 'external';
        }

        updateText();
      };

      /*
       * For new links (ie no text was selected prior to clicking the link control), automatically copies the
       * internal or external link and anchor value over to the link text field.
       */
      var updateText = function () {
        if (!initialText && onlyText && !data.text) {
          var href = data.source_type === 'internal' ? Utils.getChosenFromAssetChooser(editor).path : win.find('#externalLink').value();
          var anchor = Utils.cleanAnchorText(win.find('#anchor').value());

          if (anchor !== '') {
            href += '#' + anchor;
          }

          win.find('#text').value(href);
        }
      };

      /*
       * If the context is a TinyMCE control, automatically: copies anchor text over to
       * the anchor control if the control being changed is the external link control, or
       * automatically cleans up the value of the anchor control (ie removes hash signs)
       * if the control being changed is the anchor control.
       *
       * Attempts to update the link text field for new links without text.
       */
      var urlChange = function (e) {
        // Only run the following if the context element is a TinyMCE control.
        if (e.control && this.value()) {
          var splitUrl = Utils.splitUrlByHash(this.value());
          if (this.name() === 'externalLink') {
            // Update the href value.
            this.value(splitUrl[0]);

            // If a new anchor is present replace the existing anchor value.
            if (splitUrl[1]) {
              win.find('#anchor').value(splitUrl[1]);
            }
          } else if (this.name() === 'anchor') {
            // Update the sanitized anchor value (ie removal of # symbols).
            // Note: splitUrl will differ if a # symbol is present in the anchor value.
            this.value(splitUrl[0] || splitUrl[1]);
          }
        }

        updateText.call(this);
      };

      onlyText = Utils.isOnlyTextSelected(selection.getContent());
      anchorElm = Utils.getAnchorElement(editor);

      data.text = initialText = Utils.getAnchorText(editor.selection, anchorElm);
      data.href = anchorElm ? dom.getAttrib(anchorElm, 'href') : '';

      if (data.href === '#') {
        data.href = '';
      } else {
        var splitUrl = Utils.splitUrlByHash(data.href);

        if (splitUrl.length > 1) {
          data.anchor = splitUrl[1] || '';

          // If there is an anchor, replace the current href with the string before the fragment.
          if (data.anchor !== '') {
            data.href = splitUrl[0];
          }
        } else if (Strings.startsWith(data.href, '#')) {
          // If the href starts with a #, splutUrl will contain a single value with the # removed.
          data.anchor = splitUrl[0];
          data.href = '';
        }
      }

      // Determine the source type based on the link's href value, or default to internal if empty.
      data.source_type = Utils.getSourceType (data.href, editor);
      if (anchorElm) {
        data.target = dom.getAttrib(anchorElm, 'target');
      } else if (Settings.hasDefaultLinkTarget(editor.settings)) {
        data.target = Settings.getDefaultLinkTarget(editor.settings);
      }

      if ((value = dom.getAttrib(anchorElm, 'rel'))) {
        data.rel = value;
      }

      if ((value = dom.getAttrib(anchorElm, 'class'))) {
        data['class'] = value;
      }

      if ((value = dom.getAttrib(anchorElm, 'title'))) {
        data.title = value;
      }

      // Initialize the external link control
      hrefCtrl = {
        name: 'externalLink',
        type: 'textbox',
        size: 40,
        label: 'Link Source',
        value: data.source_type === 'external' && data.href ? data.href : 'https://',
        onchange: urlChange,
        onkeyup: updateText
      };

      //Don't show source type options when the use external only option is specified
      if (!Settings.isExternalOnly(editor)) {
        // If the type-ahead HTML generation didn't fail, create the internal/external toggler and separate URL controls.
        if (typeAheadFieldHtml) {
          sourceTypeCtrl = {
            type: 'container',
            label: 'Link Type',
            layout: 'flex',
            direction: 'row',
            align: 'center',
            spacing: 5,
            items: [
              {
                name: 'source_type_internal',
                type: 'checkbox',
                checked: data.source_type === 'internal',
                onclick: toggleLinkFields, text: 'Internal'
              },
              {
                name: 'source_type_external',
                type: 'checkbox',
                checked: data.source_type === 'external',
                onclick: toggleLinkFields,
                text: 'External'
              }
            ]
          };

          // Set the default visibility of the external URL control.
          hrefCtrl.hidden = data.source_type !== 'external';

          // Turn the control into a container, with the original added as one of the items.
          hrefCtrl = {
            type: 'container',
            name: 'linkContainer',
            label: 'Link Source',
            minHeight: 60,
            items: [
              hrefCtrl,
              {
                name: 'internalLink',
                type: 'container',
                hidden: data.source_type !== 'internal',
                html: typeAheadFieldHtml
              }
            ]
          };

          var damIntegrationBrowseLabel = Utils.generateEnabledDAMIntegrationsLabelFromEditorSettings(editor);
          if (damIntegrationBrowseLabel.length) {
            hrefCtrl.items.push({
              type: 'container',
              name: 'damassetChooserLink',
              label: '',
              layout: 'flex',
              direction: 'column',
              align: 'center',
              spacing: 5,
              hidden: true,
              items: [
                {
                  name: 'damassetChooserLinkHtml',
                  type: 'container',
                  html: '<a href="javascript:void(0);" class="damasset-chooser">Browse ' + damIntegrationBrowseLabel + ' for external files</a>'
                }
              ]
            });
          }
        }
      }

      if (Settings.shouldShowLinkAnchor(editor.settings)) {
        anchorCtrl = {
          name: 'anchor',
          type: 'textbox',
          label: 'Anchor',
          size: 40,
          onchange: urlChange,
          onkeyup: updateText
        };
      }

      if (onlyText) {
        textListCtrl = {
          name: 'text',
          type: 'textbox',
          size: 40,
          label: 'Text to display',
          onchange: function () {
            data.text = this.value();
          }
        };
      }

      if (Settings.shouldShowTargetList(editor.settings)) {
        if (Settings.getTargetList(editor.settings) === undefined) {
          Settings.setTargetList(editor, [
            { text: 'None', value: '' },
            { text: 'New window', value: '_blank' }
          ]);
        }

        targetListCtrl = {
          name: 'target',
          type: 'listbox',
          label: 'Target',
          values: buildListItems(Settings.getTargetList(editor.settings))
        };
      }

      if (Settings.hasRelList(editor.settings)) {
        relListCtrl = {
          name: 'rel',
          type: 'listbox',
          label: 'Rel',
          values: buildListItems(
            Settings.getRelList(editor.settings),
            function (item) {
              if (Settings.allowUnsafeLinkTarget(editor.settings) === false) {
                item.value = Utils.toggleTargetRules(item.value, data.target === '_blank');
              }
            }
          )
        };
      }

      if (editor.settings.style_formats) {
        var classList;

        classList = CascadeUtils.getLinkClassesForDropdown(editor, editor.settings.link_class_list);

        if (classList) {
          // Add a 'None' option to the beginning if it is not already present.
          if (typeof classList[0] !== 'object') {
            // Using an object as opposed to a string so we can use an empty value.
            classList.unshift({
              text: 'None',
              value: ''
            });
          }
        }

        // If the link's initial class is not empty and not in the pre-defined list, add it so the user can retained the value.
        if (data['class'] && classList.indexOf(data['class']) === -1) {
          classList.push(data['class']);
        }

        classListCtrl = {
          name: 'class',
          type: 'listbox',
          label: 'Class',
          style: 'max-width:100%;', // Make sure the width of the listbox never extends past the width of the dialog.
          values: buildListItems(
            classList,
            function (item) {
              if (item.value) {
                item.textStyle = function () {
                  return editor.formatter.getCssText({ inline: 'a', classes: [item.value] });
                };
              }
            }
          )
        };
      }

      if (Settings.shouldShowLinkTitle(editor.settings)) {
        linkTitleCtrl = {
          name: 'title',
          type: 'textbox',
          label: 'Title',
          value: data.title
        };
      }

      win = editor.windowManager.open({
        title: 'Insert link',
        data: data,
        body: [
          sourceTypeCtrl,
          hrefCtrl,
          anchorCtrl,
          textListCtrl,
          linkTitleCtrl,
          relListCtrl,
          targetListCtrl,
          classListCtrl
        ],
        onSubmit: function (e) {
          var assumeExternalTargets = Settings.assumeExternalTargets(editor.settings);
          var insertLink = Utils.link(editor, attachState);
          var removeLink = Utils.unlink(editor);

          var resultData = Tools.extend({}, data, e.data);
          /*eslint dot-notation: 0*/
          var href = resultData.href;

          if (resultData.source_type_internal) {
            var internalLinkValue = Utils.getChosenFromAssetChooser(editor).path;
            var crossSite = internalLinkValue.match(/(.*):([^\/].*)/);

            /*
             If the link is cross-site, append the site:// prefix. Otherwise,
             make sure it starts with a leading / to denote internal.
            */
            if (crossSite) {
              href = 'site://' + crossSite[1] + '/' + crossSite[2];
            } else if (internalLinkValue) {
              href = internalLinkValue.charAt(0) !== '/' ? '/' + internalLinkValue : internalLinkValue;
            } else {
              href = internalLinkValue;
            }
          } else {
            href = resultData.externalLink;
          }

          // If there is a anchor, append it onto the end of the final href value.
          if (resultData.anchor) {
            href += "#" + Utils.cleanAnchorText(resultData.anchor);
          }

          // If the link is still empty, just default to a # sign.
          if (href === '') {
            href = '#';
          }

          if (!href) {
            removeLink();
            return;
          }

          if (!onlyText || resultData.text === initialText) {
            delete resultData.text;
          }

          // Is email and not //user@domain.com
          if (href.indexOf('@') > 0 && href.indexOf('//') === -1 && href.indexOf('mailto:') === -1) {
            delayedConfirm(
              editor,
              'The URL you entered seems to be an email address. Do you want to add the required mailto: prefix?',
              function (state) {
                if (state) {
                  resultData.href = 'mailto:' + href;
                }
                insertLink(resultData);
              }
            );
            return;
          }

          // Is not protocol prefixed
          if ((assumeExternalTargets === true && !/^\w+:/i.test(href)) ||
            (assumeExternalTargets === false && /^\s*www[\.|\d\.]/i.test(href))) {
            delayedConfirm(
              editor,
              'The URL you entered seems to be an external link. Do you want to add the required https:// prefix?',
              function (state) {
                if (state) {
                  resultData.href = 'https://' + href;
                }
                insertLink(resultData);
              }
            );
            return;
          }

          // Show a note to the user if link entered begins with http://.
          if (href.match(/http:/i)) {
            editor.windowManager.alert('Note: The URL you entered begins with http://, you may want to consider using https:// for security and to avoid browsers from blocking content.');
          }

          resultData.href = href;
          insertLink(resultData);
        }
      });

      chooserElm = Utils.getInternalLinkChooser();
      Utils.setAssetChooser(chooserElm.assetChooser().data('cs.chooser'), editor);

      // Call urlChange on chooser clear and submission.
      chooserElm.on('clear.cs.chooser submit.cs.chooser.panel', function () {
        // Call the urlChange method with the context of the linkPath DOM Element.
        urlChange.call(Utils.getInternalLinkChooserPathFieldElement(), {});
      });

      Utils.convertTinyMCEFieldToJqueryObject(win.find('#damassetChooserLinkHtml')[0]).find('.damasset-chooser')
        .on('damembed.cs.chooser.panel.tab', function (e, item) {
          win.find('#externalLink').value(item.url);
          win.find('#text').value(item.filename);
        });

      Utils.convertTinyMCEFieldToJqueryObject(win.find('#linkContainer')[0]).prev('label').addClass('source-control-label');
    };

    var open = function (editor) {
      getInternalLinkChooserFieldHtml(editor, showDialog);
    };

    return {
      open: open
    };
  }
);
