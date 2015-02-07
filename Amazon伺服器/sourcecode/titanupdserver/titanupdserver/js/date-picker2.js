//萬年曆
var weekend = [0, 6];
var weekendColor = "#e7d1d1";
var fontface = "Arial,Helvetica,sans-serif";
var fontsize = 1;
var gNow = new Date();
var ggWinCal;

//---peter-----
var MultiDate = "false";	
	
isNav = (navigator.appName.indexOf("Netscape") != -1) ? true : false;
isIE = (navigator.appName.indexOf("Microsoft") != -1) ? true : false;
Calendar.Months = ["January", "February", "March", "April", "May", "June", "July", "August",
                   "September", "October", "November", "December"];
                   
//一般年的每月日數
Calendar.DOMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

//閏年的每月日數
Calendar.lDOMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function Calendar(p_item, p_WinCal, p_month, p_year, p_format) {
  if ((p_month == null) && (p_year == null))
    return;
  if (p_WinCal == null)
    this.gWinCal = ggWinCal;
  else
    this.gWinCal = p_WinCal;
  if (p_month == null) {
    this.gMonthName = null;
    this.gMonth = null;
    this.gYearly = true;
  }
  else {
    this.gMonthName = Calendar.get_month(p_month);
    this.gMonth = new Number(p_month);
    this.gYearly = false;
  }
  this.gYear = p_year;
  this.gFormat = p_format;
  this.gBGColor = "#999999";
  this.gFGColor = "black";
  this.gTextColor = "#FFFFFF";
  this.gHeaderColor = "black";
  this.gReturnItem = p_item;
}

Calendar.get_month = Calendar_get_month;
Calendar.get_daysofmonth = Calendar_get_daysofmonth;
Calendar.calc_month_year = Calendar_calc_month_year;
Calendar.print = Calendar_print;

function Calendar_get_month(monthNo) {
  return Calendar.Months[monthNo];
}

//判斷閏年逢100年、400年的狀況
function Calendar_get_daysofmonth(monthNo, p_year) {
  if ((p_year % 4) == 0) {
    if ((p_year % 100) == 0 && (p_year % 400) != 0)
      return Calendar.DOMonth[monthNo];
    return Calendar.lDOMonth[monthNo];
  }
  else
    return Calendar.DOMonth[monthNo];
}

//指定目前年月
function Calendar_calc_month_year(p_Month, p_Year, incr) {
  var ret_arr = new Array();
  if (incr == -1) {  //月份向後
    if (p_Month == 0) {
      ret_arr[0] = 11;
      ret_arr[1] = parseInt(p_Year) - 1;
    }
    else {
      ret_arr[0] = parseInt(p_Month) - 1;
      ret_arr[1] = parseInt(p_Year);
    }
  }
  else if (incr == 1) {  //月份向前
    if (p_Month == 11) {
      ret_arr[0] = 0;
      ret_arr[1] = parseInt(p_Year) + 1;
    }
    else {
      ret_arr[0] = parseInt(p_Month) + 1;
      ret_arr[1] = parseInt(p_Year);
    }
  }
  return ret_arr;
}

function Calendar_print() {
  ggWinCal.print();
}

//for Netscape browser
new Calendar();
Calendar.prototype.getMonthlyCalendarCode = function() {
  var vCode = "";
  var vHeader_Code = "";
  var vData_Code = "";
  
  vCode = vCode + "<TABLE BORDER=0 cellspacing=\"1\" cellpadding=\"1\" BGCOLOR='#666666'>";
  vHeader_Code = this.cal_header();
  vData_Code = this.cal_data();
  vCode = vCode + vHeader_Code + vData_Code;
  vCode = vCode + "</TABLE>";
  return vCode;
}

Calendar.prototype.show = function() {
  var vCode = "";

  this.gWinCal.document.open();
  this.wwrite("<html>");
  this.wwrite("<head><title>Calendar</title>");
  
  //--Add by Peter-------------------------------------------  
  this.wwrite("<script>");
  this.wwrite("function addDates(p_ReturnItem,p_ReturnValue)"); 
  this.wwrite("{");
  this.wwrite("var vwinPar = window.opener;");
  this.wwrite("var addedSelectObject = vwinPar.document.getElementById(p_ReturnItem);");
  this.wwrite("var addedOption = vwinPar.document.createElement('OPTION');");
  this.wwrite("addedOption.text=p_ReturnValue;");
  this.wwrite("addedOption.value=p_ReturnValue;");
  this.wwrite("addedSelectObject.add(addedOption);");
  this.wwrite("window.close();");
  this.wwrite("}");
  this.wwrite("</script>");
  //--------------------------------------------------------
  
  
  this.wwrite("</head>");
  this.wwrite("<body " + "link=\"" + this.gLinkColor + "\" " + "vlink=\"" +
              this.gLinkColor + "\" " + "alink=\"" + this.gLinkColor + "\" " +
              "text=\"" + this.gTextColor + "\">");
  this.wwriteA("<FONT FACE='" + fontface + "' SIZE=2><B>");
  this.wwriteA("<CENTER>" + this.gMonthName + " " + this.gYear + "</CENTER>");  //顯示英文大寫的年 月
  this.wwriteA("</B><BR>");

  var prevMMYYYY = Calendar.calc_month_year(this.gMonth, this.gYear, -1);
  var prevMM = prevMMYYYY[0];
  var prevYYYY = prevMMYYYY[1];
  var nextMMYYYY = Calendar.calc_month_year(this.gMonth, this.gYear, 1);
  var nextMM = nextMMYYYY[0];
  var nextYYYY = nextMMYYYY[1];
  this.wwrite("<TABLE WIDTH='100%' BORDER=0 CELLSPACING=1 CELLPADDING=1 BGCOLOR='#e0e0e0'><TR><TD ALIGN=center>");
  this.wwrite("[<A HREF=\"" + "javascript:window.opener.Build(" + "'" +
              this.gReturnItem + "', '" + this.gMonth + "', '" +
              (parseInt(this.gYear)-1) + "', '" + this.gFormat + "'" + ");" +
              "\"><<<\/A>]</TD><TD ALIGN=center>");
  this.wwrite("[<A HREF=\"" + "javascript:window.opener.Build(" + "'" +
              this.gReturnItem + "', '" + prevMM + "', '" + prevYYYY + "', '" +
              this.gFormat + "'" +");" + "\"><<\/A>]</TD><TD ALIGN=center>");
  this.wwrite("[<A HREF=\"javascript:window.print();\">Print</A>]</TD><TD ALIGN=center>");
  this.wwrite("[<A HREF=\"" + "javascript:window.opener.Build(" + "'" +
              this.gReturnItem + "', '" + nextMM + "', '" + nextYYYY + "', '" +
              this.gFormat + "'" + ");" + "\">><\/A>]</TD><TD ALIGN=center>");
  this.wwrite("[<A HREF=\"" + "javascript:window.opener.Build(" + "'" +
              this.gReturnItem + "', '" + this.gMonth + "', '" +
              (parseInt(this.gYear)+1) + "', '" + this.gFormat + "'" + ");" +
              "\">>><\/A>]</TD></TR></TABLE><BR>");
  vCode = this.getMonthlyCalendarCode();  //抓出當月完整月曆
  this.wwrite(vCode);
  this.wwrite("</font></body></html>");
  this.gWinCal.document.close();
}

Calendar.prototype.showY = function() {
  var vCode = "";
  var i;
  var vr, vc, vx, vy;  // Row, Column, X-coord, Y-coord
  var vxf = 285;  // X-Factor
  var vyf = 200;  // Y-Factor
  var vxm = 10;  // X-margin
  var vym;  // Y-margin
  if (isIE)
    vym = 75;
  else if (isNav)
    vym = 25;
  this.gWinCal.document.open();
  this.wwrite("<html>");
  this.wwrite("<head><title>Calendar</title>");
  this.wwrite("<style type='text/css'>\n<!--");
  for (i = 0; i < 12; i++) {
    vc = i % 3;
    if (i >= 0 && i <= 2)
      vr = 0;
    if (i >= 3 && i <= 5)
      vr = 1;
    if (i >= 6 && i <= 8)
      vr = 2;
    if (i >= 9 && i <= 11)
      vr = 3;
    vx = parseInt(vxf * vc) + vxm;	
    vy = parseInt(vyf * vr) + vym;
    this.wwrite(".lclass" + i + " {position:absolute;top:" + vy + ";left:" + vx +
                ";}");
  }
  this.wwrite("-->\n</style>");
  this.wwrite("</head>");
  this.wwrite("<body " + "link=\"" + this.gLinkColor + "\" " + "vlink=\"" +
              this.gLinkColor + "\" " + "alink=\"" + this.gLinkColor + "\" " +
	      "text=\"" + this.gTextColor + "\">");
  this.wwrite("<FONT FACE='" + fontface + "' SIZE=2><B>");
  this.wwrite("Year : " + this.gYear);
  this.wwrite("</B><BR>");

// Show navigation buttons
  var prevYYYY = parseInt(this.gYear) - 1;
  var nextYYYY = parseInt(this.gYear) + 1;
  this.wwrite("<TABLE WIDTH='100%' BORDER=0 cellspacing='1'  cellpadding='1' bgcolor='#666666'><TR><TD ALIGN=center>");
  this.wwrite("[<A HREF=\"" + "javascript:window.opener.Build(" + "'" +
              this.gReturnItem + "', null, '" + prevYYYY + "', '" + this.gFormat +
              "'" + ");" + "\" alt='Prev Year'><<<\/A>]</TD><TD ALIGN=center>");
  this.wwrite("[<A HREF=\"javascript:window.print();\">Print</A>]</TD><TD ALIGN=center>");
  this.wwrite("[<A HREF=\"" + "javascript:window.opener.Build(" + "'" +
              this.gReturnItem + "', null, '" + nextYYYY + "', '" + this.gFormat +
              "'" + ");" + "\">>><\/A>]</TD></TR></TABLE><BR>");

//抓出每個月的完整月曆
  var j;
  for (i = 11; i >= 0; i--) {
    if (isIE)
      this.wwrite("<DIV ID=\"layer" + i + "\" CLASS=\"lclass" + i + "\">");
    else if (isNav)
      this.wwrite("<LAYER ID=\"layer" + i + "\" CLASS=\"lclass" + i + "\">");
    this.gMonth = i;
    this.gMonthName = Calendar.get_month(this.gMonth);
    vCode = this.getMonthlyCalendarCode();
    this.wwrite(this.gMonthName + "/" + this.gYear + "<BR>");
    this.wwrite(vCode);
    if (isIE)
      this.wwrite("</DIV>");
    else if (isNav)
      this.wwrite("</LAYER>");
  }
  this.wwrite("</font><BR></body></html>");
  this.gWinCal.document.close();
}

Calendar.prototype.wwrite = function(wtext) {
  this.gWinCal.document.writeln(wtext);
}

Calendar.prototype.wwriteA = function(wtext) {
  this.gWinCal.document.write(wtext);
}

Calendar.prototype.cal_header = function() {
  var vCode = "";
  vCode = vCode + "<TR>";
  vCode = vCode + "<TD WIDTH='14%' bgcolor='#999999'><FONT SIZE='2' FACE='" + fontface + "' COLOR='" +
          "#FFFFFF'>Sun</FONT></TD>";
  vCode = vCode + "<TD WIDTH='14%' bgcolor='#999999'><FONT SIZE='2' FACE='" + fontface + "' COLOR='" +
          "#FFFFFF''>Mon</FONT></TD>";
  vCode = vCode + "<TD WIDTH='14%' bgcolor='#999999'><FONT SIZE='2' FACE='" + fontface + "' COLOR='" +
          "#FFFFFF'>Tue</FONT></TD>";
  vCode = vCode + "<TD WIDTH='14%' bgcolor='#999999'><FONT SIZE='2' FACE='" + fontface + "' COLOR='" +
          "#FFFFFF'>Wed</FONT></TD>";
  vCode = vCode + "<TD WIDTH='14%' bgcolor='#999999'><FONT SIZE='2' FACE='" + fontface + "' COLOR='" +
          "#FFFFFF'>Thu</FONT></TD>";
  vCode = vCode + "<TD WIDTH='14%' bgcolor='#999999'><FONT SIZE='2' FACE='" + fontface + "' COLOR='" +
          "#FFFFFF'>Fri</FONT></TD>";
  vCode = vCode + "<TD WIDTH='16%' bgcolor='#999999'><FONT SIZE='2' FACE='" + fontface + "' COLOR='" +
          "#FFFFFF'>Sat</FONT></TD>";
  vCode = vCode + "</TR>";
  return vCode;
}

Calendar.prototype.cal_data = function() {
  var vDate = new Date();
  
  vDate.setDate(1);
  vDate.setMonth(this.gMonth);
  vDate.setFullYear(this.gYear);
  
  var vFirstDay=vDate.getDay();
  var vDay = 1;
  var vLastDay = Calendar.get_daysofmonth(this.gMonth, this.gYear);
  var vOnLastDay = 0;
  var vCode = "";

  vCode = vCode + "<TR align='right'>";
  for (i = 0; i < vFirstDay; i++) {
    vCode = vCode + "<TD WIDTH='14%'" + this.write_weekend_string(i) +
            "  bgcolor='#EEEEEE'><FONT SIZE='2' COLOR='#0033FF' FACE='" + fontface + "'> </FONT></TD>";
  }

//抓出第一週的日期
  for (j = vFirstDay; j < 7; j++) {
  	
  	 if(MultiDate=="true")
  	 {	
    vCode = vCode + "<TD WIDTH='14%'" + this.write_weekend_string(j) +
            "  bgcolor='#EEEEEE'><FONT SIZE='2' COLOR='#0033FF' FACE='" + fontface + "'>" + "<A HREF='#' " + 
            "onClick=\"javascript:addDates('"+this.gReturnItem+"','"+this.format_data(vDay)+"')\">" + this.format_day(vDay) + 
            "</A>" + "</FONT></TD>";
    }
    else
    {
    vCode = vCode + "<TD WIDTH='14%'" + this.write_weekend_string(j) +
            "  bgcolor='#EEEEEE'><FONT SIZE='2' COLOR='#0033FF' FACE='" + fontface + "'>" + "<A HREF='#' " + 
            "onClick=\"self.opener.document." + this.gReturnItem + ".value='" + this.format_data(vDay) + "';window.close();\">" + this.format_day(vDay) + 
            "</A>" + "</FONT></TD>";    	
    }
    vDay = vDay + 1;
  }
  vCode = vCode + "</TR>";

//抓出每一週的日期
  for (k = 2; k < 7; k++) {
    vCode = vCode + "<TR align='right'>";
    for (j = 0; j < 7; j++) {

    	if(MultiDate=="true")
    	{
      vCode = vCode + "<TD WIDTH='14%'" + this.write_weekend_string(j) +
              " bgcolor='#EEEEEE'><FONT SIZE='2' COLOR='#0033FF' FACE='" + fontface + "'>" + "<A HREF='#' " + 
              "onClick=\"javascript:addDates('"+this.gReturnItem+"','"+this.format_data(vDay)+"')\">" + this.format_day(vDay) + 
              "</A>" + "</FONT></TD>";
      }
      else
      {
      vCode = vCode + "<TD WIDTH='14%'" + this.write_weekend_string(j) +
              " bgcolor='#EEEEEE'><FONT SIZE='2' COLOR='#0033FF' FACE='" + fontface + "'>" + "<A HREF='#' " + 
              "onClick=\"self.opener.document." + this.gReturnItem + ".value='" + this.format_data(vDay) + "';window.close();\">" + this.format_day(vDay) + 
              "</A>" + "</FONT></TD>";
      }
      vDay = vDay + 1;
      if (vDay > vLastDay) {
        vOnLastDay = 1;
        break;
      }
    }
    if (j == 6)
      vCode = vCode + "</TR>";
    if (vOnLastDay == 1)
      break;
  }
	
//填入每月最後的空白格
  for (m = 1; m < (7 - j); m++) {
    if (this.gYearly)
      vCode = vCode + "<TD WIDTH='14%'" + this.write_weekend_string(j+m) + 
              " bgcolor='#EEEEEE'><FONT SIZE='2' FACE='" + fontface + "' COLOR='gray'> </FONT></TD>";
    else
      vCode = vCode + "<TD WIDTH='14%'" + this.write_weekend_string(j+m) + 
              " bgcolor='#EEEEEE'><FONT SIZE='2' FACE='" + fontface + "' COLOR='gray'>" + m +
              "</FONT></TD>";
  }
  return vCode;
}

Calendar.prototype.format_day = function(vday) {
  var vNowDay = gNow.getDate();
  var vNowMonth = gNow.getMonth();
  var vNowYear = gNow.getFullYear();
  if (vday == vNowDay && this.gMonth == vNowMonth && this.gYear == vNowYear)
    return ("<FONT COLOR=\"RED\"><B>" + vday + "</B></FONT>");
  else
    return (vday);
}

Calendar.prototype.write_weekend_string = function(vday) {
  var i;

//設定週末的顏色
  for (i = 0; i < weekend.length; i++) {
    if (vday == weekend[i])
      return (" BGCOLOR=\"" + weekendColor + "\"");
  }
  return "";
}

Calendar.prototype.format_data = function(p_day) {
  var vData;
  var vMonth = 1 + this.gMonth;
  
  vMonth = (vMonth.toString().length < 2) ? "0" + vMonth : vMonth;
  
  var vMon = Calendar.get_month(this.gMonth).substr(0,3).toUpperCase();
  var vFMon = Calendar.get_month(this.gMonth).toUpperCase();
  var vY4 = new String(this.gYear);
  var vY2 = new String(this.gYear.substr(2,2));
  var vDD = (p_day.toString().length < 2) ? "0" + p_day : p_day;
  switch (this.gFormat) {
    case "MM\/DD\/YYYY" :
      vData = vMonth + "\/" + vDD + "\/" + vY4;
      break;
    case "MM\/DD\/YY" :
      vData = vMonth + "\/" + vDD + "\/" + vY2;
      break;
    case "MM-DD-YYYY" :
      vData = vMonth + "-" + vDD + "-" + vY4;
      break;
    case "MM-DD-YY" :
      vData = vMonth + "-" + vDD + "-" + vY2;
      break;
    case "DD\/MON\/YYYY" :
      vData = vDD + "\/" + vMon + "\/" + vY4;
      break;
    case "DD\/MON\/YY" :
      vData = vDD + "\/" + vMon + "\/" + vY2;
      break;
    case "DD-MON-YYYY" :
      vData = vDD + "-" + vMon + "-" + vY4;
      break;
    case "DD-MON-YY" :
      vData = vDD + "-" + vMon + "-" + vY2;		
      break;
    case "DD\/MONTH\/YYYY" :
      vData = vDD + "\/" + vFMon + "\/" + vY4;
      break;
    case "DD\/MONTH\/YY" :
      vData = vDD + "\/" + vFMon + "\/" + vY2;
      break;
    case "DD-MONTH-YYYY" :
      vData = vDD + "-" + vFMon + "-" + vY4;
      break;
    case "DD-MONTH-YY" :
      vData = vDD + "-" + vFMon + "-" + vY2;
      break;
    case "DD\/MM\/YYYY" :
      vData = vY4 + "\/" + vMonth + "\/" + vDD;
      break;
    case "DD\/MM\/YY" :
      vData = vDD + "\/" + vMonth + "\/" + vY2;
      break;
    case "DD-MM-YYYY" :
      vData = vDD + "-" + vMonth + "-" + vY4;
      break;
    case "DD-MM-YY" :
      vData = vDD + "-" + vMonth + "-" + vY2;
      break;
    default :
      vData = vY4 + "\/" + vMonth + "\/" + vDD;
  }
  return vData;
}

function Build(p_item, p_month, p_year, p_format) {
  var p_WinCal = ggWinCal;
  
  gCal = new Calendar(p_item, p_WinCal, p_month, p_year, p_format);

//設定客制化月曆畫面
  gCal.gBGColor= "white";
  gCal.gLinkColor= "black";
  gCal.gTextColor= "black";
  gCal.gHeaderColor= "darkgreen";

  if (gCal.gYearly)
    gCal.showY();
  else
    gCal.show();
}

function show_calendar() {
/*p_month：0-11 for 1 ~ 12月; 12 for所有月份
  p_year：4-digit year
  p_format：Date format (mm/dd/yyyy, dd/mm/yy, ...)
  p_item：Return Item.*/
  
  p_item = arguments[0];
  
  if (arguments[2] == null)
    p_month = new String(gNow.getMonth());
  else
    p_month = arguments[2];
    
  if (arguments[3] == "" || arguments[3] == null)
    p_year = new String(gNow.getFullYear().toString());
  else
    p_year = arguments[3];
  
  if (arguments[4] == null)
    p_format = "DD/MM/YYYY";
  else
    p_format = arguments[4];
  
  //---add by peter--
  // if multi date select set "true" 
  if (arguments[1] == "true")
    MultiDate = "true";
  else
    MultiDate = "false";
    
  
  vWinCal = window.open("", "Calendar",
                        "width=250,height=250,status=no,resizable=no,top=200,left=200 ");
  vWinCal.opener = self;
  ggWinCal = vWinCal;
  Build(p_item, p_month, p_year, p_format);
}

//年曆
function show_yearly_calendar(p_item, p_year, p_format) {
	
// Load the defaults..
  if (p_year == null || p_year == "")
    p_year = new String(gNow.getFullYear().toString());
  if (p_format == null || p_format == "")
    p_format = "MM/DD/YYYY";
  var vWinCal = window.open("", "Calendar", "scrollbars=yes");
  vWinCal.opener = self;
  ggWinCal = vWinCal;
  Build(p_item, null, p_year, p_format);
}
