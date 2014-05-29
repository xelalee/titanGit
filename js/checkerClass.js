/** 
* input field check
* select check
* 
*/

function callChecker( pid, id ) {
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

        break;
    }
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
        tar.cols.push( { id: 'adminNewPwd', type: 'exists',  min: 1, max: 31, 'regex' : /^[\x21\x23\x24\x26\x28-\x3E\x40-\x5F\x61-\x7E]{1,31}$/, pass: true } );
        tar.cols.push( { id: 'adminNewPwdConfirm', type: 'confirm', 'exists': 'adminNewPwd', pass: true } );
        tar.cols.push( { id: 'loginInactiveTimeout', type: 'range', min: 60, max: 1000, pass: true } );
        tar.cols.push( { id: 'loginSessionLimit', type: 'range', min: 60, max: 1000, pass: true } );
        tar.cols.push( { id: 'loginFailBlockMaxAttempts', type: 'range', min: 0, max: 1000, pass: true } );
        tar.cols.push( { id: 'loginFailBlockTime', type: 'range', min: 30, max: 3600, pass: true } );
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
               } else if ( tar.cols[ i ].range ) {
                   if ( isNaN( parseInt( $('#' + tar.cols[ i ].id).val() ) ) || (parseInt( $('#' + tar.cols[ i ].id).val() ) > tar.cols[ i ].max) || (parseInt( $('#' + tar.cols[ i ].id).val() ) < tar.cols[ i ].min) ) {
                       tar.cols[ i ].pass = false;
                       tar.pass = false;
                   }
               }

               // specific field
               if (tar.pass && ( 'administrator_settings' == pid )) {
                   tar.setPassword = 1;
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
