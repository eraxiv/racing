var score_get =             require('./run.export.js')          ;
var score_csv =             require('./csv.export.js')          ;
var score_sco =             require('./api.export.js')          ;
var score_pro =             require('./pro.export.js')          ;
var score_ima =             require('./ima.export.js')          ;
var score_cpc =             '';
var score_iim =             '';


module.exports = function(
    todaya,montha,daya,
    typea,l,g,call,
    cget,ccsv,c1tp,c3tp,crun,cpro,cdol,cima,ccpc,
    sget,scsv,ssco,spro,sima,scpc,siim,sext,
    psco,pdol
){

var min =                   60000                                  ; //minute
var daysago =               16                                     ; //train 16 days
var today =                 todaya ? todays_date(0)  : 0           ; //today or choose date
var setyear =               todaya ? today.year  : 2015            ;        
var setmonth =              todaya ? today.month : montha          ;
var setday =                todaya ? today.day   : daya            ;
var mtgtype =               typea                                  ; //R, G, T. A=ALL
var lte_hour =              l                                      ; //30 max
var gte_hour =              g                                      ; //8 min

var continu_all =           call                                   ;

var continu_get =           cget                                   ; //2mins
var continu_csv =           ccsv                                   ; //2mins 0
var continu_1tp =           c1tp                                   ;
var continu_3tp =           c3tp                                   ;
var continu_run =           crun                                   ; // 0
var continu_pro =           cpro                                   ;
var continu_dol =           cdol                                   ; // 0
var continu_ima =           cima                                   ; // 0
var continu_cpc =           ccpc                                   ; // 0

var score_get_on =          sget                                   ;   
var score_csv_on =          scsv                                   ;
var score_sco_on =          ssco                                   ;
var score_pro_on =          spro                                   ;
var score_ima_on =          sima                                   ;
var score_cpc_on =          scpc                                   ;
var score_iim_on =          siim                                   ;
var score_ext_on =          sext                                   ;

var score_get_t =           0                                      ;
var score_csv_t =           score_get_on ? score_get_t+5  : 0      ;
var score_sco_t =           score_csv_on ? score_csv_t+5  : 0      ;
var score_pro_t =           score_sco_on ? score_sco_t+12 : 0      ;
var score_ima_t =           0                                      ; 
var score_exi_t =           120                                    ;

var score_sco_1tp_r =       1                                      ; 
var score_sco_3tp_r =       0                                      ; 
var score_sco_run_r =       0                                      ; 
var score_sco_1tp_t =       score_sco_t+0                          ;
var score_sco_3tp_t =       score_sco_1tp_r ? score_sco_t+15 : 0   ;
var score_sco_run_t =       score_sco_3tp_r ? score_sco_t+30 : 0   ;
var score_sco_1tp_a =       1                                      ;
var score_sco_3tp_a =       1                                      ;
var score_sco_run_a =       1                                      ;

var score_pro_sco_r =       psco                                   ; 
var score_pro_dol_r =       pdol                                   ;
var score_pro_sco_t =       score_pro_dol_r ? 0 : 0                ;
var score_pro_dol_t =       score_pro_sco_r ? 0.3 : 0              ;




if( continu_all ){

continu_get = continu_csv = 
continu_1tp = continu_3tp = 
continu_run = continu_pro = 
continu_dol = continu_ima = 
continu_cpc = continu_all =         1       ;

score_get_on = score_ext_on =       1       ;
score_csv_on = score_sco_on = 
score_pro_on = score_ima_on = 
score_cpc_on = 0;

}




//get raceday
if(score_get_on){
    setTimeout( function(){ new score_get(daysago, setday, setmonth, setyear, continu_get); }, score_get_t*min );
}


//populate csv
if(score_csv_on){                                            
setTimeout( function(){ new score_csv(daysago, setday, setmonth, setyear, mtgtype, continu_csv, lte_hour, gte_hour); },score_csv_t*min );
}


//score //run individuals
if(score_sco_on){    
    setTimeout( function(){                     
        if(score_sco_1tp_r) setTimeout( function(){ new score_sco(1, 0, 3, setday, setmonth, setyear, mtgtype, score_sco_1tp_a*min, continu_1tp); }, score_sco_1tp_t*min );         
        if(score_sco_3tp_r) setTimeout( function(){ new score_sco(2, 0, 2, setday, setmonth, setyear, mtgtype, score_sco_3tp_a*min, continu_3tp); }, score_sco_3tp_t*min ); 
        if(score_sco_run_r) setTimeout( function(){ new score_sco(3, 0, 3, setday, setmonth, setyear, mtgtype, score_sco_run_a*min, continu_run); }, score_sco_run_t*min );                         
    }, score_sco_t*min );
}


//profit
if(score_pro_on){
    setTimeout( function(){     
        if(score_pro_sco_r) setTimeout( function(){ new score_pro(setmonth, setday, 1, 0, mtgtype, continu_pro, lte_hour, gte_hour); }, score_pro_sco_t*min ); 
        if(score_pro_dol_r) setTimeout( function(){ new score_pro(setmonth, setday, 0, 1, mtgtype, continu_dol, lte_hour, gte_hour); }, score_pro_dol_t*min );     
    }, score_pro_t*min );
}


//create imacro csv
if(score_ima_on){
    setTimeout( function(){ score_ima(setyear, setmonth, setday, mtgtype, lte_hour, gte_hour, continu_ima); }, score_ima_t*min );
}


//run csv
if(score_iim_on){ cpc(score_iim); }


///exit
if(score_ext_on){ setTimeout( function(){ process.exit(1); }, score_exi_t*min ); }


//event listeners
//get raceday
process.on('get', function(a){ score_get(daysago, setday, setmonth, setyear, continu_get); });

//populate csv
process.on('csv', function(a){ score_csv(daysago, setday, setmonth, setyear, mtgtype, continu_csv, lte_hour, gte_hour); });                           

//score         
process.on('1tp', function(a){ score_sco(1, 0, 3, setday, setmonth, setyear, mtgtype, score_sco_1tp_a*min, continu_1tp); });
process.on('3tp', function(a){ score_sco(2, 0, 2, setday, setmonth, setyear, mtgtype, score_sco_3tp_a*min, continu_3tp); }); 
process.on('run', function(a){ score_sco(3, 0, 3, setday, setmonth, setyear, mtgtype, score_sco_run_a*min, continu_run); }); 

//profit
process.on('pro', function(a){ score_pro(setmonth, setday, 1, 0, mtgtype, continu_pro, lte_hour, gte_hour); });
process.on('dol', function(a){ score_pro(setmonth, setday, 0, 1, mtgtype, continu_dol, lte_hour, gte_hour); });

//ima
process.on('ima', function(a){ score_ima(setyear, setmonth, setday, mtgtype, lte_hour, gte_hour, continu_ima); });

//copy csv
process.on('cpc', function(){ cpc(score_cpc); } );

//run iim
process.on('iim', function(){ cpc(score_iim); } );

///exit
process.on('exit', function(a){ process.exit(1); }); 




function todays_date(ago) {

    var today =     new Date();
    var offset =    10;                     //timezone aus/syd +10
    var utc =       today.getTime() + (today.getTimezoneOffset() * 60000);
    today =         new Date(utc + (3600000 * offset));
    var dd =        today.getDate();
    var mm =        today.getMonth() + 1;   //January is 0!
    var yyyy =      today.getFullYear();

    var todayD =    today.getDate() - ago;  // 2 weeks ago
    today.setDate(todayD); 
    var iso =       today.toISOString();

    return {"day":dd, "month":mm, "year":yyyy, "iso":iso};

}


function cpc(xx){
    
    var sys = require('sys');
    var exec = require('child_process').exec;
    var child;
     
    child = exec(xx, function (error, stdout, stderr) {
        if(stdout) sys.print('stdout: ' + stdout);
        if(stderr) sys.print('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
              
        console.log('cpc'); 
        
    });
        
}






};

