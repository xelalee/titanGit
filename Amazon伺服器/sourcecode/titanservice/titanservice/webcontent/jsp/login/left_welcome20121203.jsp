<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>

<f:loadBundle basename="com.titan.mytitan.common.bundles.ButtonResources" var="bundle_button" />

<f:subview id="left_wel">
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
    <td colspan="3"><h:commandButton image="#{bundle_button.LOGIN_WEL}" action="home" /></td>
  </tr>
  <tr valign="top">
    <td colspan="3"></td>
  </tr>
  <tr>
    <td width="64">&nbsp;</td>
    <td width="64">&nbsp;</td>
    <td width="62">&nbsp;</td>
  </tr>
</table>
</div>
</body>
</f:subview>


