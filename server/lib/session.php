<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class session {

	private $os;

   /**
    * __construct()
    *
    * @access public
    * @param {class} $os The os.
    */
	public function __construct($os){
		$this->os = $os;
	} // end __construct()

	/**
    * get_id() Returns the session id.
	 *
	 * @access private
    * @return {string}
	 */
	public function get_id(){
		if(isset($_COOKIE['sessionId'])){
         return $_COOKIE['sessionId'];
      }

      if(isset($_GET['sessionId'])){
         if(!isset($_COOKIE['sessionId'])){
            setCookie('sessionId', $_GET['sessionId'], 0, '/');
         }
         return $_GET['sessionId'];
      }

      return null;
	} // end get_id()

   /**
    * add() Adds a new session record.
    *
    * @access public
    * @param {string} $session_id The session id.
    * @param {integer} $member_id The member id.
    * @param {integer} $group_id The group id.
    * @return {boolean}
    */
   public function add($session_id, $member_id, $group_id){
      if(isset($session_id, $member_id, $group_id) && $session_id != '' && $member_id != '' && $group_id != ''){
         $sql = "INSERT INTO qo_sessions (id, qo_members_id, qo_groups_id, ip, date) VALUES (?,?,?,?,?)";

         // prepare the statement, prevents SQL injection by calling the PDO::quote() method internally
         $sql = $this->os->db->conn->prepare($sql);
         $sql->bindParam(1, $session_id);
         $sql->bindParam(2, $member_id);
         $sql->bindParam(3, $group_id);
         $sql->bindParam(4, $_SERVER['REMOTE_ADDR']);
         $sql->bindParam(5, date("Y-m-d H:i:s"));
         $sql->execute();

         $code = $sql->errorCode();
         if($code == '00000'){
            return true;
         }
      }

      return false;
   } // end add()

	/**
    * delete() Deletes the record(s) for either the passed in session id or member id.
	 *
	 * @access public
    * @param {string} $session_id (optional) The session id.
    * @param {integer} $member_id (optional) The member id.
    * @return {boolean}
	 */
	public function delete($session_id = null, $member_id = null){
      if(!isset($session_id) && !strlen($session_id) && !isset($member_id) && !strlen($member_id)){
         return false;
      }

      $sql = "DELETE FROM qo_sessions WHERE ";

      // delete by session id
      if(isset($session_id) && $session_id != ''){
         $sql .= "id = '".$session_id."'";
      }

      // delete by member id
      else if(isset($member_id) && $member_id != ''){
         $sql .= "qo_members_id = ".$member_id;
      }

      $st = $this->os->db->conn->prepare($sql);
      $st->execute();

      $code = $st->errorCode();
      if($code == '00000'){
         return true;
      }

      return false;
	} // end delete()

   /**
    * exists() Returns true/false depending on if the session is found.
    *
    * @access public
    * @param $session_id string
    * @return {boolean}
    */
   public function exists(){
      $session_id = $this->get_id();

      if($session_id != ''){
         // query the db for the session id
         $sql = "select
            qo_members_id
            from
            qo_sessions
            where
            id = '".$session_id."'";

         $result = $this->os->db->conn->query($sql);
         if($result){
            $row = $result->fetch(PDO::FETCH_ASSOC);
            if($row){
               if($row['qo_members_id'] != ''){
                  return true;
               }
            }
         }
      }

      return false;
   } // end exists()

   /**
    * get_group_id() Returns the member's group id for this session.
    *
    * @access public
    * @return {integer}
    */
   public function get_group_id(){
      $session_id = $this->get_id();

      if(isset($session_id) && $session_id != ''){
         $sql = "select
            qo_groups_id as id
            from
            qo_sessions
            where
            id = '".$session_id."'";

         $result = $this->os->db->conn->query($sql);
         if($result){
            $row = $result->fetch(PDO::FETCH_ASSOC);
            if($row){
               return $row['id'];
            }
         }
      }

      return null;
   } // end get_group_id()

   /**
    * get_member_id() Returns the member id for this session.
    *
    * @access public
    * @return {integer}
    */
   public function get_member_id(){
      $session_id = $this->get_id();

      if($session_id != ''){
         $sql = "select
            qo_members_id as id
            from
            qo_sessions
            where
            id = '".$session_id."'";

         $result = $this->os->db->conn->query($sql);
         if($result){
            $row = $result->fetch(PDO::FETCH_ASSOC);
            if($row){
               return $row['id'];
            }
         }
      }

      return null;
   } // end get_member_id()

   /** get_data() Returns session data.
     *
     * @access public
     * @param {string} $path A list of data keys seperated by forward ( / ) slashes ( optional ).
     *
     * Example: 'modules/qo-preferences'
     **/
   public function get_data($path = null){
      // session id?
      $session_id = $this->get_id();
      if(!isset($session_id) || $session_id == ''){
         return null;
      }

      $base = null;

      // session data?
      $sql = "SELECT
         data
         FROM
         qo_sessions
         WHERE
         id = '".$session_id."'";

      $result = $this->os->db->conn->query($sql);
      if($result){
         $row = $result->fetch(PDO::FETCH_ASSOC);
         if($row){
            $decoded = json_decode($row['data']);
            if(is_object($decoded)){
               $base = $decoded;
            }
         }
      }

      if(!$base){
         return null;
      }

      // was a data path passed in?
      if(isset($path) && $path != ''){
         $keys = explode('/', $path);

         if(count($keys) > 0){
            foreach($keys as $key){
               // array?
               if(is_array($base)){
                  if(!isset($base[$key])){
                     return null;
                  }
                  $base = $base[$key];
               }
               // object?
               else if(is_object($base)){
                  if(!isset($base->$key)){
                     return null;
                  }
                  $base = $base->$key;
               }
            }
         }
      }

      return $base;
   } // end get_data()

   /**
    * set_data() Sets the data for the session.
    *
    * @access public
    * @param {array/object} $data (optional) The data object
    * @return {boolean}
    */
   public function set_data($data = null){
      // session?
      $session_id = $this->get_id();
      if(!isset($session_id) || $session_id == ''){
         return false;
      }

      $data_string = '';

      // do we have the optional param?
      if(is_object($data) || is_array($data)){
         // can encode the data?
         $data_string = json_encode($data);
         if(!is_string($data_string)){
            return false;
         }
      }

      // update the data field
      $sql = "UPDATE qo_sessions SET data = ? WHERE id = ?";

      // prepare the statement, prevents SQL injection by calling the PDO::quote() method internally
      $sql = $this->os->db->conn->prepare($sql);
      $sql->bindParam(1, $data_string);
      $sql->bindParam(2, $session_id);
      $sql->execute();

      $code = $sql->errorCode();
      if($code == '00000'){
         return true;
      }

      return false;
   } // end set_data()
}
?>