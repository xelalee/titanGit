<div id="<?php echo $_POST['id']; ?>" style="height: 400px"></div>

<?php
include '../../dbconnect.php';
mysql_query("SET NAMES 'utf8'");

$dbname = $_POST['dbname'];
$tablename = $_POST['tablename'];
$dbtable = $_POST['dbtable'];
//目前尚未用到，正式動態時要放入Sql語法內

$systemsql = "SELECT * FROM `".$dbname."`.`".$dbtable."` WHERE `serial` LIKE '".$_POST['device']."' LIMIT 20;";
$result = mysql_query($systemsql) or die(mysql_error());
$count = split('-', $_POST['id']);

?>

<script>
    $('#<?php echo $_POST['id']; ?>').highcharts({
        chart: {
            type: 'column',
            margin: 75,
            options3d: {
                enabled: true,
                alpha: 10,
                beta: 25,
                depth: 70
            }
        },
        title: {
            text: 'Device ' + '<?php echo $count[count($count) - 1] ?>'
        },
        subtitle: {
            text: '<?php echo $tablename; ?>'
        },
        plotOptions: {
            column: {
                depth: 25
            }
        },
        xAxis: {
            categories: Highcharts.getOptions().lang.shortMonths
        },
        yAxis: {
            opposite: true
        },
        series: [{
                name: '使用量(%)',
                <?php
                $datamessage = "data:[";
                while($rows = mysql_fetch_array($result))
                {
                    $datamessage = $datamessage . $rows[(int)$_POST['tablenum']] . ',';
                }
                
                $datamessage = $datamessage . ']';
                echo $datamessage;
                ?>
            }]
    });
    
    
   
</script>