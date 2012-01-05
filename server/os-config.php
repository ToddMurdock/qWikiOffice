<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class config {

   /**
    * Begin editable code.
    * Update the following with your information.
    */

   /**
    * Domain url
    */
   public $DOMAIN = 'www.qwikioffice.com';

   /**
    * Email address
    */
   public $EMAIL = 'info@qwikioffice.com';

   /**
    * Database connection
    * Using PHP Data Objects (PDO)
    */
   public $DB_CONN_STRING = 'mysql:dbname=qwikioffice1.0beta1;host=localhost';
   public $DB_USERNAME = 'root';
   public $DB_PASSWORD = '';

   /**
    * Login url
    */
   public $LOGIN_URL = 'login.html';

   /**
    * PDO error mode
    */
   public $PDO_ERROR_MODE = PDO::ERRMODE_WARNING; // development environment
   //public $PDO_ERROR_MODE = PDO::ERRMODE_SILENT; // production environment

   /**
    * PHP error reporting
    * Options are:
    * 1. show all
    * 2. show only warnings
    * 3. show no errors
    */
   private $error_reporting = 'show only warnings';

   // End editable code

   /**
    * Directories
    */
   public $LIBRARIES_DIR = 'modules/common/libraries/';
   public $MODULES_DIR = 'modules/';
   public $THEMES_DIR = 'resources/';
   public $WALLPAPERS_DIR = 'resources/wallpapers/';

   /**
    * Document root
    */
   public $DOCUMENT_ROOT = '';

   /**
    * __construct()
    *
    * @access public
    */
   public function __construct(){
      // set error reporting
      switch($this->error_reporting){
         case 'show all':
            ini_set('display_errors',1);
            error_reporting(E_ALL|E_STRICT);
            break;
         case 'show only warnings':
            ini_set('display_errors',1);
            error_reporting(E_ALL);
            break;
         case 'show no errors':
            error_reporting(0);
            break;
      }

      // set the document root
      $_SERVER['DOCUMENT_ROOT'] = str_replace('\\', '/', getcwd());
      $this->DOCUMENT_ROOT = $_SERVER['DOCUMENT_ROOT'].'/';
   } // end __construct()
}
?>