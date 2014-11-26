<?php

if (empty($_GET)) {
    die('no comment');
}

$param = $_GET['param']; 

$mysqli = new mysqli("127.0.0.1", "syslog", "", "syslog", 3306);

/* check connection */
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

switch($param)
{
case 'view_logs':
    $query = 'DELETE FROM logs WHERE 1=1'; 
    mysqli_query($mysqli, $query);
    $json = array();
    $json['status'] = '0';
    echo json_encode($json);
    break;
}

/* close connection */
$mysqli->close();
?>
