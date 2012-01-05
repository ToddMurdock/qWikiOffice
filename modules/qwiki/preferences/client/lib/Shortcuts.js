/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

QoDesk.QoPreferences.Shortcuts = Ext.extend(Ext.Panel, {
   constructor : function(config){
      // constructor pre-processing
      config = config || {};

      this.ownerModule = config.ownerModule;

      // this config
      Ext.applyIf(config, {
         border: false
         , buttons: [
            {
               disabled: this.ownerModule.app.isAllowedTo('saveShortcut', this.ownerModule.id) ? false : true
               , handler: onSave
               , scope: this
               , text: this.ownerModule.locale.button.save.text
            }
            , {
               handler: onClose
               , scope: this
               , text: this.ownerModule.locale.button.close.text
            }
         ]
         , cls: 'pref-card'
         , items: [
            {
               bodyStyle: 'padding:0 5px 0 0'
               , border: false
               , html: 'Selected applications will be available as a desktop Shortcut.  Don\'t forget to click the \'Save\' button.'
               , region: 'center'
               , xtype: 'panel'
            }
            , new QoDesk.QoPreferences.CheckTree({
               launcherKey: 'shortcut',
               listeners: {
                  'checkchange': { fn: onCheckChange, scope: this }
               }
               , ownerModule: config.ownerModule
               , region: 'west'
            })
         ]
         , layout: 'border'
         , title: this.ownerModule.locale.title.shortcuts
      });

      QoDesk.QoPreferences.Shortcuts.superclass.constructor.apply(this, [config]);
      // constructor post-processing

      function onClose(){
         this.ownerModule.win.close();
      }

      function onSave(){
         this.buttons[0].disable();
         this.ownerModule.save({
            method: 'saveShortcut'
            , callback: function(){
               this.buttons[0].enable();
            }
            , callbackScope: this
            , ids: Ext.encode(this.ownerModule.app.getDesktop().getLauncher('shortcut'))
         });
      }

      function onCheckChange(node, checked){
         if(node.leaf && node.id){
            if(checked){
               this.ownerModule.app.getDesktop().addShortcut(node.id, true);
            }else{
               this.ownerModule.app.getDesktop().removeShortcut(node.id, true);
            }
         }
      }
   }
});