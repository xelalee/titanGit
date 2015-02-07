<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<%
  request.setCharacterEncoding("GBK");
  response.setContentType("text/html;charset=UTF-8");
  
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Cache-Control", "no-cache");
  response.setDateHeader("Expires", 0);
  
  com.titan.mytitan.login.bean.LocaleBean localebean = new com.titan.mytitan.login.bean.LocaleBean();
  String locale_top = localebean.getLocale();
  String locale_css = localebean.getCss_option();
%>

<f:loadBundle basename="com.titan.mytitan.common.bundles.Resources" var="bundle_top"/>
<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />

<f:subview id="top">

<html>

<script language="JavaScript" src="../../js/util.js"></script>

<link href="../../css/titan<%=locale_css %>.css" rel="stylesheet" type="text/css">
<link href="../../css/button.css" rel="stylesheet" type="text/css">
<table width="100%" height="78" border="0" cellpadding="0" cellspacing="0">
  <tr bgcolor="#F0F0F0">
    <td width="241" height="53"><img src="../../images/logo.gif" width="173" height="53"></td>
    <td height="53" bgcolor="#F0F0F0" ><div align="right"></div>
      <div align="right"><img src="../../images/header_bg.png" width="400" height="53"></div></td>
  </tr>
  <tr bgcolor="#F0F0F0">
    <td height="25" colspan="2">
        <table width="100%" height="25" border="0" cellpadding="0" cellspacing="0">
          <tr bgcolor="#990000">
            <td height="3" width="10%"></td>
            <td height="3"></td>
	        <td height="3"></td>
          </tr>
          <tr>
            <td height="3"></td>
            <h:form>
            <td align="left" valign="bottom" nowrap><h:commandButton styleClass="button_top" value="#{bundle_button.TOP_WELCOME}" action="home"/><h:commandButton styleClass="button_top" value="#{bundle_button.TOP_MYACCOUNT}" action="#{AccountAction.loadAction}"/><h:commandButton styleClass="button_top" value="#{bundle_button.TOP_MYPRODUCT}" action="myproduct_list"/></td>
            </h:form>
            <td valign="bottom">
              <div align="right">
                <h:commandButton styleClass="button_top" value="Logout" onclick="toLogout();"/>
              </div>
            </td>
          </tr>
        </table>
      <div align="right"></div>
    </td>
  </tr>
</table>
</html>

</f:subview>

<script>
function toLogout(){
	location.href="../../jsp/login/logout.jsf";
}
</script>
