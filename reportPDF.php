<?php
    // prepare pdf lib
    require('assets/fpdf17/fpdf.php');
    // get guiIndex
    ob_start();
    require('guiIndex.php');
    $guiIndex = ob_get_clean(); 

    $aks = ( 1 == $guiIndex )? 'K' : ( ( 2 == $guiIndex )? 'CN' : '');

class PDF extends FPDF 
{
    function Header() {
        $this->Image('css/images/bg_upper_06'. $GLOBALS[ 'aka' ] .'.jpg', -100, 0, 800);
    }

    function LoadData() {

    }

    function Footer() {
        // Position at 20 pt from bottom
        $this->SetY(-20);
        // Arial italic 8
        $this->SetFont('Arial','I',8);
        // Page number
        $this->Cell(0,10,'Page '.$this->PageNo().'/{nb}',0,0,'C');
    }
}

    $pdf = new PDF("P", "pt", "A4");
    $pdf->AliasNbPages();
    $pdf->AddPage();
    $pdf->Output();

?>
