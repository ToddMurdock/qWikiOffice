/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

QoDesk.QoAdmin.TooltipEditor = Ext.extend(Ext.ToolTip, {
   /**
    * @cfg {Ext.grid.GridPanel}
    */
   grid: null
   /**
    * @cfg {String}
    */
   , treeLoaderMethod: ''
   /**
    * Read only.  The record being edited.
    */
   , record: null

   , initComponent : function(){
      this.saveButton = new Ext.Button({
         handler: this.onSaveClick
         , scope: this
         , text: 'Save'
      });

      this.tree = new Ext.tree.TreePanel({
         animate: false
         , autoScroll: true
         , buttons: [
            this.saveButton
         ]
         , frame: true
         , height: 250
         , iconCls: 'qo-admin-edit-icon-16'
         , lines: false
         , listeners: {
            'checkchange': { fn: this.onTreeCheckChange, scope: this }
            , 'expandnode': { fn: this.onTreeNodeExpand, scope: this }
         }
         , loader: new Ext.tree.TreeLoader({
            baseParams: {
               method: this.treeLoaderMethod
               , moduleId: this.ownerModule.id
            }
            , dataUrl: this.ownerModule.app.connection
            , listeners: {
               'beforeload': {
                  fn: function(treeLoader, node){
                     return treeLoader.baseParams.id ? true : false;
                  }
                  , scope: this
               }
               , 'load': {
                  fn: function(treeLoader, node){
                     node.expand(true);
                  }
               }
            }
         })
         , rootVisible: false
         , root: new Ext.tree.AsyncTreeNode({
            text: 'Privilege'
         })
         , title: 'Edit'
         , width: 250
      });

      Ext.apply(this, {
         anchor: 'left'
         , autoHeight: true
         , autoHide: false
         , autoWidth: true
         , items: this.tree
         , layout: 'fit'
      });

      QoDesk.QoAdmin.TooltipEditor.superclass.initComponent.call(this);
      this.addClass('qo-admin-tooltip-editor');
   }

   , initEvents : function(){
      QoDesk.QoAdmin.TooltipEditor.superclass.initEvents.call(this);
      this.grid.on('destroy', function(){
         this.hide();
         this.destroy();
      }, this);
      this.grid.getSelectionModel().on('selectionchange', function(){
         if(!this.hidden){
            this.hide();
         }
      }, this, { buffer: 150 });
   }

   /**
    * Override.
    * Shows this tooltip at the currently selected grid row XY position.
    *
    * @param {Ext.data.Record} record The record to edit.
    * @param {Function} cb
    * @param {Object} scope
    */
   , show : function(record, cb, scope){
      if(record){
         this.record = record;

         if(cb){
            this.callback = cb;
         }
         if(scope){
            this.scope = scope;
         }

         if(this.anchor){
            // pre-show it off screen so that the el will have dimensions
            // for positioning calcs when getting xy next
            this.showAt([-1000,-1000]);
            this.origConstrainPosition = this.constrainPosition;
            this.constrainPosition = false;
            this.anchor = this.origAnchor;
         }

         this.saveButton.disable();
         this.alignToTarget();

         if(this.anchor){
            this.syncAnchor();
            this.anchorEl.show();
            this.constrainPosition = this.origConstrainPosition;
         }else{
            this.anchorEl.hide();
         }
      }
   }

   , reloadTree : function(){
      if(this.tree.root.isLoading()){
         Ext.Ajax.abort(this.tree.getLoader().transId);
         this.tree.root.loading = false;
      }
      this.tree.root.reload();
   }

   , hide: function(){
      this.record = null;
      if(this.body.isMasked()){
         this.body.unmask();
      }
      QoDesk.QoAdmin.TooltipEditor.superclass.hide.call(this);
   }

   /**
    * Override
    */
   , getTargetXY : function(){
      if(this.record){
         var view = this.grid.getView();
         //var store = this.grid.getStore();
         //var el = view.getRow(store.indexOf(this.record));
         var cell = this.grid.getSelectionModel().getSelectedCell();
         var el = view.getCell(cell[0], cell[1]);
         //var xy = Ext.fly(el).getXY();
         //xy[0] = xy[0] + Ext.fly(el).getWidth() - 1;

         this.targetCounter++;
         //var offsets = this.getOffsets(),
         var xy = (this.anchorToTarget && !this.trackMouse) ? this.el.getAlignToXY(Ext.fly(el), this.getAnchorAlign()) : this.targetXY,
            dw = Ext.lib.Dom.getViewWidth() - 5,
            dh = Ext.lib.Dom.getViewHeight() - 5,
            de = document.documentElement,
            bd = document.body,
            scrollX = (de.scrollLeft || bd.scrollLeft || 0) + 5,
            scrollY = (de.scrollTop || bd.scrollTop || 0) + 5,
            //axy = [xy[0] + offsets[0], xy[1] + offsets[1]],
            axy = [xy[0], xy[1]],
            sz = this.getSize();

         this.anchorEl.removeClass(this.anchorCls);

         if(this.targetCounter < 2){
            if(axy[0] < scrollX){
               if(this.anchorToTarget){
                  this.defaultAlign = 'l-r';
                  if(this.mouseOffset){this.mouseOffset[0] *= -1;}
               }
               this.anchor = 'left';
               return this.getTargetXY();
            }
            if(axy[0]+sz.width > dw){
               if(this.anchorToTarget){
                  this.defaultAlign = 'r-l';
                  if(this.mouseOffset){this.mouseOffset[0] *= -1;}
               }
               this.anchor = 'right';
               return this.getTargetXY();
            }
            if(axy[1] < scrollY){
               if(this.anchorToTarget){
                  this.defaultAlign = 't-b';
                  if(this.mouseOffset){this.mouseOffset[1] *= -1;}
               }
               this.anchor = 'top';
               return this.getTargetXY();
            }
            if(axy[1]+sz.height > dh){
               if(this.anchorToTarget){
                  this.defaultAlign = 'b-t';
                  if(this.mouseOffset){this.mouseOffset[1] *= -1;}
               }
               this.anchor = 'bottom';
               return this.getTargetXY();
            }
         }

         this.anchorCls = 'x-tip-anchor-'+this.getAnchorPosition();
         this.anchorEl.addClass(this.anchorCls);
         this.targetCounter = 0;
         return axy;
      }
      return null;
   }

   , alignToTarget : function(){
      var xy = this.getTargetXY();
      if(xy){
         this.showAt(xy);
      }
   }

   , onTreeCheckChange : function(node, checked){
      // if parent node is unchecked, check it
      if(checked && node.parentNode){
         var ui = node.parentNode.getUI();
         if(ui.isChecked() === false){
            ui.toggleCheck(true);
         }
      }
      // if node is unchecked, uncheck its children
      else if(node.hasChildNodes()){
         node.eachChild(function(child){
            var ui = child.getUI();
            if(ui.isChecked() === true){
               ui.toggleCheck(false);
            }
         }, this);
      }
      // something needs to be checked to save
      this.saveButton.setDisabled(this.tree.getChecked().length > 0 ? false : true);
   }

   , onTreeNodeExpand : function(node){
      if(node.id !== this.tree.root.id && node.hasChildNodes() && node.getUI().isChecked() === false){
         node.eachChild(function(child){
            var ui = child.getUI();
            if(ui.isChecked() === true){
               ui.toggleCheck(false);
            }
         }, this);
      }
   }

   /**
    * Override this function.
    */
   , onSaveClick : function(){
      this.hide();
   }
});