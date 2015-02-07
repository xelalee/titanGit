create database rgst;

use rgst;

create user register identified by 'TiTanReg';

grant all on rgst.* to register;