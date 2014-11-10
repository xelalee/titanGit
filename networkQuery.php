<?php

require_once('ttwQuery.php');

class TTWNQuery extends TTWQuery
{
    function doSet( $param, $q, $limit=20, $db=false, $hr=false ) {
        $this->hourly = 'raw_sessions';
        if (!$db) {
            $db = $this->conf[ 'db' ];
        }

        if (!$hr) {
            $hr = $this->conf[ 'thisHour' ];
        }

        switch( $param )
        {
        case 'traffic_direction':
            $this->queryStr = "SELECT ";
            switch ($q)
            {
            case 0:
                $this->queryStr .= "* FROM $db.`$this->hourly" ."_". $hr ."`";
                break;
            case 1:
                $this->queryStr .= "CONCAT_WS('-', srcIp, dstIp) as address, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes";
                $this->queryStr .= ", count(*) as sessions ";
                $this->queryStr .= "  FROM $db.`$this->hourly" ."_". $hr ."`";
                $this->queryStr .= " GROUP BY address";
                break;
            case 2:
                $this->queryStr .= "srcIp, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes";
                $this->queryStr .= ", count(*) as sessions ";
                $this->queryStr .= "  FROM $db.`$this->hourly" ."_". $hr ."`";
                $this->queryStr .= " GROUP BY srcIp";
                break;
            case 3:
                $this->queryStr .= "dstIp, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes";
                $this->queryStr .= ", count(*) as sessions ";
                $this->queryStr .= "  FROM $db.`$this->hourly" ."_". $hr ."`";
                $this->queryStr .= " GROUP BY dstIp";
                break;
            case 4:
                $this->queryStr .= "protocol, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes";
                $this->queryStr .= ", count(*) as sessions ";
                $this->queryStr .= "  FROM $db.`$this->hourly" ."_". $hr ."`";
                $this->queryStr .= " GROUP BY protocol";
                break;
            case 5:
                $this->queryStr .= "dstPort, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes";
                $this->queryStr .= ", count(*) as sessions ";
                $this->queryStr .= "  FROM $db.`$this->hourly" ."_". $hr ."`";
                $this->queryStr .= " GROUP BY dstPort";
                break;
            case 6:
                $this->queryStr .= "CONCAT_WS('-', fromZone, toZone) as zone, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes";
                $this->queryStr .= ", count(*) as sessions ";
                $this->queryStr .= "  FROM $db.`$this->hourly" ."_". $hr ."`";
                $this->queryStr .= " GROUP BY zone";
                break;
            }

            $this->queryStr .= ' ORDER BY totalBytes DESC LIMIT '. $limit;
            break;
        }
    }

    function doTmp( $param, $q ) {
        $this->tmp = "(";
        $this->tmp .= "`id` int(11) NOT NULL AUTO_INCREMENT,";

        switch( $param )
        {
        case 'traffic_direction':
            $this->hourly = 'row_sessions';
            switch( $q )
            {
            case 1:
                $this->daily  = 'daily_addrTraffic';

                $this->tmp .= "`srcIp` varchar(16) NOT NULL DEFAULT '',";
                $this->tmp .= "`dstIp` varchar(16) NOT NULL DEFAULT '',";
                $this->tmp .= "`txBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`rxBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`totalBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`sessions` bigint(20) DEFAULT NULL,";

                $this->hourlyQ = 'srcIp, dstIp, txBytes, rxBytes, totalBytes, 1 as sessions';
                $this->dailyQ  = 'srcIp, dstIp, txBytes, rxBytes, totalBytes, sessions';
                $this->aggQ = 'CONCAT_WS("-", srcIp, dstIp) as address, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes';
                break;
            case 2:
                $this->daily  = 'daily_srcAddrTraffic';

                $this->tmp .= "`srcIp` varchar(16) NOT NULL DEFAULT '',";
                $this->tmp .= "`txBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`rxBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`totalBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`sessions` bigint(20) DEFAULT NULL,";

                $this->hourlyQ = 'srcIp, txBytes, rxBytes, totalBytes, 1 as sessions';
                $this->dailyQ  = 'srcIp, txBytes, rxBytes, totalBytes, sessions';
                $this->aggQ = 'srcIp, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes';
                break;
            case 3:
                $this->daily  = 'daily_dstAddrTraffic';

                $this->tmp .= "`dstIp` varchar(16) NOT NULL DEFAULT '',";
                $this->tmp .= "`txBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`rxBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`totalBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`sessions` bigint(20) DEFAULT NULL,";

                $this->hourlyQ = 'dstIp, txBytes, rxBytes, totalBytes, 1 as sessions';
                $this->dailyQ  = 'dstIp, txBytes, rxBytes, totalBytes, sessions';
                $this->aggQ = 'dstIp, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes';
                break;
            case 4:
                $this->daily  = 'daily_protoTraffic';

                $this->tmp .= "`protocol` int(11) DEFAULT NULL,";
                $this->tmp .= "`txBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`rxBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`totalBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`sessions` bigint(20) DEFAULT NULL,";

                $this->hourlyQ = 'protocol, txBytes, rxBytes, totalBytes, 1 as sessions';
                $this->dailyQ  = 'protocol, txBytes, rxBytes, totalBytes, sessions';
                $this->aggQ = 'protocol, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes';
                break;
            case 5:
                $this->daily  = 'daily_dstPortTraffic';

                $this->tmp .= "`dstPort` int(11) DEFAULT NULL,";
                $this->tmp .= "`txBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`rxBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`totalBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`sessions` bigint(20) DEFAULT NULL,";

                $this->hourlyQ = 'dstPort, txBytes, rxBytes, totalBytes, 1 as sessions';
                $this->dailyQ  = 'dstPort, txBytes, rxBytes, totalBytes, sessions';
                $this->aggQ = 'dstPort, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes';
                break;
            case 6:
                $this->daily  = 'daily_zoneTraffic';

                $this->tmp .= "`fromZone` varchar(64) NOT NULL DEFAULT '',";
                $this->tmp .= "`toZone` varchar(64) NOT NULL DEFAULT '',";
                $this->tmp .= "`txBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`rxBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`totalBytes` bigint(20) DEFAULT NULL,";
                $this->tmp .= "`sessions` bigint(20) DEFAULT NULL,";

                $this->hourlyQ = 'fromZone, toZone, txBytes, rxBytes, totalBytes, 1 as sessions';
                $this->dailyQ  = 'fromZone, toZone, txBytes, rxBytes, totalBytes, sessions';
                $this->aggQ = 'CONCAT_WS("-", fromZone, toZone) as zone, SUM(txBytes) as txBytes, SUM(rxBytes) as rxBytes, SUM(totalBytes) as totalBytes';
                break;
            }
            break;
         }

        $this->tmp .= "PRIMARY KEY (`id`)";
        $this->tmp .= ")";
        $this->tmpTable = $this->conf[ 'db' ] . '`'. $this->daily .'-'. $this->conf[ 'thisTimeStamp' ] .'`';
        $this->tmp  = "CREATE TEMPORARY TABLE IF NOT EXISTS ". $this->tmpTable . $this->tmp;
    }

    function doQueue( $param, $flag=false, $sd='', $sh='', $ed='', $eh='' ) {
        $json = array();
        switch( $param )
        {
        case 'traffic_direction':
            if ($flag) {
                // range, set tmp
                $sdStamp = trim( shell_exec( 'date -d "$sd 00:00:00" +%s' ) );
                $edStamp = trim( shell_exec( 'date -d "$ed 00:00:00" +%s' ) );
                $shStamp = $sdStamp + $sh * 3600;
                $ehStamp = $edStamp + $eh * 3600;
                $rows = 20;
                for ($i=0; $i<=6; $i++)
                {
                    switch( $i )
                    {
                    case 0:
                        // get all and send first 20 back
                        if ( $ehStamp > $shStamp ) {
                            $days = ( $edStamp - $sdStamp ) / 86400;
                            if ( 0 === $days ) {
                                $db = str_replace( "-", "_", $ed );
                                $this->doSet( $param, $i );
                                $json[ $i ].queryRows = 0;
                                for ($j=$eh; $j>=$sh; $j--)
                                {
                                    // count rows
                                    $cnt = $json[ $i ][ 'queryRows' ];
                                    $cnted = $this->doInfo( $db, $this->hourly .'_'. sprintf("%02d", $j) );
                                    if ($cnted > 0) {
                                        $json[ $i ][ 'queryRows' ] += $cnted;
                                        if ($json[ $i ][ 'queryRows' ] >= 0 && $rows > 0) {
                                            $this->doQuery( $this->queryStr );
                                        }
                                    }
                                }
                            } else {
print_r ( 'wow' );
                            }
                        } else {
                            // current
                            $this->doSet( $param, $i );
                            $json[ $i ] = $this->doQuery( $this->queryStr );
                        }
                        break;
                    default:
                        $this->doTmp( $param, $i );
                        $this->doQuery( $this->tmp );
                        break;
                    }
                }
            } else {
                // current
                for ($i=0; $i<=6; $i++)
                {
                    $this->doSet( $param, $i );
                    $json[ $i ] = $this->doQuery( $this->queryStr );
                }
            }
            break;
        }
        return $json;
    }
}

    // init
    $nq = new TTWNQuery();
    if ($argv[ 1 ]) {
        // command
        switch( $argv[ 1 ] )
        {
        case 'traffic_direction':
            if ( $argv[ 2 ] ) {
                // range
                print_r( json_encode( $nq->doQueue( $argv[ 1 ], true, $argv[ 2 ], $argv[ 3 ], $argv[ 4 ], $argv[ 5 ] ) ) );
            } else {
                // current
                print_r( json_encode( $nq->doQueue( $argv[ 1 ] ) ) );
            }
            break;
        }
    } elseif ( $_GET[ 'param' ]) {
print_r( json_encode( array( "http" => 1 ) ) );
        // GUI
        switch( $_GET[ 'param' ] )
        {
        case 'traffic_direction':
            // current data
            switch( $_GET[ 'q' ] )
            {
            case 0:
                break;
            }
            break;
        }
    }

?>
