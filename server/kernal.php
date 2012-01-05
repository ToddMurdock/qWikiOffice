<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

require('os-config.php');

class kernal {

   /**
    * @access protected
    */
   protected $config = null;
   protected $session = null;

   /**
    * @access public
    * Library classes available through this class.
    */
   public $db = null;
   public $database = null;
   public $group = null;
   public $log = null;
   public $member = null;
   public $module = null;
   public $preference = null;
   public $privilege = null;
   public $registry = null;
   public $theme = null;
   public $security = null;
   public $utility = null;
   public $library = null;

   /**
    * __construct()
    *
    * @access public
    */
   public function __construct(){
      // config
      if(class_exists('config')){
         $this->config = new config();
      }else{
         die('config class is missing!');
      }

      // if magic quotes is on, stripslashes
      if(get_magic_quotes_gpc()){
         $in = array(&$_GET, &$_POST, &$_COOKIE);
         while(list($k,$v) = each($in)){
            foreach($v as $key => $val){
               if(!is_array($val)){
                  $in[$k][$key] = stripslashes($val);
                  continue;
               }
               $in[] =& $in[$k][$key];
            }
         }
         unset($in);
      }

      // json support
      if(!function_exists('json_encode')){
         require_once('lib/json.php');
         $GLOBALS['JSON_OBJECT'] = new Services_JSON();

         function json_encode($value){
            return $GLOBALS['JSON_OBJECT']->encode($value);
         }

         function json_decode($value){
            return $GLOBALS['JSON_OBJECT']->decode($value);
         }
      }

      // database connection
      $this->load('database');
      $success = $this->db->connect($this->config->DB_CONN_STRING, $this->config->DB_USERNAME, $this->config->DB_PASSWORD, $this->config->PDO_ERROR_MODE);
      if(!$success){
         die('A connection to the database could not be established!');
      }

      // no longer using PHP session
      // $_SESSION superglobal array ( destroyed in os->logout() )
      //session_start();
   }

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

            $this->$class = new $class($this);

            if($class == 'database'){
               $this->db = $this->$class;
            }

         }else{
            die($class.' class is missing!');
         }
      }
   } // end load()

   // print css functions

   /**
    * print_css() Will take an object or an array of objects that contain an 'id' and 'type' property.
    * The 'id' property holds the id of a library or module.
    * The 'type' property specifies if it is a 'library' or a 'module'.
    *
    * @access protected
    * @param {array/object} $items An array of objects or an object.
    */
   protected function print_css($items){
      // do we have the required param?
      if(!isset($items)){
         print '';
         return false;
      }

      // is the param an array of items?
      if(is_array($items) && count($items > 0)){
         foreach($items as $item){
            $this->print_item_css($item);
         }
      }

      // is the param an object?
      else if(is_object($items)){
         $this->print_item_css($items);
      }
   } // end print_css()

   /**
    * print_item_css()
    *
    * @access private
    * @param {stdClass} $item An object with 'id' and 'type' properties.
    */
   private function print_item_css($item){
      // do we have the required param?
      if(!isset($item->id, $item->type)){
         return '';
      }

      // is the item css already loaded?
      if(!$this->is_item_css_loaded($item)){
         $success = false;

         // is the item a library?
         if($item->type == 'library'){
            $success = $this->print_library_css($item->id);
         }

         // is the item a module?
         else if($item->type == 'module'){
            $success = $this->print_module_css($item->id);
         }

         // set item css as loaded?
         if($success){
            $this->set_item_css_loaded($item);
         }
      }
   } // end print_item_css()

   /**
    * print_library_css() Prints the css link tags of the library.
    *
    * @access private
    * @param {string} $library_id The id of the library.
    */
   private function print_library_css($library_id){
      // do we have the required params?
      if(!isset($library_id) || $library_id == ''){
         print '';
         return false;
      }

      $this->load('library');

      // get any dependencies and print their link tags first
      $dependencies = $this->library->get_dependencies($library_id);
      if($dependencies){
         $this->print_css($dependencies);
      }

      // get the css files of the library and print their link tags
      $files = $this->library->get_client_files($library_id, 'css');

      if(!$files){
         print '';
         return false;
      }

      $document_root = $this->get_document_root();
      $library_dir = $this->get_library_dir();

      foreach($files as $file){
         print "<link rel='stylesheet' type='text/css' href='".$library_dir.$file."' />\n";
      }

      return true;
   } // end print_library_css()

   /**
    * print_module_css() Print the css link tags of the module.
    *
    * @access private
    * @param {string} $module_id The module id.
    */
   private function print_module_css($module_id){
      // do we have the required params?
      if(!isset($module_id) || $module_id == ''){
         print '';
         return false;
      }

      $this->load('module');

      // get any dependencies and print their link tags first
      $dependencies = $this->module->get_dependencies($module_id);
      if($dependencies){
         $this->print_css($dependencies);
      }

      // get the css files of the module and print their link tags
      $files = $this->module->get_client_files($module_id, 'css');

      if(!$files){
         print '';
         return false;
      }

      $document_root = $this->get_document_root();
      $module_dir = $this->get_module_dir();

      foreach($files as $file){
         print "<link rel='stylesheet' type='text/css' href='".$module_dir.$file."' />\n";
      }

      return true;
   } // end print_module_css()

   // print javascript functions

   /**
    * print_javascript() Will take an object or an array of objects that contain an 'id' and 'type' property.
    * The 'id' property holds the id of a library or module.
    * The 'type' property specifies if it is a 'library' or a 'module'.
    *
    * @access protected
    * @param {array/object} $items An array of objects or an object.
    */
   protected function print_javascript($items){
      // do we have the required param?
      if(!isset($items)){
         print '';
         return false;
      }

      // is the param an array of items?
      if(is_array($items) && count($items > 0)){
         foreach($items as $item){
            $this->print_item_javascript($item);
         }
      }

      // is the param  an object?
      else if(is_object($items)){
         $this->print_item_javascript($items);
      }
   } // end print_javascript()

   /**
    * print_item_javascript()
    *
    * @access private
    * @param {stdClass} $item An object with 'id' and 'type' properties.
    */
   private function print_item_javascript($item){
      // do we have the required param?
      if(!isset($item->id, $item->type)){
         return '';
      }

      // is the item javascript already loaded?
      if(!$this->is_item_javascript_loaded($item)){
         $success = false;

         // is the item a library?
         if($item->type == 'library'){
            $success = $this->print_library_javascript($item->id);
         }

         // is the item a module?
         else if($item->type == 'module'){
            $success = $this->print_module_javascript($item->id);
         }

         // set item javascript as loaded?
         if($success){
            $this->set_item_javascript_loaded($item);
         }
      }
   } // end print_item_javascript()

   /**
    * print_library_javascript() Prints the contents of the javascript files of a library.
    *
    * @access private
    * @param {string} $library_id The id of the library.
    */
   private function print_library_javascript($library_id){
      // do we have the required params?
      if(!isset($library_id) || $library_id == ''){
         print '';
         return false;
      }

      $this->load('library');

      // get any dependencies and print their contents first
      $dependencies = $this->library->get_dependencies($library_id);
      if($dependencies){
         $this->print_javascript($dependencies);
      }

      // get the javascript files of the library and print their contents
      $files = $this->library->get_client_files($library_id, 'javascript');

      if(!$files){
         print '';
         return false;
      }

      $document_root = $this->get_document_root();
      $library_dir = $document_root.$this->get_library_dir();

      foreach($files as $file){
         $string = file_get_contents($library_dir.$file);
         if($string){
            print $string;
         }
      }

      return true;
   } // end print_library_javascript()

   /**
    * print_module_javascript() Prints the content of the javascript files of the module.
    *
    * @access private
    * @param {string} $module_id The id of the module.
    */
   private function print_module_javascript($module_id){
      // do we have the required params?
      if(!isset($module_id) || $module_id == ''){
         print '';
         return false;
      }

      $this->load('module');

      // get any dependencies and print their contents first
      $dependencies = $this->module->get_dependencies($module_id);
      if($dependencies){
         $this->print_javascript($dependencies);
      }

      // get the javascript files of the module and print their contents
      $files = $this->module->get_client_files($module_id, 'javascript');

      if(!$files){
         print '';
         return false;
      }

      $document_root = $this->get_document_root();
      $module_dir = $document_root.$this->get_module_dir();

      foreach($files as $file){
         $string = file_get_contents($module_dir.$file);
         if($string){
            print $string;
         }
      }

      // print the locale
      $this->print_module_locale($module_id);

      return true;
   } // end print_module_javascript()

   /**
    * print_module_locale() Prints the modules locale file (if the module has locale support).
    *
    * @access private
    * @param {string} $module_id The module_id.
    */
   private function print_module_locale($module_id){
      // do we have the required param?
      if(!$module_id){
         return false;
      }

      // get the member id for this session
      $this->load('session');
      $member_id = $this->session->get_member_id();
      // get the member locale
      if($member_id){
         $member_locale = $this->get_member_locale($member_id);
         if(!$member_locale){
            return false;
         }
      }
      // allow the module to return its default locale
      else{
         $member_locale = '';
      }

      // get the module locale file contents as a string
      $string = $this->module->get_locale_string($module_id, $member_locale);
      if($string){
         print $string;
      }
   } // end print_module_locale()

   /**
    * validate() Will take an object or an array of objects that contain an 'id' and 'type' property.
    * The 'id' property holds the id of a library or module.
    * The 'type' property specifies if it is a 'library' or a 'module'.
    *
    * @access protected
    * @param {array/object} $items An array of objects or an object.
    */
   protected function validate($items){
      // do we have the required param?
      if(!isset($items)){
         return false;
      }

      // is the param an array of items?
      if(is_array($items) && count($items > 0)){
         // loop through the items
         foreach($items as $item){
            $success = $this->validate_item($item);
            if(!$success){
               return false;
            }
         }

         return true;
      }

      // is the param  an object?
      else if(is_object($items)){
         return $this->validate_item($items);
      }

      return false;
   } // end validate()

   /**
    * validate_item() Validates a module or library.
    *
    * @access private
    * @param {stdClass} $item An object with 'id' and 'type' properties.
    * @return {boolean}
    */
   private function validate_item($item){
      // do we have the required param?
      if(!isset($item->id, $item->type)){
         return false;
      }

      // is the item a library?
      if($item->type == 'library'){
         return $this->validate_library($item->id);
      }

      // is the item a module?
      else if($item->type == 'module'){
         return $this->validate_module($item->id);
      }

      return false;
   } // end validate_item()

   /**
    * validate_library() Validates the library.
    * Checks to see if the files listed are valide files.
    *
    * @access private
    * @param {string} $library_id The id of the library.
    * @return {boolean}
    */
   private function validate_library($library_id){
      // do we have the required params?
      if(!isset($library_id) || $library_id == ''){
         return false;
      }

      $this->load('library');

      // get any dependencies and validate them first
      $dependencies = $this->library->get_dependencies($library_id);
      if($dependencies){
         $success = $this->validate($dependencies);
         if(!$success){
            return false;
         }
      }

      $errors = array();
      $document_root = $this->get_document_root();
      $library_dir = $document_root.$this->get_library_dir();

      // any invalid css files?
      $files = $this->library->get_client_files($library_id, 'css');
      if($files){
         foreach($files as $file){
            if(!is_file($library_dir.$file)){
               $errors[] = 'In validate_library() of os.php, Missing library file ('.$library_dir.$file.') for library id '.$library_id;
            }
         }
      }

      // any invalid javascript files?
      $files = $this->library->get_client_files($library_id, 'javascript');
      if($files){
         foreach($files as $file){
            if(!is_file($library_dir.$file)){
               $errors[] = 'In validate_library() of os.php, Missing library file ('.$library_dir.$file.') for library id '.$library_id;
            }
         }
      }

      // do we have any errors?
      if(count($errors) > 0){
         $this->load('log');
         $this->log->error($errors);

         return false;
      }

      return true;
   } // end validate_library()

   /**
    * validate_module() Validates the module.
    * Checks to see if the files listed are valide files.
    * Checks the group privilege for the module.
    *
    * @access private
    * @param {string} $module_id The id of the module.
    * @return {boolean}
    */
   private function validate_module($module_id){
      // do we have the required params?
      if(!isset($module_id) || $module_id == ''){
         return false;
      }

      $this->load('session');
      $member_id = $this->session->get_member_id();
      $group_id = $this->session->get_group_id();

      if(!$member_id || !$group_id){
         return false;
      }

      // check group privilege (is the member allowed to load this module)
      if(!$this->is_group_allowed($group_id, $module_id)){
         return false;
      }

      $this->load('module');

      // get any dependencies and validate them first
      $dependencies = $this->module->get_dependencies($module_id);
      if($dependencies){
         $success = $this->validate($dependencies);
         if(!$success){
            return false;
         }
      }

      $errors = array();
      $document_root = $this->get_document_root();
      $module_dir = $document_root.$this->get_module_dir();

      // any invalid css files?
      $files = $this->module->get_client_files($module_id, 'css');
      if($files){
         foreach($files as $file){
            if(!is_file($module_dir.$file)){
               $errors[] = 'In validate_module() of os.php, Missing module file ('.$module_dir.$file.') for module id '.$module_id;
            }
         }
      }

      // any invalid javascript files?
      $files = $this->module->get_client_files($module_id, 'javascript');
      if($files){
         foreach($files as $file){
            if(!is_file($module_dir.$file)){
               $errors[] = 'In validate_module() of os.php, Missing module file ('.$module_dir.$file.') for module id '.$module_id;
            }
         }
      }

      // any invalid locale files?
      $module = $this->module->get_by_id($module_id);
      if(isset($module->locale->directory, $module->locale->languages)){
         $locale_dir = $module->locale->directory;
         $extension = $module->locale->extension;
         $ls = $module->locale->languages;

         if(is_array($ls) && count($ls) > 0){
            foreach($ls as $l){
               $file = $module_dir.$locale_dir.$l.$extension;
               if(!is_file($file)){
                  $errors[] = 'In validate_module() of os.php, Missing module file ('.$file.') for module id '.$module_id;
               }
            }
         }
      }

      // do we have any errors?
      if(count($errors) > 0){
         $this->load('log');
         $this->log->error($errors);

         return false;
      }

      return true;
   } // end validate_module()

   // get/set session data

   /**
    * set_valid_modules() Set the valid module ids into the session data.
    *
    * @access protected
    * @param {array} $ids The valid module ids.
    * @return {boolean}
    */
   protected function set_valid_module_ids($ids){
      // do we have the needed param?
      if(!isset($ids) || !is_array($ids)){
         return false;
      }

      $this->load('session');
      $data = $this->session->get_data();

      if(!$data){
         $data = new stdClass();
      }

      if(!isset($data->module)){
         $data->module = new stdClass();
      }

      foreach($ids as $id){
         $data->module->$id->valid = 1;
      }

      return $this->session->set_data($data);

      return false;
   } // end set_valid_modules()

   /**
    * get_valid_modules()
    *
    * @access protected
    * @return {array}
    */
   protected function get_valid_module_ids(){
      $this->load('session');
      $d = $this->session->get_data();

      if(isset($d->module)){
         $ids = array();

         foreach($d->module as $id => $md){
            if(isset($md->valid) && $md->valid == 1){
               $ids[] = $id;
            }
         }

         if(count($ids) > 0){
            return $ids;
         }
      }

      return null;
   } // end get_valid_modules()

   /**
    * set_item_css_loaded()
    *
    * @access private
    * @param {object} $item
    * @return {boolean}
    */
   private function set_item_css_loaded($item){
      // do we have the required param?
      if(!isset($item->id, $item->type)){
         return false;
      }

      $this->load('session');
      $data = $this->session->get_data();

      if(!$data){
         $data = new stdClass();
      }

      $type = $item->type;
      $id = $item->id;

      $data->$type->$id->loaded->css = 1;
      return $this->session->set_data($data);

      return false;
   } // end set_item_css_loaded()

   /**
    * is_item_css_loaded() Returns true if the css for the item has been loaded.
    *
    * @access private
    * @param {object} $item
    * @return {boolean}
    */
   private function is_item_css_loaded($item){
      // do we have the required param?
      if(!isset($item->id, $item->type)){
         return false;
      }

      $this->load('session');
      $data = $this->session->get_data();
      $type = $item->type;
      $id = $item->id;

      if(isset($data->$type->$id->loaded->css) && $data->$type->$id->loaded->css == 1){
         return true;
      }

      return false;
   } // end is_module_css_loaded()

   /**
    * set_item_javascript_loaded()
    *
    * @access private
    * @param {object} $item
    * @return {boolean}
    */
   private function set_item_javascript_loaded($item){
      // do we have the required param?
      if(!isset($item->id, $item->type)){
         return false;
      }

      $this->load('session');
      $data = $this->session->get_data();

      if(!$data){
         $data = new stdClass();
      }

      $type = $item->type;
      $id = $item->id;

      $data->$type->$id->loaded->javascript = 1;
      return $this->session->set_data($data);

      return false;
   } // end set_item_javascript_loaded()

   /**
    * is_item_javascript_loaded() Returns true if the javascript for the item has been loaded.
    *
    * @access private
    * @param {object} $item
    * @return {boolean}
    */
   private function is_item_javascript_loaded($item){
      // do we have the required param?
      if(!isset($item->id, $item->type)){
         return false;
      }

      $this->load('session');
      $data = $this->session->get_data();
      $type = $item->type;
      $id = $item->id;

      if(isset($data->$type->$id->loaded->javascript) && $data->$type->$id->loaded->javascript == 1){
         return true;
      }

      return false;
   } // end is_module_javascript_loaded()
}
?>