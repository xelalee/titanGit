
package com.titan.mytitan.product.business;

import java.sql.SQLException;

import org.apache.log4j.Logger;

import com.titan.base.product.bean.MyProductBean;
import com.titan.base.product.bean.ProductBean;
import com.titan.base.product.dao.MyProductDAO;
import com.titan.base.product.dao.ProductDAO;
import com.titan.base.product.exception.InvalidAuthCodeOrSerialNumException;
import com.titan.base.product.exception.InvalidAuthenticationCodeException;
import com.titan.base.product.exception.ReinstallNotSameModelException;
import com.titan.base.product.exception.ReinstallToDeviceWithStandardServiceException;
import com.titan.base.product.exception.ReinstallToOtherAccountException;
import com.titan.base.product.exception.ReinstallToSameDeviceException;
import com.titan.base.service.dao.MyServiceDAO;

public class ProductReinstall {
	static Logger logger = Logger.getLogger(ProductReinstall.class);
	public ProductReinstall(){
		
	}
	
	public static void checkProduct(String new_ac,String new_sn,MyProductBean myproductbean) throws ReinstallToSameDeviceException,ReinstallNotSameModelException,
	                                                   InvalidAuthCodeOrSerialNumException,InvalidAuthenticationCodeException, SQLException{
        //product can't be reinstalled to itself
		if(new_ac.equalsIgnoreCase(myproductbean.getMac())){
			throw new ReinstallToSameDeviceException();
		}
		ProductBean newproduct = null; 
        //check whether new AC matches SN in product table
		if(!ProductDAO.getInstance().isNewACMatchSN(new_ac,new_sn)){
			throw new InvalidAuthCodeOrSerialNumException();
		}else{
			newproduct = ProductDAO.getInstance().getProductBySN(new_sn);
		}
		if(!newproduct.getModel_id().equals(myproductbean.getModel_id())){
			throw new ReinstallNotSameModelException();
		}
	}
	
	public static void checkNewProduct(MyProductBean newprod,MyProductBean currentprod) throws ReinstallToDeviceWithStandardServiceException,
	                                                    ReinstallToOtherAccountException,ReinstallNotSameModelException, SQLException{
        //check whether the new product has standard services
        boolean hasStandardService = MyServiceDAO.getInstance().hasStandardService(newprod.getSn());
        if(!hasStandardService){
            //whether whether the product registered in the same account AND is the same model
            if(!currentprod.getAccount_id().equals(newprod.getAccount_id())){
                throw new ReinstallToOtherAccountException();
            }else if(!currentprod.getModel_id().equals(newprod.getModel_id())){
                throw new ReinstallNotSameModelException();
            }
       }else{
           throw new ReinstallToDeviceWithStandardServiceException();	
       }
    }
	
}