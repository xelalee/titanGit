<?php

if ( empty( $_GET ) ) {
    die( 'please make sure what u want !?' );
}

// set default time zone
date_default_timezone_set('UTC');

// switch function via param
// connect archer first

$query = 'SELECT * ';

if ( 'wan_bandwidth_report' == $_GET[ 'param' ] ) {
    prepareChart( 'wanbandwidth', $_GET[ 'q' ] );
} elseif ( 'resource_utilization' == $_GET[ 'param' ] ) {
    if ( 0 == $_GET[ 'q' ] ) {
        prepareChart( 'cpuusage', false );
    } else {
        prepareChart( 'memusage', false );
    }
}


function prepareChart( $table, $where ) {
    $datetime = 'datetime';
    $limit = 360;
    $query  = 'SELECT * ';
    $tmp = '';

    switch( $_GET[ 't' ] )
    {
    case 0:
        $query .= ', (datetime DIV 10) * 10 as date ';
        $query .= ' FROM `hour_'. $table .'` ';
        break;
    case 1:
        $query .= ', (datetime DIV 500) * 500 as date ';
        $query .= ' FROM `day_'. $table .'` ';
        $limit = 288;
        break;
    case 2:
        $query .= ', (datetime DIV 3000) * 3000 as date ';
        $query .= ' FROM `week_'. $table .'` ';
        $limit = 336;
        break;
    case 3:
        $query .= ', (datetime DIV 20000) * 20000 as date ';
        $query .= ' FROM `month_'. $table .'` ';
        $table  = 'month';
        break;
    case 4:
        $query .= ' FROM `year_'. $table .'` ';
        $datetime = 'date';
        $limit = 365;
        break;
    }

    if ($where) {
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
    } elseif ( !empty ($_GET[ 'sd' ] ) ) {
        if ( !empty( $_GET[ 'ed' ] ) ) {
            $query .= ' WHERE '. $datetime .' BETWEEN "'. $_GET[ 'sd' ] .' '. $_GET[ 'sh' ] .':'. $_GET[ 'sm' ] .':00" AND "'. $_GET[ 'ed' ] .' '. $_GET[ 'eh' ] .':'. $_GET[ 'em' ] .':59"';
        }else {
            $query .= ' WHERE '. $datetime .' > "'. $_GET[ 'sd' ] .' '. $_GET[ 'sh' ] .':'. $_GET[ 'sm' ] .':00"';
        }
    }elseif ( !empty( $_GET[ 'ed' ] ) ) {
        $query .= ' WHERE '. $datetime .' < "'. $_GET[ 'ed' ] .' '. $_GET[ 'eh' ] .':'. $_GET[ 'em' ] .':59"';
    }

    $query .= ' ORDER BY date DESC ';
    $query .= ' LIMIT '. $limit;

    $mysqli = new mysqli( "127.0.0.1", "archer", "rehcra", 'archer', 3306 );
    if ( $result = $mysqli->query( $query ) ) {
        // fetch object array
        $totalRows = $result->num_rows;
        if ($where) {
            if (4 == $_GET['t']) {
                while ($obj = $result->fetch_object()) {
                    $json['queryResults'][] = array("datetime" => str_replace("-", "/", $obj->date), "Transmit" => $obj->txRate, "Receive" => $obj->rxRate);
                }
            } else {
                while ($obj = $result->fetch_object()) {
                    $json['queryResults'][] = array("datetime" => str_replace("-", "/", $obj->datetime), "Transmit" => $obj->txRate, "Receive" => $obj->rxRate);
                }
            }
        } else {
            if ($_GET['t'] == 4) {
                while ($obj = $result->fetch_object()) {
                    $json['queryResults'][] = array("datetime" => str_replace("-", "/", $obj->date), "usage" => number_format( $obj->usage, 2, '.', '' ));
                }
            }else {
                while ($obj = $result->fetch_object()) {
                    $json['queryResults'][] = array("datetime" => str_replace("-", "/", $obj->datetime), "usage" => number_format(  $obj->usage, 2, '.', '' ));
                }
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

?>
