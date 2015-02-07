<%@taglib uri="http://displaytag.sf.net" prefix="display" %>

<%@page import="java.text.*"%>
<%@page import="java.util.*"%>
<%@page import="com.titan.util.Util"%>
<%@page import="com.titan.util.DateUtil"%>
<%@page import="com.titan.util.HtmlUtility"%>
<%@page import="com.titan.log4web.Timestamp" %>
<%@page import="com.titan.util.Keys"%>
<%@page import="com.titan.util.Configure"%>
<%@page import="com.titan.util.DateUtil"%>
<%@page import="com.titan.updserver.log.bean.LogBean"%>

<%@page import="com.titan.updserver.log.dao.LogSearchDao"%>

<%@page import="com.titan.updserver.signature.bean.SignatureBean"%>

<%
String rootDirectory = (String)request.getContextPath();

String cat = Util.getString(request.getParameter("Category"));

String startDay = Util.getString(request.getParameter("startDay"));
if(startDay.equals("")){
	startDay = DateUtil.getCurrentDate();
}
int StartTimeHH = Util.getInteger(request.getParameter("StartTimeHH"));
int StartTimemm = Util.getInteger(request.getParameter("StartTimemm"));

String endDay = Util.getString(request.getParameter("endDay"));
if(endDay.equals("")){
	endDay = DateUtil.getCurrentDatePlus(1);
}
int EndTimeHH = Util.getInteger(request.getParameter("EndTimeHH"));
int EndTimemm = Util.getInteger(request.getParameter("EndTimemm"));

String keyword = Util.getString(request.getParameter("keyword"));

%>


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>

<head>
<META HTTP-EQUIV="Pragma" CONTENT="no-cache">
<META HTTP-EQUIV="Cache-Control" CONTENT="no-cache">
<META HTTP-EQUIV="Expires" CONTENT="0">

<link rel="stylesheet" href="<%=rootDirectory%>/css/screen.css" type="text/css">

<link type="text/css" href="<%=rootDirectory%>/jquery/css/redmond/jquery-ui-1.8.16.custom.css" rel="stylesheet" />	
<script type="text/javascript" src="<%=rootDirectory%>/jquery/jquery-1.6.2.js"></script>
<script type="text/javascript" src="<%=rootDirectory%>/jquery/ui/jquery-ui-1.8.16.custom.js"></script>


</head>

<body bgcolor="#FFFFFF" leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory %>/images/button/i_search.jpg')">

<script language="JavaScript" type="text/JavaScript">
<!--

var $jq = jQuery.noConflict();

$jq(function(){

	// Datepicker
	$jq('#startDay').datepicker();
	$jq('#startDay').datepicker("option", "dateFormat", "yy-mm-dd");
	$jq('#startDay').datepicker("setDate", "<%=startDay%>");
	
	$jq('#endDay').datepicker();
	$jq('#endDay').datepicker("option", "dateFormat", "yy-mm-dd");
	$jq('#endDay').datepicker("setDate", "<%=endDay%>");
	
});

function check_date_range()
{
    var date, year, mon, day, hour, min;
    var begin_date, end_date;
    var strs;

    date=document.form1.startDay.value;

    strs = date.split("-");
    
    year=strs[0];
	mon=strs[1];
	day=strs[2];
	hour=document.form1.StartTimeHH.value;
	min=document.form1.StartTimemm.value;
	
	begin_date = new Date(year, mon, day, hour, min, 0);
	
    date=document.form1.endDay.value;

    strs = date.split("-");
    
    year=strs[0];
	mon=strs[1];
	day=strs[2];
	hour=document.form1.EndTimeHH.value;
	min=document.form1.EndTimemm.value;
	
	end_date = new Date(year, mon, day, hour, min, 0);
	
	if (begin_date < end_date) {
	  return true;
	} else {
	  return false;
	}
}

function toSearch() {
    
    if (check_date_range() != true) {
      alert("invalid date range, start time must be earlier than end time!");
      return;
    }

    document.form1.action = '<%= rootDirectory %>/controller?hidFunction=LOG_MAN&hidAction=SEARCH';
	document.form1.target= "";
	document.form1.submit();
}

//-->
</script>

<table width="100%" height="100%"  border="0" cellpadding="0" cellspacing="0">
  <tr height="30%">
     <td align="center" valign="top">
     &nbsp;
	    <table width="95%"  border="0" cellpadding="0" cellspacing="0">
	      <tr>
	        <td height="30" class="title">Log Viewer <br>
	          <hr align="left" color="#333333" width="100%" size="1">
	        </td>
	      </tr>
	      <tr>
	        <td>
	         <form name="form1" method="post" action="">
	         
	         <table width="70%"  border="0" cellpadding="5" cellspacing="1">        
			  <tr>
			    <td colspan="2" width="50%">Category</td>
			    <td colspan="2" width="50%">
			        <select name="Category" size="1">
			          <option class="inputText" value="System" <%=cat.equalsIgnoreCase("System")?"selected":"" %>>System</option>
			          <option class="inputText" value="Signature Request" <%=cat.equalsIgnoreCase("Signature Request")?"selected":"" %>>Signature Request</option>
			          <option class="inputText" value="Firmware Request" <%=cat.equalsIgnoreCase("Firmware Request")?"selected":"" %>>Firmware Request</option>			          
			          <option class="inputText" value="Signature Download" <%=cat.equalsIgnoreCase("Signature Download")?"selected":"" %>>Signature Download</option>
			          <option class="inputText" value="Firmware Download" <%=cat.equalsIgnoreCase("Firmware Download")?"selected":"" %>>Firmware Download</option>
			        </select>
			    </td>
			  </tr>	
			  <tr>
			    <td colspan="2">Start Time</td>
			    <td colspan="2"> 
			      <input name="startDay" id="startDay" type="text" size="20" value="<%=startDay%>" readonly="true">

			    <select name="StartTimeHH" size="1">
			      <%
			        int[] hours = Timestamp.getHours();
			        for (int j=0; j!=hours.length; j++)
			        {
			      %>
			          <option class="inputText" value="<%=hours[j]%>" <%=(StartTimeHH==j)?"selected":""%>><%=Timestamp.getHourName(j)%></option>
			      <%
			        }
			      %>
			    </select>:
			    <select name="StartTimemm" size="1">
			      <%
			        int[] minutes = Timestamp.getMinutes();
			        for (int j=0; j!=minutes.length; j++)
			        {
			      %>
			          <option class="inputText" value="<%=minutes[j]%>" <%=(StartTimemm==j)?"selected":""%>><%=Timestamp.getMinuteName(j)%></option>
			      <%
			        }
			      %>
			    </select>
			    </td>
			  </tr>
			  <tr>
			    <td colspan="2">End Time</td>
			    <td colspan="2"> 
			       <input name="endDay" id="endDay" type="text" size="20" value="<%=endDay%>" readonly="true">

			    <select name="EndTimeHH" size="1">
			      <%
			        for (int j=0; j!=hours.length; j++)
			        {
			      %>
			          <option class="inputText" value="<%=hours[j]%>" <%=(EndTimeHH==j)?"selected":""%>><%=Timestamp.getHourName(j)%></option>
			      <%
			        }
			      %>
			    </select>:
			    <select name="EndTimemm" size="1">
			      <%
			        for (int j=0; j!=minutes.length; j++)
			        {
			      %>
			          <option class="inputText" value="<%=minutes[j]%>" <%=(EndTimemm==j)?"selected":""%>><%=Timestamp.getMinuteName(j)%></option>
			      <%
			        }
			      %>
			    </select>
			    </td>
			  </tr>			  
			  <tr>
			    <td colspan="2">Keyword <BR>(input MAC, SRCIP for request/download logs;<BR>input MESSAGE for system Logs)</td>
			    <td colspan="2"><input type="text" name="keyword" class="inputText" size="32" maxlength="40" value="<%=keyword %>"></td>
			  </tr>			  	          
	          <tr>
	            <td colspan='4'>
	              &nbsp;
	            </td>
	          </tr>
	          <tr>
                <td align="left">
                  <input class="button" type="button" value="Search" name="Search" onClick="javascript:toSearch();">
                </td>
              </tr>
	        </table>	          
	         </form> 
	        </td>
	      </tr>
	    </table>
     </td>
  </tr>
<%
if(request.getParameter("Category")!=null){
	int total = Util.getInteger(request.getAttribute("TOTAL_AMOUNT"));
	int showCount = Util.getInteger(request.getAttribute("SHOW_AMOUNT"));
%>  

  <tr>
     <td align="center" valign="top">
	    <table width="95%"  border="0" cellpadding="0" cellspacing="0">
		  <tr>
		     <td align="left" valign="top">
		     Totally get <%=total %> logs. Show <%=showCount %> logs.
		     </td>
		  </tr>	    
	      <tr>
	        <td>	        
	          <display:table name="sessionScope.LOG_LIST" class="its_sig" export="true" id="row" pagesize="20">	          
	          <%
	             LogBean bean = (LogBean)pageContext.getAttribute("row");
	          %>
	            
	            <display:column title = "Time"><%=bean.getLogtimestr()%></display:column>
	            <display:column title = "Category"><%=bean.getCat()%></display:column>
	            <display:column title = "Message"><%=bean.getMessage()%></display:column>
	            
	            <display:setProperty name="basic.msg.empty_list" value="No log found to display"/>
	            <display:setProperty name="paging.banner.item_name" value="log"/>
	            <display:setProperty name="paging.banner.items_name" value="logs"/>
	            
	            <display:setProperty name="export.csv" value="false"/>
	            <display:setProperty name="export.xml" value="false"/>
	            <display:setProperty name="export.excel.include_header" value="true"/>
	            <display:setProperty name="export.excel.filename" value="updserver_log.xls"/>
	          </display:table>
	           
	        </td>        
	      </tr>      

	    </table>
     </td>
  </tr>
  
<%
}
%>
</table>

</body>
</html>





