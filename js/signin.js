$(function() {
	$('#signin').on('submit', function(e) {
		e.preventDefault();
		var data = {};
		pkg = $('#pkg').val();
		data["pkg"] = pkg
		console.log(data)
		var option = {
			url: 'http://push.scloud.letv.com/api/v1/app',
			dataType: 'json',
			type: 'get',
			data: data,
			success: function(json) {
				var appid = json.data.appid;
				var cookieOpt = {
					path: '/'
				}
				if ($("#remember").prop('checked')) {
					cookieOpt["expires"] = 7
				}
				$.cookie('pkg', pkg, cookieOpt);
				$.cookie('appid', appid, cookieOpt);
				window.location.replace("index.html");
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest.responseText);
				$('#result').text(XMLHttpRequest.responseText).removeClass("alert-success").dialog({
					dialogClass: "alert-danger",
					title: "错误"
				});
			},
		}
		$.ajax(option);
	});
})
