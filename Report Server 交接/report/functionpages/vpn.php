<?php
ob_start();
session_start();
if ($_SESSION['pass'] != 1) {
    header("Location:login.php");
}

include '../dbconnect.php';
mysql_query("SET NAMES 'utf8'");
//mysql_select_db($_POST['dbname']);
//$sql = "SELECT * FROM `des_" . date("Y_m_d") . "`;";
?>


<!doctype html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Titan Report Server Web Ver 0.1 beta</title>
        <link href="../css/maincss.css" rel="stylesheet" />
        <link rel="stylesheet" href="../css/jquery-ui.css">
        <script src="../js/jquery.js"></script>
        <script src="../js/jquery-ui.js"></script>
        <script src="../js/highcharts.js"></script>
        <script src="../js/highcharts-3d.js"></script>
        <script src="../js/modules/exporting.js"></script>

        <script>
            $(function () {
                $("#menudiv").accordion({
                    active: 3
                });

                $("#tabs").tabs({
                    beforeLoad: function (event, ui) {
                        ui.jqXHR.error(function () {
                            ui.panel.html(
                                    "Couldn't load this tab. We'll try to fix this as soon as possible. " +
                                    "If this wouldn't be a demo.");
                        });
                    }
                });
            });

            $(function () {
                $(".column").sortable({
                    connectWith: ".column",
                    handle: ".portlet-header",
                    cancel: ".portlet-toggle",
                    placeholder: "portlet-placeholder ui-corner-all"
                });

                $(".portlet")
                        .addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
                        .find(".portlet-header")
                        .addClass("ui-widget-header ui-corner-all")
                        .prepend("<span class='ui-icon ui-icon-minusthick portlet-toggle'></span>");

                $(".portlet-toggle").click(function () {
                    var icon = $(this);
                    icon.toggleClass("ui-icon-minusthick ui-icon-plusthick");
                    icon.closest(".portlet").find(".portlet-content").toggle();
                });
            });

            function connectcolum(obj, device, tablenum, tablename, dbname, dbtable)
            {
                $.ajax({
                    type: "POST",
                    url: "../functionpages/charts/column.php",
                    data: "id=" + obj + "&device=" + device + "&tablenum=" + tablenum + "&tablename=" + tablename + "&dbname=" + dbname + "&dbtable=" + dbtable,
                    success: function (msg) {
                        $("#" + obj + "div").html(msg);
                    }
                });
            }
            
            function connectpie(obj, device, tablename)
            {
                $.ajax({
                    type: "POST",
                    url: "../functionpages/charts/pie.php",
                    data: "id=" + obj + "&device=" + device + "&tablenum=" + tablename,
                    success: function (msg) {
                        $("#" + obj + "div").html(msg);
                    }
                });
            }

        </script>
    </head>

    <body>
        <div id="main">
            <div id="title">
                <a id="gotoindex" href="../index.php"></a><a id="controlbutton"><input type="submit" id="deviceset" style="position: relative; top: 145px; left: 450px" value="裝置設定" /></a>
            </div>
            <div id="container">
                <table>
                    <td id="menu" style="border: solid 1px red">
                        <div id="menudiv">
                            <h1>網路狀態</h1>
                            <div>
                                <a href="arp.php"><font size="2">顯示ARP列表</font></a><br/>
                                <a href="routinglist.php"><font size="2">顯示路由列表</font></a><br/>
                                <a href="dhcp.php"><font size="2">DHCP綁定</font></a><br/>
                                <a href="netstatus.php"><font size="2">狀態摘要</font></a><br/>
                                <a href="trafficstatistics.php"><font size="2">流量統計</font></a><br/>
                                <a><font size="2">WAN頻寬報告</font></a><br/>
                            </div>
                            <h1>系統狀態</h1>
                            <div>
                                <a href="resource.php"><font size="2">可用資源</font></a><br/>
                                <a href="netstatus.php"><font size="2">NAT狀態</font></a><br/>
                                <a><font size="2">使用者狀態</font></a><br/>
                            </div>
                            <h1>VPN狀態</h1>
                            <div>
                                <a><font size="2">連線狀態</font></a><br/>
                                <a><font size="2">IPSec VPN統計</font></a><br/>
                            </div>
                            <h1>網路報告</h1>
                            <div>
                                <a href="trafficdirection.php"><font size="2">流量狀態</font></a><br/>
                                <a><font size="2">來源</font></a><br/>
                                <a><font size="2">目標</font></a><br/>
                            </div>
                            <h1>安全防護報告</h1>
                            <div>
                                <a href="filestype.php"><font size="2">檔案形態</font></a><br/>
                                <a><font size="2">被封鎖的主機</font></a><br/>
                                <a><font size="2">受感染的主機</font></a><br/>
                                <a><font size="2">病毒防護</font></a><br/>
                            </div>
                        </div>
                    </td>
                    <td id="table" style="border:#002DFF solid 1px; vertical-align:top">
                        <div id="datadiv">
                            <div id="tabs">
                                <div><a>首頁&nbsp;&nbsp;>>&nbsp;&nbsp;網路狀態&nbsp;&nbsp;>>&nbsp;&nbsp;<font style="color: red">流量狀態</font></a></div><br>
                               
                                <ul>
                                    <?php
                                    $devicesql = "SELECT * FROM `report_device_data`.`device_data`;";
                                    $deviceresult = mysql_query($devicesql) or die(mysql_error());
                                    $rowscount = 0;
                                    while ($devicerows = mysql_fetch_array($deviceresult)) {
                                        $rowscount++;
                                        echo '<li><a href="trafficdirection_detail.php?rowscount=' . $rowscount . '&devicerows=' . $devicerows[1] . '">Device-' . $rowscount . '</a></li>';
                                    }
                                    ?>
                                </ul>
                            </div>
                        </div>
                    </td>
                </table>   
            </div>
        </div>
    </body>
</html>