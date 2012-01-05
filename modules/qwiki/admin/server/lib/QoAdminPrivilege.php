<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class QoAdminPrivilege {

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
    * view() Returns all the active privileges.
    *
    * @access public
    */
   public function view(){
      $response = "{'qo_privileges':[]}";

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
         qo_privileges';

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

         $response = '{"qo_privileges":'.json_encode($items).'}';
      }

      print $response;
   } // end view()

   /**
    * add() Adds new privileges.
    * The POST 'data' param should look like this
    * [{"name":"My Privilege","description":"My test privilege","active":false,"store_id":"ext-record-1"}]
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
                  $sql = "INSERT INTO qo_privileges (name, description, active) VALUES (?, ?, ?)";

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
                     $this->errors[] = 'Script: QoAdminPrivilege.php, Method: add, Message: PDO error code - '.$code;
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
    * [{"name":"My Privilege","id":"2"}]
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
               $sql = 'UPDATE qo_privileges SET '.$temp.' WHERE id = '.$data[$i]->id;
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
                  $this->errors[] = 'Script: QoAdminPrivilege.php, Method: edit, Message: PDO error code - '.$code;
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

            // delete the privilege
            $st = $this->os->db->conn->prepare("DELETE FROM qo_privileges WHERE id = ".$data[$i]->id);
            $st->execute();

            $code = $st->errorCode();
            if($code == '00000'){
               $success = true;
            }else{
               $this->errors[] = "Script: QoAdminPrivilege.php, Method: delete, Message: PDO error code - ".$code;
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
    * viewModules() Returns data to load an Ext.tree.TreePanel
    *
    * @access public
    */
   public function view_modules(){
      $response = '{success:false}';
      $privilege_id = isset($_POST['id']) ? $_POST['id'] : null;

      // do we have the privilege id?
      if(!isset($privilege_id) || $privilege_id == ''){
         print $response;
         return false;
      }

      $this->os->load('module');

      // get all active modules
      $modules = $this->os->module->get_active();

      // build the module nodes
      $module_nodes = array();

      // loop through the modules
      foreach($modules as $id => $data){
         $node = new stdClass();
         $node->checked = false;
         $node->iconCls = 'qo-admin-module';
         $node->moduleId = $id;
         $node->text = $data->about->name;

         if(isset($data->server->methods)){
            $node->children = $data->server->methods;
         }else{
            $node->leaf = true;
         }

         $module_nodes[] = $node;
      }

      $this->os->load('privilege');

      // get the privilege data
      $privilege_data = $this->os->privilege->get_data($privilege_id);

      // loop through each module node
      foreach($module_nodes as $module){
         if($this->os->privilege->is_allowed($privilege_data, $module->moduleId)){
           $module->checked = true;
         }

         $nodes = array();

         if(isset($module->children) && count($module->children) > 0){
            // loop through each child (method) of module
            foreach($module->children as $method){
               $node = new stdClass();
               $node->checked = false;
               $node->iconCls = 'qo-admin-method';
               $node->leaf = true;
               $node->methodId = $method->name;
               $node->text = $method->name;

               if($this->os->privilege->is_allowed($privilege_data, $module->moduleId, $method->name)){
                  $node->checked = true;
               }

               $nodes[] = $node;
            }

            $module->children = $nodes;
         }
      }

      print json_encode($module_nodes);
   } // end viewModules()

   /**
    * edit_modules()
    */
   public function edit_modules(){
      $response = '{"success":false}';
      $data = isset($_POST['data']) ? $_POST['data'] : null;
      $privilege_id = isset($_POST['privilegeId']) ? $_POST['privilegeId'] : null;

      if(isset($data, $privilege_id) == false){
         print $response;
         return false;
      }

      // build sql
      $sql = 'UPDATE qo_privileges SET data = ? WHERE id = '.$privilege_id;
      // prepare the statement, prevents SQL injection by calling the PDO::quote() method internally
      $sql = $this->os->db->conn->prepare($sql);
      $sql->bindParam(1, $data);
      $sql->execute();

      $code = $sql->errorCode();
         if($code == '00000'){
            $response = '{"success":true}';
         }else{
            $this->errors[] = 'Script: QoAdminPrivilege.php, Method: edit_data, Message: PDO error code - '.$code;
         }

      print $response;
   } // end edit_modules()
}
?>
