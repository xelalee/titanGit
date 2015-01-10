<?php

require_once('ttwQuery.php');

class TTWSQuery extends TTWQuery
{
    function doSet( $param, $q ) {
        $this->tmp = "(";
        $this->tmp .= "`id` int(11) NOT NULL AUTO_INCREMENT,";

        switch( $param )
        {
        case 'file_extension':
            $this->daily  = 'daily_file_access';
            $this->hourly = 'row_file_access';

            $this->tmp .= "`extension` varchar(64) NOT NULL DEFAULT '',";
            $this->tmp .= "`accessCount` int(11) DEFAULT NULL,";
            $this->tmp .= "`date` datetime NOT NULL,";

            $this->allQ = 'extension, SUM( accessCount ) as accessCount';
            break;
        case 'blocked_host':
            $this->daily  = 'daily_blocked_host';
            $this->hourly = 'row_blocked_host';

            $this->tmp .= "`ip` varchar(16) NOT NULL DEFAULT '',";
            $this->tmp .= "`virusCount` int(11) DEFAULT NULL,";
            $this->tmp .= "`firewallCount` int(11) DEFAULT NULL,";
            $this->tmp .= "`date` datetime NOT NULL,";

            $this->allQ = 'ip, SUM( virusCount ) as virusCount, SUM( firewallCount ) as firewallCount';
            break;
        case 'affected_host':
            $this->daily  = 'daily_affected_host';
            $this->hourly = 'row_affected_host';

            $this->tmp .= "`ip` varchar(16) NOT NULL DEFAULT '',";
            $this->tmp .= "`virusHitCount` int(11) DEFAULT NULL,";
            $this->tmp .= "`sigHitCount` int(11) DEFAULT NULL,";
            $this->tmp .= "`date` datetime NOT NULL,";

            $this->allQ = 'ip, SUM( virusHitCount ) as virusHitCount, SUM( sigHitCount ) as sigHitCount';
            break;
        case 'antivirus_report':
            $this->daily  = 'daily_antivirus';
            $this->hourly = 'row_antivirus';

            $this->tmp .= "`srcIp` varchar(16) NOT NULL DEFAULT '',";
            $this->tmp .= "`dstIp` varchar(16) NOT NULL DEFAULT '',";
            $this->tmp .= "`protocol` varchar(32) NOT NULL DEFAULT '',";
            $this->tmp .= "`virusName` varchar(64) NOT NULL DEFAULT '',";
            $this->tmp .= "`hitCount` int(11) DEFAULT NULL,";
            $this->tmp .= "`date` datetime NOT NULL,";

            switch( $q )
            {
            case 1:
                $this->allQ = 'srcIp, SUM( hitCount ) as hitCount';
                break;
            case 2:
                $this->allQ = 'dstIp, SUM( hitCount ) as hitCount';
                break;
            case 3:
                $this->allQ = 'virutsName, SUM( hitCount ) as hitCount';
                break;
            case 4:
                $this->allQ = 'protocol, SUM( hitCount ) as hitCount';
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

    } elseif ( $_GET[ 'param' ]) {
        $nq = new TTWSQuery();
        // GUI
        switch( $_GET[ 'param' ] )
        {
        case 'file_extension':
            // current data
            break;
        case 'blocked_host':
            // current data
            break;
        case 'affected_host':
            // current data
            break;
        case 'antivirus_report':
            // current data
            break;
        }
    }


?>
