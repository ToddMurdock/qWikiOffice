/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

/**
 * @class Ext.ux.StartMenu
 * @extends Ext.menu.Menu
 * A start menu object.
 * @constructor
 * Creates a new StartMenu
 * @param {Object} config Configuration options
 *
 * SAMPLE USAGE:
 *
 * this.startMenu = new Ext.ux.StartMenu({
 *		iconCls: 'user',
 *		shadow: true,
 *		title: get_cookie('memberName')
 *	});
 *
 * this.startMenu.add({
 *		text: 'Grid Window',
 *		iconCls:'icon-grid',
 *		handler : this.createWindow,
 *		scope: this
 *	});
 *
 * this.startMenu.addTool({
 *		text:'Logout',
 *		iconCls:'logout',
 *		handler:function(){ window.location = 'logout.php'; },
 *		scope:this
 *	});
 */

Ext.ux.StartMenu = Ext.extend(Ext.menu.Menu, {
   autoWidth: false,
   iconCls: '',
   shadow: 'frame',
   width: 300,

   initComponent : function(){
      Ext.ux.StartMenu.superclass.initComponent.call(this);
      this.addClass('ux-startmenu');
      var tools = this.toolItems;
      this.toolItems = new Ext.util.MixedCollection();
      if(tools){
         this.addTool.apply(this, tools);
      }
   },

   // private
   onRender : function(ct, position){
      if(!ct){
         ct = Ext.getBody();
      }

      var buildFooter = function(){
         if(this.footerConfig && this.footerConfig.text){
            return { // bc
               tag: 'div', cls: 'ux-startmenu-bc',
               cn: [
                  { // footer
                     tag: 'div', cls: 'ux-startmenu-footer' + (this.footerConfig.iconCls ? ' ' + this.footerConfig.iconCls : ''),
                     cn: [{tag: 'span', cls: 'ux-startmenu-footer-text'}]
                  }
               ]
            };
         }else{
            return {tag: 'div', cls: 'ux-startmenu-bc ux-startmenu-nofooter'};
         }
      };

      var dh = {
         id: this.getId(),
         cls: 'x-menu ' + ((this.floating) ? 'x-menu-floating x-layer ' : '') + (this.cls || '') + (this.plain ? ' x-menu-plain' : '') + (this.showSeparator ? '' : ' x-menu-nosep'),
         style: this.style,
         cn: [
            {tag: 'a', cls: 'x-menu-focus', href: '#', onclick: 'return false;', tabIndex: '-1'},
            { // tl
               tag: 'div', cls: 'ux-startmenu-tl',
               cn: [
                  { // tr
                     tag: 'div', cls: 'ux-startmenu-tr',
                     cn: [
                        { // tc
                           tag: 'div', cls: 'ux-startmenu-tc',
                           cn: [
                              { // header
                                 tag: 'div', cls: 'ux-startmenu-header ' + this.iconCls,
                                 cn: [{tag: 'span', cls: 'ux-startmenu-header-text'}]
                              }
                           ]
                        }
                     ]
                  }
               ]
            },
            { // bwrap
               tag: 'div', cls: 'ux-startmenu-bwrap',
               cn: [
                  { // ml
                     tag: 'div', cls: 'ux-startmenu-ml',
                     cn: [
                        { // mr
                           tag: 'div', cls: 'ux-startmenu-mr',
                           cn: [
                              { // mc
                                 tag: 'div', cls: 'ux-startmenu-mc',
                                 cn: [
                                    { // body
                                       tag: 'div', cls: 'ux-startmenu-body',
                                       cn: [
                                          {
                                             tag: 'div', cls: 'ux-menu-app',
                                             cn: [{tag: 'ul', cls: 'x-menu-list'}]
                                          },
                                          {
                                             tag: 'div', cls: 'ux-menu-tool',
                                             cn: [{tag: 'ul', cls: 'x-menu-list'}]
                                          },
                                          {tag: 'div', cls: 'x-clear'}
                                       ]
                                    }
                                 ]
                              }
                           ]
                        }
                     ]
                  },
                  { // bl
                     tag: 'div', cls: 'ux-startmenu-bl',
                     cn: [
                        { // br
                           tag: 'div', cls: 'ux-startmenu-br',
                           // call to buildFooter()
                           cn: [( buildFooter.call(this))]
                        }
                     ]
                  }
               ]
            }
         ]
      };
      if(this.floating){
         this.el = new Ext.Layer({
            shadow: this.shadow,
            dh: dh,
            constrain: false,
            parentEl: ct,
            zindex: this.zIndex
         });
      }else{
         this.el = ct.createChild(dh);
      }

      Ext.menu.Menu.superclass.onRender.call(this, ct, position);

      if(!this.keyNav){
         this.keyNav = new Ext.menu.MenuNav(this);
      }
      // generic focus element
      this.focusEl = this.el.child('a.x-menu-focus');
      this.headerText = this.el.child('span.ux-startmenu-header-text');
      this.footerText = this.el.child('span.ux-startmenu-footer-text');
      this.ul = this.el.child('div.ux-menu-app>ul.x-menu-list');
      this.toolsUl = this.el.child('div.ux-menu-tool>ul.x-menu-list');
      this.toolItems.each(function(item){
         var li = document.createElement("li");
         li.className = "x-menu-list-item";
         this.toolsUl.dom.appendChild(li);
         item.render(li);
         item.parentMenu = this;
      }, this);

      this.mon(this.ul, {
         scope: this,
         click: this.onClick,
         mouseover: this.onMouseOver,
         mouseout: this.onMouseOut
      });
      if(this.enableScrolling){
         this.mon(this.el, {
            scope: this,
            delegate: '.x-menu-scroller',
            click: this.onScroll,
            mouseover: this.deactivateActive
         });
      }

      this.setTitle(this.title);
      if(this.footerConfig && this.footerConfig.text){
         this.setFooterText(this.footerConfig.text);
      }
   },

   // private
   findTargetItem : function(e){
      var t = e.getTarget(".x-menu-list-item", this.ul,  true);
      if(t && t.menuItemId){
         if(this.items.get(t.menuItemId)){
            return this.items.get(t.menuItemId);
         }else{
            return this.toolItems.get(t.menuItemId);
         }
      }
   },

   addTool : function(){
      var a = arguments, l = a.length, item;
      for(var i = 0; i < l; i++){
         var el = a[i];
         if(el.render){ // some kind of Item
            item = this.addToolItem(el);
         }else if(typeof el == "string"){ // string
            if(el == "separator" || el == "-"){
               item = this.addToolSeparator();
            }else{
               item = this.addText(el);
            }
         }else if(el.tagName || el.el){ // element
            item = this.addElement(el);
         }else if(typeof el == "object"){ // must be menu item config?
            item = this.addToolMenuItem(el);
         }
      }
      return item;
   },
    
   /**
    * Adds a separator bar to the Tools
    * @return {Ext.menu.Item} The menu item that was added
    */
   addToolSeparator : function(){
      return this.addToolItem(new Ext.menu.Separator({itemCls: 'ux-toolmenu-sep'}));
   },

   addToolItem : function(item){
      this.toolItems.add(item);
      if(this.ul){
         var li = document.createElement("li");
         li.className = "x-menu-list-item";
         this.ul.dom.appendChild(li);
         item.render(li, this);
         this.delayAutoWidth();
      }
      return item;
   },

   addToolMenuItem : function(config){
      if(!(config instanceof Ext.menu.Item)){
         if(typeof config.checked == "boolean"){ // must be check menu item config?
            config = new Ext.menu.CheckItem(config);
         }else{
            config = new Ext.menu.Item(config);
         }
      }
      return this.addToolItem(config);
   },

   setTitle : function(title, iconCls){
      this.title = title;
      //this.header.child('span').update(title);
      this.headerText.update(title);
      return this;
   },

   setFooterText : function(text){
      this.footerText.update(text);
   },

   getToolButton : function(config){
      var btn = new Ext.Button({
         handler: config.handler,
         //iconCls: config.iconCls,
         minWidth: this.toolPanelWidth-10,
         scope: config.scope,
         text: config.text
      });

      return btn;
   }
});