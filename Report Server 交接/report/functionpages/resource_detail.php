<script>
    connectcolum('cpu-<?php echo $_GET['rowscount'] ?>', '<?php echo $_GET['devicerows'] ?>', '8', 'CPU使用狀態','report_system_db','dec_test');
    connectcolum('mem-<?php echo $_GET['rowscount'] ?>', '<?php echo $_GET['devicerows'] ?>', '9', 'Memory使用狀態','report_system_db','dec_test');
</script>
<div id='cpu-<?php echo $_GET['rowscount'] ?>div'></div><br><br>
<div id='mem-<?php echo $_GET['rowscount'] ?>div'></div><br>
