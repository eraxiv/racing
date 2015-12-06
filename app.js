 var x =             require('./src/score.export.js'),
g =                 {},
s =                 0,
a =                 '',

//default values
z = {
    today :         0,    
    month :         0,
    day :           0,
    type :          'G',
    l :             13,
    g :             12,    
    call :          0
},
c = {
    cget :          1,
    ccsv :          1,
    c1tp :          1,
    c3tp :          1,
    crun :          1,
    cpro :          1,
    cdol :          1,
    cima :          1,
    ccpc :          1
},
d = {    
    sget :          0,
    scsv :          0,
    ssco :          0,
    spro :          0,
    sima :          0,
    scpc :          0,
    siim :          0,
    sext :          1,    
},
p = {
    psco :          1,   
    pdol :          0,
};


//initialise execute functions
f();


//router
process.argv.forEach(function(val, index, array) {
                
    s = val.split('=');    
    switch(s[0]){
                        
        case "csvr":    g.csvr(); break;
        case "apir":    g.apir(); break;
        
        case "get":     g.get(); break;
        case "x":       a =           s[1]; break;
        
        case "y":       z.type =      s[1]; break;        
        case "t":       z.today =     parseInt(s[1],10); break;
        case "m":       z.month =     parseInt(s[1],10); break;
        case "d":       z.day =       parseInt(s[1],10); break;                
        case "l":       z.l =         parseInt(s[1],10); break;
        case "g":       z.g =         parseInt(s[1],10); break;        
        case "c":       z.call =      parseInt(s[1],10); break;
        
        case "cget":    c.cget =      parseInt(s[1],10); break;
        case "ccsv":    c.ccsv =      parseInt(s[1],10); break;
        case "c1tp":    c.c1tp =      parseInt(s[1],10); break;
        case "c3tp":    c.c3tp =      parseInt(s[1],10); break;
        case "crun":    c.crun =      parseInt(s[1],10); break;
        case "cpro":    c.cpro =      parseInt(s[1],10); break;
        case "cdol":    c.cdol =      parseInt(s[1],10); break;
        case "cima":    c.cima =      parseInt(s[1],10); break;
        case "ccpc":    c.ccpc =      parseInt(s[1],10); break;
        
        case "sget":    d.sget =      parseInt(s[1],10); break;
        case "scsv":    d.scsv =      parseInt(s[1],10); break;
        case "ssco":    d.ssco =      parseInt(s[1],10); break;
        case "spro":    d.spro =      parseInt(s[1],10); break;
        case "sima":    d.sima =      parseInt(s[1],10); break;
        case "scpc":    d.scpc =      parseInt(s[1],10); break;
        case "siim":    d.siim =      parseInt(s[1],10); break;
        
        case "psco":    p.psco =      parseInt(s[1],10); break;
        case "pdol":    p.pdol =      parseInt(s[1],10); break;
        
        //default: console.log(s);
        
    }
    s = null;

});
if( 
    a &&
    (z.today||(z.month&&z.day)) && 
    (z.call||d.sget||d.scsv||d.ssco||d.spro||d.sima||d.scpc||d.siim||d.sext)
){

    var a = a.toString().trim();
    if (a in g && typeof g[a] === "function") {
        g[a]();
    }

}



/*

    execute functions

*/
function f(){


    //profit on every hour
    g.h = function(){
        
        for(var i = 12; i< 25; i++){
        
            x(
                z.today,
                
                z.month,z.day,
                z.type,
                
                i,
                i-1,
                
                z.call,            
                
                c.cget,
                c.ccsv,
                c.c1tp,
                c.c3tp,
                c.crun,
                c.cpro,
                c.cdol,
                c.cima,
                c.ccpc,
                
                d.sget,
                d.scsv,
                d.ssco,
                d.spro,
                d.sima,
                d.scpc,
                d.siim,
                d.sext,
                
                0,
                1
            );
        
        }
    
    };
    
    
    //print
    g.z = function(){
        
        console.log(
            
            s,a,
            today,month,day,type,l,g,
            call,cget,ccsv,c1tp,c3tp,crun,cpro,cdol,cima,ccpc,
            sget,scsv,ssco,spro,sima,scpc,siim,sext
            
        );
    
    };
    
    
    //blank eXecute
    g.x = function(){
        
        x(
            z.today,
            
            z.month,z.day,
            z.type,
            
            z.l,
            z.g,
            
            z.call,            
            
            c.cget,
            c.ccsv,
            c.c1tp,
            c.c3tp,
            c.crun,
            c.cpro,
            c.cdol,
            c.cima,
            c.ccpc,
            
            d.sget,
            d.scsv,
            d.ssco,
            d.spro,
            d.sima,
            d.scpc,
            d.siim,
            d.sext,
            
            p.psco,
            p.pdol
        );
    
    };
    

    g.get = function(){
        
        x(
            1,
            
            z.month,z.day,
            'R',
            
            z.l,
            z.g,
            
            0,            
            
            0,//c.cget,
            0,//c.ccsv,
            0,//c.c1tp,
            0,//c.c3tp,
            0,//c.crun,
            0,//c.cpro,
            0,//c.cdol,
            0,//c.cima,
            0,//c.ccpc,
            
            1,//d.sget,
            0,//d.scsv,
            0,//d.ssco,
            0,//d.spro,
            0,//d.sima,
            0,//d.scpc,
            0,//d.siim,
            0,//d.sext,
            
            0,//p.psco,
            0//p.pdol
        );
    
    };

    g.csvr = function(){
        
        x(
            1,
            
            z.month,z.day,
            'R',
            
            z.l,
            z.g,
            
            0,            
            
            0,//c.cget,
            0,//c.ccsv,
            0,//c.c1tp,
            0,//c.c3tp,
            0,//c.crun,
            0,//c.cpro,
            0,//c.cdol,
            0,//c.cima,
            0,//c.ccpc,
            
            0,//d.sget,
            1,//d.scsv,
            0,//d.ssco,
            0,//d.spro,
            0,//d.sima,
            0,//d.scpc,
            0,//d.siim,
            0,//d.sext,
            
            0,//p.psco,
            0//p.pdol
        );
    
    };

    g.apir = function(){
        
        x(
            1,
            
            z.month,z.day,
            'R',
            
            z.l,
            z.g,
            
            0,            
            
            0,//c.cget,
            0,//c.ccsv,
            0,//c.c1tp,
            0,//c.c3tp,
            0,//c.crun,
            0,//c.cpro,
            0,//c.cdol,
            0,//c.cima,
            0,//c.ccpc,
            
            0,//d.sget,
            0,//d.scsv,
            1,//d.ssco,
            0,//d.spro,
            0,//d.sima,
            0,//d.scpc,
            0,//d.siim,
            0,//d.sext,
            
            0,//p.psco,
            0//p.pdol
        );
    
    };

}



