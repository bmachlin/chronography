var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/src'));
app.use('/lib', express.static(__dirname + '/lib'));
app.use('/res', express.static(__dirname + '/res'));



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
