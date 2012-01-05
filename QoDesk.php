<?php
//Header("content-type: application/x-javascript");

require_once('server/os.php');
if(!class_exists('os')){ die('os class is missing!'); }

class QoDesk {
   private $os = null;

   private $member_id = null;
   private $group_id = null;
   public $member_info = null;
   private $preferences = null;

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

      $this->member_id = $os->get_member_id();
      $this->group_id = $os->get_group_id();

      if(!isset($this->member_id, $this->group_id)){
         die('Member/Group not found!');
      }

      $this->os = $os;
      $this->member_info = $this->get_member_info();
      $this->preferences = $this->get_preferences();
   } // end __construct()

   private function get_member_info(){
      $this->os->load('member');
      $name = $this->os->member->get_name($this->member_id);
      $this->os->load('group');
      $group = $this->os->group->get_name($this->group_id);

      $member_info = new stdClass();
      $member_info->name = $name ? $name : '';
      $member_info->group = $group ? $group : '';

      return $member_info;
   }

   private function get_preferences(){
      $member_id = $this->member_id;
      $group_id = $this->group_id;

      // get the member/group preference
      $member_preference = $this->os->get_member_preference($member_id, $group_id);

      // get the default preference
      $preference = $this->os->get_member_preference('0', '0');

      // overwrite default with any member/group preference
      foreach($member_preference as $id => $property){
         $preference->$id = $property;
      }

      // do we have the theme id
      if(isset($preference->appearance->themeId)){
         $this->os->load('theme');
         $theme = $this->os->theme->get_by_id($preference->appearance->themeId);
         $theme_dir = $this->os->get_theme_dir();

         $preference->appearance->theme = new stdClass();
         $preference->appearance->theme->id = $preference->appearance->themeId;
         $preference->appearance->theme->name = $theme->name;
         // local file?
         if(stripos($theme->file, 'http://') === false){
            $preference->appearance->theme->file = $theme_dir.$theme->file;
         }else{
            $preference->appearance->theme->file = $theme->file;
         }

         unset($preference->appearance->themeId);
      }

      // do we have the wallpaper id
      if(isset($preference->background->wallpaperId)){
         $this->os->load('wallpaper');
         $wallpaper = $this->os->wallpaper->get_by_id($preference->background->wallpaperId);
         $wallpaper_dir = $this->os->get_wallpaper_dir();

         $preference->background->wallpaper = new stdClass();
         $preference->background->wallpaper->id = $preference->background->wallpaperId;
         $preference->background->wallpaper->name = $wallpaper->name;
         $preference->background->wallpaper->file = $wallpaper_dir.$wallpaper->file;

         unset($preference->background->wallpaperId);
      }

      return $preference;
   }

   public function print_privileges(){
      // have a group id?
      if(!isset($this->group_id)){
         print '{}';
         return false;
      }

      // get the privilege id for the group
      $this->os->load('group');
      $privilege_id = $this->os->group->get_privilege_id($this->group_id);

      if(!$privilege_id){
         print '{}';
         return false;
      }

      // get the privilege data
      $this->os->load('privilege');
      $data = $this->os->privilege->get_data($privilege_id);

      if(!isset($data)){
         print '{}';
         return false;
      }

      print json_encode($data);
      return true;
   }

   public function print_modules(){
      $response = '';
      $ms = $this->os->get_modules();

      if(!isset($ms) || !is_array($ms) || count($ms) == 0){
         print '';
         return false;
      }

      foreach($ms as $id => $m){
         $response .= '{'.
            '"id":"'.$id.'",'.
            '"type":"'.$m->type.'",'.
            '"className":"'.$m->client->class.'",'.
            '"launcher":'.json_encode($m->client->launcher->config).','.
            '"launcherPaths":'.json_encode($m->client->launcher->paths).
         '},';
      }

      print rtrim($response, ',');
   }

   public function print_launchers(){
      print isset($this->preferences->launchers) ? json_encode($this->preferences->launchers) : "{}";
   }

   public function print_appearance(){
      print isset($this->preferences->appearance) ? json_encode($this->preferences->appearance) : "{}";
   }

   public function print_background(){
      print isset($this->preferences->background) ? json_encode($this->preferences->background) : "{}";
   }
}

$os = new os();
$qo_desk = new QoDesk($os);
?>
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

Ext.namespace('Ext.ux','QoDesk');

QoDesk.App = new Ext.app.App({
   init : function(){
      Ext.BLANK_IMAGE_URL = 'resources/images/default/s.gif';
      Ext.QuickTips.init();
   },

   /**
    * The member's name and group name for this session.
    */
   memberInfo: {
      name: '<?php print $qo_desk->member_info->name ?>',
      group: '<?php print $qo_desk->member_info->group ?>'
   },

   /**
    * An array of the module definitions.
    * The definitions are used until the module is loaded on demand.
    */
   modules: [ <?php $qo_desk->print_modules(); ?> ],

   /**
     * The members privileges.
     */
   privileges: <?php $qo_desk->print_privileges(); ?>,

   /**
    * The desktop config object.
    */
   desktopConfig: {
      appearance: <?php $qo_desk->print_appearance(); ?>,
      background: <?php $qo_desk->print_background(); ?>,
      launchers: <?php $qo_desk->print_launchers(); ?>,
      taskbarConfig: {
         buttonScale: 'large',
         position: 'bottom',
         quickstartConfig: {
            width: 120
         },
         startButtonConfig: {
            iconCls: 'icon-qwikioffice',
            text: 'Start'
         },
         startMenuConfig: {
            iconCls: 'icon-user-48',
            title: '<?php print $qo_desk->member_info->name ?>',
            width: 320
         }
      }
   }
});