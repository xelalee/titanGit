package com.titan.mytitan.product.business;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.titan.base.account.bean.AccountBean;
import com.titan.base.product.bean.MyProductBean;
import com.titan.base.product.dao.MyProductDAO;
import com.titan.base.product.exception.TransferToSelfException;
import com.titan.base.product.exception.UsernameEmailNotMatchException;
import com.titan.mytitan.login.exception.UserInactivatedException;
import com.titan.base.jdbc.DAOHelper;



public class ProductTransfer {
	public ProductTransfer(){
		
	}
	
	public static void checkNewUser(AccountBean newuser,String email,MyProductBean myProductBean) throws UsernameEmailNotMatchException,
	                                                              UserInactivatedException,TransferToSelfException{
		if(!email.equalsIgnoreCase(newuser.getEmail())){
			throw new UsernameEmailNotMatchException();
		}
		//not allow transfer to an inactivate user
		if(!newuser.getStatus().equalsIgnoreCase(AccountBean.STR_ACTIVE_FLAG)){
			throw new UserInactivatedException();				
		}			
		//not allow transfer to self
		if(newuser.getAccount_id().equals(myProductBean.getAccount_id())){
			throw new TransferToSelfException();				
		}
	}
	
	public static void transfer(AccountBean newuser,AccountBean currentUser,MyProductBean myProductBean) throws SQLException{
		List<String> sqls = new ArrayList<String>();
		sqls.add(MyProductDAO.getInstance().getTransferSQL(myProductBean.getAccount_id(),newuser.getAccount_id(),myProductBean.getMy_product_id()));
		DAOHelper.getInstance().executeSQL(sqls);

	}
}