
<%@page import="com.titan.updserver.devicetype.dao.DeviceTypeDao"%>
<%@page import="com.titan.updserver.servicetype.dao.ServiceTypeDao"%>
<%@page import="com.titan.util.Util"%>
<%@page import="java.util.*"%>


<%String rootDirectory = (String)request.getContextPath();%>

<html>

<head>
	<link rel="stylesheet" href="<%=rootDirectory %>/jquery/css/jquery.ui.all.css">
	<script src="<%=rootDirectory %>/jquery/jquery-1.6.2.js"></script>
	<script src="<%=rootDirectory %>/jquery/ui/jquery.ui.core.js"></script>
	<script src="<%=rootDirectory %>/jquery/ui/jquery.ui.widget.js"></script>
	<script src="<%=rootDirectory %>/jquery/ui/jquery.ui.progressbar.js"></script>
    <script src="<%=rootDirectory %>/js/myProgressBar.js"></script>
</head>

<body bgcolor="#EEEEEE" leftmargin="0" topmargin="0" onLoad="MM_preloadImages('<%=rootDirectory %>/images/button/i_submit.jpg','<%=rootDirectory%>/images/button/i_cancel.jpg')">

<form name="form1" method="post" action="" ENCTYPE='multipart/form-data'>

<table width="100%" height="100%"  border="0" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" valign="top"><table width="95%"  border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td height="45" class="index">Signature Create /</td>
      </tr>
      <tr>
        <td height="30" class="title">Signature Create <br>
          <hr align="left" color="#333333" width="100%" size="1"></td>
      </tr>
      <tr>
        <td><p>Note:<br>
        Please locate the signature file first, then click submit.</p>
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
              <td>Service:</td>
              <td height="19">
              <select name="SERVICE">
                 <option value="">----------SELECT----------</option>
	               <%
	              ServiceTypeDao servicetype=new ServiceTypeDao();
 	              Collection col_service=servicetype.getServiceTypeInfo();
	              HashMap hm_service=new HashMap();        
	              String str_service="";
	              for(Iterator it=col_service.iterator();it.hasNext();){
	                hm_service=(HashMap)it.next();
	                str_service=Util.getString(hm_service.get("SERVICE"));
	              %>
	                 <option value="<%=str_service%>"><%=str_service%></option>
	              <%
	              }
	              %>                
              </select> 
              </td>
            </tr>
            <tr>
              <td>Version:</td>
              <td height="19"><input name="SIG_VER" type="text" size="50" maxlength="16" onkeyup="filterSigVerInput(event);">  
              </td>
            </tr>                                   
            <tr>
              <td>Fullset:</td>
              <td height="19">
              <select name="FULLSET">
                 <option value="">----------SELECT----------</option>
                 <option value="TRUE">TRUE</option>
                 <option value="FALSE">FALSE</option>
              </select> 
              </td>
            </tr> 
            <tr>
              <td>Signature:</td>
              <td height="19"><input name="SIGNATURE" type="file" size="50">
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
    var SERVICE=document.form1.SERVICE.value;
    var SIG_VER=document.form1.SIG_VER.value;
    var FULLSET=document.form1.FULLSET.value;
    var filename=trim(document.form1.SIGNATURE.value);
    var hint="";
    var subffix="";
    if(trim(DEVICE)==""||trim(SERVICE)==""||trim(SIG_VER)==""||trim(FULLSET)=="") 
        hint+="DEVICE/SERVICE/VERSION/FULLSET can't be empty!\r\n";   
        
    if(!isValidFileName(DEVICE)) hint+="Invalid char in Device Type!";
    if(!isValidFileName(SERVICE)) hint+="Invalid char in Service Type!";
    if(!isValidVersion(SIG_VER)) hint+="Invalid VERSION! A decimal number(###.###) is allowed.";

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
	
    if(hint!=""){
       alert(hint);
       return;
    }

    if(confirm("Are you sure to Submit?")){
	    document.form1.action = "<%= rootDirectory %>/mycontroller?action=SignatureAction&dispatch=newSignature"
	    +"&DEVICE="+DEVICE
	    +"&SERVICE="+SERVICE
	    +"&SIG_VER="+SIG_VER
	    +"&FULLSET="+FULLSET
	    +"&FILENAME="+subffix
	    +"&STATUS=1";
		document.form1.target = "";
		document.form1.submit();

	    //to show progress bar
	    showProgressBar();
	}

}

</script>