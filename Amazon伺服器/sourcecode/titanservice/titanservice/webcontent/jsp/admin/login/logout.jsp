<%@page import="com.titan.base.util.Keys"%>
<%@page import="com.titan.mytitan.app.util.ViewUtil"%>
<%@page import="com.titan.admin.account.bean.AdministratorBean"%>
<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%
	//remove session
    AdministratorBean bean = (AdministratorBean)ViewUtil.getSession(Keys.ADMIN_USER_INFO);

	if(bean!=null){
	    try{
	    	ViewUtil.getServletRequest().getSession().removeAttribute(Keys.SESSION_LISTENER);
	    	ViewUtil.getServletRequest().getSession().removeAttribute(Keys.ADMIN_USER_INFO);
	    }catch(Exception ex){
	    }
	}
%>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.login.bundles.Resources" var="bundle"/>
<html>
<head>
<title><h:outputText value="#{bundle.TITLE}"/></title>
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
            <%@ include file="/jsp/common/left.jsp" %>
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">
          <br>

<!-- add content here: Content begin -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr> 
    <td width="22" height="27">&nbsp;</td>
    <td width="486">
      <p>
        <span class="title1"><h:outputText value="#{bundle.LOGOUT}"/></span><br>
        <hr align="left" color="#333333" width="100%" size="1"> 
        <br>
      </p>
    </td>
  </tr>
  <tr> 
    <td width="22" height="27">&nbsp;</td>
    <td width="486">
    </td>
  </tr>  
  <tr> 
    <td width="22" height="27">&nbsp;</td>  
    <td valign="top"> 
        <span class="content3">
        <h:outputText value="#{bundle.LOGOUT_HINT}"/>
        <h:outputLink value="login.jsf">
          <h:outputText value="#{bundle.CLICK_HERE}"/>
        </h:outputLink>
        <br>
        </span>
        <br>
      <br> 
    </td>
  </tr>
</table>

<!-- Content end -->

<br>

          </td>
        </tr>
      </table>
      <table width="100%" height="20" border="0" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF">
        <tr>
          <td height="20">
            <%@ include file="/jsp/common/bottom.jsp" %>
	      </td>
        </tr>
      </table>
    </td>
  </tr>
</table>	

</body>
</html>

</f:view>


