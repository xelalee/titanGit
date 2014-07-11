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

    // those days as gz
    $zlog  = '/tmp/logs.zip';
    $zpath = '/mnt/hda/archer/zlog/';

    shell_exec( 'rm '. $zlog );

    shell_exec( '7za a -tzip '. $zlog .' '. $zpath . '*.log.txt.gz' );

    // today's data
    $db = str_replace("-", "_", trim( shell_exec( 'date +%Y-%m-%d' ) ));
    $ftoday = '/tmp/'. $db .'.log.txt';
    $ztoday = '/tmp/'. $db .'.log.txt.gz';

    shell_exec( 'rm '. $ftoday );
    shell_exec( 'rm '. $ztoday );

    $str = '';

    $fp = fopen( $ftoday, 'w' );

    for ($i=23; $i>=0; $i--) 
    {
        if ($result = $mysqli->query( 'SELECT * FROM '. $db .'.`logs_'. sprintf("%02d", $i) .'` ORDER BY seq DESC' )) 
        { 
            while ($obj = $result->fetch_object()) 
            {
                //$str .= $obj->date ." ". $obj->time ."-". $obj->severity ."-". $obj->facility .":". $obj->msg ."(". $obj->program .")\n";
                fwrite( $fp, $obj->date ." ". $obj->time ."-". $obj->severity ."-". $obj->facility .":". $obj->msg ."(". $obj->program .")\n" );
            
            }
        }
    }

    fclose( $fp );

    // gzip today's data
    shell_exec( '7za a -tgzip '. $ztoday .' '. $ftoday );

    // add gzip to zip
    shell_exec( '7za a -tzip '. $zlog .' '. $ztoday );

    // http headers for zip downloads
    header("Pragma: public");
    header("Expires: 0");
    header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
    header("Cache-Control: public");
    header("Content-Description: File Transfer");
    header("Content-type: application/octet-stream");
    header("Content-Disposition: attachment; filename=\"logs.zip\"");
    header("Content-Transfer-Encoding: binary");
    header("Content-Length: ".filesize($zlog));
    ob_end_flush();
    @readfile($zlog);
    header("Connection: close");
    break;
}

/* close connection */
$mysqli->close();

?>
