/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 * 
 * http://www.qwikioffice.com/license
 */

QoDesk.QoAdmin.Nav = function(ownerModule){
   this.ownerModule = ownerModule;

   var data = {
      items: [
         { cls: 'qo-admin-members-icon', id: 'viewMembers', label: 'Members' }
         , { cls: 'qo-admin-groups-icon', id: 'viewGroups', label: 'Groups' }
         , { cls: 'qo-admin-privileges-icon', id: 'viewPrivileges', label: 'Privileges' }
         //, { cls: 'qo-admin-signups-icon', id: 'viewSignups', label: 'Signups' }
      ]
   };

   var dataView = new Ext.DataView({
      itemSelector: 'div.thumb-wrap'
      , listeners: {
         'click': {
            fn: function(dataView, index, node){
               var r = dataView.getRecord(node);
               if(r && r.id){
                  var action = r.id;
                  this.ownerModule[action]();
               }
            }
            , scope: this
         }
      }
      , overClass: 'x-view-over'
      , singleSelect: true
      , store: new Ext.data.JsonStore({
         data: data
         , fields: [ 'cls', 'id', 'label' ]
         , idProperty: 'id'
         , root: 'items'
      })
      , tpl: new Ext.XTemplate(
         '<tpl for=".">'
            , '<div class="thumb-wrap" id="{id}">'
               , '<div class="thumb {cls}"></div>'
                  , '<span>{label}</span>'
               , '</div>'
            , '</tpl>'
         , '<div class="x-clear"></div>'
         //, { disableFormats: true }
      )
   });

   QoDesk.QoAdmin.Nav.superclass.constructor.call(this, {
      autoScroll: true
      , cls: 'qo-admin-nav'
      , items: dataView
      , title: 'Home'
   });

   /*this.actions = {
      'viewGroups' : function(ownerModule){
         ownerModule.viewGroups();
      }
      , 'viewMembers' : function(ownerModule){
         ownerModule.viewMembers();
      }
      , 'viewPrivileges' : function(ownerModule){
         ownerModule.viewPrivileges();
      }
      , 'viewSignups' : function(ownerModule){
         ownerModule.viewSignups();
      }
   };*/
};

Ext.extend(QoDesk.QoAdmin.Nav, Ext.Panel);