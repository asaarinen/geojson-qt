var GeoJSON = require('../lib/geojson.js');

var data = require('../testdata/test1.json');

var gj = GeoJSON();
gj.create(data);

process.stderr.write('stringify\n');
var str = gj.stringify();

var gj2 = GeoJSON();
gj2.parse(str);

gj2.eachPoint(null, function(feat, coords) {
    if( feat.properties.Text )
        process.stderr.write(feat.properties.Text + ' at ' + coords[0] + ',' + coords[1] + '\n');
    return true;
});
