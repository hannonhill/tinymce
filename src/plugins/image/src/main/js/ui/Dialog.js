/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * @class tinymce.image.ui.Dialog
 * @private
 */
define(
  'tinymce.plugins.image.ui.Dialog',
  [
    'ephox.sand.api.URL',
    'global!document',
    'global!Math',
    'global!RegExp',
    'tinymce.core.Env',
    'tinymce.core.ui.Factory',
    'tinymce.core.util.JSON',
    'tinymce.core.util.Tools',
    'tinymce.core.util.XHR',
    'tinymce.plugins.image.api.Settings',
    'tinymce.plugins.image.core.Uploader',
    'tinymce.plugins.image.core.Utils'
  ],
  function (URL, document, Math, RegExp, Env, Factory, JSON, Tools, XHR, Settings, Uploader, Utils) {
    return function (editor) {
      /*
       * Retrieves the HTML markup for the internal file chooser and calls the provided
       * callback function.
       *
       * The callback is necessary to create a synchronous method call which ensures
       * the AJAX completes before the image dialog is shown.
       *
       * @param callback method to call on AJAX success/error.
       * @return function
       */
      function getTypeAheadFieldHtml(callback) {
        var cascadeImageChooserUrl = 'CONTEXT_PATH/imagepopup.act?src=<IMG_SRC>&currentSiteId=' + Utils.getGlobalCascadeVariable().Variables.get('currentSiteId');

        if (Settings.getRestrictToFolderId(editor)) {
          cascadeImageChooserUrl += '&restrictToFolderId=' + Settings.getRestrictToFolderId(editor);
        }

        var selection = editor.selection, dom = editor.dom, imgElm, figureElm, src;

        imgElm = selection.getNode();

        // If the image is surrounded by a figure element, we need to get the image element within.
        figureElm = dom.getParent(imgElm, 'figure.image');
        if (figureElm) {
          imgElm = dom.select('img', figureElm)[0];
        }

        src = imgElm ? dom.getAttrib(imgElm, 'src') : '';

        // Leave the chooser empty if the URL is external (ie doesn't start with site:// or /).
        if (!Utils.isInternalUrl(src)) {
          src = '';
        }

        XHR.send({
          url: cascadeImageChooserUrl.replace('<IMG_SRC>', encodeURIComponent(src)),
          error: function () {
            // In the event of an error, just return an empty string.
            callback('');
          },
          success: function (text) {
            callback(text);
          }
        });
      }

      /**
       * Retrieves Title or Display Name for the provided image path and passes
       * it to the provided callback.
       *
       * @param {string} path - The path of the image
       * @param {function} callback - The callback to execute
       *
       */
      function getImageTitleOrDisplayName(path, callback) {
        XHR.send({
          url: 'CONTEXT_PATH/ajax/getAssetInfo.act?type=file&path=' + path,
          error: function () {
            // In the event of an error, just return an empty string.
            callback('');
          },
          success: function (data) {
            data = JSON.parse(data);
            callback(data && data.dom ? data.dom.tOrDN : '');
          }
        });
      }

      function showDialog(typeAheadFieldHtml) {
        var win, data = {}, imgElm, figureElm, dom = editor.dom, settings = editor.settings;
        var width, height, classListCtrl, imageDimensions = settings.image_dimensions !== false;
        var chooserElm, srcCtrl, classList;
        var isAltTextManuallyUpdated = false;

        /**
         * Toggles the disabled state of the alt control and description based on the state of the decorative
         * image checkbox.
         *
         * @param {boolean} focusDecorativeField - Whether or not the decorative field should be focused.
         */
        function toggleAltState(focusDecorativeField) {
          var altCtrl = win.find("#altContainer")[0];
          var altCtrlParent = altCtrl._parent;
          var altHelpTextParent = win.find("#altHelpText")[0]._parent;
          var decorativeCtrl = win.find("#decorative")[0];
          var isDecorative = decorativeCtrl.checked();

          focusDecorativeField = focusDecorativeField !== false;

          altCtrlParent[isDecorative ? 'hide' : 'show']();
          altHelpTextParent[isDecorative ? 'hide' : 'show']();

          if (focusDecorativeField) {
            decorativeCtrl.focus();
          }
        }

        /**
         * Toggles the visibility of the internal and external link controls
         * based on which checkbox is being clicked.
         */
        function toggleLinkFields() {
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
            win.find('#internalSrc').show();
            win.find('#externalSrc').hide();
            win.find('#damassetChooserLink').hide();
            data.source_type = 'internal';
          } else {
            win.find('#internalSrc').hide();
            win.find('#externalSrc').show();
            win.find('#damassetChooserLink').show();
            data.source_type = 'external';
          }

          onSrcChange();
        }

        function isTextBlock(node) {
          return editor.schema.getTextBlockElements()[node.nodeName];
        }

        function recalcSize() {
          var widthCtrl, heightCtrl, newWidth, newHeight;

          widthCtrl = win.find('#width')[0];
          heightCtrl = win.find('#height')[0];

          if (!widthCtrl || !heightCtrl) {
            return;
          }

          newWidth = parseInt(widthCtrl.value(), 10);
          newHeight = parseInt(heightCtrl.value(), 10);

          if (win.find('#constrain')[0].checked() && width && height && newWidth && newHeight) {
            if (parseInt(width, 10) !== newWidth) {
              newHeight = Math.round((newWidth / width) * newHeight);

              if (!isNaN(newHeight)) {
                heightCtrl.value(newHeight);
              }
            } else {
              newWidth = Math.round((newHeight / height) * newWidth);

              if (!isNaN(newWidth)) {
                widthCtrl.value(newWidth);
              }
            }
          }

          width = newWidth;
          height = newHeight;
        }

        function updateStyle() {
          if (!Settings.hasAdvTab(editor)) {
            return;
          }

          var data = win.toJSON(),
            css = dom.parseStyle(data.style);

          css = Utils.mergeMargins(css);

          if (data.vspace) {
            css['margin-top'] = css['margin-bottom'] = Utils.addPixelSuffix(data.vspace);
          }
          if (data.hspace) {
            css['margin-left'] = css['margin-right'] = Utils.addPixelSuffix(data.hspace);
          }
          if (data.border) {
            css['border-width'] = Utils.addPixelSuffix(data.border);
          }

          win.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
        }

        function updateVSpaceHSpaceBorder() {
          if (!Settings.hasAdvTab(editor)) {
            return;
          }

          var data = win.toJSON(),
            css = dom.parseStyle(data.style);

          win.find('#vspace').value("");
          win.find('#hspace').value("");

          css = Utils.mergeMargins(css);

          //Move opposite equal margins to vspace/hspace field
          if ((css['margin-top'] && css['margin-bottom']) || (css['margin-right'] && css['margin-left'])) {
            if (css['margin-top'] === css['margin-bottom']) {
              win.find('#vspace').value(Utils.removePixelSuffix(css['margin-top']));
            } else {
              win.find('#vspace').value('');
            }
            if (css['margin-right'] === css['margin-left']) {
              win.find('#hspace').value(Utils.removePixelSuffix(css['margin-right']));
            } else {
              win.find('#hspace').value('');
            }
          }

          //Move border-width
          if (css['border-width']) {
            win.find('#border').value(Utils.removePixelSuffix(css['border-width']));
          }

          win.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
        }

        function waitLoad(imgElm) {
          function selectImage() {
            imgElm.onload = imgElm.onerror = null;

            if (editor.selection) {
              editor.selection.select(imgElm);
              editor.nodeChanged();
            }
          }

          imgElm.onload = function () {
            if (!data.width && !data.height && imageDimensions) {
              dom.setAttribs(imgElm, {
                width: imgElm.clientWidth,
                height: imgElm.clientHeight
              });
            }

            selectImage();
          };

          imgElm.onerror = selectImage;
        }

        function onSubmitForm() {
          var figureElm, oldImg;

          updateStyle();
          recalcSize();

          data = Tools.extend(data, win.toJSON());

          if (data.source_type_internal) {
            var internalSrcValue = Utils.getChosenFromAssetChooser(editor).path;
            var crossSite = internalSrcValue.match(/(.*):([^\/].*)/);

            if (internalSrcValue === '' || internalSrcValue === '/') {
              editor.windowManager.alert("Please choose an image asset to insert.");
              return false;
            }

            // If the source is cross-site, append the site:// prefix.
            data.src = crossSite ? 'site://' + crossSite[1] + '/' + crossSite[2] : internalSrcValue;

            // Add render file path to the source and encode the path.
            data.src = Utils.internalPathToRenderFileURL(data.src);
          } else {
            data.src = data.externalSrc;

            if (data.src === '' || data.src === 'https://') {
              editor.windowManager.alert("Please fill in the image URL.");
              return false;
            }
          }

          if (!data.alt) {
            data.alt = '';
          }

          if (!data.title) {
            data.title = '';
          }

          if (!data.decorative) {
            data.decorative = false;
          }

          if (data.width === '') {
            data.width = null;
          }

          if (data.height === '') {
            data.height = null;
          }

          if (!data.style) {
            data.style = null;
          }

          if (!data.decorative && !data.alt.length) {
            editor.windowManager.alert("Please provide an Image Description to ensure that your content is accessible. If this is a decorative image, please mark it as decorative.");
            return false;
          } else if (data.decorative) {
            data.alt = '';
          }

          // Setup new data excluding style properties
          /*eslint dot-notation: 0*/
          data = {
            src: data.src,
            alt: data.alt,
            title: data.title,
            width: data.width,
            height: data.height,
            style: data.style,
            caption: data.caption,
            "class": data["class"]
          };

          editor.undoManager.transact(function () {
            if (!data.src) {
              if (imgElm) {
                var elm = dom.is(imgElm.parentNode, 'figure.image') ? imgElm.parentNode : imgElm;
                dom.remove(elm);
                editor.focus();
                editor.nodeChanged();

                if (dom.isEmpty(editor.getBody())) {
                  editor.setContent('');
                  editor.selection.setCursorLocation();
                }
              }

              return;
            }

            if (data.title === "") {
              data.title = null;
            }

            if (!imgElm) {
              data.id = '__mcenew';
              editor.focus();
              editor.selection.setContent(dom.createHTML('img', data));
              imgElm = dom.get('__mcenew');
              dom.setAttrib(imgElm, 'id', null);
            } else {
              dom.setAttribs(imgElm, data);

              // setAttribs will remove the empty alt attribute, so we need to re-add it.
              if (!data.alt.length) {
                imgElm.setAttribute('alt', '');
              }
            }

            editor.editorUpload.uploadImagesAuto();

            if (data.caption === false) {
              if (dom.is(imgElm.parentNode, 'figure.image')) {
                figureElm = imgElm.parentNode;
                dom.setAttrib(imgElm, 'contenteditable', null);
                dom.insertAfter(imgElm, figureElm);
                dom.remove(figureElm);
                editor.selection.select(imgElm);
                editor.nodeChanged();
              }
            }

            if (data.caption === true) {
              if (!dom.is(imgElm.parentNode, 'figure.image')) {
                oldImg = imgElm;
                imgElm = imgElm.cloneNode(true);
                imgElm.contentEditable = true;
                figureElm = dom.create('figure', { 'class': 'image' });
                figureElm.appendChild(imgElm);
                figureElm.appendChild(dom.create('figcaption', { contentEditable: true }, 'Caption'));
                figureElm.contentEditable = false;

                var textBlock = dom.getParent(oldImg, isTextBlock);
                if (textBlock) {
                  dom.split(textBlock, oldImg, figureElm);
                } else {
                  dom.replace(figureElm, oldImg);
                }

                editor.selection.select(figureElm);
              }

              return;
            }

            waitLoad(imgElm);
          });
        }

        function onSrcChange(e) {
          // The value differs if the acting element is a TinyMCE control or a DOM Element.
          // A DOM Element is an internal path and needs to be converted to a render URL.
          //var value = e && e.control ? this.value() : UrlUtil.internalPathToRenderFileURL(this.value);
          var path = Utils.getChosenFromAssetChooser(editor).path;
          var value = data.source_type === 'external' ? win.find('#externalSrc')[0].value() : Utils.internalPathToRenderFileURL(path);

          Utils.getImageSize(value, function (data) {
            if (imageDimensions) {
              if (data.width && data.height) {
                width = data.width;
                height = data.height;
              } else {
                width = '';
                height = '';
              }

              win.find('#width').value(width);
              win.find('#height').value(height);
            }
          });

          if (!isAltTextManuallyUpdated && data.source_type === 'internal') {
            getImageTitleOrDisplayName(path, function (tOrDN) {
              if (tOrDN) {
                win.find('#alt').value(tOrDN);
              }
            });
          }
        }

        function altTextManuallyUpdated() {
          isAltTextManuallyUpdated = true;
        }

        imgElm = editor.selection.getNode();
        figureElm = dom.getParent(imgElm, 'figure.image');
        if (figureElm) {
          imgElm = dom.select('img', figureElm)[0];
        }

        if (imgElm &&
          (imgElm.nodeName !== 'IMG' ||
            imgElm.getAttribute('data-mce-object') ||
            imgElm.getAttribute('data-mce-placeholder'))) {
          imgElm = null;
        }

        if (imgElm) {
          width = dom.getAttrib(imgElm, 'width');
          height = dom.getAttrib(imgElm, 'height');

          data = {
            src: dom.getAttrib(imgElm, 'src'),
            alt: dom.getAttrib(imgElm, 'alt'),
            title: dom.getAttrib(imgElm, 'title'),
            "class": dom.getAttrib(imgElm, 'class'),
            width: width,
            height: height,
            caption: !!figureElm
          };

          data.decorative = !data.alt.length;
        }

        classList = Settings.getClassList(editor);
        if (classList) {
          // Add a 'None' option to the beginning if it is not already present.
          if (typeof classList[0] !== 'object') {
            // Using an object as opposed to a string so we can use an empty value.
            classList.unshift({
              text: 'None',
              value: ''
            });
          }

          // If the images's initial class is not empty and not in the pre-defined list, add it so the user can retained the value.
          if (data['class'] && classList.indexOf(data['class']) === -1) {
            classList.push(data['class']);
          }

          classListCtrl = {
            name: 'class',
            type: 'listbox',
            label: 'Class',
            style: 'max-width:100%;', // Make sure the width of the listbox never extends past the width of the dialog.
            values: Utils.buildListItems(
              classList,
              function (item) {
                if (item.value) {
                  item.textStyle = function () {
                    return editor.formatter.getCssText({ inline: 'img', classes: [item.value] });
                  };
                }
              }
            )
          };
        }

        data.source_type = Utils.getSourceType(imgElm, data.src, editor);

        // General settings shared between simple and advanced dialogs
        var generalFormItems = [];

        // Initialize the external source control
        srcCtrl = {
          name: 'externalSrc',
          type: 'textbox',
          size: 40,
          label: 'Image Source',
          value: data.source_type === 'external' && data.src ? data.src : 'https://',
          onchange: onSrcChange
        };

        //Don't show source type options when the use external only option is specified
        if (!Settings.isExternalOnly(editor)) {
          // If the type-ahead HTML generation didn't fail, create the internal/external toggler and separate source controls.
          if (typeAheadFieldHtml.length) {
            generalFormItems.push({
              type: 'container',
              label: 'Image Type',
              layout: 'flex',
              direction: 'row',
              align: 'center',
              spacing: 5,
              items: [
                {
                  name: 'source_type_internal',
                  type: 'checkbox',
                  checked: data.source_type === 'internal',
                  onclick: toggleLinkFields,
                  text: 'Internal'
                },
                {
                  name: 'source_type_external',
                  type: 'checkbox',
                  checked: data.source_type === 'external',
                  onclick: toggleLinkFields,
                  text: 'External'
                }
              ]
            });

            // Set the default visibility of the external source control.
            srcCtrl.hidden = data.source_type !== 'external';

            // Turn the control into a container, with the original added as one of the items.
            srcCtrl = {
              type: 'container',
              name: 'sourceContainer',
              label: 'Image Source',
              minHeight: 60,
              items: [
                srcCtrl,
                {
                  name: 'internalSrc',
                  type: 'container',
                  hidden: data.source_type !== 'internal',
                  html: typeAheadFieldHtml
                }
              ]
            };
          }

          var damIntegrationBrowseLabel = Utils.generateEnabledDAMIntegrationsLabelFromEditorSettings(editor);
          if (damIntegrationBrowseLabel.length) {
            srcCtrl.items.push({
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
                  html: '<a href="javascript:void(0);" class="damasset-chooser">Browse ' + damIntegrationBrowseLabel + ' for external images</a>'
                }
              ]
            });
          }
        }

        generalFormItems.push(srcCtrl);

        if (Settings.hasDescription(editor)) {
          generalFormItems.push({
            type: 'container',
            label: 'Decorative',
            layout: 'flex',
            direction: 'column',
            align: 'left',
            spacing: 5,
            items: [
              {
                name: 'decorative',
                type: 'checkbox',
                checked: data.decorative,
                onclick: toggleAltState,
                text: 'This is a decorative image, no description needed.'
              }
            ]
          });

          generalFormItems.push({
            type: 'container',
            label: 'Image description',
            name: 'altContainer',
            layout: 'flex',
            direction: 'column',
            align: 'left',
            spacing: 5,
            items: [
              {
                name: 'alt',
                type: 'textbox',
                size: 25,
                onchange: altTextManuallyUpdated
              }
            ]
          });

          generalFormItems.push({
            type: 'container',
            label: '',
            layout: 'flex',
            direction: 'column',
            align: 'center',
            spacing: 5,
            items: [
              {
                name: 'altHelpText',
                type: 'label',
                text: 'Image\'s title, display name or custom text',
                classes: 'image-decoration-help-block'
              }
            ]
          });
        }

        if (Settings.hasImageTitle(editor)) {
          generalFormItems.push({ name: 'title', type: 'textbox', label: 'Image Title' });
        }

        if (imageDimensions) {
          generalFormItems.push({
            type: 'container',
            label: 'Dimensions',
            layout: 'flex',
            direction: 'row',
            align: 'center',
            spacing: 5,
            items: [
              { name: 'width', type: 'textbox', maxLength: 5, size: 3, onchange: recalcSize, ariaLabel: 'Width' },
              { type: 'label', text: 'x' },
              { name: 'height', type: 'textbox', maxLength: 5, size: 3, onchange: recalcSize, ariaLabel: 'Height' },
              { name: 'constrain', type: 'checkbox', checked: true, text: 'Constrain proportions' }
            ]
          });
        }

        generalFormItems.push(classListCtrl);

        if (Settings.hasAdvTab(editor) || editor.settings.images_upload_url) {
          var advTabItems = [];

          if (Settings.hasImageCaption(editor) && Env.ceFalse) {
            advTabItems.push({
              name: 'caption',
              type: 'checkbox',
              label: 'Figure/Caption',
              text: 'Use figure and figcaption for this image'
            });
          }

          var body = [
            {
              title: 'General',
              type: 'form',
              items: generalFormItems
            }
          ];

          if (Settings.hasAdvTab(editor)) {
            // Parse styles from img
            if (imgElm) {
              if (imgElm.style.marginLeft && imgElm.style.marginRight && imgElm.style.marginLeft === imgElm.style.marginRight) {
                data.hspace = Utils.removePixelSuffix(imgElm.style.marginLeft);
              }
              if (imgElm.style.marginTop && imgElm.style.marginBottom && imgElm.style.marginTop === imgElm.style.marginBottom) {
                data.vspace = Utils.removePixelSuffix(imgElm.style.marginTop);
              }
              if (imgElm.style.borderWidth) {
                data.border = Utils.removePixelSuffix(imgElm.style.borderWidth);
              }

              data.style = editor.dom.serializeStyle(editor.dom.parseStyle(editor.dom.getAttrib(imgElm, 'style')));
            }

            advTabItems.push({
              label: 'Style',
              name: 'style',
              type: 'textbox',
              onchange: updateVSpaceHSpaceBorder
            });

            advTabItems.push({
              type: 'form',
              layout: 'grid',
              packV: 'start',
              columns: 2,
              padding: 0,
              alignH: ['left', 'right'],
              defaults: {
                type: 'textbox',
                maxWidth: 50,
                onchange: updateStyle
              },
              items: [
                { label: 'Vertical space', name: 'vspace' },
                { label: 'Horizontal space', name: 'hspace' },
                { label: 'Border', name: 'border' }
              ]
            });

            body.push({
              title: 'Advanced',
              type: 'form',
              pack: 'start',
              items: advTabItems
            });
          }

          // Advanced dialog shows general+advanced tabs
          win = editor.windowManager.open({
            title: 'Insert/edit image',
            data: data,
            bodyType: 'tabpanel',
            body: body,
            onSubmit: onSubmitForm
          });
        } else {
          // Simple default dialog
          win = editor.windowManager.open({
            title: 'Insert/edit image',
            data: data,
            body: generalFormItems,
            onSubmit: onSubmitForm
          });
        }

        toggleAltState(false);

        chooserElm = Utils.getInternalLinkChooser();
        Utils.setAssetChooser(chooserElm.assetChooser().data('cs.chooser'), editor);

        // Call srcChange on chooser clear and submission.
        chooserElm.on('clear.cs.chooser submit.cs.chooser.panel', onSrcChange);

        Utils.convertTinyMCEFieldToJqueryObject(win.find('#damassetChooserLinkHtml')[0]).find('.damasset-chooser')
          .on('damembed.cs.chooser.panel.tab', function (e, item) {
            var externalSrcCtrl = win.find('#externalSrc');
            var altCtrl = win.find('#alt');

            externalSrcCtrl.value(item.url);
            externalSrcCtrl.fire('change');

            if (!altCtrl.value()) {
              altCtrl.value(item.filename);
            }
          });

        Utils.convertTinyMCEFieldToJqueryObject(win.find('#sourceContainer')[0]).prev('label').addClass('source-control-label');
      }

      function open() {
        getTypeAheadFieldHtml(showDialog);
      }

      return {
        open: open
      };
    };
  }
);
