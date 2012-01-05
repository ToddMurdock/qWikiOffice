/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 *
 * Ext.ux.Notification is based on code from the Ext JS forum.
 * I have made some minor modifications.
 */

Ext.ux.NotificationMgr = {
    positions: []
};

Ext.ux.Notification = Ext.extend(Ext.Window, {
	initComponent : function(){
		Ext.apply(this, {
			iconCls: this.iconCls || 'icon-information'
			, width: 200
			, autoHeight: true
			, closable: true
			, plain: false
			, draggable: false
			, bodyStyle: 'text-align:left;padding:10px;'
			, resizable: false
         , shadow: false
		});
		if(this.autoDestroy){
			this.task = new Ext.util.DelayedTask(this.close, this);
		}else{
			this.closable = true;
		}
		Ext.ux.Notification.superclass.initComponent.call(this);
   }

	, setMessage : function(msg){
		this.body.update(msg);
	}
	
	, setTitle : function(title, iconCls){
      Ext.ux.Notification.superclass.setTitle.call(this, title, iconCls||this.iconCls);
   }

	, onRender : function(ct, position) {
		Ext.ux.Notification.superclass.onRender.call(this, ct, position);
	}

	, onDestroy : function(){
		Ext.ux.NotificationMgr.positions.remove(this.pos);
		Ext.ux.Notification.superclass.onDestroy.call(this);
	}

	, afterShow : function(){
		Ext.ux.Notification.superclass.afterShow.call(this);
		this.on('move', function(){
			Ext.ux.NotificationMgr.positions.remove(this.pos);
			if(this.autoDestroy){
				this.task.cancel();
			}
		}, this);
		if(this.autoDestroy){
			this.task.delay(this.hideDelay || 5000);
		}
	}

	, animShow : function(){
		this.pos = 0;
		while(Ext.ux.NotificationMgr.positions.indexOf(this.pos)>-1){
         if(this.animateFrom === 'top'){
            this.pos--;
         }else{
            this.pos++;
         }
		}
		Ext.ux.NotificationMgr.positions.push(this.pos);
		this.setSize(200,100);
		this.el.alignTo(this.animateTarget || document, (this.animateFrom === 'top' ? 'tr-br' : 'br-tr'), [ -1, -1-((this.getSize().height+10)*this.pos) ]);
		this.el.slideIn((this.animateFrom === 'top' ? 't' : 'b'), {
			duration: .7
			, callback: this.afterShow
			, scope: this
		});
	}

	, animHide : function(){
		Ext.ux.NotificationMgr.positions.remove(this.pos);
		this.el.ghost((this.animateFrom === 'top' ? 't' : 'b'), {
			duration: 1
			, remove: true
		});
	}
});