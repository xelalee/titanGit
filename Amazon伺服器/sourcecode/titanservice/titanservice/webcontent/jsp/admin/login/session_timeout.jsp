<%@ page contentType="text/html; charset=UTF-8" %>

<%
String rootDirectory = (String)request.getContextPath();
%>

<html>
<head>
<title>Session Time Out</title>
</head>

<body leftmargin="0" topmargin="0">

<table width="100%" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <table width="100%" height="80" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td height="80">
		    <%@ include file="/jsp/common/top0.jsp" %>
	      </td>
        </tr>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td width="190" height="510" valign="top">
            <%@ include file="/jsp/common/blank.html" %>
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">
          <br>

<!-- add content here: Content begin -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr> 
    <td width="22" height="27">&nbsp;</td>
    <td width="559">
    <span class="title0">Login /</span><br><br>
    <span class="title1">
    Session Time Out
    </span><br> 
      <hr align="left" color="#333333" width="100%" size="1"> 
      <br> 
	</td>
  </tr>
  <tr> 
    <td width="22" height="27">&nbsp;</td>
    <td width="559"></td>
  </tr>  
  <tr> 
    <td width="22" height="27">&nbsp;</td>
    <td valign="top"> 
        <span class="content2">
        The session is timed out. Please login again.
        <br><br><br>
        <input class="button" type="button" value="Re-Login" name="relogin" onClick="toLogin();">
        </span>
        <br>
      <br> 
    </td>
  </tr>
</table>
            
            
<!-- Content end -->

          </td>
        </tr>
      </table>
      <table width="100%" height="20" border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF">
        <tr>
          <td height="20">
            <%@ include file="/jsp/admin/common/bottom.jsp" %>
	      </td>
        </tr>
      </table>
    </td>
  </tr>
</table>	

</body>
</html>

<script language="JavaScript" type="text/JavaScript">
<!--

function toLogin() {
	location.href="<%=rootDirectory%>/jsp/admin/login/login.jsf";
}

//-->
</script>
