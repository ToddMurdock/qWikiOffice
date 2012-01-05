<?php
/*
 * qWikiOffice Desktop 1.0
 * Copyright(c) 2007-2010, Murdock Technologies, Inc.
 * licensing@qwikioffice.com
 *
 * http://www.qwikioffice.com/license
 */
class security {

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
    * dataHash() Hashed result includes random salt.  However, this function maintains result length as if no salt is included.
    *
    * $saltLength is length of salt. It's caped by method you use to hash, so in case you use sha1, you can pass value 100,
    * but it will still use 40 characters.
    *
    * $hashingMethod defines which method you want to use to hash plain text since this function is build using hash().
    *
    * Quick example:
    * Hashing a password - dataHash($plain_password);
    * Validating password - dataHash($plain_password, $hashedPassword);
    *
    * @access public
    * @param {string} $target The string you want to hash (e.g. password).
    * @param {string} $targetHashed The target string hashed at an earlier time.  This would be hashed data in the database that is passed in for
    * comparison to the target string.  When targetHashed is not passed it, it is NULL and the target is hashed with a random salt.
    * When targetHashed is not null, targetHashed becomes salt and if target is valid, it will return same hash as targetHashed.
    * @return {string}
    */
   public function encrypt($target, $targetHashed = NULL){
      $saltLength = 10;
      $hashingMethod = 'sha1';

      //If no password to validate
      if ($targetHashed == NULL){
         $randomSalt = '';

         //Build 16 character random salt
         for ($i = 0; $i<16; $i++){
            $randNum = rand(33, 255); //Get random number between 33 - 255
            $randomSalt .= chr($randNum); //Get ascii character based on random number
         }
         $randomSalt = hash($hashingMethod, $randomSalt); //hash the random salt
      }else{ //Password to validate
         $randomSalt = $targetHashed; //set random salt to hashed password to be checked
      }

      //This code makes sure at least 10 characters from the original password remain in the hashed result.  Prevents from situations where $saltLength is set
      //too long and entire password is cut out, leaving only the salt in which case the result would always be true.
      if($saltLength > (strlen($randomSalt) - 10)){
         $saltLength = (strlen($randomSalt) - 10);
      }

      //$hLPosition is used to determine what part of the salt will actually be used
      $hLPosition = strlen($target); //Set hLPosition to length of password to be encrypted

      while ($hLPosition > $saltLength){ //while length of password is greater than length of salt
         $hNumber = substr($hLPosition, -1); //grabs last number of hLPosition (Ex. If hLPosition = 19 then hNumber = 9)
         $hLPosition = $hLPosition * ($hNumber/10); //resets hLPosition
      }

      $hLPosition = (integer)$hLPosition; //Cast decimal to integer (2.4 becomes 2)
      $hRPosition = $saltLength - $hLPosition; //Determines the start position for the rest of the salt that will be used

      $hFSalt = substr($randomSalt, 0, $hLPosition); //Set the hFSalt to a substring of the actual salt (begining)
      $hLSalt = substr($randomSalt, -$hRPosition, $hRPosition); //Set hLSalt to another substring of the actual salt (end)

      $hPassHash = hash($hashingMethod, ($hLSalt . $target . $hFSalt)); //Hash the two salt substrings and password together

      if($saltLength != 0){
         if($hRPosition == 0){
            $hPassHash = substr($hPassHash, $hLPosition);
         }else{
            $hPassHash = substr($hPassHash, $hLPosition, -$hRPosition);
         }
      }

      return $hFSalt . $hPassHash . $hLSalt;
   }

   private function decrypt(){

   }
}
?>