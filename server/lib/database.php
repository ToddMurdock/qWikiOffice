<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class database {

	public $conn;
   private $os;

   /** __construct()
    *
    * @access public
    * @param {class} $os The os.
    */
	public function __construct(os $os){
		$this->os = $os;
	} // end __construct()

	/**
    * connect() Establishes a connection to the database
    *
    * @access public
    * @param {string} $conn_string
    * @param {string} $username
    * @param {string} $password
    * @param {string} $error_mode
    * @return {boolean}
	 */
	public function connect($conn_string, $username, $password, $error_mode){
      if(isset($conn_string, $username, $password, $error_mode)){
         try{
            $this->conn = new PDO($conn_string, $username, $password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, $error_mode);

            return true;
         }catch(PDOException $e){
            //print $e->getMessage();
         }
      }

      return false;
   } // end connect()
}
?>