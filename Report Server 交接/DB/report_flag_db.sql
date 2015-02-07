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
-- 資料庫: `report_flag_db`
--

-- --------------------------------------------------------

--
-- 資料表格式： `flag`
--

CREATE TABLE `flag` (
  `count` int(255) NOT NULL auto_increment,
  `flag` varchar(30) NOT NULL,
  `remark` varchar(30) NOT NULL,
  PRIMARY KEY  (`count`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;


