<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%
	java.util.Locale locale = new com.titan.mytitan.login.bean.LocaleBean().getLocale0();
    String username   = com.titan.base.util.Util.getString(request.getParameter("USERNAME"));
	String msg = com.titan.base.account.dao.AccountDAO.checkUsername(username,locale);
%>
<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.account.bundles.Resources" var="bundle"/>
<html>
<head>
<title><h:outputText value="#{bundle.TITLE}"/></title>
<script language="JavaScript" src="../../js/util.js"></script>
<link href="../../css/titan.css" rel="stylesheet" type="text/css">
</head>

<body leftmargin="0" topmargin="0">

  <table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr> 
      <td width="33" height="27" rowspan="2">&nbsp;</td>
      <td colspan="2" valign="top"> <br> 
      <span class="title1">
      <h:outputText value="#{bundle.USERNAME_CHECK}"/>
      </span>
      <br> 
        <hr align="left" color="#333333" width="100%" size="1">
      <br> 
      </td>
    </tr>
    <tr> 
      <td height="33" width="27">&nbsp;</td>
      <td>
      <span class="title2">
          <%=msg%>
      </span>
      </td>
    </tr>
  </table>
<p class="control">&nbsp;</p>
</body>
</html>
</f:view>