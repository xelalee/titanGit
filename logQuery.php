<?php

if ( empty( $_GET ) ) {
    die( 'please make sure what u want !?' );
}

// set default time zone
date_default_timezone_set('UTC');

// switch function via param
// connect archer first

if ( 'view_logs' == $_GET[ 'param' ] ) {
    if (isset( $_GET[ 'q' ] ) && !empty( $_GET[ 'q' ] )) {
        // query
        advQuery();
    } else {
        // this hour
        logQuery( false );
    }
}

function logQuery( $adv ) {
    $json = array();
    $mysqli = new mysqli( "127.0.0.1", "archer", "rehcra", 'archer', 3306 );
    $startRow  = empty( $_GET[ 'pi' ] )? 1 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ] + 1;
    $endRow    = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $leftRow   = empty( $_GET[ 'pp' ] )? 20 : (int) $_GET[ 'pp' ];
    $nowStamp  = trim( shell_exec( 'date "+%s"' ) );
    $now       = explode( '-', trim( shell_exec( 'date "+%Y-%m-%d-%H"' ) ) );

    $query  = 'SELECT *';
    $query .= '  FROM '. $now[ 0 ] .'_'. $now[ 1 ] .'_'. $now[ 2 ] .'.`logs_'. sprintf("%02d", $now[ 3 ]) .'`';
    if ($adv) {
        $query .= $adv;
    }
    $query .= ' ORDER BY seq DESC';
    $query .= ' LIMIT '. $startRow .', '. $leftRow;

    $json[ 'queryStr' ] = $query;
    if ( $count = $mysqli->query( 'SELECT COUNT(*) FROM '. $now[ 0 ] .'_'. $now[ 1 ] .'_'. $now[ 2 ] .'.`logs_'. sprintf("%02d", $now[ 3 ]) .'`' ) ) {
        $json[ 'queryRows' ] = $count->fetch_row()[ 0 ];
        if ( $result = $mysqli->query( $query ) ) {
            while ($obj = $result->fetch_object()) {
                $json['queryResults'][] = $obj;
            }
            // free result set
            $result->close();
        }
        // free result set
        $count->close();
    }

    $json[ 'queryStamp' ] = trim( shell_exec( 'date +%s' ) ) - $nowStamp;
    echo json_encode( $json );
}

function advQuery() {
    $json = array();
    $mysqli     = new mysqli( "127.0.0.1", "archer", "rehcra", 'archer', 3306 );
    $startRow   = empty( $_GET[ 'pi' ] )? 1 : ( $_GET[ 'pi' ] - 1 ) * $_GET[ 'pp' ] + 1;
    $endRow     = empty( $_GET[ 'pp' ] )? 20 : $_GET[ pi ] * $_GET[ 'pp' ];
    $leftRow    = empty( $_GET[ 'pp' ] )? 20 : (int) $_GET[ 'pp' ];
    $nowDate    = explode( '-', trim( shell_exec( 'date "+%Y-%m-%d-%H"' ) ) );
    $nowStamp   = trim( shell_exec( 'date "+%s"' ) );
    $startDate  = str_replace("/", "-", $_GET[ 'sd' ]);
    $endDate    = str_replace("/", "-", $_GET[ 'ed' ]);
    $startStamp = trim( shell_exec( 'date -d "'. $startDate .' '. sprintf("%02d", $_GET[ 'sh' ]) .':00:00" "+%s"' ) );
    $endStamp   = trim( shell_exec( 'date -d "'. $endDate .' '. sprintf("%02d", $_GET[ 'eh' ]) .':00:00" "+%s"' ) );
    $startDateStamp = trim( shell_exec( 'date -d "'. $startDate .' 00:00:00" "+%s"' ) );
    $endDateStamp   = trim( shell_exec( 'date -d "'. $endDate .' 00:00:00" "+%s"' ) );
    $days = ($endDateStamp - $startDateStamp)/86400;
    $where = false;

    if ( isset( $_GET[ 's' ] ) ) {
        $where = true;
        $plus = ' WHERE severity <= '. (int) $_GET[ 's' ];
    } else {
        $plus = ' WHERE severity <= 7 ';
    }

    if ( !empty( $_GET[ 'f' ] ) && $_GET[ 'f' ] != "NA" ) {
        $where = true;
        $plus .= '   AND facility = "'. $_GET[ 'f' ] .'"';
    }
        
    if ( !empty( $_GET[ 'srcIp' ] ) ) {
        $where = true;
        $plus .= '   AND srcIp = "'. $_GET[ 'srcIp' ] .'"';
    }

    if ( !empty( $_GET[ 'dstIp' ] ) ) {
        $where = true;
        $plus .= '   AND dstIp = "'. $_GET[ 'dstIp' ] .'"';
    }

    if ( !empty( $_GET[ 'srcUsr' ] ) ) {
        $where = true;
        $plus .= '   AND srcUsr = "'. $_GET[ 'srcUsr' ] .'"';
    }

    if ( !empty( $_GET[ 'dstUsr' ] ) ) {
        $where = true;
        $plus .= '   AND dstUsr = "'. $_GET[ 'dstUsr' ] .'"';
    }

    if ($startStamp >= $endStamp) {
        // timestamp is weird, show this hour's data
        logQuery( $plus );
    } elseif ( 0 == $days ) {

    } else {
                


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

        $json[ 'queryRows' ] = $totalRows;
        $json[ 'queryStamp' ] = trim( shell_exec( 'date +%s' ) ) - $nowStamp;
        echo json_encode( $json );
    }
}

?>
