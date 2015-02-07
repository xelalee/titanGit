<%@page import="com.titan.updserver.servicetype.dao.ServiceTypeDao"%>
<%@page import="java.util.*"%>
<%@page import="com.titan.util.Util"%>
<%--@page import="com.titan.jdbc.Page"--%>
<%--@page import="com.titan.util.HtmlUtility"--%>

<%
String rootDirectory = (String)request.getContextPath();

//----------get service type information start-----------------------------------
ServiceTypeDao serviceTypeJB = new ServiceTypeDao();
Collection col_serviceType = serviceTypeJB.getServiceTypeInfo();
//----------get service type information end-------------------------------------
%>


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>

<head>
<META HTTP-EQUIV="Pragma" CONTENT="no-cache">
<META HTTP-EQUIV="Cache-Control" CONTENT="no-cache">
<META HTTP-EQUIV="Expires" CONTENT="0">
</head>

<body bgcolor="#FFFFFF" leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory %>/images/button/i_add.jpg')">

<script language="JavaScript" type="text/JavaScript">
<!--

function doLink(service_type) {
  form1.method = "post";
  form1.action = "<%=rootDirectory%>/jsp/servicetype/service_edit.jsp?st="+service_type;
  form1.submit();
}

function toNew(){
	  location.href = '<%=rootDirectory %>/jsp/servicetype/service_new.jsp';
}

//-->
</script>

<table width="100%" height="100%"  border="0" cellpadding="0" cellspacing="0">
  <tr>
     <td align="center" valign="top">
        &nbsp;
	    <table width="95%"  border="0" cellpadding="0" cellspacing="0">
	      <tr>
	        <td height="30" class="title">Service Type List <br>
	          <hr align="left" color="#333333" width="100%" size="1">
	        </td>
	      </tr>
	      <tr>
	        <td>
	         <form name="form1" method="post" action="">
	         
	         <table width="60%"  border="0" cellpadding="5" cellspacing="1">
	          <tr bgcolor="#999999"> 
	            <td>&nbsp;</td>
	            <td align="center">Service Type</td>
	          </tr>
	          
			    <%
					if(col_serviceType!=null && col_serviceType.size()!=0){
				      	int count = 0;
				      	String rowStyle = "";
				      	HashMap hmp_serviceType = new HashMap();
				      	for(Iterator it=col_serviceType.iterator(); it.hasNext();){
				      		hmp_serviceType = (HashMap)it.next();
				      		if((count%2) == 0){
				      			rowStyle = "table_2";
				      		}else{
				      			rowStyle = "table_3";
				      		}	
				%>
				          <tr align="center" valign="top" class="<%= rowStyle %>"> 
				            <td><%= count + 1 %></td>
				            <td><a href="javascript:doLink('<%= Util.getString(hmp_serviceType.get("SERVICE")) %>');"><%= Util.getString(hmp_serviceType.get("SERVICE"),"&nbsp;") %></a></td>
				          </tr>
				<%
							count++;
						}//end for
					}else{
				%>
						  <tr align="center" valign="top" class="table_2"> 
				            <td>&nbsp;</td>
				            <td>&nbsp;</td>
				          </tr>	
				<%
					}//end if
				%>
	          
	          
	          <tr>
	            <td colspan='2'>
	              &nbsp;
	            </td>
	          </tr>
	          <tr>
                <td colspan=2>
                  <input class="button" type="button" value="Add" name="Add" onClick="javascript:toNew();"> 
                </td>
              </tr>
	
	        </table>
	          
	         </form> 
	        </td>
	      </tr>
	      <tr>
	        <td>&nbsp;</td>
	      </tr>
	    </table>
        <p>&nbsp;</p>
     </td>
     <td width="1" background="<%=rootDirectory%>/images/topic_vbg.gif"><img src="<%=rootDirectory%>/images/1px.gif" width="1" height="1"></td>
  </tr>
</table>

</body>
</html>





