package com.titan.util;

import java.util.Locale;

public interface Keys {
	
	public final static String INSTANCE_NAME = "upd";
    
    public final static int INTERNAL_SERVER_ERROR = 500;
    
    public final static Locale DEFAULT_LOCALE = Locale.ENGLISH;
	
	//server
	public final static String MAIL_SERVER = "mail_server";
	public final static String MAIL_WEBMASTER =	"mail_webmaster";
	public final static String SERVER_URL = "server_url";
	public final static String UPLOAD_PATH = "upload_path";
	public final static String DOWNLOAD_PATH = "download_path";
	
	public final static String SCHEDULE_DETECT_TIME = "SCHEDULE_DETECT_TIME";
	
	//for mail_host and mail_from setting when sending email
	public final static String MAIL_HOST = "MAIL_HOST";
	public final static String MAIL_FROM = "MAIL_FROM";
	
	//log number limit when sending email and purging logs
	public final static String EMAIL_LOG_LIMIT = "EMAIL_LOG_LIMIT";
	public final static String PURGE_LOG_LIMIT = "PURGE_LOG_LIMIT";
	public final static String PURGE_LOG_DAYS  = "PURGE_LOG_DAYS";
	
	public final static String DEBUG = "debug";				//debug
	public final static String ERR_LOG = "err_log";
	public final static String MSG_LOG = "msg_log";
	
	public final static String STR_SIGNATURE_UPDATE="signature_update";	
	public final static String STR_SIGNATURE_DOWNLOAD="signature_download";
	
	public final static String STR_FIRMWARE_UPDATE="firmware_update";	
	public final static String STR_FIRMWARE_DOWNLOAD="firmware_download";
	
	public final static String LOG_MAN_PAGE_CONTROL = "LOG_MAN_PAGE_CONTROL";
	
	//product
	public final static String PRODUCT = "product";
	public final static String SMTP = "smtp";
	
	// account INFOR
	public final static String USER_INFO = "_USER_INFO" ;

	//manage class name
	public final static String AUTH_MANAGE = "com.titan.controller.manage.AuthManagement";
	public final static String REQUEST_MANAGE = "com.titan.controller.manage.RequestManagement";
	public final static String FLOW_MANAGE = "com.titan.controller.manage.FlowManagement";
	public final static String ACTION_MANAGE = "com.titan.controller.manage.ActionManagement";
	public final static String SYSTEM_MANAGE = "com.titan.controller.manage.SysManagement";
	

	public final static String PRJ_NAME = "GENIUS";
	//
	public final static String ACTION_MAPPING = "ACTION_MAPPING";
	public final static String ACTIONS = "ACTIONS";
	public final static String DEFAULT_PAGE ="global_error.jsp";  // todo...

	//date format
	public final static String DATE_CONVERT="DATE_CONVERT";
	// Parameter for Page Object(Query)
	public final static int ITEMS_PER_PAGE = 10; // in page class is showItemCount
	public final static int INDEX_PER_PAGE = 3; // in page class is showPageCount
	//root
	public final static String NEXT_ACTION_DESC_EN = "Next Page";

	public final static boolean  IS_FILE_RENAME = true ;
	public final static double  BULLETIN_UPLOADFILE_SIZE = 2097152 ;

	// submit key
	public final static String LOGIN_SUBMIT_KEY = "LOGIN_SUBMIT_KEY" ;
	public final String QUICK_CODE = "QUICK_CODE";
	
	//file management
	public final static String XML_TABLE="table";
	public final static String XML_RECORD="record";
	public final static String[] XML_RECORD_ATTRIBUTES={
			     "signature_id","device","service","engine_ver","sig_ver",
				 "filename","fullset","update_by","update_date","filesize",
				 "checksum","status"};
	
	public final static String[] FW_XML_RECORD_ARTRIBUTES = {
		"firmware_id",
		"device",
		"version",
		"filename",
		"update_by",
		"update_date",
		"checksum",
		"status",
		"filesize"
	};
	public final static String URL_PREFIX="http://";
	public final static String URL_PREFIX_HTTPS="https://";
	public final static String COLON_SLASH_SLASH="://";
	public final static String URL_APP_NAME="updserver";
	
	public final static String SIGNATURE_ROOT="signature_root";
	public final static String FIRMWARE_ROOT="firmware_root";
	
	public final static String FIRMWARE_ROOT_TEMP="firmware_root_temp";

	public final static String SIGNATURE_ID="SIGNATURE_ID";
	public final static String FILE_ADD="ADD";
	public final static String FILE_UPDATE="UPDATE";
	public final static String FILE_DELETE="DELETE";
	public final static String FILE_SYNC_SUCCESS="SUCCESS";
	public final static String FILE_SYNC_FAIL="FAIL";
	
	public final static String OBJECT_LIST_INTERFACE="object_list_interface";
	public final static String FETCH_OBJECT_INTERFACE="fetch_object_interface";
	
	public final static String CALL_SYNC_THREAD_INTERFACE="call_sync_thread_interface";		
	
	public final static String UPLOAD_PLATFORM_INTERFACE="upload_platform_interface";
	
	public final static String DOWNLOAD_STATUS_REPORT_INTERFACE = "download_status_report_interface";
	
	public final static String DOWNLOAD_STATUS_AUTO_REPORT_PERIOD = "DOWNLOAD_STATUS_AUTO_REPORT_PERIOD";
	public final static String DOWNLOAD_STATUS_AUTO_REPORT_THRESHOLD = "DOWNLOAD_STATUS_AUTO_REPORT_THRESHOLD";
	
	public final static String SIGNATURE_FILE_INFO_DISPACHER="#";
	
	public final static int TOTAL_RETRY_TIMES=3;
	
	public final static int BUFFER_SIZE=20480;
	
	public final static int LOG_MAX_LENGTH = 450; //max length of a log
	
	public final static String STATUS_ACTIVE = "ACTIVE";
	public final static String STATUS_INACTIVE = "INACTIVE";
	
	public final static String STR_DOMAIN_NAME = "DOMAIN_NAME";
	public final static String STR_MASTER_SLAVE = "MASTER_SLAVE";
	public final static String STR_MASTER_SITE = "MASTER_SITE";
	public final static String STR_MAIL_HOST = "MAIL_HOST";
	public final static String STR_MAIL_FROM = "MAIL_FROM";
	public final static String STR_VALIDATE_CHECKSUM_PERIOD = "VALIDATE_CHECKSUM_PERIOD";
	
	public final static int FULL_VERSION_RESERVE_NUMBER = 5;
	// the max log number showed in page
	public final static int MAX_LOG_COUNT_SHOW = 1000;
	public final static String NOT_AVAILABLE = "N/A";
	
	public final static String STR_SIGNATURE = "signature";
	
	public final static String STR_FIRMWARE = "firmware";
	
}
