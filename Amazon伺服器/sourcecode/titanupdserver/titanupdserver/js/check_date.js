//版本不同於alex
/**
 *Error Code list
   1 => 您忘記輸入日期
   2 => 日期格式輸入錯誤!!(輸入的日期格式少於10碼)
   3 => 輸入的月份錯誤!!
   4 => 輸入的天數錯誤!!(EX: 1月只有31天,結果輸入32天)
   5 => 格式錯誤
**/

//檢查日期格式"01-JAN-2000"
function isReady(f_name)
{
	Months = new Array("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC");
  	DOMonth = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);     
  	lDOMonth = new Array(31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);    
  	var cal_value = DelSpace(f_name.input_date.value);       //更改input_date即可         
  	var cal_date = f_name.input_date;                        //更改input_date即可         
  	var day = "";
  	var month = "";
  	var year = "";
   
    var Check1="";
    var Check2="";
    
   	if(cal_value=="")//日期空白
      return 1;  
  
    if(cal_value.length < 10 || cal_value.length > 11) //日期長度不正確(= 10 or 11)
      return 2;
   

    if(cal_value.length ==11)// 長度11 格式01-JAN-2000
    {
    	day = cal_value.substr(0,2);
        month = (cal_value.substr(3,3)).toUpperCase();
        year = cal_value.substr(7,4);
        Check1=cal_value.substr(2,1);
        Check2=cal_value.substr(6,1);
    }
    else // 長度10 格式1-JAN-2000
    { 
     	day = cal_value.substr(0,1);
        month = (cal_value.substr(2,3)).toUpperCase();
        year = cal_value.substr(6,4);
        Check1=cal_value.substr(1,1);
        Check2=cal_value.substr(5,1);
    }
    
    if ( !(day > 0) )
    	return 5; 
    	
    if ( !(year > 0) )
    	return 5; 
        
    if ( Check1!="-" || Check2!="-" )//格式錯誤
    	return 5;    
    	
    var daysofmonth = get_daysofmonth(month,year);   
    
    if (daysofmonth == false)//月份錯誤
    	return 3;
       
    if ( day > daysofmonth )//當月日期錯誤
        return 4;      
 
    
    
       
    //正確
    return 0;
       
	function DelSpace(p_value)
	{
		if (p_value.length==0)
			return "";
		
		var newValue="";
		var front;
		var end;
	
		for (var i=0; i<p_value.length; i++)
			if (p_value.substr(i,1)!=' ')
			{
				front=i;
				break;
			}
	
		for (var j=(p_value.length-1); j>=0; j--)
			if (p_value.substr(j,1)!=' ')
			{
				end=j;
				break;
			}	
 		
 		newValue=p_value.substr(front,end-front+1);
		return newValue;
	}

  	function get_daysofmonth(monthNo,p_year)
  	{            
    	if ((eval(p_year)%4)==0)//閏月
    	{
       		if ( ((eval(p_year)%100)==0) && ((eval(p_year)%400)!= 0) )
         		return switch_type(month,DOMonth);           
         
         	return switch_type(month,lDOMonth);         
    	}
    	else
    	{
      		return switch_type(month,DOMonth);             
   	 	}
  	}   //function end
  
  
  	function switch_type(monthNo,TypeofMonth)
  	{
    	switch(monthNo)
    	{
        	case "JAN": 
            	return TypeofMonth[0];
                break;
            
            case "FEB":
                return TypeofMonth[1];
                break;
            
            case "MAR": 
                return TypeofMonth[2];
                break;
            
            case "APR": 
                return TypeofMonth[3];
                break;
            
            case "MAY": 
                return TypeofMonth[4];
                break;
            
            case "JUN": 
                return TypeofMonth[5];
                break;
             
            case "JUL": 
                return TypeofMonth[6];
                break;
                
            case "AUG": 
                return TypeofMonth[7];
                break;
                
            case "SEP": 
                return TypeofMonth[8];
                break;
                
            case "OCT": 
                return TypeofMonth[9];
                break;
                
            case "NOV": 
                return TypeofMonth[10];
                break;
                
            case "DEC": 
                return TypeofMonth[11];
                break;
                
            default : 
 	            return false;
                break;
    	}  //switch end
   }//end of function
     
}

function get_DateErr(err)
{
	switch (err)
	{
		case 1: return "您忘記輸入日期";
		case 2: return "Data Format is DD-MON-YYYY or D-MON-YYYY";
		case 3: return "輸入的月份錯誤!!";
		case 4: return "輸入的天數錯誤!!(EX: 1月只有31天,結果輸入32天)";
		case 5: return "日期格式輸入錯誤!!(EX: 01-jan-2000 or 1-jan-2000)";
	}
}

function FromToEnd(startDate,endDate)
{
    //日期前後檢查
    if(startDate.value.length == 11 )   
    {        
        strYear = startDate.value.substring(7,11);
        strMonth = startDate.value.substring(3,6);
        strDay = startDate.value.substring(0,2);
    }
    else
    {        
        strYear = startDate.value.substring(6,10);
        strMonth = startDate.value.substring(2,5);
        strDay = startDate.value.substring(0,1);
    }    
    var fromDate = new Date(strMonth+" " +strDay+", "+strYear);
    if(endDate.value.length == 11 ) 
    {
        strYear = endDate.value.substring(7,11);
        strMonth = endDate.value.substring(3,6);
        strDay = endDate.value.substring(0,2);
    }
    else
    {
        strYear = endDate.value.substring(6,10);
        strMonth = endDate.value.substring(2,5);
        strDay = endDate.value.substring(0,1);
    }
    var toDate = new Date(strMonth+" " +strDay+", "+strYear);  
 
    if( toDate.getTime() < fromDate.getTime() )
        return false;
    else
    	return true;
        
}
  
function DelSpace(p_value)
{
	if (p_value.length==0)
		return "";
	var newValue="";
	var front;
	var end;
	for (var i=0; i<p_value.length; i++)
		if (p_value.substr(i,1)!=' ')
		{
			//alert("sd");
			front=i;
			break;
		}
	for (var j=(p_value.length-1); j>=0; j--)
		if (p_value.substr(j,1)!=' ')
		{
			end=j;
			break;
		}	
 	newValue=p_value.substr(front,end-front+1);
	return newValue;
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
