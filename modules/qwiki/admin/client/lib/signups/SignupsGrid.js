QoDesk.QoAdmin.SignupsGrid = Ext.extend(Ext.grid.GridPanel, {
   constructor : function(config){
   	config = config || {};
   	
   	this.ownerModule = config.ownerModule;

	   var sm = new Ext.grid.RowSelectionModel({
	      singleSelect: false
	   });
	   
	   var store = new Ext.data.Store ({
	      listeners: {
	         'load': {
	            fn: function(s){
	               if(s.data.length > 0){ this.selectRow(0); }
	            }
	            , scope: sm
	            , single: true
	         }
	      }
	      , proxy: new Ext.data.HttpProxy ({ 
	         scope: this
	         , url: this.ownerModule.app.connection
	      })
	      , baseParams: {
	         method: 'viewAllSignups'
	         , moduleId: this.ownerModule.id
	      }
	      , reader: new Ext.data.JsonReader ({
	         root: 'qo_signups'
	         , id: 'id'
	         , fields: [
	            {name: 'id'}
	            , {name: 'first_name'}
	            , {name: 'last_name'}
	            , {name: 'email_address'}
	            , {name: 'comments'}
	         ]
	      })
	   });
	   
	   var cm = new Ext.grid.ColumnModel([
	      {
	         id:'id'
	         , header: 'ID'
	         , dataIndex: 'id'
	         , width: 40
	      },{   
	         header: 'Name'
	         , dataIndex: 'last_name'
	         , renderer: function(value, p, record){
	            return String.format(
	               '{0}, {1}',
	            value, record.data.first_name);
	           }
	         , width: 172
	      }
	   ]);
	   
	   cm.defaultSortable = true;
	
	   Ext.apply(config, {
	      border: false
	      , cm: cm
	      , id: 'qo-admin-signups-list'
	      , region: 'west'
	      , selModel: sm
	      , split: true
	      , store: store
	      , viewConfig: {
	         emptyText: 'No signup requests to display...'
	      }
	      , width: 233
	   });
	   
	   QoDesk.QoAdmin.SignupsGrid.superclass.constructor.call(this, config);

      this.relayEvents(store, ['load']);
      this.relayEvents(sm, ['rowselect']);

	   store.load();
   }
});