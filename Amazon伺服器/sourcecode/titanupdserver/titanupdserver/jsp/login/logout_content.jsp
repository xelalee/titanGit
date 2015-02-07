<%
	String rootDirectory = (String)request.getContextPath();
%>
<html>
<head>
<title>Untitled Document</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">
</head>

<body leftmargin="0" topmargin="0">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr> 
    <td width="22" height="27" rowspan="2">&nbsp;</td>
    <td width="486"> <p><br>
        <font color="#999999" size="3" face="Arial, Helvetica, sans-serif"><strong><font color="#999999" size="3" face="Arial, Helvetica, sans-serif"><font size="1" face="Verdana, Arial, Helvetica, sans-serif"><strong> 
        <span class="title0">Logout</span></strong></font></font></strong></font><font color="#999999" size="3" face="Arial, Helvetica, sans-serif"><strong><font color="#999999" size="3" face="Arial, Helvetica, sans-serif"><font size="1" face="Verdana, Arial, Helvetica, sans-serif"><span class="title0">/<strong> 
        </strong></span></font></font><font color="#006699"><br>
        </font></strong></font><br>
        <span class="title1"> Logout</span><br>
        <hr align="left" color="#333333" width="100%" size="1">
        <br>
      </p></strong></font>
    </td>
    <td width="49" rowspan="2">&nbsp;</td>
  </tr>
  <tr> 
    <td valign="top"> <form name="form1" method="post" action="">
        <span class="content3">Your session has been terminated. Click <a href="<%=rootDirectory%>/jsp/login/login.jsp" target="_self">here</a> 
        to go back to the Login Page<br>
        </span><br>
      </form>
      <br> </td>
  </tr>
</table>
<p class="control">&nbsp;</p>
</body>
</html>
