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
    queryTop( 'network_top_ZtoZ', 'trafficAmount' );
    break;
case 'top_source':
    queryTop( 'network_top_srcIpTraffic', 'txrxsum' );
    break;
case 'top_destination':
    queryTop( 'network_top_dstIpTraffic', 'txrxsum' );
    break;
case 'top_file_extension':
    queryTop( 'security_top_file_access', 'accessCount' );
    break;
case 'top_blocked_host':
    queryTop( 'security_top_blocked_host', 'totalCount' );
    break;
case 'top_affected_host':
    queryTop( 'security_top_affected_host', 'totalCount' );
    break;
case 'top_antivirus':
    queryTop( 'security_top_antivirus', 'hitCount' );
    break;
}

function queryTop( $table, $orderBy ) {
    $query  = 'SELECT * ';
    $query .= '  FROM `'. $table .'`';
    $query .= ' ORDER BY '. ( ( empty( $_GET[ 'oby' ] ) )? $orderBy : $_GET[ 'oby' ] ) . ( ( empty( $_GET[ 'asc' ] ) )? ' DESC' : ' ASC' );
    $query .= ' LIMIT 10';

    $mysqli = new mysqli( "127.0.0.1", "archer", "rehcra", 'archer', 3306 );
    if ( $result = $mysqli->query( $query ) ) {
        // fetch object array
        $totalRows = $result->num_rows;
        while ($obj = $result->fetch_object()) {
            $json['queryResults'][] = $obj;
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
