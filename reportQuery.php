<?php

if ( empty( $_GET ) ) {
    die( 'please make sure what u want !?' );
}

// set default time zone
date_default_timezone_set('UTC');

// switch function via param
// connect archer first

switch( $_GET[ 'param' ] )
{
// report
case 'traffic_direction':
    switch( $_GET[ 'q' ] ) 
    {
    case 1:
        aggregateQuery( 'raw_sessions', 'srcIp, dstIp', 'CONCAT_WS("-", srcIp, dstIp) as address, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 2:
        aggregateQuery( 'raw_sessions', 'srcIp', 'SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 3:
        aggregateQuery( 'raw_sessions', 'dstIp', 'SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 4:
        aggregateQuery( 'raw_sessions', 'protocol', 'SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 5:
        aggregateQuery( 'raw_sessions', 'dstPort', 'SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 6:
        aggregateQuery( 'raw_sessions', 'fromZone, toZone', 'CONCAT_WS("-", fromZone, toZone) as zone, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    default:
        reportQuery( 'raw_sessions' );
    }
    break;
case 'file_extension':
    switch( $_GET[ 'q' ] ) 
    {
    case 1:
        aggregateQuery( 'raw_file_access', 'extension', 'extension, SUM( accessCount ) as accessCount', 'accessCount' );
        break;
    default:
        reportQuery( 'raw_file_access' );
    }
    break;
case 'blocked_host':
    switch( $_GET[ 'q' ] )
    {
    case 1:
        aggregateQuery( 'raw_blocked_host', 'ip', 'ip, SUM( virusCount ) as virusCount, SUM( firewallCount ) as firewallCount', 'firewallCount' );
        break;
    default:
        reportQuery( 'raw_blocked_host' );
    }
    break;
case 'affected_host':
    switch( $_GET[ 'q' ] )
    {
    case 1:
        aggregateQuery( 'raw_affected_host', 'ip', 'ip, SUM( virusHitCount ) as virusHitCount, SUM( sigHitCount ) as sigHitCount', 'sigHitCount' );
        break;
    default:
        reportQuery( 'raw_affected_host' );
    }
    break;
case 'antivirus_report':
    switch( $_GET[ 'q' ]) 
    {
    case 1:
        aggregateQuery( 'raw_antivirus', 'srcIp', 'srcIp, count(*) as hitCount', 'hitCount' );
        break;
    case 2:
        aggregateQuery( 'raw_antivirus', 'dstIp', 'dstIp, count(*) as hitCount', 'hitCount' );
        break;
    case 3:
        aggregateQuery( 'raw_antivirus', 'virusName', 'virusName, count(*) as hitCount', 'hitCount' );
        break;
    default:
        reportQuery( 'raw_antivirus' );
    }
    break;
}

function aggregateQuery( $table, $gby, $sum, $oby ) {
    $json      = array();
    $json[ 'q' ] = $_GET[ 'q' ];

    $nowStamp  = trim( shell_exec( 'date "+%s"' ) );
    $now       = explode( '-', trim( shell_exec( 'date "+%Y-%m-%d-%H"' ) ) );
    $db        = $now[ 0 ] .'_'. $now[ 1 ] .'_'. $now[ 2 ];
    $mysqli    = new mysqli( "127.0.0.1", "", "", $db, 3306 );

    $json[ 'queryStr' ] =  "SELECT ". $gby .", ". $sum ." FROM ". $db .".`". $table ."_". sprintf("%02d", $now[ 3 ]) ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 10" ;
    if ( $result = $mysqli->query( "SELECT ". $gby .", ". $sum ." FROM ". $db .".`". $table ."_". sprintf("%02d", $now[ 3 ]) ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 10" ) ) {
        while ($obj = $result->fetch_object()) {
            $json['queryResults'][] = $obj;
        }
        $json[ 'queryRows' ]  = $result->num_rows;
        // free result set
        $result->close();
    }
    $json[ 'queryStamp' ] = trim( shell_exec( 'date +%s' ) ) - $nowStamp;
    echo json_encode( $json );
}

function reportQuery( $table ) {
    $json      = array();
    $json[ 'q' ] = $_GET[ 'q' ];
    $startRow  = empty( $_GET[ 'pi' ] )? 1 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ] + 1;
    $endRow    = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $leftRow   = empty( $_GET[ 'pp' ] )? 20 : (int) $_GET[ 'pp' ];
    
    $nowStamp  = trim( shell_exec( 'date "+%s"' ) );
    $now       = explode( '-', trim( shell_exec( 'date "+%Y-%m-%d-%H"' ) ) );
    $db        = $now[ 0 ] .'_'. $now[ 1 ] .'_'. $now[ 2 ];
    $mysqli    = new mysqli( "127.0.0.1", "", "", $db, 3306 );

    if ( $count = $mysqli->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.`TABLES` WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "'. $table .'_'. sprintf("%02d", $now[ 3 ]) .'"' ) ) {
        $json[ 'queryRows' ] = $count->fetch_row()[ 0 ];
        $json[ 'queryStr' ] = 'SELECT * FROM '. $db .'.`'. $table .'_'. sprintf("%02d", $now[ 3 ]) .'` ORDER BY id DESC LIMIT '. $startRow .', '. $leftRow; 
        if ( $result = $mysqli->query( 'SELECT * FROM '. $db .'.`'. $table .'_'. sprintf("%02d", $now[ 3 ]) .'` ORDER BY id DESC LIMIT '. $startRow .', '. $leftRow ) ) {
            while ($obj = $result->fetch_object()) {
                $json['queryResults'][] = $obj;
            }
            // free result set
            $result->close();
        }
        // free count set
        $count->close();
    }
    $json[ 'queryStamp' ] = trim( shell_exec( 'date +%s' ) ) - $nowStamp;
    echo json_encode( $json );
}

?>
