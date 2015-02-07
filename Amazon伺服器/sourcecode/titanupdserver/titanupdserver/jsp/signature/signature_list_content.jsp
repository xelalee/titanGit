<%@taglib uri="http://displaytag.sf.net" prefix="display" %>

<%@page import="com.titan.updserver.signature.bean.SignatureBean"%>
<%@page import="com.titan.updserver.signature.dao.SignatureDao"%>
<%@page import="com.titan.updserver.devicetype.dao.DeviceTypeDao"%>
<%@page import="com.titan.updserver.servicetype.dao.ServiceTypeDao"%>
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
		String SERVICE=Util.getString(request.getParameter("SERVICE"));
		
		//ses sion operation
		if(request.getParameter("DEVICE")==null){
			DEVICE=Util.getString(request.getSession().getAttribute("SESSION_DEVICE"));
		}else{
			request.getSession().setAttribute("SESSION_DEVICE",DEVICE);
		}
		if(request.getParameter("SERVICE")==null){
			SERVICE=Util.getString(request.getSession().getAttribute("SESSION_SERVICE"));
		}else{
			request.getSession().setAttribute("SESSION_SERVICE",SERVICE);
		}
		
		List<SignatureBean> signatures = SignatureDao.getInstance().getSignature(DEVICE, SERVICE, true);
		
		session.setAttribute("signatures_list",signatures);
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
        <td height="30" class="title" width="100%">Signature List <br>
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
            </tr>
            <tr>
              <td>Service Type</td>
              <td>
              <select name="SERVICE" length="30">
                 <option value="">----------SELECT----------</option>
	               <%
	               	ServiceTypeDao servicetype=new ServiceTypeDao();
	                Collection col_service=servicetype.getServiceTypeInfo();
	               	HashMap hm_service=new HashMap();        
	               	              String str_service="",selected2="";
	               	              for(Iterator it=col_service.iterator();it.hasNext();){
	               	                hm_service=(HashMap)it.next();
	               	                str_service=Util.getString(hm_service.get("SERVICE"));
	               	                selected2="";
	               	                if(str_service.equalsIgnoreCase(SERVICE)) selected2="selected";
	               %>
	                 <option value="<%=str_service%>" <%=selected2%>><%=str_service%></option>
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
	          <display:table name="sessionScope.signatures_list" class="its_sig" 
	          export="true" id="row" pagesize="20">
	          
	          <%
	                    SignatureBean bean = (SignatureBean)pageContext.getAttribute("row");
	          %>
	            
	            <display:column title = "ID">
	            <a href="<%=rootDirectory%>/jsp/signature/signature_edit.jsp?SIGNATURE_ID=<%=bean.getSignature_id()%>" ><%=bean.getSignature_id()%></a> 
	            </display:column>
	            <display:column title = "Device"><%=bean.getDevice()%></display:column>
	            <display:column title = "Servie"><%=bean.getService()%></display:column>
	            <display:column title = "Version" ><%=bean.getSig_ver()%></display:column>
	            <display:column title = "Fullset" ><%=bean.getFullset()%></display:column>
	            <display:column title = "Update By" ><%=bean.getUpdate_by()%></display:column>
	            <display:column title = "Update Date" ><%=bean.getUpdate_date()%></display:column>
	            <display:column title = "Size(Bytes)" ><%=ContentBase.getInstance().getFileSize(bean)%></display:column>
	            <display:column title = "Status" >
                   <%
                    if(bean.getStatus().equalsIgnoreCase(Keys.STATUS_INACTIVE)){
                    %>
                    <font color="red"><%=bean.getStatus()%></font>
                    <%
                    }else{
                    %>
                    <%=bean.getStatus()%>
                    <%
                    }
                    %>
                </display:column>
	            
	            <display:setProperty name="basic.msg.empty_list" value="No signature found to display"/>
	            <display:setProperty name="paging.banner.item_name" value="signature"/>
	            <display:setProperty name="paging.banner.items_name" value="signatures"/>
	            
	            <display:setProperty name="export.csv" value="false"/>
	            <display:setProperty name="export.xml" value="false"/>
	            <display:setProperty name="export.excel.include_header" value="true"/>
	            <display:setProperty name="export.excel.filename" value="signatures.xls"/>
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

function PageControl(pIndex){
    document.forms["form_content"].action ="<%=rootDirectory%>/jsp/signature/signature_list.jsp";
	document.forms["form_content"].target= "";
	document.forms["form_content"].submit();
}

function toSubmit(){
    document.forms["form_content"].action ="<%=rootDirectory%>/jsp/signature/signature_list.jsp";
    document.forms["form_content"].submit();
}

function toNew(){
	location.href="<%=rootDirectory%>/jsp/signature/signature_new.jsp";
}

</script>




