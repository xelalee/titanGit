<?php 
	ob_start();
	session_start();
?>

<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<title>Titan Report Server Web Ver 0.1 beta</title>
</head>

<body>
<?php
	
	$userid = $_POST["id"];
	$userpass = $_POST["pass"];
	
	$dbhost = "localhost";
	$dbuser = "titan";
	$dbpass = "titan168";
	$dbname = "report_user_db";
	$conn = mysql_connect($dbhost, $dbuser, $dbpass) or die(mysql_error());
	mysql_query("SET NAMES 'utf8'");
	mysql_select_db($dbname);
	$sql = "SELECT * FROM `user_data` WHERE `id` LIKE '".$userid."'";
	$result = mysql_query($sql) or die(mysql_error());
	if((mysql_num_rows($result)) != 0)
	{ 
		$rows = mysql_fetch_array($result);
		if($rows[2] == $userpass)
		{
			$_SESSION["pass"] = 1;
			header("Location:index.php");
		}
		else
		{
			header("Location:login.php?error=1");
		}
	}
	else
	{ 
		header("Location:login.php?error=1");
	}
?>
</body>
</html>

<?php
	ob_end_flush();
?>
