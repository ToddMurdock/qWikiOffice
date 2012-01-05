/*
 * qWikiOffice Desktop 0.7
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

QoDesk.LayoutWindow = Ext.extend(Ext.app.Module, {
   id: 'demo-layout',
   type: 'demo/layout',

   init : function(){

   },
	
	createWindow : function(){
		var desktop = this.app.getDesktop();
		var win = desktop.getWindow('layout-win');
		if(!win){
			var winWidth = desktop.getWinWidth() / 1.1;
			var winHeight = desktop.getWinHeight() / 1.1;
			
			win = desktop.createWindow({
				id: 'layout-win',
				title:'Layout Window',
				width:winWidth,
				height:winHeight,
				x:desktop.getWinX(winWidth),
				y:desktop.getWinY(winHeight),
				iconCls: 'layout-icon',
				shim:false,
				animCollapse:false,
				constrainHeader:true,
				minimizable:true,
    			maximizable:true,

				layout: 'border',
				tbar:[{
					text: 'Button1'
				},{
					text: 'Button2'
				}],
				items:[{
					region:'west',
					autoScroll:true,
					collapsible:true,
					cmargins:'0 0 0 0',
					margins:'0 0 0 0',
					split:true,
					title:'Panel',
					width:parseFloat(winWidth*0.3) < 201 ? parseFloat(winWidth*0.3) : 200
				},{
					region:'center',
					border:false,
					layout:'border',
					margins:'0 0 0 0',
					items:[{
						region:'north',
						elements:'body',
						title:'Panel',
						height:winHeight*0.3,
						split:true
					},{
						autoScroll:true,
						elements:'body',
						region:'center',
						id:'Details',
						title:'Preview Panel'
					}]
				}/*,{
					region:'south',
					border:false,
					elements:'body',
					height:25
				}*/],
				taskbuttonTooltip: '<b>Layout Window</b><br />A window with a layout'
			});
		}
		win.show();
	}
});