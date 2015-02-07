package com.titan.updserver.firmware;

import java.awt.image.BufferedImage;
import java.io.*;
import java.util.List;
import java.util.Properties;

import javax.imageio.ImageIO;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;
import org.imgscalr.Scalr;
import org.json.JSONArray;
import org.json.JSONObject;

import com.titan.updserver.common.ContentBase;

public class UploadServlet extends HttpServlet {
	
	static Logger logger = Logger.getLogger(UploadServlet.class);
	
	public static final String TempFileDir = ContentBase.getInstance().getFirmwareTempDir() + "/";

	
	private ServletContext context;
	

        
    /**
        * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
        * 
        */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    	
    	logger.info("get... getfile: "+request.getParameter("getfile"));

        
        if (request.getParameter("getfile") != null && !request.getParameter("getfile").isEmpty()) {
        	
        	logger.info("get... getfile 1 "+request.getParameter("getfile"));
        	
            File file = new File(TempFileDir+request.getParameter("getfile"));
           
            
            if (file.exists()) {
                int bytes = 0;
                ServletOutputStream op = response.getOutputStream();

                response.setContentType(getMimeType(file));
                response.setContentLength((int) file.length());
                response.setHeader( "Content-Disposition", "inline; filename=\"" + file.getName() + "\"" );

                byte[] bbuf = new byte[1024];
                DataInputStream in = new DataInputStream(new FileInputStream(file));

                while ((in != null) && ((bytes = in.read(bbuf)) != -1)) {
                    op.write(bbuf, 0, bytes);
                }

                in.close();
                op.flush();
                op.close();
            }
        } else if (request.getParameter("delfile") != null && !request.getParameter("delfile").isEmpty()) {
        	logger.info("get... delfile 2 "+request.getParameter("delfile"));
        	File file = new File(TempFileDir+ request.getParameter("delfile"));
            if (file.exists()) {
                file.delete(); // TODO:check and report success
            } 
        } else if (request.getParameter("getthumb") != null && !request.getParameter("getthumb").isEmpty()) {
        	logger.info("get... getthumb 3 "+request.getParameter("getthumb"));
        	File file = new File(TempFileDir+request.getParameter("getthumb"));
                if (file.exists()) {
                	logger.info(file.getAbsolutePath());
                    String mimetype = getMimeType(file);
                    if (mimetype.endsWith("png") || mimetype.endsWith("jpeg")|| mimetype.endsWith("jpg") || mimetype.endsWith("gif")) {
                    	
                    	logger.info("mimetype: "+mimetype);
                    	
                        BufferedImage im = ImageIO.read(file);
                        if (im != null) {
                            BufferedImage thumb = Scalr.resize(im, 75); 
                            ByteArrayOutputStream os = new ByteArrayOutputStream();
                            if (mimetype.endsWith("png")) {
                                ImageIO.write(thumb, "PNG" , os);
                                response.setContentType("image/png");
                            } else if (mimetype.endsWith("jpeg")) {
                                ImageIO.write(thumb, "jpg" , os);
                                response.setContentType("image/jpeg");
                            } else if (mimetype.endsWith("jpg")) {
                                ImageIO.write(thumb, "jpg" , os);
                                response.setContentType("image/jpeg");
                            } else {
                                ImageIO.write(thumb, "GIF" , os);
                                response.setContentType("image/gif");
                            }
                            ServletOutputStream srvos = response.getOutputStream();
                            response.setContentLength(os.size());
                            response.setHeader( "Content-Disposition", "inline; filename=\"" + file.getName() + "\"" );
                            os.writeTo(srvos);
                            srvos.flush();
                            srvos.close();
                        }
                    }
            } // TODO: check and report success
        } else {
            PrintWriter writer = response.getWriter();
            writer.write("call POST with multipart form data");
        }
    }
    
    /**
        * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
        * 
        */
    @SuppressWarnings("unchecked")
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	
    	logger.info("post...");

        if (!ServletFileUpload.isMultipartContent(request)) {
            throw new IllegalArgumentException("Request is not multipart, please 'multipart/form-data' enctype for your form.");
        }

        ServletFileUpload uploadHandler = new ServletFileUpload(new DiskFileItemFactory());
        PrintWriter writer = response.getWriter();
        response.setContentType("application/json");
        JSONArray json = new JSONArray();
        try {
            List<FileItem> items = uploadHandler.parseRequest(request);
            
            logger.debug("post... items.size(): "+items.size());
            
            for (FileItem item : items) {
            	logger.debug("post... ContentType: "+item.getContentType()
            			+", FieldName: "+item.getFieldName()
            			+", Name: "+item.getName()
            			+", Size:"+item.getSize()
            			+", item.isFormField(): "+item.isFormField());
                if (!item.isFormField()) {
                        File file = new File(TempFileDir, item.getName());
                        
                        logger.debug("path: "+file.getAbsolutePath());
                        
                        item.write(file);
                        
                        logger.debug("file write done...");
                        
                        JSONObject jsono = new JSONObject();
                        jsono.put("name", item.getName());
                        jsono.put("size", item.getSize());
                        jsono.put("url", "/upd/UploadServlet?getfile=" + item.getName());
                        jsono.put("thumbnail_url", "/upd/UploadServlet?getthumb=" + item.getName());
                        jsono.put("delete_url", "/upd/UploadServlet?delfile=" + item.getName());
                        jsono.put("delete_type", "GET");
                        
                        logger.debug("before json.put(jsono)...");
                        
                        json.put(jsono);
                        
                        logger.debug("json.toString(): "+json.toString());
                }
            }
        } catch (FileUploadException e) {
        	logger.error("FileUploadException", e);
        	throw new RuntimeException(e);
        } catch (Exception e) { 
            logger.error("RuntimeException", e);
            throw new RuntimeException(e);
        } finally {
            writer.write(json.toString());
            writer.close();
        }

    }

    private String getMimeType(File file) {
        String mimetype = "";
        if (file.exists()) {
            if (getSuffix(file.getName()).equalsIgnoreCase("png")) {
                mimetype = "image/png";
            }else if(getSuffix(file.getName()).equalsIgnoreCase("jpg")){
                mimetype = "image/jpg";
            }else if(getSuffix(file.getName()).equalsIgnoreCase("jpeg")){
                mimetype = "image/jpeg";
            }else if(getSuffix(file.getName()).equalsIgnoreCase("gif")){
                mimetype = "image/gif";
            }else {
                javax.activation.MimetypesFileTypeMap mtMap = new javax.activation.MimetypesFileTypeMap();
                mimetype  = mtMap.getContentType(file);
            }
        }
        return mimetype;
    }



    private String getSuffix(String filename) {
        String suffix = "";
        int pos = filename.lastIndexOf('.');
        if (pos > 0 && pos < filename.length() - 1) {
            suffix = filename.substring(pos + 1);
        }
        return suffix;
    }


}