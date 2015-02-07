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
-- 資料庫: `report_threat_db`
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
  `filetype` varchar(10) NOT NULL,
  `time_generated` varchar(30) NOT NULL,
  `id` varchar(30) NOT NULL,
  `proto` varchar(12) NOT NULL,
  `policy` varchar(40) NOT NULL,
  `src` varchar(12) NOT NULL,
  `dst` varchar(12) NOT NULL,
  `sport` varchar(5) NOT NULL,
  `dport` varchar(5) NOT NULL,
  `from` varchar(12) NOT NULL,
  `to` varchar(12) NOT NULL,
  `inbound_if` varchar(20) NOT NULL,
  `outbound_if` varchar(20) NOT NULL,
  `repeatcnt` text NOT NULL,
  PRIMARY KEY  (`count`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;


