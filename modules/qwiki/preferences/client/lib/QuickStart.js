/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

QoDesk.QoPreferences.QuickStart = Ext.extend(Ext.Panel, {
   constructor : function(config){
      // constructor pre-processing
      config = config || {};

      this.ownerModule = config.ownerModule;

      // this config
      Ext.applyIf(config, {
         border: false
         , buttons: [
            {
               disabled: this.ownerModule.app.isAllowedTo('saveQuickstart', this.ownerModule.id) ? false : true
               , handler: onSave
               , scope: this
               , text: 'Save'
            }
            , {
               handler: onClose
               , scope: this
               , text: 'Close'
            }
         ]
         , cls: 'pref-card'
         , items: [
            {
               bodyStyle: 'padding:0 5px 0 0'
               , border: false
               , html: this.ownerModule.locale.html.quickstart
               , region: 'center'
               , xtype: 'panel'
            }
				, new QoDesk.QoPreferences.CheckTree({
               launcherKey: 'quickstart',
               listeners: {
                  'checkchange': { fn: onCheckChange, scope: this }
               }
               , ownerModule: config.ownerModule
               , region: 'west'
            })
         ]
         , layout: 'border'
         , title: this.ownerModule.locale.title.quickstart
      });

      QoDesk.QoPreferences.QuickStart.superclass.constructor.apply(this, [config]);
      // constructor post-processing

      function onClose(){
         this.ownerModule.win.close();
      }

      function onSave(){
         this.buttons[0].disable();
         this.ownerModule.save({
            method: 'saveQuickstart'
            , callback: function(){
               this.buttons[0].enable();
            }
            , callbackScope: this
            , ids: Ext.encode(this.ownerModule.app.getDesktop().getLauncher('quickstart'))
         });
      }

      function onCheckChange(node, checked){
         if(node.leaf && node.id){
            if(checked){
               this.ownerModule.app.desktop.addQuickStartButton(node.id, true);
            }else{
               this.ownerModule.app.desktop.removeQuickStartButton(node.id, true);
            }
         }
      }
   }
});