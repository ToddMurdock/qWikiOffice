QoDesk.AccordionWindow = Ext.extend(Ext.app.Module, {
   id: 'demo-accordion',
   type: 'demo/accordion',

   /**
    * Initialize this module.
    * This function is called at startup (page load/refresh).
    */
   init : function(){
   	this.locale = QoDesk.AccordionWindow.Locale;
   },
	
	/**
	 * Create this modules window here.
	 */
   createWindow : function(){
    	var desktop = this.app.getDesktop();
      var win = desktop.getWindow('acc-win');
      var locale = this.locale;

      if(!win){
         win = desktop.createWindow({
            id: 'acc-win',
            title: this.locale.title.window,
            width: 250,
            height: 400,
            iconCls: 'acc-icon',
            shim: false,
            animCollapse: false,
            constrainHeader: true,
            maximizable: false,
            taskbuttonTooltip: this.locale.launcher.tooltip,

            tbar:[{
               tooltip: this.locale.button.connect.tooltip,
               iconCls: 'demo-acc-connect'
            },'-',{
               tooltip: this.locale.button.add.tooltip,
               iconCls: 'demo-acc-user-add'
            },' ',{
               tooltip: this.locale.button.remove.tooltip,
               iconCls: 'demo-acc-user-delete'
            }],

            layout: 'accordion',
            layoutConfig: {
               animate: false
            },

            items: [
               new Ext.tree.TreePanel({
                  border: false,
                  id: 'im-tree',
                  title: this.locale.title.onlineUsers,
                  loader: new Ext.tree.TreeLoader(),
                  rootVisible: false,
                  lines: false,
                  autoScroll: true,
                  useArrows: true,
                  tools: [{
                     id: 'refresh',
                     on: {
                        click: function(){
                           var tree = Ext.getCmp('im-tree');
                           tree.body.mask(locale.notification.loading.msg, 'x-mask-loading');
                           tree.root.reload();
                           tree.root.collapse(true, false);
                           setTimeout(function(){ // mimic a server call
                              tree.body.unmask();
                              tree.root.expand(true, true);
                           }, 1000);
                        }
                     }
                  }],
                  root: new Ext.tree.AsyncTreeNode({
                     text: 'Hidden Root',
                     children: [{
                        text: 'Friends',
                        expanded: true,
                        children: [{
                           text: 'Jack',
                           iconCls: 'user',
                           leaf: true
                        },{
                           text:'Brian',
                           iconCls:'user',
                           leaf:true
                        },{
                           text:'Jon',
                           iconCls:'user',
                           leaf:true
                        }]
                     },{
                        text: 'Family',
                        expanded: true,
                        children: [{
                           text: 'Kelly',
                           iconCls: 'user-girl',
                           leaf: true
                        },{
                           text: 'Sara',
                           iconCls: 'user-girl',
                           leaf: true
                        },{
                           text: 'Zack',
                           iconCls: 'user-kid',
                           leaf: true
                        },{
                           text: 'John',
                           iconCls: 'user-kid',
                           leaf: true
                        }]
                     }]
                  })
               }),{
                  border: false,
                  title: this.locale.title.settings,
                  html: this.locale.html.settings,
                  autoScroll: true
               },{
                  border: false,
                  title: this.locale.title.moreStuff,
                  html: this.locale.html.moreStuff
               },{
                  border: false,
                  title: this.locale.title.myStuff,
                  html: this.locale.html.myStuff
               }
            ]
         });
      }
      win.show();
   }
});