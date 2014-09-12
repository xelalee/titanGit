<?php

if ( empty( $_GET ) ) {
    die( 'please make sure what u want !?' );
}

// get device time

$nd = trim( shell_exec( 'date "+%Y-%m-%d"' ) );
$nh = trim( shell_exec( 'date "+%H"' ) );
$ndStamp = strtotime( $nd. ' 00:00:00' );
$nhStamp = strtotime( $nd. ' '. $nh. ':00:00' );

$ed = date( str_replace("/", "-", $_GET[ 'ed' ] ) );
$edStamp = strtotime( $ed .' 00:00:00');
$ehStamp = $edStamp + ( $_GET[ 'eh' ] * 3600 );

$sd = date( str_replace("/", "-", $_GET[ 'sd' ] ) );
$sdStamp = strtotime( $sd .' 00:00:00');
$shStamp = $sdStamp + ( $_GET[ 'sh' ] * 3600 );

$db      = str_replace("-", "_", $GLOBALS[ 'nd' ]);
$mysqli  = new mysqli( "127.0.0.1", "", "", $db, 3306 );
$json    = array();
$rows    = array();

// switch function via param
// connect archer first

switch( $_GET[ 'param' ] )
{
// report
case 'traffic_direction':
    switch( $_GET[ 'q' ] ) 
    {
    case 1:
        advAggregate( 'sessions', 'srcIp, dstIp', 'CONCAT_WS("-", srcIp, dstIp) as address, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 2:
        advAggregate( 'sessions', 'srcIp', 'SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 3:
        advAggregate( 'sessions', 'dstIp', 'SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 4:
        advAggregate( 'sessions', 'protocol', 'SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 5:
        advAggregate( 'sessions', 'dstPort', 'SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 6:
        advAggregate( 'sessions', 'fromZone, toZone', 'CONCAT_WS("-", fromZone, toZone) as zone, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    default:
        advQuery( 'sessions' );
    }
    break;
case 'file_extension':
    switch( $_GET[ 'q' ] ) 
    {
    case 1:
        advAggregate( 'file_access', 'extension', 'extension, SUM( accessCount ) as accessCount', 'accessCount' );
        break;
    default:
        advQuery( 'file_access' );
    }
    break;
case 'blocked_host':
    switch( $_GET[ 'q' ] )
    {
    case 1:
        advAggregate( 'blocked_host', 'ip', 'ip, SUM( virusCount ) as virusCount, SUM( firewallCount ) as firewallCount', 'firewallCount' );
        break;
    default:
        advQuery( 'blocked_host' );
    }
    break;
case 'affected_host':
    switch( $_GET[ 'q' ] )
    {
    case 1:
        advAggregate( 'affected_host', 'ip', 'ip, SUM( virusHitCount ) as virusHitCount, SUM( sigHitCount ) as sigHitCount', 'sigHitCount' );
        break;
    default:
        advQuery( 'affected_host' );
    }
    break;
case 'antivirus_report':
    switch( $_GET[ 'q' ]) 
    {
    case 1:
        advAggregate( 'antivirus', 'srcIp', 'srcIp, count(*) as hitCount', 'hitCount' );
        break;
    case 2:
        advAggregate( 'antivirus', 'dstIp', 'dstIp, count(*) as hitCount', 'hitCount' );
        break;
    case 3:
        advAggregate( 'antivirus', 'virusName', 'virusName, count(*) as hitCount', 'hitCount' );
        break;
    default:
        advQuery( 'antivirus' );
    }
    break;
}

function advAggregate( $table, $gby, $sum, $oby ) {
    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {

    } else {
        // weird, given current hour's aggregate instead
        aggregateQuery( "raw_". $table, $gby, $sum, $oby );
    }
}

function aggregateQuery( $table, $gby, $sum, $oby ) {
    if ( $result = $GLOBALS[ 'mysqli' ]->query( "SELECT ". $gby .", ". $sum ." FROM ". $GLOBALS[ 'db' ] .".`". $table ."_". $GLOBALS[ 'nh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 10" ) ) {
        while ( $obj = $result->fetch_object() ) {
            $json["queryResults"][] = $obj;
        }
        $json[ "queryRows" ]  = $result->num_rows;
        // free result set
        $result->close();
    }
    echo json_encode( $json );
}

function advQuery( $table ) {
    $GLOBALS[ 'rows' ][ 'start' ]     = empty( $_GET[ 'pi' ] )? 1 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ] + 1;
    $GLOBALS[ 'rows' ][ 'end' ]       = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'left' ]      = empty( $_GET[ 'pp' ] )? 20 : (int) $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'cnt' ]       = 0;
    $GLOBALS[ 'json' ][ 'queryRows' ] = 0;

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );
    
            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $hr = sprintf( "%02d", $i );
                
                $GLOBALS[ 'rows' ][ 'cnt' ] = $GLOBALS[ 'json' ][ 'queryRows' ];
                $GLOBALS[ 'json' ][ 'queryRows' ] += queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_'. $table .'_'. $hr .'"' ) ;

                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_'. $table .'_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                        while ( $obj = $result->fetch_object() ) {
                            $GLOBALS[ 'rows' ][ 'cnt' ]++;
                            // rows we want
                            if ( ( $GLOBALS[ 'rows' ][ 'cnt' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'cnt' ] <= $GLOBALS[ 'end' ] ) ) {
                                $json['queryResults'][] = $obj;
                                $GLOBALS[ 'rows' ][ 'left' ]--;
                            }

                            if ( 0 == $GLOBALS[ 'rows' ][ 'left'] ) {
                                break;
                            }
                        }
                        // free result set
                        $result->close();
                    }
                }
            }
        } else {
            for ( $i=0; $i<=$days; $i++ )
            {
                switch( $i )
                {
                case 0:
                    $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );
    
                    for ( $j=$_GET[ 'eh' ]; $j>=0; $j-- )
                    {
                        $hr = sprintf( "%02d", $j );
                        $GLOBALS[ 'rows' ][ 'cnt' ] = $GLOBALS[ 'json' ][ 'queryRows' ];
                        $GLOBALS[ 'json' ][ 'queryRows' ] += queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_'. $table .'_'. $hr .'"' ) ;
                        if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                            if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_'. $table .'_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                while ( $obj = $result->fetch_object() ) {
                                    $GLOBALS[ 'rows' ][ 'cnt' ]++;
                                    // rows we want
                                    if ( ( $GLOBALS[ 'rows' ][ 'cnt' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'cnt' ] <= $GLOBALS[ 'end' ] ) ) {
                                        $json['queryResults'][] = $obj;
                                        $GLOBALS[ 'rows' ][ 'left' ]--;
                                    }
        
                                    if ( 0 == $GLOBALS[ 'rows' ][ 'left'] ) {
                                        break;
                                    }
                                }
                                // free result set
                                $result->close();
                            }
                        }
                    }
                    break;
                case $days:
                    // start date
                    // sessions have no daily, others should get from hourly if sh !=0, use hourly for all
    
                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );
    
                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $hr = sprintf( "%02d", $j );
                        $GLOBALS[ 'rows' ][ 'cnt' ] = $GLOBALS[ 'json' ][ 'queryRows' ];
                        $GLOBALS[ 'json' ][ 'queryRows' ] += queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_'. $table .'_'. $hr .'"' );
                        if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                            if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_'. $table .'_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                while ( $obj = $result->fetch_object() ) {
                                    $GLOBALS[ 'rows' ][ 'cnt' ]++;
                                    // rows we want
                                    if ( ( $GLOBALS[ 'rows' ][ 'cnt' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'cnt' ] <= $GLOBALS[ 'end' ] ) ) {
                                        $json['queryResults'][] = $obj;
                                        $GLOBALS[ 'rows' ][ 'left' ]--;
                                    }
        
                                    if ( 0 == $GLOBALS[ 'rows' ][ 'left'] ) {
                                        break;
                                    }
                                }
                                // free result set
                                $result->close();
                            }
                        }
                    }
                    break;
                default:
                    if ( 'sessions' == $table ) {
                        // no daily
                        for ( $j=23; $j>=0; $j-- )
                        {
                            $hr = sprintf( "%02d", $j );
                            $GLOBALS[ 'rows' ][ 'cnt' ] = $GLOBALS[ 'json' ][ 'queryRows' ];
                            $GLOBALS[ 'json' ][ 'queryRows' ] += queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_'. $table .'_'. $hr .'"' );
                        if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                            if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_'. $table .'_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                while ( $obj = $result->fetch_object() ) {
                                    $GLOBALS[ 'rows' ][ 'cnt' ]++;
                                    // rows we want
                                    if ( ( $GLOBALS[ 'rows' ][ 'cnt' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'cnt' ] <= $GLOBALS[ 'end' ] ) ) {
                                        $json['queryResults'][] = $obj;
                                        $GLOBALS[ 'rows' ][ 'left' ]--;
                                    }
        
                                    if ( 0 == $GLOBALS[ 'rows' ][ 'left'] ) {
                                        break;
                                    }
                                }
                                // free result set
                                $result->close();
                            }
                        }
                        }
                    } else {
                        // use daily
                        $GLOBALS[ 'rows' ][ 'cnt' ] = $GLOBALS[ 'json' ][ 'queryRows' ];
                        $GLOBALS[ 'json' ][ 'queryRows' ] += queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "daily_'. $table .'"' ) ;
                    }
                }
            }
        }
        echo json_encode( $GLOBALS[ 'json' ] );
    } else {
        // weird, given current hour's report instead
        reportQuery( "raw_". $table );
    }
}

function reportQuery( $table ) {
    $GLOBALS[ 'json' ][ 'queryRows' ] = queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.`TABLES` WHERE TABLE_SCHEMA = "'. $GLOBALS[ 'db' ] .'" AND TABLE_NAME = "'. $table .'_'. $GLOBALS[ 'nh' ] .'"' );
    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`'. $table .'_'. $GLOBALS[ 'nh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ] ) ) {
        while ( $obj = $result->fetch_object() ) {
            $GLOBALS[ 'json' ]['queryResults'][] = $obj;
        }
        // free result set
        $result->close();
    }
    echo json_encode( $GLOBALS[ 'json' ] );
}

function getRows() {

}

function queryRows( $sql ) {
    $cnt = 0;
    if ( $count = $GLOBALS[ 'mysqli' ]->query( $sql ) ) {
        $cnt = $count->fetch_row()[ 0 ];
        // free count set
        $count->close();
    }
    return $cnt;
}

?>
