Ext.namespace('Ext.ux.form');

Ext.ux.form.CheckboxCombo = Ext.extend(Ext.form.TriggerField, {
   /**
    * @cfg {String} title If supplied, a header element is created containing this text and added into the top of
    * the dropdown list (defaults to undefined, with no header element)
    */

   // private
   defaultAutoCreate: {
      tag: "input",
      type: "text",
      size: "24",
      autocomplete: "off"
   },

   /**
    * @cfg {String} listClass The CSS class to add to the predefined 'x-checkboxcombo-list' class
    * applied the dropdown list element (defaults to '').
    */
   listClass: '',

   /**
    * @cfg {String} listEmptyText The empty text to display in the data view if no items are found.
    * (defaults to '')
    */
   listEmptyText: '',

   /**
    * @cfg {String} triggerClass An additional CSS class used to style the trigger button.  The trigger will always
    * get the class 'x-form-trigger' and triggerClass will be appended if specified
    * (defaults to 'x-form-arrow-trigger' which displays a downward arrow icon).
    */
   triggerClass: 'x-form-arrow-trigger',

   /**
    * @cfg {Boolean/String} shadow true or "sides" for the default effect, "frame" for
    * 4-way shadow, and "drop" for bottom-right
    */
   shadow: 'sides',

   /**
    * @cfg {String/Array} listAlign A valid anchor position value. See {@link Ext.Element#alignTo} for details
    * on supported anchor positions and offsets. To specify x/y offsets as well, this value
    * may be specified as an Array of {@link Ext.Element#alignTo} method arguments.

    *
    [ 'tl-bl?', [6,0] ]
    (defaults to 'tl-bl?')
    */
   listAlign: 'tl-bl?',

   /**
    * @cfg {Number} maxHeight The maximum height in pixels of the dropdown list before scrollbars are shown
    * (defaults to 300)
    */
   maxHeight: 300,

   /**
    * @cfg {Number} minHeight The minimum height in pixels of the dropdown list when the list is constrained by its
    * distance to the viewport edges (defaults to 90)
    */
   minHeight: 90,

   /**
    * @cfg {Boolean} selectOnFocus true to select any existing text in the field immediately on focus.
    * Only applies when {@link Ext.form.TriggerField#editable editable} = true (defaults to
    * false).
    */
   selectOnFocus: false,

   /**
    * @cfg {Boolean} false to prevent the user from typing text directly into the field, the field will only respond to a click on the trigger to set the value. (defaults to false).
    */
   editable: false,

   /**
    * @cfg {String} loadingText The text to display in the dropdown list while data is loading.  Only applies
    * when {@link #mode} = 'remote' (defaults to 'Loading...')
    */
   loadingText: 'Loading...',

   /**
    * @cfg {String} mode Acceptable values are 'remote' (Default) or 'local'
    */
   mode: 'remote',

   /**
    * @cfg {Number} minListWidth The minimum width of the dropdown list in pixels (defaults to 70, will
    * be ignored if {@link #listWidth} has a higher value)
    */
   minListWidth: 70,


   /**
    * @cfg {Boolean} lazyInit true to not initialize the list for this combo until the field is focused
    * (defaults to true)
    */
   lazyInit: true,


   /**
    * @cfg {Boolean} submitValue False to clear the name attribute on the field so that it is not submitted during a form post.
    * If a hiddenName is specified, setting this to true will cause both the hidden field and the element to be submitted.
    * Defaults to undefined.
    */
   submitValue: undefined,


   // private
   initComponent: function () {
      Ext.ux.form.CheckboxCombo.superclass.initComponent.call(this);
      this.addEvents('expand', 'collapse');

      //auto-configure store from local array data
      if (this.store) {
         this.store = Ext.StoreMgr.lookup(this.store);
         if (this.store.autoCreated) {
            this.displayField = this.valueField = 'field1';
            if (!this.store.expandData) {
               this.displayField = 'field2';
            }
            this.mode = 'local';
         }
      }

      this.selectedIndex = -1;
   },

   // private
   onRender: function (ct, position) {
      if (this.hiddenName && !Ext.isDefined(this.submitValue)) {
         this.submitValue = false;
      }
      Ext.ux.form.CheckboxCombo.superclass.onRender.call(this, ct, position);
      if (this.hiddenName) {
         this.hiddenField = this.el.insertSibling({
            tag: 'input',
            type: 'hidden',
            name: this.hiddenName,
            id: (this.hiddenId || this.hiddenName)
         }, 'before', true);
      }
      if (Ext.isGecko) {
         this.el.dom.setAttribute('autocomplete', 'off');
      }
      if (!this.lazyInit) {
         this.initList();
      } else {
         this.on('focus', this.initList, this, {
            single: true
         });
      }
   },

   // private
   initValue: function () {
      Ext.ux.form.CheckboxCombo.superclass.initValue.call(this);
      if (this.hiddenField) {
         this.hiddenField.value = Ext.value(Ext.isDefined(this.hiddenValue) ? this.hiddenValue : this.value, '');
      }
   },

   // private
   initList: function () {
      if (!this.list) {
         var cls = 'x-checkboxcombo-list',
            listParent = Ext.getDom(this.getListParent() || Ext.getBody()),
            zindex = parseInt(Ext.fly(listParent).getStyle('z-index'), 10);

         if (this.ownerCt && !zindex) {
            this.findParentBy(function (ct) {
               zindex = parseInt(ct.getPositionEl().getStyle('z-index'), 10);
               return !!zindex;
            });
         }

         this.list = new Ext.Layer({
            parentEl: listParent,
            shadow: this.shadow,
            cls: [cls, this.listClass].join(' '),
            constrain: false,
            zindex: (zindex || 12000) + 5
         });

         var lw = this.listWidth || Math.max(this.wrap.getWidth(), this.minListWidth);
         this.list.setWidth(lw);
         this.list.swallowEvent('mousewheel');
         this.assetHeight = 0;
         if (this.syncFont !== false) {
            this.list.setStyle('font-size', this.el.getStyle('font-size'));
         }

         this.innerList = this.list.createChild({
            cls: cls + '-inner'
         });
         this.innerList.setWidth(lw - this.list.getFrameWidth('lr'));
         this.mon(this.innerList, 'mouseover', this.onListOver, this, {
            delegate: '.x-form-item'
         });
         this.mon(this.innerList, 'mousemove', this.onListMove, this, {
            delegate: '.x-form-item'
         });
         this.mon(this.innerList, 'click', this.onListClick, this, {
            delegate: '.x-form-item'
         });

         this.cbgroup = new Ext.form.CheckboxGroup({
            renderTo: this.innerList,
            columns: 1,
            autoHeight: true,
            autoScroll: true,
            border: false,
            items: [{}]
         });

         this.bindStore(this.store, true);
         this.restrictHeight();
      }
   },

   getListParent: function () {
      return document.body;
   },


   /**
    * Returns the store associated with this combo.
    * @return {Ext.data.Store} The store
    */
   getStore: function () {
      return this.store;
   },

   // private
   bindStore: function (store, initial) {
      if (this.store && !initial) {
         if (this.store !== store && this.store.autoDestroy) {
            this.store.destroy();
         } else {
            this.store.un('beforeload', this.onBeforeLoad, this);
            this.store.un('load', this.onLoad, this);
            this.store.un('exception', this.collapse, this);
         }
         if (!store) {
            this.store = null;
         }
      }
      if (store) {
         if (!initial) {
            this.lastQuery = null;
         }

         this.store = Ext.StoreMgr.lookup(store);
         this.store.on({
            scope: this,
            beforeload: this.onBeforeLoad,
            load: this.onLoad,
            exception: this.collapse
         });

         this.removeCheckboxes();
         this.addCheckboxes();
      }
   },

   // private
   initEvents: function () {
      Ext.ux.form.CheckboxCombo.superclass.initEvents.call(this);

      this.keyNav = new Ext.KeyNav(this.el, {
         'up': function (e) {
            this.inKeyMode = true;
            this.selectPrev();
         }, 'down': function (e) {
            if (!this.isExpanded()) {
               this.onTriggerClick();
            } else {
               this.inKeyMode = true;
               this.selectNext();
            }
         }, 'enter': function (e) {
            this.onListEnter();
         }, 'esc': function (e) {
            this.collapse();
         }, 'tab': function (e) {
            this.collapse();
            return true;
         }, scope: this,
         doRelay: function (e, h, hname) {
            if (hname == 'down' || this.scope.isExpanded()) {
               // this MUST be called before ComboBox#fireKey()
               var relay = Ext.KeyNav.prototype.doRelay.apply(this, arguments);
               if (!Ext.isIE && Ext.EventManager.useKeydown) {
                  // call Combo#fireKey() for browsers which use keydown event (except IE)
                  this.scope.fireKey(e);
               }
               return relay;
            }
            return true;
         },

         forceKeyDown: true,
         defaultEventAction: 'stopEvent'
      });
      if (!this.enableKeyEvents) {
         this.mon(this.el, 'keyup', this.onKeyUp, this);
      }
   },

   // private
   onDestroy: function () {
      this.bindStore(null);
      Ext.destroy(
      this.resizer, this.cbgroup, this.list);
      Ext.destroyMembers(this, 'hiddenField');
      Ext.ux.form.CheckboxCombo.superclass.onDestroy.call(this);
   },

   // private
   fireKey: function (e) {
      if (!this.isExpanded()) {
         Ext.ux.form.CheckboxCombo.superclass.fireKey.call(this, e);
      }
   },

   // private
   onResize: function (w, h) {
      Ext.ux.form.CheckboxCombo.superclass.onResize.apply(this, arguments);
      if (this.isVisible() && this.list) {
         this.doResize(w);
      } else {
         this.bufferSize = w;
      }
   },

   doResize: function (w) {
      if (!Ext.isDefined(this.listWidth)) {
         var lw = Math.max(w, this.minListWidth);
         this.list.setWidth(lw);
         this.innerList.setWidth(lw - this.list.getFrameWidth('lr'));
      }
   },

   // private
   onEnable: function () {
      Ext.ux.form.CheckboxCombo.superclass.onEnable.apply(this, arguments);
      if (this.hiddenField) {
         this.hiddenField.disabled = false;
      }
   },

   // private
   onDisable: function () {
      Ext.ux.form.CheckboxCombo.superclass.onDisable.apply(this, arguments);
      if (this.hiddenField) {
         this.hiddenField.disabled = true;
      }
   },

   // private
   onBeforeLoad: function () {
      if (!this.hasFocus) {
         return;
      }

      // Setup a temp var so we can recheck on load
      this.checkboxValues = this.cbgroup.getValue();

      this.removeCheckboxes();
   },

   // private
   onLoad: function () {
      if (!this.hasFocus) {
         return;
      }

      // If there were old checkbox values, make sure they are still checked
      if (this.checkboxValues) {
         Ext.each(this.checkboxValues, function (v) {
            if (this.valueField) {
               var r = this.findRecord(this.valueField, v.inputValue);
               if (r) {
                  r.checked = true;
               }
            }
         }, this);
      }

      if (this.store.getCount() > 0 || this.listEmptyText) {
         this.addCheckboxes();
         this.expand();
         this.restrictHeight();
      } else {
         this.collapse();
      }
   },

   // inherit docs
   getName: function () {
      var hf = this.hiddenField;
      return hf && hf.name ? hf.name : this.hiddenName || Ext.ux.form.CheckboxCombo.superclass.getName.call(this);
   },

   // private
   assertValue: function () {
      var checkboxValues = this.cbgroup.getValue();
      if (checkboxValues) {
         var vals = [];
         Ext.each(checkboxValues, function (cb) {
            vals.push(cb.inputValue);
         });
         this.setValue(vals);
      } else {
         this.clearValue();
      }
   },

   /**
    * Sets the specified value into the field.  If the value finds a match, the corresponding record text
    * will be displayed in the field.  If the value does not match the data value of an existing item,
    * and the valueNotFoundText config option is defined, it will be displayed as the default field text.
    * Otherwise the field will be blank (although the value will still be set).
    * @param {String} value The value to match
    * @return {Ext.form.Field} this
    */
   setValue: function (vals) {
      if (typeof vals == 'string') {
         vals = vals.split(',');
      }

      var text = [];

      Ext.each(vals, function (v) {
         if (this.valueField) {
            var r = this.findRecord(this.valueField, v);
            if (r) {
               text.push(r.data[this.displayField]);
               r.checked = true;
            }
         }
      }, this);

      if (this.hiddenField) {
         this.hiddenField.value = Ext.value(vals.join(','), '');
      }

      this.lastSelectionText = text.join(', ');
      Ext.ux.form.CheckboxCombo.superclass.setValue.call(this, text.join(', '));
      this.value = vals.join(',');
      return this;
   },

   /**
    * Returns the currently selected field value or empty string if no value is set.
    * @return {String} value The selected value
    */
   getValue: function () {
      if (this.valueField) {
         return Ext.isDefined(this.value) ? this.value : '';
      } else {
         return Ext.ux.form.CheckboxCombo.superclass.getValue.call(this);
      }
   },

   /**
    * Clears any text/value currently set in the field
    */
   clearValue: function () {
      if (this.hiddenField) {
         this.hiddenField.value = '';
      }
      this.setRawValue('');
      this.lastSelectionText = '';
      this.applyEmptyText();
      this.value = '';
   },

   // private
   findRecord: function (prop, value) {
      var record;
      if (this.store.getCount() > 0) {
         record = this.store.getAt(this.store.find(prop, value));
         return (record ? record : false);
      }
   },

   // private
   onListMove: function (e, t) {
      this.inKeyMode = false;
   },

   // private
   onListOver: function (e, t) {
      var target = e.getTarget('div.x-form-item');
      if (target) {
         target = Ext.get(target);
         target.radioClass('x-checkboxcombo-item-over');
      }
   },

   // private
   onListClick: function (e, t) {
      if (Ext.get(e.getTarget()).dom.tagName == 'INPUT' || Ext.get(e.getTarget()).dom.tagName == 'LABEL') {
         return;
      }

      var target = e.getTarget('div.x-form-item');
      if (target) {
         target = Ext.get(target);
         var cb = target.child('input');
         cb = Ext.getCmp(cb.id);
         cb.setValue(cb.getValue() ? false : true);
      }
   },

   // private
   onListEnter: function (e, t) {
      var target = Ext.DomQuery.selectNode('.x-checkboxcombo-item-over', this.list.dom);
      if (target) {
         target = Ext.get(target);
         var cb = target.child('input');
         cb = Ext.getCmp(cb.id);
         cb.setValue(cb.getValue() ? false : true);
      }
   },

   // private
   restrictHeight: function () {
      this.innerList.dom.style.height = '';
      var inner = this.innerList.dom,
         pad = this.list.getFrameWidth('tb') + this.assetHeight,
         h = Math.max(inner.clientHeight, inner.offsetHeight, inner.scrollHeight),
         ha = this.getPosition()[1] - Ext.getBody().getScroll().top,
         hb = Ext.lib.Dom.getViewHeight() - ha - this.getSize().height,
         space = Math.max(ha, hb, this.minHeight || 0) - this.list.shadowOffset - pad - 5;

      h = Math.min(h, space, this.maxHeight);

      this.innerList.setHeight(h);
      this.list.beginUpdate();
      this.list.setHeight(h + pad);
      this.list.alignTo.apply(this.list, [this.el].concat(this.listAlign));
      this.list.endUpdate();
   },


   /**
    * Returns true if the dropdown list is expanded, else false.
    */
   isExpanded: function () {
      return this.list && this.list.isVisible();
   },

   // private
   selectNext: function () {
      var ct = this.store.getCount();
      if (ct > 0) {
         var el = Ext.DomQuery.selectNode('.x-checkboxcombo-item-over', this.list.dom);
         if (!el) {
            this.innerList.child('.x-form-item').radioClass('x-checkboxcombo-item-over');
         } else {
            Ext.get(el).next().radioClass('x-checkboxcombo-item-over');
         }
      }
   },

   // private
   selectPrev: function () {
      var ct = this.store.getCount();
      if (ct > 0) {
         var el = Ext.DomQuery.selectNode('.x-checkboxcombo-item-over', this.list.dom);
         if (!el) {
            this.innerList.child('.x-form-item').radioClass('x-checkboxcombo-item-over');
         } else {
            Ext.get(el).prev().radioClass('x-checkboxcombo-item-over');
         }
      }
   },

   // private
   validateBlur: function () {
      return !this.list || !this.list.isVisible();
   },

   // private
   beforeBlur: function () {
      this.assertValue();
   },

   // private
   postBlur: function () {
      Ext.ux.form.CheckboxCombo.superclass.postBlur.call(this);
      this.collapse();
      this.inKeyMode = false;
   },

   /**
    * Hides the dropdown list if it is currently expanded. Fires the {@link #collapse} event on completion.
    */
   collapse: function () {
      if (!this.isExpanded()) {
         return;
      }
      this.list.hide();
      Ext.getDoc().un('mousewheel', this.collapseIf, this);
      Ext.getDoc().un('mousedown', this.collapseIf, this);
      this.beforeBlur();
      this.fireEvent('collapse', this);
   },

   // private
   collapseIf: function (e) {
      if (!e.within(this.wrap) && !e.within(this.list)) {
         this.collapse();
      }
   },

   /**
    * Expands the dropdown list if it is currently hidden. Fires the {@link #expand} event on completion.
    */
   expand: function () {
      if (this.isExpanded() || !this.hasFocus) {
         return;
      }
      if (this.bufferSize) {
         this.doResize(this.bufferSize);
         delete this.bufferSize;
      }
      this.list.alignTo.apply(this.list, [this.el].concat(this.listAlign));
      this.list.show();
      if (Ext.isGecko2) {
         this.innerList.setOverflow('auto'); // necessary for FF 2.0/Mac
      }
      this.mon(Ext.getDoc(), {
         scope: this,
         mousewheel: this.collapseIf,
         mousedown: this.collapseIf
      });
      this.fireEvent('expand', this);
   },

   removeCheckboxes: function () {
      this.cbgroup.destroy();

/*this.cbgroup.items.each(function(cb) {
			cb.destroy();
		}, this);*/
   },

   addCheckboxes: function () {
      this.cbgroup = new Ext.form.CheckboxGroup({
         renderTo: this.innerList,
         columns: 1,
         autoHeight: true,
         border: false,
         items: [{}]
      });

      this.cbgroup.items.items[0].destroy();

      var col = this.cbgroup.panel.items.get(0);

      // Add new checkboxes from store
      Ext.each(this.store.data.items, function (rec) {
         var checkbox = new Ext.form.Checkbox({
            name: rec.data.id + '-checkbox',
            boxLabel: rec.data[this.displayField],
            inputValue: rec.data[this.valueField],
            checked: (rec.checked ? rec.checked : false)
         });
         this.cbgroup.items.add(checkbox);
         col.add(checkbox);
      }, this);

      this.cbgroup.panel.doLayout();
   },

   /**
    * @method onTriggerClick
    * @hide
    */
   // private
   // Implements the default empty TriggerField.onTriggerClick function
   onTriggerClick: function () {
      if (this.readOnly || this.disabled) {
         return;
      }
      if (this.isExpanded()) {
         this.collapse();
         this.el.focus();
      } else {
         this.onFocus({});
         if (this.triggerAction == 'all') {
            this.store.reload();
         }
         this.expand();
         this.el.focus();
      }
   },

   // A renderer for displaying the values in a grid
   gridRenderer: function (value) {
      if (typeof value == 'string') {
         value = value.split(',');
      }

      var text = [];

      Ext.each(value, function (v) {
         if (this.valueField) {
            var r = this.findRecord(this.valueField, v);
            if (r) {
               text.push(r.data[this.displayField]);
            }
         }
      }, this);

      return text.join(', ');
   }
});
Ext.reg('checkboxcombo', Ext.ux.form.CheckboxCombo);