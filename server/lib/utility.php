<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class utility {

   private $os = null;

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
    * build_random_id()
    *
    * @return {string} A random id
    */
   public function build_random_id(){
      return md5(uniqid(rand(), true));
   } // end build_random_id()

   /**
    * concat_arrays()
    *
    * @access public
    * @param {array}
    * @param {array}
    * @return {array} concated array
    */
   public function concat_arrays($a, $b){
      $c = $a;
      while(list(,$v)=each($b)){
         $c[] = $v;
      }
      return $c;
   } // end concat_arrays()

   /**
    * mod_addslashes()
    * 
    * @param {string} string to be escaped
    * @return {string} escaped string
    */
   public function mod_addslashes($string){
      if(get_magic_quotes_gpc()==1){
         return ($string);
      }else{
         return (addslashes($string ));
      }
   } // end mod_addslashes()

   /**
    * object_to_array() Takes a passed in object and returns an associative array.
    *
    * @param {stdClass} $object
    */
   public function object_to_array($object){
      if(is_array($object) || is_object($object)){
         $result = array();
         foreach($object as $key => $value){
            $result[$key] = $this->object_to_array($value);
         }
         return $result;
      }
      return $object;
   } // end object_to_array()

   /**
	 * overwrite_assoc_array()
    *
	 * @param {array}
	 * @param {array}
	 * @return {array} Overwritten associative array
	 */
   public function overwrite_assoc_array($a, $b){
      $c = $a;
      while(list($k,$v)=each($b)){
         if(!is_array($v) || ( is_array($v) && count($v) > 0 )){
            $c[$k] = $v;
         }
      }
      return $c;
	} // end overwrite_assoc_array()
}
?>