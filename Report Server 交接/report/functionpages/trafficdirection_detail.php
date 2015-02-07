<script>
    connectcolum('colume-<?php echo $_GET['rowscount'] ?>', '<?php echo $_GET['devicerows'] ?>', '22', '傳輸量統計', 'report_traffic_db', 'des_2014_08_21');

    connectpie('pie-<?php echo $_GET['rowscount'] ?>', '<?php echo $_GET['devicerows'] ?>', '9', '傳輸量 TOP10');
</script>

<?php
include '../dbconnect.php';
mysql_query("SET NAMES 'utf8'");

$systemsql = "SELECT * FROM `report_traffic_db`.`des_2014_08_21` WHERE `serial` LIKE '" . $_GET['devicerows'] . "' LIMIT 50;";
$result = mysql_query($systemsql) or die(mysql_error());
?>

<table>
    <td style="width: 50%"><div id='colume-<?php echo $_GET['rowscount'] ?>div'></div></td>
    <td style="width: 50%"><div id='pie-<?php echo $_GET['rowscount'] ?>div'></div></td>
    <tr></tr>
    <td colspan="2">
        <br/>
        <div>
            <table style="border: #000 1px solid; width: 100%; height: 10px">
                <td>來源位址</td>
                <td>目的位址</td>
                <td>來源埠</td>
                <td>目的埠</td>
                <td>來源區域</td>
                <td>傳送區域</td>
                <td>傳輸量(上傳)</td>
                <td>傳輸量(下載)</td>
                <td>傳輸量(總和)</td><tr></tr>
                <?php
                    while($rows = mysql_fetch_array($result))
                    {
                        echo "<td>".$rows[10]."</td>";
                        echo "<td>".$rows[11]."</td>";
                        echo "<td>".$rows[12]."</td>";
                        echo "<td>".$rows[13]."</td>";
                        echo "<td>".$rows[18]."</td>";
                        echo "<td>".$rows[19]."</td>";
                        echo "<td>".$rows[22]."</td>";
                        echo "<td>".$rows[23]."</td>";
                        
                        $trtotal = $rows[22] + $rows[23];
                        
                        echo "<td>".$trtotal."</td>";
                        echo "<tr></tr>";
                    }
                ?>
            </table>
        </div>
    </td>
</table>