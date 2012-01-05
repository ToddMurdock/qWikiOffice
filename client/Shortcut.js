/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

Ext.ux.Shortcuts = function(desktop){
   var btnHeight = 74;
   var btnWidth = 74;
   var btnPadding = 15;
   var col = null;
   var row = null;
   var items = [];
   var fontColor = '000000';
   var top = 0;

   if(desktop.getTaskbarPosition() === 'top'){
      top = desktop.getTaskbarHeight();
   }

   initColRow();

   function initColRow(){
      col = {index: 1, x: btnPadding};
      row = {index: 1, y: btnPadding + top};
   }

   function isOverflow(y){
      if(y > (desktop.getViewHeight())){
         return true;
      }
      return false;
   }
	
	this.addShortcut = function(config){
      var text = Ext.util.Format.ellipsis(config.text, 16);
      text = text.replace(' ', '<br />');
      //var div = desktop.el.createChild({tag:'div', cls: 'ux-shortcut-item'});
      var btn = new Ext.Button(Ext.apply(config, {
         //clickEvent: 'dblclick',
         cls: 'ux-shortcut-item',
         height: btnHeight,
         iconAlign: 'top',
         renderTo: desktop.el,// div,
         scale: 'large',
         text: text,
         width: btnWidth
      }));
      btn.btnEl.setStyle('color', '#' + fontColor);
		
      //var dd = div.initDD('DesktopShortcuts');
      //dd.onMouseUp = function(e){}

      items.push(btn);
      this.setXY(btn);

      return btn;
   };
	
   this.removeShortcut = function(b){
      //var d = document.getElementById(b.id);

      b.destroy();
      //d.parentNode.removeChild(d);

      var s = [];
      for(var i = 0, len = items.length; i < len; i++){
         if(items[i] != b){
            s.push(items[i]);
         }
      }
      items = s;

      this.handleUpdate();
   }

   this.setFontColor = function(hex){
      fontColor = hex;
      for(var i = 0, len = items.length; i < len; i++){
         items[i].btnEl.setStyle('color', '#' + fontColor);
      }
   }

   this.handleUpdate = function(){
      initColRow();
      for(var i = 0, len = items.length; i < len; i++){
         this.setXY(items[i]);
      }
   }

   this.setXY = function(item){
      var bottom = row.y + btnHeight;
      var overflow = isOverflow(row.y + btnHeight);

      if(overflow && bottom > (btnHeight + btnPadding)){
         col = {
            index: col.index++
            , x: col.x + btnWidth + btnPadding
         };
         row = {
            index: 1
            , y: btnPadding + top
         };
      }

      item.el.setXY([col.x, row.y]);
      //item.container.setXY([col.x, row.y]);

      row.index++;
      row.y = row.y + btnHeight + btnPadding;
   };
	
   Ext.EventManager.onWindowResize(this.handleUpdate, this, {delay:500});
};