<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.login.bundles.Resources" var="bundle"/>
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
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td width="190" height="510" valign="top">
            <%@ include file="/jsp/common/left.jsp" %>
          </td>
          <td align="left" valign="top" bgcolor="#FFFFFF">
          <br>

<!-- add content here: Content begin -->

  <table width="100%" border="0" cellpadding="0" cellspacing="0" class="content1">
    <tr>
      <td width="21" height="27"></td>
      <td width="611" valign="top" class="content1"><p>
          <font color="#999999" size="3" face="Arial, Helvetica, sans-serif">
          <strong><font color="#999999" size="3" face="Arial, Helvetica, sans-serif"></font>
          <font color="#006699">
          <span class="title1"><h:outputText value="#{bundle.TITLE}"/></span> </font><br>
          <hr align="left" color="#333333" width="100%" size="1"><br>
          </strong></font></p>
        <p class="content1">
          <h:outputText value="#{bundle.WHAT_IS_MYtitan_CN}"/>
        </p>
        <span class="content2">
          <h:outputText value="#{bundle.MYtitan_CN_FUNCTION}" /> 
        <br><br>
        <b><h:outputText value="#{bundle.MYtitan_CN_PRODUCT}" /></b>
        <br><br>
        <table width="100%" border="1" cellpadding="1" cellspacing="0" bordercolor="#FFFFFF">
        <tr bordercolor="#FFFFFF" bgcolor="#F5F9FA" valign="top">
        	<td class='content2' color='blue'><h:outputText value="#{bundle.MYtitan_CN_PRODUCT1_TITLE}" /></td>
        	<td class='content3'><h:outputText value="#{bundle.MYtitan_CN_PRODUCT1_DESCRIBE}" /></td>
        </tr>
        </table>
        <br>
        <br>
        <h:outputText value="#{bundle.PLEASE_REGISTER}" /><font size="1" face="Verdana, Arial, Helvetica, sans-serif"><br>
        </font><font size="1"></font></span><font size="1"><br>
        </font> <hr align="left" color="#333333" width="75%" size="1" noshade>
      </td>
    </tr>
    <tr>
      <td width="21" height="151"></td>
      <td valign="top" > 

            <h:form id="loginForm">
            	<table align="left" class="box">
            		<tr>
            		  <td style="padding:20">
            			<table align="left" class="content3">
            				<tr>
            					<td align="left">
            						<h:outputText value="#{bundle.USERNAME}"/>
 								</td>
 								<td align="left">
                   					<h:inputText value="#{LoginBean.username}" id="username" required="true" size="20" maxlength="20" style="width:120pt;height:18pt" />
                   				</td>
                   				<td align="left">
                   					<h:message styleClass="errorMessage" for="username"  />
                   				</td>
                   			</tr>
                			<tr>
                   				<td align="left">
                   	    			<h:outputText value="#{bundle.PASSWORD}"/>
 								</td>
 								<td align="left">
                    				<h:inputSecret value="#{LoginBean.myaccountbean.password}" id="password" required="true"  size="20" maxlength="20" style="width:120pt;height:18pt" />
                    			</td>
                    			<td align="left">
                    			    <h:message styleClass="errorMessage" for="password"  />
                    			</td>
              				</tr>
              				<tr>
              				    <td colspan="3">
              				    <span class="content3"><h:outputText value="#{bundle.REMEMBER_USERNAME}"/> </span>
              				    <font color="#666666" size="1" face="Verdana, Arial, Helvetica, sans-serif">
                                <h:selectBooleanCheckbox  value="#{LoginBean.cookied}" >
                                </h:selectBooleanCheckbox>
                                </font>
              				    </td>
              				</tr>
              				<tr>
              					<td colspan="2" align="center">
                    				<h:commandButton styleClass="button1" value="#{bundle.BUTTON_LOGIN}" action="#{LoginBean.loginAction}"/>
                    				<h:commandButton styleClass="button1" value="#{bundle.BUTTON_CANCEL}" type="reset" image="/images/button/i_cancel.jpg"/>
                  				</td>
              				</tr>

          				</table>
          			</td>
          			</tr>
              		<tr >
              		 <td>
                       	<h:messages errorClass="errorMessage" infoClass="infoMessage" globalOnly="true" />
                     </td>
                	</tr>          			
          		</table>
            </h:form>       
      </td> 
    </tr>
    <tr>
      <td width="21"></td>
      <td>
        <hr align="left" color="#333333" width="75%" size="1" noshade>
        <p>
          <span class="content1"><img src="../../images/arrow.gif" width="4" height="6">
          <h:outputText value="#{bundle.INTERFACE_LANGUAGE_PREFERENCE}"/>
          <h:outputLink value="../../jsp/login/language.jsf">
            <h:outputText value="#{bundle.CLICK_HERE}"/>
          </h:outputLink>
          </span>
        </p>
        <p>
          <span class="content1"><img src="../../images/arrow.gif" width="4" height="6">
          <h:outputText value="#{bundle.CREATE_NEW_USER}"/>
          <h:outputLink value="../../jsp/myaccount/myaccount_create.jsf">
            <h:outputText value="#{bundle.CLICK_HERE}"/>
          </h:outputLink>
          </span>
        </p>       
        <p>
          <span class="content1"><img src="../../images/arrow.gif" width="4" height="6">
          <h:outputText value="#{bundle.FORGET_USERNAME_PASSWORD}"/>
          <h:outputLink value="../../jsp/login/retrieve_password.jsf">
            <h:outputText value="#{bundle.CLICK_HERE}"/>
          </h:outputLink>
          </span>
        </p>
        <p>
          <span class="content1"><img src="../../images/arrow.gif" width="4" height="6">
          <h:outputText value="#{bundle.NOT_SURE_WHETHER_REGISTERED}"/>
          <h:outputLink value="../../jsp/login/check_user.jsf">
            <h:outputText value="#{bundle.CLICK_HERE}"/>
          </h:outputLink>
          </span>
        </p>
        <br>
        <br>
        <br>
        <br>
      </td>
    </tr>
    <tr>
      <td width="21"></td>
      <td></td>
    </tr>
    <tr>
      <td width="21"></td>
      <td></td>
    </tr>
    <tr>
      <td width="21"></td>
      <td></td>
    </tr>
    <tr>
      <td width="21"></td>
      <td></td>
    </tr>
  </table>

<!-- Content end -->

<br>

          </td>
          <td width="1" align="left" valign="top" background="../../images/topic_vbg.gif" bgcolor="#FFFFFF">
          <img src="../../images/1px.gif" width="1" height="1"></td>
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

