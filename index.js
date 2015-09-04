'use strict';

var fs = require('fs');
var exec = require('exec');
var S3Client = require('./lib/s3client.js');
var s3 = new S3Client('./credentials.json');
var _root = process.cwd();
var _moduleDir = module.filename.replace(/\/[^/]+$/, '/');


function HtmlComponent() {}

/** 初期化処理 */
HtmlComponent.prototype.init = function(){
    //TODO: プロジェクトを作成する
    var defaultComponents = _moduleDir + 'components/';
    var destComponents = _root + '/components';
    _copyRecursiveSync(defaultComponents, destComponents);
};

/** コンポーネントの一覧を出力する */
HtmlComponent.prototype.list = function(){
    //TODO: 未実装
};

/** S3からコンポーネントを追加する */
HtmlComponent.prototype.install = function(name, local, callback){
    if (!name)
    {
        console.log('Error: Component name is undefined');
        return;
    }
    if (!local)
        local = './components';
    var remote = 'components/';

    s3.download(remote + name, local);
};

/** コンポーネントを削除する */
HtmlComponent.prototype.uninstall = function(name, callback){
    //TODO: 未実装
    var path = './components/';
    fs.unlink(path + name, callback);
};

/** コンポーネントをサーバーに保存する */
HtmlComponent.prototype.save = function(name, local, filter, callback){
    if (!name)
    {
        console.log('Error: Component name is undefined');
        return;
    }
    if (!local)
        local = './components';
    local += '/' + name;

    if (!filter)
        filter = /\.(html|css|js)$/;

    var remote = 'components/' + name;

    s3.upload(local, remote, filter);
};

/** コンポーネントを新規作成 */
HtmlComponent.prototype.create = require('./lib/create.js');

/** コンポーネントの名前を変更する */
HtmlComponent.prototype.rename = function(currentName, replaceName, callback){
    //TODO: 未実装
    var path = './components/';
    fs.rename(path + currentName, path + replaceName, function(err){
        if (err)
        {
            callback(err);
        }
        else
        {
            callback();
        }
    })
};

/** コンポーネントを使ったHTMLを書き出す */
HtmlComponent.prototype.gulp_build = require('./lib/gulp-build.js');

HtmlComponent.prototype.generate = require('./lib/generate.js');

module.exports = new HtmlComponent();



function _copyRecursiveSync(src, dest) {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (exists && isDirectory) {
        if (!fs.existsSync(dest))
            fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function(childItemName) {
            _copyRecursiveSync(path.join(src, childItemName),
                path.join(dest, childItemName));
        });
    } else {
        fs.linkSync(src, dest);
    }
};

