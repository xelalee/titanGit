package com.titan.updserver.signature;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;

import com.titan.updserver.signature.bean.SignatureBean;

public class CompareServer{
	
	static Logger logger = Logger.getLogger(CompareServer.class);
	
	public final static String ONLY_EXISTS_ON_REMOTE = "Only exists on remote"; 
	
	public CompareServer(){
		
	}
	

	
	private boolean signatureMatches(SignatureBean bean1, SignatureBean bean2){
		if(bean1 == null && bean2 == null){
			return true;
		}else if(bean1 == null || bean2 == null){
			return false;
		}
		return bean1.getSignature_id().equals(bean2.getSignature_id())
			&& bean1.getDevice().equals(bean2.getDevice())
			&& bean1.getService().equals(bean2.getService())
			&& bean1.getSig_ver().equals(bean2.getSig_ver());
	}
	
	
	
}