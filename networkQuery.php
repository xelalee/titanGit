<?php

require_once('ttwQuery.php');

class TTWNQuery extends TTWQuery
{
    function doSet( $param, $q ) {
        $this->hourly = 'row_sessions';
        switch( $param )
        {
        case 'traffic_direction':
            switch ($q)
            {
            case 0:
                $this->rowQ = "SELECT * FROM $this->conf[ 'db' ].`$this->hourly" ."_". $this->conf[ 'thisHour' ] ."` ORDER BY totalBytes";
                break;
            case 1:

                break;
            case 2:

                break;
            case 3:

                break;
            case 4:

                break;
            case 5:

                break;
            case 6:

                break;
            }
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
}

    // init
    if ($argv[ 1 ]) {
        // command
echo ' command ';
    } elseif ( $_GET[ 'param' ]) {
echo ' gui ';
        $nq = new TTWNQuery();
        // GUI
        switch( $_GET[ 'param' ] )
        {
        case 'traffic_direction':
            // current data

            break;
        }
    }

?>
