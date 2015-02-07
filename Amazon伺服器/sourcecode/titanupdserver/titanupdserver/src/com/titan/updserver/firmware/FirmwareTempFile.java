package com.titan.updserver.firmware;

import java.util.ArrayList;
import java.util.List;


import java.io.File;

import com.titan.updserver.common.ContentBase;

public class FirmwareTempFile {
	
	public static List<String> getTempFiles(){
		List<String> files = new ArrayList<String>();
		File dir = new File(ContentBase.getInstance().getFirmwareTempDir());
		
		String[] strs = dir.list();
		
		for(String str: strs){
			
			files.add(str);
		}
		
		return files;
	}

}
