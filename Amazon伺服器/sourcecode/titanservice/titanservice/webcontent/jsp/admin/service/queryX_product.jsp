
<%@page import="com.titan.base.product.dao.MyProductDAO"%>
<%@page import="com.titan.base.product.bean.MyProductBean"%>

<%@page import="com.titan.base.product.dao.ProductDAO"%>
<%@page import="com.titan.base.product.bean.ProductBean"%>

<%@page import="com.titan.base.product.dao.ModelDAO"%>
<%@page import="com.titan.base.product.bean.ModelBean"%>

<%@page import="com.titan.base.util.Util"%>

<%
    String rootDirectory = (String)request.getContextPath();
    
    String mac = Util.getString(request.getParameter("mac"));
    
    String sn = "";
    String model = "";
    String status = "";
    
    MyProductBean myproduct = MyProductDAO.getInstance().getProductByMac(mac);
    
    if(myproduct!=null){
    	sn = myproduct.getSn();
    	model = myproduct.getModel().getModel_name();
    	status = "Registered";
    }else{
    	ProductBean product = ProductDAO.getInstance().getProductByMAC(mac);
    	if(product!=null){
        	sn = product.getSn();
        	ModelBean modelBean = ModelDAO.getInstance().getModelByID(product.getModel_id());
        	model = modelBean.getModel_name();
        	status = "Unregistered";
    	}
    }

%>

<link href="<%=rootDirectory %>/css/titan.css" rel="stylesheet" type="text/css">

<html>
<head>
<title>Product Detail</title>
</head>
<body leftmargin="0" topmargin="0">

<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr>
        <td width="20" height="27">&nbsp;</td>
        <td colspan="2" valign="top"><br>
            <span class="title1">Product Detail</span><br>
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
             <span class="content3">SN</span>
            </td>
            <td bgcolor="#F5F9FA" width="70%" align="left">
                 <%=sn %>      
            </td>      	
          </tr>        
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
             <span class="content3">MAC</span>
            </td>
            <td bgcolor="#F5F9FA" align="left">
                 <%=mac %>      
            </td>      	
          </tr>        
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
             <span class="content3">Model</span>
            </td>
            <td bgcolor="#F5F9FA" align="left">
                 <%=model %>      
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
        </table>     
        </td>
      </tr>
      <tr>
        <td width="20" height="10">&nbsp;</td>
        <td>&nbsp;</td>
        <td valign="top"></td>
      </tr>
</table>
</body>
</html>


