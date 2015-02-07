create database titan;

use titan;

create user updserver identified by 'TiTanUpd';

grant all on titan.* to updserver;