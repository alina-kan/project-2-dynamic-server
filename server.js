// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'powerplant.sqlite3'); // <-- change this

let app = express();
let port = 9000;

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});

// Serve static files from 'public' directory
app.use(express.static(public_dir));


// GET request handler for home page '/' (redirect to desired route)

app.get('/', (req, res) => {
    let home = '/index.html'; // <-- change this
    res.redirect(home);
});

app.get('/location.html/main', (req, res) => {
    let page = '/location.html';
    res.redirect(page);
});

app.get('/index.html/index.html', (req, res) => {
    let home = '/index.html'; // <-- change this
    res.redirect(home);
});

app.get('/location.html/index.html', (req, res) => {
    let home = '/index.html'; // <-- change this
    res.redirect(home);
});

app.get('/capacity.html/index.html', (req, res) => {
    let home = '/index.html'; // <-- change this
    res.redirect(home);
});

app.get('/energy_source.html/index.html', (req, res) => {
    let home = '/index.html'; // <-- change this
    res.redirect(home);
});

/*
// Example GET request handler for data about a specific year
app.get('/year/:selected_year', (req, res) => {
    console.log(req.params.selected_year); 
    fs.readFile(path.join(template_dir, 'year.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database

        res.status(200).type('html').send(template); // <-- you may need to change this
    });
});
*/

app.get('/location.html/:cid', (req, res) => {
    console.log(req.params.cid);
    fs.readFile(path.join(template_dir, 'location.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database

        var done = false;
        let prevIdx;
        let nextIdx;
        let response = template.toString();

        let query = 'SELECT Country.abbrv AS cid, Country.country_name, Plant_Info.name, Plant_Info.latitude, \
         Plant_Info.longitude, Plant_Info.capacity_mw, Plant_Info.short_fuel FROM Country INNER JOIN Plant_Info \
         ON Country.abbrv = Plant_Info.country WHERE Country.abbrv = ?';
        let cid = req.params.cid.toUpperCase();
        db.all(query, [cid], (err, rows) => {
            console.log(err);
            console.log(rows);
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Error, file not found');
                res.end();
            }
            else if (rows.length == 0) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Error, data not found for country ' + cid.toUpperCase());
                res.end();
            }
            else {
                
                response = response.replace('%%LOCATION%%', rows[0].cid);
                //response = response.replace('%%MFR_IMAGE%%', '/images/' + mfr + '_logo.png');
                //response = response.replace('%%MFR_ALT_TEXT%%', 'Logo of ' + rows[0].mfr);

                let location_table = '';
                let i;
                for(i=0; i < rows.length; i++){
                    location_table = location_table + '<tr><td>' + rows[i].country_name + '</td>';
                    //location_table = location_table + '<td>' + rows[i].country_name + '</td>';
                    location_table = location_table + '<td>' + rows[i].name + '</td>';
                    location_table = location_table + '<td>' + rows[i].latitude + '</td>';
                    location_table = location_table + '<td>' + rows[i].longitude + '</td>';
                    location_table = location_table + '<td>' + rows[i].short_fuel + '</td>';
                    location_table = location_table + '<td>'+ rows[i].capacity_mw + '</td></tr>';
                    
                }
                
                response = response.replace('%%PLANT_INFO%%', location_table);
                if(done){
                    response = response.replace('%%PREVIOUSLINK%%', rows[prevIdx].abbrv);
                    response = response.replace('%%NEXTLINK%%', rows[nextIdx].abbrv);
                    res.status(200).type('html').send(response);
                }
                done = true;
            }
        })


        let query1 = 'SELECT Country.abbrv FROM Country';
        db.all(query1, [], (err, rows) =>{
            console.log(rows);
            let i = 0;

            while(!(cid == rows[i].abbrv) && i < rows.length){
                i++;
                //console.log("row at i is: " + rows[i].abbrv + " and cid is: "+ cid);
            }
            if(i == 0){
                prevIdx = rows.length - 1;
                nextIdx = 1;
            }
            else if(i == rows.length - 1){
                prevIdx = i-1
                nextIdx = 0;
            }
            else{
                prevIdx = i-1;
                nextIdx = i+1;
            }
            
            if(done){
                response = response.replace('%%PREVIOUSLINK%%', rows[prevIdx].abbrv);
                response = response.replace('%%NEXTLINK%%', rows[nextIdx].abbrv);
                res.status(200).type('html').send(response);
            }
            done = true;
        });


    });
});

app.get('/energy_source.html/:fid', (req, res) => {
    console.log(req.params.fid);
    fs.readFile(path.join(template_dir, 'energy_source.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database
        
        var done = false;
        let prevIdx;
        let nextIdx;
        let response = template.toString();

        let query = 'SELECT Plant_Info.short_fuel AS fid, Plant_Info.country, Plant_Info.name, Fuel.fuel_name, Plant_Info.capacity_mw \
            FROM Plant_Info INNER JOIN Fuel ON Plant_Info.short_fuel = Fuel.fuel_id WHERE Plant_Info.short_fuel = ?';
        let fid = req.params.fid;
        db.all(query, [fid], (err, rows) => {
            console.log(err);
            console.log(rows);
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Error, file not found');
                res.end();
            }
            else if (rows.length == 0) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Error, file not found. Please type fuel abbreviation corrcetly. (Ex. Hydro = Hy)');
                res.end();
            }
            else {
                
                response = response.replace('%%COMPANY%%', rows[0].fuel_name);
                response = response.replace('%%MFR_IMAGE%%', '/images/' + fid + '.png');
                response = response.replace('%%MFR_ALT_TEXT%%', 'Chart of Energy Sources');

                let energy_table = '';
                let i;
                for(i=0; i < rows.length; i++){
                    energy_table = energy_table + '<tr><td>' + rows[i].country + '</td>';
                    energy_table = energy_table + '<td>' + rows[i].name + '</td>';
                    energy_table = energy_table + '<td>' + rows[i].fuel_name + '</td>';
                    energy_table = energy_table + '<td>' + rows[i].capacity_mw + '</td></tr>';
                }

                response = response.replace('%%PLANT_INFO%%', energy_table);
                if(done){
                    response = response.replace('%%PREVIOUSLINK%%', rows[prevIdx].fuel_id);
                    response = response.replace('%%NEXTLINK%%', rows[nextIdx].fuel_id);
                    res.status(200).type('html').send(response);
                }
                done = true;

            }
        })


        let query2 = 'SELECT fuel_id FROM Fuel';
        db.all(query2, [], (err, rows) =>{
            console.log(rows);
            let i = 0;
            //console.log("fuel id at 0: " + rows[i].fuel_id);
            //console.log("fuel id at length(): " + rows[rows.length-1].fuel_id);
            while(!(fid == rows[i].fuel_id) && i < rows.length){
                i++;
            }
            console.log("fuel id at i: " + rows[i].fuel_id);
            if(i == 0){
                prevIdx = rows.length - 1;
                nextIdx = 1;
            }
            else if(i == rows.length - 1){
                prevIdx = i-1
                nextIdx = 0;
            }
            else{
                prevIdx = i-1;
                nextIdx = i+1;
            }
            
            if(done){
                response = response.replace('%%PREVIOUSLINK%%', rows[prevIdx].fuel_id);
                response = response.replace('%%NEXTLINK%%', rows[nextIdx].fuel_id);
                res.status(200).type('html').send(response);
            }
            done = true;


        });


    });
});

app.get('/capacity.html/:amount', (req, res) => {

    fs.readFile(path.join(template_dir, 'capacity.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database
        let max = 0;
        if (req.params.amount == 'low') {
            max = 300;
        }
        else if (req.params.amount == 'med') {
            max = 700;
        }
        else if (req.params.amount == 'high') {
            max = 1000;
        }
        else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write('Error, file not found. Please type low, med, or high as parameter.');
            res.end();
        }
        let query = 'SELECT Plant_Info.country, Plant_Info.name, Plant_Info.capacity_mw, Plant_Info.short_fuel \
            FROM Plant_Info WHERE Plant_Info.capacity_mw <= ?';
        db.all(query, [max], (err, rows) => {
            console.log(err);
            console.log(rows);
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Error, file not found');
                res.end();
            }
            else if (rows.length == 0) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Error, data not found for country ' + cid.toUpperCase());
                res.end();
            }
            else {
                let response = template.toString();
                //response = response.replace('%%COMPANY%%', req.params.amount);
                if (req.params.amount == 'low') {
                    response = response.replace('%%COMPANY%%', "Low Capacity");
                }
                else if (req.params.amount == 'med') {
                    response = response.replace('%%COMPANY%%', "Medium Capacity");
                }
                else {
                    response = response.replace('%%COMPANY%%', "High Capacity");
                }
                //response = response.replace('%%MFR_IMAGE%%', '/images/' + mfr + '_logo.png');
                //response = response.replace('%%MFR_ALT_TEXT%%', 'Logo of ' + rows[0].mfr);

                let capacity_table = '';
                let i;
                for(i=0; i < rows.length; i++){
                    capacity_table = capacity_table + '<tr><td>' + rows[i].country + '</td>';
                    capacity_table = capacity_table + '<td>' + rows[i].name + '</td>';
                    capacity_table = capacity_table + '<td>' + rows[i].capacity_mw + '</td>';
                    capacity_table = capacity_table + '<td>' + rows[i].short_fuel + '</td></tr>';
                }
                response = response.replace('%%PLANT_INFO%%', capacity_table);
                if(req.params.amount == 'low'){
                    response = response.replace('%%PREVIOUSLINK%%', 'med');
                    response = response.replace('%%NEXTLINK%%', 'high');

                    response = response.replace('%%PREVIOUS%%', 'Medium');
                    response = response.replace('%%NEXT%%', 'High');
                }
                else if(req.params.amount == 'med'){
                    response = response.replace('%%PREVIOUSLINK%%', 'low');
                    response = response.replace('%%NEXTLINK%%', 'high');
                    
                    response = response.replace('%%PREVIOUS%%', 'Low');
                    response = response.replace('%%NEXT%%', 'High');
                }
                else{
                    response = response.replace('%%PREVIOUSLINK%%', 'low');
                    response = response.replace('%%NEXTLINK%%', 'med');

                    response = response.replace('%%PREVIOUS%%', 'Low');
                    response = response.replace('%%NEXT%%', 'Medium');
                }

                res.status(200).type('html').send(response);
            }
        })

    });
});




app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
