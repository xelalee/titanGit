<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%@ include file="/jsp/common/check_session.jsp" %>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.product.bundles.Resources" var="bundle"/>
<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />
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
<div id="main">
<h:form>
<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
        <td width="28" height="27">&nbsp;</td>
        <td width="894">
            <span class="title1"><h:outputText value="#{bundle.TRANSFER_PRODUCT}"/></span><br>
            <hr align="left" color="#333333" width="100%" size="1"><br><br>
        </td>
        <td width="1" rowspan="8"></td>
    </tr>
    <tr>
        <td width="28" height="18" valign="top">&nbsp;</td>
        <td valign="top" class="content2">
            <h:outputText value="#{bundle.TRANSFER_PRODUCT_NOTE}"/>
        </td>
    </tr>
    <tr>
        <td>&nbsp;</td>
    </tr>
    <tr>
        <td width="28" height="75">&nbsp;</td>
        <td bgcolor="#F5F9FA">
                <h:inputHidden value="#{myServiceAction.myproductbean.sn}" />
                <h:inputHidden value="#{myServiceAction.myproductbean.friendly_name}" />
                <h:inputHidden value="#{myServiceAction.myproductbean.mac}" />
                
                <span class="content3"><h:outputText value="#{bundle.SERIAL_NUMBER}"/><h:outputText value="#{bundle.COLON}"/></span>
                <span class="content2"><h:outputText value="#{myServiceAction.myproductbean.sn}" /></span>
                <br>
                <span class="content3"><h:outputText value="#{bundle.FRIENDLY_NAME}"/><h:outputText value="#{bundle.COLON}"/></span>
                <span class="content2"><h:outputText value="#{myServiceAction.myproductbean.friendly_name}" /></span>
                <br><br>
                <span class="content1"><h:outputText value="#{bundle.TRANSFER_TO}"/><h:outputText value="#{bundle.COLON}"/></span>
                <br>
                <table width=80% border=0 cellspacing=0 cellpadding=0>
                  <tr>
                   <td width="15%" class="content3">
                     <h:outputText value="#{bundle.USERNAME}"/><h:outputText value="#{bundle.COLON}"/>
                   </td>
                   <td class="content2">
                     <h:inputText id="username" value="#{myServiceAction.new_username}" maxlength="20" size="30" required="true" styleClass="content3">
                       <f:validator validatorId="mytitan.UsernameValidator" />
                       <f:validateLength minimum="6"/>
                     </h:inputText>   
                     <h:message styleClass="errorMessage" for="username"  />
                   </td>
                  </tr>
                  <tr>
                   <td width="15%" class="content3">
                     <h:outputText value="#{bundle.EMAIL}"/><h:outputText value="#{bundle.COLON}"/>
                   </td>
                   <td class="content2">
                     <h:inputText id="email" value="#{myServiceAction.new_email}" maxlength="60" size="50" required="true" styleClass="content3">
                         <f:validator validatorId="mytitan.EmailFacesValidator" />
                     </h:inputText>
                     <h:message styleClass="errorMessage" for="email"  />
                   </td>
                  </tr>
                </table>             
        </td>
    </tr>
    <tr>
        <td width="28">&nbsp;</td>
        <td><p>&nbsp;</p></td>
    </tr>
    <tr></tr>
    <tr>
        <td width="28" valign="top">&nbsp;</td>
        <td><blockquote>
            <blockquote>
            <blockquote>
            <blockquote>
            <blockquote>
            <blockquote>
            <p>
                 <h:commandButton styleClass="button" value="#{bundle_button.SUBMIT}" action="#{myServiceAction.transferProductAction}" onclick="javascript:gowait();" ></h:commandButton>
                 <h:commandButton styleClass="button" value="#{bundle_button.CANCEL}" action="#{myServiceAction.toMyServiceMainAction}" immediate="true"></h:commandButton>         
            </p>
            </blockquote>
            </blockquote>
            </blockquote>
            </blockquote>
            </blockquote>
            </blockquote>
        </td>
    </tr>
    <tr>
        <td width="28" valign="top">&nbsp;</td>
        <td >
          <h:messages errorClass="errorMessage" infoClass="infoMessage" globalOnly="true" />
        </td>
    </tr>
</table>
</h:form>   
</div>

<div id="wait" style="visibility:hidden; position: absolute; top: 60; left: 190">
<%@ include file="/jsp/common/process_on_going.jsp" %>
</div>     
            
            
<!-- Content end -->

          </td>
          <td width="1" align="left" valign="top" background="../../images/topic_vbg.gif" bgcolor="#FFFFFF">
          <img src="../../images/1px.gif" width="1" height="1"></td>
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

<script language="JavaScript" type="text/JavaScript">
 function gowait() {
   document.getElementById("main").style.visibility="hidden";
   document.getElementById("wait").style.visibility="visible";
 }

</script>

</f:view>

