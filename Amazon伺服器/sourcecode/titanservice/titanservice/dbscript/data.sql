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
   ('001', 'Afghanistan', '阿富汗', '阿富汗');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('002', 'Albania', '阿尔巴尼亚', '阿爾巴尼亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('003', 'Algeria', '阿尔及利亚', '阿爾及利亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('005', 'Andorra', '安道尔共和国', '安道爾共和國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('006', 'Angola', '安哥拉', '安哥拉');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('007', 'Anguilla', '安圭拉岛', '安圭拉');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('008', 'Antartica', '安提瓜和巴布达', '安堤瓜及巴爾布達');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('009', 'Antigua', '安提瓜岛', '安提瓜');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('010', 'Argentina', '阿根廷', '阿根廷');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('011', 'Armenia', '亚美尼亚', '亞美尼亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('012', 'Aruba', '阿鲁巴岛', '阿魯巴');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('013', 'Ascension Island', '阿森松(南大西洋岛屿)', '阿森松(南大西洋島嶼)');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('014', 'Australia', '澳大利亚', '澳大利亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('015', 'Austria', '奥地利', '奧地利');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('016', 'Azerbaijan', '阿塞拜疆', '阿塞拜疆');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('017', 'Bahamas', '巴哈马群岛', '巴哈馬群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('018', 'Bahrain', '巴林', '巴林');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('019', 'Bangladesh', '孟加拉国', '孟加拉');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('020', 'Barbados', '巴巴多斯岛', '巴巴多斯');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('021', 'Belarus', '白俄罗斯', '白俄羅斯');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('022', 'Belgium', '比利时', '比利時');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('023', 'Belize', '伯利兹', '伯利茲');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('024', 'Benin', '贝宁', '貝寧');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('025', 'Bermuda', '百慕大群岛', '百慕大群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('026', 'Bhutan', '不丹', '不丹');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('027', 'Bolivia', '玻利维亚', '玻利維亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('028', 'Bosnia and Herzegovina', '波斯尼亚－黑塞哥维那', '波士尼亞－黑塞哥維那');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('029', 'Botswana', '博茨瓦纳', '博茨瓦納');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('030', 'Bouvet Island', '布维岛', '布緧');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('031', 'Brazil', '巴西', '巴西');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('032', 'British Indian Ocean Territory', '英属印度洋领地', '英屬印度洋領地');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('033', 'Brunei Darussalam', '文莱达鲁萨兰国', '汶萊達魯薩蘭國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('034', 'Bulgaria', '保加利亚', '保加利亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('035', 'Burkina Faso', '布基纳法索', '伯基納法索');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('036', 'Burundi', '布隆迪', '布隆迪');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('037', 'Cambodia', '柬埔寨', '柬埔寨');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('038', 'Cameroon', '喀麦隆', '喀麥隆');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('039', 'Canada', '加拿大', '加拿大');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('040', 'Cape Verde', '佛得角', '佛得角');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('041', 'Cayman Islands', '开曼群岛（英属）', '開曼群島（英屬）');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('042', 'Central African Republic', '中非共和国', '中非共和國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('043', 'Chad', '乍得湖', '乍得湖');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('044', 'Chile', '智利', '智利');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('045', 'China', '中国', '中國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('046', 'Christmas Island', '圣诞岛（英属）', '聖誕島（英屬）');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('047', 'Cocos (Keeling) Islands', '科科斯群岛', '科科斯群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('048', 'Colombia', '哥伦比亚', '哥倫比亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('049', 'Comoros', '科摩罗', '科摩羅');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('050', 'Congo, Democratic Republic of the', '刚果', '剛果');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('052', 'Cook Islands', '库克群岛', '科克群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('053', 'Costa Rica', '哥斯达黎加', '哥斯大黎加');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('054', 'Cote Divoire', '科特迪瓦', '象牙海岸');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('055', 'Croatia/Hrvatska', '克罗蒂亚', '克羅蒂亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('056', 'Cyprus', '塞浦路斯', '賽普勒斯');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('057', 'Czech Republic', '捷克共和国', '捷克共和國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('058', 'Denmark', '丹麦', '丹麥');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('059', 'Djibouti', '吉布提', '吉布提');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('060', 'Dominica', '多米尼加', '多明尼加');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('061', 'Dominican Republic', '多米尼加共和国', '多明尼加共和國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('062', 'East Timor', '东帝汶', '東帝汶');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('063', 'Ecuador', '厄瓜多尔', '厄瓜多爾');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('064', 'Egypt', '埃及', '埃及');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('065', 'El Salvador', '萨尔瓦多', '薩爾瓦多');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('066', 'Equatorial Guinea', '赤道几内亚', '赤道幾內亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('067', 'Eritrea', '厄立特里亚', '厄立特里亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('068', 'Estonia', '爱沙尼亚', '愛沙尼亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('069', 'Ethiopia', '埃塞俄比亚', '埃塞俄比亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('070', 'Falkland Islands (Malvina)', '福克兰群岛', '福克蘭群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('071', 'Faroe Islands', '法罗群岛', '法羅群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('072', 'Fiji', '斐济', '斐濟');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('073', 'Finland', '芬兰', '芬蘭');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('074', 'France', '法国', '法國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('076', 'French Guiana', '法国圭亚那地区', '法國圭亞那地區');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('077', 'French Polynesia', '法国玻利维亚地区', '法國玻利維亞地區');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('078', 'French Southern Territories', '法属南半球领地', '法屬南半球領地');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('079', 'Gabon', '加蓬', '加蓬');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('080', 'Gambia', '冈比亚', '岡比亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('081', 'Georgia', '乔治亚州', '喬治亞州');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('082', 'Germany', '德国', '德國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('083', 'Ghana', '加纳', '加納');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('084', 'Gibraltar', '直布罗陀', '直布羅陀');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('086', 'Greece', '希腊', '希臘');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('087', 'Greenland', '格陵兰', '格陵蘭');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('088', 'Grenada', '格林纳达', '格林伍德');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('089', 'Guadeloupe', '瓜德罗普岛', '瓜德羅普島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('090', 'Guam', '关岛', '關島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('091', 'Guatemala', '危地马拉', '瓜地馬拉');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('092', 'Guernsey', '格恩西', '格恩西');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('093', 'Guinea', '几内亚', '幾內亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('094', 'Guinea-Bissau', '几内亚比绍共和国', '幾內亞比紹共和國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('095', 'Guyana', '圭亚那', '圭亞那');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('096', 'Haiti', '海地', '海地');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('097', 'Heard and McDonald Islands', '赫特与麦克唐纳群岛', '赫特與麥克唐納群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('098', 'Holy See (City Vatican State)', '梵蒂冈', '梵蒂岡');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('099', 'Honduras', '洪都拉斯', '洪都拉斯');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('100', 'Hong Kong', '中国香港', '中國香港');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('101', 'Hungary', '匈牙利', '匈牙利');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('102', 'Iceland', '冰岛', '冰島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('103', 'India', '印度', '印度');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('104', 'Indonesia', '印度尼西亚', '印尼');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('105', 'Ireland', '爱尔兰', '愛爾蘭');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('106', 'Isle of Man', '马恩岛', '馬恩島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('107', 'Italy', '意大利', '義大利');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('108', 'Jamaica', '牙买加', '牙買加');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('109', 'Japan', '日本', '日本');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('110', 'Jersey', '泽西岛', '澤西島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('111', 'Jordan', '约旦', '約旦');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('112', 'Kazakhstan', '哈萨克斯坦', '哈薩克斯坦');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('113', 'Kenya', '肯尼亚', '肯雅');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('114', 'Kiribati', '基里巴斯', '基裏巴斯');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('115', 'Korea, Republic of', '韩国', '韓國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('116', 'Kuwait', '科威特', '科威特');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('117', 'Kyrgyzstan', '吉尔吉斯斯坦', '吉爾吉斯斯坦');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('118', 'Lao People! Democratic Republic', '老挝人民民主共和国', '老撾人民民主共和國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('119', 'Latvia', '拉脱维亚', '拉脫維亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('120', 'Lebanon', '黎巴嫩', '黎巴嫩');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('121', 'Lesotho', '莱索托', '萊索托');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('122', 'Liberia', '利比里亚', '利比理亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('123', 'Liechtenstein', '列支敦士登', '列支敦士登');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('124', 'Lithuania', '立陶宛', '立陶宛');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('125', 'Luxembourg', '卢森堡', '盧森堡');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('126', 'Macau', '澳门', '澳門');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('127', 'Macedonia, Former Yugoslav Republic', '马其顿', '馬其頓');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('128', 'Madagascar', '马达加斯加', '馬達加斯加');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('129', 'Malawi', '马拉维', '馬拉維');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('130', 'Malaysia', '马来西亚', '馬來西亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('131', 'Maldives', '马尔代夫', '馬爾代夫');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('132', 'Mali', '马里', '馬里');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('133', 'Malta', '马耳他', '馬爾他');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('137', 'Mauritius', '毛里求斯', '毛里求斯');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('134', 'Marshall Islands', '马绍尔群岛', '馬紹爾群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('135', 'Martinique', '马提尼克岛', '馬提尼克島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('136', 'Mauritania', '毛里塔尼亚', '茅利塔尼亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('138', 'Mayotte', '马约特岛', '窦特');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('139', 'Mexico', '墨西哥', '墨西哥');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('140', 'Micronesia, Federal State of', '密克罗尼西亚联邦', '密克羅尼西亞聯邦');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('141', 'Moldova, Republic of', '摩尔多瓦', '莫爾達瓦');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('142', 'Monaco', '摩纳哥', '摩納哥');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('143', 'Mongolia', '蒙古', '蒙古');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('144', 'Montserrat', '蒙特塞拉特岛', '蒙特塞拉特島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('145', 'Morocco', '摩洛哥', '摩洛哥');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('146', 'Mozambique', '莫桑比克', '莫三比克');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('147', 'Namibia', '纳米比亚', '納米比亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('148', 'Nauru', '瑙鲁', '瑙魯');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('149', 'Nepal', '尼泊尔', '尼泊爾');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('150', 'Netherlands', '荷兰', '荷蘭');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('151', 'Netherlands Antilles', '荷兰安的列斯群岛', '荷蘭安的列斯群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('152', 'New Caledonia', '新喀里多尼亚', '新赫里多尼亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('153', 'New Zealand', '新西兰', '新西蘭');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('154', 'Nicaragua', '尼加拉瓜', '尼加拉瓜');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('155', 'Niger', '尼日尔', '尼日爾');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('156', 'Nigeria', '尼日利亚', '尼日利亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('157', 'Niue', '纽埃岛', '紐埃島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('158', 'Norfolk Island', '诺福克岛', '諾福克島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('159', 'Northern Mariana Islands', '马里亚纳群岛', '馬利安納群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('160', 'Norway', '挪威', '挪威');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('161', 'Not Determined', '未定归属', '未定歸屬');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('162', 'Oman', '阿曼', '阿曼');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('163', 'Pakistan', '巴基斯坦', '巴基斯坦');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('164', 'Palau', '帕劳', '帕勞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('165', 'Panama', '巴拿马', '巴拿馬');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('166', 'Papua New Guinea', '巴布亚新几内亚', '巴布亞新磯內亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('167', 'Paraguay', '巴拉圭', '巴拉圭');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('168', 'Peru', '秘鲁', '秘魯');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('169', 'Philippines', '菲律宾', '菲律賓');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('170', 'Pitcairn Island', '皮特克恩岛', '皮特克恩島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('171', 'Poland', '波兰', '波蘭');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('172', 'Portugal', '葡萄牙', '葡萄牙');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('173', 'Puerto Rico', '波多黎各', '波多黎各');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('174', 'Qatar', '卡塔尔', '卡塔爾');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('175', 'Reunion Island', '留尼旺岛', '留尼旺島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('176', 'Romania', '罗马尼亚', '羅馬尼亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('177', 'Russian Federation', '俄罗斯联邦', '俄羅斯聯邦');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('178', 'Rwanda', '卢旺达', '盧旺達');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('179', 'Saint Kitts and Nevis', '圣基茨和尼维斯', '聖基茨和尼維斯');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('180', 'Saint Lucia', '圣卢西亚', '聖盧西亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('181', 'Saint Vincent and the Grenadines', '圣文森特和格林纳丁斯', '聖文森特和格林納丁斯群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('182', 'San Marino', '圣马力诺', '聖馬力諾');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('183', 'Sao Tome and Principe', '圣多美和普林西比', '聖多美及普林西比島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('184', 'Saudi Arabia', '沙特阿拉伯', '沙烏地阿拉伯');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('185', 'Senegal', '塞内加尔', '塞內加爾');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('186', 'Seychelles', '塞舌尔', '塞舌耳');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('187', 'Sierra Leone', '塞拉利昂', '塞拉里昂');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('188', 'Singapore', '新加坡', '新加坡');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('189', 'Slovak Republic', '斯洛伐克', '斯洛伐克');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('190', 'Slovenia', '斯洛文尼亚', '斯洛文尼亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('191', 'Solomon Islands', '所罗门群岛', '所羅門群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('192', 'Somalia', '索马里', '索馬里');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('193', 'South Africa', '南非', '南非');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('194', 'South Georgia and the South Sandwich Islands', '南乔治亚岛和南桑德韦奇岛', '南喬治亞島和南桑德韋奇島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('195', 'Spain', '西班牙', '西班牙');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('196', 'Sri Lanka', '斯里兰卡', '斯里蘭卡');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('197', 'St Pierre and Miquelon', '圣皮埃尔和密克隆岛', '聖皮埃爾和密克隆島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('198', 'St. Helena', '海伦娜', '海倫娜');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('199', 'Suriname', '苏里南', '蘇里南');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('200', 'Svalbard and Jan Mayen Islands', '斯瓦尔巴特群岛', '斯瓦爾巴特群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('201', 'Swaziland', '斯威士兰', '斯威士蘭 ');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('202', 'Sweden', '瑞典', '瑞典');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('203', 'Switzerland', '瑞士', '瑞士');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('204', 'Taiwan', '中国台湾', '中國臺灣');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('205', 'Tajikistan', '塔吉克斯坦', '塔吉克斯坦');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('206', 'Tanzania', '坦桑尼亚', '坦桑尼亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('207', 'Thailand', '泰国', '泰國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('208', 'Togo', '多哥', '多哥');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('209', 'Tokelau', '托克劳群岛', '托克勞群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('210', 'Tonga', '汤加', '湯加');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('211', 'Trinidad and Tobago', '特立尼达和多巴哥', '特立尼達和多巴哥');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('212', 'Tunisia', '突尼斯', '突尼斯');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('213', 'Turkey', '土耳其', '土耳其');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('214', 'Turkmenistan', '土库曼斯坦', '土庫曼斯坦');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('215', 'Turks and Caicos Islands', '特克斯和凯科斯群岛', '特克斯和凱科斯群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('216', 'Tuvalu', '图瓦卢', '圖瓦盧');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('217', 'US Minor Outlying Islands', '美国海外领地', '美國海外領地');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('218', 'Uganda', '乌干达', '烏干達');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('219', 'Ukraine', '乌克兰', '烏克蘭');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('220', 'United Arab Emirates', '阿拉伯联合酋长国', '阿拉伯聯合酋長國 ');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('221', 'United Kindom', '英国', '英國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('222', 'United States', '美国', '美國');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('223', 'Uruguay', '乌拉圭', '烏拉圭');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('224', 'Uzbekistan', '乌兹别克斯坦', '烏茲別克斯坦');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('225', 'Vanuatu', '瓦努阿图', '瓦努阿圖');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('226', 'Venezuela', '委内瑞拉', '委內瑞拉');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('227', 'Vietnam', '越南', '越南');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('228', 'Virgin Island (British)', '维京群岛（英属）', '維爾京群島（英屬）');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('229', 'Virgin Island (USA)', '维京群岛（美属）', '維爾京群島（美屬）');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('230', 'Wallis And Futuna Islands', '瓦利斯和富图纳群岛', '瓦利斯和富圖納群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('231', 'Western Sahara', '西沙哈拉', '西沙哈拉');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('232', 'Western Samoa', '西萨摩亚群岛', '西薩摩亞群島');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('233', 'Yemen', '也门', '葉門');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('234', 'Yugoslavia', '南斯拉夫', '南斯拉夫');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('235', 'Zambia', '赞比亚', '贊比亞');
INSERT INTO COUNTRY_CODE
   (CODE, VALUE1, VALUE2, VALUE3)
 VALUES
   ('236', 'Zimbabwe', '津巴布韦', '津巴布韋');
COMMIT;


 
