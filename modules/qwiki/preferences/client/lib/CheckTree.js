QoDesk.QoPreferences.CheckTree = Ext.extend(Ext.tree.TreePanel, {
   /**
    * @cfg {String}
    */
   launcherKey: null

   , constructor : function(config){
		// constructor pre-processing
		config = config || {};
      this.launcherKey = config.launcherKey || null;

		this.ownerModule = config.ownerModule;

		var ms = this.ownerModule.app.modules;
		var ids = this.ownerModule.app.getDesktop().getLauncher(this.launcherKey);
		var nodes = expandNodes(ms, ids);

		// this config
		Ext.applyIf(config, {
			autoScroll: true
			, bodyStyle: 'padding:10px'
			, border: true
			, cls: 'pref-card pref-check-tree'
			, lines: false
			, loader: new Ext.tree.TreeLoader()
			, margins: '0 5 0 5'
			, rootVisible: false
			, root: new Ext.tree.AsyncTreeNode({
				text: 'Hidden Root'
				, children: nodes
			})
			, split: false
			, width: 220
		});

		QoDesk.QoPreferences.CheckTree.superclass.constructor.apply(this, [config]);
		// constructor post-processing
		this.on('checkchange', onCheckChange, this);

		new Ext.tree.TreeSorter(this, {dir: "asc"});

		function expandNodes(ms, ids){
			var nodes = [];

			for(var i = 0, len = ms.length; i < len; i++){
				if(ms[i].moduleType === 'menu'){
					/* nodes.push({
						leaf: false,
						text: ms[i].launcher.text,
						children: this.expandNodes(o.menu.items, ids)
					}); */
				}else{
               var checked = isChecked(ms[i].id, ids);
               nodes.push({
                  checked: checked ? true : false,
                  cls: checked ? 'complete' : null,
                  iconCls: ms[i].launcher.iconCls || '',
                  id: ms[i].id,
                  leaf: true,
                  selected: true,
                  text: ms[i].launcher.text
					});
				}
			}

			return nodes;
		}

		function isChecked(id, ids){
			for(var i = 0, len = ids.length; i < len; i++){
				if(id == ids[i]){
					return true;
				}
			}
         return false;
		}

		function onCheckChange(node, checked){
			if(checked){
            node.getUI().addClass('complete');
         }else{
            node.getUI().removeClass('complete');
	    	}
	    	node.ownerTree.selModel.select(node);
	    }
	}
});