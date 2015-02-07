<%
    String rootDirectory = (String)request.getContextPath();
%>


<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">

<body bgcolor="#EEEEEE" leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory%>/images/button/i_continue.jpg')">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr> 
    <td width="22" height="27" rowspan="2">&nbsp;</td>
    <td width="559"> <br> 
    <span class="title0">Login /</span>
    <br> <br> 
    <span class="title1">Session Timeout</span>
    <br> 
    <hr align="left" color="#333333" width="100%" size="1"> 
      <br> </strong></font>
	</td>
	<td rowspan="2">&nbsp;</td>
  </tr>
  <tr> 
    <td><form name="form1" method="post" action="">
        <p><br>
        </p>
        <p class="content2">
        Due to no activity with Titan Update Server for a long time,<br>
        your session has been terminated by the System. <br>
        Please re-login Titan Update Server.</p>
        <p></p>
                  <p> <input class="button" type="button" value="Continue" name="Continue" onClick="javascript:toLogin();"> 
                    <br>
                    <br>
                  </p>
      </form>
      <br> </td>
  </tr>
</table>
</body>

<<script type="text/javascript">
<!--
function toLogin(){
	location.href="<%=rootDirectory%>/jsp/login/login.jsp";
}
//-->
</script>

