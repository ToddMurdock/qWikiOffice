Ext.onReady(function () {
   var btn = Ext.get('submitBtn');
   btn.on({
      'click': {
         fn: onClick
      },
      'mouseover': {
         fn: function () {
            btn.addClass('qo-submit-over');
         }
      },
      'mouseout': {
         fn: function () {
            btn.removeClass('qo-submit-over');
         }
      }
   });

   function onClick() {
      var emailField = Ext.get("field1");
      var email = emailField.dom.value;

      if (validate(email) === false) {
         alert('Your email address is required');
         return;
      }

      Ext.Ajax.request({
         url: 'services.php',
         params: {
            service: 'forgotPassword',
            user: email
         },
         success: function (o) {
            if (typeof o == 'object') {
               var d = Ext.decode(o.responseText);

               if (typeof d == 'object') {
                  if (d.success == true) {
                     alert('Your password has been sent to your email.');
                  } else {
                     if (d.errors) {
                        alert(d.errors[0].msg);
                     } else {
                        alert('Errors encountered on the server.');
                     }
                  }
               }
            }
         },
         failure: function () {
            alert('Lost connection to server.');
         }
      });
   }

   function validate(field) {
      if (field === '') {
         return false;
      }
      return true;
   }
});