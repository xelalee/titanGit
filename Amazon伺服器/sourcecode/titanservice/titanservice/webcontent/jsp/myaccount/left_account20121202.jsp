<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<f:loadBundle basename="com.titan.mytitan.account.bundles.Resources" var="bundle_left"/>
<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />
<f:subview id="left">
<script language="JavaScript" type="text/JavaScript">
var deltaH = 100; 
var main = "win_left"; 
function setWinHW()
{
  if (window.innerHeight) 
  {
        //for FF 
          winH = window.innerHeight - deltaH;
  } else 
  { 
        //for IE
          winH = document.documentElement.offsetHeight - deltaH - 10;
  }

  var me = document.getElementById(main);
  me.style.height= '' + winH + 'px';
}
window.onresize = function () {setWinHW();};
window.onload = function(){setWinHW();};
</script>
<body bgcolor="#F2F2F2" alink="#999900" leftmargin="0" topmargin="0">
<div id="win_left">
<table width="190" border="0" cellspacing="0" cellpadding="0">
	<tr>
		<td colspan="3"><h:graphicImage value="#{bundle_button.LEFT_ACC}"/></td>
	</tr>
	<tr bgcolor="#F2F2F2">
		<td width="18" height="27">&nbsp;</td>
		<h:form>
		<td width="152" height="27" valign="top">
			<p><font color="#333333" size="1" face="Verdana, Arial, Helvetica, sans-serif">
			
			<h:commandLink action="#{AccountAction.loadAction}" >
				<h:outputText value="#{bundle_left.PERSONAL_INFORMATION}"/>
			</h:commandLink>
			
			<br>
		</font>
		</p>
		</td>
		</h:form>
		<td width="21" height="27">&nbsp;</td>
	</tr>
	<tr valign="top">
		<td colspan="3"></td>
	</tr>
	<tr>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
		<td>&nbsp;</td>
	</tr>
</table>
</div>
</body>
</f:subview>

