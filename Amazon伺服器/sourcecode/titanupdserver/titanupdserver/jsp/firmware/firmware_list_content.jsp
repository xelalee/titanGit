<%@taglib uri="http://displaytag.sf.net" prefix="display" %>

<%@page import="com.titan.updserver.firmware.bean.FirmwareBean"%>
<%@page import="com.titan.updserver.firmware.dao.FirmwareDao"%>
<%@page import="com.titan.updserver.devicetype.dao.DeviceTypeDao"%>
<%@page import="com.titan.updserver.common.ContentBase"%>
<%@page import="java.util.*"%>
<%@page import="com.titan.util.Util"%>
<%@page import="com.titan.util.Keys"%>

<%
	String rootDirectory = (String)request.getContextPath();
%>

	<%
		//formate date
		String strDate=com.titan.util.DateUtil.getCurrentDate();

		String DEVICE=Util.getString(request.getParameter("DEVICE"));
		
		//ses sion operation
		if(request.getParameter("DEVICE")==null){
			DEVICE=Util.getString(request.getSession().getAttribute("SESSION_DEVICE"));
		}else{
			request.getSession().setAttribute("SESSION_DEVICE",DEVICE);
		}
		
		List<FirmwareBean> firmwares = FirmwareDao.getInstance().getFirmwares(DEVICE, true);
		
		session.setAttribute("firmwares_list",firmwares);
	%>


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>

<head>
<META HTTP-EQUIV="Pragma" CONTENT="no-cache">
<META HTTP-EQUIV="Cache-Control" CONTENT="no-cache">
<META HTTP-EQUIV="Expires" CONTENT="0">
<link rel="stylesheet" href="<%=rootDirectory%>/css/screen.css" type="text/css">
</head>

<body bgcolor="#FFFFFF" leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory%>/images/button/i_search.jpg')">

<table width="100%" height="100%"  border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" valign="top" width="100%">
    <table width="95%"  border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td height="30" class="title" width="100%">Firmware List <br>
          <hr align="left" color="#333333" width="100%" size="1">
        </td>
      </tr>
<!--search begin-->      
      <tr>
        <td width="100%">
          <table width="100%">
		  <tr>
		  <td width="100%">
		  <form name="form_content" method="get" action="">
          <table width="60%" align="center" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td>Device Type</td>
              <td>
              <select name="DEVICE" length="30">
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
	                  if(str_device.equalsIgnoreCase(DEVICE)) selected1="selected";
	                  %>
	                  <option value="<%=str_device%>" <%=selected1%>><%=str_device%></option>
	                  <%
	              	}
	              %> 
              </select>
              </td>
              <td>
              <input class="button" type="button" value="Search" name="Search" onClick="javascript:toSubmit();">
              </td>              
            </tr>
            <tr>
              <td colspan="2">&nbsp;</td>
            </tr>

            <tr>
              <td colspan="2">
              <input class="button" type="button" value="Add" name="Add" onClick="javascript:toNew();">
              </td>
            </tr>
            <tr>
              <td colspan="2">&nbsp;</td>
            </tr>

          </table>
          </form> 
          </td>
          </tr>
          </table>
        </td>
       </tr>   
<!--search end-->           
<!--list begin-->          
          <tr>
          <td width="100%">
          <table width="100%">
		  <tr>
		  <td width="100%">  
	          <display:table name="sessionScope.firmwares_list" class="its_sig" 
	          export="true" id="row" pagesize="20">
	          
	          <%
	          FirmwareBean bean = (FirmwareBean)pageContext.getAttribute("row");
	          %>
	            
	            <display:column title = "ID">
	            <a href="<%=rootDirectory%>/jsp/firmware/firmware_edit.jsp?FIRMWARE_ID=<%=bean.getFirmware_id()%>" ><%=bean.getFirmware_id()%></a> 
	            </display:column>
	            <display:column title = "Device"><%=bean.getDevice()%></display:column>
	            <display:column title = "Version"><%=bean.getVersion()%></display:column>
	            <display:column title = "Update By" ><%=bean.getUpdate_by()%></display:column>
	            <display:column title = "Update Date" ><%=bean.getUpdate_date()%></display:column>
	            <display:column title = "Size(Bytes)" ><%=bean.getFilesize()%></display:column>
	            
	            <display:setProperty name="basic.msg.empty_list" value="No firmware found to display"/>
	            <display:setProperty name="paging.banner.item_name" value="firmwares"/>
	            <display:setProperty name="paging.banner.items_name" value="firmwares"/>
	            
	            <display:setProperty name="export.csv" value="false"/>
	            <display:setProperty name="export.xml" value="false"/>
	            <display:setProperty name="export.excel.include_header" value="true"/>
	            <display:setProperty name="export.excel.filename" value="firmwares.xls"/>
	          </display:table>
          </td>
          </tr>

          <tr>
              <td>&nbsp;</td>
          </tr>
          </table>
          </td>
          </tr>
<!--list end-->          
    </table>
    </td>
  </tr>
</table>

</body>
</html>

<script language="JavaScript">

function toClear(name) {
	document.getElementsByName(name)[0].value = '';
}

function toSubmit(){
    document.forms["form_content"].action ="<%=rootDirectory%>/jsp/firmware/firmware_list.jsp";
    document.forms["form_content"].submit();
}

function PageControl(pIndex){
    document.forms["form_content"].action ="<%=rootDirectory%>/jsp/firmware/firmware_list.jsp";
	document.forms["form_content"].target= "";
	document.forms["form_content"].submit();
}

function toNew(){
    location.href="<%=rootDirectory%>/jsp/firmware/firmware_new.jsp";
}

</script>




