<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.login.bundles.Resources" var="bundle"/>
<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />
<html>
<head>
<title><h:outputText value="#{bundle.TITLE }"/></title>
</head>

<body leftmargin="0" topmargin="0" onload="document.forms.loginForm['loginForm:username'].focus();">
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
      <table width="400px" height="200px" border="0" cellpadding="0" cellspacing="0" align="center">
        <tr>
          <td height="60">
          <h:outputText value="#{bundle.LOGIN}" styleClass="header1"/>
	      </td>
        </tr>      
        <tr>
          <td align="left" valign="top" width="65%" bgcolor="#FFFFFF">

<!-- add content here: Content begin -->

          <div class="box-padded-admin-login">
  <table border="0" cellpadding="0" cellspacing="0" class="content1">
    
    <tr>
      <td width="21" height="100"></td>
      <td valign="top" > 
            <h:form id="loginForm">
            	<table align="left" class="content1" width="100%">
            		<tr>
            		  <td>
            			<table align="left" class="content3">
            				<tr>
            					<td align="left">
            						<h:outputText value="#{bundle.USERNAME}"/>
 								</td>
 								<td align="left"><span class="content3">
                   					<h:inputText value="#{AdministratorAction.loginbean.username}" id="username" required="true" size="30" maxlength="50" styleClass="content3">
                   					  <f:validator validatorId="mytitan.UsernameValidator" />
                                    </h:inputText></span>
                   				</td>
                   			    <td align="left">
                   					<h:message styleClass="errorMessage" for="username"  />
                   				</td>
                   			</tr>
                			<tr>
                   				<td align="left">
                   	    			<h:outputText value="#{bundle.PASSWORD}"/>
 								</td>
 								<td align="left"><span class="content3">
                    				<h:inputSecret value="#{AdministratorAction.loginbean.password}" id="password" required="true"  size="30" maxlength="20" styleClass="content3">
                    				  <f:validator validatorId="mytitan.CharValidator" />
                                    </h:inputSecret></span>
                    			</td>
              				    <td align="left">
                   					<h:message styleClass="errorMessage" for="password"  />
                   				</td>
              				</tr>
              				<tr>
              				    <td colspan="3">
              				    <span class="content3"><h:outputText value="#{bundle.REMEMBER_USERNAME}"/></span>
              				    <font color="#666666" size="1" face="Verdana, Arial, Helvetica, sans-serif">
                                <h:selectBooleanCheckbox  value="#{LoginAction.loginbean.cookied}" >
                                </h:selectBooleanCheckbox>
                                </font>
              				    </td>
              				</tr>
              				<tr>
              					<td colspan="3" align="left">
              					    <h:commandButton styleClass="button" value="#{bundle.BUTTON_LOGIN}" action="#{AdministratorAction.login}"></h:commandButton>
              					    <h:commandButton styleClass="button" value="#{bundle.BUTTON_CANCEL}" action="login" immediate="true"></h:commandButton>
                  				</td>
              				</tr>            				
              		        <tr >
              		            <td colspan="3" >
                                 	<h:messages errorClass="errorMessage" infoClass="infoMessage" globalOnly="true" />
                                </td>
                	        </tr>
          				</table>
          			</td>
          			</tr>          			
          		</table>
            </h:form>   
      </td> 
    </tr>
  </table>
</div>
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

