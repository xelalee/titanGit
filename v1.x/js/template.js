/**
* 
*
*
*/

function getTemplate( tar ) {
    var tmp;
    switch( tar.tag )
    {
    case 'div':
        tmp = '<div';

        if (tar.id)
            tmp += ' id="' + tar.id + '"';

        if (tar.class)
            tmp += ' class="' + tar.class + '"';

        tmp += '>';
        tmp += '</div>';
        break;
    case 'table':
        tmp = '<table';

        if (tar.id)
            tmp += ' id="' + tar.id + '"';

        if (tar.class)
            tmp += ' class="' + tar.class + '"';

        tmp += '>';

        if (tar.caption)
            tmp += '<caption>' + tar.label + '</caption>';

        tmp += '<thead></thead>';
        tmp += '<tbody></tbody>';
        tmp += '<tfoot></tfoot>';
        tmp += '</table>';
        break;
    case 'tr':
    case 'th':
    case 'td':
        tmp += '<' + tar.tag;

        if (tar.id)
            tmp += ' id="' + tar.id + '"';
        
        if (tar.class)
            tmp += ' class="' + tar.class + '"';

        if (tar.style)
            tmp += ' style="' + tar.style + '"';

        tmp += '>';
        tmp += '</' + tar.tag + '>';
        break;
    case 'select':
        tmp = '<select id="' + tar.id + '"';

        if (tar.class)
            tmp += 'class="' + tar.class + '"';

        if (tar.multiple)
            tmp += 'multiple';

        tmp += '></select>';
        break;
    case 'input':
        tmp = '<input type="' + tar.type + '" id="' + tar.id + '"';

        if (tar.class)
            tmp += ' class="' + tar.class + '"';

        if (tar.size)
            tmp += ' size="' + tar.size + '"';

        if (tar.value)
            tmp += ' value="' + tar.value + '"';

        if (tar.readonly)
            tmp += ' readonly';

        tmp += '/>';
        break;
    case 'label':
        tmp = '<label for="' + tar.id + '">' + tar.label + '</label>';
        break;
    case 'button':
        tmp = '<button id="' + tar.id + '" class="' + tar.class + '" title="' + tar.title + '"><span class="ui-icon"></span></button>';
        break;
    }
    return tmp;
}

function setTemplate( tar ) {
    switch( tar.pid )
    {
    case 'wtf':
        break;
    }
}

