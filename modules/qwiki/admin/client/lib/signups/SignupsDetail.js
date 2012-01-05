QoDesk.QoAdmin.SignupsDetail = Ext.extend(Ext.Panel, {
   signupId: null
   
   , constructor : function(config){
   	config = config || {};
   	
      this.ownerModule = config.ownerModule;

      Ext.apply(config, {
	      autoScroll: true
	      , border: false
	      , height: 150
	      , cls: 'qo-admin-member-detail'
      });
      
      QoDesk.QoAdmin.SignupsDetail.superclass.constructor.call(this, config);
   }
   
   , afterRender : function(){
      QoDesk.QoAdmin.SignupsDetail.superclass.afterRender.call(this);
        
        this.ownerPanel.on('signupedited', this.onMemberEdited, this);
   }
   
   , getMemberId : function(){
      return this.memberId;
   }
   
   , onMemberEdited : function(record){
      if(record && record.id === this.memberId){
         this.updateDetail(record.data);
      }
   }
   
   , setMemberId : function(id){
      if(id){
         this.memberId = id;
      }
   }
   
   , updateDetail : function(data){
      var tpl = new Ext.XTemplate(
         '<table id="qo-admin-detail-table"><tr><td>'
         , '<p><b>Name:</b> {first_name} {last_name}</p>'
         , '<p><b>Email:</b> {email_address}</p>'
         , '<p><b>Comments:</b></p><p>{comments}</p>'
         //, '<td class="qo-admin-edit-btn"><p><button id="qo-admin-edit">Edit</button></p></td>'
         , '</tr></table>'
      );
      tpl.overwrite(this.body, data);
    }
});