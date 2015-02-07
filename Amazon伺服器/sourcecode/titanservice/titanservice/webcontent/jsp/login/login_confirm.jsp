<%@ page contentType="text/html; charset=UTF-8" %>

<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%@page import="com.titan.mytitan.app.util.ViewUtil"%>
<%@page import="com.titan.base.util.Util"%>

<f:view locale="#{localeBean.locale}">
<f:loadBundle basename="com.titan.mytitan.login.bundles.Resources" var="bundle"/>
<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />
<html>
<head>
<title><h:outputText value="#{bundle.TITLE }"/></title>
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

  <table width="100%" border="0" cellpadding="0" cellspacing="0" class="content1">
    <tr>
      <td width="21" height="27"></td>
      <td width="611" valign="top" class="content1"><p><br>
          <font color="#999999" size="3" face="Arial, Helvetica, sans-serif">
          <strong>
          <font color="#999999" size="3" face="Arial, Helvetica, sans-serif">
          <span class="title0"><h:outputText value="#{bundle.LOGINTITLE}"/>/</span>
          </font><br><br>
          <font color="#006699">
          <span class="title1"><h:outputText value="#{bundle.LOGIN_CONFIRM_TITLE}"/></span> </font><br>
          <hr align="left" color="#333333" width="100%" size="1">
          </strong></font></p>
      </td>
    </tr>
    <tr>
      <td width="21"></td>
      <td>&nbsp;</td>
    </tr>    
    <tr>
      <td width="21"></td>
      <td><font color="#006699">
          <span class="content1"><h:outputText value="#{bundle.LOGIN_CONFIRM_HINT}"  escape="false"/></span></font>
      </td>
    </tr>    
    <tr>
      <td width="21"></td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td width="21"></td>
      <td valign="top" >
            <h:form id="loginForm">
            	<table align="left" class="content1">
            		<tr>
            		  <td>
            			<table align="left" class="content3">
              				<tr>
              					<td colspan="2" align="left">
              					    <h:commandButton styleClass="button" value="#{bundle_button.CONTINUE}" action="#{LoginAction.specialLoginAction}" ></h:commandButton>
                                    <h:commandButton styleClass="button" value="#{bundle_button.CANCEL}" action="login" immediate="true"></h:commandButton>
                  				</td>
              				</tr>
          				</table>
          			</td>
          			</tr>          			
          		</table>
            </h:form>       
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

