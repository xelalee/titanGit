<%@ page contentType="text/html; charset=UTF-8" %>
<%@ page import="com.titan.base.controller.bean.MessageBean"%>

<%
    String rootDirectory = (String)request.getContextPath();
  
    MessageBean message = (MessageBean)request.getAttribute("confirm_page_message");
    if(message==null){
    	message = new MessageBean();
    }
%>

<html>
<head>
<title>Confirm</title>
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
            <%@ include file="/jsp/common/blank.html" %>
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">
          <br>

<!-- add content here: Content begin -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td width="20" height="27">&nbsp;</td>
        <td colspan="2" valign="top"><br>
            <span class="content2"><%=message.getMenu() %> </span><span class="title0"> / <%=message.getFunction() %></span><br><br>
            <span class="title1"><%=message.getFunction() %> <%=message.isSucc()?"Success":"Fail" %></span><br>
            <hr align="left" color="#333333" width="100%" size="1">
            <br><br>
        </td>
    </tr>
  
    <tr>
        <td width="20" height="18" valign="top">&nbsp;</td>
        <td>&nbsp;</td>
        <td valign="top" class="content2"><%=message.getMessage()%><br><br></td>
    </tr>

    <tr>
        <td width="28">&nbsp;</td>
        <td>&nbsp;</td>
        <td><p>&nbsp;</p></td>
    </tr>
    <tr>
        <td width="28" valign="top">&nbsp;</td>
        <td>&nbsp;</td>
        <td><blockquote>
            <blockquote>
            <blockquote>
            <blockquote>
            <blockquote>
            <blockquote>
            <p><input class="button" type="button" value="Back" name="Back" onClick="toBack();"></p>
            </blockquote>
            </blockquote>
            </blockquote>
            </blockquote>
            </blockquote>
            </blockquote></td>
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

function toBack() { 
	  location.href = '<%=rootDirectory%><%=message.getBackURL() %>';
}

//-->
</script>

