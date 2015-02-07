<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<f:loadBundle basename="com.titan.mytitan.common.bundles.Resources" var="bundle_bottom"/>

<f:subview id="bottom">
<body bgcolor="#FFFFFF" background=""  leftmargin="0" topmargin="0">
<table width="100%" height="10%" border="0" cellpadding="0" cellspacing="0" bgcolor="#F0F0F0">
  <tr align="center">
    <td width="40%" height="25" valign="center" class="content3"> 
    <h:outputText value="#{bundle_bottom.BOTTOM_VERSION}" />&nbsp;1.0
    </td>
  </tr>
</table>
</body>
</f:subview>
