package com.titan.register.product.action;

import java.sql.SQLException;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;


import com.titan.base.account.bean.AccountBean;

import com.titan.base.product.bean.ModelBean;
import com.titan.base.product.bean.MyProductBean;
import com.titan.base.product.business.ProductRegister;
import com.titan.base.product.dao.ModelDAO;
import com.titan.base.system.dao.Sequence_idDao;

import com.titan.base.util.Util;
import com.titan.register.controller.ActionAbstract;
import com.titan.register.controller.ResponseBase;
import com.titan.register.product.ProductResponse;

public class ProductAction extends ActionAbstract{
    
    private String checkCountryCode(String countryCode){
    	String code = countryCode;
    	if(code.length()<3){
    		code = "000" + code;
    		code = code.substring(code.length()-3);
    	}
    	return code;
    }

	@Override
	public HashMap<String, String> parseRequest(HttpServletRequest request) {
		HashMap<String, String> map = new HashMap<String, String>();
		map.put("username", Util.getString(request.getParameter("username")));
		map.put("password", Util.getString(request.getParameter("password")));
		map.put("mac", Util.getString(request.getParameter("mac")).toUpperCase());
		map.put("countryCode", Util.getString(request.getParameter("countryCode")));
		map.put("email", Util.getString(request.getParameter("email")));
		map.put("firstName", Util.getString(request.getParameter("firstName")));
		map.put("lastName", Util.getString(request.getParameter("lastName")));
		map.put("company", Util.getString(request.getParameter("company")));
		map.put("address", Util.getString(request.getParameter("address")));
		map.put("city", Util.getString(request.getParameter("city")));
		map.put("zipCode", Util.getString(request.getParameter("zipCode")));
		map.put("state", Util.getString(request.getParameter("state")));
		
		return map;
	}

	@Override
	public ResponseBase handle(HashMap<String, String> requestMap) throws SQLException {
		
		ProductResponse resp = new ProductResponse();
		
		String username = requestMap.get("username");
		String password = requestMap.get("password"); 
		String mac = requestMap.get("mac"); 
		String countryCode = requestMap.get("countryCode"); 
		String email = requestMap.get("email"); 
		String firstName = requestMap.get("firstName");
		String lastName = requestMap.get("lastName"); 
		String company = requestMap.get("company");
		String address = requestMap.get("address"); 
		String city = requestMap.get("city");  
		String zipCode = requestMap.get("zipCode");
		String state = requestMap.get("state");
		
        boolean flag = false;
        ProductRegister pr = new ProductRegister();
        boolean isOldUser = false;
        if (countryCode.equals("") && email.equals("")) {
            isOldUser = true;
        } else if (!countryCode.equals("") && !email.equals("")) {
        	countryCode = checkCountryCode(countryCode);
            isOldUser = false;
        } else {
        	resp = new ProductResponse("ERR_INVALID_PARAMETER_EMAIL_OR_COUNTRY");
            return resp;
        }

        if (!pr.checkUsernamePassword(username, password, isOldUser)) {
            return new ProductResponse(pr.getErrorKey());
        } else {
            if (pr.getAccount() != null) {
                isOldUser = true;
            }
        }       
        
        if (!pr.checkMac(mac)) {
            if (pr.getErrorKey().equals("ERR_PRODUCT_ALREADY_REGISTERED")) { // product has been registered
                String account1 = Util.getString(pr.getMyproduct().getAccount_id());
                String account2 = "";
                if(pr.getAccount()!=null){
                	account2 = Util.getString(pr.getAccount().getAccount_id());
                }
            	if (account1.equals(account2)){                   
                    return resp;
                }
            }
            return new ProductResponse(pr.getErrorKey());
        }
        
        ModelBean modelBean = ModelDAO.getInstance().getModelByID(pr.getProduct().getModel_id());

        MyProductBean myproduct = new MyProductBean();
        myproduct.setMy_product_id(String.valueOf(Sequence_idDao.getInstance().getSEQ("MY_PRODUCT_ID")));
        myproduct.setModel(modelBean);
        myproduct.setModel_id(pr.getProduct().getModel_id());
        myproduct.setSn(pr.getProduct().getSn());
        myproduct.setMac(pr.getProduct().getMac());
        String friendly_name = modelBean.getModel_name() + "-" + mac;
        myproduct.setFriendly_name(friendly_name);
        myproduct.setCreate_by("Client");
        myproduct.setStatus("Initial");
        myproduct.setUpdate_by("Client");

        if (isOldUser) {
            myproduct.setAccount_id(pr.getAccount().getAccount_id());
            flag = pr.registerProduct(myproduct);
        } else {
            myproduct.setAccount_id(String.valueOf(Sequence_idDao.getInstance().getSEQ("ACCOUNT_ID")));

            AccountBean account = new AccountBean();
            account.setAccount_id(myproduct.getAccount_id());
            account.setUsername(username);
            account.setPassword(password);
            account.setEmail(email);
            account.setStatus(AccountBean.STR_ACTIVE_FLAG);
            account.setCountry_code(countryCode);
            account.setCreate_by("Client");
            account.setLogin_count("1");
            
            account.setFirst_name(firstName);
            account.setLast_name(lastName);
            account.setAddress(address);
            account.setCity(city);
            account.setCompany(company);
            account.setState(state);
            account.setPostal_code(zipCode);

            flag = pr.registerAccount_Product(account, myproduct);
        }

        if (flag == false) {          
            resp = new ProductResponse(pr.getErrorKey());
        }
        
        return resp;
	}
}
