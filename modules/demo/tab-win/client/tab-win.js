QoDesk.TabWindow = Ext.extend(Ext.app.Module, {
   id: 'demo-tab',
   type: 'demo/tab',

   init : function(){

   },
	
	createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow(this.id);
        
        if(!win){
        	var winWidth = desktop.getWinWidth() / 1.1;
			var winHeight = desktop.getWinHeight() / 1.1;
			
            win = desktop.createWindow({
                id: this.id,
                title: 'Tab Window',
                width: winWidth,
                height: winHeight,
                iconCls: 'tab-icon',
                shim: false,
                constrainHeader: true,
                layout: 'fit',
                items:
                    new Ext.TabPanel({
                        activeTab:0,
                        border: false,
                        items: [{
                        	autoScroll: true,
                            title: 'Tab 1',
                            header: false,
                            html: '<p>Something useful would be in here.</p>',
                			border: false
                        },{
                            title: 'Tab 2',
                            header:false,
                            html: '<p>Something useful would be in here.</p>',
                            border: false
                        },{
                            title: 'Tab 3',
                            header:false,
                            html: '<p>Something useful would be in here.</p>',
                            border:false
                        }]
                    }),
                    taskbuttonTooltip: '<b>Tab Window</b><br />A window with tabs'
            });
        }
        win.show();
    }
});