/*
MySQL Data Transfer
Source Host: localhost
Source Database: qwikioffice
Target Host: localhost
Target Database: qwikioffice
Date: 7/16/2010 2:23:53 AM
*/

SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for qo_groups
-- ----------------------------
DROP TABLE IF EXISTS `qo_groups`;
CREATE TABLE `qo_groups` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `name` varchar(35) default NULL,
  `description` text,
  `active` tinyint(1) unsigned NOT NULL default '0',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_groups_has_members
-- ----------------------------
DROP TABLE IF EXISTS `qo_groups_has_members`;
CREATE TABLE `qo_groups_has_members` (
  `qo_groups_id` int(11) unsigned NOT NULL default '0',
  `qo_members_id` int(11) unsigned NOT NULL default '0',
  `active` tinyint(1) unsigned NOT NULL default '0' COMMENT 'Is the member currently active in this group',
  `admin` tinyint(1) unsigned NOT NULL default '0' COMMENT 'Is the member the administrator of this group',
  PRIMARY KEY  (`qo_members_id`,`qo_groups_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_groups_has_privileges
-- ----------------------------
DROP TABLE IF EXISTS `qo_groups_has_privileges`;
CREATE TABLE `qo_groups_has_privileges` (
  `qo_groups_id` int(11) unsigned NOT NULL default '0',
  `qo_privileges_id` int(11) unsigned NOT NULL default '0',
  PRIMARY KEY  (`qo_groups_id`,`qo_privileges_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_libraries
-- ----------------------------
DROP TABLE IF EXISTS `qo_libraries`;
CREATE TABLE `qo_libraries` (
  `id` varchar(35) NOT NULL default '',
  `data` text COMMENT 'The definition data ( JSON )',
  `active` tinyint(1) unsigned NOT NULL default '0' COMMENT 'A value of 1 or 0 is expected',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_log
-- ----------------------------
DROP TABLE IF EXISTS `qo_log`;
CREATE TABLE `qo_log` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `level` varchar(15) default NULL COMMENT 'ERROR, WARNING, MESSAGE or AUDIT',
  `text` text,
  `timestamp` datetime default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_members
-- ----------------------------
DROP TABLE IF EXISTS `qo_members`;
CREATE TABLE `qo_members` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `first_name` varchar(25) default NULL,
  `last_name` varchar(35) default NULL,
  `email_address` varchar(55) default NULL,
  `password` varchar(255) default NULL,
  `locale` varchar(5) default 'en',
  `active` tinyint(1) unsigned NOT NULL default '0' COMMENT 'Is the member currently active',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_modules
-- ----------------------------
DROP TABLE IF EXISTS `qo_modules`;
CREATE TABLE `qo_modules` (
  `id` varchar(35) NOT NULL default '',
  `type` varchar(35) NOT NULL,
  `name` varchar(35) default NULL,
  `description` text,
  `data` text NOT NULL COMMENT 'The definition data ( JSON )',
  `active` tinyint(1) unsigned NOT NULL default '0' COMMENT 'A value of 1 or 0 is expected',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_preferences
-- ----------------------------
DROP TABLE IF EXISTS `qo_preferences`;
CREATE TABLE `qo_preferences` (
  `qo_groups_id` int(11) unsigned NOT NULL default '0',
  `qo_members_id` int(11) unsigned NOT NULL default '0',
  `data` text COMMENT 'JSON data',
  PRIMARY KEY  (`qo_members_id`,`qo_groups_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_privileges
-- ----------------------------
DROP TABLE IF EXISTS `qo_privileges`;
CREATE TABLE `qo_privileges` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `name` varchar(35) default NULL,
  `description` text,
  `data` text NOT NULL COMMENT 'The definition data ( JSON )',
  `active` tinyint(1) unsigned NOT NULL default '0' COMMENT 'A value of 1 or 0 is expected',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_sessions
-- ----------------------------
DROP TABLE IF EXISTS `qo_sessions`;
CREATE TABLE `qo_sessions` (
  `id` varchar(128) NOT NULL default '' COMMENT 'a randomly generated id',
  `qo_members_id` int(11) unsigned NOT NULL default '0',
  `qo_groups_id` int(11) unsigned default NULL COMMENT 'Group the member signed in under',
  `data` text,
  `ip` varchar(16) default NULL,
  `date` datetime default NULL,
  PRIMARY KEY  (`id`,`qo_members_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_signup_requests
-- ----------------------------
DROP TABLE IF EXISTS `qo_signup_requests`;
CREATE TABLE `qo_signup_requests` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `first_name` varchar(25) default NULL,
  `last_name` varchar(35) default NULL,
  `email_address` varchar(55) default NULL,
  `comments` text,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_spam
-- ----------------------------
DROP TABLE IF EXISTS `qo_spam`;
CREATE TABLE `qo_spam` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `email_address` varchar(55) NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_themes
-- ----------------------------
DROP TABLE IF EXISTS `qo_themes`;
CREATE TABLE `qo_themes` (
  `id` varchar(35) NOT NULL default '',
  `data` text COMMENT 'The definition data ( JSON )',
  `active` tinyint(1) unsigned NOT NULL default '0' COMMENT 'A value of 1 or 0 is expected',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for qo_wallpapers
-- ----------------------------
DROP TABLE IF EXISTS `qo_wallpapers`;
CREATE TABLE `qo_wallpapers` (
  `id` int(11) unsigned NOT NULL auto_increment,
  `data` text COMMENT 'The definition data ( JSON )',
  `active` tinyint(1) unsigned NOT NULL default '0' COMMENT 'A value of 1 or 0 is expected',
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records 
-- ----------------------------
INSERT INTO `qo_groups` VALUES ('1', 'System Administrator', 'The administrator of this desktop system.', '1');
INSERT INTO `qo_groups` VALUES ('2', 'Demo', 'A demo group', '1');
INSERT INTO `qo_groups_has_members` VALUES ('1', '1', '1', '1');
INSERT INTO `qo_groups_has_members` VALUES ('2', '2', '1', '0');
INSERT INTO `qo_groups_has_privileges` VALUES ('1', '1');
INSERT INTO `qo_groups_has_privileges` VALUES ('2', '2');
INSERT INTO `qo_libraries` VALUES ('checkbox-combo', '{\r\n   \"client\": {\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"checkbox-combo/\",\r\n            \"files\": [ \"Ext.ux.form.CheckboxCombo.min.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"checkbox-combo/\",\r\n            \"files\": [ \"Ext.ux.form.CheckboxCombo.min.js\" ]\r\n         }\r\n      ]\r\n   }\r\n}', '1');
INSERT INTO `qo_libraries` VALUES ('colorpicker', '{\r\n   \"dependencies\": [\r\n      { \"id\": \"hexfield\", \"type\": \"library\" }\r\n   ],\r\n\r\n   \"client\": {\r\n      \"css\": [\r\n         {\r\n           \"directory\": \"color-picker/resources/\",\r\n           \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"color-picker/\",\r\n            \"files\": [ \"Ext.ux.ColorPicker.js\" ]\r\n         }\r\n      ]\r\n   }\r\n}', '1');
INSERT INTO `qo_libraries` VALUES ('columntree', '{\r\n   \"client\": {\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"column-tree/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ]\r\n   }\r\n}', '1');
INSERT INTO `qo_libraries` VALUES ('explorerview', '{\r\n   \"client\": {\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"explorer-view/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"explorer-view/\",\r\n            \"files\": [ \"Ext.ux.grid.ExplorerView.js\", \"Ext.ux.grid.GroupingExplorerView.js\" ]\r\n         }\r\n      ]\r\n   }\r\n}', '1');
INSERT INTO `qo_libraries` VALUES ('hexfield', '{\r\n   \"client\": {\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"hex-field/\",\r\n            \"files\": [ \"Ext.ux.form.HexField.js\" ]\r\n         }\r\n      ]\r\n   }\r\n}', '1');
INSERT INTO `qo_libraries` VALUES ('iframecomponent', '{\r\n   \"client\": {\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"iframe-component/\",\r\n            \"files\": [ \"Ext.ux.IFrameComponent.js\" ]\r\n         }\r\n      ]\r\n   }\r\n}', '1');
INSERT INTO `qo_libraries` VALUES ('modalnotice', '{\r\n   \"client\": {\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"modal-notice/\",\r\n            \"files\": [ \"Ext.plugin.ModalNotice.js\" ]\r\n         }\r\n      ]\r\n   }\r\n}', '1');
INSERT INTO `qo_libraries` VALUES ('roweditor', '{\r\n   \"client\": {\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"row-editor/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"row-editor/\",\r\n            \"files\": [ \"Ext.ux.grid.RowEditor.js\" ]\r\n         }\r\n      ]\r\n   }\r\n}', '1');
INSERT INTO `qo_libraries` VALUES ('statusbar', '{\r\n   \"client\": {\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"statusbar/\",\r\n            \"files\": [ \"Ext.ux.StatusBar.js\" ]\r\n         }\r\n      ]\r\n   }\r\n}', '1');
INSERT INTO `qo_members` VALUES ('1', 'Todd', 'Murdock', 'admin@qwikioffice.com', '02e08df52af15996c657df9cad96dfda47da70b1', 'en', '1');
INSERT INTO `qo_members` VALUES ('2', 'Demo', 'User', 'demo@qwikioffice.com', 'cecac99804ef1ae73fee8a58208fc6f84015a175', 'en', '1');
INSERT INTO `qo_modules` VALUES ('demo-accordion', 'demo/accordion', 'Accordion Window', 'Demo of window with accordion.', '{\r\n   \"id\": \"demo-accordion\",\r\n\r\n   \"type\": \"demo/accordion\",\r\n\r\n   \"about\": {\r\n      \"author\": \"Jack Slocum\",\r\n      \"description\": \"Demo of window with accordion.\",\r\n      \"name\": \"Accordion Window\",\r\n      \"url\": \"www.qwikioffice.com\",\r\n      \"version\": \"1.0\"\r\n   },\r\n\r\n   \"locale\": {\r\n      \"class\": \"QoDesk.AccordionWindow.Locale\",\r\n      \"directory\": \"demo/acc-win/client/locale/\",\r\n      \"extension\": \".json\",\r\n      \"languages\": [ \"en\" ]\r\n   },\r\n\r\n   \"client\": {\r\n      \"class\": \"QoDesk.AccordionWindow\",\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"demo/acc-win/client/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"demo/acc-win/client/\",\r\n            \"files\": [ \"acc-win.js\" ]\r\n         }\r\n      ],\r\n      \"launcher\": {\r\n         \"config\": {\r\n            \"iconCls\": \"acc-icon\",\r\n            \"shortcutIconCls\": \"demo-acc-shortcut\",\r\n            \"text\": \"Accordion Window\",\r\n            \"tooltip\": \"<b>Accordion Window</b><br />A window with an accordion layout\"\r\n         },\r\n         \"paths\": {\r\n            \"startmenu\": \"/\"\r\n         }\r\n      }\r\n   }\r\n}', '1');
INSERT INTO `qo_modules` VALUES ('demo-bogus', 'demo/bogus', 'Bogus Window', 'Demo of bogus window.', '{\r\n   \"id\": \"demo-bogus\",\r\n\r\n   \"type\": \"demo/bogus\",\r\n\r\n   \"about\": {\r\n      \"author\": \"Jack Slocum\",\r\n      \"description\": \"Demo of bogus window.\",\r\n      \"name\": \"Bogus Window\",\r\n      \"url\": \"www.qwikioffice.com\",\r\n      \"version\": \"1.0\"\r\n   },\r\n\r\n   \"client\": {\r\n      \"class\": \"QoDesk.BogusWindow\",\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"demo/bogus-win/client/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"demo/bogus-win/client/\",\r\n            \"files\": [ \"bogus-win.js\" ]\r\n         }\r\n      ],\r\n      \"launcher\": {\r\n         \"config\": {\r\n            \"iconCls\": \"bogus-icon\",\r\n            \"shortcutIconCls\": \"demo-bogus-shortcut\",\r\n            \"text\": \"Bogus Window\",\r\n            \"tooltip\": \"<b>Bogus Window</b><br />A bogus window\"\r\n         },\r\n         \"paths\": {\r\n             \"startmenu\": \"/Bogus Menu/Bogus Sub Menu\"\r\n         }\r\n      }\r\n   }\r\n}', '1');
INSERT INTO `qo_modules` VALUES ('demo-grid', 'demo/grid', 'Grid Window', 'Demo of grid window.', '{\r\n   \"id\": \"demo-grid\",\r\n\r\n   \"type\": \"demo/grid\",\r\n\r\n   \"about\": {\r\n      \"author\": \"Jack Slocum\",\r\n      \"description\": \"Demo of grid window.\",\r\n      \"name\": \"Grid Window\",\r\n      \"url\": \"www.qwikioffice.com\",\r\n      \"version\": \"1.0\"\r\n   },\r\n\r\n   \"client\": {\r\n      \"class\": \"QoDesk.GridWindow\",\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"demo/grid-win/client/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"demo/grid-win/client/\",\r\n            \"files\": [ \"grid-win.js\" ]\r\n         }\r\n      ],\r\n      \"launcher\": {\r\n         \"config\": {\r\n            \"iconCls\": \"grid-icon\",\r\n            \"shortcutIconCls\": \"demo-grid-shortcut\",\r\n            \"text\": \"Grid Window\",\r\n            \"tooltip\": \"<b>Grid Window</b><br />A grid window\"\r\n         },\r\n         \"paths\": {\r\n            \"startmenu\": \"/\"\r\n         }\r\n      }\r\n   }\r\n}', '1');
INSERT INTO `qo_modules` VALUES ('demo-layout', 'demo/layout', 'Layout Window', 'Demo of layout window.', '{\r\n   \"id\": \"demo-layout\",\r\n\r\n   \"type\": \"demo/layout\",\r\n\r\n   \"about\": {\r\n      \"author\": \"Todd Murdock\",\r\n      \"description\": \"Demo of layout window.\",\r\n      \"name\": \"Layout Window\",\r\n      \"url\": \"www.qwikioffice.com\",\r\n      \"version\": \"1.0\"\r\n   },\r\n\r\n   \"client\": {\r\n      \"class\": \"QoDesk.LayoutWindow\",\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"demo/layout-win/client/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"demo/layout-win/client/\",\r\n            \"files\": [ \"layout-win.js\" ]\r\n         }\r\n      ],\r\n      \"launcher\": {\r\n         \"config\": {\r\n            \"iconCls\": \"layout-icon\",\r\n            \"shortcutIconCls\": \"demo-layout-shortcut\",\r\n            \"text\": \"Layout Window\",\r\n            \"tooltip\": \"<b>Layout Window</b><br />A layout window\"\r\n         },\r\n         \"paths\": {\r\n            \"startmenu\": \"/\"\r\n         }\r\n      }\r\n   }\r\n}', '1');
INSERT INTO `qo_modules` VALUES ('demo-tab', 'demo/tab', 'Tab Window', 'Demo of tab window.', '{\r\n   \"id\": \"demo-tab\",\r\n   \r\n   \"type\": \"demo/tab\",\r\n\r\n   \"about\": {\r\n      \"author\": \"Todd Murdock\",\r\n      \"description\": \"Demo of tab window.\",\r\n      \"name\": \"Tab Window\",\r\n      \"url\": \"www.qwikioffice.com\",\r\n      \"version\": \"1.0\"\r\n   },\r\n\r\n   \"client\": {\r\n      \"class\": \"QoDesk.TabWindow\",\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"demo/tab-win/client/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"demo/tab-win/client/\",\r\n            \"files\": [ \"tab-win.js\" ]\r\n         }\r\n      ],\r\n      \"launcher\": {\r\n         \"config\": {\r\n            \"iconCls\": \"tab-icon\",\r\n            \"shortcutIconCls\": \"demo-tab-shortcut\",\r\n            \"text\": \"Tab Window\",\r\n            \"tooltip\": \"<b>Tab Window</b><br />A tab window\"\r\n         },\r\n         \"paths\": {\r\n            \"startmenu\": \"/\"\r\n         }\r\n      }\r\n   }\r\n}', '1');
INSERT INTO `qo_modules` VALUES ('qo-admin', 'system/administration', 'Admin', 'Allows system administration', '{\r\n   \"id\": \"qo-admin\",\r\n\r\n   \"type\": \"system/administration\",\r\n\r\n   \"about\": {\r\n      \"author\": \"Todd Murdock\",\r\n      \"description\": \"Allows system administration\",\r\n      \"name\": \"Admin\",\r\n      \"url\": \"www.qwikioffice.com\",\r\n      \"version\": \"1.0\"\r\n   },\r\n\r\n   \"dependencies\": [\r\n      { \"id\": \"columntree\", \"type\": \"library\" }\r\n   ],\r\n\r\n   \"client\": {\r\n      \"class\": \"QoDesk.QoAdmin\",\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"qwiki/admin/client/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"qwiki/admin/client/\",\r\n            \"files\": [ \"QoAdmin.js\" ]\r\n         },\r\n         {\r\n            \"directory\": \"qwiki/admin/client/lib/\",\r\n            \"files\": [ \"ActiveColumn.js\", \"ColumnNodeUI.js\", \"Nav.js\", \"SearchField.js\", \"TooltipEditor.js\" ]\r\n         },\r\n         {\r\n            \"directory\": \"qwiki/admin/client/lib/groups/\",\r\n            \"files\": [ \"Groups.js\", \"GroupsTooltipEditor.js\" ]\r\n         },\r\n         {\r\n            \"directory\": \"qwiki/admin/client/lib/members/\",\r\n            \"files\": [ \"Members.js\", \"MembersTooltipEditor.js\" ]\r\n         },\r\n         {\r\n            \"directory\": \"qwiki/admin/client/lib/privileges/\",\r\n            \"files\": [ \"Privileges.js\", \"PrivilegesTooltipEditor.js\" ]\r\n         },\r\n         {\r\n            \"directory\": \"qwiki/admin/client/lib/signups/\",\r\n            \"files\": [ \"Signups.js\", \"SignupsDetail.js\", \"SignupsGrid.js\" ]\r\n         }\r\n      ],\r\n      \"launcher\": {\r\n         \"config\": {\r\n            \"iconCls\": \"qo-admin-icon\",\r\n            \"shortcutIconCls\": \"qo-admin-shortcut-icon\",\r\n            \"text\": \"QO Admin\",\r\n            \"tooltip\": \"<b>QO Admin</b><br />Allows system administration\"\r\n         },\r\n         \"paths\": {\r\n            \"startmenu\": \"/Admin\"\r\n         }\r\n      }\r\n   },\r\n\r\n   \"server\": {\r\n      \"methods\": [\r\n         { \"name\": \"addGroup\", \"description\": \"Add a new group\" },\r\n         { \"name\": \"addMember\", \"description\": \"Add a new member\" },\r\n         { \"name\": \"addPrivilege\", \"description\": \"Add a new privilege\" },\r\n         { \"name\": \"approveSignupsToGroup\", \"description\": \"Approve a signup request\" },\r\n         { \"name\": \"deleteGroup\", \"description\": \"Delete a group\" },\r\n         { \"name\": \"deleteMember\", \"description\": \"Delete a member\" },\r\n         { \"name\": \"deletePrivilege\", \"description\": \"Delete a privilege\" },\r\n         { \"name\": \"denySignups\", \"description\": \"Deny a signup request\" },\r\n         { \"name\": \"editGroup\", \"description\": \"Edit a groups information\" },\r\n         { \"name\": \"editGroupPrivilege\", \"description\": \"Edit what privilege a group is associated with\" },\r\n         { \"name\": \"editMember\", \"description\": \"Edit a members information\" },\r\n         { \"name\": \"editMembersGroups\", \"description\": \"Edit what groups a member is associated with\" },\r\n         { \"name\": \"editPrivilege\", \"description\": \"Edit a privileges information\" },\r\n         { \"name\": \"editPrivilegeModules\", \"description\": \"Edit what modules and methods a privilege allows\" },\r\n         { \"name\": \"viewGroups\", \"description\": \"View groups\" },\r\n         { \"name\": \"viewGroupPrivileges\", \"description\": \"View the privileges available to the group\" },\r\n         { \"name\": \"viewMembers\", \"description\": \"View members information\" },\r\n         { \"name\": \"viewMemberGroups\", \"description\": \"View the groups available to the member\" },\r\n         { \"name\": \"viewPrivileges\", \"description\": \"View privilege information\" },\r\n         { \"name\": \"viewPrivilegeModules\", \"description\": \"View the modules available to the privilege\" },\r\n         { \"name\": \"viewSignups\", \"description\": \"View all sign ups\" }\r\n      ],\r\n      \"class\": \"QoAdmin\",\r\n      \"file\": \"qwiki/admin/server/QoAdmin.php\"\r\n   }\r\n}', '1');
INSERT INTO `qo_modules` VALUES ('qo-mail', 'email', 'Email', 'Allows users to send and receive email', '{\r\n   \"id\": \"qo-mail\",\r\n\r\n   \"type\": \"system/email\",\r\n\r\n   \"about\": {\r\n      \"author\": \"Todd Murdock\",\r\n      \"description\": \"Allows users to send and receive email\",\r\n      \"name\": \"qWikiMail\",\r\n      \"url\": \"www.qwikioffice.com\",\r\n      \"version\": \"1.0\"\r\n   },\r\n\r\n   \"dependencies\": [\r\n         { \"id\": \"iframecomponent\", \"type\": \"library\" }\r\n   ],\r\n\r\n   \"client\": {\r\n      \"class\": \"QoDesk.QoMail\",\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"qwiki/mail/client/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"qwiki/mail/client/\",\r\n            \"files\": [ \"QoMail.js\" ]\r\n         }\r\n      ],\r\n      \"launcher\": {\r\n         \"config\": {\r\n            \"iconCls\": \"qo-mail-icon\",\r\n            \"shortcutIconCls\": \"qo-mail-shortcut-icon\",\r\n            \"text\": \"Mail\",\r\n            \"tooltip\": \"<b>Mail</b><br />Allows you to send and receive email\"\r\n         },\r\n         \"paths\": {\r\n            \"startmenu\": \"/\"\r\n         }\r\n      }\r\n   },\r\n\r\n   \"server\": {\r\n      \"methods\": [\r\n         { \"name\": \"loadMemberFolders\", \"description\": \"Allow member to load (view) their folders\" },\r\n         { \"name\": \"addMemberFolder\", \"description\": \"Allow member to add a new folder\" }\r\n      ],\r\n      \"class\": \"QoMail\",\r\n      \"file\": \"qwiki/mail/server/QoMail.php\"\r\n   }\r\n}', '0');
INSERT INTO `qo_modules` VALUES ('qo-preferences', 'system/preferences', 'Preferences', 'Allows users to set and save their desktop preferences', '{\r\n   \"id\": \"qo-preferences\",\r\n\r\n   \"type\": \"system/preferences\",\r\n\r\n   \"about\": {\r\n      \"author\": \"Todd Murdock\",\r\n      \"description\": \"Allows users to set and save their desktop preferences\",\r\n      \"name\": \"Preferences\",\r\n      \"url\": \"www.qwikioffice.com\",\r\n      \"version\": \"1.0\"\r\n   },\r\n\r\n   \"dependencies\": [\r\n      { \"id\": \"colorpicker\", \"type\": \"library\" },\r\n      { \"id\": \"explorerview\", \"type\": \"library\" },\r\n      { \"id\": \"modalnotice\", \"type\": \"library\" }\r\n   ],\r\n\r\n   \"locale\": {\r\n      \"class\": \"QoDesk.QoPreferences.Locale\",\r\n      \"directory\": \"qwiki/preferences/client/locale/\",\r\n      \"extension\": \".json\",\r\n      \"languages\": [ \"en\" ]\r\n   },\r\n\r\n   \"client\": {\r\n      \"class\": \"QoDesk.QoPreferences\",\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"qwiki/preferences/client/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"qwiki/preferences/client/\",\r\n            \"files\": [ \"QoPreferences.js\" ]\r\n         },\r\n         {\r\n            \"directory\": \"qwiki/preferences/client/lib/\",\r\n            \"files\": [ \"Appearance.js\", \"AutoRun.js\", \"Background.js\", \"CheckTree.js\", \"Grid.js\", \"Nav.js\", \"QuickStart.js\", \"Shortcuts.js\" ]\r\n         }\r\n      ],\r\n      \"launcher\": {\r\n         \"config\": {\r\n            \"iconCls\": \"qo-pref-icon\",\r\n            \"shortcutIconCls\": \"qo-pref-shortcut-icon\",\r\n            \"text\": \"QO Preferences\",\r\n            \"tooltip\": \"<b>QO Preferences</b><br />Allows you to modify your desktop\"\r\n         },\r\n         \"paths\": {\r\n            \"contextmenu\": \"/\",\r\n            \"startmenutool\": \"/\"\r\n         }\r\n      }\r\n   },\r\n\r\n   \"server\": {\r\n      \"methods\": [\r\n         { \"name\": \"saveAppearance\", \"description\": \"Allow member to save appearance\" },\r\n         { \"name\": \"saveAutorun\", \"description\": \"Allow member to save which modules run at start up\" },\r\n         { \"name\": \"saveBackground\", \"description\": \"Allow member to save a wallpaper as the background\" },\r\n         { \"name\": \"saveQuickstart\", \"description\": \"Allow member to save which modules appear in the Quick Start panel\" },\r\n         { \"name\": \"saveShortcut\", \"description\": \"Allow member to save which modules appear as a Shortcut\" },\r\n         { \"name\": \"viewThemes\", \"description\": \"Allow member to view the available themes\" },\r\n         { \"name\": \"viewWallpapers\", \"description\": \"Allow member to view the available wallpapers\" }\r\n      ],\r\n      \"class\": \"QoPreferences\",\r\n      \"file\": \"qwiki/preferences/server/QoPreferences.php\"\r\n   }\r\n}', '1');
INSERT INTO `qo_modules` VALUES ('qo-profile', 'user/profile', 'Profile', 'Allows user profile administration', '{\r\n   \"id\": \"qo-profile\",\r\n\r\n   \"type\": \"user/profile\",\r\n\r\n   \"about\": {\r\n      \"author\": \"Todd Murdock\",\r\n      \"description\": \"Allows user profile administration\",\r\n      \"name\": \"Profile\",\r\n      \"url\": \"www.qwikioffice.com\",\r\n      \"version\": \"1.0\"\r\n   },\r\n\r\n    \"dependencies\": [\r\n      { \"id\": \"statusbar\", \"type\": \"library\" }\r\n   ],\r\n\r\n   \"locale\": {\r\n      \"class\": \"QoDesk.QoProfile.Locale\",\r\n      \"directory\": \"qwiki/profile/client/locale/\",\r\n      \"extension\": \".json\",\r\n      \"languages\": [ \"en\" ]\r\n   },\r\n\r\n   \"client\": {\r\n      \"class\": \"QoDesk.QoProfile\",\r\n      \"css\": [\r\n         {\r\n            \"directory\": \"qwiki/profile/client/resources/\",\r\n            \"files\": [ \"styles.css\" ]\r\n         }\r\n      ],\r\n      \"javascript\": [\r\n         {\r\n            \"directory\": \"qwiki/profile/client/\",\r\n            \"files\": [ \"QoProfile.js\" ]\r\n         }\r\n      ],\r\n      \"launcher\": {\r\n         \"config\": {\r\n            \"iconCls\": \"qo-profile-icon\",\r\n            \"shortcutIconCls\": \"qo-profile-shortcut-icon\",\r\n            \"text\": \"Profile\",\r\n            \"tooltip\": \"<b>Profile</b><br />Allows user profile administration\"\r\n         },\r\n         \"paths\": {\r\n            \"contextmenu\": \"/\",\r\n            \"startmenutool\": \"/\"\r\n         }\r\n      }\r\n   },\r\n\r\n   \"server\": {\r\n      \"methods\": [\r\n         { \"name\": \"loadProfile\", \"description\": \"Load a users profile\" },\r\n         { \"name\": \"saveProfile\", \"description\": \"Save a members profile\" },\r\n         { \"name\": \"savePwd\", \"description\": \"Save a members password\" }\r\n      ],\r\n      \"class\": \"QoProfile\",\r\n      \"file\": \"qwiki/profile/server/QoProfile.php\"\r\n   }\r\n}', '1');
INSERT INTO `qo_preferences` VALUES ('0', '0', '{\"appearance\":{\"fontColor\": \"333333\",\"themeId\":1,\"taskbarTransparency\":\"100\"},\"background\":{\"color\": \"f9f9f9\",\"wallpaperId\":11,\"wallpaperPosition\":\"center\"},\"launchers\":{\"autorun\":[\"qo-preferences\"],\"quickstart\": [],\"shortcut\":[\"qo-preferences\",\"demo-accordion\",\"demo-grid\",\"demo-layout\",\"demo-bogus\",\"demo-tab\"]}}');
INSERT INTO `qo_preferences` VALUES ('1', '1', '{\"appearance\":{\"fontColor\":\"333333\",\"themeId\":1,\"taskbarTransparency\":100},\"background\":{\"color\":\"f9f9f9\",\"wallpaperId\":11,\"wallpaperPosition\":\"center\"},\"launchers\":{\"shortcut\":[\"qo-preferences\",\"qo-admin\",\"demo-accordion\",\"demo-tab\",\"demo-bogus\"],\"quickstart\":[\"qo-preferences\",\"qo-admin\",\"demo-tab\"]}}');
INSERT INTO `qo_privileges` VALUES ('1', 'System Administrator', 'System administrator privileges.  Full access.', '{\"demo-accordion\":[],\"demo-bogus\":[],\"demo-grid\":[],\"demo-layout\":[],\"demo-tab\":[],\"qo-admin\":[\"addGroup\",\"addMember\",\"addPrivilege\",\"approveSignupsToGroup\",\"deleteGroup\",\"deleteMember\",\"deletePrivilege\",\"denySignups\",\"editGroup\",\"editGroupPrivilege\",\"editMember\",\"editMembersGroups\",\"editPrivilege\",\"editPrivilegeModules\",\"viewGroups\",\"viewGroupPrivileges\",\"viewMembers\",\"viewMemberGroups\",\"viewPrivileges\",\"viewPrivilegeModules\",\"viewSignups\"],\"qo-mail\":[\"loadMemberFolders\",\"addMemberFolder\"],\"qo-preferences\":[\"saveAppearance\",\"saveAutorun\",\"saveBackground\",\"saveQuickstart\",\"saveShortcut\",\"viewThemes\",\"viewWallpapers\"],\"qo-profile\":[\"loadProfile\",\"saveProfile\",\"savePwd\"]}', '1');
INSERT INTO `qo_privileges` VALUES ('2', 'Demo', 'Demo privileges.  Can not save or edit.', '{\"demo-accordion\":[],\"demo-bogus\":[],\"demo-grid\":[],\"demo-layout\":[],\"demo-tab\":[],\"qo-preferences\":[\"viewThemes\",\"viewWallpapers\"],\"qo-profile\":[\"loadProfile\",\"saveProfile\",\"savePwd\"]}', '1');
INSERT INTO `qo_themes` VALUES ('1', '{\r\n   \"about\": {\r\n      \"author\": \"Ext JS\",\r\n      \"version\": \"1.0\",\r\n      \"url\": \"www.extjs.com\"\r\n   },\r\n   \"group\": \"Ext JS\",\r\n   \"name\": \"Blue\",\r\n   \"thumbnail\": \"images/xtheme-blue.gif\",\r\n   \"file\": \"css/xtheme-blue.css\",\r\n   \"url\": \"http://extjs.cachefly.net/ext-3.2.1/resources/css/xtheme-blue.css\"\r\n}', '1');
INSERT INTO `qo_themes` VALUES ('2', '{\r\n   \"about\": {\r\n      \"author\": \"Ext JS\",\r\n      \"version\": \"1.0\",\r\n      \"url\": \"www.extjs.com\"\r\n   },\r\n   \"group\": \"Ext JS\",\r\n   \"name\": \"Gray\",\r\n   \"thumbnail\": \"images/xtheme-gray.gif\",\r\n   \"file\": \"css/xtheme-gray.css\",\r\n   \"url\": \"http://extjs.cachefly.net/ext-3.2.1/resources/css/xtheme-gray.css\"\r\n}', '1');
INSERT INTO `qo_themes` VALUES ('3', '{\r\n   \"about\": {\r\n      \"author\": \"Ext JS\",\r\n      \"version\": \"1.0\",\r\n      \"url\": \"www.extjs.com\"\r\n   },\r\n   \"group\": \"Ext JS\",\r\n   \"name\": \"Access\",\r\n   \"thumbnail\": \"images/xtheme-access.gif\",\r\n   \"file\": \"css/xtheme-access.css\",\r\n   \"url\": \"http://extjs.cachefly.net/ext-3.2.1/resources/css/xtheme-access.css\"\r\n}', '1');
INSERT INTO `qo_themes` VALUES ('4', '{\r\n   \"about\": {\r\n      \"author\": \"Ext JS User\",\r\n      \"version\": \"1.0\",\r\n      \"url\": \"www.extjs.com\"\r\n   },\r\n   \"group\": \"Ext JS\",\r\n   \"name\": \"Slate\",\r\n   \"thumbnail\": \"images/xtheme-slate.gif\",\r\n   \"file\": \"css/xtheme-slate.css\"\r\n}', '0');
INSERT INTO `qo_wallpapers` VALUES ('1', '{\r\n   \"group\": \"Blank\",\r\n   \"name\": \"Blank\",\r\n   \"thumbnail\": \"thumbnails/blank.gif\",\r\n   \"file\": \"blank.gif\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('2', '{\r\n   \"group\": \"Pattern\",\r\n   \"name\": \"Blue Psychedelic\",\r\n   \"thumbnail\": \"thumbnails/blue-psychedelic.jpg\",\r\n   \"file\": \"blue-psychedelic.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('3', '{\r\n   \"group\": \"Pattern\",\r\n   \"name\": \"Blue Swirl\",\r\n   \"thumbnail\": \"thumbnails/blue-swirl.jpg\",\r\n   \"file\": \"blue-swirl.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('4', '{\r\n   \"group\": \"Nature\",\r\n   \"name\": \"Colorado Farm\",\r\n   \"thumbnail\": \"thumbnails/colorado-farm.jpg\",\r\n   \"file\": \"colorado-farm.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('5', '{\r\n   \"group\": \"Nature\",\r\n   \"name\": \"Curls On Green\",\r\n   \"thumbnail\": \"thumbnails/curls-on-green.jpg\",\r\n   \"file\": \"curls-on-green.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('6', '{\r\n   \"group\": \"Pattern\",\r\n   \"name\": \"Emotion\",\r\n   \"thumbnail\": \"thumbnails/emotion.jpg\",\r\n   \"file\": \"emotion.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('7', '{\r\n   \"group\": \"Pattern\",\r\n   \"name\": \"Eos\",\r\n   \"thumbnail\": \"thumbnails/eos.jpg\",\r\n   \"file\": \"eos.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('8', '{\r\n   \"group\": \"Nature\",\r\n   \"name\": \"Fields of Peace\",\r\n   \"thumbnail\": \"thumbnails/fields-of-peace.jpg\",\r\n   \"file\": \"fields-of-peace.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('9', '{\r\n   \"group\": \"Nature\",\r\n   \"name\": \"Fresh Morning\",\r\n   \"thumbnail\": \"thumbnails/fresh-morning.jpg\",\r\n   \"file\": \"fresh-morning.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('10', '{\r\n   \"group\": \"Nature\",\r\n   \"name\": \"Lady Buggin\",\r\n   \"thumbnail\": \"thumbnails/ladybuggin.jpg\",\r\n   \"file\": \"ladybuggin.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('11', '{\r\n   \"group\": \"qWikiOffice\",\r\n   \"name\": \"qWikiOffice\",\r\n   \"thumbnail\": \"thumbnails/qwikioffice.jpg\",\r\n   \"file\": \"qwikioffice.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('12', '{\r\n   \"group\": \"Nature\",\r\n   \"name\": \"Summer\",\r\n   \"thumbnail\": \"thumbnails/summer.jpg\",\r\n   \"file\": \"summer.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('13', '{\r\n   \"group\": \"Pattern\",\r\n   \"name\": \"Emotion Pattern\",\r\n   \"thumbnail\": \"thumbnails/emotion-pattern.jpg\",\r\n   \"file\": \"emotion-pattern.jpg\"\r\n}', '1');
INSERT INTO `qo_wallpapers` VALUES ('14', '{\r\n   \"group\": \"Pattern\",\r\n   \"name\": \"Pattern Red\",\r\n   \"thumbnail\": \"thumbnails/pattern-red.gif\",\r\n   \"file\": \"pattern-red.gif\"\r\n}', '1');
