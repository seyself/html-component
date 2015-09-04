(function(){

	var _queue = [];
	var _registeredNodes = [];
	var loadCount = 0;

	window._debug = true;
	window._log = function(){
		if (window._debug)
			console.log.apply(console, arguments);
	}
	window._err = function(){
		window._debug
			console.error.apply(console, arguments);
	}

	function next()
	{
		var task = _queue.shift();
		if (task) task();
		else      done();
	}

	function warn()
	{
		alert('警告\nコンポーネントの読み込みが100を超えたため強制停止しました。');
	}

	function done()
	{
		_log('done!');
	}

	function getComponentTags()
	{
		var tags = [];
		var matches = document.body.innerHTML.match(/<[^!>/\s]+-[^>\s]+/g);
		if (!matches) return null;

		var len = matches.length;
		for (var i=0; i<len; i++)
		{
			var name = matches[i];
			name = name.substr(1);
			var elements = document.getElementsByTagName(name);
			var numElements = elements.length;
			for(var j=0; j<numElements; j++)
			{
				var node = elements[j];
				if (_registeredNodes.indexOf(node) < 0)
				{
					tags.push( {name:name, node:node} );
					_registeredNodes.push(node);
				}
			}
		}
		return tags;
	}

	function loadComponents(tags)
	{
		if(!tags) return;
		var len = tags.length;
		for(var i=0; i<len; i++)
		{
			_queue.push(loadComponent(tags[i]));
		}
	}

	function loadComponent(data)
	{
		return function(){
			var node = data.node;
			$.ajax({
				url: 'components/' + data.name + '/dist/' + data.name + '.html',
				method: 'get',
				success: function(html){
					_log('load', data.name);
					loadCount++;

					//アセットのパスを差し替える
					html = replaceAssetPath(html, data);
					//外部読み込みのファイルのパスを変更する
					html = replaceSrcPath(html, data);
					//コンポーネントのHTMLをパースする
					parseComponent(html, data);

					if (loadCount < 100)
						start();
					else
						warn();
				}
			});
		}
	}

	function parseComponent(html, data)
	{
		var list = html.split('<!--export-->');
		var styles = [];
		var scripts = [];
		var codes = [];
		var len = list.length;
		for(var i=1;i<len;i++)
		{
			var code = list[i];
			code = code.split('<!--/export-->').shift();
			code = code.replace(/<style(.|\s)*<\/style>/igm, function(text){
				if (!text.match(/<style[^>]+exclude[^>]*/))
					styles.push(text);
				return '';
			});
			code = code.replace(/<link[^>]+rel=["']stylesheet['"][^>]+>/igm, function(text){
				if (!text.match(/<link[^>]+exclude[^>]*/))
					styles.push(text);
				return '';
			});
			code = code.replace(/<script(.|\s)*<\/script>/gm, function(text){
				if (!text.match(/<script[^>]+exclude[^>]*/))
					scripts.push(text);
				return '';
			});
			codes.push(code);
		}
		insertStyles(styles);
		insertHTML(codes, data);
		insertScripts(scripts);
	}

	function replaceSrcPath(html, data)
	{
		var newPath = 'components/' + data.name + '/dist/';
		html = html.replace(/<script([^>]+)src=['"]([^'"]+)['"]/g, '<script$1src="' + newPath + '$2"');
		html = html.replace(/<link([^>]+)href=['"]([^'"]+)['"]/g, '<link$1href="' + newPath + '$2"');
		return html;
	}
	function replaceAssetPath(html, data)
	{
		return html.split('component-assets/')
			.join('components/' + data.name + '/dist/component-assets/')
	}
	function insertStyles(styles)
	{
		styles = styles.join('');
		if (styles && document.head.innerHTML.indexOf(styles) < 0)
			$(document.head).append(styles);
	}
	function insertScripts(scripts)
	{
		scripts = scripts.join('')
		if (scripts && document.body.innerHTML.indexOf(scripts) < 0)
			$(document.body).append(scripts);
	}
	function insertHTML(codes, data)
	{
		var node = $(data.node);
		node.after(codes);
		node.remove();
	}
	
	function start()
	{
		//コンポーネントタグの一覧を作る
		var tags = getComponentTags();
		//コンポーネントを読み込む
		loadComponents(tags);
		//キューを開始する
		next();
	}
	
	start();
})();

