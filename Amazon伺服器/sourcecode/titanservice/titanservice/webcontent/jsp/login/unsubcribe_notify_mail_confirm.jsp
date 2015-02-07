<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>
<%@ taglib uri="jsf-in-action-components" prefix="jia" %>

<%
	String status = com.titan.base.util.Util.getString(request.getParameter("status"));
%>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.login.bundles.Resources" var="bundle"/>
<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />
<html>
<head>
<title>
<h:outputText value="#{bundle.UNSUBSCRIBE_NOTIFY_MAIL}"/>
</title>
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
    <td width="22" height="27" rowspan="2">&nbsp;</td>
    <td width="559">
      <span class="title1">
<%
  if(status.equals("success")){
%>
        <h:outputText value="#{bundle.UNSUBSCRIBE_SUCCESSFULLY}"/>
<%
  }else{
%>
        <h:outputText value="#{bundle.UNSUBSCRIBE_FAIL}"/>
<%
  }
%>
      </span>
      <br> <hr align="left" color="#333333" width="100%" size="1"> 
      <br>
    </td>
    <td width="32" rowspan="2">&nbsp;</td>
  </tr>
  <tr> 
    <td>
       <h:form>
        <p><strong>
        <font color="#999933" size="2" face="Verdana, Arial, Helvetica, sans-serif">
        <img src="../../images/i_add.gif" width="9" height="9"> 
          <h:outputText value="#{bundle.UNSUBSCRIBE_NOTIFY_MAIL}"/>
        </font></strong><br>
        </p>
        <p class="content3">
<%
  if(status.equals("success")){
%>
        <h:outputText value="#{bundle.UNSUBSCRIBE_SUCCESS_NOTE}" escape="false"/>
<%
  }else{
%>
        <h:outputText value="#{bundle.UNSUBSCRIBE_FAIL_NOTE}" escape="false"/>
<%
  }
%>
        </p>

        <p> 
            <h:commandButton styleClass="button" value="#{bundle_button.CONTINUE}" action="login"></h:commandButton>
        </p>

      </h:form>
	</td>
  </tr>
</table>
            
            
            
<!-- Content end -->

          </td>
          <td width="1" align="left" valign="top" background="../../images/topic_vbg.gif" bgcolor="#FFFFFF"><img src="../../images/1px.gif" width="1" height="1"></td>
          <td width="2" align="left" valign="top" bgcolor="#FFFFFF">
            <%@ include file="/jsp/common/right.jsp" %>
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