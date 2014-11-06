<?php
/******************************************************************************
* TTWQuery                                                                    *
*                                                                             *
* Version: 1.0                                                                *
* Date:    2014-11-04                                                         *
* Author:  Alex Lee                                                           *
*******************************************************************************/
define( 'TTWQuery_Version', '1.0' );

class TTWQuery
{
    var $conf;      // config
    var $mysqli;    // mysql instance
    var $tmp;       // tmp
    var $tmpTable;  // tmp table
    var $hourly;    // hourly table
    var $daily;     // daily table
    var $hourlyQ;   // hourly query string
    var $dailyQ;    // daily query string
    var $aggQ;      // query string
    var $rowQ;      // row data query string

/*******************************************************************************
*                                                                              *
*                               Public methods                                 *
*                                                                              *
*******************************************************************************/
    function TTWQuery( $flag=false ) {
        $this->conf = array();
        $this->conf[ 'thisDay' ]  = trim( shell_exec( 'date "+%Y-%m-%d"' ) );
        $this->conf[ 'thisHour' ] = trim( shell_exec( 'date "+%H"' ) );
        $this->conf[ 'thisWeek' ] = trim( shell_exec( 'date "+%w"' ) );
        $this->conf[ 'thisDayStamp' ]  = trim( shell_exec( 'date -d "'. $this->conf[ 'thisDay' ] .' 00:00:00" +%s' ) );
        $this->conf[ 'thisHourStamp' ] = trim( shell_exec( 'date -d "'. $this->conf[ 'thisDay' ] .' '. $this->conf[ 'thisHour' ] .':00:00" +%s' ) );
        $this->conf[ 'thisTimeStamp' ] = trim( shell_exec( 'date "+%s"' ) );
        $this->conf[ 'db' ] = str_replace( "-", "_", $this->conf[ 'thisDay' ] );

        if ($flag) {
            $this->_doConA();
        } else {
            $this->_doCon();
        }
    }

    function doSet( $param, $q ) {

    }

    function doHourly( $param, $q, $flag ) {

    }

    function doDaily( $param, $q, $flag ) {

    }

    function doInfo( $db, $tbl ) {
        $this->mysqli->query( "SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '$db' AND TABLE_NAME = '$tbl'" );
    }

    function doQuery( $tbl, $stmt, $gno ) {
        $json = array();
        if ($result = $this->mysqli->query( "SELECT $stmt FROM $tbl $gno" )) {
            $json[ 'queryRows' ] = $result->num_rows;
            while ( $obj = $result->fetch_object() ) {
                $json[ 'queryResults' ][] = $obj;
            }
            // free result set
            $result->close();
        }
        return $json;
    }

    function doInsert( $tbl, $stmt ) {
        $this->mysqli->query( "INSERT INTO $tbl SELECT $stmt" );
    }

    function doCreate( $stmt ) {
        $this->mysqli->query( $stmt );
    }

    function doDump( $dumper ) {
        var_dump( $dumper );
    }

    function doDisCon() {
        $this->mysqli->close();
    }
/*******************************************************************************
*                                                                              *
*                              Protected methods                               *
*                                                                              *
*******************************************************************************/
    function _doCon() {
        $this->mysqli = new mysqli("127.0.0.1", "", "", $this->conf[ 'db' ], 3306);
    }

    function _doConA() {
        $this->mysqli = new mysqli("127.0.0.1", "archer", "rehcra", "archer", 3306);
    }
}
?>
