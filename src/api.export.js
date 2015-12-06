var apikey, workspace, services, score, payload, scored, train, train_url, score_url;
var scorejs =           require('./score.js');
var db =                require('./mongox.js');
var Converter =         require("csvtojson").core.Converter;
var csvConverter =      new Converter();
var scoredb =           'scoredbq';
var evaldb =            'evaldb';
var debug =             0;

module.exports = function(type, loopi, loop, day, month, year, score_csv_mtgtype, timeoutsecs, continu) {

    apikey = "[apikey]";
    workspace = "[workspace]";
    services = "[services]";
    score = "jobs";
    payload = {
        "GlobalParameters": {},
        "Outputs": {
            "res": {
                "ConnectionString": "[ConnectionString]",
                "RelativeLocation": "mycontainer/resresults.csv"
            }
        }
    };

    var scorex = {


        init: function() {

            //score init
            scorejs.post(apikey, workspace, services, score, payload, function(jobid) {

                //score running
                if (jobid) {
                    console.log(jobid);
                    scorex.loopa(apikey, workspace, services, score, payload, jobid);

                }

            });

        }


        ,
        loopa: function(apikey, workspace, services, score, payload, jobid) {

            function myLoop(apikey, workspace, services, score, payload, jobid) {

                scorejs.get(apikey, workspace, services, score, payload, jobid, function(data) {

                    if (data) {

                        console.log('status: ' + data.StatusCode, 'type: ' + type);
                        if (debug) console.log(data);

                        if (data.StatusCode === 0 || data.StatusCode == "Not started" || data.StatusCode == "NotStarted") {
                            //Not started 

                            setTimeout(function() {
                                scorex.loopa(apikey, workspace, services, score, payload, jobid);
                            }, timeoutsecs);

                        }
                        else if (data.StatusCode === 1 || data.StatusCode == "Running") {
                            //Running

                            setTimeout(function() {
                                scorex.loopa(apikey, workspace, services, score, payload, jobid);
                            }, timeoutsecs);

                        }
                        else if (data.StatusCode === 2 || data.StatusCode == "Failed") {
                            //Failed
                        }
                        else if (data.StatusCode === 3 || data.StatusCode == "Cancelled") {
                            //Cancelled
                        }
                        else if (data.StatusCode === 4 || data.StatusCode == "Finished") {
                            //Finished

                            scorex.finished(apikey, workspace, services, score, payload, jobid, data);

                        }

                    }

                });


            }

            //initiate loop
            myLoop(apikey, workspace, services, score, payload, jobid);
        }


        ,
        finished: function(apikey, workspace, services, score, payload, jobid, data) {

            var result = scorejs.batch(
                data.Results.res.BaseLocation + data.Results.res.RelativeLocation + data.Results.res.SasBlobToken,
                function(csv) {

                    //delete batch job once complete
                    csvConverter.on("end_parsed", function(jsonObj) {
                        scorejs.delete(apikey, workspace, services, score, {}, jobid, function(data) {

                            if (type === 1 && continu)
                                process.emit('3tp', 'aa');


                            if (debug) console.log(data);
                            return 0;
                        });
                    });

                    if (csv) {
                        csvConverter.fromString(csv, function(err, jsonObj) {

                            if (debug) console.log(jsonObj);


                            if (err)
                                console.log('api: ', err);


                            try {
                                db.collection(evaldb).insert({

                                    "_id": {
                                        'date': (new Date()).getTime(),
                                        "jobid": jobid
                                    },

                                    "eval": {
                                        "acc": jsonObj[0]["Accuracy"].toFixed(2),
                                        "prec": jsonObj[0]["Precision"].toFixed(2),
                                        "recall": jsonObj[0]["Recall"].toFixed(2),
                                        "fscore": jsonObj[0]["F-Score"].toFixed(2),
                                        "auc": jsonObj[0]["AUC"].toFixed(2),
                                        "all": jsonObj[0]["Average Log Loss"].toFixed(2),
                                        "tll": jsonObj[0]["Training Log Loss"].toFixed(2),
                                    },

                                    "xval": {
                                        "acc": jsonObj[1]["Accuracy"].toFixed(2),
                                        "prec": jsonObj[1]["Precision"].toFixed(2),
                                        "recall": jsonObj[1]["Recall"].toFixed(2),
                                        "fscore": jsonObj[1]["F-Score"].toFixed(2),
                                        "auc": jsonObj[1]["AUC"].toFixed(2),
                                        "all": jsonObj[1]["Average Log Loss"].toFixed(2),
                                        "tll": jsonObj[1]["Training Log Loss"].toFixed(2),
                                    }
                                });
                            }
                            catch (e) {
                                console.log('error insert: ', e);
                            }


                            var tofixed = 5;
                            jsonObj.forEach(function(doc) {

                                if (debug) console.log(doc);

                                try {
                                    db.collection(scoredb).insert({

                                        "m": doc.id.Month,
                                        "d": doc.id.Day,
                                        "n": doc.id.RaceNo,
                                        "c": doc.id.MeetingCode,
                                        "t": doc.id.MtgType,
                                        "r": doc.r.attributes.RunnerNo,
                                        "rn": doc.r.attributes.RunnerName,
                                        "u": (new Date()).getTime(),
                                        "l": doc["Scored Probabilities"].toFixed(tofixed) > jsonObj[0]["AUC"].toFixed(tofixed),
                                        "p": doc["Scored Probabilities"].toFixed(tofixed),
                                        "a": jsonObj[0]["AUC"].toFixed(tofixed)
                                    });
                                }
                                catch (e) {
                                    console.log('error insert: ', e);
                                }

                            });

                        });

                        console.log('insert', jobid);
                        //db.close();

                    }

                }
            );

        }

    };


    new scorex.init();
};
