/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

QoDesk.QoPreferences.Nav = Ext.extend(Ext.Panel, {
   constructor : function(config){
      // constructor pre-processing
      config = config || {};
		
		this.ownerModule = config.ownerModule;
		
      this.actions = {
         'viewShortcuts' : function(ownerModule){
            ownerModule.viewCard('pref-win-card-6');
         }
         , 'viewAutoRun' : function(ownerModule){
            ownerModule.viewCard('pref-win-card-5');
         }
         , 'viewQuickstart' : function(ownerModule){
            ownerModule.viewCard('pref-win-card-2');
         }
         , 'viewAppearance' : function(ownerModule){
            ownerModule.viewCard('pref-win-card-3');
         }
         , 'viewWallpapers' : function(ownerModule){
            ownerModule.viewCard('pref-win-card-4');
         }
      };
		
      // this config
      Ext.applyIf(config, {
         autoScroll: true
         , bodyStyle: 'padding:15px'
         , border: false
      });
		
      QoDesk.QoPreferences.Nav.superclass.constructor.apply(this, [config]);
      // constructor post-processing
   }
	
   // overrides
	
   , afterRender : function(){
   	var tpl = new Ext.XTemplate(
         '<ul class="pref-nav-list">'
         , '<tpl for=".">'
            , '<li><div>'
               , '<div class="prev-link-item-icon"><img src="'+Ext.BLANK_IMAGE_URL+'" class="{cls}"/></div>'
               , '<div class="prev-link-item-txt"><a id="{id}" href="#">{text}</a><br />{description}</div>'
               , '<div class="x-clear"></div>'
            , '</div></li>'
         , '</tpl>'
         , '</ul>'
   	);
   	tpl.overwrite(this.body, this.ownerModule.locale.data.nav);
   	
      this.body.on({
         'mousedown': {
            fn: this.doAction
            , scope: this
            , delegate: 'a'
         }
         , 'click': {
            fn: Ext.emptyFn
            , scope: null
            , delegate: 'a'
            , preventDefault: true
         }
      });
		
      QoDesk.QoPreferences.Nav.superclass.afterRender.call(this); // do sizing calcs last
   }

   // added methods

   , doAction : function(e, t){
      e.stopEvent();
      this.actions[t.id](this.ownerModule);  // pass ownerModule for scope
   }
});