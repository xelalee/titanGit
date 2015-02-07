<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%
	String status = com.titan.base.util.Util.getString(request.getParameter("status"));
  String fail_note = "";
  if(status.equals("fail")){
	  fail_note = com.titan.base.util.Util.getString(request.getParameter("fail_note"));
  }
%>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.account.bundles.Resources" var="bundle"/>
<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />
<html>
<head>
<title><h:outputText value="#{bundle.TITLE}" /></title>
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
<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
  <tr> 
    <td width="15" height="27" rowspan="2">&nbsp;</td>
    <td colspan="2" rowspan="2" valign="top">
        <span class="content2"><h:outputText value="#{bundle.LOGIN}"/> /</span><br><br>
        <span class="title1">
<%
  if(status.equals("success")){
%>
        <h:outputText value="#{bundle.ACCOUNT_ACTIVATE_SUCCESS}" />
<%
  }else{
%>
        <h:outputText value="#{bundle.ACCOUNT_ACTIVATE_FAIL}" />
<%
  }
%>
        </span><br>
      <hr align="left" color="#333333" width="100%" size="1"> 
      <br>
      </td>
    <td width="90" rowspan="9" bordercolor="#FFFFFF">&nbsp;</td>
  </tr>
  <tr> 
    
  </tr>
  <tr> 
    <td width="15" height="169">&nbsp;</td>
    <td width="22"><div align="center"></div></td>
      <td width="471" valign="top"> <p><span class="content2">
<%
  if(status.equals("success")){
%>
        <h:outputText value="#{bundle.ACCOUNT_ACTIVATE_SUCCESS_NOTE}" />
<%
  }else{
%>
        <h:outputText value="#{bundle.ACCOUNT_ACTIVATE_FAIL_NOTE}" />
<%    if(fail_note.equals("NoExist")){
%>
        <br>
        <h:outputText value="#{bundle.ACCOUNT_NO_MATCH}" />
<%    }else if(fail_note.equals("Acivated")){
%>
        <br>
        <h:outputText value="#{bundle.ACCOUNT_ACTIVATED}" />
<%
      }
  }
%> 
      <br>
          </span><br>
          <br>
          </p>
      <p>
        <h:commandButton styleClass="button" value="#{bundle_button.CONTINUE}" action="login"></h:commandButton>

      </p>
      </td>
  </tr>
  <tr> 
    
  </tr>
  <tr> 
    <td>&nbsp;</td>
    <td colspan="2">&nbsp;</td>
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

