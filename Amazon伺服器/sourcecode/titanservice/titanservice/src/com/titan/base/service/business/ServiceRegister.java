package com.titan.base.service.business;

import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

import org.apache.log4j.Logger;

import com.titan.base.app.exception.LKReusedException;
import com.titan.base.app.log.RegisterLog;
import com.titan.base.product.bean.Model2ServiceBean;
import com.titan.base.product.bean.MyProductBean;
import com.titan.base.product.dao.Model2ServiceDAO;
import com.titan.base.product.dao.MyProductDAO;
import com.titan.base.service.bean.LicenseBean;
import com.titan.base.service.bean.MyServiceBean;
import com.titan.base.service.bean.SKUBean;
import com.titan.base.service.bean.ServiceBean;
import com.titan.base.service.dao.LicenseDAO;
import com.titan.base.service.dao.MyServiceDAO;
import com.titan.base.service.dao.SKUDAO;
import com.titan.base.service.dao.ServiceDAO;
import com.titan.base.system.bean.Sn_seqBean;
import com.titan.base.system.dao.Sequence_idDao;
import com.titan.base.system.dao.Sn_seqDAO;

import com.titan.base.jdbc.DAOHelper;

import com.titan.base.util.Keys;
import com.titan.base.util.LicenseUtil;
import com.titan.base.util.Util;

public class ServiceRegister {
    protected String errorKey = "";
	protected String mac;
	protected String lk;
    protected LicenseBean lkBean;
    protected LicenseBean trialLicenseKeyBean;
    protected MyProductBean myProductBean;
	protected MyServiceBean myServiceBean;
    protected Model2ServiceBean m2s;
    protected ArrayList<String> sqls = new ArrayList<String>();
    
    protected boolean needSendMail = true;
	
    protected Logger logger = Logger.getLogger(ServiceRegister.class);
    
	public ServiceRegister(){
	}
	
	public ServiceRegister(String mac, String lk){
		this.mac = mac;
        this.lk  = lk;
		this.lkBean = new LicenseBean(lk);
	}
	
	public boolean register() throws SQLException{
		boolean flag = true;
		RegisterLog rlog = new RegisterLog();
		flag = this.checkProductRegistered();
		
        logger.debug("check product registered, [mac]:"+this.mac+" [Result]:"+flag);
        
        if(!flag){
        	return flag;
        }
        
        try{
		    flag = this.checkLicenseKey();
        }catch(LKReusedException e){
        	needSendMail = false;
            return true;
        }
		logger.debug("check license key, [mac]:"+this.mac+" [Result]:"+flag);		
		if(!flag){
			return flag;
		}
        
        this.m2s = Model2ServiceDAO.getInstance().getByModelId_ServiceCode_ServiceType(this.myProductBean.getModel_id()
            		,this.lkBean.getService_code(), this.lkBean.getService_type_id());

        if(this.m2s==null){
            this.errorKey="ERR_PRODUCT_NOT_SUPPORT_SERVICE";
            return flag;
        }
        
        if (this.lkBean.getService_type_id().equalsIgnoreCase("T")) {
            // Check Trial Service has been registered
            flag = this.checkIsTrialAllowed();
            rlog.setTitle("activate trial, check trial allowed, "+flag);
            logger.debug(rlog.toString());  
            if(!flag){
                this.myServiceBean = MyServiceDAO.getInstance().getMyService(this.myProductBean.getMy_product_id(), this.m2s.getService_id());
     
                this.errorKey="ERR_ACTIVATE_TRIAL_NOT_ALLOWED";
                
                needSendMail = false;
                return flag;
            }
        }
        
        this.myServiceBean = MyServiceDAO.getInstance().getMyService(this.myProductBean.getMy_product_id(), this.m2s.getService_id());
        if (myServiceBean == null) {
            flag = this.activate();
        } else {
            
            /**
             * Can not upgrade service with trial license key
             */
            if (this.lkBean.getService_type_id().equalsIgnoreCase("T")) {
                flag = true;
                needSendMail = false;
                return flag;
            } else {
                flag = this.upgrade();
            }
        }


        
		return flag;
	}


    protected boolean activate() throws SQLException{
        boolean flag = true;
        ArrayList activateSqls = new ArrayList();

        activateSqls = this.getActivateSqls();
        logger.debug("Activate sqls" + activateSqls);
        
        if(activateSqls.size()>0){
            DAOHelper.getInstance().executeSQL(activateSqls);
        } else {
            flag = false;
            return flag;
        }
        
        return flag;
    }
    
    protected ArrayList getActivateSqls() throws SQLException{
    	return this.getActivateSqls(null);
    }
    
    protected final ArrayList getActivateSqls(ArrayList<String> sqls0) throws SQLException{
    	if(sqls0!=null){
    		this.sqls.addAll(sqls0);
    	}
		
		String sql = "";
		
		//2. insert into my_service
		this.myServiceBean = new MyServiceBean();
		
        int activeDuration     = 0;
		String begin_date      = "";
		String expiration_date = "";
		String value           = "0";
		int defaultnum         = 0; 
        String unlimited       = "";
        
        SKUBean skuBeanDate    = null;
        SKUBean skuBeanNumber  = null;

        Collection col = SKUDAO.getInstance().getSkuCollection(lkBean.getService_type_id(),lkBean.getService_code());
        for (Iterator it = col.iterator();it.hasNext();){
            HashMap hm = (HashMap)it.next();
            SKUBean tempSKUBean = new SKUBean(hm);
            if (tempSKUBean.getAttribute_type().equalsIgnoreCase("date")){
                skuBeanDate = tempSKUBean;
            }
        }
        
        if (skuBeanNumber != null) {
            value = skuBeanNumber.getValue();
        }
        
        if (skuBeanDate == null) {
            unlimited = "Unlimited";
            activeDuration = 50000;
        } else {      
            if (lkBean.getService_type_id().equalsIgnoreCase("T")) {
                activeDuration = Util.getInteger(skuBeanDate.getValue(),0);
            } else if(lkBean.getService_type_id().equalsIgnoreCase("S")){
                // activeDuration = trial_day + standard_day + extra_day
                ServiceBean service = ServiceDAO.getInstance().getServiceByModelId_ServiceCode(this.myProductBean.getModel_id(), lkBean.getService_code());
                
                //int trial_day = SKUDAO.getInstance().getDateValue("T", t2sBean.getTrial());
                int trial_day = 0;
                logger.debug("Trial day:" + trial_day);
                int extra_day = service.getTrial2std_extra();
                logger.debug("Extra day:" + extra_day);
                logger.debug("Standard day:" + skuBeanDate.getValue());
                
                activeDuration = Util.getInteger(skuBeanDate.getValue(),0) + trial_day + extra_day;

            }
            
        }
        
        Date currentDate = new Date();
        Calendar cal = new GregorianCalendar();
        SimpleDateFormat f1= new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        cal.setTime(currentDate);
        begin_date = f1.format(cal.getTime());
        cal.add(Calendar.DAY_OF_MONTH, activeDuration);
        SimpleDateFormat f2= new java.text.SimpleDateFormat("yyyy-MM-dd");
        expiration_date = f2.format(cal.getTime());
                		
		this.myServiceBean.setBegin_date(begin_date);
        this.myServiceBean.setExpiration_date(expiration_date);
        this.myServiceBean.setOriginal_date(expiration_date);
        this.myServiceBean.setMy_product_id(this.myProductBean.getMy_product_id());
        this.myServiceBean.setService_type_id(this.lkBean.getService_type_id());
        if (lkBean.getService_type_id().equalsIgnoreCase("S")) {
            this.myServiceBean.setService_type(MyServiceBean.STR_STANDARD_SERVICE);
        } else {
            this.myServiceBean.setService_type(MyServiceBean.STR_TRIAL_SERVICE);
        }
		this.myServiceBean.setService_code(this.lkBean.getService_code());
		this.myServiceBean.setMy_service_id(Util.getString(Sequence_idDao.getInstance().getSEQ(MyServiceBean.STR_MY_SERVICE_ID)));
		
		Model2ServiceBean m2sBean = Model2ServiceDAO.getInstance().getByModelId_ServiceCode_ServiceType(this.myProductBean.getModel_id(),
				lkBean.getService_code(), lkBean.getService_type_id());

		this.myServiceBean.setService_id(m2sBean.getService_id());
		this.myServiceBean.setStatus(MyServiceBean.STR_INSTALLED);
		this.myServiceBean.setSuspend_count("0");
		this.myServiceBean.setSuspend_date("");
        this.myServiceBean.setRemark(unlimited);
		this.myServiceBean.setValue(value);
		sql = MyServiceDAO.getInstance().getInsertSQL(this.myServiceBean);
		this.sqls.add(sql);
		
		//3. UPDATE license_key
        this.lkBean.setBegin_date(begin_date);
        this.lkBean.setCard_type("");
        this.lkBean.setMy_service_id(this.myServiceBean.getMy_service_id());
        this.lkBean.setLicense_key(this.lk);
        this.lkBean.setModel_id(this.myProductBean.getModel_id());
        this.lkBean.setService_id(this.myServiceBean.getService_id());
        this.lkBean.setStatus(MyServiceBean.STR_INSTALLED);
        
        if(this.lkBean.getService_type_id().equals("T")){
			Sn_seqBean sn;
			sn = Sn_seqDAO.getInstance().get4License();
			this.lkBean.setSn(sn.generateSN());
        	sql = LicenseDAO.getInstance().getInsertSQL(this.lkBean);
        }else{
    		sql = LicenseDAO.getInstance().getUpdateSQL(this.lkBean);	      	
        }
        this.sqls.add(sql);
		
		return this.sqls;		
	}
	
    
    protected boolean upgrade() throws SQLException{
        boolean flag = true;
        ArrayList upgradeSqls = new ArrayList();

        upgradeSqls = this.getUpgradeSqls();
        logger.debug("Upgrade sqls:" + upgradeSqls);
        
        if(upgradeSqls.size()>0){
            DAOHelper.getInstance().executeSQL(upgradeSqls);
        } else {
            flag = false;
            return flag;
        }
        return flag;
    }
    
	protected final ArrayList getUpgradeSqls() throws SQLException{
	
		String sql = "";
		
		//2. UPDATE my_service
		
        int activeDuration     = 0;
		String expiration_date = "";
		String original_date = "";
		String value           = "0";
        String unlimited       = "";
        
        SKUBean skuBeanDate    = null;
        SKUBean skuBeanNumber  = null;

        Collection col = SKUDAO.getInstance().getSkuCollection(lkBean.getService_type_id(),lkBean.getService_code());
        for (Iterator it = col.iterator();it.hasNext();){
            HashMap hm = (HashMap)it.next();
            SKUBean tempSKUBean = new SKUBean(hm);
            if (tempSKUBean.getAttribute_type().equalsIgnoreCase("date")){
                skuBeanDate = tempSKUBean;
            }
            if (tempSKUBean.getAttribute_type().equalsIgnoreCase("number")){
                skuBeanNumber = tempSKUBean;
            }
        }
        
        if (skuBeanNumber != null) {
            int originalValue = Util.getInteger(this.myServiceBean.getValue(),0);
            int increaseValue = Util.getInteger(skuBeanNumber.getValue(),0);
            value = String.valueOf(originalValue + increaseValue);
        }
        
        if(skuBeanDate == null){
            unlimited = "Unlimited";
            activeDuration = 50000;
        } else {
            unlimited = "";
            int extra_day = 0;
            
            // get extra days when upgrading trial service to standard service
            if (this.myServiceBean.getService_type_id().equalsIgnoreCase("T")
                    && this.lkBean.getService_type_id().equalsIgnoreCase("S")
                    && this.myServiceBean.getStatus().equalsIgnoreCase(Keys.STR_INSTALLED)) {

                ServiceBean service = ServiceDAO.getInstance().getByServiceId(this.myServiceBean.getService_id());
                extra_day = service.getTrial2std_extra();

            }
            
            activeDuration =  Util.getInteger(skuBeanDate.getValue(),0) + extra_day;
        }
        
        SimpleDateFormat f= new java.text.SimpleDateFormat("yyyy-MM-dd");
        Calendar cal = new GregorianCalendar();
        Calendar cal1 = new GregorianCalendar();
        try {
            Date oldExpiration;
            Date oldOriginalDate;
            if(myServiceBean.getStatus().equalsIgnoreCase(Keys.STR_EXPIRED)) {
                oldExpiration = new Date();
                oldOriginalDate = new Date();
            } else {
                oldExpiration = f.parse(myServiceBean.getExpiration_date());
                oldOriginalDate = f.parse(myServiceBean.getOriginal_date());
            }
            cal.setTime(oldExpiration);
            cal.add(Calendar.DAY_OF_MONTH, activeDuration);
            cal1.setTime(oldOriginalDate);
            cal1.add(Calendar.DAY_OF_MONTH, activeDuration);
        } catch (ParseException ex) {
            logger.warn("Parse exception",ex);
        }
        expiration_date = f.format(cal.getTime());
        original_date = f.format(cal1.getTime());
  
        String tempServiceTypeId = "T";
        if (this.myServiceBean.getStatus().equalsIgnoreCase(MyServiceBean.STR_EXPIRED)) {
            tempServiceTypeId = this.lkBean.getService_type_id();
        } else { // not expired
            if (this.myServiceBean.getService_type_id().equalsIgnoreCase("T") && this.lkBean.getService_type_id().equalsIgnoreCase("T")) {
                tempServiceTypeId = "T";
            } else {
                tempServiceTypeId = "S";
            }
        }
        String tempServiceType = MyServiceBean.STR_TRIAL_SERVICE;
        if (tempServiceTypeId.equalsIgnoreCase("S")) {
            tempServiceType = MyServiceBean.STR_STANDARD_SERVICE;
        }
        
		this.myServiceBean.setExpiration_date(expiration_date);
		this.myServiceBean.setOriginal_date(original_date);
		this.myServiceBean.setService_type_id(tempServiceTypeId);
		this.myServiceBean.setService_type(tempServiceType);
		this.myServiceBean.setService_code(this.lkBean.getService_code());
		this.myServiceBean.setStatus(MyServiceBean.STR_INSTALLED);
        this.myServiceBean.setRemark(unlimited);
		this.myServiceBean.setValue(value);
		sql = MyServiceDAO.getInstance().getUpdateSQL(this.myServiceBean);
        this.sqls.add(sql);
		
		//3. UPDATE license_key
		this.lkBean.setCard_type("");
		this.lkBean.setMy_service_id(this.myServiceBean.getMy_service_id());
		this.lkBean.setLicense_key(this.lk);
		this.lkBean.setModel_id(this.myProductBean.getModel_id());
		this.lkBean.setService_id(this.myServiceBean.getService_id());
		this.lkBean.setStatus(MyServiceBean.STR_INSTALLED);
		
		sql = LicenseDAO.getInstance().getUpdateSQL(this.lkBean);

        this.sqls.add(sql);
		return this.sqls;	
	}
	
    /**
     * Check wherther this trial service is allowed,
     * only allow if no trial/standard is activated
     * @return
     * @throws SQLException 
     */
    public boolean checkIsTrialAllowed() throws SQLException {  
        String serviceId = this.m2s.getService_id();
        String productId   = myProductBean.getMy_product_id();
        return LicenseDAO.getInstance().isTrialAllowed(productId, serviceId);
    }
    
	/**
	 * check whether product is registered
     * Initial myProductBean;lkBean
     * 
	 * @return
	 * @throws SQLException 
	 */
	public boolean checkProductRegistered() throws SQLException{
		boolean flag = true;

		this.myProductBean = MyProductDAO.getInstance().getProductByMac(this.mac);
		
		if(this.myProductBean==null){
			this.errorKey = "ERR_PRODUCT_UNREGISTERED";
			flag = false;
			return flag;
		}
		return flag;
	}
	
	public boolean checkLicenseKey() throws LKReusedException, SQLException{
		boolean flag = false;
		if(this.lk.startsWith("T")){
			flag = this.checkTrialLicenseKey();
		}else if(this.lk.startsWith("S")){
			flag = this.checkStandardLicenseKey();
		}
		return flag;
	}
	
	public boolean checkTrialLicenseKey() throws LKReusedException, SQLException{
		boolean flag = false;
		Collection col = MyServiceDAO.getInstance().getCheckTrialInfo(this.mac, this.lk);
		
		logger.debug("col==null?"+(col==null));
		
		HashMap<String,String> check_info = new HashMap<String,String>();
		if(col != null){
			HashMap hm = null;
			String key = "";
			String value = "";
			for(Iterator it = col.iterator();it.hasNext();){
				hm = (HashMap)it.next();
				key = Util.getString(hm.get("REG_CHECK"));
				value = Util.getString(hm.get("VALUE"));
				check_info.put(key, value);
			}
            
			flag = Util.getBoolean(check_info.get(MyServiceDAO.CHECK_PRODUCT_SUPPORT_SERVICE), false);
			if(!flag){
				this.errorKey = "ERR_PRODUCT_NOT_SUPPORT_SERVICE";
				flag = false;
				return flag;
			}
		}else{
        	this.errorKey = "ERR_INVALID_LICENSE_KEY";
			flag = false;
			return flag;
        }
		
		//ensure generate a license key which is not duplicate
		LicenseUtil lkUtil = new LicenseUtil();
		LicenseBean bean = null;
		boolean lkExist = true;
		String lk_temp = "";
		while (lkExist) {
			lk_temp = lkUtil.genLK(lkBean.getService_type_id()+"-"+lkBean.getService_code()); //create License Key

			bean = LicenseDAO.getInstance().getLicenseKey(lk_temp);
			if (bean==null){
				lkExist = false;
			}
		}
		
		this.lk = lk_temp;
		
		this.lkBean = new LicenseBean(this.lk);
		
		return flag;
	}
	
	/**
	 * check standard license key
	 * @return
	 * @throws SQLException 
	 */
	public boolean checkStandardLicenseKey() throws LKReusedException, SQLException{
		boolean flag = false;	
		Collection col = MyServiceDAO.getInstance().getCheckInfo(this.mac, this.lk);

		HashMap<String,String> check_info = new HashMap<String,String>();
		if(col != null){
			HashMap hm = null;
			String key = "";
			String value = "";
			for(Iterator it = col.iterator();it.hasNext();){
				hm = (HashMap)it.next();
				key = Util.getString(hm.get("REG_CHECK"));
				value = Util.getString(hm.get("VALUE"));
				check_info.put(key, value);
			}
            
			flag = Util.getBoolean(check_info.get(MyServiceDAO.CHECK_PRODUCT_SUPPORT_SERVICE), false);
			if(!flag){
				this.errorKey = "ERR_PRODUCT_NOT_SUPPORT_SERVICE";
				flag = false;
				return flag;
			}
			flag = Util.getBoolean(check_info.get(MyServiceDAO.CHECK_LK_EXIST), false);
			if(!flag){
				this.errorKey = "ERR_INVALID_LICENSE_KEY";
				flag = false;
				return flag;
			}
			flag = Util.getBoolean(check_info.get(MyServiceDAO.CHECK_LK_NEVER_USED), false);
			if(!flag){
				if(Util.getBoolean(check_info.get(MyServiceDAO.CHECK_LK_REUSED), false)){
					throw new LKReusedException("LKReused");
				}else{
					this.errorKey = "ERR_LICENSE_KEY_ALREADY_USED";
				    flag = false;
				    return flag;
				}
			}
			flag = Util.getBoolean(check_info.get(MyServiceDAO.CHECK_ICARD_TYPE_MATCH_PRODUCT), false);
			if(!flag){
				this.errorKey = "ERR_INCORRECT_ICARD_TYPE";
				flag = false;
				return flag;
			}
        }else{
        	this.errorKey = "ERR_INVALID_LICENSE_KEY";
			flag = false;
			return flag;
        }
        
		return flag;
	}

    public String getErrorKey() {
		return errorKey;
	}

	public void setErrorKey(String errorKey) {
		this.errorKey = errorKey;
	}

	public LicenseBean getLkBean() {
        return lkBean;
    }

    public void setLkBean(LicenseBean lkBean) {
        this.lkBean = lkBean;
    }

    public Model2ServiceBean getM2s() {
        return m2s;
    }

    public void setM2s(Model2ServiceBean m2s) {
        this.m2s = m2s;
    }

    public MyProductBean getMyProductBean() {
        return myProductBean;
    }

    public void setMyProductBean(MyProductBean myProductBean) {
        this.myProductBean = myProductBean;
    }

    public MyServiceBean getMyServiceBean() {
        return myServiceBean;
    }

    public void setMyServiceBean(MyServiceBean myServiceBean) {
        this.myServiceBean = myServiceBean;
    }

    public boolean isNeedSendMail() {
        return needSendMail;
    }

    public void setNeedSendMail(boolean needSendMail) {
        this.needSendMail = needSendMail;
    }

    public String getMac() {
        return mac;
    }

}
