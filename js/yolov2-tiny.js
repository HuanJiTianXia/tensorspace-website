let model;
let predictDataKey = "dog";
let selectedDiv = undefined;
let outputDetectionLayer;

let dataLookup = {

	dog: {

		relativeDiv: "data1",
		dataUrl: "../../assets/data/dog.json",
		imageUrl: "../../assets/img/playground/dog.jpg"

	},

	giraffe: {

		relativeDiv: "data2",
		dataUrl: "../../assets/data/giraffe.json",
		imageUrl: "../../assets/img/playground/giraffe.jpg"

	},

	three: {

		relativeDiv: "data3",
		dataUrl: "../../assets/data/33.json",
		imageUrl: "../../assets/img/playground/33.jpg"

	},

	bird: {

		relativeDiv: "data4",
		dataUrl: "../../assets/data/bird.json",
		imageUrl: "../../assets/img/playground/bird.jpg"

	}

};

$(function() {

	createModel();

	$("#selector > main > div > img").click(function() {
		$(this).css("border", "1px solid #6597AF");
		if (selectedDiv !== undefined) {
			$("#" + selectedDiv).css("border", "0");
		}
		selectedDiv = $(this).attr('id');
	});

	$("#cancelPredict").click(function() {
		hideSelector()
	});

	$("#selectorCurtain").click(function() {
		hideSelector();
	});

	$("#selectorTrigger").click(function() {
		showSelector();
	});

	$("#executePredict").click(function() {

		updatePredictDataKey();
		hideSelector();
		getDataAndPredict(function() {
			$("#labelImage").attr("src", dataLookup[ predictDataKey ].imageUrl);
		});

	});

});

function createModel() {

	let container = document.getElementById( "modelArea" );

	model = new TSP.models.Sequential( container, {

		stats: true

	} );

	model.add( new TSP.layers.RGBInput() );

	model.add( new TSP.layers.Conv2d() );

	model.add( new TSP.layers.Pooling2d() );

	model.add( new TSP.layers.Conv2d() );

	model.add( new TSP.layers.Pooling2d() );

	model.add( new TSP.layers.Conv2d() );

	model.add( new TSP.layers.Pooling2d() );

	model.add( new TSP.layers.Conv2d() );

	model.add( new TSP.layers.Pooling2d() );

	model.add( new TSP.layers.Conv2d() );

	model.add( new TSP.layers.Pooling2d() );

	model.add( new TSP.layers.Conv2d() );

	model.add( new TSP.layers.Pooling2d() );

	model.add( new TSP.layers.Conv2d() );

	model.add( new TSP.layers.Conv2d() );

	model.add( new TSP.layers.Conv2d() );

	let yoloGrid = new TSP.layers.YoloGrid( {

		anchors: [ 1.08, 1.19, 3.42, 4.41, 6.63, 11.38, 9.42, 5.11, 16.62, 10.52 ],

		//voc class label name list
		classLabelList: [ "aeroplane", "bicycle", "bird", "boat", "bottle",
			"bus", "car", "cat", "chair", "cow",
			"diningtable", "dog", "horse", "motorbike", "person",
			"pottedplant", "sheep", "sofa", "train", "tvmonitor" ],

        // default is 0.5
		// 0.18 is ... a result after trying hundreds of seconds...
        scoreThreshold: 0.18,

        // default is 0.3
        iouThreshold: 0.3,

        // default is true
        isDrawFiveBoxes: true,

        // default is true
        isNMS: true,

		onCeilClicked: onYoloCeilClicked

	} );

	model.add( yoloGrid );

	outputDetectionLayer = new TSP.layers.OutputDetection();

	model.add( outputDetectionLayer );

	model.load( {

		type: "tensorflow",
		url: "../../assets/model/yolov2-tiny/model.json",
		outputsName: [ "Maximum", "MaxPool", "Maximum_1", "MaxPool_1", "Maximum_2",
			"MaxPool_2", "Maximum_3", "MaxPool_3", "Maximum_4", "MaxPool_4",
			"Maximum_5", "MaxPool_5", "Maximum_6", "Maximum_7", "add_8" ],
		
		onProgress: function( fraction ) {
			
			$("#downloadProgress").html( ( 100 * fraction ).toFixed( 2 ) + "%" );
			
		},
		
		onComplete: function() {
			
			$("#downloadNotice").hide();
			$("#creationNotice").show();
			
		}
		
	} );

	model.init( function() {

		getDataAndPredict( function() {
			$( "#loadingPad" ).hide();
		} )

	} );

}

function onYoloCeilClicked( ceilData, rectList ) {

	outputDetectionLayer.addRectangleList( rectList );

	if ( !outputDetectionLayer.isOpen ) {

		outputDetectionLayer.openLayer();

	}

}

function showSelector() {
	$("#selector").show();
	$("#selectorCurtain").show();
}

function hideSelector() {
	$("#selector").hide();
	$("#selectorCurtain").hide();
	if (selectedDiv !== undefined) {
		$("#" + selectedDiv).css("border", "0");
	}
	selectedDiv = undefined;
}

function getDataAndPredict( callback ) {

	$.ajax({
		url: dataLookup[ predictDataKey ].dataUrl,
		type: 'GET',
		async: true,
		dataType: 'json',
		success: function (data) {

			model.predict( data, function(){

				if ( callback !== undefined ) {
					callback();
				}

			} );

		}
	});

}

function updatePredictDataKey() {

	for ( let key in dataLookup ) {

		if ( dataLookup[ key ].relativeDiv === selectedDiv ) {

			predictDataKey = key;
			break;

		}

	}

}
