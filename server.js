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
})

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
        let query = 'SELECT Country.abbrv AS cid, Country.country_name, Plant_Info.name, Plant_Info.latitude, \
         Plant_Info.longitude FROM Country INNER JOIN Plant_Info ON Country.abbrv = Plant_Info.country WHERE Country.abbrv = ?';
        let cid = req.params.cid.toUpperCase();
        db.all(query, [cid], (err, rows) => {
            console.log(err);
            console.log(rows);
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Error, file not found');
                res.end();
            }
            else {
                let response = template.toString();
                response = response.replace('%%COMPANY%%', rows[0].cid);
                //response = response.replace('%%MFR_IMAGE%%', '/images/' + mfr + '_logo.png');
                //response = response.replace('%%MFR_ALT_TEXT%%', 'Logo of ' + rows[0].mfr);

                let location_table = '';
                let i;
                for(i=0; i < rows.length; i++){
                    location_table = location_table + '<tr><td>' + rows[i].cid + '</td>';
                    location_table = location_table + '<td>' + rows[i].country_name + '</td>';
                    location_table = location_table + '<td>' + rows[i].name + '</td>';
                    location_table = location_table + '<td>' + rows[i].latitude + '</td>';
                    location_table = location_table + '<td>' + rows[i].longitude + '</td></tr>';
                }
                response = response.replace('%%PLANT_INFO%%', location_table);
                res.status(200).type('html').send(response);
            }
        })

    });
});

app.get('/energy_source.html/:fid', (req, res) => {
    console.log(req.params.fid);
    fs.readFile(path.join(template_dir, 'energy_source.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database
        let query = 'SELECT Plant_Info.short_fuel AS fid, Plant_Info.country, Plant_Info.name, Fuel.fuel_name \
            FROM Plant_Info INNER JOIN Fuel ON Plant_Info.short_fuel = Fuel.fuel_id WHERE Plant_Info.short_fuel = ?';
        let fid = req.params.fid.toUpperCase();
        db.all(query, [fid], (err, rows) => {
            console.log(err);
            console.log(rows);
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Error, file not found');
                res.end();
            }
            else {
                let response = template.toString();
                response = response.replace('%%COMPANY%%', rows[0].fid);
                //response = response.replace('%%MFR_IMAGE%%', '/images/' + mfr + '_logo.png');
                //response = response.replace('%%MFR_ALT_TEXT%%', 'Logo of ' + rows[0].mfr);

                let energy_table = '';
                let i;
                for(i=0; i < rows.length; i++){
                    energy_table = energy_table + '<td>' + rows[i].country_name + '</td>';
                    energy_table = energy_table + '<td>' + rows[i].name + '</td>';
                    energy_table = energy_table + '<td>' + rows[i].short_fuel + '</td>';
                }
                response = response.replace('%%PLANT_INFO%%', energy_table);
                res.status(200).type('html').send(response);
            }
        })

    });
});

app.get('/capacity.html/:cid', (req, res) => {
    console.log(req.params.cid);
    fs.readFile(path.join(template_dir, 'capacity.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database
        let query = 'SELECT Country.abbrv AS cid, Country.country_name, Plant_Info.name, Plant_Info.capacity_mw \
            FROM Country INNER JOIN Plant_Info ON Country.abbrv = Plant_Info.country WHERE Country.abbrv = ?';
        let cid = req.params.cid.toUpperCase();
        db.all(query, [cid], (err, rows) => {
            console.log(err);
            console.log(rows);
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Error, file not found');
                res.end();
            }
            else {
                let response = template.toString();
                response = response.replace('%%COMPANY%%', rows[0].cid);
                //response = response.replace('%%MFR_IMAGE%%', '/images/' + mfr + '_logo.png');
                //response = response.replace('%%MFR_ALT_TEXT%%', 'Logo of ' + rows[0].mfr);

                let capacity_table = '';
                let i;
                for(i=0; i < rows.length; i++){
                    capacity_table = capacity_table + '<tr><td>' + rows[i].cid + '</td>';
                    capacity_table = capacity_table + '<td>' + rows[i].country_name + '</td>';
                    capacity_table = capacity_table + '<td>' + rows[i].name + '</td>';
                    capacity_table = capacity_table + '<td>' + rows[i].capacity_mw + '</td>';
                }
                response = response.replace('%%PLANT_INFO%%', capacity_table);
                res.status(200).type('html').send(response);
            }
        })

    });
});

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
