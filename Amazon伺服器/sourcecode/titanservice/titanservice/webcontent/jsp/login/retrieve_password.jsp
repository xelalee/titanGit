<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>


<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.login.bundles.Resources" var="bundle"/>
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

<!-- add content here: Content begin -->

<div id="main">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr> 
    <td width="20" height="27">&nbsp;</td>
    <td width="506"><br>
        <span class="title1"><h:outputText value="#{bundle.FORGET_PASSWORD}"/></span><br>
      <hr align="left" color="#333333" width="100%" size="1"> 
      <br>
    </td>
    <td width="32">&nbsp;</td>
  </tr>
  <tr>
    <td width="20"></td>
	<td colspan="2">
	<h:messages errorClass="errorMessage" infoClass="infoMessage" globalOnly="true" />
	</td>
  </tr>
  <tr> 
    <td width="20">&nbsp;</td>
    <td width="506"></td>
    <td width="32">&nbsp;</td>
  </tr>
  <tr>
    <td width="20" height="27">&nbsp;</td>
    <td colspan="2">

			<p>
			<strong>
			<font color="#999933" size="2" face="Verdana, Arial, Helvetica, sans-serif">
			<h:outputText value="#{bundle.I_FORGET_MY_PASSWORD}"/>
			</font>
			</strong>
			</p>
			<h:form id="form2">
			<table width="100%" height="53" border="0" cellpadding="0" cellspacing="0" bgcolor="#F5F9FA">
				<tr> 
					<td colspan="2">
						<p>
						<span class="content2">
						<h:outputText value="#{bundle.I_FORGET_MY_PASSWORD_NOTE}"/>
						</span>
						</p>
					</td>
				</tr>
				<tr>
					<td colspan="2">&nbsp;</td>
				</tr>
				<tr> 
					<td width="30%">
						<p>
						<span class="content3">
						<h:outputText value="#{bundle.USERNAME}"/>
						</span>
					</td>
					<td width="70%">
						<p>
						<h:inputText id="username2" value="#{retrievePasswordAction.username2}" required="true" size="25" maxlength="20" styleClass="content3">
						  <f:validator validatorId="mytitan.UsernameValidator" />
                          <f:validateLength minimum="6"/>
                        </h:inputText>
						<h:message styleClass="errorMessage" for="username2" />
						</p>
					</td>					
				</tr>				
				<tr>
					<td>&nbsp;</td>
				</tr>				
				<tr>
					<td>
						<p>
                        <h:commandButton styleClass="button" value="Submit" action="#{retrievePasswordAction.retrievePasswordAction}" onclick="javascript:gowait();"></h:commandButton>
              			<h:commandButton styleClass="button" value="Cancel" action="#{retrievePasswordAction.cancelAction}" immediate="true"></h:commandButton>
                         							                 
						</p>
					</td>
				</tr>				
			</table>
			</h:form>

			<p>			
			<font color="#999933" size="2" face="Verdana, Arial, Helvetica, sans-serif">
			<strong>
			<h:outputText value="#{bundle.I_FORGET_MY_USERNAME}"/>
			</strong>
			</font>&nbsp;&nbsp;
			<span class="content4">
			<h:outputText value="#{bundle.I_FORGET_MY_USERNAME1}"/>
			</span>
			</p>
			
			<h:form id="form3">
			<table width="100%" height="53" border="0" cellpadding="0" cellspacing="0" bgcolor="#F5F9FA">
				<tr>
					<td colspan="2">
						<p>
						<span class="content2">
						<h:outputText value="#{bundle.I_FORGET_MY_USERNAME_NOTE}"/>
						</span></p>
						<p>
					</td>
				</tr>
				<tr>
					<td width="30%">
						<p> 
						<span class="content3">
						<h:outputText value="#{bundle.SERIAL_NUMBER}"/>
						</span>
						</p>
					</td>
					<td width="70%">
						<p>
						<h:inputText id="serial_number" value="#{retrievePasswordAction.sn}" required="true" size="25" maxlength="30" styleClass="content3">
						  <f:validator validatorId="mytitan.CharValidator" />
                        </h:inputText>
						<h:message styleClass="errorMessage" for="serial_number" />
						</p>
					</td>					
				</tr>
				<tr>
					<td width="40%">
						<p>
						<span class="content3"><h:outputText value="#{bundle.AC_MAC}"/></span>
						</p>
					</td>
					<td width="60%">
						<p>
						<h:inputText id="authentication_code" value="#{retrievePasswordAction.mac}" required="true" size="25" maxlength="40" styleClass="content3">
						   <f:validator validatorId="mytitan.CharValidator" />
                        </h:inputText>
						<h:message styleClass="errorMessage" for="authentication_code" />
						</p>
					</td>					
				</tr>								
				<tr>
					<td>&nbsp;</td>
				</tr>				
				<tr>
					<td>
						<p>			                 
                        <h:commandButton styleClass="button" value="#{bundle_button.SUBMIT}" action="#{retrievePasswordAction.retrieveUsernameAction}" onclick="javascript:gowait();"></h:commandButton>
              			<h:commandButton styleClass="button" value="#{bundle_button.CANCEL}" action="#{retrievePasswordAction.cancelAction}" immediate="true"></h:commandButton>
						</p>
					</td>
				</tr>				
				
			</table>
			</h:form>			
			
		</td>
  </tr>
</table>
</div>           
            
<div id="wait" style="visibility:hidden; position: absolute; top: 60; left: 190">
<%@ include file="/jsp/common/process_on_going.jsp" %>
</div>
           
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
<script language="JavaScript" type="text/JavaScript">
 function gowait() {
   document.getElementById("main").style.visibility="hidden";
   document.getElementById("wait").style.visibility="visible";
 }
 
</script>
</f:view>

