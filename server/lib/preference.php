<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class preference {

   private $os;

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

   /** get() Returns the preference object for the member/group.
    *
    * @access public
    * @param {integer} $member_id
    * @param {integer} $group_id
    * @return {stdClass}
    */
   public function get($member_id, $group_id){
      // do we have the required params?
      if(!isset($member_id, $group_id)){
         return null;
      }

      $sql = "SELECT
         data
         FROM
         qo_preferences
         WHERE
         qo_members_id = ".$member_id."
         AND
         qo_groups_id = ".$group_id;

      $result = $this->os->db->conn->query($sql);
      if($result){
         $row = $result->fetch(PDO::FETCH_ASSOC);
         if($row){
            $decoded = json_decode($row['data']);
            // todo: log errors
            if(is_object($decoded)){
               return $decoded;
            }
         }
      }

      return null;
   } // end get()

   /**
    * set() Set the preference for the member/group.  If a preference already exists it will be updated.
    *
    * @access public
    * @param {integer} $member_id The member id.
    * @param {integer} $group_id The group id.
    * @param {stdClass} $data An object that holds the preference data.
    */
   public function set($member_id, $group_id, $data){
      // do we have the required params?
      if(!isset($member_id, $group_id, $data) || $member_id == '' || $group_id == '' || !is_object($data)){
         return false;
      }

      // add or update?
      $preference = $this->get($member_id, $group_id);
      if(!$preference){
         return $this->add($member_id, $group_id, $data);
      }

      // update
      foreach($data as $id => $property){
         $preference->$id = $property;
      }

      return $this->update($member_id, $group_id, $preference);
   } // end set()

   /**
    * add()
    *
    * @access private
    * @param {integer} $member_id The member id.
    * @param {integer} $group_id The group id.
    * @param {stdClass} $data An object that holds the preference data.
    */
   private function add($member_id, $group_id, $data){
      // do we have the required params?
      if(!isset($member_id, $group_id, $data) || $member_id == '' || $group_id == '' || !is_object($data)){
         return false;
      }

      $data_string = json_encode($data);
      if(!is_string($data_string)){
         return false;
      }

      $sql = "INSERT INTO qo_preferences (qo_groups_id, qo_members_id, data ) VALUES (?, ?, ?)";

      // prepare the statement, prevents SQL injection by calling the PDO::quote() method internally
      $sql = $this->os->db->conn->prepare($sql);
      $sql->bindParam(1, $group_id);
      $sql->bindParam(2, $member_id);
      $sql->bindParam(3, $data_string);
      $sql->execute();

      $code = $sql->errorCode();
      if($code == '00000'){
         return true;
      }

      return false;
   } // end add()

   /**
    * update()
    *
    * @access private
    * @param {integer} $member_id The member id.
    * @param {integer} $group_id The group id.
    * @param {stdClass} $data An object that holds the preference data.
    */
   private function update($member_id, $group_id, $data){
      // do we have the required params?
      if(!isset($member_id, $group_id, $data) || $member_id == '' || $group_id == '' || !is_object($data)){
         return false;
      }

      $data_string = json_encode($data);
      if(!is_string($data_string)){
         return false;
      }

      $sql = "UPDATE qo_preferences SET data = ? WHERE qo_groups_id = ? AND qo_members_id = ?";

      // prepare the statement, prevents SQL injection by calling the PDO::quote() method internally
      $sql = $this->os->db->conn->prepare($sql);
      $sql->bindParam(1, $data_string);
      $sql->bindParam(2, $group_id);
      $sql->bindParam(3, $member_id);
      $sql->execute();

      $code = $sql->errorCode();
      if($code == '00000'){
         return true;
      }

      return false;
   } // end update()
}
?>