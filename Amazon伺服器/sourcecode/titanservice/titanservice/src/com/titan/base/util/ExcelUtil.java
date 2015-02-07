package com.titan.base.util;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;

import org.apache.commons.io.FileUtils;

import jxl.Workbook;
import jxl.Sheet;
import jxl.Cell;
import jxl.format.CellFormat;
import jxl.read.biff.BiffException;
import jxl.write.Label;
import jxl.write.WritableSheet;
import jxl.write.WritableWorkbook;
import jxl.write.WriteException;
import jxl.write.WritableFont;
import jxl.write.WritableCellFormat;
import jxl.write.biff.RowsExceededException;


public class ExcelUtil {
	
    /**
	 * read excel file, parse to Collection
	 * @param file  source file
     * @param fields  field names, fields.size == col_numm
     * @return
     * @throws BiffException
     * @throws IOException
     */
	public static Collection<HashMap<String, Object>> readExcel(File file,  String[] fields) throws BiffException, IOException{
		int col_num = fields.length;
		Collection<HashMap<String, Object>> col = new ArrayList<HashMap<String, Object>>();
		Workbook workbook=null;
		workbook = Workbook.getWorkbook(file);
		
		Sheet sheet=workbook.getSheet(0);
		Cell cell=null;
		String value = "";
		int rowCount=sheet.getRows();
		HashMap<String, Object> hm;
		boolean empty = true;
		for(int i=0;i<rowCount;i++){	
			hm = new HashMap<String, Object>();
			empty = true;
			for(int j=0;j<col_num;j++){
				cell=sheet.getCell(j,i);
				value = Util.getString(cell.getContents());
				hm.put(fields[j], value);
				if(value.length()>0){
					empty = false;
				}
			}
			if(!empty){
				col.add(hm);
			}
		}
		workbook.close();
		
		return col;
	}
	
	public static Collection<HashMap<String, Object>> readCsv(File file,  String[] fields) throws IOException{
		Collection<HashMap<String, Object>> col = new ArrayList<HashMap<String, Object>>();
		
		BufferedReader reader = new BufferedReader(new FileReader(file));

		HashMap<String, Object> hm;
		String line = reader.readLine();
		while(line!=null){	
			String[] strs = line.trim().split(",");
			
			if(strs.length==2){
				hm = new HashMap<String, Object>();
				hm.put(fields[0], strs[0]);
				hm.put(fields[1], strs[1]);
				col.add(hm);			
			}

			line = reader.readLine();
		}
		
		reader.close();
		
		return col;
	}	
	
	public static boolean writeExcel(File template, File dest, String[] fields, Collection col) 
	throws IOException, BiffException, RowsExceededException, WriteException{
		FileUtils.copyFile(template, dest);
		Workbook workbook = Workbook.getWorkbook(dest);		
		WritableWorkbook w_workbook = Workbook.createWorkbook(dest, workbook);
		WritableSheet w_sheet = w_workbook.getSheet(0);
		
		int row_index = 0;
		
		for(int i=0;i<fields.length;i++){
			writeCell(w_sheet, i, row_index, fields[i]);
		}
		HashMap hm;
		String cell = "";
		for(Iterator it=col.iterator();it.hasNext();){
			row_index++;
			hm = (HashMap)it.next();
			for(int i=0;i<fields.length;i++){
				cell = Util.getString(hm.get(fields[i]));
				writeCell(w_sheet, i, row_index, cell);
			}
		}
		
		w_workbook.write();
		w_workbook.close();
		
		workbook.close();
		
		return true;
	}
	
	public static void writeCell(WritableSheet w_sheet,int col_index,int row_index,String cell) throws RowsExceededException, WriteException{
		Label l=new Label(col_index,row_index,cell);
		w_sheet.addCell(l);
	}
	
	public static void writeCell(WritableSheet w_sheet,int col_index,int row_index,String cell,CellFormat format) throws RowsExceededException, WriteException{
		Label l=new Label(col_index,row_index,cell,format);
		w_sheet.addCell(l);
	}
	
	public static void mergeCells(WritableSheet w_sheet,int col_index1,int row_index1,int col_index2,int row_index2 ) throws RowsExceededException, WriteException{
		w_sheet.mergeCells(col_index1, row_index1, col_index2, row_index2);
	}

}
