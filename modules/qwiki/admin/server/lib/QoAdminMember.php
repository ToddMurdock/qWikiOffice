<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class QoAdminMember {

   private $os = null;
   private $errors = null;

   /**
    * __construct()
    *
    * @access public
    * @param {class} $os The os.
    */
   public function __construct(os $os){
      $this->os = $os;
      $this->errors = array();
   } // end __construct()

   public function __destruct(){
      if(count($this->errors) > 0){
         $this->os->load('log');
         $this->os->log->error($this->errors);
      }
   } // end __destruct()

   /**
    * view()
    *
    * @access public
    */
   public function view(){
      $response = '{qo_members:[]}';

      // filter
      $filter_field = isset($_POST['filterField']) ? $_POST['filterField'] : NULL;
      $filter_text = isset($_POST['filterText']) ? trim(strtolower($_POST['filterText'])) : NULL;
      // paging
      $start = isset($_POST['start']) ? $_POST['start'] : NULL;
      $limit = isset($_POST['limit']) ? $_POST['limit'] : NULL;
      // sort
      $dir = isset($_POST['dir']) ? $_POST['dir'] : NULL;
      $sort = isset($_POST['sort']) ? $_POST['sort'] : NULL;

      $sql = 'SELECT
         id,
         first_name,
         last_name,
         email_address,
         locale,
         active
         FROM
         qo_members';

      // filter?
      $sql_filter = '';
      if($filter_text && $filter_text != ''){
         if($filter_field === 'active'){
            if($filter_text == 'true' || $filter_text == 'yes'){
               $filter_text = 1;
            }else{
               $filter_text = 0;
            }
         }
         $sql_filter = " WHERE ".$filter_field." LIKE '%".$filter_text."%'";
      }

      // sort passed in?
      if(!$sort || $sort == ''){
         // sort by the filter field?
         if($filter_field && $filter_field != ''){
            $sort = $filter_field;
         }else{
            $sort = 'last_name';
         }
      }
      if(!$dir || $dir == ''){
         // defaults to ASC
         $dir = 'ASC';
      }
      $sql_order_by = ' ORDER BY '.$sort.' '.$dir;

      // limit?
      $sql_limit = '';
      if($start != '' && $limit != ''){
         $sql_limit = " limit ".$start.", ".$limit;
      }

      $result = $this->os->db->conn->query($sql.$sql_filter.$sql_order_by.$sql_limit);
      if($result){
         $items = array();

         while($row = $result->fetch(PDO::FETCH_ASSOC)){
            $row['active'] = $row['active'] == 1 ? true : false;
            $items[] = $row;
         }

         $response = '{"qo_members":'.json_encode($items).'}';
      }

      print $response;
   } // end view()

   /**
    * add() Adds new members.
    * The POST 'data' param should look like this
    * [{"last_name":"Test","first_name":"Name","email_address":"t@a.com","password":"test","locale":"en","active":false,"store_id":"ext-record-1"}]
    *
    * @access public
    */
   public function add(){
      $response = '{success:false}';
      $data = $_POST['data'];

      if(isset($data) && $data != ''){
         // decode the data array
         $data = json_decode($data);
         if(is_array($data) && count($data) > 0){

            $this->os->load('security');
            $result = new stdClass();
            $result->created = array();
            $result->failed = array();

            // loop thru each data object
            for($i = 0, $len = count($data); $i < $len; $i++){
               $id = null;

               if(isset($data[$i]->first_name, $data[$i]->last_name, $data[$i]->email_address, $data[$i]->password, $data[$i]->locale, $data[$i]->active)){
                  // encrypt the password
                  $password = $this->os->security->encrypt($data[$i]->password);

                  $sql = "INSERT INTO qo_members (first_name, last_name, email_address, password, locale, active) VALUES (?, ?, ?, ?, ?, ?)";

                  // prepare the statement, prevents SQL injection by calling the PDO::quote() method internally
                  $sql = $this->os->db->conn->prepare($sql);
                  $sql->bindParam(1, $data[$i]->first_name);
                  $sql->bindParam(2, $data[$i]->last_name);
                  $sql->bindParam(3, $data[$i]->email_address);
                  $sql->bindParam(4, $password);
                  $sql->bindParam(5, $data[$i]->locale);
                  $sql->bindParam(6, $data[$i]->active);
                  $sql->execute();

                  $code = $sql->errorCode();
                  if($code == '00000'){
                     $id = $this->os->db->conn->lastInsertId();
                  }else{
                     $this->errors[] = 'Script: QoAdmin.php, Method: add_member, Message: PDO error code - '.$code;
                  }
               }

               if($id){
                  $temp = new stdClass();
                  $temp->store_id = $data[$i]->store_id;
                  $temp->id = $id;
                  $result->created[] = $temp;
               }else{
                  $result->failed[] = $data[$i]->store_id;
               }
            }

            $response = json_encode($result);
         }
      }

      print $response;
   } // end add()

   /**
    * edit()
    * The POST 'data' param should look like this
    * [{"last_name":"User","id":"2"}]
    *
    * @access public
    */
   public function edit(){
      $response = '{success:false}';

      $data = $_POST['data'];

      if(isset($data) && $data != ''){
         // decode the data array
         $data = json_decode($data);
         if(is_array($data) && count($data) > 0){

            // track results
            $results = new stdClass();
            $results->saved = array();
            $results->failed = array();

            // loop thru each data object
            for($i = 0, $len = count($data); $i < $len; $i++){
               // loop thru the objects key/values to build sql
               $temp = '';
               foreach($data[$i] AS $key => $value){
                  if($key !== 'id'){
                     $temp .= $temp !== '' ? ', '.$key.' = ?' : $key.' = ?';
                  }
               }

               // build sql
               $sql = 'UPDATE qo_members SET '.$temp.' WHERE id = '.$data[$i]->id;
               // prepare the statement, prevents SQL injection by calling the PDO::quote() method internally
               $sql = $this->os->db->conn->prepare($sql);

               // loop thru the objects key/values to bind params
               $index = 0;
               foreach($data[$i] AS $key => $value){
                  // make copy... only way I can get it to pass by value into bindParam() instead of by reference
                  $item = new stdClass();
                  $item->$key = $value;

                  if($key !== 'id'){
                     if($key === 'password'){
                        // encrypt the password
                        $this->os->load('security');
                        $item->$key = $this->os->security->encrypt($item->$key);
                     }
                     $sql->bindParam(++$index, $item->$key);
                  }
               }

               $sql->execute();

               $code = $sql->errorCode();
               if($code == '00000'){
                  $results->saved[] = $data[$i]->id;
               }else{
                  $results->failed[] = $data[$i]->id;
                  $this->errors[] = 'Script: QoAdmin.php, Method: edit_member, Message: PDO error code - '.$code;
               }
            }

            $results->success = count($results->failed) > 0 ? false : true;
            $response = json_encode($results);
         }
      }

      print $response;
   } // end edit()

   /**
    * delete()
    * The POST 'data' param should look like this
    * [{"store_id": "ext-record-1", "id": 1}]
    * @access public
    */
	public function delete(){
      $data = $_POST['data'];
      $data = json_decode(stripslashes($data));

      $result = new stdClass();
      $result->deleted = array();
      $result->failed = array();

      if(is_array($data) && count($data) > 0){
         for($i = 0, $len = count($data); $i < $len; $i++){
            $success = false;

            // delete the member preferences
            if($this->delete_preference($data[$i]->id)){
               // delete the member from all groups
               if($this->delete_from_group($data[$i]->id)){
                  // delete the member session
                  if($this->delete_session($data[$i]->id)){
                     // delete the member
                     $st = $this->os->db->conn->prepare("DELETE FROM qo_members WHERE id = ".$data[$i]->id);
                     $st->execute();

                     $code = $st->errorCode();
                     if($code == '00000'){
                        $success = true;
                     }else{
                        $this->errors[] = "Script: QoAdmin.php, Method: delete_members, Message: PDO error code - ".$code;
                     }
                  }
               }
            }

            if($success){
               $result->deleted[] = $data[$i];
            }else{
               $result->failed[] = $data[$i];
            }
         }
      }

      print json_encode($result);
   } // end delete()

   /**
    * delete_preference() Deletes a group or member preference.
    *
    * @access private
    * @param {integer} $id The id of the member.
    * @return {boolean}
    */
   private function delete_preference($id){
      if(!isset($id) || $id == ''){
         return false;
      }

      $sql = "DELETE FROM qo_preferences WHERE qo_members_id = ".$id;
      $st = $this->os->db->conn->prepare($sql);
      $st->execute();

      $code = $st->errorCode();
      if($code == '00000'){
         return true;
      }else{
         $this->errors[] = "Script: QoAdminMember.php, Method: delete_preference, Message: PDO error code - ".$code;
      }

      return false;
   } // end delete_preference()

   /**
    * delete_session()
    *
    * @param {integer} $id
    * @return {boolean}
    */
   private function delete_session($id){
      $response = false;

      if($id != ""){
         $st = $this->os->db->conn->prepare("DELETE FROM qo_sessions WHERE qo_members_id = ".$id);
         $st->execute();

         $code = $st->errorCode();
         if($code == '00000'){
            $response = true;
         }else{
            $this->errors[] = "Script: QoAdmin.php, Method: delete_session, Message: PDO error code - ".$code;
         }
      }
      return $response;
   } // end delete_session()

   /**
    * view_groups() Returns data to load an Ext.tree.TreePanel
    *
    * @access public
    */
   public function view_groups(){
      $response = '{success:false}';
      $member_id = isset($_POST['id']) ? $_POST['id'] : null;

      // do we have the member id?
      if(!$member_id){
         print $response;
         return false;
      }

      $this->os->load('group');

      // get all active groups
      $all_groups = $this->os->group->get_active();
      if(!isset($all_groups) || !is_array($all_groups) || count($all_groups) == 0){
         print $response;
         return false;
      }

      // get the current active member groups
      // will be null if the member is not in any groups
      $cur_groups = $this->os->group->get_by_member_id($member_id, true);

      //loop through all groups
      for($i = 0, $ilen = count($all_groups); $i < $ilen; $i++){
         $all_groups[$i]['checked'] = false;

         if($cur_groups){
            // loop through each current group
            for($j = 0, $jlen = count($cur_groups); $j < $jlen; $j++){
               // is the member in the group?
               if($all_groups[$i]['id'] == $cur_groups[$j]['id']){
                  $all_groups[$i]['checked'] = true;
               }
            }
         }
      }

      // build the tree nodes
      $nodes = array();
      foreach($all_groups as $group){
         $data = new stdClass();

         $data->active = $group['active'];
         $data->checked = $group['checked'];
         $data->id = $group['id'];
         $data->iconCls = 'qo-admin-group';
         $data->leaf = true;
         $data->text = $group['name'];

         $nodes[] = $data;
      }

      if(count($nodes) == 0){
         print $response;
         return false;
      }

      print json_encode($nodes);
   } // end view_groups()

   /**
    * edit_groups()
    *
    * @access public
    */
   public function edit_groups(){
      $response = '{"success":false}';
      $group_ids = isset($_POST['groupIds']) ? $_POST['groupIds'] : null;
      $member_id = isset($_POST['memberId']) ? $_POST['memberId'] : null;

      if(isset($group_ids, $member_id) == false){
         print $response;
         return false;
      }

      $group_ids = json_decode($group_ids);
      if(!isset($group_ids) || !is_array($group_ids) || count($group_ids) == 0){
         print $response;
         return false;
      }

      $this->os->load('group');

      // get the member's current groups
      // will be null if member is not in any groups
      $cur_groups = $this->os->group->get_by_member_id($member_id);
      $cur_ids = array();
      if($cur_groups){
         // loop through each current group
         for($i = 0, $len = count($cur_groups); $i < $len; $i++){
            $cur_ids[] = $cur_groups[$i]['id'];
         }
      }

      $add = array();
      $delete = array();

      // add to what groups?
      for($i = 0, $len = count($group_ids); $i < $len; $i++){
         if(in_array($group_ids[$i], $cur_ids) == false){
            $add[] = $group_ids[$i];
         }
      }

      // delete from what groups?
      for($i = 0, $len = count($cur_ids); $i < $len; $i++){
         if(in_array($cur_ids[$i], $group_ids) == false){
            $delete[] = $cur_ids[$i];
         }
      }

      $error = false;
      // add
      for($i = 0, $len = count($add); $i < $len; $i++){
         if($this->add_to_group($member_id, $add[$i], true, false) == false){
            $error = true;
         }
      }
      // delete
      for($i = 0, $len = count($delete); $i < $len; $i++){
         if($this->delete_from_group($member_id, $delete[$i]) == false){
            $error = true;
         }
      }

      if($error == false){
         $response = '{"success":true}';
      }

      print $response;
   } // end edit_groups()

   /**
    * add_to_group()
    *
    * @access private
    * @param {integer} $member_id
    * @param {integer} $group_id
    * @param {integer} $active
    * @param {integer} $admin
    * @return {array}
    */
   private function add_to_group($member_id, $group_id, $active, $admin){
      if($group_id != '' && $member_id != '' && isset($active) && isset($admin)){
         $sql = "INSERT INTO qo_groups_has_members (qo_members_id, qo_groups_id, active, admin) VALUES (?, ?, ?, ?)";

         $sql = $this->os->db->conn->prepare($sql);
         $sql->bindParam(1, $member_id);
         $sql->bindParam(2, $group_id);
         $sql->bindParam(3, $active);
         $sql->bindParam(4, $admin);
         $sql->execute();

         $code = $sql->errorCode();
         if($code == '00000'){
            return true;
         }else{
            $this->errors[] = "Script: QoAdmin.php, Method: add_to_group, Message: PDO error code - ".$code;
         }
      }

      return false;
   } // end add_to_group()

   /**
    * delete_from_group() Delete a member from group(s).
    *
    * @access private
    * @param {integer} $member_id
    * @param {integer} $group_id (optional) If supplied, the member will only be deleted from this group.
    */
   private function delete_from_group($member_id, $group_id = null){
      if(isset($member_id)){
         $sql = "DELETE
            FROM
            qo_groups_has_members
            WHERE
            qo_members_id = ".$member_id;

         if(isset($group_id)){
            $sql .= " AND qo_groups_id = ".$group_id;
         }

         $st = $this->os->db->conn->prepare($sql);
         $st->execute();

         $code = $st->errorCode();
         if($code == '00000'){
            return true;
         }else{
            $this->errors[] = "Script: QoAdmin.php, Method: delete_from_group, Message: PDO error code - ".$code;
         }
      }

      return false;
   } // end delete_from_group()
}
?>
