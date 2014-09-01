<?php

if ( empty( $_GET ) ) {
    die( 'please make sure what u want !?' );
}

// set default time zone
date_default_timezone_set('UTC');

// switch function via param
// connect archer first

// view log
if ('view_logs' == $_GET[ 'param' ] ) {
    logQuery( 'logs' );
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
        // today
        $days = 1;
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
