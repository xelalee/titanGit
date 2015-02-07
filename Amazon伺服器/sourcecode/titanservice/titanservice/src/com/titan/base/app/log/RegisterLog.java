package com.titan.base.app.log;

public class RegisterLog extends CommonLog {
	private String action;
	private String username;
	private String mac;
	private String lk;
	private boolean cfUniqueKeyFlow = false;
	private String fw;
	private String sig;
	private String sku;
	public String getAction() {
		return action;
	}
	public void setAction(String action) {
		this.action = action;
	}

	public String getFw() {
		return fw;
	}
	public void setFw(String fw) {
		this.fw = fw;
	}
	public String getSig() {
		return sig;
	}
	public void setSig(String sig) {
		this.sig = sig;
	}
	public boolean isCfUniqueKeyFlow() {
		return cfUniqueKeyFlow;
	}
	public void setCfUniqueKeyFlow(boolean cfUniqueKeyFlow) {
		this.cfUniqueKeyFlow = cfUniqueKeyFlow;
	}

	public String getLk() {
		return lk;
	}
	public void setLk(String lk) {
		this.lk = lk;
	}
	public String getMac() {
		return mac;
	}
	public void setMac(String mac) {
		this.mac = mac;
	}
	public String getSku() {
		return sku;
	}
	public void setSku(String sku) {
		this.sku = sku;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	
	public String toString(){
		StringBuffer buffer = new StringBuffer();
		if(this.getTitle()!=null){
			buffer.append(this.getTitle());
		}
		if(this.getSourceIp()!=null){
			buffer.append(" [Source IP]: ").append(this.getSourceIp());
		}		
		if(this.action!=null){
			buffer.append(" [Action]: ").append(this.action);
		}
		if(this.username!=null){
			buffer.append(" [Username]: ").append(this.username);
		}
		if(this.mac!=null){
			buffer.append(" [Mac]: ").append(this.mac);
		}
		if(this.lk!=null){
			buffer.append(" [LK]: ").append(this.lk);
		}
		if(this.cfUniqueKeyFlow){
			buffer.append(" [CF Unique Key Flow]: ").append(this.cfUniqueKeyFlow);
		}
		if(this.fw!=null){
			buffer.append(" [FW]: ").append(this.fw);
		}
		if(this.sig!=null){
			buffer.append(" [Sig]: ").append(this.sig);
		}
		if(this.sku!=null){
			buffer.append(" [SKU]: ").append(this.sku);
		}
		if(this.getErrorCode()!=null){
			buffer.append(" [Error Code]: ").append(this.getErrorCode());
		}
		if(this.getErrorMessage()!=null){
			buffer.append(" [Error Message]: ").append(this.getErrorMessage());
		}
		if(this.getMsg().length()>0){
			buffer.append(" [Msg]: ").append(this.getMsg());
		}		
		return buffer.toString();		
	}
 
}
