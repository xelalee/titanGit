<div id="<?php echo $_POST['id']; ?>" style="height: 400px"></div>

<?php
include '../../dbconnect.php';
mysql_query("SET NAMES 'utf8'");

$systemsql = "SELECT * FROM `report_system_db`.`dec_test` WHERE `serial` LIKE '".$_POST['device']."';";
$result = mysql_query($systemsql) or die(mysql_error());

$count = split('-', $_POST['id']);
?>

<script>
 $('#<?php echo $_POST['id']; ?>').highcharts({
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: 'Files Type TOP 10'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'FileType(%)',
            data: [
                ['EXE',   45.0],
                ['RAR',   26.8],
                ['ZIP',    8.5],
                ['Z',     6.2],
                ['DLL',   0.7]
            ]
        }]
    });
</script>