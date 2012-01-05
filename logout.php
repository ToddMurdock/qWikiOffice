<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

require_once('server/os.php');
if(class_exists('os')){
	$os = new os();
	$os->logout();
}
?>