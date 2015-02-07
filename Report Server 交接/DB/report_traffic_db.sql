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
-- 資料庫: `report_traffic_db`
--

-- --------------------------------------------------------

--
-- 資料表格式： `des_2014_08_21`
--

CREATE TABLE `des_2014_08_21` (
  `count` int(255) NOT NULL auto_increment,
  `receive_tim` varchar(30) NOT NULL,
  `dname` varchar(30) NOT NULL,
  `serial` varchar(30) NOT NULL,
  `type` int(5) NOT NULL,
  `subtype` int(5) NOT NULL,
  `id` varchar(30) NOT NULL,
  `flag` varchar(20) NOT NULL,
  `proto` varchar(12) NOT NULL,
  `rule` varchar(40) NOT NULL,
  `src` varchar(12) NOT NULL,
  `dst` varchar(12) NOT NULL,
  `sport` varchar(5) NOT NULL,
  `dport` varchar(5) NOT NULL,
  `natsrc` varchar(12) NOT NULL,
  `natdst` varchar(12) NOT NULL,
  `natsport` varchar(5) NOT NULL,
  `natdport` varchar(5) NOT NULL,
  `from_zone` varchar(12) NOT NULL,
  `to_zone` varchar(12) NOT NULL,
  `inbound_if` varchar(20) NOT NULL,
  `outbound_if` varchar(20) NOT NULL,
  `bytes_tx` varchar(100) NOT NULL,
  `bytes_rx` varchar(100) NOT NULL,
  `pkts_tx` varchar(100) NOT NULL,
  `pkts_rx` varchar(100) NOT NULL,
  PRIMARY KEY  (`count`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=422 ;

