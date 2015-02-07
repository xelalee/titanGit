<%@page import="com.titan.util.Util"%>
<%
  String rootDirectory = (String)request.getContextPath();
  String servicetype = Util.getString(request.getParameter("st"));
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>

<head>
<META HTTP-EQUIV="Pragma" CONTENT="no-cache">
<META HTTP-EQUIV="Cache-Control" CONTENT="no-cache">
<META HTTP-EQUIV="Expires" CONTENT="0">
</head>

<script language="JavaScript" type="text/JavaScript">

function LTrim(str)
{
    var whitespace = new String(" \t\n\r");
    var s = new String(str);
    
    if (whitespace.indexOf(s.charAt(0)) != -1)
    {
        var j=0, i = s.length;
        while (j < i && whitespace.indexOf(s.charAt(j)) != -1)
        {
            j++;
        }
        s = s.substring(j, i);
    }
    return s;
}
function RTrim(str)
{
    var whitespace = new String(" \t\n\r");
    var s = new String(str);
 
    if (whitespace.indexOf(s.charAt(s.length-1)) != -1)
    {
        var i = s.length - 1;
        while (i >= 0 && whitespace.indexOf(s.charAt(i)) != -1)
        {
            i--;
        }
        s = s.substring(0, i+1);
    }
    return s;
}


function toUpdate(){
    var servicetype = document.form1.service_type.value;
    
    servicetype = RTrim(LTrim(servicetype));
    
    if(servicetype == ""){
        alert("The service type cannot be null!");
        return;
    }
    
    if(!isValidFileName(servicetype)) {
        alert("Invalid service type, only alphabet(a~z|A~Z), digit and . are allowed")
        return;
    }      	 
        
    document.form1.action = '<%= rootDirectory %>/controller?hidFunction=SERVICE_TYPE&hidAction=UPDATE';
	document.form1.target= "";
	document.form1.submit();  	
}

function toDelete(){
	if(confirm("Are you sure to Delete?")){
		document.form1.action = '<%= rootDirectory %>/controller?hidFunction=SERVICE_TYPE&hidAction=DELETE';
		document.form1.target= "";
		document.form1.submit();
	}
}

function toCancel(){
	location.href="<%=rootDirectory%>/jsp/servicetype/service_list.jsp";
}

</script>


<body bgcolor="#EEEEEE" leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory %>/images/button/i_submit.jpg','<%=rootDirectory%>/images/button/i_cancel.jpg')">

<form name="form1" method="post" action="">
<input type='hidden' name='org_service_type' value="<%=servicetype%>">

<table width="100%" height="100%"  border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" valign="top"><table width="95%"  border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td height="45" class="index">Service Type Edit /</td>
      </tr>

      <tr>
        <td height="30" class="title">Service Type Edit <br>
          <hr align="left" color="#333333" width="100%" size="1"></td>
      </tr>
      <tr>
        <td>
          <table width="65%"  border="0" cellpadding="5" cellspacing="0" bordercolor="#EBEBEB">
            <tr>
              <th colspan=2>&nbsp;</th>
            </tr>            
            <tr>
              <td><span class="star">* <span class="content3">Service Type Name:</td>
              <td height="19"><input name="service_type" type="text" value="<%=servicetype%>" size="50" maxlength="30"> 
              </td>
            </tr>                                            
          </table></td>
        </tr>
        <tr>
          <td height="40"><p>&nbsp;</p></td>
        </tr>
        <tr>
         <td align="left">
        <!--function button-->
        <input class="button" type="button" value="Save" name="Save" onClick="javascript:toUpdate();">
        <input class="button" type="button" value="Delete" name="Delete" onClick="javascript:toDelete();">
        <input class="button" type="button" value="Cancel" name="Cancel" onClick="javascript:toCancel();">
         </td>
        </tr>
        </table></td>
      </tr>        
</table>
</form>

</body>

</html>