<script>
    connectcolum('colum-<?php echo $_GET['rowscount'] ?>', '<?php echo $_GET['devicerows'] ?>', '8');
</script>

<div id='colum-<?php echo $_GET['rowscount'] ?>div'></div><br>
<div>
    <table style="border: 1px solid #000000; height: 10px">
        <td style="border: 1px solid #000000; width: 10%">Virus ID</td>
        <td style="border: 1px solid #000000; width: 40%">Extension</td>
        <td style="border: 1px solid #000000; width: 35%">Access Count</td>
        <td style="border: 1px solid #000000; width: 15%">Datetime</td>
    </table>
</div>