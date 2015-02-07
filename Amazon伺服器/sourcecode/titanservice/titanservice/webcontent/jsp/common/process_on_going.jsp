<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<f:loadBundle basename="com.titan.mytitan.common.bundles.Resources" var="bundle_process"/>

<f:subview id="process_on_going">

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="8" height="27">&nbsp;</td>
    <td width="559">
      <br><br>
      <span class="title1">
      <h:outputText value="#{bundle_process.PROCESS_ON_GOING}" />
      </span>
      <br>
      <hr align="left" color="#333333" width="100%" size="1">
    </td>
  </tr>
  <tr>
    <td width="8" height="27">&nbsp;</td>
    <td width="559" align="center">
      <br>
      <img src="../../images/animation.gif">
      <br>
      <h:outputText value="#{bundle_process.PLEASE_WAIT}" styleClass="content1"/>
    </td>
  </tr>  
</table>
</f:subview>