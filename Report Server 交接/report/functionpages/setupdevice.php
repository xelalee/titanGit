<?php
    include '../dbconnect.php';
    mysql_query("SET NAMES 'utf8'");
    mysql_select_db($_POST['dbname']);
    $sql = "SELECT * FROM `device_data`";
    $result = mysql_query($sql);
?>

<div>
    <?php
        $rows = mysql_fetch_array($result);
        echo $rows[1];
    ?>
</div>