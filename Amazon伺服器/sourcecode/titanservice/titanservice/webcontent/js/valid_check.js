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
                alert("Invalid character '" + c + "' found!");
                return false;
            }
        }
    }
    return true;
}