<%@page import="com.titan.updserver.firmware.bean.FirmwareBean"%>
<%@page import="com.titan.updserver.firmware.dao.FirmwareDao"%>
<%@page import="com.titan.updserver.common.ContentBase"%>
<%@page import="com.titan.updserver.devicetype.dao.DeviceTypeDao"%>
<%@page import="com.titan.util.Util"%>
<%@page import="com.titan.util.SystemUtil"%>
<%@page import="com.titan.util.Keys"%>
<%@page import="java.util.*"%>
<%@ page import="com.titan.util.HtmlUtility"%>


<%
	String rootDirectory = (String)request.getContextPath();
%>

<%
   String MASTER_SLAVE="MASTER";
   String TITLE="";
   if(MASTER_SLAVE.equalsIgnoreCase("MASTER")) TITLE="Firmware Edit";
   else TITLE="Firmware Info";
   String FIRMWARE_ID=Util.getString(request.getParameter("FIRMWARE_ID"));
   FirmwareBean fwb=FirmwareDao.getInstance().getFirmwareByID(FIRMWARE_ID);
   String FILE_ON_SERVER_PATH = ContentBase.getInstance().getFirmwarePath(fwb);
   if(!ContentBase.getInstance().fileExists(FILE_ON_SERVER_PATH)) FILE_ON_SERVER_PATH="not exists";
%>

<html>

<head>
	<link rel="stylesheet" href="<%=rootDirectory %>/jquery/css/jquery.ui.all.css">
	<script src="<%=rootDirectory %>/jquery/jquery-1.6.2.js"></script>
	<script src="<%=rootDirectory %>/jquery/ui/jquery.ui.core.js"></script>
	<script src="<%=rootDirectory %>/jquery/ui/jquery.ui.widget.js"></script>
	<script src="<%=rootDirectory %>/jquery/ui/jquery.ui.progressbar.js"></script>
    <script src="<%=rootDirectory %>/js/myProgressBar.js"></script>
</head>

<body bgcolor="#EEEEEE" leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory %>/images/button/i_submit.jpg','<%=rootDirectory%>/images/button/i_delete.jpg','<%=rootDirectory%>/images/button/i_cancel.jpg')">

<form name="form1" method="post" action="" ENCTYPE='multipart/form-data'>

<table width="100%" height="100%"  border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" valign="top"><table width="95%"  border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td height="45" class="index"><%=TITLE%> /</td>
      </tr>

      <tr>
        <td height="30" class="title"><%=TITLE%> <br>
          <hr align="left" color="#333333" width="100%" size="1"></td>
      </tr>
      <tr>
        <td>
        <%if(MASTER_SLAVE.equalsIgnoreCase("MASTER")){%>
        <p>Note:<br>
        To change the firmware file, please locate a new one first.
        </p>
        <%}%>
          <table width="95%"  border="0" align="center" cellpadding="5" cellspacing="0" bordercolor="#EBEBEB">
            <tr>
              <th colspan="2">&nbsp;</th>
            </tr>            
            <tr>
              <td>Device:</td>
              <td height="19">
              <select name="DEVICE" disabled>
                 <option value="">----------SELECT----------</option>
	              <%
	              DeviceTypeDao devicetype=new DeviceTypeDao();
 	              Collection col_device=devicetype.getDeviceTypeInfo();
	              HashMap hm_device=new HashMap();        
	              String str_device="",selected1="";
	              for(Iterator it=col_device.iterator();it.hasNext();){
	                hm_device=(HashMap)it.next();
	                str_device=Util.getString(hm_device.get("DEVICE"));
	                selected1="";
	                if(str_device.equalsIgnoreCase(fwb.getDevice())) selected1="selected";
	              %>
	                 <option value="<%=str_device%>" <%=selected1%>><%=str_device%></option>
	              <%
	              }
	              %>                                 
              </select> 
              </td>
            </tr> 
            <tr>
              <td>Version:</td>
              <td height="19"><input name="VERSION" value="<%=fwb.getVersion()%>" type="text" size="50" maxlength="16" disabled>  
              </td>
            </tr>
            <tr>
              <td>Firmware:</td>
              <%if(MASTER_SLAVE.equalsIgnoreCase("MASTER")){%>
              <td height="19"><input name="FIRMWARE" type="file" size="50">  
                              <br>file on server: <%=FILE_ON_SERVER_PATH%>
              </td>
              <%}else {%>
              <td height="19"><input name="FIRMWARE" type="text" size="50" value="<%=FILE_ON_SERVER_PATH%>">  
              </td>              
              <%}%>
            </tr>                
          </table></td>
        </tr>
        <tr>
          <td height="40"><p>&nbsp;</p></td>
        </tr>
        <tr>
         <td align="left">
         <%if(MASTER_SLAVE.equalsIgnoreCase("MASTER")){%>
         <input class="button" type="button" value="Delete" name="Delete" onClick="javascript:toDelete('<%=FIRMWARE_ID%>');">
         <%}%>
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

function toDelete(FIRMWARE_ID){
    if(confirm("Are you sure to Delete?")){
	    document.forms["form1"].action = "<%= rootDirectory %>/mycontroller?action=FirmwareAction&dispatch=deleteFirmware"
	    +"&FIRMWARE_ID=<%=FIRMWARE_ID%>";
		document.forms["form1"].target = "";
		document.forms["form1"].submit();
	}
}

</script>