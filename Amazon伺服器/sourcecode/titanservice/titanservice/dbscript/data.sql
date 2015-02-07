DELETE FROM ADMINISTRATOR;
DELETE FROM FUNCTION;
DELETE FROM FUNCTION2GROUP_NAME;
DELETE FROM GROUP_NAME;
DELETE FROM MENU;
DELETE FROM SERVICE;
DELETE FROM SKU;
DELETE FROM COUNTRY_CODE;

INSERT INTO ADMINISTRATOR VALUES (1, 'admin', '35E872B4BB5CFC20', 'jacky.gu@titan-arc.com', 1);

INSERT INTO MENU(MENU_ID,MENU_NAME,URL,SORT_ID) VALUES 
  (1, 'Account Management', '', '010'),
  (2, 'Product Management', '', '020'),
  (3, 'Service Management', '', '030');
 
DELETE FROM FUNCTION;
INSERT INTO FUNCTION(FUNCTION_ID,MENU_ID,FUNCTION_NAME,URL,SORT_ID) VALUES 
  (1, 1, 'Account', '/jsp/admin/account/account_list.jsp', '010'),
  (2, 2, 'Import MAC', '/jsp/admin/product/importMAC.jsp', '020'),
  (3, 3, 'Generate License Key', '/jsp/admin/service/generateLK.jsp', '030'),
  (4, 3, 'Query X', '/jsp/admin/service/queryX.jsp', '031'),
  (5, 3, 'Service Reset', '/jsp/admin/service/serviceReset.jsp', '032'),
  (6, 1, 'Group', '/jsp/admin/account/group_list.jsp', '011'),
  
  (7, 2, 'Query MAC', '/jsp/admin/product/queryMAC.jsp', '021');

DELETE FROM FUNCTION2GROUP_NAME;  
INSERT INTO FUNCTION2GROUP_NAME(FUNCTION_ID,GROUP_ID) VALUES 
  (1, 1), 
  (2, 1),
  (3, 1),
  (4, 1),
  (5, 1),
  (6, 1),
  (7, 1);
 
INSERT INTO GROUP_NAME(GROUP_ID,GROUP_NAME) VALUES (1, 'Administrator');

INSERT INTO MODEL (MODEL_ID, MODEL_NAME, CARD_TYPE) VALUES 
  (8001, 'TW-25', 'TW-25');
  
commit;

DELETE FROM MODEL2SERVICE;
INSERT INTO MODEL2SERVICE (MODEL_ID, SERVICE_TYPE_ID, SERVICE_CODE, SERVICE_ID) VALUES 
  (8001, 'T', 'TAV001', 1),
  (8001, 'T', 'TAV000', 1),
  (8001, 'S', 'TAV000', 1),
  (8001, 'S', 'NAV001', 1),
  (8001, 'S', 'TAV001', 1),
  (8001, 'S', 'TAV002', 1),
  (8001, 'S', 'TAV003', 1),
  (8001, 'T', 'TID001', 2),
  (8001, 'S', 'TID001', 2),
  (8001, 'S', 'TID002', 2);  
  

commit;

DELETE FROM SERVICE;
INSERT INTO SERVICE
   (SERVICE_ID, SERVICE_NAME, SERVICE_SHORT_NAME, TRIAL2STD_EXTRA)
 VALUES
   (1, 'Titan Anti Virus', 'AV', 0),
   (2, 'Titan IDP', 'IDP', 0);   
commit;
   
DELETE FROM SKU; 
INSERT INTO SKU
   (SERVICE_TYPE_ID, SERVICE_CODE, ATTRIBUTE, ATTRIBUTE_TYPE, VALUE)
 VALUES
   ('T', 'TAV001', 'TAVT', 'date', '30'),
   ('T', 'TAV000', 'TAVT', 'date', '1'),
   ('S', 'TAV000', 'TAVS', 'date', '1'),
   ('S', 'NAV001', 'TAVS', 'date', '30'),
   ('S', 'TAV001', 'TAVS', 'date', '366'),
   ('S', 'TAV002', 'TAVS', 'date', '731'),
   ('S', 'TAV003', 'TAVS', 'date', '1097'),
   ('T', 'TID001', 'TIDT', 'date', '30'),
   ('S', 'TID001', 'TIDS', 'date', '366'),
   ('S', 'TID002', 'TIDS', 'date', '731');
commit;

INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('001', 'Afghanistan', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('002', 'Albania', '����������', '�������၆');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('003', 'Algeria', '����������', '����������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('005', 'Andorra', '���������͹�', '���������͇�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('006', 'Angola', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('007', 'Anguilla', '��������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('008', 'Antartica', '����ϺͰͲ���', '���̹ϼ��͠����_');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('009', 'Antigua', '����ϵ�', '�����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('010', 'Argentina', '����͢', '����͢');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('011', 'Armenia', '��������', '�����၆');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('012', 'Aruba', '��³�͵�', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('013', 'Ascension Island', '��ɭ��(�ϴ�������)', '��ɭ��(�ϴ�����u�Z)');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('014', 'Australia', '�Ĵ�����', '�Ĵ�����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('015', 'Austria', '�µ���', '�W����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('016', 'Azerbaijan', '�����ݽ�', '�����ݽ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('017', 'Bahamas', '�͹���Ⱥ��', '�͹��RȺ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('018', 'Bahrain', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('019', 'Bangladesh', '�ϼ�����', '�ϼ���');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('020', 'Barbados', '�ͰͶ�˹��', '�ͰͶ�˹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('021', 'Belarus', '�׶���˹', '�׶��_˹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('022', 'Belgium', '����ʱ', '�����r');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('023', 'Belize', '������', '����Ɲ');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('024', 'Benin', '����', 'ؐ��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('025', 'Bermuda', '��Ľ��Ⱥ��', '��Ľ��Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('026', 'Bhutan', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('027', 'Bolivia', '����ά��', '�����S��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('028', 'Bosnia and Herzegovina', '��˹���ǣ�������ά��', '��ʿ�၆��������S��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('029', 'Botswana', '��������', '�����߼{');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('030', 'Bouvet Island', '��ά��', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('031', 'Brazil', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('032', 'British Indian Ocean Territory', 'Ӣ��ӡ�������', 'Ӣ��ӡ�����I��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('033', 'Brunei Darussalam', '������³������', '���R�_���_�m��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('034', 'Bulgaria', '��������', '��������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('035', 'Burkina Faso', '�����ɷ���', '�����{����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('036', 'Burundi', '��¡��', '��¡��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('037', 'Cambodia', '����կ', '����կ');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('038', 'Cameroon', '����¡', '����¡');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('039', 'Canada', '���ô�', '���ô�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('040', 'Cape Verde', '��ý�', '��ý�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('041', 'Cayman Islands', '����Ⱥ����Ӣ����', '�_��Ⱥ�u��Ӣ�٣�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('042', 'Central African Republic', '�зǹ��͹�', '�зǹ��͇�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('043', 'Chad', 'է�ú�', 'է�ú�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('044', 'Chile', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('045', 'China', '�й�', '�Ї�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('046', 'Christmas Island', 'ʥ������Ӣ����', '�}�Q�u��Ӣ�٣�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('047', 'Cocos (Keeling) Islands', '�ƿ�˹Ⱥ��', '�ƿ�˹Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('048', 'Colombia', '���ױ���', '�炐�ȁ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('049', 'Comoros', '��Ħ��', '��Ħ�_');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('050', 'Congo, Democratic Republic of the', '�չ�', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('052', 'Cook Islands', '���Ⱥ��', '�ƿ�Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('053', 'Costa Rica', '��˹�����', '��˹�����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('054', 'Cote Divoire', '���ص���', '��������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('055', 'Croatia/Hrvatska', '���޵���', '���_�ف�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('056', 'Cyprus', '����·˹', 'ِ����˹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('057', 'Czech Republic', '�ݿ˹��͹�', '�ݿ˹��͇�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('058', 'Denmark', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('059', 'Djibouti', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('060', 'Dominica', '�������', '�������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('061', 'Dominican Republic', '������ӹ��͹�', '������ӹ��͇�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('062', 'East Timor', '������', '�|����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('063', 'Ecuador', '��϶��', '��϶ࠖ');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('064', 'Egypt', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('065', 'El Salvador', '�����߶�', '�_���߶�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('066', 'Equatorial Guinea', '���������', '����׃ȁ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('067', 'Eritrea', '����������', '�������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('068', 'Estonia', '��ɳ����', '��ɳ�၆');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('069', 'Ethiopia', '���������', '������ȁ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('070', 'Falkland Islands (Malvina)', '������Ⱥ��', '�����mȺ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('071', 'Faroe Islands', '����Ⱥ��', '���_Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('072', 'Fiji', '쳼�', '쳝�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('073', 'Finland', '����', '���m');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('074', 'France', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('076', 'French Guiana', '���������ǵ���', '�����灆�ǵ؅^');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('077', 'French Polynesia', '��������ά�ǵ���', '���������S���؅^');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('078', 'French Southern Territories', '�����ϰ������', '�����ϰ����I��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('079', 'Gabon', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('080', 'Gambia', '�Ա���', '���ȁ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('081', 'Georgia', '��������', '���΁���');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('082', 'Germany', '�¹�', '��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('083', 'Ghana', '����', '�Ӽ{');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('084', 'Gibraltar', 'ֱ������', 'ֱ���_��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('086', 'Greece', 'ϣ��', 'ϣ�D');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('087', 'Greenland', '������', '�����m');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('088', 'Grenada', '�����ɴ�', '�������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('089', 'Guadeloupe', '�ϵ����յ�', '�ϵ��_�Սu');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('090', 'Guam', '�ص�', '�P�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('091', 'Guatemala', 'Σ������', '�ϵ��R��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('092', 'Guernsey', '�����', '�����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('093', 'Guinea', '������', '�׃ȁ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('094', 'Guinea-Bissau', '�����Ǳ��ܹ��͹�', '�׃ȁ��ȽB���͇�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('095', 'Guyana', '������', '�灆��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('096', 'Haiti', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('097', 'Heard and McDonald Islands', '�������������Ⱥ��', '�����c�����Ƽ{Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('098', 'Holy See (City Vatican State)', '��ٸ�', '��ٌ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('099', 'Honduras', '�鶼��˹', '�鶼��˹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('100', 'Hong Kong', '�й����', '�Ї����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('101', 'Hungary', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('102', 'Iceland', '����', '���u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('103', 'India', 'ӡ��', 'ӡ��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('104', 'Indonesia', 'ӡ��������', 'ӡ��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('105', 'Ireland', '������', '�۠��m');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('106', 'Isle of Man', '�����', '�R���u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('107', 'Italy', '�����', '�x����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('108', 'Jamaica', '�����', '���I��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('109', 'Japan', '�ձ�', '�ձ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('110', 'Jersey', '������', '�����u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('111', 'Jordan', 'Լ��', '�s��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('112', 'Kazakhstan', '������˹̹', '���_��˹̹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('113', 'Kenya', '������', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('114', 'Kiribati', '�����˹', '���Y��˹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('115', 'Korea, Republic of', '����', '�n��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('116', 'Kuwait', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('117', 'Kyrgyzstan', '������˹˹̹', '������˹˹̹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('118', 'Lao People! Democratic Republic', '���������������͹�', '�ϓ������������͇�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('119', 'Latvia', '����ά��', '��Ó�S��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('120', 'Lebanon', '�����', '�����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('121', 'Lesotho', '������', '�R����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('122', 'Liberia', '��������', '�����큆');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('123', 'Liechtenstein', '��֧��ʿ��', '��֧��ʿ��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('124', 'Lithuania', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('125', 'Luxembourg', '¬ɭ��', '�Rɭ��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('126', 'Macau', '����', '���T');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('127', 'Macedonia, Former Yugoslav Republic', '�����', '�R���D');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('128', 'Madagascar', '����˹��', '�R�_��˹��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('129', 'Malawi', '����ά', '�R���S');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('130', 'Malaysia', '��������', '�R������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('131', 'Maldives', '�������', '�R������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('132', 'Mali', '����', '�R��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('133', 'Malta', '�����', '�R����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('137', 'Mauritius', 'ë����˹', 'ë����˹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('134', 'Marshall Islands', '���ܶ�Ⱥ��', '�R�B��Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('135', 'Martinique', '������˵�', '�R����ˍu');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('136', 'Mauritania', 'ë��������', 'é�����၆');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('138', 'Mayotte', '��Լ�ص�', '���');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('139', 'Mexico', 'ī����', 'ī����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('140', 'Micronesia, Federal State of', '�ܿ�������������', '�ܿ��_��������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('141', 'Moldova, Republic of', 'Ħ������', 'Ī���_��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('142', 'Monaco', 'Ħ�ɸ�', 'Ħ�{��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('143', 'Mongolia', '�ɹ�', '�ɹ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('144', 'Montserrat', '���������ص�', '���������؍u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('145', 'Morocco', 'Ħ���', 'Ħ���');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('146', 'Mozambique', 'Īɣ�ȿ�', 'Ī���ȿ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('147', 'Namibia', '���ױ���', '�{�ױȁ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('148', 'Nauru', '�³', '���');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('149', 'Nepal', '�Ჴ��', '�Ჴ��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('150', 'Netherlands', '����', '���m');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('151', 'Netherlands Antilles', '����������˹Ⱥ��', '���m������˹Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('152', 'New Caledonia', '�¿��������', '�º�����၆');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('153', 'New Zealand', '������', '�����m');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('154', 'Nicaragua', '�������', '�������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('155', 'Niger', '���ն�', '���ՠ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('156', 'Nigeria', '��������', '��������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('157', 'Niue', 'Ŧ����', '�~���u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('158', 'Norfolk Island', 'ŵ���˵�', '�Z���ˍu');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('159', 'Northern Mariana Islands', '��������Ⱥ��', '�R�����{Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('160', 'Norway', 'Ų��', 'Ų��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('161', 'Not Determined', 'δ������', 'δ���w��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('162', 'Oman', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('163', 'Pakistan', '�ͻ�˹̹', '�ͻ�˹̹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('164', 'Palau', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('165', 'Panama', '������', '�����R');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('166', 'Papua New Guinea', '�Ͳ����¼�����', '�Ͳ����´��ȁ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('167', 'Paraguay', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('168', 'Peru', '��³', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('169', 'Philippines', '���ɱ�', '�����e');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('170', 'Pitcairn Island', 'Ƥ�ؿ˶���', 'Ƥ�ؿ˶��u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('171', 'Poland', '����', '���m');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('172', 'Portugal', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('173', 'Puerto Rico', '�������', '�������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('174', 'Qatar', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('175', 'Reunion Island', '��������', '�������u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('176', 'Romania', '��������', '�_�R�၆');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('177', 'Russian Federation', '����˹����', '���_˹��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('178', 'Rwanda', '¬����', '�R���_');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('179', 'Saint Kitts and Nevis', 'ʥ���ĺ���ά˹', '�}���ĺ���S˹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('180', 'Saint Lucia', 'ʥ¬����', '�}�R����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('181', 'Saint Vincent and the Grenadines', 'ʥ��ɭ�غ͸����ɶ�˹', '�}��ɭ�غ͸��ּ{��˹Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('182', 'San Marino', 'ʥ����ŵ', '�}�R���Z');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('183', 'Sao Tome and Principe', 'ʥ��������������', '�}�������������ȍu');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('184', 'Saudi Arabia', 'ɳ�ذ�����', 'ɳ���ذ�����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('185', 'Senegal', '���ڼӶ�', '���ȼӠ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('186', 'Seychelles', '�����', '�����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('187', 'Sierra Leone', '��������', '�����ﰺ');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('188', 'Singapore', '�¼���', '�¼���');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('189', 'Slovak Republic', '˹�工��', '˹�工��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('190', 'Slovenia', '˹��������', '˹�����၆');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('191', 'Solomon Islands', '������Ⱥ��', '���_�TȺ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('192', 'Somalia', '������', '���R��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('193', 'South Africa', '�Ϸ�', '�Ϸ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('194', 'South Georgia and the South Sandwich Islands', '�������ǵ�����ɣ��Τ�浺', '�φ��΁��u����ɣ���f��u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('195', 'Spain', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('196', 'Sri Lanka', '˹������', '˹���m��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('197', 'St Pierre and Miquelon', 'ʥƤ�������ܿ�¡��', '�}Ƥ�������ܿ�¡�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('198', 'St. Helena', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('199', 'Suriname', '������', '�K����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('200', 'Svalbard and Jan Mayen Islands', '˹�߶�����Ⱥ��', '˹�ߠ�����Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('201', 'Swaziland', '˹��ʿ��', '˹��ʿ�m ');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('202', 'Sweden', '���', '���');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('203', 'Switzerland', '��ʿ', '��ʿ');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('204', 'Taiwan', '�й�̨��', '�Ї��_��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('205', 'Tajikistan', '������˹̹', '������˹̹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('206', 'Tanzania', '̹ɣ����', '̹ɣ�၆');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('207', 'Thailand', '̩��', '̩��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('208', 'Togo', '���', '���');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('209', 'Tokelau', '�п���Ⱥ��', '�п˄�Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('210', 'Tonga', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('211', 'Trinidad and Tobago', '�������Ͷ�͸�', '�������_�Ͷ�͸�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('212', 'Tunisia', 'ͻ��˹', 'ͻ��˹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('213', 'Turkey', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('214', 'Turkmenistan', '������˹̹', '������˹̹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('215', 'Turks and Caicos Islands', '�ؿ�˹�Ϳ���˹Ⱥ��', '�ؿ�˹�̈́P��˹Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('216', 'Tuvalu', 'ͼ��¬', '�D�߱R');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('217', 'US Minor Outlying Islands', '�����������', '���������I��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('218', 'Uganda', '�ڸɴ�', '�����_');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('219', 'Ukraine', '�ڿ���', '�����m');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('220', 'United Arab Emirates', '����������������', '�����������L�� ');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('221', 'United Kindom', 'Ӣ��', 'Ӣ��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('222', 'United States', '����', '����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('223', 'Uruguay', '������', '������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('224', 'Uzbekistan', '���ȱ��˹̹', '��Ɲ�e��˹̹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('225', 'Vanuatu', '��Ŭ��ͼ', '��Ŭ���D');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('226', 'Venezuela', 'ί������', 'ί������');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('227', 'Vietnam', 'Խ��', 'Խ��');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('228', 'Virgin Island (British)', 'ά��Ⱥ����Ӣ����', '�S����Ⱥ�u��Ӣ�٣�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('229', 'Virgin Island (USA)', 'ά��Ⱥ����������', '�S����Ⱥ�u�����٣�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('230', 'Wallis And Futuna Islands', '����˹�͸�ͼ��Ⱥ��', '����˹�͸��D�{Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('231', 'Western Sahara', '��ɳ����', '��ɳ����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('232', 'Western Samoa', '����Ħ��Ⱥ��', '���_Ħ��Ⱥ�u');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('233', 'Yemen', 'Ҳ��', '�~�T');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('234', 'Yugoslavia', '��˹����', '��˹����');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('235', 'Zambia', '�ޱ���', 'ٝ�ȁ�');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('236', 'Zimbabwe', '��Ͳ�Τ', '��Ͳ��f');
COMMIT;


 
