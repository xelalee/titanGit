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
-- 資料庫: `report_system_db`
-- 

-- --------------------------------------------------------

-- 
-- 資料表格式： `dec_test`
-- 

CREATE TABLE `dec_test` (
  `count` int(255) NOT NULL auto_increment,
  `receive_time` varchar(30) NOT NULL,
  `dname` varchar(30) NOT NULL,
  `serial` varchar(30) NOT NULL,
  `type` int(5) NOT NULL,
  `subtype` int(5) NOT NULL,
  `eventid` varchar(20) NOT NULL,
  `severity` int(5) NOT NULL,
  `cpu` varchar(20) NOT NULL,
  `mem` varchar(20) NOT NULL,
  `disk` varchar(20) NOT NULL,
  PRIMARY KEY  (`count`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=10 ;

-- 
-- 列出以下資料庫的數據： `dec_test`
-- 

INSERT INTO `dec_test` VALUES (1, 'Aug 20 20:09:0', '', '1000000001', 4, 0, '611', 3, '30', '50', '30');
INSERT INTO `dec_test` VALUES (2, 'Aug 20 20:09:00 ', '', '1000000001', 4, 0, '611', 3, '40', '51', '32');
INSERT INTO `dec_test` VALUES (3, 'Aug 20 20:09:00 ', '', '1000000001', 4, 0, '611', 3, '23', '49', '32');
INSERT INTO `dec_test` VALUES (4, 'Aug 20 20:09:00', '', '1000000002', 4, 0, '611', 3, '60', '50', '22');
INSERT INTO `dec_test` VALUES (5, '', '', '1000000002', 4, 0, '611', 3, '38', '58', '22');
INSERT INTO `dec_test` VALUES (6, '', '', '1000000002', 4, 0, '661', 3, '33', '51', '34');
INSERT INTO `dec_test` VALUES (7, '', '', '1000000003', 4, 0, '611', 3, '32', '55', '32');
INSERT INTO `dec_test` VALUES (8, '', '', '1000000003', 4, 0, '611', 3, '23', '43', '76');
INSERT INTO `dec_test` VALUES (9, '', '', '1000000003', 4, 0, '611', 3, '32', '58', '67');
