package com.titan.updserver.account.dao;

import java.util.*;

public class Privilege {
	
	public HashMap getPrivilege(Collection result){
		HashMap t1 = new HashMap();
		HashMap t2 = new HashMap();
		
		for(Iterator I=result.iterator();I.hasNext();){
			t1 = (HashMap)I.next();
			t2.put(t1.get("FUNCTION_ID"),t1.get("MENU_ID"));
		}
		return t2;
	}
}