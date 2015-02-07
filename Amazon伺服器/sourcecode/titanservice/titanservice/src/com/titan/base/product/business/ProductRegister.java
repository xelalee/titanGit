package com.titan.base.product.business;

import java.sql.SQLException;
import java.util.List;
import java.util.ArrayList;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.account.dao.AccountDAO;
import com.titan.base.product.bean.MyProductBean;
import com.titan.base.product.bean.ProductBean;
import com.titan.base.product.dao.MyProductDAO;
import com.titan.base.product.dao.ProductDAO;
import com.titan.base.product.exception.MyProductInsertException;
import com.titan.base.jdbc.DAOHelper;


public class ProductRegister {
	
	protected String errorKey = null;
    protected AccountBean account = null;
    protected ProductBean product = null;
    protected MyProductBean myproduct = null;
	
	public ProductRegister(){
	}
    
	public boolean checkMac(String mac) throws SQLException{
		boolean flag = true;
		//check in product, no need to do this step, the mac is not predefined any more
		this.product = ProductDAO.getInstance().getProductByMAC(mac);
        if(this.product==null){
        	this.errorKey = "ERR_INVALID_MAC";
            flag = false;
            return flag;            
        }

		//check in my_product
		this.myproduct = MyProductDAO.getInstance().getProductByMac(mac);
        if(this.myproduct!=null){
        	this.errorKey = "ERR_PRODUCT_ALREADY_REGISTERED";
            flag = false;
            return flag;            
        }
		
		return flag;
	}
	
	public boolean checkUsernamePassword(String username, String password, boolean isOldUser) throws SQLException{
		boolean flag = true;

		this.account = AccountDAO.getInstance().getAccountByUsername(username);

		if(isOldUser){
			if(this.account==null){
				this.errorKey = "ERR_USERNAME_DOES_NOT_EXIST";
				flag = false;
				return flag;			
			}
			if(!this.account.getPassword().equals(password)){
				this.errorKey = "ERR_INVALID_PASSWORD";
				flag = false;
				return flag;				
			}
		}else{
			if(this.account!=null && !this.account.getPassword().equals(password)){
				this.errorKey = "ERR_USERNAME_DUPLICATE";
				flag = false;
				return flag;			
			}
			if("".equals(password)){
				this.errorKey = "ERR_INVALID_PASSWORD";
				flag = false;
				return flag;				
			}			
		}
		return flag;
	}
	
    // check the AC & ServiceCode
    public boolean checkACServiceCode(String ac, String serviceCode){
        boolean flag = true;
        
        this.errorKey = "ERR_PRODUCT_NOT_SUPPORT_SERVICE";
        flag = false;
        return flag;
    }
    
	public boolean registerProduct(MyProductBean myproduct){
		boolean flag = true;
		int effects = 0;
		try{
			effects = MyProductDAO.getInstance().insert(myproduct);
		}catch(MyProductInsertException ex){
		}
		if(effects!=1){
			this.errorKey = "ERR_DATABASE_OPERATION_ERROR";
			flag = false;
		}
		return flag;
	}
	
	public boolean registerAccount_Product(AccountBean account, MyProductBean myproduct) throws SQLException{
		boolean flag = true;
		List<String> sqls = new ArrayList<String>();
		sqls.add(AccountDAO.getInstance().getInsertSQL(account));
		sqls.add(MyProductDAO.getInstance().getInsertSQL(myproduct));
		DAOHelper.getInstance().executeSQL(sqls);
		return flag;
	}	
	
	public AccountBean getAccount() {
		return this.account;
	}

	public void setAccount(AccountBean account) {
		this.account = account;
	}	

	public MyProductBean getMyproduct() {
		return myproduct;
	}

	public void setMyproduct(MyProductBean myproduct) {
		this.myproduct = myproduct;
	}

	public ProductBean getProduct() {
		return product;
	}

	public void setProduct(ProductBean product) {
		this.product = product;
	}

	public String getErrorKey() {
		return errorKey;
	}

	public void setErrorKey(String errorKey) {
		this.errorKey = errorKey;
	}

}
