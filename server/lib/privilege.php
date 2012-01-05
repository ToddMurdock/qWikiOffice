<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class privilege {

   private $os = null;
   private $errors = null;

   // public methods

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

   public function __destruct(){
      if(count($this->errors) > 0){
         $this->os->load('log');
         $this->os->log->error($this->errors);
      }
   } // end __destruct()

   /**
    * get_all()
    *
    * @access public
    * @param {boolean} $active (optional) True to only return the active privileges.
    * @return {array}
    */
   public function get_all($active = false){
      $sql = "SELECT * FROM qo_privileges";

      if($active){
         $sql .= " WHERE active = 1";
      }

      $result = $this->os->db->conn->query($sql);
      if($result){
         $privileges = array();
         while($row = $result->fetch(PDO::FETCH_ASSOC)){
            $data = json_decode($row['data']);

            if(!is_object($data)){
               $this->errors[] = "Script: privilege.php, Method: get_all, Message: 'qo_privileges' table, 'id' ".$row['id']." has 'data' that could not be decoded";
               continue;
            }

            $row['data'] = $data;
            $privileges[] = $row;
         }
      }

      return count($privileges) > 0 ? $privileges : null;
   } // end get_all()

   /**
    * get_active()
    *
    * @access public
    * @return {array} An associative array with the privilege id as the index.
    */
   public function get_active(){
      return $this->get_all(true);
   } // end get_active()

   /**
    * get_by_id() Returns a record object with id, data and active properties
    *
    * @param {integer} $id The privilege (record) id.
    * @return {array} An associative array.
    */
   public function get_by_id($id){
      if(!isset($id) || $id == ''){
         return null;
      }

      $sql = "SELECT * FROM qo_privileges WHERE id = ".$id;

      $result = $this->os->db->conn->query($sql);
      if($result){
         $row = $result->fetch(PDO::FETCH_ASSOC);
         if($row){
            $data = json_decode($row['data']);

            if(is_object($data)){
               $row['data'] = $data;
               return $row;
            }else{
               $this->errors[] = '{ "script": "privilege.php", "method": "get_by_id", "message": "In the qo_privileges table, row id: '.$id.' has data that could not be decoded" }';
            }
         }
      }

      return null;
   } // end get_by_id()

   /**
    * get_data() Returns the privilege data for the id passed in.
    *
    * @access public
    * @param {integer} $id The id of the privilege.
    * @return {object} The decoded data object.
    */
   public function get_data($id){
      $row = $this->get_by_id($id);
      if($row){
         return $row['data'];
      }

      return null;
   } // end get_data()

   /**
    * is_active() Returns true if the passed in privilege is active.
    *
    * @access public
    * @param {integer} $id The privilege id.
    * @return {boolean}
    */
   public function is_active($id){
      if(!isset($id) || $id == ''){
         return null;
      }

      $sql = "SELECT active FROM qo_privileges WHERE id = ".$id;

      $result = $this->os->db->conn->query($sql);
      if($result){
         $row = $result->fetch(PDO::FETCH_ASSOC);
         if($row && $row['active'] == 1){
            return true;
         }
      }

      return false;
   } // end is_active()

   /**
    * is_allowed() Return true if the module (optionally its method) has allow set to a value of 1 for the privilege.
    *
    * @access public
    * @param {integer/object} $privilege The privilege id or the privilege data object.
    * @param {string} $module_id The module id.
    * @param {string} $method_name (optional) The method name.
    * @return {boolean}
    */
   public function is_allowed($privilege, $module_id, $method_name = null){
      // have required params?
      if(!isset($privilege, $module_id) || $privilege == '' || $module_id == ''){
         return false;
      }

      // was the privilege data passed in?
      if(is_object($privilege)){
         $data = $privilege;
      }
      // the privilege id was passed in, get the data
      else{
         $data = $this->get_data($privilege);
      }

      // privilege?
      if(!isset($data)){
         return false;
      }

      // if the optional $method_name param was passed in?
      if(isset($method_name) && $method_name != ''){
         if(isset($data->$module_id) && is_array($data->$module_id) && in_array($method_name, $data->$module_id)){
            return true;
         }
      }else{
         if(isset($data->$module_id) && is_array($data->$module_id)){
            return true;
         }
      }

      return false;
   } // end is_allowed()
}
?>