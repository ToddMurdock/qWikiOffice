<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class module {

   private $os = null;

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

   /**
    * get_all() Returns the definition data for all modules.
    *
    * @access public
    * @param {boolean} $active (optional) True to only return the active modules.
    * @return {array} An associative array with the module id as the index.
    */
   public function get_all($active = false){
      $sql = "SELECT
         id,
         data
         FROM
         qo_modules";

      if($active){
         $sql .= " WHERE active = 1";
      }

      return $this->query($sql);
   } // end get_all()

   /** get_active() Get active module definitions.
    *
    * @access public
    * @return {array} An associative array with the module id as the index.
    */
   public function get_active(){
      return $this->get_all(true);
   } // end get_active()

   /** get_by_id() Get a module definition by its id.
    *
    * @access public
    * @param {string} $id The id of the module.
    * @return {stdClass} The decoded data object.
    */
   public function get_by_id($id){
      if(isset($id) && $id != ''){
         $sql = "SELECT
            id,
            data
            FROM
            qo_modules
            WHERE
            id = '".$id."'";

         $result = $this->query($sql);

         if($result){
            return $result[$id];
         }
      }

      return null;
   } // end get_by_id()

   /** get_by_type() Get module definitions by type.
    *
    * @access public
    * @param {string} $type The type of the module.
    * @return {array} An associative array with the module id as the index.
    */
   public function get_by_type($type){
      if(isset($type) && $type != ''){
         $sql = "SELECT
            id,
            data
            FROM
            qo_modules
            WHERE
            type = '".$type."'";

         return $this->query($sql);
      }

      return null;
   } // end get_by_id()

   /**
    * get_record() Returns a record object with id, type, data and active properties
    *
    * @param {string} $id The module (record) id.
    * @return {stdClass object}
    */
   public function get_record($id){
      // do we have the required param?
      if(!isset($id) || $id == ''){
         return null;
      }

      $sql = "SELECT
         type,
         data,
         active
         FROM
         qo_modules
         WHERE
         id = '".$id."'";

      // was a result returned?
      $result = $this->os->db->conn->query($sql);
      if(!$result){
         return null;
      }

      // was a row returned?
      $row = $result->fetch(PDO::FETCH_ASSOC);
      if(!$row){
         return null;
      }

      // decode the json data
      $data = json_decode($row['data']);

      if(is_object($data)){
         $record = new stdClass();
         $record->id = $id;
         $record->type = $row['type'];
         $record->data = $data;
         $record->active = $row['active'];

         return $record;
      }else{
         //$errors[] = '{ "script": "module.php", "method": "get_record", "message": "In the qo_modules table, row id: '.$row['id'].' has data that could not be decoded" }';
      }

      return null;
   } // end get_record()

   /**
    * is_active()
    *
    * @access public
    * @param {string} $id The module id
    * @return {boolean}
    */
   public function is_active($id){
      if(isset($id) && $id != ''){
         $sql = "SELECT
            active
            FROM
            qo_modules
            WHERE
            id = '".$id."'";

         $result = $this->os->db->conn->query($sql);
         if($result){
            $row = $result->fetch(PDO::FETCH_ASSOC);
            if($row){
               if($row["active"] == 1){
                  return true;
               }
            }
         }
      }

      return false;
   } // end is_active()

   // private methods

   /**
    * query() Run a select query against the database.
    *
    * @access private
    * @param {string} $sql The select statement.
    * @return {array} An associative array with the definition id as the index.
    */
   private function query($sql){
      if(isset($sql) && $sql != ''){
         $result = $this->os->db->conn->query($sql);

         if($result){
            return $this->parse_result($result);
         }
      }

      return null;
   } // end query()

   /**
    * parse_result() Parses the query result.  Expects 'id' and 'data' fields.
    *
    * @access private
    * @param {PDOStatement} $result The result set as a PDOStatement object.
    * @return {array} An associative array with the definition id as the index.
    */
   private function parse_result($result){
      $response = array();

      if($result){
         $errors = array();

         while($row = $result->fetch(PDO::FETCH_ASSOC)){
            // decode the json data
            $decoded = json_decode($row['data']);

            if(!is_object($decoded)){
               $errors[] = "Script: module.php, Method: parse_result, Message: \'qo_modules\' table, \'id\' ".$row['id']." has \'data\' that could not be decoded";
               continue;
            }

            $response[$row['id']] = $decoded;
         }

         // errors to log?
         if(count($errors) > 0){
            $this->os->load('log');
            $this->os->log->error($errors);
         }
      }

      return count($response) > 0 ? $response : null;
   } // end parse_result()

   // dependencies

   /**
    * get_dependencies() Returns an array of dependency objects.
    *
    * @param {string} $module_id
    * @return {array}
    */
   public function get_dependencies($module_id){
      // do we have the required params?
      if(!isset($module_id) || $module_id == ''){
         return null;
      }

      $module = $this->get_by_id($module_id);
      if(!$module || !isset($module->dependencies) || !is_array($module->dependencies)){
         return null;
      }

      return $module->dependencies;
   } // end get_dependencies()

   // files

   /** get_client_files() Returns an array with the directory/files in the order listed ( load order ) in the module definition data.
     * The client files are expected to be listed in the module definition data like so:
     *
     * "client": {
     *    "css": [
     *       {
     *          "directory": "demo/grid-win/client/resources/",
     *          "files": [ "styles.css" ]
     *       }
     *    ],
     *    "javascript": [
     *       {
     *          "directory": "demo/grid-win/client/",
     *          "files": [
     *            "grid-win.js"
     *          ]
     *       }
     *    ]
     * }
     *
     * @access public
     * @param {string} $module_id The module id.
     * @param {string} $key The key to access (.e.g. 'css' or 'javascript').
     * @return {array/null} An array of the file paths on success.  Null on failure.
     **/
   public function get_client_files($module_id, $key){
      // do we have the required params
      if(!isset($module_id) || $module_id == '' || !isset($key) || $key == ''){
         return null;
      }

      $module = $this->get_by_id($module_id);
      if(!$module || !isset($module->client->$key) || !is_array($module->client->$key)){
         return null;
      }

      $file_groups = $module->client->$key;
      $response = array();

      // loop through the file groups
      foreach($file_groups as $group){
         $directory = $group->directory;
         $files = $group->files;

         if(!isset($files) || !is_array($files) || !count($files) > 0){
            continue;
         }

         // loop through each file
         foreach($files as $file){
            $response[] = $directory.$file;
         }
      }

      if(!count($response) > 0){
         return null;
      }

      return $response;
   } // end get_client_files()

   /**
    * get_locale_string() Returns the locale directory/file contents for the module/language.
    *
    * @access public
    * @param {string} $module_id
    * @param {string} $language (optional)
    * @return {string}
    */
   public function get_locale_string($module_id, $language=''){
      // do we have the required params?
      if(!isset($module_id) || $module_id == ''){
         return null;
      }

      $module = $this->get_by_id($module_id);
      if(!$module){
         return null;
      }

      // localization support?
      if(!isset($module->locale->class, $module->locale->directory, $module->locale->languages)){
         return null;
      }

      // supported languages?
      $ls = $module->locale->languages;
      if(!is_array($ls) || !count($ls) > 0){
         return null;
      }

      // default
      $locale = $ls[0];

      if($language != ''){
         foreach($ls as $l){
            if($l == $language){
               $locale = $l;
               break;
            }
         }
      }

      // get the file
      $document_root = $this->os->get_document_root();
      $module_dir = $document_root.$this->os->get_module_dir();
      $file = $module_dir.$module->locale->directory.$locale.$module->locale->extension;

      // put the file contents (JSON) into a string
      $string = file_get_contents($file);
      if(!$string){
         return null;
      }

      return $module->locale->class.' = '.$string.';';
   } // end get_locale_string()
}
?>