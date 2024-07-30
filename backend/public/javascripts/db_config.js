exports.mysql_setting = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    timezone: process.env.timezone
};
exports.loginSQL = 'SELECT * from USERS where id=? AND password=?';
exports.insertRecordSQL = 'INSERT INTO CHATS(id,user_id,message,create_date) VALUES(?, ?, ?, ?)';
// ↓UMALifeGo用SQL↓
// データ取得に関するSQL
exports.getHistoriesSQL = 'SELECT * FROM CHATS';
exports.deleteHistorySQL = 'TRUNCATE TABLE CHATS';
exports.getRaceInfosSQL = "select v1.betting_ticket_id betting_ticket_id, d1.japanese_name ticket_category_name, v1.purchase_total_amount purchase_total_amount, v1.refund_amount refund_amount from (select user_id, betting_ticket_id, purchase_total_amount, refund_amount from m_mark_amount_box m1 union all select user_id, betting_ticket_id, purchase_total_amount, refund_amount from m_mark_amount_formation m2 union all select user_id, betting_ticket_id, purchase_total_amount, refund_amount from m_mark_amount_basic m3) v1 inner join m_betting_ticket_info m4 on m4.user_id = v1.user_id and m4.betting_ticket_id = v1.betting_ticket_id inner join d_ticket_category d1 on d1.id = m4.ticket_category_id where v1.user_id = ? and m4.race_date = ? and m4.race_track_id = ? and m4.race_number = ? order by m4.registration_date limit 50;";
exports.getInitInfoSQL = "select v1.betting_ticket_id betting_ticket_id, d1.japanese_name ticket_category_name, v1.purchase_total_amount purchase_total_amount, v1.refund_amount refund_amount from (select user_id, betting_ticket_id, purchase_total_amount, refund_amount from m_mark_amount_box m1 union all select user_id, betting_ticket_id, purchase_total_amount, refund_amount from m_mark_amount_formation m2 union all select user_id, betting_ticket_id, purchase_total_amount, refund_amount from m_mark_amount_basic m3) v1 inner join m_betting_ticket_info m4 on m4.user_id = v1.user_id and m4.betting_ticket_id = v1.betting_ticket_id inner join d_ticket_category d1 on d1.id = m4.ticket_category_id where v1.user_id = ? order by m4.registration_date limit 50;";
exports.getRaceInfoSQL = "select v1.ticket_category_id, v1.ticket_category_j_name, DATE_FORMAT(v1.race_date, '%Y-%m-%d') race_date, v1.race_track_j_name, v1.race_number, v1.purchase_total_amount, v1.refund_amount, v1.select_item_id, v1.number1_flag, v1.number2_flag, v1.number3_flag, v1.number4_flag, v1.number5_flag, v1.number6_flag, v1.number7_flag, v1.number8_flag, v1.number9_flag, v1.number10_flag, v1.number11_flag, v1.number12_flag, v1.number13_flag, v1.number14_flag, v1.number15_flag, v1.number16_flag, v1.number17_flag, v1.number18_flag, v1.ticket_selection_j_name, v1.purchase_amount, v1.amount_unit_j_name, case v1.amount_unit_id when '001' then 100 when '002' then 1000 when '003' then 10000 else 1 end from v_betting_ticket_info v1 where v1.user_id = ? and v1.betting_ticket_id = ?;";
exports.getOutputInfoSQL = "select date_format(v1.race_date, '%Y') race_year, sum(v1.refund_total_amount - v1.purchase_total_amount) total_balance, (sum(v1.refund_total_amount)/sum(v1.purchase_total_amount))*100 recovery_rate from v_race_total_amount v1 where v1.user_id = ? group by v1.user_id, date_format(v1.race_date, '%Y')";
// 保存に関するSQL
exports.getBettingTicketIdSQL = 'select COALESCE(MAX(betting_ticket_id)+1,1) new_beting_ticket_id from m_betting_ticket_info where user_id = ?;';
exports.insertRaceInfoSQL = 'insert into m_betting_ticket_info (user_id, betting_ticket_id, betting_ticket_j_name, betting_ticket_e_name, race_date, race_track_id, race_number, ticket_category_id, ticket_selection_id, registration_date) values(?, ?, ?, ?, ?, ?, ?, ?, ?, cast( now() as datetime));';
exports.insertBasicMarkAmountSQL = 'insert into m_mark_amount_basic (user_id, betting_ticket_id, amount_unit_id, purchase_amount, purchase_total_amount, refund_amount) values(?, ?, ?, ?, ?, ?);';
exports.insertBasicMarkHorseSQL = 'insert into m_mark_horse_basic (user_id, betting_ticket_id, select_item_id, number1_flag, number2_flag, number3_flag, number4_flag, number5_flag, number6_flag, number7_flag, number8_flag, number9_flag, number10_flag, number11_flag, number12_flag, number13_flag, number14_flag, number15_flag, number16_flag, number17_flag, number18_flag) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
exports.insertBoxMarkAmountSQL = 'insert into m_mark_amount_box (user_id, betting_ticket_id, amount_unit_id, purchase_amount, purchase_total_amount, refund_amount) values(?, ?, ?, ?, ?, ?);';
exports.insertBoxMarkHorseSQL = 'insert into m_mark_horse_box (user_id, betting_ticket_id, select_item_id, number1_flag, number2_flag, number3_flag, number4_flag, number5_flag, number6_flag, number7_flag, number8_flag, number9_flag, number10_flag, number11_flag, number12_flag, number13_flag, number14_flag, number15_flag, number16_flag, number17_flag, number18_flag) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
exports.insertFormationMarkAmountSQL = 'insert into m_mark_amount_formation (user_id, betting_ticket_id, amount_unit_id, purchase_amount, purchase_total_amount, refund_amount) values(?, ?, ?, ?, ?, ?);';
exports.insertFormationMarkHorseSQL = 'insert into m_mark_horse_formation (user_id, betting_ticket_id, select_item_id, number1_flag, number2_flag, number3_flag, number4_flag, number5_flag, number6_flag, number7_flag, number8_flag, number9_flag, number10_flag, number11_flag, number12_flag, number13_flag, number14_flag, number15_flag, number16_flag, number17_flag, number18_flag) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
// 削除に関するSQL
exports.deleteRaceInfoSQL = 'delete from m_betting_ticket_info where user_id = ? and betting_ticket_id = ?;';
exports.deleteBasicMarkAmountSQL = 'delete from m_mark_amount_basic where user_id = ? and betting_ticket_id = ?;';
exports.deleteBasicMarkHorseSQL = 'delete from m_mark_horse_basic where user_id = ? and betting_ticket_id = ?;';
exports.deleteBoxMarkAmountSQL = 'delete from m_mark_amount_box where user_id = ? and betting_ticket_id = ?;';
exports.deleteBoxMarkHorseSQL = 'delete from m_mark_horse_box where user_id = ? and betting_ticket_id = ?;';
exports.deleteFormationMarkAmountSQL = 'delete from m_mark_amount_formation where user_id = ? and betting_ticket_id = ?;';
exports.deleteFormationMarkHorseSQL = 'delete from m_mark_horse_formation where user_id = ? and betting_ticket_id = ?;';
exports.getTicketCategorySQL = 'select ticket_category_id from m_betting_ticket_info where user_id = ? and betting_ticket_id = ?';


