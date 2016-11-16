/*
	采用模块化编写,将一些抽象函数写在这里,在另一个文件中调用,
	模块 GetData函数  ChangeData函数，opntions设置属性，
 */

//获得serviceName   hostName
require.config({
	paths:{
		"jquery" : "jquery"
	}
});
define(['jquery'], function($){
	var graphIdLength = 720;
　　function GetData() {
		var getHostName1 = function() {
			        var arrayName = document.cookie.split(";");

			        for (var a = 0; a < arrayName.length; a++) {
			            if (arrayName[a].indexOf("hostName") != -1) {
			                hostName = arrayName[a].split("=")[1];
							console.log("hostName=="+hostName);		           
			            }
			        }
			        for (var b = 0; b< arrayName.length; b++) {
			            if (arrayName[b].indexOf("serviceName") != -1) {
			                serviceName = arrayName[b].split("=")[1];
			            	console.log("serviceName=="+serviceName);	
			            }
			        }
	   			};
		getHostName1();
		this.getHistoryData = function(obj_url) {//得到历史数据
			var dataAllGraphHost = {};　　　　　
            $.ajax({
                url: obj_url,
                method: "get",
                async: false,
                dataType: "json",
                success: function(result, status, xhr) {
                    dataAllGraphHost = result;
                },
                error: function(XMLHttpRequest, status, jqXHR, textStatus, e) {
                    console.error("gethistoryData 状态 =" + status);
                }
            });
            return dataAllGraphHost;　
		};
		this.getRandomData  = function() {//得到增量数据
			
			var dataAllGraphHost = {};
			$.ajax({
                url:"http://" + IP + "/v1/kv/cmha/service/"+serviceName+"/Graph/current/"+hostName+"?raw" ,
                method: "get",
                async: false,
                dataType: "json",
                success: function(result, status, xhr) {
                    dataAllGraphHost = result;
                },
                error: function(XMLHttpRequest, status, jqXHR, textStatus, e) {
                    console.error("getimsData 状态 " + status);
                }
            });
        	return dataAllGraphHost;
		};
	}
	function ChangeData() {

		this.m1 = function(obj_data) {  //处理原始全量数据
			 var  after_data = [];
            for (var i = 0; i < obj_data.length; i++) {
            	for (var j = obj_data[i].data.length - 1; j >= 0; j--) {
            		var Intdata =  Number(obj_data[i].data[j]);
            		 obj_data[i].data.splice(j, 1, Intdata );

            	}
                after_data.push(obj_data[i].data);
            }
            return after_data;　　
		};
		this.m2 = function(obj_data_his,obj_data_inc) {   //处理原始增量数据，将增量数据加进去
	         if (obj_data_his.length >= graphIdLength) {
                var obj_data_his_length = obj_data_his.length;
                for (var j = 0; j < obj_data_his_length; j++) {
                    if (obj_data_his[j].id == obj_data_inc[0].id) {
                        obj_data_his.splice(j, 1, obj_data_inc[0]);
                        return obj_data_his;
                    }
                }

                return obj_data_his;
            } else {
                obj_data_his.push(obj_data_inc[0]);
                return obj_data_his;
            }
            return obj_data_his;
		};
		this.m3 = function(obj_array) {	////js 的插入排序 从小到大
			 var len = obj_array.length,
                tmp, j;
            for (var i = 1; i < len; i++) {

                var data_array = obj_array[i];
                j = i ;
                tmp = obj_array[i].data[0];
                while (j > 0 && tmp < obj_array[j-1].data[0]) {
                    obj_array[j] = obj_array[j-1];
                    j--;
                }
                obj_array[j] = data_array;
            }
            return obj_array;
		};
		this.m4 = function(obj_array) {	//断点设置  js 的比较大小，添加null值进去
            var len = obj_array.length;
            var dataLength = obj_array[0].data;  //查看有几条线
            //= len - 1; i >= 0; i--
            for (var i = 0; i < len-1; i++ ) {

                var quotient = Math.floor((obj_array[i+1].data[0] - obj_array[i].data[0]) / 60000);
                var dataStart = obj_array[i].data[0];
                if (quotient > 1) {
                    for (var j = quotient - 1; j > 0; j--) {

                        var Intdatatimestamp = parseInt(dataStart, 10);
                        var stringData = "" + (Intdatatimestamp + j * 60000);
                        //添加入几条null
                        var data_m_array  = [];
                        data_m_array.push(stringData);
                        for (var k = dataLength.length - 2; k >= 0; k--) {
                        	data_m_array.push(null);
                        }
                        var incObject = {
                            "data": data_m_array
                        };
                        obj_array.splice(i+1, 0, incObject);
                    }
                }
            }
            return obj_array;
		};
		this.m5 = function() {  // //delete id=0 from all history data all history data sort by desc

		};
		this.m6 = function(num, total) {	//计算百分比的--圆饼图
			var num = parseFloat(num); 
            var total = parseFloat(total); 
            if (isNaN(num) || isNaN(total)) { 
            return "-"; 
            } 
            return total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00 + "%"); 
		};
	}
	function Options() {
		this.m1 = function(obj_name) {
			return {
				axes: {
           			x: {
		                valueFormatter: Dygraph.dateString_,
		                axisLabelFormatter: Dygraph.dateAxisFormatter,
		                ticker: Dygraph.dateTicker
		            }
        		},
        		stackedGraph: false,

        		strokeBorderColor:"white",
        		avoidMinZero :true,
        	//	showRangeSelector:true,  is model dygraphs
        	//	showLabelsOnHighlight :false,  is show labels
        	//	highlightCircleSize: 2,
		    //    strokeWidth: 1,
		    //labels: labels.slice(),
		        highlightCircleSize: 2,
        		strokeWidth: 1,

		        strokeBorderWidth: false ? null : 0,
		         showLabelsOnHighlight: true,
		         highlightSeriesBackgroundAlpha :1,
				//xLabelHeight:4,
		        highlightSeriesOpts: {
		          strokeWidth: 3,
		          //strokeBorderWidth: 1,
		          highlightCircleSize: 6
		        },

				// labels: [ "Date", "load1", "load5", "load15"],
				// colors: [ "#00DD55", "rgb(255,100,100)","rgb(51,204,204)"],
				legend: "always",
                title: 'System Load Average',

                labelsDivStyles: { 'textAlign': 'left' },
                ylabel: 'load',
        //        labelsDiv: document.getElementById('status'),
                labelsDiv: document.getElementById(obj_name),
                labelsSeparateLines: true,
                labelsKMB: true,
            	axisLineColor: 'white'
			};
		};
		
	}
	return {
		
		GetData : GetData,
		ChangeData : ChangeData,
		Options  : Options
	};
});