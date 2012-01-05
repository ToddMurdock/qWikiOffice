/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

QoDesk.QoAdmin.MembersTooltipEditor = Ext.extend(QoDesk.QoAdmin.TooltipEditor, {
   initComponent : function(){
      Ext.apply(this, {
         treeLoaderMethod: 'viewMemberGroups'
      });

      QoDesk.QoAdmin.MembersTooltipEditor.superclass.initComponent.call(this);
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
      QoDesk.QoAdmin.MembersTooltipEditor.superclass.show.call(this, record, cb, scope);
      if(record){
         // set title
         this.tree.setTitle(Ext.util.Format.ellipsis(record.data.first_name + ' ' + record.data.last_name, 15) + '\'s Groups')
         // reload
         this.tree.getLoader().baseParams.id = record.data.id;
         this.reloadTree();
      }
   }

   /**
    * Override.
    * The callback function is passed an array of the checked group ids.
    */
   , onSaveClick : function(){
      if(this.callback && this.scope){
         var ns = this.tree.getChecked();
         var ids = [];
         Ext.each(ns, function(n){
            ids.push(n.id);
         });
         if(ids.length > 0){
            this.callback.call(this.scope, ids);
            this.hide();
         }
      }
   }
});