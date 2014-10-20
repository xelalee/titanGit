<?php
    // prepare pdf lib
    require('assets/fpdf17/fpdf.php');
    // get guiIndex
    ob_start();
    require('guiIndex.php');
    $guiIndex = ob_get_clean(); 

    $aka = ( 1 == $guiIndex )? 'K' : ( ( 2 == $guiIndex )? 'CN' : '');

    //  print_r( $data );
class PDF extends FPDF 
{
    function Header() {
        $this->Image('css/images/bg_upper_06'. $GLOBALS[ 'aka' ] .'.jpg', -100, 0, 800);
    }

    function LoadData() {
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

    function SectionChart(  $rows, $data, $flag, $key ) {
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
        // set y
        $this->SetY( 100 );

        // draw bonderary
        $this->SetFillColor( 255, 255, 255 );
        $this->Cell( 540, 400, '', 1, 0, 'C', true );

        // set xy
        $this->SetXY( 30, 105 );
        // draw data
        
        $this->SetFont('Arial','',12);
        for ($i=0; $i<$rows; $i++)
        {
            if ( 0 == $i) {
                $ruler = $data[ $i ][ 'hitCount' ];
            }
            $this->Cell( 500, 20, $data[ $i ][ $key ] .' : '. $data[ $i ][ 'hitCount' ], 0, 0, 'L' );
            $this->Ln();
            $this->SetFillColor( $rgbs[ $i ][ 'r' ], $rgbs[ $i ][ 'g' ], $rgbs[ $i ][ 'b' ] );
            $this->Cell( (540 * $data[ $i ][ 'hitCount' ]/$ruler), 10, '', 0, 1, 'L', true );
            $this->Ln();
        }
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
        $this->SectionChart( $rows, $data, $flag, $key );
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

    // declair new pdf
    $pdf = new PDF("P", "pt", "A4");
    // get data
    $data = json_decode( $pdf->LoadData(), true );
    // add page counts
    $pdf->AliasNbPages();

    // custom start
    $pdf->CoverTitle('Weekly Report', 'Date : '. $data[ 'sd' ] .'~'. $data[ 'ed' ]);

    $pdf->printSection('Top Source IP', $data[ 'topSrcIp' ][ 'queryRows' ], $data[ 'topSrcIp' ][ 'queryResults' ], 'topSrcIp');
    $pdf->printSection('Top Destination IP', $data[ 'topDstIp' ][ 'queryRows' ], $data[ 'topDstIp' ][ 'queryResults' ], 'topDstIp');
    $pdf->printSection('Top Virus Name', $data[ 'topVirusName' ][ 'queryRows' ], $data[ 'topVirusName' ][ 'queryResults' ], 'topVirusName');
    $pdf->printSection('Top Protocol', $data[ 'topProtocol' ][ 'queryRows' ], $data[ 'topProtocol' ][ 'queryResults' ], 'topProtocol');
    
    // custom end

    // output pdf
    $pdf->Output();
    //$pdf->Output('weekly.pdf');

?>
