<?php
    // prepare pdf lib
    require('assets/fpdf17/fpdf.php');
    // get guiIndex
    $guiIndex = shell_exec( 'php guiIndex.php' );
    // get config
    $json = json_decode(file_get_contents('lang/config.txt', true));

class PDF extends FPDF
{
    function Header() {
        $this->Image('css/images/bg_logo'. $GLOBALS[ 'json' ]->config->version->$GLOBALS[ 'guiIndex' ]->aka  .'.jpg', -100, 0, 800);
    }

    function LoadWeekly() {
        return shell_exec( 'php advancedQuery.php weekly' );
    }

    function CoverTitle( $title, $subject ) {
        $this->AddPage();
        $this->SetFont('Arial','B',16);
        // Title
        $this->Cell(550,500,$title,0,0,'C');
        // Line break
        $this->Ln(20);
        $this->SetFont('Arial','',10);
        // Title
        $this->Cell(550,580,$subject,0,0,'C');
        // Line break
        $this->Ln(20);
    }

    function printSection( $title, $rows, $data, $flag ) {
        // add new page for each secion
        $this->AddPage();
        $this->SetFont('Arial','B',14);
        // Title
        $this->Cell(550,100,$title,0,0,'C');
        // Line break
        $this->Ln(20);

        if ($rows > 0) {
            if ($rows > 10) {
                // get top 10
                $rows = 10;
            }
            $counts = 0;
            for ($i=0; $i<$rows; $i++)
            {
                $counts += $data[ $i ][ 'hitCount' ];
            }
            // draw table
            $this->SectionTable( $counts, $rows, $data, $flag );
        }
    }

    function SectionChart( $counts, $rows, $data, $flag, $key ) {
        // color set
        $rgbs  = array(
            0 => array(r=>82, g=>90, b=>107),
            1 => array(r=>189, g=>33, b=>16),
            2 => array(r=>231, g=>189, b=>16),
            3 => array(r=>99, g=>148, b=>41),
            4 => array(r=>156, g=>82, b=>173),

            5 => array(r=>206, g=>198, b=>198),
            6 => array(r=>165, g=>132, b=>132),
            7 => array(r=>181, g=>181, b=>181),
            8 => array(r=>49, g=>49, b=>49),
            9 => array(r=>8, g=>90, b=>156)
        );
        // set y to draw boundary
        $this->SetY( 100 );

        $this->SetFillColor( 255, 255, 255 );
        $this->Cell( 540, 400, '', 1, 0, 'C', true );

        // draw chart
        switch( $flag )
        {
        case 'topProtocol':
            // draw pie chart
            // set xy
            $xc=350;
            $yc=300;
            $r=180;
            $sd = 0;
            $ed = 0;

            for ($i=0; $i<$rows; $i++)
            {
                $j = $i+1;
                $ed = 360 * ( $data[ $i ][ 'hitCount' ]/$counts );
                $this->SetFillColor( $rgbs[ $i ][ 'r' ], $rgbs[ $i ][ 'g' ], $rgbs[ $i ][ 'b' ] );
                $this->Rect( 40, ( 180 + $i*25 ), 20, 20, 'DF' );
                $this->SetXY( 60, ( 180 + $i*25 ) );
                $this->SetFont('Arial','',10);
                $this->Cell( 20, 20, $data[ $i ][ $key ], 0, 0, 'L' );
                $this->Ln();

                if ($j == $rows) {
                    $this->Sector($xc, $yc, $r, $sd, 0, 'F');
                } else {
                    $this->Sector($xc, $yc, $r, $sd, $sd + $ed, 'F');
                    $sd += $ed;
                }
            }
            break;
        default:
            // set xy
            $this->SetXY( 30, 105 );
            $this->SetFont('Arial','',12);
            $ruler = $data[ 0 ][ 'hitCount' ];
            for ($i=0; $i<$rows; $i++)
            {
                $this->Cell( 500, 20, $data[ $i ][ $key ] .' : '. $data[ $i ][ 'hitCount' ], 0, 0, 'L' );
                $this->Ln();
                $this->SetFillColor( $rgbs[ $i ][ 'r' ], $rgbs[ $i ][ 'g' ], $rgbs[ $i ][ 'b' ] );
                $this->Cell( (540 * $data[ $i ][ 'hitCount' ]/$ruler), 10, '', 0, 1, 'L', true );
                $this->Ln();
            }
        }
    }

    function Sector($xc, $yc, $r, $a, $b, $style='FD', $cw=true, $o=90)
    {
        if($cw){
            $d = $b;
            $b = $o - $a;
            $a = $o - $d;
        }else{
            $b += $o;
            $a += $o;
        }
        $a = ($a%360)+360;
        $b = ($b%360)+360;
        if ($a > $b)
            $b +=360;
        $b = $b/360*2*M_PI;
        $a = $a/360*2*M_PI;
        $d = $b-$a;
        if ($d == 0 )
            $d =2*M_PI;
        $k = $this->k;
        $hp = $this->h;
        if ($style=='F')
            $op='f';
        elseif ($style=='FD' or $style=='DF')
            $op='b';
        else
            $op='s';
        if (sin($d/2))
            $MyArc = 4/3*(1-cos($d/2))/sin($d/2)*$r;
        //first put the center
        $this->_out(sprintf('%.2f %.2f m', ($xc)*$k, ($hp-$yc)*$k));
        //put the first point
        $this->_out(sprintf('%.2f %.2f l', ($xc+$r*cos($a))*$k, (($hp-($yc-$r*sin($a)))*$k)));
        //draw the arc
        if ($d < M_PI/2){
            $this->_Arc($xc+$r*cos($a)+$MyArc*cos(M_PI/2+$a),
                        $yc-$r*sin($a)-$MyArc*sin(M_PI/2+$a),
                        $xc+$r*cos($b)+$MyArc*cos($b-M_PI/2),
                        $yc-$r*sin($b)-$MyArc*sin($b-M_PI/2),
                        $xc+$r*cos($b),
                        $yc-$r*sin($b)
                        );
        }else{
            $b = $a + $d/4;
            $MyArc = 4/3*(1-cos($d/8))/sin($d/8)*$r;
            $this->_Arc($xc+$r*cos($a)+$MyArc*cos(M_PI/2+$a),
                        $yc-$r*sin($a)-$MyArc*sin(M_PI/2+$a),
                        $xc+$r*cos($b)+$MyArc*cos($b-M_PI/2),
                        $yc-$r*sin($b)-$MyArc*sin($b-M_PI/2),
                        $xc+$r*cos($b),
                        $yc-$r*sin($b)
                        );
            $a = $b;
            $b = $a + $d/4;
            $this->_Arc($xc+$r*cos($a)+$MyArc*cos(M_PI/2+$a),
                        $yc-$r*sin($a)-$MyArc*sin(M_PI/2+$a),
                        $xc+$r*cos($b)+$MyArc*cos($b-M_PI/2),
                        $yc-$r*sin($b)-$MyArc*sin($b-M_PI/2),
                        $xc+$r*cos($b),
                        $yc-$r*sin($b)
                        );
            $a = $b;
            $b = $a + $d/4;
            $this->_Arc($xc+$r*cos($a)+$MyArc*cos(M_PI/2+$a),
                        $yc-$r*sin($a)-$MyArc*sin(M_PI/2+$a),
                        $xc+$r*cos($b)+$MyArc*cos($b-M_PI/2),
                        $yc-$r*sin($b)-$MyArc*sin($b-M_PI/2),
                        $xc+$r*cos($b),
                        $yc-$r*sin($b)
                        );
            $a = $b;
            $b = $a + $d/4;
            $this->_Arc($xc+$r*cos($a)+$MyArc*cos(M_PI/2+$a),
                        $yc-$r*sin($a)-$MyArc*sin(M_PI/2+$a),
                        $xc+$r*cos($b)+$MyArc*cos($b-M_PI/2),
                        $yc-$r*sin($b)-$MyArc*sin($b-M_PI/2),
                        $xc+$r*cos($b),
                        $yc-$r*sin($b)
                        );
        }
        //terminate drawing
        $this->_out($op);
    }

    function _Arc($x1,  $y1,  $x2,  $y2,  $x3,  $y3 )
    {
        $h = $this->h;
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c',
            $x1*$this->k,
            ($h-$y1)*$this->k,
            $x2*$this->k,
            ($h-$y2)*$this->k,
            $x3*$this->k,
            ($h-$y3)*$this->k));
    }

    function SectionTable( $counts, $rows, $data, $flag ) {
        // set y
        $this->SetY( 550 );
        // sum hit counts
        $header = '';
        $key = '';

        switch( $flag )
        {
        case  'topSrcIp':
            $key = 'srcIp';
            $header = 'Source IP';
            break;
        case 'topDstIp':
            $key = 'dstIp';
            $header = 'Destination IP';
            break;
        case 'topVirusName':
            $key = 'virusName';
            $header = 'Virus Name';
            break;
        case 'topProtocol':
            $key = 'protocol';
            $header = 'Protocol';
            break;
        }

        $this->Cell( 300, 20, $header, 1, 0, 'C' );
        $this->Cell( 120, 20, 'Hit Count', 1, 0, 'C' );
        $this->Cell( 120, 20, 'Percentage', 1, 0, 'C' );
        $this->Ln();
        for ($i=0; $i<$rows; $i++)
        {
            $this->Cell( 300, 20, $data[ $i ][ $key ], 1, 0, 'L' );
            $this->Cell( 120, 20, $data[ $i ][ 'hitCount' ], 1, 0, 'C' );
            $this->Cell( 120, 20, sprintf("%01.2f", ( 100 * $data[ $i ][ 'hitCount' ] / $counts ) ) .'%', 1, 0, 'C' );
            $this->Ln();
        }
        // Closing line
        $this->Cell(520,0,'','T');
        // draw chart
        $this->SectionChart( $counts, $rows, $data, $flag, $key );
    }

    function Footer() {
        // Position at 20 pt from bottom
        $this->SetY(-30);
        // Arial italic 8
        $this->SetFont('Arial','I',8);
        // Page number
        $this->Cell(0,10,'Page '.$this->PageNo().'/{nb}',0,0,'C');
    }
}

    // output pdf
    if ($argv[ 1 ]) {
        // declair new pdf
        $pdf = new PDF("P", "pt", "A4");
        // get data
        $data = json_decode( $pdf->LoadWeekly(), true );
        // add page counts
        $pdf->AliasNbPages();
        // weekly start
        $pdf->CoverTitle('Weekly Report', 'Date : '. $data[ 'sd' ] .'~'. $data[ 'ed' ]);
        $pdf->printSection('Top Source IP', $data[ 'topSrcIp' ][ 'queryRows' ], $data[ 'topSrcIp' ][ 'queryResults' ], 'topSrcIp');
        $pdf->printSection('Top Destination IP', $data[ 'topDstIp' ][ 'queryRows' ], $data[ 'topDstIp' ][ 'queryResults' ], 'topDstIp');
        $pdf->printSection('Top Virus Name', $data[ 'topVirusName' ][ 'queryRows' ], $data[ 'topVirusName' ][ 'queryResults' ], 'topVirusName');
        $pdf->printSection('Top Protocol', $data[ 'topProtocol' ][ 'queryRows' ], $data[ 'topProtocol' ][ 'queryResults' ], 'topProtocol');
        // weekly end
        $pdf->Output( $argv[ 1 ] );
        print_r( 0 );
    } elseif ( $_GET[ 'param' ] ) {
        if ($_GET[ 'r' ]) {

        } else {
echo $_GET[ 'param' ] ;
            switch( $_GET[ 'param' ] )
            {
            case 'traffic_direction':
                break;
            case 'file_extension':
                break;
            case 'blocked_host':
                break;
            case 'affected_host':
                break;
            case 'antivirus_report':
                break;
            }

        }
    } else {
        // declair new pdf
        $pdf = new PDF("P", "pt", "A4");
        // get data
        $data = json_decode( $pdf->LoadWeekly(), true );
        // add page counts
        $pdf->AliasNbPages();
        // weekly start
        $pdf->CoverTitle('Weekly Report', 'Date : '. $data[ 'sd' ] .'~'. $data[ 'ed' ]);
        $pdf->printSection('Top Source IP', $data[ 'topSrcIp' ][ 'queryRows' ], $data[ 'topSrcIp' ][ 'queryResults' ], 'topSrcIp');
        $pdf->printSection('Top Destination IP', $data[ 'topDstIp' ][ 'queryRows' ], $data[ 'topDstIp' ][ 'queryResults' ], 'topDstIp');
        $pdf->printSection('Top Virus Name', $data[ 'topVirusName' ][ 'queryRows' ], $data[ 'topVirusName' ][ 'queryResults' ], 'topVirusName');
        $pdf->printSection('Top Protocol', $data[ 'topProtocol' ][ 'queryRows' ], $data[ 'topProtocol' ][ 'queryResults' ], 'topProtocol');
        // weekly end
        $pdf->Output();
    }
?>
