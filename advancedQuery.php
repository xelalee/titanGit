<?php

// get device time
$nd = trim( shell_exec( 'date "+%Y-%m-%d"' ) );
$nh = trim( shell_exec( 'date "+%H"' ) );
$nw = trim( shell_exec( 'date "+%w"' ) );
$ndStamp = trim( shell_exec( 'date -d "'. $nd .' 00:00:00" +%s' ) );
$nhStamp = trim( shell_exec( 'date -d "'. $nd .' '. $nh .':00:00" +%s' ) );
$nowStamp = trim( shell_exec( 'date "+%s"' ) );

$db      = str_replace("-", "_", $nd);
$mysqli  = new mysqli( "127.0.0.1", "archer", "rehcra", "archer", 3306 );
$json    = array();
$rows    = array();
$json[ 'queryResults' ] = [];
$json[ 'queryRows' ] = 0;

if ('weekly' == $argv[ 1 ]) {
    weeklyAAV();
} elseif ( empty( $_GET ) ) {
    die( 'please make sure what u want !?' );
}

if ($_GET[ 'ed' ]) {
    $ed = date( str_replace("/", "-", $_GET[ 'ed' ] ) );
    $edStamp = strtotime( $ed .' 00:00:00');
    $eh = sprintf("%02d", $_GET[ 'eh' ]);
    $ehStamp = $edStamp + ( $_GET[ 'eh' ] * 3600 );
} else {
    $sd = $nd;
    $sdStamp = $ndStamp;
    $sh = $nh;
    $shStamp = $nhStamp;
}

if ($_GET[ 'sd' ]) {
    $sd = date( str_replace("/", "-", $_GET[ 'sd' ] ) );
    $sdStamp = strtotime( $sd .' 00:00:00');
    $sh = sprintf("%02d", $_GET[ 'sh' ]);
    $shStamp = $sdStamp + ( $_GET[ 'sh' ] * 3600 );
} else {
    $sd = $nd;
    $sdStamp = $ndStamp;
    $sh = $nh;
    $shStamp = $nhStamp;
}

// switch function via param
// connect archer first

switch( $_GET[ 'param' ] )
{
// report
case 'traffic_direction':
    switch( $_GET[ 'q' ] )
    {
    case 1:
        advATD( 'srcIp, dstIp', 'totalBytes', 'CONCAT_WS("-", srcIp, dstIp) as address, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes' );
        break;
    case 2:
        advATD( 'srcIp', 'totalBytes', 'srcIp, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes' );
        break;
    case 3:
        advATD( 'dstIp', 'totalBytes', 'dstIp, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes' );
        break;
    case 4:
        advATD( 'protocol', 'totalBytes', 'protocol, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes' );
        break;
    case 5:
        advATD( 'dstPort', 'totalBytes', 'dstPort, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes' );
        break;
    case 6:
        advATD( 'fromZone, toZone', 'totalBytes', 'CONCAT_WS("-", fromZone, toZone) as zone, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes' );
        break;
    default:
        advQTD();
    }
    break;
case 'file_extension':
    switch( $_GET[ 'q' ] )
    {
    case 1:
        advAFE( "file_access", 'extension', 'accessCount', 'extension, SUM( accessCount ) as accessCount');
        break;
    default:
        advQFE();
    }
    break;
case 'blocked_host':
    switch( $_GET[ 'q' ] )
    {
    case 1:
        advABH( "blocked_host", 'ip', 'firewallCount', 'ip, SUM( virusCount ) as virusCount, SUM( firewallCount ) as firewallCount');
        break;
    default:
        advQBH();
    }
    break;
case 'affected_host':
    switch( $_GET[ 'q' ] )
    {
    case 1:
        advAAH( "affected_host", 'ip', 'sigHitCount', 'ip, SUM( virusHitCount ) as virusHitCount, SUM( sigHitCount ) as sigHitCount');
        break;
    default:
        advQAH();
    }
    break;
case 'antivirus_report':
    switch( $_GET[ 'q' ])
    {
    case 1:
        advAAV( "antivirus", 'srcIp', 'hitCount', 'srcIp, SUM( hitCount ) as hitCount');
        break;
    case 2:
        advAAV( "antivirus", 'dstIp', 'hitCount', 'dstIp, SUM( hitCount ) as hitCount');
        break;
    case 3:
        advAAV( "antivirus", 'virusName', 'hitCount', 'virusName, SUM( hitCount ) as hitCount');
        break;
    case 4:
        advAAV( "antivirus", 'protocol', 'hitCount', 'protocol, SUM( hitCount ) as hitCount');
        break;
    case 9:
        weeklyAAV();
        break;
    default:
        advQAV();
    }
    break;
}

function advATD( $gby, $oby, $state ) {

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
        $daily = 'daily_addrTraffic';
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
        $daily = 'daily_srcAddrTraffic';
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
        $daily = 'daily_dstAddrTraffic';
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
        $gby = 'protocol';
        $daily = 'daily_protoTraffic';
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
        $daily = 'daily_dstPortTraffic';
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
        $daily = "daily_zoneTraffic";
        break;
    }

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        // create temp
        $GLOBALS[ 'mysqli' ]->query( $createTmp );

        $hourlyState = $gby .', txBytes, rxBytes, totalBytes, 1 as sessions';
        $dailyState = $gby .', txBytes, rxBytes, totalBytes, sessions';
        // calculate range
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );

            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_sessions_'. sprintf( "%02d", $i ) .'`' );
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
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_sessions_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                case $days:
                    // start date
                    // sessions have no daily, others should get from hourly if sh !=0, use hourly for all

                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );

                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_sessions_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                default:
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    // check if daily statistics are data_reday
                    if ( $check = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "'. $daily .'" AND TABLE_COMMENT = "data_ready" ' ) ) {
                        if ( 0 == $check->num_rows ) {
                            // 24 hours
                            for ($j=23; $j>=0; $j--)
                            {
                                $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_sessions_'. sprintf( "%02d", $j ) .'`' );
                            }
                        } else {
                            $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $dailyState .' FROM '. $db .'.`'. $daily .'`' );

                        }
                        $check->close();
                    }
                }
            }
        }

        // limit 50 back, filter via reporter
        $query = "SELECT ". $state .", SUM( sessions ) as sessions FROM ". $tmpTable ." GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";
    } elseif ( $GLOBALS[ 'ehStamp' ] == $GLOBALS[ 'shStamp' ] ) {
        $query = "SELECT ". $state .", count(*) as sessions FROM ". $GLOBALS[ 'db' ] .".`raw_sessions_". $GLOBALS[ 'eh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";
    } else {
        // weird, given current hour's aggregate instead
        $query = "SELECT ". $state .", count(*) as sessions FROM ". $GLOBALS[ 'db' ] .".`raw_sessions_". $GLOBALS[ 'nh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";
    }

    if ( $result = $GLOBALS[ 'mysqli' ]->query( $query ) ) {
        $GLOBALS[ 'json' ][ "queryRows" ]  = $result->num_rows;
        while ( $obj = $result->fetch_object() ) {
            $GLOBALS[ 'json' ]['queryResults'][] = $obj;
        }
        // free result set
        $result->close();
    }

    echo json_encode( $GLOBALS[ 'json' ] );
}

function advQTD() {
    $GLOBALS[ 'rows' ][ 'start' ] = empty( $_GET[ 'pi' ] )? 0 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'end' ]   = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'left' ]  = empty( $_GET[ 'pp' ] )? 20 : (int) $_GET[ 'pp' ];
    $cnt   = 0;
    $cnts  = 0;
    $cnted = 0;
    $days  = 0;

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );

            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_sessions_'. sprintf( "%02d", $i ) .'"' ) ) {
                    $cnted = $count->fetch_row()[ 0 ];
                    if ( $cnted > 0 ) {
                        $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                        if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                            if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_sessions_'. sprintf("%02d", $i) .'` ORDER BY id DESC' ) ) {
                                while ( $obj = $result->fetch_object() ) {
                                    $cnt++;
                                    // rows we want
                                    if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                        $GLOBALS[ 'rows' ][ 'left' ]--;
                                    }

                                    if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
                                        break;
                                    }
                                }
                                // free result set
                                $result->close();
                            }
                        }
                    }
                    // free count set
                    $count->close();
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
                        $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_sessions_'. sprintf( "%02d", $j ) .'"' ) ) {
                            $cnted = $count->fetch_row()[ 0 ];
                            if ( $cnted > 0 ) {
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_sessions_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            $cnt++;
                                            // rows we want
                                            if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                $GLOBALS[ 'rows' ][ 'left' ]--;
                                            }
                                        }
                                        // free result set
                                        $result->close();
                                    }
                                }
                            }
                            // free count set
                            $count->close();
                        }
                    }
                    break;
                case $days:
                    // start date
                    // sessions have no daily, others should get from hourly if sh !=0, use hourly for all

                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );

                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $cnt = $GLOBLAS[ 'json' ][ 'queryRows' ];
                        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_sessions_'. sprintf( "%02d", $j ) .'"' ) ) {
                            $cnted = $count->fetch_row()[ 0 ];
                            if ( $cnted > 0 ) {
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_sessions_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            $cnt++;
                                            // rows we want
                                            if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                $GLOBALS[ 'rows' ][ 'left' ]--;
                                            }

                                            if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
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
                    break;
                default:
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    for ( $j=23; $j>=0; $j-- )
                    {
                        $cnt = $GLOBLAS[ 'json' ][ 'queryRows' ];
                        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_sessions_'. sprintf( "%02d", $j ) .'"' ) ) {
                            $cnted = $count->fetch_row()[ 0 ];
                            if ( $cnted > 0 ) {
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_sessions_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            $cnt++;
                                            // rows we want
                                            if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                $GLOBALS[ 'rows' ][ 'left' ]--;
                                            }

                                            if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
                                                break;
                                            }
                                        }
                                        // free result set
                                        $result->close();
                                    }
                                }
                            }
                            // free count set
                            $count->close();
                        }
                    }
                }
            }
        }
    } elseif ( $GLOBALS[ 'ehStamp' ] == $GLOBALS[ 'shStamp' ] ) {
        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $GLOBALS[ 'db' ] .'" AND TABLE_NAME = "raw_sessions_'. $GLOBALS[ 'eh' ] .'"' ) ) {
            $GLOBALS[ 'json' ][ 'queryRows' ] = $count->fetch_row()[ 0 ];
            if ( $GLOBALS[ 'json' ][ 'queryRows' ] > 0 ) {
                if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_sessions_'. $GLOBALS[ 'eh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ] ) ) {
                    while ( $obj = $result->fetch_object() ) {
                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                    }
                    // free result set
                    $result->close();
                }
            }
            // free result set
            $count->close();
        }
    } else {
        // weird, given current hour's report instead
        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $GLOBALS[ 'db' ] .'" AND TABLE_NAME = "raw_sessions_'. $GLOBALS[ 'nh' ] .'"' ) ) {
            $GLOBALS[ 'json' ][ 'queryRows' ] = $count->fetch_row()[ 0 ];
            if ( $GLOBALS[ 'json' ][ 'queryRows' ] > 0 ) {
                if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_sessions_'. $GLOBALS[ 'nh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ] ) ) {
                    while ( $obj = $result->fetch_object() ) {
                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                    }
                    // free result set
                    $result->close();
                }
            }
            // free result set
            $count->close();
        }
    }
    echo json_encode( $GLOBALS[ 'json' ] );
}

function advAFE( $table, $gby, $oby, $state ) {

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        // prepare temp table
        $tmpTable = $GLOBALS[ 'db' ] .'.`daily_file_access-'. $GLOBALS[ 'nowStamp' ] .'`';
        $createTmp = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $tmpTable ." (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `extension` varchar(64) NOT NULL DEFAULT '',
            `accessCount` int(11) DEFAULT NULL,
            `date` datetime NOT NULL,
            PRIMARY KEY (`id`)
        )";

        $hourlyState = $gby .', accessCount, datetime as date';
        $dailyState = $gby .', accessCount, date';
        // create temp
        $GLOBALS[ 'mysqli' ]->query( $createTmp );

        // calculate range
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );

            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_file_access_'. sprintf( "%02d", $i ) .'`' );
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
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_file_access_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                case $days:
                    // start date

                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );

                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_file_access_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                default:
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    if ( 'sessions' == $table ) {
                        // check if daily statistics are data_reday
                        if ( $check = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "daily_file_access"' ) ) {
                            if ( 0 == $check->num_rows ) {
                                // 24 hours
                                for ($j=23; $j>=0; $j--)
                                {
                                    $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_file_access_'. sprintf( "%02d", $j ) .'`' );
                                }
                            } else {
                                $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`daily_file_access`' );

                            }
                            $check->close();
                        }
                    } else {
                        // use daily
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $dailyState .' FROM '. $db .'.`daily_file_access`' );
                    }
                }
            }
        }

        // limit 50 back, filter via reporter
        $query = "SELECT ". $state ." FROM ". $tmpTable ." GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";

    } elseif ( $GLOBALS[ 'ehStamp' ] == $GLOBALS[ 'shStamp' ] ) {
        $query = "SELECT ". $state ." FROM ". $GLOBALS[ 'db' ] .".`raw_file_access_". $GLOBALS[ 'eh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";
    } else {
        // weird, given current hour's aggregate instead
        $query = "SELECT ". $state ." FROM ". $GLOBALS[ 'db' ] .".`raw_file_access_". $GLOBALS[ 'nh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";
    }

    if ( $result = $GLOBALS[ 'mysqli' ]->query( $query ) ) {
        $GLOBALS[ 'json' ][ "queryRows" ]  = $result->num_rows;
        while ( $obj = $result->fetch_object() ) {
            $GLOBALS[ 'json' ]['queryResults'][] = $obj;
        }
        // free result set
        $result->close();
    }

    echo json_encode( $GLOBALS[ 'json' ] );

}

function advQFE() {
    $GLOBALS[ 'rows' ][ 'start' ] = empty( $_GET[ 'pi' ] )? 0 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'end' ]   = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'left' ]  = empty( $_GET[ 'pp' ] )? 20 : (int) $_GET[ 'pp' ];
    $cnt   = 0;
    $cnts  = 0;
    $cnted = 0;
    $days  = 0;

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );

            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_file_access_'. sprintf( "%02d", $i ) .'"' ) ) {
                    $cnted = $count->fetch_row()[ 0 ];
                    if ( $cnted > 0 ) {
                        $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                        if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                            if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_file_access_'. sprintf("%02d", $i) .'` ORDER BY id DESC' ) ) {
                                while ( $obj = $result->fetch_object() ) {
                                    $cnt++;
                                    // rows we want
                                    if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                        $GLOBALS[ 'rows' ][ 'left' ]--;
                                    }

                                    if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
                                        break;
                                    }
                                }
                                // free result set
                                $result->close();
                            }
                        }
                    }
                    // free count set
                    $count->close();
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
                        $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_file_access_'. sprintf( "%02d", $j ) .'"' ) ) {
                            $cnted = $count->fetch_row()[ 0 ];
                            if ( $cnted > 0 ) {
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_file_access_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            $cnt++;
                                            // rows we want
                                            if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                $GLOBALS[ 'rows' ][ 'left' ]--;
                                            }
                                        }
                                        // free result set
                                        $result->close();
                                    }
                                }
                            }
                            // free count set
                            $count->close();
                        }
                    }
                    break;
                case $days:
                    // start date

                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );

                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $cnt = $GLOBLAS[ 'json' ][ 'queryRows' ];
                        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_file_access_'. sprintf( "%02d", $j ) .'"' ) ) {
                            $cnted = $count->fetch_row()[ 0 ];
                            if ( $cnted > 0 ) {
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_file_access_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            $cnt++;
                                            // rows we want
                                            if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                $GLOBALS[ 'rows' ][ 'left' ]--;
                                            }

                                            if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
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
                    break;
                default:
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    // use daily statistics
                    if ( $check = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "daily_file_access"' ) ) {
                        $chk = $check->fetch_row()[ 0 ];
                        if ( $chk > 0 ) {
                            $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                            // have data, get and count from daily statistics
                            if ($count = $GLOBALS[ 'mysqli' ]->query( 'SELECT SUM( accessCount ) FROM '. $db .'.`daily_file_access`' ) ) {
                                $cnted = $count->fetch_row()[ 0 ];
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    for ($j=23; $j>=0; $j--)
                                    {
                                        if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_file_access_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                            while ( $obj = $result->fetch_object() ) {
                                                $cnt++;
                                                // rows we want
                                                if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                    $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                    $GLOBALS[ 'rows' ][ 'left' ]--;
                                                }

                                                if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
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
                        // free check set
                        $check->close();
                    }
                }
            }
        }
    } elseif ( $GLOBALS[ 'ehStamp' ] == $GLOBALS[ 'shStamp' ] ) {
        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $GLOBALS[ 'db' ] .'" AND TABLE_NAME = "raw_file_access_'. $GLOBALS[ 'eh' ] .'"' ) ) {
            $GLOBALS[ 'json' ][ 'queryRows' ] = $count->fetch_row()[ 0 ];
            if ( $GLOBALS[ 'json' ][ 'queryRows' ] > 0 ) {
                if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_file_access_'. $GLOBALS[ 'eh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ] ) ) {
                    while ( $obj = $result->fetch_object() ) {
                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                    }
                    // free result set
                    $result->close();
                }
            }
            // free result set
            $count->close();
        }
    } else {
        // weird, given current hour's report instead
        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $GLOBALS[ 'db' ] .'" AND TABLE_NAME = "raw_file_access_'. $GLOBALS[ 'nh' ] .'"' ) ) {
            $GLOBALS[ 'json' ][ 'queryRows' ] = $count->fetch_row()[ 0 ];
            if ( $GLOBALS[ 'json' ][ 'queryRows' ] > 0 ) {
                if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_file_access_'. $GLOBALS[ 'nh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ] ) ) {
                    while ( $obj = $result->fetch_object() ) {
                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                    }
                    // free result set
                    $result->close();
                }
            }
            // free result set
            $count->close();
        }
    }
    echo json_encode( $GLOBALS[ 'json' ] );
}

function advABH( $table, $gby, $oby, $state ) {

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        // prepare temp table
        $tmpTable = $GLOBALS[ 'db' ] .'.`daily_file_access-'. $GLOBALS[ 'nowStamp' ] .'`';
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
        // create temp
        $GLOBALS[ 'mysqli' ]->query( $createTmp );

        // calculate range
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );

            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_blocked_host_'. sprintf( "%02d", $i ) .'`' );
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
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_blocked_host_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                case $days:
                    // start date
                    // sessions have no daily, others should get from hourly if sh !=0, use hourly for all

                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );

                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_blocked_host_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                default:
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    // use daily
                    $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $dailyState .' FROM '. $db .'.`daily_blocked_host`' );
                }
            }
        }

        // limit 50 back, filter via reporter
        $query = "SELECT ". $state ." FROM ". $tmpTable ." GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";
    } elseif ( $GLOBALS[ 'ehStamp' ] == $GLOBALS[ 'shStamp' ] ) {
        $query = "SELECT ". $state ." FROM ". $GLOBALS[ 'db' ] .".`raw_blocked_host_". $GLOBALS[ 'eh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";

    } else {
        // weird, given current hour's aggregate instead
        $query = "SELECT ". $state ." FROM ". $GLOBALS[ 'db' ] .".`raw_blocked_host_". $GLOBALS[ 'nh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";
    }

    if ( $result = $GLOBALS[ 'mysqli' ]->query( $query ) ) {
        $GLOBALS[ 'json' ][ "queryRows" ]  = $result->num_rows;
        while ( $obj = $result->fetch_object() ) {
            $GLOBALS[ 'json' ]['queryResults'][] = $obj;
        }
        // free result set
        $result->close();
    }

    echo json_encode( $GLOBALS[ 'json' ] );
}

function advQBH() {
    $GLOBALS[ 'rows' ][ 'start' ] = empty( $_GET[ 'pi' ] )? 0 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'end' ]   = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'left' ]  = empty( $_GET[ 'pp' ] )? 20 : (int) $_GET[ 'pp' ];
    $cnt   = 0;
    $cnts  = 0;
    $cnted = 0;
    $days  = 0;

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );

            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_blocked_host_'. sprintf( "%02d", $i ) .'"' ) ) {
                    $cnted = $count->fetch_row()[ 0 ];
                    if ( $cnted > 0 ) {
                        $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                        if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                            if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_blocked_host_'. sprintf("%02d", $i) .'` ORDER BY id DESC' ) ) {
                                while ( $obj = $result->fetch_object() ) {
                                    $cnt++;
                                    // rows we want
                                    if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                        $GLOBALS[ 'rows' ][ 'left' ]--;
                                    }

                                    if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
                                        break;
                                    }
                                }
                                // free result set
                                $result->close();
                            }
                        }
                    }
                    // free count set
                    $count->close();
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
                        $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_blocked_host_'. sprintf( "%02d", $j ) .'"' ) ) {
                            $cnted = $count->fetch_row()[ 0 ];
                            if ( $cnted > 0 ) {
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_blocked_host_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            $cnt++;
                                            // rows we want
                                            if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                $GLOBALS[ 'rows' ][ 'left' ]--;
                                            }
                                        }
                                        // free result set
                                        $result->close();
                                    }
                                }
                            }
                            // free count set
                            $count->close();
                        }
                    }
                    break;
                case $days:
                    // start date

                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );

                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $cnt = $GLOBLAS[ 'json' ][ 'queryRows' ];
                        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_blocked_host_'. sprintf( "%02d", $j ) .'"' ) ) {
                            $cnted = $count->fetch_row()[ 0 ];
                            if ( $cnted > 0 ) {
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_blocked_host_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            $cnt++;
                                            // rows we want
                                            if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                $GLOBALS[ 'rows' ][ 'left' ]--;
                                            }

                                            if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
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
                    break;
                default:
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    // use daily statistics
                    if ( $check = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "daily_blocked_host"' ) ) {
                        $chk = $check->fetch_row()[ 0 ];
                        if ( $chk > 0 ) {
                            $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                            // have data, get and count from daily statistics
                            if ($count = $GLOBALS[ 'mysqli' ]->query( 'SELECT SUM( virusCount ) + SUM( firewallCount ) FROM '. $db .'.`daily_blocked_host`' ) ) {
                                $cnted = $count->fetch_row()[ 0 ];
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    for ($j=23; $j>=0; $j--)
                                    {
                                        if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_blocked_host_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                            while ( $obj = $result->fetch_object() ) {
                                                $cnt++;
                                                // rows we want
                                                if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                    $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                    $GLOBALS[ 'rows' ][ 'left' ]--;
                                                }

                                                if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
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
                        // free check set
                        $check->close();
                    }
                }
            }
        }
    } elseif ( $GLOBALS[ 'ehStamp' ] == $GLOBALS[ 'shStamp' ] ) {
        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $GLOBALS[ 'db' ] .'" AND TABLE_NAME = "raw_blocked_host_'. $GLOBALS[ 'eh' ] .'"' ) ) {
            $GLOBALS[ 'json' ][ 'queryRows' ] = $count->fetch_row()[ 0 ];
            if ( $GLOBALS[ 'json' ][ 'queryRows' ] > 0 ) {
                if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_blocked_host_'. $GLOBALS[ 'eh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ] ) ) {
                    while ( $obj = $result->fetch_object() ) {
                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                    }
                    // free result set
                    $result->close();
                }
            }
            // free result set
            $count->close();
        }
    } else {
        // weird, given current hour's report instead
        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $GLOBALS[ 'db' ] .'" AND TABLE_NAME = "raw_blocked_host_'. $GLOBALS[ 'nh' ] .'"' ) ) {
            $GLOBALS[ 'json' ][ 'queryRows' ] = $count->fetch_row()[ 0 ];
            if ( $GLOBALS[ 'json' ][ 'queryRows' ] > 0 ) {
                if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_blocked_host_'. $GLOBALS[ 'nh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ] ) ) {
                    while ( $obj = $result->fetch_object() ) {
                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                    }
                    // free result set
                    $result->close();
                }
            }
            // free result set
            $count->close();
        }
    }
    echo json_encode( $GLOBALS[ 'json' ] );
}

function advAAH( $table, $gby, $oby, $state ) {

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        // prepare temp table
        $tmpTable = $GLOBALS[ 'db' ] .'.`daily_afftected_host-'. $GLOBALS[ 'nowStamp' ] .'`';
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
        // create temp
        $GLOBALS[ 'mysqli' ]->query( $createTmp );

        // calculate range
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );

            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_afftected_host_'. sprintf( "%02d", $i ) .'`' );
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
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_afftected_host_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                case $days:
                    // start date
                    // sessions have no daily, others should get from hourly if sh !=0, use hourly for all

                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );

                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_afftected_host_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                default:
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    if ( 'sessions' == $table ) {
                        // check if daily statistics are data_reday
                        if ( $check = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "daily_afftected_host"' ) ) {
                            if ( 0 == $check->num_rows ) {
                                // 24 hours
                                for ($j=23; $j>=0; $j--)
                                {
                                    $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_afftected_host_'. sprintf( "%02d", $j ) .'`' );
                                }
                            } else {
                                $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`daily_afftected_host`' );

                            }
                            $check->close();
                        }
                    } else {
                        // use daily
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $dailyState .' FROM '. $db .'.`daily_afftected_host`' );
                    }
                }
            }
        }

        // limit 50 back, filter via reporter
        $query = "SELECT ". $state ." FROM ". $tmpTable ." GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";
    } elseif ( $GLOBALS[ 'ehStamp' ] == $GLOBALS[ 'shStamp' ] ) {
        $query = "SELECT ". $state ." FROM ". $GLOBALS[ 'db' ] .".`raw_afftected_host_". $GLOBALS[ 'eh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";

    } else {
        // weird, given current hour's aggregate instead
        $query = "SELECT ". $state ." FROM ". $GLOBALS[ 'db' ] .".`raw_afftected_host_". $GLOBALS[ 'nh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";
    }

    if ( $result = $GLOBALS[ 'mysqli' ]->query( $query ) ) {
        $GLOBALS[ 'json' ][ "queryRows" ]  = $result->num_rows;
        while ( $obj = $result->fetch_object() ) {
            $GLOBALS[ 'json' ]['queryResults'][] = $obj;
        }
        // free result set
        $result->close();
    }

    echo json_encode( $GLOBALS[ 'json' ] );
}

function advQAH() {
    $GLOBALS[ 'rows' ][ 'start' ] = empty( $_GET[ 'pi' ] )? 0 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'end' ]   = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'left' ]  = empty( $_GET[ 'pp' ] )? 20 : (int) $_GET[ 'pp' ];
    $cnt   = 0;
    $cnts  = 0;
    $cnted = 0;
    $days  = 0;

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );

            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_afftected_host_'. sprintf( "%02d", $i ) .'"' ) ) {
                    $cnted = $count->fetch_row()[ 0 ];
                    if ( $cnted > 0 ) {
                        $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                        if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                            if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_afftected_host_'. sprintf("%02d", $i) .'` ORDER BY id DESC' ) ) {
                                while ( $obj = $result->fetch_object() ) {
                                    $cnt++;
                                    // rows we want
                                    if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                        $GLOBALS[ 'rows' ][ 'left' ]--;
                                    }

                                    if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
                                        break;
                                    }
                                }
                                // free result set
                                $result->close();
                            }
                        }
                    }
                    // free count set
                    $count->close();
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
                        $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_afftected_host_'. sprintf( "%02d", $j ) .'"' ) ) {
                            $cnted = $count->fetch_row()[ 0 ];
                            if ( $cnted > 0 ) {
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_afftected_host_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            $cnt++;
                                            // rows we want
                                            if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                $GLOBALS[ 'rows' ][ 'left' ]--;
                                            }
                                        }
                                        // free result set
                                        $result->close();
                                    }
                                }
                            }
                            // free count set
                            $count->close();
                        }
                    }
                    break;
                case $days:
                    // start date

                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );

                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $cnt = $GLOBLAS[ 'json' ][ 'queryRows' ];
                        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_afftected_host_'. sprintf( "%02d", $j ) .'"' ) ) {
                            $cnted = $count->fetch_row()[ 0 ];
                            if ( $cnted > 0 ) {
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_afftected_host_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            $cnt++;
                                            // rows we want
                                            if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                $GLOBALS[ 'rows' ][ 'left' ]--;
                                            }

                                            if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
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
                    break;
                default:
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    // use daily statistics
                    if ( $check = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "daily_afftected_host"' ) ) {
                        $chk = $check->fetch_row()[ 0 ];
                        if ( $chk > 0 ) {
                            $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                            // have data, get and count from daily statistics
                            if ($count = $GLOBALS[ 'mysqli' ]->query( 'SELECT SUM( virusHitCount ) + SUM( sigHitCount ) FROM '. $db .'.`daily_afftected_host`' ) ) {
                                $cnted = $count->fetch_row()[ 0 ];
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    for ($j=23; $j>=0; $j--)
                                    {
                                        if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_afftected_host_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                            while ( $obj = $result->fetch_object() ) {
                                                $cnt++;
                                                // rows we want
                                                if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                    $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                    $GLOBALS[ 'rows' ][ 'left' ]--;
                                                }

                                                if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
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
                        // free check set
                        $check->close();
                    }
                }
            }
        }
    } elseif ( $GLOBALS[ 'ehStamp' ] == $GLOBALS[ 'shStamp' ] ) {
        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $GLOBALS[ 'db' ] .'" AND TABLE_NAME = "raw_afftected_host_'. $GLOBALS[ 'eh' ] .'"' ) ) {
            $GLOBALS[ 'json' ][ 'queryRows' ] = $count->fetch_row()[ 0 ];
            if ( $GLOBALS[ 'json' ][ 'queryRows' ] > 0 ) {
                if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_afftected_host_'. $GLOBALS[ 'eh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ] ) ) {
                    while ( $obj = $result->fetch_object() ) {
                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                    }
                    // free result set
                    $result->close();
                }
            }
            // free result set
            $count->close();
        }
    } else {
        // weird, given current hour's report instead
        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $GLOBALS[ 'db' ] .'" AND TABLE_NAME = "raw_afftected_host_'. $GLOBALS[ 'nh' ] .'"' ) ) {
            $GLOBALS[ 'json' ][ 'queryRows' ] = $count->fetch_row()[ 0 ];
            if ( $GLOBALS[ 'json' ][ 'queryRows' ] > 0 ) {
                if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_afftected_host_'. $GLOBALS[ 'nh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ] ) ) {
                    while ( $obj = $result->fetch_object() ) {
                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                    }
                    // free result set
                    $result->close();
                }
            }
            // free result set
            $count->close();
        }
    }
    echo json_encode( $GLOBALS[ 'json' ] );
}

function advAAV( $table, $gby, $oby, $state ) {
    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        // prepare temp table
        $tmpTable = $GLOBALS[ 'db' ] .'.`daily_antivirus-'. $GLOBALS[ 'nowStamp' ] .'`';
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
        // create temp
        $GLOBALS[ 'mysqli' ]->query( $createTmp );

        // calculate range
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );

            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_antivirus_'. sprintf( "%02d", $i ) .'`' );
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
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_antivirus_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                case $days:
                    // start date
                    // sessions have no daily, others should get from hourly if sh !=0, use hourly for all

                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );

                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_antivirus_'. sprintf( "%02d", $j ) .'`' );
                    }
                    break;
                default:
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    if ( 'sessions' == $table ) {
                        // check if daily statistics are data_reday
                        if ( $check = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "daily_antivirus"' ) ) {
                            if ( 0 == $check->num_rows ) {
                                // 24 hours
                                for ($j=23; $j>=0; $j--)
                                {
                                    $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`raw_antivirus_'. sprintf( "%02d", $j ) .'`' );
                                }
                            } else {
                                $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $hourlyState .' FROM '. $db .'.`daily_antivirus`' );

                            }
                            $check->close();
                        }
                    } else {
                        // use daily
                        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $dailyState .' FROM '. $db .'.`daily_antivirus`' );
                    }
                }
            }
        }

        // limit 50 back, filter via reporter
        $query = "SELECT ". $state ." FROM ". $tmpTable ." GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";

    } elseif ( $GLOBALS[ 'ehStamp' ] == $GLOBALS[ 'shStamp' ] ) {
        $query = "SELECT id, srcIp, dstIp, protocol, virusName, count(*) as hitCount FROM ". $GLOBALS[ 'db' ] .".`raw_antivirus_". $GLOBALS[ 'eh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";
    } else {
        // weird, given current hour's aggregate instead
        $query = "SELECT id, srcIp, dstIp, protocol, virusName, count(*) as hitCount FROM ". $GLOBALS[ 'db' ] .".`raw_antivirus_". $GLOBALS[ 'nh' ] ."` GROUP BY ". $gby ." ORDER BY ". $oby ." DESC LIMIT 50";
    }

    if ( $result = $GLOBALS[ 'mysqli' ]->query( $query ) ) {
        $GLOBALS[ 'json' ][ "queryRows" ]  = $result->num_rows;
        while ( $obj = $result->fetch_object() ) {
            $GLOBALS[ 'json' ]['queryResults'][] = $obj;
        }
        // free result set
        $result->close();
    }

    echo json_encode( $GLOBALS[ 'json' ] );
}

function advQAV() {
    $GLOBALS[ 'rows' ][ 'start' ] = empty( $_GET[ 'pi' ] )? 0 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'end' ]   = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $GLOBALS[ 'rows' ][ 'left' ]  = empty( $_GET[ 'pp' ] )? 20 : (int) $_GET[ 'pp' ];
    $cnt   = 0;
    $cnts  = 0;
    $cnted = 0;
    $days  = 0;

    if ( $GLOBALS[ 'ehStamp' ] > $GLOBALS[ 'shStamp' ] ) {
        $days = ( ( $GLOBALS[ 'edStamp' ] - $GLOBALS[ 'sdStamp' ] ) / 86400 );

        if ( 0 == $days ) {
            // single date data, get from eh to sh
            $db = str_replace( "-", "_", $GLOBALS[ 'ed' ] );

            for ( $i=$_GET[ 'eh' ]; $i>=$_GET[ 'sh' ]; $i-- )
            {
                $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_antivirus_'. sprintf( "%02d", $i ) .'"' ) ) {
                    $cnted = $count->fetch_row()[ 0 ];
                    if ( $cnted > 0 ) {
                        $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                        if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                            if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_antivirus_'. sprintf("%02d", $i) .'` ORDER BY id DESC' ) ) {
                                while ( $obj = $result->fetch_object() ) {
                                    $cnt++;
                                    // rows we want
                                    if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                        $GLOBALS[ 'rows' ][ 'left' ]--;
                                    }

                                    if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
                                        break;
                                    }
                                }
                                // free result set
                                $result->close();
                            }
                        }
                    }
                    // free count set
                    $count->close();
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
                        $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_antivirus_'. sprintf( "%02d", $j ) .'"' ) ) {
                            $cnted = $count->fetch_row()[ 0 ];
                            if ( $cnted > 0 ) {
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_antivirus_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            $cnt++;
                                            // rows we want
                                            if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                $GLOBALS[ 'rows' ][ 'left' ]--;
                                            }
                                        }
                                        // free result set
                                        $result->close();
                                    }
                                }
                            }
                            // free count set
                            $count->close();
                        }
                    }
                    break;
                case $days:
                    // start date

                    $db = str_replace( "-", "_", $GLOBALS[ 'sd' ] );

                    for ( $j=23; $j>=$_GET[ 'sh' ]; $j-- )
                    {
                        $cnt = $GLOBLAS[ 'json' ][ 'queryRows' ];
                        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "raw_antivirus_'. sprintf( "%02d", $j ) .'"' ) ) {
                            $cnted = $count->fetch_row()[ 0 ];
                            if ( $cnted > 0 ) {
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_antivirus_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                        while ( $obj = $result->fetch_object() ) {
                                            $cnt++;
                                            // rows we want
                                            if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                $GLOBALS[ 'rows' ][ 'left' ]--;
                                            }

                                            if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
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
                    break;
                default:
                    $dbStamp -= 86400;
                    $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
                    // use daily statistics
                    if ( $check = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "daily_antivirus"' ) ) {
                        $chk = $check->fetch_row()[ 0 ];
                        if ( $chk > 0 ) {
                            $cnt = $GLOBALS[ 'json' ][ 'queryRows' ];
                            // have data, get and count from daily statistics
                            if ($count = $GLOBALS[ 'mysqli' ]->query( 'SELECT SUM( hitCount ) as count FROM '. $db .'.`daily_antivirus`' ) ) {
                                $cnted = $count->fetch_row()[ 0 ];
                                $GLOBALS[ 'json' ][ 'queryRows' ] += $cnted;
                                if ( ( $GLOBALS[ 'json' ][ 'queryRows' ] >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $GLOBALS[ 'rows' ][ 'left' ] > 0 ) ) {
                                    for ($j=23; $j>=0; $j--)
                                    {
                                        if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $db .'.`raw_antivirus_'. sprintf("%02d", $j) .'` ORDER BY id DESC' ) ) {
                                            while ( $obj = $result->fetch_object() ) {
                                                $cnt++;
                                                // rows we want
                                                if ( ( $cnt >= $GLOBALS[ 'rows' ][ 'start' ] ) && ( $cnt <= $GLOBALS[ 'rows' ][ 'end' ] ) ) {
                                                    $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                                                    $GLOBALS[ 'rows' ][ 'left' ]--;
                                                }

                                                if ( 0 == $GLOBALS[ 'rows' ][ 'left' ]) {
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
                        // free check set
                        $check->close();
                    }
                }
            }
        }
    } elseif ( $GLOBALS[ 'ehStamp' ] == $GLOBALS[ 'shStamp' ] ) {
        // single hour
        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $GLOBALS[ 'db' ] .'" AND TABLE_NAME = "raw_antivirus_'. $GLOBALS[ 'eh' ] .'"' ) ) {
            $GLOBALS[ 'json' ][ 'queryRows' ] = $count->fetch_row()[ 0 ];
            if ( $GLOBALS[ 'json' ][ 'queryRows' ] > 0 ) {
                $GLOBALS[ 'json' ][ 'queryStr' ] = 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_antivirus_'. $GLOBALS[ 'eh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ];
                if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_antivirus_'. $GLOBALS[ 'eh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ] ) ) {
                    while ( $obj = $result->fetch_object() ) {
                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                    }
                    // free result set
                    $result->close();
                }
            }
            // free result set
            $count->close();
        }
    } else {
        // weird, given current hour's report instead
        if ( $count = $GLOBALS[ 'mysqli' ]->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $GLOBALS[ 'db' ] .'" AND TABLE_NAME = "raw_antivirus_'. $GLOBALS[ 'nh' ] .'"' ) ) {
            $GLOBALS[ 'json' ][ 'queryRows' ] = $count->fetch_row()[ 0 ];
            if ( $GLOBALS[ 'json' ][ 'queryRows' ] > 0 ) {
                $GLOBALS[ 'json' ][ 'queryStr' ] = 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_antivirus_'. $GLOBALS[ 'nh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ];
                if ( $result = $GLOBALS[ 'mysqli' ]->query( 'SELECT * FROM '. $GLOBALS[ 'db' ] .'.`raw_antivirus_'. $GLOBALS[ 'nh' ] .'` ORDER BY id DESC LIMIT '. $GLOBALS[ 'rows' ][ 'start' ] .', '. $GLOBALS[ 'rows' ][ 'left' ] ) ) {
                    while ( $obj = $result->fetch_object() ) {
                        $GLOBALS[ 'json' ]['queryResults'][] = $obj;
                    }
                    // free result set
                    $result->close();
                }
            }
            // free result set
            $count->close();
        }
    }
    echo json_encode( $GLOBALS[ 'json' ] );
}

function weeklyAAV() {
    // get the days of week, and calculate the sd and ed of last week
    // sd => sunday, ed => saturday
    // get this sunday
    $dbStamp = $GLOBALS[ 'ndStamp' ] - $GLOBALS[ 'nw' ] * 86400;

    // one 4 all, all 4 one :D
    unset( $GLOBALS[ 'json' ][ 'queryRows' ] );
    unset( $GLOBALS[ 'json' ][ 'queryResults' ] );

    $tmpTable = $GLOBALS[ 'db' ] .'.`daily_antivirus-'. $GLOBALS[ 'nowStamp' ] .'`';
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

    // create temp
    $GLOBALS[ 'mysqli' ]->query( $createTmp );
    $GLOBALS[ 'json' ][ 'sd' ] = trim( shell_exec( 'date -d @'. ($dbStamp-86400*7) .' "+%Y.%m.%d"' ) );
    $GLOBALS[ 'json' ][ 'ed' ] = trim( shell_exec( 'date -d @'. ($dbStamp-86400) .' "+%Y.%m.%d"' ) );

    for ( $i=7; $i>0; $i-- )
    {
        $dbStamp -= 86400;
        $db = trim( shell_exec( 'date -d @'. $dbStamp .' "+%Y_%m_%d"' ) );
        $GLOBALS[ 'mysqli' ]->query( 'INSERT INTO '. $tmpTable .' SELECT 0, srcIp, dstIp, protocol, virusName, date, hitCount FROM '. $db .'.`daily_antivirus`' );
    }

    // no limitation this time, get back to calculate ratio
    $GLOBALS[ 'json' ][ 'topSrcIp' ] = [];
    if ($result = $GLOBALS[ 'mysqli' ]->query( 'SELECT srcIp, SUM( hitCount ) as hitCount FROM '. $tmpTable .' GROUP BY srcIp ORDER BY hitCount DESC' )) {
        $GLOBALS[ 'json' ][ 'topSrcIp' ][ 'queryRows' ] = $result->num_rows;
        while ( $obj = $result->fetch_object() ) {
            $GLOBALS[ 'json' ][ 'topSrcIp' ][ 'queryResults' ][] = $obj;
        }
        // free result set
        $result->close();
    }

    $GLOBALS[ 'json' ][ 'topDstIp' ] = [];
    if ($result = $GLOBALS[ 'mysqli' ]->query( 'SELECT dstIp, SUM( hitCount ) as hitCount FROM '. $tmpTable .' GROUP BY dstIp ORDER BY hitCount DESC' )) {
        $GLOBALS[ 'json' ][ 'topDstIp' ][ 'queryRows' ] = $result->num_rows;
        while ( $obj = $result->fetch_object() ) {
            $GLOBALS[ 'json' ][ 'topDstIp' ][ 'queryResults' ][] = $obj;
        }
        // free result set
        $result->close();
    }

    $GLOBALS[ 'json' ][ 'topVirusName' ] = [];
    if ($result = $GLOBALS[ 'mysqli' ]->query( 'SELECT virusName, SUM( hitCount ) as hitCount FROM '. $tmpTable .' GROUP BY virusName ORDER BY hitCount DESC' )) {
        $GLOBALS[ 'json' ][ 'topVirusName' ][ 'queryRows' ] = $result->num_rows;
        while ( $obj = $result->fetch_object() ) {
            $GLOBALS[ 'json' ][ 'topVirusName' ][ 'queryResults' ][] = $obj;
        }
        // free result set
        $result->close();
    }

    $GLOBALS[ 'json' ][ 'topProtocol' ] = [];
    if ($result = $GLOBALS[ 'mysqli' ]->query( 'SELECT protocol, SUM( hitCount ) as hitCount FROM '. $tmpTable .' GROUP BY protocol ORDER BY hitCount DESC' )) {
        $GLOBALS[ 'json' ][ 'topProtocol' ][ 'queryRows' ] = $result->num_rows;
        while ( $obj = $result->fetch_object() ) {
            $GLOBALS[ 'json' ][ 'topProtocol' ][ 'queryResults' ][] = $obj;
        }
        // free result set
        $result->close();
    }

    echo json_encode( $GLOBALS[ 'json' ] );
}

$GLOBALS[ 'mysqli' ]->close();

?>
