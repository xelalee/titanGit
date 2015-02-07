package com.titan.base.system.bean;

import java.util.HashMap;

import com.titan.base.util.Util;

public class Sn_seqBean {
	private final static int SEQ_LEN = 7;
	private final static String[] ZEROS = new String[]{
		"","0","00","000","0000","00000","000000","0000000"
	};
	
	private String month = "";
	private String type = "";
	private int seq = 0;
	
	public Sn_seqBean(){
	}
	
	public Sn_seqBean(String month, String type, int seq){
		this.month = month;
		this.type = type;
		this.seq = seq;
	}
	
	public Sn_seqBean(HashMap hm){
		if(hm!=null){
			this.month = Util.getString(hm.get("MONTH"));
			this.type = Util.getString(hm.get("TYPE"));
			this.seq = Util.getInteger(hm.get("SEQ"));
		}
	}

	public String getMonth() {
		return month;
	}

	public void setMonth(String month) {
		this.month = month;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public int getSeq() {
		return seq;
	}

	public void setSeq(int seq) {
		this.seq = seq;
	}
	
	public String generateSN(){
		return this.type + this.month + this.formatSeq(this.seq);
	}
	
	private String formatSeq(int seq){
		String str = String.valueOf(seq);
		int fills = SEQ_LEN - str.length();
		if(fills>0){
			str = ZEROS[fills]+str;
		}
		return str;
	}
}
