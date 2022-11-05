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
let port = 5000;

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
    let home = ''; // <-- change this
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
        let query = 'SELECT Country.country_code AS cid, Country.country_name, Company.company_name, Location.longitude, \
         Location.latitude FROM Country INNER JOIN Company INNER JOIN Location WHERE Country.country_code = ?';
        let cid = req.params.cid.toUpperCase();
        db.all(query, [cid], (err, rows) => {
            //console.log(err);
            //console.log(rows);
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Error, file not found');
                res.end();
            }
            else {
                let response = template.toString();
                response = response.replace('%%COMPANY%%', rows[2].cid);
                //response = response.replace('%%MFR_IMAGE%%', '/images/' + mfr + '_logo.png');
                //response = response.replace('%%MFR_ALT_TEXT%%', 'Logo of ' + rows[0].mfr);

                let location_table = '';
                let i;
                for(i=0; i < rows.length; i++){
                    location_table = location_table + '<tr><td>' + rows[i].name + '</td>';
                    //cereal_table = cereal_table + '<td>' + rows[i].calories + '</td>';
                    //cereal_table = cereal_table + '<td>' + rows[i].carbohydrates + '</td>';
                    //cereal_table = cereal_table + '<td>' + rows[i].protein + '</td>';
                    //cereal_table = cereal_table + '</tr>';
                }
                response = response.replace('%%PLANT_INFO%%', location_table);
                res.status(200).type('html').send(response);
            }
        })

    });
});

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
