/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

QoDesk.QoAdmin.PrivilegesTooltipEditor = Ext.extend(QoDesk.QoAdmin.TooltipEditor, {
   initComponent : function(){
      Ext.apply(this, {
         treeLoaderMethod: 'viewPrivilegeModules'
      });

      QoDesk.QoAdmin.PrivilegesTooltipEditor.superclass.initComponent.call(this);
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
      QoDesk.QoAdmin.PrivilegesTooltipEditor.superclass.show.call(this, record, cb, scope);
      if(record){
         // set title
         this.tree.setTitle(Ext.util.Format.ellipsis(record.data.name, 15) +  '\'s Modules')
         // reload
         this.tree.getLoader().baseParams.id = record.data.id;
         this.reloadTree();
      }
   }

   /**
    * The callback function is passed an array of the checked privilege ids.
    */
   , onSaveClick : function(){
      var simplify = function(node, list){
         node.eachChild(function(child){
            // checked?
            var ui = child.getUI();
            if(ui.isChecked() === true){
               // module?
               if(child.attributes.moduleId){
                  list[child.attributes.moduleId] = simplify(child, []);
               }
               // method?
               if(child.attributes.methodId){
                  list.push(child.attributes.methodId);
               }
            }
         }, this);
         return list;
      };

      if(this.callback && this.scope){
         this.callback.call(this.scope, simplify(this.tree.root, {}));
         this.hide();
      }
   }
});