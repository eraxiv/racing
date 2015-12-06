

module.exports = function(year, month, day, mtgtype, lte_hour, gte_hour, continu){

var fs =                require('fs')                                   ;
var util =              require('util')                                 ;
var db =                require('./mongox.js')                          ;

var col =               'prodb'                                         ;
var imcsv =             __dirname+ 'csv/tatts.csv'                                 ;
var append_flag =       { flags: 'w' }                                  ;
var imstream =          fs.createWriteStream(imcsv, append_flag)        ;

var spend =             1                                               ;
var x =                 {}                                              ;
var c =                 {}                                              ; //allow duplicates
var z =                 {}                                              ; //allow duplicates
var v =                 {}                                              ; //allow duplicates
var d =                 []                                              ;

var month_zeropad =     month<10        ? '0'+month     : month         ;
var day_zeropad =       day<10          ? '0'+day       : day           ;
var lte_hour_z =        lte_hour<10     ? '0'+lte_hour  : lte_hour      ;
var gte_hour_z =        gte_hour<10     ? '0'+gte_hour  : gte_hour      ;


if(mtgtype == 'A') mtgtype = {'$exists':1};


var t = { //find
    "_id.Month":        month                                           ,
    "_id.Day":          day                                             ,
    "_id.mtgtype":      mtgtype                                    ,
    "_id.rtime" : {
        '$lte': year +'-'+ month_zeropad +'-'+ day_zeropad +'T'+ lte_hour_z +':00:00',
        '$gte': year +'-'+ month_zeropad +'-'+ day_zeropad +'T'+ gte_hour_z +':00:00'
    }
};
var p = { //excludes
    "_id.mtgtype":      0                                               ,
    "_id.tipr":         0                                               ,
    "prob":             0                                               };



console.log(t); 


db.collection(col).find(t, p).sort( '_id.rtime',1 ).limit(500).toArray(function(err, docs) {
    if (err) console.log(err);


    if (docs.length) {
        docs.forEach(function(doc,i) {


//doc._id.MeetingCode = {'a':doc._id.MeetingCode,'s':doc._id.rtime};


            //if meetingcode doesnt exist, add it
            if (!x[doc._id.MeetingCode]) x[doc._id.MeetingCode] = {};

            //if raceno doesnt exist, add it
            if (!x[doc._id.MeetingCode][doc._id.RaceNo]) x[doc._id.MeetingCode][doc._id.RaceNo] = [];

            //if rtime doesnt exist, add it
            if (x[doc._id.MeetingCode][doc._id.RaceNo].indexOf(doc._id.rtime) < 0 )             
            x[doc._id.MeetingCode][doc._id.RaceNo].push(doc._id.rtime);


            //if runner doesnt existm add it
            if ( x[doc._id.MeetingCode][doc._id.RaceNo].indexOf(doc._id.runner) < 0 )
                x[doc._id.MeetingCode][doc._id.RaceNo].push(doc._id.runner);                
            else{                            
                if (!c[doc._id.MeetingCode]) c[doc._id.MeetingCode] = {};
                if (!c[doc._id.MeetingCode][doc._id.RaceNo]) c[doc._id.MeetingCode][doc._id.RaceNo] = [];
                if (c[doc._id.MeetingCode][doc._id.RaceNo].indexOf(doc._id.rtime) < 0 )             
                    c[doc._id.MeetingCode][doc._id.RaceNo].push(doc._id.rtime);
                
                if( c[doc._id.MeetingCode][doc._id.RaceNo].indexOf(doc._id.runner) < 0 )
                    c[doc._id.MeetingCode][doc._id.RaceNo].push(doc._id.runner);
                else{                            
                    if (!z[doc._id.MeetingCode]) z[doc._id.MeetingCode] = {};
                    if (!z[doc._id.MeetingCode][doc._id.RaceNo]) z[doc._id.MeetingCode][doc._id.RaceNo] = [];
                    if (z[doc._id.MeetingCode][doc._id.RaceNo].indexOf(doc._id.rtime) < 0 )             
                        z[doc._id.MeetingCode][doc._id.RaceNo].push(doc._id.rtime);
                    if( z[doc._id.MeetingCode][doc._id.RaceNo].indexOf(doc._id.runner) < 0 )
                        z[doc._id.MeetingCode][doc._id.RaceNo].push(doc._id.runner);
                    else{                            
                        if (!v[doc._id.MeetingCode]) v[doc._id.MeetingCode] = {};
                        if (!v[doc._id.MeetingCode][doc._id.RaceNo]) v[doc._id.MeetingCode][doc._id.RaceNo] = [];
                        if (v[doc._id.MeetingCode][doc._id.RaceNo].indexOf(doc._id.rtime) < 0 )             
                            v[doc._id.MeetingCode][doc._id.RaceNo].push(doc._id.rtime);
                        if( v[doc._id.MeetingCode][doc._id.RaceNo].indexOf(doc._id.runner) < 0 )
                            v[doc._id.MeetingCode][doc._id.RaceNo].push(doc._id.runner);
                    }        
                }
            }
        });


    }else{
        if(continu) process.emit('cpc');
        else process.emit('exit');                 
    }



//console.log(x); 


if(c)
    for (var meetingcodec in c) {
        for (var racenoc in c[meetingcodec]) {
            //d.push(month + ',' + day + ',' + meetingcodec + ',' + racenoc + ',' + c[meetingcodec][racenoc].join(' ') + ',' + spend);
            
d.push([
    c[meetingcodec][racenoc].shift(), 
    month +','+ day +','+ meetingcodec +','+ racenoc +','+ c[meetingcodec][racenoc].join(' ') +','+ spend
    ]);


            
        }
    }

if(z)
    for (var meetingcodez in z) {
        for (var racenoz in z[meetingcodez]) {
//            d.push(month + ',' + day + ',' + meetingcodez + ',' + racenoz + ',' + z[meetingcodez][racenoz].join(' ') + ',' + spend);

d.push([
    z[meetingcodez][racenoz].shift(), 
    month +','+ day +','+ meetingcodez +','+ racenoz +','+ z[meetingcodez][racenoz].join(' ') +','+ spend
    ]);


        }
    }

if(v)
    for (var meetingcodev in v) {
        for (var racenov in v[meetingcodev]) {
            //d.push( month + ',' + day + ',' + meetingcodev + ',' + racenov + ',' + v[meetingcodev][racenov].join(' ') + ',' + spend);
            
d.push([
    v[meetingcodev][racenov].shift(), 
    month +','+ day +','+ meetingcodev +','+ racenov +','+ v[meetingcodev][racenov].join(' ') +','+ spend
    ]);


        }
    }


    for (var meetingcode in x) {
        for (var raceno in x[meetingcode]) {

d.push([
    x[meetingcode][raceno].shift(), 
    month +','+ day +','+ meetingcode +','+ raceno +','+ x[meetingcode][raceno].join(' ') +','+ spend
    ]);

        }
    }


d.sort();

    //write
    if(d){        
        for (var i=0; i<d.length;i++) {
            imstream.write(d[i][1] + '\r\n');
        }            
        imstream.end();                     
    }

    
    //close
    imstream.on('finish', function(){         
        console.log('im');
 
        if(continu) process.emit('cpc');
        else process.emit('exit'); 
        //process.exit(1);
    });






}); //db.collection(col).find(t, p).toArray(function(err, docs) {







var flattenObject = function(ob) {
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








}; //module.exports




