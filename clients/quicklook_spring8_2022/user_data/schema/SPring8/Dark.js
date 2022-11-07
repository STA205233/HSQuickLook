HSQuickLook.main.schema =
	[
		{
			"collection": "Scalardata",
			"directory": "Detector",
			"document": "Dark",
			"period": "1",
			"section": "Metadata",
			"contents": {
				"Loop_counter": { "type": "int" },
				"Capture_time": { "type": "string" },
				"Filename": {
					"type": "string"
					, "conversion": function (v) {
						for (let i = 0; i < v.length - 1; i++) {
							if (v[i] == v[i + 1] && v[i] == '/') {
								v[i] = ' ';
							}
						}
						return String(v).replace(" ", "").split("/")[4];
					},
				}
			}
		},
		{
			"collection": "Scalardata",
			"directory": "Detector",
			"document": "Dark",
			"period": "1",
			"section": "Temperature",
			"contents": {
				"Temperature": { "type": "int" },
				"Temperature-graph": { "type": "trend-graph", "group": [{ "source": "Temperature", "options": { "legend": "Temperature" } }], "options": { "xWidth": 200 } },
			}
		},
		{
			"collection": "Images",
			"directory": "Detector",
			"document": "frame_pedestal",
			"period": "1",
			"section": "PushToQuickLookDB_HistogramFramePedestal",
			"tableName": "frame_pedestal",
			"contents": {
				"frame_pedestal": {
					"type": "image"
				}
			}


		},
		{
			"collection": "Images",
			"directory": "Detector",
			"document": "raw_frame_image",
			"period": "1",
			"section": "PushToQuickLookDB_HistogramRawFrameImage",
			"tableName": "HistogramRawFrameImage",
			"contents": {
				"raw_frame_image": {
					"type": "image"
				}
			}


		}
	];
