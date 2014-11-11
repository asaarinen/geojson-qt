var assert = require('assert');
var GeoJSON = require('../lib/geojson.js');

var data = require('../testdata/countries-hires.json');

var gj = GeoJSON();
gj.create(data);

var str = gj.stringify();

var gj2 = GeoJSON();
gj2.parse(str);

var points = 0;
gj2.eachPoint(null, function(feat, coords) {
    points++;
    return true;
});

assert(points == 99606);

var lines = 0;
gj2.eachLine(null, function(feat, p1, p2) {
    lines++;
    return true;
});

assert(lines == 97977);

var polygons = 0;
gj2.each('Polygon', null, function(feat, geom) {
    polygons++;
    return true;
});

assert(polygons == 124);

var polygons = 0;
gj2.each('MultiPolygon', null, function(feat, geom) {
    polygons++;
    return true;
});

assert(polygons == 118);

var results = {}, resultcount = 0;
gj2.each(null, { x: 23.407, y: 62.111, w: 0, h: 0 }, function(feat, geom) {
    results[feat.properties.NAME] = true;
    resultcount++;
    return true;
});

assert(resultcount == 5);
assert(results['Finland']);
assert(results['Sweden']);
assert(results['Norway']);
assert(results['Russia']);
assert(results['United States']);

process.stdout.write('test ok\n');
