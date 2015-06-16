var path = require('path');
var fs = require('fs');
var Transform = require('stream').Transform;

function fileCopy(src, dest, name, className)
{
    var content = fs.readFileSync(src);
    content = String(content);
    content = content.split('${name}').join(name);
    content = content.split('${className}').join(className);
    fs.writeFile(dest, content, {flag:'w+'});
}

/** コンポーネントを新規作成 */
module.exports = function(name, componentsDir, templateDir){
    if (!componentsDir) componentsDir = './components/';
    if (!templateDir) templateDir = 'node_modules/html-components-template/template/';
    var _dest = path.resolve(componentsDir, name);

    if (fs.existsSync(_dest))
    {
        console.log(name + ' exists');
        return;
    }
    else
    {
        fs.mkdirSync(_dest);
    }

    var className = [];
    name.split('-').forEach(function(t)
    {
        if (t.length > 1)
            className.push(t.substr(0,1).toUpperCase() + t.substr(1));
        else
            className.push(t.substr(0,1).toUpperCase());
    });
    className = className.join('');

    console.log('name='+name);
    console.log('className='+className);

    var src = path.resolve(templateDir, 'src/');

    var _srcDir = path.resolve(_dest, 'src/');
    if (!fs.existsSync(_srcDir))
        fs.mkdirSync(_srcDir);

    fileCopy(path.resolve(templateDir, 'package.json'),
        path.resolve(_dest, 'package.json'), name, className);

    fs.readdir(src, function(err, files)
    {
        if (err) throw err;
        files.forEach(function(file){
            var destFile = file;
            var ext = path.extname(file);
            var fileName = path.basename(file, ext);
            if (fileName == 'template')
            {
                destFile = name + ext;
            }
            var srcFile = path.join(src, file);
            var dstFile = path.join(_dest, 'src/'+destFile);
            if (fs.statSync(srcFile).isDirectory())
            {
                if (!fs.existsSync(dstFile))
                    fs.mkdir(dstFile);
            }
            else
            {
                fileCopy(srcFile, dstFile, name, className);
            }
        });
    });
};