var AWS = require('aws-sdk');
var fs = require('fs');
var path = require('path');
var exec = require('exec');

var FILE_CONTENT_TYPE = {};
	FILE_CONTENT_TYPE['.json'] = 'application/json';
	FILE_CONTENT_TYPE['.html'] = 'text/html';
	FILE_CONTENT_TYPE['.css'] = 'text/css';
	FILE_CONTENT_TYPE['.js'] = 'text/javascript';
	FILE_CONTENT_TYPE['.png'] = 'image/png';
	FILE_CONTENT_TYPE['.jpg'] = 'image/jpeg';
	FILE_CONTENT_TYPE['.gif'] = 'image/gif';

var S3Client = function(configJson)
{
	AWS.config.loadFromPath(configJson);
	var s3 = new AWS.S3();
	var queue = [];
	var bucket = "html-components";

	this.upload = uploadDir;
	this.download = downloadFiles;
	// this.next = next;
	this.done = done;

	function searchFiles(dirPath)
	{
		var dest = [];
		_searchDir(dirPath);

		function _searchDir(_dirpath)
		{
			var files = fs.readdirSync(_dirpath);
			files.forEach(function (file) {
				var filePath = _dirpath + '/' + file;
				if (fs.statSync(filePath).isFile())
				{
					dest.push({src:filePath, path:filePath.replace(dirPath + '/', '')});
				}
				else if (fs.statSync(filePath).isDirectory())
				{
					_searchDir(filePath);
				}
		    });
		}

		return dest;
	}

	function uploadDir(dirPath, remoteDir, filter)
	{
		dirPath = path.join(process.cwd(), dirPath);
		var list = searchFiles(dirPath);
		uploadFiles(list, remoteDir, filter);
	}

	function uploadFiles(files, dest, filter)
	{
		if (!filter)
			filter = /.+/

		var len = files.length;
		for(var i=0;i<len;i++)
		{
			var file = files[i];
			if (filter.test(file.src))
				_upload(file, dest);
		}

		function _upload(file, destDir)
		{
			var dest = path.join(destDir, file.path);
			var type = getContentType(file.src);
			var buffer = fs.readFileSync(file.src);
			// console.log(dest);
			// return;
			queue.push(function(){
				console.log('upload', dest);

				var params = {
					Bucket: bucket, 
					ACL: 'public-read',
					Key: dest, 
					Body: buffer
				};
				if (type)
					params.ContentType = type;

				s3.putObject(params, function(err, data){
					if (err) console.log('error:', err, err.stack); // an error occurred
					else     console.log('upload success');           // successful response
					next();
				});
			});
		}

		next();
	}

	function getContentType(fileName)
	{
		var exp = path.extname(fileName.toLowerCase());
		return FILE_CONTENT_TYPE[exp] || null;
	}

	function next()
	{
		var func = queue.shift();
		if (func)
			func();
		else
			done();
	}

	function getList(prefix, callback)
	{
		var params = {
			Bucket: bucket,
			Prefix: prefix
		};
		s3.listObjects(params, function(err, data){
			if (err)
			{
				console.log('error:', err, err.stack); // an error occurred
				if (callback)
					callback(err, null);
			}
			else
			{
				var result = [];
				var list = data.Contents;
				var len = list.length;
				for(var i=0; i<len; i++)
				{
					var item = list[i];
					result.push(item.Key);
				}
				// console.log(result);
				if (callback)
					callback(null, result);
			}
		});
	}

	function downloadFiles(remotePath, localPath, callback)
	{
		getList(remotePath, function(err, list){
			var len = list.length;
			for(var i=0;i<len;i++)
			{
				_download(list[i]);
			}
			next();
		});

		function _download(filePath)
		{
			queue.push(function(){
				//--
				var params = {
					Bucket: bucket,
					Key: filePath
				};
				s3.getObject(params, function(err, data){
					if (err)
					{
						console.log('error:', err, err.stack); // an error occurred
						if (callback)
							callback(err, null);
					}
					else
					{
						_saveFile(filePath, data);
					}
				});
				//--
			});
		}

		function _saveFile(filePath, data)
		{
			var buffer = data.Body;
			var option = {
				encoding:data.ContentEncoding
			}
			var filePath = path.join(localPath, filePath.replace('components', ''));
			var dir = path.dirname(filePath);
			exec('mkdir -p ' + dir, function(err, out, code) {
				if (err instanceof Error)
					throw err;
				// process.stderr.write(err);
				// process.stdout.write(out);
				// process.exit(code);
				fs.writeFileSync(filePath, buffer, option);
				console.log('download:', filePath);
				next();
			});
		}
	}

	function done()
	{
		console.log('done');
	}
}

module.exports = S3Client;

// var remote, local, filter;
// var S3Client = require('S3Client');
// var client = new S3Client('./credentials.json');
// client.upload(local='./components', remote='components', filter=/\.(html|css|js)$/);
// client.download(remote='components/launch-link', local='copy');



