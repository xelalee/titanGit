
<%@page import="com.titan.updserver.devicetype.dao.DeviceTypeDao"%>

<%@page import="com.titan.updserver.firmware.FirmwareTempFile"%>
<%@page import="com.titan.util.Util"%>
<%@page import="java.util.*"%>


<%String rootDirectory = (String)request.getContextPath();%>

<html>

<head>

</head>

<body bgcolor="#EEEEEE" leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory %>/images/button/i_submit.jpg','<%=rootDirectory%>/images/button/i_cancel.jpg')">

<form name="form1" method="post" action="" ENCTYPE='multipart/form-data'>

<table width="100%" height="100%"  border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" valign="top"><table width="95%"  border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td height="45" class="index">Firmware Create /</td>
      </tr>
      <tr>
        <td height="30" class="title">Firmware Create <br>
          <hr align="left" color="#333333" width="100%" size="1"></td>
      </tr>
      <tr>
        <td><p>Note:<br>
        Please locate the firmware file first, then click submit.</p>
          <table width="95%"  border="0" align="center" cellpadding="5" cellspacing="0" bordercolor="#EBEBEB">
            <tr>
              <th colspan="2">&nbsp;</th>
            </tr>            
            <tr>
              <td>Device:</td>
              <td height="19">
              <select name="DEVICE">
                 <option value="">----------SELECT----------</option>
	               <%
	              DeviceTypeDao devicetype=new DeviceTypeDao();
 	              Collection col_device=devicetype.getDeviceTypeInfo();
	              HashMap hm_device=new HashMap();        
	              String str_device="";
	              for(Iterator it=col_device.iterator();it.hasNext();){
	                hm_device=(HashMap)it.next();
	                str_device=Util.getString(hm_device.get("DEVICE"));
	              %>
	                 <option value="<%=str_device%>"><%=str_device%></option>
	              <%
	              }
	              %> 
              </select> 
              </td>
            </tr> 
            <tr>
              <td>Version:</td>
              <td height="19"><input name="VERSION" type="text" size="50" maxlength="16" onkeyup="filterFwVerInput(event);">  
              </td>
            </tr>                                   
            <tr>
              <td>Firmware:</td>
              <td height="19">
              <select name="FIRMWARE">
                 <option value="">----------SELECT----------</option>
	               <%
	              List<String> files = FirmwareTempFile.getTempFiles();
	              for(String file:files){
	              %>
	                 <option value="<%=file%>"><%=file%></option>
	              <%
	              }
	              %> 
              </select>
              
              </td>
            </tr>                      
          </table></td>
        </tr>
        <tr>
          <td height="40"><p>&nbsp;</p></td>
        </tr>
        <tr>
         <td align="left">
	                <input class="button" type="button" value="Submit" name="Submit" onClick="javascript:toSubmit();">
                    <input class="button" type="button" value="Cancel" name="Cancel" onClick="javascript:history.go(-1);">
         </td>
        </tr>
        <tr>
          <td height="20"><p>&nbsp;</p></td>
        </tr>        
        <tr>
         <td width="60%">
         
   <div id="progress">
    <div id="progressbar"></div>
   	<div id="info"></div>
   </div>
            
         </td>
        </tr>
        </table></td>
      </tr>        
</table>
</form>

</body>

</html>

<script language="JavaScript">

function toClear(name) {
	document.getElementsByName(name)[0].value = '';
}

function toSubmit(){
    var DEVICE=document.form1.DEVICE.value; 
    var VERSION=document.form1.VERSION.value;
    var filename=trim(document.form1.FIRMWARE.value);
    var hint="";
    var subffix="";
    if(trim(DEVICE)==""||trim(VERSION)=="") 
        hint+="DEVICE/VERSION can't be empty!\r\n";   
        
    if(!isValidFileName(DEVICE)) hint+="Invalid char in Device Type!";

	if(filename.length<5) hint+="Please locate a correct firmware file!\r\n";
	else{   
		if(filename.length!=document.form1.FIRMWARE.value.length)
	        hint+="Please remove misinput spaces!\r\n"; 
	    else{
		    subffix=getSubffix(filename);//subffix
		    if(subffix.toUpperCase()!="IMG"){
		    	alert("A file name with subffix .img is needed!");
		    	return;
		    } 	        
	    } 	             
	}
	
    if(hint!=""){
       alert(hint);
       return;
    }

    if(confirm("Are you sure to Submit?")){
	    document.form1.action = "<%= rootDirectory %>/mycontroller?action=FirmwareAction&dispatch=newFirmware"
	    +"&DEVICE="+DEVICE
	    +"&VERSION="+VERSION
	    +"&FIRMWARE="+filename
	    +"&STATUS=1";
		document.form1.target = "";
		
		document.form1.submit();
	}

}

</script>