<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class QoProfile {

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

	// begin public module methods

   /**
    * loadProfile()
    */
   public function loadProfile(){
      $response = '{"success":false}';

      $member_id = $this->os->get_member_id();
      if(isset($member_id) && $member_id != '' && is_numeric($member_id)){
         $sql = 'SELECT
            first_name AS field1,
            last_name AS field2,
            email_address AS field3
            FROM
            qo_members
            WHERE
            id = '.$member_id;

         $result = $this->os->db->conn->query($sql);
         if($result){

            $row = $result->fetch(PDO::FETCH_ASSOC);
            if($row){
               $response = '{"success":true,"data":'.json_encode($row).'}';
            }
         }
      }

      print $response;
   } // end loadProfile()

   /**
    * saveProfile()
    */
   public function saveProfile(){
      $response = '{success:false}';

      $member_id = $this->os->get_member_id();
      if(isset($member_id) && $member_id != '' && is_numeric($member_id)){
         // get post data
         $field1 = (!empty($_POST['field1']) ? $_POST['field1'] : NULL);
         $field2 = (!empty($_POST['field2']) ? $_POST['field2'] : NULL);
         $field3 = (!empty($_POST['field3']) ? $_POST['field3'] : NULL);
         // valid data
         if(isset($field1, $field2, $field3)){
            $sql = 'UPDATE qo_members SET first_name = ?, last_name = ?, email_address = ? WHERE id = '.$member_id;

            // prepare the statement, prevents SQL injection by calling the PDO::quote() method internally
            $sql = $this->os->db->conn->prepare($sql);
            $sql->bindParam(1, $field1);
            $sql->bindParam(2, $field2);
            $sql->bindParam(3, $field3);
            $sql->execute();

            $code = $sql->errorCode();
            if($code == '00000'){
               $response = '{"success":true}';
            }
         }
      }

      print $response;
   } // end saveProfile()

   /**
    * savePwd()
    */
   public function savePwd(){
      $response = '{success:false}';

      $member_id = $this->os->get_member_id();
      if(isset($member_id) && $member_id != '' && is_numeric($member_id)){
         // get post data
         $field1 = (!empty($_POST['field1']) ? $_POST['field1'] : NULL);
         $field2 = (!empty($_POST['field2']) ? $_POST['field2'] : NULL);
         // valid data
         if(isset($field1, $field2) && $field1 == $field2){
            // encrypt the password
            $this->os->load('security');
            $pwd = $this->os->security->encrypt($field1);
            $sql = 'UPDATE qo_members SET password = ? WHERE id = '.$member_id;
            // prepare the statement, prevents SQL injection by calling the PDO::quote() method internally
            $sql = $this->os->db->conn->prepare($sql);
            $sql->bindParam(1, $pwd);
            $sql->execute();

            $code = $sql->errorCode();
            if($code == '00000'){
               $response = '{"success":true}';
            }
         }
      }

      print $response;
   } // end savePwd()
}
?>