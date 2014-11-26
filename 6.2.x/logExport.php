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
    $severity = array(
      "0" => "Emergency",
      "1" => "Alert",
      "2" => "Critical",
      "3" => "Error",
      "4" => "Warning",
      "5" => "Notification",
      "6" => "Information",
      "7" => "Debugging"
    );

    $fp = fopen( $ftoday, 'w' );

    for ($i=23; $i>=0; $i--) 
    {
        if ($result = $mysqli->query( 'SELECT * FROM '. $db .'.`logs_'. sprintf("%02d", $i) .'` ORDER BY seq DESC' )) 
        { 
            while ($obj = $result->fetch_object()) 
            {
                $addr = '';
                if ( $obj->srcIp ) {
                    $addr .= 'SrcAddr='. $obj->srcIp .';';
                }

                if ( $obj->dstIp ) {
                    $addr .= 'DstAddr='. $obj->dstIp .';';
                }

                fwrite( $fp, $obj->date ." ". $obj->time ."-". $severity[ $obj->severity ] ."-". $obj->facility .":". $addr . $obj->msg ."(". $obj->program .")\n" );
            
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
