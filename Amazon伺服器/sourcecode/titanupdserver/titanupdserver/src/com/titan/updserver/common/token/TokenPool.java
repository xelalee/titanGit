package com.titan.updserver.common.token;

import java.util.Hashtable;
import java.util.Iterator;
import java.util.Set;

import com.titan.util.StringUtil;

public class TokenPool {
	
	public static final long tokenLife = 5*60*1000;
	
	private static Hashtable<String, Token> map = new Hashtable<String, Token>();
	
	private static TokenPool instance = new TokenPool();
	public static TokenPool getInstance(){
		return instance;
	}
	/**
	 * put token to pool
	 * @param type contentType
	 * @param id contentId
	 * @param path cotentPath
	 * @return
	 */
	public String put(String type, String id, String path){
		Token token = new Token(type, path);
		String key = type+id+";"+StringUtil.getRandomStr(10);
		map.put(key,  token);
		return key;
	}
	
	public String put4Signature(String id, String path){
		return this.put(Token.ContentType_SIG, id, path);
	}
	
	public String put4Firmware(String id, String path){
		return this.put(Token.ContentType_FW, id, path);
	}
	
	/**
	 * fetch token from pool
	 * @param key
	 * @return
	 */
	public String fetch(String key){
		Token token = map.get(key);
		map.remove(key);
		if(token==null){
			return "";
		}else{
			return token.getPath();
		}
	}
	
	public int check(){
		int count = 0;
		Iterator<String> keys = map.keySet().iterator();
		while(keys.hasNext()){
			String key = keys.next();
			Token token = map.get(key);
			if(System.currentTimeMillis()-token.getCreateTime()>tokenLife){
				keys.remove();
				count++;
			}
		}
		
		return count;
	}
	
	public Hashtable<String, Token> getMap(){
		return map;
	}

}
