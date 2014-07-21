/* obj */
function calcNWbits(_obj)
{
    sumofbits=0;
    tmpvar = parseInt(_obj.snm_1,10);
    if (isNaN(tmpvar)){
        _obj.result = 'invalid';
        return;
    }
    bitsfromleft=h_countbitsfromleft(tmpvar);
    if (isNaN(bitsfromleft)){
        _obj.result = 'invalid';
        return;
    }
    sumofbits+=bitsfromleft;
    //
    tmpvar = parseInt(_obj.snm_2,10);
    if (isNaN(tmpvar)){
        _obj.result = 'invalid';
        return;
    }
    bitsfromleft=h_countbitsfromleft(tmpvar);
    if (isNaN(bitsfromleft)){
        _obj.result = 'invalid';
        return;
    }
    sumofbits+=bitsfromleft;
    //
    tmpvar = parseInt(_obj.snm_3,10);
    if (isNaN(tmpvar)){
        _obj.result = 'invalid';
        return;
    }
    bitsfromleft=h_countbitsfromleft(tmpvar);
    if (isNaN(bitsfromleft)){
        _obj.result = 'invalid';
        return;
    }
    sumofbits+=bitsfromleft;
    //
    tmpvar = parseInt(_obj.snm_4,10);
    if (isNaN(tmpvar)){
        _obj.result = 'invalid';
        return;
    }
    bitsfromleft=h_countbitsfromleft(tmpvar);
    if (isNaN(bitsfromleft)){
        _obj.result = 'invalid';
        return;
    }
    sumofbits+=bitsfromleft;
    _obj.result = sumofbits;
}

function calcNWmask(_obj)
{
    tmpvar = parseInt(_obj.bits,10);
    if (isNaN(tmpvar) || tmpvar > 32 || tmpvar < 0){
        _obj.snm_1 = 'ERR';
        _obj.snm_2="";
        _obj.snm_3="";
        _obj.snm_4="";
        return(1);
    }
    _obj.snm_1=0;
    _obj.snm_2=0;
    _obj.snm_3=0;
    _obj.snm_4=0;
    if (tmpvar >= 8){
        _obj.snm_1 = 255;
        tmpvar-=8;
    }else{
        _obj.snm_1 = h_fillbitsfromleft(tmpvar);
        return(0);
    }
    if (tmpvar >= 8){
        _obj.snm_2 = 255;
        tmpvar-=8;
    }else{
        _obj.snm_2 = h_fillbitsfromleft(tmpvar);
        return(0);
    }
    if (tmpvar >= 8){
        _obj.snm_3 = 255;
        tmpvar-=8;
    }else{
        _obj.snm_3 = h_fillbitsfromleft(tmpvar);
        return(0);
    }
    _obj.snm_4 = h_fillbitsfromleft(tmpvar);
    return(0);
}

function calcNWmaskForm2(_obj)
{
    var rt=0;
    _obj.hex_1="";
    _obj.hex_2="";
    _obj.hex_3="";
    _obj.hex_4="";
    rt=calcNWmask(_obj);
    if (rt !=0 ){
        // error
        return(1);
    }
    tmpvar=_obj.snm_1;
    _obj.hex_1 = h_paddto2(h_from10toradix(tmpvar,16));
    tmpvar=_obj.snm_2;
    _obj.hex_2 = h_paddto2(h_from10toradix(tmpvar,16));
    tmpvar=_obj.snm_3;
    _obj.hex_3 = h_paddto2(h_from10toradix(tmpvar,16));
    tmpvar=_obj.snm_4;
    _obj.hex_4 = h_paddto2(h_from10toradix(tmpvar,16));

    return _obj;
}

function calcBinBits(_obj)
{
    _obj.bits_1="";
    _obj.bits_2="";
    _obj.bits_3="";
    _obj.bits_4="";
    //
    tmpvar = parseInt(_obj.ip_1,10);
    if (isNaN(tmpvar) || tmpvar < 0 || tmpvar > 255){
        _obj.bits_1 = 'ERR';
        return;
    }
    _obj.bits_1 = h_paddto8(h_from10toradix(tmpvar,2));
    _obj.hex_1 = h_paddto2(h_from10toradix(tmpvar,16));
    //
    tmpvar = parseInt(_obj.ip_2,10);
    if (isNaN(tmpvar) || tmpvar < 0 || tmpvar > 255){
        _obj.bits_2 = 'ERR';
        return;
    }
    _obj.bits_2 = h_paddto8(h_from10toradix(tmpvar,2));
    _obj.hex_2 = h_paddto2(h_from10toradix(tmpvar,16));
    //
    tmpvar = parseInt(_obj.ip_3,10);
    if (isNaN(tmpvar)    || tmpvar < 0 || tmpvar > 255){
        _obj.bits_3 = 'ERR';
        return;
    }
    _obj.bits_3 = h_paddto8(h_from10toradix(tmpvar,2));
    _obj.hex_3 = h_paddto2(h_from10toradix(tmpvar,16));
    //
    tmpvar = parseInt(_obj.ip_4,10);
    if (isNaN(tmpvar) || tmpvar < 0 || tmpvar > 255){
        _obj.bits_4 = 'ERR';
        return;
    }
    _obj.bits_4 = h_paddto8(h_from10toradix(tmpvar,2));
    _obj.hex_4 = h_paddto2(h_from10toradix(tmpvar,16));
    return _obj;
}

function calcNBFL(_obj) {
    var rt=0;
    tmpvar = parseInt(_obj.ip_1,10);
    if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0){
        _obj.numofaddr = 'ERR';
        return(1);
    }
    tmpvar = parseInt(_obj.ip_2,10);
    if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0){
        _obj.numofaddr = 'ERR';
        return(1);
    }
    tmpvar = parseInt(_obj.ip_3,10);
    if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0){
        _obj.numofaddr = 'ERR';
        return(1);
    }
    tmpvar = parseInt(_obj.ip_4,10);
    if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0){
        _obj.numofaddr = 'ERR';
        return(1);
    }
    rt=calcNWmask(_obj);
    if (rt !=0 ){
        // error
        return(1);
    }
    tmpvar=parseInt(_obj.bits,10);
    if (tmpvar <0){
        _obj.numofaddr = 'ERR';
        return(1);
    }
    if (tmpvar >32){
        _obj.numofaddr = 'ERR';
        return(1);
    }
    if (tmpvar == 31){
        _obj.numofaddr = "two";
        _obj.firstadr_1 = _obj.ip_1 & _obj.snm_1;
        _obj.firstadr_2 = _obj.ip_2 & _obj.snm_2;
        _obj.firstadr_3 = _obj.ip_3 & _obj.snm_3;
        _obj.firstadr_4 = _obj.ip_4 & _obj.snm_4;
        //
        _obj.lastadr_1 = _obj.ip_1 | (~ _obj.snm_1 & 0xff);
        _obj.lastadr_2 = _obj.ip_2 | (~ _obj.snm_2 & 0xff);
        _obj.lastadr_3 = _obj.ip_3 | (~ _obj.snm_3 & 0xff);
        _obj.lastadr_4 = _obj.ip_4 | (~ _obj.snm_4 & 0xff);
        return(1);
    }
    if (tmpvar == 32){
        _obj.numofaddr = "one";
        _obj.firstadr_1 = _obj.ip_1;
        _obj.firstadr_2 = _obj.ip_2;
        _obj.firstadr_3 = _obj.ip_3;
        _obj.firstadr_4 = _obj.ip_4;

        _obj.lastadr_1 =    _obj.firstadr_1;
        _obj.lastadr_2 =    _obj.firstadr_2;
        _obj.lastadr_3 =    _obj.firstadr_3;
        _obj.lastadr_4 =    _obj.firstadr_4;

        return(1);
    }
    _obj.numofaddr = Math.pow(2,32 - tmpvar) - 2;
    //
    _obj.bcast_1 = _obj.ip_1 | (~ _obj.snm_1 & 0xff);
    _obj.bcast_2 = _obj.ip_2 | (~ _obj.snm_2 & 0xff);
    _obj.bcast_3 = _obj.ip_3 | (~ _obj.snm_3 & 0xff);
    _obj.bcast_4 = _obj.ip_4 | (~ _obj.snm_4 & 0xff);
    //
    _obj.nwadr_1 = _obj.ip_1 & _obj.snm_1;
    _obj.nwadr_2 = _obj.ip_2 & _obj.snm_2;
    _obj.nwadr_3 = _obj.ip_3 & _obj.snm_3;
    _obj.nwadr_4 = _obj.ip_4 & _obj.snm_4;
    //
    _obj.firstadr_1 = _obj.nwadr_1;
    _obj.firstadr_2 = _obj.nwadr_2;
    _obj.firstadr_3 = _obj.nwadr_3;
    _obj.firstadr_4 = parseInt(_obj.nwadr_4) + 1;
    //
    _obj.lastadr_1 = _obj.bcast_1;
    _obj.lastadr_2 = _obj.bcast_2;
    _obj.lastadr_3 = _obj.bcast_3;
    _obj.lastadr_4 = parseInt(_obj.bcast_4) - 1;
    return(0);
}

function calcNeeded(_obj){
    tmpvar = parseInt(_obj.numofaddr,10);
    if (isNaN(tmpvar) || tmpvar > 0xfffffffe || tmpvar < 1){
        _obj.bits="ERR";
        _obj.snm_1="";
        _obj.snm_2="";
        _obj.snm_3="";
        _obj.snm_4="";
        _obj.maxaddr="";
        return;
    }
    expval=parseInt(Math.log(tmpvar)/Math.log(2)) + 1;
    maxaddrval=Math.pow(2,expval);
    if (maxaddrval - tmpvar < 2){
        expval+=1;
    }
    _obj.maxaddr= Math.pow(2,expval) - 2;
    _obj.bits=32 - expval;
    calcNWmask(_obj);
}

//--------------------------
function calcAmount(_obj){
    tmpvar = parseInt(_obj.bits,10);
    if (isNaN(tmpvar) || tmpvar > 30 || tmpvar < 0){
        _obj.numofaddr = 'ERR';
        _obj.maxaddr="";
        _obj.snm_1="";
        _obj.snm_2="";
        _obj.snm_3="";
        _obj.snm_4="";
        return;
    }
    _obj.maxaddr=Math.pow(2,32 - tmpvar);
    _obj.numofaddr=Math.pow(2,32 - tmpvar)- 2;
    calcNWmask(_obj);
}

function calcIpInvert(_obj){
    _obj.invert_1="";
    _obj.invert_2="";
    _obj.invert_3="";
    _obj.invert_4="";
    //
    tmpvar = parseInt(_obj.ip_1,10);
    if (isNaN(tmpvar) ){
        _obj.invert_1 = 'NaN';
        return;
    }
    _obj.invert_1 = 0xff & ~ tmpvar;
    //
    tmpvar = parseInt(_obj.ip_2,10);
    if (isNaN(tmpvar) ){
        _obj.invert_2 = 'NaN';
        return;
    }
    _obj.invert_2 = 0xff & ~ tmpvar;
    //
    tmpvar = parseInt(_obj.ip_3,10);
    if (isNaN(tmpvar) ){
        _obj.invert_3 = 'NaN';
        return;
    }
    _obj.invert_3 = 0xff & ~ tmpvar;
    //
    tmpvar = parseInt(_obj.ip_4,10);
    if (isNaN(tmpvar) ){
        _obj.invert_4 = 'NaN';
        return;
    }
    _obj.invert_4 = 0xff & ~ tmpvar;
}

function convertnum_hex(_obj){
    _obj.dec_1="";
    _obj.bin_1="";
    //
    tmpvar=_obj.num.replace(/0x/i,"");
    _obj.num=tmpvar;
    tmpvar = parseInt(_obj.num,16);
    if (isNaN(tmpvar) ){
        _obj.dec_1 = 'NaN';
        _obj.bin_1 = 'NaN';
        return;
    }
    _obj.dec_1 = tmpvar;
    _obj.bin_1 = h_from10toradix(tmpvar,2);
}

function convertnum_bin(_obj){
    _obj.dec_1="";
    _obj.hex_1="";
    //
    tmpvar = parseInt(_obj.num,2);
    if (isNaN(tmpvar) ){
        _obj.dec_1 = 'NaN';
        _obj.hex_1 = 'NaN';
        return;
    }
    _obj.dec_1 = tmpvar;
    _obj.hex_1 = h_from10toradix(tmpvar,16);
}

function convertnum_dec(_obj){
    _obj.bin_1="";
    _obj.hex_1="";
    //
    tmpvar = parseInt(_obj.num,10);
    if (isNaN(tmpvar) ){
        _obj.bin_1 = 'NaN';
        _obj.hex_1 = 'NaN';
        return;
    }
    _obj.hex_1 = h_from10toradix(tmpvar,16);
    _obj.bin_1 = h_from10toradix(tmpvar,2);
}

function dot2hex(_obj){
    _obj.ip_1="";
    _obj.ip_2="";
    _obj.ip_3="";
    _obj.ip_4="";
    _obj.bits_1="";
    _obj.bits_2="";
    _obj.bits_3="";
    _obj.bits_4="";
    tmpvar=_obj.hex.replace(/0x/i,"");
    _obj.hex=tmpvar.substr(0,8);
    //
    tmpvar = parseInt(tmpvar,16);
    if (isNaN(tmpvar)){
        _obj.ip_1 = 'ERR';
        return;
    }
    _obj.hex = h_paddto8(_obj.hex);
    _obj.ip_1 = parseInt(_obj.hex.substr(0,2),16);
    _obj.bits_1=h_paddto8(h_from10toradix(_obj.ip_1,2));
    _obj.ip_2 = parseInt(_obj.hex.substr(2,2),16);
    _obj.bits_2=h_paddto8(h_from10toradix(_obj.ip_2,2));
    _obj.ip_3 = parseInt(_obj.hex.substr(4,2),16);
    _obj.bits_3=h_paddto8(h_from10toradix(_obj.ip_3,2));
    _obj.ip_4 = parseInt(_obj.hex.substr(6,2),16);
    _obj.bits_4=h_paddto8(h_from10toradix(_obj.ip_4,2));
}

/* form use */
function h_initArray() {
    this.length = h_initArray.arguments.length;
    for (var i = 0; i < this.length; i++)
        this[i] = h_initArray.arguments[i];
}

function h_from10toradix(value,radix){
    var retval = '';
    var ConvArray = new h_initArray(0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F');
    var intnum;
    var tmpnum;
    var i = 0;

    intnum = parseInt(value,10);
    if (isNaN(intnum)){
        retval = 'NaN';
    }else{
        if (intnum < 1){
            retval ="0";
        }else{
            retval = "";
        }
        while (intnum > 0.9){
            i++;
            tmpnum = intnum;
            // cancatinate return string with new digit:
            retval = ConvArray[tmpnum % radix] + retval;
            intnum = Math.floor(tmpnum / radix);
            if (i > 100){
                // break infinite loops
                retval = 'NaN';
                break;
            }
        }
    }
    return retval;
}

function h_paddto2(str) {
    while(str.length <2){
        str= "0" + str;
    }
    return(str);
}

function h_paddto8(str) {
    while(str.length <8){
        str= "0" + str;
    }
    return(str);
}

//--------------------------

function h_countbitsfromleft(num)
{
    if (num == 255 ){
        return(8);
    }
    i = 0;
    bitpat=0xff00;
    while (i < 8){
        if (num == (bitpat & 0xff)){
            return(i);
        }
        bitpat=bitpat >> 1;
        i++;
    }
    return(Number.NaN);
}

//--------------------------

function h_fillbitsfromleft(num)
{
    if (num >= 8 ){
        return(255);
    }
    bitpat=0xff00;
    while (num > 0){
        bitpat=bitpat >> 1;
        num--;
    }
    return(bitpat & 0xff);
}

//--------------------------
function compareIf( ip1, ip2, mask )
{
    var arr1 = ip1.split('\.');
    var arr2 = ip2.split('\.');
    var arrm = mask.split('\.');

    var pass = true;
    for (var i=0; i<4; i++)
    {
        if ( (parseInt( arr1[ i ] ) & parseInt( arrm[ i ] )) != (parseInt( arr2[ i ] ) & parseInt( arrm[ i ] )) ) {
            pass = false;
        }
    }
    return pass;
}

