/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

Ext.namespace("Ext.plugin");
QoDesk.QoPreferences = Ext.extend(Ext.app.Module, {
   id: 'qo-preferences'
   , type: 'system/preferences'
   , cardHistory: [ 'pref-win-card-1' ]

   , init : function(){
   	this.locale = QoDesk.QoPreferences.Locale;
	}
   
   , createWindow : function(){
      var d = this.app.getDesktop();
      this.win = d.getWindow(this.id);
      
      var h = parseInt(d.getWinHeight() * 0.9);
      var w = parseInt(d.getWinWidth() * 0.9);
      if(h > 500){ h = 500; }
      if(w > 610){ w = 610; }
        
      if(this.win){
         this.win.setSize(w, h);
      }else{
         this.contentPanel = new Ext.Panel({
				activeItem: 0
            , border: false
				, items: [
                	new QoDesk.QoPreferences.Nav({
                		ownerModule: this
                		, id: 'pref-win-card-1'
                	})
                	, new QoDesk.QoPreferences.Shortcuts({
                		ownerModule: this
                		, id: 'pref-win-card-6'
                	})
                	, new QoDesk.QoPreferences.AutoRun({
                		ownerModule: this
                		, id: 'pref-win-card-5'
                	})
                	, new QoDesk.QoPreferences.QuickStart({
                		ownerModule: this
                		, id: 'pref-win-card-2'
                	})
                	, new QoDesk.QoPreferences.Appearance({
                		ownerModule: this
                		, id: 'pref-win-card-3'
                	})
                	, new QoDesk.QoPreferences.Background({
                		ownerModule: this
                		, id: 'pref-win-card-4'
                	})
                ]
				, layout: 'card'
				, tbar: [
					{
						disabled: true
	                	, handler: this.navHandler.createDelegate(this, [-1])
	                	, id: 'back'
	                	, scope: this
	                	, text: this.locale.button.back.text
	                }
	                , {
	                	disabled: true
	                	, handler: this.navHandler.createDelegate(this, [1])
	                	, id: 'next'
	                	, scope: this
	                	, text: this.locale.button.next.text
	                }
	            ]
			});
			
            this.win = d.createWindow({
            	animCollapse: false
                , constrainHeader: true
                , id: this.id
                , height: h
                , iconCls: 'qo-pref-icon'
                , items: this.contentPanel
                , layout: 'fit'
                , shim: false
                , taskbuttonTooltip: this.locale.launcher.tooltip
                , title: this.locale.title.window
                , width: w
            });
            
			this.layout = this.contentPanel.getLayout();
        }
        
        this.win.show();
    }
    
    , handleButtonState : function(){
    	var cards = this.cardHistory;
    	var activeId = this.layout.activeItem.id;
    	var items = this.contentPanel.getTopToolbar().items;
    	var back = items.get(0);
    	var next = items.get(1);
    	
    	for(var i = 0, len = cards.length; i < len; i++){
    		if(cards[i] === activeId){
    			if(i <= 0){
    				back.disable();
    				next.enable();
    			}else if(i >= (len-1)){
    				back.enable();
    				next.disable();
    			}else{
    				back.enable();
    				next.enable();
    			}
    			break;
    		}
    	}
    }
    
    , navHandler : function(index){
    	var cards = this.cardHistory;
    	var activeId = this.layout.activeItem.id;
    	var nextId;
    	
    	for(var i = 0, len = cards.length; i < len; i++){
    		if(cards[i] === activeId){
    			nextId = cards[i+index];
    			break;
    		}
    	}
    	
    	this.layout.setActiveItem(nextId);
    	this.handleButtonState();
    }
    
    , save : function(params){
    	var desktop = this.app.getDesktop();
    	var notifyWin = desktop.showNotification({
			html: this.locale.notification.saving.msg
			, title: this.locale.notification.saving.title
		});
	   var callback = params.callback || null;
		var callbackScope = params.callbackScope || this;
		
		params.moduleId = this.id;
		
      Ext.Ajax.request({
			url: this.app.connection
			// Could also pass the module id and method in the querystring like this
			// instead of in the params config option.
			//
			// url: this.app.connection+'?modulId='+this.id+'&method=myMethod'
			, params: params
			, success: function(o){
				if(o && o.responseText && Ext.decode(o.responseText).success){
					saveComplete(this.locale.notification.saved.title, this.locale.notification.saved.msg);
				}else{
					saveComplete(this.locale.error.title, this.locale.error.msg);
				}
			}
			, failure: function(){
				saveComplete(this.locale.connection.lost.title, this.locale.connection.lost.msg);
			}
			, scope: this
		});
		
		function saveComplete(title, msg){
			notifyWin.setIconClass('icon-done');
			notifyWin.setTitle(title);
			notifyWin.setMessage(msg);
			desktop.hideNotification(notifyWin);
			
			if(callback){
				callback.call(callbackScope);
			}
		}
	}
    
   , viewCard : function(card){
      this.layout.setActiveItem(card);
      var h = this.cardHistory;
      if(h.length > 1){ h.pop(); }
	   h.push(card);
	   this.handleButtonState();
   }
});