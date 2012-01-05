Ext.onReady(function () {
   var btn = Ext.get("submitBtn");
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
      var firstNameField = Ext.get("field1");
      var firstName = firstNameField.dom.value;

      var lastNameField = Ext.get("field2");
      var lastName = lastNameField.dom.value;

      var emailField = Ext.get("field3");
      var email = emailField.dom.value;

      var emailVerifyField = Ext.get("field4");
      var emailVerify = emailVerifyField.dom.value;

      var commentsField = Ext.get("field5");
      var comments = commentsField.dom.value;

      if (validate(firstName) === false) {
         alert("Your first name is required");
         return;
      }

      if (validate(lastName) === false) {
         alert("Your last name is required");
         return;
      }

      if (validate(email) === false) {
         alert("Your email address is required");
         return;
      }

      if (validate(emailVerify) === false || (email !== emailVerify)) {
         alert("Please verify your email address again");
         return;
      }

      Ext.Ajax.request({
         url: 'services.php',
         params: {
            service: 'signup',
            first_name: firstName,
            last_name: lastName,
            email: email,
            email_verify: emailVerify,
            comments: comments
         },
         success: function (o) {
            if (typeof o == 'object') {
               var d = Ext.decode(o.responseText);

               if (typeof d == 'object') {
                  if (d.success == true) {
                     firstNameField.dom.value = "";
                     lastNameField.dom.value = "";
                     emailField.dom.value = "";
                     emailVerifyField.dom.value = "";
                     commentsField.dom.value = "";

                     alert('Your sign up request has been sent. \n\nYou will receive an email notification once we process your request.');
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