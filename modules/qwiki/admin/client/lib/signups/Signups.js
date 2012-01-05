/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

QoDesk.QoAdmin.Signups = function(ownerModule){
   this.ownerModule = ownerModule;
   
   this.groupComboStore = new Ext.data.Store({
      baseParams: {
         method: 'loadGroupsCombo'
         , moduleId: this.ownerModule.id
         , memberId: this.memberId
        }
      , proxy: new Ext.data.HttpProxy({
         url: this.ownerModule.app.connection
        })
      , reader: new Ext.data.JsonReader({
         id: 'id'
         , root: 'groups'
         , totalProperty: 'total'
        }
      , [{name: 'id'}, {name: 'name'}, {name: 'description'}, {name: 'active'}])
   });
        
   this.groupCombo = new Ext.form.ComboBox({
      disabled: this.ownerModule.app.isAllowedTo('loadGroupsCombo', this.ownerModule.id) ? false : true
      , displayField: 'name'
      , editable: false
      , emptyText: 'Approve to group...'
      , forceSelection: true
      , listeners: {
         'select': {fn: this.onApproveClick, scope: this}
      }
      , require: 'selection'
      , mode: 'remote'
      , selectOnFocus: true
      , store: this.groupComboStore
      , triggerAction: 'all'
      , valueField: 'id'
   });
   
   this.detail = new QoDesk.QoAdmin.SignupsDetail({
      ownerModule: this.ownerModule
      , ownerPanel: this
      , region: 'center'
   });
            
   this.grid = new QoDesk.QoAdmin.SignupsGrid({
      listeners: {
         'load': { fn: this.onGridLoad, scope: this }
         , 'rowselect': { buffer: 450, fn: this.onGridRowSelect, scope: this }
      }
      , ownerModule: ownerModule
      , ownerPanel: this
      , region: 'west'
      , split: true
   });
   //this.grid.getSelectionModel().on('rowselect', this.onGridRowSelect, this, {buffer: 450});
   
   QoDesk.QoAdmin.Signups.superclass.constructor.call(this, {
      border: false
      , closable:true
      , id: 'qo-admin-signups'
      , items: [
         this.grid
         , this.detail
        ]
      , layout: 'border'
      , tbar: [
         {
            disabled: this.ownerModule.app.isAllowedTo('viewAllSignups', this.ownerModule.id) ? false : true
            , handler: this.onRefresh
            , iconCls: 'qo-admin-refresh'
            , require: null
            , scope: this
            , tooltip: 'Refresh'
         }
         , '-'
         , this.groupCombo
         , {
            disabled: this.ownerModule.app.isAllowedTo('denySignups', this.ownerModule.id) ? false : true
            , handler: this.onDenyClick
            , require: 'selection'
            , scope: this
            , text: 'Deny'
            , tooltip: 'Deny membership for selected'
         }
         , {
            disabled: this.ownerModule.app.isAllowedTo('markSignupsAsSpam', this.ownerModule.id) ? false : true
            , handler: this.onSpamClick
            , require: 'selection'
            , scope: this
            , text: 'Mark As Spam'
            , tooltip: 'Mark selected as spam'
         }
      ]
      , title: 'Signup Requests'
   });
};

Ext.extend(QoDesk.QoAdmin.Signups, Ext.Panel, {
   selectedId : null

   , encodeIds : function(){
      var sm = this.grid.getSelectionModel();
      var count = sm.getCount();
      var selected = sm.getSelections();
      var selectedIds = [];

      for(var i = 0; i < count; i++){
         selectedIds[i] = selected[i].id;
      }

      return Ext.encode(selectedIds);
   }

   , onApproveClick : function(combo, sel){
      if(sel && sel.id){
         this.showMask('Please wait...');

         this.groupCombo.clearValue();

         this.doAction({
            method: "approveSignupsToGroup"
            , moduleId: this.ownerModule.id
            , signupIds: this.encodeIds()
            , groupId: sel.id
         });
      }
   }
    
   , onDenyClick : function(){
      this.doAction({
         method: "denySignups"
         , moduleId: this.ownerModule.id
         , signupIds: this.encodeIds()
      });
   }
    
   , onSpamClick : function(){
      this.doAction({
         method: "markSignupsAsSpam"
         , moduleId: this.ownerModule.id
         , signupIds: this.encodeIds()
      });
   }

   , onRefreshClick : function(){
      this.showMask('Refreshing...');
      this.groupCombo.store.reload();
      this.grid.store.reload({
         callback: this.hideMask
         , scope: this
      });
   }
   
   , doAction : function(params){
      this.showMask('Please wait...');
         
      //submit to server
      Ext.Ajax.request({
         waitMsg: 'Saving changes...'
         , url: this.ownerModule.app.connection
         , params: params
         , failure: function(response, options){
            this.hideMask();
            Ext.MessageBox.alert('Warning', 'Lost connection to the server!');
         }                                      
         , success: function(o){
            var decoded = Ext.decode(o.responseText);
            
            if(decoded.success){
               var ds = this.grid.getStore();
               var rCount = decoded.r.length;
               var kCount = decoded.k.length;
               var firstSelIndex = 9999;
         
               // if some were not removed, display alert
               if(kCount > 0){
                  Ext.MessageBox.alert('Warning', kCount+' errors occured!');
               }
               
               // loop through removed
               for(var i = 0; i < rCount; i++){
                  // get the last (largest) index
                  var memberIndex = ds.indexOfId(decoded.r[i]);
                  
                  firstSelIndex = memberIndex < firstSelIndex ? memberIndex : firstSelIndex;
                  // remove the deleted from the ds
                  ds.remove(ds.getById(decoded.r[i]));
               }
               
               // handle new selection, leave kept selected
               if(kCount == 0){
                  var dsCount = ds.getCount();
                  if(dsCount <= firstSelIndex){
                     this.grid.getSelectionModel().selectRow(firstSelIndex-1);
                  }else{
                     this.grid.getSelectionModel().selectRow(firstSelIndex);
                  }
               }
            }
            
            this.hideMask();
         }
         , scope: this
      });
   }

   , onGridLoad : function(){
      this.handleButtonState();
   }

   , onGridRowSelect : function(sm, index, record){
      if(record && record.data){
         this.viewDetail(record.data);
      }

      this.handleButtonState();
   }

   , viewDetail : function(data){
      if(data){          
         var detail = this.detail;
         var memberId = data.id;
         
         //if(this.selectedId !== memberId){
            this.selectedId = memberId;
            
            // update the detail
            detail.setMemberId(memberId);
            detail.updateDetail(data);
         //}
      }
   }

   , handleButtonState : function(){
      var sm = this.grid.getSelectionModel();
      var hasSelection = sm.hasSelection();

      //this.groupCombo.setDisabled(!hasSelection);
      var tbar = this.getTopToolbar();

      tbar.items.each(function(item){
         if(item.require === 'selection'){
            item.setDisabled(!hasSelection);
         }
      }, this);
   }

   , showMask : function(msg){
      this.ownerModule.win.body.mask(msg+'...', 'x-mask-loading');
   }

   , hideMask : function(){
      this.ownerModule.win.body.unmask();
   }
});