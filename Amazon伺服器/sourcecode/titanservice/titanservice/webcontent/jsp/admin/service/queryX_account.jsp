<%@page import="com.titan.base.app.countrycode.dao.CountryCodeDAO"%>
<%@page import="com.titan.base.account.dao.AccountDAO"%>
<%@page import="com.titan.base.account.bean.AccountBean"%>
<%@page import="com.titan.base.util.Util"%>

<%
    String rootDirectory = (String)request.getContextPath();
    
    String username = Util.getString(request.getParameter("username"));
    
    AccountBean account = AccountDAO.getInstance().getAccountByUsername(username);

%>

<link href="<%=rootDirectory %>/css/titan.css" rel="stylesheet" type="text/css">

<html>
<head>
<title>Account Detail</title>
</head>
<body leftmargin="0" topmargin="0">

<table width="100%" border="0" cellpadding="0" cellspacing="0" bordercolor="#FFFFFF">
    <tr>
        <td width="20" height="27">&nbsp;</td>
        <td colspan="2" valign="top"><br>
            <span class="title1">Account Detail</span><br>
            <hr align="left" color="#333333" width="75%" size="1">
            <br>
        </td>
        <td width="1" rowspan="12"></td>
    </tr>
    <tr>
        <td width="20" height="10">&nbsp;</td>
        <td>&nbsp;</td>
        <td valign="top">
        
        <table width="90%" border="1" cellspacing="1" cellpadding="1">
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" width="30%" align="left">
             <span class="content3">User Name</span>
            </td>
            <td bgcolor="#F5F9FA" width="70%" align="left">
                 <%=account.getUsername() %>      
            </td>      	
          </tr>        
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
             <span class="content3">Password</span>
            </td>
            <td bgcolor="#F5F9FA" align="left">
                 <%=account.getPassword() %>      
            </td>      	
          </tr>        
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
             <span class="content3">First Name</span>
            </td>
            <td bgcolor="#F5F9FA" align="left">
                 <%=account.getFirst_name() %>      
            </td>      	
          </tr>
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
             <span class="content3">Last Name</span>
            </td>
            <td bgcolor="#F5F9FA" align="left">
                 <%=account.getLast_name() %>      
            </td>      	
          </tr>
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left" valign="top">
            <span class="content3">Email</span>        
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <%=account.getEmail() %>            
            </td>      	
          </tr>          
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
               <span class="content3">Company</span>
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <%=account.getCompany() %>           
            </td>      	
          </tr>          
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
                  <span class="content3">Address</span>         
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <%=account.getAddress() %>             
            </td>      	
          </tr> 
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
                  <span class="content3">City</span>        
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <%=account.getCity() %>          
            </td>      	
          </tr>
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
                  <span class="content3">State/Province</span>     
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <%=account.getState() %>               
            </td>      	
          </tr>          
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">
                   <span class="content3">Country</span>         
            </td>
            <td bgcolor="#F5F9FA" align="left">
                    <%=CountryCodeDAO.getInstance().getCountryNameByCode(account.getCountry_code())%>           
            </td>      	
          </tr>  
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left">   
                  <span class="content3">Zip Code</span>
                   
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <%=account.getPostal_code() %>
            </td>      	
          </tr>     
          <tr bgcolor="#F2F2F2">
            <td bgcolor="#F5F9FA" align="left"> 
                  <span class="content3">Phone Number</span>  
            </td>
            <td bgcolor="#F5F9FA" align="left">
                  <%=account.getPhone() %>            
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


