<?php

if (empty($_GET)) {
    die('no comment');
}

// set default time zone
date_default_timezone_set('UTC');

$param = $_GET['param']; 

$mysqli = new mysqli("127.0.0.1", "archer", "rehcra", "archer", 3306);

/* check connection */
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

switch($param)
{
case 'view_logs':
    $json = array();
    $databases = array();
    $tables = array();
    for ($i=23; $i>=0; $i--)
    {
        array_push( $tables, 'logs_'. sprintf("%02d", $i) );
    }

    // get daily databases
    $dbQuery = 'SHOW DATABASES like "20%"';

    if ( $dbQuery = $mysqli->query( 'SHOW DATABASES LIKE "20%"' ) ) {

        while ($row = $dbQuery->fetch_row()) {
            array_push( $databases, $row[ 0 ] );
        }

        // free dbQuery
        $dbQuery->close();

        // sort to get latest on top
        rsort( $databases );

        $str = '';
        for ($i=0; $i<count( $databases ); $i++)
        {
            for ($j=0; $j<count( $tables ); $j++) 
            {
                if ( $result = $mysqli->query( 'SELECT * FROM '. $databases[ $i ]  .'.`'. $tables[ $j ] .'` ORDER BY seq DESC' ) ) {
                    while ($obj = $result->fetch_object()) {
                      $str .= $obj->date ." ". $obj->time ."-". $obj->severity ."-". $obj->facility .":". $obj->msg ."(". $obj->program .")\n";
                    }  
                }
            }
        }
    
        header("Content-Type: text/plain"); 
        header("Content-Disposition: attachment; filename=\"logs.txt\"");
        header("Connection: close");
        echo $str;
    }
    break;
}

/* close connection */
$mysqli->close();
?>

/*

/* creates a compressed zip file */
function create_zip($files = array(),$destination = '',$overwrite = false) {
	//if the zip file already exists and overwrite is false, return false
	if(file_exists($destination) && !$overwrite) { return false; }
	//vars
	$valid_files = array();
	//if files were passed in...
	if(is_array($files)) {
		//cycle through each file
		foreach($files as $file) {
			//make sure the file exists
			if(file_exists($file)) {
				$valid_files[] = $file;
			}
		}
	}
	//if we have good files...
	if(count($valid_files)) {
		//create the archive
		$zip = new ZipArchive();
		if($zip->open($destination,$overwrite ? ZIPARCHIVE::OVERWRITE : ZIPARCHIVE::CREATE) !== true) {
			return false;
		}
		//add the files
		foreach($valid_files as $file) {
			$zip->addFile($file,$file);
		}
		//debug
		//echo 'The zip archive contains ',$zip->numFiles,' files with a status of ',$zip->status;
		
		//close the zip -- done!
		$zip->close();
		
		//check to make sure the file exists
		return file_exists($destination);
	}
	else
	{
		return false;
	}
}

*/
