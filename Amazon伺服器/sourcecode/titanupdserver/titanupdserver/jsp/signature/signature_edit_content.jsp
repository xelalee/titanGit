<%@page import="com.titan.updserver.signature.bean.SignatureBean"%>
<%@page import="com.titan.updserver.signature.dao.SignatureDao"%>
<%@page import="com.titan.updserver.common.ContentBase"%>
<%@page import="com.titan.updserver.devicetype.dao.DeviceTypeDao"%>
<%@page import="com.titan.updserver.servicetype.dao.ServiceTypeDao"%>
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
   if(MASTER_SLAVE.equalsIgnoreCase("MASTER")) TITLE="Signature Edit";
   else TITLE="Signature Info";
   String SIGNATURE_ID=Util.getString(request.getParameter("SIGNATURE_ID"));
   SignatureBean sjb=SignatureDao.getInstance().getSignatureByID(SIGNATURE_ID);
   String FILE_ON_SERVER_PATH = ContentBase.getInstance().getSignaturePath(sjb);
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
        To change the Signature file, please locate a new one first.
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
	                if(str_device.equalsIgnoreCase(sjb.getDevice())) selected1="selected";
	              %>
	                 <option value="<%=str_device%>" <%=selected1%>><%=str_device%></option>
	              <%
	              }
	              %>                                 
              </select> 
              </td>
            </tr> 
            <tr>
              <td>Service:</td>
              <td height="19">
              <select name="SERVICE" disabled>
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
	                if(str_service.equalsIgnoreCase(sjb.getService())) selected2="selected";
	              %>
	                 <option value="<%=str_service%>" <%=selected2%>><%=str_service%></option>
	              <%
	              }
	              %>                  
              </select> 
              </td>
            </tr>
            <tr>
              <td>Version:</td>
              <td height="19"><input name="SIG_VER" value="<%=sjb.getSig_ver()%>" type="text" size="50" maxlength="16" disabled>  
              </td>
            </tr>                                   
            <tr>
              <td>Fullset:</td>
              <td height="19">
              <select name="FULLSET" disabled>
                 <option value="">----------SELECT----------</option>
                 <option value="TRUE" <%=sjb.getFullset().equalsIgnoreCase("TRUE")?"selected":""%>>TRUE</option>
                 <option value="FALSE" <%=sjb.getFullset().equalsIgnoreCase("FALSE")?"selected":""%>>FALSE</option>
              </select> 
              </td>
            </tr> 
            <tr>
              <td>Signature:</td>
              <%if(MASTER_SLAVE.equalsIgnoreCase("MASTER")){%>
              <td height="19"><input name="SIGNATURE" type="file" size="50">  
                              <br>file on server: <%=FILE_ON_SERVER_PATH%>
              </td>
              <%}else {%>
              <td height="19"><input name="SIGNATURE" type="text" size="50" value="<%=FILE_ON_SERVER_PATH%>">  
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
         <input class="button" type="button" value="Delete" name="Delete" onClick="javascript:toDelete('<%=SIGNATURE_ID%>');">
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

function toSubmit(){
    var DEVICE=document.form1.DEVICE.value;
    var SERVICE=document.form1.SERVICE.value;
    var SIG_VER=document.form1.SIG_VER.value;
    var FULLSET=document.form1.FULLSET.value;
    var filename=trim(document.form1.SIGNATURE.value);
    var hint="";
    var subffix="";
    if(trim(DEVICE)==""||trim(SERVICE)==""||trim(SIG_VER)==""||trim(FULLSET)=="") 
        hint+="DEVICE/SERVICE/VERSION/FULLSET can't be empty!\r\n";
        
    if(!isValidFileName(DEVICE)) hint+="Invalid char in Device Type!";
    if(!isValidFileName(SERVICE)) hint+="Invalid char in SERVICE Type!";
    if(!isValidVersion(SIG_VER)) hint+="Invalid VERSION! A decimal number(###.###) is allowed.";
            
    if(filename.length>0){
	    if(filename.length<5) hint+="Please locate a correct signature file!\r\n";
	    else{  
		    if(filename.length!=document.form1.SIGNATURE.value.length)
	            hint+="Please remove misinput spaces!\r\n";
	        else{
			    subffix=getSubffix(filename);//subffix
			    if(FULLSET=="TRUE"){
				    if(subffix.toUpperCase()!="SIG"){
				    	alert("Full signature needs extension .sig!");
				    	return;
				    }
			    }else{
				    if(subffix.toUpperCase()!="INC"){
				    	alert("Incremental signature needs extension .inc!");
				    	return;
				    }
			    }	        
	        } 
	    }
    }  
    
    if(hint!=""){
       alert(hint);
       return;
    }
   
    if(confirm("Are you sure to Submit?")){
	    document.form1.action = "<%= rootDirectory %>/mycontroller?action=SignatureAction&dispatch=editSignature"
	    +"&SIGNATURE_ID=<%=SIGNATURE_ID%>"
	    +"&DEVICE="+DEVICE
	    +"&SERVICE="+SERVICE
	    +"&SIG_VER="+SIG_VER
	    +"&FULLSET="+FULLSET
	    +"&STATUS=1";
		document.form1.target = "";
		document.form1.submit();

	    //to show progress bar
	    showProgressBar();
	}
}

function toDelete(SIGNATURE_ID){
    if(confirm("Are you sure to Delete?")){
	    document.forms["form1"].action = "<%= rootDirectory %>/mycontroller?action=SignatureAction&dispatch=deleteSignature"
	    +"&SIGNATURE_ID=<%=SIGNATURE_ID%>";
		document.forms["form1"].target = "";
		document.forms["form1"].submit();
	}
}

</script>