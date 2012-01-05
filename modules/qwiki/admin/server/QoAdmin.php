<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class QoAdmin {

   private $os = null;
   private $QoAdminGroup = null;
   private $QoAdminMember = null;
   private $QoAdminPrivilege = null;

   /**
    * __construct()
    *
    * @access public
    * @param {class} $os The os.
    */
   public function __construct(os $os){
      if(!$os->session_exists()){
         die('Session does not exist!');
      }

      $this->os = $os;
   } // end __construct()

   // allow library classes to be loaded on demand

   /**
    * load() Loads and instantiates the requested class
    *
    * @access public
    * @param {string) $class The class name
    */
   public function load($class){
      if(!class_exists($class)){
         require_once('lib/'.$class.'.php');
         if(class_exists($class)){
            $this->$class = new $class($this->os);
            return true;
         }
      }
      return false;
   } // end load()

   // members

   /**
    * viewMembers()
    *
    * @access public
    */
   public function viewMembers(){
      $this->load('QoAdminMember');
      $this->QoAdminMember->view();
   } // end viewMembers()

   /**
    * addMember()
    * 
    * @access public
    */
   public function addMember(){
      $this->load('QoAdminMember');
      $this->QoAdminMember->add();
   } // end addMember()

   /**
    * editMember()
    * 
    * @access public
    */
   public function editMember(){
      $this->load('QoAdminMember');
      $this->QoAdminMember->edit();
   } // end editMember()

   /**
    * deleteMember()
    * 
    * @access public
    */
	public function deleteMember(){
      $this->load('QoAdminMember');
      $this->QoAdminMember->delete();
   } // end deleteMember()

   /**
    * viewMemberGroups()
    *
    * @access public
    */
   public function viewMemberGroups(){
      $this->load('QoAdminMember');
      $this->QoAdminMember->view_groups();
   } // end viewMemberGroups()

   /**
    * editMembersGroups()
    *
    * @access public
    */
   public function editMembersGroups(){
      $this->load('QoAdminMember');
      $this->QoAdminMember->edit_groups();
   } // end editMembersGroups()

   // groups

   /**
    * viewGroups()
    *
    * @access public
    */
   public function viewGroups(){
      $this->load('QoAdminGroup');
      $this->QoAdminGroup->view();
   } // end viewGroups()

   /**
    * addGroup()
    *
    * @access public
    */
   public function addGroup(){
      $this->load('QoAdminGroup');
      $this->QoAdminGroup->add();
   } // end addGroup()

   /**
    * editGroup()
    *
    * @access public
    */
   public function editGroup(){
      $this->load('QoAdminGroup');
      $this->QoAdminGroup->edit();
   } // end editGroup()

   /**
    * deleteGroup()
    *
    * @access public
    */
   public function deleteGroup(){
      $this->load('QoAdminGroup');
      $this->QoAdminGroup->delete();
   } // end deleteGroup()

   /**
    * viewGroupPrivileges()
    *
    * @access public
    */
   public function viewGroupPrivileges(){
      $this->load('QoAdminGroup');
      $this->QoAdminGroup->view_privileges();
   } // end viewGroupPrivileges()

   /**
    * editGroupPrivilege()
    *
    * @access public
    */
   public function editGroupPrivilege(){
      $this->load('QoAdminGroup');
      $this->QoAdminGroup->edit_privilege();
   } // end editGroupPrivilege()

   // privilege

   /**
    * viewPrivileges()
    *
    * @access public
    */
   public function viewPrivileges(){
      $this->load('QoAdminPrivilege');
      $this->QoAdminPrivilege->view();
   } // end viewPrivileges()

   /**
    * addPrivilege()
    *
    * @access public
    */
   public function addPrivilege(){
      $this->load('QoAdminPrivilege');
      $this->QoAdminPrivilege->add();
   } // end addPrivileges()

   /**
    * editPrivilege()
    *
    * @access public
    */
   public function editPrivilege(){
      $this->load('QoAdminPrivilege');
      $this->QoAdminPrivilege->edit();
   } // end editPrivileges()

   /**
    * deletePrivilege()
    *
    * @access public
    */
   public function deletePrivilege(){
      $this->load('QoAdminPrivilege');
      $this->QoAdminPrivilege->delete();
   } // end deletePrivileges()

   /**
    * viewPrivilegeModules()
    *
    * @access public
    */
   public function viewPrivilegeModules(){
      $this->load('QoAdminPrivilege');
      $this->QoAdminPrivilege->view_modules();
   } // end viewPrivilegeModules()

   /**
    * editPrivilegeData()
    *
    */
   public function editPrivilegeModules(){
      $this->load('QoAdminPrivilege');
      $this->QoAdminPrivilege->edit_modules();
   } // end editPrivilegeData()
}
?>