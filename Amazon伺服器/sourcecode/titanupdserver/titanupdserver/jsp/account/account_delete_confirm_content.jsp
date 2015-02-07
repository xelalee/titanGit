
    
<%
    String rootDirectory = (String)request.getContextPath();
%>
<html>
<link href="<%=rootDirectory%>/css/common.css" rel="stylesheet" type="text/css">
<body leftmargin="0" topmargin="0">
<form name="form1" method="post" action="">

<!--input type='hidden' name='hidFunction' value="Personal Info"> 
<input type='hidden' name='hidAction' value="PEESONAL UPDATE"-->

<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
  <tr> 
    <td width="15" height="27" rowspan="2">&nbsp;</td>
    <td colspan="2" rowspan="2" valign="top">
      <br>
        <span class="content2">Account Management /</span> <span class="title0">Account</span><br>
      <br>
        <span class="title1">Insert Success</span><br>
      <hr align="left" color="#333333" width="100%" size="1"> 
      <br>
      </strong></font></td>
    <!--td width="1" rowspan="9" background="<%=rootDirectory%>/images/topic_vbg.gif"><img src="<%=rootDirectory%>/images/1px.gif" width="1" height="1"></td-->
    <td width="90" rowspan="9" bordercolor="#FFFFFF">&nbsp;</td>
  </tr>
  <tr> 
    
  </tr>
  <tr> 
    <td width="15" height="169">&nbsp;</td>
    <td width="22"><div align="center"></div></td>
      <td width="471" valign="top"> <p><span class="content2">Your account information 
          has been successfully deleted !<br>
          <!--You have to logout myTitan.com by click continue button.</span><br-->
          <br>
          </p>
      <p> <font color="#666666" size="1" face="Verdana, Arial, Helvetica, sans-serif"> 
        <input class="button" type="button" value="Continue" name="Continue" onClick="javascript:toContinue();"><br>
        &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; </font></p>
      </td>
  </tr>
  <tr> 
    
  </tr>
  <tr> 
    <td>&nbsp;</td>
    <td colspan="2">&nbsp;</td>
  </tr>
</table>
<p class="control">&nbsp;</p>
</form>
</body>
</html>

<script type="text/javascript">
<!--
function toContinue(){
	lcation.href="<%=rootDirectory%>/jsp/account/account.jsp";
}
//-->
</script>
