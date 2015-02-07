package com.titan.updserver.signature.dao;

import java.io.File;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;

import com.titan.jdbc.DAOHelper;
import com.titan.updserver.common.ContentBase;
import com.titan.updserver.common.exception.RegisterException;
import com.titan.updserver.common.logformat.CommonLogFormatter;
import com.titan.updserver.signature.bean.SignatureBean;
import com.titan.util.Keys;
import com.titan.util.Util;

public class SignatureDao {
	
	static Logger logger = Logger.getLogger(SignatureDao.class);
	
	private static SignatureDao instance = new SignatureDao();
	
	public static SignatureDao getInstance(){
		return instance;
	}
	
	public int insert(SignatureBean bean, boolean checkDuplicateFirst) throws SQLException, RegisterException{
		if(checkDuplicateFirst && versionExists(bean)){
			throw new RegisterException("Version already exists.");
		}
		StringBuffer sql=new StringBuffer();
		sql.append(" insert into SIGNATURE(DEVICE,SERVICE,ENGINE_VER,SIG_VER,FULLSET,UPDATE_BY,UPDATE_DATE,CHECKSUM,FILESIZE,STATUS)");
		sql.append(" values('"+bean.getDevice()
				+"','"+bean.getService()
				+"',"+bean.getEngine_ver()
				+","+bean.getSig_ver()
				+",'"+bean.getFullset()
				+"','"+bean.getUpdate_by()
				+"',now()"
				+",'"+bean.getChecksum()
				+"','"+bean.getFilesize()
				+"','"+bean.getStatus()+"'");
		sql.append(")");

		return DAOHelper.executeSQL(sql.toString());
	}
	
	public int insert(SignatureBean bean) throws SQLException, RegisterException{
		return this.insert(bean, true);
	}
	
	public int update(SignatureBean bean) throws SQLException{		
		StringBuffer sql=new StringBuffer();
		sql.append(" update SIGNATURE");
		sql.append(" set DEVICE='"+bean.getDevice()+"',SERVICE='"+bean.getService());
		sql.append("',ENGINE_VER="+bean.getEngine_ver()+",SIG_VER="+bean.getSig_ver());
		sql.append(",FULLSET='"+bean.getFullset()+"',UPDATE_BY='"+bean.getUpdate_by()+"',UPDATE_DATE=now()");
		sql.append(",CHECKSUM='"+bean.getChecksum());
		sql.append("',FILESIZE='"+bean.getFilesize());
		sql.append("',STATUS='"+bean.getStatus()+"'");
		sql.append(" where SIGNATURE_ID="+bean.getSignature_id());
		
		return DAOHelper.executeSQL(sql.toString());
	}
	
	/**
	 * update by unique keys: device, service, sig_ver
	 * @param bean
	 * @return
	 * @throws Exception
	 */
	public int updateByUniqueKeys(SignatureBean bean) throws SQLException{
		
		StringBuffer sql=new StringBuffer();
		sql.append(" update SIGNATURE");
		sql.append(" set DEVICE='"+bean.getDevice()+"',SERVICE='"+bean.getService());
		sql.append("',ENGINE_VER="+bean.getEngine_ver()+",SIG_VER="+bean.getSig_ver());
		sql.append(",FULLSET='"+bean.getFullset()+"',UPDATE_BY='"+bean.getUpdate_by()+"',UPDATE_DATE=now()");
		sql.append(",CHECKSUM='"+bean.getChecksum());
		sql.append("',FILESIZE='"+bean.getFilesize());
		sql.append("',STATUS='"+bean.getStatus()+"'");
		sql.append(" where DEVICE='"+bean.getDevice()+"'");
		sql.append(" and SERVICE='"+bean.getService()+"'");
		sql.append(" and SIG_VER="+bean.getSig_ver());

		return DAOHelper.executeSQL(sql.toString());
	}
	
	public int addOrUpdateByUniqueKeys(SignatureBean bean) throws Exception{
		int effects= 0;
		try{
			effects = insert(bean, false);
		}catch(Exception ex){
			logger.error("add signature error");
		}
		if(effects == 1){
		    CommonLogFormatter lf = new CommonLogFormatter();
			lf.setTitle("Add file successfully. Signature,"+bean.toString()+".");
			logger.info(lf.getFormattedLog());					
		}else{
			effects = updateByUniqueKeys(bean);
			if(effects!=1){
				effects=-1;
				CommonLogFormatter lf = new CommonLogFormatter();
				lf.setTitle("Add file fail. Signature,"+bean.toString()+".");
				lf.setError_Message("");
				logger.error(lf.getFormattedLog());
			}
		}
		
		return effects;
	}
	
	public int delete(SignatureBean bean) throws SQLException{
		StringBuffer sql=new StringBuffer();
		sql.append(" delete from SIGNATURE where SIGNATURE_ID="+bean.getSignature_id());
		return DAOHelper.executeSQL(sql.toString());
	}
	
	private boolean versionExists(SignatureBean sjb) throws SQLException{
        StringBuffer sql=new StringBuffer(0);
        sql.append(" select count(*) NUM from SIGNATURE");
        sql.append(" where upper(DEVICE)=upper('"+sjb.getDevice()+"')");
        sql.append(" and upper(SERVICE)=upper('"+sjb.getService()+"')");
        sql.append(" and SIG_VER="+sjb.getSig_ver());
        if(!sjb.getSignature_id().equals("")){
        	sql.append(" and SIGNATURE_ID!="+sjb.getSignature_id());
        }  
        Collection col = DAOHelper.query(sql.toString());
        HashMap hm=new HashMap();
        for(Iterator it=col.iterator();it.hasNext();){
        	hm=(HashMap)it.next();
        	int NUM=Integer.parseInt(Util.getString(hm.get("NUM")));
        	if(NUM>0) return true;
        }
        return false;
	}
	
	/**
	 * get the signatures higher versions
	 * @param device
	 * @param service
	 * @param currentSigVer
	 * @return
	 */
	public List<SignatureBean> getUpdateVersions(String device,String service,String currentSigVer){
		List<SignatureBean> list = new ArrayList<SignatureBean>();
		
		StringBuffer buffer = new StringBuffer();
		buffer.append(" select * from SIGNATURE");
		buffer.append(" where DEVICE='"+device+"'");
		buffer.append(" and SERVICE='"+service+"'");
		buffer.append(" and SIG_VER>"+currentSigVer);
		buffer.append(" order by SIG_VER");
		
		Collection<HashMap<String, Object>> col = DAOHelper.queryQuietly(buffer.toString());
		
		SignatureBean fullSig = null;
		SignatureBean incrSig = null;
		SignatureBean tempSig = null;
		for(HashMap<String, Object> hm: col){
			tempSig = new SignatureBean(hm);
			if(tempSig.isFullSet()){
				fullSig = tempSig;
			}else{
				incrSig = tempSig;
			}
		}
		
		if(fullSig!=null && incrSig!=null){
			list.add(fullSig);
			if(Float.valueOf(incrSig.getSig_ver())>Float.valueOf(fullSig.getSig_ver())){
				list.add(incrSig);
			}
		}else {
			if(fullSig!=null){
				list.add(fullSig);
			}
			if(incrSig!=null){
				list.add(incrSig);
			}
		}
		return list;
	}

	/**
	 * get signature (with file size) list
	 * @param device
	 * @param service
	 * @param isDesc
	 * @return
	 * @throws Exception
	 */
	private List<SignatureBean> getSignatureWithFileSize(String device, String service, boolean isDesc) throws Exception{
		List<SignatureBean> rst = new ArrayList<SignatureBean>();
		List<SignatureBean> temp = this.getSignature(device, service, isDesc);
		String value="";
		ContentBase cb = ContentBase.getInstance();
		for(Iterator<SignatureBean> it=temp.iterator();it.hasNext();){
			SignatureBean bean = it.next();
			value=String.valueOf(cb.getFileSize(cb.getSignaturePath(bean)));
			bean.setFilesize(value);
			rst.add(bean);
		}
		return rst;
	}
	
	/**
	 * get all signature
	 * @return
	 */
	public List<SignatureBean> getSignatureWithFileSize(boolean isDesc) throws Exception{
		return getSignatureWithFileSize("", "",isDesc);
	}		
	
	/**
	 * get signature by device and service,in desc order
	 * @param device
	 * @param service
	 * @param isDesc is order SIGNATURE_ID as desc
	 * @return
	 */
	public List<SignatureBean> getSignature(String device0, String service0, boolean isDesc){
		List<SignatureBean> rst = new ArrayList<SignatureBean>();
		
		String device = device0.trim().toUpperCase(Keys.DEFAULT_LOCALE);
		String service = service0.trim().toUpperCase(Keys.DEFAULT_LOCALE);
		StringBuffer sql=new StringBuffer();
		sql.append(" select * from SIGNATURE");
		sql.append(" where 1=1");
		if(device!=null && !device.trim().equals("")){
			sql.append(" and DEVICE='"+device+"'");
		}
		if(service!=null && !service.trim().equals("")){
			sql.append(" and SERVICE='"+service+"'");
		}
		sql.append(" order by SIGNATURE_ID ");
		
		if(isDesc){
			sql.append("desc");
		}

		Collection<HashMap<String, Object>> col = DAOHelper.queryQuietly(sql.toString());
		for(HashMap<String, Object> hm: col){
			SignatureBean bean = new SignatureBean(hm);
			rst.add(bean);
		}
		return rst;
	}
	
	/**
	 * get signature by device,service,version
	 * @param device
	 * @param service
	 * @param sig_ver
	 * @return
	 */
	public SignatureBean getSignatureBean(String device,String service,String sig_ver){

		Collection<HashMap<String, Object>> col =  DAOHelper.queryQuietly("select * from SIGNATURE where upper(DEVICE)=upper('"
				+device+"') and upper(SERVICE)=upper('"+service+"') and SIG_VER="+sig_ver
				+" order by SIG_VER asc");
		SignatureBean bean = null;
		
		for(HashMap<String, Object> hm: col){
			bean = new SignatureBean(hm);
		}
		
		return bean;
	}
	
	public float getLatestSignatureVersion(String device0,String service0){
		String device=device0.trim().toUpperCase(Keys.DEFAULT_LOCALE);
		String service=service0.trim().toUpperCase(Keys.DEFAULT_LOCALE);
		
		StringBuffer buffer = new StringBuffer();
		buffer.append(" select max(SIG_VER) MAX_SIG_VER from SIGNATURE");
		buffer.append(" where upper(DEVICE)=upper('"+device+"')");
		buffer.append(" and upper(SERVICE)=upper('"+service+"')");
		
		Collection col = DAOHelper.queryQuietly(buffer.toString());
		HashMap hm = (HashMap)col.iterator().next();
		
		return Util.getFloat(hm.get("MAX_SIG_VER"));
	}
	
	/**
	 * get signature release date
	 * @param device0
	 * @param service0
	 * @param sig_ver0
	 * @return
	 */
	public String getSignatureVersionDate(String device0,String service0,String sig_ver0){
		String device=device0.trim().toUpperCase(Keys.DEFAULT_LOCALE);
		String service=service0.trim().toUpperCase(Keys.DEFAULT_LOCALE);
		String sig_ver=sig_ver0.trim().toUpperCase(Keys.DEFAULT_LOCALE);
		Collection col=DAOHelper.queryQuietly("select * from SIGNATURE where upper(DEVICE)=upper('"
				+device+"') and upper(SERVICE)=upper('"+service+"') and SIG_VER="+sig_ver);	
		String rst="unknow";
		HashMap hm=new HashMap();
		for(Iterator it=col.iterator();it.hasNext();){
			hm=(HashMap)it.next();
			rst=Util.getString(hm.get("UPDATE_DATE"));
		}	
		return rst;
	}
	
	/**
	 * get signature by id
	 * @param id
	 * @return
	 */
	public SignatureBean getSignatureByID(String id){ 
		Collection col=DAOHelper.queryQuietly("select * from SIGNATURE where SIGNATURE_ID="+id);	
		SignatureBean sjb=new SignatureBean();
		HashMap hm=new HashMap();
		for(Iterator it=col.iterator();it.hasNext();){
			hm=(HashMap)it.next();
			sjb=new SignatureBean(hm);
		}
		return sjb;
	}
	
	
	/**
	 * set signature status to Inactive
	 * @param signature_id
	 * @return
	 */
	public boolean inactiveSignature(String signature_id){
		String sql="update SIGNATURE set status='"+Keys.STATUS_INACTIVE+"' where SIGNATURE_ID='"+signature_id+"'";

		int effects=0;
		try{
			effects=DAOHelper.executeSQL(sql);
		}catch(Exception ex){}
		if(effects > 0){
			return true;
		}
		else{
			return false;
		}
	}
	
	/**
	 * set signature status to active
	 * @param signature_id
	 * @return
	 */
	public boolean activeSignature(String signature_id){
		String sql="update SIGNATURE set status='"+Keys.STATUS_ACTIVE+"' where SIGNATURE_ID='"+signature_id+"'";

		int effects=0;
		try{
			effects=DAOHelper.executeSQL(sql);
		}catch(Exception ex){}
		if(effects > 0){
			return true;
		}
		else{
			return false;		
		}
	}
	
	/**
	 * validate the signature is allowed to be deleted
	 * @param sjb
	 * @return
	 */
	public boolean allowDelete(SignatureBean sjb){
		if(sjb.getFullset().equalsIgnoreCase("FALSE")){
			return true;
		}
		StringBuffer buffer=null;
		Collection col=null;
		HashMap hm=null;
		//get next fullset signature version
		buffer=new StringBuffer();
		buffer.append(" select min(SIG_VER) sig_ver from SIGNATURE");
		buffer.append(" where DEVICE='"+sjb.getDevice()+"'");
		buffer.append(" and SERVICE='"+sjb.getService()+"'");
		buffer.append(" and upper(FULLSET)='"+sjb.getFullset().toUpperCase(Keys.DEFAULT_LOCALE)+"'");
		buffer.append(" and SIG_VER>"+sjb.getSig_ver());
		System.out.println(buffer.toString());
		col=DAOHelper.queryQuietly(buffer.toString());
		String sig_ver1="";
		for(Iterator it=col.iterator();it.hasNext();){
			hm=(HashMap)it.next();
			sig_ver1=Util.getString(hm.get("SIG_VER"));
		}
		if(sig_ver1.equals("")){
			sig_ver1="999999.99999";
		}
		//get signature base on sjb
		buffer=new StringBuffer();
		buffer.append(" select count(*) NUM1 from SIGNATURE");
		buffer.append(" where DEVICE='"+sjb.getDevice()+"'");
		buffer.append(" and SERVICE='"+sjb.getService()+"'");
		buffer.append(" and SIG_VER>"+sjb.getSig_ver());
		buffer.append(" and SIG_VER<"+sig_ver1);

		col=DAOHelper.queryQuietly(buffer.toString());

		int NUM=0;
		for(Iterator it=col.iterator();it.hasNext();){
			hm=(HashMap)it.next();
			NUM=Integer.parseInt(Util.getString(hm.get("NUM1")));
		}	

		if(NUM>0){
			return false;
		}
		else{
			return true;
		}
	}
	
	/**
	 * arrange signatures, include 
	 * 1.old file(reserve 5 full version) move to backup dir
	 */
	public void arrangeSignatures(){
		StringBuffer buffer=new StringBuffer();
		buffer.append(" select * from SIGNATURE"); 
		buffer.append(" order by DEVICE,SERVICE,SIG_VER desc");
		SignatureBean sjb=null;
		HashMap hm=null;
		String device="",service="";
		int full_version_number=0;
		Collection col=DAOHelper.queryQuietly(buffer.toString());
		for(Iterator it=col.iterator();it.hasNext();){
		    hm=(HashMap)it.next();
		    sjb=new SignatureBean(hm);
		    if(!device.equalsIgnoreCase(sjb.getDevice()) 
		    || !service.equalsIgnoreCase(sjb.getService())){
		        full_version_number=0;
			    if(!device.equalsIgnoreCase(sjb.getDevice())){
			        device = sjb.getDevice();
			    }
			    if(!service.equalsIgnoreCase(sjb.getService())){
			        service = sjb.getService();
			    }
		    }else{
		        if(full_version_number>=5){
		            //backup
		            removeSig(sjb);
		        }		        
		    } 
		    if(sjb.getFullset().equalsIgnoreCase("TRUE")) full_version_number++;
		}
	}
	
	public boolean removeSig(SignatureBean sjb){
		boolean flag = false;
	    String current_dir=ContentBase.getInstance().getSignaturePath(sjb);
	    flag = FileUtils.deleteQuietly(new File(current_dir));
	    if(flag){
	    	try {
				this.delete(sjb);
			} catch (SQLException e) {
				logger.error("", e);
			}
	    }
	    logger.info("delete old signature, "+sjb.toString());
	    return flag;
	}	
	
}
