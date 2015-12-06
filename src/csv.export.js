var util =          require('util');
var reducenames =   require('./reducenames.js');
var db =            require('./mongox.js');
var json2csv =      require('nice-json2csv');
var fs =            require('fs');
var col_score =     'reducedq';
var col_train =     'reducedq';
var today;

var done_emit =     0;
var continu =       '';
var lte_hour =      0;
var gte_hour =      0;
var continu_timeout = 8;

var setday =        0,
    setmonth =      0,
    setyear =       0;

module.exports = function(daysago, setdaya, setmontha, setyeara, mtgtype, continua, lte_houra, gte_houra) {

    today = todays_date(daysago);
    setyear = setyeara;
    setmonth = setmontha;
    setday = setdaya;

    if (mtgtype == 'A')
        mtgtype = {
            '$exists': 1
        };
    continu = continua;
    lte_hour = lte_houra;
    gte_hour = gte_houra;



    //train
    csv(0, mtgtype);

    //score
    csv(1, mtgtype);

}; //module.exports = function(daysago, setday, setmonth, setyear){




function csv(score, mtgtype) {

    append = 0;
    var pw = score ? 0 : 1; //if scoring, turn off pw
    var append_flag = append ? { flags: 'a' } : { flags: 'w' };
    var csvs = score ? __dirname+ 'csv/s.1.csv' : __dirname+ 'csv/t.1.csv';
    
    var csvstream = fs.createWriteStream(csvs, { flags: 'w' });
        csvstream = fs.createWriteStream(csvs, { flags: 'a' });
    var col;
    var t;

    if (score) {

        col = col_score;
        var month_z = setmonth < 10 ? '0' + setmonth : setmonth;
        var day_z = setday < 10 ? '0' + setday : setday;
        var lte_hour_z = lte_hour < 10 ? '0' + lte_hour : lte_hour;
        var gte_hour_z = gte_hour < 10 ? '0' + gte_hour : gte_hour;


        //score
        t = {
            "_id.Year": "" + setyear,
            "_id.Month": "" + setmonth,
            "_id.Day": "" + setday,
            'race.RaceDisplayStatus': {
                '$exists': 1
            },
            "_id.MtgType": mtgtype,
            "value": {
                "$ne": "ABANDONED"
            },
            "result.runner": {
                "$exists": "true"
            }
        };
        console.log(t);

    }
    else {

        col = col_train;

        //train
        t = {

            "_id.RaceDayDate": {
                "$gte": "" + today.iso
            },
            "$or": [{
                "race.RaceDisplayStatus": "PAYING"
            }, {
                "_id.RaceDisplayStatus": "PAYING"
            }]

            ,
            "_id.MtgType": mtgtype,
            "value": {
                "$ne": "ABANDONED"
            },
            "result.runner": {
                "$exists": "true"
            }

        };
        console.log(t);
    }


    //excludes
    var p = {

        //"value": 0,
        //"race": 0,

        "result.resultplace": 0,
        "result.tipstertip": 0,
        "result.pool": 0,
        "result.sub": 0,

        "result.runner.attributes.Handicap": 0,
        "result.runner.attributes.ScratchStatus": 0,
        "result.runner.attributes.Scratched": 0,
        "result.runner.attributes.RiderChanged": 0,
        "result.runner.attributes.JockeySilk": 0

        ,
        "result.runner.FixedOdds": 0

        ,
        "result.runner.WinOdds.attributes.Short": 0,
        "result.runner.WinOdds.attributes.LastCalcTime": 0,
        "result.runner.WinOdds.attributes.CalcTime": 0,
        "result.runner.PlaceOdds.attributes.Short": 0,
        "result.runner.PlaceOdds.attributes.LastCalcTime": 0,
        "result.runner.PlaceOdds.attributes.CalcTime": 0

    };


    var score_win = [];
    var score_pla = [];
    var win = [];
    var pla = [];
    var w = 0;
    var q = 0;
    var j = [];
    var k = [];
    var divs = {};
    var id = {};
    var tips = "";
    var rnames;
    var headers;

    if (pw) 
        headers = ["id.Month", "id.Day", "id.DayOfTheWeek", "id.MeetingCode", "id.RaceNo", "id.MtgType", "id.TrackCond", "id.TrackRating", "id.WeatherCond", "id.Distance", "r.attributes.RunnerNo", "r.attributes.RunnerName", "r.attributes.Rider", "r.attributes.Barrier", "r.attributes.Weight", 'r.attributes.Form.0','r.attributes.Form.1','r.attributes.Form.2','r.attributes.LastResult.0','r.attributes.LastResult.1','r.attributes.LastResult.2', "r.attributes.Rtng", "r.WinOdds.0.attributes.Odds", "r.WinOdds.0.attributes.Lastodds", "r.PlaceOdds.0.attributes.Odds", "r.PlaceOdds.0.attributes.Lastodds", "outcome"];
    else 
        headers = ["id.Month", "id.Day", "id.DayOfTheWeek", "id.MeetingCode", "id.RaceNo", "id.MtgType", "id.TrackCond", "id.TrackRating", "id.WeatherCond", "id.Distance", "r.attributes.RunnerNo", "r.attributes.RunnerName", "r.attributes.Rider", "r.attributes.Barrier", "r.attributes.Weight", 'r.attributes.Form.0','r.attributes.Form.1','r.attributes.Form.2','r.attributes.LastResult.0','r.attributes.LastResult.1','r.attributes.LastResult.2', "r.attributes.Rtng", "r.WinOdds.0.attributes.Odds", "r.WinOdds.0.attributes.Lastodds", "r.PlaceOdds.0.attributes.Odds", "r.PlaceOdds.0.attributes.Lastodds"];        
    
    csvstream.write(''+ headers + "\n");


    //db.collection(col).find(t, p).toArray(function(err, docs) {
    db.collection(col).find(t, p).limit(2).toArray(function(err, docs) {
        if (err) console.log(err);

        //console.log(docs[0].result[0].runner[0].WinOdds); 
        //console.log(util.inspect(docs[0].result, false, null)); 

        
        if (docs) {
            docs.forEach(function(doc,i) {

                id = {
                    "Month":            doc._id.Month,
                    "Day":              doc._id.Day,
                    "DayOfTheWeek":     doc._id.DayOfTheWeek,
                    "MeetingCode":      doc._id.MeetingCode,
                    "RaceNo":           doc._id.RaceNo,
                    "MtgType":          doc._id.MtgType,
                    "Distance":         doc._id.Distance,
                    'SubFav':           doc.race.SubFav,
                    'TrackCond':        doc.race.TrackCond,
                    'TrackRating':      doc.race.TrackRating,
                    'WeatherCond':      doc.race.WeatherCond,                        
                };
                r = doc.result;


                //set places and dividends
                if (doc.value && doc.value[0] && doc.value[0].dividends) {
                    for (var dividends in doc.value[0].dividends) {
                        divs[dividends] = doc.value[0].dividends[dividends];
                        if (doc.value[0].dividends[dividends].w)
                            win = doc.value[0].dividends[dividends].r;
                        pla.push(doc.value[0].dividends[dividends].r);
                    }
                }


                if (doc.result && doc.result[0] && doc.result[0].runner) {


                    //clean up some data
                    for (var runner in doc.result[0].runner) {
                        if (doc.result[0].runner[runner].WinOdds && doc.result[0].runner[runner].WinOdds[0] && doc.result[0].runner[runner].WinOdds[0].attributes) {
                            if (doc.result[0].runner[runner].WinOdds[0].attributes.Odds == "1638.35" || doc.result[0].runner[runner].WinOdds[0].attributes.Odds == "1638.30")
                                doc.result[0].runner[runner].WinOdds[0].attributes.Odds = "0";
                            if (doc.result[0].runner[runner].WinOdds[0].attributes.Lastodds == "1638.35" || doc.result[0].runner[runner].WinOdds[0].attributes.Lastodds == "1638.30")
                                doc.result[0].runner[runner].WinOdds[0].attributes.Lastodds = "0";
                        }
                        if (doc.result[0].runner[runner].PlaceOdds && doc.result[0].runner[runner].PlaceOdds[0] && doc.result[0].runner[runner].PlaceOdds[0].attributes) {
                            if (doc.result[0].runner[runner].PlaceOdds[0].attributes.Odds == "1638.35" || doc.result[0].runner[runner].PlaceOdds[0].attributes.Odds == "1638.30")
                                doc.result[0].runner[runner].PlaceOdds[0].attributes.Odds = "0";
                            if (doc.result[0].runner[runner].PlaceOdds[0].attributes.Lastodds == "1638.35" || doc.result[0].runner[runner].PlaceOdds[0].attributes.Lastodds == "1638.30")
                                doc.result[0].runner[runner].PlaceOdds[0].attributes.Lastodds = "0";
                        }
                        if (doc.result[0].runner[runner].FixedOdds && doc.result[0].runner[runner].FixedOdds[0] && doc.result[0].runner[runner].FixedOdds[0].attributes) {
                            if (doc.result[0].runner[runner].FixedOdds[0].attributes.WinOdds && (doc.result[0].runner[runner].FixedOdds[0].attributes.WinOdds == "1638.35" || doc.result[0].runner[runner].FixedOdds[0].attributes.WinOdds == "1638.30"))
                                doc.result[0].runner[runner].FixedOdds[0].attributes.WinOdds = "0";
                            if (doc.result[0].runner[runner].FixedOdds[0].attributes.PlaceOdds && (doc.result[0].runner[runner].FixedOdds[0].attributes.PlaceOdds == "1638.35" || doc.result[0].runner[runner].FixedOdds[0].attributes.PlaceOdds == "1638.30"))
                                doc.result[0].runner[runner].FixedOdds[0].attributes.PlaceOdds = "0";
                            if (doc.result[0].runner[runner].FixedOdds[0].attributes.RetailWinOdds && (doc.result[0].runner[runner].FixedOdds[0].attributes.RetailWinOdds == "1638.35" || doc.result[0].runner[runner].FixedOdds[0].attributes.RetailWinOdds == "1638.30"))
                                doc.result[0].runner[runner].FixedOdds[0].attributes.RetailWinOdds = "0";
                            if (doc.result[0].runner[runner].FixedOdds[0].attributes.RetailPlaceOdds && (doc.result[0].runner[runner].FixedOdds[0].attributes.RetailPlaceOdds == "1638.35" || doc.result[0].runner[runner].FixedOdds[0].attributes.RetailPlaceOdds == "1638.30"))
                                doc.result[0].runner[runner].FixedOdds[0].attributes.RetailPlaceOdds = "0";
                        }
                    }



                    for (var runner in doc.result[0].runner) {

                        k = {
                            "id":   id,
                            "r":    doc.result[0].runner[runner]
                        };

                        if (pw)
                            k.outcome = pla.indexOf(k.r.attributes.RunnerNo) > -1 ? 1 : 0;
                                                
                        if(k.r.attributes.Form)
                            k.r.attributes.Form = k.r.attributes.Form.split('');
                        
                        if(k.r.attributes.LastResult)
                            k.r.attributes.LastResult = k.r.attributes.LastResult.split('');
                        
                        csvstream.write(
                            json2csv.convert(
                                flattenObject(k), 
                                headers, 
                                true
                            ) +"\n"
                        );

                    }

                } 

                //clear other array
                win = 0;
                pla = [];


                if(docs.length-1 == i){
                    console.log('done: csv'); 
                    //db.close();
                    //csvstream.end();
                }

            });            
        } 
    }); 



    /*
    
        helper functions
    
    */
    var flatten = function(ob) {
        var toReturn = {};

        for (var i in ob) {
            if (!ob.hasOwnProperty(i)) continue;

            if ((typeof ob[i]) == 'object') {
                var flatObject = flattenObject(ob[i]);
                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue;

                    toReturn[i + '.' + x] = flatObject[x];
                }
            }
            else {
                toReturn[i] = ob[i];
            }
        }
        return toReturn;
    };


    var flattenObject = function(data) {
        var result = {};

        function recurse(cur, prop) {
            if (Object(cur) !== cur) {
                result[prop] = cur;
            }
            else if (Array.isArray(cur)) {
                for (var i = 0, l = cur.length; i < l; i++)
                    recurse(cur[i], prop + '.' + i);
                if (l === 0)
                    result[prop] = [];
            }
            else {
                var isEmpty = true;
                for (var p in cur) {
                    isEmpty = false;
                    recurse(cur[p], prop ? prop + "." + p : p);
                }
                if (isEmpty && prop)
                    result[prop] = {};
            }
        }
        recurse(data, "");
        return result;
    };





    var filtered_keys = function(filter, names) {

        var key = "";
        var count = 0;
        for (var i = 0; i < names.length; i++) {
            if (filter.test(names[i]._id)) {
                if (names[i].value > count) {

                    count = names[i].value;
                    key = names[i]._id;

                }
            }
        }

        return key;
    };


    var getname = function(x) {

        var rr = x.name.split(" ");
        var tt, yy;
        var ee = rr.length - 1;

        if (ee >= 1) {

            //build regex        				
            //eg; LATE MAIL: /^LAT.*IL$|^.*ATE.*MA.*$/i 
            tt = "^" + rr[0].substr(0, 3) + ".*" + rr[ee].substr(rr[ee].length - 2, rr[ee].length) + "$" + "|" +
                "^.*" + rr[0].substr(rr[0].length - 3, rr[0].length) + ".*" + rr[ee].substr(0, 2) + ".*$";
            tt = new RegExp(tt, "i");


            //if fails, use original name
            yy = filtered_keys(tt) || x.name;


        }
        else {

            //TODO: single name checks
            yy = x.name;

        }

        //names that dont match	
        if (yy == "WATCHDOG" || yy == "WATHCHDOG")
            yy = "THE WATCHDOG";
        else if (yy == "DAMIEN COURTNRY")
            yy = "DAMIAN COURTNEY";



    };


    var getnames = function(callback) {

        db.collection("tnamesD").find().toArray(function(err, docsa) {
            if (err) console.log(err);

            callback(docsa);

        });

    };



} //function csv(write, append, score, type){




function todays_date(ago) {

    var today = new Date();
    var offset = 10; //timezone aus/syd +10
    var utc = today.getTime() + (today.getTimezoneOffset() * 60000);
    today = new Date(utc + (3600000 * offset));
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    var todayD = today.getDate() - ago; // 2 weeks ago
    today.setDate(todayD);
    var iso = today.toISOString();


    return {
        "day": dd,
        "month": mm,
        "year": yyyy,
        "iso": iso
    };

}
