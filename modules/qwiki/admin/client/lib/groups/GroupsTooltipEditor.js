/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

QoDesk.QoAdmin.GroupsTooltipEditor = Ext.extend(QoDesk.QoAdmin.TooltipEditor, {
   initComponent : function(){
      Ext.apply(this, {
         treeLoaderMethod: 'viewGroupPrivileges'
      });

      QoDesk.QoAdmin.GroupsTooltipEditor.superclass.initComponent.call(this);
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
      QoDesk.QoAdmin.GroupsTooltipEditor.superclass.show.call(this, record, cb, scope);
      if(record){
         // set title
         this.tree.setTitle(Ext.util.Format.ellipsis(record.data.name, 15) +  '\'s Privilege')
         // reload
         this.tree.getLoader().baseParams.id = record.data.id;
         this.reloadTree();
      }
   }

   /**
    * Override.
    */
   , onTreeCheckChange : function(node, checked){
      // only allow 1 node to be checked
      if(checked){
         var ns = this.tree.getChecked();
         for(var i = 0, len = ns.length; i < len; i++){
            if(ns[i].id !== node.id){
               ns[i].getUI().toggleCheck(false);
            }
         }
      }
      this.saveButton.setDisabled(this.tree.getChecked().length > 0 ? false : true);
   }

   /**
    * Override.
    * The callback function is passed an array of the checked privilege id.
    */
   , onSaveClick : function(){
      if(this.callback && this.scope){
         var ns = this.tree.getChecked();
         if(ns.length > 0){
            this.callback.call(this.scope, ns[0].id);
            this.hide();
         }
      }
   }
});