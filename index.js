'use strict';

var fs = require('fs');
var exec = require('exec');

function HtmlComponent() {}

/** 初期化処理 */
HtmlComponent.prototype.init = function(){
    //TODO: プロジェクトを作成する
};

/** コンポーネントの一覧を出力する */
HtmlComponent.prototype.list = function(){
    //TODO: 未実装
};

/** GitHubからコンポーネントを追加する */
HtmlComponent.prototype.install = function(name, callback){
    //TODO: 未実装
};

/** コンポーネントを削除する */
HtmlComponent.prototype.uninstall = function(name, callback){
    //TODO: 未実装
    var path = './components/'
    fs.unlink(path + name, callback);
};

/** コンポーネントをサーバーに保存する */
HtmlComponent.prototype.save = function(name, callback){
    //TODO: 未実装

};

/** コンポーネントを新規作成 */
HtmlComponent.prototype.create = require('./lib/create.js');

/** コンポーネントの名前を変更する */
HtmlComponent.prototype.rename = function(currentName, replaceName, callback){
    //TODO: 未実装
    var path = './components/'
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
HtmlComponent.prototype.build = function(callback){
    //TODO: gulp-html-componentから処理を移す
};

module.exports = new HtmlComponent();

