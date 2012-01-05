/*
 * @class Ext.ux.IFrameComponent
 * @extends Ext.BoxComponent
 *
 * This also employs lazy rendering so the iframe isn't created until needed
 *
 * Usage:
 *
 * var tab = new Ext.Panel({
 *    id: id,
 *    title: title,
 *    closable:true,
 *    // layout to fit child component
 *    layout:'fit',
 *    // add iframe as the child component
 *    items: [ new Ext.ux.IFrameComponent({ id: id, url: uri }) ]
 * });
 */

Ext.ux.IFrameComponent = Ext.extend(Ext.BoxComponent, {
	onRender : function(ct, position){
		this.el = ct.createChild({
			tag: 'iframe',
			id: 'iframe-'+ this.id,
			name: 'iframe-'+ this.id,
			frameBorder: 0,
			src: this.url
		});

      // monitor resize event
      Ext.EventManager.onWindowResize(function(width, height){
         //iframe.setSize(width - space, height - space);
         //console.log(Ext.get(iframe))
      });
   }
});