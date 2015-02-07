<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%
  request.setCharacterEncoding("GBK");
  response.setContentType("text/html;charset=UTF-8");
  
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Cache-Control", "no-cache");
  response.setDateHeader("Expires", 0);  
  
  String rootDir = (String)request.getContextPath();
  
  com.titan.mytitan.login.bean.LocaleBean localebean = new com.titan.mytitan.login.bean.LocaleBean();
  String locale_css = localebean.getCss_option();
%>

<f:loadBundle basename="com.titan.mytitan.login.bundles.Resources" var="bundle_top"/>

<f:subview id="top_before_login">

<html>

<script language="JavaScript" src="<%=rootDir %>/js/util.js"></script>

<link href="<%=rootDir %>/css/titan<%=locale_css %>.css" rel="stylesheet" type="text/css">

<link href="<%=rootDir %>/css/button.css" rel="stylesheet" type="text/css">

<table width="100%" height="78" border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td width="250" height="53" bgcolor="#F0F0F0"><img src="<%=rootDir %>/images/logo.gif" width="250" height="53"></td>
    <td width="806" height="53" border="0" bgcolor="#F0F0F0" > <div align="right"><img src="<%=rootDir %>/images/header_bg.png" width="400" height="53"></div></td>
  </tr>
  <tr bgcolor="#990000">
    <td height="3"></td>
    <td height="3"></td>
  </tr>
  <tr bgcolor="#F0F0F0">
    <td height="22" valign="top" bgcolor="#F0F0F0">
      <div align="right"></div>
    </td>
    <td height="22" valign="bottom">
      <div align="right"></div>
	</td>
  </tr>
</table>

</html>

</f:subview>
