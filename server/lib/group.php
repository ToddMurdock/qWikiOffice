<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */

class group {

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
	 * exits() Returns true if a record exists for the passed in Group name.
    *
    * @access public
	 * @param {string} $name The group name.
	 * @return {boolean}
	 */
	public function exists($name){
		$response = false;

		if($name != ''){
			$sql = "SELECT
				id
				FROM
				qo_groups
				WHERE
				name = '".$name."'";

         $result = $this->os->db->conn->query($sql);
			if($result){
            $row = $result->fetch(PDO::FETCH_ASSOC);
				if($row){
					$response = true;
				}
			}
		}

		return $response;
	} // end exits()

	/**
	 * is_active()
    *
    * @access public
	 * @param {string} $group_id
	 * @return {boolean}
	 */
	public function is_active($group_id){
		$response = false;

		if($group_id != ''){
			$sql = "SELECT
				active
				FROM
				qo_groups
				WHERE
				id = ".$group_id;

         $result = $this->os->db->conn->query($sql);
			if($result){
            $row = $result->fetch(PDO::FETCH_ASSOC);
				if($row){
					if($row["active"] == 1){
						$response = true;
					}
				}
			}
		}

		return $response;
	} // end is_active()

   /**
    * get_all() Returns all group data.
    * 
    * @access public
    * @param {boolean} $active (optional) True to only return the active groups.
    * @return {array}
    */
   public function get_all($active = false){
      $sql = "SELECT
         id,
         name,
         description,
         active
         FROM
         qo_groups";

      if($active){
         $sql .= " WHERE active = 1";
      }

      $result = $this->os->db->conn->query($sql);
      if($result){
         $groups = array();

         while($row = $result->fetch(PDO::FETCH_ASSOC)){
            $groups[] = $row;
         }

         return $groups;
      }

      return null;
   } // end get_all()

   /**
    * get_active()
    *
    * @access public
    * @return {array}
    */
   public function get_active(){
      return $this->get_all(true);
   } // end get_active()

   /**
    * get_by_id() Returns the group data associated with the id.
    *
    * @access public
    * @param {integer} $id The group id.
    * @param {boolean} $active (optional) True to only return the active groups.
    * @return {array}
    */
   public function get_by_id($id, $active = false){
      if(isset($id) && is_numeric($id)){
         $sql = "SELECT
            id,
            name,
            description,
            active
            FROM
            qo_groups
            WHERE
            id = ".$id;

         if($active){
            $sql .= " AND active = 1";
         }

         $result = $this->os->db->conn->query($sql);
         if($result){
            $row = $result->fetch(PDO::FETCH_ASSOC);
            if($row){
               return $row;
            }
         }
      }

      return null;
   } // end get_by_id()

   /**
    * get_by_member_id() Returns the groups associated with the member id.
    *
    * @access public
    * @param {integer} $member_id The member id.
    * @param {boolean} $active (optional) True to only return the active groups.
    * @return {array}
    */
   public function get_by_member_id($member_id, $active = false){
      if(isset($member_id) && strlen($member_id)){
         $sql = "SELECT
            G.id,
            G.name,
            G.active
            FROM
            qo_groups_has_members GM
               INNER JOIN qo_groups AS G ON G.id = GM.qo_groups_id
            WHERE
            qo_members_id = ".$member_id;

         if($active){
            $sql .= " AND G.active = 1";
         }

         $sql .= " ORDER BY G.name";

         $result = $this->os->db->conn->query($sql);
         if($result){
            $groups = array();

            while($row = $result->fetch(PDO::FETCH_ASSOC)){
               $groups[] = $row;
            }

            return $groups;
         }
      }

      return null;
   } // end get_by_member_id()

   /**
    * get_id() Returns group id.
    *
    * @access public
    * @param {string} $name The group name.
    */
   public function get_id($name){
      if($name != ''){
         $sql = "select
            id
            from
            qo_groups
            where
            name = '".$name."'";

         $result = $this->os->db->conn->query($sql);
         if($result){
            $row = $result->fetch(PDO::FETCH_ASSOC);
            if($row){
               return $row['id'];
            }
         }
      }

      return null;
   } // end get_id()

	/**
    * get_name()
    *
    * @access public
	 * @param {integer} $group_id The group id.
	 */
	public function get_name($group_id){
		if($group_id != ''){
			$sql = "SELECT
				name
				FROM
				qo_groups
				WHERE
				id = ".$group_id;

         $result = $this->os->db->conn->query($sql);
			if($result){
            $row = $result->fetch(PDO::FETCH_ASSOC);
				if($row){
					return $row['name'];
				}
			}
		}

		return null;
	} // end get_name()

   /**
    * get_privilege_id() Returns the privilege id for the group.
    *
    * @access public
    * @param {integer} $group_id The group id.
    */
   public function get_privilege_id($group_id){
      if(isset($group_id) && $group_id != ''){
         $sql = "SELECT
            qo_privileges_id AS id
            FROM
            qo_groups_has_privileges
            WHERE
            qo_groups_id = ".$group_id;

         $result = $this->os->db->conn->query($sql);
         if($result){
            $row = $result->fetch(PDO::FETCH_ASSOC);
            if($row){
               return json_decode($row['id']);
            }
         }
      }

      return null;
   } // get_privilege_id()

	/**
	 * contains_member()
    *
    * @access public
	 * @param {integer} $member_id
	 * @param {string} $name The name of the group
	 * @return boolean
	 */
	public function contains_member($member_id, $group_name){
		if($member_id != '' && $group_name != ''){
			$sql = "SELECT
				name
				FROM
				qo_groups AS G
					INNER JOIN qo_groups_has_members AS GM ON G.id = GM.qo_groups_id
				WHERE
				qo_members_id = ".$member_id;

         $result = $this->os->db->conn->query($sql);
			if($result){
				while($row = $result->fetch(PDO::FETCH_ASSOC)){
					if(strcasecmp($row['name'], $group_name) == 0){ // case-insensitive string comparison
						return true;
					}
				}
			}
		}

		return false;
	} // end contains_member()
}
?>