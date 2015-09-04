var path = require('path');
var gen  = require('./generator/dist/generator.js');
var html = new gen.HTMLGenerator();
var css  = new gen.CSSGenerator();
var test  = new gen.LayoutPreviewGenerator();
var parser  = new gen.LayoutJSONParser();

module.exports = function(params)
{
    var cwd = process.cwd();
    var dir = path.dirname(params.dest);
    var img_src_path = path.relative(dir, params.assets_dest);
    console.log(img_src_path)
    var _params = {
        cwd : cwd,
        layout_json : path.join(cwd, params.layout_json),
        option_json : path.join(cwd, params.option_json),
        assets_src : path.join(cwd, params.assets_src),
        assets_dest : params.assets_dest,
        dest_dir : path.join(cwd, dir),
        filename : path.basename(params.dest),
        assets_src_path : img_src_path // img src path
    };

    parser.load(_params.layout_json, _params.option_json, function(){
        var data = parser.parse();
        test.load(data);
        test.generate(_params);
    });
};

