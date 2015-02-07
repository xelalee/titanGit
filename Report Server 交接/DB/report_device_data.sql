-- phpMyAdmin SQL Dump
-- version 2.10.3
-- http://www.phpmyadmin.net
-- 
-- 主機: localhost
-- 建立日期: Nov 20, 2014, 03:02 AM
-- 伺服器版本: 5.0.51
-- PHP 版本: 5.2.6

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- 
-- 資料庫: `report_device_data`
-- 

-- --------------------------------------------------------

-- 
-- 資料表格式： `device_data`
-- 

CREATE TABLE `device_data` (
  `count` int(255) NOT NULL auto_increment,
  `serial` varchar(40) NOT NULL,
  `remark` text NOT NULL,
  PRIMARY KEY  (`count`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

-- 
-- 列出以下資料庫的數據： `device_data`
-- 

INSERT INTO `device_data` VALUES (1, '1000000001', 'test01');
INSERT INTO `device_data` VALUES (2, '1000000002', 'test02');
INSERT INTO `device_data` VALUES (4, '1000000003', 'test3');
