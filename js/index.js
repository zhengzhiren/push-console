$(function() {

	var myLineChart = null;
	var pkg = $.cookie('pkg');
	var appid = $.cookie('appid');
	console.log(pkg)
	console.log(appid)
	if (typeof(pkg) == "undefined" || typeof(appid) == "undefined") {
		window.location.replace("signin.html");
	}
	$('#package').text(pkg)
	$('#appid').text(appid)

	var getStats = function(appId) {
		var startDate = $("#start_date").prop("value");
		var endDate = $("#end_date").prop("value");
		var query = {
			start_date: startDate,
			end_date: endDate
		}
		var url;
		if (typeof(appId) == "undefined") { // system stats
			url = 'http://push.scloud.letv.com/api/v1/stats/sys';
		} else { // app stats
			url = 'http://push.scloud.letv.com/api/v1/stats/app';
			query["appid"] = appid;
		}
		var option = {
			url: url,
			dataType: 'json',
			type: 'GET',
			data: query,
			success: render,
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest.responseText);
				$('#result').text(XMLHttpRequest.responseText).removeClass("alert-success").dialog({
					dialogClass: "alert-danger",
					title: "错误"
				});
			},
		}
		$.ajax(option);
	}

	var pushMsg = function(appid) {
		var pushdata = {};
		var push_params = {};

		var push_type = parseInt($("#push_type").val());
		switch (push_type) {
			case 1:	// 广播
				break;
			case 2:	// RegId
				var regIds = $("#regids").val().split(" ");
				push_params["regid"] = regIds;
				break;
			case 3:	// UserId
				var userIds = $("#userids").val().split(" ");
				push_params["userid"] = userIds;
				break;
			case 4:	// DeviceId
				var devIds = $("#devids").val().split(" ");
				push_params["devid"] = devIds;
				break;
			case 5:	// 标签
				var topics = $("#topics").val().split(" ");
				push_params["topic"] = topics;
				push_params["topic_op"] = $('input[name=topic_op]').filter(':checked').val();
			break;
		}
		pushdata["appid"] = appid;
		pushdata["push_type"] = push_type;
		pushdata["push_params"] = push_params;

		var msg_type = parseInt($('input[name=msg_type]').filter(':checked').val());

		if(msg_type == 1) {
			var notification = {};
			notification["title"] = $("#title").val();
			notification["desc"] = $("#desc").val();
			var notify_type = 0;
			if ($("#notify_sound").prop('checked')) {
				notify_type += parseInt($("#notify_sound").val());
			}
			if ($("#notify_vibrate").prop('checked')) {
				notify_type += parseInt($("#notify_vibrate").val());
			}
			if ($("#notify_led").prop('checked')) {
				notify_type += parseInt($("#notify_led").val());
			}
			notification["type"] = notify_type; 
			notification["action"] = parseInt($("#action").val());
			notification["sound_uri"] = $("#sound_uri").val();
			notification["intent_uri"] = $("#intent_uri").val();
			notification["web_uri"] = $("#web_uri").val();
			notification["icon_uri"] = $("#icon_uri").val();
			pushdata["notification"] = notification;
		} else {
			pushdata["content"] = $("#content").val();
		}
		pushdata["msg_type"] = msg_type;
		var ttl = parseInt($("#ttl_select").val());
		if (ttl < 0) {
			ttl = parseInt($("#ttl_custom").val());
			if (isNaN(ttl)) {
				ttl = 0;
			}
		}
		var options = {
			ttl: ttl
		}
		pushdata["options"] = options;
		console.log(pushdata);

		var option = {
			url: 'http://push.scloud.letv.com/api/v1/message',
				dataType: 'json',
			type: 'post',
			contentType : "application/json;charset=utf-8", 
			data: JSON.stringify(pushdata),
			headers : {
				"Authorization" : "LETV "+appid +" pushtest"
			},
			success: function(json) {
				$('#result').text("消息Id：" + json.data.msgid).removeClass("alert-danger").dialog({
					dialogClass: "alert-success",
					title: "推送成功"
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest.responseText);
				$('#result').text(XMLHttpRequest.responseText).removeClass("alert-success").dialog({
					dialogClass: "alert-danger",
					title: "推送失败"
				});
			},
		}
		new Go(option);
	}

	var render = function(json) {
		console.log(json);
		var labels = new Array()
		var pushApi = new Array()
		var send = new Array()
		var received = new Array()
		var click = new Array()

		var stats_pushapi = $("#stats_pushapi").prop('checked');
		var stats_send = $("#stats_send").prop('checked');
		var stats_received = $("#stats_received").prop('checked');
		var stats_click = $("#stats_click").prop('checked');

		for (i=0; i< json.data.length; i++) {
			labels[i] = json.data[i].date;
			pushApi[i] = json.data[i].pushapi;
			send[i] = json.data[i].send;
			received[i] = json.data[i].received;
			click[i] = json.data[i].click;
		}
		var ctx = $("#statsChart").get(0).getContext("2d");
		Chart.defaults.global.responsive = true;
		var data = {
			labels: labels,
			datasets: []
		};
		if (stats_pushapi) {
			data.datasets.push(
				{
				label: "Push API",
				fillColor: "rgba(151,187,205,0.2)",
				strokeColor: "rgba(151,187,205,1)",
				pointColor: "rgba(151,187,205,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(151,187,205,1)",
				data: pushApi
			});
		}
		if (stats_send) {
			data.datasets.push(
				{
				label: "Send",
				fillColor: "rgba(205,92,92,0.2)",
				strokeColor: "rgba(205,92,92,1)",
				pointColor: "rgba(205,92,92,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(205,92,92,1)",
				data: send
			});
		}
		if (stats_received) {
			data.datasets.push(
				{
				label: "Receive",
				fillColor: "rgba(34,139,34,0.2)",
				strokeColor: "rgba(34,139,34,1)",
				pointColor: "rgba(34,139,34,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(34,139,34,1)",
				data: received
			});
		}
		if (stats_click) {
			data.datasets.push(
				{
				label: "Click",
				fillColor: "rgba(188,143,143,0.2)",
				strokeColor: "rgba(188,143,143,1)",
				pointColor: "rgba(188,143,143,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(188,143,143,1)",
				data: click
			});
		}
		if (myLineChart != null) {
			myLineChart.destroy();
		}
		myLineChart = new Chart(ctx).Line(data);
	}
	var initDate = function(){
		$( "#start_date" ).datepicker({
			dateFormat: "yymmdd"
		});
		$( "#end_date" ).datepicker({
			dateFormat: "yymmdd"
		});
		var end = new Date();
		var start = new Date(end);
		start.setDate(start.getDate()-7);
		$("#start_date").datepicker("setDate", start);
		$("#end_date").datepicker("setDate", end);
	}

	var initValidation = function() {
		$('#pushform').validate({   
			/* 设置验证规则 */  
			rules: {
				title: {
					required:true
				},
				ttl_custom: {
					digits:true
				}
			},   

			/* 设置错误信息 */  
			messages: {   
				//title: {       
				//	required: "请输入标题"
				//}
			},   

			submitHandler: function(form) {
				pushMsg(appid);
			}

		});   
	}

	var Go = function(opt) {
		if (!opt.data) {
			opt.data = {};
		}
		var data = opt.data;
		if (!(opt.type == "post")) { //get请求加时间戳
			var t = new Date().getTime();
			if (typeof(opt.data) == 'string') {
				opt.data = opt.data + '&t=' + t; //字符串参数
			} else {
				$.extend(opt.data, {
					t: t
				})
			}
		}
		$.ajax(opt);
	}

	var Push = function() {
		this.element = $('#pushform');
		this.init();
	}
	$.extend(Push.prototype, {
		init: function() {
			this.bind();
			$('#query').on('submit', function(e) {
				e.preventDefault();
				if ($("#stats_system").prop('checked')) {
					getStats();
				} else {
					getStats(appid);
				}
			});
			initDate();
			initValidation();

			$("#history").jqGrid({
				url: "http://push.scloud.letv.com/api/v1/history",
				postData: {
					appid: appid
				},
				datatype: "json",
				mtype: "GET",
				colNames: ["发送时间", "消息Id", "消息类型", "推送方式", "内容", "发送", "送达"],
				colModel: [
					{ name: "ctime", align: "center", width: "200",
						formatter: function(cellvalue, options, rowObject) {
							return $.format.date(cellvalue * 1000, "yyyy-MM-dd HH:mm:ss")
						}
					},
					{ name: "msgid", align: "center"},
					{ name: "msg_type", align: "center", width: "80",
						formatter: function(cellvalue, options, rowObject) {
							if (cellvalue == 1) {
								return "通知"
							} else if (cellvalue == 2) {
								return "消息"
							} else {
								return "未知"
							}
						}
					},
					{ name: "push_type", align: "center", width: "90",
						formatter: function(cellvalue, options, rowObject) {
							switch (cellvalue) {
								case 1:
									return "广播"
								case 2:
									return "RegId"
								case 3:
									return "用户Id"
								case 4:
									return "设备Id"
								case 5:
									return "标签"
								default:
									return "未知"
							}
						}
					},
					{ name: "msg_content", align: "left", width: "200",
						formatter: function(cellvalue, options, rowObject) {
							switch (rowObject.msg_type) {
								case 1:
									if (typeof(rowObject.notification.desc) != "undefined") {
										return rowObject.notification.desc
									}
									break;
								case 2:
									return rowObject.content
							}
							return ""
						}
					},
					{ name: "send", align: "center",  width: "80",},
					{ name: "received", align: "center", width: "80",}
				],
				height: "auto",
				autowidth: true,
				sortable: true,
				pager: "#pager",
				recordtext: "{0} - {1}， 共{2}条消息",
				pgtext : "页{0} 共{1}页",
				rowNum: 20,
				rowList: [20, 50, 100],
				viewrecords: true,
				gridview: true,
				autoencode: true,
				caption: "",
				prmNames: {
					page:"page_number",
					rows: "page_size"
				},
				jsonReader: {
					root: "data.msgs",
					page: "data.page_number",
					total: function(obj) {return obj.data.total_size/obj.data.page_size},
					records: "data.total_size",
				},
				onSelectRow: function(id){
					var msgid = $("#history").getRowData(id)["msgid"]
					var data = {
						msgid: msgid,
					}
					var option = {
						url: 'http://push.scloud.letv.com/api/v1/trace',
							dataType: 'text',
						type: 'get',
						data: data,
						success: function(data) {
							$('#msgDetailModal').modal('show')
							$('#msgTrace').text(data)
						},
					}
					$.ajax(option);
				},
			}); 
			//$("#stats_typs").buttonset();
		},
		bind: function() {
			var me = this;
			var radios = this.element.find('[name="msg_type"]');
			radios.on('change', function(e) {
				e.preventDefault();
				var checked = $(this).prop('checked');
				var id = $(this).attr('id');
				if( (id == 'type_notification') && checked) {
					me.showNotificationArea();
				} else if(checked){
					me.showMessageArea();
				}
			
			}).change();

			$('#app_info_link').on('click', function(e) {
				e.preventDefault();
				var data = {};
				data["pkg"] = pkg
				var option = {
					url: 'http://push.scloud.letv.com/api/v1/app',
						dataType: 'json',
					type: 'get',
					data: data,
					success: function(json) {
						$('#app_info').empty()
						.append("<dt>"+"appid"+"</dt>")
						.append("<dd>"+json.data.appid+"</dd>")
						.append("<dt>"+"App包名"+"</dt>")
						.append("<dd>"+json.data.pkg+"</dd>")
						.append("<dt>"+"描述"+"</dt>")
						.append("<dd>"+json.data.desc+"</dd>")
						.append("<dt>"+"注册人"+"</dt>")
						.append("<dd>"+json.data.name+"</dd>")
						.append("<dt>"+"电话"+"</dt>")
						.append("<dd>"+json.data.mobile+"</dd>")
						.append("<dt>"+"Email"+"</dt>")
						.append("<dd>"+json.data.email+"</dd>")
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
						$('#result').text(XMLHttpRequest.responseText).removeClass("alert-success").dialog({
							dialogClass: "alert-danger",
							title: "错误"
						});
					},
				}
				$.ajax(option);
			})

			$('#signout').on('click', function(e) {
				$.removeCookie('pkg');
				$.removeCookie('appid');
			})
			
			var select = this.element.find('[name="push_type"]');
			select.on('change', function(e) {
				e.preventDefault();
				switch ($(this).prop('selectedIndex')) {
				case 0:
					me.hidePushTypeArea();
					break;
				case 1:
					me.showRegIdArea();
					break;
				case 2:
					me.showUseridArea();
					break;
				case 3:
					me.showDevidArea();
					break;
				case 4:
					me.showTopicArea();
					break;
				}
			}).change();

			$("#ttl_select").on('change', function(e) {
				e.preventDefault();
				if ($(this).val() < 0) {
					$("#ttl_custom").show();
				} else {
					$("#ttl_custom").hide();
				}
			});

		},
		hidePushTypeArea: function() {
			$(".push_type").slideUp();
		},
		showRegIdArea: function() {
			$(".push_type").slideUp();
			$(".regid").slideDown();
		},
		showUseridArea: function() {
			$(".push_type").slideUp();
			$(".userid").slideDown();
		},
		showDevidArea: function() {
			$(".push_type").slideUp();
			$(".devid").slideDown();
		},
		showTopicArea: function() {
			$(".push_type").slideUp();
			$(".topic").slideDown();
		},
		showMessageArea: function() {
			$(".notification").slideUp();
			$(".content").slideDown();
		},
		showNotificationArea: function() {
			$(".content").slideUp();
			$(".notification").slideDown();
		}
	});
	new Push();

})
