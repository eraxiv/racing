var util =                  require('util')                                     ;
var https =                 require('https')                                    ;
var xml2js =                require('xml2js')                                   ;
var db =                    require('./mongox.js')                              ;
var parser =                new xml2js.Parser({ attrkey: 'attributes' })        ;
var timeout =               20000                                               ;
var dbcollection =          'reducedq'                                          ; 



/*

    init

*/
module.exports = function(daysago, setday, setmonth, setyear, continu) {


    if (continu) setTimeout((function() {
        process.emit('csv');
    }), 4 * 60000);


    var url = "";
    var today = todays_date(daysago); //days ago

    var dd = setday || today.day;
    var mm = setmonth || today.month;
    var yyyy = setyear || today.year;


    //eg: 'https://tatts.com/pagedata/racing/2014/1/2/RaceDay.xml';
    url = "https://tatts.com/pagedata/racing/" + yyyy + "/" + mm + "/" + dd + "/RaceDay.xml";


    //output for logging
    console.log("url: ", url);


    //timout secs
    setTimeout(getraceday(url), timeout);


};



function getraceday(url) {

    //get raceday
    getxml(url, function(raceday) {
        if (raceday == 'err') return null;

        getmeetingxml(raceday, function(meeting) {

            //var i = 1;
            for (var i = 0; i < meeting.length; i++) {

                //timout secs
                setTimeout(getmeeting(meeting[i]), timeout);
            }

        });
    });

}





/**
 *  Insert here <----------------------------------------------------------------------------------------------- mongo insert function
 * 
 * 
 */

function getmeeting(url, length, i) {


    //eg: 'https://tatts.com/pagedata/racing/2014/1/2/QR1.xml';
    getxml(url, function(meeting) {
        if (meeting == 'err') return null;

        reducemeeting(meeting, function(id, reducedmeeting) {


            try {


                db.collection(dbcollection).update(
                    id, reducedmeeting, {
                        upsert: true
                    }
                );


                //console.log(id);


            }
            catch (e) {
                console.log('error insert: ', e);
            }

        });

    });

}



/***
 *
 * get methods
 *
 ***/
function getmeetingxml(result, callback) {

    var year = result.RaceDay.attributes.Year;
    var month = result.RaceDay.attributes.Month;
    var day = result.RaceDay.attributes.Day;
    var meeting = [];
    var meeting_temp;

    
    for (var i = 0; i < result.RaceDay.Meeting.length; i++) {

        var hiraceno = result.RaceDay.Meeting[i].attributes.HiRaceNo;
        var meetingcode = result.RaceDay.Meeting[i].attributes.MeetingCode;


        console.log('meetingcode: ' + meetingcode + ' hiraceno: ' + Number(hiraceno));


        for (var j = 1; j < Number(hiraceno) + 1; j++) {

            //https://tatts.com/pagedata/racing/2011/10/5/BR7.xml 
            meeting_temp = 'https://tatts.com/pagedata/racing/' + year + '/' + month + '/' + day + '/' + meetingcode + j + '.xml';
            meeting.push(meeting_temp);

            console.log('meeting: ', meeting_temp);

        }
    }

    //return meeting;
    callback(meeting);

}



function getxml(url, callback) {

    var req = https.get(url, function(res) {

        if (res.statusCode == 404) {
            callback('err');
            return null;
        }

        //save the data
        var xml = '';
        res.on('data', function(chunk) {
            xml += chunk;
        });

        //parse xml then return
        res.on('end', function() {
            parser.parseString(xml, function(err, result) {
                console.log(err);

                callback(result);

            });
        });

    });

    req.on('error', function(err) {
        console.log('ERR getxml: ', err);
        return 0;
    });

}


function mergeobj(obj1, obj2) {
    var obj3 = {};
    for (var attrname1 in obj1) {
        obj3[attrname1] = obj1[attrname1];
    }
    for (var attrname2 in obj2) {
        obj3[attrname2] = obj2[attrname2];
    }
    return obj3;
}





function reducemeeting(meeting, callback) {

    try {

        if (meeting && meeting.RaceDay) {
            meeting = meeting.RaceDay;
        }

        var a = meeting.attributes;
        var m = meeting.Meeting[0].attributes;
        var r = meeting.Meeting[0].Race[0].attributes;
        var z = meeting.Meeting[0].Race[0].ResultPlace;
        var x = meeting.Meeting[0].Race[0].TipsterTip;
        var u = meeting.Meeting[0].Race[0].Runner;

        var k = {
            "a": a,
            "m": m,
            "r": r
        };
        var v = {
            "z": z,
            "x": x,
            "u": u
        };

        //merge id
        var id = mergeobj(a, mergeobj(m, r));


        if ((k.r.RaceDisplayStatus && k.r.RaceDisplayStatus == "ABANDONED") || v.z === null || v.x === null) {

            callback({
                '_id': id,
                'value': 'ABANDONED'
            });
            return '';
        }

        var resultplace = v.z;
        var tipstertip = v.x;
        var runners = v.u;

        var c, n = "";

        var i, j, l = 0;
        k = 0;

        var selectedtips = [];
        var tipstertotal = [];
        var places = [];
        var dividends = [];

        /*
         *  fill selectedtips
         *  create blank tipstertotal
         *
         */

        if (tipstertip && tipstertip.attributes && tipstertip.attributes.Tips) {
            c = tipstertip.attributes.Tips;

            c = c.replace("*", "");
            c = c.replace("+", "");
            c = c.split("-");

            selectedtips.push(c);

            tipstertotal.push({
                name: tipstertip.Tipster.attributes.TipsterName,
                correctplace: 0,
                placeprofitpercentage: 0,
                tips: "",
                winprofit: 0,
                placeprofit: 0,
                firstplaceprofit: 0,
                spend: 0
            });


        }
        else {

            for (i in tipstertip) {
                if (tipstertip[i].attributes && tipstertip[i].attributes.Tips) {
                    c = tipstertip[i].attributes.Tips;

                    c = c.replace("*", "");
                    c = c.replace("+", "");
                    c = c.split("-");

                    selectedtips.push(c);


                    tipstertotal.push({
                        name: tipstertip[i].Tipster[0].attributes.TipsterName,
                        correctplace: 0,
                        placeprofitpercentage: 0,
                        tips: "",
                        winprofit: 0,
                        placeprofit: 0,
                        firstplaceprofit: 0,

                        spend: 0
                    });


                }
            }
        }



        /*
         *  fill places
         *
         *
         */

        for (i in resultplace)
            for (j in resultplace[i])
                for (k in resultplace[i][j])
                    if (resultplace[i][j][k].attributes && resultplace[i][j][k].attributes.RunnerNo && (k % 2) === 0)

                        places.push(resultplace[i][j][k].attributes.RunnerNo);



        /*
        *
        *   fill percentages
        *
        */
        var correctplacecount = 0;
        for (i = 0; i < selectedtips.length; i++) {

            for (j = 0; j < selectedtips[i].length; j++) {
                if (places.indexOf(selectedtips[i][j]) > -1) {
                    correctplacecount++;
                }
            }

            //calculate profit percentage from correct tips and total tips
            correctplacecount = (correctplacecount / selectedtips[i].length) * 100;


            tipstertotal[i].correctplace = correctplacecount;
            tipstertotal[i].tips = selectedtips[i];
            tipstertotal[i].spend = selectedtips[i].length;

            //reset profit percentage counter
            correctplacecount = 0;

        }


        /*
         *  fill dividends
         *
         *
         */

        for (i in resultplace) {

            //runner no
            if (resultplace[i].Result[0] && resultplace[i].Result[0].attributes && resultplace[i].Result[0].attributes.RunnerNo)

                j = resultplace[i].Result[0].attributes.RunnerNo;

            else if (resultplace[i].Result && resultplace[i].Result.attributes && resultplace[i].Result.attributes.RunnerNo)

                j = resultplace[i].Result.attributes.RunnerNo;

            else
                j = "";


            //pp
            if (resultplace[i].Result[0] && resultplace[i].Result[0][0] && resultplace[i].Result[0][0].attributes && resultplace[i].Result[0][0].attributes.Dividend && resultplace[i].Result[0][0].attributes.PoolType == "PP")

                k = resultplace[i].Result[0][0].attributes.Dividend;

            else if (resultplace[i].Result[0] && resultplace[i].Result[0].PoolResult[0] && resultplace[i].Result[0].PoolResult[0].attributes && resultplace[i].Result[0].PoolResult[0].attributes.Dividend && resultplace[i].Result[0].PoolResult[0].attributes.PoolType == "PP")

                k = resultplace[i].Result[0].PoolResult[0].attributes.Dividend;

            else
                k = "";


            //ww
            if (resultplace[i].Result[1] && resultplace[i].Result[1][0] && resultplace[i].Result[1][0].attributes && resultplace[i].Result[1][0].attributes.Dividend && resultplace[i].Result[1][0].attributes.PoolType == "WW")

                l = resultplace[i].Result[1][0].attributes.Dividend;

            else if (resultplace[i].Result[1] && resultplace[i].Result[1].PoolResult[0] && resultplace[i].Result[1].PoolResult[0].attributes && resultplace[i].Result[1].PoolResult[0].attributes.Dividend && resultplace[i].Result[1].PoolResult[0].attributes.PoolType == "WW")

                l = resultplace[i].Result[1].PoolResult[0].attributes.Dividend;

            else
                l = "";


            //runner name
            for (var o in runners)
                if (runners[o].attributes.RunnerNo == j)
                    n = runners[o].attributes.RunnerName;


                //push to dividends array
            dividends.push({
                "r": j,
                "p": k,
                "w": l,
                "n": n
            });


            //clear temp var
            j, k, l, n = "";

        }



        /*
         *
         *  fill winprofit, placeprofit, firstplaceprofit, placeprofitpercentage
         *
         */

        i, k, j = 0;
        for (i = 0; i < tipstertotal.length; i++) {

            if (tipstertotal[i].tips) {

                for (j = 0; j < tipstertotal[i].tips.length; j++) {

                    for (k = 0; k < dividends.length; k++) {

                        if (dividends[k].r == tipstertotal[i].tips[j]) {

                            if (j === 0 && k === 0 && dividends[k].w) tipstertotal[i].winprofit = Number(dividends[k].w);

                            if (j === 0 && k === 0 && dividends[k].p) tipstertotal[i].firstplaceprofit = Number(dividends[k].p);

                            if (dividends[k].p) tipstertotal[i].placeprofit += Number(dividends[k].p);

                        }

                    }

                }

            }

            tipstertotal[i].placeprofitpercentage = (tipstertotal[i].placeprofit / tipstertotal[i].spend) * 100;

        }

        callback({
            '_id': {
                "Year":         id.Year,
                "Month":        id.Month,
                "Day":          id.Day,
                "MeetingCode":  id.MeetingCode,
                "MtgType":      id.MtgType,
                "RaceNo":       id.RaceNo,
                "VenueName":    id.VenueName,
                "MonthLong":    id.MonthLong,
                "DayOfTheWeek": id.DayOfTheWeek,
                "WeatherDesc":  id.WeatherDesc || "",
                "TrackDesc":    id.TrackDesc || "",
                "RaceName":     id.RaceName,
                "Distance":     id.Distance,
                "RaceDayDate":  id.RaceDayDate
            }
        }, {
            '_id': {
                "Year":         id.Year,
                "Month":        id.Month,
                "Day":          id.Day,
                "MeetingCode":  id.MeetingCode,
                "MtgType":      id.MtgType,
                "RaceNo":       id.RaceNo,
                "VenueName":    id.VenueName,
                "MonthLong":    id.MonthLong,
                "DayOfTheWeek": id.DayOfTheWeek,
                "WeatherDesc":  id.WeatherDesc || "",
                "TrackDesc":    id.TrackDesc || "",
                "RaceName":     id.RaceName,
                "Distance":     id.Distance,
                "RaceDayDate":  id.RaceDayDate
            },

            'value': [{
                "dividends":    dividends,
                "tipstertotal": tipstertotal
            }],

            'result': [{
                "resultplace":  meeting.Meeting[0].Race[0].ResultPlace,
                "tipstertip":   meeting.Meeting[0].Race[0].TipsterTip,
                "runner":       meeting.Meeting[0].Race[0].Runner,
                "pool":         meeting.Meeting[0].Race[0].Pool,
                "sub":          meeting.Meeting[0].Race[0].SubFavCandidate
            }],

            'race': id
        });


    }
    catch (e) {
        console.log('err reducedmeeting:', e);

    }

} //reducemeeting()



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





console.log('done');

