<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%@ include file="/jsp/common/check_session.jsp" %>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.account.bundles.Resources" var="bundle"/>
<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />
<html>
<head>
<title><h:outputText value="#{bundle.TITLE_UPDATE_ACCOUNT}"/></title>
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
            <%@ include file="/jsp/myaccount/left_account.jsp" %>
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">

<!-- add content here: Content begin -->

<div id="main">

<h:form>

<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr> 
      <td width="15" height="27" rowspan="2">&nbsp;</td>
      <td colspan="2" valign="top"><br>
        <span class="title1"><h:outputText value="#{bundle.PERSONAL_INFORMATION}"/></span><br>
        <hr align="left" color="#333333" width="100%" size="1">
        <br> 
      </td>    
	  <td width="90" rowspan="9" bordercolor="#FFFFFF">&nbsp;</td>
	</tr>
	<tr> 
	  <td width="22" height="169"><div align="center"></div></td>
	  <td width="471" valign="top">
		 <p class="content3">
			 <h:outputText value="#{bundle.CHANGE_PASSWORD_NOTE}"/>
         </p>
		 <table width="100%" border="1" cellpadding="1" cellspacing="0" bordercolor="#FFFFFF"> 				
          <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA"> 
            <td height="114" colspan="2">
              <table>
                <tr>
                  <td class="content3" width="30%">
                    <h:outputText value="#{bundle.CURRENT_PASSWORD}"/>
                  </td>
                  <td class="content3">
                    <h:inputHidden value="#{AccountAction.accountbean.account_id}" />
                    <h:inputHidden value="#{AccountAction.accountbean.username}" />
                    <h:inputSecret id="password" value="#{AccountAction.accountbean.password}" maxlength="20" styleClass="content3" required="true">
                      <f:validator validatorId="mytitan.PasswordValidator" /> 
                      <f:validateLength minimum="6"/>
                    </h:inputSecret>
                    <h:message styleClass="errorMessage" for="password" />
                  </td>
                </tr>
                <tr>
                  <td class="content3" width="30%">
                    <h:outputText value="#{bundle.NEW_PASSWORD}"/>
                  </td>
                  <td class="content3">
                    <h:inputSecret id="password1" value="#{AccountAction.accountbean.password1}" maxlength="20" styleClass="content3" required="true">
                      <f:validator validatorId="mytitan.PasswordValidator" />
                      <f:validateLength minimum="6"/>
                    </h:inputSecret>
                    <h:message styleClass="errorMessage" for="password1" />
                  </td>
                </tr>
                <tr>
                  <td class="content3" width="30%"> 
                    <h:outputText value="#{bundle.CONFIRM_NEW_PASSWORD}"/>
                  </td>
                  <td class="content3">
                    <h:inputSecret id="password2" value="#{AccountAction.accountbean.password2}" maxlength="20" styleClass="content3" required="true">
                      <f:validator validatorId="mytitan.PasswordValidator" />
                      <f:validateLength minimum="6"/>
                    </h:inputSecret>
                    <h:message styleClass="errorMessage" for="password2"  />
                  </td>
                </tr> 
                <tr>
                  <td colspan="2" align="center">
                  <br><br>
                  <p>
                  <h:commandButton styleClass="button" value="#{bundle_button.SUBMIT}" action="#{AccountAction.changePasswordAction}" onclick="javascript:gowait();" ></h:commandButton>
                  <h:commandButton styleClass="button" value="#{bundle_button.CANCEL}" action="#{AccountAction.loadAction}" immediate="true"></h:commandButton>                                        			
				  <br>
				</p>          
                  </td>
                </tr>                          
              </table>
			</td>
			</tr>
			</table>
		</td>
	</tr>
	<tr>
	    <td width="15" height="27" rowspan="2">&nbsp;</td>
        <td colspan="3">
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

<script language="JavaScript" type="text/JavaScript">
 function gowait() {
   document.getElementById("main").style.visibility="hidden";
   document.getElementById("wait").style.visibility="visible";
 }

</script>

</f:view>

