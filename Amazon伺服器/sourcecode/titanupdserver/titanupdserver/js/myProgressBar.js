var startTime;

function showProgressBar(){

	var myDate = new Date();
	startTime = myDate.getTime();	
	
    $("div#progressbar").show();
    window.setTimeout("getProgressBar()", 1000);
}

function getProgressBar() {
	var timestamp = (new Date()).valueOf();
	var percent;
	$.getJSON("/upd/uploadstatus", {"t":timestamp}, function (json) {

		var bytesRead = json.pBytesRead;
		var contentLength = json.pContentLength;
		
		var kbRead = format_number(bytesRead/1000, 1);
		var kbContentLength = format_number(contentLength/1000, 1);
		
		var pastTimeBySec = (new Date().getTime() - startTime) / 1000;
		var sp = (bytesRead/1000) / pastTimeBySec;
		var speed = format_number(sp, 1);
		
		percent = json.percent;
		$( "div#progressbar" ).progressbar({
			value: percent
		});
		
		$("div#info").html("Upload Speed: " + speed + "KB/Sec, Uploaded: " + kbRead + "/" + kbContentLength + "KB. Percent: "+percent+"%");

		if(bytesRead==contentLength){
			window.clearTimeout(interval);		
			$("div#info").html("Upload Complete!");
		}
	});
	var interval = window.setTimeout("getProgressBar()", 1000);
}

function format_number(pnumber,decimals){
    if (isNaN(pnumber)) { return 0};
    if (pnumber=='') { return 0};
     
    var snum = new String(pnumber);
    var sec = snum.split('.');
    var whole = parseFloat(sec[0]);
    var result = '';
     
    if(sec.length > 1){
        var dec = new String(sec[1]);
        dec = String(parseFloat(sec[1])/Math.pow(10,(dec.length - decimals)));
        dec = String(whole + Math.round(parseFloat(dec))/Math.pow(10,decimals));
        var dot = dec.indexOf('.');
        if(dot == -1){
            dec += '.';
            dot = dec.indexOf('.');
        }
        while(dec.length <= dot + decimals) { dec += '0'; }
        result = dec;
    } else{
        var dot;
        var dec = new String(whole);
        dec += '.';
        dot = dec.indexOf('.');    
        while(dec.length <= dot + decimals) { dec += '0'; }
        result = dec;
    }  
    return result;
}