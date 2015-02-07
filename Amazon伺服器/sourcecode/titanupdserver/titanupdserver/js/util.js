
function MM_openBrWindow(theURL,winName,features) { //v2.0
  window.open(theURL,winName,features);
}

function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_findObj(n, d) { //v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}

function MM_showHideLayers() { //v6.0
  var i,p,v,obj,args=MM_showHideLayers.arguments;
  for (i=0; i<(args.length-2); i+=3) if ((obj=MM_findObj(args[i]))!=null) { v=args[i+2];
    if (obj.style) { obj=obj.style; v=(v=='show')?'visible':(v=='hide')?'hidden':v; }
    obj.visibility=v; }
}

function uPopWnd(strURL, strWndName, intWidth, intHeight, blnCentered, blnToolbar, blnScrollbar, blnResizable) {
	var m_objWnd=null;
	var m_strStatement = "";
	var m_intXPos=0, m_intYPos=0;
	if (blnCentered && window.screen) {
		m_intXPos = ( screen.availWidth - 10 - intWidth) / 2;
		m_intYPos = ( screen.availHeight - 30 - intHeight) / 2;
	}
	m_strStatement = "m_objWnd = window.open('', '" + strWndName + "',";
	m_strStatement = m_strStatement + "'toolbar=" + blnToolbar + ", ";
	m_strStatement = m_strStatement + "scrollbars=" + blnScrollbar + ", ";
	m_strStatement = m_strStatement + "resizable=" + blnResizable + ", ";
	m_strStatement = m_strStatement + "width=" + intWidth + ", ";
	m_strStatement = m_strStatement + "height=" + intHeight + ", ";
	m_strStatement = m_strStatement + "left=" + m_intXPos + ", ";
	m_strStatement = m_strStatement + "top=" + m_intYPos + "');";

	eval( m_strStatement );

	// set url of the window
	m_objWnd.location.href = strURL;
	// set focus on the window
	m_objWnd.focus();
}

function isEmpty(str) {
  if (str==null || str=="")
    return true;
  return false;
}

function trim(str) {
  if (str!=null) {
    while (str.charAt(str.length - 1)==" ")
      str = str.substring(0, str.length - 1);
    while (str.charAt(0)==" ")
      str = str.substring(1, str.length);
  }
  return str;
}

function trimAll(str) {
  if (str!=null) {
    while (str.length > 0 &&
      "\n\r\t ".indexOf(str.charAt(str.length - 1)) != -1)
      str = str.substring(0, str.length - 1);
    while (str.length > 0 &&
      "\n\r\t ".indexOf(str.charAt(0)) != -1)
      str = str.substring(1, str.length);
  }
  return str;
}

function isPositiveInteger(str) {
  var pattern = "0123456789";
  var i = 0;
  do {
    var pos = 0;
    for (var j=0; j<pattern.length; j++)
      if (str.charAt(i)==pattern.charAt(j)) {
        pos = 1;
        break;
      }
    i++;
  } while (pos==1 && i<str.length)
  if (pos==0)
    return false;
  return true;
}

function isValidPhoneNumber(str) {
  var pattern = "0123456789( )-";
  var i = 0;
  do {
    var pos = 0;
    for (var j=0; j<pattern.length; j++)
      if (str.charAt(i)==pattern.charAt(j)) {
      pos = 1;
      break;
      }
    i++;
  } while (pos==1 && i<str.length)
  if (pos==0)
    return false;
  return true;
}

function isMoney(str) {
  var pattern = "0123456789,.";
  var i = 0;
  do {
    var pos = 0;
    for (var j=0; j<pattern.length; j++)
      if (str.charAt(i)==pattern.charAt(j)) {
      pos = 1;
      break;
    }
    i++;
  } while (pos==1 && i<str.length)
  if (pos==0)
    return false;

  // now make sure that the decimal point, if any,
  // only appears one and at the (str.length-3)
  // position, so that the valid format is xxx.yy
  // the following statement also returns
  // false if there are 2 or more decimal points
  pos = str.indexOf(".");
  //Modified by Effie, xxx, xxx.y, xxx.yy, ... xxx.yyyyyy are valid format
  //if (pos!=-1 && pos!=str.length-3)
  if (pos!=-1 && ((str.length-pos) > 7 || (str.length-pos) <= 1))
    return false;


  // now check that if comma exists, the
  // format must be xxx,xxx,xxx,...,xxx
  if (pos==-1)
    pos = str.length;


  while (str.lastIndexOf(",", pos-1) != -1) {
    if (str.lastIndexOf(",", pos-1) != pos-4)
      return false;
    else
      pos -= 4;
  }
  return true;
}

function removeComma(str) {
  var result = "";
  for (var i=0; i<str.length; i++)
    if (str.charAt(i)!=",")
      result += str.charAt(i);
  return result;
}

//USDate format mm/dd/yyyy
function isUSDate(str) {
  if (str.length!=10 || str.charAt(2)!="/" || str.charAt(5)!="/" ||
    !isPositiveInteger(str.substring(0,2) +
    str.substring(3,5) + str.substring(6,10)))
    return false;
  var d = str.substring(3,5) - 0;
  var m = str.substring(0,2) - 0;
  var y = str.substring(6,10) - 0;
  if (d==0 || m==0 || y==0)
    return false;

  if (m>12) return false;
  if (m==1 || m==3 || m==5 || m==7 || m==8 || m==10 || m==12)
    var dmax = 31;
  else
    if (m==4 || m==6 || m==9 || m==11) dmax = 30;
    else
      if ((y%400==0) || (y%4==0 && y%100!=0)) dmax = 29;
      else dmax = 28;
  if (d>dmax) return false;
  return true;
}

//OZDate format: dd/mm/yyyy
function isOZDate(str) {
  if (str.length!=10 || str.charAt(2)!="/" || str.charAt(5)!="/" ||
    !isPositiveInteger(str.substring(0,2) +
    str.substring(3,5) + str.substring(6,10)))
    return false;
  var d = str.substring(0,2) - 0;
  var m = str.substring(3,5) - 0;
  var y = str.substring(6,10) - 0;
  if (d==0 || m==0 || y==0)
    return false;

  if (m>12) return false;
  if (m==1 || m==3 || m==5 || m==7 || m==8 || m==10 || m==12)
    var dmax = 31;
  else
    if (m==4 || m==6 || m==9 || m==11) dmax = 30;
    else
      if ((y%400==0) || (y%4==0 && y%100!=0)) dmax = 29;
      else dmax = 28;
  if (d>dmax) return false;
  return true;
}

//Our Date format: yyyy-mm-dd
function isDate(str) {
  if (str.length!=10 || str.charAt(4)!="-" || str.charAt(7)!="-" ||
    !isPositiveInteger(str.substring(0,4) +
    str.substring(5,7) + str.substring(8,10)))
    return false;
  var d = str.substring(8,10) - 0;
  var m = str.substring(5,7) - 0;
  var y = str.substring(0,4) - 0;
  if (d==0 || m==0 || y==0)
    return false;

  if (m>12) return false;
  if (m==1 || m==3 || m==5 || m==7 || m==8 || m==10 || m==12)
    var dmax = 31;
  else
    if (m==4 || m==6 || m==9 || m==11) dmax = 30;
    else
      if ((y%400==0) || (y%4==0 && y%100!=0)) dmax = 29;
      else dmax = 28;
  if (d>dmax) return false;
  return true;
}

//Our Year-Month format: yyyy-mm
function isYearMonth(str) {
  if (str.length!=7 || str.charAt(4)!="-" ||
    !isPositiveInteger(str.substring(0,4) + str.substring(5,7)) )
    return false;
  var m = str.substring(5,7) - 0;
  var y = str.substring(0,4) - 0;
  if (m==0 || y==0)
    return false;

  if (m>12) return false;

  return true;
}

function convertToUSDate(str) {
  // maybe you should validate that this IsOZDate first?
  return (str.substring(3,5) + "/" + str.substring(0,2) + "/" + str.substring(6,10));
}

function convertToOZDate(str) {
  // validate that this isUSDate first?
  return (str.substring(3,5) + "/" + str.substring(0,2) + "/" + str.substring(6,10));
}

function toString(n) {
  return "" + n;
}

// from Check
function isStringOverflow(s,len)
{
    return ( s.length > len )
}

// whitespace characters
var whitespace = " \t\n\r";

function isWhitespace(s)
{   var i;

    // Is s empty?
    if (isEmpty(s)) return true;

    // Search through string's characters one by one
    // until we find a non-whitespace character.
    // When we do, return false; if we don't, return true.

    for (i = 0; i < s.length; i++)
    {
        // Check that current character isn't whitespace.
        var c = s.charAt(i);

        if (whitespace.indexOf(c) == -1) return false;
    }

    // All characters are whitespace.
    return true;
}


//-- isValidEmail() from SubmitCheck
var MailFormat = /^\w+([\._-]\w+)*\@\w+([_-]\w+)?.\w+([_-]\w+)?(.\w+([_-]\w+)?)?$/;

function isValidEmail(sEmailAddrList)
{
    if (sEmailAddrList == null || sEmailAddrList.length == 0)
        return false;

    var aryEmailAddr = sEmailAddrList.split(";");
    var iLen = aryEmailAddr.length;
    var sEmailAddr, i;
    for (i = 0; i < iLen; i++) {
        sEmailAddr = aryEmailAddr[i];
        if (sEmailAddr.length == 0)	continue;

        if (!MailFormat.test(sEmailAddr))
        {
            //alert("The email address '" + sEmailAddr + "' is not in the correct format!");
            return false;
        }
        if (isValidChar(sEmailAddr))
           ;// return true;
        else
        {
            //alert("Invalid character found in Main Email!");
            return false;
        }
        if(sEmailAddr.lastIndexOf('@') > sEmailAddr.lastIndexOf('.')){
            return false;
        }        
    }
   return true;
}

function isValidChar(s)
{
    var i;
    for (i = 0; i < s.length; i++)
    {
        var c = s.charAt(i);
        if ((c != "@") && (c != "_") && (c != ".") && (c != "-"))
        {
            if ((c < "0") ||(c > "9" && c < "A") || ( c > "Z" && c < "a") || ( c > "z"))
            {
                //alert("Invalid character '" + c + "' found!");
                return false;
            }
        }
    }
    return true;
}

function isValidCharBySpace(s)
{
    var i;
    for (i = 0; i < s.length; i++)
    {
        var c = s.charAt(i);       
        if ((c != "@") && (c != "_") && (c != ".") && (c != "-") && (c != " "))
        {
            if ((c < "0") || (c > "9" && c < "A") || ( c > "Z" && c < "a") || ( c > "z"))
            {
                //alert("Invalid character '" + c + "' found!");
                return false;
            }
        }
    }
    return true;
}


function isPositiveNumber(str) {
  var pattern = "0123456789.";
  var i = 0;
  do {
    var pos = 0;
    for (var j=0; j<pattern.length; j++)
      if (str.charAt(i)==pattern.charAt(j)) {
      pos = 1;
      break;
    }
    i++;
  } while (pos==1 && i<str.length)
  if (pos==0)
    return false;

  // now make sure that the decimal point, if any,
  // only appears one and at the (str.length-3)
  // position, so that the valid format is xxx.yy
  // the following statement also returns
  // false if there are 2 or more decimal points
  pos = str.indexOf(".");
  //Modified by Effie, xxx, xxx.y, xxx.yy, ... xxx.yyyyyy are valid format
  //if (pos!=-1 && pos!=str.length-3)
  if (pos!=-1 && ((str.length-pos) > 7 || (str.length-pos) <= 1))
    return false;

/*
  // now check that if comma exists, the
  // format must be xxx,xxx,xxx,...,xxx
  if (pos==-1)
    pos = str.length;


  while (str.lastIndexOf(",", pos-1) != -1) {
    if (str.lastIndexOf(",", pos-1) != pos-4)
      return false;
    else
      pos -= 4;
  }
*/
  return true;
}

function isInteger(str) {
  var pattern = "0123456789";
  var i = 0;

  if (str.charAt(0) == '-' && str.length >= 2) {
    i = 1;
  }
  do {
    var pos = 0;
    for (var j=0; j<pattern.length; j++)
      if (str.charAt(i)==pattern.charAt(j)) {
        pos = 1;
        break;
      }
    i++;
  } while (pos==1 && i<str.length)
  if (pos==0)
    return false;
  return true;
}

// path is not allowed.
function isFileName(str) {
    var pattern = "\\/:*?\"<>|"; // illegal characters \ / : * ? " < > |

    if (str == null || str.length == 0 || str.length > 255) return false;

    var i = 0;
    for (i = 0; i < str.length; i++) {
        if (pattern.indexOf(str.substr(i, 1)) >= 0) return false;
    }
    return true;
}

//only a~z and A~Z and 0~9 and . is allowed
function isValidFileName(s)
{
    var i;
    for (i = 0; i < s.length; i++)
    {
        var c = s.charAt(i);       
        if (c != ".")
        {
            if ((c < "0") || (c > "9" && c < "A") || ( c > "Z" && c < "a") || ( c > "z"))
            {
                return false;
            }
        }
    }
    return true;
}

//only 0~9 and . is allowed
function isValidIP(s)
{
    var i;
    var dotCount=0;
    var dot1=0,dot2=0,dot3=0;
    var str1="",str2="",str3="",str4="";
    for (i = 0; i < s.length; i++)
    {
        var c = s.charAt(i);       
        if (c != ".")
        {
            if ((c < "0") || (c > "9"))
            {
                return false;
            }
        }else{
        	dotCount=dotCount+1;
            if(dotCount == 1) dot1=i;
            else if(dotCount == 2) dot2=i;
            else if(dotCount == 3) dot3=i;        	
        }
    }
    if(dotCount!=3) return false;
    str1=s.substring(0,dot1);
    str2=s.substring(dot1+1,dot2);
    str3=s.substring(dot2+1,dot3);
    str4=s.substring(dot3+1); 
    
    if((str1<0) || (str1>255)
       ||(str2<0) || (str2>255)
       ||(str3<0) || (str3>255)
       ||(str4<0) || (str4>255))
       return false;
    
    return true;
}

//check version:number ######.######
function isValidVersion(s)
{
    var i;
    var dot;
    dot=0;
    var int_part;
    var dec_part;
    int_part=0;
    dec_part=0;
    for (i = 0; i < s.length; i++)
    {
        var c = s.charAt(i);       
        if (c != ".")
        {
            if ((c < "0") || (c > "9"))
            {
                return false;
            }
            if(dot == 0) int_part=int_part+1;
            else if(dot == 1) dec_part=dec_part+1;
        }
        else dot=dot+1;
        if(dot > 1) return false;
    }
    if((int_part > 3) || (dec_part > 3)) return false;
    return true;
}

//get the sub string following the char lastly showed
function getSubStrFollowLastChar(str,ch)
{
    var i;
    var count;
    count=0;
    var rst="";
    for (i = 0; i < str.length; i++)
    {
        var c = str.charAt(i);       
        if (c == ch)
        {
             count++;
             rst="";
        }
        else if(count >= 1) rst=rst+c;
    }
    return rst;
}

// get file name subffix
function getSubffix(filename)
{
    var str=getSubStrFollowLastChar(filename,".");
    if((str.indexOf("/") != -1) || (str.indexOf("\\") != -1)) str="";
    return str;
}

function filterSigVerInput(event){
	event.target.value = event.target.value.replace(/[^0-9\.\n]/g,"");
}

function filterFwVerInput(event){
	event.target.value = event.target.value.replace(/[^0-9\.\-\n]/g,"");
}


