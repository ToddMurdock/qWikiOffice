/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

/**
 * @class Ext.ux.TaskBar
 * @extends Ext.Container
 */
Ext.ux.TaskBar = Ext.extend(Ext.Container, {
   /**
    * @cfg {Boolean}
    * This feature is not finished!!!
    */
   autoHide: false,
   /**
    * @cfg {String}
    */
   buttonScale: 'medium',
   /**
    * @cfg {String} The position of the taskbar.  Defaults to 'bottom'
    * @options 'top', 'bottom'
    */
   position: 'bottom',
   /**
    * Read only.
    * @type {Ext.Desktop}
    */
   desktop: null,
   /**
    * Read only.
    * @type {Ext.ux.QuickStartPanel}
    */
   quickStartPanel: null,
   /**
    * Read only.
    * @type {Ext.Button}
    */
   startButton: null,
   /**
    * Read only.
    * @type {Ext.ux.TaskButtonsPanel}
    */
   taskButtonPanel: null,

   constructor : function(config){
      config = config || {};

      if(config.autoHide){
         this.autoHide = config.autoHide;
      }
      if(config.buttonScale){
         this.buttonScale = config.buttonScale;
      }
      if(config.position){
         this.position = config.position;
      }

      this.el = Ext.getBody().createChild({
         tag: 'div',
         cls: 'ux-taskbar ux-taskbar-' + this.position
      });
      if(this.autoHide){
         this.ghostEl = Ext.getBody().createChild({
            tag: 'div',
            cls: 'ux-ghost-taskbar ux-ghost-taskbar-' + this.position
         });
      }

      var startButtonConfig = Ext.apply({
         iconCls: 'icon-qwikioffice-24',
         region: 'west',
         split: true,
         text: 'Start',
         width: 90
      }, config.startButtonConfig || {});

      // maintain required start button config
      this.startButton = new Ext.Button(Ext.applyIf({
         cls: 'ux-startbutton',
         menu: new Ext.ux.StartMenu(config.startMenuConfig || {}),
         menuAlign: this.position === 'top' ? 'tl-bl' : 'bl-tl',
         scale: this.buttonScale
      }, startButtonConfig));

      // sync height to button
      this.startButton.on('afterRender', function(btn){
         var h = btn.getHeight();
         this.el.setHeight(h);
         if(this.autoHide){
            this.ghostEl.setHeight(h);
         }
      }, this);

      this.quickStartPanel = new Ext.ux.QuickStartPanel(Ext.apply({
         region: 'west',
         split: true,
         width: 120
      }, config.quickstartConfig || {}));
      this.quickStartPanel.taskbar = this;

      this.taskButtonPanel = new Ext.ux.TaskButtonsPanel({
         region: 'center'
      });

      Ext.ux.TaskBar.superclass.constructor.call(this, {
         el: this.el,
         items: [
            this.startButton,
            {
               items: [
                  this.quickStartPanel,
                  this.taskButtonPanel
               ],
               layout: 'border',
               region: 'center',
               xtype: 'container'
            }
         ],
         layout: 'border'
      });
   },

   // override

   initComponent : function(){
      Ext.ux.TaskBar.superclass.initComponent.call(this);

      this.el = Ext.get(this.el) || Ext.getBody();
      // need this to set height by button height
      //this.el.setHeight = Ext.emptyFn;
      this.el.setWidth = Ext.emptyFn;
      this.el.setSize = Ext.emptyFn;
      this.el.setStyle({
         overflow:'hidden',
         margin:'0',
         border:'0 none'
      });
      this.el.dom.scroll = 'no';
      this.allowDomMove = false;
      this.autoWidth = true;
      this.autoHeight = true;
      Ext.EventManager.onWindowResize(this.fireResize, this);
      this.renderTo = this.el;

      if(this.autoHide){
         this.el.on('mouseout', function(e, t, o){
            if(this.autoHide && !this.startButton.menu.isVisible()){
               var y = e.browserEvent.clientY;
               var hide = this.position === 'bottom' ? y < this.desktop.getViewHeight() : y >= this.getHeight();
               if(hide){
                  this.hide();
                  this.ghostEl.show();
                  this.desktop.layout();
               }
            }
         },this);

         this.ghostEl.on('mouseenter', function(){
            if(this.autoHide){
               this.ghostEl.hide();
               this.show();
               this.desktop.layout();
            }
         },this);
      }
   },

   fireResize : function(w, h){
      this.fireEvent('resize', this, w, h, w, h);
   },

   // added methods

   setActiveButton : function(btn){
      this.taskButtonPanel.setActiveButton(btn);
   },

   /**
    * @param {Ext.Window}
    */
   addTaskButton : function(win){
      return this.taskButtonPanel.add(win, { scale: this.buttonScale });
   },

   /**
    * @param {Ext.Button}
    */
   removeTaskButton : function(btn){
      this.taskButtonPanel.remove(btn);
   },

   /**
    * @param {Object}
    */
   addQuickStartButton : function(config){
      return this.quickStartPanel.add(Ext.apply(config, { scale: this.buttonScale }));
   },

   /**
    * @param {Ext.Button}
    */
   removeQuickStartButton : function(btn){
      this.quickStartPanel.remove(btn);
   }
});

/**
 * @class Ext.ux.TaskButtonsPanel
 * @extends Ext.BoxComponent
 */
Ext.ux.TaskButtonsPanel = Ext.extend(Ext.BoxComponent, {
   activeButton: null,
   enableScroll: true,
   scrollIncrement: 0,
   scrollRepeatInterval: 400,
   scrollDuration: .35,
   animScroll: true,
   resizeButtons: true,
   buttonWidth: 168,
   minButtonWidth: 118,
   buttonMargin: 2,
   buttonWidthSet: false,

   onRender : function(ct, position){
      Ext.ux.TaskButtonsPanel.superclass.onRender.call(this, ct, position);

      if(!this.el){ // not existing markup
         this.el = ct.createChild({ id: this.id }, position);
      }
      this.stripWrap = Ext.get(this.el).createChild({
         cls: 'ux-taskbuttons-strip-wrap',
         cn: { tag:'ul', cls:'ux-taskbuttons-strip' }
      });
      this.stripSpacer = Ext.get(this.el).createChild({
         cls:'ux-taskbuttons-strip-spacer'
      });
      this.strip = new Ext.Element(this.stripWrap.dom.firstChild);
      this.edge = this.strip.createChild({
         tag:'li',
         cls:'ux-taskbuttons-edge'
      });
      this.strip.createChild({
         cls:'x-clear'
      });
   },

   initComponent : function() {
      Ext.ux.TaskButtonsPanel.superclass.initComponent.call(this);
      this.addClass('ux-taskbuttons-panel');
      this.on('resize', this.delegateUpdates);
      this.items = [];
   },

   add : function(win, config){
      var li = this.strip.createChild({tag:'li'}, this.edge); // insert before the edge
      var btn = new Ext.ux.TaskBar.TaskButton(win, li, config);

      this.items.push(btn);

      if(!this.buttonWidthSet){
         this.lastButtonWidth = btn.container.getWidth();
      }

      this.setActiveButton(btn);
      return btn;
   },

   remove : function(btn){
      var li = document.getElementById(btn.container.id);
      btn.destroy();
      li.parentNode.removeChild(li);

      var s = [];
      for(var i = 0, len = this.items.length; i < len; i++) {
         if(this.items[i] != btn){
            s.push(this.items[i]);
         }
      }
      this.items = s;
      this.delegateUpdates();
   },

   setActiveButton : function(btn){
      this.activeButton = btn;
      this.delegateUpdates();
   },

   delegateUpdates : function(){
      /*if(this.suspendUpdates){
         return;
      }*/
      if(this.resizeButtons && this.rendered){
         this._autoSize();
      }
      if(this.enableScroll && this.rendered){
         this._autoScroll();
      }
   },

   _autoSize : function(){
      var count = this.items.length;
      var ow = this.el.dom.offsetWidth;
      var aw = this.el.dom.clientWidth;

      if(!this.resizeButtons || count < 1 || !aw){ // !aw for display:none
         return;
      }

      var each = Math.max(Math.min(Math.floor((aw-4) / count) - this.buttonMargin, this.buttonWidth), this.minButtonWidth); // -4 for float errors in IE
      var btns = this.stripWrap.dom.getElementsByTagName('button');

      this.lastButtonWidth = Ext.get(btns[0].id).findParent('li').offsetWidth;

      for(var i = 0, len = btns.length; i < len; i++) {
         var btn = btns[i];

         var tw = Ext.get(btns[i].id).findParent('li').offsetWidth;
         var iw = btn.offsetWidth;

         btn.style.width = (each - (tw-iw)) + 'px';
      }
   },

   _autoScroll : function(){
      var count = this.items.length;
      var ow = this.el.dom.offsetWidth;
      var tw = this.el.dom.clientWidth;

      var wrap = this.stripWrap;
      var cw = wrap.dom.offsetWidth;
      var pos = this.getScrollPos();
      var l = this.edge.getOffsetsTo(this.stripWrap)[0] + pos;

      if(!this.enableScroll || count < 1 || cw < 20){ // 20 to prevent display:none issues
         return;
      }

      wrap.setWidth(tw); // moved to here because of problem in Safari

      if(l <= tw){
         wrap.dom.scrollLeft = 0;
         //wrap.setWidth(tw); moved from here because of problem in Safari
         if(this.scrolling){
            this.scrolling = false;
            this.el.removeClass('x-taskbuttons-scrolling');
            this.scrollLeft.hide();
            this.scrollRight.hide();
         }
      }else{
         if(!this.scrolling){
            this.el.addClass('x-taskbuttons-scrolling');
         }
         tw -= wrap.getMargins('lr');
         wrap.setWidth(tw > 20 ? tw : 20);
         if(!this.scrolling){
            if(!this.scrollLeft){
               this.createScrollers();
            }else{
               this.scrollLeft.show();
               this.scrollRight.show();
            }
         }
         this.scrolling = true;
         if(pos > (l-tw)){ // ensure it stays within bounds
            wrap.dom.scrollLeft = l-tw;
         }else{ // otherwise, make sure the active button is still visible
         this.scrollToButton(this.activeButton, true); // true to animate
         }
         this.updateScrollButtons();
      }
   },

   createScrollers : function(){
      var h = this.el.dom.offsetHeight; //var h = this.stripWrap.dom.offsetHeight;

      // left
      var sl = this.el.insertFirst({
         cls:'ux-taskbuttons-scroller-left'
      });
      sl.setHeight(h);
      sl.addClassOnOver('ux-taskbuttons-scroller-left-over');
      this.leftRepeater = new Ext.util.ClickRepeater(sl, {
         interval : this.scrollRepeatInterval,
         handler: this.onScrollLeft,
         scope: this
      });
      this.scrollLeft = sl;

      // right
      var sr = this.el.insertFirst({
         cls:'ux-taskbuttons-scroller-right'
      });
      sr.setHeight(h);
      sr.addClassOnOver('ux-taskbuttons-scroller-right-over');
      this.rightRepeater = new Ext.util.ClickRepeater(sr, {
         interval : this.scrollRepeatInterval,
         handler: this.onScrollRight,
         scope: this
      });
      this.scrollRight = sr;
   },

   getScrollWidth : function(){
      return this.edge.getOffsetsTo(this.stripWrap)[0] + this.getScrollPos();
   },

   getScrollPos : function(){
      return parseInt(this.stripWrap.dom.scrollLeft, 10) || 0;
   },

   getScrollArea : function(){
      return parseInt(this.stripWrap.dom.clientWidth, 10) || 0;
   },

   getScrollAnim : function(){
      return {
         duration: this.scrollDuration,
         callback: this.updateScrollButtons,
         scope: this
      };
   },

   getScrollIncrement : function(){
      return (this.scrollIncrement || this.lastButtonWidth+2);
   },

   // getBtnEl : function(item){
   //   return document.getElementById(item.id);
   //},

   scrollToButton : function(item, animate){
      item = item.el.dom.parentNode; // li
      if(!item){ return; }
      var el = item; //this.getBtnEl(item);
      var pos = this.getScrollPos(), area = this.getScrollArea();
      var left = Ext.fly(el).getOffsetsTo(this.stripWrap)[0] + pos;
      var right = left + el.offsetWidth;
      if(left < pos){
         this.scrollTo(left, animate);
      }else if(right > (pos + area)){
         this.scrollTo(right - area, animate);
      }
   },

   scrollTo : function(pos, animate){
      this.stripWrap.scrollTo('left', pos, animate ? this.getScrollAnim() : false);
      if(!animate){
         this.updateScrollButtons();
      }
   },

   onScrollRight : function(){
      var sw = this.getScrollWidth()-this.getScrollArea();
      var pos = this.getScrollPos();
      var s = Math.min(sw, pos + this.getScrollIncrement());
      if(s != pos){
         this.scrollTo(s, this.animScroll);
      }
   },

   onScrollLeft : function(){
      var pos = this.getScrollPos();
      var s = Math.max(0, pos - this.getScrollIncrement());
      if(s != pos){
         this.scrollTo(s, this.animScroll);
      }
   },

   updateScrollButtons : function(){
      var pos = this.getScrollPos();
      this.scrollLeft[pos == 0 ? 'addClass' : 'removeClass']('ux-taskbuttons-scroller-left-disabled');
      this.scrollRight[pos >= parseInt(this.getScrollWidth()-this.getScrollArea()) ? 'addClass' : 'removeClass']('ux-taskbuttons-scroller-right-disabled');
   }
});

/**
 * @class Ext.ux.TaskBar.TaskButton
 * @extends Ext.Button
 */
Ext.ux.TaskBar.TaskButton = function(win, el, config){
   this.win = win;
   Ext.ux.TaskBar.TaskButton.superclass.constructor.call(this, Ext.apply({
      clickEvent:'mousedown',
      handler : function(){
         if(win.minimized || win.hidden){
            win.show();
         }else if(win == win.manager.getActive()){
            win.minimize();
         }else{
            win.toFront();
         }
      },
      iconCls: win.iconCls,
      renderTo: el,
      text: Ext.util.Format.ellipsis(win.title, 12)
   }, config));
};

Ext.extend(Ext.ux.TaskBar.TaskButton, Ext.Button, {
   onRender : function(){
      Ext.ux.TaskBar.TaskButton.superclass.onRender.apply(this, arguments);
      this.cmenu = new Ext.menu.Menu({
         items: [{
            text: 'Restore',
            handler: function(){
               if(!this.win.isVisible()){
                  this.win.show();
               }else{
                  this.win.restore();
               }
            },
            scope: this
         },{
            text: 'Minimize',
            handler: this.win.minimize,
            scope: this.win
         },{
            text: 'Maximize',
            handler: this.win.maximize,
            scope: this.win
         }, '-', {
            text: 'Close',
            handler: this.closeWin.createDelegate(this, this.win, true),
            scope: this.win
         }]
      });

      this.cmenu.on('beforeshow', function(){
         var items = this.cmenu.items.items;
         var w = this.win;
         items[0].setDisabled(w.maximized !== true && w.hidden !== true);
         items[1].setDisabled(w.minimized === true);
         items[2].setDisabled(w.maximized === true || w.hidden === true);
      }, this);

      this.el.on('contextmenu', function(e){
         e.stopEvent();
         if(!this.cmenu.el){
            this.cmenu.render();
         }
         var xy = e.getXY();

         // taskbar at top?
         var cmenuHeight = this.cmenu.el.getHeight();
         if(xy[1] < cmenuHeight){
            xy[1] += this.el.getHeight();
         }else{
            xy[1] -= cmenuHeight;
         }

         this.cmenu.showAt(xy);
      }, this);
   },

   closeWin : function(cMenu, e, win){
      if(!win.isVisible()){
         win.show();
      }else{
         win.restore();
      }
      win.close();
   }
});

/**
 * @class Ext.ux.QuickStartPanel
 * @extends Ext.BoxComponent
 */
Ext.ux.QuickStartPanel = Ext.extend(Ext.BoxComponent, {
   /**
    * @cfg {Ext.ux.Taskbar}
    */
   taskbar: null,
   enableMenu: true,

   onRender : function(ct, position){
      Ext.ux.QuickStartPanel.superclass.onRender.call(this, ct, position);

      if(!this.el){ // not existing markup
         this.el = ct.createChild({tag: 'div', id: this.id }, position);
      }
      this.stripWrap = Ext.get(this.el).createChild({
         cls: 'ux-quickstart-strip-wrap',
         cn: {tag: 'ul', cls: 'ux-quickstart-strip'}
      });
      this.stripSpacer = Ext.get(this.el).createChild({
         cls: 'ux-quickstart-strip-spacer'
      });
      this.strip = new Ext.Element(this.stripWrap.dom.firstChild);
      this.edge = this.strip.createChild({
         tag: 'li',
        	cls: 'ux-quickstart-edge'
      });
      this.strip.createChild({
        	cls: 'x-clear'
      });
   },

   initComponent : function(){
      Ext.ux.QuickStartPanel.superclass.initComponent.call(this);
      this.addClass('ux-quickstart-panel');

      this.on('resize', this.delegateUpdates);
      this.menu = new Ext.menu.Menu();
      this.items = [];
   },

   add : function(config){
      var li = this.strip.createChild({tag:'li'}, this.edge); // insert before the edge

      var btn = new Ext.Button(Ext.apply(config, {
         menuText: config.text,
         renderTo: li,
         text: '' // do not display text
      }));

      this.items.push(btn);
      this.delegateUpdates();
      return btn;
   },

   remove : function(btn){
      var li = document.getElementById(btn.container.id);
      btn.destroy();
      li.parentNode.removeChild(li);

      var s = [];
      for(var i = 0, len = this.items.length; i < len; i++) {
         if(this.items[i] != btn){
            s.push(this.items[i]);
         }
      }
      this.items = s;
		this.delegateUpdates();
   },

   menuAdd : function(config){
      this.menu.add(config);
   },

   delegateUpdates : function(){
      if(this.enableMenu && this.rendered){
         this.showButtons();
        	this.clearMenu();
         this.autoMenu();
      }
   },

   showButtons : function(){
      var count = this.items.length;

      for(var i = 0; i < count; i++){
         this.items[i].show();
      }
   },

   clearMenu : function(){
      this.menu.removeAll();
   },

	autoMenu : function(){
      var count = this.items.length;
      var ow = this.el.dom.offsetWidth;
      var tw = this.el.dom.clientWidth;

      var wrap = this.stripWrap;
      var cw = wrap.dom.offsetWidth;
      var l = this.edge.getOffsetsTo(this.stripWrap)[0];

      if(!this.enableMenu || count < 1 || cw < 20){ // 20 to prevent display:none issues
         return;
      }

      wrap.setWidth(tw);

      if(l <= tw){
         if(this.showingMenu === true){
            this.showingMenu = false;
            this.menuButton.hide();
         }
      }else{
         tw -= wrap.getMargins('lr');
         wrap.setWidth(tw > 20 ? tw : 20);
         if(!this.showingMenu){
            if(!this.menuButton){
               this.createMenuButton();
            }else{
               this.menuButton.show();
            }
         }

         var mo = this.getMenuButtonPos();
         for(var i = count-1; i >= 0; i--){
            var bo = this.items[i].el.dom.offsetLeft + this.items[i].el.dom.offsetWidth;
            if(bo > mo){
               this.items[i].hide();
            	var ic = this.items[i].initialConfig;
               var config = {
                  iconCls: ic.iconCls,
                  handler: ic.handler,
                  scope: ic.scope,
                  text: ic.menuText
               };

               this.menuAdd(config);
            }else{
               this.items[i].show();
            }
         }

         this.showingMenu = true;
      }
   },

   createMenuButton : function(){
      var h = this.el.dom.offsetHeight;
      var mb = this.el.insertFirst({
         cls:'ux-quickstart-menubutton-wrap'
      });
      mb.setHeight(h);
      var btn = new Ext.Button({
         cls:'x-btn-icon',
         iconCls: 'ux-quickstart-menubutton',
         menu: this.menu,
         renderTo: mb,
         scale: this.taskbar.buttonScale
      });
      mb.setWidth(btn.getWidth());
      this.menuButton = mb;
   },

   getMenuButtonPos : function(){
      return this.menuButton.dom.offsetLeft;
   }
});