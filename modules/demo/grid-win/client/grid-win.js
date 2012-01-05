QoDesk.GridWindow = Ext.extend(Ext.app.Module, {
   id: 'demo-grid',
   type: 'demo/grid',
	dummyData : [ // Array data for the grid
	    ['3m Co',71.72,0.02,0.03,'9/1 12:00am'],
	    ['Alcoa Inc',29.01,0.42,1.47,'9/1 12:00am'],
	    ['American Express Company',52.55,0.01,0.02,'9/1 12:00am'],
	    ['American International Group, Inc.',64.13,0.31,0.49,'9/1 12:00am'],
	    ['AT&T Inc.',31.61,-0.48,-1.54,'9/1 12:00am'],
	    ['Caterpillar Inc.',67.27,0.92,1.39,'9/1 12:00am'],
	    ['Citigroup, Inc.',49.37,0.02,0.04,'9/1 12:00am'],
	    ['Exxon Mobil Corp',68.1,-0.43,-0.64,'9/1 12:00am'],
	    ['General Electric Company',34.14,-0.08,-0.23,'9/1 12:00am'],
	    ['General Motors Corporation',30.27,1.09,3.74,'9/1 12:00am'],
	    ['Hewlett-Packard Co.',36.53,-0.03,-0.08,'9/1 12:00am'],
	    ['Honeywell Intl Inc',38.77,0.05,0.13,'9/1 12:00am'],
	    ['Intel Corporation',19.88,0.31,1.58,'9/1 12:00am'],
	    ['Johnson & Johnson',64.72,0.06,0.09,'9/1 12:00am'],
	    ['Merck & Co., Inc.',40.96,0.41,1.01,'9/1 12:00am'],
	    ['Microsoft Corporation',25.84,0.14,0.54,'9/1 12:00am'],
	    ['The Coca-Cola Company',45.07,0.26,0.58,'9/1 12:00am'],
	    ['The Procter & Gamble Company',61.91,0.01,0.02,'9/1 12:00am'],
	    ['Wal-Mart Stores, Inc.',45.45,0.73,1.63,'9/1 12:00am'],
	    ['Walt Disney Company (The) (Holding Company)',29.89,0.24,0.81,'9/1 12:00am']
	],

   init : function(){
      
   },

   createWindow : function(){
      var desktop = this.app.getDesktop();
      var win = desktop.getWindow('grid-win');
        
      if(!win){
         var grid = new Ext.grid.GridPanel({
				border:false,
				ds: new Ext.data.Store({
					reader: new Ext.data.ArrayReader({}, [
						{name: 'company'},
						{name: 'price', type: 'float'},
						{name: 'change', type: 'float'},
						{name: 'pctChange', type: 'float'}
					]),
					data: this.dummyData
				}),
				cm: new Ext.grid.ColumnModel([
					new Ext.grid.RowNumberer(),
					{header: "Company", width: 120, sortable: true, dataIndex: 'company'},
					{header: "Price", width: 70, sortable: true, renderer: Ext.util.Format.usMoney, dataIndex: 'price'},
					{header: "Change", width: 70, sortable: true, dataIndex: 'change'},
					{header: "% Change", width: 70, sortable: true, dataIndex: 'pctChange'}
				]),
				sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
				tbar: [
               {
                  text: 'Add',
                  tooltip: 'Add a new row',
                  iconCls: 'demo-grid-add'
					},
               '-',
               {
                  text: 'Remove',
                  tooltip: 'Remove the selected item',
                  iconCls: 'demo-grid-remove'
               },
               '-',
               {
                  text:'Options',
                  tooltip:'Your options',
                  iconCls:'demo-grid-option'
					}
            ],
				viewConfig: {
					forceFit:true
				}
			});

         win = desktop.createWindow({
            animCollapse:false,
            constrainHeader:true,
            height:480,
            iconCls: 'grid-icon',
            id: 'grid-win',
            items: grid,
            layout: 'fit',
            shim:false,
            taskbuttonTooltip: '<b>Grid Window</b><br />A window with a grid',
            title:'Grid Window',
            tools: [
               {
                  id: 'refresh',
                  handler: Ext.emptyFn,
                  scope: this
               }
             ],
             width:740
         });

         // could modify this windows taskbutton tooltip here (defaults to win.title)
         //win.taskButton.setTooltip('Grid Window');
      }

      win.show();
   },

   /**
    * @param {Object} o
    * Example Request Object:
    * {
	 *    requests: [
	 *       {
	 *          action: 'createWindow',
	 *          params: '',
	 *          callback: this.myCallbackFunction,
	 *          scope: this
	 *       },
	 *       { ... }
	 *    ]
	 * }
    */
   handleRequest : function(o){ // allow other modules to make requests
      if(typeof o !== 'object' && !o.requests){return;}
    	var r = o.requests;

    	if(Ext.isArray(r)){ // loop through the requests
    		for(var i = 0, len = r.length; i < len; i++){
    			if(typeof r[i].action === 'string'){
    				run.call(this, r[i]); // run request against the api
    			}
    		}
    	}

    	function run(request){
         switch(request.action){ // the api
    			case 'createWindow':
               this.createWindow(request.params || null);
    				break;
    			case 'getData':
               if(request.callback && request.scope){
                  request.callback.call(request.scope, this.dummyData);
               }
    				break;
    		}
    	}
   }
});