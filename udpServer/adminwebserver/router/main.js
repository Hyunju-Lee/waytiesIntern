module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('signalgenerator.html');
    });
    app.post('/api/post', function (req, res) {
        var bindata;
        var databody = req.body;
        console.log("Signal Data Posted");
        var result = 'Post Success';

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

