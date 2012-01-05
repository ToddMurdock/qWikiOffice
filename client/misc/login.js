Ext.onReady(function () {
   var submitBtn = Ext.get('submitBtn');
   submitBtn.on({
      'click': {
         fn: onClick
      },
      'mouseover': {
         fn: function () {
            submitBtn.addClass('qo-submit-over');
         }
      },
      'mouseout': {
         fn: function () {
            submitBtn.removeClass('qo-submit-over');
         }
      }
   });

   function hideLoginFields() {
      Ext.get('field1-label').setDisplayed('none');
      Ext.get('field1').setDisplayed('none');
      Ext.get('field2-label').setDisplayed('none');
      Ext.get('field2').setDisplayed('none');
   }

   function loadGroupField(d) {
      var combo = Ext.get('field3');
      var comboEl = combo.dom;

      while (comboEl.options.length) {
         comboEl.options[0] = null;
      }

      for (var i = 0, len = d.length; i < len; i++) {
         comboEl.options[i] = new Option(d[i][1], d[i][0]);
      }
   }

   function onClick() {
      var emailField = Ext.get("field1");
      var email = emailField.dom.value;
      var pwdField = Ext.get("field2");
      var pwd = pwdField.dom.value;
      var groupField = Ext.get("field3");
      var group = groupField.dom.value;

      if (validate(email) === false) {
         alert('Your email address is required');
         return;
      }

      if (validate(pwd) === false) {
         alert('Your password is required');
         return;
      }

      Ext.Ajax.request({
         url: 'services.php',
         params: {
            service: 'login',
            user: email,
            pass: pwd,
            group: group
         },
         success: function (o) {
            if (typeof o == 'object') {
               var d = Ext.decode(o.responseText);

               if (typeof d == 'object') {
                  if (d.success == true) {
                     var g = d.groups;

                     if (g && g.length > 0) {
                        hideLoginFields();
                        showGroupField();

                        var d = [];
                        for (var i = 0, len = g.length; i < len; i++) {
                           d.push([g[i].id, g[i].name]);
                        }

                        loadGroupField(d);

                     } else if (d.sessionId !== '') {

                        // get the path
                        var path = window.location.pathname;
                        path = path.substring(0, path.lastIndexOf('/') + 1);

                        // set the cookie
                        set_cookie('sessionId', d.sessionId, '', path, '', '');

                        // redirect the window
                        window.location = path;

                     }
                  } else {
                     if (d.errors && d.errors[0].msg) {
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

   function showGroupField() {
      Ext.get('field3-label').setDisplayed(true);
      Ext.get('field3').setDisplayed(true);
   }

   function validate(field) {
      if (field === '') {
         return false;
      }
      return true;
   }
});