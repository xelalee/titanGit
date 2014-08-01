/** 
* input field check
* select check
* 
*/

function inputChecker( id ) {

}

function selectChecker( id ) {

}

function popChecker( pid ) {

}

function formChecker( pid ) {
    tar = {};
    tar.pid = pid;
    tar.cols = [];
    tar.pass = true;
    switch( pid )
    {
// interface

// networking

// firewall

// security

// users

// objects

// device
    case 'administrator_settings':
        //tar.cols.push( { id: 'adminNewPwd', type: 'exists',  min: 1, max: 31, regex : /^[\x21\x23\x24\x26\x28-\x3E\x40-\x5F\x61-\x7E]{1,31}$/, pass: true } );
        tar.cols.push( { id: 'adminNewPwd', type: 'exists', length: { min: 1, max: 31 }, check: { id: 'adminName', type: 'regex', regex: /^[\x21\x23\x24\x26\x28-\x3E\x40-\x5F\x61-\x7E]{1,31}$/, pass: true }, pass: true } );
        tar.cols.push( { id: 'adminNewPwdConfirm', type: 'confirm', exists: 'adminNewPwd', pass: true } );
        tar.cols.push( { id: 'loginInactiveTimeout', type: 'range', min: 60, max: 1000, pass: true } );
        tar.cols.push( { id: 'loginSessionLimit', type: 'range', min: 60, max: 1000, pass: true } );
        tar.cols.push( { id: 'loginFailBlockMaxAttempts', type: 'range', min: 0, max: 1000, pass: true } );
        tar.cols.push( { id: 'loginFailBlockTime', type: 'range', min: 30, max: 3600, pass: true } );
        break;
    case 'management_settings':
        tar.cols.push( {id: 'httpsPort', type: 'range', min: 1, max: 65535, pass: true} );
        tar.cols.push( {id: 'sshPort', type: 'range', min: 1, max: 65535, pass: true} );
        break;
    case 'email_alert':
        tar.cols.push( { id: 'server', type: 'regexs', regexs: { ipaddr: { regex: /^((((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3})(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$/, pass: true}, domain : { regex: /[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/, min: 1, max: 63, pass: true } }, pass: true } );
        break;
    case 'log':
        tar.cols.push( { id: 'logDesc', type: 'length', min: 0, max: 127, pass: true } );
        break;
    case 'debug':
        tar.cols.push( { id: 'pcapDesc', type: 'length', min: 1, max: 127, pass: true } );
        tar.cols.push( { id: 'pcapIfName', type: 'select', value: '!NA', pass: true } );
        break;
    }

    return checkers( tar );
}
    
function checker( tar ) {

}

function checkers( tar ) {
// dealer
    for (var i=0, len=tar.cols.length; i<len; i++)
    {
       switch( tar.cols[ i ].type )
       {
       case 'confirm':
           if ( $('#' + tar.cols[ i ].exists).val().length > 0 ) {
               if ( $('#' + tar.cols[ i ].id).val() != $('#' + tar.cols[ i ].exists).val() ) {
                   tar.cols[ i ].pass = false;
                   tar.pass = false;
               }
           }
           break; 
       case 'exists':
           if ( $('#' + tar.cols[ i ].id).val().length > 0 ) {
               if ( tar.cols[ i ].regex ) {
                   if ( !tar.cols[ i ].regex.test( $('#' + tar.cols[ i ].id).val() ) ) {
                       tar.cols[ i ].pass = false;
                       tar.pass = false;
                   }
               } else if ( tar.cols[ i ].length ) {
                   if ( ( $('#' + tar.cols[ i ].id).val().length > tar.cols[ i ].max) || ( $('#' + tar.cols[ i ].id).val().length < tar.cols[ i ].min) ) {
                       tar.cols[ i ].pass = false;
                       tar.pass = false;
                   }
               } else {
                   if ( isNaN( parseInt( $('#' + tar.cols[ i ].id).val() ) ) || (parseInt( $('#' + tar.cols[ i ].id).val() ) > tar.cols[ i ].max) || (parseInt( $('#' + tar.cols[ i ].id).val() ) < tar.cols[ i ].min) ) {
                       tar.cols[ i ].pass = false;
                       tar.pass = false;
                   }
               }

               // specific field
               if (tar.pass && ( 'administrator_settings' == pid )) {
                   tar.setPassword = 1;
               }

               // if need check other field
               if ( tar.cols[ i ].check ) {
                   if ( 'regex' == tar.cols[ i ].check.type ) {
                       if ( !tar.cols[ i ].check.regex.test( $('#' + tar.cols[ i ].check.id).val() ) ) {
                           tar.cols[ i ].check.pass = false;
                           tar.pass = false;
                       }
                   }
               }
           }
           break; 
       case 'length':
           if ( ($('#' + tar.cols[ i ].id).val().length > tar.cols[ i ].max) || ($('#' + tar.cols[ i ].id).val().length < tar.cols[ i ].min) ) {
               tar.cols[ i ].pass = false;
               tar.pass = false;
           }
           break; 
       case 'range':
           if ( isNaN( parseInt( $('#' + tar.cols[ i ].id).val() ) ) || (parseInt( $('#' + tar.cols[ i ].id).val() ) > tar.cols[ i ].max) || (parseInt( $('#' + tar.cols[ i ].id).val() ) < tar.cols[ i ].min) ) {
               tar.cols[ i ].pass = false;
               tar.pass = false;
           }
           break; 
       case 'regex': 
           break; 
       case 'regexs': 
           if  ( tar.cols[ i ].regexs.ipaddr ) {
               if ( !tar.cols[ i ].regexs.ipaddr.regex.test( $('#' + tar.cols[ i ].id).val() ) ) {
                   tar.cols[ i ].regexs.ipaddr.pass = false;
               } else {
                   tar.cols[ i ].regexs.pass = true;
               } 
           }
           
           if  ( tar.cols[ i ].regexs.domain ) {
               if ( !tar.cols[ i ].regexs.domain.regex.test( $('#' + tar.cols[ i ].id).val() ) || ( $('#' + tar.cols[ i ] ).val().length < tar.cols[ i ].regexs.domain.min ) || ( $('#' + tar.cols[ i ] ).val().length > tar.cols[ i ].regexs.domain.max ) ) {
                   tar.cols[ i ].regexs.domain.pass = false;
               } else {
                   tar.cols[ i ].regexs.pass = true;
               } 
           }

           if (!tar.cols[ i ].regexs.pass)
               tar.pass = false;

           break; 
       case 'select':
           if ( ('!NA' == tar.cols[ i ].value) && ('NA' == $('#' + tar.cols[ i ].id).val()) ) {
               tar.cols[ i ].pass = false;
               tar.pass = false;
           }
           break; 
       }
    }

    return tar;
}

function callCheckers( pid ) {
    tar = {};
    tar.pid = pid;
    tar.cols = [];
    tar.pass = true;
    switch( pid )
    {
// interface

// networking

// firewall

// security

// users

// objects

// device
    case 'administrator_settings':
        //tar.cols.push( { id: 'adminNewPwd', type: 'exists',  min: 1, max: 31, regex : /^[\x21\x23\x24\x26\x28-\x3E\x40-\x5F\x61-\x7E]{1,31}$/, pass: true } );
        tar.cols.push( { id: 'adminNewPwd', type: 'exists', length: { min: 1, max: 31 }, check: { id: 'adminName', type: 'regex', regex: /^[\x21\x23\x24\x26\x28-\x3E\x40-\x5F\x61-\x7E]{1,31}$/, pass: true }, pass: true } );
        tar.cols.push( { id: 'adminNewPwdConfirm', type: 'confirm', exists: 'adminNewPwd', pass: true } );
        tar.cols.push( { id: 'loginInactiveTimeout', type: 'range', min: 60, max: 1000, pass: true } );
        tar.cols.push( { id: 'loginSessionLimit', type: 'range', min: 60, max: 1000, pass: true } );
        tar.cols.push( { id: 'loginFailBlockMaxAttempts', type: 'range', min: 0, max: 1000, pass: true } );
        tar.cols.push( { id: 'loginFailBlockTime', type: 'range', min: 30, max: 3600, pass: true } );
        break;
    case 'management_settings':
        tar.cols.push( {id: 'httpsPort', type: 'range', min: 1, max: 65535, pass: true} );
        tar.cols.push( {id: 'sshPort', type: 'range', min: 1, max: 65535, pass: true} );
        break;
    case 'email_alert':
        tar.cols.push( { id: 'server', type: 'regexs', regexs: { ipaddr: { regex: /^((((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3})(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$/, pass: true}, domain : { regex: /[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/, min: 1, max: 63, pass: true } }, pass: true } );
        break;
    case 'log':
        tar.cols.push( { id: 'logDesc', type: 'length', min: 0, max: 127, pass: true } );
        break;
    case 'debug':
        tar.cols.push( { id: 'pcapDesc', type: 'length', min: 1, max: 127, pass: true } );
        tar.cols.push( { id: 'pcapIfName', type: 'select', value: '!NA', pass: true } );
        break;
    }
    
// dealer
    for (var i=0, len=tar.cols.length; i<len; i++)
    {
       switch( tar.cols[ i ].type )
       {
       case 'confirm':
           if ( $('#' + tar.cols[ i ].exists).val().length > 0 ) {
               if ( $('#' + tar.cols[ i ].id).val() != $('#' + tar.cols[ i ].exists).val() ) {
                   tar.cols[ i ].pass = false;
                   tar.pass = false;
               }
           }
           break; 
       case 'exists':
           if ( $('#' + tar.cols[ i ].id).val().length > 0 ) {
               if ( tar.cols[ i ].regex ) {
                   if ( !tar.cols[ i ].regex.test( $('#' + tar.cols[ i ].id).val() ) ) {
                       tar.cols[ i ].pass = false;
                       tar.pass = false;
                   }
               } else if ( tar.cols[ i ].length ) {
                   if ( ( $('#' + tar.cols[ i ].id).val().length > tar.cols[ i ].max) || ( $('#' + tar.cols[ i ].id).val().length < tar.cols[ i ].min) ) {
                       tar.cols[ i ].pass = false;
                       tar.pass = false;
                   }
               } else {
                   if ( isNaN( parseInt( $('#' + tar.cols[ i ].id).val() ) ) || (parseInt( $('#' + tar.cols[ i ].id).val() ) > tar.cols[ i ].max) || (parseInt( $('#' + tar.cols[ i ].id).val() ) < tar.cols[ i ].min) ) {
                       tar.cols[ i ].pass = false;
                       tar.pass = false;
                   }
               }

               // specific field
               if (tar.pass && ( 'administrator_settings' == pid )) {
                   tar.setPassword = 1;
               }

               // if need check other field
               if ( tar.cols[ i ].check ) {
                   if ( 'regex' == tar.cols[ i ].check.type ) {
                       if ( !tar.cols[ i ].check.regex.test( $('#' + tar.cols[ i ].check.id).val() ) ) {
                           tar.cols[ i ].check.pass = false;
                           tar.pass = false;
                       }
                   }
               }
           }
           break; 
       case 'length':
           if ( ($('#' + tar.cols[ i ].id).val().length > tar.cols[ i ].max) || ($('#' + tar.cols[ i ].id).val().length < tar.cols[ i ].min) ) {
               tar.cols[ i ].pass = false;
               tar.pass = false;
           }
           break; 
       case 'range':
           if ( isNaN( parseInt( $('#' + tar.cols[ i ].id).val() ) ) || (parseInt( $('#' + tar.cols[ i ].id).val() ) > tar.cols[ i ].max) || (parseInt( $('#' + tar.cols[ i ].id).val() ) < tar.cols[ i ].min) ) {
               tar.cols[ i ].pass = false;
               tar.pass = false;
           }
           break; 
       case 'regex': 
           break; 
       case 'regexs': 
           if  ( tar.cols[ i ].regexs.ipaddr ) {
               if ( !tar.cols[ i ].regexs.ipaddr.regex.test( $('#' + tar.cols[ i ].id).val() ) ) {
                   tar.cols[ i ].regexs.ipaddr.pass = false;
               } else {
                   tar.cols[ i ].regexs.pass = true;
               } 
           }
           
           if  ( tar.cols[ i ].regexs.domain ) {
               if ( !tar.cols[ i ].regexs.domain.regex.test( $('#' + tar.cols[ i ].id).val() ) || ( $('#' + tar.cols[ i ] ).val().length < tar.cols[ i ].regexs.domain.min ) || ( $('#' + tar.cols[ i ] ).val().length > tar.cols[ i ].regexs.domain.max ) ) {
                   tar.cols[ i ].regexs.domain.pass = false;
               } else {
                   tar.cols[ i ].regexs.pass = true;
               } 
           }

           if (!tar.cols[ i ].regexs.pass)
               tar.pass = false;

           break; 
       case 'select':
           if ( ('!NA' == tar.cols[ i ].value) && ('NA' == $('#' + tar.cols[ i ].id).val()) ) {
               tar.cols[ i ].pass = false;
               tar.pass = false;
           }
           break; 
       }
    }

    return tar;
}
