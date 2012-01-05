// Grid column plugin that does the active/inactive button in the left-most column
QoDesk.QoAdmin.ActiveColumn = function (config) {
   var grid;

   function getRecord(t) {
      var index = grid.getView().findRowIndex(t);
      return grid.store.getAt(index);
   }

   function onMouseDown(e, t) {
      if (Ext.fly(t).hasClass('active-check')) {
         e.stopEvent();
         var record = getRecord(t);
         record.set('active', !record.data.active);
         grid.handleUpdate(record);
      }
   }

   function onMouseOver(e, t) {
      if (Ext.fly(t).hasClass('active-check')) {
         Ext.fly(t.parentNode).addClass('active-check-over');
      }
   }

   function onMouseOut(e, t) {
      if (Ext.fly(t).hasClass('active-check')) {
         Ext.fly(t.parentNode).removeClass('active-check-over');
      }
   }

   Ext.apply(this, {
      width: 22,
      header: '<div class="active-col-hd"></div>',
      menuDisabled: true,
      fixed: true,
      id: 'active-col',
      renderer: function () {
         return '<div class="active-check"></div>';
      },
      init: function (xg) {
         grid = xg;
         grid.on('render', function () {
            var view = grid.getView();
            view.mainBody.on('mousedown', onMouseDown);
            view.mainBody.on('mouseover', onMouseOver);
            view.mainBody.on('mouseout', onMouseOut);
         });
      }
   }, config);
};