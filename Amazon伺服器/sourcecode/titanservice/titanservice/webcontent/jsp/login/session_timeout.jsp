<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.common.bundles.Resources" var="bundle"/>
<html>
<head>
<title><h:outputText value="#{bundle.SESSION_TIMEOUT_TITLE}" /></title>
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

<h:form>
<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr> 
    <td width="22" height="27">&nbsp;</td>
    <td width="559">
    <span class="title0"><h:outputText value="#{bundle.LOGIN}"/> /</span><br><br>
    <span class="title1">
    <h:outputText value="#{bundle.SESSION_TIMEOUT_TITLE}" />
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
        <h:outputText value="#{bundle.SESSION_TIMEOUT_INFO}" escape="false"/>
        <h:outputLink value="../../jsp/login/login.jsf">
          <h:outputText value="#{bundle.CLICK_CONTINUE}"/>
        </h:outputLink>
        <br>
        </span>
        <br>
      <br> 
    </td>
  </tr>
</table>
         
</h:form>
            
            
<!-- Content end -->

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

