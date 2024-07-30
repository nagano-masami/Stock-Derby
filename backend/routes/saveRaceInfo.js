var express = require('express');
var router = express.Router();

var mysql = require('mysql'); //★追加
const config = require('../public/javascripts/db_config.js');
const DatabaseConnection = require('../public/javascripts/DatabaseConnection.js');

router.post('/', async (req, res, next) => {

    raceInfo = req.body;
    const id = req.body.id;

    var connection = mysql.createConnection(config.mysql_setting);
    var errorExits = false;
    var newBettingTicketId = raceInfo.bettingTicketId;
    var ticketCategoryId = "";

    var updateFlag = false;

    if(!!raceInfo.bettingTicketId){
        updateFlag = true;
    }

    // 新規作成用：最新の馬券IDを取得
    if(!updateFlag){
        connection.query(config.getBettingTicketIdSQL, [id], function(error, results, fields) {
            if (!error) {
                newBettingTicketId = ('00000' + results[0].new_beting_ticket_id).slice(-5);
                errorExits = false;
            } else {
                errorExits = true;
                res.send('NG');
                return connection.rollback(() => { throw error; });
            }
        });
    }

    // 更新時用：チケット種別によって削除SQLを変更するためにdbから情報を取得
    if(updateFlag){
        connection.query(config.getTicketCategorySQL, [id, raceInfo.bettingTicketId], function (error, results, fields){
            if (error) {
                res.send('NG');
                throw error;
            }
    
            ticketCategoryId = results[0].tikcet_category_id;
        });
    }
    
    // 整合性確保のためトランザクション張る
    connection.beginTransaction((err) => {
        if(err){ throw err; }

        if(!errorExits){
            // 更新時は一度データを削除する(updateだと馬番号更新の部分でごちゃつくため)
            // deleteRaceInfo.jsを呼び出せるように変えたいが、いったんベタがき
            if(updateFlag){
                // チケット種別によって削除SQLを変える
                var executeDeleteAmountSQL = "";
                var executeDeleteHorseSQL = "";

                switch(ticketCategoryId){
                    case '002':
                        executeDeleteAmountSQL = config.deleteBoxMarkAmountSQL;
                        executeDeleteHorseSQL = config.deleteBoxMarkHorseSQL;
                        break;
                    case '003':
                        executeDeleteAmountSQL = config.deleteFormationMarkAmountSQL;
                        executeDeleteHorseSQL = config.deleteFormationMarkHorseSQL;
                        break;
                    default:
                        executeDeleteAmountSQL = config.deleteBasicMarkAmountSQL;
                        executeDeleteHorseSQL = config.deleteBasicMarkHorseSQL;
                        break;
                }

                // 馬券情報削除
                connection.query(config.deleteRaceInfoSQL, [id, raceInfo.bettingTicketId], function (error, results, fields){
                    if (error) {
                        res.send('NG');
                        return connection.rollback(() => { throw error; });
                    }
                });
                // 金額削除
                connection.query(executeDeleteAmountSQL, [id, raceInfo.bettingTicketId], function (error, results, fields){
                    if (error) {
                        res.send('NG');
                        return connection.rollback(() => { throw error; });
                    }
                });
                // 馬番号削除
                connection.query(executeDeleteHorseSQL, [id, raceInfo.bettingTicketId], function (error, results, fields){
                    if (error) {
                        res.send('NG');
                        return connection.rollback(() => { throw error; });
                    }
                });
            }
        
            var executionAmountSql;
            var executionHorseSql;

            switch(raceInfo.ticket_category_name){
                case "通常" : 
                    executionAmountSql = config.insertBasicMarkAmountSQL;
                    executionHorseSql = config.insertBasicMarkHorseSQL;
                    break;
                case "ボックス" :
                    executionAmountSql = config.insertBoxMarkAmountSQL;
                    executionHorseSql = config.insertBoxMarkHorseSQL;
                    break;
                default :
                    executionAmountSql = config.insertFormationMarkAmountSQL;
                    executionHorseSql = config.insertFormationMarkHorseSQL;
                    break;
            }

            // dbに保存するためにそれぞれの値を加工
            // 式別
            var ticketCategoryId = "";
            switch(raceInfo.ticket_category_name){
                case "ボックス": ticketCategoryId = "002"; break;
                case "フォーメーション": ticketCategoryId = "003"; break;
                default: ticketCategoryId = "001"; break;
            }
            // 金額単位
            var amountUnitId = "";
            switch(raceInfo.selectUnitText){
                case "千円": amountUnitId = "002"; break;
                case "万円": amountUnitId = "003"; break;
                default: amountUnitId = "001"; break;
            }
            // レース場
            var raceCourseId = "";
            switch(raceInfo.defaultBar.selectPlace){
                case "東京": raceCourseId = "002"; break;
                case "京都": raceCourseId = "003"; break;
                case "阪神": raceCourseId = "004"; break;
                case "福島": raceCourseId = "005"; break;
                case "新潟": raceCourseId = "006"; break;
                case "中京": raceCourseId = "007"; break;
                case "小倉": raceCourseId = "008"; break;
                case "札幌": raceCourseId = "009"; break;
                case "函館": raceCourseId = "010"; break;
                default: raceCourseId = "001"; break;
            }
            // チケット種別
            var ticketSelectionId = "";
            switch(raceInfo.selectFormula){
                case "複勝": ticketSelectionId = "002"; break;
                case "枠連": ticketSelectionId = "003"; break;
                case "馬連": ticketSelectionId = "004"; break;
                case "馬単": ticketSelectionId = "005"; break;
                case "ワイド": ticketSelectionId = "006"; break;
                case "三連複": ticketSelectionId = "007"; break;
                case "三連単": ticketSelectionId = "008"; break;
                default: ticketSelectionId = "001"; break;
            }

            // 馬券情報データをinsert
            connection.query(config.insertRaceInfoSQL,
                [
                    id,
                    newBettingTicketId,
                    newBettingTicketId,
                    newBettingTicketId,
                    raceInfo.defaultBar.selectDate,
                    raceCourseId,
                    raceInfo.defaultBar.selectRace_no,
                    ticketCategoryId,
                    ticketSelectionId
                ], function(error, results, fields){
                    if (error) {
                    res.send('NG');
                    return connection.rollback(() => { throw error; });
                }
            })

            // 金額データをinsert
            connection.query(executionAmountSql, 
                [
                    id,
                    newBettingTicketId,
                    amountUnitId,
                    raceInfo.selectAmount,
                    raceInfo.InvestmentAmount,
                    raceInfo.balance
                ], function (error, results, fields){
                    if (error) {
                    res.send('NG');
                    return connection.rollback(() => { throw error; });
                }
            });

            // 馬番号データをinsert
            var horseSelections = [raceInfo.horceSelection1, raceInfo.horceSelection2, raceInfo.horceSelection3];
            for(let i=0; i<horseSelections.length; i++){
                // 中身が空なら次のループへ
                if(!horseSelections[i]){
                    continue;
                }

                var selectHorseNumber1 = false;
                var selectHorseNumber2 = false;
                var selectHorseNumber3 = false;
                var selectHorseNumber4 = false;
                var selectHorseNumber5 = false;
                var selectHorseNumber6 = false;
                var selectHorseNumber7 = false;
                var selectHorseNumber8 = false;
                var selectHorseNumber9 = false;
                var selectHorseNumber10 = false;
                var selectHorseNumber11 = false;
                var selectHorseNumber12 = false;
                var selectHorseNumber13 = false;
                var selectHorseNumber14 = false;
                var selectHorseNumber15 = false;
                var selectHorseNumber16 = false;
                var selectHorseNumber17 = false;
                var selectHorseNumber18 = false;

                // DB用にデータを改変する
                // 馬番号毎にtrue or falseの形にしたい
                for(var a=0; a< horseSelections[i].length; a++){
                    switch(horseSelections[i][a]){
                        case "01": selectHorseNumber1 = true; break;
                        case "02": selectHorseNumber2 = true; break;
                        case "03": selectHorseNumber3 = true; break;
                        case "04": selectHorseNumber4 = true; break;
                        case "05": selectHorseNumber5 = true; break;
                        case "06": selectHorseNumber6 = true; break;
                        case "07": selectHorseNumber7 = true; break;
                        case "08": selectHorseNumber8 = true; break;
                        case "09": selectHorseNumber9 = true; break;
                        case "10": selectHorseNumber10 = true; break;
                        case "11": selectHorseNumber11 = true; break;
                        case "12": selectHorseNumber12 = true; break;
                        case "13": selectHorseNumber13 = true; break;
                        case "14": selectHorseNumber14 = true; break;
                        case "15": selectHorseNumber15 = true; break;
                        case "16": selectHorseNumber16 = true; break;
                        case "17": selectHorseNumber17 = true; break;
                        case "18": selectHorseNumber18 = true; break;
                    }
                }
                connection.query(executionHorseSql,
                    [
                        id,
                        newBettingTicketId,
                        ('000' + i+1).slice(-3),
                        selectHorseNumber1,
                        selectHorseNumber2,
                        selectHorseNumber3,
                        selectHorseNumber4,
                        selectHorseNumber5,
                        selectHorseNumber6,
                        selectHorseNumber7,
                        selectHorseNumber8,
                        selectHorseNumber9,
                        selectHorseNumber10,
                        selectHorseNumber11,
                        selectHorseNumber12,
                        selectHorseNumber13,
                        selectHorseNumber14,
                        selectHorseNumber15,
                        selectHorseNumber16,
                        selectHorseNumber17,
                        selectHorseNumber18
                    ], function (error, results, fields){
                        if (error) {
                            res.send('NG');
                            return connection.rollback(() => { throw error; });
                        }
                });
            }
            connection.commit((err) => {
                if (err) {
                    res.send('NG');
                    return connection.rollcack(()=>{
                        throw err;
                    });
                }
            });
            console.log("success");
            res.send('OK');
        }

    })
});


module.exports = router;

