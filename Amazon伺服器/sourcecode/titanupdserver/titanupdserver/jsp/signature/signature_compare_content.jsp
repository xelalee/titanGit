<%@page import="java.util.*"%>
<%@page import="com.titan.util.Util"%>
<%@page import="com.titan.util.Keys"%>
<%@page import="com.titan.util.Configure"%>

<%@page import="com.titan.updserver.signature.CompareServer" %>
<%@page import="com.titan.updserver.signature.SyncServer" %>
 
<%String rootDirectory = (String)request.getContextPath();%>

<%
	String region = Util.getString(request.getParameter("Region"));
    String action = Util.getString(request.getParameter("myAction"));
    
    List<SignatureCompareBean> compares = null;
    boolean syncFlag = false;
    if(action.equals("compare")){
    	CompareServer compareServer = new CompareServer();
    	compares = compareServer.compare(region);
    }else if(action.equals("sync")){
    	CompareServer compareServer = new CompareServer();
    	compares = compareServer.compare(region);
    	
    	SyncServer syncServer = new SyncServer();
    	syncFlag = syncServer.sync(region, compares);
    }

%>


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>

<head>
<META HTTP-EQUIV="Pragma" CONTENT="no-cache">
<META HTTP-EQUIV="Cache-Control" CONTENT="no-cache">
<META HTTP-EQUIV="Expires" CONTENT="0">
<link rel="stylesheet" href="<%=rootDirectory%>/css/screen.css" type="text/css">
</head>

<body bgcolor="#FFFFFF" leftmargin="0" topmargin="0" onLoad="">

<table width="100%" height="100%"  border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" valign="top" width="100%">
    &nbsp;
    <table width="95%"  border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td height="30" class="title" width="100%">Signature Compare <br>
          <hr align="left" color="#333333" width="100%" size="1">
        </td>
      </tr>
<!--search begin-->      
      <tr>
        <td>
		  <form name="form_content" method="post" action="">
          <table width="60%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td width="20%" align="left">Region</td>
              <td width="80%" align="left">
			        <select name="Region" size="1">
			        <%
			          for(S3Bean s3: Configure.s3Settings){
			        %>
			          <option class="inputText" value="<%=s3.getRegion()%>" <%=region.equalsIgnoreCase(s3.getRegion())?"selected":"" %>><%=s3.getRegion() %></option>
			        <%
			          }
			        %>
			        </select>             
              </td>
            </tr>
            <tr>
              <td colspan="2">&nbsp;</td>
            </tr>            
            <tr>
              <td colspan="2">&nbsp;</td>
            </tr>
            <tr>
              <td colspan="2"><input class="FlatButton" type="button" value="Compare" name="compare" onClick="javascript:toCompare();">&nbsp;&nbsp;&nbsp;<input class="FlatButton" type="button" value="  Sync " name="sync" onClick="javascript:toSync();"></td>
            </tr>            
            <tr>
              <td colspan="2">&nbsp;</td>
            </tr>

          </table>
          </form>
        </td>
       </tr>   
<!--search end-->           
<!--list begin-->          
          <tr>
          <td width="100%">
          <table width="100%">
		  <tr>
		  <td width="100%">  
<%
   if(compares!=null){
%>


		<table width="100%"  border="0" align="center" cellpadding="5" cellspacing="1" style="word-break:break-all">
		<tr bgcolor="#999999">
		  <td width="10%" align="center">ID</td>
		  <td width="15%" align="center">Device</td>
		  <td width="15%" align="center">Service</td>
		  <td width="15%" align="center">Signature Version</td>
		  <td width="10%" align="center">Fullset</td>
		  <td width="10%" align="center">Uploaded</td>
		  <td width="25%" align="center">Compare Result</td>
		</tr>
<% 
      int i=0;
      int j=0;
      for(SignatureCompareBean compare: compares){
    	  j=(i%2)+1;
    	  i++;
    	  String cellcolor = "cellcolor"+j;
%>
		<tr>
		  <td align="center" class="<%=cellcolor%>"><%=compare.getSignature().getSignature_id() %></td>
		  <td align="center" class="<%=cellcolor%>"><%=compare.getSignature().getDevice() %></td>
		  <td align="center" class="<%=cellcolor%>"><%=compare.getSignature().getService() %></td>
		  <td align="center" class="<%=cellcolor%>"><%=compare.getSignature().getSig_ver() %></td>
		  <td align="center" class="<%=cellcolor%>"><%=compare.getSignature().getFullset() %></td>
		  <td align="center" class="<%=cellcolor%>"><%=compare.getSignature_status() %></td>
		  <%
		  if(compare.isCompareEquals()){
		  %>
          <td align="center" class="<%=cellcolor%>"><%=compare.getCompareResult() %></td>			  
		  <%	  
		  }else{
		  %>
          <td align="center" class="<%=cellcolor%>"><font color="red"><%=compare.getCompareResult() %></font></td>		  
		  <%	  
		  }
		  %>
		  
		</tr>

<%
      }
%>			
			
	    </table>
     
<%	   
   }
%>
          </td>
          </tr>
          <tr>
              <td>&nbsp;</td>
          </tr>          
          <tr>
              <td>
<%
   if(action.equals("sync")){
	   if(syncFlag){
		   %>
<h4>The sync job is running in background.</h4>
		   <%		   
	   }else{
		   %>
<h4>No need to run sync job.</h4>
		   <%		   
	   }	   
   }
%>              
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

function toCompare(){
    document.forms["form_content"].action ="<%=rootDirectory%>/jsp/signature/signature_compare.jsp?myAction=compare";
    document.forms["form_content"].submit();
}

function toSync(){
    document.forms["form_content"].action ="<%=rootDirectory%>/jsp/signature/signature_compare.jsp?myAction=sync";
    document.forms["form_content"].submit();
}

</script>




