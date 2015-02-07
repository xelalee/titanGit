<!doctype html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Titan Report Server Web Ver 0.1 beta</title>
        <link href="css/logincss.css" rel="stylesheet" />
        <link href="css/jquery-ui.css" rel="stylesheet" />
        <script src="js/jquery.js"></script>
        <script src="js/jquery-ui.js"></script>
    </head>

    <body>
        <?php
        echo '<script language="javascript" >';
        echo 'var errorcode = ' . $_GET['error'];
        echo '</script>';
        ?>
        <div id="logindiv">
            <div>
                <form action="loginfunction.php" method="POST">
                    <a>請輸入帳號:&nbsp;</a><input type="text" id="loginid" name="id" /><br/>
                    <br/>
                    <a>請輸入密碼:&nbsp;</a><input type="text" id="loginid" name="pass" /><br/>
                    <br/>
                    <a style="margin-left: 180px"><input type="submit" id="loginbtn" value="登入" /></a>
                </form>
            </div>
        </div>
    </body>
</html>

<script language="javascript">
    if (errorcode === 1)
    {
        window.alert("帳號或密碼錯誤");
    }
</script>
