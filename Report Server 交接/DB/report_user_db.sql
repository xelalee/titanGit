-- phpMyAdmin SQL Dump
-- version 2.10.3
-- http://www.phpmyadmin.net
-- 
-- 主機: localhost
-- 建立日期: Nov 20, 2014, 03:05 AM
-- 伺服器版本: 5.0.51
-- PHP 版本: 5.2.6

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- 
-- 資料庫: `report_user_db`
-- 

-- --------------------------------------------------------

-- 
-- 資料表格式： `user_data`
-- 

CREATE TABLE `user_data` (
  `count` int(255) NOT NULL auto_increment,
  `id` varchar(40) NOT NULL,
  `pws` varchar(40) NOT NULL,
  `name` varchar(40) NOT NULL,
  `email` varchar(40) NOT NULL,
  PRIMARY KEY  (`count`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- 
-- 列出以下資料庫的數據： `user_data`
-- 

INSERT INTO `user_data` VALUES (1, 'admin', 'admin', 'adminUser', 'admin@titan-arc.com');
