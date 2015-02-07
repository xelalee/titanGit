<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%@ include file="/jsp/common/check_session.jsp" %>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.product.bundles.Resources" var="bundle"/>
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
		    <%@ include file="/jsp/common/top.jsp" %>
	      </td>
        </tr>
      </table>
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td width="190" height="510" valign="top">
            <%@ include file="/jsp/myproduct/left_product.jsp" %>
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">
          <br>

<!-- add content here: Content begin -->

<h:form>
<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
  <tr> 
    <td width="15" height="27" rowspan="2">&nbsp;</td>
    <td colspan="2" rowspan="2" valign="top">
        <span class="content2"><h:outputText value="#{bundle.MY_PRODUCTS}"/> / </span><span class="title0"><h:outputText value="#{bundle.RENAME_PRODUCT}"/></span><br><br>
        <span class="title1"><h:outputText value="#{bundle.RENAME_PRODUCT_SUCCESS}" /></span><br>
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
      <h:outputText value="#{bundle.RENAME_PRODUCT_SUCCESS_CONFIRM}" />
      <br>
          </span><br>
          <br>
          </p>
      <p>
        <h:inputHidden value="#{myServiceAction.myproductbean.sn}" />
        <h:inputHidden value="#{myServiceAction.myproductbean.friendly_name}" />
        <h:commandButton styleClass="button" value="#{bundle_button.CONTINUE}" action="myservice_main"></h:commandButton>
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
          <td width="1" align="left" valign="top" background="../../images/topic_vbg.gif" bgcolor="#FFFFFF"><img src="../../images/1px.gif" width="1" height="1"></td>
          <td width="2" align="left" valign="top" bgcolor="#FFFFFF">
            <%@include file="/jsp/common/blank.html" %>
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

