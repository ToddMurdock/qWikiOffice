<?php
require_once('server/os.php');

if(!class_exists('os')){
	die('Server os class is missing!');
}else{
	$os = new os();

	if(!$os->session_exists()){
		header("Location: login.html");
	}else{
		$os->init();
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
<meta http-equiv="PRAGMA" content="NO-CACHE">
<meta http-equiv="CACHE-CONTROL" content="NO-CACHE">
<meta http-equiv="EXPIRES" content="-1">

<title>A qWikiOffice Desktop</title>

<!-- EXT JS LIBRARY -->
<!-- Using cachefly -->
<link rel="stylesheet" type="text/css" href="http://extjs.cachefly.net/ext-3.2.1/resources/css/ext-all-notheme.css" />
<script type="text/javascript" src="http://extjs.cachefly.net/ext-3.2.1/adapter/ext/ext-base.js"></script>
<script type="text/javascript" src="http://extjs.cachefly.net/ext-3.2.1/ext-all.js"></script>

<!-- DESKTOP CSS -->
<link rel="stylesheet" type="text/css" href="resources/css/desktop.css" />

<!-- MODULES CSS -->
<!-- Dynamically generated based on the modules the member has access to -->
<?php $os->print_allowed_module_css(); ?>

<!-- CORE -->
<!-- In a production environment these would be minified into one file -->
<script type="text/javascript" src="client/App.js"></script>
<script type="text/javascript" src="client/Desktop.js"></script>
<script type="text/javascript" src="client/Module.js"></script>
<script type="text/javascript" src="client/Notification.js"></script>
<script type="text/javascript" src="client/Shortcut.js"></script>
<script type="text/javascript" src="client/StartMenu.js"></script>
<script type="text/javascript" src="client/TaskBar.js"></script>

<!-- QoDesk -->
<!-- This dynamic file will load all the modules the member has access to and setup the desktop -->
<script src="QoDesk.php"></script>
</head>
<body scroll="no"></body>
</html>
<?php }} ?>