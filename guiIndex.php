<?php
    $infos =  explode( "\n", shell_exec("classReq sys show") );

    foreach( $infos as $val )
    {
        if ( preg_match('/^(guiIndex):(\d)$/', $val, $matches ) ) {
            print_r( $matches[ 2 ] );
        }
    }
?>
