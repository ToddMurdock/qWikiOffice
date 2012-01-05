<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class QoPreferences {

   private $os = null;

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

	// public methods

   /**
    * saveAppearance()
    *
    * @access public
    */
   public function saveAppearance(){
      print $this->save('appearance');
   } // end saveAppearance()

   /**
    * saveAutorun()
    *
    * @access public
    */
   public function saveAutorun(){
      print $this->save('autorun');
   } // end saveAutorun

   /**
    * saveBackground()
    *
    * @access public
    */
   public function saveBackground(){
      print $this->save('background');
   } // end saveBackground()

   /**
    * saveQuickstart()
    *
    * @access public
    */
   public function saveQuickstart(){
      print $this->save('quickstart');
   } // end saveQuickstart()

   /**
    * saveShortcut()
    *
    * @access public
    */
   public function saveShortcut(){
      print $this->save('shortcut');
   } // end saveShortcut()

   /**
    * viewThemes()
    *
    * @access public
    */
   public function viewThemes(){
      $this->os->load('theme');
      $themes = $this->os->theme->get_active();
      if(!isset($themes) || !is_array($themes) || count($themes) == 0){
         return '{success: false, themes: []}';
      }

      $item = array();
      $items = array();
      $theme_dir = $this->os->get_theme_dir();

      foreach($themes as $id => $theme){
         $item['id'] = $id;
         $item['group'] = $theme->group;
         $item['name'] = $theme->name;
         $item['thumbnail'] = $theme_dir.$theme->thumbnail;
         $item['file'] = $theme_dir.$theme->file;
         $items[] = $item;
      }

      print '{success: true, themes: '.json_encode($items).'}';
	} // end viewThemes()

   /**
    * viewWallpapers()
    *
    * @access public
    */
	public function viewWallpapers(){
		$this->os->load('wallpaper');
      $wallpapers = $this->os->wallpaper->get_active();
      if(!isset($wallpapers) || !is_array($wallpapers) || count($wallpapers) == 0){
         return '{success: false, wallpapers: []}';
      }

      $item = array();
      $items = array();
      $wallpaper_dir = $this->os->get_wallpaper_dir();

      foreach($wallpapers as $id => $wallpaper){
         $item['id'] = $id;
         $item['group'] = $wallpaper->group;
         $item['name'] = $wallpaper->name;
         $item['thumbnail'] = $wallpaper_dir.$wallpaper->thumbnail;
         $item['file'] = $wallpaper_dir.$wallpaper->file;
         $items[] = $item;
      }

      print '{success: true, wallpapers: '.json_encode($items).'}';
	} // end viewWallpapers()

	// private methods

   /**
    * save()
    *
    * @access private
    * @param {string} $what
    * @return {string}
    */
   private function save($what){
      $success = "{'success': false}";

      // get the current member/group from the session
      $member_id = $this->os->get_member_id();
      $group_id = $this->os->get_group_id();

      if(!isset($member_id, $group_id)){
         return $success;
      }

      switch(true){
         case ($what == 'autorun' || $what == 'quickstart' || $what == 'shortcut'):

            // get the ids of the modules
            $ids = isset($_POST['ids']) ? $_POST['ids'] : '';

            if(isset($ids) && $ids != ''){
               $ids = json_decode($ids);
               if(is_array($ids)){
                  $data = new stdClass();

                  // get the current preference data
                  $this->os->load('preference');
                  $preference = $this->os->preference->get($member_id, $group_id);
                  if(isset($preference->launchers)){
                     $data->launchers = $preference->launchers;
                  }

                  $data->launchers->$what = $ids;

                  if($this->os->preference->set($member_id, $group_id, $data)){
                     $success = '{"success": true}';
                  }
               }
            }

            break;
         case ($what == 'appearance'  || $what == 'background'):

            $obj = new stdClass();

            // get the data
            $data = isset($_POST['data']) ? $_POST['data'] : '';

            if(isset($member_id, $group_id, $data) && $data != ''){
               $data = json_decode($data);
               if($data){
                  $obj->$what = $data;
                  $this->os->load('preference');
                  if($this->os->preference->set($member_id, $group_id, $obj)){
                     $success = '{"success": true}';
                  }
               }
            }

            break;
      }

      return $success;
   } // end save()
}
?>