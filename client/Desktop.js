/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

Ext.Desktop = Ext.extend(Ext.util.Observable, {
   /**
    * @cfg. {Ext.app.App}
    */
   app: null,
   /**
    * @cfg {Object}
    * Example:
    * {
    *    "fontColor": "FFFFFF",
    *    "theme": {"id": 1,"name": "Blue","file": "resources/css/xtheme-blue.css"},
    *    "taskbarTransparency": "100"
    * }
    */
   appearance: null,
   /**
    * @cfg {Object}
    * Example:
    * {
    *    "color": "f9f9f9",
    *    "wallpaper": {"id": 3,"name": "Blue Swirl","file": "resources/wallpapers/blue-swirl.jpg"},
    *    "wallpaperPosition": "tile"
    * }
    */
   background: null,
   /**
    * @cfg {Object} The launchers object.
    * Contains the moduleId's of the modules to add to each launcher.
    */
   launchers: {
      autorun: [],
      quickstart: [],
      shortcut: []
   },
   /**
    * @cfg {Object} The logout button config.
    */
   logoutConfig: {
      handler: function(){window.location = "logout.php";},
      iconCls: 'icon-logout',
      text: 'Logout'
   },
   /**
    * @cfg {Function} Function that handles sorting of the Start Menu.  Return true to swap a and b.
    * Examples:
    * function(a, b){ // Sort in ASC alphabetical order
    *    if( b.text < a.text ){
            return true;
    *    }
    *    return false;
    * }
    * function(a, b){ // Sort in ASC alphabetical order with menus at the bottom
    *    if( (b.text < a.text) && !b.menu ){
    *       return true;
    *    }
    *    return false;
    * }
    */
   startMenuSortFn: function(a, b){ // Sort in ASC alphabetical order with menus at the top
      if( ( ( b.menu && a.menu ) && ( b.text < a.text ) ) || ( b.menu && !a.menu ) || ( (b.text < a.text) && !a.menu ) ){
         return true;
      }
      return false;
   },
   /**
    * Read only.
    * @type {Ext.Window}
    */
   activeWindow: null,
   /**
    * Read only.
    * @type {Ext.menu.Menu}
    */
   contextMenu: null,
   /**
    * Read only.
    * @type {Ext.ux.Shortcuts}
    */
   shortcuts: null,
   /**
    * Read only.
    * @type {Ext.ux.Taskbar}
    */
   taskbar: null,
   /**
    * Read only.
    * @type {Ext.WindowGroup}
    */
   windows: new Ext.WindowGroup(),
   /**
    * Read only.
    * @type {Number}
    */
   xTickSize: 1,
   /**
    * Read only.
    * @type {Number}
    */
   yTickSize: 1,

   /**
    * @param {Object} config.
    */
   constructor : function(config){
      this.app = config.app;

      this.addEvents({
         winactivate: true,
         winbeforeclose: true,
         windeactivate: true
      });

      if(config.appearance){
         this.appearance = config.appearance;
      }
      if(config.background){
         this.background = config.background;
      }
      if(config.launchers){
         Ext.apply(this.launchers, config.launchers);
      }
      if(config.logoutConfig){
         this.logoutConfig = config.logoutConfig;
      }
      if(config.startMenuSortFn){
         this.startMenuSortFn = config.startMenuSortFn;
      }

      var taskbarConfig = config.taskbarConfig || {};
      if(taskbarConfig.position === 'top'){
         this.taskbar = new Ext.ux.TaskBar(taskbarConfig);
         this.el = Ext.getBody().createChild({tag: 'div', cls: 'x-desktop'});
      }else{
         this.el = Ext.getBody().createChild({tag: 'div', cls: 'x-desktop'});
         this.taskbar = new Ext.ux.TaskBar(taskbarConfig);
      }
      this.taskbar.desktop = this;

      this.contextMenu = new Ext.menu.Menu({
         items: [
            {
               text: 'Close All',
               handler: this.closeWindows,
               scope: this
            },
            '-',
            {
               text: 'Minimize All',
               handler: this.minimizeWindows,
               scope: this
            },
            '-',
            {
               text: 'Tile',
               handler: this.tileWindows,
               scope: this
            },
            {
               text: 'Cascade',
               handler: this.cascadeWindows,
               scope: this
            },
            {
               text: 'Checkerboard',
               handler: this.checkerboardWindows,
               scope: this
            },
            {
               text: 'Snap Fit',
               handler: this.snapFitWindows,
               scope: this
            },
            {
               text: 'Snap Fit Vertical',
               handler: this.snapFitVWindows,
               scope: this
            },
            '-'
         ]
      });

      this.shortcuts = new Ext.ux.Shortcuts(this);

      // todo: fix bug where Ext.Msg are not displayed properly
      this.windows.zseed = 7000; //10000;

      Ext.Desktop.superclass.constructor.call(this);

      this.initEvents();
      this.initAppearance();
      this.initBackground();
      this.initModules();
      this.initLaunchers();
      this.initLogout();
      this.layout();
   },

   initEvents : function(){
      Ext.EventManager.onWindowResize(this.layout, this);

      this.el.on('contextmenu', function(e){
         if(e.target.id === this.el.id){
            e.stopEvent();
            if(!this.contextMenu.el){
               this.contextMenu.render();
            }
            this.contextMenu.showAt(e.getXY());
         }
      }, this);
   },

   initModules : function(){
      var ms = this.app.modules;
      if(!ms){
         return false;
      }

      for(var i = 0, len = ms.length; i < len; i++){
         if(ms[i].launcher){
            ms[i].launcher.handler = this.launchWindow.createDelegate(this, [ms[i].id]);
         }
         ms[i].loaded = false;
      }

      return true;
   },

   initLaunchers : function(){
      this.initStartMenu();
      this.initContextMenu();
      this.initQuickStart();
      this.initShortcut();
      this.initAutoRun();
   },

   initStartMenu : function(){
      var menu = this.taskbar.startButton.menu;
      var config = this.buildStartItemConfig() || {};
      if(config.items){
         menu.add(config.items);
      }
      if(config.toolItems){
         // todo: update startmenu to accept array of tool items
         menu.addTool.apply(menu, config.toolItems);
      }
   },

   initAutoRun : function(){
      var mIds = this.launchers.autorun;
      if(mIds && mIds.length > 0){
         this.app.onReady(function(){
            for(var i = 0, len = mIds.length; i < len; i++){
               var m = this.app.getModule(mIds[i]);
               if(m){
                  m.autorun = true;
                  this.launchWindow(mIds[i]);
               }
            }
         }, this);
      }
   },

   initShortcut : function(){
      var mIds = this.launchers.shortcut;
      if(mIds){
         for(var i = 0, len = mIds.length; i < len; i++){
            this.addShortcut(mIds[i], false);
         }
      }
   },

   initQuickStart : function(){
      var mIds = this.launchers.quickstart;
      if(mIds){
         for(var i = 0, len = mIds.length; i < len; i++){
            this.addQuickStartButton(mIds[i], false);
         }
      }
   },

   initContextMenu : function(){
      var ms = this.app.modules;
      if(ms){
         for(var i = 0, len = ms.length; i < len; i++){
            if(ms[i].launcherPaths && ms[i].launcherPaths.contextmenu){
               this.addContextMenuItem(ms[i].id);
            }
         }
      }
   },

   initLogout : function(){
      if(this.logoutConfig){
         this.taskbar.startButton.menu.addTool(this.logoutConfig);
      }
   },

   /**
    * Provides the handler to the module launcher.
    * Requests the module, which will load the module if needed.
    * Passes in the callback and scope as params.
    * @param {string} id
    */
   launchWindow : function(id){
      var m = this.app.requestModule(id, function(m){
         if(m){m.createWindow();}
      }, this);
   },

   /**
    * @param {object} config The window config object.
    * @param {string} cls The class to use instead of Ext.Window.
    */
   createWindow : function(config, cls){
      var win = new (cls||Ext.Window)(
         Ext.applyIf(config||{}, {
            manager: this.windows,
            minimizable: true,
            maximizable: true,
            shadow: 'frame'
         })
      );

      win.render(this.el);
      win.taskButton = this.taskbar.addTaskButton(win);
      /*win.cmenu = new Ext.menu.Menu({
         items: [

         ]
      });*/
      win.animateTarget = win.taskButton.el;

      win.on({
        	'activate': {
        		fn: function(win){
        			this.markActive(win);
        			this.fireEvent('winactivate', this, win);
        		}
        		, scope: this
        	},
        	'beforeclose': {
        		fn: function(win){
        			this.fireEvent('winbeforeclose', this, win);
        		},
        		scope: this
        	},
        	'beforeshow': {
        		fn: this.markActive
        		, scope: this
        	},
        	'deactivate': {
        		fn: function(win){
        			this.markInactive(win);
        			this.fireEvent('windeactivate', this, win);
        		}
        		, scope: this
        	},
        	'minimize': {
        		fn: this.minimizeWin
        		, scope: this
        	},
        	'close': {
        		fn: this.removeWin
        		, scope: this
         }
      });

      this.layout();
      return win;
   },

   /**
    * @param {Ext.Window} win The window to minimize.
    */
   minimizeWin : function(win){
      win.minimized = true;
      win.hide();
   },

   /**
    * @param {Ext.Window} win The window to mark active.
    */
   markActive : function(win){
      if(this.activeWindow && this.activeWindow != win){
         this.markInactive(this.activeWindow);
      }
      this.taskbar.setActiveButton(win.taskButton);
      this.activeWindow = win;
      Ext.fly(win.taskButton.el).addClass('active-win');
      win.minimized = false;
   },

   /**
    * @param {Ext.Window} win The window to mark inactive.
    */
   markInactive : function(win){
      if(win == this.activeWindow){
         this.activeWindow = null;
         Ext.fly(win.taskButton.el).removeClass('active-win');
      }
   },

   /**
    * @param {Ext.Window} win The window to remove.
    */
   removeWin : function(win){
      this.taskbar.removeTaskButton(win.taskButton);
      this.layout();
   },

   layout : function(){
      this.el.setHeight(Ext.lib.Dom.getViewHeight() - this.getTaskbarHeight());
   },

   getManager : function(){
      return this.windows;
   },

   /**
    * @param {string} id The window id.
    */
   getWindow : function(id){
      return this.windows.get(id);
   },

   /**
    * @param {String} key The launcher key.  Options are: 'autorun', 'quickstart' and 'shortcut'.
    */
   getLauncher : function(key){
      return this.launchers[key];
   },

   /**
    * @param {String} key The launcher key.  Options are: 'autorun', 'quickstart' and 'shortcut'.
    * @param {String} id The module id to add.
    */
   addToLauncher : function(key, id){
      var c = this.getLauncher(key);
      if(c){
         c.push(id);
      }
   },

   /**
    * @param {String} key The launcher key.  Options are: 'autorun', 'quickstart' and 'shortcut'.
    * @param {String} id The module id to remove.
    */
   removeFromLauncher : function(key, id){
      var c = this.getLauncher(key);
      if(c){
         var i = 0;
         while(i < c.length){
            if(c[i] == id){
               c.splice(i, 1);
            }else{
               i++;
            }
         }
      }
   },

   getTaskbarPosition : function(){
      return this.taskbar.position;
   },

   getTaskbarHeight : function(){
      return this.taskbar.isVisible() ? this.taskbar.getHeight() : 0;
   },

   getViewHeight : function(){
      return (Ext.lib.Dom.getViewHeight() - this.getTaskbarHeight());
   },

   getViewWidth : function(){
      return Ext.lib.Dom.getViewWidth();
   },

   getWinWidth : function(){
      var width = this.getViewWidth();
      return width < 200 ? 200 : width;
   },

   getWinHeight : function(){
      var height = this.getViewHeight();
      return height < 100 ? 100 : height;
   },

   /**
    * @param {integer} width The width.
    */
   getWinX : function(width){
      return (Ext.lib.Dom.getViewWidth() - width) / 2
   },

   /**
    * @param {integer} height The height.
    */
   getWinY : function(height){
      return (Ext.lib.Dom.getViewHeight() - this.getTaskbarHeight() - height) / 2;
   },

   setTickSize : function(xTickSize, yTickSize){
      this.xTickSize = xTickSize;
      if (arguments.length == 1){
         this.yTickSize = xTickSize;
      }else{
         this.yTickSize = yTickSize;
      }
      this.windows.each(function(win) {
         win.dd.xTickSize = this.xTickSize;
         win.dd.yTickSize = this.yTickSize;
         win.resizer.widthIncrement = this.xTickSize;
         win.resizer.heightIncrement = this.yTickSize;
      }, this);
   },

   cascadeWindows : function(){
      var x = 0, y = 0;
      this.windows.each(function(win) {
         if(win.isVisible() && !win.maximized){
            win.setPosition(x, y);
            win.toFront();
            x += 20;
            y += 20;
         }
      }, this);
   },

   tileWindows : function(){
      var availWidth = this.el.getWidth(true);
      var x = this.xTickSize;
      var y = this.yTickSize;
      var nextY = y;
      this.windows.each(function(win) {
         if(win.isVisible() && !win.maximized){
            var w = win.el.getWidth();
            // Wrap to next row if we are not at the line start and this Window will go off the end
            if((x > this.xTickSize) && (x + w > availWidth)){
               x = this.xTickSize;
               y = nextY;
            }

            win.setPosition(x, y);
            x += w + this.xTickSize;
            nextY = Math.max(nextY, y + win.el.getHeight() + this.yTickSize);
         }
      }, this);
   },

   closeWindows : function() {
      this.windows.each(function(win) {
         win.close();
      }, this);
   },

   minimizeWindows : function() {
      this.windows.each(function(win) {
         this.minimizeWin(win);
      }, this);
   },

   checkerboardWindows : function() {
      var availWidth = this.el.getWidth(true);
      var availHeight = this.el.getHeight(true);

      var x = 0, y = 0;
      var lastx = 0, lasty = 0;

      // square size should be a value set user?
      var square = 400;

      this.windows.each(function(win) {
         // if (win.isVisible() && !win.maximized) {
         if (win.isVisible()) {
            // Subtract padding, should be a value set user?
            win.setWidth(square - 10);
            win.setHeight(square - 10);

            win.setPosition(x, y);
            x += square;

            if (x + square > availWidth) {
               x = lastx;
               y += square;

               if (y > availHeight) {
                  lastx += 20;
                  lasty += 20;
                  x = lastx;
                  y = lasty;
               }
            }
         }
      }, this);
   },

   snapFitWindows : function() {
      var availWidth = this.el.getWidth(true);
      var availHeight = this.el.getHeight(true);

      var x = 0, y = 0;

      // How to get number of windows?
      // var snapCount = windows.length;
      var snapCount = 0;

      this.windows.each(function(win) {
         if (win.isVisible()) {
            snapCount++;
         }
      }, this);
      // above loop seems unnecessary?

      var snapSize = parseInt(availWidth / snapCount);

      if (snapSize > 0) {
         this.windows.each(function(win) {
            if (win.isVisible()) {
               // Subtract 10 for padding?
               win.setWidth(snapSize);
               win.setHeight(availHeight);

               win.setPosition(x, y);
               x += snapSize;
            }
         }, this);
      }
   },

   snapFitVWindows : function(){
      var availWidth = this.el.getWidth(true);
      var availHeight = this.el.getHeight(true);

      var x = 0, y = 0;

      // How to get number of windows?
      // var snapCount = windows.length;
      var snapCount = 0;

      this.windows.each(function(win) {
         if (win.isVisible()) {
            snapCount++;
         }
      }, this);
      // above loop seems unnecessary?

      var snapSize = parseInt(availHeight / snapCount);

      if (snapSize > 0) {
         this.windows.each(function(win) {
            if (win.isVisible()) {
               // Subtract 10 for padding?
               win.setWidth(availWidth);
               win.setHeight(snapSize);

               win.setPosition(x, y);
               y += snapSize;
            }
         }, this);
      }
   },

   initAppearance : function(){
    	var a = this.appearance;
    	if(a){
         this.setFontColor(a.fontColor);
         this.setTheme(a.theme);
         this.setTaskbarTransparency(a.taskbarTransparency);
      }
   },

   getAppearance : function(){
      return this.appearance;
   },

   initBackground : function(){
      var b = this.background;
      if(b){
         this.setBackgroundColor(b.color);
         this.setWallpaperPosition(b.wallpaperPosition);
         this.setWallpaper(b.wallpaper);
      }
   },

   getBackground : function(){
      return this.background;
   },

   /**
    * @param {string} hex The hexidecimal number for the color.
    */
   setBackgroundColor : function(hex){
      if(hex){
         Ext.getBody().setStyle('background-color', '#'+hex);
         this.background.backgroundcolor = hex;
      }
   },

   /**
    * @param {string} hex The hexidecimal number for the color.
    */
   setFontColor : function(hex){
      if(hex){
         //Ext.util.CSS.updateRule('.ux-shortcut-btn-text', 'color', '#'+hex);
         this.shortcuts.setFontColor(hex);
         this.appearance.fontColor = hex;
      }
   },

   /**
    * @param {object} o The data for the theme.
    * Example:
    * {
    *    id: 1,
    *    name: 'Vista Black',
    *    file: 'path/to/file'
    * }
    */
   setTheme : function(o){
      if(o && o.id && o.name && o.file){
         Ext.util.CSS.swapStyleSheet('theme', o.file);
         this.appearance.theme = o;
      }
   },

   /**
    * @param {integer} v The value.  An integer from 0 to 100.
    */
   setTaskbarTransparency : function(v){
      if(v >= 0 && v <= 100){
         this.taskbar.el.addClass("transparent");
         Ext.util.CSS.updateRule('.transparent','opacity', v/100);
         Ext.util.CSS.updateRule('.transparent','-moz-opacity', v/100);
         Ext.util.CSS.updateRule('.transparent','filter', 'alpha(opacity='+v+')');

         this.appearance.taskbarTransparency = v;
      }
   },

   getWallpaper : function(){
      return this.background.wallpaper;
   },

   /**
    * @param {object} o The data for the wallpaper.
    * Example:
    * {
    *    id: 1,
    *    name: 'Blank',
    *    file: 'path/to/file'
    * }
    */
   setWallpaper : function(o){
      if(o && o.id && o.name && o.file){

         var notifyWin = this.showNotification({
            html: 'Loading wallpaper...',
            title: 'Please wait'
         });

         var wp = new Image();
         wp.src = o.file;

         var task = new Ext.util.DelayedTask(verify, this);
         task.delay(200);

         this.background.wallpaper = o;
      }

      function verify(){
         if(wp.complete){
            task.cancel();

            notifyWin.setIconClass('icon-done');
            notifyWin.setTitle('Finished');
            notifyWin.setMessage('Wallpaper loaded.');
            this.hideNotification(notifyWin);

            document.body.background = wp.src;
         }else{
            task.delay(200);
         }
      }
   },

   /**
    * @param {string} pos Options are 'tile' or 'center'.
    */
   setWallpaperPosition : function(pos){
      if(pos){
         var b = Ext.getBody();
         if(pos === "center"){
            b.removeClass('wallpaper-tile');
            b.addClass('wallpaper-center');
         }else if(pos === "tile"){
            b.removeClass('wallpaper-center');
            b.addClass('wallpaper-tile');
         }
         this.background.wallpaperPosition = pos;
      }
   },

   /**
    * @param {object} config The config object.
    */
   showNotification : function(config){
      var win = new Ext.ux.Notification(Ext.apply({
         animateTarget: this.taskbar.el,
         animateFrom: this.getTaskbarPosition(),
         autoDestroy: true,
         hideDelay: 5000,
         html: '',
         iconCls: 'icon-waiting',
         title: ''
      }, config));
      win.show();

      return win;
   },

   /**
    * @param {Ext.ux.Notification} win The notification window.
    * @param {integer} delay The delay time in milliseconds.
    */
   hideNotification : function(win, delay){
      if(win){
         (function(){win.animHide();}).defer(delay || 3000);
      }
   },

   /**
    * @param {string} id The id of the module to add.
    */
   addAutoRun : function(id){
      var m = this.app.getModule(id);
      var c = this.getLauncher('autorun');
			
      if(c && m && !m.autorun){
         m.autorun = true;
         c.push(id);
      }
   },

   /**
    * @param {string} id The id of the module to remove.
    */
   removeAutoRun : function(id){
      var m = this.app.getModule(id);
      var c = this.getLauncher('autorun');

      if(c && m && m.autorun){
         var i = 0;

         while(i < c.length){
            if(c[i] == id){
               c.splice(i, 1);
            }else{
               i++;
            }
         }

         m.autorun = null;
      }
   },

   /**
    * @param {string} id The id of the module to add.
    */
   addContextMenuItem : function(id){
      var m = this.app.getModule(id);

      if(m && !m.contextMenuItem && m.launcher){
         var c = m.launcher;

         this.contextMenu.add({
            handler: this.launchWindow.createDelegate(this, [id]),
            iconCls: c.iconCls,
            text: c.text,
            tooltip: c.tooltip || ''
         });
      }
   },

   /**
    * @param {string} id The module id
    * @param {boolean} updateConfig 
    */
   addShortcut : function(id, updateConfig){
      var m = this.app.getModule(id);

      if(m && !m.shortcut){
         var c = m.launcher;

         m.shortcut = this.shortcuts.addShortcut({
            handler: this.launchWindow.createDelegate(this, [id]),
            iconCls: c.shortcutIconCls,
            text: c.text,
            tooltip: c.tooltip || ''
         });

         if(updateConfig){
            this.addToLauncher('shortcut', id);
         }
      }
   },

   /**
    * @param {string} id The module id
    * @param {boolean} updateConfig
    */
   removeShortcut : function(id, updateConfig){
      var m = this.app.getModule(id);

      if(m && m.shortcut){
         this.shortcuts.removeShortcut(m.shortcut);
         m.shortcut = null;

         if(updateConfig){
            this.removeFromLauncher('shortcut', id);
         }
      }
   },

   /**
    * @param {string} id The module id
    * @param {boolean} updateConfig
    */
   addQuickStartButton : function(id, updateConfig){
    	var m = this.app.getModule(id);

      if(m && !m.quickStartButton){
         var c = m.launcher;

         m.quickStartButton = this.taskbar.addQuickStartButton({
            handler: this.launchWindow.createDelegate(this, [id]),
            iconCls: c.iconCls,
            scope: c.scope,
            text: c.text,
            tooltip: c.tooltip || c.text
         });

         if(updateConfig){
            this.addToLauncher('quickstart', id);
         }
      }
   },

   /**
    * @param {string} id The module id
    * @param {boolean} updateConfig
    */
   removeQuickStartButton : function(id, updateConfig){
      var m = this.app.getModule(id);

      if(m && m.quickStartButton){
         this.taskbar.removeQuickStartButton(m.quickStartButton);
         m.quickStartButton = null;

         if(updateConfig){
            this.removeFromLauncher('quickstart', id);
         }
      }
   },

   /**
	 * Returns the Start Menu items and toolItems configs
	 */
	buildStartItemConfig : function(){
		var ms = this.app.modules;
		var sortFn = this.startMenuSortFn;

    	if(ms){
         var launcherPaths;
    		var paths;
    		var sm = {menu: {items: []}}; // Start Menu
    		var smi = sm.menu.items;

    		smi.push({text: 'startmenu', menu: {items: []}});
    		smi.push({text: 'startmenutool', menu: {items: []}});

			for(var i = 0, iLen = ms.length; i < iLen; i++){ // loop through the modules
            if(ms[i].launcherPaths){
               launcherPaths = ms[i].launcherPaths;

               for(var id in launcherPaths){ // loop through the module's launcher paths
                  paths = launcherPaths[id].split('/');

                  if(paths.length > 0){
                     if(id === 'startmenu'){
                        simplify(smi[0].menu, paths, ms[i].launcher);
                        sort(smi[0].menu);
                     }else if(id === 'startmenutool'){
                        simplify(smi[1].menu, paths, ms[i].launcher);
                        sort(smi[1].menu);
                     }
                  }
               }
				}
			}

			return {
				items: smi[0].menu.items,
				toolItems: smi[1].menu.items
			};
    	}

    	return null;

		/**
		 * Creates nested arrays that represent the Start Menu.
		 *
		 * @param {array} pMenu The Start Menu
		 * @param {array} paths The menu texts
		 * @param {object} launcher The launcher config
		 */
		function simplify(pMenu, paths, launcher){
			var newMenu;
			var foundMenu;

			for(var i = 0, len = paths.length; i < len; i++){
            if(paths[i] === ''){
               continue;
            }

				foundMenu = findMenu(pMenu.items, paths[i]); // text exists?

				if(!foundMenu){
					newMenu = {
						iconCls: 'ux-start-menu-submenu',
						handler: function(){return false;},
						menu: {items: []},
						text: paths[i]
					};
					pMenu.items.push(newMenu);
					pMenu = newMenu.menu;
				}else{
					pMenu = foundMenu;
				}
			}

			pMenu.items.push(launcher);
		}

		/**
		 * Returns the menu if found.
		 * @param {array} pMenu The parent menu to search
		 * @param {string} text
		 */
		function findMenu(pMenu, text){
			for(var j = 0, jlen = pMenu.length; j < jlen; j++){
				if(pMenu[j].text === text){
					return pMenu[j].menu; // found the menu, return it
				}
			}
			return null;
		}

		/**
		 * @param {array} menu The nested array to sort
		 */
		function sort(menu){
			var items = menu.items;
			for(var i = 0, ilen = items.length; i < ilen; i++){
				if(items[i].menu){
					sort(items[i].menu); // use recursion to iterate nested arrays
				}
				bubbleSort(items, 0, items.length); // sort the menu items
			}
		}

		/**
		 * @param {array} items Menu items to sort
		 * @param {integer} start The start index
		 * @param {integer} stop The stop index
		 */
		function bubbleSort(items, start, stop){
			for(var i = stop - 1; i >= start;  i--){
				for(var j = start; j <= i; j++){
					if(items[j+1] && items[j]){
						if(sortFn(items[j], items[j+1])){
							var tempValue = items[j];
							items[j] = items[j+1];
							items[j+1] = tempValue;
						}

					}
				}
			}
			return items;
		}
	}
});