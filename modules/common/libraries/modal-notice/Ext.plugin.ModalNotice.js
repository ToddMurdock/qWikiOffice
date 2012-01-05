Ext.namespace("Ext.plugin");
Ext.plugin.ModalNotice = Ext.extend(Ext.util.Observable, {
   init: function(win){
      this.window = win;
      this.window.on('render', function(){
         if(this.window.modal === true){
            this.mask = this.window.container.select('div.ext-el-mask');
            this.mask.applyStyles('opacity: 0.0');	 
            this.mask.on('click', this.onMaskClick, this);
         }
      }, this);
   },	
   onMaskClick: function(){
      this.mask.applyStyles('opacity: 0.5');	
      (function(){ this.mask.applyStyles('opacity: 0.0'); }).defer(250, this);
   }
});