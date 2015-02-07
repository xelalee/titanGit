<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://displaytag.sf.net" prefix="display" %>


<%@ include file="/jsp/admin/common/check_session.jsp" %>

<%
	String rootDirectory = (String)request.getContextPath();
%>

<html>
<head>
<link href="../../../css/screen.css" rel="stylesheet" type="text/css">
<title>Account Management</title>
</head>
<body leftmargin="0" topmargin="0">
<table width="100%" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <table width="100%" height="80" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td height="80"> 
		    <%@ include file="/jsp/admin/common/top.jsp" %>
	      </td>
        </tr>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td width="190" height="510" valign="top">
            <%@ include file="/jsp/admin/common/left_function.jsp" %>
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">
          <br>

<!-- add content here: Content begin -->

<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr>
        <td width="20px" height="27">&nbsp;</td>
        <td valign="top">
            <span class="title1">Welcome</span><br>
        </td>
    </tr>
    <tr>
        <td height="27" class="title_bar1">&nbsp;</td>
        <td class="title_bar2">
        &nbsp;&nbsp;&nbsp;Welcome<br>
        </td>
    </tr>
</table>
            
<!-- Content end -->

          </td>
          <td width="1" align="left" valign="top" background="../../../images/topic_vbg.gif" bgcolor="#FFFFFF"><img src="../../../images/1px.gif" width="1" height="1"></td>
          <td width="2" align="left" valign="top" bgcolor="#FFFFFF">
            <%@include file="/jsp/common/blank.html" %>
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


