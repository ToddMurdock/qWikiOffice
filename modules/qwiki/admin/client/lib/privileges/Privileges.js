/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

QoDesk.QoAdmin.Privileges = Ext.extend(Ext.grid.EditorGridPanel, {
   ownerModule: null

   , constructor : function(config){
      config = config || {};

      this.ownerModule = config.ownerModule;

      var privilegeRecord = Ext.data.Record.create([
         {name: 'id', type: 'integer'}
         , {name: 'name', type: 'string'}
         , {name: 'description', type: 'string'}
         , {name: 'active', type: 'bool'}
      ]);

      var cm = new Ext.grid.ColumnModel([
         {
            header: 'Id'
	         , dataIndex: 'id'
	         , menuDisabled: true
            , sortable: true
            , width: 40
         }
	      , {
	         header: 'Name'
	         , dataIndex: 'name'
            , editor: {
               allowBlank: false
               , xtype: 'textfield'
            }
	         , menuDisabled: true
	         , sortable: true
            , width: 150
	      }
         , {
	         header: 'Description'
	         , dataIndex: 'description'
            , editor: {
               allowBlank: false
               , xtype: 'textfield'
            }
	         , menuDisabled: true
	         , sortable: true
            , width: 410
	      }
         , {
            header: 'Active'
            , dataIndex: 'active'
            , editor: {
               xtype: 'checkbox'
            }
            , falseText: 'No'
            , menuDisabled: true
            , trueText: 'Yes'
            , sortable: true
            , width: 50
            , xtype: 'booleancolumn'
         }
	   ]);

	   cm.defaultSortable = true;

      var store = new Ext.data.JsonStore ({
         autoSave: false
         , baseParams: {
            filterField: 'name'
            , method: 'viewPrivileges'
            , moduleId: this.ownerModule.id
         }
         , fields: privilegeRecord
         , idProperty: 'id'
         , listeners: {
            'update': { fn: this.onStoreUpdate, scope: this }
         }
         , root: 'qo_privileges'
         , url: this.ownerModule.app.connection
      });

      var checkHandler = function(item, checked){
         if(checked){
            var store = this.getStore();
            store.baseParams.filterField = item.key;
            searchFieldBtn.setText(item.text);
         }
      };

      var searchFieldBtn = new Ext.Button({
         menu: new Ext.menu.Menu({
            items: [
               { checked: true, checkHandler: checkHandler, group: 'filterField', key: 'name', scope: this, text: 'Name' }
               , { checked: false, checkHandler: checkHandler, group: 'filterField', key: 'description', scope: this, text: 'Description' }
               , { checked: false, checkHandler: checkHandler, group: 'filterField', key: 'active', scope: this, text: 'Active' }
            ]
         })
         , text: 'Name'
      });

	   Ext.applyIf(config, {
	      border: false
         , bbar: new Ext.PagingToolbar({
            displayInfo: true
            , displayMsg: 'Displaying privilege {0} - {1} of {2}'
            , emptyMsg: 'No privileges to display'
            , pageSize: 30
            , store: store
         })
         , closable: true
         , cm: cm
         , id: 'qo-admin-privileges'
         , loadMask: true
         , store: store
         , tbar: [
            {
               disabled: this.ownerModule.app.isAllowedTo('addPrivilege', this.ownerModule.id) ? false : true
               , handler: this.onAddClick
               , iconCls: 'qo-admin-add-icon-16'
               , scope: this
               , text: 'Add'
               , tooltip: 'Add a new privilege'
            }
            , '-'
            , {
               disabled: true
               , handler: this.onDeleteClick
               , iconCls: 'qo-admin-delete-icon-16'
               , ref: '../deleteBtn'
               , scope: this
               , text: 'Delete'
               , tooltip: 'Delete selected'
            }
            , '-'
            , {
               disabled: true
               , handler: this.onSaveClick
               , iconCls: 'qo-admin-save-icon-16'
               , ref: '../saveBtn'
               , scope: this
               , text: 'Save'
            }
            , '-'
            , {
               disabled: true
               , handler: this.onPrivilegeClick
               , iconCls: 'qo-admin-edit-icon-16'
               , ref: '../viewModulesBtn'
               , scope: this
               , text: 'Modules'
            }
            , '-', '->'
            , {
               text: 'Search by:'
               , xtype: 'tbtext'
            }
            , ' '
            , searchFieldBtn
            , ' ', ' '
            , new QoDesk.QoAdmin.SearchField({
               paramName: 'filterText'
               , store: store
            })
         ]
         , title: 'Privileges'
	      , viewConfig: {
	         emptyText: 'No privileges to display...'
            //, ignoreAdd: true
	         , getRowClass : function(r){
	            var d = r.data;
	            if(!d.active){
                  return 'qo-admin-inactive';
	            }
	            return '';
	         }
	      }
	   });

      QoDesk.QoAdmin.Privileges.superclass.constructor.call(this, config);

      this.gridEditor = new QoDesk.QoAdmin.PrivilegesTooltipEditor({
         grid: this
         , ownerModule: this.ownerModule
      });

      this.on({
         'render': {
            fn: function(){
               this.getStore().load();
            }
            , scope: this
            , single: true
         }
      });

      this.getSelectionModel().on('selectionchange', this.onSelectionChange, this);
	}

   // added methods

   /**
    * @param {Ext.grid.CellSelectionModel} sm
    * @param {Object} sel
    */
   , onSelectionChange : function(sm, sel){
      if(sel){
         // delete button
         if(this.deleteBtn.disabled){
            if(this.ownerModule.app.isAllowedTo('deletePrivilege', this.ownerModule.id)){
               this.deleteBtn.enable();
            }
         }
         // view privileges button
         if(this.viewModulesBtn.disabled){
            if(this.ownerModule.app.isAllowedTo('editPrivilegeModules', this.ownerModule.id)){
               this.viewModulesBtn.enable();
            }
         }
      }else{
         this.deleteBtn.disable();
         this.viewModulesBtn.disable();
      }
   }

   , onStoreUpdate : function(){
      this.setSaveBtnDisabled(false);
   }

   , setSaveBtnDisabled : function(disable){
      if(disable === true){
         this.saveBtn.disable();
      }else{
         if(this.saveBtn.disabled && this.ownerModule.app.isAllowedTo('editPrivilege', this.ownerModule.id)){
            this.saveBtn.enable();
         }
      }
   }

   , onAddClick : function(){
      var u = new this.store.recordType({
         name : ''
         , description: ''
         , active: false
      });
      this.stopEditing();
      this.store.insert(0, u);
      this.startEditing(0, 1);
   }

   , onDeleteClick : function(){
      var index = this.getSelectionModel().getSelectedCell();
      if(index){
         var rec = this.store.getAt(index[0]);
         if(rec.phantom === true){
            this.store.remove(rec);
         }else{
            this.deletePrivilege(rec);
         }
      }
   }

   /**
    * @param {Ext.data.Record} record
    */
   , deletePrivilege : function(record){
      Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete privilege id: ' + record.data.id + '?', function(btn){
         if(btn === "yes"){
            this.showMask('Deleting...');

            Ext.Ajax.request({
               callback: function(options, success, response){
                  this.hideMask();
                  if(success){
                     var decoded = Ext.decode(response.responseText);
                     var deleted = decoded.deleted;
                     var fCount = decoded.failed.length;

                     // if privilege(s) were not removed, display alert
                     if(fCount > 0){
                        Ext.MessageBox.alert('Warning', fCount+' privilege(s) were not deleted!');
                     }

                     // loop through deleted privileges
                     for(var i = 0, len = deleted.length; i < len; i++){
                        this.store.remove(this.store.getById(deleted[i].store_id));
                     }
                  }else{
                     Ext.MessageBox.alert('Warning', 'Lost connection to the server!');
                  }
               }
               , params: {
                  data: Ext.encode([{store_id: record.id, id: record.data.id}])
                  , method: 'deletePrivilege'
                  , moduleId: this.ownerModule.id
               }
               , scope: this
               , url: this.ownerModule.app.connection
            });
         }
      }, this);
   }

   , onPrivilegeClick : function(){
      var index = this.getSelectionModel().getSelectedCell();
      if(!index){
         return;
      }

      var record = this.store.getAt(index[0]);
      if(!record || record.phantom === true){
         return;
      }

      this.gridEditor.show(record, function(data){
         this.showMask('Updating Privileges...');
         Ext.Ajax.request({
            callback: function(options, success, response){
               this.hideMask();
               if(success){
                  var decoded = Ext.decode(response.responseText);
                  if(decoded.success === true){

                  }else{
                     Ext.MessageBox.alert('Warning', 'Error occured on the server!');
                  }
               }else{
                  Ext.MessageBox.alert('Warning', 'Lost connection to the server!');
               }
            }
            , params: {
               method: 'editPrivilegeModules'
               , moduleId: this.ownerModule.id
               , privilegeId: record.data.id
               , data: Ext.encode(data)
            }
            , scope: this
            , url: this.ownerModule.app.connection
         });
      }, this);
   }

   , onSaveClick : function(){
      this.stopEditing();
      var queue = [];

      // Check for modified records. Use a copy so Store#rejectChanges will work if server returns error.
      var rs = [].concat(this.getStore().getModifiedRecords());
      if(rs.length){
         // CREATE:  Next check for phantoms within rs.  splice-off and execute create.
         var phantoms = [];
         for(var i = rs.length-1; i >= 0; i--){
             if(rs[i].phantom === true){
                 var rec = rs.splice(i, 1).shift();
                 if(rec.isValid()){
                     phantoms.push(rec);
                 }
             }else if(!rs[i].isValid()){ // <-- while we're here, splice-off any !isValid real records
                 rs.splice(i,1);
             }
         }
         // If we have valid phantoms, create them...
         if(phantoms.length){
             queue.push(['create', phantoms]);
         }

         // UPDATE:  And finally, if we're still here after splicing-off phantoms and !isValid real records, update the rest...
         if(rs.length){
             queue.push(['update', rs]);
         }

         //
         var trans;
         if(queue.length){
            for(var i = 0, len = queue.length; i < len; i++){
               trans = queue[i];
               this.doTransaction(trans[0], trans[1]);
            }
         }
      }
   }

   /**
    * @param {String} action
    * @param {Ext.data.Record[]} rs
    */
   , doTransaction : function(action, rs){
      if(Ext.isFunction(this[action + 'Privilege'])){
         this[action + 'Privilege'](rs);
      }
   }

   /**
    * @param {Ext.data.Record[]} rs The phantom records to create.
    */
   , createPrivilege : function(rs){
      this.showMask('Saving...');

      var data = [];
      for(var i = 0, len = rs.length; i < len; i++){
         var o = rs[i].data;
         o.store_id = rs[i].id;
         data.push(o);
      }

      // data should look like this
      // [{"name":"My Privilege","description":"My test privilege","active":false,"store_id":"ext-record-1"}]

      Ext.Ajax.request({
         callback: function(options, success, response){
            this.hideMask();
            if(success){
               var decoded = Ext.decode(response.responseText);
               // remove any failed records
               var failed = decoded.failed;
               if(failed.length > 0){
                  for(var i = 0, ilen = failed.length; i < ilen; i++){
                     this.store.remove(this.store.getById(failed[i]));
                  }
                  Ext.MessageBox.alert('Warning', 'Not all privileges were created!');
               }

               // update the created ids
               var created = decoded.created;
               for(var j = 0, jlen = created.length; j < jlen; j++){
                  var r = this.store.getById(created[j].store_id);
                  if(r){
                     // set the id to the created id
                     r.set('id', created[j].id);
                     r.phantom = false;
                  }
               }
               // commit
               this.store.commitChanges();
               this.setSaveBtnDisabled(true);
               Ext.MessageBox.alert('Alert', 'Be sure to add modules to the new privileges!');
            }else{
               Ext.MessageBox.alert('Warning', 'Lost connection to the server!');
            }
         }
         , params: {
            data: Ext.encode(data)
            , method: 'addPrivilege'
            , moduleId: this.ownerModule.id
         }
         , scope: this
         , url: this.ownerModule.app.connection
      });
   }

   /**
    * @param {Ext.data.Record[]} rs
    */
   , updatePrivilege : function(rs){
      this.showMask('Saving...');

      var d = [];
      for(var i = 0, len = rs.length; i < len; i++){
         var o = rs[i].getChanges();
         o.id = rs[i].data.id;
         d.push(o);
      }

      Ext.Ajax.request({
         callback: function(options, success, response){
            this.hideMask();
            if(success){
               var decoded = Ext.decode(response.responseText);
               if(decoded.success === true){
                  this.store.commitChanges();
                  this.setSaveBtnDisabled(true);
               }else{
                  this.store.rejectChanges();
                  Ext.MessageBox.alert('Warning', 'Error occured on the server!');
               }
            }else{
               Ext.MessageBox.alert('Warning', 'Lost connection to the server!');
            }
         }
         , params: {
            data: Ext.encode(d)
            , method: 'editPrivilege'
            , moduleId: this.ownerModule.id
         }
         , scope: this
         , url: this.ownerModule.app.connection
      });
   }

   /**
    * @param {String} msg
    */
   , showMask : function(msg){
      this.body.mask(msg || 'Please wait...', '');
   }

   , hideMask : function(){
      this.body.unmask();
   }
});