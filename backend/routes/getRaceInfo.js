var express = require('express');
var router = express.Router();

var mysql = require('mysql'); //★追加
const config = require('../public/javascripts/db_config.js');

// 画面が表示された際に実行される処理
router.post('/', (req, res, next) => {

    const bettingTicketId = req.body.bettingTicketId;
    const id = req.body.id;
    // データベースの設定情報
    var connection = mysql.createConnection(config.mysql_setting);

    // データを取り出す
    connection.query(config.getRaceInfoSQL, [id, bettingTicketId], function (error, results, fields) {
        // errorがnull、つまり成功した場合はOKを返す
        if (!error) {
            // 返却用のデータ型を初期化
            let resultData ={
                ticket_category_name: "",
                race_date: "",
                race_track_j_name: "",
                race_number: "",
                purchase_total_amount: 0,
                refund_amount: 0,
                horseSelection1: [],
                horseSelection2: [],
                horseSelection3: [],
                ticket_selection_j_name: "",
                purchase_amount: 0,
                amount_unit_j_name: "",
                amount_unit_number_j_name: "",            
            }

            console.log(id);
            console.log(bettingTicketId);
            console.log(results.length);

            for(let i=1; i<=results.length; i++){
                // 選択した馬番号のみが配列になるようにデータを加工
                // select_item_idが0埋め三桁数値のため、ループの変数を0埋め
                let horseSelectionData = results.find(e => e.select_item_id === ('000' + i).slice(-3));

                if(horseSelectionData != undefined){
                    let booleanSelectionArray = [];
                    booleanSelectionArray.push(Boolean(horseSelectionData.number1_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number2_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number3_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number4_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number5_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number6_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number7_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number8_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number9_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number10_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number11_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number12_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number13_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number14_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number15_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number16_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number17_flag));
                    booleanSelectionArray.push(Boolean(horseSelectionData.number18_flag));

                    let horseSelectionArray = [];
                    for(let a=0; a<booleanSelectionArray.length; a++){
                        if(booleanSelectionArray[a]){
                            horseSelectionArray.push(('00' + (a+1)).slice(-2));
                        }
                    }

                    // 返却する値を生成
                    switch(i){
                        case 1:
                            // front側で計算に必要な金額単位を数値化 
                            let amount_unit = 0;
                            switch(horseSelectionData.amount_unit_id){
                                case "001": amount_unit = 100; break;
                                case "002": amount_unit = 1000; break;
                                case "003": amount_unit = 10000; break;
                                default: amount_unit = 100;
                            }

                            resultData.ticket_category_name = horseSelectionData.ticket_category_j_name;
                            resultData.race_date = horseSelectionData.race_date;
                            resultData.race_track_j_name = horseSelectionData.race_track_j_name;
                            resultData.race_number = horseSelectionData.race_number;
                            resultData.purchase_total_amount = horseSelectionData.purchase_total_amount;
                            resultData.refund_amount = horseSelectionData.refund_amount;
                            resultData.horseSelection1 = horseSelectionArray;
                            resultData.ticket_selection_j_name = horseSelectionData.ticket_selection_j_name;
                            resultData.purchase_amount = horseSelectionData.purchase_amount;
                            resultData.amount_unit_j_name = horseSelectionData.amount_unit_j_name;
                            resultData.amount_unit_number_j_name = amount_unit;
                            break;
                        case 2:
                            resultData.horseSelection2 = horseSelectionArray;
                            break;
                        case 3:
                            resultData.horseSelection3 = horseSelectionArray;
                            break;
                    }
                }
            }
            res.send(resultData);
        } else {
            console.log(error);
            res.send('NG');
            console.error(error);
        }
    }
    );
});

module.exports = router;
