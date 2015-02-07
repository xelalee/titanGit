package com.titan.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class ZipTool {
	private static Log logger = LogFactory.getLog(ZipTool.class);
	
	public static void zip(String srcFilePath, String destFilePath) 
		throws IOException{
		
		byte b[] = new byte[1024];
	    ZipOutputStream zout = new ZipOutputStream(new FileOutputStream(destFilePath));
	    
	    File srcFile = new File(srcFilePath);
	    
	    InputStream in = new FileInputStream(srcFile);
	    String entryName = srcFilePath.substring(
	    		srcFilePath.lastIndexOf(File.separator)+1, srcFilePath.length());
	    ZipEntry e = new ZipEntry(entryName);
	    zout.putNextEntry(e);
	    int len=0;
	    while((len=in.read(b)) != -1) {
	        zout.write(b,0,len);
	    }
	    zout.closeEntry();
	    zout.close();
	    in.close();
	    if (!srcFile.delete()) {
	    	logger.error("Deleting file, " + srcFilePath + " failed.");
	    }
	}
	/**
	 * 
	 * @param entryName
	 * @param zipFilePath
	 * @param destFilePath
	 * @return 0 successful
	 *         1 entry is not found
	 * @throws IOException
	 */
	public static int readFileFromZip(String entryName, String zipFilePath, 
			String destFilePath) throws IOException{
		ZipInputStream zin = new ZipInputStream(new FileInputStream(zipFilePath));
		ZipEntry entry = zin.getNextEntry();
		while(entry!=null) {
			if (entry.getName().equals(entryName)){
				byte [] ba = new byte[1024];
				FileOutputStream fout = new FileOutputStream(destFilePath);
				int len = 0;
				while((len=zin.read(ba)) != -1) {
					fout.write(ba, 0, len);
				}
				fout.close();
				zin.closeEntry();
				zin.close();
				return 0;
			}
			zin.closeEntry();
			entry = zin.getNextEntry();
		}
		zin.close();
		return 1;
	}
	
	public static boolean unZipPackage(String path, String packageName) {
		boolean flag = false;
		String filePath = path + File.separator + packageName;
		ZipInputStream zin = null;
		try {
			zin = new ZipInputStream(new FileInputStream(filePath));
			ZipEntry entry = zin.getNextEntry();
			while(entry!=null) {
				if (entry.isDirectory()) {
					File dir = new File(path, entry.getName());
					dir.mkdir();
				} else {
					String destFile = path + File.separator + entry.getName();
					byte [] ba = new byte[1024];
					FileOutputStream fout = new FileOutputStream(destFile);
					int len = 0;
					while((len=zin.read(ba)) != -1) {
						fout.write(ba, 0, len);
					}
					fout.close();
					zin.closeEntry();
				}
				entry = zin.getNextEntry();
			}
			flag = true;
		} catch (Exception e) {
			logger.error("", e);
		} finally{
			try {
				if(zin!=null){
					zin.close();
				}
			} catch (IOException e) {
				logger.error("", e);
			}
		}
		return flag;
	}
	
	public static void main(String[] args){
		unZipPackage("G:\\temp\\zip", "ip.zip");
		
		File f = new File("G:\\temp\\zip\\ip.zip");
		
		System.out.println(f.getAbsolutePath());
		try {
			System.out.println(f.getCanonicalPath());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.out.println(f.getParent());
		System.out.println(f.getPath());
		System.out.println(f.getName());
	}
	
}
