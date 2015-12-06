var util =              require('util')                         ;
var db =                require('./mongox.js')                  ;
var p =                 ''                                      ;
var t_check =           ''                                      ;
var prodb =             'prodb'                                 ;
var scoredb =           'scoredb'                               ;
var reduceddb =         'reducedq'                              ;
var pdb =               'pdb'                                   ; 
var odb =               'odb'                                   ;

var label =             true                                    ;
var month =             0                                       ;
var day =               0                                       ;
var mtgx =              ''                                      ;

var prob =              {"$gte":"0.10"}                         ; 
//var prob =            {"$gte":"0.80", "$lte":"0.99"};

var continu =           0                                      ;
var lte_hour = 0, gte_hour = 0;

var rtimet;
var rtimep = {
      '_id':0, 
      'value':0,
      'result':0,
      
       'race.Year':0, 
       'race.Month':0, 
       'race.Day':0, 
       'race.DayOfTheWeek':0,  
       'race.MonthLong':0,  
       'race.IsCurrentDay':0, 
       'race.IsPresaleMeeting':0, 
       'race.ServerTime':0, 
       'race.MeetingCode':0,  
       'race.MtgId':0, 
       'race.VenueName':0, 
       'race.MtgType':0,  
       'race.TrackRatingChanged':0, 
       'race.WeatherChanged':0, 
       'race.TrackChanged':0, 
       'race.MtgAbandoned':0, 
       'race.TotalTrio':0, 
       'race.RaceNo':0, 
       'race.RaceName':0, 
       'race.Distance':0, 
       'race.SubFav':0, 
       'race.RaceDisplayStatus':0, 
       'race.WeatherCond':0, 
       'race.TrackCond':0, 
       'race.TrackRating':0,
       'race.RaceDayDate':0        
        };




module.exports = function(montha, daya, scorea, dollaa, mtgtype, continua, lte_houra, gte_houra){

    continu = continua;

    month =     montha        ;
    day =       daya          ;
    mtgx =      mtgtype       ;
    lte_hour = lte_houra;
    gte_hour = gte_houra;
    
    if(mtgtype == 'A') mtgx = {'$exists':1};

    if(scorea && !dollaa){ db_3tp();   }
    if(dollaa && !scorea){ dollardb(); }
    
};


 
/**
 * 
 * 3tp  
 * 
*/  
function db_3tp(){

    
    t_check = {
        "_id.Month":month,
        "_id.Day":day,   
        "_id.train":"3tp",
        "_id.mtgtype":mtgx,
        "prob":prob,
        "label":label
    };
    p = {"_id":1};


    var find_or = [];
    db_check(scoredb, t_check, p, function(x){ 
    
        x.forEach(function (doc, i, o) {
            
            find_or.push( 
                {"$and": [ 
                        {"_id.tipr":        doc._id.tipr}, 
                        {"_id.MeetingCode": doc._id.MeetingCode}, 
                        {"_id.RaceNo":      doc._id.RaceNo} 
                ]} 
            );
        
        });
        
        if(find_or)
            db_1tp(find_or);
            //db_run(find_or);

        
console.log('db_3tp');        

        
    });
    
}



/**
 * 
 * 1tp
 * 
*/
function db_1tp(find_or) {

    t_check = {
        "_id.Month": month,
        "_id.Day": day,
        "_id.train": "1tp",
        "_id.mtgtype":mtgx,
        "prob":prob,
        "label": label,
        "$or":find_or
    };
    p = {"_id":1};
    
    find_or = [];
    db_check(scoredb, t_check, p, function(x){ 

        x.forEach(function (doc, i, o) {
            
            //console.log(doc);
            find_or.push( 
                {"$and": [ 
                        {"_id.tipr":        doc._id.tipr}, 
                        {"_id.MeetingCode": doc._id.MeetingCode}, 
                        {"_id.RaceNo":      doc._id.RaceNo},
                        {"_id.runner.attributes.RunnerNo":doc._id.tip}
                ]} 
            );
        
        });
        
        if(find_or)
            db_run(find_or);


console.log('db_1tp');
        
    });

}



/**
 * 
 * run
 * 
*/
function db_run(find_or){

    t_check = {
        "_id.Month": month,
        "_id.Day": day,
        "_id.train": "run",
        "_id.mtgtype":mtgx,
        "prob":prob,
        "label": label,
        "$or":find_or
    };
    p = {};        
    
    db_check(scoredb, t_check, p, function(x){ 
        
        x.forEach(function (doc, i, o) {

            //get racetime from reducedq
            rtimet = {  
                '_id.Year':             '2015',
                "_id.Month" :           ''+doc._id.Month,
                "_id.Day" :             ''+doc._id.Day,
                "_id.RaceNo" :          ''+doc._id.RaceNo,
                "_id.MeetingCode" :     ''+doc._id.MeetingCode,
                "_id.MtgType" :         ''+doc._id.mtgtype
                ,"value":               { "$ne": "ABANDONED" }
                ,"result.runner":       { "$exists": "true" }        
            };
            
            db.collection(reduceddb).find(rtimet, rtimep).limit(1).toArray(function(err, docsa) {
            
                if(docsa.length)

                db_write(prodb, 
                    {_id:{ //search
                        "Month":    doc._id.Month,
                        "Day":      doc._id.Day,
                        "RaceNo":   doc._id.RaceNo,
                        "MeetingCode": doc._id.MeetingCode,
                        "mtgtype":  doc._id.mtgtype,
                        "tipr":     doc._id.tipr,
                        "runner":   doc._id.runner.attributes.RunnerNo
                    }}
                    ,{_id:{ //insert
                        "Month":    doc._id.Month,
                        "Day":      doc._id.Day,
                        "RaceNo":   doc._id.RaceNo,
                        "MeetingCode": doc._id.MeetingCode,
                        "mtgtype":  doc._id.mtgtype,
                        "tipr":     doc._id.tipr,
                        "runner":   doc._id.runner.attributes.RunnerNo
    
                        ,'rtime':docsa[0].race.RaceTime
                        
                    },"prob":       doc.prob}
                );
        
            });

        });
        console.log('db_run');


    //continue to dol, wait 10 secs
    if(continu) setTimeout( (function(){ process.emit('dol') }) ,1000 );


    });
}





/**
 * 
 * check db
 * 
*/
function db_check(db_check, check, p, callback){

    db.collection(db_check).find(check,p).toArray(function (err, docs) {
    
        if(err)
            console.log('err db_check: '+err); 
     
        if(docs)
            callback(docs);
    });

}



/**
 * 
 * write to db
 * 
*/
function db_write(prodb, id, p, callback){

    var endstream = db.collection(prodb).update(
        id,
        p, 
        { upsert: true }
    );
    
}



/**
 * 
 * get profit
 * 
*/
function dollardb(){

    var id,ins=[],mon,dya,mtg,uu,ii,oo,yy,pp,tt,aa=0,cc=0,vv=0,bb=0,rtime;

    var year = '2015';
    var month_zeropad =     month<10        ? '0'+month     : month         ;
    var day_zeropad =       day<10          ? '0'+day       : day           ;
    var lte_hour_z =        lte_hour<10     ? '0'+lte_hour  : lte_hour      ;
    var gte_hour_z =        gte_hour<10     ? '0'+gte_hour  : gte_hour      ;


    var t_check = {
        "_id.Month":month,
        "_id.Day":day,   
        "_id.mtgtype":mtgx,
        "_id.rtime" : {
            '$lte': year +'-'+ month_zeropad +'-'+ day_zeropad +'T'+ lte_hour_z +':00:00',
            '$gte': year +'-'+ month_zeropad +'-'+ day_zeropad +'T'+ gte_hour_z +':00:00'
        },        
        "prob":prob,
    };

    db.collection(prodb).find(t_check).limit(500).toArray(function (err, docs) {
    //db.collection(prodb).find().toArray(function (err, docs) {      
        if(err)console.log(err); 

          
        if(docs)
        docs.forEach(function (doc, i, o) {
        
    
            vv++;
            db.collection(reduceddb).aggregate(
                {"$match":{
                    "_id.Year":         "2015",
                    "_id.Month" :       ""+doc._id.Month+"",
                    "_id.Day" :         ""+doc._id.Day+"",    
                    "_id.RaceNo" :      ""+doc._id.RaceNo+"",
                    "_id.MeetingCode" : ""+doc._id.MeetingCode+"",
                    "_id.MtgType":      ""+doc._id.mtgtype+"",
                    "value.dividends.r": ""+doc._id.runner+""
                }},

                {"$unwind":"$value"},
                {"$unwind":"$value.dividends"},
                {"$match":{"value.dividends.r":""+doc._id.runner+""} },    

                {"$group":{ 
                    "_id":"$_id", 
                    "x":{"$push":{

                        "mon":"$_id.Month",
                        "dya":"$_id.Day",    
                        "rno":"$_id.RaceNo",
                        "mcd":"$_id.MeetingCode",
                        "mtg":"$_id.MtgType",

                        "t":"$value.tipstertotal.name", 
                        "n":"$_id.RaceNo", 
                        "m":"$_id.MeetingCode", 
                        
                        "p":"$value.dividends.p", 
                        "r":"$value.dividends.r",
                        "y":"$value.tipstertotal.tips"
                      }}
    
                    }},
                    
                {"$project":{"_id":1, "x":1 }}                


            ,function(e,r){

            
                
                uu = r && r[0] && r[0].x && r[0].x[0] && r[0].x[0].m ? r[0].x[0].m : '';
                ii = r && r[0] && r[0].x && r[0].x[0] && r[0].x[0].n ? r[0].x[0].n : '';
                oo = r && r[0] && r[0].x && r[0].x[0] && r[0].x[0].r ? r[0].x[0].r : '';
                tt = r && r[0] && r[0].x && r[0].x[0] && r[0].x[0].t ? r[0].x[0].t : '';
                yy = r && r[0] && r[0].x && r[0].x[0] && r[0].x[0].y ? r[0].x[0].y : '';
               
               aa += r && r[0] && r[0].x && r[0].x[0] && r[0].x[0].p ? 1 : 0;
                pp = r && r[0] && r[0].x && r[0].x[0] && r[0].x[0].p && !isNaN(parseFloat(r[0].x[0].p)) ? parseFloat(r[0].x[0].p) : 0;
               cc += r && r[0] && r[0].x && r[0].x[0] && r[0].x[0].p && !isNaN(parseFloat(r[0].x[0].p)) ? parseFloat(r[0].x[0].p) : 0;

                mon = r && r[0] && r[0].x && r[0].x[0] && r[0].x[0].mon ? r[0].x[0].mon : '';
                dya = r && r[0] && r[0].x && r[0].x[0] && r[0].x[0].dya ? r[0].x[0].dya : '';
                mtg = r && r[0] && r[0].x && r[0].x[0] && r[0].x[0].mtg ? r[0].x[0].mtg : '';
            
                ++bb;
                
                id = {
                    'Year':         '2015'
                    ,'Month':       mon
                    ,'Day':         dya
                    ,'MtgType':     mtg
                };

                ins.push({
                    'totalcount':   bb
                    ,'correctcount':aa
                    ,'totalprofit': cc.toFixed(1)
                    ,'placeprofit': pp.toFixed(1)
                    ,'meetingcode':  uu
                    ,'raceno':      ii
                    ,'runner':      oo
                    ,'tips':        yy
                    ,'tipr':        tt    
                });                    
                    
                    
                //finish
                if( bb == vv ){


    //continue to ima, wait 10 secs
    if(continu) setTimeout( (function(){ process.emit('ima') }) , 1000 );

                    var as = ( aa / bb ) * 100;
                    var sa = cc.toFixed(1) - bb;
                    var za = sa < 0 ? 'L' : 'P';
                    var az = sa < 0 ? 0 : 1;

console.log( 
    aa +'|'+ 
    bb +'|'+ 
    as.toFixed(1) +'%|'+
    '$'+ sa.toFixed(1) +'|'+ 
    za  +'|'+
    lte_hour_z +'|'+ 
    gte_hour_z +'\n');

                    //insert tips
                    db.collection(pdb).update(
                        id
                        ,{
                            '_id':id
                            ,'x':ins
                        }
                        ,{ upsert: true }
                    );
    
    
                    //insert totals
                    db.collection(odb).update(
                        id
                        ,{
                            '_id':              id
                            ,'totalcount':      bb
                            ,'correctcount':    aa
                            ,'correctperc':     as
                            ,'proloss':         sa
                            ,'profit':          az 
                        }
                        ,{ upsert: true }
                    );
                    
                    
                    
                }//if( bb == vv ){

            });
        
        });
        
        //total count
        //console.log(vv);
        
    });
    
}











