var path = require('path');
// var gen  = require('./generator/dist/generator.js');
var gen  = require('./generator/dist/main.js');
gen.init();
var generator  = new gen.LayoutPreviewGenerator();
var parser  = new gen.LayoutJSONParser();

module.exports = function(params)
{
    var cwd = process.cwd();
    var dir = path.dirname(params.dest);
    var img_src_path = path.relative(dir, params.assets_dest);

    var _params = {
        cwd : cwd,
        use_component : params.use_component == true,
        layout_json : path.join(cwd, params.layout_json),
        assets_src : path.join(cwd, params.assets_src),
        assets_dest : params.assets_dest,
        dest_dir : path.join(cwd, dir),
        filename : path.basename(params.dest),
        export_jade : params.jade,
        export_coffee : params.coffee,
        export_stylus : params.stylus,
        assets_src_path : img_src_path // img src path
    };

    parser.load(_params.layout_json, function(){
        var data = parser.parse();
        generator.load(data);
        generator.generate(_params);
    });
};

