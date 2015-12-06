var db =        require('./mongox.js');

exports.z = {

    filtered_keys: function(filter, names) {

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
    }



    ,
    getname: function(x, names) {


        var rr = x.split(" ");
        var tt, yy;
        var ee = rr.length - 1;

        if (ee >= 1) {

            //build regex    					
            //eg; LATE MAIL: /^LAT.*IL$|^.*ATE.*MA.*$/i 
            tt = "^" + rr[0].substr(0, 3) + ".*" + rr[ee].substr(rr[ee].length - 2, rr[ee].length) + "$" + "|" +
                "^.*" + rr[0].substr(rr[0].length - 3, rr[0].length) + ".*" + rr[ee].substr(0, 2) + ".*$";
            tt = new RegExp(tt, "i");


            //if fails, use original name
            yy = this.filtered_keys(tt, names) || x;


        }
        else {

            //TODO: single name checks
            yy = x;

        }




        //names that dont match	
        if (yy == "WATCHDOG" || yy == "WATHCHDOG")
            yy = "THE WATCHDOG";
        else if (yy == "DAMIEN COURTNRY")
            yy = "DAMIAN COURTNEY";



        return yy;

    }


    ,
    tnamesd: function(callback) {    

        db.collection("tnamesD").find().toArray(function(err, docsa) {
            if (err) console.log(err);

            callback(docsa);
            //return docsa;
            //names = docsa;

        });

    }
    
    

};

