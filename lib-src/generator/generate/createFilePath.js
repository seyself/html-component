
import path from 'path';

export function createFilePath(params){
  var htmlFile = path.join(params.dest_dir, params.filename);
  var jadeFile = './src/pages/' + params.filename.replace('.html', '.jade');
  var cssFile = path.join(params.dest_dir, 'css');
  cssFile = path.join(cssFile, path.basename(htmlFile).replace('.html', '.css'));
  var stylusFile = './src/pages/css/' + params.filename.replace('.html', '.styl');
  var cssPath = path.relative(path.dirname(htmlFile), cssFile);
  var jsPath = cssPath.replace(/[^\/]+\/([^.]+)\.css/, 'js/$1.js');
  return {
    htmlFile: htmlFile,
    jadeFile: jadeFile,
    cssFile: cssFile,
    stylusFile: stylusFile,
    cssPath: cssPath,
    jsPath: jsPath
  };
}

