module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index.html');
    });
    app.get('/about', function (req, res) {
        res.render('about.html');
    });
    app.get('/api', function (req, res) {
        res.render('test.html');
    });
    //AJAX GET METHOD
    app.get('/api/get', function (req, res) {
        var data = req.query.data;
        console.log('GET Parameter = ' + data);
        var result = data + ' Success';
        console.log(result);
        res.send({ result: result });
    });
    //AJAX POST METHOD
    app.post('/api/post', function (req, res) {
        databody = req.body;
        console.log('POST Parameter = ');
        console.log(databody);
        var result = databody.data1 + '  ' + databody.data2 + ' Success';
        console.log(result);

        var fs = require('fs');
        fs.writeFile("../buff.txt", JSON.stringify(databody), 'utf8', function(error){
            if(error){
                console.log("write error");
            }
            else{
                console.log("write complete");
            }
        })

        res.send({ result: result });
    });

}

/*var fs = require('fs');
        fs.readFile('buff.txt', 'utf8', function(error,data){
            console.log(data);
        });
*/

