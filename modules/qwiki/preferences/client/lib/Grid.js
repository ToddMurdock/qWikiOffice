/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

QoDesk.QoPreferences.Grid = Ext.extend(Ext.grid.GridPanel, {
	mode : null // wallpapers or themes
	, ownerModule : null
	
	, constructor : function(config){
		// constructor pre-processing
		config = config || {};
		
		this.ownerModule = config.ownerModule;
		this.mode = config.mode;
	    
	    var reader = new Ext.data.JsonReader({
	    	fields: ['group', 'id', 'name', 'thumbnail', 'file']
			, id: 'id'
			, root: this.mode //'wallpapers'
		});
	    
	    var largeIcons = new Ext.Template(
			'<div class="x-grid3-row ux-explorerview-item ux-explorerview-large-item" unselectable="on">'+
			'<table class="ux-explorerview-icon" cellpadding="0" cellspacing="0">'+
			'<tr><td align="center"><img src="{thumbnail}"></td></tr></table>'+
			'<div class="ux-explorerview-text"><div class="x-grid3-cell x-grid3-td-name" unselectable="on">{name}</div></div></div>'
		);
    
		// this config
		Ext.applyIf(config, {
			columns: [
				{header: 'Group', width: 40, sortable: true, dataIndex: 'group'}
				, {header: 'Name', sortable: true, dataIndex: 'name'}
			]
			, enableDragDrop: false
			, hideHeaders: true
			, sm: new Ext.grid.RowSelectionModel({
				listeners: {
					'rowselect': { fn: this.onRowSelect, scope: this }
				}
				, singleSelect: true
			})
			, store: new Ext.data.GroupingStore({
				baseParams: { 
					method: (this.mode === 'themes' ? 'viewThemes' : 'viewWallpapers')
					, moduleId: this.ownerModule.id
				}
				, groupField: 'group'
				, listeners: {
					'load': { fn: this.selectRecord, scope: this }
				}
				, reader: reader
				, sortInfo: {field: 'name', direction: 'ASC'}
				, url: config.ownerModule.app.connection
				
			})
         , view: new Ext.ux.grid.ExplorerView({
			//, view: new Ext.ux.grid.GroupingExplorerView({
				rowTemplate: largeIcons
				, forceFit: true
				//, groupTextTpl: '{text} ({[values.rs.length]})'
				//, showGroupName: false
			})
		});
		
		QoDesk.QoPreferences.Grid.superclass.constructor.apply(this, [config]);
		// constructor post-processing
		
		this.desktop = this.ownerModule.app.getDesktop();
	}
	
	// added methods
	
	, onRowSelect : function(sm, index, record){
		var r = record;
		var d = r.data;
		var id;
      var desktop = this.ownerModule.app.getDesktop();
		
		if(this.mode === 'themes'){
			id = desktop.getAppearance().theme.id;
		}else{
			id = desktop.getBackground().wallpaper.id;
		}
		
		if(parseInt(id) !== parseInt(r.id)){
			if(r && r.id && d.name && d.file){
				config = {
					id: r.id
					, name: d.name
					, file: d.file
				};
				
				if(this.mode === 'themes'){
					this.desktop.setTheme(config);
				}else{
					this.desktop.setWallpaper(config);
				}
			}
		}
	}
	
	, selectRecord : function(){
		var id;
		var desktop = this.ownerModule.app.getDesktop();

		if(this.mode === 'themes'){
			id = desktop.getAppearance().theme.id;
		}else{
			id = desktop.getBackground().wallpaper.id;
		}
		
		this.selModel.selectRecords([this.store.getById(id)]);
	}
});