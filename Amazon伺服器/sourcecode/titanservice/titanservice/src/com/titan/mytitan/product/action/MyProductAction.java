package com.titan.mytitan.product.action;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import org.apache.log4j.Logger;

import com.titan.base.product.bean.MyProductBean;
import com.titan.base.product.dao.MyProductDAO;
import com.titan.base.product.exception.MyProductRenameException;
import com.titan.base.util.Keys;
import com.titan.mytitan.app.util.NavigationResults;
import com.titan.mytitan.app.util.ViewUtil;
import com.titan.mytitan.login.bean.LoginBean;

public class MyProductAction {
static Logger logger = Logger.getLogger(MyProductAction.class);
	
	private final static int show_devices_on_welcome = 5;
	
	private MyProductBean myproductbean;

	public MyProductBean getMyproductbean() {
		return myproductbean;
	}

	public void setMyproductbean(MyProductBean myproductbean) {
		this.myproductbean = myproductbean;
	}
	
	public MyProductAction(){
		this.myproductbean = new MyProductBean();
	}
	
	public List getSomeProductBeans() {
		List list = getProductBeans();
		if(list!=null){
			if(list.size()>show_devices_on_welcome){
				list = list.subList(0,show_devices_on_welcome);
			}
		}
		return list;
	}

	public List getProductBeans() {
		List list = new ArrayList();
		LoginBean bean = (LoginBean)ViewUtil.getSession(Keys.USER_INFO);
		if(bean==null) return list;
		String account_id = bean.getAccountbean().getAccount_id();
		try{
		    Collection col = MyProductDAO.getInstance().getProductByAccount_id(account_id);
		    HashMap hm;
			MyProductBean mpbean;
			for(Iterator it=col.iterator();it.hasNext();){
				hm = (HashMap)it.next();
				mpbean = new MyProductBean(hm);
				list.add(mpbean);
			}
		}catch(SQLException ex){
			ex.printStackTrace();
		}
		return list;
	}
	
	public String renameProduct(MyProductBean bean){
		String rst = NavigationResults.SUCCESS;
		try{
			int effects = MyProductDAO.getInstance().rename(bean);
			if(effects < 1){
				rst = NavigationResults.FAILURE;
			}
		}catch(MyProductRenameException ex){
			rst = NavigationResults.FAILURE;
		}
		if(rst.equals(NavigationResults.FAILURE)){
			MyProductRenameException ex = new MyProductRenameException();
			ViewUtil.addErrorMessage(ex);
		}
		return rst;
	}

}
