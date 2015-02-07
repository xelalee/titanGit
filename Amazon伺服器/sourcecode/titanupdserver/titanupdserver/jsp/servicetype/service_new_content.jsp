<%
String rootDirectory = (String)request.getContextPath();
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>

<head>
<META HTTP-EQUIV="Pragma" CONTENT="no-cache">
<META HTTP-EQUIV="Cache-Control" CONTENT="no-cache">
<META HTTP-EQUIV="Expires" CONTENT="0">
</head>

<script language="JavaScript" type="text/JavaScript">

function doCancel() {
  location.href = "<%=rootDirectory%>/jsp/servicetype/service_list.jsp";
}

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

     	
function doSave(){
     
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
        
    document.form1.action = '<%= rootDirectory %>/controller?hidFunction=SERVICE_TYPE&hidAction=ADDNEW';
	document.form1.target= "";
	document.form1.submit(); 
}

</script>

<body bgcolor="#EEEEEE" leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory %>/images/button/i_submit.jpg','<%=rootDirectory%>/images/button/i_cancel.jpg')">

<form name="form1" method="post" action="">

<table width="100%" height="100%"  border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" valign="top"><table width="95%"  border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td height="45" class="index">Service Type Create /</td>
      </tr>

      <tr>
        <td height="30" class="title">Service Type Create <br>
          <hr align="left" color="#333333" width="100%" size="1"></td>
      </tr>
      <tr>
        <td>
          <table width="65%"  border="0" cellpadding="5" cellspacing="0" bordercolor="#EBEBEB">
            <tr>
              <th colspan=2>&nbsp;</th>
            </tr>           
            <tr>
              <td><span class="star">* <span class="content3">Service Type Name:</span></td>
              <td height="19"><input name="service_type" type="text" size="50" maxlength="30" onkeypress="if(window.event.keyCode == 13){return  false;}"></td>
            </tr>          
          </table></td>
        </tr>
        <tr>
          <td height="40"><p>&nbsp;</p></td>
        </tr>
        <tr>
	        <td valign="top"><p><font color="#666666" size="1" face="Verdana, Arial, Helvetica, sans-serif"><span class="content3">
	        <input class="button" type="button" value="Save" name="Save" onClick="javascript:doSave();">
            <input class="button" type="button" value="Cancel" name="Cancel" onClick="javascript:doCancel();">
	        </span></font> </p></td>
        </tr>
        </table></td>
      </tr>        
</table>
</form>

</body>
</html>





