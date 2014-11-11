geojson-qt
=====

`geojson-qt` implements a quadtree containing GeoJSON features and allows for easy find and browse of said features. `geojson-qt` assumes that the coordinates used within the GeoJSON are in a rectangular coordinate system; WGS84 coordinates may be used as well, but they are treated linearly.

Installation
---

```
npm install geojson-qt
```

Should also work in all browsers as is. Depends on `simple-quadtree` as underlying quadtree implementation.

Usage
---

Insert GeoJSON 

```javascript
var GeoJSON = require('geojson-qt');
var gj = GeoJSON();

gj.create({
    type: 'FeatureCollection',
    features: [
        // ...
    ]           
});
```

### Getting features

The GeoJSON features may be queried using method `each`:

```javascript
gj.each('LineString', null, function(feature, geometry) {
    // do something
    return true;                     
});
```

The iteration over GeoJSON features continues until there are no more features or the callback returns `false`. Please note that the callback may be called multiple times if the feature geometry type is `GeometryCollection`.

Passing `null` or empty string as geometry type will browse through all features.

The query may also be restricted to only a certain area within the GeoJSON using similar semantics as for the underlying `simple-quadtree`:

```javascript
gj.each('LineString', { x: 5, y: 5, w: 10, h: 10 }, function(feature, geometry) {
    return true;                      
});
```

### Browsing through all points and line segments

For convenient browsing of all points and all line segments, there are methods `eachPoint` and `eachLine`:

```javascript
gj.eachPoint({ x: 5, y: 5, w: 10, h: 10 }, function(feature, point) {
    // point is now an object like { x: 5, y: 6 }               
    return true;
});

gj.eachLine({ x: 5, y: 5, w: 10, h: 10 }, function(feature, p1, p2) {
    // p1 and p2 are objects like { x: 5, y: 6 } representing line beginning and end
    return true;
});
```

Please note that when using `eachPoint` and `eachLine`, they browse through all points and line segments regardless of their geometry type. Each coordinate pair found in the GeoJSON features will be browsed through with `eachPoint`, and each line segment in any `LineString`, `MultiLineString`, `Polygon`, or `MultiPolygon` will be browsed through when using `eachLine`. This also means that each feature may be reported multiple times to this callback.

Please note also that each feature is included in the quadtree by their bounding box. These methods return all points and line segments in features whose bounding box overlaps the queried area. Therefore there may well be points and lines returned that are actually outside of that area.

### Serializing and deserializing

The GeoJSON structure may be serialized into and deserialized from JSON strings using `parse` and `stringify`. 

```javascript
var gj = GeoJSON();
gj.create(data);    
var str = gj.stringify();

// store str in a JSON file

// read str from JSON file                   

gj.parse(str); 
```

License
---

(The MIT License)

Copyright (c) 2013 Antti Saarinen &lt;antti.p.saarinen@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.