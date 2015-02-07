<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>
<%@ page import="com.titan.base.util.Key"%>
<%@ page import="com.titan.base.util.Keys"%>
<%@ page import="com.titan.base.util.Base64"%>
<%@ page import="com.titan.mytitan.login.bean.LoginBean"%>
<%@ page import="com.titan.mytitan.login.bean.EncodeJavaBean"%>

<%
    String education_url = "";
    LoginBean loginbean = (LoginBean)request.getSession().getAttribute(Keys.USER_INFO);
    if(loginbean == null){
    	education_url = "http://education.titan.com/redirect_mytitan.asp";
    }else{
    	String user = loginbean.getAccountbean().getUsername();
    	String pass = loginbean.getAccountbean().getPassword();
    	String enUser = EncodeJavaBean.encode(user);
        String enPass = EncodeJavaBean.encode(pass);
        String enBase64User = Base64.encodeBytes(enUser.getBytes());
        String enBase64Pass = Base64.encodeBytes(enPass.getBytes());
        education_url = "http://education.titan.com/redirect_mytitan.asp?id="+enBase64User+"&id2="+enBase64Pass;
    }
%>
<script language="JavaScript" type="text/JavaScript">
function openEducation(){
	window.open("<%=education_url%>");
}
</script>

<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />

<f:subview id="right">
<body leftmargin="0" topmargin="0">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr> 
    <td width="7">&nbsp;</td>
    <td width="11">&nbsp;</td>
    <td colspan="2">&nbsp;</td>
    <td width="516">&nbsp;</td>
    <td width="276">&nbsp;</td>
  </tr>
  <tr> 
    <td width="7">&nbsp;</td>
    <td colspan="3"><h:graphicImage value="#{bundle_button.SPOT}"/></td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
  <tr> 
    <td width="7">&nbsp;</td>
    <td width="11" valign="top" bordercolor="#FFFFFF" background="../../images/spot_l.gif">&nbsp;</td>
    <td width="189" valign="top" bordercolor="#FFFFFF"> <div align="center"><img src="../../images/spotline.jpg" width="170" height="125"></div></td>
    <td width="10" valign="top" bordercolor="#FFFFFF" background="../../images/spot_l.gif">&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
  <tr> 
    <td width="7">&nbsp;</td>
    <td colspan="3" valign="top" bordercolor="#FFFFFF">
    <img src="../../images/spot_d.gif" width="210" height="18" align="top">
    </td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
  <tr> 
    <td width="7">&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
  <%--  
  <tr> 
    <td width="7">&nbsp;</td>
    <td colspan="3" align="center" valign="top" bordercolor="#FFFFFF"><a href="<%=Key.CONFIGURE.getProperty("idp_banner")%>"><img src="../../images/IDP.gif" border="0"></a></td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
  <tr> 
    <td width="7">&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
   --%> 
<%--  
  <tr>
    <td width="7">&nbsp;</td>
    <td colspan="3" align="center" valign="top" bordercolor="#FFFFFF"><a href="javascript:openEducation();"><img src="../../images/education_logo.gif" width="169" height="56" border="0"></a></td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
 --%> 
</table>
</body>
</f:subview>
