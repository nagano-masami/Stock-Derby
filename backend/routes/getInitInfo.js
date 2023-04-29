var express = require('express');
var router = express.Router();

var mysql = require('mysql'); //★追加
const config  = require('../public/javascripts/db_config.js');

// 画面が表示された際に実行される処理
router.post('/', (req, res, next) => {

   raceInfo = [{
              betting_ticket_id: 1,
              ticket_selection_j_name: 'フォーメーション',
              purchase_total_amount: 100,
              refund_amount: 10
          },
          {
              betting_ticket_id: 1,
              ticket_selection_j_name: 'フォーメーション',
              purchase_total_amount: 100,
              refund_amount: 10
          },
          {
              betting_ticket_id: 1,
              ticket_selection_j_name: '通常',
              purchase_total_amount: 100,
              refund_amount: 10
          }];
  res.send(raceInfo);
  // データベースの設定情報
  var connection = mysql.createConnection(config.mysql_setting);

  // // データを取り出す
  // connection.query(config.getInitInfoSQL, function (error, results, fields) {
  //   // errorがnull、つまり成功した場合はOKを返す
  //     if (!error) {
         
          
  //     res.send(results);
  //   } else {
  //     res.send('NG');
  //   }
  // }
  // );
});

module.exports = router;
