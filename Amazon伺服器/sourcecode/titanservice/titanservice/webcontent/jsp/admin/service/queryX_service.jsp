<%@ taglib uri="http://displaytag.sf.net" prefix="display" %>

<%@page import="java.util.List"%>
<%@page import="com.titan.base.service.dao.MyServiceDAO"%>
<%@page import="com.titan.base.service.bean.MyServiceBean"%>

<%@page import="com.titan.base.service.dao.LicenseDAO"%>
<%@page import="com.titan.base.service.bean.LicenseBean"%>

<%@page import="com.titan.base.util.Util"%>

<%
    String rootDirectory = (String)request.getContextPath();
    
    String my_service_id = Util.getString(request.getParameter("my_service_id"));
    
    MyServiceBean myservice = MyServiceDAO.getInstance().getMyServiceByID(my_service_id);
    
    String service_type = "";
    String service_name = "";
    String status = "";
    String begin_date = "";
    String expiration_date = "";
    
    List<LicenseBean> licenses = null;
    
    if(myservice!=null){
        service_type = myservice.getService_type_id().equals("S")?"Standard":"Trial";
        service_name = myservice.getService_name();
        status = myservice.getStatus();
        begin_date = myservice.getBegin_date();
        expiration_date = myservice.getExpiration_date();
        
    	licenses = LicenseDAO.getInstance().getLicenseKeysByMyServiceId(my_service_id);
    	
    	request.setAttribute("LICENSE_KEYS", licenses);
    }

    

%>

<link href="<%=rootDirectory %>/css/titan.css" rel="stylesheet" type="text/css">

<link href="<%=rootDirectory %>/css/screen.css" rel="stylesheet" type="text/css">

<html>
<head>
<title>Service Detail</title>
</head>
<body leftmargin="0" topmargin="0">

<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr>
        <td width="20" height="27">&nbsp;</td>
        <td colspan="2" valign="top"><br>
            <span class="title1">Service Detail</span><br>
            <hr align="left" color="#333333" width="75%" size="1">
            <br>
        </td>
        <td width="1" rowspan="12"></td>
    </tr>
    <tr>
        <td width="20" height="10">&nbsp;</td>
        <td>&nbsp;</td>
        <td valign="top">
        
        <table width="90%" border="0" cellspacing="0" cellpadding="0">
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" width="30%" align="left">
             <span class="content3">Service Type</span>
            </td>
            <td bgcolor="#F5F9FA" width="70%" align="left">
                 <%=service_type %>      
            </td>      	
          </tr>        
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
             <span class="content3">Service Name</span>
            </td>
            <td bgcolor="#F5F9FA" align="left">
                 <%=service_name %>      
            </td>      	
          </tr>        
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
             <span class="content3">Status</span>
            </td>
            <td bgcolor="#F5F9FA" align="left">
                 <%=status %>      
            </td>      	
          </tr>
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
             <span class="content3">Begin Date</span>
            </td>
            <td bgcolor="#F5F9FA" align="left">
                 <%=begin_date %>      
            </td>      	
          </tr>
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left" valign="top">
            <span class="content3">Expiration Date</span>        
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <%=expiration_date %>            
            </td>      	
          </tr>  
        </table>     
        </td>
      </tr>
      <tr>
        <td width="20" height="10">&nbsp;</td>
        <td>&nbsp;</td>
        <td valign="top"></td>
      </tr> 
      <tr>
        <td width="20" height="10">&nbsp;</td>
        <td>&nbsp;</td>
        <td valign="top">
        <display:table name="LICENSE_KEYS" class="its" export="false" id="row" >
		   <display:column property="license_key" title="License Key"/>
		   <display:column property="sn" title="SN"/>
		   <display:column property="begin_date" title="Begin Date"/>
		   <display:column property="status" title="Status"/>

           <display:setProperty name="basic.msg.empty_list" value="No license key found to display"/>
           <display:setProperty name="paging.banner.item_name" value="license key"/>
           <display:setProperty name="paging.banner.items_name" value="license keys"/>
           <display:setProperty name="paging.banner.placement" value="bottom"/>
           <display:setProperty name="paging.banner.onepage" value=""/>
        </display:table>
        </td>
      </tr>  

</table>
</body>
</html>


