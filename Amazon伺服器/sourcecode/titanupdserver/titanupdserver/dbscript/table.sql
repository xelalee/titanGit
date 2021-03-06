DROP TABLE IF EXISTS SCHEDULE;
CREATE TABLE SCHEDULE
(
  SCHEDULE_ID   INTEGER      NOT NULL,
  HOUR          INTEGER      NOT NULL,
  MINUTE        INTEGER      NOT NULL,
  FLAG          CHAR(1)     NOT NULL
);

DROP TABLE IF EXISTS ACTION;
CREATE TABLE ACTION
(
  ACTION_NAME   VARCHAR(30)                    NOT NULL,
  ACTION_VALUE  VARCHAR(128)
);

DROP TABLE IF EXISTS ACTION_RESULT;
CREATE TABLE ACTION_RESULT
(
  ACTION_NAME   VARCHAR(30)                    NOT NULL,
  RESULT_NAME   VARCHAR(60)                    NOT NULL,
  RESULT_VALUE  VARCHAR(256)
);

DROP TABLE IF EXISTS ACCOUNT;
CREATE TABLE ACCOUNT
(
  ACCOUNT_ID         INTEGER NOT NULL auto_increment,
  GROUP_ID		     INTEGER					 NOT NULL,
  USERNAME           VARCHAR(20),
  PASSWORD           VARCHAR(128),
  EMAIL              VARCHAR(50),
  CREATE_DATE        TIMESTAMP default now(),
  CREATE_BY          VARCHAR(20),
  UNIQUE(ACCOUNT_ID)
);

DROP TABLE IF EXISTS MENU;
CREATE TABLE MENU
(
  MENU_ID    INTEGER                             NOT NULL,
  MENU_NAME  VARCHAR(64),
  SORT_ID    VARCHAR(4),
  UNIQUE(MENU_ID)
);

DROP TABLE IF EXISTS FUNCTION;
CREATE TABLE FUNCTION
(
  FUNCTION_ID    INTEGER                         NOT NULL,
  MENU_ID        INTEGER                         NOT NULL,
  FUNCTION_NAME  VARCHAR(64),
  URL            VARCHAR(256),
  SORT_ID        VARCHAR(4),
  MASTER_SLAVE   VARCHAR(10),
  UNIQUE(FUNCTION_ID)
);

DROP TABLE IF EXISTS FUNCTION2GROUP_NAME;
CREATE TABLE FUNCTION2GROUP_NAME
(
  MAPPING_ID    INTEGER                          NOT NULL,
  FUNCTION_ID   INTEGER                          NOT NULL,
  MENU_ID       INTEGER                          NOT NULL,
  GROUP_ID      INTEGER                          NOT NULL,
  UNIQUE(MAPPING_ID)
);

DROP TABLE IF EXISTS GROUP_NAME;
CREATE TABLE GROUP_NAME
(
  GROUP_ID      INTEGER                          NOT NULL,
  GROUP_NAME    VARCHAR(64),
  UNIQUE(GROUP_ID)
);

DROP TABLE IF EXISTS MESSAGE;
CREATE TABLE MESSAGE
(
  CODE    INTEGER                           NOT NULL,
  TYPE    VARCHAR(100),
  EXPLAN  VARCHAR(360),
  ACTION  VARCHAR(240),
  VALUE1  VARCHAR(100),
  VALUE2  VARCHAR(100),
  URL     VARCHAR(50)
);

DROP TABLE IF EXISTS DEVICE_TYPE;
CREATE TABLE DEVICE_TYPE
(
  DEVICE    	VARCHAR(40)		NOT NULL,
  UNIQUE(DEVICE)
);

DROP TABLE IF EXISTS SERVICE_TYPE;
CREATE TABLE SERVICE_TYPE
(
  SERVICE    	VARCHAR(40)		NOT NULL,
  UNIQUE(SERVICE)
);

DROP TABLE IF EXISTS SIGNATURE;
CREATE TABLE SIGNATURE
(
  SIGNATURE_ID      INTEGER NOT NULL auto_increment,
  DEVICE    		VARCHAR(40),
  SERVICE    		VARCHAR(40),
  ENGINE_VER        DOUBLE(16,8),
  SIG_VER    		DOUBLE(16,8),
  FULLSET           VARCHAR(10),
  UPDATE_BY			VARCHAR(20),
  UPDATE_DATE		DATETIME,
  CHECKSUM          VARCHAR(200),
  FILESIZE          VARCHAR(10),
  STATUS			VARCHAR(20),
  unique(SIGNATURE_ID),
  unique(DEVICE,SERVICE,SIG_VER)
);

DROP TABLE IF EXISTS FIRMWARE;
CREATE TABLE FIRMWARE
(
  FIRMWARE_ID      INTEGER NOT NULL auto_increment,
  DEVICE    		VARCHAR(40),
  VERSION      VARCHAR(40),
  UPDATE_BY			VARCHAR(20),
  UPDATE_DATE		DATETIME,
  CHECKSUM          VARCHAR(200),
  STATUS			VARCHAR(20),
  FILESIZE          VARCHAR(10),
  unique(FIRMWARE_ID),
  unique(DEVICE,VERSION)
);

DROP TABLE IF EXISTS SEQUENCE_ID;
CREATE TABLE SEQUENCE_ID
(
  NAME    VARCHAR(130),
  NEXTID  INTEGER
);

DROP TABLE IF EXISTS C_SYSTEM_LOG;
CREATE TABLE C_SYSTEM_LOG
(
    LOGID bigint(20) NOT NULL auto_increment,
	LOGTIME bigint(20),
	REGION VARCHAR(20),
	SERVER VARCHAR(20),
	MESSAGE VARCHAR(100),
	UNIQUE(LOGID)
);

DROP TABLE IF EXISTS C_REQUEST_LOG;
CREATE TABLE C_REQUEST_LOG
(
    LOGID bigint(20) NOT NULL auto_increment,
	LOGTIME bigint(20),
	REGION VARCHAR(20),
	SERVER VARCHAR(20),
	DEVICE_TYPE VARCHAR(40),
	SERVICE_TYPE VARCHAR(40),
	ENGINE_VER VARCHAR(10),
	VERSION VARCHAR(10),
	RETURN_MSG VARCHAR(250),
	MAC VARCHAR(20),
	SRCIP  VARCHAR(20),
	TYPE VARCHAR(10),
	UNIQUE(LOGID)
);

DROP TABLE IF EXISTS C_DOWNLOAD_LOG;
CREATE TABLE C_DOWNLOAD_LOG
(
	LOGID bigint(20) NOT NULL auto_increment,
	LOGTIME bigint(20),
	REGION VARCHAR(20),
	SERVER VARCHAR(20),
	TOKEN VARCHAR(100),
	FILESIZE INTEGER,
	DOWNLOAD_TIME INTEGER,
	SUCCESS VARCHAR(10),
	MAC VARCHAR(20),
	SRCIP  VARCHAR(20),
	TYPE VARCHAR(10),
	UNIQUE(LOGID)
);



