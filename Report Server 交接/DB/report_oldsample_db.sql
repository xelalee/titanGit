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
-- 資料庫: `report_oldsample_db`
-- 
<br />
<b>Warning</b>:  Cannot modify header information - headers already sent by (output started at D:\AppServ\www\phpMyAdmin\export.php:187) in <b>D:\AppServ\www\phpMyAdmin\libraries\ob.lib.php</b> on line <b>64</b><br />
<br />
<b>Warning</b>:  Cannot modify header information - headers already sent by (output started at D:\AppServ\www\phpMyAdmin\export.php:187) in <b>D:\AppServ\www\phpMyAdmin\libraries\header_http.inc.php</b> on line <b>13</b><br />
<br />
<b>Warning</b>:  Cannot modify header information - headers already sent by (output started at D:\AppServ\www\phpMyAdmin\export.php:187) in <b>D:\AppServ\www\phpMyAdmin\libraries\header_http.inc.php</b> on line <b>14</b><br />
<br />
<b>Warning</b>:  Cannot modify header information - headers already sent by (output started at D:\AppServ\www\phpMyAdmin\export.php:187) in <b>D:\AppServ\www\phpMyAdmin\libraries\header_http.inc.php</b> on line <b>15</b><br />
<br />
<b>Warning</b>:  Cannot modify header information - headers already sent by (output started at D:\AppServ\www\phpMyAdmin\export.php:187) in <b>D:\AppServ\www\phpMyAdmin\libraries\header_http.inc.php</b> on line <b>16</b><br />
<br />
<b>Warning</b>:  Cannot modify header information - headers already sent by (output started at D:\AppServ\www\phpMyAdmin\export.php:187) in <b>D:\AppServ\www\phpMyAdmin\libraries\header_http.inc.php</b> on line <b>19</b><br />
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-TW" lang="zh-TW" dir="ltr">
<head>
    <link rel="icon" href="./favicon.ico" type="image/x-icon" />
    <link rel="shortcut icon" href="./favicon.ico" type="image/x-icon" />
    <title>phpMyAdmin</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="./css/phpmyadmin.css.php?token=e95f24165f30264d9a8d50139c157b50&amp;js_frame=right&amp;nocache=1416452563" />
    <link rel="stylesheet" type="text/css" href="./css/print.css?token=e95f24165f30264d9a8d50139c157b50" media="print" />
    <script type="text/javascript" language="javascript">
    // <![CDATA[
    // Updates the title of the frameset if possible (ns4 does not allow this)
    if (typeof(parent.document) != 'undefined' && typeof(parent.document) != 'unknown'
        && typeof(parent.document.title) == 'string') {
        parent.document.title = 'localhost / localhost / report_oldsample_db / samplelist | phpMyAdmin 2.10.3';
    }
    
    // ]]>
    </script>
        
    <script src="./js/tooltip.js" type="text/javascript"
        language="javascript"></script>
    <meta name="OBGZip" content="true" />
        <!--[if IE 6]>
    <style type="text/css">
    /* <![CDATA[ */
    html {
        overflow-y: scroll;
    }
    /* ]]> */
    </style>
    <![endif]-->
</head>

<body>
<div id="TooltipContainer" onmouseover="holdTooltip();" onmouseout="swapTooltip('default');"></div>
    <div id="serverinfo">
<a href="main.php?token=e95f24165f30264d9a8d50139c157b50" class="item">        <img class="icon" src="./themes/original/img/s_host.png" width="16" height="16" alt="" /> 
伺服器: localhost</a>
        <span class="separator"><img class="icon" src="./themes/original/img/item_ltr.png" width="5" height="9" alt="-" /></span>
<a href="db_structure.php?db=report_oldsample_db&amp;token=e95f24165f30264d9a8d50139c157b50" class="item">        <img class="icon" src="./themes/original/img/s_db.png" width="16" height="16" alt="" /> 
資料庫: report_oldsample_db</a>
        <span class="separator"><img class="icon" src="./themes/original/img/item_ltr.png" width="5" height="9" alt="-" /></span>
<a href="tbl_structure.php?db=report_oldsample_db&amp;table=samplelist&amp;token=e95f24165f30264d9a8d50139c157b50" class="item">        <img class="icon" src="./themes/original/img/s_tbl.png" width="16" height="16" alt="" /> 
資料表: samplelist</a>
<span class="table_comment" id="span_table_comment">&quot;Incorrect information in file: '.\report_oldsample_db\samplelist.frm'&quot;</span>
</div>
<!-- PMA-SQL-ERROR -->
    <div class="error"><h1>錯誤</h1>
    <p><strong>SQL 語法:</strong>
<a href="tbl_sql.php?db=report_oldsample_db&amp;table=samplelist&amp;token=e95f24165f30264d9a8d50139c157b50&amp;sql_query=SHOW+CREATE+TABLE+%60report_oldsample_db%60.%60samplelist%60&amp;show_query=1"><img class="icon" src=" ./themes/original/img/b_edit.png" width="16" height="16" alt="編輯" /></a>    </p>
    <p>
        <span class="syntax"><span class="syntax_alpha syntax_alpha_reservedWord">SHOW</span>  <span class="syntax_alpha syntax_alpha_reservedWord">CREATE</span>  <span class="syntax_alpha syntax_alpha_reservedWord">TABLE</span>  <span class="syntax_quote syntax_quote_backtick">`report_oldsample_db`</span><span class="syntax_punct syntax_punct_qualifier">.</span><span class="syntax_quote syntax_quote_backtick">`samplelist`</span> </span>
    </p>
<p>
    <strong>MySQL 傳回： </strong><a href="http://dev.mysql.com/doc/refman/5.0/en/error-messages-server.html" target="mysql_doc"><img class="icon" src="./themes/original/img/b_help.png" width="11" height="11" alt="說明文件" title="說明文件" /></a>
</p>
<code>
#1033 - Incorrect information in file: '.\report_oldsample_db\samplelist.frm'
</code><br />
</div><fieldset class="tblFooters">    </fieldset>

<script type="text/javascript" language="javascript">
//<![CDATA[
// updates current settings
if (window.parent.setAll) {
    window.parent.setAll('zhtw-utf-8', 'utf8_unicode_ci', '1', 'report_oldsample_db', 'samplelist');
}


// set current db, table and sql query in the querywindow
if (window.parent.refreshNavigation) {
    window.parent.reload_querywindow(
        'report_oldsample_db',
        'samplelist',
        '');
}


if (window.parent.frame_content) {
    // reset content frame name, as querywindow needs to set a unique name
    // before submitting form data, and navigation frame needs the original name
    if (window.parent.frame_content.name != 'frame_content') {
        window.parent.frame_content.name = 'frame_content';
    }
    if (window.parent.frame_content.id != 'frame_content') {
        window.parent.frame_content.id = 'frame_content';
    }
    //window.parent.frame_content.setAttribute('name', 'frame_content');
    //window.parent.frame_content.setAttribute('id', 'frame_content');
}
//]]>
</script>
</body>
</html>
 ��1*`  