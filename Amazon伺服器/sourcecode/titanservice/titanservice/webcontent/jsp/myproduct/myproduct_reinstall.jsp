<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>
<%@ taglib uri="http://java.sun.com/jstl/core" prefix="c" %>

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
    <table width="80%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td width="28" height="27">&nbsp;</td>
            <td width="90%">
                <span class="title1">
                <h:outputText value="#{bundle.REINSTALL_PRODUCT}"/>
                </span><br>
                <hr align="left" color="#333333" width="100%" size="1"><br>
            </td>
        </tr>
        <tr>
            <td width="28" height="29" valign="top">&nbsp;</td>
            <td valign="top" class="content2"><br>
                <span class="content4"><h:outputText value="#{bundle.REINSTALL_PRODUCT_NOTE}"/></span><br><br>
            </td>
        </tr>
        <tr>
            <td width="28" height="75">&nbsp;</td>
            <td bgcolor="#F5F9FA">
                <h:inputHidden value="#{myServiceAction.myproductbean.sn}" />
                <h:inputHidden value="#{myServiceAction.myproductbean.friendly_name}" />
                    
                    <table width=80% border=0 cellspacing=0 cellpadding=0>
                    <tr bgcolor="#F5F9FA">
                    	<td width=40% class="content3">
                    	<h:outputText value="#{bundle.NEW_SERIAL_NUMBER}"/>
                    	</td>
                    	<td>
                    	<h:inputText id="serial_number" value="#{myServiceAction.new_sn}" maxlength="20" size="40" required="true" styleClass="content3">
                    	  <f:validator validatorId="mytitan.CharValidator" />
                        </h:inputText>
                    	<h:message styleClass="errorMessage" for="serial_number"  />
                    	</td>
                    </tr>
                    <tr bgcolor="#F5F9FA">
                    	<td width=40% class="content3">
                    	<h:outputText value="#{bundle.NEW_AUTHENTICATION_CODE}"/>
                    	</td>
                    	<td>
                    	<h:inputText id="authentication_code" value="#{myServiceAction.new_mac}" maxlength="36" size="40" styleClass="content3" required="true">
                    	  <f:validator validatorId="mytitan.CharValidator" />
                        </h:inputText>
                    	<h:message styleClass="errorMessage" for="authentication_code"  />
                    	</td>
                    </tr>
                    </table>
            </td>
        </tr>
        <tr>
            <td width="28">&nbsp;</td>
            <td><p>&nbsp;</p></td>
        </tr>
        <tr>
            <td width="28" valign="top">&nbsp;</td>
            <td>
                <p>
                  <h:commandButton styleClass="button" value="#{bundle_button.SUBMIT}" action="#{myServiceAction.reinstallProductAction}" onclick="javascript:gowait();" ></h:commandButton>
                  <h:commandButton styleClass="button" value="#{bundle_button.CANCEL}" action="#{myServiceAction.toMyServiceMainAction}" immediate="true"></h:commandButton>
                </p>
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

