/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

QoDesk.QoAdmin.Members = Ext.extend(Ext.grid.EditorGridPanel, {
   ownerModule: null

   , constructor : function(config){
      config = config || {};

      this.ownerModule = config.ownerModule;

      var memberRecord = Ext.data.Record.create([
         {name: 'id', type: 'integer'}
         , {name: 'first_name', type: 'string'}
         , {name: 'last_name', type: 'string'}
         , {name: 'email_address', type: 'string'}
         , {name: 'password', type: 'string'}
         , {name: 'locale', type: 'string'}
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
	         header: 'Last Name'
	         , dataIndex: 'last_name'
            , editor: {
               allowBlank: false
               , xtype: 'textfield'
            }
	         , menuDisabled: true
	         , sortable: true
            , width: 120
	      }
         , {
	         header: 'First Name'
	         , dataIndex: 'first_name'
            , editor: {
               allowBlank: false
               , xtype: 'textfield'
            }
	         , menuDisabled: true
            , sortable: true
            , width: 120
	      }
         , {
	         header: 'Email'
	         , dataIndex: 'email_address'
            , editor: {
               allowBlank: false
               , vtype: 'email'
               , xtype: 'textfield'
            }
	         , menuDisabled: true
	         , sortable: true
            , width: 150
	      }
         , {
	         header: 'Password'
	         , dataIndex: 'password'
            , editor: {
               allowBlank: false
               , xtype: 'textfield'
            }
	         , menuDisabled: true
            , width: 120
	      }
         , {
	         header: 'Locale'
	         , dataIndex: 'locale'
            , editor: {
               allowBlank: false
               , xtype: 'textfield'
            }
	         , menuDisabled: true
	         , sortable: true
            , width: 50
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
            filterField: 'last_name'
            , method: 'viewMembers'
            , moduleId: this.ownerModule.id
         }
         , fields: memberRecord
         , idProperty: 'id'
         , listeners: {
            'update': { fn: this.onStoreUpdate, scope: this }
         }
         , root: 'qo_members'
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
               { checked: true, checkHandler: checkHandler, group: 'filterField', key: 'last_name', scope: this, text: 'Last Name' }
               , { checked: false, checkHandler: checkHandler, group: 'filterField', key: 'first_name', scope: this, text: 'First Name' }
               , { checked: false, checkHandler: checkHandler, group: 'filterField', key: 'email_address', scope: this, text: 'Email Address' }
               , { checked: false, checkHandler: checkHandler, group: 'filterField', key: 'active', scope: this, text: 'Active' }
            ]
         })
         , text: 'Last Name'
      });

	   Ext.applyIf(config, {
	      border: false
         , bbar: new Ext.PagingToolbar({
            displayInfo: true
            , displayMsg: 'Displaying member {0} - {1} of {2}'
            , emptyMsg: 'No members to display'
            , pageSize: 30
            , store: store
         })
         , closable: true
         , cm: cm
         , id: 'qo-admin-members'
         , loadMask: true
         , store: store
         , tbar: [
            {
               disabled: this.ownerModule.app.isAllowedTo('addMember', this.ownerModule.id) ? false : true
               , handler: this.onAddClick
               , iconCls: 'qo-admin-add-icon-16'
               , scope: this
               , text: 'Add'
               , tooltip: 'Add a new member'
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
               , handler: this.onGroupsClick
               , iconCls: 'qo-admin-edit-icon-16'
               , ref: '../viewGroupsBtn'
               , scope: this
               , text: 'Groups'
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
         , title: 'Members'
	      , viewConfig: {
	         emptyText: 'No members to display...'
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

      QoDesk.QoAdmin.Members.superclass.constructor.call(this, config);

      this.gridEditor = new QoDesk.QoAdmin.MembersTooltipEditor({
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
            if(this.ownerModule.app.isAllowedTo('deleteMember', this.ownerModule.id)){
               this.deleteBtn.enable();
            }
         }
         // view groups button
         if(this.viewGroupsBtn.disabled){
            this.viewGroupsBtn.enable();
         }
      }else{
         this.deleteBtn.disable();
         this.viewGroupsBtn.disable();
      }
   }

   , onStoreUpdate : function(){
      this.setSaveBtnDisabled(false);
   }

   , setSaveBtnDisabled : function(disable){
      if(disable === true){
         this.saveBtn.disable();
      }else{
         if(this.saveBtn.disabled && this.ownerModule.app.isAllowedTo('editMember', this.ownerModule.id)){
            this.saveBtn.enable();
         }
      }
   }

   , onAddClick : function(){
      var u = new this.store.recordType({
         last_name : ''
         , first_name: ''
         , email_address : ''
         , password: ''
         , locale: 'en'
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
            this.deleteMember(rec);
         }
      }
   }

   /**
    * @param {Ext.data.Record} record
    */
   , deleteMember : function(record){
      Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete member id: ' + record.data.id + '?', function(btn){
         if(btn === "yes"){
            this.showMask('Deleting...');

            Ext.Ajax.request({
               callback: function(options, success, response){
                  this.hideMask();
                  if(success){
                     var decoded = Ext.decode(response.responseText);
                     var deleted = decoded.deleted;
                     var fCount = decoded.failed.length;

                     // if member(s) were not removed, display alert
                     if(fCount > 0){
                        Ext.MessageBox.alert('Warning', fCount+' member(s) were not deleted!');
                     }

                     // loop through deleted members
                     for(var i = 0, len = deleted.length; i < len; i++){
                        this.store.remove(this.store.getById(deleted[i].store_id));
                     }
                  }else{
                     Ext.MessageBox.alert('Warning', 'Lost connection to the server!');
                  }
               }
               , params: {
                  data: Ext.encode([{store_id: record.id, id: record.data.id}])
                  , method: 'deleteMember'
                  , moduleId: this.ownerModule.id
               }
               , scope: this
               , url: this.ownerModule.app.connection
            });
         }
      }, this);
   }

   , onGroupsClick : function(){
      var index = this.getSelectionModel().getSelectedCell();
      if(!index){
         return;
      }

      var record = this.store.getAt(index[0]);
      if(!record || record.phantom === true){
         return;
      }

      this.gridEditor.show(record, function(groupIds){
         this.showMask('Updating Groups...');
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
               method: 'editMembersGroups'
               , moduleId: this.ownerModule.id
               , memberId: record.data.id
               , groupIds: Ext.encode(groupIds)
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
      if(Ext.isFunction(this[action + 'Member'])){
         this[action + 'Member'](rs);
      }
   }

   /**
    * @param {Ext.data.Record[]} rs The phantom records to create.
    */
   , createMember : function(rs){
      this.showMask('Saving...');

      var data = [];
      for(var i = 0, len = rs.length; i < len; i++){
         var o = rs[i].data;
         o.store_id = rs[i].id;
         data.push(o);
      }

      // data should look like this
      // [{"last_name":"Test","first_name":"Name","email_address":"t@a.com","password":"test","locale":"en","store_id":"ext-record-1"}]

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
                  Ext.MessageBox.alert('Warning', 'Not all members were created!');
               }

               // update created ids?
               var created = decoded.created;
               if(created.length > 0){
                  for(var j = 0, jlen = created.length; j < jlen; j++){
                     var r = this.store.getById(created[j].store_id);
                     if(r){
                        // set the id to the created id
                        r.set('id', created[j].id);
                        r.phantom = false;
                     }
                  }

                  this.store.commitChanges();
                  this.setSaveBtnDisabled(true);
                  Ext.MessageBox.alert('Alert', 'Be sure to add new members to a group!');
               }
            }else{
               Ext.MessageBox.alert('Warning', 'Lost connection to the server!');
            }
         }
         , params: {
            data: Ext.encode(data)
            , method: 'addMember'
            , moduleId: this.ownerModule.id
         }
         , scope: this
         , url: this.ownerModule.app.connection
      });
   }

   /**
    * @param {Ext.data.Record[]} rs
    */
   , updateMember : function(rs){
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
            , method: 'editMember'
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