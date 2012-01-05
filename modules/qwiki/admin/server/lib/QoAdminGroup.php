<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class QoAdminGroup {

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
    * view() Returns all the active groups.
    *
    * @access public
    */
   public function view(){
      $response = "{'qo_groups':[]}";

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
         name,
         description,
         active
         FROM
         qo_groups';

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
            $sort = 'name';
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

         $response = '{"qo_groups":'.json_encode($items).'}';
      }

      print $response;
   } // end view()

   /**
    * add() Adds new groups.
    * The POST 'data' param should look like this
    * [{"name":"My Group","description":"My test group","active":false,"store_id":"ext-record-1"}]
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

            $result = new stdClass();
            $result->created = array();
            $result->failed = array();

            // loop thru each data object
            for($i = 0, $len = count($data); $i < $len; $i++){
               $id = null;

               if(isset($data[$i]->name, $data[$i]->description, $data[$i]->active)){
                  $sql = "INSERT INTO qo_groups (name, description, active) VALUES (?, ?, ?)";

                  // prepare the statement, prevents SQL injection by calling the PDO::quote() method internally
                  $sql = $this->os->db->conn->prepare($sql);
                  $sql->bindParam(1, $data[$i]->name);
                  $sql->bindParam(2, $data[$i]->description);
                  $sql->bindParam(3, $data[$i]->active);
                  $sql->execute();

                  $code = $sql->errorCode();
                  if($code == '00000'){
                     $id = $this->os->db->conn->lastInsertId();
                  }else{
                     $this->errors[] = 'Script: QoAdminGroup.php, Method: add_group, Message: PDO error code - '.$code;
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
    * [{"name":"My Group","id":"2"}]
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
               $sql = 'UPDATE qo_groups SET '.$temp.' WHERE id = '.$data[$i]->id;
               // prepare the statement, prevents SQL injection by calling the PDO::quote() method internally
               $sql = $this->os->db->conn->prepare($sql);

               // loop thru the objects key/values to bind params
               $index = 0;
               foreach($data[$i] AS $key => $value){
                  // make copy... only way I can get it to pass by value into bindParam() instead of by reference
                  $item = new stdClass();
                  $item->$key = $value;

                  if($key !== 'id'){
                     $sql->bindParam(++$index, $item->$key);
                  }
               }

               $sql->execute();

               $code = $sql->errorCode();
               if($code == '00000'){
                  $results->saved[] = $data[$i]->id;
               }else{
                  $results->failed[] = $data[$i]->id;
                  $this->errors[] = 'Script: QoAdminGroup.php, Method: edit_group, Message: PDO error code - '.$code;
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
    *
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

            // delete the group from any preferences
            if($this->delete_preference($data[$i]->id)){
               // delete the group from any members
               if($this->delete_member_relationship($data[$i]->id)){
                  // delete the group from any privileges
                  if($this->delete_privilege_relationship('group', $data[$i]->id)){
                     // delete the group
                     $st = $this->os->db->conn->prepare("DELETE FROM qo_groups WHERE id = ".$data[$i]->id);
                     $st->execute();

                     $code = $st->errorCode();
                     if($code == '00000'){
                        $success = true;
                     }else{
                        $this->errors[] = "Script: QoAdminGroup.php, Method: delete_group, Message: PDO error code - ".$code;
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
    * delete_preference() Deletes a group preference.
    *
    * @access private
    * @param {integer} $id The id of the group.
    * @return {boolean}
    */
   private function delete_preference($id){
      if(!isset($id) || $id == ''){
         return false;
      }

      $sql = "DELETE FROM qo_preferences WHERE qo_groups_id = ".$id;
      $st = $this->os->db->conn->prepare($sql);
      $st->execute();

      $code = $st->errorCode();
      if($code == '00000'){
         return true;
      }else{
         $this->errors[] = "Script: QoAdminGroup.php, Method: delete_preference, Message: PDO error code - ".$code;
      }

      return false;
   } // end delete_preference()

   /**
    * delete_member_relationship()
    *
    * @access private
    * @param {integer} $id The group id.
    * @return {boolean}
    */
   private function delete_member_relationship($id){
      $response = false;

      if(!isset($id) || $id == ''){
         return false;
      }

      $sql = "DELETE FROM qo_groups_has_members WHERE qo_groups_id = ".$id;
      $st = $this->os->db->conn->prepare($sql);
      $st->execute();

      $code = $st->errorCode();
      if($code == '00000'){
         return true;
      }else{
         $this->errors[] = "Script: QoAdminGroup.php, Method: delete_member_relationship, Message: PDO error code - ".$code;
      }

      return false;
   } // end delete_member_relationship()

   /**
    * delete_privilege_relationship()
    *
    * @access private
    * @param {string} $option
    * @param {integer} $id
    * @return {boolean}
    */
   private function delete_privilege_relationship($option, $id){
      // do we have the required params?
      if(!isset($option, $id) || $option == '' || $id == ''){
         return false;
      }

      $sql = null;

      // delete where group id = $id?
      if($option == 'group'){
         $sql = "DELETE FROM qo_groups_has_privileges WHERE qo_groups_id = ".$id;
      }

      // delete where privilege id = $id?
      else if ($option == 'privilege'){
         $sql = "DELETE FROM qo_groups_has_privileges WHERE qo_privileges_id = ".$id;
      }

      if(!$sql){
         return false;
      }

      $st = $this->os->db->conn->prepare($sql);
      $st->execute();

      $code = $st->errorCode();
      if($code == '00000'){
         return true;
      }else{
         $this->errors[] = "Script: QoAdminGroup.php, Method: delete_privilege_relationship, Message: PDO error code - ".$code;
      }

      return false;
   } // end delete_privilege_relationship()

   /**
    * view_privileges() Returns data to load an Ext.tree.TreePanel
    *
    * @access public
    */
	public function view_privileges(){
      $response = '{success:false}';
      $group_id = isset($_POST['id']) ? $_POST['id'] : null;

      // do we have the group id?
      if(!isset($group_id) || $group_id == ''){
         print $response;
         return false;
      }

      // get all active privileges
      $this->os->load('privilege');
      $all_privileges = $this->os->privilege->get_active();
      if(!isset($all_privileges) || !is_array($all_privileges) || count($all_privileges) == 0){
         print $response;
         return false;
      }

      // get the current privilege id associated with the group
      $this->os->load('group');
      $privilege_id = $this->os->group->get_privilege_id($group_id);

      //loop through all privileges
      for($i = 0, $ilen = count($all_privileges); $i < $ilen; $i++){
         $all_privileges[$i]['checked'] = false;

         if($all_privileges[$i]['id'] == $privilege_id){
            $all_privileges[$i]['checked'] = true;
         }
      }

      // build the tree nodes
      $nodes = array();
      foreach($all_privileges as $privilege){
         // build the node data
         $data = new stdClass();

         $data->active = $privilege['active'];
         $data->checked = $privilege['checked'];
         $data->id = $privilege['id'];
         $data->iconCls = 'qo-admin-privilege';
         $data->leaf = true;
         $data->text = $privilege['name'];

         $nodes[] = $data;
      }

      if(count($nodes) == 0){
         print $response;
         return false;
      }

      print json_encode($nodes);
   } // end view_privileges()

   /**
    * edit_privilege()
    *
    * @access public
    */
   public function edit_privilege(){
      $response = "{'success': false}";

      $group_id = $_POST['groupId'];
      $privilege_id = $_POST['privilegeId'];

      if(isset($group_id, $privilege_id) && $group_id != '' && $privilege_id != ''){
         // delete existing
         $sql = "DELETE
            FROM
            qo_groups_has_privileges
            WHERE
            qo_groups_id = ".$group_id;

         $this->os->db->conn->query($sql);

         // add new record
         $sql = "INSERT INTO qo_groups_has_privileges (qo_groups_id, qo_privileges_id) VALUES (?, ?)";

         $sql = $this->os->db->conn->prepare($sql);
         $sql->bindParam(1, $group_id);
         $sql->bindParam(2, $privilege_id);
         $sql->execute();

         $code = $sql->errorCode();
         if($code == '00000'){
            $response = "{'success': true}";
         }else{
            $this->errors[] = "Script: QoAdminGroup.php, Method: edit_group_privilege, Message: PDO error code - ".$code;
         }
      }

      print $response;
   } // end edit_privilege()
}
?>
