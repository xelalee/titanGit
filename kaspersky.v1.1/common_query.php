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
case 'top_traffic_direction':
    prepareTop( 'network_top_ZtoZ', 'trafficAmount' );
    break;
case 'top_source':
    prepareTop( 'network_top_srcIpTraffic', 'txrxsum' );
    break;
case 'top_destination':
    prepareTop( 'network_top_dstIpTraffic', 'txrxsum' );
    break;
case 'top_file_extension':
    prepareTop( 'security_top_file_access', 'accessCount' );
    break;
case 'top_blocked_host':
    prepareTop( 'security_top_blocked_host', 'totalCount' );
    break;
case 'top_affected_host':
    prepareTop( 'security_top_affected_host', 'totalCount' );
    break;
case 'top_antivirus':
    prepareTop( 'security_top_antivirus', 'hitCount' );
    break;
// chart
case 'wan_bandwidth_report':
case 'resource_utilization':
    prepareChart();
    break;
// report
case 'traffic_direction':
    if ( isset( $_GET[ 'q' ] ) && !empty( $_GET[ 'q' ] ) ) {
        reportAggregate();
    } else {
        reportQuery( 'raw_sessions' );
    }
    break;
case 'source_report':
    switch( $_GET[ 'q' ]) 
    {
    case 1:
        reportAggregate( 'daily_srcIpTraffic', 'srcIp', 'srcIp, SUM( tx ) as tx, SUM( rx ) as rx, SUM( sessions ) as sessions' );
        break;
    default:
        reportQuery( 'raw_ipTraffic' );
    }
    break;
case 'destination_report':
    switch( $_GET[ 'q' ]) 
    {
    case 1:
        reportAggregate( 'daily_dstIpTraffic', 'dstIp', 'dstIp, SUM( tx ) as tx, SUM( rx ) as rx, SUM( sessions ) as sessions' );
        break;
    default:
        reportQuery( 'raw_ipTraffic' );
    }
    break;
case 'file_extension':
    switch( $_GET[ 'q' ]) 
    {
    case 1:
        reportAggregate( 'daily_file_access', 'extension', 'extension, SUM( accessCount ) as accessCount' );
        break;
    default:
        reportQuery( 'raw_file_access' );
    }
    break;
case 'blocked_host':
    switch( $_GET[ 'q' ]) 
    {
    case 1:
        reportAggregate( 'daily_blocked_host', 'ip', 'ip, SUM( virusCount ) as virusCount, SUM( firewallCount ) as firewallCount');
        break;
    default:
        reportQuery( 'raw_blocked_host' );
    }
    break;
case 'affected_host':
    switch( $_GET[ 'q' ]) 
    {
    case 1:
        reportAggregate( 'daily_affected_host', 'ip', 'ip, SUM( virusHitCount ) as virusHitCount, SUM( sigHitCount ) as sigHitCount' );
        break;
    default:
        reportQuery( 'raw_affected_host' );
    }
    break;
case 'antivirus_report':
    switch( $_GET[ 'q' ]) 
    {
    case 1:
        reportAggregate( 'daily_antivirus', 'srcIp', 'srcIp, SUM( hitCount ) as hitCount' );
        break;
    case 2:
        reportAggregate( 'daily_antivirus', 'dstIp', 'dstIp, SUM( hitCount ) as hitCount' );
        break;
    case 3:
        reportAggregate( 'daily_antivirus', 'virusName', 'virusName, SUM( hitCount ) as hitCount' );
        break;
    default:
        reportQuery( 'raw_antivirus' );
    }
    break;
// view log
case 'view_logs':
    logQuery( 'logs' );
    break;
}

function prepareTop( $table, $orderBy ) {
    $query  = 'SELECT * ';
    $query .= '  FROM `'. $table .'`';
    $query .= ' ORDER BY '. ( ( empty( $_GET[ 'oby' ] ) )? $orderBy : $_GET[ 'oby' ] ) . ( ( empty( $_GET[ 'asc' ] ) )? ' DESC' : ' ASC' );
    $query .= ' LIMIT 10';
    archerQuery( $query );
}

function prepareChart() {
    $datetime = 'datetime';
    $limit = 360;
    $query  = 'SELECT * ';
    $tmp = '';

    switch( $_GET[ 't' ] )
    {
    case 0:
        $query .= ', (datetime DIV 10) * 10 as date';
        $table  = 'hour';
        break;
    case 1:
        $query .= ', (datetime DIV 500) * 500 as date';
        $table  = 'day';
        $limit = 288;
        break;
    case 2:
        $query .= ', (datetime DIV 3000) * 3000 as date';
        $table  = 'week';
        $limit = 336;
        break;
    case 3:
        $query .= ', (datetime DIV 20000) * 20000 as date';
        $table  = 'month';
        break;
    case 4:
        $table  = 'year';
        $datetime = 'date';
        $limit = 365;
        break;
    }

    $query .= '  FROM `'. $table .'_';

    if ( !empty ($_GET[ 'sd' ] ) ) {
        if ( !empty( $_GET[ 'ed' ] ) ) {
            $tmp = $datetime .' BETWEEN "'. $_GET[ 'sd' ] .' '. $_GET[ 'sh' ] .':'. $_GET[ 'sm' ] .':00" AND "'. $_GET[ 'ed' ] .' '. $_GET[ 'eh' ] .':'. $_GET[ 'em' ] .':59"';
        }else {
            $tmp = $datetime .' > "'. $_GET[ 'sd' ] .' '. $_GET[ 'sh' ] .':'. $_GET[ 'sm' ] .':00"';
        }
    }elseif ( !empty( $_GET[ 'ed' ] ) ) {
        $tmp = $datetime .' < "'. $_GET[ 'ed' ] .' '. $_GET[ 'eh' ] .':'. $_GET[ 'em' ] .':59"';
    }

    switch( $_GET[ 'param' ] )
    {
    case 'wan_bandwidth_report':
        $query .= 'wanbandwidth`';
        $query .= ' WHERE wanname="'. $_GET[ 'q' ] .'"';
        if ( !empty ($_GET[ 'sd' ] ) ) {
            if ( !empty( $_GET[ 'ed' ] ) ) {
                $query .= ' AND '. $datetime .' BETWEEN "'. $_GET[ 'sd' ] .' '. $_GET[ 'sh' ] .':'. $_GET[ 'sm' ] .':00" AND "'. $_GET[ 'ed' ] .' '. $_GET[ 'eh' ] .':'. $_GET[ 'em' ] .':59"';
            }else {
                $query .= ' AND '. $datetime .' > "'. $_GET[ 'sd' ] .' '. $_GET[ 'sh' ] .':'. $_GET[ 'sm' ] .':00"';
            }
        }elseif ( !empty( $_GET[ 'ed' ] ) ) {
            $query .= ' AND '. $datetime .' < "'. $_GET[ 'ed' ] .' '. $_GET[ 'eh' ] .':'. $_GET[ 'em' ] .':59"';
        }
        break;
    case 'resource_utilization':
        $query .= ( (0 == $_GET[ 'q' ])? 'cpuusage`' : 'memusage`' );
        if ( !empty ($_GET[ 'sd' ] ) ) {
            if ( !empty( $_GET[ 'ed' ] ) ) {
                $query .= ' WHERE '. $datetime .' BETWEEN "'. $_GET[ 'sd' ] .' '. $_GET[ 'sh' ] .':'. $_GET[ 'sm' ] .':00" AND "'. $_GET[ 'ed' ] .' '. $_GET[ 'eh' ] .':'. $_GET[ 'em' ] .':59"';
            }else {
                $query .= ' WHERE '. $datetime .' > "'. $_GET[ 'sd' ] .' '. $_GET[ 'sh' ] .':'. $_GET[ 'sm' ] .':00"';
            }
        }elseif ( !empty( $_GET[ 'ed' ] ) ) {
            $query .= ' WHERE '. $datetime .' < "'. $_GET[ 'ed' ] .' '. $_GET[ 'eh' ] .':'. $_GET[ 'em' ] .':59"';
        }
        break;
    }

    $query .= ' Order By date desc ';
    $query .= ' LIMIT '. $limit;

    archerQuery( $query );
}

function archerQuery( $query ) {

    $mysqli = new mysqli( "127.0.0.1", "archer", "rehcra", 'archer', 3306 );
    if ( $result = $mysqli->query( $query ) ) {
        // fetch object array
        $totalRows = $result->num_rows;
        switch( $_GET[ 'param' ] )
        {
        case 'wan_bandwidth_report':
            if (4 == $_GET['t']) {
                while ($obj = $result->fetch_object()) {
                    $json['queryResults'][] = array("datetime" => str_replace("-", "/", $obj->date), "Transmit" => $obj->txRate, "Receive" => $obj->rxRate);
                }
            } else {
                while ($obj = $result->fetch_object()) {
                    $json['queryResults'][] = array("datetime" => str_replace("-", "/", $obj->datetime), "Transmit" => $obj->txRate, "Receive" => $obj->rxRate);
                }
                break;
            }
            break;
        case 'resource_utilization':
            if ($_GET['t'] == 4) {
                while ($obj = $result->fetch_object()) {
                    $json['queryResults'][] = array("datetime" => str_replace("-", "/", $obj->date), "usage" => number_format( $obj->usage, 2, '.', '' ));
                }
            }else {
                while ($obj = $result->fetch_object()) {
                    $json['queryResults'][] = array("datetime" => str_replace("-", "/", $obj->datetime), "usage" => number_format(  $obj->usage, 2, '.', '' ));
                }
            }
            break;
        default:
            while ($obj = $result->fetch_object()) {
                $json['queryResults'][] = $obj;
            }
        }

        $json[ 'param' ] = $_GET[ 'param' ];
        $json[ 'queryStr' ] = $query;
        $json[ 'queryRows' ] = $totalRows;

        // free result set
        $result->close();

        echo json_encode( $json );
    } else {
        echo $query;
    }
}

function reportAggregate() {
    $json      = array();
    $startRow  = empty( $_GET[ 'pi' ] )? 1 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ] + 1;
    $endRow    = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $nowStamp = trim( shell_exec( 'date "+%s"' ) );
    $mysqli = new mysqli( "127.0.0.1", "archer", "rehcra", 'archer', 3306 );

   
    $startDate  = str_replace("/", "-", $_GET[ 'sd' ]);
    $startStamp = trim( shell_exec( 'date -d "'. $startDate .' 00:00:00" "+%s"' ) );
    $endDate    = str_replace("/", "-", $_GET[ 'ed' ]);
    $endStamp   = trim( shell_exec( 'date -d "'. $endDate .' 00:00:00" "+%s"' ) );

    $days = 1 + ($endStamp - $startStamp)/86400;
    $totalRows = 0;

    $db = str_replace("-", "_", trim( shell_exec( 'date -d @'. $nowStamp .' +%F' ) ));
    $table;
    $gby;

    $tmpTable = $db;

    switch( $_GET[ 'q' ] )
    {
    case 1:
        $gby = 'srcIp, dstIp';
        $table = 'daily_addrTraffic';
        $tmpTable .= '.`daily_addrTraffic-'. $nowStamp .'`';
        $createTmpTable = "CREATE TABLE IF NOT EXISTS ". $tmpTable ." (
           `id` int(11) NOT NULL auto_increment,
           `srcIp` varchar(16) NOT NULL default '',
           `dstIp` varchar(16) NOT NULL default '',
           `txBytes` BIGINT,
           `rxBytes` BIGINT,
           `totalBytes` BIGINT,
           `sessions` BIGINT,
           UNIQUE KEY `daily_addrTraffic_ukey` (`srcIp`,`dstIp`),
           PRIMARY KEY  (`id`)
        )";
        break;
    case 2:
        $gby = 'srcIp';
        $table = 'daily_srcAddrTraffic';
        $tmpTable .= '.`daily_srcAddrTraffic-'. $nowStamp .'`';
        $createTmpTable = "CREATE TABLE IF NOT EXISTS ". $tmpTable ." (
           `id` int(11) NOT NULL auto_increment,
           `srcIp` varchar(16) NOT NULL default '',
           `txBytes` BIGINT,
           `rxBytes` BIGINT,
           `totalBytes` BIGINT,
           `sessions` BIGINT,
           UNIQUE KEY `daily_srcAddrTraffic_ukey` (`srcIp`),
           PRIMARY KEY  (`id`)
        )";
        break;
    case 3:
        $gby = 'dstIp';
        $table = 'daily_dstAddrTraffic';
        $tmpTable .= '.`daily_dstAddrTraffic-'. $nowStamp .'`';
        $createTmpTable = "CREATE TABLE IF NOT EXISTS ". $tmpTable ." (
           `id` int(11) NOT NULL auto_increment,
           `dstIp` varchar(16) NOT NULL default '',
           `txBytes` BIGINT,
           `rxBytes` BIGINT,
           `totalBytes` BIGINT,
           `sessions` BIGINT,
           UNIQUE KEY `daily_dstAddrTraffic_ukey` (`dstIp`),
           PRIMARY KEY  (`id`)
        )";
        break;
    case 4:
        $gby = 'protocol';
        $table = 'daily_protoTraffic';
        $tmpTable .= '.`daily_protoAddrTraffic-'. $nowStamp .'`';
        $createTmpTable = "CREATE TABLE IF NOT EXISTS ". $tmpTable ." (
           `id` int(11) NOT NULL auto_increment,
           `protocol` INT,
           `txBytes` BIGINT,
           `rxBytes` BIGINT,
           `totalBytes` BIGINT,
           `sessions` BIGINT,
           UNIQUE KEY `daily_protoTraffic_ukey` (`protocol`),
           PRIMARY KEY  (`id`)
        )";
        break;
    case 5:
        $gby = 'dstPort';
        $table = 'daily_dstPortTraffic';
        $tmpTable .= '.`daily_dstPortAddrTraffic-'. $nowStamp .'`';
        $createTmpTable = "CREATE TABLE IF NOT EXISTS ". $tmpTable ." (
           `id` int(11) NOT NULL auto_increment,
           `dstPort` INT,
           `txBytes` BIGINT,
           `rxBytes` BIGINT,
           `totalBytes` BIGINT,
           `sessions` BIGINT,
           UNIQUE KEY `daily_dstPortTraffic_ukey` (`dstPort`),
           PRIMARY KEY  (`id`)
        )";
        break;
    case 6:
        $gby = 'fromZone, toZone';
        $table = 'daily_zoneTraffic';
        $tmpTable .= '.`daily_zoneTraffic-'. $nowStamp .'`';
        $createTmpTable = "CREATE TABLE IF NOT EXISTS ". $tmpTable ." (
           `id` int(11) NOT NULL auto_increment,
           `fromZone` varchar(64) NOT NULL default '',
           `toZone` varchar(64) NOT NULL default '',
           `txBytes` BIGINT,
           `rxBytes` BIGINT,
           `totalBytes` BIGINT,
           `sessions` BIGINT,
           UNIQUE KEY `daily_zoneTraffic_ukey` (`fromZone`,`toZone`),
           PRIMARY KEY  (`id`)
        )";
        break;
    }

    // create temp
    $mysqli->query( $createTmpTable );

    // get passed data from daily statistics tables 

    for ($i=0; $i<$days; $i++)
    {
        $tmpStamp = $endStamp - $i * 86400;
        $db = str_replace("-", "_", trim( shell_exec( 'date -d @'. $tmpStamp .' +%F' ) ));

        // create table now's timestamp on archer
        // check if daily statistics are data_reday
        if ( $check = $mysqli->query( 'SELECT TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "'. $table .'" AND TABLE_COMMENT = "data_ready" ' ) ) {
            if ( 0 == $check->num_rows ) {
                // 24 hours
                for ($j=0; $j<24; $j++)
                {
                    $mysqli->query( 'INSERT INTO '. $tmpTable . ' SELECT 0, '. $gby .', txBytes, rxBytes, totalBytes, count(*) as sessions from '. $db .'.`raw_sessions_'. sprintf("%02d", $j) .'` GROUP BY '. $gby );
                }
            } else {
                $mysqli->query( 'INSERT INTO '. $tmpTable .' SELECT 0, '. $gby .', txBytes, rxBytes, totalBytes, sessions from '. $db .'.'. $table );;
                
            }
            $check->close();
        }
    }

    // get all data from temp table

    $query = "SELECT * FROM ". $tmpTable ." where sessions > 0 GROUP BY ". $gby ." ORDER BY sessions DESC";

    $json[ 'queryStr' ] = $query;

    if ( $result = $mysqli->query( $query ) ) {
        $totalRows = $result->num_rows;
        while ($obj = $result->fetch_object()) {
            $cnt++;
            if ($cnt >= $startRow && $cnt <= $endRow) {
                $json['queryResults'][] = $obj;
            }
        }
        // free result set;
        $result->close();
    }

    $mysqli->query( 'DROP TABLE '. $tmpTable );

    $json[ 'queryRows' ] = $totalRows;
    $json[ 'queryStamp' ] = trim( shell_exec( 'date +%s' ) ) - $nowStamp;
    echo json_encode( $json );
}

function reportQuery( $table ) {
    $json      = array();
    $startRow  = empty( $_GET[ 'pi' ] )? 1 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ] + 1;
    $endRow    = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $leftRow   = empty( $_GET[ 'pp' ] )? 20 : (int) $_GET[ 'pp' ];
    $cntRows   = 0;
    $tableRows = 0;
    $totalRows = 0;
    
    $json[ 'param' ] = $_GET[ 'param' ];
    $nowStamp = trim( shell_exec( 'date "+%s"' ) );

    $mysqli = new mysqli( "127.0.0.1", "archer", "rehcra", 'archer', 3306 );

    $tables = array();
    for ($i=23; $i>=0; $i--)
    {
        array_push( $tables, $table .'_'. sprintf("%02d", $i) );
    }

    if ( !empty( $_GET[ 'sd' ] ) && !empty( $_GET[ 'ed' ] ) ) {
        $startDate = str_replace("/", "-", $_GET[ 'sd' ]);
        $startStamp = trim( shell_exec( 'date -d "'. $startDate .' 00:00:00" "+%s"' ) );
        $endDate = str_replace("/", "-", $_GET[ 'ed' ]);
        $endStamp = trim( shell_exec( 'date -d "'. $endDate .' 00:00:00" "+%s"' ) );
        $days = 1 + ($endStamp - $startStamp)/86400;
    } else {
        // one week
        $days = 7;
        $endDate = trim( shell_exec( 'date +%Y-%m-%d' ) );
        $endStamp = trim( shell_exec( 'date -d "'. $endDate .' 00:00:00" "+%s"' ) );
    }

    $json[ 'interval' ] = $days;

    for ($i=0; $i<$days; $i++)
    {
        $tmpStamp = $endStamp - $i * 86400;
        $db = str_replace("-", "_", trim( shell_exec( 'date -d @'. $tmpStamp .' +%F' ) ));
        // information schema method
        // stats method
        if ( $dbCount = $mysqli->query( 'SELECT SUM(TABLE_ROWS) FROM INFORMATION_SCHEMA.`TABLES` WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME LIKE "' . $table .'%"' ) ) {
            // only if the rows are we want, scan the hourly table
            $tableRows = $totalRows;
            $totalRows = $totalRows + $dbCount->fetch_row()[ 0 ];
            if ( $totalRows >= $startRow && $leftRow > 0 ) {
                for ($j=0; $j<sizeof( $tables ); $j++)
                {
                    if ( $tableCount = $mysqli->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.`TABLES` WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "'. $tables[ $j ] .'"' ) ) {
                        $cntRows = $tableRows;
                        $tableRows = $tableRows + $tableCount->fetch_row()[ 0 ];
                        if ( $tableRows >= $startRow && $leftRow > 0 ) {
                            if ( $result = $mysqli->query( 'SELECT * FROM '. $db .'.`'. $tables[ $j ] .'` ORDER BY id DESC' ) ) {
                                while ($obj = $result->fetch_object()) {
                                    $cntRows++;
                                    // rows we want
                                    if ($cntRows >= $startRow && $cntRows <= $endRow) {
                                        $json['queryResults'][] = $obj;
                                        $leftRow--;
                                    }
                                    
                                    if (0 == $leftRow) { 
                                        break;
                                    }
                                }
                                // free result set
                                $result->close();
                            }
                        }
                        // free tableCount set
                        $tableCount->close();
                    }
                }
            }
            // free dbCount set
            $dbCount->close();
        }
    }
    $json[ 'queryRows' ] = $totalRows;
    $json[ 'queryStamp' ] = trim( shell_exec( 'date +%s' ) ) - $nowStamp;
    echo json_encode( $json );
}

function logQuery( $table ) {
    $json      = array();
    $result;
    $startRow  = empty( $_GET[ 'pi' ] )? 1 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ] + 1;
    $endRow    = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $leftRow   = empty( $_GET[ 'pp' ] )? 20 : (int) $_GET[ 'pp' ];
    $tableRows = 0;
    $totalRows = 0;
    $nowStamp = trim( shell_exec( 'date "+%s"' ) );

    $mysqli = new mysqli( "127.0.0.1", "archer", "rehcra", 'archer', 3306 );

    $tables = array();
    for ($i=23; $i>=0; $i--)
    {
        array_push( $tables, $table .'_'. sprintf("%02d", $i) );
    }

    if ( !empty( $_GET[ 'sd' ] ) && !empty( $_GET[ 'ed' ] ) ) {
        $startDate = str_replace("/", "-", $_GET[ 'sd' ]);
        $startStamp = trim( shell_exec( 'date -d "'. $startDate .' 00:00:00" "+%s"' ) );
        $endDate = str_replace("/", "-", $_GET[ 'ed' ]);
        $endStamp = trim( shell_exec( 'date -d "'. $endDate .' 00:00:00" "+%s"' ) );
        $days = 1 + ($endStamp - $startStamp)/86400;
    } else {
        // 1 week back from today
        $days = 7;
        $endDate = trim( shell_exec( 'date +%Y-%m-%d' ) );
        $endStamp = trim( shell_exec( 'date -d "'. $endDate .' 00:00:00" "+%s"' ) );
    }

    $json[ 'interval' ] = $days;

    $hasWhere = false;

    if ( isset( $_GET[ 's' ] ) ) {
        $hasWhere = true;
        $plus = ' WHERE severity <= '. (int) $_GET[ 's' ];
    } else {
        $plus = ' WHERE severity <= 7 ';
    }

    if ( !empty( $_GET[ 'f' ] ) && $_GET[ 'f' ] != "NA" ) {
        $hasWhere = true;
        $plus .= '   AND facility = "'. $_GET[ 'f' ] .'"';
    }
        
    if ( !empty( $_GET[ 'srcIp' ] ) ) {
        $hasWhere = true;
        $plus .= '   AND srcIp = "'. $_GET[ 'srcIp' ] .'"';
    }

    if ( !empty( $_GET[ 'dstIp' ] ) ) {
        $hasWhere = true;
        $plus .= '   AND dstIp = "'. $_GET[ 'dstIp' ] .'"';
    }

    if ( !empty( $_GET[ 'srcUsr' ] ) ) {
        $hasWhere = true;
        $plus .= '   AND srcUsr = "'. $_GET[ 'srcUsr' ] .'"';
    }

    if ( !empty( $_GET[ 'dstUsr' ] ) ) {
        $hasWhere = true;
        $plus .= '   AND dstUsr = "'. $_GET[ 'dstUsr' ] .'"';
    }

    if ($hasWhere) {
        for ($i=0; $i<$days; $i++)
        {
            $tmpStamp = $endStamp - $i * 86400;
            $db = str_replace("-", "_", trim( shell_exec( 'date -d @'. $tmpStamp .' +%F' ) ));
            if ( $dbCheck = $mysqli->query( 'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.`SCHEMATA` WHERE SCHEMA_NAME = "'. $db .'"' ) ) {
                // only if exists db,
                for ($j=0; $j<sizeof( $tables ); $j++)
                {
                    if ( $tableCount = $mysqli->query( 'SELECT COUNT(*) FROM '. $db .'.'. $tables[ $j ] . $plus ) ) {
                        $cntRows = $totalRows;
                        $totalRows = $totalRows + $tableCount->fetch_row()[ 0 ];
                        if ( $totalRows >= $startRow && $leftRow > 0 ) {
                            if ( $result = $mysqli->query( 'SELECT * FROM '. $db .'.`'. $tables[ $j ] .'`'. $plus .' ORDER BY seq DESC' ) ) {
                                while ($obj = $result->fetch_object()) {
                                    $cntRows++;
                                    // rows we want
                                    if ($cntRows >= $startRow && $cntRows <= $endRow) {
                                        $json['queryResults'][] = $obj;
                                        $leftRow--;
                                    }

                                    if (0 == $leftRow) { 
                                        break;
                                    }
                                }

                                // free result set
                                $result->close();
                            }
                        }
                        // free tableCount set
                        $tableCount->close();
                    }
                }
                // free dbCheck set
                $dbCheck->close();
            }
        }
    }else {
        for ($i=0; $i<$days; $i++)
        {
            $tmpStamp = $endStamp - $i * 86400;
            $db = str_replace("-", "_", trim( shell_exec( 'date -d @'. $tmpStamp .' +%F' ) ));
            if ( $dbCount = $mysqli->query( 'SELECT SUM(TABLE_ROWS) FROM INFORMATION_SCHEMA.`TABLES` WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME LIKE "'. $table .'%"' ) ) {
                // only if the rows are we want, scan the hourly table
                $tableRows = $totalRows;
                $totalRows = $totalRows + $dbCount->fetch_row()[ 0 ];

                if ( $totalRows >= $startRow && $leftRow > 0 ) {
                    for ($j=0; $j<sizeof( $tables ); $j++)
                    {
                        if ( $tableCount = $mysqli->query( 'SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.`TABLES` WHERE TABLE_SCHEMA = "'. $db .'" AND TABLE_NAME = "'. $tables[ $j ] .'"' ) ) {
                            $cntRows = $tableRows;
                            $tableRows = $tableRows + $tableCount->fetch_row()[ 0 ];
                            if ( $tableRows >= $startRow && $leftRow > 0 ) {
                                if ( $result = $mysqli->query( 'SELECT * FROM '. $db .'.`'. $tables[ $j ] .'`'. $plus .' ORDER BY seq DESC' ) ) {
                                    while ($obj = $result->fetch_object()) {
                                        $cntRows++;
                                        // rows we want
                                        if ($cntRows >= $startRow && $cntRows <= $endRow) {
                                            $json['queryResults'][] = $obj;
                                            $leftRow--;
                                        }

                                        if (0 == $leftRow) { 
                                            break;
                                        }
                                    }
                                    // free result set
                                    $result->close();
                                }
                            }
                            // free tableCount set
                            $tableCount->close();
                        }
                    }
                }
                // free dbCount set
                $dbCount->close();
            }
        }
    }

    $json[ 'queryRows' ] = $totalRows;
    $json[ 'queryStamp' ] = trim( shell_exec( 'date +%s' ) ) - $nowStamp;
    echo json_encode( $json );
}

?>
