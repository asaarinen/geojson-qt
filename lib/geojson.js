var GeoJSON = function() {
    
    var QuadTree = require('simple-quadtree');
    var qt = null;
    
    var retobj = {};
    
    retobj.create = function(data) {
        
        var gfirst = true;
        var gminx, gminy, gmaxx, gmaxy;
        
        function processGeometry(geom) {
            var first = true;
            var minx, miny, maxx, maxy;
            
            function addpt(obj) {
                if( Array.isArray(obj) ) {
                    if( obj.length == 0 )
                        return;
                    if( Array.isArray(obj[0]) ) {
                        for( var ai = 0; ai < obj.length; ai++ )
                            addpt(obj[ai]);
                    } else {
                        if( first || obj[0] < minx )
                            minx = obj[0];
                        if( first || obj[0] > maxx )
                            maxx = obj[0];
                        if( first || obj[1] < miny )
                            miny = obj[0];
                        if( first || obj[1] > maxy )
                            maxy = obj[0];
                        
                        if( gfirst || obj[0] < gminx )
                            gminx = obj[0];
                        if( gfirst || obj[0] > gmaxx )
                            gmaxx = obj[0];
                        if( gfirst || obj[1] < gminy )
                            gminy = obj[0];
                        if( gfirst || obj[1] > gmaxy )
                            gmaxy = obj[0];
                    }
                } else if( obj.type == 'GeometryCollection' ) {
                    for( var pi = 0; pi < obj.geometries.length; pi++ ) 
                        addpt(obj.geometries[pi]);
                } else {
                    addpt(obj.coordinates);
                }
            }
            
            addpt(geom);
            return { 
                x: minx,
                y: miny,
                w: maxx-minx,
                h: maxy-miny 
            };
        }
        
        var objects = [];
        function processFeature(feat) {
            if( feat.type == 'FeatureCollection' ) {
                for( var fi = 0; fi < feat.features.length; fi++ )
                    processFeature(feat.features[fi]);
            } else if( feat.type == 'Feature' ) {
                var obj = processGeometry(feat.geometry);
                obj.f = feat;
                objects.push(obj);
            }
        }
        
        processFeature(data);
        
        qt = QuadTree(gminx - 1, gminy - 1, gmaxx + 1, gmaxy + 1);
        for( var oi = 0; oi < objects.length; oi++ )
            qt.put(objects[oi]);
    }

    retobj.parse = function(data) {
        qt = QuadTree();
        qt.parse(data);
    }

    retobj.stringify = function() {
        return qt.stringify();
    }

    retobj.each = function(obj, buf, geomtype, fun) {
        if( typeof buf == 'function' && typeof fun == 'undefined' ) {
            fun = buf;
            buf = 0;
        }
        
        qt.get(obj, buf, function(item) {
            if( item.f.geometry.type != geomtype )
                return true;
            return fun(item);
        });
    }

    function browseGeometries(feat, fun) {
        if( feat.geometry.type == 'GeometryCollection' ) {
            for( var gi = 0; gi < feat.geometry.geometries.length; gi++ )
                if( fun(feat.geometry.geometries[gi]) == false )
                    return false;
            return true;
        } else
            return fun(feat.geometry);
    }
    
    retobj.eachPoint = function(obj, buf, fun) {
        if( typeof buf == 'function' && typeof fun == 'undefined' ) {
            fun = buf;
            buf = 0;
        }

        qt.get(obj, buf, function(item) {
            return browseGeometries(item.f, function(geom) {
                if( geom.type == 'Point' )
                    return fun(item.f, geom.coordinates);
                else if( geom.type == 'MultiPoint' ) {
                    for( var pi = 0; pi < geom.coordinates.length; pi++ )
                        if( fun(item.f, geom.coordinates[pi]) == false )
                            return false;
                    return true;
                } else
                    return true;
            });
        });
    }
    
    retobj.eachLine = function(obj, buf, fun) {
        if( typeof buf == 'function' && typeof fun == 'undefined' ) {
            fun = buf;
            buf = 0;
        }

        qt.get(obj, buf, function(item) {
            return browseGeometries(item.f, function(geom) {
                if( geom.type == 'LineString' ) {
                    for( var li = 0; li < geom.coordinates.length - 1; li++ )
                        if( fun(item.f, geom.coordinates[li],
                                geom.coordinates[li+1]) == false )
                            return false;
                    return true;
                } else if( geom.type == 'MultiLineString' ||
                           geom.type == 'Polygon' ) {
                    for( var pi = 0; pi < geom.coordinates.length; pi++ )
                        for( var li = 0; li < geom.coordinates[pi].length - 1; li++ )
                            if( fun(item.f, geom.coordinates[pi][li],
                                    geom.coordinates[pi][li+1]) == false )
                                return false;
                    return true;
                } else if( geom.type == 'MultiPolygon' ) {
                    for( var ppi = 0; ppi < geom.coordinates.length; ppi++ ) 
                        for( var pi = 0; pi < geom.coordinates[ppi].length; pi++ )
                            for( var li = 0; li < geom.coordinates[ppi][pi].length - 1; li++ )
                                if( fun(item.f, geom.coordinates[ppi][pi][li],
                                        geom.coordinates[ppi][pi][li+1]) == false )
                                    return false;
                    return true;
                } else
                    return true;
            });
        });
    }
    
    return retobj;
};

if( typeof module != 'undefined' )
    module.exports = GeoJSON;