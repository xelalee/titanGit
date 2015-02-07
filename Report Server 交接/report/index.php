<?php
ob_start();
session_start();
if ($_SESSION['pass'] != 1) {
    header("Location:login.php");
}
?>


<!doctype html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Titan Report Server Web Ver 0.1 beta</title>
        <link href="css/maincss.css" rel="stylesheet" />
        <link rel="stylesheet" href="css/jquery-ui.css">
        <script src="js/jquery.js"></script>
        <script src="js/jquery-ui.js"></script>

        <script>
            $(function() {
                $("#menudiv").accordion();
            });

        </script>
    </head>

    <body>
        <div id="main">
            <div id="title">
                <a id="gotoindex" href="index.php"></a><a id="controlbutton"><input type="submit" id="deviceset" style="position: relative; top: 145px; left: 450px" value="裝置設定" /></a>
            </div>
            <div id="container">
                <table>
                    <td id="menu" style="border: solid 1px red">
<div id="menudiv">
                            <h1>網路狀態</h1>
                            <div>
                                <a href="functionpages/arp.php"><font size="2">顯示ARP列表</font></a><br/>
                                <a href="functionpages/routinglist.php"><font size="2">顯示路由列表</font></a><br/>
                                <a href="functionpages/dhcp.php"><font size="2">DHCP綁定</font></a><br/>
                                <a href="functionpages/netstatus.php"><font size="2">狀態摘要</font></a><br/>
                                <a href="functionpages/trafficstatistics.php"><font size="2">流量統計</font></a><br/>
                                <a><font size="2">WAN頻寬報告</font></a><br/>
                            </div>
                            <h1>系統狀態</h1>
                            <div>
                                <a href="functionpages/resource.php"><font size="2">可用資源</font></a><br/>
                                <a href="functionpages/netstatus.php"><font size="2">NAT狀態</font></a><br/>
                                <a><font size="2">使用者狀態</font></a><br/>
                            </div>
                            <h1>VPN狀態</h1>
                            <div>
                                <a><font size="2">連線狀態</font></a><br/>
                                <a><font size="2">IPSec VPN統計</font></a><br/>
                            </div>
                            <h1>網路報告</h1>
                            <div>
                                <a href="functionpages/trafficdirection.php"><font size="2">流量狀態</font></a><br/>
                                <a><font size="2">來源</font></a><br/>
                                <a><font size="2">目標</font></a><br/>
                            </div>
                            <h1>安全防護報告</h1>
                            <div>
                                <a href="functionpages/filestype.php"><font size="2">檔案形態</font></a><br/>
                                <a href="functionpages/blockhost.php"><font size="2">被封鎖的主機</font></a><br/>
                                <a><font size="2">受感染的主機</font></a><br/>
                                <a><font size="2">病毒防護</font></a><br/>
                            </div>
                        </div>
                    </td>
                    <td id="table" style="border:#002DFF solid 1px; vertical-align:top">
                        <div id="datadiv">
                        </div>
                    </td>
                </table>   
            </div>
        </div>
    </body>
</html>