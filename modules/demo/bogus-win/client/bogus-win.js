QoDesk.BogusWindow = Ext.extend(Ext.app.Module, {
   id: 'demo-bogus',
   type: 'demo/bogus',
   detailModule: null,

   init: function () {
      this.detailModule = new BogusDetailModule();
   },

   createWindow: function () {
      var desktop = this.app.getDesktop();
      var win = desktop.getWindow('bogus-win');

      if (!win) {
         this.navPanel = new QoDesk.BogusWindow.NavPanel({
            id: 'nav-panel',
            owner: this,
            region: 'center'
         });

         this.gridPanel = new Ext.grid.GridPanel({
            border: false,
            ds: new Ext.data.Store({
               reader: new Ext.data.ArrayReader({}, [{
                  name: 'company'
               }, {
                  name: 'price',
                  type: 'float'
               }, {
                  name: 'change',
                  type: 'float'
               }, {
                  name: 'pctChange',
                  type: 'float'
               }])
               //data: this.dummyData
            }),
            cm: new Ext.grid.ColumnModel([
            new Ext.grid.RowNumberer(), {
               header: "Company",
               width: 120,
               sortable: true,
               dataIndex: 'company'
            }, {
               header: "Price",
               width: 70,
               sortable: true,
               renderer: Ext.util.Format.usMoney,
               dataIndex: 'price'
            }, {
               header: "Change",
               width: 70,
               sortable: true,
               dataIndex: 'change'
            }, {
               header: "% Change",
               width: 70,
               sortable: true,
               dataIndex: 'pctChange'
            }]),
            height: 270,
            region: 'south',
            sm: new Ext.grid.RowSelectionModel({
               singleSelect: true
            }),
            split: true,
            tbar: [{
               iconCls: 'demo-grid-add',
               handler: this.requestGridData,
               scope: this,
               text: 'Request Data',
               tooltip: 'Request data from the Grid Window module'
            }],
            viewConfig: {
               forceFit: true
            }, title: 'Make A Request of Another Module'
         });

         win = desktop.createWindow({
            animCollapse: false,
            autoScroll: true,
            constrainHeader: true,
            height: 480,
            iconCls: 'bogus-icon',
            id: 'bogus-win',
            items: [
            this.navPanel, this.gridPanel],
            layout: 'border',
            maximizable: false,
            shim: false,
            tbar: [{
               handler: this.showDialog,
               scope: this,
               text: 'Show Dialog'
            }, {
               handler: this.showAlert,
               scope: this,
               text: 'Show Alert'
            }],
            taskbuttonTooltip: '<b>Bogus Window</b><br />A bogus window',
            title: 'Bogus Window',
            width: 640
         });
      }

      win.show();
   },

   openDetail: function (id) {
      this.detailModule.createWindow(this.app, id);
   },

   openTabWindow: function () {
      this.app.getDesktop().launchWindow('demo-tab');
   },

   requestGridData: function () {
      this.app.makeRequest('demo-grid', {
         requests: [{
            action: 'getData',
            params: '',
            callback: this.onRequestComplete,
            scope: this
         }]
      });
   },

   onRequestComplete: function (data) {
      if (data) {
         this.gridPanel.getStore().loadData(data);
      }
   },

   setTaskButtonText: function (text) {
      if (text) {
         // get this modules win taskbutton
         var desktop = this.app.getDesktop();
         var win = desktop.getWindow('bogus-win');
         win.taskButton.setText(text);
      }
   },

   showDialog: function () {
      var winManager = this.app.getDesktop().getManager();

      if (!this.dialog) {
         this.dialog = new Ext.Window({
            bodyStyle: 'padding:10px',
            buttons: [
               {
                  disabled: true,
                  text: 'Submit'
               },{
                  handler: function () {
                     this.dialog.hide();
                  },
                  scope: this,
                  text: 'Close'
               }
            ],
            closeAction: 'hide',
            height: 300,
            html: 'Bogus dialog window',
            layout: 'fit',
            manager: winManager,
            modal: true,
            title: 'Bogus Dialog',
            width: 500
         });
      }
      this.dialog.show();
   },

   showAlert: function () {
      Ext.Msg.alert('Alert', 'Alert displayed successfully.');
   }
});



QoDesk.BogusWindow.NavPanel = function (config) {
   this.owner = config.owner;

   QoDesk.BogusWindow.NavPanel.superclass.constructor.call(this, {
      autoScroll: true,
      bodyStyle: 'padding:15px',
      border: false,
      html: '<p><b>Open this module\'s detail windows</b><br />' + '<a id="openDetailOne" href="#">Detail 1</a> | <a id="openDetailTwo" href="#">Detail 2</a> | <a id="openDetailThree" href="#">Detail 3</a></p>' + '<p style="padding-top:15px;"><b>Update this modules taskbutton text</b><br />' + '<a id="setTaskButtonText" href="#">Set text</a></p>' + '<p style="padding-top:15px;"><b>Open another module\'s window</b><br />' + '<a id="openTabWindow" href="#">Open Tab Window</a></p>',
      id: config.id,
      region: config.region
   });

   this.actions = {
      'openDetailOne': function (owner) {
         owner.openDetail(1);
      }, 'openDetailTwo': function (owner) {
         owner.openDetail(2);
      }, 'openDetailThree': function (owner) {
         owner.openDetail(3);
      }, 'openTabWindow': function (owner) {
         owner.openTabWindow();
      }, 'setTaskButtonText': function (owner) {
         owner.setTaskButtonText('My Bogus Window');
      }
   };
};

Ext.extend(QoDesk.BogusWindow.NavPanel, Ext.Panel, {
   afterRender: function () {
      this.body.on({
         'mousedown': {
            fn: this.doAction,
            scope: this,
            delegate: 'a'
         }, 'click': {
            fn: Ext.emptyFn,
            scope: null,
            delegate: 'a',
            preventDefault: true
         }
      });

      QoDesk.BogusWindow.NavPanel.superclass.afterRender.call(this); // do sizing calcs last
   },

   doAction: function (e, t) {
      e.stopEvent();
      this.actions[t.id](this.owner); // pass owner for scope
   }
});



BogusDetailModule = Ext.extend(Ext.app.Module, {

   type: 'demo/bogus-detail',
   id: 'demo-bogus-detail',

   init: function () {
      this.launcher = {
         handler: this.createWindow,
         iconCls: 'bogus-icon',
         scope: this,
         shortcutIconCls: 'demo-bogus-shortcut',
         text: 'Bogus Detail Window',
         tooltip: '<b>Bogus Detail Window</b><br />A bogus detail window'
      }
   },

   createWindow: function (app, id) {
      this.id = 'demo-bogus-detail-' + id;

      var desktop = app.getDesktop();
      var win = desktop.getWindow('bogus-detail' + id);

      if (!win) {
         win = desktop.createWindow({
            id: 'bogus-detail' + id,
            title: 'Bogus Detail ' + id,
            width: 540,
            height: 380,
            html: '<p>Something useful would be in here.</p>',
            iconCls: 'bogus-icon',
            shim: false,
            animCollapse: false,
            constrainHeader: true
         });
      }
      win.show();
   }
});