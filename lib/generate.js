var gen  = require('./dist/generator.js');
var html = new gen.HTMLGenerator();
var css  = new gen.CSSGenerator();
var test  = new gen.LayoutPreviewGenerator();
var parser  = new gen.LayoutJSONParser();

module.exports = function(layoutJsonFilePath, optionJsonFilePath)
{
    //var layoutJsonFilePath = './' + psdName + '-layout.json';
    //var optionJsonFilePath = './' + psdName + '-option.json';

    parser.load(layoutJsonFilePath, optionJsonFilePath, function(){
        var data = parser.parse();
        test.load(data);
        test.generate();
    });
};

