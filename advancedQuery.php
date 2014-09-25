<?php

if ( empty( $_GET ) ) {
    die( 'please make sure what u want !?' );
}

// get device time

$nd = trim( shell_exec( 'date "+%Y-%m-%d"' ) );
$nh = trim( shell_exec( 'date "+%H"' ) );
$ndStamp  = strtotime( $nd. ' 00:00:00' );
$nhStamp  = strtotime( $nd. ' '. $nh. ':00:00' );
$nowStamp = trim( shell_exec( 'date "+%s"' ) );

$ed = date( str_replace("/", "-", $_GET[ 'ed' ] ) );
$edStamp = strtotime( $ed .' 00:00:00');
$ehStamp = $edStamp + ( $_GET[ 'eh' ] * 3600 );

$sd = date( str_replace("/", "-", $_GET[ 'sd' ] ) );
$sdStamp = strtotime( $sd .' 00:00:00');
$shStamp = $sdStamp + ( $_GET[ 'sh' ] * 3600 );

$db      = str_replace("-", "_", $GLOBALS[ 'nd' ]);
$mysqli  = new mysqli( "127.0.0.1", "archer", "rehcra", "archer", 3306 );
$json    = array();
$rows    = array();
$json[ 'queryResults' ] = [];
$json[ 'queryRows' ] = 0;

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
        advAggregate( 'sessions', 'srcIp', 'srcIp, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 3:
        advAggregate( 'sessions', 'dstIp', 'dstIp, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 4:
        advAggregate( 'sessions', 'protocol', 'protocol, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
        break;
    case 5:
        advAggregate( 'sessions', 'dstPort', 'dstPort, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes', 'totalBytes' );
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
        advAggregate( 'antivirus', 'srcIp', 'srcIp, SUM( hitCount ) as hitCount ', 'hitCount' );
        break;
    case 2:
        advAggregate( 'antivirus', 'dstIp', 'dstIp, SUM( hitCount ) as hitCount ', 'hitCount' );
        break;
    case 3:
        advAggregate( 'antivirus', 'virusName', 'virusName, SUM( hitCount ) as hitCount ', 'hitCount' );
        break;
    default:
        advQuery( 'antivirus' );
    }
    break;
}

function advAggregate( $table, $gby, $state, $oby ) {

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        // prepare temp table        

        switch( $table ) 
        {
        case 'sessions':
            switch( $_GET[ 'q' ] )
            {
            case 1:
                $tmpTable = $GLOBALS[ 'db' ] .'.`daily_addrTraffic-' . $GLOBALS[ 'nowStamp' ] .'`';
                $createTmp = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $tmpTable ." (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `srcIp` varchar(16) NOT NULL DEFAULT '',
                    `dstIp` varchar(16) NOT NULL DEFAULT '',
                    `txBytes` bigint(20) DEFAULT NULL,
                    `rxBytes` bigint(20) DEFAULT NULL,
                    `totalBytes` bigint(20) DEFAULT NULL,
                    `sessions` bigint(20) DEFAULT NULL,
                    PRIMARY KEY (`id`)
                )";
                break;
            case 2:
                $tmpTable = $GLOBALS[ 'db' ] .'.`daily_srcAddrTraffic-' . $GLOBALS[ 'nowStamp' ] .'`';
                $createTmp = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $tmpTable ." (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `srcIp` varchar(16) NOT NULL DEFAULT '',
                    `txBytes` bigint(20) DEFAULT NULL,
                    `rxBytes` bigint(20) DEFAULT NULL,
                    `totalBytes` bigint(20) DEFAULT NULL,
                    `sessions` bigint(20) DEFAULT NULL,
                    PRIMARY KEY (`id`)
                )";
                break;
            case 3:
                $tmpTable = $GLOBALS[ 'db' ] .'.`daily_dstAddrTraffic-' . $GLOBALS[ 'nowStamp' ] .'`';
                $createTmp = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $tmpTable ." (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `dstIp` varchar(16) NOT NULL DEFAULT '',
                    `txBytes` bigint(20) DEFAULT NULL,
                    `rxBytes` bigint(20) DEFAULT NULL,
                    `totalBytes` bigint(20) DEFAULT NULL,
                    `sessions` bigint(20) DEFAULT NULL,
                    PRIMARY KEY (`id`)
                )";
                break;
            case 4:
                $tmpTable = $GLOBALS[ 'db' ] .'.`daily_protoTraffic-' . $GLOBALS[ 'nowStamp' ] .'`';
                $createTmp = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $tmpTable ." (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `protocol` int(11) DEFAULT NULL,
                    `txBytes` bigint(20) DEFAULT NULL,
                    `rxBytes` bigint(20) DEFAULT NULL,
                    `totalBytes` bigint(20) DEFAULT NULL,
                    `sessions` bigint(20) DEFAULT NULL,
                    PRIMARY KEY (`id`)
                )";
                break;
            case 5:
                $tmpTable = $GLOBALS[ 'db' ] .'.`daily_dstPortTraffic-' . $GLOBALS[ 'nowStamp' ] .'`';
                $createTmp = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $tmpTable ." (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `dstPort` int(11) DEFAULT NULL,
                    `txBytes` bigint(20) DEFAULT NULL,
                    `rxBytes` bigint(20) DEFAULT NULL,
                    `totalBytes` bigint(20) DEFAULT NULL,
                    `sessions` bigint(20) DEFAULT NULL,
                    PRIMARY KEY (`id`)
                )";
                break;
            case 6:
                $tmpTable = $GLOBALS[ 'db' ] .'.`daily_zoneTraffic-' . $GLOBALS[ 'nowStamp' ] .'`';
                $createTmp = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $tmpTable ." (
                    `id` int(11) NOT NULL AUTO_INCREMENT,
                    `fromZone` varchar(64) NOT NULL DEFAULT '',
                    `toZone` varchar(64) NOT NULL DEFAULT '',
                    `txBytes` bigint(20) DEFAULT NULL,
                    `rxBytes` bigint(20) DEFAULT NULL,
                    `totalBytes` bigint(20) DEFAULT NULL,
                    `sessions` bigint(20) DEFAULT NULL,
                    PRIMARY KEY (`id`)
                )";
                break;
            }

            $state .= ', SUM(sessions) as sessions';
            $hourlyState = $gby .', txBytes, rxBytes, totalBytes, 1 as sessions';
            break;
        case 'file_access':
            $tmpTable = $GLOBALS[ 'db' ] .'.`daily_'. $table .'-'. $GLOBALS[ 'nowStamp' ] .'`';
            $createTmp = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $tmpTable ." (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `extension` varchar(64) NOT NULL DEFAULT '',
                `accessCount` int(11) DEFAULT NULL,
                `date` datetime NOT NULL,
                PRIMARY KEY (`id`)
            )";

            $hourlyState = $gby .', accessCount, datetime as date';
            $dailyState = $gby .', accessCount, date';
            break;
        case 'blocked_host':
            $tmpTable = $GLOBALS[ 'db' ] .'.`daily_'. $table .'-'. $GLOBALS[ 'nowStamp' ] .'`';
            $createTmp = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $tmpTable ." (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `ip` varchar(16) NOT NULL DEFAULT '',
                `virusCount` int(11) DEFAULT NULL,
                `firewallCount` int(11) DEFAULT NULL,
                `date` datetime NOT NULL,
                PRIMARY KEY (`id`)
            )";
            $hourlyState = $gby .', virusCount, firewallCount, datetime as date';
            $dailyState = $gby .', virusCount, firewallCount, date';
            break;
        case 'affected_host':
            $tmpTable = $GLOBALS[ 'db' ] .'.`daily_'. $table .'-'. $GLOBALS[ 'nowStamp' ] .'`';
            $createTmp = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $tmpTable ." (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `ip` varchar(16) NOT NULL DEFAULT '',
                `virusHitCount` int(11) DEFAULT NULL,
                `sigHitCount` int(11) DEFAULT NULL,
                `date` datetime NOT NULL,
                PRIMARY KEY (`id`)
            )";
            $hourlyState = $gby .', virusHitCount, sigHitCount, datetime as date';
            $dailyState = $gby .', virusHitCount, sigHitcount, date';
            break;
        case 'antivirus':
            $tmpTable = $GLOBALS[ 'db' ] .'.`daily_'. $table .'-'. $GLOBALS[ 'nowStamp' ] .'`';
            $createTmp = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $tmpTable ." (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `srcIp` varchar(16) NOT NULL DEFAULT '',
                `dstIp` varchar(16) NOT NULL DEFAULT '',
                `protocol` varchar(32) NOT NULL DEFAULT '',
                `virusName` varchar(64) NOT NULL DEFAULT '',
                `date` datetime NOT NULL,
                `hitCount` int(11) DEFAULT NULL,
                PRIMARY KEY (`id`)
            )";
            $hourlyState = 'srcIp, dstIp, protocol, virusName, datetime as date, 1 as hitCount';
            $dailyState  = 'srcIp, dstIp, protocol, virusName, date, hitCount';
            break;
        }

        // create temp
        $GLOBALS[ 'mysqli' ]->query( $createTmp );

        // calculate range
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );

            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_'. $table .'_'. sprintf( "%02d", $i ) .'`' );
            }
        } else {
            for ( $i=0; $i<=$days; $i++ )
            {
                switch( $i )
                {
                case 0:
                    $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );
                    $dbStamp = $GLOBALS[ 'edStamp' ];

                    for ( $j=$_GET[ 'eh' ]; $j>=0; $j-- )
                    {
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_'. $table .'_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                case $days:
                    // start date
                    // sessions have no daily, others should get from hourly if sh !=0, use hourly for all

                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );

                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_'. $table .'_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                default:
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    if ( 'sessions' == $table ) {
                        // check if daily statistics are data_reday
                        if ( $check = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "daily_'. $table .'" AND TABLE_COMMENT = "data_ready" ' ) ) {
                            if ( 0 == $check->num_rows ) {
                                // 24 hours
                                for ($j=0; $j<24; $j++)
                                {
                                    $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_'. $table .'_'. sprintf( "%02d", $j ) .'`' );
                                }
                            } else {
                                $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`daily_'. $table .'`' );
                
                            }
                            $check->close();
                        }
                    } else {
                        // use daily
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $dailyState .' FROM '. $db .'.`daily_'. $table .'`' );
                    }
                }
            }
        }

        // limit 50 back, filter via reporter
        $query = "SELECT ". $state ." FROM ". $tmpTable ." GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50"; 

        $cnt = 0;
        if ( $result = $GLOBALS[ 'mysqli' ]->query( $query ) ) {
            while ( $obj = $result->fetch_object() ) {
                $cnt++;
                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
            }
            // free result set
            $result->close();
        }
        $GLOBALS[ 'json' ][ 'queryRows' ] = $cnt;
        echo json_encode( $GLOBALS[ 'json' ] );
    } else {
        // weird, given current hour's aggregate instead
        aggregateQuery( "raw_". $table, $gby, $state, $oby );
    }
}

function aggregateQuery( $table, $gby, $state, $oby ) {
    if ( $result = $GLOBALS[ 'mysqli' ]->query( "SELECT ". $state .", count(*) as sessions FROM ". $GLOBALS[ 'db' ] .".`". $table ."_". $GLOBALS[ 'nh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50" ) ) {
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
    $GLOBALS[ 'json' ][ 'queryRows' ] = 0;

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );
    
            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $GLOBALS[ 'json' ][ 'queryRows' ] += queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_'. $table .'_'. sprintf( "%02d", $i ) .'"' ) ;
                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_'. $table .'_'. sprintf("%02d", $i) .'` ORDER BY id DESC' ) ) {
                        while ( $obj = $result->fetch_object() ) {
                            // rows we want
                            $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                            $GLOBALS[ 'rows' ][ 'left' ]--;

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
                    $dbStamp = $GLOBALS[ 'edStamp' ];
    
                    for ( $j=$_GET[ 'eh' ]; $j>=0; $j-- )
                    {
                        $GLOBALS[ 'json' ][ 'queryRows' ] += queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_'. $table .'_'. sprintf( "%02d", $j ) .'"' ) ;
                        if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                            if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_'. $table .'_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                while ( $obj = $result->fetch_object() ) {
                                    // rows we want
                                    $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                    $GLOBALS[ 'rows' ][ 'left' ]--;
        
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
                        $GLOBALS[ 'json' ][ 'queryRows' ] += queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_'. $table .'_'. sprintf( "%02d", $j ) .'"' );
                        if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                            if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_'. $table .'_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                while ( $obj = $result->fetch_object() ) {
                                    // rows we want
                                    $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                    $GLOBALS[ 'rows' ][ 'left' ]--;
        
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
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    if ( 'sessions' == $table ) {
                        // no daily
                        for ( $j=23; $j>=0; $j-- )
                        {
                            $GLOBALS[ 'json' ][ 'queryRows' ] += queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_'. $table .'_'. sprintf( "%02d", $j ) .'"' );
                            if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_'. $table .'_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                    while ( $obj = $result->fetch_object() ) {
                                        // rows we want
                                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                        $GLOBALS[ 'rows' ][ 'left' ]--;
            
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
                        $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                        $GLOBALS[ 'json' ][ 'queryRows' ] += queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "daily_'. $table .'"' ) ;
                        if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                            for ( $j=23; $j>=0; $j-- )
                            {
                                $cnt += queryRows( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_'. $table .'_'. sprintf( "%02d", $j ) .'"' ) ;
                                if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_'. $table .'_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            // rows we want
                                            $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                            $GLOBALS[ 'rows' ][ 'left' ]--;

                                            if ( 0 == $GLOBALS[ 'rows' ][ 'left'] ) {
                                                break;
                                            }
                                        }
                                        // free result set
                                        $result->close();
                                    }
                                }
                            }
                        }
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
